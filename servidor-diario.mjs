import path from "node:path";
import { fileURLToPath } from "node:url";
import { criarServidor, verificarApi } from "./servidor-diario-core.mjs";
import { validarAcesso } from "./acesso-diario.mjs";

const raiz = path.dirname(fileURLToPath(import.meta.url));
const pastaPublica = path.join(raiz, ".gerado", "site-privado");
const usuario = process.env.COGNITIVE_LEDGER_USUARIO;
const credencialApi = process.env.COGNITIVE_LEDGER_SENHA;
const apiUrl = process.env.COGNITIVE_LEDGER_API_URL;
const supabaseUrl = process.env.SUPABASE_URL;
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const porta = Number(process.env.PORT || 10000);

if (!usuario || !credencialApi || !apiUrl || !supabaseUrl || !supabasePublishableKey) {
  console.error("Configuração obrigatória do Cognitive Ledger ausente.");
  process.exit(1);
}

try {
  const verificacao = await verificarApi({ usuario, credencialApi, apiUrl });
  console.log(`API operacional validada: ${verificacao.total} registro(s) disponíveis.`);
} catch (erro) {
  console.error(`Falha no smoke test da API: ${erro.message}`);
  process.exit(1);
}

const servidor = criarServidor({
  pastaPublica, usuario, validarAcesso, credencialApi, apiUrl, supabaseUrl, supabasePublishableKey
});

servidor.listen(porta, "0.0.0.0", () => {
  console.log(`Cognitive Ledger privado disponível na porta ${porta}.`);
});
