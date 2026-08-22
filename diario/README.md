# Armazenamento do Diário

Esta pasta conterá Eventos Cognitivos estruturados e organizados cronologicamente.

## Convenção de caminho proposta

```text
diario/AAAA/MM/<timestamp>-<slug>.md
```

Exemplo:

```text
diario/2026/08/2026-08-21T014900-0300-continuidade-entre-chats-de-ia.md
```

## Forma do registro

Cada arquivo deve conter frontmatter legível por máquina e corpo Markdown legível por humanos.

Exemplo de esquema:

```yaml
---
versao_do_esquema: 1
id: ec-2026-08-21-014900-001
timestamp: 2026-08-21T01:49:00-03:00
tipo: ideia
status: ativo
titulo: Exemplo de título
assuntos: []
projetos: []
referencias_de_fonte: []
relacoes: []
criado_por: ia
---
```

O corpo Markdown deve preservar, quando aplicável:

- contexto;
- resumo;
- ideias;
- decisões;
- hipóteses;
- aprendizados;
- questões abertas;
- próximos passos;
- relações relevantes.

## Regra de histórico

A evolução do pensamento não deve ser apagada silenciosamente. Quando uma ideia for refinada ou substituída, o registro anterior permanece e o novo evento cria uma relação explícita.

## Privacidade

O repositório está privado. Mesmo assim, entradas reais devem ser criadas somente dentro da intenção de captura definida pelo usuário e seguindo minimização de dados.

O conteúdo publicado no protótipo em `site/` é uma projeção separada e não deve expor automaticamente arquivos desta pasta.
