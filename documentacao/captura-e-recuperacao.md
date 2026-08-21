# Captura e Recuperação — Cognitive Ledger

**Status:** `RASCUNHO / EM_ESTUDO`
**Data:** 2026-08-21

## Princípio de captura

O modelo inicial de interação é de **captura explícita**.

Exemplos de intenção do usuário:

- “Registre isso no meu diário.”
- “Registre somente esta ideia.”
- “Isso é uma decisão. Salve.”
- “Registre nossa discussão sobre X.”

O sistema não deve exigir que o usuário preencha um esquema manualmente. Ele deve inferir a estrutura a partir do escopo relevante da fonte, preservando proveniência.

## Pipeline de captura

```text
Pedido do usuário para registrar
            ↓
Resolver escopo da fonte
            ↓
Preservar fonte/proveniência
            ↓
Extrair significado cognitivo
            ↓
Classificar tipo(s) de evento
            ↓
Identificar assuntos/projetos/relações
            ↓
Persistir Registro Cognitivo + Registro de Fonte
            ↓
Expor na linha do tempo e no índice de recuperação
```

## Extração cognitiva

Quando presentes, a extração deve distinguir:

- contexto;
- ideia central;
- decisões;
- hipóteses;
- aprendizados e descobertas;
- conclusões;
- questões abertas;
- tensões não resolvidas;
- próximos passos;
- relações com registros anteriores.

O objetivo não é compressão agressiva. O registro deve preservar raciocínio suficiente para permitir continuação futura sem exigir releitura da fonte completa.

## Preservação da fonte

O sistema deve suportar simultaneamente:

1. registro cognitivo estruturado;
2. fonte original ou referência estável para ela.

Quando a fonte bruta não puder ou não deva ser copiada, o ledger ainda deve preservar metadados de proveniência e referência externa, quando disponível.

## Intenção de recuperação

“Leia meu diário” não significa carregar todas as entradas no contexto.

O fluxo de recuperação deve ser:

```text
Intenção atual do usuário
            ↓
Inferir assuntos/projetos/janela temporal relevantes
            ↓
Recuperar eventos recentes + semanticamente relacionados
            ↓
Priorizar decisões e questões não resolvidas
            ↓
Seguir relações importantes
            ↓
Entregar contexto de continuidade
```

## Perguntas de recuperação esperadas

O sistema deve evoluir para responder perguntas como:

- O que eu estava discutindo mais recentemente sobre este projeto?
- Quais decisões já foram tomadas?
- Quais hipóteses continuam abertas?
- Como esta ideia de produto evoluiu?
- Sobre o que eu mudei de opinião?
- Quais assuntos voltaram repetidamente neste mês?
- Quais próximos passos eu deixei pendentes?

## Linha do tempo versus grafo

A linha do tempo é a primeira superfície de recuperação porque cronologia é central ao problema de lembrança.

O grafo de conhecimento é uma capacidade posterior. O modelo deve preservar relações desde o início para que recuperação baseada em grafo possa ser acrescentada sem substituir o histórico cronológico.

## Modos de captura

### Fase 1 — Explícita

Nada é registrado sem solicitação do usuário.

### Fase candidata futura — Assistida

O assistente pode identificar uma ideia, decisão ou descoberta significativa e perguntar se deve registrá-la.

### Fase candidata futura — Automática

Captura automática exige política explícita do usuário, filtragem forte e controles claros de privacidade. Não faz parte do boundary inicial do MVP.

## Relação com o protótipo

O protótipo navegável atual não implementa captura real ainda. Ele deve representar estruturalmente os resultados esperados da captura para que possamos amadurecer o que um registro precisa mostrar e como uma recuperação deve ser apresentada.
