# Especificação da Fundação do Cognitive Ledger

**Status:** `APROVADA PARA PROTOTIPACAO ESTRUTURAL`
**Data:** 2026-08-21
**Escopo:** fundação de produto/domínio + protótipo navegável estrutural; design visual final permanece fora deste boundary.

## 1. Problema

Ideias, decisões, aprendizados e contexto de projetos ficam fragmentados entre chats de IA e outras interfaces. Recuperar essa continuidade posteriormente cria esforço cognitivo porque o usuário precisa lembrar em qual conversa cada parte do pensamento apareceu.

O sistema deve fornecer uma camada externa, controlada pelo usuário, que sobreviva a chats individuais e possa ser consultada por um assistente de IA sob demanda.

## 2. Objetivo do produto

Criar um ledger cognitivo pessoal capaz de:

- preservar eventos significativos de pensamento cronologicamente;
- manter proveniência das fontes;
- distinguir interpretação de material original;
- suportar retomada entre chats e projetos;
- preservar evolução intelectual, não apenas o estado mais recente;
- permanecer portátil e independente de um único provedor de IA.

## 3. Abstração central

A unidade durável principal é um **Evento Cognitivo**, não um chat nem uma mensagem.

Um Evento Cognitivo contém duas camadas lógicas.

### Registro Cognitivo

Interpretação estruturada do evento, incluindo quando aplicável:

- título;
- contexto;
- resumo;
- ideias centrais;
- decisões;
- hipóteses;
- aprendizados e descobertas;
- questões abertas;
- próximos passos;
- projetos e assuntos;
- relações com eventos anteriores.

### Registro de Fonte

Proveniência que sustenta o Registro Cognitivo, incluindo quando aplicável:

- tipo de fonte;
- timestamp;
- provedor/aplicação;
- referência de conversa/documento;
- fonte bruta ou referência para ela;
- escopo de captura;
- hash de conteúdo.

O sistema nunca deve apresentar interpretação de IA como se fosse a fonte original.

## 4. Captura

O MVP inicia com **captura explícita**.

Comandos representativos:

- “Registre isso no meu diário.”
- “Registre só esta ideia.”
- “Isso é uma decisão. Salve.”
- “Registre nossa discussão sobre X.”

Fluxo:

```text
intenção de captura
      ↓
resolver escopo da fonte
      ↓
preservar proveniência
      ↓
extrair registro cognitivo
      ↓
classificar e relacionar
      ↓
persistir registro canônico
      ↓
indexar para recuperação
```

O usuário não deve precisar preencher esquema manualmente.

Captura automática de toda mensagem permanece fora do MVP inicial por risco de criar outro histórico ruidoso.

## 5. Recuperação

“Leia meu diário” significa recuperação contextual, não carregamento completo de todos os arquivos.

A recuperação deve priorizar:

1. intenção atual do usuário;
2. projetos e assuntos relevantes;
3. recência;
4. decisões explícitas;
5. questões não resolvidas e próximos passos;
6. eventos semanticamente relacionados;
7. cadeias de relação importantes.

O sistema deve evoluir para responder tanto:

- “Qual é o estado atual do meu pensamento?”
- “Como eu cheguei a esse estado?”

## 6. Persistência

Arquitetura recomendada: **híbrida com Git como fonte canônica**.

```text
Repositório Git
Markdown/YAML estruturado
        ↓
índice/banco derivado
        ↓
busca + linha do tempo + projeções da aplicação
```

Registros canônicos permanecem inspecionáveis, exportáveis e versionados. Índices, embeddings e projeções de UI são derivados e reconstruíveis.

## 7. Linha do tempo e relações

A primeira superfície obrigatória é cronológica porque continuidade temporal é central ao problema.

Relações devem ser armazenadas desde o início para permitir futura navegação em grafo sem substituir a linha do tempo.

Tipos candidatos:

- `relaciona_com`;
- `apoia`;
- `contradiz`;
- `refina`;
- `substitui`;
- `originou_de`;
- `levou_a`;
- `resolve`.

## 8. Semântica histórica

O ledger é orientado a acréscimos.

Novos pensamentos não devem apagar silenciosamente pensamentos antigos. Se uma ideia muda, o registro anterior permanece historicamente válido e o novo registro se liga a ele por relação explícita.

## 9. Boundary com o MCF

O Cognitive Ledger é independente do MCF.

Possível relação futura:

```text
Pensamento humano
      ↓
Cognitive Ledger
      ↓ contexto relevante
MCF
      ↓ resultados/aprendizados
Cognitive Ledger
```

Isso é conceito futuro de integração, não dependência implementada.

## 10. Boundary entre estrutura e design

A equipe atual é responsável por:

- modelo de domínio;
- organização das informações;
- telas e conteúdos necessários;
- navegação;
- estados;
- comportamento;
- HTML semântico;
- CSS mínimo para legibilidade;
- JavaScript necessário ao protótipo.

O Google Stitch será usado posteriormente para explorar a camada visual e refinamentos de UX/UI.

## 11. Protótipo navegável como ferramenta de discovery

Antes do Stitch, o projeto deve possuir um protótipo web real e publicável em HTML, CSS e JavaScript simples.

O protótipo não é descartável. Ele funciona como laboratório para testar:

- leitura da linha do tempo;
- densidade de informação;
- ordem dos campos;
- filtros;
- navegação entre resumo e detalhe;
- relação entre Registro Cognitivo e Fonte;
- estados vazios;
- expansão futura do modelo.

O fluxo de produto passa a ser:

```text
conceito
→ domínio
→ arquitetura da informação
→ mapa de telas
→ HTML/CSS/JS estrutural
→ publicação
→ uso e revisão
→ refinamento
→ briefing + link para Google Stitch
→ design final
→ aplicação do design
```

## 12. Privacidade

O repositório está privado. Isso remove o bloqueio anterior de armazenamento real, mas não elimina a necessidade de minimização.

Regras:

- fonte bruta não deve ser copiada quando referência estável for suficiente;
- superfície publicada do protótipo usa dados demonstrativos por padrão;
- conteúdo privado não pode ser exposto sem decisão explícita;
- material de terceiros exige proveniência e retenção cuidadosas.

## 13. Estrutura de repositório

```text
cognitive-ledger/
├── README.md
├── documentacao/
│   ├── visao-do-produto.md
│   ├── modelo-de-dominio.md
│   ├── captura-e-recuperacao.md
│   ├── fonte-de-verdade.md
│   ├── arquitetura-da-informacao.md
│   ├── mapa-de-telas.md
│   ├── briefing-stitch.md
│   ├── especificacoes/
│   ├── planos/
│   ├── missoes/
│   └── auditorias/
├── diario/
├── fontes/
└── site/
    ├── index.html
    ├── estilos/
    ├── scripts/
    └── dados/
```

## 14. Não objetivos do primeiro boundary

- captura automática de cada mensagem;
- grafo de conhecimento completo;
- monitoramento autônomo em segundo plano do ChatGPT;
- design visual final;
- integração runtime com MCF;
- multiusuário/enterprise;
- substituição das aplicações de origem;
- backend operacional definitivo.

## 15. Critérios de sucesso do protótipo

O protótipo estrutural deve permitir:

1. navegar eventos cronologicamente com data e hora;
2. visualizar tipo, título e resumo na linha do tempo;
3. abrir detalhe de um Evento Cognitivo;
4. distinguir Registro Cognitivo e Registro de Fonte;
5. pesquisar por texto;
6. filtrar por tipo e projeto;
7. perceber relações e próximos passos;
8. funcionar sem build obrigatório e sem backend;
9. permanecer legível em largura estreita;
10. ser publicável por URL para revisão e para futura entrega ao Google Stitch.

## 16. Questões que permanecem abertas

- taxonomia final de eventos;
- se uma única fonte pode gerar vários eventos canônicos;
- quantidade padrão de conteúdo bruto a preservar;
- forma de capturar referências confiáveis entre chats diferentes;
- relações geradas pela IA versus confirmadas pelo usuário;
- semântica de edição para correção factual versus evolução intelectual;
- autenticação da futura aplicação;
- stack de indexação para o MVP operacional;
- autorização de leitura/escrita do ledger a partir de diferentes contextos de IA.

## 17. Gate de implementação

A fundação conceitual foi aprovada pelo usuário para prototipação estrutural. A implementação desta fase permanece limitada ao protótipo estático e à reorganização documental aqui descritos.

Mudanças que introduzam backend, captura automática, integração runtime com MCF ou exposição de conteúdo privado exigem novo boundary explícito.
