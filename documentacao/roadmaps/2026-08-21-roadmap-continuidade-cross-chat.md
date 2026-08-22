# Roadmap Canônico — Continuidade Cross-Chat do Cognitive Ledger

**Data de criação:** 2026-08-21  
**Status:** `EM EXECUÇÃO / CONTINUIDADE CROSS-CHAT PRIORITÁRIA`  
**Escopo:** `Cognitive Ledger — Fase 1 de acesso cross-chat`  
**Branch de trabalho:** `design/cognitive-ledger-foundation`  
**Natureza deste documento:** roadmap + runbook operacional + bootstrap para outro chat  

> **Princípio central:** Seu pensamento não deve ficar preso ao chat onde aconteceu.

---

## 0. Como usar este documento

Este arquivo existe para permitir que um chat futuro, sem depender do histórico desta conversa, consiga:

1. entender por que o Cognitive Ledger existe;
2. reconstruir cronologicamente como o projeto chegou ao estado atual;
3. identificar o que já foi implementado, o que foi verificado e o que continua `NÃO VERIFICADO`;
4. entender qual é a fonte operacional de verdade;
5. saber como um chat grava hoje um Evento Cognitivo quando o usuário diz **“registre isso no meu diário”**;
6. saber como um chat lê hoje o Ledger quando o usuário diz **“leia meu diário”**, **“acesse meu diário”** ou **“recupere o que decidimos sobre X”**;
7. verificar se o chat realmente possui acesso operacional ao armazenamento antes de afirmar que leu ou gravou algo;
8. distinguir o mecanismo operacional atual do mecanismo definitivo via OAuth + MCP;
9. continuar a implementação da Fase 1 a partir do último checkpoint comprovado;
10. preservar riscos, gates humanos e decisões deliberadamente adiadas.

Este documento deve ser tratado como um **artefato de continuidade**. Ele não substitui testes, logs, banco, commits, auditorias ou estado real de deploy.

### Regra de evidência

Nunca transformar uma informação deste roadmap em afirmação operacional atual sem verificar quando a informação for mutável.

Exemplos:

- `Edge Function ACTIVE` precisa ser verificada quando relevante;
- `Render live` precisa ser verificado quando relevante;
- `deno check` só pode ser declarado aprovado com evidência real de execução;
- um novo chat só pode dizer que “leu o diário” se realmente tiver usado um mecanismo de acesso ao Ledger;
- este arquivo pode dizer onde o projeto parou, mas não autoriza fingir acesso ao Supabase ou ao MCP.

---

# PARTE I — DEFINIÇÃO DO PRODUTO

## 1. O problema que originou o Cognitive Ledger

O problema fundamental não é “guardar chats”.

O problema é que ideias, decisões, hipóteses, aprendizados e evolução de pensamento ficam fragmentados entre conversas e ferramentas.

Modelo problemático:

```text
Chat A
  └── ideia importante

Chat B
  └── refinamento

Chat C
  └── decisão

Chat D
  └── precisa reconstruir tudo novamente
```

O Cognitive Ledger muda a unidade de persistência:

```text
conversa
   ≠
unidade durável

Evento Cognitivo
   =
unidade durável
```

A conversa é uma **fonte**. O Evento Cognitivo é o registro estruturado que deve sobreviver à conversa.

---

## 2. Definição operacional

O Cognitive Ledger é um sistema pessoal de continuidade cognitiva que registra, organiza, relaciona e recupera ideias, decisões, aprendizados, hipóteses, questões abertas, próximos passos e suas fontes ao longo do tempo.

Ele deve permitir que diferentes clientes autorizados — ChatGPT, MCF e futuramente outros agentes ou modelos — recuperem continuidade sem depender do chat original.

---

## 3. Duas camadas obrigatórias

Cada captura deve separar conceitualmente:

### 3.1 Registro Cognitivo

É a interpretação estruturada do que merece persistir.

Campos típicos:

- contexto;
- resumo;
- assuntos;
- projetos;
- ideias;
- decisões;
- hipóteses;
- aprendizados quando aplicável;
- questões abertas;
- próximos passos;
- relações;
- metadados de captura.

### 3.2 Registro de Fonte

É a proveniência do que originou o Evento Cognitivo.

Pode conter:

- tipo de fonte;
- provedor;
- referência;
- escopo capturado;
- conteúdo bruto quando explicitamente necessário e autorizado;
- metadados de privacidade/proveniência.

### Regra epistemológica

Uma interpretação gerada por IA nunca deve ser apresentada como se fosse a fonte original.

```text
Registro Cognitivo
        ≠
Fonte original
```

---

## 4. Fonte operacional de verdade

### Estado atual

```text
Supabase / Postgres
=
fonte operacional de verdade
```

O Git não está no caminho crítico de gravação e leitura do diário real.

```text
Git
=
código + documentação + histórico + exportação/backup controlado
```

Portanto, um chat que apenas leu `diario/*.md` no repositório **não pode afirmar** que leu o diário operacional atual.

---

# PARTE II — CRONOLOGIA DO PROJETO

## 5. Linha do tempo dos Eventos Cognitivos relevantes

A cronologia abaixo usa os IDs persistidos no Ledger como âncoras de continuidade.

### 00:50 — `ec-2026-08-21-005000-001`

**MCF como agência de profissionais virtuais**  
Tipo: hipótese.

O trabalho de produto do MCF começou a ser reinterpretado como agência de profissionais/equipes virtuais, o que aumentou a necessidade de continuidade entre projetos, agentes e conversas.

### 01:15 — `ec-2026-08-21-011500-001`

**A necessidade de continuidade antecede o próprio MCF**  
Tipo: aprendizado.

Foi reconhecido que o problema de continuidade cognitiva não nasceu apenas do MCF; ele é mais geral: o pensamento fica preso em sessões e interfaces.

### 01:35 — `ec-2026-08-21-013500-001`

**Cognitive Ledger como camada externa de continuidade**  
Tipo: síntese.

A ideia foi consolidada como um ledger externo aos chats, controlado pelo usuário e capaz de ser consultado posteriormente.

### 01:55 — `ec-2026-08-21-015500-001`

**Protótipo HTML, CSS e JavaScript antes do Google Stitch**  
Tipo: decisão.

Foi decidido amadurecer estrutura, informação e navegação antes do design visual final.

### 02:05 — `ec-2026-08-21-020500-001`

**Português como idioma operacional do repositório**  
Tipo: decisão.

Documentação e nomes controlados pelo projeto passaram a preferir português do Brasil.

### 03:01 — `ec-2026-08-21-030100-001`

**Oficialização do protocolo operacional visível do MCF**  
Tipo: decisão operacional.

O histórico da conversa passou a ser usado como superfície operacional visível de orquestração, handoffs, gates e auditoria do MCF.

### 04:29 — `ec-2026-08-21-042900-001`

**Primeira validação visual do fluxo operacional do Cognitive Ledger**  
Tipo: marco operacional.

A estrutura de timeline e recuperação começou a se materializar em um protótipo navegável.

### 04:55 — `ec-2026-08-21-045500-001`

**Materialização profissional do ecossistema MCF + Cognitive Ledger**  
Tipo: marco profissional.

O sistema deixou de ser apenas uma ideia documental e passou a formar um ecossistema com produto, runtime privado, publicação e persistência operacional.

### 05:48 — `ec-2026-08-21-054800-001`

**Documentação de captura e recuperação ficou defasada após validação operacional**  
Tipo: achado documental.

A implementação real avançou mais rápido que parte da documentação. Ficou estabelecida a necessidade de evidência antes de atualizar estados históricos.

### 06:26 — `ec-2026-08-21-062600-001`

**Perda de senha revelou ausência de recuperação e acoplamento na autenticação**  
Tipo: incidente operacional.  
Status: resolvido quanto ao incidente imediato.

O incidente mostrou que a senha humana e a credencial interna Render → API estavam acopladas de forma inadequada.

### 06:27 — `ec-2026-08-21-062700-001`

**Criar interface própria de login com recuperação de senha**  
Tipo: ideia de produto.

A recuperação autônoma de acesso foi registrada como dívida de produto, mas ficou fora da prioridade imediata da Fase 1 cross-chat.

### 06:28 — `ec-2026-08-21-062800-001`

**Remover variável residual `COGNITIVE_LEDGER_API_CREDENTIAL` do Render**  
Tipo: pendência técnica.  
Status: resolvido.

A variável residual foi removida posteriormente com deploy e smoke test verificados.

### 07:37 — `ec-2026-08-21-073700-001`

**Cloud-infrastructure deve amadurecer antes de hospedar o MCP do Cognitive Ledger**  
Tipo: achado arquitetural.

Foi decidido não usar a VPS como destino do MCP nesta fase. Render permanece como hospedagem inicial planejada para o MCP remoto.

### 08:46 — `ec-2026-08-21-084600-001`

**Repositório do Cognitive Ledger tornado público temporariamente para desbloquear CI**  
Tipo: decisão operacional.  
Status: temporário.

O repositório foi tornado público para contornar o esgotamento da cota mensal de workflows privados do GitHub Actions.

A mudança de visibilidade não altera o boundary de privacidade do diário.

### 09:26 — `ec-2026-08-21-092600-001`

**Remediação do histórico público adiada para preservar a rastreabilidade**  
Tipo: decisão operacional.  
Status: pendente.

Uma auditoria encontrou riscos no histórico público. Foi recomendada sanitização e rewrite, mas o proprietário não autorizou a reescrita por considerar a preservação do histórico prioritária.

A decisão foi **adiar**, não declarar o risco resolvido.

### 12:11 — `ec-2026-08-21-121100-001`

**Projeto da VPS — R4 concluído e R5 como próximo passo**  
Tipo: checkpoint operacional.

Este evento pertence ao projeto de infraestrutura e não muda a decisão de manter o MCP do Cognitive Ledger fora da VPS nesta fase.

### 21:26 — `ec-2026-08-21-212600-001`

**Priorizar continuidade cross-chat antes da remediação estrutural do repositório**  
Tipo: decisão operacional.

Prioridade vigente:

```text
registro rápido
      +
acesso cross-chat
      ↓
validar continuidade
      ↓
só depois reabrir remediação estrutural
```

Gatilho de retomada da dívida estrutural:

`acesso_cross_chat_validado_em_novo_chat`

### 22:36 — `ec-2026-08-21-223600-001`

**Roadmap canônico de continuidade cross-chat com runbook operacional do Cognitive Ledger**  
Tipo: decisão operacional.

Foi decidido criar este documento e registrar a mesma decisão no Ledger.

A exigência adicional é que um novo chat aprenda **como operar o Ledger**, não apenas onde o projeto parou.

---

# PARTE III — ESTADO OPERACIONAL ATUAL

## 6. Componentes existentes

### 6.1 Banco operacional

Tabelas existentes:

- `eventos_cognitivos`;
- `fontes`;
- `relacoes`;
- `configuracao_privada`.

RLS está habilitado. O boundary atual é backend-only e não existem policies públicas abertas para o frontend.

### 6.2 RPC de gravação

Existe a função transacional:

```text
public.registrar_evento_cognitivo(
  p_evento jsonb,
  p_fontes jsonb,
  p_relacoes jsonb
)
```

Ela:

1. exige ID;
2. detecta evento existente compatível;
3. rejeita colisão incompatível;
4. grava Evento Cognitivo;
5. grava fontes relacionadas;
6. grava relações;
7. retorna `criado` ou `existente`.

### 6.3 Edge Function

Fonte versionada em:

`supabase/functions/cognitive-ledger-api/index.ts`

Rotas operacionais atuais:

```text
GET  /timeline
POST /registros
```

A função implantada usa autenticação customizada e não expõe service-role ao frontend.

### 6.4 Diário privado

Fluxo operacional existente:

```text
navegador
   ↓
serviço privado Render
   ↓
proxy autenticado
   ↓
cognitive-ledger-api
   ↓
Supabase/Postgres
```

O browser não recebe os registros reais embutidos no bundle estático.

### 6.5 Separação de autenticação

Após o incidente de senha:

```text
senha humana
       ≠
credencial interna Render → API
```

O login humano e a credencial interna estão separados conceitualmente e no servidor.

### 6.6 Testes conhecidos

A suíte do servidor privado foi executada anteriormente com:

```text
6 testes
6 aprovados
0 falhas
```

Essa evidência é histórica; deve ser reexecutada quando uma alteração tocar o boundary correspondente.

---

# PARTE IV — RUNBOOK OPERACIONAL ATUAL: GRAVAÇÃO

## 7. Objetivo do runbook de gravação

Permitir que um executor entenda o que fazer quando o usuário disser:

> “registre isso no meu diário”

ou formulações equivalentes:

- “registre só essa ideia”;
- “isso é uma decisão, registre”;
- “salve isso no Cognitive Ledger”;
- “registre nossa conclusão no meu diário”.

A captura inicial é **explícita**. O sistema não deve transformar toda conversa automaticamente em Evento Cognitivo sem decisão de produto posterior.

---

## 8. Pré-condição zero — verificar capacidade real

Antes de gravar, o chat deve identificar se possui um mecanismo operacional capaz de acessar o Ledger.

### Cenário A — ferramenta/conector autorizado ao Supabase disponível

O executor pode usar o procedimento direto atual.

### Cenário B — MCP Cognitive Ledger já implementado e conectado

O executor deve seguir as ferramentas MCP previstas para a versão em vigor. Na Fase 1 inicial, o MCP é somente leitura; portanto **não haverá escrita cross-chat pelo MCP**.

### Cenário C — nenhum acesso operacional disponível

O executor deve declarar:

```text
acesso ao Cognitive Ledger:
NÃO DISPONÍVEL / NÃO VERIFICADO
```

E não pode dizer “registrei” com base apenas em intenção ou texto preparado.

---

## 9. Passo 1 — resolver o escopo da captura

O comando “registre isso” precisa ser resolvido contra o contexto imediato.

O executor deve identificar:

- o núcleo que merece persistir;
- se é ideia, decisão, hipótese, aprendizado, incidente, checkpoint ou outro tipo;
- o projeto associado;
- o que é fato registrado;
- o que é interpretação;
- quais pendências permanecem abertas;
- se existe fonte que deve ser preservada.

### Regra de minimização

Não copiar a conversa inteira por padrão.

Persistir o suficiente para recuperar a continuidade sem transformar o Ledger em outro histórico infinito.

---

## 10. Passo 2 — construir o Evento Cognitivo

Estrutura conceitual mínima:

```json
{
  "id": "ec-AAAA-MM-DD-HHMMSS-NNN",
  "timestamp": "ISO-8601 com timezone",
  "tipo": "decisao | ideia | hipotese | aprendizado | ...",
  "status": "ativo | resolvido | pendente | temporario | ...",
  "titulo": "título curto e recuperável",
  "resumo": "síntese",
  "contexto": "por que isso aconteceu",
  "assuntos": [],
  "projetos": [],
  "ideias": [],
  "decisoes": [],
  "hipoteses": [],
  "questoes_abertas": [],
  "proximos_passos": [],
  "metadados": {}
}
```

### Regras

- ID deve ser estável e único;
- timestamp deve refletir o momento real da captura;
- título deve ser semanticamente útil para busca futura;
- decisões não devem ser misturadas com hipóteses;
- ausência de decisão deve permanecer ausência de decisão;
- questões abertas não devem ser fechadas por inferência do executor.

---

## 11. Passo 3 — construir o Registro de Fonte separadamente

Quando houver fonte a preservar:

```json
{
  "id": "fonte-...",
  "tipo_de_fonte": "chat | documento | reunião | ...",
  "provedor": "origem",
  "referencia": "referência durável",
  "escopo_da_captura": "o que foi capturado",
  "conteudo_bruto": "somente quando necessário/autorizado",
  "metadados": {
    "privado": true,
    "exportar_para_git": false
  }
}
```

### Boundary atual

Enquanto o repositório estiver público temporariamente:

```text
novo conteúdo privado
        ↓
Supabase privado
        ↓
NÃO exportar automaticamente ao Git público
```

---

## 12. Passo 4 — relacionar com eventos anteriores

Se a captura:

- revisa uma decisão;
- contradiz uma hipótese;
- substitui um estado anterior;
- operacionaliza uma decisão;
- resolve uma pendência;
- depende de um marco anterior;

criar relações explícitas em `relacoes`.

Não inventar relação apenas porque dois textos parecem semelhantes.

---

## 13. Passo 5 — persistir transacionalmente

No mecanismo atual, usar a RPC:

```sql
select public.registrar_evento_cognitivo(
  <evento>::jsonb,
  <fontes>::jsonb,
  <relacoes>::jsonb
);
```

### Idempotência

Comportamento esperado:

```text
mesmo ID + evento compatível
→ existente

mesmo ID + evento incompatível
→ COLISAO_ID
```

Não contornar colisão sobrescrevendo silenciosamente um evento histórico.

---

## 14. Passo 6 — ler de volta

Persistência só é considerada comprovada depois de consultar o registro salvo pelo ID.

Exemplo conceitual:

```sql
select id, timestamp, tipo, status, titulo,
       resumo, contexto, assuntos, projetos,
       ideias, decisoes, hipoteses,
       questoes_abertas, proximos_passos, metadados
from public.eventos_cognitivos
where id = <id>;
```

Quando relevante, verificar também:

- fonte associada;
- relações;
- contagem atual;
- visibilidade na timeline privada.

### Contrato de conclusão

> “‘Registrar no diário’ só está concluído quando o Evento Cognitivo estiver persistido, indexado quando a indexação aplicável existir, e visível/recuperável na timeline do usuário.”

No estado atual, se a camada semântica ainda não existir, não alegar indexação semântica concluída.

---

## 15. Passo 7 — responder ao usuário com evidência

Resposta mínima recomendada:

- ID do evento;
- título;
- status retornado pela RPC (`criado`/`existente`);
- confirmação de leitura de volta;
- eventual contagem/estado quando útil.

Nunca responder “registrado” se apenas foi preparado um texto sem persistência.

---

## 16. Falhas de gravação

### Falha de ferramenta

Estado: `NÃO REGISTRADO`.

### RPC retorna colisão

Estado: `BLOQUEADO POR COLISÃO DE ID`.

### Insert funciona, leitura de volta falha

Estado: `PERSISTÊNCIA PROVÁVEL / VERIFICAÇÃO INCOMPLETA`.

Não declarar conclusão plena até verificar.

### Fonte falha dentro da transação

A gravação deve ser tratada segundo o comportamento transacional da RPC; não presumir parcialidade sem evidência.

---

# PARTE V — RUNBOOK OPERACIONAL ATUAL: LEITURA

## 17. Objetivo do runbook de leitura

Permitir que um executor entenda o que fazer quando o usuário disser:

> “leia meu diário”

ou:

- “acesse meu diário”;
- “o que decidimos sobre X?”;
- “recupere o contexto de Y”;
- “onde paramos?”;
- “quais decisões tomei sobre este projeto?”.

---

## 18. Pré-condição zero — verificar acesso real

Mesma regra da gravação.

### Se existe acesso direto autorizado ao Supabase

Pode consultar o Ledger atual.

### Se existe MCP validado

Usar MCP, não SQL direto, como caminho normal.

### Se não existe nenhum mecanismo

Declarar que o roadmap foi encontrado, mas o armazenamento operacional não foi consultado.

Nunca transformar leitura deste documento em “leitura do diário”.

---

## 19. Passo 1 — resolver a intenção de recuperação

Identificar:

- assunto;
- projeto;
- período;
- tipos de evento;
- IDs conhecidos;
- necessidade de relações;
- necessidade ou não de fonte bruta.

“Leia meu diário” não significa carregar tudo.

---

## 20. Passo 2 — recuperar o menor conjunto suficiente

No mecanismo direto atual, consultar `eventos_cognitivos` usando filtros estruturados.

Exemplos:

```text
tempo
projeto
assunto
tipo
status
IDs conhecidos
```

No futuro MCP, a busca híbrida adicionará semântica, texto, relações e recência.

---

## 21. Passo 3 — preservar epistemologia

O executor deve manter as distinções persistidas:

```text
hipótese
≠
decisão

questão aberta
≠
conclusão

reconstrução
≠
fonte literal

ausência de evidência
≠
evidência negativa
```

Relações explícitas `contradiz`, `revisa` ou `substitui` podem indicar conflito/evolução. Similaridade textual sozinha não autoriza declarar conflito.

---

## 22. Passo 4 — consultar relações quando necessário

Usar a tabela `relacoes` para reconstruir evolução e dependências.

O novo chat deve preferir relações persistidas a “lembranças” inferidas.

---

## 23. Passo 5 — fonte bruta é exceção

Leitura normal usa Registro Cognitivo.

Fonte bruta deve ser consultada apenas quando:

- o usuário pede explicitamente;
- a interpretação precisa ser conferida contra a fonte;
- a capacidade correspondente existir;
- a justificativa puder ser registrada.

Na arquitetura MCP planejada, `ler_fonte_bruta` é capability separada e não concedida por padrão.

---

## 24. Passo 6 — separar memória recuperada de análise nova

Formato recomendado:

```text
MEMÓRIA RECUPERADA DO LEDGER
- fatos/eventos/decisões persistidos

ANÁLISE ATUAL
- interpretação produzida agora pelo novo chat
```

Isso é particularmente obrigatório quando o usuário pede recomendação, estratégia ou decisão nova.

---

## 25. Passo 7 — tornar a consulta visível

Quando a consulta for proativa, o MESTRE deve declarar que consultou o Ledger.

A recuperação não deve ser invisível quando ela altera significativamente a resposta.

---

# PARTE VI — MATRIZ DE ACESSO PARA UM CHAT FUTURO

## 26. Cenário A — acesso direto atual

```text
ChatGPT desta sessão
        ↓
ferramenta/conector autorizado
        ↓
Supabase
        ↓
RPC / consultas
```

Uso:

- adequado para operação interna durante construção;
- não é o produto final cross-chat;
- exige ferramenta realmente disponível na sessão.

## 27. Cenário B — MCP Fase 1 concluído

```text
ChatGPT / MCF
      ↓
OAuth 2.1
      ↓
MCP Cognitive Ledger
      ↓
cognitive-ledger-api
      ↓
Supabase/Postgres
```

Uso:

- caminho-alvo para leitura cross-chat;
- somente leitura na Fase 1;
- auditoria fail-closed;
- identidade e capacidades por cliente.

## 28. Cenário C — sem acesso

```text
roadmap disponível
Ledger operacional indisponível
```

O chat pode:

- reconstruir o estado técnico pelo roadmap;
- continuar tarefas de documentação que não dependam do banco;
- explicar o bloqueio.

O chat não pode:

- dizer que leu eventos atuais;
- registrar eventos;
- inventar resultados de busca;
- alegar auditoria inexistente.

---

# PARTE VII — ARQUITETURA-ALVO DA FASE 1 CROSS-CHAT

## 29. Objetivo

Permitir que um chat novo autorizado consulte o Cognitive Ledger por MCP remoto, recupere contexto profissional relevante por busca híbrida e use esse contexto sem confundir memória registrada com inferência atual.

Arquitetura aprovada:

```text
ChatGPT / MCF
      ↓
OAuth 2.1
      ↓
MCP remoto
      ↓
cognitive-ledger-api
      ↓
Supabase/Postgres
```

---

## 30. Capacidades normais da Fase 1

```text
ler_diario
buscar_eventos
recuperar_contexto
```

Capability separada:

```text
ler_fonte_bruta
```

### Deliberadamente fora da Fase 1

- `registrar_no_diario` via MCP;
- administração;
- SQL pelo cliente;
- escrita cross-chat;
- multi-owner;
- captura automática;
- recuperação de senha completa;
- substituição do Basic Auth do diário privado.

---

## 31. Busca híbrida planejada

Valores iniciais aprovados:

```text
semântico     0.60
textual       0.25
recência      0.15
```

Limites:

```text
default: 8 eventos
máximo: 12 eventos
```

Em consulta sem filtro exato:

```text
score_total < 0.30
→ evidencia_insuficiente
```

Esse limiar deve ser calibrado no corpus real e não pode ser reduzido silenciosamente apenas para “retornar alguma coisa”.

---

## 32. Embeddings

Modelo planejado:

```text
text-embedding-3-large
dimensions = 1024
```

Princípio obrigatório:

```text
persistência do Evento Cognitivo
NÃO depende da disponibilidade da OpenAI
```

Embedding falhou:

```text
evento continua válido
+
texto/filtros continuam disponíveis
+
indexação pode ser refeita depois
```

---

## 33. Auditoria

Toda leitura cross-chat deve gerar registro de auditoria antes da entrega do conteúdo.

Campos mínimos:

- owner;
- client;
- operação;
- finalidade;
- IDs retornados;
- quantidade;
- fonte bruta acessada?;
- justificativa;
- resultado;
- degradação;
- erro.

Regra:

```text
auditoria indisponível
        ↓
fail closed
        ↓
conteúdo privado NÃO é devolvido
```

---

# PARTE VIII — ROADMAP TÉCNICO CRONOLÓGICO

## 34. Tarefa 1 — Baseline versionado e limpeza do boundary atual

### Objetivo

Garantir que a Edge Function implantada possua fonte versionada idêntica ao runtime existente antes de qualquer extensão cross-chat.

### Evidências já obtidas

- baseline da função versionado em `supabase/functions/cognitive-ledger-api/index.ts`;
- commit de baseline: `c86b9421d68645c7e6af06ac85cf5d2c531e2267`;
- Edge Function foi observada `ACTIVE`, versão 1, `verify_jwt=false`, com autenticação customizada;
- suíte privada Node: 6/6;
- busca no código mostrou zero usos da variável residual `COGNITIVE_LEDGER_API_CREDENTIAL`;
- variável residual removida no Render;
- deploy pós-remoção foi observado `live` e smoke operacional registrou os eventos existentes naquele momento;
- documentação de autenticação foi atualizada;
- auditoria da Tarefa 1 existe em `documentacao/auditorias/2026-08-21-tarefa-1-baseline-cross-chat.md`.

### Pendência formal

Executar com evidência real:

```bash
deno check supabase/functions/cognitive-ledger-api/index.ts
```

### Histórico do bloqueio

- Deno não estava disponível no runtime local;
- tentativas de instalação local foram bloqueadas por ausência de resolução externa;
- GitHub Actions foi escolhido como ambiente de validação;
- os runs observados não iniciavam nenhum step;
- a captura do GitHub revelou bloqueio de conta/cota;
- o proprietário identificou a causa: cota mensal de workflows privados esgotada;
- o repositório foi tornado público temporariamente para destravar CI.

### Estado atual

```text
TAREFA 1:
OPERACIONALMENTE CONCLUÍDA
/
DENO CHECK AINDA NÃO COMPROVADO
```

### Próximo passo exato

Executar/observar um workflow agora que o repositório está público e confirmar que o step:

```text
Validar Edge Function com Deno
```

executa e termina com sucesso.

### Aceite

Só fechar formalmente quando existir evidência compatível de `deno check` com exit code zero, além das verificações já obtidas.

---

## 35. Tarefa 2 — Schema de clientes, auditoria e vetores

**Não iniciar antes do fechamento formal da Tarefa 1.**

### Produzir

- `clientes_autorizados`;
- `auditoria_acessos`;
- `eventos_cognitivos.embedding vector(1024)`;
- `embedding_model`;
- `embedding_atualizado_em`;
- extensão `vector`;
- extensão `pg_trgm`;
- HNSW cosine;
- RPC `buscar_eventos_hibrido(...)`.

### Sequência

1. RED: provar que tabelas/coluna/extensão ainda não existem;
2. criar migration mínima;
3. habilitar RLS nas novas tabelas;
4. criar índice vetorial;
5. criar RPC híbrida;
6. hard max 12;
7. semântica 0.60 + texto 0.25 + recência 0.15;
8. fallback semântico com componente zero quando embedding for `NULL`;
9. revogar execute de `public`, `anon`, `authenticated`;
10. conceder somente `service_role`;
11. aplicar migration com mecanismo próprio de migration;
12. verificar GREEN;
13. rodar Security Advisor;
14. registrar evidência.

### Aceite

Owner único + múltiplos clientes, auditoria e ranking híbrido sem abrir tabelas ao frontend.

---

## 36. Tarefa 3 — OAuth 2.1 do proprietário e consentimento MCP

### Gate G3

O proprietário escolhe explicitamente a identidade/e-mail usada no Supabase Auth.

Não inferir.
Não commitá-la.

Preferência inicial: magic link.

### Implementar

- Supabase OAuth 2.1 Server;
- PKCE;
- refresh/reautorização;
- registro dinâmico de clientes MCP;
- assinatura assimétrica RS256 ou ES256;
- JWKS público;
- metadata `/.well-known/oauth-protected-resource`;
- consent UI mínima;
- browser somente com URL + publishable key.

### Gate G2

Executar fluxo OAuth real primeiro em cliente de teste/MCP Inspector e depois novamente no endpoint Render definitivo.

Se incompatível com ChatGPT:

```text
NÃO criar OAuth proprietário silenciosamente
→ voltar ao MESTRE
→ abrir gate arquitetural
```

---

## 37. Tarefa 4 — Bearer por cliente + auditoria fail-closed

### Regras

- `/v1/*` exige Bearer;
- Basic não autentica rotas cross-chat;
- token com owner incorreto → 403;
- cliente inativo/revogado → 403;
- capacidade ausente → 403;
- revogar A não afeta B;
- JWT precisa ser verificado, não apenas decodificado;
- exigir `iss`, `aud`, `exp`, `sub`, `client_id`;
- cliente padrão recebe `ler_diario`, `buscar_eventos`, `recuperar_contexto`;
- `ler_fonte_bruta` não é padrão;
- falha de auditoria → 503 sem conteúdo privado.

### Compatibilidade

Preservar:

```text
Basic legado
→ GET /timeline
→ POST /registros
```

Bearer não ganha escrita.

---

## 38. Tarefa 5 — Embeddings sem bloquear gravação

### Gate G4

Configurar `OPENAI_API_KEY` como secret server-side no Supabase.

Nunca:

- Git;
- frontend;
- MCP público;
- logs;
- documentação.

### Fluxo

```text
POST /registros
      ↓
RPC persistiu com sucesso
      ↓
resposta operacional não depende da OpenAI
      ↓
EdgeRuntime.waitUntil(indexarEvento(id))
      ↓
embedding em background
```

### Admin

Criar reindexação interna protegida pelo Basic existente.

### Aceite

Falha de embeddings não quebra escrita. Eventos existentes são backfilled e novos podem ser reindexados.

---

## 39. Tarefa 6 — API cross-chat de leitura

Rotas Bearer-only planejadas:

```text
GET  /v1/diario
POST /v1/buscar
POST /v1/contexto
POST /v1/fonte
```

### `GET /v1/diario`

- data desc;
- filtros estruturados;
- default 8;
- max 12;
- nunca devolver fonte bruta;
- auditar antes da resposta.

### `POST /v1/buscar`

- filtros antes do ranking;
- busca híbrida;
- score mínimo 0.30 quando aplicável;
- falha de embedding → fallback textual + `degradado=true`;
- nunca promover candidato fraco a memória factual.

### `POST /v1/contexto`

Preservar:

- decisões;
- hipóteses;
- questões abertas;
- próximos passos;
- lacunas;
- conflitos;
- IDs;
- proveniência.

A API não produz recomendação final.

### `POST /v1/fonte`

Exige:

- capability `ler_fonte_bruta`;
- justificativa não vazia;
- auditoria específica;
- retorno mínimo da fonte solicitada.

### Read-only

Bearer em rota mutante não prevista deve falhar sem escrever.

---

## 40. Tarefa 7 — Servidor MCP remoto tool-only

Ferramentas:

```text
ler_diario
buscar_eventos
recuperar_contexto
ler_fonte_bruta
```

### Princípio

O MCP não duplica lógica cognitiva.

```text
MCP
=
contrato + autenticação + encaminhamento
```

A lógica de negócio permanece no Cognitive Ledger/API.

### Requisitos

- Node.js;
- `@modelcontextprotocol/sdk`;
- schemas com limites 1..12;
- `readOnlyHint: true`;
- `destructiveHint: false`;
- Bearer obrigatório;
- validação local JWT via JWKS;
- API revalida por defesa em profundidade;
- nunca aceitar service-role ou Basic interno no MCP;
- Streamable HTTP em `/mcp`;
- `/health` sem dados privados;
- erros 401/403/503/evidência insuficiente chegam como estado explícito;
- MCP não inventa resposta substituta.

---

## 41. Tarefa 8 — CI, deploy MCP e conexão ChatGPT

Criar serviço Render separado:

`cognitive-ledger-mcp`

### Ambiente permitido no MCP

- URL da API do Ledger;
- URL Supabase;
- publishable key;
- base URL pública;
- porta.

### Proibido no MCP

- service role;
- secret key Supabase;
- credencial Basic interna;
- senha humana;
- `OPENAI_API_KEY`.

### CI

Adicionar:

- testes do servidor privado;
- instalação MCP;
- testes MCP;
- manter validação do site;
- manter Deno/Edge Function.

### Gate G1

Confirmar que a conta/workspace ChatGPT permite app MCP personalizado.

Se não permitir:

```text
implementação técnica pode continuar
mas
Teste A/B no ChatGPT = BLOQUEADO POR PRODUTO
```

### G2 definitivo

Repetir OAuth no endpoint Render definitivo.

### Revogação

Autorizar A e B; revogar A; provar A=403 e B continua funcional.

---

## 42. Tarefa 9 — Testes A/B + auditoria final

### Teste A — continuidade histórica

Em chat novo:

> “Acesse meu diário e me explique como surgiu e evoluiu o Cognitive Ledger.”

Deve provar:

- consulta visível;
- recuperação semântica;
- distinção epistemológica;
- lacunas explícitas;
- zero escrita;
- auditoria correspondente.

### Teste B — memória versus recomendação nova

Em outro chat novo:

> “Consulte meu diário e me ajude a decidir qual deveria ser o próximo passo do MCF.”

Resposta precisa separar:

```text
MEMÓRIA RECUPERADA
        VS
ANÁLISE / RECOMENDAÇÃO ATUAL
```

### Testes complementares

- nenhuma escrita cross-chat;
- fonte bruta negada por padrão;
- capability raw concedida apenas em teste controlado;
- auditoria fail-closed;
- degradação semântica;
- calibração de 0.30;
- Security Advisor;
- logs sem segredo;
- protótipo público sem DB real;
- MCP sem service-role.

### Estado final permitido

Somente usar:

`IMPLEMENTADO / VALIDADO FASE 1`

se todos os critérios tiverem evidência.

Caso contrário:

- `IMPLEMENTADO COM PENDÊNCIAS`; ou
- `BLOQUEADO`.

---

# PARTE IX — TESTE ESPECÍFICO DE CONTINUIDADE DESTA PRÓPRIA DECISÃO

## 43. Teste C — recuperar este roadmap e a dívida de segurança

Depois dos Testes A/B, abrir outro chat e perguntar algo equivalente a:

> “Consulte meu diário e recupere a decisão sobre o repositório público, a auditoria de segurança, por que a remediação foi adiada e qual gatilho foi definido para retomá-la.”

O chat deve recuperar, no mínimo, a cadeia:

```text
ec-2026-08-21-084600-001
visibilidade pública temporária
        ↓
ec-2026-08-21-092600-001
remediação adiada
        ↓
ec-2026-08-21-212600-001
prioridade cross-chat
        ↓
ec-2026-08-21-223600-001
roadmap + runbook canônico
```

E reconstruir corretamente:

```text
risco identificado
≠
risco resolvido

remediação adiada
≠
remediação cancelada

repositório público temporário
≠
política permanente de publicidade
```

Se esse teste funcionar, o Cognitive Ledger terá demonstrado seu valor usando a própria história do produto como prova.

---

# PARTE X — DÍVIDA DE SEGURANÇA DELIBERADAMENTE ADIADA

## 44. Contexto

A abertura temporária do repositório provocou uma auditoria.

Achados documentados:

- Eventos Cognitivos históricos versionados no Git;
- uma fonte bruta histórica;
- salt + verificador `scrypt` da autenticação humana em código histórico/atual naquele momento;
- metadados normais de autoria Git;
- documentação antiga assumindo repositório privado;
- ausência de varredura forense completa de todos os objetos Git.

A busca disponível não encontrou segredos clássicos em texto puro como API keys ou tokens nos padrões revisados, mas:

```text
ausência absoluta de segredo histórico
=
NÃO VERIFICADO
```

---

## 45. Decisão vigente

Não executar agora:

- rewrite de histórico;
- force-push para sanitização;
- arquitetura separada de mirror público de CI;
- remediação estrutural que desvie esforço da continuidade cross-chat.

Isso não significa aceitar o risco permanentemente.

---

## 46. Guardrail enquanto o repositório estiver público

Não adicionar ao Git público novos:

- Eventos Cognitivos reais;
- fontes brutas pessoais;
- senhas;
- tokens;
- API keys;
- connection strings reais;
- verificadores de senha;
- dumps;
- snapshots privados;
- segredos de Supabase/Render/OpenAI.

Novas capturas do diário devem permanecer no Supabase privado.

---

## 47. Gatilho de retomada

Reabrir a decisão depois que o acesso cross-chat for validado em novo chat.

Preferencialmente após:

```text
Teste A = PASS
+
Teste B = PASS
+
Teste C = PASS
```

Nesse momento abrir novo:

`[MESTRE — GATE HUMANO]`

para avaliar:

- voltar repo a private;
- separar repo público de CI;
- externalizar verificador humano;
- rotacionar credencial humana;
- sanitização atual;
- preservação de histórico;
- eventual arquivo histórico privado;
- necessidade ou não de rewrite.

---

# PARTE XI — GATES EXTERNOS DA FASE 1

## 48. G1 — ChatGPT / MCP personalizado

Confirmar capacidade real no produto ChatGPT usado pelo proprietário.

## 49. G2 — OAuth Supabase ↔ ChatGPT

Confirmar autorização e renovação reais.

Incompatibilidade → gate arquitetural; não improvisar protocolo inseguro.

## 50. G3 — identidade do proprietário

O proprietário escolhe explicitamente a identidade.

Nunca inferir ou publicar.

## 51. G4 — OpenAI embeddings

Secret somente server-side.

Sem G4:

- texto/filtros podem evoluir;
- caminho semântico não pode ser declarado validado.

---

# PARTE XII — O QUE NÃO DEVE SER FEITO NESTA PRIORIDADE

## 52. Fora do caminho crítico atual

Não abrir novas frentes para:

- redesign visual final;
- migração do MCP para VPS;
- multi-owner;
- escrita MCP;
- captura automática;
- recuperação completa de senha;
- remodelagem geral do Git;
- refatoração estética sem relação com o acesso cross-chat.

### VPS

A infraestrutura própria continua um projeto separado.

Não hospedar o MCP na VPS até que existam evidências suficientes de maturidade da plataforma e um novo gate humano.

---

# PARTE XIII — PROTOCOLO DE BOOTSTRAP PARA OUTRO CHAT

## 53. Prompt recomendado ao usuário

Em outro chat, o usuário pode escrever:

> **“Acesse o roadmap de continuidade do Cognitive Ledger no repositório e retome a missão exatamente do último checkpoint verificado. Antes de executar, identifique se você possui acesso operacional ao meu Ledger.”**

---

## 54. Procedimento obrigatório do novo MESTRE

O novo chat deve:

1. ler este roadmap integralmente;
2. identificar a data do checkpoint;
3. localizar os documentos aprovados referenciados;
4. verificar quais ferramentas/conectores estão realmente disponíveis;
5. declarar se possui acesso operacional ao Ledger;
6. se possuir acesso, consultar os Eventos Cognitivos-chave do checkpoint;
7. se não possuir, não fingir consulta;
8. verificar o estado real de CI/deploy quando a próxima tarefa depender disso;
9. não repetir trabalho já comprovado sem necessidade;
10. não considerar concluído o que está marcado `NÃO VERIFICADO`;
11. não reduzir critérios de aceite para “andar mais rápido”;
12. convocar apenas papéis MCF necessários;
13. executar o próximo passo exato;
14. registrar evidências;
15. atualizar este roadmap ao atingir um novo marco relevante.

---

## 55. Sequência para “registre isso no meu diário” em outro chat

O novo executor deve consultar a **PARTE IV** e seguir:

```text
intenção explícita
      ↓
verificar acesso real
      ↓
resolver escopo
      ↓
criar Registro Cognitivo
      ↓
criar Fonte separada
      ↓
criar relações
      ↓
persistir pela RPC/caminho vigente
      ↓
ler de volta
      ↓
verificar
      ↓
confirmar ao usuário
```

Se o mecanismo disponível não permitir escrita, declarar isso.

Na Fase 1 MCP planejada, MCP é read-only; portanto outro chat não deve presumir que `registrar_no_diario` existe como tool MCP.

---

## 56. Sequência para “leia meu diário” em outro chat

Consultar a **PARTE V** e seguir:

```text
verificar acesso real
      ↓
resolver intenção
      ↓
consultar fonte operacional
      ↓
recuperar conjunto mínimo
      ↓
relações quando necessário
      ↓
fonte bruta somente com necessidade/capacidade
      ↓
preservar epistemologia
      ↓
separar memória recuperada de análise nova
      ↓
responder
```

---

# PARTE XIV — CHECKPOINT ATUAL

## 57. Checkpoint registrado em 2026-08-21 22:36 -03:00

### Objetivo vigente

Concluir a continuidade cross-chat com a maior celeridade possível, sem abrir agora a remediação estrutural do repositório.

### Último marco concluído antes deste roadmap

- caminho operacional do diário existe;
- eventos reais estão persistidos no Supabase;
- Edge Function atual está versionada;
- testes privados Node já passaram 6/6 em verificação anterior;
- variável residual do Render foi removida;
- autenticação humana e credencial interna foram separadas;
- especificação cross-chat Fase 1 foi aprovada;
- plano de implementação Fase 1 foi aprovado;
- repo foi tornado público temporariamente para permitir CI;
- riscos decorrentes dessa decisão foram auditados;
- rewrite/sanitização destrutiva não foi autorizada;
- prioridade cross-chat foi reafirmada;
- decisão deste roadmap foi persistida no Ledger como `ec-2026-08-21-223600-001`.

### Estado da Tarefa 1

```text
OPERACIONALMENTE CONCLUÍDA
/
DENO CHECK NÃO COMPROVADO
```

### Próximo passo exato

Verificar GitHub Actions com o repositório público e obter evidência real de:

```bash
deno check supabase/functions/cognitive-ledger-api/index.ts
```

### Depois do Deno verde

1. atualizar a auditoria da Tarefa 1;
2. verificar ausência de regressão relevante do serviço privado;
3. fechar Tarefa 1;
4. iniciar Tarefa 2 — schema de clientes, auditoria e vetores.

### Não executar agora

- rewrite do histórico;
- force-push destrutivo;
- separar repositório público/privado;
- migração MCP para VPS;
- escrita cross-chat;
- redesign visual final.

---

# PARTE XV — TEMPLATE DE CHECKPOINT FUTURO

## 58. Formato obrigatório

Ao finalizar um novo marco, atualizar esta seção ou adicionar um checkpoint subsequente com:

```text
CHECKPOINT

Data/hora:

Objetivo vigente:

Último marco concluído:

Evidências:
- teste
- commit
- deploy
- consulta
- auditoria

Estado das tarefas:

Próximo passo exato:

Bloqueios:

Gates humanos pendentes:

Riscos conhecidos:

Não executar ainda:

Eventos Cognitivos relacionados:
```

---

# PARTE XVI — POLÍTICA DE ATUALIZAÇÃO DESTE ROADMAP

## 59. Quando atualizar

Atualizar quando ocorrer:

- fechamento formal de tarefa;
- mudança de arquitetura aprovada;
- novo incidente que altere o caminho crítico;
- novo gate humano;
- mudança de prioridade;
- Teste A/B/C;
- alteração do mecanismo de gravação/leitura;
- ativação do MCP;
- mudança da fonte operacional de verdade.

## 60. Quando não reescrever história

Se um estado antigo ficou obsoleto:

- preservar o registro histórico;
- adicionar checkpoint novo;
- marcar o estado anterior como superado quando apropriado;
- não apagar silenciosamente a evolução.

---

# PARTE XVII — DOCUMENTOS CANÔNICOS RELACIONADOS

## 61. Especificação cross-chat

`documentacao/especificacoes/2026-08-21-acesso-cross-chat-fase-1.md`

Contém requisitos e contrato aprovado da Fase 1.

## 62. Plano de implementação cross-chat

`documentacao/planos/2026-08-21-acesso-cross-chat-fase-1.md`

Contém as Tarefas 1–9, gates, arquivos, testes e critérios de aceite detalhados.

## 63. Auditoria da Tarefa 1

`documentacao/auditorias/2026-08-21-tarefa-1-baseline-cross-chat.md`

Deve ser atualizada quando houver evidência real do Deno check.

## 64. Autenticação e recuperação

`documentacao/autenticacao-e-recuperacao-de-acesso.md`

Preserva o incidente de senha, a separação de boundaries e a dívida futura de recuperação autônoma.

## 65. Decisão de visibilidade temporária

`documentacao/decisoes/2026-08-21-visibilidade-temporaria-repositorio.md`

Registra por que o repo foi tornado público e que isso é temporário.

## 66. Decisão de remediação adiada

`documentacao/decisoes/2026-08-21-remediacao-historico-publico-adiada.md`

Registra riscos, recomendação de segurança, não autorização do rewrite e necessidade de novo gate.

## 67. Recomendação MCP versus VPS

`documentacao/recomendacoes/2026-08-21-mcp-e-cloud-infrastructure.md`

Preserva a decisão de não hospedar o MCP na VPS nesta fase.

---

# PARTE XVIII — DEFINIÇÃO DE PRONTO DA FASE 1

## 68. Estado `IMPLEMENTADO / VALIDADO FASE 1`

Somente permitido quando houver evidência de:

```text
✓ chat novo acessa o Ledger
✓ OAuth/autorização funciona
✓ cliente é identificado
✓ capacidades são aplicadas
✓ revogação é independente
✓ busca semântica funciona
✓ filtros funcionam
✓ relações são respeitadas
✓ auditoria existe
✓ auditoria é fail-closed
✓ raw source não sai por padrão
✓ Teste A passa
✓ Teste B passa
✓ nenhuma escrita cross-chat ocorreu
✓ diário privado antigo não regrediu
✓ protótipo público continua sem dados reais
✓ MCP não possui segredo administrativo
✓ logs não expõem tokens/secrets
```

Qualquer falha relevante impede o uso do estado `VALIDADO`.

---

# PARTE XIX — RESUMO EXECUTIVO PARA RETOMADA RÁPIDA

## 69. Se um novo chat só puder ler uma seção primeiro

Leia isto:

```text
OBJETIVO:
permitir continuidade entre chats via Cognitive Ledger.

FONTE OPERACIONAL:
Supabase/Postgres.

CAPTURA ATUAL:
explícita; quando há acesso direto autorizado, construir Evento Cognitivo + Fonte + Relações, persistir via registrar_evento_cognitivo e ler de volta antes de afirmar sucesso.

LEITURA ATUAL:
quando há acesso direto autorizado, consultar eventos relevantes no Supabase, preservar tipos epistemológicos e separar memória armazenada de análise nova.

ARQUITETURA-ALVO:
ChatGPT/MCF → OAuth 2.1 → MCP remoto → cognitive-ledger-api → Supabase.

FASE 1 MCP:
somente leitura.

TAREFA ATUAL:
fechar Tarefa 1 com evidência real de deno check.

PRÓXIMA TAREFA:
Tarefa 2 — clientes, auditoria e vetores.

RISCO ADIADO:
remediação estrutural do repo público.

NÃO FAZER AGORA:
rewrite, force-push destrutivo, VPS para MCP, escrita cross-chat.

EVENTOS-CHAVE:
ec-2026-08-21-084600-001
ec-2026-08-21-092600-001
ec-2026-08-21-212600-001
ec-2026-08-21-223600-001
```

---

## 70. Princípio de encerramento

O objetivo deste roadmap não é eternizar documentação.

Ele deve deixar de ser necessário como “ponte manual” quando o próprio Cognitive Ledger conseguir cumprir plenamente este fluxo:

```text
novo chat
   ↓
autentica
   ↓
consulta o Ledger
   ↓
recupera contexto relevante
   ↓
continua a missão
   ↓
sem reconstrução manual da conversa anterior
```

Quando isso acontecer, este documento continuará valioso como histórico e runbook, mas a continuidade passará a ser uma capacidade operacional do próprio produto.
