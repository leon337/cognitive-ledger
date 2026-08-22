# Cognitive Ledger

**Status:** `FASE 1 — CONTINUIDADE CROSS-CHAT / TAREFA 5 BLOQUEADA POR SALDO OPENAI`  
**Branch operacional ativa:** `design/cognitive-ledger-foundation`

> **Seu pensamento não deve ficar preso ao chat onde aconteceu.**

O Cognitive Ledger é um sistema pessoal de continuidade cognitiva para preservar e recuperar ideias, decisões, aprendizados, hipóteses, projetos e sua evolução ao longo de chats com IA, ferramentas e tempo.

## Comece aqui

Leia nesta ordem:

1. [`documentacao/roadmaps/checklist-execucao-cross-chat.md`](documentacao/roadmaps/checklist-execucao-cross-chat.md) — estado vivo e canônico;
2. [`documentacao/roadmaps/2026-08-21-roadmap-continuidade-cross-chat.md`](documentacao/roadmaps/2026-08-21-roadmap-continuidade-cross-chat.md) — roadmap, arquitetura e runbooks;
3. [`documentacao/auditorias/2026-08-22-tarefa-5-embeddings-bloqueio-credito.md`](documentacao/auditorias/2026-08-22-tarefa-5-embeddings-bloqueio-credito.md) — evidência mais recente;
4. [`documentacao/principios/2026-08-22-continuidade-e-consciencia-situacional-de-projetos.md`](documentacao/principios/2026-08-22-continuidade-e-consciencia-situacional-de-projetos.md) — princípios de bootstrap, timeline e roadmap visual.

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
✅ Tarefa 1 — baseline da API / deno check exit 0
✅ Tarefa 2 — clientes, auditoria e vetores
✅ Tarefa 3 — OAuth 2.1 do proprietário / G2 PASS end-to-end
✅ Tarefa 4 — Bearer por cliente + auditoria fail-closed
❗ Tarefa 5 — embeddings / BACKFILL BLOQUEADO POR SALDO OPENAI
⬜ Tarefa 6 — API de recuperação
⬜ Tarefa 7 — MCP remoto
⬜ Tarefa 8 — deploy + ChatGPT
⬜ Tarefa 9 — Testes A/B + auditoria final
```

### Evidência mais recente

```text
Tarefa 5:
G4 / OPENAI_API_KEY             ✅ resolvido
text-embedding-3-large / 1024   ✅ implementado
indexação sem bloquear gravação ✅
/admin/reindexar Basic-only     ✅
Edge Function v6                ✅ ACTIVE
Deno após instrumentação        ✅ 15/15
executor privado Node           ✅ 9/9
backfill real                   ❌ 0/25
causa                           ✅ openai_embedding_http_429_credit_balance_exhausted
executor automático             ✅ desligado após diagnóstico
```

A boundary Bearer da Tarefa 4 está incluída na Edge Function atualmente implantada.

## ◆ GATE HUMANO — Saldo/crédito da OpenAI API

**Ação necessária**  
Disponibilizar saldo/crédito utilizável para a conta/projeto OpenAI associado à chave configurada no Supabase.

**Por que precisa de você**  
A API respondeu `credit_balance_exhausted`. Alterar billing, forma de pagamento ou aquisição de créditos é uma decisão financeira do proprietário.

**Impacto**  
Sem saldo, o código está implementado e testado, mas não é possível gerar embeddings reais, concluir o backfill e fechar a Tarefa 5.

Depois da resolução, a execução deve retomar automaticamente: reativar backfill → validar 100% do corpus → desligar manutenção → fechar Tarefa 5 → iniciar Tarefa 6.

## Fonte operacional de verdade

```text
Supabase / Postgres
= diário operacional e Eventos Cognitivos atuais

GitHub
= código + documentação + histórico + exportação controlada
```

Ler Markdown no Git não equivale a consultar o diário operacional.

## Como gravar no diário hoje

```text
intenção explícita
→ criar Evento Cognitivo
→ separar Fonte
→ criar relações
→ persistir em registrar_evento_cognitivo(...)
→ ler de volta
→ verificar
→ somente então confirmar
```

## Como ler o diário hoje

```text
identificar intenção
→ consultar Supabase/Postgres
→ recuperar conjunto relevante
→ consultar relações quando necessário
→ preservar tipos epistêmicos
→ separar MEMÓRIA RECUPERADA de ANÁLISE NOVA
```

Se a sessão não possuir acesso operacional real, declarar `NÃO DISPONÍVEL / NÃO VERIFICADO`.

## Regra de execução contínua

Enquanto houver plano aprovado e nenhum Gate Humano real:

```text
executar → testar → corrigir → versionar → auditar → sincronizar checklist/README → continuar
```

Falha técnica não é Gate Humano.

## Privacidade

O repositório está público temporariamente. Não adicionar novos Eventos Cognitivos reais, fontes brutas pessoais, senhas, tokens, API keys, secrets, connection strings, verificadores de autenticação ou dumps privados ao Git público.

A remediação estrutural do histórico público está **adiada, não resolvida**, e depende de novo Gate Humano após a validação cross-chat.

## Relação com o MCF

Cognitive Ledger e MCF continuam projetos distintos. O princípio de continuidade e consciência situacional é transversal, mas sua integração ao runtime do MCF ainda não foi implementada.
