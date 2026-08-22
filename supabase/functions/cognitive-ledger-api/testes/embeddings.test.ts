import { assertEquals, assertRejects } from "jsr:@std/assert";
import {
  gerarEmbedding,
  indexarEvento,
  MODELO_EMBEDDING,
  textoParaEmbedding,
} from "../lib/embeddings.ts";

const evento = {
  id: "ec-1",
  titulo: "Continuidade entre chats",
  resumo: "Recuperar contexto sem depender do chat original.",
  contexto: "Cognitive Ledger",
  assuntos: ["continuidade", "mcp"],
  projetos: ["cognitive-ledger"],
  ideias: ["memória externa"],
  decisoes: ["fase 1 somente leitura"],
  hipoteses: ["busca híbrida melhora precisão"],
  questoes_abertas: ["como validar no ChatGPT?"],
  proximos_passos: ["publicar MCP"],
};

Deno.test("textoParaEmbedding é determinístico e inclui campos cognitivos aprovados", () => {
  const a = textoParaEmbedding(evento);
  const b = textoParaEmbedding(structuredClone(evento));
  assertEquals(a, b);
  for (
    const trecho of [
      evento.titulo,
      evento.resumo,
      evento.contexto,
      "continuidade",
      "cognitive-ledger",
      "memória externa",
      "fase 1 somente leitura",
      "busca híbrida melhora precisão",
      "como validar no ChatGPT?",
      "publicar MCP",
    ]
  ) assertEquals(a.includes(trecho), true);
});

Deno.test("gerarEmbedding usa text-embedding-3-large com 1024 dimensões", async () => {
  let corpo: any = null;
  const vetor = Array.from({ length: 1024 }, (_, i) => i / 1024);
  const resultado = await gerarEmbedding("texto", {
    apiKey: "teste",
    fetcher: async (_url: string | URL | Request, init?: RequestInit) => {
      corpo = JSON.parse(String(init?.body));
      return new Response(JSON.stringify({ data: [{ embedding: vetor }] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    },
  });
  assertEquals(corpo.model, "text-embedding-3-large");
  assertEquals(corpo.dimensions, 1024);
  assertEquals(resultado.length, 1024);
  assertEquals(MODELO_EMBEDDING, "text-embedding-3-large:1024");
});

Deno.test("gerarEmbedding falha fechado se vetor não tiver 1024 dimensões", async () => {
  await assertRejects(
    () =>
      gerarEmbedding("texto", {
        apiKey: "teste",
        fetcher: async () =>
          new Response(JSON.stringify({ data: [{ embedding: [1, 2, 3] }] }), {
            status: 200,
            headers: { "content-type": "application/json" },
          }),
      }),
    Error,
    "embedding_dimensao_invalida",
  );
});

Deno.test("indexarEvento persiste vetor, modelo e timestamp para o evento", async () => {
  let salvo: any = null;
  const vetor = Array.from({ length: 1024 }, () => 0.25);
  await indexarEvento("ec-1", {
    obterEvento: async () => evento,
    gerar: async () => vetor,
    salvarEmbedding: async (id: string, dados: any) => {
      salvo = { id, ...dados };
    },
  });
  assertEquals(salvo.id, "ec-1");
  assertEquals(salvo.embedding.length, 1024);
  assertEquals(salvo.embeddingModel, MODELO_EMBEDDING);
  assertEquals(typeof salvo.embeddingAtualizadoEm, "string");
});

Deno.test("falha de indexação pode ser absorvida sem alterar resultado da gravação", async () => {
  const tarefas: Promise<unknown>[] = [];
  const { agendarIndexacaoSemBloquear } = await import("../lib/embeddings.ts");
  const resposta = { status: "criado", id: "ec-1" };
  const devolvida = agendarIndexacaoSemBloquear(
    resposta,
    () => Promise.reject(new Error("openai_indisponivel")),
    (p: Promise<unknown>) => {
      tarefas.push(p);
    },
  );
  assertEquals(devolvida, resposta);
  await Promise.allSettled(tarefas);
  assertEquals(tarefas.length, 1);
});
