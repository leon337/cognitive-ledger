import { auditarLeitura } from "./auditoria.ts";
import { ErroAutorizacao, exigirCapacidade } from "./autorizacao.ts";
import type {
  FiltrosRecuperacao,
  IdentidadeLeitura,
  RepositorioRecuperacao,
} from "./contratos.ts";
import { embeddingsHabilitados, type ProvedorEmbedding } from "./embeddings.ts";
import {
  construirPacoteContexto,
  limiteSeguro,
  projetarEvento,
  respostaBusca,
} from "./recuperacao.ts";

const TAMANHO_MAXIMO_CORPO = 32 * 1024;
const TAMANHO_MAXIMO_TEXTO = 4096;
const TAMANHO_MAXIMO_ITEM = 256;
const MAXIMO_FILTROS = 32;

export class ErroEntradaRecuperacao extends Error {
  constructor(public codigo: string, public status = 400) {
    super(codigo);
  }
}

export type ResultadoHttp = {
  status: number;
  corpo: Record<string, unknown>;
  headers?: Record<string, string>;
};

export type DependenciasApiReadOnly = {
  repositorio: RepositorioRecuperacao;
  provedorEmbedding: ProvedorEmbedding;
  gerarEmbeddingConsulta?: (texto: string) => Promise<number[]>;
};

function textoOpcional(
  valor: unknown,
  campo: string,
  maximo = TAMANHO_MAXIMO_ITEM,
): string | null {
  if (valor === undefined || valor === null || valor === "") return null;
  if (typeof valor !== "string") {
    throw new ErroEntradaRecuperacao(`${campo}_invalido`);
  }
  const normalizado = valor.trim();
  if (!normalizado || normalizado.length > maximo) {
    throw new ErroEntradaRecuperacao(`${campo}_invalido`);
  }
  return normalizado;
}

function listaStrings(valor: unknown, campo: string): string[] {
  if (valor === undefined || valor === null || valor === "") return [];
  const candidatos = Array.isArray(valor)
    ? valor
    : typeof valor === "string"
    ? valor.split(",")
    : null;
  if (!candidatos || candidatos.length > MAXIMO_FILTROS) {
    throw new ErroEntradaRecuperacao(`${campo}_invalido`);
  }
  const resultado = candidatos.map((item) => {
    if (typeof item !== "string") {
      throw new ErroEntradaRecuperacao(`${campo}_invalido`);
    }
    const normalizado = item.trim();
    if (!normalizado || normalizado.length > TAMANHO_MAXIMO_ITEM) {
      throw new ErroEntradaRecuperacao(`${campo}_invalido`);
    }
    return normalizado;
  });
  return [...new Set(resultado)];
}

function dataOpcional(valor: unknown, campo: string): string | null {
  const texto = textoOpcional(valor, campo);
  if (texto === null) return null;
  if (!Number.isFinite(Date.parse(texto))) {
    throw new ErroEntradaRecuperacao(`${campo}_invalido`);
  }
  return texto;
}

function filtrosDeObjeto(objeto: Record<string, unknown>): FiltrosRecuperacao {
  const limite = typeof objeto.limite === "number"
    ? limiteSeguro(objeto.limite)
    : limiteSeguro(undefined);
  return {
    limite,
    inicio: dataOpcional(objeto.inicio, "inicio"),
    fim: dataOpcional(objeto.fim, "fim"),
    projeto: textoOpcional(objeto.projeto, "projeto"),
    assuntos: listaStrings(objeto.assuntos, "assuntos"),
    tipos: listaStrings(objeto.tipos, "tipos"),
  };
}

function filtrosDaUrl(url: URL): FiltrosRecuperacao {
  const limiteBruto = url.searchParams.get("limite");
  const limiteNumero = limiteBruto === null ? undefined : Number(limiteBruto);
  if (limiteBruto !== null && !Number.isFinite(limiteNumero)) {
    throw new ErroEntradaRecuperacao("limite_invalido");
  }
  return filtrosDeObjeto({
    limite: limiteNumero,
    inicio: url.searchParams.get("inicio"),
    fim: url.searchParams.get("fim"),
    projeto: url.searchParams.get("projeto"),
    assuntos: url.searchParams.getAll("assuntos").flatMap((v) => v.split(",")),
    tipos: url.searchParams.getAll("tipos").flatMap((v) => v.split(",")),
  });
}

async function corpoJson(req: Request): Promise<Record<string, unknown>> {
  const texto = await req.text();
  if (!texto || texto.length > TAMANHO_MAXIMO_CORPO) {
    throw new ErroEntradaRecuperacao(
      texto ? "corpo_muito_grande" : "json_invalido",
      texto ? 413 : 400,
    );
  }
  let valor: unknown;
  try {
    valor = JSON.parse(texto);
  } catch {
    throw new ErroEntradaRecuperacao("json_invalido");
  }
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    throw new ErroEntradaRecuperacao("json_invalido");
  }
  return valor as Record<string, unknown>;
}

function ordenarEventos(
  eventos: Array<Record<string, unknown>>,
  ids: string[],
): Array<Record<string, unknown>> {
  const porId = new Map(
    eventos.map((evento) => [String(evento.id || ""), evento]),
  );
  return ids.map((id) => porId.get(id)).filter(
    (evento): evento is Record<string, unknown> => evento !== undefined,
  );
}

async function embeddingConsulta(
  texto: string | null,
  deps: DependenciasApiReadOnly,
): Promise<{ embedding: number[] | null; degradado: boolean }> {
  if (
    !texto || !embeddingsHabilitados(deps.provedorEmbedding) ||
    !deps.gerarEmbeddingConsulta
  ) {
    return { embedding: null, degradado: true };
  }
  try {
    return {
      embedding: await deps.gerarEmbeddingConsulta(texto),
      degradado: false,
    };
  } catch {
    return { embedding: null, degradado: true };
  }
}

async function registrarAuditoria(
  identidade: IdentidadeLeitura,
  deps: DependenciasApiReadOnly,
  entrada: {
    operacao: string;
    eventoIds: string[];
    resultado: string;
    degradado: boolean;
    fonteBruta?: boolean;
    justificativa?: string | null;
  },
) {
  await auditarLeitura({
    ownerId: identidade.ownerId,
    clientId: identidade.clientId,
    operacao: entrada.operacao,
    finalidade: "recuperacao_cross_chat",
    eventoIds: entrada.eventoIds,
    quantidade: entrada.eventoIds.length,
    fonteBrutaAcessada: entrada.fonteBruta ?? false,
    justificativaFonteBruta: entrada.justificativa ?? null,
    resultado: entrada.resultado,
    degradado: entrada.degradado,
    erroCodigo: null,
  }, {
    inserirAuditoria: (registro) => deps.repositorio.inserirAuditoria(registro),
  });
}

async function consultarRanking(
  corpo: Record<string, unknown>,
  deps: DependenciasApiReadOnly,
) {
  const texto = textoOpcional(
    corpo.texto ?? corpo.objetivo,
    "texto",
    TAMANHO_MAXIMO_TEXTO,
  );
  const filtros = filtrosDeObjeto(corpo);
  if (
    !texto && !filtros.projeto && !filtros.assuntos.length &&
    !filtros.tipos.length && !filtros.inicio && !filtros.fim
  ) {
    throw new ErroEntradaRecuperacao("consulta_vazia");
  }
  const semantica = await embeddingConsulta(texto, deps);
  const linhas = await deps.repositorio.buscarEventos({
    ...filtros,
    texto,
    queryEmbedding: semantica.embedding,
  });
  const busca = respostaBusca(linhas, semantica.degradado);
  const eventos = ordenarEventos(
    await deps.repositorio.obterEventosPorIds(busca.eventoIds),
    busca.eventoIds,
  );
  return { texto, filtros, linhas, busca, eventos };
}

function rankingSeguro(linhas: Array<Record<string, unknown>>) {
  return linhas.map((linha) => ({
    evento_id: String(linha.evento_id || ""),
    score_total: Number(linha.score_total || 0),
    score_textual: Number(linha.score_textual || 0),
    score_semantico: Number(linha.score_semantico || 0),
    score_recencia: Number(linha.score_recencia || 0),
  }));
}

function projetarFonte(fonte: Record<string, unknown>) {
  return {
    id: String(fonte.id || ""),
    evento_id: String(fonte.evento_id || ""),
    tipo_de_fonte: String(fonte.tipo_de_fonte || ""),
    provedor: fonte.provedor ?? null,
    referencia: fonte.referencia ?? null,
    escopo_da_captura: fonte.escopo_da_captura ?? null,
    conteudo_bruto: fonte.conteudo_bruto ?? null,
  };
}

export async function tratarRotaReadOnly(
  req: Request,
  identidade: IdentidadeLeitura,
  deps: DependenciasApiReadOnly,
): Promise<ResultadoHttp | null> {
  const url = new URL(req.url);
  const pathname = url.pathname;

  if (pathname === "/v1/registros" || pathname.startsWith("/v1/admin/")) {
    throw new ErroAutorizacao(403, "ROTA_MUTANTE_NEGADA");
  }

  const rotasConhecidas = new Set([
    "/v1/diario",
    "/v1/buscar",
    "/v1/contexto",
    "/v1/fonte",
  ]);
  if (!rotasConhecidas.has(pathname)) return null;

  const metodoEsperado = pathname === "/v1/diario" ? "GET" : "POST";
  if (req.method !== metodoEsperado) {
    return {
      status: 405,
      corpo: { erro: "metodo_nao_permitido" },
      headers: { Allow: metodoEsperado },
    };
  }

  if (pathname === "/v1/diario") {
    exigirCapacidade(identidade.cliente, "ler_diario");
    const filtros = filtrosDaUrl(url);
    const eventos = await deps.repositorio.listarEventos(filtros);
    const projetados = eventos.map(projetarEvento);
    const ids = projetados.map((evento) => String(evento.id || "")).filter(
      Boolean,
    );
    const estado = projetados.length ? "ok" : "evidencia_insuficiente";
    await registrarAuditoria(identidade, deps, {
      operacao: "ler_diario",
      eventoIds: ids,
      resultado: estado,
      degradado: false,
    });
    return {
      status: 200,
      corpo: {
        estado,
        degradado: false,
        eventos: projetados,
        lacunas: projetados.length ? [] : ["nenhum_evento_no_periodo"],
      },
    };
  }

  const corpo = await corpoJson(req);

  if (pathname === "/v1/buscar") {
    exigirCapacidade(identidade.cliente, "buscar_eventos");
    const resultado = await consultarRanking(corpo, deps);
    await registrarAuditoria(identidade, deps, {
      operacao: "buscar_eventos",
      eventoIds: resultado.busca.eventoIds,
      resultado: resultado.busca.estado,
      degradado: resultado.busca.degradado,
    });
    return {
      status: 200,
      corpo: {
        estado: resultado.busca.estado,
        degradado: resultado.busca.degradado,
        eventos: resultado.eventos.map(projetarEvento),
        lacunas: resultado.eventos.length ? [] : ["evidencia_insuficiente"],
        ranking: rankingSeguro(resultado.linhas),
      },
    };
  }

  if (pathname === "/v1/contexto") {
    exigirCapacidade(identidade.cliente, "recuperar_contexto");
    const resultado = await consultarRanking(corpo, deps);
    const relacoes = await deps.repositorio.obterRelacoes(
      resultado.busca.eventoIds,
    );
    const pacote = construirPacoteContexto(
      resultado.eventos,
      relacoes,
      resultado.busca.degradado,
    );
    await registrarAuditoria(identidade, deps, {
      operacao: "recuperar_contexto",
      eventoIds: resultado.busca.eventoIds,
      resultado: String(pacote.estado),
      degradado: resultado.busca.degradado,
    });
    return { status: 200, corpo: pacote };
  }

  exigirCapacidade(identidade.cliente, "ler_fonte_bruta");
  const eventoId = textoOpcional(corpo.evento_id, "evento_id");
  const justificativa = textoOpcional(
    corpo.justificativa,
    "justificativa",
    1024,
  );
  if (!eventoId || !justificativa) {
    throw new ErroEntradaRecuperacao("fonte_requer_evento_e_justificativa");
  }
  const fonte = await deps.repositorio.obterFonte(eventoId);
  const estado = fonte ? "ok" : "evidencia_insuficiente";
  await registrarAuditoria(identidade, deps, {
    operacao: "ler_fonte_bruta",
    eventoIds: fonte ? [eventoId] : [],
    resultado: estado,
    degradado: false,
    fonteBruta: Boolean(fonte),
    justificativa,
  });
  if (!fonte) {
    return { status: 404, corpo: { estado, erro: "fonte_nao_encontrada" } };
  }
  return {
    status: 200,
    corpo: { estado, degradado: false, fonte: projetarFonte(fonte) },
  };
}
