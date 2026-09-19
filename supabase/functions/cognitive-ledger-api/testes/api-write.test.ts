import { assertEquals, assertRejects } from "jsr:@std/assert";
import { ErroAuditoria } from "../lib/auditoria.ts";
import { ErroAutorizacao } from "../lib/autorizacao.ts";
import { ErroMemoriaWrite, tratarRotaWrite } from "../lib/api-write.ts";

function identidade(capacidades = ["registrar_memoria"]) {
  return {
    ownerId: "owner-lab",
    clientId: "client-write-lab",
    cliente: {
      client_id: "client-write-lab",
      owner_id: "owner-lab",
      capacidades,
      ativo: true,
      revogado_em: null,
    },
  };
}

function payload(id = "ec-synthetic-write-001") {
  return {
    confirmacao_explicita: true,
    evento: {
      id,
      timestamp: "2026-09-18T21:00:00-03:00",
      tipo: "decisao",
      status: "ativo",
      titulo: "Evento sintético de validação",
      resumo: "Prova sintética de escrita governada.",
      contexto: "Laboratório MCF",
      projetos: ["MCF"],
      assuntos: ["memoria"],
      ideias: [],
      decisoes: ["validar escrita governada"],
      hipoteses: [],
      questoes_abertas: [],
      proximos_passos: ["read-back"],
      metadados: { proveniencia: "fixture_sintetica" },
    },
    fontes: [{ tipo_de_fonte: "teste", provedor: "mcf-lab", conteudo_bruto: "SINTETICO" }],
    relacoes: [],
  };
}

function post(corpo: unknown) {
  return new Request("https://ledger.test/v1/registros", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(corpo),
  });
}

function repositorio(opcoes: { status?: "criado"|"existente"; mismatch?: boolean; auditFail?: boolean } = {}) {
  const auditorias: Array<Record<string, unknown>> = [];
  let persistido: Record<string, unknown> | null = null;
  return {
    auditorias,
    deps: {
      repositorio: {
        registrarEvento: async ({ evento }: { evento: Record<string, unknown> }) => {
          persistido = structuredClone(evento);
          return opcoes.status ?? "criado";
        },
        obterEvento: async (_id: string) => {
          if (!persistido) return null;
          return opcoes.mismatch ? { ...persistido, resumo: "DIVERGENTE" } : structuredClone(persistido);
        },
        inserirAuditoria: async (r: Record<string, unknown>) => {
          if (opcoes.auditFail) throw new Error("audit down");
          auditorias.push(structuredClone(r));
        },
      },
    },
  };
}

Deno.test("write exige capability e confirmacao explicita", async () => {
  const r = repositorio();
  await assertRejects(
    () => tratarRotaWrite(post(payload()), identidade([]), r.deps),
    ErroAutorizacao,
  );
  const semConfirmacao = payload();
  semConfirmacao.confirmacao_explicita = false;
  await assertRejects(
    () => tratarRotaWrite(post(semConfirmacao), identidade(), r.deps),
    ErroAutorizacao,
  );
});

Deno.test("persistencia + read-back + auditoria produzem Receipt", async () => {
  const r = repositorio();
  const res = await tratarRotaWrite(post(payload()), identidade(), r.deps);
  assertEquals(res?.status, 201);
  assertEquals(res?.corpo.estado, "ok");
  const receipt = res?.corpo.receipt as Record<string, unknown>;
  assertEquals(receipt.schema, "cognitive_ledger_memory_receipt/v1");
  assertEquals(receipt.read_back, "verified");
  assertEquals(String(receipt.event_sha256).length, 64);
  assertEquals(String(receipt.receipt_sha256).length, 64);
  assertEquals(r.auditorias.length, 1);
});

Deno.test("retry idempotente existente retorna 200 e novo Receipt", async () => {
  const r = repositorio({ status: "existente" });
  const res = await tratarRotaWrite(post(payload()), identidade(), r.deps);
  assertEquals(res?.status, 200);
  assertEquals((res?.corpo.receipt as Record<string, unknown>).provider_status, "existente");
});

Deno.test("read-back divergente falha fechado sem Receipt", async () => {
  const r = repositorio({ mismatch: true });
  await assertRejects(
    () => tratarRotaWrite(post(payload()), identidade(), r.deps),
    ErroMemoriaWrite,
    "readback_divergente",
  );
  assertEquals(r.auditorias.length, 0);
});

Deno.test("auditoria indisponivel falha fechado apos persistencia", async () => {
  const r = repositorio({ auditFail: true });
  await assertRejects(
    () => tratarRotaWrite(post(payload()), identidade(), r.deps),
    ErroAuditoria,
  );
});

Deno.test("rota diferente nao e interceptada e campos desconhecidos sao negados", async () => {
  const r = repositorio();
  const outro = await tratarRotaWrite(
    new Request("https://ledger.test/v1/diario"),
    identidade(),
    r.deps,
  );
  assertEquals(outro, null);

  const p = payload();
  (p.evento as Record<string, unknown>).embedding = [1,2,3];
  await assertRejects(
    () => tratarRotaWrite(post(p), identidade(), r.deps),
    ErroMemoriaWrite,
    "evento_campo_desconhecido",
  );
});
