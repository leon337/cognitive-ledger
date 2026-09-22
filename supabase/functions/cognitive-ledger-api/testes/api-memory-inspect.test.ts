import { assertEquals, assertRejects } from "jsr:@std/assert@1.0.19";
import {
  ErroMemoriaInspect,
  tratarRotaMemoryInspect,
} from "../lib/api-memory-inspect.ts";
import type { IdentidadeLeitura } from "../lib/contratos.ts";

const identidade: IdentidadeLeitura = {
  ownerId: "owner-lab",
  clientId: "mcf-memory-client",
  cliente: {
    client_id: "mcf-memory-client",
    owner_id: "owner-lab",
    capacidades: ["registrar_memoria", "inspecionar_memoria"],
    ativo: true,
    revogado_em: null,
  },
};

function repositorio(overrides: Record<string, unknown> = {}) {
  return {
    obterEvento: async (_id: string) => ({
      id: "evt-1",
      timestamp: "2026-09-22T20:00:00-03:00",
      tipo: "decisao",
      status: "ativo",
      titulo: "Sintetico",
      resumo: "Teste",
      contexto: "",
      projetos: ["MCF"],
      assuntos: ["memoria"],
      ideias: [],
      decisoes: [],
      hipoteses: [],
      questoes_abertas: [],
      proximos_passos: [],
      metadados: { memory_scope: "project:mcf" },
    }),
    obterRelacoes: async (_id: string) => [{
      evento_origem_id: "evt-1",
      evento_destino_id: "evt-0",
      tipo: "DERIVED_FROM",
      rotulo: "derivado",
    }],
    inserirAuditoria: async (_registro: Record<string, unknown>) => undefined,
    ...overrides,
  };
}

function req(body: unknown, method = "POST") {
  return new Request("https://ledger.example/v1/memoria/inspecionar", {
    method,
    headers: { "Content-Type": "application/json" },
    body: method === "POST" ? JSON.stringify(body) : undefined,
  });
}

Deno.test("inspect exige capability e scope correspondente", async () => {
  const resultado = await tratarRotaMemoryInspect(
    req({ evento_id: "evt-1", memory_scope: "project:mcf" }),
    identidade,
    { repositorio: repositorio() },
  );
  assertEquals(resultado?.status, 200);
  assertEquals(resultado?.corpo.memoria, {
    evento: {
      id: "evt-1",
      timestamp: "2026-09-22T20:00:00-03:00",
      tipo: "decisao",
      status: "ativo",
      titulo: "Sintetico",
      resumo: "Teste",
      contexto: "",
      projetos: ["MCF"],
      assuntos: ["memoria"],
      ideias: [],
      decisoes: [],
      hipoteses: [],
      questoes_abertas: [],
      proximos_passos: [],
      metadados: { memory_scope: "project:mcf" },
    },
    relacoes: [{
      evento_origem_id: "evt-1",
      evento_destino_id: "evt-0",
      tipo: "DERIVED_FROM",
      rotulo: "derivado",
    }],
  });
});

Deno.test("inspect bloqueia direct-ID fora do scope sem vazar evento", async () => {
  const erro = await assertRejects(
    () =>
      tratarRotaMemoryInspect(
        req({ evento_id: "evt-1", memory_scope: "project:outro" }),
        identidade,
        { repositorio: repositorio() },
      ),
    ErroMemoriaInspect,
  );
  assertEquals(erro.status, 403);
  assertEquals(erro.codigo, "scope_negado");
});

Deno.test("inspect nao retorna fonte bruta e falha fechado sem auditoria", async () => {
  const erro = await assertRejects(
    () =>
      tratarRotaMemoryInspect(
        req({ evento_id: "evt-1", memory_scope: "project:mcf" }),
        identidade,
        {
          repositorio: repositorio({
            inserirAuditoria: async () => {
              throw new Error("audit-down");
            },
          }),
        },
      ),
  );
  assertEquals(erro.name, "ErroAuditoria");
});

Deno.test("inspect rejeita evento ausente, JSON/campos invalidos e metodo errado", async () => {
  const ausente = await assertRejects(
    () =>
      tratarRotaMemoryInspect(
        req({ evento_id: "evt-ausente", memory_scope: "project:mcf" }),
        identidade,
        { repositorio: repositorio({ obterEvento: async () => null }) },
      ),
    ErroMemoriaInspect,
  );
  assertEquals(ausente.status, 404);

  for (
    const body of [
      {},
      { evento_id: "evt-1" },
      { evento_id: "evt-1", memory_scope: "project:mcf", extra: true },
    ]
  ) {
    await assertRejects(
      () =>
        tratarRotaMemoryInspect(req(body), identidade, {
          repositorio: repositorio(),
        }),
      ErroMemoriaInspect,
    );
  }

  const metodo = await tratarRotaMemoryInspect(
    req({}, "GET"),
    identidade,
    { repositorio: repositorio() },
  );
  assertEquals(metodo, {
    status: 405,
    corpo: { erro: "metodo_nao_permitido" },
  });
});