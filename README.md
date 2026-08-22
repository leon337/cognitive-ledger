# Cognitive Ledger

> **START HERE — porta de entrada canônica para humanos e IAs**

**Estado atual:** `FASE 1 — CONTINUIDADE CROSS-CHAT / TAREFA 5 AGUARDANDO G4`  
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
✅ Tarefa 4 — Bearer por cliente + auditoria fail-closed / GREEN 9/9
◆ Tarefa 5 — embeddings / AGUARDANDO GATE HUMANO G4
⬜ Tarefa 6 — API de recuperação
⬜ Tarefa 7 — MCP remoto
⬜ Tarefa 8 — deploy + ChatGPT
⬜ Tarefa 9 — Testes A/B + auditoria final
⏸️ Remediação estrutural do Git — adiada
```

A Fase 1 MCP é deliberadamente **somente leitura**.

## 2. Próximo passo

### ◆ GATE HUMANO G4 — Configurar chave da OpenAI para embeddings

**Ação necessária**  
Disponibilizar uma `OPENAI_API_KEY` válida para o ambiente da Supabase Edge Function por um canal seguro. Não enviar a chave em mensagem, commit, arquivo público, log ou screenshot.

**Por que precisa do proprietário**  
A credencial possui autoridade e potencial impacto de cobrança. A equipe não deve criar, selecionar ou expor essa credencial sem controle explícito do proprietário.

**Impacto**  
Sem a chave, não é possível validar embeddings reais, fazer backfill do corpus nem concluir o caminho semântico da Fase 1.

## 3. Evidência mais recente

```text
G2 OAuth:
authorization code exchange ✅
client_id no token         ✅
issuer/audience             ✅
UserInfo                    ✅
refresh token               ✅
UserInfo após refresh       ✅

Tarefa 4:
RED    1 PASS / 7 FAIL
GREEN  9 PASS / 0 FAIL
deno check index.ts         ✅
Node OAuth/servidor 13/13   ✅
```

A nova boundary Bearer está implementada e testada no código, mas **a Edge Function de produção ainda não foi redeployada com essa versão**. Não tratar runtime como atualizado até existir evidência de deploy.

## 4. Documentos canônicos — leia nesta ordem

1. [Checklist Vivo — Execução Cross-Chat](https://github.com/leon337/cognitive-ledger/blob/design/cognitive-ledger-foundation/documentacao/roadmaps/checklist-execucao-cross-chat.md)
2. [Roadmap Canônico — Continuidade Cross-Chat](https://github.com/leon337/cognitive-ledger/blob/design/cognitive-ledger-foundation/documentacao/roadmaps/2026-08-21-roadmap-continuidade-cross-chat.md)
3. [Auditoria — Tarefa 4 — Bearer e auditoria fail-closed](https://github.com/leon337/cognitive-ledger/blob/design/cognitive-ledger-foundation/documentacao/auditorias/2026-08-22-tarefa-4-autorizacao-bearer-auditoria.md)
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
