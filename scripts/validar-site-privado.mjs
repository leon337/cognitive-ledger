import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pastaPrivada = path.join(raiz, ".gerado", "site-privado");
const arquivoDadosPrivados = path.join(pastaPrivada, "dados", "registros.js");
const arquivoAppPrivado = path.join(pastaPrivada, "scripts", "aplicacao.js");
const arquivoDadosPublicos = path.join(raiz, "site", "dados", "registros.js");

assert.ok(fs.existsSync(arquivoDadosPrivados), "A projeção privada deve gerar dados/registros.js");
assert.ok(fs.existsSync(arquivoAppPrivado), "A projeção privada deve conter scripts/aplicacao.js");

const dadosPrivadosJs = fs.readFileSync(arquivoDadosPrivados, "utf8").trim();
assert.equal(
  dadosPrivadosJs,
  "window.DADOS_COGNITIVE_LEDGER = null;",
  "A projeção privada não deve embutir registros reais no bundle estático"
);
assert.doesNotMatch(dadosPrivadosJs, /ec-2026-|fonte-2026-/, "Dados canônicos não podem ficar embutidos no site privado");

const appPrivado = fs.readFileSync(arquivoAppPrivado, "utf8");
assert.match(appPrivado, /fetch\(["']\/api\/timeline["']/, "Aplicação privada deve carregar a timeline pela API quando não houver dados locais");

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(arquivoDadosPublicos, "utf8"), sandbox);
const dadosPublicos = sandbox.window.DADOS_COGNITIVE_LEDGER;
assert.ok(dadosPublicos, "Os dados públicos demonstrativos devem continuar carregáveis");
assert.equal(dadosPublicos.meta.demonstracao, true, "O protótipo público deve continuar marcado como demonstração");
assert.ok(Array.isArray(dadosPublicos.registros) && dadosPublicos.registros.length >= 3, "O protótipo público deve preservar os registros demonstrativos");

console.log("Projeção privada validada: dados reais somente via API; protótipo público preservado.");
