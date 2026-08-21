---
versao_do_esquema: 1
id: ec-2026-08-21-030100-001
timestamp: 2026-08-21T03:01:00-03:00
tipo: decisao_operacional
status: ativo
titulo: Oficialização do protocolo operacional visível do MCF
assuntos:
  - MCF
  - colaboracao-multiagente
  - handoffs
  - observabilidade
  - cognitive-ledger
projetos:
  - MCF
  - Cognitive Ledger
referencias_de_fonte:
  - fonte-2026-08-21-030100-001
relacoes:
  - tipo: valida
    alvo: protocolo-operacional-do-mcf
  - tipo: deriva_de
    alvo: necessidade-de-observar-a-equipe-trabalhando
criado_por: ia
---

# Oficialização do protocolo operacional visível do MCF

## Contexto

Após testar diferentes formas de colaboração, ficou definido que o comportamento esperado do MCF não é apenas entregar um resultado final. Em missões complexas, o usuário quer acompanhar a organização trabalhando diretamente no histórico da conversa.

O próprio pedido de registrar esta decisão foi usado como teste do protocolo.

## Resumo

O MCF deve tornar visíveis, durante a execução, a convocação dos especialistas, a responsabilidade de cada papel, a análise operacional resumida, as decisões, os resultados produzidos, os handoffs, as evidências, os bloqueios, a auditoria e a consolidação pelo MESTRE.

A colaboração visível pertence à conversa operacional. Ela não deve ser inserida automaticamente dentro das aplicações ou produtos desenvolvidos.

## Decisões

- O MESTRE atua como orquestrador de missões complexas.
- Especialistas são convocados somente quando suas competências forem realmente necessárias.
- Cada agente deve produzir trabalho verificável, e não apenas participação narrativa.
- Todo handoff relevante deve declarar origem, destino, entrega e motivo.
- O agente seguinte deve reconhecer o que recebeu antes de executar sua etapa.
- Evidência deve preceder afirmações de funcionamento, publicação, validação ou conclusão.
- Bloqueios devem separar fatos de hipóteses e ser encaminhados à competência adequada.
- O último especialista devolve a missão ao MESTRE para consolidação.
- Gates de autoridade humana não devem ser ultrapassados silenciosamente.
- O histórico da conversa é a superfície operacional visível da colaboração do MCF.
- Bastidores da equipe não pertencem automaticamente à interface do Cognitive Ledger nem a outros produtos.

## Aprendizados

- Ver a equipe trabalhando reduz a opacidade do processo e permite avaliar coordenação, responsabilidade e qualidade dos handoffs.
- A visibilidade operacional é diferente de expor cadeia de pensamento privada: devem ser mostrados critérios, decisões, evidências, riscos e justificativas resumidas, não raciocínio interno token por token.
- Quando os papéis são executados dentro da mesma sessão, isso deve ser descrito como execução por papéis do MCF, sem fingir independência cognitiva simultânea.
- Quando houver execução pelo runtime multiagente real, ela deve ser distinguida explicitamente da execução representada por papéis.

## Evidência deste teste

A própria missão de registro foi executada no histórico com o fluxo:

MESTRE → Leonardo → Sofia → Gabriel → Beatriz → Emily → MESTRE.

A fonte associada preserva a mensagem do usuário que iniciou o teste.

## Questões abertas

- Em que momento o Cognitive Ledger deverá registrar automaticamente eventos relevantes sem comando explícito?
- Como vincular futuramente eventos do runtime real do MCF aos registros cognitivos sem misturar logs operacionais com memória intelectual?

## Próximos passos

- Continuar usando este protocolo nas próximas missões complexas.
- Observar se a quantidade de mensagens operacionais está adequada ou se precisa de compactação.
- Evoluir o Cognitive Ledger para recuperar este tipo de decisão em conversas futuras quando o usuário pedir para ler o diário.
