# Auditoria — Tarefa 2 da Fase 1 Cross-Chat

**Data:** 2026-08-22  
**Tarefa:** Schema de identidade de clientes, auditoria e vetores  
**Estado:** `CONCLUÍDA / VALIDADA`

## 1. RED — estado anterior à migration

Antes da migration foi comprovado:

```text
clientes_autorizados: não existe
auditoria_acessos:    não existe
eventos_cognitivos.embedding: não existe
vector:                não habilitado
pg_trgm:               não habilitado
```

Resultado: `RED PASS`.

## 2. Migration aplicada

Migration Supabase aplicada pelo mecanismo próprio de migrations:

`cross_chat_fase1`

Arquivo versionado:

`supabase/migrations/20260821_cross_chat_fase1.sql`

Commit do arquivo:

`73fb5fce12e330d04d45e39577172a2592c1903e`

A migration criou/habilitou:

- extensão `vector`;
- extensão `pg_trgm`;
- `public.clientes_autorizados`;
- `public.auditoria_acessos`;
- `eventos_cognitivos.embedding vector(1024)`;
- `embedding_model`;
- `embedding_atualizado_em`;
- índice HNSW cosine;
- RPC `public.buscar_eventos_hibrido(...)`.

## 3. Ranking híbrido

A RPC aplica:

```text
semântico  0,60
textual    0,25
recência   0,15
```

Regras verificadas na definição:

- hard max 12;
- default 8;
- embedding ausente gera componente semântico zero;
- filtros estruturados são aplicados antes do ranking;
- sem filtro exato, score total abaixo de 0,30 não é devolvido como evidência recuperada.

## 4. GREEN estrutural

Após migration foi comprovado:

```text
clientes_autorizados existe: true
auditoria_acessos existe: true
RLS clientes: true
RLS auditoria: true
policies públicas novas: 0
vector habilitado: true
pg_trgm habilitado: true
embedding: vector(1024)
HNSW existe: true
RPC existe: true
```

## 5. Boundary de permissões

Foi comprovado:

```text
anon EXECUTE RPC: false
authenticated EXECUTE RPC: false
service_role EXECUTE RPC: true

anon SELECT clientes_autorizados: false
authenticated SELECT auditoria_acessos: false
service_role SELECT clientes_autorizados: true
```

As duas novas tabelas permanecem backend-only.

## 6. Teste comportamental mínimo

Foi solicitado `limite=99` com filtro exato de projeto.

Resultado: `12` registros.

Isso comprova o hard max de 12.

Uma consulta textual sem embedding e sem filtro que não atingiu o limiar 0,30 retornou zero resultados. Esse comportamento é conservador e compatível com `evidencia_insuficiente` planejada para a camada de API.

## 7. Security Advisor

Pós-DDL:

- `WARN`: 0;
- `ERROR`: 0;
- apenas `INFO` `rls_enabled_no_policy` para tabelas backend-only, inclusive as novas; esse estado é intencional nesta fase.

Remediação de referência do linter: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy

## 8. Performance Advisor

Um `INFO` de `unused_index` foi emitido para o HNSW recém-criado. Isso é esperado antes da geração de embeddings e consultas vetoriais reais.

Referência: https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index

## 9. Critério de aceite

- schema para owner + clientes: `VERIFICADO`;
- auditoria: `VERIFICADA E FECHADA AO BACKEND`;
- vetor 1024: `VERIFICADO`;
- HNSW: `VERIFICADO`;
- ranking híbrido: `CRIADO`;
- hard max 12: `VERIFICADO`;
- execução pública da RPC: `NEGADA`;
- regressão Security Advisor WARN/ERROR: `NÃO OBSERVADA`.

**Tarefa 2:** `CONCLUÍDA / VALIDADA`.

## 10. Próximo passo

A próxima tarefa é a Tarefa 3 — OAuth 2.1 do proprietário e consentimento MCP.

Ela começa por um Gate Humano e, portanto, a execução deve parar antes de criar/confirmar a identidade do proprietário.

### ◆ GATE HUMANO G3 — Identidade do proprietário

**Decisão necessária:** escolher explicitamente qual endereço de e-mail representará o proprietário no Supabase Auth.

**Por que precisa do usuário:** identidade e autoridade do proprietário não podem ser inferidas pela equipe.

**Impacto:** sem essa escolha, a Tarefa 3 não pode iniciar o fluxo real de autenticação OAuth do proprietário.
