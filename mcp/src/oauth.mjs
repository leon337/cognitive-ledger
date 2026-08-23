import { createRemoteJWKSet, jwtVerify } from 'jose';

const AUTHORIZATION_ID = 'authorization_id';

export function normalizarBaseUrl(valor) {
  if (!valor || typeof valor !== 'string') {
    throw new Error('SUPABASE_URL_OBRIGATORIA');
  }

  const url = new URL(valor);
  if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
    throw new Error('SUPABASE_URL_HTTPS_OBRIGATORIA');
  }

  return url.toString().replace(/\/$/, '');
}

export function criarConfiguracaoOAuth(env = process.env) {
  const supabaseUrl = normalizarBaseUrl(env.SUPABASE_URL);
  const publishableKey = env.SUPABASE_PUBLISHABLE_KEY;

  if (!publishableKey || typeof publishableKey !== 'string') {
    throw new Error('SUPABASE_PUBLISHABLE_KEY_OBRIGATORIA');
  }

  return Object.freeze({
    supabaseUrl,
    publishableKey,
    audience: 'authenticated',
    issuer: `${supabaseUrl}/auth/v1`,
    authorizeUrl: `${supabaseUrl}/auth/v1/oauth/authorize`,
    tokenUrl: `${supabaseUrl}/auth/v1/oauth/token`,
    jwksUrl: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
    discoveryUrl: `${supabaseUrl}/.well-known/oauth-authorization-server/auth/v1`,
    oidcDiscoveryUrl: `${supabaseUrl}/auth/v1/.well-known/openid-configuration`,
  });
}

export function extrairBearer(cabecalho) {
  if (!cabecalho || typeof cabecalho !== 'string' || !cabecalho.startsWith('Bearer ')) {
    throw new Error('BEARER_OBRIGATORIO');
  }
  const token = cabecalho.slice(7);
  if (!token || token.length > 8192 || /[\u0000-\u0020\u007f]/u.test(token)) {
    throw new Error('BEARER_INVALIDO');
  }
  return token;
}

export function validarClaimsOAuth(payload, config, agora = Math.floor(Date.now() / 1000)) {
  if (
    payload.iss !== config.issuer ||
    !(payload.aud === config.audience ||
      (Array.isArray(payload.aud) && payload.aud.includes(config.audience))) ||
    typeof payload.exp !== 'number' || payload.exp <= agora ||
    typeof payload.sub !== 'string' || !payload.sub ||
    typeof payload.client_id !== 'string' || !payload.client_id
  ) {
    throw new Error('TOKEN_INVALIDO');
  }
  return Object.freeze({
    ownerId: payload.sub,
    clientId: payload.client_id,
  });
}

export function criarValidadorJwtOAuth(config, dependencias = {}) {
  const jwks = dependencias.jwks || createRemoteJWKSet(new URL(config.jwksUrl));
  const verificar = dependencias.jwtVerify || jwtVerify;
  return async function validarToken(token) {
    const { payload } = await verificar(token, jwks, {
      issuer: config.issuer,
      audience: config.audience,
    });
    return validarClaimsOAuth(payload, config);
  };
}

export function extrairAuthorizationId(entrada) {
  const url = entrada instanceof URL ? entrada : new URL(entrada, 'https://localhost');
  const authorizationId = url.searchParams.get(AUTHORIZATION_ID)?.trim();

  if (!authorizationId) {
    throw new Error('AUTHORIZATION_ID_OBRIGATORIO');
  }

  return authorizationId;
}

export function criarRetornoConsentimento(authorizationId) {
  const valor = String(authorizationId ?? '').trim();
  if (!valor) throw new Error('AUTHORIZATION_ID_OBRIGATORIO');
  return `/oauth/consent?${AUTHORIZATION_ID}=${encodeURIComponent(valor)}`;
}

export function criarRedirecionamentoLogin(authorizationId) {
  const retorno = criarRetornoConsentimento(authorizationId);
  return `/login?redirect=${encodeURIComponent(retorno)}`;
}

export function listarEscopos(scope) {
  if (!scope || typeof scope !== 'string') return [];
  return [...new Set(scope.split(/\s+/).map((item) => item.trim()).filter(Boolean))];
}
