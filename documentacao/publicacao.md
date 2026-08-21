# Publicação do Protótipo

**Status:** `EM_PREPARACAO`
**Data:** 2026-08-21

## Objetivo

Disponibilizar `site/` por uma URL navegável para que a estrutura do Cognitive Ledger possa ser revisada durante o discovery e, posteriormente, enviada ao Google Stitch como referência funcional.

## Conteúdo publicável

A superfície publicada deve conter apenas:

- HTML estrutural;
- CSS mínimo de legibilidade;
- JavaScript do protótipo;
- dados demonstrativos conscientemente selecionados.

Ela não deve publicar automaticamente:

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
└── .nojekyll
```

## Estratégia

A publicação deve ser estática e reproduzir exatamente o conteúdo de `site/` sem exigir build de framework.

A URL final será registrada neste documento e em `documentacao/briefing-stitch.md` após a materialização e verificação.

## Limitação conhecida

O repositório é privado. Dependendo do plano e da configuração da conta GitHub, o GitHub Pages pode exigir habilitação/configuração específica para repositórios privados. Se esse boundary impedir uma URL navegável imediata, a mesma pasta `site/` pode ser publicada por outro host estático sem alterar a arquitetura do protótipo.
