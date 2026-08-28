# Promoção segura para `main` — gate documental

**Data:** 2026-08-28
**Natureza:** documentação de reconciliação; não autoriza deploy, OAuth, migração,
escrita em provider ou ativação live.

## Referências auditadas

| Ref | SHA | Estado |
| --- | --- | --- |
| `origin/main` | `f95bcddd165afa34708c682d5ce11f810375dc04` | default branch atual |
| `origin/design/cognitive-ledger-foundation` | `a64cfc05f83567f624bbda70288310f56a7264e8` | linha qualificada; merge do PR #3 |

Tomando `main...design`, a linha de design está **9 commits atrás** e **171
commits à frente**. O merge-base é
`25367db635dc0ccbead7b21dec443d28ec5a8209`.

O PR [#1](https://github.com/leon337/cognitive-ledger/pull/1)
(`design/cognitive-ledger-foundation` para `main`) permanece draft e o GitHub o
classifica como `DIRTY`/`CONFLICTING`. A reconciliação prevista encontra conflito
em `README.md`: `main` registra o gate de crédito da Tarefa 5, enquanto a linha
de design registra a evidência posterior do laboratório MCF. A resolução deve
preservar ambos os fatos e não afirmar conexão ou produção live.

## Limite zero-cost

Esta promoção só é compatível com `ZERO_PAID_AI_API` se mantiver:

```text
COGNITIVE_LEDGER_EMBEDDING_PROVIDER=disabled
COGNITIVE_LEDGER_REINDEXAR_NO_STARTUP=0
```

O caminho OpenAI continua presente no código para uso explicitamente opt-in
(`text-embedding-3-large`, `OPENAI_API_KEY` e `/admin/reindexar`), mas é
proibido neste gate: não configurar credencial, não reindexar, não gerar
embeddings, não executar backfill e não ativar provider. A existência desse
caminho não qualifica qualquer uso pago.

## Estratégia de promoção segura

1. Criar uma branch de promoção limpa a partir de `origin/main`.
2. Integrar ou rebasear a revisão exata
   `a64cfc05f83567f624bbda70288310f56a7264e8` nessa branch, sem incluir trabalho
   não relacionado.
3. Resolver o conflito de `README.md` com estado factual: Tarefa 5 continua
   bloqueada para embeddings pagos; o laboratório read-only zero-cost é
   historicamente validado e permanece desconectado/inativo.
4. Fazer revisão de diff e de segredos antes de publicar qualquer alteração.
5. Rodar CI e as validações de laboratório com provider de embeddings desabilitado;
   nenhum teste deve usar provider, segredo ou banco remoto.
6. Submeter a decisão de merge para revisão humana separada. Merge não é
   autorização para deploy, OAuth live, migração de banco, escrita em provider ou
   conexão ChatGPT.

## Evidência já disponível

Os checks históricos dos PRs #1, #2 e #3 registram sucesso para `validar` e
`E2E real MCP → Edge → PostgreSQL`. A evidência do laboratório documenta dados
sintéticos, zero embeddings, zero chamadas pagas e fingerprint imutável de
Eventos. Ela é evidência histórica e não substitui a CI da futura branch de
promoção.
