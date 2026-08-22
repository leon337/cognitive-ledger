# Recomendação Arquitetural — MCP do Cognitive Ledger e `cloud-infrastructure`

**Data:** 2026-08-21
**Status:** `RECOMENDAÇÃO VIGENTE / REAVALIAÇÃO FUTURA`

## Contexto

Durante o planejamento da Fase 1 de acesso cross-chat do Cognitive Ledger foi considerada a possibilidade de hospedar o MCP na VPS já existente.

A leitura do repositório canônico `leon337/cloud-infrastructure` mostrou que essa VPS não deve ser tratada como um servidor genérico disponível para receber imediatamente novos serviços. Ela está sendo construída como uma plataforma privada governada de computação, desenvolvimento e execução de agentes.

Os documentos revisados incluem, entre outros:

- `README.md`;
- `CONTEXT.md`;
- `CHECKPOINT.md`;
- `state/current.yaml`;
- `docs/CODEX-EXECUTION-MISSION-001.md`.

O projeto de infraestrutura possui uma sequência própria de implementação e guardrails vinculantes. Entre os componentes previstos estão foundations de secrets e observabilidade, Capability Core, identidade e políticas, isolamento por projeto/missão/sandbox, execução durável, Data/Artifact Plane, Developer Experience e, posteriormente, Agent Ecosystem com Agent Gateway e interfaces MCP/API/CLI.

## Descoberta

Hospedar o MCP do Cognitive Ledger diretamente nessa VPS antes da maturidade dos mecanismos de plataforma anteciparia uma decisão de infraestrutura e criaria uma dependência prematura.

Isso poderia gerar retrabalho quando o MCP precisasse ser posteriormente adaptado para passar por boundaries ainda em construção, como:

- Capability Core;
- Agent Gateway;
- gestão central de secrets;
- identidade e capacidades escopadas;
- isolamento de workloads;
- observabilidade e auditoria;
- deploy/reconcile/rollback;
- backup, recovery e reconstrução.

A VPS deve ser entendida, neste momento, como uma **plataforma futura candidata para hospedar ou integrar o MCP**, e não como host imediato da Fase 1.

## Recomendação do MESTRE

### Decisão recomendada agora

Manter a Fase 1 do Cognitive Ledger **independente de `cloud-infrastructure`**.

O MCP da Fase 1 deve continuar sendo implementado como serviço remoto separado conforme o plano aprovado, sem criar dependência da VPS em construção.

A existência da VPS não altera os critérios de aceite, os boundaries de segurança nem a sequência de implementação da Fase 1.

### O que não fazer agora

- não instalar o MCP diretamente na VPS apenas porque há capacidade computacional disponível;
- não criar Docker/Compose, reverse proxy, secrets ou regras de rede específicos do Cognitive Ledger fora dos mecanismos previstos pela plataforma;
- não conceder a agentes acesso administrativo à VPS ou ao Docker daemon para viabilizar o MCP;
- não transformar o Cognitive Ledger em dependência da implementação da plataforma privada;
- não redesenhar `cloud-infrastructure` a partir das necessidades locais do Cognitive Ledger.

### Quando reavaliar

A hospedagem ou integração do MCP na VPS deve ser reavaliada somente quando houver evidência suficiente de maturidade da plataforma, especialmente nos boundaries relevantes para workloads de agentes.

Indicadores mínimos para reabrir a decisão:

1. Capability Core ou mecanismo equivalente de autorização por capacidades operacional e validado;
2. Agent Gateway ou boundary equivalente definido para exposição de serviços de agentes;
3. secret handling com injeção de runtime e sem secrets no Git;
4. isolamento de rede/workload adequado ao projeto e à missão;
5. observabilidade, logs, auditoria e correlação operacionais;
6. caminho de deploy/reconcile/rollback reproduzível;
7. backup/recovery/rebuild compatíveis com a criticidade do serviço;
8. novo **HUMAN_GATE** autorizando a hospedagem ou migração do MCP.

Chegar à fase denominada `Agent Ecosystem` em `cloud-infrastructure` pode ser um sinal para iniciar essa reavaliação, mas o nome da fase sozinho não constitui evidência de prontidão. O estado real e os critérios acima precisam ser verificados.

## Relação entre os projetos

A separação recomendada é:

```text
cloud-infrastructure
= plataforma privada de computação e execução governada

MCF
= método/governança de colaboração e missões

Cognitive Ledger
= continuidade, memória e recuperação cognitiva
```

Os projetos podem se integrar no futuro sem perder seus boundaries.

Arquitetura futura possível, ainda **NÃO APROVADA PARA IMPLEMENTAÇÃO**:

```text
MCF
  ↓
Capability Core
  ↓
Workflow Engine / Agent Gateway
  ↓
Cognitive Ledger MCP e outros serviços
```

Esse desenho é somente uma direção de compatibilidade. A arquitetura concreta deverá ser reavaliada contra o estado então vigente de ambos os projetos.

## Impacto no plano atual da Fase 1

- nenhuma dependência da VPS é adicionada;
- o serviço MCP remoto separado permanece como caminho planejado da Fase 1;
- a VPS fica registrada apenas como possibilidade futura;
- qualquer mudança de hosting para `cloud-infrastructure` exige nova análise e gate humano;
- a evolução de `cloud-infrastructure` pode continuar independentemente da implementação do Cognitive Ledger.

## Evidência cognitiva relacionada

Evento no Cognitive Ledger:

- `ec-2026-08-21-073700-001` — **Cloud-infrastructure deve amadurecer antes de hospedar o MCP do Cognitive Ledger**.

## Estado

**Hospedar MCP na VPS agora:** `NÃO RECOMENDADO`

**Fase 1 independente da VPS:** `RECOMENDADO`

**VPS como destino futuro candidato:** `SIM, SUJEITO A REAVALIAÇÃO E HUMAN_GATE`
