# Publicação do Protótipo

**Status:** `LIVE PARA REVISAO ESTRUTURAL`
**Data:** 2026-08-21

## Objetivo

Disponibilizar `site/` por uma URL navegável para que a estrutura do Cognitive Ledger possa ser revisada durante o discovery e, posteriormente, enviada ao Google Stitch como referência funcional.

## URL atual de revisão

```text
https://cognitive-ledger-prototipo.onrender.com
```

A publicação está materializada como **Static Site no Render**, vinculada à branch `design/cognitive-ledger-foundation`, com Auto-Deploy habilitado e `publishPath: site`.

## Estado visual atual

O protótipo usa tema escuro como padrão. A escolha visual ainda é estrutural e simples; identidade visual, paleta refinada e acabamento permanecem para a etapa posterior com Google Stitch.

A aplicação não exibe o fluxo operacional da equipe MCF. Convocações, análises operacionais e handoffs pertencem ao histórico da conversa onde a missão é executada, e não à superfície do Cognitive Ledger.

## Conteúdo publicável

A superfície publicada contém somente:

- HTML estrutural;
- CSS mínimo de legibilidade;
- JavaScript do protótipo;
- dados demonstrativos conscientemente selecionados.

Ela não publica automaticamente:

- arquivos de `diario/`;
- arquivos de `fontes/`;
- transcrições brutas;
- segredos;
- credenciais;
- conteúdo privado não selecionado.

## Origem do protótipo

```text
site/
├── index.html
├── estilos/principal.css
├── scripts/aplicacao.js
├── dados/registros.js
├── testes/validar-estrutura.mjs
└── .nojekyll
```

## Estratégia

A publicação é estática e reproduz exatamente o conteúdo de `site/`, sem framework nem build obrigatório.

O Render foi usado como superfície imediata porque a integração GitHub disponível nesta sessão não expõe a configuração de GitHub Pages para repositórios privados.

## GitHub Pages

Também foi preparada a branch `gh-pages`, com `index.html` na raiz e ativos apontando para `site/`.

O GitHub Pages continua sendo uma opção futura/alternativa. Para torná-lo live, é necessário habilitar a publicação da branch `gh-pages` pela raiz nas configurações do repositório. Esta etapa não é necessária para revisar o protótipo agora, pois a URL Render já está live.

## Regra de continuidade

Enquanto estivermos amadurecendo a estrutura, toda mudança na branch `design/cognitive-ledger-foundation` dispara novo deploy do Static Site. Assim, o mesmo link pode ser usado continuamente durante o discovery.
