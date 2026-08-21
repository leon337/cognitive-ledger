# Autenticação e Recuperação de Acesso — Cognitive Ledger

**Status:** `MECANISMO ATUAL DOCUMENTADO / RECUPERAÇÃO AUTÔNOMA PENDENTE`
**Data:** 2026-08-21

## Objetivo

Documentar como a autenticação do Cognitive Ledger funciona no estado operacional atual, quais boundaries existem entre acesso humano e acesso interno à API, quais limitações ainda permanecem e qual incidente motivou esta documentação.

Este documento existe para evitar que uma futura perda de acesso gere novamente investigação de código, infraestrutura e credenciais antes de se compreender o mecanismo vigente.

## Princípio de segurança

A autenticação humana e a autenticação interna entre serviços são responsabilidades diferentes.

```text
Proprietário
    ↓
credencial humana
    ↓
servidor privado no Render
    ↓
credencial interna independente
    ↓
Supabase Edge Function
    ↓
Supabase/Postgres
```

Nenhuma senha real deve ser registrada em documentação, commits, issues, logs de projeto ou eventos cognitivos.

## Fluxo atual — acesso humano

O diário privado é servido por `servidor-diario.mjs` e `servidor-diario-core.mjs`.

O navegador envia HTTP Basic Auth para o servidor privado do Render.

O servidor:

1. extrai usuário e valor apresentados no cabeçalho `Authorization`;
2. compara o usuário com `COGNITIVE_LEDGER_USUARIO`;
3. envia somente o valor apresentado para `validarAcesso`;
4. `acesso-diario.mjs` deriva o valor com `scrypt`;
5. compara o resultado em tempo constante com o hash esperado;
6. somente depois da validação serve a interface privada ou permite acesso às rotas proxy.

A senha humana em texto puro não fica armazenada no repositório.

O salt e o hash derivados podem existir no código porque não são equivalentes à senha original, mas qualquer mudança de credencial humana exige geração e validação controladas.

## Fluxo atual — Render para API interna

A senha apresentada pelo usuário no navegador **não é encaminhada para a Supabase Edge Function**.

O Render usa uma credencial interna distinta para autenticar chamadas à API.

`servidor-diario.mjs` lê atualmente:

- `COGNITIVE_LEDGER_USUARIO`;
- `COGNITIVE_LEDGER_SENHA` — usada neste estágio como credencial interna Render → API;
- `COGNITIVE_LEDGER_API_URL`.

No startup, `verificarApi` faz um smoke test autenticado em `/timeline`. Se a API não autenticar ou não devolver o contrato esperado, o servidor encerra em vez de iniciar em estado parcialmente funcional.

Para `/api/timeline` e `/api/registros`, o proxy cria um novo cabeçalho Basic Auth usando a credencial interna. A credencial humana fornecida pelo navegador não é repassada ao upstream.

## Fluxo atual — Edge Function

A Edge Function `cognitive-ledger-api` usa autenticação customizada; por isso `verify_jwt` está desabilitado para essa função específica.

A função:

1. lê Basic Auth da requisição;
2. consulta `configuracao_privada` no Supabase;
3. obtém usuário, salt e hash da credencial interna;
4. calcula `SHA-256(salt + credencial apresentada)`;
5. compara o hash em tempo constante;
6. somente após autenticação cria o cliente administrativo usado para operar os dados do Ledger.

A chave administrativa do Supabase existe apenas no backend da Edge Function. Ela não é entregue ao navegador nem ao servidor estático público.

## Estado atual dos mecanismos de hash

O sistema possui hoje dois mecanismos distintos por razões históricas:

- acesso humano no Render: `scrypt` + comparação em tempo constante;
- credencial interna da Edge Function: `SHA-256(salt + credencial)` + comparação em tempo constante.

Isso descreve o estado atual e **não deve ser interpretado como desenho definitivo de autenticação**.

A futura camada de identidade por cliente da Fase 1 cross-chat deve substituir gradualmente esse modelo interno sem recolocar a senha humana como credencial entre serviços.

## Incidente de 2026-08-21 — perda de senha

### Situação

O proprietário perdeu a senha de acesso ao diário privado.

O produto não possuía mecanismo autônomo de recuperação ou redefinição de senha.

### Retrabalho gerado

Para recuperar o acesso foi necessário:

1. tentar a rotação direta da credencial;
2. encontrar bloqueios de segurança nas integrações utilizadas para gravar material sensível;
3. inspecionar o servidor privado;
4. identificar que o mecanismo anterior reutilizava a mesma credencial humana no caminho da API;
5. escrever testes que exigissem separação de credenciais;
6. alterar o proxy para autenticação interna independente;
7. separar o validador de acesso humano;
8. implementar validação por `scrypt`;
9. corrigir uma inconsistência na derivação do hash detectada pelos testes;
10. executar deploys e smoke tests;
11. obter confirmação final do proprietário de que o novo login funcionou.

Esse esforço teria sido significativamente menor se o mecanismo de autenticação estivesse documentado e se existisse recuperação de senha como capacidade do produto.

### Resultado arquitetural

O incidente produziu uma melhoria real:

- credencial humana e credencial interna deixaram de ser a mesma responsabilidade;
- o navegador não fornece a credencial usada pelo Render para acessar a API;
- a autenticação humana pode evoluir independentemente da autenticação entre serviços.

### Evidência

O login com a nova credencial humana foi confirmado pelo proprietário após o deploy.

Evento cognitivo relacionado:

- `ec-2026-08-21-062600-001` — incidente operacional resolvido.

## Ideia derivada — recuperação de senha

O incidente originou uma necessidade de produto:

> O proprietário do Cognitive Ledger deve conseguir recuperar ou redefinir seu acesso sem intervenção em banco, Render, código ou equipe técnica.

A futura solução deve incluir uma interface própria de login e um fluxo seguro de recuperação.

Questões ainda abertas:

- qual identidade será usada para comprovar o proprietário;
- e-mail, magic link, código temporário, recovery codes ou outro mecanismo;
- como invalidar sessões e credenciais antigas;
- como impedir que recuperação da senha humana afete credenciais de clientes MCP/ChatGPT/Codex;
- como registrar recuperação na trilha de auditoria;
- se Supabase Auth será adotado ou se haverá outro provedor de identidade.

Evento cognitivo relacionado:

- `ec-2026-08-21-062700-001` — ideia de produto.

## Pendência de configuração no Render

Existe uma variável residual chamada:

`COGNITIVE_LEDGER_API_CREDENTIAL`

O código atual não lê essa variável.

Ela surgiu durante uma tentativa intermediária de separar credenciais e ficou no ambiente após a solução final.

Remoção segura prevista:

1. confirmar por código e runtime que não há consumo da variável;
2. removê-la do serviço Render;
3. executar novo deploy/smoke test;
4. verificar que a API continua autenticando e que a timeline privada continua acessível.

Evento cognitivo relacionado:

- `ec-2026-08-21-062800-001` — pendência técnica aberta.

## Arquivos de referência

O comportamento documentado deve ser conferido prioritariamente nos arquivos:

- `servidor-diario.mjs`;
- `servidor-diario-core.mjs`;
- `acesso-diario.mjs`;
- testes em `testes/servidor-diario.test.mjs`;
- Edge Function `cognitive-ledger-api` implantada no projeto Supabase.

Se este documento divergir do código executado, o runtime verificado é a fonte factual e a documentação deve ser atualizada.

## Relação com a Fase 1 cross-chat

A Fase 1 já definiu uma arquitetura de identidade independente por cliente.

Portanto, o caminho futuro é:

```text
Autenticação humana
login / recuperação
       │
       └── responsabilidade do proprietário

Autenticação de clientes
ChatGPT / MCF / Codex
       │
       └── identidade + credencial + capacidades próprias

Backend
       │
       └── acesso controlado ao Supabase
```

A recuperação de senha humana não deve rotacionar silenciosamente credenciais de clientes ou de serviços.

## Regra operacional para futuros incidentes

Antes de modificar autenticação em produção:

1. consultar este documento;
2. confirmar o fluxo no código atual;
3. identificar qual credencial está sendo alterada: humana, cliente ou interna;
4. definir teste RED antes da mudança;
5. alterar uma camada por vez;
6. validar teste GREEN;
7. validar deploy e smoke test;
8. confirmar acesso real quando houver mudança perceptível ao usuário;
9. atualizar esta documentação se o mecanismo tiver mudado.

## Estado atual

- acesso humano: operacional;
- separação entre senha humana e credencial interna: operacional;
- login real após redefinição: confirmado pelo proprietário;
- recuperação autônoma de senha: **NÃO IMPLEMENTADA**;
- variável residual no Render: **PENDENTE DE LIMPEZA**;
- autenticação definitiva por cliente da Fase 1: **NÃO IMPLEMENTADA**.
