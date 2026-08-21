import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pastaDiario = path.join(raiz, "diario");
const pastaFontes = path.join(raiz, "fontes");
const pastaSite = path.join(raiz, "site");
const pastaSaida = path.join(raiz, ".gerado", "site-privado");

function listarMarkdown(pasta) {
  if (!fs.existsSync(pasta)) return [];
  return fs.readdirSync(pasta, { withFileTypes: true }).flatMap((item) => {
    const absoluto = path.join(pasta, item.name);
    if (item.isDirectory()) return listarMarkdown(absoluto);
    if (item.isFile() && item.name.endsWith(".md") && item.name !== "README.md") return [absoluto];
    return [];
  });
}

function valorEscalar(texto) {
  const v = texto.trim();
  if (v === "null") return null;
  if (v === "true") return true;
  if (v === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  return v.replace(/^['"]|['"]$/g, "");
}

function parseFrontmatter(texto) {
  const partes = texto.split(/^---\s*$/m);
  if (partes.length < 3) return { meta: {}, corpo: texto };
  const linhas = partes[1].split(/\r?\n/);
  const meta = {};
  let i = 0;

  while (i < linhas.length) {
    const linha = linhas[i];
    const match = linha.match(/^([A-Za-z0-9_\-]+):\s*(.*)$/);
    if (!match) { i += 1; continue; }
    const [, chave, resto] = match;
    if (resto.trim()) {
      meta[chave] = valorEscalar(resto);
      i += 1;
      continue;
    }

    const itens = [];
    i += 1;
    while (i < linhas.length && /^\s+/.test(linhas[i])) {
      const item = linhas[i].match(/^\s{2}-\s*(.*)$/);
      if (!item) { i += 1; continue; }
      const conteudo = item[1];
      const objeto = conteudo.match(/^([A-Za-z0-9_\-]+):\s*(.*)$/);
      if (objeto) {
        const registro = { [objeto[1]]: valorEscalar(objeto[2]) };
        i += 1;
        while (i < linhas.length) {
          const sub = linhas[i].match(/^\s{4}([A-Za-z0-9_\-]+):\s*(.*)$/);
          if (!sub) break;
          registro[sub[1]] = valorEscalar(sub[2]);
          i += 1;
        }
        itens.push(registro);
      } else {
        itens.push(valorEscalar(conteudo));
        i += 1;
      }
    }
    meta[chave] = itens;
  }

  return { meta, corpo: partes.slice(2).join("---").trim() };
}

function secoesMarkdown(corpo) {
  const linhas = corpo.split(/\r?\n/);
  const secoes = {};
  let atual = "_inicio";
  secoes[atual] = [];
  for (const linha of linhas) {
    const h2 = linha.match(/^##\s+(.+)$/);
    if (h2) {
      atual = h2[1].trim().toLowerCase();
      secoes[atual] = [];
      continue;
    }
    secoes[atual].push(linha);
  }
  return secoes;
}

function textoSecao(secoes, nome) {
  return (secoes[nome.toLowerCase()] || [])
    .filter((linha) => !/^\s*[-*]\s+/.test(linha))
    .join("\n")
    .trim()
    .replace(/\n{2,}/g, "\n\n");
}

function listaSecao(secoes, nome) {
  return (secoes[nome.toLowerCase()] || [])
    .map((linha) => linha.match(/^\s*[-*]\s+(.+)$/)?.[1]?.trim())
    .filter(Boolean);
}

function rotulo(id) {
  return String(id)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const fontes = new Map();
for (const arquivo of listarMarkdown(pastaFontes)) {
  const { meta, corpo } = parseFrontmatter(fs.readFileSync(arquivo, "utf8"));
  const secoes = secoesMarkdown(corpo);
  if (!meta.id) continue;
  fontes.set(meta.id, {
    tipo: meta.tipo_de_fonte || "outro",
    provedor: meta.provedor || null,
    escopo: meta.escopo_da_captura || null,
    referencia: meta.referencia_de_conversa || meta.referencia_externa || meta.id,
    observacao: textoSecao(secoes, "Escopo da fonte") || "Fonte privada vinculada ao registro cognitivo."
  });
}

const registros = listarMarkdown(pastaDiario).map((arquivo) => {
  const { meta, corpo } = parseFrontmatter(fs.readFileSync(arquivo, "utf8"));
  const secoes = secoesMarkdown(corpo);
  const referencias = Array.isArray(meta.referencias_de_fonte) ? meta.referencias_de_fonte : [];
  const fonte = referencias.map((id) => fontes.get(id)).find(Boolean) || {
    tipo: "registro",
    provedor: "Cognitive Ledger",
    escopo: "evento cognitivo",
    referencia: referencias[0] || null,
    observacao: "Registro privado sem metadados adicionais de fonte disponíveis."
  };

  return {
    id: meta.id,
    timestamp: meta.timestamp,
    tipo: meta.tipo || "sintese",
    status: meta.status || "ativo",
    titulo: meta.titulo || "Registro sem título",
    resumo: textoSecao(secoes, "Resumo") || textoSecao(secoes, "Contexto") || "",
    contexto: textoSecao(secoes, "Contexto") || "",
    projetos: Array.isArray(meta.projetos) ? meta.projetos : [],
    assuntos: Array.isArray(meta.assuntos) ? meta.assuntos : [],
    ideias: listaSecao(secoes, "Ideias"),
    decisoes: listaSecao(secoes, "Decisões"),
    hipoteses: listaSecao(secoes, "Hipóteses"),
    questoes_abertas: listaSecao(secoes, "Questões abertas"),
    proximos_passos: listaSecao(secoes, "Próximos passos"),
    relacoes: (Array.isArray(meta.relacoes) ? meta.relacoes : []).map((r) => typeof r === "object" ? {
      tipo: r.tipo || "relacionado",
      destino: r.alvo || r.destino || "",
      rotulo: r.rotulo || r.tipo || "relação"
    } : { tipo: "relacionado", destino: String(r), rotulo: "relação" }),
    fonte
  };
}).filter((r) => r.id && r.timestamp);

registros.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

const tiposIds = [...new Set(registros.map((r) => r.tipo))];
const projetosIds = [...new Set(registros.flatMap((r) => r.projetos))];

const dados = {
  meta: {
    versao: 1,
    demonstracao: false,
    aviso: "Timeline privada gerada a partir dos Eventos Cognitivos canônicos do repositório."
  },
  tipos: tiposIds.map((id) => ({ id, rotulo: rotulo(id) })),
  projetos: projetosIds.map((id) => ({ id, rotulo: rotulo(id) })),
  registros
};

fs.rmSync(pastaSaida, { recursive: true, force: true });
fs.mkdirSync(path.dirname(pastaSaida), { recursive: true });
fs.cpSync(pastaSite, pastaSaida, { recursive: true });
fs.mkdirSync(path.join(pastaSaida, "dados"), { recursive: true });
fs.writeFileSync(
  path.join(pastaSaida, "dados", "registros.js"),
  `window.DADOS_COGNITIVE_LEDGER = ${JSON.stringify(dados, null, 2)};\n`,
  "utf8"
);

console.log(`Timeline privada gerada com ${registros.length} registro(s) canônico(s).`);
