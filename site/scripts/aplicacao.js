(() => {
  "use strict";

  const dados = window.DADOS_COGNITIVE_LEDGER;

  if (!dados || !Array.isArray(dados.registros)) {
    document.body.innerHTML = "<p>Não foi possível carregar os dados do protótipo.</p>";
    return;
  }

  const elementos = {
    busca: document.querySelector("#busca"),
    filtroTipo: document.querySelector("#filtro-tipo"),
    filtroProjeto: document.querySelector("#filtro-projeto"),
    limparFiltros: document.querySelector("#limpar-filtros"),
    limparFiltrosVazio: document.querySelector("#limpar-filtros-vazio"),
    contador: document.querySelector("#contador-resultados"),
    rotuloResultados: document.querySelector("#rotulo-resultados"),
    avisoDemonstracao: document.querySelector("#aviso-demonstracao"),
    lista: document.querySelector("#lista-linha-do-tempo"),
    estadoVazio: document.querySelector("#estado-vazio"),
    detalheInicial: document.querySelector("#detalhe-inicial"),
    detalheRegistro: document.querySelector("#detalhe-registro"),
    detalheTipo: document.querySelector("#detalhe-tipo"),
    detalheStatus: document.querySelector("#detalhe-status"),
    detalheData: document.querySelector("#detalhe-data"),
    detalheTitulo: document.querySelector("#detalhe-titulo"),
    detalheResumo: document.querySelector("#detalhe-resumo"),
    detalheContexto: document.querySelector("#detalhe-contexto"),
    blocoIdeias: document.querySelector("#bloco-ideias"),
    blocoDecisoes: document.querySelector("#bloco-decisoes"),
    blocoHipoteses: document.querySelector("#bloco-hipoteses"),
    blocoQuestoes: document.querySelector("#bloco-questoes"),
    blocoProximosPassos: document.querySelector("#bloco-proximos-passos"),
    detalheProjetos: document.querySelector("#detalhe-projetos"),
    detalheAssuntos: document.querySelector("#detalhe-assuntos"),
    detalheRelacoes: document.querySelector("#detalhe-relacoes"),
    detalheFonte: document.querySelector("#detalhe-fonte")
  };

  const estado = {
    busca: "",
    tipo: "",
    projeto: "",
    selecionado: null
  };

  const registrosPorId = new Map(dados.registros.map((registro) => [registro.id, registro]));
  const tiposPorId = new Map(dados.tipos.map((tipo) => [tipo.id, tipo.rotulo]));
  const projetosPorId = new Map(dados.projetos.map((projeto) => [projeto.id, projeto.rotulo]));

  const formatadorData = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  const formatadorDataHora = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const formatadorHora = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  });

  function normalizarTexto(valor) {
    return String(valor ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR")
      .trim();
  }

  function textoPesquisavel(registro) {
    const campos = [
      registro.titulo,
      registro.resumo,
      registro.contexto,
      ...(registro.assuntos || []),
      ...(registro.projetos || []).map((id) => projetosPorId.get(id) || id),
      ...(registro.ideias || []),
      ...(registro.decisoes || []),
      ...(registro.hipoteses || []),
      ...(registro.questoes_abertas || []),
      ...(registro.proximos_passos || [])
    ];

    return normalizarTexto(campos.join(" "));
  }

  function obterRegistrosFiltrados() {
    const termo = normalizarTexto(estado.busca);

    return [...dados.registros]
      .filter((registro) => {
        if (estado.tipo && registro.tipo !== estado.tipo) return false;
        if (estado.projeto && !(registro.projetos || []).includes(estado.projeto)) return false;
        if (termo && !textoPesquisavel(registro).includes(termo)) return false;
        return true;
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  function chaveDaData(timestamp) {
    const data = new Date(timestamp);
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  }

  function agruparPorData(registros) {
    const grupos = new Map();

    registros.forEach((registro) => {
      const chave = chaveDaData(registro.timestamp);
      if (!grupos.has(chave)) grupos.set(chave, []);
      grupos.get(chave).push(registro);
    });

    return grupos;
  }

  function criarEtiqueta(texto, classeExtra = "") {
    const elemento = document.createElement("span");
    elemento.className = `etiqueta ${classeExtra}`.trim();
    elemento.textContent = texto;
    return elemento;
  }

  function criarEventoResumo(registro) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "evento-botao";
    botao.dataset.registroId = registro.id;
    botao.setAttribute("aria-current", registro.id === estado.selecionado ? "true" : "false");

    const topo = document.createElement("div");
    topo.className = "evento-topo";
    topo.append(
      criarEtiqueta(tiposPorId.get(registro.tipo) || registro.tipo),
      Object.assign(document.createElement("time"), {
        className: "evento-hora",
        dateTime: registro.timestamp,
        textContent: formatadorHora.format(new Date(registro.timestamp))
      })
    );

    const titulo = document.createElement("h3");
    titulo.textContent = registro.titulo;

    const resumo = document.createElement("p");
    resumo.textContent = registro.resumo;

    const rodape = document.createElement("div");
    rodape.className = "evento-rodape";

    (registro.projetos || []).forEach((projetoId) => {
      rodape.append(criarEtiqueta(projetosPorId.get(projetoId) || projetoId, "etiqueta-projeto"));
    });

    if ((registro.decisoes || []).length > 0) {
      rodape.append(criarEtiqueta(`${registro.decisoes.length} decisão${registro.decisoes.length > 1 ? "ões" : ""}`));
    }

    const totalPendencias = (registro.questoes_abertas || []).length + (registro.proximos_passos || []).length;
    if (totalPendencias > 0) {
      rodape.append(criarEtiqueta(`${totalPendencias} pendência${totalPendencias > 1 ? "s" : ""}`, "etiqueta-neutra"));
    }

    botao.append(topo, titulo, resumo, rodape);
    botao.addEventListener("click", () => selecionarRegistro(registro.id));

    return botao;
  }

  function renderizarLinhaDoTempo() {
    const registros = obterRegistrosFiltrados();
    const grupos = agruparPorData(registros);

    elementos.lista.replaceChildren();
    elementos.contador.textContent = String(registros.length);
    elementos.rotuloResultados.textContent = registros.length === 1 ? "registro visível" : "registros visíveis";
    elementos.estadoVazio.hidden = registros.length !== 0;

    grupos.forEach((registrosDoDia) => {
      const secao = document.createElement("section");
      secao.className = "grupo-data";

      const data = new Date(registrosDoDia[0].timestamp);
      const titulo = document.createElement("h3");
      titulo.className = "titulo-data";
      titulo.textContent = formatadorData.format(data);

      const lista = document.createElement("div");
      lista.className = "lista-eventos";
      registrosDoDia.forEach((registro) => lista.append(criarEventoResumo(registro)));

      secao.append(titulo, lista);
      elementos.lista.append(secao);
    });

    if (estado.selecionado && !registros.some((registro) => registro.id === estado.selecionado)) {
      limparDetalhe();
    }
  }

  function renderizarListaEstruturada(container, titulo, itens) {
    container.replaceChildren();
    container.hidden = !Array.isArray(itens) || itens.length === 0;
    if (container.hidden) return;

    const subtitulo = document.createElement("h4");
    subtitulo.textContent = titulo;

    const lista = document.createElement("ul");
    itens.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      lista.append(li);
    });

    container.append(subtitulo, lista);
  }

  function renderizarRelacoes(registro) {
    elementos.detalheRelacoes.replaceChildren();
    const relacoes = registro.relacoes || [];

    if (relacoes.length === 0) {
      const texto = document.createElement("p");
      texto.textContent = "Nenhuma relação registrada neste protótipo.";
      elementos.detalheRelacoes.append(texto);
      return;
    }

    const lista = document.createElement("ul");

    relacoes.forEach((relacao) => {
      const item = document.createElement("li");
      const destino = registrosPorId.get(relacao.destino);

      if (destino) {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "botao-relacao";
        botao.textContent = `${relacao.rotulo || relacao.tipo}: ${destino.titulo}`;
        botao.addEventListener("click", () => selecionarRegistro(destino.id, true));
        item.append(botao);
      } else {
        item.textContent = relacao.rotulo || `${relacao.tipo}: ${relacao.destino}`;
      }

      lista.append(item);
    });

    elementos.detalheRelacoes.append(lista);
  }

  function adicionarDefinicao(lista, termo, descricao) {
    if (!descricao) return;

    const linha = document.createElement("div");
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = termo;
    dd.textContent = descricao;
    linha.append(dt, dd);
    lista.append(linha);
  }

  function renderizarFonte(fonte) {
    elementos.detalheFonte.replaceChildren();

    if (!fonte) {
      adicionarDefinicao(elementos.detalheFonte, "Fonte", "Não informada neste protótipo.");
      return;
    }

    adicionarDefinicao(elementos.detalheFonte, "Tipo", fonte.tipo);
    adicionarDefinicao(elementos.detalheFonte, "Provedor", fonte.provedor);
    adicionarDefinicao(elementos.detalheFonte, "Escopo", fonte.escopo);
    adicionarDefinicao(elementos.detalheFonte, "Referência", fonte.referencia);
    adicionarDefinicao(elementos.detalheFonte, "Observação", fonte.observacao);
  }

  function renderizarDetalhe(registro) {
    elementos.detalheInicial.hidden = true;
    elementos.detalheRegistro.hidden = false;

    elementos.detalheTipo.textContent = tiposPorId.get(registro.tipo) || registro.tipo;
    elementos.detalheStatus.textContent = registro.status || "sem status";
    elementos.detalheData.dateTime = registro.timestamp;
    elementos.detalheData.textContent = formatadorDataHora.format(new Date(registro.timestamp));
    elementos.detalheTitulo.textContent = registro.titulo;
    elementos.detalheResumo.textContent = registro.resumo;
    elementos.detalheContexto.textContent = registro.contexto || "Contexto não registrado.";
    elementos.detalheProjetos.textContent = (registro.projetos || []).map((id) => projetosPorId.get(id) || id).join(", ") || "Nenhum";
    elementos.detalheAssuntos.textContent = (registro.assuntos || []).join(", ") || "Nenhum";

    renderizarListaEstruturada(elementos.blocoIdeias, "Ideias", registro.ideias);
    renderizarListaEstruturada(elementos.blocoDecisoes, "Decisões", registro.decisoes);
    renderizarListaEstruturada(elementos.blocoHipoteses, "Hipóteses", registro.hipoteses);
    renderizarListaEstruturada(elementos.blocoQuestoes, "Questões abertas", registro.questoes_abertas);
    renderizarListaEstruturada(elementos.blocoProximosPassos, "Próximos passos", registro.proximos_passos);
    renderizarRelacoes(registro);
    renderizarFonte(registro.fonte);
  }

  function atualizarSelecaoVisual() {
    document.querySelectorAll(".evento-botao").forEach((botao) => {
      botao.setAttribute("aria-current", botao.dataset.registroId === estado.selecionado ? "true" : "false");
    });
  }

  function selecionarRegistro(id, rolarAteDetalhe = false) {
    const registro = registrosPorId.get(id);
    if (!registro) return;

    estado.selecionado = id;
    atualizarSelecaoVisual();
    renderizarDetalhe(registro);

    if (rolarAteDetalhe && window.matchMedia("(max-width: 920px)").matches) {
      elementos.detalheRegistro.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function limparDetalhe() {
    estado.selecionado = null;
    elementos.detalheRegistro.hidden = true;
    elementos.detalheInicial.hidden = false;
    atualizarSelecaoVisual();
  }

  function limparFiltros() {
    estado.busca = "";
    estado.tipo = "";
    estado.projeto = "";
    elementos.busca.value = "";
    elementos.filtroTipo.value = "";
    elementos.filtroProjeto.value = "";
    renderizarLinhaDoTempo();
  }

  function preencherFiltros() {
    dados.tipos.forEach((tipo) => {
      const opcao = document.createElement("option");
      opcao.value = tipo.id;
      opcao.textContent = tipo.rotulo;
      elementos.filtroTipo.append(opcao);
    });

    dados.projetos.forEach((projeto) => {
      const opcao = document.createElement("option");
      opcao.value = projeto.id;
      opcao.textContent = projeto.rotulo;
      elementos.filtroProjeto.append(opcao);
    });
  }

  function conectarEventos() {
    elementos.busca.addEventListener("input", (evento) => {
      estado.busca = evento.currentTarget.value;
      renderizarLinhaDoTempo();
    });

    elementos.filtroTipo.addEventListener("change", (evento) => {
      estado.tipo = evento.currentTarget.value;
      renderizarLinhaDoTempo();
    });

    elementos.filtroProjeto.addEventListener("change", (evento) => {
      estado.projeto = evento.currentTarget.value;
      renderizarLinhaDoTempo();
    });

    elementos.limparFiltros.addEventListener("click", limparFiltros);
    elementos.limparFiltrosVazio.addEventListener("click", limparFiltros);
  }

  function iniciar() {
    elementos.avisoDemonstracao.textContent = dados.meta?.aviso || "";
    preencherFiltros();
    conectarEventos();
    renderizarLinhaDoTempo();

    const maisRecente = obterRegistrosFiltrados()[0];
    if (maisRecente) selecionarRegistro(maisRecente.id);
  }

  iniciar();
})();
