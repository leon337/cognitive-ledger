import http from "node:http";
import fs from "node:fs";
import path from "node:path";

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

function autorizado(req, usuario, senha) {
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

function headersPrivados(extra = {}) {
  return {
    "Cache-Control": "no-store, private",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Content-Security-Policy": "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    ...extra
  };
}

function responderNaoAutorizado(res) {
  res.writeHead(401, {
    "WWW-Authenticate": 'Basic realm="Cognitive Ledger", charset="UTF-8"',
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end("Autenticação necessária.");
}

async function lerCorpo(req, limite = 1024 * 1024) {
  const partes = [];
  let total = 0;
  for await (const parte of req) {
    total += parte.length;
    if (total > limite) throw new Error("CORPO_MUITO_GRANDE");
    partes.push(parte);
  }
  return Buffer.concat(partes);
}

export function criarServidor({ pastaPublica, usuario, senha, apiUrl, fetchImpl = fetch }) {
  if (!pastaPublica || !usuario || !senha || !apiUrl) {
    throw new Error("pastaPublica, usuario, senha e apiUrl são obrigatórios");
  }
  const apiBase = apiUrl.replace(/\/+$/, "");

  return http.createServer(async (req, res) => {
    if (!autorizado(req, usuario, senha)) {
      responderNaoAutorizado(res);
      return;
    }

    const url = new URL(req.url || "/", "http://localhost");

    if (url.pathname === "/api/timeline" || url.pathname === "/api/registros") {
      const rotaTimeline = url.pathname === "/api/timeline";
      const metodoEsperado = rotaTimeline ? "GET" : "POST";
      if (req.method !== metodoEsperado) {
        res.writeHead(405, headersPrivados({ "Content-Type": "text/plain; charset=utf-8", Allow: metodoEsperado }));
        res.end("Método não permitido.");
        return;
      }

      try {
        const corpo = rotaTimeline ? undefined : await lerCorpo(req);
        const upstream = await fetchImpl(`${apiBase}/${rotaTimeline ? "timeline" : "registros"}`, {
          method: metodoEsperado,
          headers: {
            Authorization: req.headers.authorization,
            ...(req.headers["content-type"] ? { "Content-Type": req.headers["content-type"] } : {})
          },
          body: corpo
        });
        const resposta = Buffer.from(await upstream.arrayBuffer());
        res.writeHead(upstream.status, headersPrivados({
          "Content-Type": upstream.headers.get("content-type") || "application/json; charset=utf-8"
        }));
        res.end(resposta);
      } catch (erro) {
        if (erro?.message === "CORPO_MUITO_GRANDE") {
          res.writeHead(413, headersPrivados({ "Content-Type": "text/plain; charset=utf-8" }));
          res.end("Corpo da requisição muito grande.");
          return;
        }
        res.writeHead(502, headersPrivados({ "Content-Type": "text/plain; charset=utf-8" }));
        res.end("Falha temporária ao acessar o diário.");
      }
      return;
    }

    let relativo = decodeURIComponent(url.pathname);
    if (relativo === "/") relativo = "/index.html";
    const seguro = path.normalize(relativo).replace(/^([/\\])+/, "");
    const arquivo = path.join(pastaPublica, seguro);

    if (!arquivo.startsWith(pastaPublica + path.sep) && arquivo !== path.join(pastaPublica, "index.html")) {
      res.writeHead(403, headersPrivados({ "Content-Type": "text/plain; charset=utf-8" }));
      res.end("Acesso negado.");
      return;
    }

    if (!fs.existsSync(arquivo) || !fs.statSync(arquivo).isFile()) {
      res.writeHead(404, headersPrivados({ "Content-Type": "text/plain; charset=utf-8" }));
      res.end("Não encontrado.");
      return;
    }

    res.writeHead(200, headersPrivados({
      "Content-Type": tipos[path.extname(arquivo).toLowerCase()] || "application/octet-stream"
    }));
    fs.createReadStream(arquivo).pipe(res);
  });
}
