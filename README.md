# Cognitive Ledger

**Status observado:** `LAB ZERO-COST IMPLEMENTADO LOCALMENTE / AGUARDANDO REVISÃO`

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
2. [`documentacao/auditorias/2026-08-23-lab-readonly-custo-zero.md`](documentacao/auditorias/2026-08-23-lab-readonly-custo-zero.md) — escopo, evidências e lacunas do lab;
3. [`.mcf/project-capsule.yaml`](.mcf/project-capsule.yaml) — Capsule mínima consumível pelo Context Fabric;
4. [`documentacao/roadmaps/2026-08-21-roadmap-continuidade-cross-chat.md`](documentacao/roadmaps/2026-08-21-roadmap-continuidade-cross-chat.md) — contexto histórico e arquitetura planejada.

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
- testes unitários, de integração e E2E locais;
- CI preparada para repetir o lab com banco descartável.

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

## Limites atuais

- nenhuma implantação em lab remoto, staging ou produção foi feita;
- OAuth real, ChatGPT e MCF ainda não foram exercitados contra este MCP;
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
