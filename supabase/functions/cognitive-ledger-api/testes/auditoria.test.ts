import { assertEquals, assertRejects } from "jsr:@std/assert";
import { auditarLeitura, ErroAuditoria } from "../lib/auditoria.ts";

const entrada = {
  ownerId: "owner-1",
  clientId: "client-a",
  operacao: "ler_diario",
  finalidade: "retomar contexto",
  eventoIds: ["ec-1"],
  quantidade: 1,
  fonteBrutaAcessada: false,
  justificativaFonteBruta: null,
  resultado: "ok",
  degradado: false,
  erroCodigo: null,
};

Deno.test("auditoria persiste os campos aprovados", async () => {
  let salvo: any = null;
  await auditarLeitura(entrada as any, {
    inserirAuditoria: async (registro: any) => {
      salvo = registro;
    },
  });
  assertEquals(salvo.client_id, "client-a");
  assertEquals(salvo.operacao, "ler_diario");
  assertEquals(salvo.evento_ids, ["ec-1"]);
  assertEquals(salvo.fonte_bruta_acessada, false);
});

Deno.test("falha de auditoria fecha leitura com 503 e nao vaza conteudo", async () => {
  const segredo = "TITULO_PRIVADO_QUE_NAO_PODE_VAZAR";
  const erro = await assertRejects(
    () =>
      auditarLeitura({ ...entrada, finalidade: segredo } as any, {
        inserirAuditoria: async () => {
          throw new Error("db indisponivel");
        },
      }),
    ErroAuditoria,
  ) as ErroAuditoria;
  assertEquals(erro.status, 503);
  assertEquals(erro.codigo, "AUDITORIA_INDISPONIVEL");
  assertEquals(erro.message.includes(segredo), false);
});
