import { assertEquals } from "jsr:@std/assert";
import {
  construirPacoteContexto,
  limiteSeguro,
  projetarEvento,
  respostaBusca,
} from "../lib/recuperacao.ts";

const eventoBase = {
  id: "ec-1",
  timestamp: "2026-08-22T10:00:00Z",
  tipo: "decisao",
  status: "ativo",
  titulo: "Continuar entre chats",
  resumo: "O diário sustenta continuidade.",
  contexto: "Cognitive Ledger",
  projetos: ["Cognitive Ledger"],
  assuntos: ["continuidade"],
  ideias: ["memória externa"],
  decisoes: ["usar leitura cross-chat"],
  hipoteses: ["texto pode degradar com segurança"],
  questoes_abertas: ["como calibrar ranking?"],
  proximos_passos: ["publicar MCP"],
  conteudo_bruto: "NÃO DEVE SAIR",
};
Deno.test("limiteSeguro usa 8 por padrão e nunca passa de 12", () => {
  assertEquals(limiteSeguro(undefined), 8);
  assertEquals(limiteSeguro(0), 1);
  assertEquals(limiteSeguro(99), 12);
});

Deno.test("projetarEvento nunca devolve conteúdo bruto", () => {
  const saida = projetarEvento(eventoBase as Record<string, unknown>);
  assertEquals(saida.id, "ec-1");
  assertEquals("conteudo_bruto" in saida, false);
  assertEquals(saida.decisoes, ["usar leitura cross-chat"]);
});

Deno.test("respostaBusca marca fallback gratuito como degradado", () => {
  const r = respostaBusca([{
    evento_id: "ec-1",
    score_total: 0.48,
  }], true);
  assertEquals(r.estado, "ok");
  assertEquals(r.degradado, true);
  assertEquals(r.eventoIds, ["ec-1"]);
});
Deno.test("respostaBusca retorna evidencia_insuficiente sem candidato", () => {
  const r = respostaBusca([], true);
  assertEquals(r.estado, "evidencia_insuficiente");
  assertEquals(r.eventoIds, []);
});

Deno.test("pacote preserva tipos epistemicos e só conflito explícito", () => {
  const pacote = construirPacoteContexto(
    [eventoBase as Record<string, unknown>],
    [
      { evento_origem_id: "ec-1", evento_destino_id: "ec-2", tipo: "revisa" },
      { evento_origem_id: "ec-1", evento_destino_id: "ec-3", tipo: "relacionado" },
    ],
    true,
  );
  assertEquals(pacote.degradado, true);
  assertEquals(pacote.decisoes, ["usar leitura cross-chat"]);
  assertEquals(pacote.hipoteses, ["texto pode degradar com segurança"]);
  assertEquals(pacote.questoes_abertas, ["como calibrar ranking?"]);
  assertEquals(pacote.proximos_passos, ["publicar MCP"]);
  assertEquals(pacote.conflitos.length, 1);
  assertEquals(pacote.conflitos[0].tipo, "revisa");
});
