# Auditoria — Tarefa 3 — OAuth 2.1 / Gate G2 validado

**Data:** 2026-08-22  
**Estado:** `CONCLUÍDA / G2 PASS END-TO-END`

## Objetivo

Comprovar que o Supabase Auth OAuth 2.1 funciona no fluxo real necessário ao Cognitive Ledger, incluindo Authorization Code + PKCE, `client_id`, UserInfo e refresh.

## Evidências verificadas

```text
OAuth Server                       ✅ ativo
OIDC discovery                    ✅ HTTP 200
Dynamic Client Registration       ✅ HTTP 201
Authorization Path                ✅ /oauth/consent
authorize → consent               ✅ authorization_id presente
consentimento do proprietário     ✅ concluído
authorization code exchange       ✅
client_id no token                ✅
audience                          ✅ authenticated
issuer                            ✅ validado
UserInfo                          ✅
refresh token                     ✅
UserInfo após refresh             ✅
```

## Incidentes do probe

O primeiro callback temporário falhou porque o túnel externo expirou antes do retorno. Isso não foi falha do Supabase OAuth.

No probe seguinte, a troca do authorization code retornou sucesso, mas o teste consultou inicialmente o endpoint de usuário comum em vez do `userinfo_endpoint` anunciado pelo OIDC Discovery. O probe foi corrigido para seguir a metadata OIDC e o fluxo completo passou.

Essas falhas foram classificadas como erros do mecanismo temporário de teste, não como incompatibilidade da arquitetura OAuth.

## Segurança

- nenhuma credencial OAuth foi versionada;
- nenhum token foi gravado no Git;
- a identidade do proprietário permanece fora do repositório público;
- a UI de consentimento exige aprovação explícita do proprietário;
- o callback de probe foi temporário e não faz parte da arquitetura definitiva.

## Conclusão

O Gate G2 está aprovado: a compatibilidade técnica OAuth 2.1 necessária para prosseguir com a Fase 1 foi comprovada end-to-end. A Tarefa 3 pode ser considerada concluída.
