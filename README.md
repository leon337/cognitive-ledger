# Cognitive Ledger

**Status:** `DESCOBERTA / DESIGN / PROTÓTIPO ESTRUTURAL`

O Cognitive Ledger é um sistema pessoal de continuidade cognitiva e conhecimento para preservar ideias, decisões, aprendizados, conversas e a evolução do pensamento ao longo de chats com IA, projetos, ferramentas e tempo.

O princípio central é simples:

> Seu pensamento não deve ficar preso ao chat onde aconteceu.

Este repositório está sendo estruturado como uma fonte de verdade controlada pelo usuário para registros cognitivos estruturados e suas fontes de apoio. O produto pretende combinar recuperação cronológica, continuidade semântica, proveniência e consulta assistida por IA.

## Fase atual

O projeto está em descoberta de produto, arquitetura da informação e prototipação estrutural. Existe uma camada web estática em `site/` destinada a amadurecer navegação, hierarquia e apresentação de conteúdo antes da etapa de design visual no Google Stitch.

## Idioma operacional

Português do Brasil é o idioma operacional deste repositório.

- documentação e nomes criados por nós devem preferir português;
- nomes impostos por convenções técnicas, como `README.md`, `index.html`, `.github/` e extensões de arquivo, permanecem como exigido pelas ferramentas;
- identificadores internos podem manter termos técnicos quando isso evitar ambiguidade ou facilitar integração.

## Estrutura principal

- `documentacao/` — visão de produto, domínio, arquitetura da informação, decisões, planos e especificações;
- `diario/` — registros cognitivos estruturados organizados cronologicamente;
- `fontes/` — proveniência e fontes aprovadas que sustentam os registros;
- `site/` — protótipo navegável em HTML, CSS e JavaScript simples;
- `conceitos/` — conceitos em evolução, quando necessários.

## Modelo central

Uma conversa é uma fonte. A unidade durável é o **Evento Cognitivo**.

Cada Evento Cognitivo separa duas camadas:

1. **Registro Cognitivo** — interpretação estruturada: contexto, ideias, decisões, hipóteses, aprendizados, questões abertas e próximos passos;
2. **Registro de Fonte** — proveniência e, quando apropriado, referência ou cópia autorizada da fonte original.

O sistema nunca deve apresentar interpretação gerada por IA como se fosse a fonte original.

## Protótipo navegável

O protótipo em `site/` é deliberadamente simples. Seu objetivo é permitir que a estrutura do produto seja usada e criticada durante a descoberta:

```text
conceito
  ↓
estrutura de informação
  ↓
HTML + CSS + JavaScript simples
  ↓
uso e revisão
  ↓
refinamento
  ↓
briefing + link para Google Stitch
  ↓
design visual final
```

A responsabilidade desta fase é definir o que existe, como as informações se relacionam e como o usuário navega. Cores, identidade visual, tipografia final e acabamento ficam para uma etapa posterior.

## Privacidade

Este repositório está configurado como **privado**. Mesmo assim, fontes brutas e conteúdo pessoal devem seguir princípio de minimização: armazenar somente o necessário, manter proveniência explícita e separar dados canônicos da superfície publicada do protótipo.

O site publicado deve usar dados de demonstração ou conteúdo conscientemente selecionado para exposição.

## Relação com o MCF

O Cognitive Ledger é um projeto separado do MCF. Futuramente pode fornecer continuidade/contexto ao MCF e receber resultados ou aprendizados de volta, mas nenhum dos dois deve ser tratado silenciosamente como fonte de verdade do outro.

Nesta fase, os contratos de agentes do MCF também estão sendo usados como método de coordenação do trabalho de produto, arquitetura, frontend, segurança, integração e auditoria. Isso não equivale a afirmar que existem processos cognitivos independentes executando simultaneamente quando a execução ocorre em uma única sessão.
