# Auditoria — Tarefa 1 da Fase 1 Cross-Chat

**Data:** 2026-08-21
**Tarefa:** Baseline versionado e limpeza do boundary atual
**Estado:** `EXECUÇÃO CONCLUÍDA / DENO CHECK NÃO EXECUTADO`

## Evidências verificadas

1. A Edge Function `cognitive-ledger-api` implantada no Supabase foi recuperada e versionada sem refatoração em `supabase/functions/cognitive-ledger-api/index.ts`.
2. Commit do baseline: `c86b9421d68645c7e6af06ac85cf5d2c531e2267`.
3. A função implantada estava `ACTIVE`, versão 1, com `verify_jwt=false` e autenticação customizada.
4. `node --test testes/servidor-diario.test.mjs`: 6 testes, 6 aprovados, 0 falhas.
5. Busca por `COGNITIVE_LEDGER_API_CREDENTIAL` no repositório: zero usos.
6. O proprietário removeu somente `COGNITIVE_LEDGER_API_CREDENTIAL` no Render.
7. Deploy após a remoção: `dep-da4337gjo6nc73di4g00`, estado `live`.
8. Smoke test após a remoção: `API operacional validada: 13 registro(s) disponíveis.`
9. A documentação de autenticação foi atualizada no commit `c0f8935bf56e2a6642c8dc8ce93f3f899a9dca22`.
10. O deploy gerado por esse commit documental, `dep-da434iht0dsc73a5gpvg`, também terminou `live` e repetiu o smoke test com 13 registros disponíveis.
11. O Evento Cognitivo `ec-2026-08-21-062800-001` foi alterado de `aberto` para `resolvido`, com evidência do deploy e smoke test.

## Verificação não executada

O passo literal:

```text
deno check supabase/functions/cognitive-ledger-api/index.ts
```

não pôde ser executado no runtime desta sessão porque o binário `deno` não está instalado e a rede do runtime não conseguiu resolver `deno.land` para instalação.

Isso deve permanecer classificado como `NÃO VERIFICADO`; a existência da mesma fonte como Edge Function `ACTIVE` no Supabase é evidência de funcionamento do runtime implantado, mas não substitui formalmente o comando `deno check` previsto no plano.

## Resultado

- baseline versionado: `VERIFICADO`;
- suíte Node do diário privado: `GREEN`;
- variável residual: `REMOVIDA`;
- deploy/smoke após remoção: `VERIFICADO`;
- regressão operacional observada: `NÃO`;
- `deno check`: `NÃO EXECUTADO / NÃO VERIFICADO`.

A passagem para a Tarefa 2 depende de decisão do MESTRE/HUMAN_GATE sobre executar `deno check` por outro ambiente antes de avançar ou aceitar explicitamente o adiamento dessa verificação para o CI que instalará Deno.
