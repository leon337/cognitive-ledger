import * as z from 'zod/v4';
import { ErroClienteLedger } from './cliente-ledger.mjs';

const annotations = Object.freeze({
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
});

const periodo = {
  inicio: z.string().datetime({ offset: true }).optional(),
  fim: z.string().datetime({ offset: true }).optional(),
};

const filtros = {
  projeto: z.string().trim().min(1).max(256).optional(),
  assuntos: z.array(z.string().trim().min(1).max(256)).max(32).optional(),
  tipos: z.array(z.string().trim().min(1).max(256)).max(32).optional(),
  limite: z.number().int().min(1).max(12).optional(),
  ...periodo,
};

export const DESCRITORES_FERRAMENTAS = Object.freeze([
  {
    nome: 'ler_diario',
    titulo: 'Ler janela recente do diário',
    descricao: 'Recupera uma janela pequena de Registros Cognitivos sem fonte bruta.',
    inputSchema: filtros,
    annotations,
    metodo: 'lerDiario',
  },
  {
    nome: 'buscar_eventos',
    titulo: 'Buscar eventos cognitivos',
    descricao: 'Busca Eventos Cognitivos por texto e filtros; sinaliza degradação textual.',
    inputSchema: {
      texto: z.string().trim().min(1).max(4096),
      ...filtros,
    },
    annotations,
    metodo: 'buscarEventos',
  },
  {
    nome: 'recuperar_contexto',
    titulo: 'Recuperar pacote de contexto',
    descricao: 'Recupera memória estruturada sem produzir recomendação ou conclusão nova.',
    inputSchema: {
      objetivo: z.string().trim().min(1).max(4096),
      ...filtros,
    },
    annotations,
    metodo: 'recuperarContexto',
  },
  {
    nome: 'ler_fonte_bruta',
    titulo: 'Ler fonte bruta controlada',
    descricao: 'Lê uma única fonte quando o cliente possui capability e envia justificativa.',
    inputSchema: {
      evento_id: z.string().trim().min(1).max(256),
      justificativa: z.string().trim().min(1).max(1024),
    },
    annotations,
    metodo: 'lerFonteBruta',
  },
]);

function respostaEstruturada(dados) {
  return {
    content: [{ type: 'text', text: JSON.stringify(dados) }],
    structuredContent: dados,
  };
}
function respostaErro(erro) {
  const seguro = erro instanceof ErroClienteLedger
    ? { erro: erro.codigo, status: erro.status }
    : { erro: 'ledger_indisponivel', status: 503 };
  return {
    isError: true,
    content: [{ type: 'text', text: JSON.stringify(seguro) }],
    structuredContent: seguro,
  };
}

export function registrarFerramentas(server, cliente) {
  for (const descritor of DESCRITORES_FERRAMENTAS) {
    server.registerTool(descritor.nome, {
      title: descritor.titulo,
      description: descritor.descricao,
      inputSchema: descritor.inputSchema,
      annotations: descritor.annotations,
    }, async (entrada) => {
      try {
        const dados = await cliente[descritor.metodo](entrada);
        return respostaEstruturada(dados);
      } catch (erro) {
        return respostaErro(erro);
      }
    });
  }
}
