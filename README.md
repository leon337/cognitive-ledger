# Cognitive Ledger

**Status:** `FASE 1 — CONTINUIDADE CROSS-CHAT / TAREFA 5 AGUARDANDO G4`  
**Branch operacional ativa:** `design/cognitive-ledger-foundation`

> **Seu pensamento não deve ficar preso ao chat onde aconteceu.**

O Cognitive Ledger é um sistema pessoal de continuidade cognitiva para preservar e recuperar ideias, decisões, aprendizados, hipóteses, projetos e sua evolução ao longo de chats com IA, ferramentas e tempo.

## Comece aqui

Leia nesta ordem:

1. [`documentacao/roadmaps/checklist-execucao-cross-chat.md`](documentacao/roadmaps/checklist-execucao-cross-chat.md) — estado vivo e canônico;
2. [`documentacao/roadmaps/2026-08-21-roadmap-continuidade-cross-chat.md`](documentacao/roadmaps/2026-08-21-roadmap-continuidade-cross-chat.md) — roadmap, arquitetura e runbooks;
3. [`documentacao/auditorias/2026-08-22-tarefa-4-autorizacao-bearer-auditoria.md`](documentacao/auditorias/2026-08-22-tarefa-4-autorizacao-bearer-auditoria.md) — evidência mais recente;
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
✅ Tarefa 4 — Bearer por cliente + auditoria fail-closed / GREEN 9/9
◆ Tarefa 5 — embeddings / AGUARDANDO GATE HUMANO G4
⬜ Tarefa 6 — API de recuperação
⬜ Tarefa 7 — MCP remoto
⬜ Tarefa 8 — deploy + ChatGPT
⬜ Tarefa 9 — Testes A/B + auditoria final
```

### Evidência mais recente

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

A nova boundary Bearer está **implementada e testada no código**, mas a Edge Function de produção ainda não foi redeployada com essa versão. O runtime deve permanecer marcado como `NÃO IMPLANTADO` até evidência de deploy.

## ◆ GATE HUMANO G4 — Configurar chave da OpenAI para embeddings

**Ação necessária**  
Disponibilizar uma `OPENAI_API_KEY` válida para o ambiente da Supabase Edge Function por canal seguro. A chave não deve ser enviada em mensagem, commit, arquivo público, log ou screenshot.

**Por que precisa de você**  
A Tarefa 5 precisa chamar a API de embeddings da OpenAI e envolve uma credencial com autoridade e potencial impacto de cobrança.

**Impacto**  
Sem a chave, não é possível validar embeddings reais, fazer backfill do corpus nem aprovar o caminho semântico da Fase 1.

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
