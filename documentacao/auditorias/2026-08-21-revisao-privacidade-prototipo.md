# Revisão de Privacidade — Protótipo Navegável

**Agente responsável:** Ricardo — Segurança
**Data:** 2026-08-21
**Status:** `APROVADO_COM_RESTRICOES`

## Escopo revisado

- dados em `site/dados/registros.js`;
- separação entre `site/`, `diario/` e `fontes/`;
- intenção de publicação do protótipo;
- repositório privado.

## Achados

### 1. Superfície publicada separada da fonte canônica

**Resultado:** conforme.

O site usa arquivo próprio de dados demonstrativos e não lê automaticamente `diario/` nem `fontes/`.

### 2. Conteúdo demonstrativo

**Resultado:** conforme para esta fase.

Os registros do protótipo resumem conceitos discutidos, estão marcados como demonstração e não incluem transcrição bruta, credenciais, segredos ou conteúdo privado detalhado.

### 3. Repositório privado versus site publicado

**Resultado:** atenção permanente.

Um site de GitHub Pages pode ser publicamente acessível mesmo quando o repositório é privado, dependendo do plano/configuração. Portanto, qualquer arquivo copiado para a superfície publicada deve ser considerado potencialmente público.

### 4. Dados reais futuros

**Resultado:** fora deste boundary.

Quando captura real começar, a publicação não pode consumir diretamente o diretório canônico sem uma camada explícita de projeção/sanitização.

## Risco residual

Baixo para o protótipo atual, desde que apenas `site/` seja usado como superfície pública e os dados permaneçam demonstrativos ou conscientemente selecionados.

## Recomendação

Manter a regra:

```text
dado privado canônico
    !=
dado publicado
```

Qualquer integração futura entre essas superfícies exige revisão específica.
