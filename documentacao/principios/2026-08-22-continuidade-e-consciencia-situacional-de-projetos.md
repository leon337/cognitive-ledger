# Princípio de Continuidade e Consciência Situacional de Projetos

**Data:** 2026-08-22  
**Status:** `PRINCÍPIO CONSOLIDADO / IMPLEMENTAÇÃO NÃO INICIADA`  
**Aplicação prevista:** Cognitive Ledger, MCF e demais projetos  
**Origem:** dois aprendizados consecutivos sobre continuidade, orientação e tomada de decisão em projetos

> **Princípio:** todo projeto deve tornar sua continuidade observável para humanos e IAs.

---

## 1. Por que este documento existe

Durante a evolução do Cognitive Ledger foram identificadas duas falhas diferentes, porém complementares.

A primeira mostrou que um projeto pode possuir documentação correta e ainda assim falhar em continuidade se sua porta de entrada não conduzir explicitamente humano ou IA ao estado operacional real.

A segunda mostrou que, mesmo depois de encontrar a documentação correta, ainda pode ser difícil compreender onde o projeto está se não houver cronologia, timeline, roadmap visual, checklist, fase atual, bloqueios, gates e próximo passo claramente observáveis.

A síntese dos dois aprendizados leva a um princípio transversal para o Cognitive Ledger, o MCF e futuros projetos.

Este documento registra os dois aprendizados separadamente, preserva sua ordem cronológica e consolida o conhecimento derivado deles sem autorizar implementação imediata.

---

# PARTE I — APRENDIZADO 1

## 2. Evento Cognitivo relacionado

`ec-2026-08-22-021100-001`

**Título:** A porta de entrada do projeto precisa revelar deterministicamente seu estado operacional.

---

## 3. Problema observado

A `main` do repositório Cognitive Ledger apresentava o projeto como `DISCOVERY / DESIGN`, enquanto a branch ativa já continha:

- arquitetura operacional;
- persistência no Supabase;
- diário privado;
- especificações;
- plano da Fase 1 cross-chat;
- auditorias;
- roadmap canônico;
- runbook de gravação e leitura;
- decisões mais recentes.

Ou seja:

```text
REALIDADE OPERACIONAL
        ≠
PORTA DE ENTRADA DO REPOSITÓRIO
```

A informação correta existia, mas não era descobrível a partir do ponto inicial padrão.

---

## 4. Aprendizado

Não basta que a informação exista.

Ela precisa ser descoberta de forma determinística.

Um humano ou IA que chega ao root de um projeto deve conseguir localizar explicitamente:

```text
ROOT
 ↓
START HERE / README
 ↓
STATUS ATUAL
 ↓
ROADMAP
 ↓
TIMELINE
 ↓
CHECKPOINT
 ↓
RUNBOOK
 ↓
SOURCE OF TRUTH
 ↓
NEXT ACTION
```

Nenhum executor deveria depender de exploração livre, adivinhação ou conhecimento prévio para descobrir onde o projeto realmente está.

---

## 5. Termos técnicos associados

- Documentation Discoverability Failure;
- Entrypoint Failure;
- Context Bootstrapping Failure;
- Agent Bootstrap Failure;
- Default-Branch Documentation Drift;
- Stale README;
- Source-of-Truth Ambiguity;
- Repository Wayfinding Failure;
- Onboarding Failure.

### Nome técnico de trabalho

**Repository Entry-Point / Agent Context Bootstrapping Failure**

### Linguagem humana

> **A porta de entrada do projeto precisa explicar onde o projeto realmente está e como continuar.**

---

## 6. Conceito derivado

### Continuity Bootstrap Contract

Em português:

**Contrato de Inicialização de Continuidade**.

Regra proposta:

> Qualquer novo executor, humano ou IA, deve conseguir sair do root do projeto e chegar ao estado operacional atual por um caminho explícito, determinístico e verificável.

---

# PARTE II — APRENDIZADO 2

## 7. Evento Cognitivo relacionado

`ec-2026-08-22-021200-001`

**Título:** Timeline, roadmap visual e estado explícito são necessários para consciência situacional e autonomia de decisão.

---

## 8. Segundo problema observado

Resolver discoverability não resolve automaticamente compreensão.

Mesmo quando o contexto é encontrado, um projeto continua difícil de compreender se o usuário não consegue enxergar simultaneamente:

```text
PASSADO
Como chegamos aqui?

PRESENTE
Onde estamos?

FUTURO
O que vem depois?
```

A ausência dessa estrutura causa:

- dificuldade em entender em que fase o projeto está;
- dificuldade em perceber o que já foi concluído;
- dificuldade em visualizar o que falta;
- dificuldade em reconhecer bloqueios;
- dificuldade em saber quando uma decisão humana é necessária;
- dependência excessiva da IA para reconstruir e enquadrar o estado do projeto.

---

## 9. Aprendizado

A informação precisa ser não apenas encontrável, mas também **observável**.

As três superfícies mínimas são:

### 9.1 Timeline

Responde:

> **Como chegamos aqui?**

Deve mostrar eventos significativos em ordem temporal, como:

```text
ideia
 ↓
hipótese
 ↓
decisão
 ↓
implementação
 ↓
teste
 ↓
incidente
 ↓
correção
 ↓
novo estado
```

### 9.2 Estado atual / checkpoint

Responde:

> **Onde estamos agora?**

Exemplo conceitual:

```text
FASE:
Fase 1 — Continuidade Cross-Chat

ESTADO:
Em execução

TAREFA ATUAL:
Tarefa 1

BLOQUEIO:
Deno check ainda não comprovado

PRÓXIMO PASSO:
Executar CI e obter evidência do deno check
```

### 9.3 Roadmap visual / checklist

Responde:

> **Para onde vamos e o que falta?**

Legenda proposta:

```text
✓ concluído
~ em andamento
! bloqueado
? não verificado
□ não iniciado
⏸ adiado
◆ gate humano
```

---

## 10. Quarta superfície: decisão

Além de passado, presente e futuro, o projeto deve tornar explícito:

```text
DECISÕES NECESSÁRIAS AGORA
DECISÕES JÁ TOMADAS
DECISÕES ADIADAS
GATES FUTUROS
```

Isso reduz a necessidade de a IA inferir quando deve envolver o usuário.

---

## 11. Termos técnicos associados

- Visibility of System Status;
- Project Situational Awareness;
- Temporal Orientation;
- Chronological Traceability;
- Roadmap Observability;
- Progress Visualization;
- Project Wayfinding;
- Recognition Rather Than Recall;
- Cognitive Offloading;
- User Agency.

### Linguagem humana

> **Eu preciso conseguir olhar para o projeto e saber onde estou, como cheguei aqui, o que falta e o que preciso decidir.**

---

## 12. Consequência para a relação humano–IA

O estado desejado é:

```text
HUMANO entende o projeto
       +
IA entende o projeto
       ↓
IA ajuda o humano a decidir
```

O antipadrão é:

```text
IA entende / reconstrói o projeto
       ↓
usuário precisa perguntar onde está
       ↓
IA seleciona o contexto
       ↓
usuário decide com base no enquadramento da IA
```

A IA deve ampliar a capacidade de decisão do usuário, não ser a única entidade capaz de explicar o estado do projeto.

---

# PARTE III — SÍNTESE CONSOLIDADA

## 13. Evento Cognitivo relacionado

`ec-2026-08-22-021300-001`

**Título:** Todo projeto deve tornar sua continuidade observável para humanos e IAs.

---

## 14. Derivação cronológica

```text
APRENDIZADO 1
A informação existe, mas não é encontrável.
        ↓
Bootstrap / discoverability / wayfinding

APRENDIZADO 2
A informação é encontrável, mas não é facilmente compreensível.
        ↓
Timeline / roadmap / status / gates

SÍNTESE
Continuidade de projeto precisa ser
ENCONTRÁVEL + COMPREENSÍVEL + ACIONÁVEL
```

---

## 15. Nome provisório do princípio

### Português

**Padrão de Continuidade e Consciência Situacional de Projetos**

### Inglês

**Project Continuity & Situational Awareness Standard — PCSAS**

O nome é provisório e pode ser alterado durante o planejamento posterior.

---

## 16. Modelo conceitual

```text
              CONTINUIDADE DO PROJETO
                       │
      ┌────────────────┼────────────────┐
      ▼                ▼                ▼
   BOOTSTRAP         TIMELINE         ROADMAP
   como entro?     como cheguei?    para onde vou?
      │                │                │
      └────────────────┼────────────────┘
                       ▼
                CURRENT STATE
                 onde estou?
                       │
            ┌──────────┴──────────┐
            ▼                     ▼
        HUMAN VIEW            AI CONTEXT
        visualização          estruturado
            │                     │
            └──────────┬──────────┘
                       ▼
                DECISION SUPPORT
```

---

## 17. Componentes mínimos do padrão

Todo projeto que adotar este princípio deve, em algum formato, tornar explícitos:

1. bootstrap/entrypoint;
2. timeline;
3. fase atual;
4. tarefa atual;
5. estado das tarefas;
6. roadmap;
7. bloqueios;
8. itens não verificados;
9. decisões já tomadas;
10. decisões adiadas;
11. gates humanos;
12. evidências;
13. fonte de verdade;
14. próximo passo verificável.

---

# PARTE IV — UMA FONTE CANÔNICA, DUAS SUPERFÍCIES

## 18. Problema a evitar

Não criar manualmente vários documentos independentes que possam divergir:

```text
README diz A
STATUS diz B
ROADMAP diz C
IA recupera D
```

Isso seria uma nova forma de drift.

---

## 19. Princípio arquitetural proposto

```text
ESTADO CANÔNICO DO PROJETO
        │
        ├──► START HERE / README
        ├──► STATUS ATUAL
        ├──► ROADMAP VISUAL
        ├──► TIMELINE
        └──► PACOTE DE CONTEXTO PARA IA
```

Humanos e IAs devem consumir o **mesmo estado factual**, ainda que em representações diferentes.

---

# PARTE V — SUPERFÍCIE HUMANA

## 20. Project Continuity View

Nome humano sugerido:

**Painel de Continuidade do Projeto**.

Deve permitir três níveis de leitura.

### 20.1 Leitura em segundos

```text
PROJETO
FASE
ESTADO
PROGRESSO
TAREFA ATUAL
BLOQUEIO
PRÓXIMO PASSO
GATES
```

### 20.2 Roadmap visual

Checklist com estados consistentes.

### 20.3 Timeline

Sequência cronológica de marcos, decisões, incidentes e mudanças.

O objetivo é favorecer **recognition rather than recall**: o usuário deve reconhecer o estado olhando para a superfície, e não depender de memória ou de uma explicação da IA.

---

# PARTE VI — SUPERFÍCIE PARA IA

## 21. Project Continuity Context Package

Nome em português:

**Pacote de Contexto de Continuidade do Projeto**.

Estrutura conceitual:

```yaml
project: cognitive-ledger

current_state:
  phase: fase-1-cross-chat
  task: tarefa-1
  status: in_progress
  blocker: deno-check-unverified
  next_action: verify-ci-deno-check

roadmap:
  completed: []
  active: []
  blocked: []
  pending: []
  deferred: []

timeline:
  relevant_events: []

decisions:
  confirmed: []
  deferred: []

gates:
  pending: []

open_questions: []
evidence: []

source_of_truth:
  project_state: repository
  cognitive_history: cognitive-ledger
```

---

## 22. Objetivo para recuperação por IA

A IA não precisa de mais contexto indiscriminadamente.

Ela precisa de **contexto melhor estruturado**.

Fluxo desejado:

```text
pergunta do usuário
      ↓
identificar projeto/intenção
      ↓
recuperar Project Continuity Context Package
      ↓
recuperar apenas Eventos Cognitivos adicionais relevantes
      ↓
separar memória de análise atual
      ↓
responder de forma coerente e concisa
```

Isso deve reduzir:

- respostas longas por excesso de contexto;
- reconstruções erradas de cronologia;
- confusão entre decisão atual e antiga;
- adivinhação da intenção do usuário;
- inconsistência entre chats.

---

## 23. Regra de concisão

Perguntas simples sobre estado devem produzir respostas simples.

Exemplo:

```text
Onde estamos:
Fase 1 — Continuidade Cross-Chat.

Bloqueio:
Deno check ainda não comprovado.

Próximo passo:
Executar CI e fechar a Tarefa 1.
```

Detalhes históricos devem ser expandidos somente quando necessários ou solicitados.

---

# PARTE VII — APLICAÇÃO AO COGNITIVE LEDGER

## 24. Papel do Ledger

O Cognitive Ledger já possui a unidade temporal necessária: **Evento Cognitivo**.

Ele pode evoluir para responder de maneira estruturada:

- como este projeto evoluiu?;
- quais decisões levaram ao estado atual?;
- qual é a fase vigente?;
- que bloqueios existem?;
- quais decisões estão pendentes?;
- qual foi o último checkpoint?;
- quais eventos são necessários para entender o próximo passo?.

---

## 25. Relação com a prioridade cross-chat

Este princípio **não substitui nem interrompe** a prioridade vigente de concluir o acesso cross-chat.

A implementação futura deve ser incremental e aproveitar a infraestrutura de recuperação que já está sendo planejada.

```text
PRIORIDADE ATUAL
cross-chat

NOVA DESCOBERTA
registrada agora

IMPLEMENTAÇÃO DO PADRÃO
planejada posteriormente
```

---

# PARTE VIII — APLICAÇÃO AO MCF

## 26. Papel do MCF

O MCF deverá futuramente consumir o mesmo modelo de continuidade antes de orquestrar missões relacionadas a projetos existentes.

Fluxo conceitual:

```text
MESTRE recebe missão
      ↓
bootstrap do projeto
      ↓
current state
+
roadmap
+
timeline relevante
+
decisões
+
gates
+
evidências
      ↓
orquestração
```

Ao final de marcos importantes, o MCF poderá também produzir checkpoints e Eventos Cognitivos que atualizam esse estado.

---

## 27. Limite atual

Este documento **não autoriza**:

- modificar o runtime do MCF;
- alterar contratos do MCF;
- integrar automaticamente MCF ↔ Cognitive Ledger;
- implantar novos dashboards;
- criar sincronização automática;
- mudar o caminho crítico da Fase 1 cross-chat.

Essas ações exigem planejamento e gates posteriores.

---

# PARTE IX — ROADMAP PRELIMINAR PARA IMPLEMENTAÇÃO FUTURA

## 28. Fase 0 — Registro do princípio

Estado esperado após esta missão:

```text
✓ aprendizado 1 no Ledger
✓ aprendizado 2 no Ledger
✓ síntese no Ledger
✓ documento canônico no repositório
```

---

## 29. Fase 1 — Bootstrap de projeto

Objetivo:

- `START HERE` explícito;
- README/root conduz ao estado atual;
- branch ativa e source of truth identificadas;
- caminho determinístico para humano e IA.

---

## 30. Fase 2 — Estado estruturado machine-readable

Definir um esquema canônico com, no mínimo:

```text
project
phase
status
current_task
roadmap_items
blockers
unverified
confirmed_decisions
deferred_decisions
gates
evidence
next_action
updated_at
```

---

## 31. Fase 3 — Project Continuity View humana

Implementar:

- status atual;
- checklist do roadmap;
- timeline;
- blockers;
- gates;
- próximo passo;
- decisões adiadas.

---

## 32. Fase 4 — Project Continuity Context Package para IA

Gerar pacote estruturado a partir do mesmo estado canônico.

A IA deve consultar esse pacote antes de buscar grandes volumes de memória histórica.

---

## 33. Fase 5 — Recuperação no Cognitive Ledger

Evoluir a recuperação para combinar:

```text
estado atual do projeto
+
timeline relevante
+
Eventos Cognitivos relacionados
+
decisões/gates
```

sem carregar todo o diário.

---

## 34. Fase 6 — Integração com MCP

Avaliar como `recuperar_contexto` poderá retornar ou incorporar um Project Continuity Context Package.

Manter:

- read-only na Fase 1;
- auditoria;
- minimização de dados;
- distinção memória versus inferência.

---

## 35. Fase 7 — Integração com MCF

Missão futura específica para:

- bootstrap automático antes de orquestração;
- leitura de estado/roadmap/timeline;
- handoffs conscientes da fase do projeto;
- checkpoints estruturados;
- gates derivados do estado real;
- atualização governada de continuidade.

---

## 36. Fase 8 — Automação e sincronização

Somente depois do modelo estar validado:

- gerar views automaticamente;
- atualizar timeline a partir de eventos confirmados;
- atualizar status a partir de evidências;
- impedir divergência entre documentação humana e pacote de IA.

---

## 37. Fase 9 — Padronização transversal

Aplicar o padrão aos demais projetos relevantes após validação no Cognitive Ledger e MCF.

---

# PARTE X — CRITÉRIOS DE ACEITE FUTUROS

## 38. Testes humanos

### H1 — Orientação

Uma pessoa deve conseguir responder sem IA:

> Em que fase estamos?

### H2 — Próximo passo

Uma pessoa deve conseguir responder:

> O que acontece depois?

### H3 — Cronologia

Uma pessoa deve conseguir descobrir:

> Como chegamos a esta decisão?

### H4 — Gate

Uma pessoa deve conseguir identificar:

> Existe alguma decisão esperando por mim?

---

## 39. Testes para IA

### A1 — Bootstrap

Dada apenas a porta de entrada do projeto, a IA deve encontrar deterministicamente:

- estado;
- roadmap;
- timeline;
- checkpoint;
- source of truth;
- next action.

### A2 — Consistência

Humano e IA devem receber o mesmo estado factual para:

- fase;
- tarefa;
- blocker;
- próximo passo;
- gates.

### A3 — Temporalidade

Ao perguntar “por que estamos aqui?”, a IA deve reconstruir a cadeia cronológica relevante.

### A4 — Concisão

Perguntas simples de estado devem receber respostas curtas e objetivas, sem despejar eventos irrelevantes.

### A5 — Não adivinhação

Se um estado não estiver disponível ou verificável, a IA deve declarar `NÃO VERIFICADO`, em vez de preencher lacunas.

---

# PARTE XI — ESTADO DESTA DECISÃO

## 40. O que foi decidido

Foi decidido registrar formalmente os aprendizados e a síntese.

## 41. O que ainda não foi decidido

Ainda não foi aprovado:

- esquema definitivo;
- formato definitivo do painel;
- nome definitivo do padrão;
- integração concreta com MCF;
- automatização de checkpoints;
- mudança da `main` do Cognitive Ledger;
- adoção transversal em todos os projetos.

Esses itens serão tratados em planejamento posterior.

---

## 42. Relações cognitivas

```text
ec-2026-08-22-021100-001
Bootstrap / discoverability
           │
           ├────────────┐
           │            │
           ▼            ▼
       contribui      complementa
           │            │
           ▼            │
ec-2026-08-22-021300-001│
Síntese consolidada     │
           ▲            │
           │            │
           └────────────┤
                        │
ec-2026-08-22-021200-001
Timeline / situational awareness
```

A ordem cronológica deve ser preservada em futuras consultas.

---

## 43. Formulação consolidada

> **O problema não é apenas memória entre chats. Cada projeto precisa tornar sua continuidade observável: deve existir uma porta de entrada determinística, uma timeline que explique como chegamos ao estado atual, um roadmap visual que mostre onde estamos e para onde vamos, estados, blockers, gates e decisões visíveis ao usuário, além de um pacote estruturado equivalente para que IAs consultem o Cognitive Ledger sem depender de adivinhação ou excesso de contexto. O padrão deve nascer no Cognitive Ledger, ser incorporado posteriormente ao MCF e só então ser generalizado para outros projetos.**

---

## 44. Próximo passo futuro relacionado a este princípio

Quando a prioridade cross-chat permitir abrir esta frente:

1. revisar este documento;
2. recuperar os três Eventos Cognitivos relacionados;
3. definir o modelo canônico de estado do projeto;
4. desenhar o bootstrap humano/IA;
5. desenhar Project Continuity View;
6. desenhar Project Continuity Context Package;
7. planejar integração incremental com Cognitive Ledger;
8. abrir missão separada para integração ao MCF.

Até lá:

`PRINCÍPIO REGISTRADO / IMPLEMENTAÇÃO ADIADA PARA PLANEJAMENTO POSTERIOR`.
