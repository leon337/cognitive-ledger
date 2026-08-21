# Missão MCF — Protótipo navegável PT-BR do Cognitive Ledger

**Status:** EM_EXECUCAO
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

### Leonardo — produto e requisitos

Responsável por preservar a intenção do produto, revisar nomenclatura, requisitos, critérios de aceite e conteúdo necessário no protótipo.

### Sofia — arquitetura de software

Responsável pela estrutura de pastas, fronteiras entre documentação, dados, site e fontes, além da arquitetura da informação do protótipo.

### Helena — engenharia frontend

Responsável por implementar a versão navegável em HTML, CSS e JavaScript simples, sem assumir o design visual final.

### Ricardo — segurança e privacidade

Responsável por verificar exposição de conteúdo privado, limites de publicação e separação entre dados de demonstração e fontes pessoais.

### Gabriel — integração, versionamento e publicação

Responsável por rastreabilidade dos commits, branch/PR e mecanismo de publicação do protótipo.

### Emily — auditoria independente

Responsável por verificar suficiência das evidências, aderência aos critérios e registrar não conformidades ou limitações antes da conclusão.

## Fluxo de handoffs

```text
LEANDRO (objetivo aprovado)
        ↓
MESTRE
        ↓
Leonardo — requisitos e linguagem
        ↓
Sofia — estrutura e arquitetura da informação
        ↓
Helena — HTML/CSS/JS
        ↓
Ricardo — privacidade/publicação
        ↓
Gabriel — integração/publicação
        ↓
Emily — auditoria
        ↓
MESTRE — consolidação para LEANDRO
```

## Critérios de aceite

- nenhum documento principal criado por nós permanece em inglês;
- a árvore principal do projeto é compreensível em português;
- o site abre sem dependências externas obrigatórias;
- a linha do tempo é navegável e apresenta data/hora, título, resumo e tipo;
- o detalhe do registro distingue registro cognitivo e fonte;
- busca e filtros funcionam sobre dados de demonstração;
- o protótipo funciona como ferramenta de discovery, não como design final;
- dados pessoais brutos não são expostos deliberadamente na publicação;
- o link navegável e as limitações da publicação são registrados ao final.

## Regra de evidência

Cada etapa deve deixar artefato, commit ou parecer verificável. Nenhum agente simulado neste ambiente deve ser apresentado como processo cognitivo independente; a execução segue os contratos do MCF por papéis e handoffs dentro da mesma sessão.
