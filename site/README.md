# Protótipo Navegável

Esta pasta contém a projeção estática do Cognitive Ledger usada durante o discovery estrutural.

## Executar localmente

Como não há build nem dependências, basta servir esta pasta com qualquer servidor HTTP estático.

Exemplos:

```bash
python -m http.server 8000 --directory site
```

ou abrir `site/index.html` diretamente no navegador quando as restrições do navegador permitirem.

## Arquivos

- `index.html` — estrutura semântica da aplicação;
- `estilos/principal.css` — CSS mínimo para legibilidade e responsividade;
- `dados/registros.js` — dados demonstrativos, separados dos registros privados canônicos;
- `scripts/aplicacao.js` — busca, filtros, linha do tempo, detalhe e relações;
- `testes/validar-estrutura.mjs` — validações estruturais sem dependências.

## Boundary

Este protótipo existe para testar estrutura, conteúdo e navegação. Ele não representa a identidade visual final do produto.
