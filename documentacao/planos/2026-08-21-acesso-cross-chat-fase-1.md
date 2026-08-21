# Acesso Cross-Chat ao Cognitive Ledger — Fase 1 — Plano de Implementação

> **Para agentes executores:** SUB-SKILL OBRIGATÓRIA na execução: usar desenvolvimento orientado a tarefas com revisão entre etapas. Cada comportamento novo segue RED → GREEN → REFACTOR, com commits pequenos e verificáveis.

**Objetivo:** permitir que um chat novo autorizado consulte o Cognitive Ledger por MCP remoto, recupere contexto profissional relevante com busca híbrida e use esse contexto sem confundir memória registrada com inferência atual.

**Arquitetura:** preservar o diário privado atual e adicionar um segundo boundary somente leitura: `ChatGPT/MCF → OAuth 2.1 → MCP remoto → cognitive-ledger-api → Supabase/Postgres`. A API valida proprietário, `client_id` e capacidades, executa recuperação híbrida, persiste auditoria antes de devolver conteúdo e mantém fontes brutas separadas. A busca semântica usa embeddings multilíngues no mesmo Postgres por `pgvector`; falha semântica degrada para texto/filtros sem inventar memória.

**Tech Stack:** Supabase Postgres + RLS + Auth OAuth 2.1 + Edge Functions (Deno) + pgvector; OpenAI Embeddings `text-embedding-3-large` com `dimensions=1024`; Node.js + `@modelcontextprotocol/sdk` para o MCP remoto; Render para hosting; `node:test`/Deno tests para TDD.

**Especificação:** `documentacao/especificacoes/2026-08-21-acesso-cross-chat-fase-1.md`

## Restrições globais

- Fase 1 cross-chat é **somente leitura**.
- `registrar_no_diario`, administração e SQL não são capacidades MCP desta fase.
- O caminho operacional existente `navegador → Render privado → cognitive-ledger-api → Supabase` deve continuar funcionando.
- Supabase/Postgres continua sendo a única fonte operacional de verdade; Git continua fora do caminho crítico.
- Clientes externos nunca recebem segredo administrativo do Supabase nem a credencial interna usada pelo diário privado.
- A identidade do proprietário é diferente da identidade do cliente OAuth/MCP.
- Capacidades normais: `ler_diario`, `buscar_eventos`, `recuperar_contexto`.
- `ler_fonte_bruta` é capacidade separada e não é concedida por padrão.
- Toda leitura precisa de auditoria; falha de auditoria é **fail closed**.
- O prompt completo e a conversa integral não entram na auditoria por padrão.
- Registro Cognitivo é a camada de recuperação normal; `conteudo_bruto` não sai em ferramentas normais.
- Ausência de evidência, conflito e degradação semântica devem aparecer explicitamente.
- O protótipo público não recebe nenhuma rota, token ou dado real do Ledger.
- O pacote de contexto usa `limite=8` por padrão e máximo absoluto de `12` eventos.
- Embeddings de eventos e consultas usam o mesmo modelo e dimensão: `text-embedding-3-large`, `1024` dimensões.
- A geração de embedding não pode transformar a escrita operacional existente em uma operação dependente da OpenAI.

## Gates externos antes da execução completa

### Gate G1 — ChatGPT compatível com app MCP personalizado

Antes do Teste A/B no produto, confirmar no ChatGPT web que a conta/workspace permite criar ou conectar um app MCP personalizado em Developer Mode. A documentação atual da OpenAI informa que ChatGPT conecta-se a MCP remoto, que OAuth é suportado e que usuários Pro podem conectar MCPs de leitura; disponibilidade de full MCP varia por plano.

**Se G1 falhar:** continuar validação técnica via MCP Inspector/cliente MCP, mas marcar Testes A/B no ChatGPT como `BLOQUEADOS`.

### Gate G2 — OAuth Supabase ↔ ChatGPT

Usar Supabase Auth OAuth 2.1 como provedor preferencial porque suporta PKCE, refresh tokens, OIDC, `client_id` no access token e registro dinâmico de clientes MCP. Antes de consolidar o deploy, executar um login real pelo ChatGPT e confirmar que autorização inicial e renovação/reautorização funcionam.

**Se G2 falhar:** não criar protocolo OAuth proprietário silenciosamente; voltar ao MESTRE com evidência e abrir gate arquitetural.

### Gate G3 — identidade do proprietário

Criar/confirmar exatamente uma identidade do proprietário no Supabase Auth. O usuário deve escolher o endereço de e-mail usado para a autenticação; ele não deve ser inferido nem commitado. Para a Fase 1, preferir magic link no fluxo de autorização em vez de introduzir outra senha.

### Gate G4 — chave da OpenAI para embeddings

A Edge Function precisa de `OPENAI_API_KEY` como secret do Supabase. Se não existir, criar/configurar por canal seguro; nunca escrever a chave no repositório, plano, logs ou conversa. Sem G4, texto/filtros podem ser testados, mas o Teste A não pode ser declarado aprovado pelo caminho semântico.

## Referências técnicas verificadas durante o planejamento

- OpenAI — Developer mode and MCP apps in ChatGPT: `https://help.openai.com/en/articles/12584461-developer-mode-and-full-mcp-connectors-in-chatgpt`
- Supabase — OAuth 2.1 Server: `https://supabase.com/docs/guides/auth/oauth-server`
- Supabase — OAuth flows: `https://supabase.com/docs/guides/auth/oauth-server/oauth-flows`
- Supabase — Semantic search: `https://supabase.com/docs/guides/ai/semantic-search`
- Supabase — Edge Function background tasks: `https://supabase.com/docs/guides/functions/background-tasks`
- OpenAI — Embeddings: `https://platform.openai.com/docs/guides/embeddings`

---

## Mapa de arquivos

### Novos

- `supabase/migrations/20260821_cross_chat_fase1.sql` — tabelas de clientes/auditoria, `pgvector`, coluna de embedding e RPC de ranking.
- `supabase/functions/cognitive-ledger-api/index.ts` — fonte versionada da Edge Function implantada.
- `supabase/functions/cognitive-ledger-api/lib/autorizacao.ts` — Basic legado + OAuth Bearer + capacidades.
- `supabase/functions/cognitive-ledger-api/lib/auditoria.ts` — persistência fail-closed da auditoria.
- `supabase/functions/cognitive-ledger-api/lib/embeddings.ts` — texto canônico, chamada de embedding e reindexação.
- `supabase/functions/cognitive-ledger-api/lib/recuperacao.ts` — filtros, ranking, relações e Pacote de Contexto.
- `supabase/functions/cognitive-ledger-api/lib/contratos.ts` — tipos de entrada/saída e limites.
- `supabase/functions/cognitive-ledger-api/testes/*.test.ts` — testes Deno dos boundaries novos.
- `mcp/package.json` + `mcp/package-lock.json` — serviço MCP isolado.
- `mcp/src/servidor.mjs` — `/mcp`, health e metadata OAuth.
- `mcp/src/cliente-ledger.mjs` — cliente HTTP que encaminha Bearer à API.
- `mcp/src/ferramentas.mjs` — descritores e handlers MCP.
- `mcp/src/oauth.mjs` — metadata do recurso protegido e validação local do token.
- `mcp/public/oauth/consent.html` + `consent.js` — UI mínima de login/consentimento Supabase OAuth.
- `mcp/testes/*.test.mjs` — testes Node do MCP.
- `documentacao/auditorias/2026-08-21-validacao-cross-chat-fase-1.md` — evidência final dos Testes A/B e segurança.

### Modificados

- `documentacao/especificacoes/2026-08-21-acesso-cross-chat-fase-1.md` — status passa a `ESPECIFICAÇÃO APROVADA / IMPLEMENTAÇÃO PLANEJADA`.
- `documentacao/captura-e-recuperacao.md` — remover a afirmação defasada de que o teste natural de gravação ainda estava pendente.
- `documentacao/autenticacao-e-recuperacao-de-acesso.md` — registrar OAuth cross-chat sem substituir o login privado atual.
- `.github/workflows/validar-prototipo.yml` — incluir testes Node do servidor privado e MCP; manter validação do protótipo.
- Edge Function implantada `cognitive-ledger-api` — novos endpoints Bearer; endpoints Basic atuais preservados.

---

### Tarefa 1 — Baseline versionado e limpeza do boundary atual

**Files:**
- Create: `supabase/functions/cognitive-ledger-api/index.ts`
- Test: `testes/servidor-diario.test.mjs`
- Verify: `servidor-diario.mjs`, `servidor-diario-core.mjs`, `acesso-diario.mjs`

**Interfaces:**
- Consumes: Edge Function atualmente implantada com `GET /timeline` e `POST /registros`.
- Produces: fonte versionada idêntica ao runtime antes de qualquer extensão cross-chat.

- [ ] **Step 1: capturar baseline** — obter a fonte da Edge Function implantada e gravar exatamente em `supabase/functions/cognitive-ledger-api/index.ts`, sem refatoração neste commit.
- [ ] **Step 2: verificar sintaxe/baseline** — rodar `deno check supabase/functions/cognitive-ledger-api/index.ts` e `node --test testes/servidor-diario.test.mjs`.
- [ ] **Step 3: confirmar credencial residual** — buscar `COGNITIVE_LEDGER_API_CREDENTIAL` no código. Esperado: zero usos; `COGNITIVE_LEDGER_SENHA` continua sendo a credencial interna Render → API.
- [ ] **Step 4: limpar variável residual no Render** somente após Step 3, disparar o deploy necessário e verificar nos logs `API operacional validada`.
- [ ] **Step 5: smoke perceptivo** — confirmar que a timeline privada continua acessível e contém os registros reais atuais.
- [ ] **Step 6: commit** — `git commit -m "chore: versionar baseline da api do ledger"`.

**Aceite:** fonte da Edge Function está no Git, suíte privada continua verde e a variável residual foi removida sem quebrar o diário.

---

### Tarefa 2 — Schema de identidade de clientes, auditoria e vetores

**Files:**
- Create: `supabase/migrations/20260821_cross_chat_fase1.sql`
- Test: consultas SQL de verificação após migration.

**Interfaces:**
- Produces:
  - `clientes_autorizados(client_id, owner_id, rotulo, capacidades, ativo, revogado_em, metadados)`
  - `auditoria_acessos(...)`
  - `eventos_cognitivos.embedding vector(1024)`
  - RPC `buscar_eventos_hibrido(...)`.

- [ ] **Step 1: escrever verificação RED** — antes da migration, executar consultas a `information_schema`/`pg_extension` comprovando que `clientes_autorizados`, `auditoria_acessos` e `eventos_cognitivos.embedding` ainda não existem e `vector` ainda não está habilitado.
- [ ] **Step 2: criar migration mínima** com este núcleo:

```sql
create extension if not exists vector with schema extensions;
create extension if not exists pg_trgm with schema extensions;

create table public.clientes_autorizados (
  client_id text primary key,
  owner_id uuid not null,
  rotulo text not null,
  capacidades text[] not null default '{}',
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  revogado_em timestamptz,
  metadados jsonb not null default '{}'
);
alter table public.clientes_autorizados enable row level security;

create table public.auditoria_acessos (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  client_id text not null,
  operacao text not null,
  finalidade text not null,
  evento_ids text[] not null default '{}',
  quantidade integer not null default 0,
  fonte_bruta_acessada boolean not null default false,
  justificativa_fonte_bruta text,
  resultado text not null,
  degradado boolean not null default false,
  erro_codigo text,
  criado_em timestamptz not null default now()
);
alter table public.auditoria_acessos enable row level security;

alter table public.eventos_cognitivos
  add column embedding extensions.vector(1024),
  add column embedding_model text,
  add column embedding_atualizado_em timestamptz;
```

- [ ] **Step 3: criar índice vetorial** — HNSW com `vector_cosine_ops` em `eventos_cognitivos.embedding`.
- [ ] **Step 4: criar RPC de ranking** `buscar_eventos_hibrido(query_embedding vector(1024), query_text text, filtro_projetos text[], filtro_assuntos text[], filtro_tipos text[], inicio timestamptz, fim timestamptz, limite int)` com limite máximo 12 e score composto:
  - similaridade semântica: 0,60;
  - melhor similaridade textual (`titulo`, `resumo`, `contexto`): 0,25;
  - recência normalizada: 0,15.
  Embedding `NULL` recebe componente semântico zero, permitindo fallback textual.
- [ ] **Step 5: travar execução pública** — revogar execute da RPC para `public`, `anon` e `authenticated`; conceder somente ao `service_role`.
- [ ] **Step 6: executar migration e verificar GREEN** — tabelas existem, RLS ligado, nenhuma policy pública criada, colunas vetoriais com 1024 dimensões e RPC não executável pelos papéis públicos.
- [ ] **Step 7: Security Advisor** — registrar qualquer WARN/ERROR novo; não aceitar regressão silenciosa.
- [ ] **Step 8: commit** — `git commit -m "feat: adicionar schema cross-chat e auditoria"`.

**Aceite:** schema suporta owner único + múltiplos clientes, auditoria e ranking híbrido sem abrir tabelas ao frontend.

---

### Tarefa 3 — OAuth 2.1 do proprietário e consentimento MCP

**Files:**
- Create: `mcp/public/oauth/consent.html`
- Create: `mcp/public/oauth/consent.js`
- Create: `mcp/src/oauth.mjs`
- Test: `mcp/testes/oauth.test.mjs`

**Interfaces:**
- Consumes: Supabase Auth OAuth 2.1, `SUPABASE_URL`, publishable key.
- Produces: autorização de cliente com JWT contendo `sub` e `client_id`, sem usar a senha do diário privado.

- [ ] **Step 1: GATE G3** — usuário informa qual e-mail será a identidade do proprietário; criar/confirmar usuário Supabase Auth por mecanismo de magic link. O endereço não entra em Git.
- [ ] **Step 2: configurar assinatura assimétrica** — usar RS256 ou ES256 e confirmar JWKS público antes de continuar.
- [ ] **Step 3: habilitar OAuth 2.1 Server** e registro dinâmico de clientes MCP; configurar authorization path para `https://<host-mcp>/oauth/consent` quando o serviço remoto existir.
- [ ] **Step 4: escrever teste RED do metadata** — `oauth.test.mjs` espera resposta JSON em `/.well-known/oauth-protected-resource` com `resource` apontando para `/mcp` e `authorization_servers` contendo `${SUPABASE_URL}/auth/v1`.
- [ ] **Step 5: implementar `metadataRecursoProtegido(baseUrl, supabaseUrl)`** em `mcp/src/oauth.mjs` e fazer teste passar.
- [ ] **Step 6: implementar consent UI mínima** com `supabase-js`: ler `authorization_id`, consultar `supabase.auth.oauth.getAuthorizationDetails`, exigir sessão do proprietário, permitir magic link se necessário, renderizar nome/redirect URI e usar `approveAuthorization`/`denyAuthorization`.
- [ ] **Step 7: verificar boundary** — consent UI usa somente URL + publishable key; nenhum secret/service-role é enviado ao navegador.
- [ ] **Step 8: GATE G2 probe** — completar uma autorização OAuth real em cliente de teste/MCP Inspector e verificar access token válido, presença de `client_id`, refresh/reautorização e revogação do grant.
- [ ] **Step 9: commit** — `git commit -m "feat: adicionar oauth do cliente mcp"`.

**Aceite:** um cliente OAuth autorizado pelo proprietário recebe token verificável com `client_id`; revogação invalida seu acesso sem afetar o login privado.

---

### Tarefa 4 — Autorização Bearer por cliente e auditoria fail-closed

**Files:**
- Create: `supabase/functions/cognitive-ledger-api/lib/autorizacao.ts`
- Create: `supabase/functions/cognitive-ledger-api/lib/auditoria.ts`
- Create: `supabase/functions/cognitive-ledger-api/lib/contratos.ts`
- Test: `supabase/functions/cognitive-ledger-api/testes/autorizacao.test.ts`
- Test: `supabase/functions/cognitive-ledger-api/testes/auditoria.test.ts`
- Modify: `supabase/functions/cognitive-ledger-api/index.ts`

**Interfaces:**
- Produces:
  - `autenticarClienteOAuth(req): Promise<{ ownerId: string; clientId: string }>`
  - `exigirCapacidade(clientId, capacidade)`
  - `auditarLeitura(entrada): Promise<void>`; qualquer falha gera `AUDITORIA_INDISPONIVEL`.

- [ ] **Step 1: RED — bearer obrigatório** — testes exigem 401 quando `/v1/*` não recebe Bearer e rejeitam Basic nessas rotas.
- [ ] **Step 2: RED — owner errado** — token válido com `sub` diferente de `COGNITIVE_LEDGER_OWNER_ID` deve resultar 403.
- [ ] **Step 3: RED — capacidades/revogação** — cliente inativo ou sem capacidade recebe 403; revogar A não afeta B.
- [ ] **Step 4: implementar validação JWT** usando claims Supabase verificadas, exigindo `iss`, `aud=authenticated`, `exp`, `sub` e `client_id`. Não confiar em JWT apenas decodificado.
- [ ] **Step 5: registrar cliente autorizado** — no primeiro request aprovado do owner, `upsert` por `client_id` com capacidades padrão `['ler_diario','buscar_eventos','recuperar_contexto']` e `ativo=true`. Não incluir `ler_fonte_bruta`.
- [ ] **Step 6: RED — auditoria falha fechada** — simular falha de insert em `auditoria_acessos`; resposta deve ser 503 e corpo não pode conter título/resumo/eventos.
- [ ] **Step 7: implementar `auditarLeitura`** com campos aprovados: client, operação, finalidade resumida, IDs, quantidade, fonte bruta, justificativa, resultado, degradado, erro_codigo.
- [ ] **Step 8: preservar Basic legado** — testes provam que `GET /timeline` e `POST /registros` continuam usando o mecanismo interno atual e que Bearer não ganha escrita.
- [ ] **Step 9: GREEN completo** — rodar `deno test supabase/functions/cognitive-ledger-api/testes --allow-env --allow-net` com mocks de DB/rede; zero falhas.
- [ ] **Step 10: commit** — `git commit -m "feat: autorizar clientes oauth e auditar leituras"`.

**Aceite:** OAuth está separado do Basic legado; cada cliente tem capacidade/revogação própria e nenhuma leitura privada é entregue sem auditoria persistida.

---

### Tarefa 5 — Indexação semântica multilíngue sem bloquear gravação

**Files:**
- Create: `supabase/functions/cognitive-ledger-api/lib/embeddings.ts`
- Test: `supabase/functions/cognitive-ledger-api/testes/embeddings.test.ts`
- Modify: `supabase/functions/cognitive-ledger-api/index.ts`

**Interfaces:**
- Produces:
  - `textoParaEmbedding(evento): string`
  - `gerarEmbedding(texto): Promise<number[1024]>`
  - `indexarEvento(id): Promise<void>`
  - internal Basic-only `POST /admin/reindexar`.

- [ ] **Step 1: GATE G4** — configurar `OPENAI_API_KEY` em Supabase Edge Function secret, nunca no cliente/MCP.
- [ ] **Step 2: RED — texto determinístico** — dado o mesmo Evento Cognitivo, `textoParaEmbedding` produz exatamente o mesmo texto com título, resumo, contexto, assuntos, projetos, ideias, decisões, hipóteses, questões abertas e próximos passos.
- [ ] **Step 3: RED — dimensão/modelo** — mock da API OpenAI exige `model='text-embedding-3-large'` e `dimensions=1024`; resposta fora de 1024 deve falhar.
- [ ] **Step 4: implementar `gerarEmbedding`** por HTTPS server-side para `/v1/embeddings`; nunca logar chave nem vetor integral.
- [ ] **Step 5: indexar após gravação sem bloquear** — depois de `registrar_evento_cognitivo` retornar sucesso, chamar `EdgeRuntime.waitUntil(indexarEvento(id))`. Se a indexação falhar, o evento continua salvo e recuperável por texto/filtros.
- [ ] **Step 6: criar `/admin/reindexar`** protegido exclusivamente pelo Basic interno atual; ele seleciona eventos sem embedding ou com `embedding_model` divergente e processa lotes pequenos.
- [ ] **Step 7: backfill dos eventos atuais** — executar reindexação, verificar `embedding is not null`, `embedding_model='text-embedding-3-large:1024'` para todos os Eventos Cognitivos atuais.
- [ ] **Step 8: teste de degradação** — indisponibilidade simulada da OpenAI não pode quebrar `POST /registros` e deve deixar evento com embedding nulo até reprocessamento.
- [ ] **Step 9: commit** — `git commit -m "feat: indexar eventos para busca semantica"`.

**Aceite:** eventos novos podem ganhar embedding em background, os atuais estão indexados e uma falha do provedor não desfaz nem bloqueia gravação.

---

### Tarefa 6 — API cross-chat de leitura e Pacote de Contexto

**Files:**
- Create: `supabase/functions/cognitive-ledger-api/lib/recuperacao.ts`
- Test: `supabase/functions/cognitive-ledger-api/testes/recuperacao.test.ts`
- Modify: `supabase/functions/cognitive-ledger-api/index.ts`

**Interfaces HTTP Bearer-only:**
- `GET /v1/diario?limite=8&inicio=&fim=&projeto=&tipos=`
- `POST /v1/buscar`
- `POST /v1/contexto`
- `POST /v1/fonte`

**Contratos:**

```ts
type ResultadoRecuperacao = {
  estado: 'ok' | 'evidencia_insuficiente' | 'conflito_de_contexto';
  degradado: boolean;
  eventos: RegistroCognitivo[];
  lacunas: string[];
  conflitos: Array<{ origem: string; destino: string; tipo: string }>;
};
```

- [ ] **Step 1: RED — `ler_diario`** — ordenar por data desc, aplicar filtros estruturados, default 8, hard max 12, nunca devolver `conteudo_bruto`.
- [ ] **Step 2: implementar `GET /v1/diario`** e auditar com operação `ler_diario` antes de devolver JSON.
- [ ] **Step 3: RED — busca semântica não literal** — consulta equivalente a “quando percebi que a equipe funcionava como planejado?” precisa recuperar o evento `Materialização profissional do ecossistema MCF + Cognitive Ledger` no conjunto superior quando embeddings estão disponíveis.
- [ ] **Step 4: implementar `POST /v1/buscar`** chamando `buscar_eventos_hibrido`; aplicar filtros antes do ranking; score baixo/nenhum candidato retorna `evidencia_insuficiente` em vez de forçar resposta.
- [ ] **Step 5: RED — fallback** — forçar falha de embedding da consulta; resposta usa texto/filtros, `degradado=true` e é auditada como degradada.
- [ ] **Step 6: RED — pacote epistemológico** — `POST /v1/contexto` deve preservar arrays de decisões, hipóteses, questões abertas e próximos passos; a API não escreve uma recomendação final.
- [ ] **Step 7: relações e conflitos** — após ranking inicial, seguir relações de primeiro grau apenas dentro do hard max 12. Marcar conflito somente quando houver relação explícita do conjunto `{contradiz, revisa, substitui}`; não inventar conflito por semelhança textual.
- [ ] **Step 8: RED — fonte bruta** — `/v1/fonte` falha 403 sem `ler_fonte_bruta`, falha 400 sem justificativa não vazia e, quando permitido, retorna somente a fonte do evento solicitado.
- [ ] **Step 9: implementar `/v1/fonte`** e auditar `fonte_bruta_acessada=true` + justificativa antes de entregar o corpo.
- [ ] **Step 10: garantir read-only** — qualquer Bearer em `/registros`, `/admin/*` ou método mutante não previsto retorna 403/405 sem executar RPC de escrita.
- [ ] **Step 11: commit** — `git commit -m "feat: expor recuperacao cross-chat somente leitura"`.

**Aceite:** API entrega registros e contexto pequeno, semanticamente útil, epistemicamente fiel, auditado e sem fonte bruta implícita.

---

### Tarefa 7 — Servidor MCP remoto tool-only

**Files:**
- Create: `mcp/package.json`
- Create: `mcp/package-lock.json`
- Create: `mcp/src/servidor.mjs`
- Create: `mcp/src/cliente-ledger.mjs`
- Create: `mcp/src/ferramentas.mjs`
- Modify/Create: `mcp/src/oauth.mjs`
- Test: `mcp/testes/ferramentas.test.mjs`
- Test: `mcp/testes/servidor.test.mjs`

**Interfaces MCP:**
- `ler_diario`
- `buscar_eventos`
- `recuperar_contexto`
- `ler_fonte_bruta` (registrada, mas negada pelo backend se capability não estiver concedida)

- [ ] **Step 1: inicializar package** — `npm --prefix mcp init -y` e instalar `@modelcontextprotocol/sdk`, `zod`, `express`, `jose`; commit do `package-lock.json` fixa versões resolvidas.
- [ ] **Step 2: RED — descritores** — testes exigem nomes exatos, `readOnlyHint: true`, `destructiveHint: false` e schemas com limites (`1..12`).
- [ ] **Step 3: implementar `registrarFerramentas(server, cliente)`** sem lógica de negócio duplicada; cada handler apenas valida input, chama a rota correspondente e preserva `estado`, `degradado`, IDs e proveniência.
- [ ] **Step 4: RED — token obrigatório** — `/mcp` sem Bearer retorna 401 com metadata OAuth apropriada; token inválido não chama a API.
- [ ] **Step 5: implementar validação local em `oauth.mjs`** via JWKS do Supabase, verificando issuer, audience, exp, `sub` e `client_id`; a API revalida novamente, por defesa em profundidade.
- [ ] **Step 6: implementar `cliente-ledger.mjs`**: encaminhar exatamente `Authorization: Bearer <token>` para a Edge Function; nunca aceitar service-role/internal Basic no ambiente MCP.
- [ ] **Step 7: implementar Streamable HTTP MCP em `/mcp`** e `GET /health` sem dados privados; servir também OAuth metadata e consent UI.
- [ ] **Step 8: RED — propagação de erro** — 401/403/503/evidência insuficiente da API devem chegar ao modelo como estado explícito; handler não cria conteúdo substituto.
- [ ] **Step 9: rodar `npm --prefix mcp test`**; zero falhas.
- [ ] **Step 10: commit** — `git commit -m "feat: adicionar servidor mcp somente leitura"`.

**Aceite:** MCP remoto expõe apenas as quatro ferramentas previstas e nenhum segredo administrativo, mantendo autenticação OAuth e sem interpretar o diário por conta própria.

---

### Tarefa 8 — CI, deploy remoto e conexão ChatGPT

**Files:**
- Modify: `.github/workflows/validar-prototipo.yml`
- Render: criar serviço `cognitive-ledger-mcp` separado do diário privado.

**Runtime MCP:**
- Build: `npm --prefix mcp ci`
- Start: `npm --prefix mcp start`
- Endpoint: `https://<servico-mcp>.onrender.com/mcp`

**Env permitidas no MCP:**
- `COGNITIVE_LEDGER_API_URL`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `PUBLIC_BASE_URL`
- `PORT`

**Não permitidas no MCP:** service role, secret key Supabase, credencial Basic interna do diário, senha humana, `OPENAI_API_KEY`.

- [ ] **Step 1: ampliar CI** — incluir `node --test testes/servidor-diario.test.mjs`, `npm --prefix mcp ci` e `npm --prefix mcp test`; manter validação existente do site.
- [ ] **Step 2: criar serviço Render separado** e configurar apenas env permitidas; verificar que logs não imprimem Authorization/token.
- [ ] **Step 3: validar `/health`, OAuth metadata e `/mcp` remoto** com MCP Inspector.
- [ ] **Step 4: revogação independente** — autorizar dois clients de teste, revogar A e provar que A recebe 403 enquanto B continua lendo.
- [ ] **Step 5: GATE G1** — no ChatGPT web, habilitar Developer Mode e criar app apontando para o endpoint MCP remoto. Se a conta/plano não permitir, registrar `BLOQUEADO POR PRODUTO CHATGPT` e parar antes de Teste A/B.
- [ ] **Step 6: concluir OAuth no ChatGPT** e usar “Scan Tools”; confirmar que as ferramentas registradas aparecem como leitura.
- [ ] **Step 7: snapshot de segurança** — antes dos testes finais, consultar quantidade de `eventos_cognitivos`, Security Advisor e estado do protótipo público.
- [ ] **Step 8: commit de CI/config docs** — `git commit -m "ci: validar servidor mcp e fluxo cross-chat"`.

**Aceite:** MCP está remoto, autenticado e conectável pelo ChatGPT elegível sem alterar o serviço do diário privado.

---

### Tarefa 9 — Teste A, Teste B e auditoria final

**Files:**
- Create: `documentacao/auditorias/2026-08-21-validacao-cross-chat-fase-1.md`
- Modify: `documentacao/especificacoes/2026-08-21-acesso-cross-chat-fase-1.md`
- Modify: `documentacao/captura-e-recuperacao.md`
- Modify: `documentacao/autenticacao-e-recuperacao-de-acesso.md`

- [ ] **Step 1: Teste A em chat novo** — executar pergunta equivalente a “Acesse meu diário e me explique como surgiu e evoluiu o Cognitive Ledger.” Salvar evidência de que houve consulta visível, recuperação semântica, distinção epistemológica, lacunas e nenhuma escrita.
- [ ] **Step 2: validar auditoria do Teste A** — localizar entrada por `client_id`, operação, IDs devolvidos, quantidade, `fonte_bruta_acessada=false`, resultado sucesso.
- [ ] **Step 3: Teste B em outro chat novo** — executar pergunta equivalente a “Consulte meu diário e me ajude a decidir qual deveria ser o próximo passo do MCF.” Evidenciar separação explícita entre memória recuperada e inferência/recomendação atual.
- [ ] **Step 4: validar auditoria do Teste B** da mesma forma.
- [ ] **Step 5: provar ausência de escrita** — quantidade/IDs de `eventos_cognitivos` antes e depois dos testes devem ser idênticos; qualquer alteração não explicitamente criada pelo usuário reprova a Fase 1.
- [ ] **Step 6: testar fonte bruta** — cliente padrão recebe 403; conceder `ler_fonte_bruta` somente em teste controlado, usar justificativa, verificar retorno mínimo e auditoria específica, então remover a capacidade.
- [ ] **Step 7: testar falha de auditoria em ambiente controlado** — forçar erro de persistência e comprovar 503 sem conteúdo privado.
- [ ] **Step 8: testar degradação semântica** — indisponibilizar geração de embedding de consulta em ambiente de teste e comprovar fallback + `degradado=true`.
- [ ] **Step 9: segurança final** — Security Advisor, logs Render/Supabase sem segredo, protótipo público sem acesso ao DB real, MCP sem service-role.
- [ ] **Step 10: corrigir débito documental** — em `captura-e-recuperacao.md`, substituir a frase de teste natural pendente por estado verificado; não reescrever a história.
- [ ] **Step 11: atualizar documentação de autenticação** com OAuth por cliente e deixar claro que o login humano privado continua separado e que recuperação de senha permanece outra feature.
- [ ] **Step 12: atualizar status da especificação** para `IMPLEMENTADO / VALIDADO FASE 1` somente se todos os critérios A/B e segurança tiverem evidência; caso contrário usar `IMPLEMENTADO COM PENDÊNCIAS` ou `BLOQUEADO` com motivo factual.
- [ ] **Step 13: commit** — `git commit -m "test: validar acesso cross-chat fase 1"`.

**Aceite final:** Testes A e B passam em chats novos, toda leitura possui auditoria, não houve escrita cross-chat, raw source permanece restrita e não há regressão no diário privado ou protótipo público.

---

## Auto-revisão do plano contra a especificação

### Cobertura

- acesso ChatGPT/MCF: Tarefas 3, 7, 8 e 9;
- somente leitura: Tarefas 4, 6, 7 e 9;
- `ler_diario`, `buscar_eventos`, `recuperar_contexto`: Tarefas 6 e 7;
- `ler_fonte_bruta` separado: Tarefas 4, 6, 7 e 9;
- busca híbrida + semântica + filtros + relações + recência: Tarefas 2, 5 e 6;
- identidade por cliente e revogação: Tarefas 2, 3, 4 e 8;
- auditoria fail-closed: Tarefas 2, 4, 6 e 9;
- confiabilidade epistemológica: Tarefa 6 + Testes A/B;
- fallback semântico explícito: Tarefas 5, 6 e 9;
- nenhum segredo no cliente: Tarefas 3, 4, 7, 8 e 9;
- compatibilidade futura com Codex/outros clientes: boundary MCP/OAuth não depende de ChatGPT;
- Teste A e B: Tarefa 9;
- correção do débito `captura-e-recuperacao.md`: Tarefa 9.

### Decisões deliberadamente fora da Fase 1

- interface completa de login do diário privado;
- recuperação de senha do proprietário;
- substituição do Basic Auth do diário privado;
- escrita cross-chat;
- multi-owner/organizações;
- captura automática;
- exportação Git automática.

### Critério de parada

Qualquer falha de autorização, auditoria, isolamento de segredo, Teste A ou Teste B impede o estado `VALIDADO FASE 1`. O executor retorna ao MESTRE com evidência e não reduz silenciosamente o critério de aceite.
