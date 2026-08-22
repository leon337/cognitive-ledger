# Cognitive Ledger

> **START HERE — porta de entrada canônica para humanos e IAs**

**Estado atual:** `FASE 1 — CONTINUIDADE CROSS-CHAT / TAREFA 3 OAUTH EM EXECUÇÃO`  
**Branch operacional ativa:** [`design/cognitive-ledger-foundation`](https://github.com/leon337/cognitive-ledger/tree/design/cognitive-ledger-foundation)  
**Natureza da `main`:** entrypoint de continuidade e navegação; a implementação ativa ainda não foi mergeada integralmente aqui.

O Cognitive Ledger é um sistema pessoal de continuidade cognitiva para preservar e recuperar ideias, decisões, aprendizados, hipóteses, projetos e sua evolução ao longo de chats com IA, ferramentas e tempo.

> **Seu pensamento não deve ficar preso ao chat onde aconteceu.**

---

## 1. Onde o projeto realmente está

O projeto **não está mais apenas em discovery inicial**.

Na branch operacional já existem, entre outros componentes:

- modelo de **Evento Cognitivo** e separação entre Registro Cognitivo e Fonte;
- persistência operacional em **Supabase/Postgres**;
- Edge Function `cognitive-ledger-api` com rotas operacionais existentes;
- diário privado servido por Render;
- protótipo público separado dos dados reais;
- autenticação humana separada da credencial interna Render → API;
- especificação e plano aprovados para acesso cross-chat;
- schema cross-chat com clientes, auditoria e vetores;
- OAuth 2.1 em execução com identidade confirmada, consentimento, OAuth Server e dynamic registration;
- auditorias, decisões, recomendações, roadmap, checklist vivo e runbooks operacionais;
- documentação do princípio de continuidade e consciência situacional para humanos e IAs.

A branch operacional avançou substancialmente além da linha-base inicial da `main`. Quando a diferença exata de commits for relevante, ela deve ser consultada no GitHub em tempo real, não fixada neste documento.

O estado mutável de deploy/serviços deve sempre ser verificado quando necessário. Este README descreve o **checkpoint documental atual**, não substitui evidência de runtime.

---

## 2. Fase atual

### Objetivo vigente

Concluir a **Fase 1 de acesso cross-chat** para que um novo chat autorizado consiga consultar o Cognitive Ledger e recuperar contexto sem depender da conversa original.

Arquitetura-alvo:

```text
ChatGPT / MCF
      ↓
OAuth 2.1
      ↓
MCP remoto
      ↓
cognitive-ledger-api
      ↓
Supabase / Postgres
```

A Fase 1 MCP é deliberadamente **somente leitura**.

---

## 3. Estado operacional resumido

| Item | Estado |
|---|---|
| Fundação conceitual do Cognitive Ledger | ✅ Concluída |
| Evento Cognitivo + Fonte + Relações | ✅ Implementado |
| Persistência Supabase/Postgres | ✅ Implementada |
| Diário privado operacional | ✅ Implementado |
| Separação senha humana × credencial interna | ✅ Implementada |
| Especificação cross-chat Fase 1 | ✅ Aprovada |
| Plano de implementação cross-chat | ✅ Aprovado |
| Tarefa 1 — baseline da API | ✅ Concluída / Deno check exit 0 |
| Tarefa 2 — clientes, auditoria e vetores | ✅ Concluída / validada |
| Tarefa 3 — OAuth | 🟡 Em execução / G2 probe |
| Identidade do proprietário | ✅ Confirmada / login registrado |
| Assinatura/JWKS | ✅ ES256 / P-256 validado |
| OAuth Server | ✅ Habilitado |
| Authorization Path | ✅ `/oauth/consent` |
| Dynamic OAuth Apps | ✅ Habilitado / HTTP 201 validado |
| Authorization request | ✅ HTTP 302 → `/oauth/consent` com `authorization_id` |
| Tarefa 4 — autorização por cliente | ⬜ Não iniciada |
| Tarefa 5 — embeddings | ⬜ Não iniciada |
| Tarefa 6 — API de recuperação | ⬜ Não iniciada |
| Tarefa 7 — MCP remoto | ⬜ Não iniciada |
| Tarefa 8 — conexão ChatGPT | ⬜ Não iniciada |
| Tarefa 9 — Testes A/B e auditoria final | ⬜ Não iniciada |
| Remediação estrutural do histórico público | ⏸️ Adiada por decisão explícita |

### Evidência mais recente

```text
Tarefa 1:
deno check supabase/functions/cognitive-ledger-api/index.ts
→ EXIT 0

Tarefa 2:
schema + RLS + vector(1024) + HNSW + RPC híbrida
→ VALIDADO

Tarefa 3:
identidade do proprietário
→ confirmada / login registrado

JWKS
→ HTTP 200 / ES256 P-256

OAuth discovery
→ HTTP 200

dynamic client registration
→ HTTP 201

/oauth/authorize válido
→ HTTP 302
→ domínio privado /oauth/consent
→ authorization_id presente
```

### Próxima ação

> Executar o **G2 probe real de authorization code + PKCE**. O proprietário precisa aprovar explicitamente o cliente OAuth de teste na tela de consentimento.

---

## 4. Roadmap visual

```text
✅ Fundação e modelo cognitivo
✅ Persistência operacional
✅ Diário privado
✅ Especificação cross-chat
✅ Plano de implementação
✅ Tarefa 1 — baseline / Deno check
✅ Tarefa 2 — clientes, auditoria e vetores
🟡 Tarefa 3 — OAuth 2.1 / G2 probe
⬜ Tarefa 4 — autorização Bearer por cliente
⬜ Tarefa 5 — embeddings
⬜ Tarefa 6 — recuperação cross-chat
⬜ Tarefa 7 — servidor MCP
⬜ Tarefa 8 — deploy + ChatGPT
⬜ Tarefa 9 — validação A/B
⏸️ Remediação estrutural do Git após validação cross-chat
```

Legenda:

```text
✅ concluído
🟡 em andamento / pendência de verificação
❗ bloqueado
❓ não verificado
⬜ não iniciado
⏸️ adiado
◆ gate humano
```

### ◆ GATE HUMANO G2 PROBE — Autorizar cliente OAuth de teste

**Ação necessária**  
Abrir a solicitação OAuth de teste preparada pela equipe, autenticar-se se solicitado e aprovar o cliente `Cognitive Ledger MCP G2 Probe`.

**Por que precisa de você**  
OAuth exige consentimento explícito do proprietário. A equipe não deve aprovar acesso em seu nome.

**Impacto**  
Sem essa aprovação, não é possível provar end-to-end a emissão do authorization code, troca PKCE por access/refresh token e presença de `client_id` no token.

**Segurança**  
O callback usa túnel HTTPS temporário e troca o código automaticamente. Não envie authorization code, access token ou refresh token para a conversa.

---

## 5. Timeline resumida — como chegamos aqui

### 2026-08-21

- **00:50** — hipótese do MCF como agência de profissionais virtuais.
- **01:15** — reconhecimento de que a necessidade de continuidade antecede o próprio MCF.
- **01:35** — Cognitive Ledger consolidado como camada externa de continuidade.
- **03:01** — protocolo operacional visível do MCF oficializado.
- **04:29** — primeira validação visual do fluxo do Cognitive Ledger.
- **04:55** — materialização profissional do ecossistema MCF + Cognitive Ledger.
- **06:26** — incidente de senha revela ausência de recuperação e acoplamento de autenticação.
- **07:37** — decisão de não hospedar o MCP na VPS nesta fase.
- **08:46** — repositório tornado público temporariamente para destravar CI.
- **09:26** — remediação destrutiva do histórico adiada para preservar rastreabilidade.
- **21:26** — continuidade cross-chat passa a ser prioridade sobre a remediação estrutural do Git.
- **22:36** — roadmap canônico + runbook de leitura/gravação formalizados.

### 2026-08-22

- **02:11** — bootstrap/discoverability identificado como requisito crítico.
- **02:12** — timeline + roadmap visual + estado explícito identificados como requisito de consciência situacional.
- **02:13** — princípio transversal de continuidade observável consolidado.
- **02:25** — Bootstrap Test adicionado ao critério de aceite.
- **02:38** — correção da `main` confirmada visualmente.
- **02:51** — gates autoexplicativos + sincronização obrigatória do checklist formalizados.
- Tarefa 1 concluída com `deno check` exit 0.
- Tarefa 2 concluída e validada.
- G3 resolvido; identidade criada e controle confirmado no Supabase Auth.
- Login/consentimento integrados ao diário privado e deployados; JWKS ES256 confirmado.
- Site URL e Redirect URL alinhadas ao domínio privado.
- OAuth Server habilitado com `/oauth/consent`.
- Dynamic OAuth Apps habilitado e validado por registro HTTP 201.
- Authorization endpoint validado até a tela de consentimento com `authorization_id`.

---

## 6. Documentos canônicos — leia nesta ordem

### 1. Checklist vivo de execução

[Checklist Vivo — Execução Cross-Chat](https://github.com/leon337/cognitive-ledger/blob/design/cognitive-ledger-foundation/documentacao/roadmaps/checklist-execucao-cross-chat.md)

Este é o **estado canônico de progresso** e deve ser sincronizado depois de cada marco verificável.

### 2. Roadmap de continuidade cross-chat

[Roadmap Canônico — Continuidade Cross-Chat](https://github.com/leon337/cognitive-ledger/blob/design/cognitive-ledger-foundation/documentacao/roadmaps/2026-08-21-roadmap-continuidade-cross-chat.md)

### 3. Princípio de continuidade e consciência situacional

[Padrão de Continuidade e Consciência Situacional de Projetos](https://github.com/leon337/cognitive-ledger/blob/design/cognitive-ledger-foundation/documentacao/principios/2026-08-22-continuidade-e-consciencia-situacional-de-projetos.md)

### 4. Auditorias

- [Tarefa 1 — Baseline Cross-Chat](https://github.com/leon337/cognitive-ledger/blob/design/cognitive-ledger-foundation/documentacao/auditorias/2026-08-21-tarefa-1-baseline-cross-chat.md)
- [Tarefa 2 — Schema Cross-Chat](https://github.com/leon337/cognitive-ledger/blob/design/cognitive-ledger-foundation/documentacao/auditorias/2026-08-22-tarefa-2-schema-cross-chat.md)
- [Tarefa 3 — OAuth — checkpoint parcial](https://github.com/leon337/cognitive-ledger/blob/design/cognitive-ledger-foundation/documentacao/auditorias/2026-08-22-tarefa-3-oauth-parcial.md)

### 5. Especificação e plano

- [Especificação — Acesso Cross-Chat Fase 1](https://github.com/leon337/cognitive-ledger/blob/design/cognitive-ledger-foundation/documentacao/especificacoes/2026-08-21-acesso-cross-chat-fase-1.md)
- [Plano — Acesso Cross-Chat Fase 1](https://github.com/leon337/cognitive-ledger/blob/design/cognitive-ledger-foundation/documentacao/planos/2026-08-21-acesso-cross-chat-fase-1.md)

---

## 7. Fonte de verdade: não confunda Git com o diário operacional

```text
Supabase / Postgres
=
fonte operacional atual dos Eventos Cognitivos
```

```text
GitHub
=
código + documentação + histórico + exportação controlada
```

Ler arquivos Markdown do repositório **não equivale** a consultar o diário operacional atual.

Quando um chat disser que “leu o diário”, deve existir mecanismo real de acesso ao Ledger e evidência compatível.

---

## 8. Como um humano deve continuar o projeto

1. Comece por este README.
2. Abra o [Checklist Vivo](https://github.com/leon337/cognitive-ledger/blob/design/cognitive-ledger-foundation/documentacao/roadmaps/checklist-execucao-cross-chat.md).
3. Abra a branch operacional ativa.
4. Leia o roadmap detalhado quando precisar do contexto completo.
5. Se houver `◆ GATE HUMANO`, leia ação/decisão necessária, motivo e impacto.
6. Não reabra frentes adiadas sem novo gate humano.

---

## 9. Bootstrap obrigatório para IA / agentes

Se você é uma IA ou agente recebendo apenas este repositório como contexto:

1. **Não trate a `main` como implementação completa.**
2. Leia primeiro o **Checklist Vivo** e use-o como estado canônico de progresso.
3. Use o roadmap detalhado para arquitetura, runbooks e histórico ampliado.
4. Identifique `fase`, `tarefa atual`, `bloqueios`, `gates`, `evidências` e `next action`.
5. Se possuir acesso operacional ao Cognitive Ledger, consulte os Eventos Cognitivos relacionados ao checkpoint.
6. Se não possuir acesso operacional, declare `NÃO DISPONÍVEL / NÃO VERIFICADO`.
7. Preserve **memória recuperada** separada da **análise nova**.
8. Não transforme ausência de evidência em conclusão.
9. Nunca apresente um gate somente pelo código; inclua nome humano, ação/decisão necessária, motivo e impacto.
10. Depois de cada marco verificável, sincronize checklist/checkpoint antes de declarar progresso concluído.

### Bootstrap Test

Partindo somente desta página, humano ou IA deve conseguir descobrir:

```text
✅ estado atual
✅ branch operacional
✅ checklist vivo
✅ roadmap
✅ timeline / checkpoint
✅ source of truth
✅ tarefa atual
✅ próximo passo
✅ gate humano atual
✅ instruções de continuidade
```

---

## 10. Privacidade e visibilidade

O repositório está **público temporariamente** por decisão operacional para permitir continuidade das validações de CI.

Isso **não** autoriza publicação de diário canônico privado, fontes brutas pessoais, senhas, tokens, API keys, secrets, connection strings reais, verificadores de autenticação, dumps ou snapshots privados.

Novos registros cognitivos reais devem permanecer no armazenamento privado operacional.

A remediação estrutural do histórico público está **adiada, não resolvida**, e deverá voltar a HUMAN_GATE depois da validação cross-chat.

---

## 11. Relação com o MCF

O Cognitive Ledger e o MCF continuam sendo projetos distintos.

O princípio de continuidade e consciência situacional foi identificado como transversal e deverá ser planejado futuramente também para o MCF. Essa integração ainda **não foi implementada**.

---

## 12. Resumo de retomada rápida

```text
PROJETO:
Cognitive Ledger

FASE:
Fase 1 — Continuidade Cross-Chat

BRANCH OPERACIONAL:
design/cognitive-ledger-foundation

TAREFAS CONCLUÍDAS:
Tarefa 1 — baseline da API
Tarefa 2 — clientes, auditoria e vetores

TAREFA ATUAL:
Tarefa 3 — OAuth 2.1 do proprietário

ESTADO:
EM EXECUÇÃO — G2 PROBE AUTHORIZATION CODE + PKCE

IDENTIDADE DO PROPRIETÁRIO:
✅ confirmada / login registrado

OAUTH SERVER:
✅ habilitado
✅ /oauth/consent
✅ dynamic registration validado

PRÓXIMA AÇÃO:
proprietário aprovar o cliente OAuth de teste no G2 probe

DEPOIS:
trocar code por tokens via PKCE, validar client_id e refresh

FONTE OPERACIONAL DO DIÁRIO:
Supabase/Postgres

PRIORIDADE:
concluir acesso cross-chat

ADIADO:
remediação estrutural do histórico público
```