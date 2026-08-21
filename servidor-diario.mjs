import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.dirname(fileURLToPath(import.meta.url));
const pastaPublica = path.join(raiz, ".gerado", "site-privado");
const usuario = process.env.COGNITIVE_LEDGER_USUARIO;
const senha = process.env.COGNITIVE_LEDGER_SENHA;
const porta = Number(process.env.PORT || 10000);

if (!usuario || !senha) {
  console.error("COGNITIVE_LEDGER_USUARIO e COGNITIVE_LEDGER_SENHA são obrigatórios.");
  process.exit(1);
}

const tipos = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

function autorizado(req) {
  const cabecalho = req.headers.authorization || "";
  if (!cabecalho.startsWith("Basic ")) return false;
  try {
    const credenciais = Buffer.from(cabecalho.slice(6), "base64").toString("utf8");
    const separador = credenciais.indexOf(":");
    if (separador < 0) return false;
    return credenciais.slice(0, separador) === usuario && credenciais.slice(separador + 1) === senha;
  } catch {
    return false;
  }
}

function responderNaoAutorizado(res) {
  res.writeHead(401, {
    "WWW-Authenticate": 'Basic realm="Cognitive Ledger", charset="UTF-8"',
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end("Autenticação necessária.");
}

const servidor = http.createServer((req, res) => {
  if (!autorizado(req)) {
    responderNaoAutorizado(res);
    return;
  }

  const url = new URL(req.url || "/", "http://localhost");
  let relativo = decodeURIComponent(url.pathname);
  if (relativo === "/") relativo = "/index.html";

  const seguro = path.normalize(relativo).replace(/^([/\\])+/, "");
  const arquivo = path.join(pastaPublica, seguro);

  if (!arquivo.startsWith(pastaPublica + path.sep) && arquivo !== path.join(pastaPublica, "index.html")) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Acesso negado.");
    return;
  }

  if (!fs.existsSync(arquivo) || !fs.statSync(arquivo).isFile()) {
    res.writeHead(404, {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow, noarchive"
    });
    res.end("Não encontrado.");
    return;
  }

  res.writeHead(200, {
    "Content-Type": tipos[path.extname(arquivo).toLowerCase()] || "application/octet-stream",
    "Cache-Control": "no-store, private",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Content-Security-Policy": "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  });
  fs.createReadStream(arquivo).pipe(res);
});

servidor.listen(porta, "0.0.0.0", () => {
  console.log(`Cognitive Ledger privado disponível na porta ${porta}.`);
});
