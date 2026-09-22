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

const annotationsEscrita = Object.freeze({
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
});

const textoCurto = z.string().trim().min(1).max(4096);
const listaTexto = z.array(textoCurto).max(64);

const eventoMemoriaSchema = z.object({
  id: z.string().trim().min(1).max(256),
  timestamp: z.string().datetime({ offset: true }),
  tipo: z.string().trim().min(1).max(256),
  status: z.string().trim().min(1).max(128).optional(),
  titulo: z.string().trim().min(1).max(1024),
  resumo: z.string().trim().min(1).max(16384),
  contexto: z.string().max(16384).optional(),
  projetos: listaTexto.optional(),
  assuntos: listaTexto.optional(),
  ideias: listaTexto.optional(),
  decisoes: listaTexto.optional(),
  hipoteses: listaTexto.optional(),
  questoes_abertas: listaTexto.optional(),
  proximos_passos: listaTexto.optional(),
  metadados: z.record(z.string(), z.unknown()).optional(),
}).strict();

const fonteMemoriaSchema = z.object({
  tipo_de_fonte: z.string().trim().min(1).max(256),
  provedor: z.string().trim().min(1).max(256).optional(),
  referencia: z.string().max(4096).nullable().optional(),
  escopo_da_captura: z.string().max(4096).optional(),
  conteudo_bruto: z.string().max(16384).nullable().optional(),
  metadados: z.record(z.string(), z.unknown()).optional(),
}).strict();

const relacaoMemoriaSchema = z.object({
  evento_destino_id: z.string().trim().min(1).max(256),
  tipo: z.string().trim().min(1).max(256),
  rotulo: z.string().max(1024).optional(),
}).strict();

export const DESCRITOR_FERRAMENTA_ESCRITA = Object.freeze({
  nome: 'registrar_memoria',
  titulo: 'Registrar memória explícita',
  descricao: 'Registra um Evento Cognitivo somente após confirmação explícita e devolve Receipt após read-back.',
  inputSchema: {
    confirmacao_explicita: z.literal(true),
    evento: eventoMemoriaSchema,
    fontes: z.array(fonteMemoriaSchema).max(8).optional(),
    relacoes: z.array(relacaoMemoriaSchema).max(32).optional(),
  },
  annotations: annotationsEscrita,
  metodo: 'registrarMemoria',
});

export const DESCRITOR_FERRAMENTA_INSPECAO = Object.freeze({
  nome: 'inspecionar_memoria',
  titulo: 'Inspecionar memória governada',
  descricao: 'Inspeciona um Evento Cognitivo e suas relações dentro de um escopo explícito, sem devolver fonte bruta.',
  inputSchema: {
    evento_id: z.string().trim().min(1).max(256),
    memory_scope: z.string().trim().min(1).max(512),
  },
  annotations,
  metodo: 'inspecionarMemoria',
});

function registrarDescritor(server, cliente, descritor) {
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

export function registrarFerramentaEscrita(server, cliente) {
  registrarDescritor(server, cliente, DESCRITOR_FERRAMENTA_ESCRITA);
}

export function registrarFerramentaInspecao(server, cliente) {
  registrarDescritor(server, cliente, DESCRITOR_FERRAMENTA_INSPECAO);
}