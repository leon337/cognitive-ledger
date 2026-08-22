import type { EntradaAuditoria } from "./contratos.ts";

export class ErroAuditoria extends Error {
  constructor(public status = 503, public codigo = "AUDITORIA_INDISPONIVEL") {
    super(codigo);
  }
}

export async function auditarLeitura(
  entrada: EntradaAuditoria,
  deps: { inserirAuditoria(registro: Record<string, unknown>): Promise<void> },
): Promise<void> {
  const registro = {
    owner_id: entrada.ownerId,
    client_id: entrada.clientId,
    operacao: entrada.operacao,
    finalidade: entrada.finalidade,
    evento_ids: entrada.eventoIds,
    quantidade: entrada.quantidade,
    fonte_bruta_acessada: entrada.fonteBrutaAcessada,
    justificativa_fonte_bruta: entrada.justificativaFonteBruta,
    resultado: entrada.resultado,
    degradado: entrada.degradado,
    erro_codigo: entrada.erroCodigo,
  };
  try {
    await deps.inserirAuditoria(registro);
  } catch {
    throw new ErroAuditoria();
  }
}
