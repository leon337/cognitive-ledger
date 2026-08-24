# Contrato de Integração — MCF → Cognitive Ledger Read-Only Lab

**Estado observado:** `REAL_MCF_APPMODULE_READONLY_LAB_E2E_PASS__DISCONNECTED_INACTIVE`

**Transporte MCP:** Streamable HTTP, resposta JSON, stateless, somente `POST`.

**Dados e identidade do gate:** exclusivamente sintéticos; sem Ledger remoto,
OAuth live, produção, dados reais ou chave de IA.

Este é o contrato consumido pelo adapter read-only do MCF. O MCF não deve
acessar Postgres, PostgREST, service role, Basic legado ou a Edge Function
diretamente. O caminho normal é:

```text
MCF → POST /mcp → MCP tool-only → Edge Function /v1 → Postgres/pgvector
```

## Evidência pós-integração MCF

- provider testado no feature tree `b882d2808af74858a6ba351fb755bb3843e33ab2`
  e integrado em `design/cognitive-ledger-foundation` pela PR #2, merge
  `e0e715b0105abe0bc636d198e7ebb137d7de9bd7`;
- adapter integrado em `main` do MCF pela PR #160, merge
  `efe5164290d56f22023f07de073e2ad7c027fb95`;
- staging do MCF aprovado no SHA exato do merge pelo run `32685810702`;
- caminho real comprovado: AppModule → MCP → Edge/Auth → PostgREST → PostgreSQL
  17/pgvector;
- 3 operações MCF aprovadas e 3 auditorias geradas; `ler_fonte_bruta` bloqueada
  antes do MCP;
- 3 Eventos antes/depois, 0 embeddings, 0 chamadas pagas e 0 persistência do
  payload de memória no MCF.

O lab foi desmontado. A capability permanece `DISCONNECTED`, `INACTIVE`,
`HISTORICALLY_VERIFIED` e `LIVE_REQUIRED`. O staging acima qualifica o SHA do
MCF; não prova conexão live com o Ledger e não autoriza OAuth ou produção.

## Transporte MCP

No E2E local, o endpoint é `POST http://127.0.0.1:33100/mcp`. O servidor manual
usa porta `3000` por padrão. `GET` e `DELETE` em `/mcp` retornam `405`.

O cliente deve usar o `StreamableHTTPClientTransport` do SDK MCP e enviar:

```http
Authorization: Bearer <JWT OAuth Supabase>
```

Não existe transporte stdio nesta branch. Um cliente MCF exclusivamente stdio
precisaria de um bridge explícito ou de um novo `StdioServerTransport`; nenhum dos
dois está implementado. O servidor é stateless (`sessionIdGenerator: undefined`)
e devolve resposta JSON (`enableJsonResponse: true`).

As quatro tools são `ler_diario`, `buscar_eventos`, `recuperar_contexto` e
`ler_fonte_bruta`. Todas declaram:

```json
{
  "readOnlyHint": true,
  "destructiveHint": false,
  "idempotentHint": true,
  "openWorldHint": false
}
```

Sucesso de uma tool:

```json
{
  "content": [{ "type": "text", "text": "<mesmo JSON serializado>" }],
  "structuredContent": { "...": "resposta da API" }
}
```

Falha segura de uma tool:

```json
{
  "isError": true,
  "content": [{ "type": "text", "text": "{\"erro\":\"...\",\"status\":403}" }],
  "structuredContent": { "erro": "...", "status": 403 }
}
```

## Boundary HTTP da Edge Function

Base local externa exata:

```text
http://localhost:54331/functions/v1/cognitive-ledger-api
```

Todas as chamadas exigem `Authorization: Bearer <JWT>` e
`Accept: application/json`. Os `POST` exigem também
`Content-Type: application/json`. O JWT ES256 é validado pelo Supabase Auth e
deve conter `iss`, `aud=authenticated`, `exp` futuro, `sub` não vazio e
`client_id` não vazio. O `sub` precisa ser o `COGNITIVE_LEDGER_OWNER_ID`; o
cliente precisa estar ativo, não revogado e possuir a capability da operação.

O prefixo que a Edge Runtime entrega internamente,
`/cognitive-ledger-api/v1/...`, é normalizado apenas para o nome canônico da
função. Prefixos parecidos não são aceitos. `/v1/registros`, `/v1/admin` e seus
descendentes são negados com `403`, inclusive quando prefixados. As rotas Basic
legadas `/timeline`, `/registros` e `/admin/reindexar` permanecem fora deste
boundary OAuth e não são expostas pelo MCP.

### `ler_diario`

```http
GET /v1/diario?limite=8&projeto=MCF&assuntos=integracao&tipos=decisao&inicio=<RFC3339>&fim=<RFC3339>
```

- `limite`: inteiro, normalizado para `1..12`, padrão `8`;
- `projeto`: uma string de até 256 caracteres;
- `assuntos` e `tipos`: repetíveis ou separados por vírgula, até 32 itens de
  256 caracteres;
- `inicio` e `fim`: timestamps válidos; o schema MCP exige RFC3339 com offset.

Resposta mínima:

```json
{
  "estado": "ok",
  "degradado": false,
  "eventos": [{
    "id": "ec-lab-001",
    "timestamp": "2026-08-20T12:00:00Z",
    "tipo": "decisao",
    "status": "ativo",
    "titulo": "...",
    "resumo": "...",
    "contexto": "...",
    "projetos": [],
    "assuntos": [],
    "ideias": [],
    "decisoes": [],
    "hipoteses": [],
    "questoes_abertas": [],
    "proximos_passos": []
  }],
  "lacunas": []
}
```

Sem resultado, `estado` é `evidencia_insuficiente` e `lacunas` contém
`nenhum_evento_no_periodo`.

### `buscar_eventos`

```http
POST /v1/buscar
```

```json
{
  "texto": "busca textual gratuita",
  "projeto": "Cognitive Ledger",
  "assuntos": ["custo zero"],
  "tipos": ["decisao"],
  "limite": 8,
  "inicio": "2026-08-20T00:00:00Z",
  "fim": "2026-08-23T00:00:00Z"
}
```

O corpo tem no máximo 32 KiB. Na API, uma consulta só com filtros é válida; na
tool MCP, `texto` é obrigatório e possui de 1 a 4096 caracteres.

Resposta mínima:

```json
{
  "estado": "ok",
  "degradado": true,
  "eventos": [{ "id": "ec-lab-002", "timestamp": "...", "tipo": "...", "status": "...", "titulo": "...", "resumo": "...", "contexto": "...", "projetos": [], "assuntos": [], "ideias": [], "decisoes": [], "hipoteses": [], "questoes_abertas": [], "proximos_passos": [] }],
  "lacunas": [],
  "ranking": [{
    "evento_id": "ec-lab-002",
    "score_total": 0.25,
    "score_textual": 0.4,
    "score_semantico": 0,
    "score_recencia": 1
  }]
}
```

No lab textual, `degradado=true` significa somente que a parcela semântica não
foi usada; não é fallback para uma API paga.

### `recuperar_contexto`

```http
POST /v1/contexto
```

```json
{
  "objetivo": "retomar integração com busca textual gratuita",
  "limite": 8,
  "projeto": "Cognitive Ledger",
  "assuntos": ["integracao"],
  "tipos": ["decisao"]
}
```

Aceita os mesmos filtros e limite da busca. A API aceita `texto` ou `objetivo`;
a tool MCP exige `objetivo` com 1 a 4096 caracteres.

Resposta mínima:

```json
{
  "estado": "ok",
  "degradado": true,
  "eventos": [],
  "decisoes": [],
  "hipoteses": [],
  "questoes_abertas": [],
  "proximos_passos": [],
  "lacunas": [],
  "conflitos": [{ "origem": "...", "destino": "...", "tipo": "revisa" }]
}
```

`estado` pode ser `ok`, `conflito_de_contexto` ou
`evidencia_insuficiente`.

### `ler_fonte_bruta`

```http
POST /v1/fonte
```

```json
{
  "evento_id": "ec-lab-001",
  "justificativa": "validar a formulação sintética"
}
```

`evento_id` possui 1 a 256 caracteres e `justificativa`, 1 a 1024. Esta rota
exige `ler_fonte_bruta`, capability que um cliente novo não recebe por padrão.

Resposta `200`:

```json
{
  "estado": "ok",
  "degradado": false,
  "fonte": {
    "id": "fonte-lab-001",
    "evento_id": "ec-lab-001",
    "tipo_de_fonte": "teste",
    "provedor": "laboratorio-local",
    "referencia": "fixture://cognitive-ledger/ec-lab-001",
    "escopo_da_captura": "fixture sintetica",
    "conteudo_bruto": "..."
  }
}
```

Fonte inexistente retorna `404` com
`{"estado":"evidencia_insuficiente","erro":"fonte_nao_encontrada"}`.

## Erros e auditoria fail-closed

- `400`/`413`: entrada inválida ou corpo acima do limite;
- `401`: Bearer ausente ou JWT inválido;
- `403`: owner, capability ou rota mutante negada;
- `405`: método não permitido;
- `503`: Auth, backend, recuperação ou auditoria indisponível.

Antes de liberar uma resposta privada, a API insere uma linha em
`auditoria_acessos`. Se o insert falhar, devolve
`503 {"erro":"auditoria_indisponivel"}` e não libera o conteúdo. As quatro
leituras do E2E geram, nessa ordem:

| `operacao` | `fonte_bruta_acessada` | `degradado` |
| --- | --- | --- |
| `ler_diario` | `false` | `false` |
| `buscar_eventos` | `false` | `true` |
| `recuperar_contexto` | `false` | `true` |
| `ler_fonte_bruta` | `true` | `false` |

Todas usam `finalidade=recuperacao_cross_chat`, o `client_id` do JWT, IDs
retornados e quantidade; somente a última armazena a justificativa.

## Variáveis

Edge Function:

- `SUPABASE_URL` — injetada pelo runtime;
- `SUPABASE_SERVICE_ROLE_KEY` ou `SUPABASE_SECRET_KEYS` — somente na Edge;
- `COGNITIVE_LEDGER_OWNER_ID` — proprietário autorizado;
- `COGNITIVE_LEDGER_EMBEDDING_PROVIDER=disabled` — obrigatório no lab;
- `COGNITIVE_LEDGER_OAUTH_ISSUER` — override permitido apenas para HTTPS ou
  loopback HTTP; usado pelo lab local.

MCP:

- `SUPABASE_URL`;
- `SUPABASE_PUBLISHABLE_KEY`;
- `COGNITIVE_LEDGER_API_URL`;
- `PUBLIC_BASE_URL`;
- `HOST` (opcional, padrão `127.0.0.1`);
- `PORT` (opcional, padrão `3000`).

O MCP não aceita service role, senha Basic ou `OPENAI_API_KEY` como configuração.

## E2E real descartável

Pré-requisitos: Docker, Node.js 22 e `psql`. A Supabase CLI está fixada em
`2.115.0`; `npm ci` verifica o lockfile.

```bash
npm --prefix mcp ci --ignore-scripts --no-audit --no-fund
npm --prefix tools/lab ci --no-audit --no-fund
COGNITIVE_LEDGER_LAB_CONFIRM=1 npm --prefix mcp run test:real:lab
```

O último comando cria um projeto Supabase temporário fora do worktree, sobe
PostgreSQL 17/pgvector e Auth locais, aplica migrations e seed, cria usuário e
JWT ES256 sintéticos, valida o JWT no GoTrue, sobe a Edge Function real e o MCP,
usa o SDK MCP oficial para chamar as quatro tools e encerra/remove tudo no final.
Ele remove `OPENAI_API_KEY` dos processos filhos e falha se observar algo diferente
de:

```text
eventos antes/depois = 3 / 3
embeddings            = 0
auditorias antes/depois = 0 / 4
chamadas pagas        = 0
fingerprint Eventos antes = fingerprint Eventos depois
```

Esse teste cobre JWT real contra o Auth local e JWKS ES256. Ele não simula API,
Postgres ou MCP. O gate cross-repo acrescentou o AppModule MCF real e restringiu
o consumidor às três operações descritas acima. O adapter MCF não está mais
pendente; browser authorization-code + PKCE, OAuth live, ChatGPT e produção
continuam sendo gates separados e não autorizados.
