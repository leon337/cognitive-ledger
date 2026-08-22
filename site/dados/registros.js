window.DADOS_COGNITIVE_LEDGER = {
  meta: {
    versao: 1,
    demonstracao: true,
    aviso: "Dados demonstrativos baseados nos temas discutidos durante a criação do protótipo. Não representam captura automática nem fonte bruta do diário."
  },
  tipos: [
    { id: "ideia", rotulo: "Ideia" },
    { id: "decisao", rotulo: "Decisão" },
    { id: "hipotese", rotulo: "Hipótese" },
    { id: "aprendizado", rotulo: "Aprendizado" },
    { id: "sintese", rotulo: "Síntese" }
  ],
  projetos: [
    { id: "cognitive-ledger", rotulo: "Cognitive Ledger" },
    { id: "mcf-product-lab", rotulo: "MCF Product Lab" },
    { id: "mcf", rotulo: "MCF" }
  ],
  registros: [
    {
      id: "demo-005",
      timestamp: "2026-08-21T02:05:00-03:00",
      tipo: "decisao",
      status: "ativo",
      titulo: "Português como idioma operacional do repositório",
      resumo: "A documentação, pastas e arquivos controlados pelo projeto passam a usar português do Brasil para reduzir esforço cognitivo e facilitar referência direta durante as conversas.",
      contexto: "A leitura dos documentos em inglês dificultava revisar e pedir alterações específicas. A decisão foi tratar português como idioma operacional, mantendo em inglês apenas nomes impostos por convenções técnicas.",
      projetos: ["cognitive-ledger"],
      assuntos: ["idioma", "documentação", "arquitetura do repositório"],
      ideias: [
        "A estrutura física do projeto também deve ser compreensível para quem o usa.",
        "Convenções técnicas inevitáveis podem permanecer em inglês."
      ],
      decisoes: [
        "Documentação e nomes controlados por nós ficam em português do Brasil.",
        "README.md e index.html permanecem por convenção técnica."
      ],
      hipoteses: [],
      questoes_abertas: [],
      proximos_passos: ["Manter novos artefatos no idioma operacional definido."],
      relacoes: [
        { tipo: "refina", destino: "demo-004", rotulo: "refina a estratégia do protótipo navegável" }
      ],
      fonte: {
        tipo: "chat",
        provedor: "ChatGPT",
        escopo: "discussão de produto",
        referencia: "Conversa de discovery do Cognitive Ledger",
        observacao: "Entrada demonstrativa; fonte bruta não publicada."
      }
    },
    {
      id: "demo-004",
      timestamp: "2026-08-21T01:55:00-03:00",
      tipo: "decisao",
      status: "ativo",
      titulo: "Protótipo HTML, CSS e JavaScript antes do Google Stitch",
      resumo: "O produto será amadurecido em um site estático simples e navegável antes da etapa de design visual, permitindo testar estrutura, conteúdo e navegação na prática.",
      contexto: "A intenção não é desenhar a interface final agora, mas criar um laboratório funcional que possa ser usado, criticado e posteriormente enviado ao Google Stitch como referência estrutural.",
      projetos: ["cognitive-ledger"],
      assuntos: ["protótipo", "GitHub Pages", "Google Stitch", "navegação"],
      ideias: [
        "O protótipo deve fazer parte do processo de pensamento, não apenas apresentar o resultado final.",
        "O Stitch deve receber um produto estruturalmente pensado e trabalhar a camada visual."
      ],
      decisoes: [
        "Usar HTML, CSS e JavaScript simples, sem framework obrigatório.",
        "Publicar uma URL navegável para revisão contínua."
      ],
      hipoteses: [],
      questoes_abertas: ["Qual mecanismo de publicação será o mais simples e estável para um repositório privado?"],
      proximos_passos: ["Construir a primeira linha do tempo navegável.", "Entregar o link ao Google Stitch quando o briefing estiver maduro."],
      relacoes: [
        { tipo: "levou_a", destino: "demo-005", rotulo: "levou à definição do idioma operacional" }
      ],
      fonte: {
        tipo: "chat",
        provedor: "ChatGPT",
        escopo: "decisão estrutural",
        referencia: "Conversa de discovery do Cognitive Ledger",
        observacao: "Entrada demonstrativa; fonte bruta não publicada."
      }
    },
    {
      id: "demo-003",
      timestamp: "2026-08-21T01:35:00-03:00",
      tipo: "sintese",
      status: "ativo",
      titulo: "Cognitive Ledger como camada externa de continuidade",
      resumo: "O diário deixa de ser apenas um histórico de chats e passa a ser entendido como uma memória intelectual externa, controlada pelo usuário e reutilizável entre diferentes conversas e modelos de IA.",
      contexto: "A necessidade central é conseguir retomar ideias, decisões e aprendizados sem depender do chat original ou da memória interna de um provedor.",
      projetos: ["cognitive-ledger", "mcf"],
      assuntos: ["continuidade", "memória", "proveniência", "IA"],
      ideias: [
        "A unidade principal deve ser o Evento Cognitivo, não a conversa.",
        "O Registro Cognitivo responde o que aquilo significou; o Registro de Fonte responde o que realmente foi dito e de onde veio.",
        "A linha do tempo é a primeira visualização, mas relações devem existir desde o início."
      ],
      decisoes: ["Separar Registro Cognitivo de Registro de Fonte."],
      hipoteses: ["O ledger poderá futuramente servir como fonte de contexto para o MCF e receber aprendizados de volta."],
      questoes_abertas: ["Como a captura entre diferentes interfaces será materializada?"],
      proximos_passos: ["Amadurecer tipos de evento e mecanismos de recuperação."],
      relacoes: [
        { tipo: "originou_de", destino: "demo-002", rotulo: "evolui da necessidade histórica de continuidade" },
        { tipo: "levou_a", destino: "demo-004", rotulo: "levou ao protótipo navegável" }
      ],
      fonte: {
        tipo: "chat",
        provedor: "ChatGPT",
        escopo: "síntese conceitual",
        referencia: "Conversa de discovery do Cognitive Ledger",
        observacao: "Entrada demonstrativa; fonte bruta não publicada."
      }
    },
    {
      id: "demo-002",
      timestamp: "2026-08-21T01:15:00-03:00",
      tipo: "aprendizado",
      status: "ativo",
      titulo: "A necessidade de continuidade antecede o próprio MCF",
      resumo: "Foi reconhecido que parte da motivação histórica que levou ao MCF veio da tentativa de preservar contexto, pensamento e continuidade para trabalhar com IA ao longo do tempo.",
      contexto: "O problema original de continuidade foi se expandindo até exigir memória, papéis, coordenação, ferramentas, handoffs, evidência e governança, contribuindo para a evolução do MCF.",
      projetos: ["mcf", "cognitive-ledger"],
      assuntos: ["história", "MCF", "continuidade cognitiva"],
      ideias: ["O Cognitive Ledger retoma o problema original com a experiência adquirida na evolução do MCF."],
      decisoes: [],
      hipoteses: ["Cognitive Ledger e MCF podem se tornar camadas complementares no futuro."],
      questoes_abertas: [],
      proximos_passos: ["Preservar a independência entre os dois projetos enquanto a integração não for formalizada."],
      relacoes: [
        { tipo: "levou_a", destino: "demo-003", rotulo: "levou à definição do ledger como continuidade externa" }
      ],
      fonte: {
        tipo: "chat",
        provedor: "ChatGPT",
        escopo: "reflexão histórica",
        referencia: "Conversa de discovery do Cognitive Ledger",
        observacao: "Entrada demonstrativa; fonte bruta não publicada."
      }
    },
    {
      id: "demo-001",
      timestamp: "2026-08-21T00:50:00-03:00",
      tipo: "hipotese",
      status: "ativo",
      titulo: "MCF como agência de profissionais virtuais",
      resumo: "A visão de produto do MCF passou a ser explorada como uma agência de profissionais virtuais, em vez de uma interface que vende apenas agentes técnicos.",
      contexto: "A hipótese busca traduzir a infraestrutura multiagente para uma abstração compreensível ao usuário: profissionais, equipes, projetos e resultados.",
      projetos: ["mcf-product-lab", "mcf"],
      assuntos: ["produto", "profissionais virtuais", "agência"],
      ideias: [
        "O usuário administra profissionais, equipes, projetos, objetivos e resultados.",
        "O MCF administra agentes, skills, handoffs, evidências, permissões e runtime."
      ],
      decisoes: ["Registrar a hipótese no MCF Product Lab para investigação."],
      hipoteses: ["Profissionais virtuais podem ser uma abstração de produto mais forte do que agentes de IA."],
      questoes_abertas: ["Como essa metáfora deve aparecer no posicionamento final do MCF?"],
      proximos_passos: ["Continuar o discovery antes de consolidar a visão de produto."],
      relacoes: [],
      fonte: {
        tipo: "chat",
        provedor: "ChatGPT",
        escopo: "discussão de produto",
        referencia: "Conversa sobre MCF Product Lab",
        observacao: "Entrada demonstrativa; fonte bruta não publicada."
      }
    }
  ]
};
