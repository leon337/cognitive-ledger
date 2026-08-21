# Auditoria do Protótipo Navegável — Cognitive Ledger

**Agente responsável:** Emily — Auditoria Independente
**Data:** 2026-08-21
**Boundary:** reorganização PT-BR + protótipo estático HTML/CSS/JS + publicação para revisão
**Status:** `APROVADO_PARA_REVISAO_HUMANA / CI_FALHA_ANTES_DOS_STEPS`

## Limitação de independência

Esta auditoria foi conduzida no mesmo ambiente cognitivo usado para coordenar e produzir os artefatos. Portanto, ela verifica aderência documental e evidências disponíveis, mas **não constitui auditoria cognitivamente independente** no sentido forte do contrato de Emily. Se independência externa vier a ser requisito de gate futuro, a entrega deverá ser revalidada por outro executor/revisor.

## Critérios verificados

### 1. Idioma operacional em português

**Resultado:** APROVADO.

A árvore principal da branch usa `documentacao/`, `diario/`, `fontes/` e `site/`. Os documentos principais anteriormente em inglês foram substituídos por equivalentes em português. Convenções técnicas como `README.md`, `index.html` e `.github/` foram preservadas.

### 2. Arquitetura da informação

**Resultado:** APROVADO.

Existem documentos específicos para arquitetura da informação e mapa de telas. A superfície inicial prioriza linha do tempo, busca/filtros e detalhe do Evento Cognitivo, com separação entre Registro Cognitivo e Registro de Fonte.

### 3. Protótipo estático

**Resultado:** APROVADO POR INSPEÇÃO DE ARTEFATOS.

Foram materializados:

- `site/index.html`;
- `site/estilos/principal.css`;
- `site/dados/registros.js`;
- `site/scripts/aplicacao.js`;
- `site/testes/validar-estrutura.mjs`;
- `site/.nojekyll`.

A inspeção dos arquivos confirma presença de busca, filtros, linha do tempo, detalhe, relações, fonte/proveniência e regras responsivas.

O protótipo também passou a expor uma seção estática de **Bastidores da missão**, mostrando os papéis MCF aplicados ao trabalho e o fluxo de handoffs.

### 4. Separação de dados privados e publicados

**Resultado:** APROVADO COM RESTRIÇÃO.

O protótipo usa dados demonstrativos próprios e não consome automaticamente `diario/` ou `fontes/`. A revisão de Ricardo formaliza o invariante `dado privado canônico != dado publicado`.

### 5. Rastreabilidade MCF

**Resultado:** APROVADO.

A missão documenta MESTRE, Leonardo, Sofia, Helena, Ricardo, Gabriel e Emily, com responsabilidades e handoffs coerentes com seus contratos. Os commits relevantes usam mensagens associadas aos papéis executados e o PR registra o fluxo de handoffs.

### 6. Validação automatizada

**Resultado:** FALHA DE EXECUÇÃO ANTES DOS STEPS / CAUSA EXATA AINDA NÃO DETERMINADA.

O workflow `.github/workflows/validar-prototipo.yml` continua sendo disparado no GitHub Actions. Na execução mais recente observada para o commit `9a51e5dfa0bd8d4be1ffa9be7f5ace8c69b15567`:

```text
run: 32451011497
job: 96679413019
conclusion: failure
steps: []
logs: BlobNotFound / 404
```

A evidência melhora a classificação da falha: o job termina sem executar qualquer step observável. Portanto, **não há evidência de que `node --check` ou `validar-estrutura.mjs` tenham sido executados e falhado**. A falha ocorre antes da execução dos steps ou em uma camada da infraestrutura do Actions não exposta pela integração atual.

A causa exata ainda não deve ser inventada. Ela pode depender de configuração/infraestrutura do GitHub Actions, mas isso permanece hipótese até existir evidência adicional.

### 7. Publicação

**Resultado:** APROVADO / LIVE.

Foi materializado um Static Site no Render vinculado à branch `design/cognitive-ledger-foundation`, com `publishPath: site` e Auto-Deploy habilitado.

URL:

```text
https://cognitive-ledger-prototipo.onrender.com
```

Deploy mais recente verificado nesta auditoria:

```text
service: srv-da3u2tajobas739pb8q0
deploy: dep-da3u6fss728c73atbncg
commit: 9a51e5dfa0bd8d4be1ffa9be7f5ace8c69b15567
status: live
```

Deploys posteriores são acionados automaticamente quando a branch recebe novos commits.

A branch `gh-pages` também foi preparada como opção de publicação pelo GitHub Pages, mas não é necessária para o acesso imediato ao protótipo.

## Não conformidades

Nenhuma não conformidade crítica ou alta foi encontrada nos artefatos por inspeção.

Pendência restante:

- obter diagnóstico da camada do GitHub Actions que está encerrando o job antes dos steps, ou executar a validação equivalente em outro ambiente com evidência de saída.

## Veredito

A entrega está **aprovada para revisão humana do protótipo estrutural e possui URL navegável live**.

O status `live` da publicação não equivale a design final, produto em produção ou CI verde. O site é uma superfície de discovery estrutural.
