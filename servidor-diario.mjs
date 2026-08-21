import path from "node:path";
import { fileURLToPath } from "node:url";
import { criarServidor } from "./servidor-diario-core.mjs";

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

const servidor = criarServidor({ pastaPublica, usuario, senha, apiUrl });

servidor.listen(porta, "0.0.0.0", () => {
  console.log(`Cognitive Ledger privado disponível na porta ${porta}.`);
});
