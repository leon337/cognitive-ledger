# Auditoria — Tarefa 4 — Autorização Bearer por cliente e auditoria fail-closed

**Data:** 2026-08-22
**Estado:** `IMPLEMENTAÇÃO E TESTES CONCLUÍDOS / RUNTIME AINDA NÃO IMPLANTADO`

## Evidências

- Gate G2 OAuth 2.1 + Authorization Code + PKCE: `PASS` end-to-end.
- Token exchange: validado.
- `client_id` do cliente autorizado: validado.
- issuer/audience: validados.
- UserInfo: validado.
- refresh: validado.
- UserInfo após refresh: validado.

## TDD da Tarefa 4

RED válido:

```text
1 passed | 7 failed
```

GREEN final:

```text
9 passed | 0 failed
```

Verificações adicionais:

```text
deno check supabase/functions/cognitive-ledger-api/index.ts
PASS

node --test mcp/testes/oauth.test.mjs testes/servidor-diario.test.mjs
13/13 PASS
```

## Comportamentos verificados

- `/v1/*` exige Bearer e rejeita Basic.
- Claims obrigatórias: `iss`, `aud`, `exp`, `sub`, `client_id`.
- Token é validado pelo Supabase Auth antes do uso das claims.
- Owner divergente é rejeitado.
- Primeiro cliente autorizado recebe somente as capacidades padrão de leitura.
- `ler_fonte_bruta` não é concedida por padrão.
- Cliente inativo, revogado ou sem capacidade é rejeitado.
- Revogação é isolada por cliente.
- Falha de auditoria resulta em 503 sem conteúdo privado no erro.
- `/timeline` e `/registros` permanecem no boundary Basic legado.
- Bearer não ganha escrita.

## Arquivos versionados

- `supabase/functions/cognitive-ledger-api/lib/contratos.ts`
- `supabase/functions/cognitive-ledger-api/lib/autorizacao.ts`
- `supabase/functions/cognitive-ledger-api/lib/auditoria.ts`
- `supabase/functions/cognitive-ledger-api/testes/autorizacao.test.ts`
- `supabase/functions/cognitive-ledger-api/testes/auditoria.test.ts`
- `supabase/functions/cognitive-ledger-api/index.ts`

## Boundary de runtime

A nova boundary está implementada e testada no código versionado, mas a Edge Function de produção ainda não foi redeployada com esta versão.

```text
CÓDIGO / TESTES:  CONCLUÍDOS
RUNTIME PRODUÇÃO: NÃO ATUALIZADO AINDA
```

O caminho Basic legado do diário privado permanece preservado. O deploy da API cross-chat será validado quando as rotas de recuperação estiverem prontas.

## Conclusão

A Tarefa 4 atende ao aceite de implementação e testes previsto no plano. O runtime permanece explicitamente separado como `NÃO IMPLANTADO` até evidência de deploy.
