# Cognitive Ledger

> **START HERE — porta de entrada canônica para humanos e IAs**

**Estado atual:** `FASE 1 — CONTINUIDADE CROSS-CHAT / EM EXECUÇÃO`  
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
- auditorias, decisões, recomendações, roadmap e runbooks operacionais;
- documentação do princípio de continuidade e consciência situacional para humanos e IAs.

A branch operacional avançou substancialmente além da linha-base inicial da `main`. Quando a diferença exata de commits for relevante, ela deve ser consultada no GitHub em tempo real, não fixada neste documento.

O estado mutável de deploy/serviços deve sempre ser verificado quando necessário. Este README descreve o **checkpoint documental atual**, não substitui evidência de runtime.

---

## 2. Fase atual

### Objetivo vigente

Concluir a **Fase 1 de acesso cross-chat** para que um novo chat autorizado consiga consultar o Cognitive Ledger e recuperar contexto sem depender da conversa original.

Arquitetura-alvo da Fase 1:

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
| Diário privado operacional | ✅ Implementado anteriormente e documentado |
| Separação senha humana × credencial interna | ✅ Implementada |
| Especificação cross-chat Fase 1 | ✅ Aprovada |
| Plano de implementação cross-chat | ✅ Aprovado |
| Tarefa 1 — baseline da API | 🟡 Operacionalmente concluída / verificação Deno pendente |
| Tarefa 2 — clientes, auditoria e vetores | ⬜ Não iniciada |
| Tarefa 3 — OAuth | ⬜ Não iniciada |
| Tarefa 4 — autorização por cliente | ⬜ Não iniciada |
| Tarefa 5 — embeddings | ⬜ Não iniciada |
| Tarefa 6 — API de recuperação | ⬜ Não iniciada |
| Tarefa 7 — MCP remoto | ⬜ Não iniciada |
| Tarefa 8 — conexão ChatGPT | ⬜ Não iniciada |
| Tarefa 9 — Testes A/B e auditoria final | ⬜ Não iniciada |
| Remediação estrutural do histórico público | ⏸️ Adiada por decisão explícita |

### Bloqueio / item não verificado atual

```text
? deno check supabase/functions/cognitive-ledger-api/index.ts
```

Ainda não há evidência verde suficiente para declarar esse check concluído.

### Próximo passo verificável

> Executar/observar o GitHub Actions com o repositório público temporariamente e obter evidência real de que `deno check supabase/functions/cognitive-ledger-api/index.ts` termina com sucesso.

Depois disso, fechar formalmente a Tarefa 1 e iniciar a Tarefa 2.

---

## 4. Roadmap visual

```text
✅ Fundação e modelo cognitivo
✅ Persistência operacional
✅ Diário privado
✅ Especificação cross-chat
✅ Plano de implementação
🟡 Tarefa 1 — baseline / Deno check
⬜ Tarefa 2 — clientes, auditoria e vetores
⬜ Tarefa 3 — OAuth 2.1
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
- **06:28** — pendência residual de credencial é registrada e depois resolvida.
- **07:37** — decisão de não hospedar o MCP na VPS nesta fase.
- **08:46** — repositório tornado público temporariamente para destravar CI.
- **09:26** — remediação destrutiva do histórico adiada para preservar rastreabilidade.
- **21:26** — continuidade cross-chat passa a ser prioridade sobre a remediação estrutural do Git.
- **22:36** — roadmap canônico + runbook de leitura/gravação são formalizados.

### 2026-08-22

- **02:11** — aprendizado: a porta de entrada do projeto precisa revelar deterministicamente o estado real.
- **02:12** — aprendizado: timeline, roadmap visual e estado explícito são necessários para consciência situacional e autonomia de decisão.
- **02:13** — síntese: todo projeto deve tornar sua continuidade observável para humanos e IAs.
- **02:25** — novo aprendizado por falha de execução: registrar o princípio sem aplicá-lo à `main` não resolve discoverability; nasce o **Bootstrap Test** como critério de aceite.

---

## 6. Documentos canônicos — leia nesta ordem

### 1. Roadmap de continuidade cross-chat

[Roadmap Canônico — Continuidade Cross-Chat](https://github.com/leon337/cognitive-ledger/blob/design/cognitive-ledger-foundation/documentacao/roadmaps/2026-08-21-roadmap-continuidade-cross-chat.md)

Contém:

- história do projeto;
- estado atual;
- Tarefas 1–9;
- runbook de gravação;
- runbook de leitura;
- gates;
- checkpoint;
- instruções de bootstrap para outro chat.

### 2. Princípio de continuidade e consciência situacional

[Padrão de Continuidade e Consciência Situacional de Projetos](https://github.com/leon337/cognitive-ledger/blob/design/cognitive-ledger-foundation/documentacao/principios/2026-08-22-continuidade-e-consciencia-situacional-de-projetos.md)

Registra:

- bootstrap/discoverability;
- timeline;
- roadmap visual;
- estado atual;
- decisão/gates;
- visão humana;
- contexto estruturado para IA.

### 3. Auditoria da falha de bootstrap da `main`

[Falha de Bootstrap da main e Correção do Critério de Continuidade](https://github.com/leon337/cognitive-ledger/blob/design/cognitive-ledger-foundation/documentacao/auditorias/2026-08-22-falha-bootstrap-main-e-correcao.md)

Registra o erro de execução, o aprendizado e o **Bootstrap Test**.

### 4. Especificação da Fase 1

[Especificação — Acesso Cross-Chat Fase 1](https://github.com/leon337/cognitive-ledger/blob/design/cognitive-ledger-foundation/documentacao/especificacoes/2026-08-21-acesso-cross-chat-fase-1.md)

### 5. Plano de implementação

[Plano — Acesso Cross-Chat Fase 1](https://github.com/leon337/cognitive-ledger/blob/design/cognitive-ledger-foundation/documentacao/planos/2026-08-21-acesso-cross-chat-fase-1.md)

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

Quando um chat disser que “leu o diário”, deve existir um mecanismo real de acesso ao Ledger e evidência compatível.

---

## 8. Como um humano deve continuar o projeto

1. Comece por este README.
2. Abra a branch [`design/cognitive-ledger-foundation`](https://github.com/leon337/cognitive-ledger/tree/design/cognitive-ledger-foundation).
3. Leia o [Roadmap Canônico](https://github.com/leon337/cognitive-ledger/blob/design/cognitive-ledger-foundation/documentacao/roadmaps/2026-08-21-roadmap-continuidade-cross-chat.md).
4. Localize o checkpoint atual.
5. Confirme o item `NÃO VERIFICADO` antes de avançar.
6. Execute o próximo passo verificável.
7. Não reabra frentes adiadas sem novo gate humano.

---

## 9. Bootstrap obrigatório para IA / agentes

Se você é uma IA ou agente recebendo apenas este repositório como contexto:

1. **Não trate a `main` como implementação completa.** Ela é a porta de entrada; a branch operacional ativa está indicada acima.
2. Leia o roadmap canônico integralmente antes de continuar uma missão relevante.
3. Identifique `fase`, `tarefa atual`, `bloqueios`, `gates`, `evidências` e `next action`.
4. Se possuir acesso operacional ao Cognitive Ledger, consulte os Eventos Cognitivos relacionados ao checkpoint.
5. Se **não** possuir acesso operacional ao Ledger, declare `NÃO DISPONÍVEL / NÃO VERIFICADO` e não finja ter consultado o diário.
6. Preserve a distinção entre **memória recuperada** e **análise nova**.
7. Não transforme ausência de evidência em conclusão.
8. Não execute rewrite, force-push destrutivo, migração do MCP para VPS ou escrita cross-chat sem autorização correspondente.
9. Continue do próximo passo verificável, não da primeira tarefa do projeto.

### Bootstrap Test

Partindo somente desta página, um humano ou IA deve conseguir descobrir:

```text
✅ estado atual
✅ branch operacional
✅ roadmap
✅ timeline / checkpoint
✅ source of truth
✅ tarefa atual
✅ item não verificado
✅ próximo passo
✅ gates / decisões adiadas
✅ instruções de continuidade
```

Se qualquer um desses elementos não puder ser encontrado a partir da `main`, a continuidade do projeto deve ser considerada **incompleta**.

---

## 10. Privacidade e visibilidade

O repositório está **público temporariamente** por decisão operacional para permitir continuidade das validações de CI.

Isso **não** autoriza publicação de:

- diário canônico privado;
- fontes brutas pessoais;
- senhas;
- tokens;
- API keys;
- secrets;
- connection strings reais;
- verificadores de autenticação;
- dumps ou snapshots privados.

Novos registros cognitivos reais devem permanecer no armazenamento privado operacional.

A remediação estrutural do histórico público está **adiada, não resolvida**, e deverá voltar a HUMAN_GATE depois da validação cross-chat.

---

## 11. Relação com o MCF

O Cognitive Ledger e o MCF continuam sendo projetos distintos.

O princípio de continuidade e consciência situacional foi identificado como **transversal** e deverá ser planejado futuramente também para o MCF, permitindo que o MESTRE recupere estado, roadmap, timeline, decisões, gates e evidências antes de orquestrar missões relacionadas a projetos existentes.

Essa integração ainda **não foi implementada**.

---

## 12. Resumo de retomada rápida

```text
PROJETO:
Cognitive Ledger

FASE:
Fase 1 — Continuidade Cross-Chat

BRANCH OPERACIONAL:
design/cognitive-ledger-foundation

TAREFA ATUAL:
Tarefa 1 — baseline da API

ESTADO:
operacionalmente concluída / Deno check não comprovado

PRÓXIMO PASSO:
obter evidência real do deno check via CI

DEPOIS:
Tarefa 2 — clientes, auditoria e vetores

FONTE OPERACIONAL DO DIÁRIO:
Supabase/Postgres

PRIORIDADE:
concluir acesso cross-chat

ADIADO:
remediação estrutural do histórico público
```
