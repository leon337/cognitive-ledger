import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { randomBytes, randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { exportJWK, generateKeyPair, importJWK, SignJWT } from 'jose';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const cli = join(raiz, 'tools/lab/node_modules/.bin/supabase');
const entradaMcp = join(raiz, 'mcp/src/servidor.mjs');
const configPath = join(raiz, 'supabase/config.toml');
let raizLaboratorio;
let tempDir;
let signingKeysPath;
let envFunctionPath;
const ownerId = '00000000-0000-0000-0000-000000000001';
const clientId = 'mcf-lab-raw-controlled';
const supabaseBaseUrl = 'http://localhost:54331';
const issuer = `${supabaseBaseUrl}/auth/v1`;
const mcpBaseUrl = 'http://127.0.0.1:33100';
const exclusoes = [
  'realtime',
  'storage-api',
  'imgproxy',
  'mailpit',
  'postgres-meta',
  'studio',
  'logflare',
  'vector',
  'supavisor',
].join(',');
const envSemOpenAi = { ...process.env };
delete envSemOpenAi.OPENAI_API_KEY;

if (process.env.COGNITIVE_LEDGER_LAB_CONFIRM !== '1') {
  throw new Error('Defina COGNITIVE_LEDGER_LAB_CONFIRM=1 para executar o E2E descartável.');
}
if (!readFileSync(configPath, 'utf8').includes('project_id = "cognitive-ledger-lab"')) {
  throw new Error('Projeto Supabase lab esperado não foi encontrado.');
}

function prepararProjetoSupabaseDescartavel() {
  raizLaboratorio = mkdtempSync(join(tmpdir(), 'cognitive-ledger-lab-'));
  const destinoSupabase = join(raizLaboratorio, 'supabase');
  mkdirSync(destinoSupabase, { recursive: true, mode: 0o700 });

  const config = readFileSync(configPath, 'utf8').replace(
    'jwt_issuer = "http://localhost:54331/auth/v1"',
    [
      'jwt_issuer = "http://localhost:54331/auth/v1"',
      'signing_keys_path = "./.temp/lab-signing-keys.json"',
    ].join('\n'),
  );
  writeFileSync(join(destinoSupabase, 'config.toml'), config, { mode: 0o600 });
  for (const diretorio of ['functions', 'migrations']) {
    symlinkSync(
      join(raiz, 'supabase', diretorio),
      join(destinoSupabase, diretorio),
      'dir',
    );
  }
  symlinkSync(
    join(raiz, 'supabase/seed.sql'),
    join(destinoSupabase, 'seed.sql'),
    'file',
  );

  tempDir = join(destinoSupabase, '.temp');
  signingKeysPath = join(tempDir, 'lab-signing-keys.json');
  envFunctionPath = join(tempDir, 'lab-functions.env');
}

function executar(comando, args, opcoes = {}) {
  return execFileSync(comando, args, {
    cwd: raiz,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
    timeout: opcoes.timeout ?? 300_000,
    stdio: opcoes.stdio ?? ['ignore', 'pipe', 'pipe'],
    env: opcoes.env ?? envSemOpenAi,
  });
}

function executarCli(args, opcoes = {}) {
  return executar(cli, ['--workdir', raizLaboratorio, ...args], opcoes);
}

function encerrarSupabase() {
  try {
    executarCli(['stop', '--no-backup'], { timeout: 120_000 });
  } catch {
    // O primeiro uso não possui stack para encerrar.
  }
}

async function gerarChaveLab() {
  mkdirSync(tempDir, { recursive: true, mode: 0o700 });
  const { privateKey } = await generateKeyPair('ES256', { extractable: true });
  const jwk = await exportJWK(privateKey);
  const kid = randomUUID();
  const chave = {
    ...jwk,
    kid,
    use: 'sig',
    key_ops: ['sign'],
    alg: 'ES256',
    ext: true,
  };
  writeFileSync(signingKeysPath, `${JSON.stringify([chave])}\n`, { mode: 0o600 });
  return { chave, kid };
}

function statusSupabase() {
  return JSON.parse(executarCli(['status', '-o', 'json']));
}

async function criarUsuarioSintetico(status) {
  const resposta = await fetch(`${status.API_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${status.SERVICE_ROLE_KEY}`,
      apikey: status.ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: ownerId,
      email: 'owner-lab@cognitive-ledger.invalid',
      password: randomBytes(24).toString('base64url'),
      email_confirm: true,
      user_metadata: { sintetico: true },
      app_metadata: { provider: 'email', providers: ['email'], sintetico: true },
    }),
  });
  const corpo = await resposta.json();
  assert.equal(resposta.status, 200, JSON.stringify(corpo));
  assert.equal(corpo.id, ownerId);
}

async function emitirJwt(chave, kid) {
  const privateKey = await importJWK(chave, 'ES256');
  return new SignJWT({
    role: 'authenticated',
    email: 'owner-lab@cognitive-ledger.invalid',
    client_id: clientId,
  })
    .setProtectedHeader({ alg: 'ES256', kid, typ: 'JWT' })
    .setIssuedAt()
    .setIssuer(issuer)
    .setAudience('authenticated')
    .setSubject(ownerId)
    .setExpirationTime('30m')
    .sign(privateKey);
}

async function validarJwtNoAuth(status, token) {
  const resposta = await fetch(`${status.API_URL}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: status.ANON_KEY,
    },
  });
  const corpo = await resposta.json();
  assert.equal(resposta.status, 200, JSON.stringify(corpo));
  assert.equal(corpo.id, ownerId);
}

function iniciarProcesso(comando, args, opcoes = {}) {
  const processo = spawn(comando, args, {
    cwd: raiz,
    env: opcoes.env ?? envSemOpenAi,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let saida = '';
  for (const stream of [processo.stdout, processo.stderr]) {
    stream.setEncoding('utf8');
    stream.on('data', (trecho) => {
      saida = `${saida}${trecho}`.slice(-16_384);
    });
  }
  return { processo, saida: () => saida };
}

async function aguardarHttp(url, aceitar, processo, timeoutMs = 30_000) {
  const limite = Date.now() + timeoutMs;
  let ultimoErro;
  while (Date.now() < limite) {
    if (processo?.exitCode !== null) {
      throw new Error(`Processo encerrou antes de ficar pronto: ${processo.exitCode}`);
    }
    try {
      const resposta = await fetch(url);
      if (aceitar(resposta)) return;
    } catch (erro) {
      ultimoErro = erro;
    }
    await new Promise((resolver) => setTimeout(resolver, 250));
  }
  throw new Error(`Timeout aguardando ${url}: ${ultimoErro || 'resposta inesperada'}`);
}

async function encerrarProcesso(processo) {
  if (!processo || processo.exitCode !== null) return;
  processo.kill('SIGTERM');
  await Promise.race([
    new Promise((resolver) => processo.once('exit', resolver)),
    new Promise((resolver) => setTimeout(resolver, 5_000)),
  ]);
  if (processo.exitCode === null && processo.signalCode === null) {
    processo.kill('SIGKILL');
  }
}

function consultar(dbUrl, sql) {
  return executar('psql', [dbUrl, '-At', '-v', 'ON_ERROR_STOP=1', '-c', sql], {
    timeout: 30_000,
  }).trim();
}

function fingerprint(dbUrl) {
  return consultar(
    dbUrl,
    "select md5(string_agg(row_to_json(e)::text, '|' order by e.id)) from public.eventos_cognitivos e",
  );
}

function inteirosBanco(dbUrl) {
  const linha = consultar(dbUrl, [
    'select count(*)',
    '  || \',\' || count(*) filter (where embedding is not null)',
    '  || \',\' || (select count(*) from public.auditoria_acessos)',
    'from public.eventos_cognitivos',
  ].join('\n'));
  return linha.split(',').map(Number);
}

function auditorias(dbUrl) {
  const json = consultar(dbUrl, `
    select coalesce(json_agg(json_build_object(
      'operacao', operacao,
      'client_id', client_id,
      'fonte_bruta_acessada', fonte_bruta_acessada,
      'degradado', degradado
    ) order by criado_em, id), '[]'::json)::text
    from public.auditoria_acessos
  `);
  return JSON.parse(json);
}

let functionRuntime;
let mcpRuntime;
let client;
try {
  prepararProjetoSupabaseDescartavel();
  let identidadeLab = await gerarChaveLab();
  encerrarSupabase();
  identidadeLab = await gerarChaveLab();
  const { chave, kid } = identidadeLab;
  executarCli(['start', '-x', exclusoes], { timeout: 300_000 });
  const status = statusSupabase();
  assert.equal(status.API_URL, 'http://127.0.0.1:54331');
  assert.equal(status.DB_URL, 'postgresql://postgres:postgres@127.0.0.1:54332/postgres');

  await criarUsuarioSintetico(status);
  const token = await emitirJwt(chave, kid);
  await validarJwtNoAuth(status, token);
  writeFileSync(envFunctionPath, [
    `COGNITIVE_LEDGER_OWNER_ID=${ownerId}`,
    'COGNITIVE_LEDGER_EMBEDDING_PROVIDER=disabled',
    `COGNITIVE_LEDGER_OAUTH_ISSUER=${issuer}`,
    '',
  ].join('\n'), { mode: 0o600 });

  functionRuntime = iniciarProcesso(cli, [
    '--workdir', raizLaboratorio,
    'functions',
    'serve',
    'cognitive-ledger-api',
    '--env-file',
    envFunctionPath,
    '--no-verify-jwt',
  ]);
  const apiUrl = `${status.FUNCTIONS_URL}/cognitive-ledger-api`;
  await aguardarHttp(
    `${apiUrl}/v1/diario`,
    (resposta) => resposta.status === 401,
    functionRuntime.processo,
    60_000,
  );

  const fingerprintAntes = fingerprint(status.DB_URL);
  assert.deepEqual(inteirosBanco(status.DB_URL), [3, 0, 0]);

  const envMcp = { ...process.env };
  delete envMcp.OPENAI_API_KEY;
  Object.assign(envMcp, {
    SUPABASE_URL: supabaseBaseUrl,
    SUPABASE_PUBLISHABLE_KEY: status.PUBLISHABLE_KEY,
    COGNITIVE_LEDGER_API_URL: apiUrl.replace('127.0.0.1', 'localhost'),
    PUBLIC_BASE_URL: mcpBaseUrl,
    HOST: '127.0.0.1',
    PORT: '33100',
  });
  mcpRuntime = iniciarProcesso(process.execPath, [entradaMcp], { env: envMcp });
  await aguardarHttp(
    `${mcpBaseUrl}/health`,
    (resposta) => resposta.status === 200,
    mcpRuntime.processo,
  );

  const transport = new StreamableHTTPClientTransport(new URL(`${mcpBaseUrl}/mcp`), {
    requestInit: { headers: { Authorization: `Bearer ${token}` } },
  });
  client = new Client({ name: 'mcf-ledger-e2e-real-lab', version: '0.1.0' });
  await client.connect(transport);

  const ferramentas = await client.listTools();
  assert.deepEqual(ferramentas.tools.map(({ name }) => name), [
    'ler_diario',
    'buscar_eventos',
    'recuperar_contexto',
    'ler_fonte_bruta',
  ]);
  assert.ok(ferramentas.tools.every(({ annotations }) =>
    annotations?.readOnlyHint === true &&
    annotations?.destructiveHint === false &&
    annotations?.openWorldHint === false));

  const diario = await client.callTool({
    name: 'ler_diario',
    arguments: { limite: 2 },
  });
  const busca = await client.callTool({
    name: 'buscar_eventos',
    arguments: { texto: 'busca textual gratuita', limite: 2 },
  });
  const contexto = await client.callTool({
    name: 'recuperar_contexto',
    arguments: { objetivo: 'retomar integração com busca textual gratuita', limite: 2 },
  });
  const fonte = await client.callTool({
    name: 'ler_fonte_bruta',
    arguments: {
      evento_id: 'ec-lab-001',
      justificativa: 'E2E real com fixture exclusivamente sintética',
    },
  });
  for (const resultado of [diario, busca, contexto, fonte]) {
    assert.notEqual(resultado.isError, true, JSON.stringify(resultado));
  }
  assert.equal(busca.structuredContent.degradado, true);
  assert.equal(contexto.structuredContent.degradado, true);
  assert.match(
    fonte.structuredContent.fonte.conteudo_bruto,
    /exclusivamente sintético/u,
  );

  const fingerprintDepois = fingerprint(status.DB_URL);
  assert.equal(fingerprintDepois, fingerprintAntes);
  assert.deepEqual(inteirosBanco(status.DB_URL), [3, 0, 4]);
  const registrosAuditoria = auditorias(status.DB_URL);
  assert.deepEqual(registrosAuditoria.map(({ operacao }) => operacao), [
    'ler_diario',
    'buscar_eventos',
    'recuperar_contexto',
    'ler_fonte_bruta',
  ]);
  assert.ok(registrosAuditoria.every((registro) => registro.client_id === clientId));
  assert.equal(registrosAuditoria.filter((registro) => registro.fonte_bruta_acessada).length, 1);
  assert.equal(registrosAuditoria.filter((registro) => registro.degradado).length, 2);

  console.log(JSON.stringify({
    resultado: 'PASS',
    transporte: 'MCP Streamable HTTP JSON response',
    ferramentas: ferramentas.tools.map(({ name }) => name),
    eventos: 3,
    embeddings: 0,
    auditorias: 4,
    chamadas_pagas: 0,
    fingerprint_eventos: fingerprintDepois,
  }, null, 2));
} catch (erro) {
  const diagnostico = {
    erro: erro instanceof Error ? erro.stack || erro.message : String(erro),
    edge_runtime: functionRuntime?.saida() || '',
    mcp_runtime: mcpRuntime?.saida() || '',
  };
  console.error(JSON.stringify(diagnostico, null, 2));
  process.exitCode = 1;
} finally {
  await client?.close().catch(() => undefined);
  await encerrarProcesso(mcpRuntime?.processo);
  await encerrarProcesso(functionRuntime?.processo);
  encerrarSupabase();
  rmSync(envFunctionPath, { force: true });
  rmSync(signingKeysPath, { force: true });
  rmSync(raizLaboratorio, { force: true, recursive: true });
}
