# Cognitive Ledger

**Status:** `FASE 1 — CONTINUIDADE CROSS-CHAT / TAREFA 3 EM EXECUÇÃO`  
**Esta é a branch operacional ativa:** `design/cognitive-ledger-foundation`

> **Seu pensamento não deve ficar preso ao chat onde aconteceu.**

O Cognitive Ledger é um sistema pessoal de continuidade cognitiva para preservar e recuperar ideias, decisões, aprendizados, hipóteses, projetos e sua evolução ao longo de chats com IA, ferramentas e tempo.

## Comece aqui

Se você é humano ou IA retomando este projeto, leia primeiro:

1. [`documentacao/roadmaps/checklist-execucao-cross-chat.md`](documentacao/roadmaps/checklist-execucao-cross-chat.md) — **estado vivo e canônico de progresso**;
2. [`documentacao/roadmaps/2026-08-21-roadmap-continuidade-cross-chat.md`](documentacao/roadmaps/2026-08-21-roadmap-continuidade-cross-chat.md) — história, estado, Tarefas 1–9, runbooks, checkpoint e próximo passo;
3. [`documentacao/principios/2026-08-22-continuidade-e-consciencia-situacional-de-projetos.md`](documentacao/principios/2026-08-22-continuidade-e-consciencia-situacional-de-projetos.md) — bootstrap, timeline, roadmap visual, visão humana e contexto para IA;
4. [`documentacao/auditorias/2026-08-22-falha-bootstrap-main-e-correcao.md`](documentacao/auditorias/2026-08-22-falha-bootstrap-main-e-correcao.md) — erro de discoverability identificado e Bootstrap Test.

## Fase atual

Objetivo vigente:

> concluir a Fase 1 de acesso cross-chat para que um novo chat autorizado consiga consultar o Cognitive Ledger e recuperar contexto sem depender da conversa original.

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

A Fase 1 MCP é **somente leitura**.

## Checkpoint atual

```text
TAREFAS CONCLUÍDAS:
Tarefa 1 — baseline da API
Tarefa 2 — clientes, auditoria e vetores

TAREFA ATUAL:
Tarefa 3 — OAuth 2.1 do proprietário

ESTADO:
EM EXECUÇÃO

G3 — IDENTIDADE DO PROPRIETÁRIO:
✅ decisão recebida
🟡 identidade ainda não criada/confirmada no Supabase Auth

PRÓXIMA AÇÃO:
criar/confirmar a identidade por mecanismo suportado do Supabase Auth
e continuar a preparação do OAuth 2.1.
```

O valor da identidade escolhida é privado e **não deve ser versionado no Git público**.

## Roadmap visual resumido

```text
✅ Fundação e modelo cognitivo
✅ Persistência Supabase/Postgres
✅ Diário privado
✅ Especificação cross-chat
✅ Plano de implementação
✅ Tarefa 1 — baseline / Deno check exit 0
✅ Tarefa 2 — clientes, auditoria e vetores
🟡 Tarefa 3 — OAuth 2.1 / G3 resolvido / identidade Auth pendente
⬜ Tarefa 4 — autorização Bearer por cliente
⬜ Tarefa 5 — embeddings
⬜ Tarefa 6 — API de recuperação
⬜ Tarefa 7 — MCP remoto
⬜ Tarefa 8 — deploy + ChatGPT
⬜ Tarefa 9 — Testes A/B + auditoria
⏸️ Remediação estrutural do Git após validação cross-chat
```

### ✅ GATE HUMANO G3 — Identidade do proprietário

**Decisão necessária**  
Resolvida pelo proprietário.

**Estado operacional**  
A identidade escolhida ainda precisa ser criada/confirmada no Supabase Auth por mecanismo suportado de autenticação. A equipe não fará `INSERT` direto em `auth.users`.

**Privacidade**  
O endereço escolhido permanece fora do Git público.

## Evidências das Tarefas 1 e 2

### Tarefa 1

- [`documentacao/auditorias/2026-08-21-tarefa-1-baseline-cross-chat.md`](documentacao/auditorias/2026-08-21-tarefa-1-baseline-cross-chat.md)
- `deno check supabase/functions/cognitive-ledger-api/index.ts` → `EXIT 0`

### Tarefa 2

- migration: [`supabase/migrations/20260821_cross_chat_fase1.sql`](supabase/migrations/20260821_cross_chat_fase1.sql)
- auditoria: [`documentacao/auditorias/2026-08-22-tarefa-2-schema-cross-chat.md`](documentacao/auditorias/2026-08-22-tarefa-2-schema-cross-chat.md)
- `vector(1024)` + HNSW + RPC híbrida + RLS + permissions boundary: `VALIDADOS`

## Modelo central

Uma conversa é uma fonte. A unidade durável é o **Evento Cognitivo**.

Cada Evento Cognitivo separa:

1. **Registro Cognitivo** — contexto, resumo, ideias, decisões, hipóteses, aprendizados, questões abertas e próximos passos;
2. **Registro de Fonte** — proveniência e, quando necessário e autorizado, conteúdo bruto separado.

O sistema nunca deve apresentar interpretação gerada por IA como se fosse a fonte original.

## Fonte operacional de verdade

```text
Supabase / Postgres
=
fonte operacional atual dos Eventos Cognitivos
```

```text
Git
=
código + documentação + histórico + exportação controlada
```

Ler `diario/*.md` no Git não equivale a consultar o diário operacional atual.

## Como gravar no diário hoje

Quando houver acesso operacional autorizado e o usuário disser “registre isso no meu diário”:

```text
intenção explícita
      ↓
resolver escopo
      ↓
criar Evento Cognitivo
      ↓
separar Fonte
      ↓
criar relações
      ↓
persistir por registrar_evento_cognitivo(...)
      ↓
ler de volta
      ↓
verificar
      ↓
somente então confirmar
```

O runbook completo está no roadmap canônico.

## Como ler o diário hoje

Quando houver acesso operacional autorizado:

```text
identificar intenção
      ↓
consultar Supabase/Postgres
      ↓
recuperar conjunto relevante
      ↓
consultar relações quando necessário
      ↓
preservar hipótese/decisão/questão aberta
      ↓
separar MEMÓRIA RECUPERADA de ANÁLISE NOVA
```

Se a sessão não possuir acesso operacional real, declarar `NÃO DISPONÍVEL / NÃO VERIFICADO` e não fingir consulta.

## Timeline resumida

### 2026-08-21

- 01:35 — Cognitive Ledger consolidado como camada externa de continuidade;
- 03:01 — protocolo operacional visível do MCF oficializado;
- 04:29 — primeira validação visual;
- 06:26 — incidente de autenticação revela acoplamento;
- 07:37 — MCP permanece fora da VPS nesta fase;
- 08:46 — repositório público temporariamente para CI;
- 09:26 — remediação do histórico público adiada;
- 21:26 — prioridade cross-chat reafirmada;
- 22:36 — roadmap canônico + runbook formalizados.

### 2026-08-22

- 02:11 — bootstrap/discoverability identificado como requisito crítico;
- 02:12 — timeline + roadmap visual + estado explícito identificados como requisito de consciência situacional;
- 02:13 — princípio transversal de continuidade observável consolidado;
- 02:25 — Bootstrap Test adicionado ao critério de aceite;
- 02:38 — correção da `main` confirmada visualmente;
- 02:51 — gates autoexplicativos + sincronização obrigatória do checklist formalizados;
- Tarefa 1 concluída com `deno check` exit 0;
- Tarefa 2 concluída e validada;
- Gate Humano G3 resolvido; valor da identidade preservado fora do Git.

## Documentação operacional principal

- [`documentacao/roadmaps/checklist-execucao-cross-chat.md`](documentacao/roadmaps/checklist-execucao-cross-chat.md)
- [`documentacao/especificacoes/2026-08-21-acesso-cross-chat-fase-1.md`](documentacao/especificacoes/2026-08-21-acesso-cross-chat-fase-1.md)
- [`documentacao/planos/2026-08-21-acesso-cross-chat-fase-1.md`](documentacao/planos/2026-08-21-acesso-cross-chat-fase-1.md)
- [`documentacao/auditorias/2026-08-21-tarefa-1-baseline-cross-chat.md`](documentacao/auditorias/2026-08-21-tarefa-1-baseline-cross-chat.md)
- [`documentacao/auditorias/2026-08-22-tarefa-2-schema-cross-chat.md`](documentacao/auditorias/2026-08-22-tarefa-2-schema-cross-chat.md)
- [`documentacao/roadmaps/2026-08-21-roadmap-continuidade-cross-chat.md`](documentacao/roadmaps/2026-08-21-roadmap-continuidade-cross-chat.md)
- [`documentacao/principios/2026-08-22-continuidade-e-consciencia-situacional-de-projetos.md`](documentacao/principios/2026-08-22-continuidade-e-consciencia-situacional-de-projetos.md)

## Privacidade

O repositório está **público temporariamente** para permitir continuidade das validações de CI. Isso não é uma decisão permanente de visibilidade.

Não adicionar novos dados privados reais ao Git público: Eventos Cognitivos canônicos, fontes brutas pessoais, senhas, tokens, API keys, secrets, connection strings reais, verificadores de autenticação ou dumps/snapshots privados.

A remediação estrutural do histórico público está **adiada, não resolvida**, e depende de novo gate após a validação cross-chat.

## Relação com o MCF

O Cognitive Ledger e o MCF são projetos distintos.

O princípio de continuidade e consciência situacional foi identificado como transversal e deverá ser planejado futuramente também para o MCF. Essa integração ainda não foi implementada.

## Bootstrap para IA / agente

Antes de continuar uma missão relacionada a este projeto:

1. leia primeiro o **checklist vivo**;
2. use o roadmap detalhado para arquitetura e runbooks;
3. confirme o checkpoint real;
4. verifique ferramentas disponíveis;
5. não trate `NÃO VERIFICADO` como concluído;
6. se houver acesso ao Ledger, consulte os eventos relevantes;
7. se não houver acesso, declare a limitação;
8. preserve memória recuperada separada da análise atual;
9. nunca apresente um gate apenas por código;
10. sincronize checklist/checkpoint após cada marco verificável.
