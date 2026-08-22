# Auditoria — Tarefa 3 OAuth 2.1 — checkpoint parcial

**Data:** 2026-08-22  
**Estado:** `EM EXECUÇÃO / AGUARDANDO CONFIRMAÇÃO HUMANA DA IDENTIDADE`

## Objetivo

Preparar a autenticação OAuth 2.1 do proprietário sem substituir o login privado existente e sem publicar a identidade escolhida no Git.

## Evidências verificadas

- Gate Humano G3 — escolha da identidade do proprietário: `DECISÃO RECEBIDA`.
- O valor da identidade não foi versionado no repositório público.
- Consulta inicial a `auth.users`: identidade inexistente antes do fluxo de Auth.
- `POST /auth/v1/otp` pelo mecanismo suportado do Supabase Auth: `HTTP 200`.
- Consulta posterior a `auth.users`: identidade criada, ainda não confirmada e sem login concluído.
- JWKS público: `HTTP 200`.
- Chave de assinatura anunciada: `ES256 / P-256`.
- OIDC discovery: `HTTP 200`, anunciando authorization code, refresh token e PKCE.
- OAuth Server discovery: `HTTP 404 feature_disabled`.
- `/auth/v1/oauth/authorize` sem parâmetros: `HTTP 404 feature_disabled`.

## Artefatos versionados

- `mcp/src/oauth.mjs` — configuração e contratos puros de OAuth/OIDC.
- `mcp/public/oauth/consent.html` — UI mínima de consentimento.
- `mcp/public/oauth/consent.js` — leitura de `authorization_id`, autenticação, detalhes e decisão approve/deny.
- `mcp/testes/oauth.test.mjs` — testes dos contratos de bootstrap OAuth.

Commits principais:

- `8aab9fec85fffb1cd6a5c1c628fb5dd65e51760d` — configuração OAuth;
- `4fb72e87b8875e828a9c84576b65784b4d563ec2` — consentimento e testes.

## Testes

```text
node --test mcp/testes/oauth.test.mjs
5 testes / 5 PASS / 0 FAIL

node --check mcp/src/oauth.mjs
PASS

node --check mcp/public/oauth/consent.js
PASS

identidade privada presente nos artefatos versionados
0 ocorrências
```

## Estado criptográfico

O projeto já utiliza chave assimétrica ES256 no JWKS. Portanto, não há justificativa para realizar rotação de chave nesta etapa apenas para satisfazer OAuth/OIDC.

## Bloqueios atuais

1. O proprietário precisa concluir o Magic Link enviado para confirmar controle da identidade.
2. O OAuth Server do Supabase está desabilitado e precisará ser habilitado antes do fluxo end-to-end.
3. A autorização real depende de uma URL de consentimento acessível e da configuração do Authorization Path.

## Limites preservados

- nenhuma senha foi criada;
- nenhum secret foi commitado;
- nenhuma identidade privada foi commitada;
- nenhuma inserção direta em `auth.users` foi feita;
- nenhum merge para `main` foi executado;
- nenhuma mudança no runtime do MCF foi executada;
- nenhuma remediação destrutiva do Git foi executada.

## Próximo critério de avanço

Após a confirmação humana da identidade, verificar `email_confirmed_at`/sessão e continuar a configuração do OAuth Server conforme o plano aprovado.
