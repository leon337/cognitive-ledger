# Missão MCF — Protótipo navegável PT-BR do Cognitive Ledger

**Status:** `PRONTO_PARA_REVISAO_HUMANA / PUBLICACAO_LIVE`
**Data:** 2026-08-21
**Objetivo:** transformar a fundação conceitual aprovada em uma estrutura totalmente legível em português do Brasil e em um protótipo web simples, navegável e publicável, preservando o design visual final para o Google Stitch.

## Contrato da missão

### Resultado esperado

1. documentação criada por nós em português do Brasil;
2. nomes de pastas e arquivos controlados por nós em português, salvo convenções técnicas inevitáveis;
3. estrutura de informação explícita para o produto;
4. protótipo em HTML, CSS e JavaScript simples;
5. navegação por linha do tempo, detalhe de registro, busca e filtros básicos;
6. conteúdo representativo do próprio processo de criação do Cognitive Ledger;
7. publicação navegável para inspeção e amadurecimento;
8. evidência de revisão e limitações registradas.

### Fora de escopo

- identidade visual final;
- framework frontend;
- backend e banco operacional;
- autenticação real;
- captura automática de chats;
- integração runtime com o MCF;
- substituição do Google Stitch na etapa de design.

## Equipe convocada por competência

### MESTRE — orquestração

Responsável por manter objetivo, escopo, ordem de execução, evidências e passagens de bastão.

**Entrega:** missão, plano, consolidação de estado e handoffs.

### Leonardo — produto e requisitos

Responsável por preservar a intenção do produto, revisar nomenclatura, requisitos, critérios de aceite e conteúdo necessário no protótipo.

**Entrega:** visão do produto, captura/recuperação e briefing progressivo do Stitch em português.

### Sofia — arquitetura de software

Responsável pela estrutura de pastas, fronteiras entre documentação, dados, site e fontes, além da arquitetura da informação do protótipo.

**Entrega:** modelo de domínio, especificação, arquitetura da informação e mapa de telas.

### Helena — engenharia frontend

Responsável por implementar a versão navegável em HTML, CSS e JavaScript simples, sem assumir o design visual final.

**Entrega:** `site/index.html`, CSS estrutural, JavaScript, dados demonstrativos e teste estrutural.

### Ricardo — segurança e privacidade

Responsável por verificar exposição de conteúdo privado, limites de publicação e separação entre dados de demonstração e fontes pessoais.

**Entrega:** fonte de verdade, convenções de `diario/` e `fontes/` e parecer de privacidade.

### Gabriel — integração, versionamento e publicação

Responsável por rastreabilidade dos commits, branch/PR e mecanismo de publicação do protótipo.

**Entrega:** CI mínimo, documentação de publicação, branch `gh-pages` preparada e Static Site no Render live.

### Emily — auditoria independente

Responsável por verificar suficiência das evidências, aderência aos critérios e registrar não conformidades ou limitações antes da conclusão.

**Entrega:** auditoria `APROVADO_PARA_REVISAO_HUMANA / CI_NAO_VERIFICADO`, com limitação de independência explicitada.

## Fluxo de handoffs realizado

```text
LEANDRO — objetivo e boundary aprovados
        ↓
MESTRE — missão e plano
        ↓
Leonardo — requisitos, linguagem e produto
        ↓
Sofia — domínio, pastas e arquitetura da informação
        ↓
Helena — HTML/CSS/JS e dados demonstrativos
        ↓
Ricardo — privacidade e separação canônico/publicado
        ↓
Gabriel — CI, PR, gh-pages e publicação Render
        ↓
Emily — auditoria e limitações
        ↓
MESTRE — consolidação para revisão de LEANDRO
```

## Estado dos critérios de aceite

| Critério | Estado | Evidência |
|---|---|---|
| documentação principal em português | ATENDIDO | `README.md` + `documentacao/` |
| árvore principal compreensível em português | ATENDIDO | `documentacao/`, `diario/`, `fontes/`, `site/` |
| HTML/CSS/JS sem framework obrigatório | ATENDIDO | `site/` |
| linha do tempo com data/hora, título, resumo e tipo | ATENDIDO POR INSPEÇÃO | `site/index.html` + `site/scripts/aplicacao.js` |
| detalhe separa registro cognitivo e fonte | ATENDIDO POR INSPEÇÃO | `site/index.html` |
| busca e filtros sobre dados demonstrativos | ATENDIDO POR INSPEÇÃO | `site/scripts/aplicacao.js` + `site/dados/registros.js` |
| protótipo como ferramenta de discovery | ATENDIDO | especificação + briefing Stitch |
| separação entre dado privado e publicado | ATENDIDO COM RESTRIÇÃO | parecer de Ricardo |
| publicação navegável | ATENDIDO | Static Site Render `live` |
| validação automatizada | PENDENTE DE EVIDÊNCIA | GitHub Actions encerra com `failure` sem passos/logs disponíveis na integração |

## Publicação live

```text
https://cognitive-ledger-prototipo.onrender.com
```

O serviço está vinculado à branch `design/cognitive-ledger-foundation`, com Auto-Deploy habilitado. Alterações futuras no protótipo passam a atualizar a mesma superfície de revisão.

A branch `gh-pages` também está preparada como alternativa para GitHub Pages, mas a configuração de Pages não é requisito para revisar o protótipo agora.

## Pendência aberta

### CI

O workflow de validação existe, mas as execuções consultadas encerram com `failure` sem passos e sem logs recuperáveis. A causa permanece não determinada; nenhuma correção especulativa foi aplicada.

Isso não impede a revisão estrutural humana, mas impede declarar CI verde.

## Regra de evidência

Cada etapa deixou artefato, commit ou parecer verificável. Nenhum agente representado neste ambiente é apresentado como processo cognitivo independente; a execução aplicou os contratos do MCF por papéis e handoffs dentro da mesma sessão.

## Próximo gate humano

LEANDRO deve abrir o protótipo publicado, revisar a estrutura da experiência e indicar o que deve mudar na hierarquia, navegação ou conteúdo. O design visual final continua reservado ao Google Stitch.
