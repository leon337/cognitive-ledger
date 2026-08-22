# Modelo de Domínio — Cognitive Ledger

**Status:** `RASCUNHO / EM_ESTUDO`
**Data:** 2026-08-21

## Entidade central: Evento Cognitivo

Um **Evento Cognitivo** é a unidade durável do ledger. Ele representa uma ocorrência significativa na evolução do pensamento, e não apenas uma mensagem de chat.

Campos sugeridos:

```yaml
id: string
timestamp: ISO-8601
tipo: ideia | decisao | hipotese | aprendizado | descoberta | reflexao | atualizacao_de_projeto | pergunta | sintese
status: ativo | substituido | resolvido | arquivado
titulo: string
resumo: string
contexto: string
assuntos: [string]
projetos: [string]
ideias: [string]
decisoes: [string]
hipoteses: [string]
questoes_abertas: [string]
proximos_passos: [string]
relacoes: [relacao]
referencias_de_fonte: [referencia_de_fonte]
criado_por: humano | ia | sistema
```

O esquema permanece provisório e deve continuar evolutivo durante a descoberta.

## Registro de Fonte

Um **Registro de Fonte** representa a proveniência por trás de um ou mais Eventos Cognitivos.

Campos possíveis:

```yaml
id: string
timestamp: ISO-8601
tipo_de_fonte: chat | documento | reuniao | nota | web | repositorio | outro
provedor: string | null
referencia_de_conversa: string | null
referencia_externa: string | null
referencia_de_conteudo_bruto: string | null
hash_do_conteudo: string | null
escopo_da_captura: trecho | mensagem | conversa | documento
```

A fonte bruta e a interpretação cognitiva devem permanecer separáveis.

## Relação

Relações servem para reconstruir a evolução do pensamento.

Tipos candidatos:

```text
relaciona_com
apoia
contradiz
refina
substitui
originou_de
levou_a
implementa
questiona
resolve
```

Uma relação pode apontar para outro Evento Cognitivo, conceito, projeto ou decisão.

## Projeto

Projeto é um agrupador contextual, não a unidade principal de memória. Um Evento Cognitivo pode pertencer a zero, um ou vários projetos.

O ledger não deve obrigar todo pensamento a caber em um projeto.

## Assunto

Assuntos são rótulos semânticos leves usados para descoberta e recuperação. Eles não devem virar uma taxonomia rígida no MVP.

## Decisão

Inicialmente, uma decisão pode ser representada como Evento Cognitivo com `tipo: decisao`.

Se no futuro existir fluxo específico suficiente para justificar entidade própria, o modelo poderá evoluir sem quebrar o ledger de eventos.

## Conceito

Um conceito representa um assunto durável cujo significado pode evoluir por meio de vários eventos. Conceitos são candidatos para um futuro grafo de conhecimento, mas não são necessários para a primeira implementação da linha do tempo.

## Princípio: histórico não deve ser apagado silenciosamente

O ledger deve preservar evolução intelectual.

Se uma ideia posterior substituir uma ideia anterior, o evento anterior continua na linha do tempo e o novo evento se liga a ele por relação explícita, como `refina` ou `substitui`.

O sistema deve poder responder tanto:

- “O que eu penso atualmente?”
- “Como eu cheguei até aqui?”

## Projeção para o protótipo navegável

O protótipo não precisa implementar toda a persistência canônica. Ele deve, porém, respeitar o modelo de domínio ao apresentar:

- data e hora do evento;
- tipo;
- título;
- resumo;
- contexto;
- projetos e assuntos;
- decisões e hipóteses quando existirem;
- questões abertas e próximos passos;
- referências de fonte;
- relações com outros eventos.

Esses elementos formam o contrato estrutural mínimo entre domínio e interface.
