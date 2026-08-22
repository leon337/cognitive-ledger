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
    issuer: `${supabaseUrl}/auth/v1`,
    authorizeUrl: `${supabaseUrl}/auth/v1/oauth/authorize`,
    tokenUrl: `${supabaseUrl}/auth/v1/oauth/token`,
    jwksUrl: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
    discoveryUrl: `${supabaseUrl}/.well-known/oauth-authorization-server/auth/v1`,
    oidcDiscoveryUrl: `${supabaseUrl}/auth/v1/.well-known/openid-configuration`,
  });
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
