# Checklist Vivo — Execução Cross-Chat do Cognitive Ledger

**Atualizado em:** 2026-08-22  
**Estado:** `SINCRONIZADO COM A EXECUÇÃO`  
**Função:** painel canônico de progresso da Fase 1 cross-chat.

> Este arquivo é o checklist vivo. O plano detalhado em `documentacao/planos/2026-08-21-acesso-cross-chat-fase-1.md` continua sendo a receita de implementação, mas o estado atual deve ser consultado aqui.

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
Tarefa 3 — OAuth 2.1 do proprietário

ESTADO:
PARADA NO PRIMEIRO GATE HUMANO

PRÓXIMA AÇÃO:
usuário escolher a identidade/e-mail do proprietário no Supabase Auth
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
  - ✅ fonte da Edge Function versionada
  - ✅ suíte Node privada verde
  - ✅ variável residual removida
  - ✅ smoke operacional anterior verificado
  - ✅ Deno 2.9.4 validado por checksum
  - ✅ `deno check supabase/functions/cognitive-ledger-api/index.ts` → exit 0
- ✅ Tarefa 2 — clientes, auditoria e vetores
  - ✅ RED pré-migration comprovado
  - ✅ `vector` habilitado
  - ✅ `pg_trgm` habilitado
  - ✅ `clientes_autorizados` criada
  - ✅ `auditoria_acessos` criada
  - ✅ RLS ativo / 0 policies públicas
  - ✅ `eventos_cognitivos.embedding vector(1024)`
  - ✅ HNSW cosine
  - ✅ `buscar_eventos_hibrido(...)`
  - ✅ pesos 0,60 / 0,25 / 0,15
  - ✅ hard max 12 comprovado
  - ✅ RPC negada a `anon` e `authenticated`
  - ✅ `service_role` autorizado
  - ✅ Security Advisor sem WARN/ERROR novos
  - ✅ migration versionada
- ◆ Tarefa 3 — OAuth 2.1 do proprietário
  - ◆ **GATE HUMANO G3 — Identidade do proprietário**
  - ⬜ assinatura assimétrica/JWKS
  - ⬜ OAuth Server
  - ⬜ consentimento
  - ⬜ validação real do fluxo
- ⬜ Tarefa 4 — autorização Bearer por cliente + auditoria fail-closed
- ⬜ Tarefa 5 — embeddings sem bloquear gravação
- ⬜ Tarefa 6 — API de recuperação cross-chat
- ⬜ Tarefa 7 — MCP remoto tool-only
- ⬜ Tarefa 8 — deploy MCP + conexão ChatGPT
- ⬜ Tarefa 9 — Testes A/B + auditoria final
- ⏸️ Remediação estrutural do histórico público — adiada até validação cross-chat e novo gate

## Evidências principais

### Tarefa 1

- auditoria: `documentacao/auditorias/2026-08-21-tarefa-1-baseline-cross-chat.md`
- `deno check`: `EXIT 0` em checkout temporário do commit `50c31ecba1ca6c4e5bd01cdbaf6ecaf5f390ef43`

### Tarefa 2

- migration: `supabase/migrations/20260821_cross_chat_fase1.sql`
- commit da migration: `73fb5fce12e330d04d45e39577172a2592c1903e`
- auditoria: `documentacao/auditorias/2026-08-22-tarefa-2-schema-cross-chat.md`

## ◆ GATE HUMANO G3 — Identidade do proprietário

**Decisão necessária**  
Escolher explicitamente qual endereço de e-mail será a identidade do proprietário no Supabase Auth.

**Por que precisa de você**  
A identidade que recebe autoridade sobre o Ledger é uma decisão de autoridade do proprietário. A equipe não deve inferir nem selecionar esse e-mail autonomamente.

**Impacto**  
A Tarefa 3 não pode criar/confirmar a identidade do proprietário nem validar o fluxo OAuth real até essa escolha.

## Regra obrigatória de sincronização

Após cada marco verificável:

```text
execução
  ↓
evidência
  ↓
este checklist é atualizado
  ↓
checkpoint/README é alinhado
```

É proibido declarar uma tarefa concluída se este checklist ainda a apresentar como pendente.

## Regra para gates

Nunca apresentar apenas `G1`, `G2`, `G3` ou `G4`. Todo gate deve trazer:

```text
◆ GATE HUMANO <ID> — <nome>

DECISÃO NECESSÁRIA:
...

POR QUE PRECISA DE VOCÊ:
...

IMPACTO:
...
```
