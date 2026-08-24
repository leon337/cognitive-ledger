# Checklist Vivo — Continuidade Cross-Chat do Cognitive Ledger

**Atualizado em:** 2026-08-24

**Estado:** `REAL MCF APPMODULE READ-ONLY LAB E2E PASS / DISCONNECTED / INACTIVE`

**Linha de implementação:**
`design/cognitive-ledger-foundation@e0e715b0105abe0bc636d198e7ebb137d7de9bd7`

**Feature tree validada:** `b882d2808af74858a6ba351fb755bb3843e33ab2`

**MCF integrado:** PR #160, merge
`efe5164290d56f22023f07de073e2ad7c027fb95`, staging exact SHA PASS no run
`32685810702`

Este arquivo descreve o estado comprovado da linha de implementação e a evidência
cross-repo do MCF. O staging aprovado qualificou o SHA do MCF; não representa uma
conexão live do Ledger nem o estado de Supabase, Render, VPS, Vercel, ChatGPT ou produção.

## Resultado desta etapa

- ✅ OpenAI deixou de ser ativada implicitamente por presença de API key.
- ✅ Busca textual local passou a ser o padrão zero-cost.
- ✅ Banco lab reproduzível e seed de três eventos sintéticos foram versionados.
- ✅ Quatro rotas read-only foram implementadas com capability por operação.
- ✅ Auditoria fail-closed ocorre antes da liberação do conteúdo privado.
- ✅ Fonte bruta exige capability adicional e justificativa.
- ✅ Rotas mutantes são negadas na fronteira `/v1` read-only.
- ✅ O path real prefixado da Edge Function é normalizado sem reabrir `/v1/admin`.
- ✅ MCP expõe exatamente quatro ferramentas, todas marcadas read-only.
- ✅ Capsule mínima do Cognitive Ledger foi adicionada para o MCF.
- ✅ Testes provam zero chamada paga no modo lab e zero mutação de Eventos.
- ✅ Supabase CLI 2.115.0, usuário e JWT ES256 são reproduzíveis e sintéticos.
- ✅ E2E real SDK MCP → Edge local → Auth/Postgres/pgvector passou nas quatro leituras.
- ✅ CI cria o diretório do Deno e repete Node, Deno, MCP e o E2E real descartável.
- ✅ Revisão independente e merge do provider pela PR #2.
- ✅ Projeto e `cognitive-ledger.memory.read` registrados no Registry central do MCF.
- ✅ E2E integrado AppModule MCF → MCP → Edge/Auth → PostgREST → banco lab.
- ✅ Adapter integrado em `main` do MCF pela PR #160 e SHA exato aprovado em staging.
- ⬜ Ledger em lab/staging remoto com dados exclusivamente sintéticos.
- ⬜ Conexão ChatGPT após novo gate humano de ativação live.
- ⏸️ Produção e dados reais — fora do escopo e não autorizados.
- ⏸️ Remediação do histórico público — decisão separada ainda pendente.

## Contrato read-only

| Operação | Método/rota | Capability | Regra adicional |
| --- | --- | --- | --- |
| diário | `GET /v1/diario` | `ler_diario` | sem conteúdo bruto |
| busca | `POST /v1/buscar` | `buscar_eventos` | fallback textual sinalizado |
| contexto | `POST /v1/contexto` | `recuperar_contexto` | preserva tipos epistêmicos |
| fonte | `POST /v1/fonte` | `ler_fonte_bruta` | justificativa obrigatória |

O MCP reflete essas operações como `ler_diario`, `buscar_eventos`,
`recuperar_contexto` e `ler_fonte_bruta`. Não registra prompts, resources ou
ferramentas mutantes.

## Invariantes de aceite

```text
provedor padrão                 = disabled
API key sem opt-in              = zero chamadas pagas
modo lab                        = busca textual
limite por recuperação          = 12 eventos
mutação de eventos na leitura   = zero
auditoria antes da resposta     = obrigatória / fail-closed
fonte bruta padrão              = negada
operações expostas pelo MCF     = 3
fonte bruta na fronteira MCF    = bloqueada antes do MCP
payload de memória no MCF       = não persistido
dados do seed                   = exclusivamente sintéticos
capability após teardown        = DISCONNECTED / INACTIVE / LIVE_REQUIRED
deploy remoto do Ledger         = não realizado
```

## Evidências verificadas

| Verificação | Resultado observado |
| --- | --- |
| `deno fmt --check` | aprovado |
| `deno check` da Edge Function | aprovado |
| testes Deno | 29 aprovados, 0 falhas |
| testes Node do servidor/exportação | 10 aprovados, 0 falhas |
| testes MCP, incluindo E2E SDK | 14 aprovados, 0 falhas |
| E2E real MCP SDK → Edge → Postgres | 4 leituras, 4 auditorias, 0 chamadas pagas |
| E2E integrado AppModule MCF → Ledger | 3 operações, 3 auditorias, fonte bruta bloqueada antes do MCP |
| invariantes do E2E integrado | 3 Eventos, 0 embeddings, 0 chamadas pagas, 0 payload de memória persistido no MCF |
| MCF pós-merge | staging PASS no SHA exato `efe5164290d56f22023f07de073e2ad7c027fb95` (run `32685810702`) |
| auditoria npm de MCP e ferramentas lab | 0 vulnerabilidades reportadas |
| banco descartável | 3 eventos, 0 embeddings, fingerprint imutável |

Detalhes e comandos reproduzíveis estão em
[`../auditorias/2026-08-23-lab-readonly-custo-zero.md`](../auditorias/2026-08-23-lab-readonly-custo-zero.md).

## Próxima sequência segura

1. manter `cognitive-ledger.memory.read` desconectada e inativa por padrão;
2. autorizar separadamente um lab remoto descartável, se houver necessidade, sempre
   com JWT, banco e dados sintéticos;
3. validar OAuth live e a conexão ChatGPT somente após um novo gate humano;
4. manter embeddings pagos desabilitados e provar zero chamada paga em cada gate;
5. manter produção e dados reais fechados até autorização própria.

## Gates após a integração

### Gate de ativação live — aberto

O gate de código e laboratório passou. Ativar a capability exige credenciais
pairwise, URL remota autorizada, OAuth live e nova verificação; não exige compra de API.

### Gate de dados reais

Nenhum dado real deve entrar no seed, CI, MCP lab ou evidência versionada. Abertura
desse gate exige política de privacidade e autorização separadas.

### Gate de produção

Produção não faz parte desta linha. Deploy, migração de banco live, rotação de
segredos, DNS e tráfego real precisam de plano e autorização específicos.
