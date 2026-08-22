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
EM EXECUÇÃO

GATE G3:
✅ decisão do proprietário recebida

PENDÊNCIA OPERACIONAL ATUAL:
criar/confirmar a identidade escolhida no Supabase Auth
por mecanismo suportado de Auth; nenhuma identidade foi criada por SQL direto.

OBSERVAÇÃO:
a tentativa automatizada de disparar Magic Link não alcançou o Auth
por indisponibilidade do transporte remoto da sessão.
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
- 🟡 Tarefa 3 — OAuth 2.1 do proprietário
  - ✅ **GATE HUMANO G3 — Identidade do proprietário: decisão recebida**
  - 🟡 criar/confirmar identidade no Supabase Auth — pendente operacional
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

### Tarefa 3 — G3

- decisão do proprietário: `RECEBIDA`;
- valor da identidade: **não versionado neste repositório público**;
- consulta operacional ao Supabase Auth: identidade ainda inexistente antes da criação;
- política: criar/confirmar somente por mecanismo suportado de Supabase Auth, nunca por `INSERT` direto em `auth.users`.

## Gate G3 — estado

```text
✅ GATE HUMANO G3 — Identidade do proprietário

DECISÃO NECESSÁRIA:
resolvida pelo proprietário.

ESTADO OPERACIONAL:
a identidade ainda precisa ser criada/confirmada no Supabase Auth.

PRIVACIDADE:
o endereço escolhido não entra no Git público.
```

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
