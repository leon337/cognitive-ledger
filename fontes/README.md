# Armazenamento de Fontes

Esta pasta é reservada a registros de proveniência e a material bruto aprovado que sustenta Eventos Cognitivos.

## Princípio

Um **Registro Cognitivo** responde:

> O que isso significou?

Um **Registro de Fonte** responde:

> O que realmente foi dito ou observado, e de onde veio?

Essas duas camadas devem permanecer separáveis.

## Convenção de caminho proposta

```text
fontes/AAAA/MM/<id-da-fonte>.md
```

Para artefatos grandes ou brutos, pode existir apenas um arquivo de metadados apontando para uma fonte externa durável, em vez de duplicar o conteúdo.

## Metadados de fonte

Campos sugeridos:

```yaml
versao_do_esquema: 1
id: fonte-...
timestamp: ISO-8601
tipo_de_fonte: chat | documento | reuniao | nota | web | repositorio | outro
provedor: string | null
referencia_de_conversa: string | null
referencia_externa: string | null
escopo_da_captura: trecho | mensagem | conversa | documento
hash_do_conteudo: string | null
conteudo_bruto_no_repositorio: false
```

## Privacidade e direitos autorais

Fontes brutas podem conter material privado, sensível ou de terceiros.

Regras iniciais:

- não copiar conteúdo bruto por padrão quando uma referência estável for suficiente;
- preservar metadados de proveniência;
- separar material privado da superfície publicada do protótipo;
- não versionar material de terceiros em extensão desnecessária;
- registrar conscientemente qualquer exceção.

## Relação com o site

`site/` não deve ler automaticamente esta pasta. O protótipo publicado usa dados demonstrativos selecionados, evitando transformar publicação em vazamento acidental de fontes privadas.
