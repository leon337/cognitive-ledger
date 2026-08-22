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
❗ BLOQUEADA NO BACKFILL — GATE HUMANO DE SALDO/CRÉDITO OPENAI

G4 — CHAVE DA OPENAI:
✅ resolvido
✅ OPENAI_API_KEY configurada em Edge Function Secrets

IMPLEMENTAÇÃO DA TAREFA 5:
✅ texto determinístico
✅ text-embedding-3-large / dimensions=1024
✅ indexação em background sem bloquear gravação
✅ /admin/reindexar Basic-only
✅ Edge Function v6 ativa
✅ telemetria segura
✅ Deno/Node GREEN

BACKFILL REAL:
❌ 0 de 25 eventos indexados
✅ causa comprovada: openai_embedding_http_429_credit_balance_exhausted
✅ executor automático desligado enquanto o gate está aberto

PRÓXIMA AÇÃO:
o proprietário disponibiliza saldo/crédito utilizável para a OpenAI API; depois a equipe reativa o backfill, valida 100% do corpus e continua automaticamente para a Tarefa 6.
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
  - ✅ G3 — identidade do proprietário escolhida e confirmada
  - ✅ JWKS `ES256 / P-256`
  - ✅ OIDC discovery
  - ✅ OAuth Server habilitado
  - ✅ Authorization Path `/oauth/consent`
  - ✅ Dynamic OAuth Apps habilitado
  - ✅ dynamic client registration → HTTP 201
  - ✅ G2 probe end-to-end
  - ✅ authorization code exchange
  - ✅ `client_id`, issuer/audience, UserInfo e refresh validados
- ✅ Tarefa 4 — autorização Bearer por cliente + auditoria fail-closed
  - ✅ RED válido
  - ✅ GREEN 9/9
  - ✅ `/v1/*` exige Bearer e rejeita Basic
  - ✅ `iss`, `aud`, `exp`, `sub`, `client_id` validados
  - ✅ owner/capacidades/revogação
  - ✅ auditoria fail-closed
  - ✅ Basic legado preservado
  - ✅ Bearer não ganha escrita
  - ✅ runtime incluído na Edge Function atualmente implantada
- ❗ Tarefa 5 — embeddings sem bloquear gravação
  - ✅ G4 — chave da OpenAI configurada com segurança
  - ✅ texto determinístico para embeddings
  - ✅ `text-embedding-3-large` / `dimensions=1024`
  - ✅ indexação em background sem bloquear gravação
  - ✅ `/admin/reindexar` Basic-only
  - ✅ teste de degradação sem quebrar `POST /registros`
  - ✅ executor privado de backfill
  - ✅ Edge Function v6 ativa
  - ✅ diagnóstico seguro do provedor
  - ❌ backfill: 0/25
  - ◆ **GATE HUMANO — Saldo/crédito da OpenAI API**
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
- G2 probe: PASS end-to-end

### Tarefa 4

- auditoria: `documentacao/auditorias/2026-08-22-tarefa-4-autorizacao-bearer-auditoria.md`
- Deno Tarefa 4: `9 passed / 0 failed`
- runtime incorporado à Edge Function implantada nas versões posteriores

### Tarefa 5

- auditoria: `documentacao/auditorias/2026-08-22-tarefa-5-embeddings-bloqueio-credito.md`
- Edge Function: versão 6 `ACTIVE`
- `verify_jwt=false` preservado por autenticação customizada Basic/OAuth
- testes Deno após instrumentação: `15 passed / 0 failed`
- teste específico do código estruturado do provedor: `7 passed / 0 failed`
- executor privado Node: `9 passed / 0 failed`
- banco antes do backfill: 25 eventos / 0 embeddings
- backfill real: 0 processados / 25 falhas
- causa comprovada: `openai_embedding_http_429_credit_balance_exhausted`
- `COGNITIVE_LEDGER_REINDEXAR_NO_STARTUP=0` após diagnóstico

## ◆ GATE HUMANO — Saldo/crédito da OpenAI API

**AÇÃO NECESSÁRIA**  
Disponibilizar saldo/crédito utilizável para a conta/projeto OpenAI associado à `OPENAI_API_KEY` configurada no Supabase.

**POR QUE PRECISA DE VOCÊ**  
O provedor respondeu `credit_balance_exhausted`. Alterar billing, método de pagamento ou aquisição de créditos envolve autoridade financeira do proprietário.

**IMPACTO**  
Sem saldo disponível, o código de embeddings permanece funcional e testado, mas o backfill real não pode produzir vetores e a Tarefa 5 não pode ser encerrada.

**RETOMADA AUTOMÁTICA APÓS O GATE**  
Reativar temporariamente o executor → executar backfill → verificar 100% dos embeddings/modelo → desligar executor → fechar Tarefa 5 → iniciar Tarefa 6.

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

Nunca apresentar apenas um código. Todo gate deve trazer:

```text
◆ GATE HUMANO <ID opcional> — <nome>

AÇÃO/DECISÃO NECESSÁRIA:
...

POR QUE PRECISA DE VOCÊ:
...

IMPACTO:
...
```
