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

function extrairCredenciais(req) {
  const cabecalho = req.headers.authorization || "";
  if (!cabecalho.startsWith("Basic ")) return null;
  try {
    const credenciais = Buffer.from(cabecalho.slice(6), "base64").toString("utf8");
    const separador = credenciais.indexOf(":");
    if (separador < 0) return null;
    return {
      usuario: credenciais.slice(0, separador),
      valor: credenciais.slice(separador + 1)
    };
  } catch {
    return null;
  }
}

function autorizado(req, usuario, validarAcesso) {
  const credenciais = extrairCredenciais(req);
  if (!credenciais || credenciais.usuario !== usuario) return false;
  try {
    return validarAcesso(credenciais.valor) === true;
  } catch {
    return false;
  }
}

function criarAutorizacao(usuario, valor) {
  return `Basic ${Buffer.from(`${usuario}:${valor}`).toString("base64")}`;
}

const cspPrivada = "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";

function headersPrivados(extra = {}, csp = cspPrivada) {
  return {
    "Cache-Control": "no-store, private",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Content-Security-Policy": csp,
    ...extra
  };
}

function headersOAuth(supabaseOrigin, extra = {}) {
  const csp = `default-src 'self'; style-src 'self'; script-src 'self' https://cdn.jsdelivr.net; img-src 'self' data:; connect-src 'self' ${supabaseOrigin}; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`;
  return headersPrivados(extra, csp);
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

export async function verificarApi({ usuario, credencialApi, apiUrl, fetchImpl = fetch }) {
  if (!usuario || !credencialApi || !apiUrl) throw new Error("configuração da API ausente");
  const apiBase = apiUrl.replace(/\/+$/, "");
  const authorization = criarAutorizacao(usuario, credencialApi);
  const resposta = await fetchImpl(`${apiBase}/timeline`, {
    method: "GET",
    headers: { Authorization: authorization, Accept: "application/json" }
  });
  if (!resposta.ok) throw new Error(`API indisponível ou não autorizada: ${resposta.status}`);
  const dados = await resposta.json();
  if (!dados || !Array.isArray(dados.registros)) throw new Error("Contrato de timeline inválido");
  return { status: resposta.status, total: dados.registros.length };
}

export async function reindexarApi({ usuario, credencialApi, apiUrl, limite = 10, fetchImpl = fetch }) {
  if (!usuario || !credencialApi || !apiUrl) throw new Error("configuração da API ausente");
  const apiBase = apiUrl.replace(/\/+$/, "");
  const authorization = criarAutorizacao(usuario, credencialApi);
  const seguro = Math.max(1, Math.min(Number.isFinite(limite) ? Math.trunc(limite) : 10, 25));
  const resposta = await fetchImpl(`${apiBase}/admin/reindexar`, {
    method: "POST",
    headers: {
      Authorization: authorization,
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ limite: seguro })
  });
  if (!resposta.ok) throw new Error(`Reindexação indisponível ou não autorizada: ${resposta.status}`);
  const dados = await resposta.json();
  for (const campo of ["processados", "falhas", "restantes_estimados"]) {
    if (!Number.isInteger(dados?.[campo]) || dados[campo] < 0) throw new Error("Contrato de reindexação inválido");
  }
  return {
    processados: dados.processados,
    falhas: dados.falhas,
    restantes_estimados: dados.restantes_estimados
  };
}

export function criarServidor({ pastaPublica, usuario, validarAcesso, credencialApi, apiUrl, supabaseUrl, supabasePublishableKey, fetchImpl = fetch }) {
  if (!pastaPublica || !usuario || typeof validarAcesso !== "function" || !credencialApi || !apiUrl || !supabaseUrl || !supabasePublishableKey) {
    throw new Error("configuração obrigatória do servidor ausente");
  }
  const apiBase = apiUrl.replace(/\/+$/, "");
  const authorizationApi = criarAutorizacao(usuario, credencialApi);
  const supabase = new URL(supabaseUrl);
  if (supabase.protocol !== "https:") throw new Error("SUPABASE_URL_HTTPS_OBRIGATORIA");
  const supabaseBase = supabase.toString().replace(/\/$/, "");
  const supabaseOrigin = supabase.origin;
  const configOAuth = `globalThis.COGNITIVE_LEDGER_OAUTH_CONFIG = Object.freeze(${JSON.stringify({
    supabaseUrl: supabaseBase,
    publishableKey: supabasePublishableKey
  })});\n`;

  return http.createServer(async (req, res) => {
    if (!autorizado(req, usuario, validarAcesso)) {
      responderNaoAutorizado(res);
      return;
    }

    const url = new URL(req.url || "/", "http://localhost");

    if (url.pathname === "/oauth/config.js") {
      if (req.method !== "GET") {
        res.writeHead(405, headersOAuth(supabaseOrigin, { "Content-Type": "text/plain; charset=utf-8", Allow: "GET" }));
        res.end("Método não permitido.");
        return;
      }
      res.writeHead(200, headersOAuth(supabaseOrigin, { "Content-Type": "application/javascript; charset=utf-8" }));
      res.end(configOAuth);
      return;
    }

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
            Authorization: authorizationApi,
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
    if (relativo === "/login") relativo = "/login.html";
    if (relativo === "/oauth/consent" || relativo === "/oauth/consent/") relativo = "/oauth/consent.html";
    const rotaOAuth = relativo === "/login.html" || relativo.startsWith("/oauth/");
    const headersEstaticos = (extra = {}) => rotaOAuth
      ? headersOAuth(supabaseOrigin, extra)
      : headersPrivados(extra);
    const seguro = path.normalize(relativo).replace(/^([/\\])+/, "");
    const arquivo = path.join(pastaPublica, seguro);

    if (!arquivo.startsWith(pastaPublica + path.sep) && arquivo !== path.join(pastaPublica, "index.html")) {
      res.writeHead(403, headersEstaticos({ "Content-Type": "text/plain; charset=utf-8" }));
      res.end("Acesso negado.");
      return;
    }

    if (!fs.existsSync(arquivo) || !fs.statSync(arquivo).isFile()) {
      res.writeHead(404, headersEstaticos({ "Content-Type": "text/plain; charset=utf-8" }));
      res.end("Não encontrado.");
      return;
    }

    res.writeHead(200, headersEstaticos({
      "Content-Type": tipos[path.extname(arquivo).toLowerCase()] || "application/octet-stream"
    }));
    fs.createReadStream(arquivo).pipe(res);
  });
}
