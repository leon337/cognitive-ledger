import test from 'node:test';
import assert from 'node:assert/strict';
import {
  criarClienteLedger,
  ErroClienteLedger,
  normalizarApiUrl,
} from '../src/cliente-ledger.mjs';

test('cliente encaminha Bearer e usa somente as quatro rotas read-only', async () => {
  const chamadas = [];
  const fetchImpl = async (url, opcoes) => {
    chamadas.push({ url: new URL(url), opcoes });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };
  const cliente = criarClienteLedger({
    apiUrl: 'http://127.0.0.1:54321/functions/v1/cognitive-ledger-api/',
    token: 'token-lab',
    fetchImpl,
  });

  await cliente.lerDiario({ assuntos: ['mcf', 'ledger'], limite: 2 });
  await cliente.buscarEventos({ texto: 'memória' });
  await cliente.recuperarContexto({ objetivo: 'retomar o projeto' });
  await cliente.lerFonteBruta({ evento_id: 'evt-1', justificativa: 'auditoria lab' });

  assert.deepEqual(chamadas.map(({ url }) => url.pathname), [
    '/functions/v1/cognitive-ledger-api/v1/diario',
    '/functions/v1/cognitive-ledger-api/v1/buscar',
    '/functions/v1/cognitive-ledger-api/v1/contexto',
    '/functions/v1/cognitive-ledger-api/v1/fonte',
  ]);
  assert.deepEqual(chamadas.map(({ opcoes }) => opcoes.method), ['GET', 'POST', 'POST', 'POST']);
  assert.ok(chamadas.every(({ opcoes }) => opcoes.headers.Authorization === 'Bearer token-lab'));
  assert.deepEqual(chamadas[0].url.searchParams.getAll('assuntos'), ['mcf', 'ledger']);
  assert.equal(chamadas[0].url.searchParams.get('limite'), '2');
});

test('cliente rejeita transporte inseguro fora do loopback', () => {
  assert.throws(
    () => normalizarApiUrl('http://ledger.example/v1'),
    /COGNITIVE_LEDGER_API_URL_HTTPS_OBRIGATORIA/,
  );
  assert.equal(normalizarApiUrl('https://ledger.example/v1/'), 'https://ledger.example/v1');
});

test('cliente limita resposta e não repassa erro interno arbitrário', async () => {
  const cliente = criarClienteLedger({
    apiUrl: 'https://ledger.example',
    token: 'token-lab',
    fetchImpl: async () => new Response(JSON.stringify({ erro: 'capability_negada' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    }),
  });
  await assert.rejects(
    () => cliente.buscarEventos({ texto: 'x' }),
    (erro) => erro instanceof ErroClienteLedger &&
      erro.status === 403 && erro.codigo === 'capability_negada',
  );

  const grande = criarClienteLedger({
    apiUrl: 'https://ledger.example',
    token: 'token-lab',
    fetchImpl: async () => new Response('{}', {
      status: 200,
      headers: { 'Content-Length': String(1024 * 1024 + 1) },
    }),
  });
  await assert.rejects(
    () => grande.lerDiario(),
    (erro) => erro instanceof ErroClienteLedger && erro.codigo === 'resposta_muito_grande',
  );
});


test('cliente encaminha escrita governada para rota separada', async () => {
  const chamadas = [];
  const cliente = criarClienteLedger({
    apiUrl: 'http://127.0.0.1:54321/functions/v1/cognitive-ledger-api',
    token: 'token-write-lab',
    fetchImpl: async (url, opcoes) => {
      chamadas.push({ url: new URL(url), opcoes });
      return new Response(JSON.stringify({
        estado: 'ok',
        receipt: {
          schema: 'cognitive_ledger_memory_receipt/v1',
          evento_id: 'ec-lab-write-001',
          read_back: 'verified',
        },
      }), { status: 201, headers: { 'Content-Type': 'application/json' } });
    },
  });
  const resultado = await cliente.registrarMemoria({
    confirmacao_explicita: true,
    evento: {
      id: 'ec-lab-write-001',
      timestamp: '2026-09-18T21:00:00-03:00',
      tipo: 'decisao',
      titulo: 'Sintetico',
      resumo: 'Teste',
    },
  });
  assert.equal(resultado.receipt.read_back, 'verified');
  assert.equal(chamadas.length, 1);
  assert.equal(chamadas[0].url.pathname, '/functions/v1/cognitive-ledger-api/v1/registros');
  assert.equal(chamadas[0].opcoes.method, 'POST');
  assert.equal(chamadas[0].opcoes.headers.Authorization, 'Bearer token-write-lab');
});
