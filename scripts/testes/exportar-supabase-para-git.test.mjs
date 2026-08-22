import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { exportarSnapshot } from "../exportar-supabase-para-git.mjs";

test("exportação é determinística e idempotente", () => {
  const destino = fs.mkdtempSync(path.join(os.tmpdir(), "cl-export-"));
  const snapshot = {
    registros: [{
      id: "ec-teste-001",
      timestamp: "2026-08-21T03:00:00-03:00",
      tipo: "decisao",
      status: "ativo",
      titulo: "Decisão de teste",
      resumo: "Resumo estável.",
      contexto: "Contexto estável.",
      assuntos: ["teste"],
      projetos: ["cognitive-ledger"],
      ideias: [],
      decisoes: ["Persistir de forma determinística."],
      hipoteses: [],
      questoes_abertas: [],
      proximos_passos: [],
      relacoes: [],
      fonte: {
        tipo: "chat",
        provedor: "ChatGPT",
        escopo: "teste",
        referencia: "teste-001",
        observacao: "Fonte de teste."
      }
    }]
  };

  try {
    const primeira = exportarSnapshot(snapshot, destino);
    const conteudosPrimeira = primeira.map((arquivo) => fs.readFileSync(arquivo, "utf8"));
    const segunda = exportarSnapshot(snapshot, destino);
    const conteudosSegunda = segunda.map((arquivo) => fs.readFileSync(arquivo, "utf8"));

    assert.deepEqual(segunda, primeira);
    assert.deepEqual(conteudosSegunda, conteudosPrimeira);
    assert.ok(primeira.some((arquivo) => arquivo.includes(`${path.sep}diario${path.sep}`)));
    assert.ok(primeira.some((arquivo) => arquivo.includes(`${path.sep}fontes${path.sep}`)));
    assert.match(conteudosPrimeira.join("\n"), /ec-teste-001/);
    assert.match(conteudosPrimeira.join("\n"), /Decisão de teste/);
  } finally {
    fs.rmSync(destino, { recursive: true, force: true });
  }
});
