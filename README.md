# Cognitive Ledger

**Status observado:** `REAL READ-ONLY LAB E2E PASS / AGUARDANDO ADAPTER MCF`

**Branch isolada:** `codex/cognitive-ledger-zero-cost-lab`

**Base:** `origin/design/cognitive-ledger-foundation`

> **Seu pensamento não deve ficar preso ao chat onde aconteceu.**

O Cognitive Ledger preserva e recupera ideias, decisões, aprendizados,
hipóteses, projetos e suas fontes. Nesta branch, ele também oferece uma fronteira
cross-chat somente leitura, com busca textual gratuita como comportamento padrão.

Nada desta branch foi publicado, implantado em produção ou conectado a dados reais.

## Comece aqui

Leia nesta ordem:

1. [`documentacao/roadmaps/checklist-execucao-cross-chat.md`](documentacao/roadmaps/checklist-execucao-cross-chat.md) — estado atual e próximo passo;
2. [`documentacao/integracao/mcf-mcp-readonly-lab.md`](documentacao/integracao/mcf-mcp-readonly-lab.md) — contrato exato para o adapter do MCF;
3. [`documentacao/auditorias/2026-08-23-lab-readonly-custo-zero.md`](documentacao/auditorias/2026-08-23-lab-readonly-custo-zero.md) — escopo, evidências e lacunas do lab;
4. [`.mcf/project-capsule.yaml`](.mcf/project-capsule.yaml) — Capsule mínima consumível pelo Context Fabric;
5. [`documentacao/roadmaps/2026-08-21-roadmap-continuidade-cross-chat.md`](documentacao/roadmaps/2026-08-21-roadmap-continuidade-cross-chat.md) — contexto histórico e arquitetura planejada.

## O que está implementado nesta branch

```text
Cliente MCF / MCP
        ↓ Bearer OAuth
MCP tool-only read-only
        ↓ mesmo Bearer
cognitive-ledger-api /v1
        ↓
Postgres/Supabase
```

- banco local reproduzível com três Eventos Cognitivos sintéticos;
- busca textual via `pg_trgm`, sem embeddings obrigatórios;
- quatro rotas de recuperação read-only;
- capability por operação e auditoria fail-closed;
- servidor MCP com exatamente quatro ferramentas read-only;
- Capsule do projeto para descoberta pelo MCF;
- testes unitários e E2E real MCP SDK → Edge Runtime → Postgres/pgvector;
- Supabase CLI fixada e identidade/JWT ES256 exclusivamente sintéticos;
- CI preparada para repetir todo o lab descartável.

As quatro operações são:

| API | MCP | Capability |
| --- | --- | --- |
| `GET /v1/diario` | `ler_diario` | `ler_diario` |
| `POST /v1/buscar` | `buscar_eventos` | `buscar_eventos` |
| `POST /v1/contexto` | `recuperar_contexto` | `recuperar_contexto` |
| `POST /v1/fonte` | `ler_fonte_bruta` | `ler_fonte_bruta` + justificativa |

Clientes novos não recebem `ler_fonte_bruta` por padrão. A resposta privada só é
liberada depois que a auditoria é persistida; falha da auditoria encerra a leitura
com erro.

## Regra de custo zero

O provedor de embeddings é `disabled` por padrão. Ter uma `OPENAI_API_KEY` no
ambiente, isoladamente, não autoriza nenhuma chamada.

O caminho pago só é habilitado por opt-in explícito:

```text
COGNITIVE_LEDGER_EMBEDDING_PROVIDER=openai
```

Esse opt-in não faz parte do lab, da CI nem do critério de aceite desta entrega.
Sem ele, busca e contexto usam o ranking textual local e sinalizam degradação
semântica quando aplicável.

## Como validar localmente

Pré-requisitos: Node.js 22, Deno 2.9.4, PostgreSQL com `pgvector` e `psql`.

```bash
deno fmt --check supabase/functions/cognitive-ledger-api
deno check supabase/functions/cognitive-ledger-api/index.ts
deno test --allow-env supabase/functions/cognitive-ledger-api/testes
npm --prefix mcp ci --ignore-scripts --no-audit --no-fund
npm --prefix mcp test
node --test testes/servidor-diario.test.mjs scripts/testes/exportar-supabase-para-git.test.mjs
```

O banco lab exige confirmação explícita e recusa URLs que não sejam loopback e
cujo nome de banco não contenha `lab`:

```bash
COGNITIVE_LEDGER_LAB_CONFIRM=1 \
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/cognitive_ledger_lab \
scripts/validar-banco-lab.sh
```

Use somente banco descartável. O seed é sintético e não contém diário pessoal,
tokens ou credenciais reais.

Para subir e provar o caminho completo real, incluindo Auth, Edge Function, MCP
e Postgres/pgvector descartáveis:

```bash
npm --prefix mcp ci --ignore-scripts --no-audit --no-fund
npm --prefix tools/lab ci --no-audit --no-fund
COGNITIVE_LEDGER_LAB_CONFIRM=1 npm --prefix mcp run test:real:lab
```

O harness remove `OPENAI_API_KEY` do ambiente dos processos filhos, cria a
identidade e o JWT apenas no lab, valida as quatro leituras e encerra/remove o
stack ao final. O contrato e os shapes estão em
[`documentacao/integracao/mcf-mcp-readonly-lab.md`](documentacao/integracao/mcf-mcp-readonly-lab.md).

## Limites atuais

- nenhuma implantação em lab remoto, staging ou produção foi feita;
- o fluxo browser OAuth authorization-code + PKCE, ChatGPT e o adapter MCF ainda
  não foram exercitados; JWT/JWKS e Supabase Auth locais foram exercitados;
- o Registry central do MCF precisa apontar para a Capsule desta branch após revisão;
- a qualidade do ranking textual ainda precisa de avaliação com corpus sintético maior;
- a remediação do histórico público continua adiada e fora deste escopo.

Auditorias anteriores que descrevem saldo OpenAI, deploys ou estado remoto são
evidência histórica. Elas não substituem verificação live e não criam dependência
financeira para o caminho zero-cost.

## Privacidade

Não adicione Eventos Cognitivos reais, fontes pessoais, senhas, tokens, chaves,
connection strings, verificadores de autenticação ou dumps ao Git. O repositório
foi tratado como público durante esta implementação.
