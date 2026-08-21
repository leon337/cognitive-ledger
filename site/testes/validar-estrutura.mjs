import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const arquivoAtual = fileURLToPath(import.meta.url);
const pastaTestes = path.dirname(arquivoAtual);
const pastaSite = path.resolve(pastaTestes, "..");

function ler(caminhoRelativo) {
  return fs.readFileSync(path.join(pastaSite, caminhoRelativo), "utf8");
}

const html = ler("index.html");
const css = ler("estilos/principal.css");
const dadosJs = ler("dados/registros.js");
const appJs = ler("scripts/aplicacao.js");

for (const id of [
  "busca",
  "filtro-tipo",
  "filtro-projeto",
  "lista-linha-do-tempo",
  "detalhe-registro",
  "detalhe-fonte"
]) {
  assert.match(html, new RegExp(`id=["']${id}["']`), `HTML deve conter #${id}`);
}

assert.match(html, /lang="pt-BR"/, "HTML deve declarar português do Brasil");
assert.match(html, /Registro cognitivo/i, "HTML deve distinguir Registro Cognitivo");
assert.match(html, /Registro de fonte/i, "HTML deve distinguir Registro de Fonte");
assert.match(css, /@media/, "CSS deve conter regra responsiva");
assert.match(appJs, /normalizarTexto/, "Aplicação deve normalizar busca textual");
assert.match(appJs, /renderizarLinhaDoTempo/, "Aplicação deve renderizar linha do tempo");

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(dadosJs, sandbox);

const dados = sandbox.window.DADOS_COGNITIVE_LEDGER;
assert.ok(dados, "Dados demonstrativos devem ser carregáveis");
assert.equal(dados.meta.demonstracao, true, "Dados publicados devem estar marcados como demonstração");
assert.ok(Array.isArray(dados.registros) && dados.registros.length >= 3, "Protótipo deve conter registros representativos");

for (const registro of dados.registros) {
  assert.ok(registro.id, "Registro deve possuir id");
  assert.ok(registro.timestamp, `${registro.id} deve possuir timestamp`);
  assert.ok(registro.tipo, `${registro.id} deve possuir tipo`);
  assert.ok(registro.titulo, `${registro.id} deve possuir título`);
  assert.ok(registro.resumo, `${registro.id} deve possuir resumo`);
  assert.ok(registro.fonte, `${registro.id} deve separar informação de fonte`);
}

console.log(`Estrutura validada: ${dados.registros.length} registros demonstrativos.`);
