import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { once } from "node:events";
import { criarServidor, reindexarApi, verificarApi } from "../servidor-diario-core.mjs";

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
      return new Response(JSON.stringify({ registros: [] }), {
        status: 200,
        headers: { "content-type": "application/json" }
      });
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
      return new Response(JSON.stringify({ registros: [{ id: "a" }, { id: "b" }] }), {
        status: 200,
        headers: { "content-type": "application/json" }
      });
    }
  });
  assert.equal(resultado.total, 2);
  assert.equal(chamada.url, "https://api.exemplo/cognitive-ledger-api/timeline");
  assert.equal(chamada.opcoes.headers.Authorization, autorizacaoApi);
});

test("verificação de API falha quando upstream não autentica", async () => {
  await assert.rejects(
    verificarApi({
      usuario: "leandro",
      credencialApi: "api",
      apiUrl: "https://api.exemplo/cognitive-ledger-api",
      fetchImpl: async () => new Response("não autorizado", { status: 401 })
    }),
    /API indisponível ou não autorizada: 401/
  );
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
      return new Response(JSON.stringify({ processados: 7, falhas: 0, restantes_estimados: 2 }), {
        status: 200, headers: { "content-type": "application/json" }
      });
    }
  });
  assert.equal(chamada.url, "https://api.exemplo/cognitive-ledger-api/admin/reindexar");
  assert.equal(chamada.opcoes.method, "POST");
  assert.equal(chamada.opcoes.headers.Authorization, autorizacaoApi);
  assert.notEqual(chamada.opcoes.headers.Authorization, autorizacaoSite);
  assert.deepEqual(JSON.parse(chamada.opcoes.body), { limite: 7 });
  assert.deepEqual(resultado, { processados: 7, falhas: 0, restantes_estimados: 2 });
});
