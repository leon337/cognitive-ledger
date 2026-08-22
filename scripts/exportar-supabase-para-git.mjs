import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

function slug(texto) {
  return String(texto || "registro")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "registro";
}

function partesTimestamp(timestamp) {
  const m = String(timestamp).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(Z|([+-])(\d{2}):(\d{2}))$/);
  if (!m) throw new Error(`Timestamp inválido: ${timestamp}`);
  const [, ano, mes, dia, hora, minuto, segundo, zona, sinal, zh, zm] = m;
  const sufixo = zona === "Z" ? "Z" : `${sinal}${zh}${zm}`;
  return { ano, mes, nome: `${ano}-${mes}-${dia}T${hora}${minuto}${segundo}${sufixo}` };
}

function yamlEscalar(valor) {
  return JSON.stringify(valor ?? "");
}

function yamlLista(nome, valores = []) {
  if (!Array.isArray(valores) || valores.length === 0) return `${nome}: []`;
  return `${nome}:\n${valores.map((v) => `  - ${yamlEscalar(v)}`).join("\n")}`;
}

function secaoLista(titulo, valores = []) {
  if (!Array.isArray(valores) || valores.length === 0) return "";
  return `\n## ${titulo}\n\n${valores.map((v) => `- ${v}`).join("\n")}\n`;
}

function conteudoEvento(registro, fonteId) {
  return `---\nversao_do_esquema: 1\nid: ${yamlEscalar(registro.id)}\ntimestamp: ${yamlEscalar(registro.timestamp)}\ntipo: ${yamlEscalar(registro.tipo || "sintese")}\nstatus: ${yamlEscalar(registro.status || "ativo")}\ntitulo: ${yamlEscalar(registro.titulo || "Registro sem título")}\n${yamlLista("assuntos", registro.assuntos)}\n${yamlLista("projetos", registro.projetos)}\nreferencias_de_fonte:\n  - ${yamlEscalar(fonteId)}\nrelacoes: ${JSON.stringify(registro.relacoes || [])}\ncriado_por: "exportacao_supabase"\n---\n\n# ${registro.titulo || "Registro sem título"}\n\n## Contexto\n\n${registro.contexto || ""}\n\n## Resumo\n\n${registro.resumo || ""}\n${secaoLista("Ideias", registro.ideias)}${secaoLista("Decisões", registro.decisoes)}${secaoLista("Hipóteses", registro.hipoteses)}${secaoLista("Questões abertas", registro.questoes_abertas)}${secaoLista("Próximos passos", registro.proximos_passos)}`;
}

function conteudoFonte(registro, fonteId) {
  const fonte = registro.fonte || {};
  return `---\nversao_do_esquema: 1\nid: ${yamlEscalar(fonteId)}\ntimestamp: ${yamlEscalar(registro.timestamp)}\ntipo_de_fonte: ${yamlEscalar(fonte.tipo || "registro")}\nprovedor: ${yamlEscalar(fonte.provedor || "Cognitive Ledger")}\nreferencia_de_conversa: ${yamlEscalar(fonte.referencia || registro.id)}\nescopo_da_captura: ${yamlEscalar(fonte.escopo || "evento cognitivo")}\nconteudo_bruto_no_repositorio: false\n---\n\n# Fonte — ${registro.titulo || registro.id}\n\n## Escopo da fonte\n\n${fonte.observacao || "Fonte exportada do armazenamento operacional do Cognitive Ledger."}\n`;
}

export function exportarSnapshot(snapshot, raizDestino) {
  if (!snapshot || !Array.isArray(snapshot.registros)) throw new Error("Snapshot inválido");
  const arquivos = [];

  for (const registro of snapshot.registros) {
    if (!registro?.id || !registro?.timestamp) throw new Error("Registro sem id ou timestamp");
    const tempo = partesTimestamp(registro.timestamp);
    const fonteId = `fonte-export-${registro.id}`;
    const pastaDiario = path.join(raizDestino, "diario", tempo.ano, tempo.mes);
    const pastaFontes = path.join(raizDestino, "fontes", tempo.ano, tempo.mes);
    fs.mkdirSync(pastaDiario, { recursive: true });
    fs.mkdirSync(pastaFontes, { recursive: true });

    const arquivoEvento = path.join(pastaDiario, `${tempo.nome}-${slug(registro.titulo)}.md`);
    const arquivoFonte = path.join(pastaFontes, `${fonteId}.md`);
    fs.writeFileSync(arquivoEvento, conteudoEvento(registro, fonteId), "utf8");
    fs.writeFileSync(arquivoFonte, conteudoFonte(registro, fonteId), "utf8");
    arquivos.push(arquivoEvento, arquivoFonte);
  }

  return arquivos.sort();
}

async function main() {
  const arquivo = process.argv[2];
  const destino = process.argv[3] ? path.resolve(process.argv[3]) : process.cwd();
  if (!arquivo) throw new Error("Uso: node scripts/exportar-supabase-para-git.mjs <snapshot.json> [destino]");
  const snapshot = JSON.parse(fs.readFileSync(path.resolve(arquivo), "utf8"));
  const arquivos = exportarSnapshot(snapshot, destino);
  console.log(`Exportação concluída: ${arquivos.length} arquivo(s).`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((erro) => {
    console.error(erro.message);
    process.exit(1);
  });
}
