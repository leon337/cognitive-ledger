# Auditoria — Lab Read-Only Custo Zero

**Data:** 2026-08-23

**Branch:** `codex/cognitive-ledger-zero-cost-lab`

**Base imutável:** `origin/design/cognitive-ledger-foundation@842b1fa`

**Escopo:** implementação e verificação local; sem push, deploy ou dados reais.

## Resultado

O caminho mínimo de recuperação cross-chat foi implementado em laboratório com
busca textual gratuita, autenticação/capability, auditoria fail-closed, quatro
rotas read-only e um servidor MCP tool-only. O caminho pago de embeddings existe
apenas como opção explícita e permanece desativado no lab.

## Mudanças rastreáveis

| Commit | Conteúdo |
| --- | --- |
| `57c54f7` | embeddings pagos estritamente opt-in |
| `172a870` | schema, seed e validador do banco lab sintético |
| `e39f365` | quatro rotas read-only com capability e auditoria |
| `e8495f7` | MCP tool-only e testes E2E com o SDK oficial |
| `4866dc5` | fechamento da fronteira exata `/v1/admin` |
| `38583b3` | CI zero-cost incluindo banco descartável |

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
- o E2E MCP usa apenas servidores HTTP locais e dados sintéticos.

## Evidência de imutabilidade

- o E2E da API compara o JSON dos Eventos antes e depois das quatro operações;
- o E2E MCP compara o mesmo fingerprint e observa somente as quatro rotas de leitura;
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
COGNITIVE_LEDGER_LAB_CONFIRM=1 DATABASE_URL=<loopback-lab> scripts/validar-banco-lab.sh
```

Resultados observados:

- Deno: 27 aprovados, 0 falhas;
- Node servidor/exportação: 10 aprovados, 0 falhas;
- MCP: 14 aprovados, 0 falhas;
- auditoria npm: 0 vulnerabilidades reportadas;
- PostgreSQL: 3 eventos sintéticos, 0 embeddings, fingerprint imutável.

## Lacunas e gates

- não houve push, merge, deploy, alteração de VPS/Vercel/Supabase ou uso de segredo real;
- OAuth/JWKS real e capabilities reais não foram exercitados nesta branch;
- o Registry central e o adapter do MCF ainda precisam consumir a Capsule;
- falta E2E integrado MCF → MCP → API → Postgres usando somente fixtures;
- a qualidade de relevância do ranking textual ainda precisa de benchmark sintético;
- a migration base foi desenhada para banco lab vazio e não deve ser aplicada a um
  banco live sem plano de reconciliação independente;
- a remediação de privacidade do histórico público continua fora deste escopo.

Essas lacunas impedem declarar produção pronta, mas não impedem revisão e integração
em laboratório com custo zero.
