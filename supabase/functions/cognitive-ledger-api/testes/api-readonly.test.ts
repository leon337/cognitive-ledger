import { assert, assertEquals, assertRejects } from "jsr:@std/assert";
import { ErroAuditoria } from "../lib/auditoria.ts";
import { ErroAutorizacao } from "../lib/autorizacao.ts";
import {
  ErroEntradaRecuperacao,
  tratarRotaReadOnly,
} from "../lib/api-readonly.ts";
import type {
  IdentidadeLeitura,
  RepositorioRecuperacao,
} from "../lib/contratos.ts";

const eventosFixture = [
  {
    id: "ec-lab-001",
    timestamp: "2026-08-20T12:00:00Z",
    tipo: "decisao",
    status: "ativo",
    titulo: "Integração somente leitura",
    resumo: "Recuperar sem escrever.",
    contexto: "Laboratório",
    projetos: ["MCF", "Cognitive Ledger"],
    assuntos: ["continuidade"],
    ideias: ["memoria externa"],
    decisoes: ["usar leitura antes de escrita"],
    hipoteses: ["texto atende ao lab"],
    questoes_abertas: ["como calibrar ranking?"],
    proximos_passos: ["validar MCP"],
    conteudo_bruto: "NUNCA_SAIR_NESTAS_ROTAS",
  },
  {
    id: "ec-lab-002",
    timestamp: "2026-08-21T12:00:00Z",
    tipo: "atualizacao_de_projeto",
    status: "ativo",
    titulo: "Busca textual gratuita",
    resumo: "O modo textual é o padrão.",
    contexto: "Laboratório",
    projetos: ["Cognitive Ledger"],
    assuntos: ["custo zero"],
    ideias: [],
    decisoes: ["desativar provedor pago por padrão"],
    hipoteses: [],
    questoes_abertas: [],
    proximos_passos: ["executar E2E"],
  },
];

function criarRepositorio(opcoes: { falharAuditoria?: boolean } = {}) {
  const eventos = structuredClone(eventosFixture) as Array<
    Record<string, unknown>
  >;
  const auditorias: Array<Record<string, unknown>> = [];
  const repositorio: RepositorioRecuperacao = {
    listarEventos: async (filtros) => eventos.slice(0, filtros.limite),
    buscarEventos: async () => [{
      evento_id: "ec-lab-002",
      score_total: 0.82,
      score_textual: 0.79,
      score_semantico: 0,
      score_recencia: 0.9,
    }, {
      evento_id: "ec-lab-001",
      score_total: 0.61,
      score_textual: 0.55,
      score_semantico: 0,
      score_recencia: 0.8,
    }],
    obterEventosPorIds: async (ids) =>
      eventos.filter((evento) => ids.includes(String(evento.id))),
    obterRelacoes: async () => [{
      evento_origem_id: "ec-lab-002",
      evento_destino_id: "ec-lab-001",
      tipo: "revisa",
    }],
    obterFonte: async (eventoId) =>
      eventoId === "ec-lab-001"
        ? {
          id: "fonte-lab-001",
          evento_id: eventoId,
          tipo_de_fonte: "teste",
          provedor: "laboratorio-local",
          referencia: "fixture://ec-lab-001",
          escopo_da_captura: "fixture sintetica",
          conteudo_bruto: "CONTEUDO_SINTETICO_CONTROLADO",
          metadados: { interno: "NAO_SAIR" },
        }
        : null,
    inserirAuditoria: async (registro) => {
      if (opcoes.falharAuditoria) throw new Error("db indisponivel");
      auditorias.push(structuredClone(registro));
    },
  };
  return { eventos, auditorias, repositorio };
}

function identidade(capacidades = [
  "ler_diario",
  "buscar_eventos",
  "recuperar_contexto",
]): IdentidadeLeitura {
  return {
    ownerId: "owner-lab",
    clientId: "client-lab",
    cliente: {
      client_id: "client-lab",
      owner_id: "owner-lab",
      capacidades,
      ativo: true,
      revogado_em: null,
    },
  };
}

function post(pathname: string, corpo: Record<string, unknown>) {
  return new Request(`https://ledger.test${pathname}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(corpo),
  });
}

Deno.test("as quatro rotas são read-only e o modo textual não chama provedor pago", async () => {
  const { eventos, auditorias, repositorio } = criarRepositorio();
  const antes = JSON.stringify(eventos);
  let chamadasPagas = 0;
  const deps = {
    repositorio,
    provedorEmbedding: "disabled" as const,
    gerarEmbeddingConsulta: async () => {
      chamadasPagas += 1;
      throw new Error("NAO_DEVERIA_CHAMAR");
    },
  };

  const diario = await tratarRotaReadOnly(
    new Request("https://ledger.test/v1/diario?limite=8"),
    identidade(),
    deps,
  );
  assertEquals(diario?.status, 200);
  assertEquals(diario?.corpo.degradado, false);
  assertEquals(JSON.stringify(diario?.corpo).includes("NUNCA_SAIR"), false);

  const busca = await tratarRotaReadOnly(
    post("/v1/buscar", { texto: "busca textual gratuita" }),
    identidade(),
    deps,
  );
  assertEquals(busca?.status, 200);
  assertEquals(busca?.corpo.degradado, true);
  assertEquals((busca?.corpo.eventos as unknown[]).length, 2);

  const contexto = await tratarRotaReadOnly(
    post("/v1/contexto", { objetivo: "continuar Cognitive Ledger" }),
    identidade(),
    deps,
  );
  assertEquals(contexto?.status, 200);
  assertEquals(contexto?.corpo.estado, "conflito_de_contexto");
  assertEquals(contexto?.corpo.degradado, true);

  const fonte = await tratarRotaReadOnly(
    post("/v1/fonte", {
      evento_id: "ec-lab-001",
      justificativa: "verificar formulação sintética",
    }),
    identidade([
      "ler_diario",
      "buscar_eventos",
      "recuperar_contexto",
      "ler_fonte_bruta",
    ]),
    deps,
  );
  assertEquals(fonte?.status, 200);
  assertEquals(
    (fonte?.corpo.fonte as Record<string, unknown>).conteudo_bruto,
    "CONTEUDO_SINTETICO_CONTROLADO",
  );
  assertEquals(JSON.stringify(fonte?.corpo).includes("NAO_SAIR"), false);

  assertEquals(chamadasPagas, 0);
  assertEquals(JSON.stringify(eventos), antes);
  assertEquals(auditorias.length, 4);
  assertEquals(auditorias[1]?.degradado, true);
  assertEquals(auditorias[3]?.fonte_bruta_acessada, true);
});

Deno.test("fonte bruta é negada ao cliente padrão", async () => {
  const { repositorio } = criarRepositorio();
  const erro = await assertRejects(
    () =>
      tratarRotaReadOnly(
        post("/v1/fonte", {
          evento_id: "ec-lab-001",
          justificativa: "teste",
        }),
        identidade(),
        { repositorio, provedorEmbedding: "disabled" },
      ),
    ErroAutorizacao,
  ) as ErroAutorizacao;
  assertEquals(erro.status, 403);
});

Deno.test("auditoria falha fechado antes de devolver conteúdo", async () => {
  const { repositorio } = criarRepositorio({ falharAuditoria: true });
  const erro = await assertRejects(
    () =>
      tratarRotaReadOnly(
        new Request("https://ledger.test/v1/diario"),
        identidade(),
        { repositorio, provedorEmbedding: "disabled" },
      ),
    ErroAuditoria,
  ) as ErroAuditoria;
  assertEquals(erro.status, 503);
});

Deno.test("consulta vazia, JSON inválido e rota mutante falham fechado", async () => {
  const { repositorio } = criarRepositorio();
  await assertRejects(
    () =>
      tratarRotaReadOnly(
        post("/v1/buscar", {}),
        identidade(),
        { repositorio, provedorEmbedding: "disabled" },
      ),
    ErroEntradaRecuperacao,
    "consulta_vazia",
  );
  const metodo = await tratarRotaReadOnly(
    new Request("https://ledger.test/v1/buscar"),
    identidade(),
    { repositorio, provedorEmbedding: "disabled" },
  );
  assertEquals(metodo?.status, 405);
  assertEquals(metodo?.headers?.Allow, "POST");

  const mutante = await assertRejects(
    () =>
      tratarRotaReadOnly(
        post("/v1/registros", { evento: {} }),
        identidade(),
        { repositorio, provedorEmbedding: "disabled" },
      ),
    ErroAutorizacao,
  ) as ErroAutorizacao;
  assertEquals(mutante.codigo, "ROTA_MUTANTE_NEGADA");

  const admin = await assertRejects(
    () =>
      tratarRotaReadOnly(
        post("/v1/admin", {}),
        identidade(),
        { repositorio, provedorEmbedding: "disabled" },
      ),
    ErroAutorizacao,
  ) as ErroAutorizacao;
  assertEquals(admin.codigo, "ROTA_MUTANTE_NEGADA");

  const desconhecida = await tratarRotaReadOnly(
    new Request("https://ledger.test/v1/desconhecida"),
    identidade(),
    { repositorio, provedorEmbedding: "disabled" },
  );
  assertEquals(desconhecida, null);
  assert(true);
});
