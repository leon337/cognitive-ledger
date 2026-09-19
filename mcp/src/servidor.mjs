import { resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import { criarClienteLedger, normalizarApiUrl } from './cliente-ledger.mjs';
import { registrarFerramentaEscrita, registrarFerramentas } from './ferramentas.mjs';
import {
  criarConfiguracaoOAuth,
  criarValidadorJwtOAuth,
  extrairBearer,
} from './oauth.mjs';

function normalizarPublicBaseUrl(valor) {
  const normalizada = normalizarApiUrl(valor);
  return normalizada.replace(/\/$/, '');
}

function headersPrivados(res) {
  res.set({
    'Cache-Control': 'no-store, private',
    'X-Content-Type-Options': 'nosniff',
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
    'Referrer-Policy': 'no-referrer',
  });
}

function responderNaoAutorizado(res, metadataUrl) {
  headersPrivados(res);
  res.set('WWW-Authenticate', `Bearer resource_metadata="${metadataUrl}"`);
  res.status(401).json({ erro: 'bearer_obrigatorio' });
}

function criarServidorFerramentas(cliente) {
  const server = new McpServer({
    name: 'cognitive-ledger-readonly',
    version: '0.1.0-lab',
  });
  registrarFerramentas(server, cliente);
  return server;
}

function criarServidorEscrita(cliente) {
  const server = new McpServer({
    name: 'cognitive-ledger-governed-write',
    version: '0.1.0',
  });
  registrarFerramentaEscrita(server, cliente);
  return server;
}

export function criarAplicacaoMcp(opcoes = {}) {
  const env = opcoes.env || process.env;
  const oauth = opcoes.oauth || criarConfiguracaoOAuth(env);
  const apiUrl = opcoes.apiUrl || normalizarApiUrl(env.COGNITIVE_LEDGER_API_URL);
  const publicBaseUrl = opcoes.publicBaseUrl ||
    normalizarPublicBaseUrl(env.PUBLIC_BASE_URL);
  const host = opcoes.host || '127.0.0.1';
  const metadataUrl = `${publicBaseUrl}/.well-known/oauth-protected-resource`;
  const validarToken = opcoes.validarToken || criarValidadorJwtOAuth(oauth);
  const clienteFactory = opcoes.clienteFactory || ((token) =>
    criarClienteLedger({ apiUrl, token }));
  const app = createMcpExpressApp({ host, allowedHosts: opcoes.allowedHosts });
  app.disable('x-powered-by');

  app.get('/health', (_req, res) => {
    headersPrivados(res);
    res.json({ status: 'ok', mode: 'readonly' });
  });

  app.get('/.well-known/oauth-protected-resource', (_req, res) => {
    headersPrivados(res);
    res.json({
      resource: `${publicBaseUrl}/mcp`,
      authorization_servers: [oauth.issuer],
      scopes_supported: ['openid', 'email', 'profile'],
      bearer_methods_supported: ['header'],
    });
  });

  app.get('/oauth/config.js', (_req, res) => {
    headersPrivados(res);
    res.type('application/javascript').send(
      `globalThis.COGNITIVE_LEDGER_OAUTH_CONFIG = Object.freeze(${JSON.stringify({
        supabaseUrl: oauth.supabaseUrl,
        publishableKey: oauth.publishableKey,
      })});\n`,
    );
  });

  const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
  app.get('/login', (_req, res) => {
    headersPrivados(res);
    res.sendFile('login.html', { root: publicDir });
  });
  app.get('/oauth/consent', (_req, res) => {
    headersPrivados(res);
    res.sendFile('oauth/consent.html', { root: publicDir });
  });
  app.get('/oauth/login.js', (_req, res) => {
    headersPrivados(res);
    res.sendFile('oauth/login.js', { root: publicDir });
  });
  app.get('/oauth/consent.js', (_req, res) => {
    headersPrivados(res);
    res.sendFile('oauth/consent.js', { root: publicDir });
  });

  app.all('/mcp', async (req, res) => {
    let token;
    try {
      token = extrairBearer(req.headers.authorization);
      await validarToken(token);
    } catch {
      responderNaoAutorizado(res, metadataUrl);
      return;
    }

    if (req.method !== 'POST') {
      headersPrivados(res);
      res.set('Allow', 'POST').status(405).json({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Method not allowed.' },
        id: null,
      });
      return;
    }

    const server = criarServidorFerramentas(clienteFactory(token));
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch {
      if (!res.headersSent) {
        headersPrivados(res);
        res.status(500).json({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal server error' },
          id: null,
        });
      }
    } finally {
      await transport.close().catch(() => undefined);
      await server.close().catch(() => undefined);
    }
  });


  app.all('/mcp-write', async (req, res) => {
    let token;
    try {
      token = extrairBearer(req.headers.authorization);
      await validarToken(token);
    } catch {
      responderNaoAutorizado(res, metadataUrl);
      return;
    }

    if (req.method !== 'POST') {
      headersPrivados(res);
      res.set('Allow', 'POST').status(405).json({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Method not allowed.' },
        id: null,
      });
      return;
    }

    const server = criarServidorEscrita(clienteFactory(token));
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch {
      if (!res.headersSent) {
        headersPrivados(res);
        res.status(500).json({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal server error' },
          id: null,
        });
      }
    } finally {
      await transport.close().catch(() => undefined);
      await server.close().catch(() => undefined);
    }
  });

  return app;
}

function iniciar() {
  const host = process.env.HOST || '127.0.0.1';
  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT_INVALIDA');
  }
  const app = criarAplicacaoMcp({ host });
  app.listen(port, host, (erro) => {
    if (erro) throw erro;
    console.log(`Cognitive Ledger MCP read-only ouvindo em ${host}:${port}`);
  });
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  iniciar();
}
