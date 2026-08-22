export const LIMITE_PADRAO = 8;
export const LIMITE_MAXIMO = 12;

export function limiteSeguro(valor?: number): number {
  if (!Number.isFinite(valor)) return LIMITE_PADRAO;
  return Math.max(1, Math.min(Math.trunc(valor as number), LIMITE_MAXIMO));
}

const CAMPOS_EVENTO = [
  "id", "timestamp", "tipo", "status", "titulo", "resumo", "contexto",
  "projetos", "assuntos", "ideias", "decisoes", "hipoteses",
  "questoes_abertas", "proximos_passos",
] as const;

export function projetarEvento(evento: Record<string, unknown>): Record<string, unknown> {
  const saida: Record<string, unknown> = {};
  for (const campo of CAMPOS_EVENTO) {
    if (campo in evento) saida[campo] = evento[campo];
  }
  return saida;
}
export function respostaBusca(
  linhas: Array<Record<string, unknown>>,
  degradado: boolean,
) {
  const eventoIds = linhas
    .map((linha) => String(linha.evento_id || ""))
    .filter(Boolean);
  return {
    estado: eventoIds.length ? "ok" : "evidencia_insuficiente",
    degradado,
    eventoIds,
  };
}

function juntarStrings(
  eventos: Array<Record<string, unknown>>,
  campo: string,
): string[] {
  return eventos.flatMap((evento) =>
    Array.isArray(evento[campo])
      ? (evento[campo] as unknown[]).map(String)
      : []
  );
}
export function construirPacoteContexto(
  eventos: Array<Record<string, unknown>>,
  relacoes: Array<Record<string, unknown>>,
  degradado: boolean,
) {
  const tiposConflito = new Set(["contradiz", "revisa", "substitui"]);
  const conflitos = relacoes
    .filter((r) => tiposConflito.has(String(r.tipo || "")))
    .map((r) => ({
      origem: String(r.evento_origem_id || ""),
      destino: String(r.evento_destino_id || ""),
      tipo: String(r.tipo || ""),
    }));
  return {
    estado: eventos.length ? "ok" : "evidencia_insuficiente",
    degradado,
    memorias: eventos.map(projetarEvento),
    decisoes: juntarStrings(eventos, "decisoes"),
    hipoteses: juntarStrings(eventos, "hipoteses"),
    questoes_abertas: juntarStrings(eventos, "questoes_abertas"),
    proximos_passos: juntarStrings(eventos, "proximos_passos"),
    conflitos,
  };
}
