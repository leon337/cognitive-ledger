import { createHash } from "node:crypto";

function criarAutorizacao(usuario, valor) {
  return `Basic ${Buffer.from(`${usuario}:${valor}`).toString("base64")}`;
}

function sha256Hex(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function validarEntrada({ usuario, credencialApi, apiUrl, eventId, timestamp }) {
  if (!usuario || !credencialApi || !apiUrl || !eventId || !timestamp) {
    throw new Error("configuracao_smoke_memoria_incompleta");
  }
  if (!apiUrl.startsWith("https://") && !apiUrl.startsWith("http://")) {
    throw new Error("api_url_invalida");
  }
  if (!/^ec-[a-z0-9._-]{8,160}$/i.test(eventId)) {
    throw new Error("event_id_sintetico_invalido");
  }
  if (!Number.isFinite(Date.parse(timestamp))) {
    throw new Error("timestamp_sintetico_invalido");
  }
}

export async function executarSmokeMemoriaMcf({
  usuario,
  credencialApi,
  apiUrl,
  eventId,
  timestamp,
  fetchImpl = fetch
}) {
  validarEntrada({ usuario, credencialApi, apiUrl, eventId, timestamp });
  const apiBase = apiUrl.replace(/\/+$/, "");
  const authorization = criarAutorizacao(usuario, credencialApi);

  const evento = {
    id: eventId,
    timestamp,
    tipo: "checkpoint",
    status: "resolvido",
    titulo: "MCF Cognitive Memory synthetic E2E",
    resumo: "Synthetic governed write/read-back proof for MCF Cognitive Memory.",
    contexto: "Non-personal automated verification of the Cognitive Ledger live provider.",
    assuntos: ["cognitive-memory", "e2e"],
    projetos: ["multiagent-collaboration-framework"],
    ideias: [],
    decisoes: [],
    hipoteses: [],
    questoes_abertas: [],
    proximos_passos: [],
    metadados: {
      synthetic: true,
      private: true,
      exportar_para_git: false,
      origem: "MCF-MEMORY-LIVE-NEXT-STABLE-001"
    }
  };

  const respostaWrite = await fetchImpl(`${apiBase}/registros`, {
    method: "POST",
    headers: {
      Authorization: authorization,
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ evento, fontes: [], relacoes: [] })
  });
  const corpoWrite = await respostaWrite.json().catch(() => ({}));
  if (!respostaWrite.ok) {
    throw new Error(`write_live_falhou_${respostaWrite.status}`);
  }
  if (!["criado", "existente"].includes(corpoWrite?.status) || corpoWrite?.id !== eventId) {
    throw new Error("write_live_contrato_invalido");
  }

  const respostaRead = await fetchImpl(`${apiBase}/timeline`, {
    method: "GET",
    headers: { Authorization: authorization, Accept: "application/json" }
  });
  if (!respostaRead.ok) {
    throw new Error(`read_back_live_falhou_${respostaRead.status}`);
  }
  const timeline = await respostaRead.json();
  const registros = Array.isArray(timeline?.registros) ? timeline.registros : [];
  const encontrado = registros.find((registro) => registro?.id === eventId);
  if (!encontrado) throw new Error("read_back_live_evento_ausente");
  if (encontrado.titulo !== evento.titulo || encontrado.resumo !== evento.resumo) {
    throw new Error("read_back_live_divergente");
  }

  return {
    schema: "mcf_cognitive_memory_live_smoke/v1",
    status: "PASS",
    event_id: eventId,
    provider_status: corpoWrite.status,
    read_back_verified: true,
    event_sha256: sha256Hex(JSON.stringify(evento))
  };
}
