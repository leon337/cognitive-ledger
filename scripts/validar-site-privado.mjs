import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const arquivoDados = path.join(raiz, ".gerado", "site-privado", "dados", "registros.js");

assert.ok(fs.existsSync(arquivoDados), "A projeção privada deve gerar dados/registros.js");

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(arquivoDados, "utf8"), sandbox);

const dados = sandbox.window.DADOS_COGNITIVE_LEDGER;
assert.ok(dados, "Os dados privados devem ser carregáveis");
assert.equal(dados.meta.demonstracao, false, "A timeline privada não pode ser marcada como demonstração");
assert.ok(Array.isArray(dados.registros) && dados.registros.length >= 1, "A timeline privada deve conter registros reais");

const protocolo = dados.registros.find((r) => r.id === "ec-2026-08-21-030100-001");
assert.ok(protocolo, "O registro do protocolo visível do MCF deve aparecer na timeline privada");
assert.equal(protocolo.titulo, "Oficialização do protocolo operacional visível do MCF");
assert.equal(protocolo.tipo, "decisao_operacional");
assert.ok(protocolo.decisoes.length > 0, "O registro deve preservar decisões");
assert.ok(protocolo.proximos_passos.length > 0, "O registro deve preservar próximos passos");
assert.ok(protocolo.fonte, "O registro deve preservar referência de fonte");

console.log(`Projeção privada validada: ${dados.registros.length} registro(s).`);
