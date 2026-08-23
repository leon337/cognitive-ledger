import test from 'node:test';
import assert from 'node:assert/strict';
import {
  criarConfiguracaoOAuth,
  criarRedirecionamentoLogin,
  criarRetornoConsentimento,
  criarValidadorJwtOAuth,
  extrairBearer,
  extrairAuthorizationId,
  listarEscopos,
  validarClaimsOAuth,
} from '../src/oauth.mjs';

test('gera endpoints OAuth e OIDC sem depender da identidade do proprietário', () => {
  const config = criarConfiguracaoOAuth({
    SUPABASE_URL: 'https://example.supabase.co/',
    SUPABASE_PUBLISHABLE_KEY: 'public-test-key',
  });
  assert.equal(config.issuer, 'https://example.supabase.co/auth/v1');
  assert.equal(config.authorizeUrl, 'https://example.supabase.co/auth/v1/oauth/authorize');
  assert.equal(config.tokenUrl, 'https://example.supabase.co/auth/v1/oauth/token');
  assert.equal(config.jwksUrl, 'https://example.supabase.co/auth/v1/.well-known/jwks.json');
  assert.equal(config.discoveryUrl, 'https://example.supabase.co/.well-known/oauth-authorization-server/auth/v1');
});

test('falha fechado quando configuração obrigatória estiver ausente', () => {
  assert.throws(() => criarConfiguracaoOAuth({}), /SUPABASE_URL_OBRIGATORIA/);
  assert.throws(
    () => criarConfiguracaoOAuth({ SUPABASE_URL: 'https://example.supabase.co' }),
    /SUPABASE_PUBLISHABLE_KEY_OBRIGATORIA/,
  );
});

test('extrai authorization_id e rejeita solicitação sem identificador', () => {
  assert.equal(
    extrairAuthorizationId('https://ledger.example/oauth/consent?authorization_id=req-123'),
    'req-123',
  );
  assert.throws(() => extrairAuthorizationId('https://ledger.example/oauth/consent'), /AUTHORIZATION_ID_OBRIGATORIO/);
});

test('preserva authorization_id ao redirecionar para login e voltar ao consentimento', () => {
  const retorno = criarRetornoConsentimento('req a/b');
  assert.equal(retorno, '/oauth/consent?authorization_id=req%20a%2Fb');
  const login = criarRedirecionamentoLogin('req a/b');
  assert.equal(login, '/login?redirect=%2Foauth%2Fconsent%3Fauthorization_id%3Dreq%2520a%252Fb');
});

test('normaliza escopos para apresentação de consentimento', () => {
  assert.deepEqual(listarEscopos('openid email  profile email'), ['openid', 'email', 'profile']);
  assert.deepEqual(listarEscopos(''), []);
});

test('aceita somente Bearer simples e limitado', () => {
  assert.equal(extrairBearer('Bearer token-lab'), 'token-lab');
  assert.throws(() => extrairBearer('Basic token-lab'), /BEARER_OBRIGATORIO/);
  assert.throws(() => extrairBearer('Bearer token com espaco'), /BEARER_INVALIDO/);
  assert.throws(() => extrairBearer(`Bearer ${'x'.repeat(8193)}`), /BEARER_INVALIDO/);
});

test('valida identidade e cliente nos claims OAuth', () => {
  const config = {
    issuer: 'https://example.supabase.co/auth/v1',
    audience: 'authenticated',
  };
  const claims = {
    iss: config.issuer,
    aud: ['authenticated'],
    exp: 2_000,
    sub: 'owner-lab',
    client_id: 'cliente-leitura',
  };
  assert.deepEqual(validarClaimsOAuth(claims, config, 1_000), {
    ownerId: 'owner-lab',
    clientId: 'cliente-leitura',
  });
  assert.throws(
    () => validarClaimsOAuth({ ...claims, client_id: '' }, config, 1_000),
    /TOKEN_INVALIDO/,
  );
  assert.throws(
    () => validarClaimsOAuth({ ...claims, exp: 1_000 }, config, 1_000),
    /TOKEN_INVALIDO/,
  );
});

test('verificador JWT usa issuer e audience e revalida claims', async () => {
  const config = {
    issuer: 'https://example.supabase.co/auth/v1',
    audience: 'authenticated',
    jwksUrl: 'https://example.supabase.co/auth/v1/.well-known/jwks.json',
  };
  const chamadas = [];
  const validar = criarValidadorJwtOAuth(config, {
    jwks: 'jwks-injetado',
    jwtVerify: async (...args) => {
      chamadas.push(args);
      return {
        payload: {
          iss: config.issuer,
          aud: config.audience,
          exp: Math.floor(Date.now() / 1000) + 60,
          sub: 'owner-lab',
          client_id: 'cliente-leitura',
        },
      };
    },
  });
  assert.deepEqual(await validar('token-lab'), {
    ownerId: 'owner-lab',
    clientId: 'cliente-leitura',
  });
  assert.equal(chamadas[0][0], 'token-lab');
  assert.equal(chamadas[0][1], 'jwks-injetado');
  assert.deepEqual(chamadas[0][2], {
    issuer: config.issuer,
    audience: config.audience,
  });
});
