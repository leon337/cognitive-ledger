# Arquitetura da Informação — Cognitive Ledger

**Status:** `RASCUNHO EXECUTÁVEL`
**Data:** 2026-08-21

## Objetivo

Definir como o conteúdo do Cognitive Ledger é organizado e apresentado no protótipo navegável sem antecipar decisões de identidade visual.

## Hierarquia principal

```text
Cognitive Ledger
│
├── Linha do tempo
│   ├── grupos por data
│   └── cartões/resumos de eventos
│
├── Busca e filtros
│   ├── texto
│   ├── tipo
│   └── projeto
│
└── Detalhe do Evento Cognitivo
    ├── cabeçalho do evento
    ├── resumo
    ├── contexto
    ├── ideias
    ├── decisões
    ├── hipóteses
    ├── questões abertas
    ├── próximos passos
    ├── relações
    └── fonte/proveniência
```

## Tela inicial

A tela inicial deve responder rapidamente:

1. o que aconteceu recentemente;
2. em que horário aconteceu;
3. qual foi o assunto central;
4. que tipo de evento foi;
5. a qual projeto está ligado;
6. se há decisão, hipótese ou pendência relevante;
7. como abrir o detalhe completo.

## Linha do tempo

A linha do tempo é a superfície principal do protótipo.

Cada item resumido deve conter no mínimo:

- hora;
- tipo;
- título;
- resumo curto;
- projetos;
- assuntos;
- indicação de decisão ou pendência quando aplicável.

Eventos são agrupados por data em ordem cronológica decrescente.

## Detalhe do evento

Ao selecionar um evento, o usuário deve conseguir distinguir imediatamente:

### Registro Cognitivo

O que foi compreendido e preservado a partir da conversa ou fonte.

### Registro de Fonte

De onde veio, quando surgiu e qual referência sustenta o registro.

A separação deve ser estrutural, não apenas textual.

## Busca

A busca inicial opera sobre:

- título;
- resumo;
- contexto;
- assuntos;
- projetos;
- decisões;
- hipóteses;
- questões abertas;
- próximos passos.

## Filtros

Filtros iniciais:

- tipo de evento;
- projeto.

Filtros futuros possíveis:

- período;
- assunto;
- status;
- origem;
- presença de decisão;
- presença de pendência.

## Relações

O protótipo deve exibir relações no detalhe sem implementar ainda um grafo visual.

Exemplos:

- “originou de”;
- “levou a”;
- “refina”;
- “relaciona com”.

## Estados necessários

### Estado com resultados

Linha do tempo e contagem atualizadas após busca/filtros.

### Estado sem resultados

Mensagem clara informando que nenhum registro corresponde aos critérios, com ação para limpar filtros.

### Estado inicial do detalhe

Quando nenhum evento foi selecionado, o painel de detalhe apresenta orientação curta para selecionar um registro.

## Responsividade estrutural

Em largura ampla, linha do tempo e detalhe podem coexistir.

Em largura estreita, o detalhe deve se reorganizar abaixo da linha do tempo sem perda de conteúdo ou funcionalidade.

O comportamento exato de navegação móvel poderá ser refinado após uso real e posteriormente pelo Google Stitch.

## Regra de design

Esta arquitetura define **conteúdo, prioridade e relações**, não aparência final. O CSS do protótipo existe apenas para tornar essa estrutura legível e testável.
