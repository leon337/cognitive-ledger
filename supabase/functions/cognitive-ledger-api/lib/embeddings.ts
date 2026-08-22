export const MODELO_EMBEDDING = "text-embedding-3-large:1024";
const MODELO_API = "text-embedding-3-large";
const DIMENSOES = 1024;

function texto(valor: unknown): string {
  if (valor === null || valor === undefined) return "";
  if (Array.isArray(valor)) {
    return valor.map((v) => String(v).trim()).filter(Boolean).join(" | ");
  }
  return String(valor).trim();
}

export function textoParaEmbedding(evento: Record<string, unknown>): string {
  const campos: Array<[string, string]> = [
    ["titulo", texto(evento.titulo)],
    ["resumo", texto(evento.resumo)],
    ["contexto", texto(evento.contexto)],
    ["assuntos", texto(evento.assuntos)],
    ["projetos", texto(evento.projetos)],
    ["ideias", texto(evento.ideias)],
    ["decisoes", texto(evento.decisoes)],
    ["hipoteses", texto(evento.hipoteses)],
    ["questoes_abertas", texto(evento.questoes_abertas)],
    ["proximos_passos", texto(evento.proximos_passos)],
  ];
  return campos.filter(([, valor]) => valor).map(([rotulo, valor]) =>
    `${rotulo}: ${valor}`
  ).join("\n");
}

export type DependenciasEmbedding = {
  apiKey?: string;
  fetcher?: typeof fetch;
};
export async function gerarEmbedding(
  textoEntrada: string,
  deps: DependenciasEmbedding = {},
): Promise<number[]> {
  const apiKey = deps.apiKey ?? Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new Error("openai_api_key_ausente");
  const fetcher = deps.fetcher ?? fetch;
  const resposta = await fetcher("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODELO_API,
      input: textoEntrada,
      dimensions: DIMENSOES,
      encoding_format: "float",
    }),
  });
  if (!resposta.ok) throw new Error(`openai_embedding_http_${resposta.status}`);
  const corpo = await resposta.json();
  const embedding = corpo?.data?.[0]?.embedding;
  if (
    !Array.isArray(embedding) || embedding.length !== DIMENSOES ||
    embedding.some((v: unknown) => typeof v !== "number" || !Number.isFinite(v))
  ) {
    throw new Error("embedding_dimensao_invalida");
  }
  return embedding as number[];
}

export type DependenciasIndexacao = {
  obterEvento(id: string): Promise<Record<string, unknown>>;
  gerar(texto: string): Promise<number[]>;
  salvarEmbedding(id: string, dados: {
    embedding: number[];
    embeddingModel: string;
    embeddingAtualizadoEm: string;
  }): Promise<void>;
};
export async function indexarEvento(
  id: string,
  deps: DependenciasIndexacao,
): Promise<void> {
  const evento = await deps.obterEvento(id);
  const embedding = await deps.gerar(textoParaEmbedding(evento));
  await deps.salvarEmbedding(id, {
    embedding,
    embeddingModel: MODELO_EMBEDDING,
    embeddingAtualizadoEm: new Date().toISOString(),
  });
}

export function agendarIndexacaoSemBloquear<T>(
  resposta: T,
  tarefa: () => Promise<unknown>,
  waitUntil: (p: Promise<unknown>) => void,
): T {
  const promessa = Promise.resolve().then(tarefa).catch(() => undefined);
  waitUntil(promessa);
  return resposta;
}
