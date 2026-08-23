# Checklist Vivo — Continuidade Cross-Chat do Cognitive Ledger

**Atualizado em:** 2026-08-23

**Estado:** `LAB ZERO-COST IMPLEMENTADO LOCALMENTE / NÃO IMPLANTADO`

**Branch:** `codex/cognitive-ledger-zero-cost-lab`

**Base:** `origin/design/cognitive-ledger-foundation@842b1fa`

Este arquivo descreve o estado comprovado da branch isolada. Não representa o
estado live de Supabase, Render, VPS, Vercel, ChatGPT ou produção.

## Resultado desta etapa

- ✅ OpenAI deixou de ser ativada implicitamente por presença de API key.
- ✅ Busca textual local passou a ser o padrão zero-cost.
- ✅ Banco lab reproduzível e seed de três eventos sintéticos foram versionados.
- ✅ Quatro rotas read-only foram implementadas com capability por operação.
- ✅ Auditoria fail-closed ocorre antes da liberação do conteúdo privado.
- ✅ Fonte bruta exige capability adicional e justificativa.
- ✅ Rotas mutantes são negadas na fronteira `/v1` read-only.
- ✅ MCP expõe exatamente quatro ferramentas, todas marcadas read-only.
- ✅ Capsule mínima do Cognitive Ledger foi adicionada para o MCF.
- ✅ Testes provam zero chamada paga no modo lab e zero mutação de Eventos.
- ✅ CI cria o diretório do Deno e repete Node, Deno, MCP e banco descartável.
- ⬜ Revisão independente da branch.
- ⬜ Registro do projeto no Registry central do MCF.
- ⬜ E2E integrado MCF → MCP → API → banco lab.
- ⬜ Lab/staging remoto com dados exclusivamente sintéticos.
- ⬜ Conexão ChatGPT após aprovação do gate de integração.
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
dados do seed                   = exclusivamente sintéticos
deploy                          = não realizado
```

## Evidências locais

| Verificação | Resultado observado |
| --- | --- |
| `deno fmt --check` | aprovado |
| `deno check` da Edge Function | aprovado |
| testes Deno | 27 aprovados, 0 falhas |
| testes Node do servidor/exportação | 10 aprovados, 0 falhas |
| testes MCP, incluindo E2E SDK | 14 aprovados, 0 falhas |
| auditoria npm de runtime | 0 vulnerabilidades reportadas |
| banco descartável | 3 eventos, 0 embeddings, fingerprint imutável |

Detalhes e comandos reproduzíveis estão em
[`../auditorias/2026-08-23-lab-readonly-custo-zero.md`](../auditorias/2026-08-23-lab-readonly-custo-zero.md).

## Próxima sequência segura

1. revisar os commits locais e o contrato das quatro operações;
2. registrar `cognitive-ledger` no Registry central do MCF;
3. ligar o adapter read-only do MCF ao MCP em laboratório;
4. repetir E2E somente com JWT e banco sintéticos;
5. publicar em lab/staging apenas após revisão explícita;
6. avaliar conexão com ChatGPT sem habilitar provedor pago;
7. manter produção e dados reais fechados até autorização própria.

## Gates ainda abertos

### Gate de integração

Exige revisão dos contratos MCF/Capsule, identidade do projeto, URL lab e política
de capabilities. Não exige compra de API.

### Gate de dados reais

Nenhum dado real deve entrar no seed, CI, MCP lab ou evidência versionada. Abertura
desse gate exige política de privacidade e autorização separadas.

### Gate de produção

Produção não faz parte desta branch. Deploy, migração de banco live, rotação de
segredos, DNS e tráfego real precisam de plano e autorização específicos.
