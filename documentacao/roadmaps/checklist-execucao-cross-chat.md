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
EM EXECUÇÃO — G2 PROBE DE AUTHORIZATION CODE + PKCE

GATE G3:
✅ decisão do proprietário recebida
✅ controle da identidade confirmado

IDENTIDADE NO SUPABASE AUTH:
✅ criada por mecanismo suportado de Auth
✅ e-mail confirmado
✅ login registrado

OAUTH SERVER:
✅ Site URL alinhada ao domínio privado
✅ Redirect URL /oauth/consent permitida
✅ OAuth 2.1 Server habilitado
✅ Authorization Path /oauth/consent
✅ Dynamic OAuth Apps habilitado
✅ discovery HTTP 200
✅ registro dinâmico HTTP 201
✅ /oauth/authorize → HTTP 302 para /oauth/consent com authorization_id

PRÓXIMA AÇÃO:
executar o G2 probe real; o proprietário precisa autenticar-se/autorizar o cliente OAuth de teste na tela de consentimento.
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
  - ✅ identidade criada no Supabase Auth por Magic Link/OTP
  - ✅ **GATE HUMANO — Confirmar controle da identidade: concluído**
  - ✅ e-mail confirmado e login registrado no Supabase Auth
  - ✅ assinatura assimétrica `ES256 / P-256` confirmada no JWKS
  - ✅ OIDC discovery acessível
  - ✅ `mcp/src/oauth.mjs` versionado
  - ✅ UI mínima de consentimento versionada
  - ✅ login passwordless + consentimento integrados ao diário privado
  - ✅ TDD servidor: RED 6/8 → GREEN 8/8
  - ✅ suíte combinada OAuth/servidor: 13/13 PASS
  - ✅ deploy Render `dep-da4kg9uk1f9s73ekkrpg` → `live`
  - ✅ startup smoke: API operacional validada / serviço ativo
  - ✅ boundary HTTP Basic preservada (`/login` sem credencial → HTTP 401)
  - ❓ smoke autenticado de `/login` e `/oauth/consent`: ainda depende do fluxo real
  - ✅ Site URL alterada de localhost para o domínio privado do diário
  - ✅ Redirect URL exata `/oauth/consent` cadastrada
  - ✅ OAuth Server habilitado
  - ✅ Authorization Path `/oauth/consent`
  - ✅ Dynamic OAuth Apps habilitado
  - ✅ OAuth discovery → HTTP 200
  - ✅ `/oauth/authorize` não retorna mais `feature_disabled`
  - ✅ dynamic client registration → HTTP 201
  - ✅ authorization request → HTTP 302 para `/oauth/consent` com `authorization_id`
  - 🟡 **GATE HUMANO G2 PROBE — aprovar autorização OAuth do cliente de teste**
  - ⬜ trocar authorization code por access/refresh token via PKCE
  - ⬜ validar `client_id` no access token
  - ⬜ validar refresh token
  - ⬜ validar revogação do grant
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

### Tarefa 3

- auditoria parcial: `documentacao/auditorias/2026-08-22-tarefa-3-oauth-parcial.md`
- configuração OAuth: commit `8aab9fec85fffb1cd6a5c1c628fb5dd65e51760d`
- consentimento + testes: commit `4fb72e87b8875e828a9c84576b65784b4d563ec2`
- `POST /auth/v1/otp`: HTTP 200
- identidade privada criada no Auth: `VERIFICADO`, valor não versionado
- confirmação da identidade: `VERIFICADA`
- login da identidade: `VERIFICADO`
- integração login/consentimento: commit `c2e322a38677eb0d269eddd019b319575ab981c1`
- TDD: RED 6/8; GREEN servidor 8/8; suíte combinada 13/13 PASS
- deploy privado: `dep-da4kg9uk1f9s73ekkrpg` → `live`
- boundary privada: `/login` sem Basic auth → HTTP 401
- JWKS: HTTP 200 / ES256 P-256
- OIDC discovery: HTTP 200
- OAuth authorization-server discovery: HTTP 200
- authorization endpoint sem parâmetros: HTTP 400 `client_id is required`, comprovando que o servidor está ativo
- dynamic registration endpoint anunciado no discovery
- cliente público de probe criado por dynamic registration: HTTP 201
- authorization request válida: HTTP 302 para o domínio privado `/oauth/consent` com `authorization_id`

## ◆ GATE HUMANO G2 PROBE — Autorizar o cliente OAuth de teste

**AÇÃO NECESSÁRIA**  
Abrir a solicitação OAuth de teste preparada pela equipe, autenticar-se pelo fluxo passwordless se solicitado e, na tela de consentimento, aprovar o cliente `Cognitive Ledger MCP G2 Probe`.

**POR QUE PRECISA DE VOCÊ**  
OAuth exige consentimento explícito do proprietário. A equipe não deve aprovar acesso ao Ledger em seu nome.

**IMPACTO**  
Sem a aprovação, não é possível provar end-to-end a emissão do authorization code, a troca PKCE por access/refresh token e a presença do `client_id` no token.

**SEGURANÇA DO PROBE**  
O callback usa um túnel HTTPS temporário controlado pela execução e troca o código automaticamente. O usuário não deve copiar nem enviar authorization code, access token ou refresh token para a conversa.

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
◆ GATE HUMANO <ID opcional> — <nome>

AÇÃO/DECISÃO NECESSÁRIA:
...

POR QUE PRECISA DE VOCÊ:
...

IMPACTO:
...
```