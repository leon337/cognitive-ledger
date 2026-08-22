# Fonte de Verdade — Cognitive Ledger

**Status:** `RASCUNHO / EM_ESTUDO`
**Data:** 2026-08-21

## Modelo recomendado

O Cognitive Ledger deve usar um modelo híbrido de persistência:

```text
Repositório Git
fonte durável controlada pelo usuário
            ↓
registros estruturados em Markdown/YAML
            ↓
índice / banco derivado
            ↓
busca, linha do tempo e projeções da aplicação
```

O repositório preserva registros portáveis, inspecionáveis e versionados. Um banco de dados ou índice de busca pode ser adicionado como camada operacional derivada para consultas rápidas e comportamento da interface.

## Dados canônicos versus derivados

### Canônicos

- eventos cognitivos;
- metadados de fonte;
- referências duráveis de fonte bruta ou cópias aprovadas;
- decisões explícitas;
- identificadores de relação;
- metadados de esquema e versão.

### Derivados

- índices de texto completo;
- embeddings;
- caches de busca;
- projeções de interface;
- scores de ranking;
- resumos gerados que possam ser reconstruídos a partir dos registros canônicos.

Sistemas derivados não podem se tornar silenciosamente a única cópia do conhecimento do usuário.

## Princípio de portabilidade

O usuário deve conseguir recuperar o ledger sem depender de um único provedor de IA, fornecedor de banco ou interface.

A arquitetura de longo prazo deve suportar:

- exportação legível por humanos;
- esquemas versionados;
- identificadores estáveis;
- referências determinísticas entre registros;
- migração sem perda de proveniência.

## Princípio de proveniência

Todo Registro Cognitivo deve ser rastreável até uma fonte ou explicitamente marcado como reflexão criada manualmente sem fonte externa.

Interpretação gerada por IA não deve ser confundida com a fonte original.

## Boundary de privacidade

O repositório está privado, o que permite iniciar testes com registros reais quando houver intenção explícita do usuário. Ainda assim, o princípio de minimização permanece:

- não copiar fonte bruta quando referência estável for suficiente;
- não publicar material pessoal na superfície estática por padrão;
- separar claramente dados canônicos privados de dados demonstrativos do site;
- registrar conscientemente qualquer exceção.

## Princípio de integridade

O histórico deve ser orientado a acréscimos. Correções e evolução devem ser representadas por novos registros, atualizações explícitas de metadados ou relações, em vez de reescrever silenciosamente a história intelectual.

## Papel do site

O conteúdo de `site/` é uma **projeção estrutural e de discovery**, não a fonte canônica do ledger.

Dados demonstrativos usados na publicação devem ser reconstruíveis a partir de arquivos próprios do protótipo e não devem ser confundidos com registros privados armazenados em `diario/` ou `fontes/`.
