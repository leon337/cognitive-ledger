export type ClienteAutorizado = {
  client_id: string;
  owner_id: string;
  capacidades: string[];
  ativo: boolean;
  revogado_em: string | null;
};

export type ClaimsOAuth = {
  iss?: string;
  aud?: string | string[];
  exp?: number;
  sub?: string;
  client_id?: string;
  [chave: string]: unknown;
};

export type EntradaAuditoria = {
  ownerId: string;
  clientId: string;
  operacao: string;
  finalidade: string;
  eventoIds: string[];
  quantidade: number;
  fonteBrutaAcessada: boolean;
  justificativaFonteBruta: string | null;
  resultado: string;
  degradado: boolean;
  erroCodigo: string | null;
};

export type IdentidadeLeitura = {
  ownerId: string;
  clientId: string;
  cliente: ClienteAutorizado;
};

export type FiltrosRecuperacao = {
  limite: number;
  inicio: string | null;
  fim: string | null;
  projeto: string | null;
  assuntos: string[];
  tipos: string[];
};

export type ConsultaBusca = FiltrosRecuperacao & {
  texto: string | null;
  queryEmbedding: number[] | null;
};

export type RepositorioRecuperacao = {
  listarEventos(
    filtros: FiltrosRecuperacao,
  ): Promise<Array<Record<string, unknown>>>;
  buscarEventos(
    consulta: ConsultaBusca,
  ): Promise<Array<Record<string, unknown>>>;
  obterEventosPorIds(ids: string[]): Promise<Array<Record<string, unknown>>>;
  obterRelacoes(ids: string[]): Promise<Array<Record<string, unknown>>>;
  obterFonte(eventoId: string): Promise<Record<string, unknown> | null>;
  inserirAuditoria(registro: Record<string, unknown>): Promise<void>;
};
