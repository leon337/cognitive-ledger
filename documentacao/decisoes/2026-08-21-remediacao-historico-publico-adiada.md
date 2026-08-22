# Decisão Operacional — Remediação do histórico público adiada

**Data:** 2026-08-21  
**Status:** `PENDENTE / REMEDIAÇÃO ADIADA`  
**Escopo:** `leon337/cognitive-ledger`

## Contexto

Após a decisão de tornar o repositório `cognitive-ledger` público temporariamente para destravar o GitHub Actions, foi executada uma auditoria de segurança e privacidade antes da continuidade da Fase 1 cross-chat.

A auditoria identificou riscos que precisam permanecer documentados, mas a remediação proposta por reescrita de histórico **não foi autorizada pelo proprietário neste momento**.

## Achados confirmados

Foram confirmados no estado público da branch de desenvolvimento:

1. existência de dois Eventos Cognitivos reais versionados em `diario/2026/08/`;
2. existência de uma fonte de chat em `fontes/2026/08/` marcada com `conteudo_bruto_no_repositorio: true`;
3. existência em `acesso-diario.mjs` de material derivado da autenticação humana — salt e verificador `scrypt` — que não equivale à senha em texto puro, mas amplia a superfície para tentativas offline enquanto o repositório está público;
4. exposição pública dos metadados normais de autoria dos commits, incluindo o endereço de e-mail gravado nos objetos Git;
5. documentação histórica que ainda contém premissas de que o repositório era privado.

A branch `gh-pages` foi inspecionada separadamente e, no momento da auditoria, suas pastas `diario/` e `fontes/` continham apenas arquivos de documentação, sem os registros reais encontrados na branch de desenvolvimento.

## Busca por segredos clássicos

Na revisão do diff acumulado da branch não foram encontrados valores em texto puro correspondentes aos padrões pesquisados para:

- chaves OpenAI;
- tokens GitHub;
- private keys PEM;
- connection strings PostgreSQL;
- atribuição direta de `COGNITIVE_LEDGER_SENHA`;
- atribuição direta de `SUPABASE_SERVICE_ROLE_KEY`.

Essa observação **não equivale a uma varredura forense completa de todos os objetos Git**.

## Limitação da auditoria

O runtime usado na auditoria não conseguiu clonar o repositório para executar um scanner completo como `gitleaks` sobre todos os objetos e commits.

Portanto:

> Ausência de outros segredos em commits intermediários: `NÃO VERIFICADO`.

## Recomendação apresentada

O parecer de segurança recomendou inicialmente:

- sanitizar `diario/` e `fontes/` no Git público;
- externalizar o verificador de autenticação humana;
- reescrever o histórico público da branch;
- rotacionar a credencial humana após a exposição do verificador;
- reauditar antes de continuar a implementação.

A reescrita seria uma operação destrutiva em termos de histórico Git, ainda que buscasse preservar o estado funcional atual.

## Decisão do proprietário

O proprietário **não aprovou a sanitização e reescrita do histórico neste momento**, porque considera importante preservar a história e a rastreabilidade do trabalho realizado.

A orientação dada foi:

> registrar os achados e a pendência no Cognitive Ledger e no repositório para que a decisão seja retomada posteriormente.

Essa decisão deve ser interpretada como **adiamento da remediação**, e não como:

- declaração de que os riscos foram resolvidos;
- aceitação permanente da exposição;
- autorização para publicar novos dados privados;
- autorização para manter o repositório público indefinidamente;
- autorização para executar futuramente rewrite, exclusão histórica ou rotação sem novo gate.

## Estado dos riscos

```text
achados da auditoria
        ↓
confirmados e documentados
        ↓
remediação destrutiva proposta
        ↓
NÃO APROVADA
        ↓
decisão adiada
        ↓
novo HUMAN_GATE futuro
```

**Risco resolvido:** `NÃO`  
**Rewrite autorizado:** `NÃO`  
**Exclusão histórica autorizada:** `NÃO`  
**Decisão permanente de aceitar o risco:** `NÃO`  
**Reavaliação futura:** `OBRIGATÓRIA`

## Questões para a reavaliação futura

1. Como reduzir a exposição dos artefatos identificados sem destruir a rastreabilidade histórica do projeto?
2. É possível externalizar apenas material de autenticação e impedir novas exposições sem reescrever toda a história?
3. Qual o momento apropriado para o repositório voltar a `private`?
4. Quais riscos exigem rotação de credenciais independentemente de eventual rewrite?
5. Uma futura estratégia de preservação pode manter um arquivo histórico privado separado de uma história pública sanitizada?

## Regra até o próximo gate

Até nova decisão explícita do proprietário:

- não executar force-push com reescrita de histórico por causa desta auditoria;
- não apagar registros históricos como forma de remediação;
- não declarar os achados como resolvidos;
- não adicionar novos dados canônicos privados ou fontes brutas pessoais ao Git público;
- preservar a separação entre o banco privado operacional e o repositório público temporário;
- reabrir esta decisão antes de qualquer ação destrutiva.

## Registro cognitivo relacionado

- `ec-2026-08-21-092600-001` — **Remediação do histórico público adiada para preservar a rastreabilidade**.
- `ec-2026-08-21-084600-001` — decisão anterior de tornar o repositório público temporariamente para destravar o CI.

## Estado

**Remediação:** `ADIADA`  
**Riscos:** `DOCUMENTADOS / NÃO RESOLVIDOS`  
**Histórico Git:** `PRESERVADO`  
**Próxima decisão:** `HUMAN_GATE FUTURO`
