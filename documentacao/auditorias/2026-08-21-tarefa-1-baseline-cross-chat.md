# Auditoria — Tarefa 1 da Fase 1 Cross-Chat

**Data original:** 2026-08-21  
**Fechamento formal:** 2026-08-22  
**Tarefa:** Baseline versionado e limpeza do boundary atual  
**Estado:** `CONCLUÍDA / VALIDADA`

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
12. Em 2026-08-22 foi utilizado um dispositivo remoto autorizado apenas como ambiente temporário de verificação. Foi clonado, em diretório temporário, o commit `50c31ecba1ca6c4e5bd01cdbaf6ecaf5f390ef43` da branch `design/cognitive-ledger-foundation`.
13. O artefato oficial do Deno `2.9.4` foi baixado e validado pelo SHA-256 fixado no workflow: `c24f955d9fbfe0ea5ae2b501c8e71ae76e31e4c9782390a54a284b3364fda725` — resultado `OK`.
14. `deno --version` confirmou `deno 2.9.4`.
15. O comando literal exigido pelo plano foi executado:

```text
deno check supabase/functions/cognitive-ledger-api/index.ts
```

Resultado:

```text
Check supabase/functions/cognitive-ledger-api/index.ts
DENO_CHECK_EXIT=0
```

## Histórico da pendência

O `deno check` ficou inicialmente `NÃO VERIFICADO` porque o runtime original da sessão não possuía Deno e não tinha resolução externa suficiente para instalá-lo. GitHub Actions foi preparado como rota de CI, mas os conectores disponíveis posteriormente não retornaram um run associado aos commits recentes.

A pendência não foi simplesmente dispensada. O comando exato foi executado em outro ambiente autorizado, com checkout temporário e Deno verificado pelo mesmo checksum do workflow.

## Resultado final

- baseline versionado: `VERIFICADO`;
- suíte Node do diário privado: `GREEN`;
- variável residual: `REMOVIDA`;
- deploy/smoke após remoção: `VERIFICADO`;
- regressão operacional observada: `NÃO`;
- `deno check`: `GREEN / EXIT 0`;
- Tarefa 1: `CONCLUÍDA / VALIDADA`.

## Próximo passo

A Tarefa 2 — schema de clientes, auditoria e vetores — está autorizada pelo plano aprovado e pode ser executada sem novo gate humano, respeitando RLS, permissions boundary e Security Advisor.
