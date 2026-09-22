import test from 'node:test';
import assert from 'node:assert/strict';
import { ErroClienteLedger } from '../src/cliente-ledger.mjs';
import {
  DESCRITOR_FERRAMENTA_ESCRITA,
  DESCRITORES_FERRAMENTAS,
  registrarFerramentaEscrita,
  registrarFerramentas,
} from '../src/ferramentas.mjs';

function servidorFalso() {
  const registros = new Map();
  return {
    registros,
    registerTool(nome, config, executar) {
      registros.set(nome, { config, executar });
    },
  };
}

test('registra exatamente quatro ferramentas tool-only e read-only', async () => {
  const server = servidorFalso();
  const cliente = Object.fromEntries(
    DESCRITORES_FERRAMENTAS.map(({ metodo }) => [metodo, async (entrada) => ({ metodo, entrada })]),
  );
  registrarFerramentas(server, cliente);

  assert.deepEqual([...server.registros.keys()], [
    'ler_diario',
    'buscar_eventos',
    'recuperar_contexto',
    'ler_fonte_bruta',
  ]);
  for (const { config } of server.registros.values()) {
    assert.deepEqual(config.annotations, {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    });
  }
  const resposta = await server.registros.get('buscar_eventos').executar({ texto: 'ledger' });
  assert.equal(resposta.structuredContent.metodo, 'buscarEventos');
  assert.equal(resposta.isError, undefined);
});

test('traduz falha do Ledger para erro MCP explícito sem fabricar memória', async () => {
  const server = servidorFalso();
  const cliente = Object.fromEntries(
    DESCRITORES_FERRAMENTAS.map(({ metodo }) => [metodo, async () => {
      throw new ErroClienteLedger(403, 'capability_negada');
    }]),
  );
  registrarFerramentas(server, cliente);
  const resposta = await server.registros.get('ler_fonte_bruta').executar({
    evento_id: 'evt-1',
    justificativa: 'teste',
  });
  assert.equal(resposta.isError, true);
  assert.deepEqual(resposta.structuredContent, { erro: 'capability_negada', status: 403 });
});


test('registra escrita em servidor separado sem alterar inventario read-only', async () => {
  const readServer = servidorFalso();
  const writeServer = servidorFalso();
  const cliente = {
    ...Object.fromEntries(
      DESCRITORES_FERRAMENTAS.map(({ metodo }) => [metodo, async (entrada) => ({ metodo, entrada })]),
    ),
    registrarMemoria: async (entrada) => ({ estado: 'ok', receipt: { evento_id: entrada.evento.id } }),
  };

  registrarFerramentas(readServer, cliente);
  registrarFerramentaEscrita(writeServer, cliente);

  assert.deepEqual([...readServer.registros.keys()], [
    'ler_diario',
    'buscar_eventos',
    'recuperar_contexto',
    'ler_fonte_bruta',
  ]);
  assert.deepEqual([...writeServer.registros.keys()], ['registrar_memoria']);
  assert.deepEqual(DESCRITOR_FERRAMENTA_ESCRITA.annotations, {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  });

  const resposta = await writeServer.registros.get('registrar_memoria').executar({
    confirmacao_explicita: true,
    evento: {
      id: 'ec-lab-write-001',
      timestamp: '2026-09-18T21:00:00-03:00',
      tipo: 'decisao',
      titulo: 'Sintetico',
      resumo: 'Teste',
    },
  });
  assert.equal(resposta.isError, undefined);
  assert.equal(resposta.structuredContent.receipt.evento_id, 'ec-lab-write-001');
});
