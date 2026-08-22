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
const arquivoLogin = path.join(pastaPrivada, "login.html");
const arquivoConsent = path.join(pastaPrivada, "oauth", "consent.html");
const arquivoConsentJs = path.join(pastaPrivada, "oauth", "consent.js");
const arquivoLoginJs = path.join(pastaPrivada, "oauth", "login.js");
const arquivoConfigEstatico = path.join(pastaPrivada, "oauth", "config.js");

assert.ok(fs.existsSync(arquivoDadosPrivados), "A projeção privada deve gerar dados/registros.js");
assert.ok(fs.existsSync(arquivoAppPrivado), "A projeção privada deve conter scripts/aplicacao.js");
assert.ok(fs.existsSync(arquivoLogin), "A projeção privada deve conter login passwordless");
assert.ok(fs.existsSync(arquivoConsent), "A projeção privada deve conter UI de consentimento OAuth");
assert.ok(fs.existsSync(arquivoConsentJs), "A projeção privada deve conter lógica de consentimento OAuth");
assert.ok(fs.existsSync(arquivoLoginJs), "A projeção privada deve conter lógica de login OAuth");
assert.equal(fs.existsSync(arquivoConfigEstatico), false, "Configuração OAuth deve ser servida em runtime, não gravada no bundle");

const dadosPrivadosJs = fs.readFileSync(arquivoDadosPrivados, "utf8").trim();
assert.equal(
  dadosPrivadosJs,
  "window.DADOS_COGNITIVE_LEDGER = null;",
  "A projeção privada não deve embutir registros reais no bundle estático"
);
assert.doesNotMatch(dadosPrivadosJs, /ec-2026-|fonte-2026-/, "Dados canônicos não podem ficar embutidos no site privado");

const appPrivado = fs.readFileSync(arquivoAppPrivado, "utf8");
assert.match(appPrivado, /fetch\(["']\/api\/timeline["']/, "Aplicação privada deve carregar a timeline pela API quando não houver dados locais");

const oauthAssets = [arquivoLogin, arquivoConsent, arquivoConsentJs, arquivoLoginJs]
  .map((arquivo) => fs.readFileSync(arquivo, "utf8"))
  .join("\n");
assert.match(oauthAssets, /@supabase\/supabase-js@2\.112\.3/, "SDK Supabase deve estar fixado em versão explícita");
assert.doesNotMatch(oauthAssets, /COGNITIVE_LEDGER_SENHA|service_role|sb_secret_/i, "Assets OAuth não podem conter credenciais administrativas");

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(arquivoDadosPublicos, "utf8"), sandbox);
const dadosPublicos = sandbox.window.DADOS_COGNITIVE_LEDGER;
assert.ok(dadosPublicos, "Os dados públicos demonstrativos devem continuar carregáveis");
assert.equal(dadosPublicos.meta.demonstracao, true, "O protótipo público deve continuar marcado como demonstração");
assert.ok(Array.isArray(dadosPublicos.registros) && dadosPublicos.registros.length >= 3, "O protótipo público deve preservar os registros demonstrativos");

console.log("Projeção privada validada: dados reais somente via API; protótipo público preservado.");
