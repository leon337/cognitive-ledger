const LIMITE_RESPOSTA = 1024 * 1024;

export class ErroClienteLedger extends Error {
  constructor(status, codigo) {
    super(codigo);
    this.name = 'ErroClienteLedger';
    this.status = status;
    this.codigo = codigo;
  }
}

export function normalizarApiUrl(valor) {
  if (!valor || typeof valor !== 'string') {
    throw new Error('COGNITIVE_LEDGER_API_URL_OBRIGATORIA');
  }
  const url = new URL(valor);
  const local = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) {
    throw new Error('COGNITIVE_LEDGER_API_URL_HTTPS_OBRIGATORIA');
  }
  url.pathname = url.pathname.replace(/\/+$/, '');
  url.search = '';
  url.hash = '';
  return url.toString().replace(/\/$/, '');
}

function validarToken(token) {
  if (
    !token || typeof token !== 'string' || token.length > 8192 ||
    /[\u0000-\u0020\u007f]/u.test(token)
  ) {
    throw new Error('BEARER_INVALIDO');
  }
  return token;
}

function adicionarLista(params, nome, valores) {
  for (const valor of valores || []) params.append(nome, valor);
}

async function lerJsonLimitado(resposta) {
  const tamanhoDeclarado = Number(resposta.headers.get('content-length') || 0);
  if (tamanhoDeclarado > LIMITE_RESPOSTA) {
    throw new ErroClienteLedger(502, 'resposta_muito_grande');
  }
  const bytes = new Uint8Array(await resposta.arrayBuffer());
  if (bytes.byteLength > LIMITE_RESPOSTA) {
    throw new ErroClienteLedger(502, 'resposta_muito_grande');
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new ErroClienteLedger(502, 'resposta_invalida');
  }
}

export function criarClienteLedger({ apiUrl, token, fetchImpl = fetch }) {
  const base = normalizarApiUrl(apiUrl);
  const bearer = validarToken(token);

  async function requisitar(pathname, { method = 'GET', body, query } = {}) {
    const url = new URL(`${base}${pathname}`);
    if (query) {
      for (const [chave, valor] of Object.entries(query)) {
        if (Array.isArray(valor)) {
          adicionarLista(url.searchParams, chave, valor);
          continue;
        }
        if (valor !== undefined && valor !== null && valor !== '') {
          url.searchParams.set(chave, String(valor));
        }
      }
    }
    let resposta;
    try {
      resposta = await fetchImpl(url, {
        method,
        headers: {
          Authorization: `Bearer ${bearer}`,
          Accept: 'application/json',
          ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      throw new ErroClienteLedger(503, 'ledger_indisponivel');
    }
    const dados = await lerJsonLimitado(resposta);
    if (!resposta.ok) {
      const codigo = typeof dados?.erro === 'string'
        ? dados.erro.slice(0, 128)
        : `ledger_http_${resposta.status}`;
      throw new ErroClienteLedger(resposta.status, codigo);
    }
    return dados;
  }

  return Object.freeze({
    lerDiario: (entrada = {}) =>
      requisitar('/v1/diario', { query: entrada }),
    buscarEventos: (entrada) =>
      requisitar('/v1/buscar', { method: 'POST', body: entrada }),
    recuperarContexto: (entrada) =>
      requisitar('/v1/contexto', { method: 'POST', body: entrada }),
    lerFonteBruta: (entrada) =>
      requisitar('/v1/fonte', { method: 'POST', body: entrada }),
  });
}
