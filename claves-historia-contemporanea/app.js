(() => {
  const CLAVES = window.HC_CLAVES || [];
  const TYPES = window.HC_TYPES || {};

  const state = {
    classFilter: "todas",
    typeFilter: "todos",
    query: "",
    activeTemplate: "acontecimiento"
  };

  const refs = {
    classFilters: document.getElementById("classFilters"),
    typeFilters: document.getElementById("typeFilters"),
    searchInput: document.getElementById("searchInput"),
    countLine: document.getElementById("countLine"),
    cardsGrid: document.getElementById("cardsGrid"),
    timelineShell: document.getElementById("timelineShell"),
    templateTabs: document.getElementById("templateTabs"),
    templatePreview: document.getElementById("templatePreview"),
    printTemplate: document.getElementById("printTemplate")
  };

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function getType(key) {
    return TYPES[key] || {
      label: key,
      icon: "assets/icons/acontecimiento.webp",
      color: "#334155",
      sections: []
    };
  }

  function renderClassFilters() {
    const classes = ["todas", "A", "B", "C"];
    const labels = {
      todas: "Todas",
      A: "Clase A",
      B: "Clase B",
      C: "Clase C"
    };

    refs.classFilters.innerHTML = classes.map(key => (
      `<button class="filter-btn ${state.classFilter === key ? "active" : ""}" data-class="${key}">${labels[key]}</button>`
    )).join("");
  }

  function renderTypeFilters() {
    const all = `<button class="filter-btn ${state.typeFilter === "todos" ? "active" : ""}" data-type="todos">Todos los tipos</button>`;
    const buttons = Object.entries(TYPES).map(([key, info]) => (
      `<button class="filter-btn ${state.typeFilter === key ? "active" : ""}" data-type="${key}">
        <img src="${info.icon}" alt="">${escapeHtml(info.label)}
      </button>`
    )).join("");
    refs.typeFilters.innerHTML = all + buttons;
  }

  function getFilteredClaves() {
    const query = normalize(state.query);
    return CLAVES.filter(item => {
      if (["A", "B", "C"].includes(state.classFilter) && item.clase !== state.classFilter) return false;
      if (state.typeFilter !== "todos" && item.tipo !== state.typeFilter) return false;

      if (!query) return true;
      const haystack = normalize([
        item.titulo,
        item.periodo,
        item.lugar,
        item.resumen,
        item.foco,
        item.escena,
        getType(item.tipo).label
      ].join(" "));
      return haystack.includes(query);
    });
  }

  function renderCards() {
    const items = getFilteredClaves();
    refs.countLine.textContent = `${items.length} historias mostradas de ${CLAVES.length}`;

    refs.cardsGrid.innerHTML = items.map(item => {
      const type = getType(item.tipo);
      return `
        <article class="key-card" style="--type-color:${type.color}">
          <a class="card-link" href="detalle.html?id=${item.id}" aria-label="Abrir ayuda para ${escapeHtml(item.titulo)}">
          <div class="card-top">
            <img class="type-icon" src="${type.icon}" alt="">
            <div>
              <p class="card-meta">Clase ${item.clase} · ${escapeHtml(type.label)}</p>
              <h3>${escapeHtml(item.titulo)}</h3>
            </div>
          </div>
          <div class="badges">
            <span>${escapeHtml(item.periodo)}</span>
            <span>${escapeHtml(item.lugar)}</span>
          </div>
          <p>${escapeHtml(item.resumen)}</p>
          <div class="card-scene">
            <strong>Escena:</strong> ${escapeHtml(item.escena || "Una historia concreta para recordar una idea grande.")}
          </div>
          <div class="card-focus">
            <strong>Sirve para hablar de:</strong> ${escapeHtml(item.foco)}
          </div>
          <span class="open-detail">Ver guía de esta historia →</span>
          </a>
        </article>
      `;
    }).join("");
  }

  function renderTemplateTabs() {
    refs.templateTabs.innerHTML = Object.entries(TYPES).map(([key, info]) => (
      `<button class="template-tab ${state.activeTemplate === key ? "active" : ""}" data-template="${key}">
        <img src="${info.icon}" alt="">${escapeHtml(info.label)}
      </button>`
    )).join("");
  }

  function renderTemplate() {
    const key = state.activeTemplate;
    const type = getType(key);
    const examples = CLAVES.filter(item => item.tipo === key).slice(0, 4);

    refs.templatePreview.innerHTML = `
      <article class="report-sheet image-sheet" style="--type-color:${type.color}">
        <img class="sheet-bg" src="${type.template}" alt="">
      </article>

      <div class="template-note">
        <strong>Historias de este tipo:</strong>
        ${examples.map(item => `<span>${escapeHtml(item.titulo)}</span>`).join("")}
      </div>
    `;
  }

  function getTemplateHelpers(typeKey) {
    const common = {
      "Cuándo y dónde": "Sitúa la historia con fecha y lugar. Si puedes, localízala en un mapa.",
      "Imagen o fuente": "Pega, dibuja o cita una fuente que ayude a entender la historia.",
      "Mapa o imagen": "Elige una imagen sobria que explique el contexto, no solo que decore.",
      "Fragmento o imagen": "Usa una parte breve del documento o una imagen de la fuente.",
      "Tres palabras clave": "Elige tres términos importantes y asegúrate de entenderlos."
    };
    const byType = {
      acontecimiento: {
        "Qué pasó": "Resume el hecho en pocas líneas, sin copiar.",
        "Qué se veía en ese momento": "Cuenta una escena o detalle que ayude a imaginarlo.",
        "Qué cambió después": "Explica una consecuencia importante.",
        "Qué idea grande explica": "Conecta el hecho con una idea: democracia, crisis, guerra, derechos..."
      },
      conflicto: {
        "Qué enfrentó": "Di quiénes se enfrentaban y por qué.",
        "Una escena para recordarlo": "Elige una escena humana, no una descripción violenta.",
        "Consecuencias humanas": "Explica cómo afectó a la población.",
        "Qué nos enseña hoy": "Cierra con memoria, convivencia o prevención de la violencia."
      },
      documento: {
        "Qué documento es": "Di si es constitución, tratado, ley, declaración o pacto.",
        "Cuándo y dónde nació": "Indica fecha, lugar y contexto.",
        "Una frase o idea clave": "Elige una idea del documento y explícala.",
        "Qué cambió": "Cuenta qué permitió o qué intentó resolver.",
        "Qué debate abre": "Explica qué discusión histórica hay detrás."
      },
      concepto: {
        "Qué idea aparece aquí": "Define la idea con palabras sencillas.",
        "La pequeña historia": "Cuenta la escena concreta que ayuda a entenderla.",
        "Qué explica de su época": "Relaciona la idea con el momento histórico.",
        "Dónde se nota hoy": "Busca una conexión con la vida política o social actual."
      },
      institucion: {
        "Qué institución vemos": "Explica qué organismo, asamblea o entidad aparece.",
        "Qué problema intentaba resolver": "Cuenta por qué hacía falta.",
        "Cómo funcionaba": "Describe su papel sin entrar en demasiados detalles.",
        "Por qué importa hoy": "Explica si sigue existiendo o qué nos ayuda a entender."
      },
      sociedad: {
        "Quiénes vivieron esta historia": "Centra la mirada en personas o grupos afectados.",
        "Qué problema muestra": "Explica la dificultad o injusticia que aparece.",
        "Qué cambió para la gente": "Cuenta el efecto en la vida cotidiana.",
        "Por qué nos toca hoy": "Conecta con derechos, igualdad, memoria o convivencia."
      },
      economia: {
        "Qué avance o cambio vemos": "Di si es invento, transporte, medicina, comunicación, crisis...",
        "La escena concreta": "Cuenta una imagen fácil de recordar.",
        "Cómo transformó la vida": "Explica cambios en trabajo, salud, ciudad, comunicación o dinero.",
        "Relación con hoy": "Conecta con tecnología, ciencia, economía o vida diaria actual."
      },
      lugar: {
        "Qué representa": "Explica qué simboliza el lugar, obra o edificio.",
        "Qué historia guarda": "Cuenta el hecho concreto que lo vuelve importante.",
        "Qué nos hace entender": "Conecta el símbolo con una idea histórica mayor.",
        "Por qué sigue vivo": "Explica por qué se recuerda todavía."
      }
    };
    return { ...common, ...(byType[typeKey] || {}) };
  }

  function getTimelineYear(item) {
    const text = `${item.periodo} ${item.titulo}`;
    const year = text.match(/\b(18|19|20)\d{2}\b/);
    if (year) return Number(year[0]);
    if (/años 40/i.test(text)) return 1940;
    if (/años 60/i.test(text)) return 1960;
    if (/años 20/i.test(text)) return 1920;
    if (/siglo XIX/i.test(text)) return 1850;
    if (/siglo XX/i.test(text)) return 1950;
    return 0;
  }

  function renderTimeline() {
    if (!refs.timelineShell) return;
    const items = [...CLAVES].sort((a, b) => getTimelineYear(a) - getTimelineYear(b) || a.id - b.id);
    refs.timelineShell.innerHTML = items.map(item => {
      const type = getType(item.tipo);
      const year = getTimelineYear(item) || item.periodo;
      return `
        <a class="timeline-item" href="detalle.html?id=${item.id}" style="--type-color:${type.color}">
          <span class="timeline-year">${escapeHtml(year)}</span>
          <span class="timeline-dot"></span>
          <span class="timeline-content">
            <strong>${escapeHtml(item.titulo)}</strong>
            <small>${escapeHtml(item.periodo)} · ${escapeHtml(item.lugar)} · Clase ${escapeHtml(item.clase)}</small>
          </span>
        </a>
      `;
    }).join("");
  }

  function setupEvents() {
    refs.classFilters.addEventListener("click", event => {
      const btn = event.target.closest("[data-class]");
      if (!btn) return;
      state.classFilter = btn.dataset.class;
      renderClassFilters();
      renderCards();
    });

    refs.typeFilters.addEventListener("click", event => {
      const btn = event.target.closest("[data-type]");
      if (!btn) return;
      state.typeFilter = btn.dataset.type;
      renderTypeFilters();
      renderCards();
    });

    refs.searchInput.addEventListener("input", event => {
      state.query = event.target.value;
      renderCards();
    });

    refs.templateTabs.addEventListener("click", event => {
      const btn = event.target.closest("[data-template]");
      if (!btn) return;
      state.activeTemplate = btn.dataset.template;
      renderTemplateTabs();
      renderTemplate();
    });

    refs.printTemplate.addEventListener("click", () => window.print());
  }

  function init() {
    renderClassFilters();
    renderTypeFilters();
    renderCards();
    renderTimeline();
    renderTemplateTabs();
    renderTemplate();
    setupEvents();
  }

  init();
})();
