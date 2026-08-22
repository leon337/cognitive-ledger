# Decisão Operacional — Visibilidade pública temporária do repositório

**Data:** 2026-08-21  
**Status:** `TEMPORÁRIO / VIGENTE`  
**Escopo:** `leon337/cognitive-ledger`

## Decisão

O repositório `leon337/cognitive-ledger` foi tornado **público temporariamente** por decisão do proprietário.

A mudança tem finalidade operacional: permitir a continuidade das validações por GitHub Actions enquanto o uso de workflows em repositório privado está bloqueado pela cota mensal informada pelo proprietário.

A visibilidade atual `public` foi verificada pela API do GitHub em 2026-08-21.

## Caráter temporário

Esta mudança **não redefine a política permanente de visibilidade do projeto**.

Não há, neste momento, uma data fixa para reversão. A visibilidade deve ser reavaliada e preferencialmente retornar a `private` quando o motivo operacional deixar de existir ou quando houver uma alternativa sustentável para executar o CI sem manter o repositório público.

Qualquer decisão de manter o repositório público de forma permanente exige novo HUMAN_GATE.

## Boundary de privacidade

Tornar o repositório público não torna públicos os dados operacionais do Cognitive Ledger.

Continuam proibidos no Git, independentemente da visibilidade do repositório:

- senhas, passphrases e credenciais;
- tokens e API keys;
- secrets do Supabase, Render ou outros provedores;
- connection strings reais;
- dados canônicos do diário privado;
- fontes brutas pessoais não explicitamente aprovadas para publicação;
- qualquer conteúdo privado cuja exposição não tenha sido autorizada.

A separação permanece:

```text
GitHub público temporariamente
= código + documentação sanitizada

Supabase / Render / diário privado
= dados e credenciais operacionais protegidos
```

## Motivo operacional

Durante o fechamento da Tarefa 1 da Fase 1 cross-chat, o GitHub Actions apresentava jobs que não iniciavam. O proprietário informou que a cota mensal aplicável a workflows privados havia sido esgotada e decidiu tornar o repositório público temporariamente para destravar a execução do CI.

O motivo de quota é registrado como **informação fornecida pelo proprietário**. A visibilidade pública atual do repositório é verificada diretamente no GitHub.

## Reversão

A reversão para `private` deve ocorrer por decisão explícita do proprietário após reavaliação do estado do CI.

Critérios que podem disparar a reavaliação:

1. conclusão das validações imediatas que motivaram a mudança;
2. renovação/restauração da capacidade de workflows privados;
3. adoção de outro mecanismo sustentável de CI;
4. identificação de risco de exposição incompatível com a permanência pública.

## Registro cognitivo relacionado

- `ec-2026-08-21-084600-001` — **Repositorio do Cognitive Ledger tornado publico temporariamente para desbloquear CI**.

## Estado

**Visibilidade atual:** `PUBLIC`  
**Natureza da decisão:** `TEMPORÁRIA`  
**Dados privados autorizados para exposição:** `NÃO`  
**Reversão automática definida:** `NÃO`  
**Reavaliação futura:** `OBRIGATÓRIA`
