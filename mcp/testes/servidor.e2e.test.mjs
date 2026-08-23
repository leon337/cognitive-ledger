import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { criarAplicacaoMcp } from '../src/servidor.mjs';

async function ouvir(servidor) {
  servidor.listen(0, '127.0.0.1');
  await once(servidor, 'listening');
  const endereco = servidor.address();
  return `http://127.0.0.1:${endereco.port}`;
}

async function fechar(servidor) {
  if (!servidor.listening) return;
  servidor.close();
  await once(servidor, 'close');
}

async function lerCorpo(req) {
  const partes = [];
  for await (const parte of req) partes.push(parte);
  return partes.length ? JSON.parse(Buffer.concat(partes).toString('utf8')) : undefined;
}

function responderJson(res, status, dados) {
  const corpo = JSON.stringify(dados);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(corpo),
  });
  res.end(corpo);
}

test('E2E MCP expõe só quatro leituras, preserva Bearer e não muta Eventos', async (t) => {
  const eventos = [{
    id: 'evt-lab-1',
    tipo: 'decisao',
    resumo: 'Usar busca textual no laboratório.',
    ocorrido_em: '2026-08-23T12:00:00.000Z',
  }];
  const fingerprintInicial = JSON.stringify(eventos);
  const chamadasLedger = [];
  const ledger = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://ledger.local');
    const corpo = await lerCorpo(req);
    chamadasLedger.push({
      method: req.method,
      pathname: url.pathname,
      authorization: req.headers.authorization,
      corpo,
    });
    if (req.headers.authorization !== 'Bearer token-lab') {
      responderJson(res, 401, { erro: 'bearer_invalido' });
      return;
    }
    const respostas = {
      'GET /v1/diario': { eventos, degradado: true, modo: 'textual' },
      'POST /v1/buscar': { eventos, degradado: true, modo: 'textual' },
      'POST /v1/contexto': { eventos, relacoes: [], degradado: true, modo: 'textual' },
      'POST /v1/fonte': { evento_id: 'evt-lab-1', conteudo_bruto: 'Fonte sintética de laboratório.' },
    };
    const resposta = respostas[`${req.method} ${url.pathname}`];
    if (!resposta) {
      responderJson(res, 405, { erro: 'rota_nao_permitida' });
      return;
    }
    responderJson(res, 200, resposta);
  });
  const ledgerUrl = await ouvir(ledger);
  t.after(() => fechar(ledger));

  const oauth = {
    supabaseUrl: 'https://example.supabase.co',
    publishableKey: 'public-test-key',
    issuer: 'https://example.supabase.co/auth/v1',
    audience: 'authenticated',
  };
  const app = criarAplicacaoMcp({
    oauth,
    apiUrl: ledgerUrl,
    publicBaseUrl: 'http://127.0.0.1:3000',
    validarToken: async (token) => {
      if (token !== 'token-lab') throw new Error('TOKEN_INVALIDO');
      return { ownerId: 'owner-lab', clientId: 'cliente-leitura' };
    },
  });
  const mcp = http.createServer(app);
  const mcpUrl = await ouvir(mcp);
  t.after(() => fechar(mcp));

  const semBearer = await fetch(`${mcpUrl}/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }),
  });
  assert.equal(semBearer.status, 401);
  assert.match(semBearer.headers.get('www-authenticate'), /^Bearer resource_metadata=/);
  assert.equal(semBearer.headers.get('cache-control'), 'no-store, private');

  const transport = new StreamableHTTPClientTransport(new URL(`${mcpUrl}/mcp`), {
    requestInit: { headers: { Authorization: 'Bearer token-lab' } },
  });
  const client = new Client({ name: 'cliente-e2e-lab', version: '0.1.0' });
  t.after(() => client.close().catch(() => undefined));
  await client.connect(transport);

  const ferramentas = await client.listTools();
  assert.deepEqual(ferramentas.tools.map(({ name }) => name), [
    'ler_diario',
    'buscar_eventos',
    'recuperar_contexto',
    'ler_fonte_bruta',
  ]);
  assert.ok(ferramentas.tools.every(({ annotations }) =>
    annotations.readOnlyHint === true &&
    annotations.destructiveHint === false &&
    annotations.openWorldHint === false));

  const chamadas = [
    ['ler_diario', { limite: 1 }],
    ['buscar_eventos', { texto: 'busca textual', limite: 1 }],
    ['recuperar_contexto', { objetivo: 'retomar projeto', limite: 1 }],
    ['ler_fonte_bruta', { evento_id: 'evt-lab-1', justificativa: 'teste E2E controlado' }],
  ];
  for (const [name, args] of chamadas) {
    const resultado = await client.callTool({ name, arguments: args });
    assert.notEqual(resultado.isError, true);
  }

  assert.equal(JSON.stringify(eventos), fingerprintInicial);
  assert.deepEqual(chamadasLedger.map(({ method, pathname }) => `${method} ${pathname}`), [
    'GET /v1/diario',
    'POST /v1/buscar',
    'POST /v1/contexto',
    'POST /v1/fonte',
  ]);
  assert.ok(chamadasLedger.every(({ authorization }) => authorization === 'Bearer token-lab'));
  assert.ok(chamadasLedger.every(({ pathname }) => !pathname.includes('/registros')));
});
