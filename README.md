# Cognitive Ledger

**Status observado:** `REAL MCF APPMODULE READ-ONLY LAB E2E PASS / DISCONNECTED / INACTIVE`

**Linha de implementação:** `design/cognitive-ledger-foundation`

**Provider integrado:** PR [#2](https://github.com/leon337/cognitive-ledger/pull/2),
merge `e0e715b0105abe0bc636d198e7ebb137d7de9bd7`, feature tree
`b882d2808af74858a6ba351fb755bb3843e33ab2`

**Adapter MCF integrado:** PR
[#160](https://github.com/leon337/multiagent-collaboration-framework/pull/160),
merge `efe5164290d56f22023f07de073e2ad7c027fb95`,
[staging exact SHA aprovado](https://github.com/leon337/multiagent-collaboration-framework/actions/runs/32685810702)

> **Seu pensamento não deve ficar preso ao chat onde aconteceu.**

O Cognitive Ledger preserva e recupera ideias, decisões, aprendizados,
hipóteses, projetos e suas fontes. Na linha de implementação, ele também oferece
uma fronteira cross-chat somente leitura, com busca textual gratuita como
comportamento padrão.

O provider foi integrado somente em `design/cognitive-ledger-foundation`; `main`
continua sendo um bootstrap. O adapter está em `main` do MCF e seu SHA exato passou
em staging, mas a conexão com o Ledger foi desmontada após o lab: a capability
continua `DISCONNECTED`, `INACTIVE` e `LIVE_REQUIRED`. Nenhum Ledger remoto,
OAuth live, produção ou dado real foi autorizado.

## Comece aqui

Leia nesta ordem:

1. [`documentacao/roadmaps/checklist-execucao-cross-chat.md`](documentacao/roadmaps/checklist-execucao-cross-chat.md) — estado atual e próximo passo;
2. [`documentacao/integracao/mcf-mcp-readonly-lab.md`](documentacao/integracao/mcf-mcp-readonly-lab.md) — contrato e evidência exatos do adapter do MCF;
3. [`documentacao/auditorias/2026-08-23-lab-readonly-custo-zero.md`](documentacao/auditorias/2026-08-23-lab-readonly-custo-zero.md) — escopo, evidências e lacunas do lab;
4. [`.mcf/project-capsule.yaml`](.mcf/project-capsule.yaml) — Capsule mínima consumível pelo Context Fabric;
5. [`documentacao/roadmaps/2026-08-21-roadmap-continuidade-cross-chat.md`](documentacao/roadmaps/2026-08-21-roadmap-continuidade-cross-chat.md) — contexto histórico e arquitetura planejada.

## O que está implementado na linha de design

```text
AppModule MCF / adapter read-only
        ↓ MCP Streamable HTTP + Bearer OAuth
MCP tool-only read-only
        ↓ mesmo Bearer
cognitive-ledger-api /v1
        ↓ PostgREST
PostgreSQL 17/pgvector
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

O E2E integrado externo a este repositório comprovou o caminho real
AppModule → MCP → Edge/Auth → PostgREST → PostgreSQL. O consumidor MCF liberou
somente `ler_diario`, `buscar_eventos` e `recuperar_contexto`, bloqueou
`ler_fonte_bruta` antes do MCP e observou 3 operações, 3 auditorias, 0 embeddings,
0 chamadas pagas e 0 persistência do payload de memória no MCF.

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

- nenhuma implantação remota do Cognitive Ledger em lab, staging ou produção foi feita;
- o fluxo browser OAuth authorization-code + PKCE, ChatGPT e uma conexão live não
  foram exercitados; JWT/JWKS, Supabase Auth local e o adapter pelo AppModule MCF
  foram exercitados apenas com credenciais sintéticas descartáveis;
- o Registry central já registra o projeto e `cognitive-ledger.memory.read`, mas a
  capability permanece `DISCONNECTED`, `INACTIVE` e exige verificação live;
- a qualidade do ranking textual ainda precisa de avaliação com corpus sintético maior;
- a remediação do histórico público continua adiada e fora deste escopo.

Auditorias anteriores que descrevem saldo OpenAI, deploys ou estado remoto são
evidência histórica. Elas não substituem verificação live e não criam dependência
financeira para o caminho zero-cost.

## Privacidade

Não adicione Eventos Cognitivos reais, fontes pessoais, senhas, tokens, chaves,
connection strings, verificadores de autenticação ou dumps ao Git. O repositório
foi tratado como público durante esta implementação.
