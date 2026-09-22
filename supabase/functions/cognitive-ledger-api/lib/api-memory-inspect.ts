import { auditarLeitura } from "./auditoria.ts";
import {
  exigirCapacidade,
  normalizarPathnameAplicacao,
} from "./autorizacao.ts";
import type { IdentidadeLeitura, RepositorioRecuperacao } from "./contratos.ts";

const TAMANHO_MAXIMO_CORPO = 8 * 1024;
const EVENTO_ID = /^[A-Za-z0-9._:-]+$/u;
const CAMPOS_EVENTO = [
  "id",
  "timestamp",
  "tipo",
  "status",
  "titulo",
  "resumo",
  "contexto",
  "projetos",
  "assuntos",
  "ideias",
  "decisoes",
  "hipoteses",
  "questoes_abertas",
  "proximos_passos",
  "metadados",
] as const;
const CAMPOS_RELACAO = [
  "evento_origem_id",
  "evento_destino_id",
  "tipo",
  "rotulo",
  "metadados",
] as const;

export class ErroMemoriaInspect extends Error {
  constructor(public status: number, public codigo: string) {
    super(codigo);
    this.name = "ErroMemoriaInspect";
  }
}

export type ResultadoMemoryInspect = {
  status: number;
  corpo: Record<string, unknown>;
  headers?: Record<string, string>;
};

export type DependenciasMemoryInspect = {
  repositorio: RepositorioRecuperacao;
};

function projetar(
  entrada: Record<string, unknown>,
  campos: readonly string[],
): Record<string, unknown> {
  const saida: Record<string, unknown> = {};
  for (const campo of campos) {
    if (campo in entrada) saida[campo] = entrada[campo];
  }
  return saida;
}

function objeto(valor: unknown): Record<string, unknown> {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    throw new ErroMemoriaInspect(400, "json_invalido");
  }
  return valor as Record<string, unknown>;
}

async function corpoEstrito(req: Request): Promise<{
  eventoId: string;
  memoryScope: string;
}> {
  const texto = await req.text();
  if (!texto) throw new ErroMemoriaInspect(400, "json_invalido");
  if (texto.length > TAMANHO_MAXIMO_CORPO) {
    throw new ErroMemoriaInspect(413, "corpo_muito_grande");
  }

  let bruto: unknown;
  try {
    bruto = JSON.parse(texto);
  } catch {
    throw new ErroMemoriaInspect(400, "json_invalido");
  }
  const valor = objeto(bruto);
  if (
    Object.keys(valor).length !== 2 ||
    !("evento_id" in valor) ||
    !("memory_scope" in valor)
  ) {
    throw new ErroMemoriaInspect(400, "campos_invalidos");
  }

  const eventoId = typeof valor.evento_id === "string"
    ? valor.evento_id.trim()
    : "";
  const memoryScope = typeof valor.memory_scope === "string"
    ? valor.memory_scope.trim()
    : "";
  if (
    !eventoId || eventoId.length > 256 || !EVENTO_ID.test(eventoId) ||
    !memoryScope || memoryScope.length > 512
  ) {
    throw new ErroMemoriaInspect(400, "campos_invalidos");
  }
  return { eventoId, memoryScope };
}

function scopeDoEvento(evento: Record<string, unknown>): string | null {
  const metadados = evento.metadados;
  if (!metadados || typeof metadados !== "object" || Array.isArray(metadados)) {
    return null;
  }
  const scope = (metadados as Record<string, unknown>).memory_scope;
  return typeof scope === "string" && scope.trim() ? scope : null;
}

export async function tratarRotaMemoryInspect(
  req: Request,
  identidade: IdentidadeLeitura,
  deps: DependenciasMemoryInspect,
): Promise<ResultadoMemoryInspect | null> {
  const pathname = normalizarPathnameAplicacao(new URL(req.url).pathname);
  if (pathname !== "/v1/memoria/inspecionar") return null;

  if (req.method !== "POST") {
    return {
      status: 405,
      corpo: { erro: "metodo_nao_permitido" },
      headers: { Allow: "POST" },
    };
  }

  exigirCapacidade(identidade.cliente, "inspecionar_memoria");
  const { eventoId, memoryScope } = await corpoEstrito(req);
  const eventos = await deps.repositorio.obterEventosPorIds([eventoId]);
  const evento = eventos.find((item) => String(item.id || "") === eventoId);
  if (!evento) {
    throw new ErroMemoriaInspect(404, "evento_nao_encontrado");
  }

  if (scopeDoEvento(evento) !== memoryScope) {
    throw new ErroMemoriaInspect(403, "scope_negado");
  }

  const relacoes = await deps.repositorio.obterRelacoes([eventoId]);
  await auditarLeitura({
    ownerId: identidade.ownerId,
    clientId: identidade.clientId,
    operacao: "inspecionar_memoria",
    finalidade: "memory_control_plane",
    eventoIds: [eventoId],
    quantidade: 1,
    fonteBrutaAcessada: false,
    justificativaFonteBruta: null,
    resultado: "ok",
    degradado: false,
    erroCodigo: null,
  }, {
    inserirAuditoria: (registro) => deps.repositorio.inserirAuditoria(registro),
  });

  return {
    status: 200,
    corpo: {
      estado: "ok",
      memoria: {
        evento: projetar(evento, CAMPOS_EVENTO),
        relacoes: relacoes.map((relacao) => projetar(relacao, CAMPOS_RELACAO)),
      },
    },
  };
}
