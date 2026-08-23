# Auditoria — Lab Read-Only Custo Zero

**Data:** 2026-08-23

**Branch:** `codex/cognitive-ledger-zero-cost-lab`

**Base imutável:** `origin/design/cognitive-ledger-foundation@842b1fa`

**Escopo:** implementação e verificação local; sem push, deploy ou dados reais.

## Resultado

O caminho mínimo de recuperação cross-chat foi implementado em laboratório com
busca textual gratuita, autenticação/capability, auditoria fail-closed, quatro
rotas read-only e um servidor MCP tool-only. O caminho pago de embeddings existe
apenas como opção explícita e permanece desativado no lab. Um E2E real exerceu o
SDK MCP, a Edge Function local, Supabase Auth e PostgreSQL/pgvector descartável.

## Mudanças rastreáveis

| Commit | Conteúdo |
| --- | --- |
| `57c54f7` | embeddings pagos estritamente opt-in |
| `172a870` | schema, seed e validador do banco lab sintético |
| `e39f365` | quatro rotas read-only com capability e auditoria |
| `e8495f7` | MCP tool-only e testes E2E com o SDK oficial |
| `4866dc5` | fechamento da fronteira exata `/v1/admin` |
| `38583b3` | CI zero-cost incluindo banco descartável |
| `b45be98` | Capsule, README e checkpoint inicial do lab |
| `f4cff51` | normalização fail-closed do prefixo real da Edge Function |
| `7709d5b` | Supabase CLI fixada e OAuth/JWT sintético reproduzível |
| `96e1777` | E2E real MCP SDK → Edge → Auth/Postgres |
| `5442f30` | job CI do E2E real descartável |

O commit que contém esta auditoria e a Capsule deve ser identificado pelo HEAD da
branch revisada; ele não referencia o próprio SHA para evitar evidência circular.

## Contrato implementado

```text
GET  /v1/diario   → ler_diario
POST /v1/buscar   → buscar_eventos
POST /v1/contexto → recuperar_contexto
POST /v1/fonte    → ler_fonte_bruta + justificativa
```

O Bearer validado pelo MCP é encaminhado sem substituição para a API. Cada rota
exige a capability homônima. `ler_fonte_bruta` não pertence ao conjunto padrão de
um novo cliente.

Eventos comuns são projetados sem `conteudo_bruto`. A fonte bruta só é devolvida
depois da autorização específica e da persistência bem-sucedida da auditoria. Se
a auditoria falhar, a API responde com falha e não libera o conteúdo.

## Evidência de custo zero

- `COGNITIVE_LEDGER_EMBEDDING_PROVIDER` normaliza para `disabled` quando ausente,
  desconhecido ou diferente de `openai`;
- uma `OPENAI_API_KEY` isolada não habilita o provedor;
- o E2E da API injeta um gerador pago-espião e comprova contador igual a zero;
- os testes Deno são executados sem permissão `--allow-net` de runtime;
- o seed contém zero embeddings e a busca SQL retorna resultado via `pg_trgm`;
- o E2E real remove `OPENAI_API_KEY` dos processos filhos e usa somente serviços
  locais, JWT ES256 e dados sintéticos;
- a saída observada registrou `chamadas_pagas: 0` e `embeddings: 0`.

## Evidência de imutabilidade

- o E2E da API compara o JSON dos Eventos antes e depois das quatro operações;
- o E2E real calcula o fingerprint SQL dos Eventos antes e depois das quatro
  chamadas do SDK MCP;
- o validador PostgreSQL calcula MD5 determinístico das linhas antes e depois dos
  testes SQL e falha se houver diferença;
- a única escrita autorizada no fluxo de leitura é em `auditoria_acessos`.

## Comandos executados

```bash
deno fmt --check supabase/functions/cognitive-ledger-api
deno check supabase/functions/cognitive-ledger-api/index.ts
deno test --allow-env supabase/functions/cognitive-ledger-api/testes
node --test testes/servidor-diario.test.mjs scripts/testes/exportar-supabase-para-git.test.mjs
npm --prefix mcp test
npm --prefix mcp audit --omit=dev
npm --prefix tools/lab audit --omit=dev
COGNITIVE_LEDGER_LAB_CONFIRM=1 DATABASE_URL=<loopback-lab> scripts/validar-banco-lab.sh
npm --prefix tools/lab ci --no-audit --no-fund
COGNITIVE_LEDGER_LAB_CONFIRM=1 npm --prefix mcp run test:real:lab
```

Resultados observados:

- Deno: 29 aprovados, 0 falhas;
- Node servidor/exportação: 10 aprovados, 0 falhas;
- MCP: 14 aprovados, 0 falhas;
- auditorias npm de MCP e ferramentas lab: 0 vulnerabilidades reportadas;
- PostgreSQL: 3 eventos sintéticos, 0 embeddings, fingerprint imutável;
- E2E real: quatro tools, quatro auditorias, zero chamadas pagas e Eventos
  imutáveis.

O E2E usa `StreamableHTTPClientTransport` do SDK oficial, não um fake de API. O
JWT é assinado por uma chave ES256 gerada para o lab, validado por GoTrue em
`/auth/v1/user` e depois revalidado pelo MCP via JWKS. A Edge Runtime consulta o
PostgREST e o PostgreSQL reais da stack local. O projeto e a chave vivem em um
diretório temporário e são removidos depois que a stack é encerrada.

## Lacunas e gates

- não houve push, merge, deploy, alteração de VPS/Vercel/Supabase ou uso de segredo real;
- o fluxo browser OAuth authorization-code + PKCE não foi exercitado; Auth,
  JWT/JWKS e capabilities foram exercitados com identidade sintética;
- o Registry central e o adapter do MCF ainda precisam consumir a Capsule;
- falta somente incluir o adapter MCF no E2E já comprovado de MCP → API → Postgres;
- a qualidade de relevância do ranking textual ainda precisa de benchmark sintético;
- a migration base foi desenhada para banco lab vazio e não deve ser aplicada a um
  banco live sem plano de reconciliação independente;
- a remediação de privacidade do histórico público continua fora deste escopo.

Essas lacunas impedem declarar produção pronta, mas não impedem revisão e integração
em laboratório com custo zero.
