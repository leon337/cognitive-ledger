# Acesso Cross-Chat ao Cognitive Ledger — Fase 1

**Status:** DESIGN APROVADO / ESPECIFICAÇÃO EM REVISÃO
**Data:** 2026-08-21

## Objetivo

Permitir que novos chats autorizados no ChatGPT e a equipe do MCF consultem o Cognitive Ledger para recuperar continuidade profissional e apoiar decisões, sem depender do contexto da conversa onde os registros foram criados.

A primeira fase é deliberadamente somente leitura. O objetivo é provar que um chat novo consegue recuperar memória relevante de forma segura, auditável e epistemicamente confiável antes de liberar escrita cross-chat.

## Princípio central

O Cognitive Ledger deve funcionar como uma memória profissional externa e reutilizável, acessível por clientes autorizados através de uma interface estável e independente do armazenamento interno.

```text
ChatGPT / MCF
      ↓
Cognitive Ledger MCP / camada de ferramentas
      ↓
autorização por cliente
      ↓
ler_diario | buscar_eventos | recuperar_contexto
      ↓
motor de recuperação
      ↓
API interna do Cognitive Ledger
      ↓
Supabase/Postgres
      ↓
trilha de auditoria
```

O Supabase permanece como fonte de verdade operacional. Clientes externos não recebem acesso direto ao banco nem conhecem suas credenciais administrativas.

## Escopo da Fase 1

### Incluído

- acesso por chats autorizados do ChatGPT;
- uso pelo MESTRE e papéis do MCF;
- leitura de eventos recentes;
- busca por assunto, projeto, tipo e período;
- recuperação de contexto para uma missão ou decisão;
- recuperação híbrida preparada para significado semântico, filtros, relações e recência;
- autorização por cliente;
- auditoria de todas as consultas;
- acesso ao Registro Cognitivo por padrão;
- acesso excepcional à fonte bruta quando houver justificativa operacional;
- sinalização de ausência de evidência, ambiguidade e conflito;
- arquitetura preparada para Codex e outras IAs no futuro.

### Fora do escopo

- escrita cross-chat;
- `registrar_no_diario` exposto a clientes remotos;
- acesso SQL direto por chats ou agentes;
- carregamento integral do diário no contexto de uma conversa;
- sistema completo de organizações e múltiplos proprietários;
- sincronização com todos os provedores de IA;
- captura automática;
- alteração do armazenamento primário;
- correção de documentação histórica fora desta especificação.

O caminho de gravação operacional já existente continua separado e não é alterado por esta fase.

## Contrato de ferramentas

### `ler_diario`

Objetivo: recuperar uma janela recente do diário.

Entradas previstas:

- quantidade máxima de eventos;
- período opcional;
- projeto opcional;
- tipos opcionais.

Saída: coleção limitada de Registros Cognitivos com ID, timestamp, tipo, título, resumo, contexto relevante, metadados cognitivos e proveniência básica.

### `buscar_eventos`

Objetivo: localizar eventos por consulta e filtros explícitos.

Entradas previstas:

- texto ou intenção de busca;
- projeto;
- assuntos;
- tipos;
- período;
- limite.

Saída: eventos classificados por relevância, preservando seus tipos e IDs.

### `recuperar_contexto`

Objetivo: construir um Pacote de Contexto para uma missão, síntese ou decisão.

Entradas previstas:

- objetivo atual;
- assunto ou projeto;
- focos desejados, como decisões, hipóteses, questões abertas, aprendizados, marcos ou próximos passos;
- período opcional;
- limite de contexto.

Saída prevista:

```text
Pacote de Contexto
- eventos selecionados
- decisões confirmadas
- hipóteses
- aprendizados
- questões abertas
- próximos passos
- relações relevantes
- lacunas
- conflitos
- IDs, datas e proveniência básica
```

A ferramenta não deve transformar o pacote em uma conclusão final. A interpretação pertence ao MESTRE ou ao agente que recebeu o contexto.

## Recuperação híbrida

A arquitetura deve suportar uma combinação progressiva de:

1. busca textual;
2. filtros estruturados por projeto, assunto, tipo e período;
3. similaridade semântica;
4. relações entre eventos;
5. recência;
6. priorização de decisões e questões ainda abertas quando forem relevantes à missão.

A primeira implementação pode introduzir esses mecanismos de forma incremental, mas o contrato público não deve depender de correspondência literal de palavras.

Exemplo: uma pergunta como “quando percebi que a equipe estava funcionando como planejado?” deve poder recuperar um evento cujo título seja “Materialização profissional do ecossistema MCF + Cognitive Ledger”, mesmo sem repetição literal dos termos.

## Política de contexto

“Ler meu diário” não significa carregar todo o diário.

A recuperação deve selecionar o menor conjunto de eventos suficiente para cumprir a missão com qualidade. O sistema deve favorecer relevância e evidência sobre volume.

O MESTRE pode consultar o Cognitive Ledger de duas formas:

1. por solicitação explícita do usuário;
2. proativamente, quando o histórico for claramente relevante para a missão.

Toda consulta proativa deve ser visível no histórico operacional da conversa, por exemplo:

> Consultando o Cognitive Ledger para recuperar decisões e contexto relevantes.

## Registro Cognitivo e Registro de Fonte

### Camada padrão — Registro Cognitivo

Por padrão, clientes recebem:

- ID;
- timestamp;
- tipo epistemológico/cognitivo;
- título;
- resumo;
- contexto;
- decisões;
- hipóteses;
- ideias e aprendizados quando presentes;
- questões abertas;
- próximos passos;
- relações relevantes;
- proveniência básica.

### Camada restrita — Registro de Fonte

Conteúdo bruto de conversas ou outras fontes não deve ser incluído automaticamente.

A fonte bruta só pode ser acessada quando houver necessidade operacional clara, como verificar a formulação original de uma decisão ou resolver uma divergência de interpretação.

Quando a fonte bruta for acessada:

- a justificativa deve ser explícita;
- a consulta deve aparecer no histórico da missão;
- a auditoria deve registrar que houve acesso à fonte bruta.

## Confiabilidade epistemológica

A recuperação deve preservar a natureza do que foi registrado.

O sistema não pode:

- apresentar hipótese como decisão;
- apresentar reconstrução histórica como transcrição literal;
- inferir uma decisão ausente;
- resolver silenciosamente conflitos entre registros;
- ocultar falta de evidência.

Estados esperados incluem:

- decisão confirmada;
- hipótese;
- aprendizado;
- questão aberta;
- marco;
- reconstrução histórica;
- evidência insuficiente;
- conflito de contexto.

Quando não houver evidência suficiente, a resposta do Ledger deve declarar isso. Quando houver conflito, os registros relevantes devem ser apresentados para interpretação temporal ou gate humano.

## Identidade, autenticação e autorização

A Fase 1 terá um proprietário do diário e múltiplos clientes autorizados.

A identidade do proprietário é diferente da identidade de cada cliente consumidor.

Modelo conceitual:

```text
Proprietário do Ledger
        │
        ↓
Cognitive Ledger
        │
        ├── ChatGPT / MCF → cliente A
        ├── Codex futuro  → cliente B
        └── outra IA      → cliente C
```

Cada cliente deve ter:

- identidade própria;
- credencial própria;
- conjunto explícito de capacidades;
- possibilidade de revogação independente.

Permissões da Fase 1 para ChatGPT/MCF:

```text
✓ ler_diario
✓ buscar_eventos
✓ recuperar_contexto
✗ registrar_no_diario
✗ administração
✗ acesso SQL
```

Nenhum cliente recebe credenciais administrativas do Supabase.

## Auditoria

Toda operação de leitura deve produzir uma entrada de auditoria.

Campos mínimos previstos:

- timestamp;
- cliente;
- operação;
- finalidade resumida;
- IDs dos eventos retornados;
- quantidade de eventos;
- indicação de acesso ou não à fonte bruta;
- justificativa de acesso à fonte bruta quando aplicável;
- resultado da operação.

O prompt completo e o conteúdo integral da conversa não devem ser copiados para a auditoria por padrão.

A auditoria deve permitir responder, posteriormente:

- qual cliente consultou o diário;
- quando ocorreu a consulta;
- quais registros foram recuperados;
- se a fonte bruta foi acessada;
- se a operação terminou com sucesso ou falha.

## Governança do MCF

O Cognitive Ledger é uma fonte externa de evidência para o MCF, não uma memória invisível permanente.

Fluxo esperado:

```text
Missão atual
    ↓
MESTRE identifica necessidade de histórico
    ↓
consulta visível ao Cognitive Ledger
    ↓
Pacote de Contexto
    ↓
MESTRE distribui somente o recorte necessário
    ↓
agentes especializados executam suas responsabilidades
```

Cada agente recebe apenas o contexto necessário para sua função. O MESTRE preserva a distinção entre:

- conteúdo recuperado do diário;
- interpretação atual dos agentes;
- decisão final ou recomendação atual.

## Tratamento de erros

Falhas esperadas devem ser explícitas e não podem ser convertidas silenciosamente em respostas sem evidência.

Casos mínimos:

- cliente não autorizado → negar acesso;
- capacidade ausente → negar operação;
- consulta sem resultados → retornar evidência insuficiente;
- conflito entre eventos → retornar conflito de contexto;
- falha no mecanismo semântico → permitir fallback controlado para filtros/texto quando seguro, sinalizando degradação;
- indisponibilidade do armazenamento → retornar erro sem inventar memória;
- falha de auditoria → a política de implementação deve definir se a leitura é bloqueada ou registrada em mecanismo seguro alternativo; isso será resolvido no plano técnico antes da implementação.

## Compatibilidade futura

O ChatGPT é o primeiro cliente, não o centro da arquitetura.

O contrato das ferramentas e a política de autorização devem permanecer independentes do cliente para permitir, em fases posteriores:

- Codex;
- outros runtimes do MCF;
- outras IAs compatíveis;
- clientes próprios do Cognitive Ledger.

Trocar o armazenamento interno não deve exigir mudança no contrato consumido pelos clientes.

## Critérios formais de aceite

### Teste A — Continuidade

Em uma conversa nova, sem depender do contexto desta sessão, o usuário solicita algo equivalente a:

> Acesse meu diário e me explique como surgiu e evoluiu o Cognitive Ledger.

A Fase 1 passa neste teste somente se o chat:

1. reconhecer que precisa consultar o Ledger;
2. declarar visivelmente a consulta;
3. autenticar-se como cliente autorizado;
4. recuperar eventos relevantes por significado e filtros;
5. usar prioritariamente Registros Cognitivos;
6. distinguir decisões, hipóteses, reconstruções e marcos;
7. produzir uma síntese fundamentada nos eventos recuperados;
8. declarar lacunas e incertezas;
9. deixar trilha de auditoria;
10. não modificar o diário.

### Teste B — Decisão

Em uma conversa nova, o usuário solicita algo equivalente a:

> Consulte meu diário e me ajude a decidir qual deveria ser o próximo passo do MCF.

A Fase 1 passa neste teste somente se o chat:

1. recuperar o histórico relevante;
2. identificar decisões e questões abertas;
3. usar esse histórico como evidência para a análise atual;
4. separar explicitamente memória registrada de inferência nova;
5. produzir recomendação compatível com as evidências;
6. registrar a consulta na auditoria;
7. não modificar o diário.

## Segurança e privacidade — critérios mínimos

Antes da validação da Fase 1 deve haver evidência de que:

- nenhum segredo do Supabase aparece no cliente;
- clientes têm credenciais independentes;
- revogar um cliente não quebra os demais;
- operações de escrita cross-chat são rejeitadas;
- fonte bruta não é retornada por padrão;
- auditoria não copia conversas integrais automaticamente;
- o protótipo público continua sem acesso aos dados reais;
- falhas de autorização não revelam conteúdo privado.

## Relação com a arquitetura atual

Esta fase complementa, e não substitui, os contratos existentes.

A especificação `2026-08-21-gravacao-operacional-supabase.md` já prevê uma futura camada MCP com `registrar_no_diario`, `ler_diario`, `buscar_eventos` e `recuperar_contexto`, usando o mesmo banco e as mesmas regras de autorização.

O documento `captura-e-recuperacao.md` já estabelece que recuperação não significa carregar todo o diário e prevê eventos recentes, relações e relevância semântica.

Foi identificado um débito documental: `captura-e-recuperacao.md` ainda apresenta o teste natural de gravação como pendente, embora ele já tenha sido concluído e verificado nesta sessão. A correção desse trecho deve ocorrer na etapa de documentação/implementação posterior; não faz parte deste commit de especificação.

## Estado de conclusão desta especificação

Esta especificação descreve o design aprovado para a Fase 1 cross-chat.

Ela não constitui evidência de que o MCP, autenticação por cliente, busca híbrida ou auditoria cross-chat já estejam implementados.

**Estado operacional cross-chat: NÃO IMPLEMENTADO / NÃO VERIFICADO.**
