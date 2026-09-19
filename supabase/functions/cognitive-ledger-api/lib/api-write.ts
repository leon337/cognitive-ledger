import { ErroAuditoria } from "./auditoria.ts";
import { ErroAutorizacao, exigirCapacidade, normalizarPathnameAplicacao } from "./autorizacao.ts";
import type { IdentidadeLeitura } from "./contratos.ts";

const MAX_BODY = 64 * 1024;
const MAX_ID = 256;
const MAX_TEXT = 16 * 1024;
const MAX_LIST = 64;
const MAX_SOURCES = 8;
const MAX_RELATIONS = 32;

const EVENT_KEYS = new Set([
  "id","timestamp","tipo","status","titulo","resumo","contexto",
  "projetos","assuntos","ideias","decisoes","hipoteses",
  "questoes_abertas","proximos_passos","metadados",
]);

export class ErroMemoriaWrite extends Error {
  constructor(public codigo: string, public status = 400) {
    super(codigo);
  }
}

export type ResultadoWrite = {
  status: number;
  corpo: Record<string, unknown>;
};

export type RepositorioMemoriaWrite = {
  registrarEvento(entrada: {
    evento: Record<string, unknown>;
    fontes: Array<Record<string, unknown>>;
    relacoes: Array<Record<string, unknown>>;
  }): Promise<"criado" | "existente">;
  obterEvento(id: string): Promise<Record<string, unknown> | null>;
  inserirAuditoria(registro: Record<string, unknown>): Promise<void>;
};

function objeto(valor: unknown, codigo: string): Record<string, unknown> {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    throw new ErroMemoriaWrite(codigo);
  }
  return valor as Record<string, unknown>;
}

function texto(valor: unknown, campo: string, max = MAX_TEXT): string {
  if (typeof valor !== "string") throw new ErroMemoriaWrite(`${campo}_invalido`);
  const n = valor.trim();
  if (!n || n.length > max) throw new ErroMemoriaWrite(`${campo}_invalido`);
  return n;
}

function listaTexto(valor: unknown, campo: string): string[] {
  if (valor === undefined || valor === null) return [];
  if (!Array.isArray(valor) || valor.length > MAX_LIST) {
    throw new ErroMemoriaWrite(`${campo}_invalido`);
  }
  return valor.map((v) => texto(v, campo, 4096));
}

function validarEvento(valor: unknown): Record<string, unknown> {
  const evento = objeto(valor, "evento_invalido");
  for (const chave of Object.keys(evento)) {
    if (!EVENT_KEYS.has(chave)) throw new ErroMemoriaWrite("evento_campo_desconhecido");
  }
  const id = texto(evento.id, "id", MAX_ID);
  if (!/^[A-Za-z0-9._:-]+$/u.test(id)) throw new ErroMemoriaWrite("id_invalido");
  const timestamp = texto(evento.timestamp, "timestamp", 128);
  if (!Number.isFinite(Date.parse(timestamp))) throw new ErroMemoriaWrite("timestamp_invalido");
  const tipo = texto(evento.tipo, "tipo", 256);
  const titulo = texto(evento.titulo, "titulo", 1024);
  const resumo = texto(evento.resumo, "resumo", MAX_TEXT);
  const status = evento.status === undefined ? "ativo" : texto(evento.status, "status", 128);
  const contexto = evento.contexto === undefined ? "" : String(evento.contexto).trim();
  if (contexto.length > MAX_TEXT) throw new ErroMemoriaWrite("contexto_invalido");

  const saida: Record<string, unknown> = {
    id, timestamp, tipo, status, titulo, resumo, contexto,
  };
  for (const campo of [
    "projetos","assuntos","ideias","decisoes","hipoteses",
    "questoes_abertas","proximos_passos",
  ]) {
    saida[campo] = listaTexto(evento[campo], campo);
  }
  if (evento.metadados !== undefined) {
    const metadados = objeto(evento.metadados, "metadados_invalidos");
    const serializado = JSON.stringify(metadados);
    if (serializado.length > MAX_TEXT) throw new ErroMemoriaWrite("metadados_muito_grandes");
    saida.metadados = metadados;
  }
  return saida;
}

function listaObjetos(valor: unknown, campo: string, max: number): Array<Record<string, unknown>> {
  if (valor === undefined || valor === null) return [];
  if (!Array.isArray(valor) || valor.length > max) {
    throw new ErroMemoriaWrite(`${campo}_invalido`);
  }
  return valor.map((item) => {
    const obj = objeto(item, `${campo}_invalido`);
    if (JSON.stringify(obj).length > MAX_TEXT) throw new ErroMemoriaWrite(`${campo}_muito_grande`);
    return obj;
  });
}

async function corpo(req: Request): Promise<Record<string, unknown>> {
  const bruto = await req.text();
  if (!bruto) throw new ErroMemoriaWrite("json_invalido");
  if (bruto.length > MAX_BODY) throw new ErroMemoriaWrite("corpo_muito_grande", 413);
  try {
    return objeto(JSON.parse(bruto), "json_invalido");
  } catch (erro) {
    if (erro instanceof ErroMemoriaWrite) throw erro;
    throw new ErroMemoriaWrite("json_invalido");
  }
}

function canonico(valor: unknown): string {
  if (Array.isArray(valor)) return `[${valor.map(canonico).join(",")}]`;
  if (valor && typeof valor === "object") {
    const obj = valor as Record<string, unknown>;
    return `{${Object.keys(obj).sort().map((k) => `${JSON.stringify(k)}:${canonico(obj[k])}`).join(",")}}`;
  }
  return JSON.stringify(valor);
}

async function sha256(valor: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(canonico(valor));
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function projecaoVerificacao(evento: Record<string, unknown>): Record<string, unknown> {
  const campos = [
    "id","timestamp","tipo","status","titulo","resumo","contexto",
    "projetos","assuntos","ideias","decisoes","hipoteses",
    "questoes_abertas","proximos_passos","metadados",
  ];
  return Object.fromEntries(campos.filter((c) => c in evento).map((c) => [c, evento[c]]));
}

async function auditar(
  identidade: IdentidadeLeitura,
  deps: { repositorio: RepositorioMemoriaWrite },
  eventoId: string,
  resultado: string,
): Promise<void> {
  try {
    await deps.repositorio.inserirAuditoria({
      owner_id: identidade.ownerId,
      client_id: identidade.clientId,
      operacao: "registrar_memoria",
      finalidade: "captura_explicita",
      evento_ids: [eventoId],
      quantidade: 1,
      fonte_bruta_acessada: false,
      justificativa_fonte_bruta: null,
      resultado,
      degradado: false,
      erro_codigo: null,
    });
  } catch {
    throw new ErroAuditoria();
  }
}

export async function tratarRotaWrite(
  req: Request,
  identidade: IdentidadeLeitura,
  deps: { repositorio: RepositorioMemoriaWrite },
): Promise<ResultadoWrite | null> {
  const pathname = normalizarPathnameAplicacao(new URL(req.url).pathname);
  if (pathname !== "/v1/registros") return null;
  if (req.method !== "POST") {
    return { status: 405, corpo: { erro: "metodo_nao_permitido" } };
  }

  exigirCapacidade(identidade.cliente, "registrar_memoria");
  const entrada = await corpo(req);
  if (entrada.confirmacao_explicita !== true) {
    throw new ErroAutorizacao(403, "CONFIRMACAO_EXPLICITA_OBRIGATORIA");
  }

  const evento = validarEvento(entrada.evento);
  const fontes = listaObjetos(entrada.fontes, "fontes", MAX_SOURCES);
  const relacoes = listaObjetos(entrada.relacoes, "relacoes", MAX_RELATIONS);

  const status = await deps.repositorio.registrarEvento({ evento, fontes, relacoes });
  const lido = await deps.repositorio.obterEvento(String(evento.id));
  if (!lido) throw new ErroMemoriaWrite("readback_ausente", 503);

  const esperadoSha = await sha256(projecaoVerificacao(evento));
  const lidoSha = await sha256(projecaoVerificacao(lido));
  if (esperadoSha !== lidoSha) throw new ErroMemoriaWrite("readback_divergente", 503);

  await auditar(identidade, deps, String(evento.id), status);

  const receiptMaterial = {
    schema: "cognitive_ledger_memory_receipt/v1",
    operacao: "registrar_memoria",
    evento_id: String(evento.id),
    provider_status: status,
    read_back: "verified",
    event_sha256: lidoSha,
  };
  return {
    status: status === "criado" ? 201 : 200,
    corpo: {
      estado: "ok",
      receipt: {
        ...receiptMaterial,
        receipt_sha256: await sha256(receiptMaterial),
      },
    },
  };
}
