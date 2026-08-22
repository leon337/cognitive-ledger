# Checklist Vivo — Execução Cross-Chat do Cognitive Ledger

**Atualizado em:** 2026-08-22  
**Estado:** `SINCRONIZADO COM A EXECUÇÃO`  
**Função:** painel canônico de progresso da Fase 1 cross-chat.

> O plano detalhado em `documentacao/planos/2026-08-21-acesso-cross-chat-fase-1.md` continua sendo a receita de implementação. Este arquivo representa o estado real e mutável da execução.

## Legenda

```text
✅ concluído / validado
🟡 em execução
❗ bloqueado
❓ não verificado
⬜ não iniciado
⏸️ adiado
◆ gate humano
```

## Estado atual

```text
FASE:
Fase 1 — Continuidade Cross-Chat

TAREFA ATUAL:
Tarefa 5 — Indexação semântica multilíngue

ESTADO:
EM EXECUÇÃO — G4 RESOLVIDO

TAREFA 3:
✅ OAuth 2.1 validado end-to-end
✅ G2 PASS

TAREFA 4:
✅ implementação concluída
✅ TDD GREEN 9/9
✅ deno check PASS
✅ código versionado
⚠ runtime de produção ainda não recebeu esta versão da Edge Function

GATE HUMANO G4:
✅ `OPENAI_API_KEY` configurada em Edge Function Secrets pelo proprietário
✅ valor não exposto em Git/documentação/conversa

PRÓXIMA AÇÃO:
executar Tarefa 5 em RED → GREEN → REFACTOR, validar embedding real, indexação em background e backfill sem bloquear a gravação.
```

## Roadmap sincronizado

- ✅ Fundação conceitual e modelo de Evento Cognitivo
- ✅ Persistência operacional Supabase/Postgres
- ✅ Diário privado operacional
- ✅ Separação senha humana × credencial interna
- ✅ Especificação cross-chat Fase 1 aprovada
- ✅ Plano de implementação cross-chat aprovado
- ✅ Bootstrap da `main` corrigido e validado
- ✅ Tarefa 1 — baseline da API
  - ✅ Deno 2.9.4 validado por checksum
  - ✅ `deno check supabase/functions/cognitive-ledger-api/index.ts` → exit 0
- ✅ Tarefa 2 — clientes, auditoria e vetores
  - ✅ `vector` e `pg_trgm`
  - ✅ `clientes_autorizados`
  - ✅ `auditoria_acessos`
  - ✅ RLS ativo / 0 policies públicas
  - ✅ `embedding vector(1024)`
  - ✅ HNSW cosine
  - ✅ `buscar_eventos_hibrido(...)`
  - ✅ Security Advisor sem WARN/ERROR novos
- ✅ Tarefa 3 — OAuth 2.1 do proprietário
  - ✅ G3 — identidade do proprietário escolhida
  - ✅ identidade criada e confirmada no Supabase Auth
  - ✅ login registrado
  - ✅ JWKS `ES256 / P-256`
  - ✅ OIDC discovery
  - ✅ OAuth Server habilitado
  - ✅ Authorization Path `/oauth/consent`
  - ✅ Dynamic OAuth Apps habilitado
  - ✅ dynamic client registration → HTTP 201
  - ✅ authorize → consent com `authorization_id`
  - ✅ G2 probe real concluído
  - ✅ authorization code exchange
  - ✅ `client_id` validado no token
  - ✅ issuer/audience validados
  - ✅ UserInfo validado
  - ✅ refresh token validado
  - ✅ UserInfo após refresh validado
- ✅ Tarefa 4 — autorização Bearer por cliente + auditoria fail-closed
  - ✅ RED válido: 1 PASS / 7 FAIL
  - ✅ GREEN final: 9 PASS / 0 FAIL
  - ✅ `/v1/*` exige Bearer e rejeita Basic
  - ✅ `iss`, `aud`, `exp`, `sub`, `client_id` validados
  - ✅ token validado pelo Supabase Auth antes do uso das claims
  - ✅ owner divergente → 403
  - ✅ primeiro cliente recebe somente capacidades padrão de leitura
  - ✅ `ler_fonte_bruta` não é capacidade padrão
  - ✅ cliente inativo/revogado/sem capacidade → 403
  - ✅ revogação isolada por cliente
  - ✅ auditoria fail-closed → 503 sem vazamento de conteúdo
  - ✅ `/timeline` e `/registros` permanecem Basic legado
  - ✅ Bearer não ganha escrita
  - ✅ `deno check` da API → PASS
  - ✅ suíte Node OAuth/servidor privado → 13/13 PASS
  - ✅ código e testes versionados
  - ❓ runtime da Edge Function ainda não atualizado com esta versão
- 🟡 Tarefa 5 — embeddings sem bloquear gravação
  - ✅ **GATE HUMANO G4 — chave da OpenAI configurada com segurança**
  - ⬜ texto determinístico para embeddings
  - ⬜ `text-embedding-3-large` / `dimensions=1024`
  - ⬜ indexação em background sem bloquear gravação
  - ⬜ `/admin/reindexar` Basic-only
  - ⬜ backfill dos eventos atuais
  - ⬜ teste de degradação sem quebrar `POST /registros`
- ⬜ Tarefa 6 — API de recuperação cross-chat
- ⬜ Tarefa 7 — MCP remoto tool-only
- ⬜ Tarefa 8 — deploy MCP + conexão ChatGPT
- ⬜ Tarefa 9 — Testes A/B + auditoria final
- ⏸️ Remediação estrutural do histórico público — adiada até validação cross-chat e novo gate

## Evidências principais

### Tarefa 1

- auditoria: `documentacao/auditorias/2026-08-21-tarefa-1-baseline-cross-chat.md`
- `deno check`: `EXIT 0`

### Tarefa 2

- migration: `supabase/migrations/20260821_cross_chat_fase1.sql`
- commit da migration: `73fb5fce12e330d04d45e39577172a2592c1903e`
- auditoria: `documentacao/auditorias/2026-08-22-tarefa-2-schema-cross-chat.md`

### Tarefa 3

- auditoria parcial: `documentacao/auditorias/2026-08-22-tarefa-3-oauth-parcial.md`
- auditoria final G2: `documentacao/auditorias/2026-08-22-tarefa-3-oauth-g2-final.md`
- OAuth Server + DCR: validados
- G2 probe final: `PASS` end-to-end
- resultado técnico: exchange, `client_id`, issuer/audience, UserInfo, refresh e UserInfo pós-refresh validados

### Tarefa 4

- auditoria: `documentacao/auditorias/2026-08-22-tarefa-4-autorizacao-bearer-auditoria.md`
- `deno check supabase/functions/cognitive-ledger-api/index.ts` → PASS
- Deno tests → `9 passed | 0 failed`
- Node OAuth/servidor → `13/13 PASS`
- boundary de runtime: `NÃO IMPLANTADA AINDA`

### Tarefa 5

- G4: `OPENAI_API_KEY` configurada em Edge Function Secrets pelo proprietário; valor não registrado em Git.

## Regra obrigatória de execução contínua

Enquanto existir plano aprovado e nenhum Gate Humano real tiver sido atingido:

```text
executar
  ↓
testar
  ↓
corrigir
  ↓
versionar
  ↓
auditar
  ↓
sincronizar este checklist + README/checkpoint
  ↓
continuar automaticamente
```

Falha técnica não é Gate Humano. A execução só para por decisão exclusiva do proprietário, segredo/credencial que ele precise fornecer, ação destrutiva/irreversível não autorizada, mudança relevante de arquitetura/escopo ou bloqueio irresolúvel com as ferramentas disponíveis.

## Regra para gates

Nunca apresentar apenas `G1`, `G2`, `G3` ou `G4`. Todo gate deve trazer:

```text
◆ GATE HUMANO <ID opcional> — <nome>

AÇÃO/DECISÃO NECESSÁRIA:
...

POR QUE PRECISA DE VOCÊ:
...

IMPACTO:
...
```