# Plano de Implementação — Protótipo Navegável PT-BR

> Para trabalhadores agentic: executar tarefa por tarefa, com revisão de aderência e qualidade entre etapas.

**Objetivo:** traduzir e reorganizar o repositório para português do Brasil e entregar um protótipo web estático, navegável e publicável para amadurecimento estrutural do Cognitive Ledger.

**Arquitetura:** o repositório mantém documentação e registros canônicos em Markdown/YAML e acrescenta uma camada estática em `site/` composta por HTML, CSS e JavaScript sem framework. O site usa dados de demonstração separados de fontes pessoais e funciona como projeção navegável da estrutura do produto, não como fonte canônica final.

**Tecnologias:** HTML5, CSS3, JavaScript ES6+, Git/GitHub e publicação estática.

**Especificação:** `documentacao/especificacoes/2026-08-21-fundacao-cognitive-ledger.md`

## Restrições globais

- português do Brasil é o idioma operacional do projeto;
- nomes controlados por nós ficam em português sempre que não houver convenção técnica obrigatória;
- design visual final permanece fora de escopo;
- o protótipo deve funcionar sem framework e sem build obrigatório;
- dados publicados devem ser demonstrativos e não conter conteúdo pessoal bruto;
- histórico intelectual deve permanecer distinguível de sua fonte/proveniência;
- Git permanece fonte canônica dos artefatos versionados desta fase.

---

## Tarefa 1 — Reorganizar e traduzir a documentação

**Arquivos principais:**
- atualizar `README.md`;
- criar `documentacao/visao-do-produto.md`;
- criar `documentacao/modelo-de-dominio.md`;
- criar `documentacao/captura-e-recuperacao.md`;
- criar `documentacao/fonte-de-verdade.md`;
- criar `documentacao/briefing-stitch.md`;
- criar `documentacao/especificacoes/2026-08-21-fundacao-cognitive-ledger.md`;
- criar `diario/README.md`;
- criar `fontes/README.md`;
- remover os equivalentes antigos em inglês.

**Aceite:** a árvore documental principal fica legível em português e preserva as decisões já aprovadas, incluindo a nova etapa de protótipo navegável antes do Stitch.

## Tarefa 2 — Formalizar arquitetura da informação

**Arquivos:**
- criar `documentacao/arquitetura-da-informacao.md`;
- criar `documentacao/mapa-de-telas.md`.

**Aceite:** ficam explícitos os objetos apresentados, hierarquia de informação, telas iniciais, navegação e estados necessários ao protótipo.

## Tarefa 3 — Implementar dados de demonstração

**Arquivos:**
- criar `site/dados/registros.js`.

**Interfaces:**
- produz `window.DADOS_COGNITIVE_LEDGER` com registros, tipos, projetos e relações de demonstração;
- nenhum dado depende de backend.

**Aceite:** existem registros representativos da evolução do Cognitive Ledger e do MCF Product Lab sem exposição de fonte bruta pessoal.

## Tarefa 4 — Implementar estrutura HTML

**Arquivos:**
- criar `site/index.html`.

**Aceite:** HTML semântico contém cabeçalho, navegação, busca, filtros, linha do tempo, painel de detalhe e área de estado vazio; o documento permanece útil mesmo antes do design final.

## Tarefa 5 — Implementar CSS estrutural mínimo

**Arquivos:**
- criar `site/estilos/principal.css`.

**Aceite:** layout legível em desktop e dispositivos estreitos, com foco em hierarquia e leitura, sem identidade visual final ou dependências externas.

## Tarefa 6 — Implementar comportamento JavaScript

**Arquivos:**
- criar `site/scripts/aplicacao.js`.

**Interfaces:**
- consome `window.DADOS_COGNITIVE_LEDGER`;
- filtra por texto, tipo e projeto;
- agrupa cronologicamente;
- abre detalhe de registro;
- atualiza contagens e estados vazios.

**Aceite:** navegação e filtros funcionam sem backend e sem build.

## Tarefa 7 — Preparar publicação

**Arquivos:**
- criar `site/.nojekyll`;
- criar `documentacao/publicacao.md`.

**Aceite:** o site pode ser publicado como artefato estático; o caminho e limitações são documentados.

## Tarefa 8 — Revisões por competência

**Ricardo:** verificar privacidade e ausência de conteúdo bruto pessoal na superfície publicada.

**Gabriel:** verificar rastreabilidade, árvore de arquivos e caminho de publicação.

**Emily:** revisar critérios de aceite, evidências e limitações; registrar parecer em `documentacao/auditorias/2026-08-21-prototipo-navegavel.md`.

## Tarefa 9 — Consolidação

**MESTRE:** atualizar missão com estado final, evidências, link navegável ou bloqueio de publicação e próximo passo recomendado.
