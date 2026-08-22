# Gravação Operacional do Cognitive Ledger com Supabase

**Status:** APROVADO EM CONCEITO / AGUARDANDO IMPLEMENTAÇÃO
**Data:** 2026-08-21

## Objetivo

Transformar o comando “registre isso no meu diário” em um fluxo confiável, repetível e sem trabalho manual do usuário.

## Princípio central

O GitHub deixa de ser o caminho crítico de cada gravação.

A gravação operacional passa a ocorrer em um banco dedicado do Cognitive Ledger. O Git continua como backup, exportação e histórico portátil.

```text
Chat / agente
    ↓
registro estruturado
    ↓
Supabase/Postgres
    ↓
timeline privada
    ↓
exportação posterior para Git
```

## Comportamento esperado

Quando o usuário disser “registre isso no meu diário”, o sistema deve:

1. identificar o escopo relevante da conversa;
2. produzir o Registro Cognitivo;
3. preservar proveniência e timestamp;
4. persistir o evento no banco;
5. tornar o evento recuperável imediatamente;
6. refletir o evento na timeline privada;
7. confirmar a conclusão somente depois de verificar a gravação;
8. exportar para Git em fluxo separado, sem bloquear a experiência do usuário.

## Armazenamento

Projeto Supabase dedicado:

- nome: `cognitive-ledger`;
- project id: `glyfavvwarffkkthpwlj`;
- região: `sa-east-1`;
- status verificado na criação: `ACTIVE_HEALTHY`.

O banco não deve ser compartilhado com outros produtos.

## Modelo inicial

### eventos_cognitivos

Representa o que o evento significou.

Campos mínimos previstos:

- `id`;
- `timestamp`;
- `tipo`;
- `status`;
- `titulo`;
- `resumo`;
- `contexto`;
- `assuntos`;
- `projetos`;
- `ideias`;
- `decisoes`;
- `hipoteses`;
- `questoes_abertas`;
- `proximos_passos`;
- `metadados`;
- `criado_em`;
- `atualizado_em`.

### fontes

Representa de onde o evento veio.

Campos mínimos previstos:

- `id`;
- `evento_id`;
- `tipo_de_fonte`;
- `provedor`;
- `referencia`;
- `escopo_da_captura`;
- `conteudo_bruto` opcional;
- `metadados`;
- `criado_em`.

### relacoes

Relaciona eventos sem apagar a evolução histórica.

Campos mínimos previstos:

- `id`;
- `evento_origem_id`;
- `evento_destino_id`;
- `tipo`;
- `rotulo`;
- `criado_em`.

## Segurança

Requisitos obrigatórios:

- Row Level Security habilitado nas tabelas do diário;
- chave administrativa nunca exposta no frontend;
- timeline real somente em superfície privada/protegida;
- protótipo público não pode ler o banco real;
- escrita e leitura devem obedecer ao mesmo boundary de autorização;
- logs e exports não podem vazar conteúdo privado.

## Timeline privada

A timeline privada deve passar a ler do banco, e não de `site/dados/registros.js` gerado manualmente.

O registro recém-criado deve aparecer sem editar arquivos Git nem disparar migração manual de conteúdo.

## Git como backup/exportação

Git continua sendo parte importante do sistema, mas fora do caminho crítico.

Regras:

- falha de exportação Git não pode desfazer nem bloquear um registro já salvo no banco;
- exportações devem preservar IDs e timestamps para evitar duplicação;
- o formato Markdown atual pode continuar como representação portátil;
- exportação pode ser acionada por rotina posterior, job ou comando explícito.

## Compatibilidade futura com MCP

A arquitetura deve permitir um futuro tool/MCP do Cognitive Ledger, por exemplo:

```text
registrar_no_diario
ler_diario
buscar_eventos
recuperar_contexto
```

O MCP futuro deve usar o mesmo banco e as mesmas regras de autorização, sem criar uma segunda fonte de verdade.

## Critérios de aceite

A implementação só será considerada concluída quando houver evidência de que:

1. um comando “registre isso no meu diário” cria um evento no banco;
2. o evento pode ser lido de volta imediatamente;
3. a timeline privada exibe o novo evento sem editar arquivos manualmente;
4. um segundo registro consecutivo também funciona;
5. a gravação não depende de criar arquivo Git por entrada;
6. nenhuma entrada real aparece na superfície pública;
7. falha de exportação Git não bloqueia nem remove o registro salvo;
8. RLS e boundaries de acesso foram verificados.

## Fora do escopo desta etapa

- design visual final;
- Google Stitch;
- captura automática sem comando explícito;
- grafo de conhecimento avançado;
- MCP público/instalável;
- sincronização bidirecional completa com Git.

## Sequência de implementação

1. criar schema e políticas de segurança;
2. criar caminho de escrita controlado;
3. adaptar timeline privada para leitura do banco;
4. migrar os registros canônicos existentes;
5. testar dois registros consecutivos;
6. adicionar exportação Git desacoplada;
7. auditar segurança e recuperação;
8. só depois retomar refinamento visual.
