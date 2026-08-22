# Auditoria — Tarefa 5 — Embeddings e bloqueio de crédito

**Data:** 2026-08-22  
**Estado:** `IMPLEMENTAÇÃO VALIDADA / BACKFILL BLOQUEADO POR GATE HUMANO`

## Escopo

Registrar a implementação e a validação da indexação semântica da Fase 1, bem como a causa comprovada que impede o backfill do corpus neste momento.

## Implementação validada

- texto de embedding determinístico;
- modelo `text-embedding-3-large`;
- dimensão `1024`;
- validação de dimensão e valores finitos;
- indexação posterior à persistência do Evento Cognitivo;
- falha de embedding não desfaz `POST /registros`;
- endpoint Basic-only `/admin/reindexar`;
- executor privado no Render usando a credencial interna Render → API;
- telemetria de erro limitada a códigos seguros, sem conteúdo cognitivo, vetores ou secrets.

## Evidências de teste

- `deno check` da Edge Function: PASS;
- suíte Deno após telemetria: `15 passed / 0 failed`;
- teste específico do provedor após refinamento do código estruturado: `7 passed / 0 failed`;
- suíte Node do executor privado: `9 passed / 0 failed`;
- Edge Function implantada e ativa até a versão 6 com `verify_jwt=false`, preservando autenticação customizada Basic/OAuth.

## Backfill real

O banco continha 25 Eventos Cognitivos e 0 embeddings antes do backfill.

O executor de manutenção chamou a Edge Function em produção. A resposta comprovada foi:

```text
processados: 0
falhas: 25
restantes: 25
codigo seguro: openai_embedding_http_429_credit_balance_exhausted
```

Portanto, a causa não é inferida: a API de embeddings informou `credit_balance_exhausted`.

## Medida de contenção

`COGNITIVE_LEDGER_REINDEXAR_NO_STARTUP` foi retornada para `0` no Render para impedir novas tentativas automáticas enquanto o gate estiver aberto.

O diário privado permaneceu disponível durante as falhas de indexação.

## ◆ Gate Humano — Saldo/crédito da OpenAI API

**Ação necessária:** disponibilizar saldo/crédito utilizável para o projeto/conta OpenAI associado à chave configurada no Supabase.

**Por que depende do proprietário:** alteração de billing/crédito envolve autoridade financeira e não pode ser executada autonomamente pela equipe.

**Impacto:** sem saldo disponível, não é possível gerar embeddings reais, concluir o backfill nem fechar a Tarefa 5.

## Próxima ação após o gate

1. reativar temporariamente o executor de backfill;
2. executar lotes controlados;
3. verificar `embedding IS NOT NULL` para todo o corpus;
4. verificar `embedding_model = text-embedding-3-large:1024`;
5. desligar novamente a flag de manutenção;
6. atualizar esta auditoria/checklist e seguir para a Tarefa 6.
