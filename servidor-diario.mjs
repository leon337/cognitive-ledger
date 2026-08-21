import path from "node:path";
import { fileURLToPath } from "node:url";
import { criarServidor, verificarApi } from "./servidor-diario-core.mjs";

const raiz = path.dirname(fileURLToPath(import.meta.url));
const pastaPublica = path.join(raiz, ".gerado", "site-privado");
const usuario = process.env.COGNITIVE_LEDGER_USUARIO;
const senha = process.env.COGNITIVE_LEDGER_SENHA;
const apiUrl = process.env.COGNITIVE_LEDGER_API_URL;
const porta = Number(process.env.PORT || 10000);

if (!usuario || !senha || !apiUrl) {
  console.error("COGNITIVE_LEDGER_USUARIO, COGNITIVE_LEDGER_SENHA e COGNITIVE_LEDGER_API_URL são obrigatórios.");
  process.exit(1);
}

try {
  const verificacao = await verificarApi({ usuario, senha, apiUrl });
  console.log(`API operacional validada: ${verificacao.total} registro(s) disponíveis.`);
} catch (erro) {
  console.error(`Falha no smoke test da API: ${erro.message}`);
  process.exit(1);
}

const servidor = criarServidor({ pastaPublica, usuario, senha, apiUrl });

servidor.listen(porta, "0.0.0.0", () => {
  console.log(`Cognitive Ledger privado disponível na porta ${porta}.`);
});
