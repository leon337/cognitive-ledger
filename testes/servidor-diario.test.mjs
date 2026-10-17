import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { once } from "node:events";
import http from "node:http";
import { spawn } from "node:child_process";
import { criarServidor, reindexarApi, verificarApi } from "../servidor-diario-core.mjs";
import { executarSmokeMemoriaMcf } from "../scripts/mcf-cognitive-memory-live-smoke.mjs";

const basic = (usuario, valor) => `Basic ${Buffer.from(`${usuario}:${valor}`).toString("base64")}`;
const autorizacaoSite = basic("leandro", "site");
const autorizacaoApi = basic("leandro", "api");

async function iniciar(opcoes = {}) {
  const pasta = fs.mkdtempSync(path.join(os.tmpdir(), "cognitive-ledger-"));
  fs.writeFileSync(path.join(pasta, "index.html"), "<h1>ok</h1>");
  fs.writeFileSync(path.join(pasta, "login.html"), "<h1>login</h1>");
  fs.mkdirSync(path.join(pasta, "oauth"), { recursive: true });
  fs.writeFileSync(path.join(pasta, "oauth", "consent.html"), "<h1>consent</h1>");
  const servidor = criarServidor({
    pastaPublica: pasta,
    usuario: "leandro",
    validarAcesso: valor => valor === "site",
    credencialApi: "api",
    apiUrl: "https://api.exemplo/cognitive-ledger-api",
    supabaseUrl: "https://projeto.supabase.co",
    supabasePublishableKey: "public-test-key",
    cognitiveMemoryToken: "mcf-machine-token",
    ...opcoes
  });
  servidor.listen(0, "127.0.0.1");
  await once(servidor, "listening");
  const endereco = servidor.address();
  return {
    servidor,
    base: `http://127.0.0.1:${endereco.port}`,
    limpar() {
      servidor.close();
      fs.rmSync(pasta, { recursive: true, force: true });
    }
  };
}

test("nega API sem autenticação", async () => {
  const app = await iniciar({ fetchImpl: async () => { throw new Error("não deveria chamar upstream"); } });
  try {
    const resposta = await fetch(`${app.base}/api/timeline`);
    assert.equal(resposta.status, 401);
  } finally { app.limpar(); }
});

test("encaminha timeline com credencial interna separada", async () => {
  let chamada;
  const app = await iniciar({
    fetchImpl: async (url, opcoes) => {
      chamada = { url: String(url), opcoes };
      return new Response(JSON.stringify({ registros: [] }), { status: 200, headers: { "content-type": "application/json" } });
    }
  });
  try {
    const resposta = await fetch(`${app.base}/api/timeline`, { headers: { Authorization: autorizacaoSite } });
    assert.equal(resposta.status, 200);
    assert.equal(chamada.url, "https://api.exemplo/cognitive-ledger-api/timeline");
    assert.equal(chamada.opcoes.headers.Authorization, autorizacaoApi);
    assert.notEqual(chamada.opcoes.headers.Authorization, autorizacaoSite);
  } finally { app.limpar(); }
});

test("não vaza erro do upstream", async () => {
  const app = await iniciar({ fetchImpl: async () => { throw new Error("upstream"); } });
  try {
    const resposta = await fetch(`${app.base}/api/timeline`, { headers: { Authorization: autorizacaoSite } });
    assert.equal(resposta.status, 502);
    assert.equal(await resposta.text(), "Falha temporária ao acessar o diário.");
  } finally { app.limpar(); }
});

test("continua servindo arquivos privados", async () => {
  const app = await iniciar({ fetchImpl: fetch });
  try {
    const resposta = await fetch(`${app.base}/`, { headers: { Authorization: autorizacaoSite } });
    assert.equal(resposta.status, 200);
    assert.match(await resposta.text(), /<h1>ok<\/h1>/);
  } finally { app.limpar(); }
});

test("verifica a API com credencial interna", async () => {
  let chamada;
  const resultado = await verificarApi({
    usuario: "leandro",
    credencialApi: "api",
    apiUrl: "https://api.exemplo/cognitive-ledger-api",
    fetchImpl: async (url, opcoes) => {
      chamada = { url: String(url), opcoes };
      return new Response(JSON.stringify({ registros: [{ id: "a" }, { id: "b" }] }), { status: 200, headers: { "content-type": "application/json" } });
    }
  });
  assert.equal(resultado.total, 2);
  assert.equal(chamada.url, "https://api.exemplo/cognitive-ledger-api/timeline");
  assert.equal(chamada.opcoes.headers.Authorization, autorizacaoApi);
});

test("verificação de API falha quando upstream não autentica", async () => {
  await assert.rejects(verificarApi({
    usuario: "leandro",
    credencialApi: "api",
    apiUrl: "https://api.exemplo/cognitive-ledger-api",
    fetchImpl: async () => new Response("não autorizado", { status: 401 })
  }), /API indisponível ou não autorizada: 401/);
});

test("serve configuração OAuth em runtime sem vazar credencial interna", async () => {
  const app = await iniciar();
  try {
    const resposta = await fetch(`${app.base}/oauth/config.js`, { headers: { Authorization: autorizacaoSite } });
    assert.equal(resposta.status, 200);
    const corpo = await resposta.text();
    assert.match(corpo, /https:\/\/projeto\.supabase\.co/);
    assert.match(corpo, /public-test-key/);
    assert.doesNotMatch(corpo, /api/);
    assert.equal(resposta.headers.get("cache-control"), "no-store, private");
  } finally { app.limpar(); }
});

test("mapeia rotas limpas de login e consentimento e aplica CSP OAuth restrita", async () => {
  const app = await iniciar();
  try {
    const auth = { Authorization: autorizacaoSite };
    const respostaLogin = await fetch(`${app.base}/login`, { headers: auth });
    assert.equal(respostaLogin.status, 200);
    const csp = respostaLogin.headers.get("content-security-policy") || "";
    assert.match(csp, /https:\/\/cdn\.jsdelivr\.net/);
    assert.match(csp, /https:\/\/projeto\.supabase\.co/);
    const respostaConsent = await fetch(`${app.base}/oauth/consent?authorization_id=req-1`, { headers: auth });
    assert.equal(respostaConsent.status, 200);
  } finally { app.limpar(); }
});

test("reindexa via endpoint Basic interno sem usar credencial humana", async () => {
  let chamada;
  const resultado = await reindexarApi({
    usuario: "leandro",
    credencialApi: "api",
    apiUrl: "https://api.exemplo/cognitive-ledger-api",
    limite: 7,
    fetchImpl: async (url, opcoes) => {
      chamada = { url: String(url), opcoes };
      return new Response(JSON.stringify({ processados: 7, falhas: 0, restantes_estimados: 2, erros: {} }), { status: 200, headers: { "content-type": "application/json" } });
    }
  });
  assert.equal(chamada.url, "https://api.exemplo/cognitive-ledger-api/admin/reindexar");
  assert.equal(chamada.opcoes.method, "POST");
  assert.equal(chamada.opcoes.headers.Authorization, autorizacaoApi);
  assert.notEqual(chamada.opcoes.headers.Authorization, autorizacaoSite);
  assert.deepEqual(JSON.parse(chamada.opcoes.body), { limite: 7 });
  assert.deepEqual(resultado, { processados: 7, falhas: 0, restantes_estimados: 2, erros: {} });
});


test("smoke MCF grava e lê de volta sem expor credencial", async () => {
  const chamadas = [];
  const registros = [];
  const fetchImpl = async (url, opcoes) => {
    chamadas.push({ url: String(url), opcoes });
    if (String(url).endsWith("/registros")) {
      const corpo = JSON.parse(opcoes.body);
      registros.push(corpo.evento);
      return new Response(JSON.stringify({ status: "criado", id: corpo.evento.id }), {
        status: 201,
        headers: { "content-type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ registros }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  };
  const resultado = await executarSmokeMemoriaMcf({
    usuario: "leandro",
    credencialApi: "segredo-interno",
    apiUrl: "https://api.exemplo/cognitive-ledger-api",
    eventId: "ec-mcf-memory-e2e-20260918-001",
    timestamp: "2026-09-18T21:15:00-03:00",
    fetchImpl
  });
  assert.equal(resultado.status, "PASS");
  assert.equal(resultado.provider_status, "criado");
  assert.equal(resultado.read_back_verified, true);
  assert.equal(resultado.event_sha256.length, 64);
  assert.equal(chamadas.length, 2);
  assert.match(chamadas[0].opcoes.headers.Authorization, /^Basic /);
  assert.doesNotMatch(JSON.stringify(resultado), /segredo-interno/);
});

test("smoke MCF falha fechado quando read-back não encontra o evento", async () => {
  const fetchImpl = async (url, opcoes) => {
    if (String(url).endsWith("/registros")) {
      const corpo = JSON.parse(opcoes.body);
      return new Response(JSON.stringify({ status: "criado", id: corpo.evento.id }), {
        status: 201,
        headers: { "content-type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ registros: [] }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  };
  await assert.rejects(
    executarSmokeMemoriaMcf({
      usuario: "leandro",
      credencialApi: "segredo-interno",
      apiUrl: "https://api.exemplo/cognitive-ledger-api",
      eventId: "ec-mcf-memory-e2e-20260918-002",
      timestamp: "2026-09-18T21:16:00-03:00",
      fetchImpl
    }),
    /read_back_live_evento_ausente/
  );
});


test("nega boundary MCF com bearer incorreto", async () => {
  let chamadas = 0;
  const app = await iniciar({
    fetchImpl: async () => {
      chamadas += 1;
      return new Response("{}", { status: 200 });
    }
  });
  try {
    const resposta = await fetch(`${app.base}/internal/mcf-memory/timeline`, {
      headers: { Authorization: "Bearer errado" }
    });
    assert.equal(resposta.status, 401);
    assert.equal(chamadas, 0);
    assert.deepEqual(await resposta.json(), { erro: "nao_autorizado" });
  } finally { app.limpar(); }
});

test("boundary MCF encaminha write com credencial interna separada", async () => {
  let chamada;
  const app = await iniciar({
    fetchImpl: async (url, opcoes) => {
      chamada = { url: String(url), opcoes };
      return new Response(JSON.stringify({ status: "criado", id: "ec-x" }), {
        status: 201,
        headers: { "content-type": "application/json" }
      });
    }
  });
  try {
    const resposta = await fetch(`${app.base}/internal/mcf-memory/registros`, {
      method: "POST",
      headers: {
        Authorization: "Bearer mcf-machine-token",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ evento: { id: "ec-x" }, fontes: [], relacoes: [] })
    });
    assert.equal(resposta.status, 201);
    assert.equal(chamada.url, "https://api.exemplo/cognitive-ledger-api/registros");
    assert.equal(chamada.opcoes.headers.Authorization, autorizacaoApi);
    assert.notEqual(chamada.opcoes.headers.Authorization, "Bearer mcf-machine-token");
    assert.deepEqual(await resposta.json(), { status: "criado", id: "ec-x" });
  } finally { app.limpar(); }
});

test("boundary MCF encaminha read-back com token de máquina", async () => {
  let chamada;
  const app = await iniciar({
    fetchImpl: async (url, opcoes) => {
      chamada = { url: String(url), opcoes };
      return new Response(JSON.stringify({ registros: [{ id: "ec-x" }] }), {
        status: 200,
        headers: { "content-type": "application/json" }
      });
    }
  });
  try {
    const resposta = await fetch(`${app.base}/internal/mcf-memory/timeline`, {
      headers: { Authorization: "Bearer mcf-machine-token" }
    });
    assert.equal(resposta.status, 200);
    assert.equal(chamada.url, "https://api.exemplo/cognitive-ledger-api/timeline");
    assert.equal(chamada.opcoes.headers.Authorization, autorizacaoApi);
    const corpo = await resposta.text();
    assert.match(corpo, /ec-x/);
    assert.doesNotMatch(corpo, /mcf-machine-token/);
  } finally { app.limpar(); }
});

test("verificação recupera falha transitória sem repetir erro de autenticação", async () => {
  let chamadas = 0;
  const resultado = await verificarApi({
    usuario: "leandro", credencialApi: "api", apiUrl: "https://api.exemplo",
    esperaMs: 0,
    fetchImpl: async () => {
      chamadas += 1;
      if (chamadas === 1) throw new TypeError("fetch failed");
      if (chamadas === 2) return new Response("indisponível", { status: 503 });
      return Response.json({ registros: [] });
    }
  });
  assert.equal(resultado.total, 0);
  assert.equal(chamadas, 3);
  chamadas = 0;
  await assert.rejects(verificarApi({
    usuario: "leandro", credencialApi: "api", apiUrl: "https://api.exemplo",
    esperaMs: 0,
    fetchImpl: async () => { chamadas += 1; return new Response("negado", { status: 401 }); }
  }), /401/);
  assert.equal(chamadas, 1);
});

test("verificação encerra upstream sem resposta dentro do timeout", { timeout: 2000 }, async (t) => {
  const upstream = http.createServer(() => {});
  upstream.listen(0, "127.0.0.1");
  await once(upstream, "listening");
  t.after(() => { upstream.closeAllConnections(); upstream.close(); });
  await assert.rejects(verificarApi({
    usuario: "leandro", credencialApi: "api",
    apiUrl: `http://127.0.0.1:${upstream.address().port}`,
    timeoutMs: 30, tentativas: 1
  }), (erro) => erro.name === "TimeoutError");
});

test("readiness público limita rajadas a uma verificação upstream e não revela registros", async () => {
  let chamadas = 0;
  const app = await iniciar({ fetchImpl: async () => {
    chamadas += 1;
    await new Promise(resolve => setTimeout(resolve, 20));
    return Response.json({ registros: [{ id: "privado" }] });
  } });
  try {
    const respostas = await Promise.all(Array.from({ length: 10 }, () => fetch(`${app.base}/health/ready`)));
    for (const resposta of respostas) {
      assert.equal(resposta.status, 200);
      assert.deepEqual(await resposta.json(), { status: "ok" });
    }
    assert.equal(chamadas, 1);
    assert.equal((await fetch(`${app.base}/health/ready`)).status, 200);
    assert.equal(chamadas, 1);
  } finally { app.limpar(); }
});

test("startup sobrevive à API fora do ar e readiness recupera sem reiniciar", async (t) => {
  let disponivel = false;
  const upstream = http.createServer((req, res) => {
    if (!disponivel) { req.socket.destroy(); return; }
    assert.equal(req.headers.authorization, autorizacaoApi);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ registros: [] }));
  });
  upstream.listen(0, "127.0.0.1");
  await once(upstream, "listening");
  t.after(() => { upstream.closeAllConnections(); upstream.close(); });
  const reserva = http.createServer();
  reserva.listen(0, "127.0.0.1");
  await once(reserva, "listening");
  const porta = reserva.address().port;
  await new Promise(resolve => reserva.close(resolve));
  const processo = spawn(process.execPath, ["servidor-diario.mjs"], {
    cwd: path.resolve(import.meta.dirname, ".."),
    env: {
      ...process.env, PORT: String(porta),
      COGNITIVE_LEDGER_USUARIO: "leandro", COGNITIVE_LEDGER_SENHA: "api",
      COGNITIVE_LEDGER_API_URL: `http://127.0.0.1:${upstream.address().port}`,
      SUPABASE_URL: "https://projeto.supabase.co", SUPABASE_PUBLISHABLE_KEY: "public-test-key",
      MCF_COGNITIVE_MEMORY_E2E_ENABLE: "0", COGNITIVE_LEDGER_REINDEXAR_NO_STARTUP: "0"
    }, stdio: ["ignore", "pipe", "pipe"]
  });
  t.after(async () => {
    if (processo.exitCode === null) { const fim = once(processo, "exit"); processo.kill(); await fim; }
  });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("servidor não iniciou")), 15000);
    processo.stdout.on("data", dados => {
      if (String(dados).includes("disponível na porta")) { clearTimeout(timer); resolve(); }
    });
    processo.once("exit", codigo => { clearTimeout(timer); reject(new Error(`startup encerrou com ${codigo}`)); });
  });
  const base = `http://127.0.0.1:${porta}`;
  const vivo = await fetch(`${base}/health/live`);
  assert.equal(vivo.status, 200);
  assert.deepEqual(await vivo.json(), { status: "ok" });
  const indisponivel = await fetch(`${base}/health/ready`);
  assert.equal(indisponivel.status, 503);
  assert.deepEqual(await indisponivel.json(), { status: "indisponivel" });
  assert.equal((await fetch(`${base}/api/timeline`)).status, 401);
  assert.equal((await fetch(`${base}/internal/mcf-memory/timeline`)).status, 401);
  disponivel = true;
  let pronto;
  const prazo = Date.now() + 6500;
  do {
    await new Promise(resolve => setTimeout(resolve, 100));
    pronto = await fetch(`${base}/health/ready`);
    if (pronto.status === 200) break;
    await pronto.arrayBuffer();
  } while (Date.now() < prazo);
  assert.equal(pronto.status, 200);
  assert.deepEqual(await pronto.json(), { status: "ok" });
  assert.equal(processo.exitCode, null);
});
