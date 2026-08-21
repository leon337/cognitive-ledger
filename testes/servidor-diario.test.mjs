import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { once } from "node:events";
import { criarServidor, verificarApi } from "../servidor-diario-core.mjs";

const autorizacao = `Basic ${Buffer.from("leandro:senha-teste").toString("base64")}`;

async function iniciar(opcoes = {}) {
  const pasta = fs.mkdtempSync(path.join(os.tmpdir(), "cognitive-ledger-"));
  fs.writeFileSync(path.join(pasta, "index.html"), "<h1>ok</h1>");
  const servidor = criarServidor({
    pastaPublica: pasta,
    usuario: "leandro",
    senha: "senha-teste",
    apiUrl: "https://api.exemplo/cognitive-ledger-api",
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

test("encaminha timeline preservando Authorization", async () => {
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
    const resposta = await fetch(`${app.base}/api/timeline`, { headers: { Authorization: autorizacao } });
    assert.equal(resposta.status, 200);
    assert.equal(chamada.url, "https://api.exemplo/cognitive-ledger-api/timeline");
    assert.equal(chamada.opcoes.headers.Authorization, autorizacao);
  } finally { app.limpar(); }
});

test("não vaza erro do upstream", async () => {
  const app = await iniciar({ fetchImpl: async () => { throw new Error("segredo-upstream"); } });
  try {
    const resposta = await fetch(`${app.base}/api/timeline`, { headers: { Authorization: autorizacao } });
    assert.equal(resposta.status, 502);
    assert.equal(await resposta.text(), "Falha temporária ao acessar o diário.");
  } finally { app.limpar(); }
});

test("continua servindo arquivos privados", async () => {
  const app = await iniciar({ fetchImpl: fetch });
  try {
    const resposta = await fetch(`${app.base}/`, { headers: { Authorization: autorizacao } });
    assert.equal(resposta.status, 200);
    assert.match(await resposta.text(), /<h1>ok<\/h1>/);
  } finally { app.limpar(); }
});

test("verifica a API autenticada antes do startup", async () => {
  let chamada;
  const resultado = await verificarApi({
    usuario: "leandro",
    senha: "senha-teste",
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
  assert.equal(chamada.opcoes.headers.Authorization, autorizacao);
});

test("verificação de API falha quando upstream não autentica", async () => {
  await assert.rejects(
    verificarApi({
      usuario: "leandro",
      senha: "senha-teste",
      apiUrl: "https://api.exemplo/cognitive-ledger-api",
      fetchImpl: async () => new Response("não autorizado", { status: 401 })
    }),
    /API indisponível ou não autorizada: 401/
  );
});
