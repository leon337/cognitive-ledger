# Plano de Implementação — Gravação Operacional com Supabase

> **Para agentes executores:** executar tarefa por tarefa, com teste antes da implementação sempre que houver comportamento observável e com commits pequenos e verificáveis.

**Objetivo:** tornar “registre isso no meu diário” um fluxo persistente no Supabase, recuperável imediatamente e refletido na timeline privada, deixando Git fora do caminho crítico.

**Arquitetura:** o Supabase/Postgres passa a ser a fonte operacional. Uma Edge Function protegida por autenticação própria expõe leitura/escrita para a superfície privada. O servidor Render continua fazendo Basic Auth e atua como proxy; o protótipo público continua usando dados demonstrativos locais. Git permanece como exportação/backup desacoplado.

**Stack:** Supabase Postgres + RLS + Edge Functions (Deno), Node.js no Render, HTML/CSS/JavaScript simples, GitHub como backup/exportação.

**Especificação:** `documentacao/especificacoes/2026-08-21-gravacao-operacional-supabase.md`

## Restrições globais

- Banco dedicado: `cognitive-ledger` (`glyfavvwarffkkthpwlj`).
- Projeto público não pode ler dados reais.
- RLS deve estar habilitado nas tabelas do diário.
- Chaves administrativas nunca podem ir ao frontend.
- Falha de exportação Git não pode bloquear nem desfazer gravação no banco.
- O layout visual final permanece fora do escopo.

---

### Tarefa 1 — Schema, integridade e RLS

**Produz:** tabelas `eventos_cognitivos`, `fontes`, `relacoes` e `configuracao_privada`; índices; RLS habilitado; nenhuma política pública de leitura/escrita.

- [ ] Criar uma migração SQL no Supabase com UUID/text IDs preserváveis, `timestamptz`, arrays `text[]`, `jsonb` para metadados e FKs com `on delete cascade` apenas entre fonte/relação e evento.
- [ ] Habilitar RLS nas quatro tabelas.
- [ ] Não criar policy para `anon` ou `authenticated` nesta etapa; acesso operacional será por Edge Function usando chave secreta do ambiente Supabase.
- [ ] Consultar `pg_tables`/`pg_policies` e verificar schema e ausência de policies públicas.
- [ ] Rodar Security Advisor do Supabase e registrar qualquer alerta relevante.

**Aceite:** tabelas existem, RLS está ativo e não há leitura anônima direta.

### Tarefa 2 — Credencial privada e Edge Function

**Produz:** função `cognitive-ledger-api` com `GET /timeline` e `POST /registros`.

- [ ] Gerar salt aleatório e armazenar em `configuracao_privada` apenas `usuario`, `salt` e hash SHA-256 de `salt + senha`; nunca salvar a senha bruta.
- [ ] Implementar função que exige `Authorization: Basic ...`, compara hash em tempo constante e retorna 401 quando inválido.
- [ ] `GET /timeline`: ler eventos, fontes e relações com cliente administrativo; ordenar eventos por timestamp desc; devolver exatamente o contrato consumido pelo frontend (`meta`, `tipos`, `projetos`, `registros`).
- [ ] `POST /registros`: validar `id`, `timestamp`, `tipo`, `titulo`, `resumo`; inserir evento + fontes + relações em transação lógica idempotente por `id`; responder 201 na criação e 409 em colisão incompatível.
- [ ] Implantar com `verify_jwt: false`, porque a função usa autenticação Basic própria; usar `SUPABASE_SECRET_KEYS`/fallback `SUPABASE_SERVICE_ROLE_KEY` somente dentro da Edge Function.
- [ ] Verificar 401 sem credencial e leitura autorizada por chamada de teste controlada.

**Aceite:** endpoint não é publicamente legível e devolve timeline apenas com credencial correta.

### Tarefa 3 — Servidor privado como proxy

**Arquivos:**
- Modificar: `servidor-diario.mjs`
- Criar: `testes/servidor-diario.test.mjs`

**Produz:** `/api/timeline` e `/api/registros` no Render, mantendo Basic Auth existente.

- [ ] Escrever testes para: 401 sem Basic Auth; proxy preserva Authorization; falha upstream retorna 502 sem vazar corpo sensível; arquivos estáticos continuam servidos.
- [ ] Rodar testes e confirmar falha antes da implementação.
- [ ] Implementar proxy via `fetch` nativo do Node para `COGNITIVE_LEDGER_API_URL`.
- [ ] Adicionar `Cache-Control: no-store, private` e manter headers anti-indexação.
- [ ] Rodar testes até passarem.

**Aceite:** navegador privado fala apenas com Render; frontend não recebe chave Supabase.

### Tarefa 4 — Timeline privada passa a carregar do banco

**Arquivos:**
- Modificar: `site/scripts/aplicacao.js`
- Modificar: `scripts/gerar-site-privado.mjs`
- Modificar: `scripts/validar-site-privado.mjs`
- Preservar: `site/dados/registros.js` como demonstração pública

**Produz:** mesma aplicação funciona em dois modos: demo pública com `window.DADOS_COGNITIVE_LEDGER`; privada sem dados pré-carregados, buscando `/api/timeline`.

- [ ] Escrever teste estrutural privado exigindo que a projeção privada não contenha registros reais embutidos em `dados/registros.js`.
- [ ] Alterar inicialização de `aplicacao.js`: se houver `window.DADOS_COGNITIVE_LEDGER`, usar dados locais; caso contrário, buscar `/api/timeline` e só então iniciar mapas/filtros/renderização.
- [ ] Alterar gerador privado para copiar o site e sobrescrever `dados/registros.js` com `window.DADOS_COGNITIVE_LEDGER = null;` em vez de ler `diario/`.
- [ ] Atualizar validador privado para verificar modo remoto e ausência de conteúdo canônico embutido.
- [ ] Rodar validações pública e privada.

**Aceite:** demo pública continua com demos; timeline privada depende do banco em runtime.

### Tarefa 5 — Migrar o histórico para o banco

**Fontes:**
- `diario/2026/08/...` para eventos já canônicos;
- `site/dados/registros.js` para reconstruções históricas aprovadas.

**Produz:** seis eventos históricos visíveis no banco, com proveniência honesta.

- [ ] Inserir os dois eventos já canônicos preservando IDs/timestamps.
- [ ] Inserir os quatro registros históricos restantes como `reconstrucao_historica`, sem alegar transcrição literal; manter metadados de origem no campo `metadados`/`fontes`.
- [ ] Consultar contagem e títulos; esperado nesta etapa: 6 eventos históricos.
- [ ] Verificar que todos possuem fonte/proveniência representável.

**Aceite:** timeline do banco contém 6 eventos históricos e nenhuma demo é apresentada como fonte bruta original.

### Tarefa 6 — Teste real de duas gravações consecutivas

**Produz:** evidência de que o comportamento cotidiano não depende do GitHub.

- [ ] Criar registro de teste A pelo caminho operacional do banco.
- [ ] Ler A de volta imediatamente por ID.
- [ ] Criar registro de teste B consecutivo.
- [ ] Ler B de volta imediatamente por ID.
- [ ] Verificar `/api/timeline` contendo ambos sem qualquer commit Git entre as duas gravações.
- [ ] Remover ou marcar os dois registros como `teste` conforme decisão do produto, sem alterar a evidência de execução.

**Aceite:** duas gravações consecutivas funcionam sem criar arquivos Git.

### Tarefa 7 — Exportação Git desacoplada

**Produz:** exportador separado; falha não afeta banco.

- [ ] Criar script `scripts/exportar-supabase-para-git.mjs` que recebe snapshot JSON por arquivo/entrada controlada e gera Markdown determinístico em `diario/` e `fontes/` preservando IDs/timestamps.
- [ ] Criar teste de idempotência: mesma entrada gera o mesmo caminho/conteúdo.
- [ ] Não executar exportação dentro do POST de gravação.
- [ ] Documentar que exportação é rotina separada/manual nesta fase.

**Aceite:** escrita operacional permanece funcional mesmo que exportação Git não rode.

### Tarefa 8 — Deploy, segurança e auditoria final

**Produz:** serviço privado atualizado e evidência final.

- [ ] Configurar `COGNITIVE_LEDGER_API_URL` no serviço Render privado.
- [ ] Aguardar auto-deploy do branch e verificar status `live`.
- [ ] Validar logs sem segredos e sem conteúdo bruto desnecessário.
- [ ] Rodar Security Advisor novamente após schema/function.
- [ ] Verificar que o protótipo público continua demonstrativo e sem acesso ao banco.
- [ ] Verificar no navegador privado que os 6 históricos aparecem.
- [ ] Executar mais um “registre isso no meu diário” real e confirmar persistência + timeline antes de declarar concluído.

**Aceite final:** gravação, leitura, timeline, privacidade e desacoplamento do Git têm evidência compatível com a especificação.
