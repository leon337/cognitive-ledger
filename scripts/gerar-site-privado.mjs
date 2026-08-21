import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pastaSite = path.join(raiz, "site");
const pastaSaida = path.join(raiz, ".gerado", "site-privado");

fs.rmSync(pastaSaida, { recursive: true, force: true });
fs.mkdirSync(path.dirname(pastaSaida), { recursive: true });
fs.cpSync(pastaSite, pastaSaida, { recursive: true });
fs.mkdirSync(path.join(pastaSaida, "dados"), { recursive: true });
fs.writeFileSync(
  path.join(pastaSaida, "dados", "registros.js"),
  "window.DADOS_COGNITIVE_LEDGER = null;\n",
  "utf8"
);

console.log("Site privado gerado sem dados canônicos embutidos; timeline será carregada por API.");
