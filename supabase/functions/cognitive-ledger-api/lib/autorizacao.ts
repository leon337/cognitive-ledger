import type { ClaimsOAuth, ClienteAutorizado } from "./contratos.ts";

export class ErroAutorizacao extends Error {
  constructor(public status: number, public codigo: string) {
    super(codigo);
  }
}

export type DependenciasAutorizacao = {
  ownerId: string;
  issuer: string;
  verificarJwt(token: string): Promise<ClaimsOAuth>;
  obterCliente(clientId: string): Promise<ClienteAutorizado | null>;
  registrarCliente(entrada: {
    clientId: string;
    ownerId: string;
    capacidades: string[];
  }): Promise<ClienteAutorizado>;
};

const CAPACIDADES_PADRAO = [
  "ler_diario",
  "buscar_eventos",
  "recuperar_contexto",
];

export function tipoBoundary(pathname: string): "oauth" | "legacy" {
  return pathname === "/v1" || pathname.startsWith("/v1/") ? "oauth" : "legacy";
}

function extrairBearer(req: Request) {
  const valor = req.headers.get("authorization") || "";
  if (!valor.startsWith("Bearer ") || valor.length <= 7) {
    throw new ErroAutorizacao(401, "BEARER_OBRIGATORIO");
  }
  return valor.slice(7);
}

function audValida(aud: unknown) {
  return aud === "authenticated" ||
    (Array.isArray(aud) && aud.includes("authenticated"));
}

function validarClaims(claims: ClaimsOAuth, deps: DependenciasAutorizacao) {
  const agora = Math.floor(Date.now() / 1000);
  if (
    claims.iss !== deps.issuer || !audValida(claims.aud) ||
    typeof claims.exp !== "number" || claims.exp <= agora ||
    typeof claims.sub !== "string" || !claims.sub ||
    typeof claims.client_id !== "string" || !claims.client_id
  ) {
    throw new ErroAutorizacao(401, "TOKEN_INVALIDO");
  }
  if (claims.sub !== deps.ownerId) {
    throw new ErroAutorizacao(403, "OWNER_NAO_AUTORIZADO");
  }
  return { ownerId: claims.sub, clientId: claims.client_id };
}

export async function autenticarClienteOAuth(
  req: Request,
  deps: DependenciasAutorizacao,
): Promise<{ ownerId: string; clientId: string; cliente: ClienteAutorizado }> {
  const token = extrairBearer(req);
  let claims: ClaimsOAuth;
  try {
    claims = await deps.verificarJwt(token);
  } catch {
    throw new ErroAutorizacao(401, "TOKEN_INVALIDO");
  }

  const identidade = validarClaims(claims, deps);
  let cliente = await deps.obterCliente(identidade.clientId);
  if (!cliente) {
    cliente = await deps.registrarCliente({
      clientId: identidade.clientId,
      ownerId: identidade.ownerId,
      capacidades: [...CAPACIDADES_PADRAO],
    });
  }
  if (cliente.owner_id !== identidade.ownerId) {
    throw new ErroAutorizacao(403, "CLIENTE_OWNER_DIVERGENTE");
  }
  return { ...identidade, cliente };
}

export function exigirCapacidade(
  cliente: ClienteAutorizado,
  capacidade: string,
): void {
  if (
    !cliente.ativo || cliente.revogado_em ||
    !cliente.capacidades.includes(capacidade)
  ) {
    throw new ErroAutorizacao(403, "CAPACIDADE_NEGADA");
  }
}
