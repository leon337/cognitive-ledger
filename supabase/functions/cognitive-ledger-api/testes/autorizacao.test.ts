import { assertEquals, assertRejects } from "jsr:@std/assert";
import {
  autenticarClienteOAuth,
  ErroAutorizacao,
  exigirCapacidade,
  tipoBoundary,
} from "../lib/autorizacao.ts";

const OWNER = "owner-1";
const ISSUER = "https://example.supabase.co/auth/v1";
const tokenOk = "token-ok";

function req(auth?: string, path = "/v1/diario") {
  return new Request(`https://api.test${path}`, {
    headers: auth ? { authorization: auth } : {},
  });
}

function claims(overrides: Record<string, unknown> = {}) {
  return {
    iss: ISSUER,
    aud: "authenticated",
    exp: Math.floor(Date.now() / 1000) + 600,
    sub: OWNER,
    client_id: "client-a",
    ...overrides,
  };
}

function deps(overrides: Record<string, unknown> = {}) {
  return {
    ownerId: OWNER,
    issuer: ISSUER,
    verificarJwt: async (_token: string) => claims(),
    obterCliente: async (_clientId: string) => null,
    registrarCliente: async (entrada: any) => ({
      client_id: entrada.clientId,
      owner_id: entrada.ownerId,
      capacidades: entrada.capacidades,
      ativo: true,
      revogado_em: null,
    }),
    ...overrides,
  } as any;
}

Deno.test("/v1 exige Bearer e rejeita ausência de Authorization", async () => {
  const erro = await assertRejects(
    () => autenticarClienteOAuth(req(), deps()),
    ErroAutorizacao,
  ) as ErroAutorizacao;
  assertEquals(erro.status, 401);
});

Deno.test("/v1 rejeita Basic", async () => {
  const erro = await assertRejects(
    () => autenticarClienteOAuth(req("Basic dXNlcjpwYXNz"), deps()),
    ErroAutorizacao,
  ) as ErroAutorizacao;
  assertEquals(erro.status, 401);
});

Deno.test("owner diferente recebe 403", async () => {
  const erro = await assertRejects(
    () =>
      autenticarClienteOAuth(
        req(`Bearer ${tokenOk}`),
        deps({
          verificarJwt: async () => claims({ sub: "outro-owner" }),
        }),
      ),
    ErroAutorizacao,
  ) as ErroAutorizacao;
  assertEquals(erro.status, 403);
});

Deno.test("primeiro request do owner registra cliente com capacidades padrao sem fonte bruta", async () => {
  let recebido: any = null;
  const identidade = await autenticarClienteOAuth(
    req(`Bearer ${tokenOk}`),
    deps({
      registrarCliente: async (entrada: any) => {
        recebido = entrada;
        return {
          client_id: entrada.clientId,
          owner_id: entrada.ownerId,
          capacidades: entrada.capacidades,
          ativo: true,
          revogado_em: null,
        };
      },
    }),
  );
  assertEquals(identidade.clientId, "client-a");
  assertEquals(recebido.capacidades, [
    "ler_diario",
    "buscar_eventos",
    "recuperar_contexto",
  ]);
  assertEquals(recebido.capacidades.includes("ler_fonte_bruta"), false);
});

Deno.test("cliente inativo ou sem capacidade recebe 403; revogar A nao afeta B", () => {
  const a = {
    client_id: "a",
    owner_id: OWNER,
    ativo: false,
    revogado_em: new Date().toISOString(),
    capacidades: ["ler_diario"],
  };
  const b = {
    client_id: "b",
    owner_id: OWNER,
    ativo: true,
    revogado_em: null,
    capacidades: ["ler_diario"],
  };
  const semCap = {
    client_id: "c",
    owner_id: OWNER,
    ativo: true,
    revogado_em: null,
    capacidades: [],
  };
  const status = (cliente: any) => {
    try {
      exigirCapacidade(cliente, "ler_diario");
      return 200;
    } catch (e) {
      return (e as ErroAutorizacao).status;
    }
  };
  assertEquals(status(a), 403);
  assertEquals(status(semCap), 403);
  assertEquals(status(b), 200);
});

Deno.test("boundary /v1 e OAuth; timeline/registros permanecem Basic legado", () => {
  assertEquals(tipoBoundary("/v1/diario"), "oauth");
  assertEquals(tipoBoundary("/timeline"), "legacy");
  assertEquals(tipoBoundary("/registros"), "legacy");
});

Deno.test("claims obrigatorias iss aud exp sub e client_id sao validadas", async () => {
  const casos = [
    { iss: "https://issuer-invalido" },
    { aud: "outra-audiencia" },
    { exp: Math.floor(Date.now() / 1000) - 1 },
    { sub: "" },
    { client_id: "" },
  ];
  for (const alteracao of casos) {
    const erro = await assertRejects(
      () =>
        autenticarClienteOAuth(
          req(`Bearer ${tokenOk}`),
          deps({
            verificarJwt: async () => claims(alteracao),
          }),
        ),
      ErroAutorizacao,
    ) as ErroAutorizacao;
    assertEquals(erro.status, 401);
  }
});
