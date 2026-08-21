# Visão do Produto — Cognitive Ledger

**Status:** `RASCUNHO / EM_ESTUDO`
**Data:** 2026-08-21

## Problema

Pensamentos importantes ficam fragmentados entre chats, projetos e interfaces. Uma ideia, decisão ou aprendizagem útil pode se tornar difícil de recuperar porque permanece ligada à conversa em que surgiu.

O produto deve preservar continuidade independentemente de uma aplicação de chat específica ou de um único modelo de IA.

## Tese do produto

O Cognitive Ledger é uma camada de continuidade cognitiva controlada pelo usuário que registra, organiza e conecta ideias, decisões, aprendizados, hipóteses, projetos e a evolução do pensamento ao longo do tempo.

A formulação mais simples é:

> Seu pensamento não deve ficar preso ao chat onde aconteceu.

## O que ele não é

O Cognitive Ledger não pretende ser:

- um simples arquivo de transcrições;
- um substituto do histórico do ChatGPT;
- um aplicativo genérico de notas;
- uma cópia de toda resposta de assistente;
- um recurso de memória pertencente a um único provedor de IA.

## Modelo central

Uma conversa é uma fonte. A unidade durável é um **Evento Cognitivo**.

Um Evento Cognitivo preserva duas camadas complementares:

1. **Registro Cognitivo** — significado extraído da fonte: contexto, ideias, decisões, hipóteses, conclusões, questões abertas e próximos passos;
2. **Registro de Fonte** — proveniência e, quando permitido, a fonte bruta que sustenta o registro cognitivo.

Essa separação permite recuperar rapidamente o significado sem perder a capacidade de verificar o que realmente foi dito.

## Capacidades principais

O produto deve evoluir para suportar:

- linha do tempo cronológica de eventos cognitivos;
- captura por solicitação explícita, como “registre isso no meu diário”;
- proveniência da fonte;
- resumos estruturados otimizados para recuperação futura;
- recuperação por assunto, projeto, tempo e relação semântica;
- reconstrução de como uma ideia evoluiu;
- distinção entre ideias, hipóteses, decisões e aprendizados;
- continuidade entre chats para assistentes de IA;
- relações entre entradas, preparando futura navegação em grafo;
- dados exportáveis e controlados pelo usuário.

## Relação com o MCF

O produto é intencionalmente separado do MCF.

```text
Intenção e pensamento humano
          ↓
    Cognitive Ledger
 memória, ideias, continuidade
          ↓
         MCF
 coordenação e execução
          ↓
 ferramentas e sistemas externos
```

Uma futura integração pode permitir que o Cognitive Ledger forneça contexto relevante ao MCF e receba resultados ou aprendizados de volta, sem que um sistema se torne silenciosamente a fonte de verdade do outro.

## Protótipo estrutural antes do design final

A descoberta do produto inclui um protótipo navegável publicado, construído em HTML, CSS e JavaScript simples.

Esse protótipo existe para amadurecer:

- arquitetura da informação;
- navegação;
- hierarquia de conteúdo;
- estados;
- comportamento de busca e filtros;
- relação entre linha do tempo, detalhe, fonte e conexões.

O protótipo pode ter CSS suficiente para ser legível e utilizável, mas não deve consumir esforço desproporcional com identidade visual final.

Quando a estrutura estiver suficientemente madura, o Google Stitch receberá:

- briefing de produto;
- requisitos estruturais;
- mapa de telas;
- estados e comportamentos;
- link do protótipo navegável.

O Stitch ficará responsável por explorar e elevar a camada de UX/UI sem redefinir silenciosamente o domínio ou remover capacidades estruturais essenciais.

## Princípio inicial de captura

O padrão inicial é **captura explícita**, não captura automática de toda mensagem.

O objetivo é produzir memória útil, não outro fluxo infinito de histórico de baixo valor.

Uma fase futura pode oferecer captura assistida, em que a IA sugere registrar uma ideia ou decisão significativa. Captura totalmente automática exigirá política explícita do usuário, filtros e controles de privacidade.
