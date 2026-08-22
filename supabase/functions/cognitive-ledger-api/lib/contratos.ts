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
