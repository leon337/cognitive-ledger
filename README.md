# Cognitive Ledger

> **START HERE — porta de entrada canônica para humanos e IAs**

**Estado atual:** `FASE 1 — CONTINUIDADE CROSS-CHAT / TAREFA 5 BLOQUEADA POR SALDO OPENAI`  
**Branch operacional ativa:** [`design/cognitive-ledger-foundation`](https://github.com/leon337/cognitive-ledger/tree/design/cognitive-ledger-foundation)  
**Natureza da `main`:** entrypoint de continuidade e navegação; a implementação ativa ainda não foi mergeada integralmente aqui.

O Cognitive Ledger é um sistema pessoal de continuidade cognitiva para preservar e recuperar ideias, decisões, aprendizados, hipóteses, projetos e sua evolução ao longo de chats com IA, ferramentas e tempo.

> **Seu pensamento não deve ficar preso ao chat onde aconteceu.**

## 1. Onde o projeto realmente está

A implementação ativa está na branch `design/cognitive-ledger-foundation`.

Estado verificável atual:

```text
✅ Tarefa 1 — baseline da API / deno check exit 0
✅ Tarefa 2 — clientes, auditoria e vetores
✅ Tarefa 3 — OAuth 2.1 / G2 PASS end-to-end
✅ Tarefa 4 — Bearer por cliente + auditoria fail-closed
❗ Tarefa 5 — embeddings / BACKFILL BLOQUEADO POR SALDO OPENAI
⬜ Tarefa 6 — API de recuperação
⬜ Tarefa 7 — MCP remoto
⬜ Tarefa 8 — deploy + ChatGPT
⬜ Tarefa 9 — Testes A/B + auditoria final
⏸️ Remediação estrutural do Git — adiada
```

A Fase 1 MCP é deliberadamente **somente leitura**.

## 2. Próximo passo

### ◆ GATE HUMANO — Saldo/crédito da OpenAI API

**Ação necessária**  
Disponibilizar saldo/crédito utilizável para a conta/projeto OpenAI associado à chave já configurada no Supabase.

**Por que precisa do proprietário**  
A execução real do backfill recebeu `openai_embedding_http_429_credit_balance_exhausted`. Billing, método de pagamento e aquisição de créditos são decisões financeiras do proprietário.

**Impacto**  
Sem saldo disponível, o código de embeddings permanece implementado e testado, mas não é possível produzir vetores reais, concluir o backfill e fechar a Tarefa 5.

Depois da resolução, a equipe deve retomar automaticamente: reativar backfill → validar 100% do corpus → desligar manutenção → fechar Tarefa 5 → iniciar Tarefa 6.

## 3. Evidência mais recente

```text
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

## 4. Documentos canônicos — leia nesta ordem

1. [Checklist Vivo — Execução Cross-Chat](https://github.com/leon337/cognitive-ledger/blob/design/cognitive-ledger-foundation/documentacao/roadmaps/checklist-execucao-cross-chat.md)
2. [Roadmap Canônico — Continuidade Cross-Chat](https://github.com/leon337/cognitive-ledger/blob/design/cognitive-ledger-foundation/documentacao/roadmaps/2026-08-21-roadmap-continuidade-cross-chat.md)
3. [Auditoria — Tarefa 5 — embeddings e bloqueio de crédito](https://github.com/leon337/cognitive-ledger/blob/design/cognitive-ledger-foundation/documentacao/auditorias/2026-08-22-tarefa-5-embeddings-bloqueio-credito.md)
4. [Padrão de Continuidade e Consciência Situacional](https://github.com/leon337/cognitive-ledger/blob/design/cognitive-ledger-foundation/documentacao/principios/2026-08-22-continuidade-e-consciencia-situacional-de-projetos.md)
5. [Plano aprovado da Fase 1](https://github.com/leon337/cognitive-ledger/blob/design/cognitive-ledger-foundation/documentacao/planos/2026-08-21-acesso-cross-chat-fase-1.md)

## 5. Fonte de verdade

```text
Supabase / Postgres
= fonte operacional dos Eventos Cognitivos

GitHub
= código + documentação + histórico + exportação controlada
```

Ler o Git não equivale a consultar o diário operacional.

## 6. Bootstrap obrigatório para IA / agentes

Se você recebeu apenas este repositório:

1. leia primeiro o **Checklist Vivo**;
2. use a branch operacional ativa;
3. identifique `fase`, `tarefa atual`, `gate`, `evidências` e `next action`;
4. se possuir acesso real ao Ledger, consulte Eventos Cognitivos relevantes;
5. se não possuir, declare `NÃO DISPONÍVEL / NÃO VERIFICADO`;
6. preserve memória recuperada separada da análise nova;
7. nunca invente evidência;
8. nunca apresente gate apenas por código;
9. depois de cada marco, sincronize checklist + README/checkpoint;
10. enquanto houver plano aprovado e nenhum Gate Humano real, continue a execução sem pedir confirmações intermediárias.

## 7. Regra de execução contínua

```text
executar
→ testar
→ corrigir
→ versionar
→ auditar
→ sincronizar checklist/README
→ continuar
```

Falha técnica não é Gate Humano. A execução só deve parar por decisão exclusiva do proprietário, credencial/segredo que ele precise fornecer, ação destrutiva/irreversível não autorizada, mudança relevante de arquitetura/escopo ou bloqueio técnico irresolúvel com as ferramentas disponíveis.

## 8. Privacidade

O repositório está **público temporariamente**. Isso não autoriza publicar diário canônico privado, fontes brutas pessoais, senhas, tokens, API keys, secrets, connection strings, verificadores de autenticação ou dumps privados.

A remediação estrutural do histórico público está **adiada, não resolvida**.

## 9. Relação com o MCF

Cognitive Ledger e MCF continuam projetos distintos. O padrão de continuidade e consciência situacional é transversal, mas sua integração ao runtime do MCF ainda não foi implementada.
