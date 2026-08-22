# Mapa de Telas — Cognitive Ledger

**Status:** `RASCUNHO EXECUTÁVEL`
**Data:** 2026-08-21

## Princípio

O primeiro protótipo evita multiplicar páginas sem necessidade. A experiência inicial será concentrada em uma única aplicação estática com áreas funcionais que podem futuramente se transformar em rotas separadas.

## Tela 1 — Linha do tempo / Início

**Objetivo:** permitir retomada rápida do que foi discutido e decidido ao longo do tempo.

**Conteúdo obrigatório:**

- título do produto;
- indicação de fase/protótipo;
- busca textual;
- filtro por tipo;
- filtro por projeto;
- contagem de registros visíveis;
- grupos por data;
- eventos resumidos;
- painel de detalhe do evento selecionado;
- ação para limpar filtros;
- estado vazio.

## Área 2 — Detalhe do Evento Cognitivo

No primeiro protótipo, o detalhe é uma região da mesma tela em vez de uma URL independente.

**Conteúdo obrigatório:**

- data e hora completas;
- tipo e status;
- título;
- resumo;
- contexto;
- ideias;
- decisões;
- hipóteses;
- questões abertas;
- próximos passos;
- projetos;
- assuntos;
- relações;
- origem/proveniência;
- referência de fonte quando disponível.

## Área 3 — Busca e filtros

Não é uma tela separada nesta fase. É uma capacidade transversal da linha do tempo.

**Comportamento:**

- filtra conforme o usuário digita;
- combina texto + tipo + projeto;
- atualiza contagem;
- mantém resultado navegável;
- permite limpar tudo com uma ação.

## Rotas futuras candidatas

Estas rotas são candidatas, mas não devem ser implementadas nesta fase sem necessidade observada no protótipo:

```text
/linha-do-tempo
/registro/:id
/projetos
/assuntos
/decisoes
/hipoteses
/fontes
/relacoes
```

## Fluxo principal

```text
abrir protótipo
      ↓
ver eventos recentes
      ↓
selecionar evento
      ↓
ler detalhe
      ↓
refinar por busca/filtro
      ↓
selecionar outro evento
      ↓
identificar continuidade, decisão ou pendência
```

## Fluxo de recuperação futura por IA

Ainda não implementado, mas deve orientar a estrutura:

```text
pedido “leia meu diário”
      ↓
consulta por intenção/assunto/projeto
      ↓
seleção de eventos relevantes
      ↓
reconstrução de estado atual + evolução
      ↓
continuação da conversa
```

## Critério para criar nova tela

Nova tela só deve ser criada quando:

- existir objetivo de usuário próprio;
- o conteúdo ficar denso demais na tela atual;
- a navegação precisar de URL compartilhável;
- o uso do protótipo demonstrar ganho real.

O mapa deve evoluir a partir do uso, não de antecipação estética.
