import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DESCRITOR_FERRAMENTA_INSPECAO,
  registrarFerramentaInspecao,
} from '../src/ferramentas.mjs';
import { criarClienteLedger } from '../src/cliente-ledger.mjs';

function servidorFalso() {
  const registros = new Map();
  return {
    registros,
    registerTool(nome, config, executar) {
      registros.set(nome, { config, executar });
    },
  };
}

test('inspecionar_memoria e read-only, idempotente e nao destrutiva', async () => {
  const server = servidorFalso();
  const cliente = {
    inspecionarMemoria: async (entrada) => ({
      estado: 'ok',
      memoria: {
        evento: {
          id: entrada.evento_id,
          metadados: { memory_scope: entrada.memory_scope },
        },
        relacoes: [],
      },
    }),
  };

  registrarFerramentaInspecao(server, cliente);

  assert.deepEqual([...server.registros.keys()], ['inspecionar_memoria']);
  assert.deepEqual(DESCRITOR_FERRAMENTA_INSPECAO.annotations, {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  });

  const resposta = await server.registros.get('inspecionar_memoria').executar({
    evento_id: 'evt-1',
    memory_scope: 'project:mcf',
  });
  assert.equal(resposta.isError, undefined);
  assert.equal(resposta.structuredContent.memoria.evento.id, 'evt-1');
});

test('cliente de memoria usa POST /v1/memoria/inspecionar sem fonte bruta', async () => {
  const chamadas = [];
  const cliente = criarClienteLedger({
    apiUrl: 'https://ledger.example',
    token: 'token-lab-seguro',
    fetchImpl: async (url, init) => {
      chamadas.push({ url: String(url), init });
      return new Response(JSON.stringify({
        estado: 'ok',
        memoria: {
          evento: {
            id: 'evt-1',
            timestamp: '2026-09-22T20:00:00-03:00',
            tipo: 'decisao',
            status: 'ativo',
            titulo: 'Sintetico',
            resumo: 'Teste',
            contexto: '',
            projetos: ['MCF'],
            assuntos: ['memoria'],
            ideias: [],
            decisoes: [],
            hipoteses: [],
            questoes_abertas: [],
            proximos_passos: [],
            metadados: { memory_scope: 'project:mcf' },
          },
          relacoes: [],
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    },
  });

  const resposta = await cliente.inspecionarMemoria({
    evento_id: 'evt-1',
    memory_scope: 'project:mcf',
  });

  assert.equal(resposta.memoria.evento.id, 'evt-1');
  assert.equal(chamadas.length, 1);
  assert.equal(new URL(chamadas[0].url).pathname, '/v1/memoria/inspecionar');
  assert.equal(chamadas[0].init.method, 'POST');
  assert.doesNotMatch(JSON.stringify(resposta), /conteudo_bruto/u);
});
