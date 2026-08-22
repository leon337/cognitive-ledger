# Falha de Bootstrap da `main` e Correção do Critério de Continuidade

**Data:** 2026-08-22  
**Status:** `ACHADO CONFIRMADO / CORREÇÃO AUTORIZADA`  
**Evento Cognitivo:** `ec-2026-08-22-022500-001`

## 1. Contexto

Depois da criação do roadmap canônico de continuidade cross-chat e do princípio de continuidade e consciência situacional, o repositório recebeu documentação correta na branch `design/cognitive-ledger-foundation`.

Entretanto, a branch padrão `main` permaneceu praticamente no estado inicial, apresentando o projeto como `DISCOVERY / DESIGN` e afirmando que nenhuma aplicação de produção havia sido implementada.

Ao mesmo tempo, a branch operacional já continha mais de uma centena de commits de evolução, incluindo arquitetura, protótipo, diário privado, Supabase, Edge Function, autenticação, decisões, auditorias, plano cross-chat, roadmap e runbooks.

O proprietário identificou visualmente a inconsistência.

## 2. Falha

A execução anterior verificou:

- arquivo criado no Git;
- conteúdo correto;
- Eventos Cognitivos persistidos;
- relações entre eventos.

Mas não verificou o requisito principal de discoverability:

> Um humano ou uma IA chegando apenas pela porta de entrada padrão consegue descobrir deterministicamente o estado real do projeto e como continuar?

A resposta era **não**.

Portanto, houve uma lacuna entre **registrar o princípio** e **aplicar o próprio princípio**.

## 3. Classificação técnica

O achado combina:

- `Requirement Traceability Failure`;
- `Acceptance Criteria Gap`;
- `Verification Gap`;
- `Goal Drift`;
- `Default-Branch Documentation Drift`;
- `Context Bootstrapping Failure`;
- `Dogfooding / Self-Consistency Failure`.

### Linguagem humana

> Não basta registrar a informação correta; ela precisa estar visível e encontrável no lugar onde humano e IA realmente começam.

## 4. Aprendizado

Todo princípio de continuidade deve incluir um teste da **rota real de entrada**.

Não é suficiente provar que um roadmap existe em alguma branch. É necessário provar que, partindo somente do root/default branch, o executor consegue localizar:

1. estado atual;
2. fase vigente;
3. branch operacional;
4. roadmap;
5. timeline/checkpoint;
6. source of truth;
7. bloqueios e itens não verificados;
8. gates;
9. próximo passo;
10. instruções de bootstrap para humano e IA.

## 5. Novo critério de aceite — Bootstrap Test

Entrada do teste:

```text
somente a URL raiz do repositório
```

O humano ou IA deve conseguir descobrir, sem depender da conversa original:

```text
✓ estado atual
✓ branch operacional
✓ roadmap
✓ timeline / checkpoint
✓ fonte de verdade
✓ tarefa atual
✓ bloqueio
✓ próximo passo
✓ gates
✓ documentos canônicos
```

Não pode depender de:

```text
✗ adivinhação
✗ exploração aleatória de branches
✗ contexto privado da conversa
✗ memória do modelo
```

## 6. Correção autorizada

A correção desta falha consiste em transformar o README da `main` em **entrypoint canônico de continuidade**, sem realizar merge silencioso da branch operacional.

A `main` deverá deixar explícito:

- que a implementação ativa está em `design/cognitive-ledger-foundation`;
- que o projeto já possui componentes operacionais e não está mais apenas em discovery inicial;
- fase atual: continuidade cross-chat;
- estado da Tarefa 1 e pendência do `deno check`;
- roadmap visual resumido;
- timeline resumida;
- documentos canônicos;
- distinção entre fonte operacional do diário e Git;
- instruções específicas para IA/agentes;
- riscos/decisões adiadas relevantes.

## 7. Limites da correção

Esta correção **não autoriza**:

- merge integral da branch `design/cognitive-ledger-foundation` para `main`;
- rewrite de histórico;
- force-push destrutivo;
- remediação estrutural do repositório público;
- mudança do runtime do MCF;
- início da Tarefa 2 antes do fechamento formal da Tarefa 1.

## 8. Relação com o padrão transversal

Este achado refina o **Padrão de Continuidade e Consciência Situacional de Projetos**:

```text
informação registrada
        ≠
continuidade resolvida

informação registrada
+
discoverability testada
+
estado compreensível
+
próximo passo explícito
=
continuidade operacionalmente utilizável
```

O princípio deverá ser considerado futuramente também no MCF e em outros projetos.

## 9. Próximo passo

Atualizar a `main`, executar o Bootstrap Test e registrar evidência da correção.
