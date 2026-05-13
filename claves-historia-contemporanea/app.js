(() => {
  const CLAVES = window.HC_CLAVES || [];
  const TYPES = window.HC_TYPES || {};

  const state = {
    classFilter: "todas",
    typeFilter: "todos",
    query: "",
    activeTemplate: "acontecimiento",
    rafflePreview: null
  };

  const COMMON_TEMPLATE = "assets/templates/documento-comun-historia.png";
  const OFFICIAL_RAFFLES = [
    {
      clase: "C",
      createdAt: "Sorteo oficial de 6º C",
      official: true,
      rows: [
        { name: "David", topicId: 59 },
        { name: "Erick", topicId: 54 },
        { name: "Aitor", topicId: 53 },
        { name: "CarolLeilani", topicId: 70 },
        { name: "EmanuelBryan", topicId: 66 },
        { name: "Eli", topicId: 68 },
        { name: "Pisco", topicId: 61 },
        { name: "Santiago", topicId: 49 },
        { name: "CAnde", topicId: 55 },
        { name: "Pacheco", topicId: 62 },
        { name: "Rubi", topicId: 71 },
        { name: "Nerea", topicId: 65 },
        { name: "Bridget", topicId: 64 },
        { name: "Houda", topicId: 69 },
        { name: "Ian", topicId: 50 },
        { name: "Lucas", topicId: 51 },
        { name: "María", topicId: 72 },
        { name: "Valentino", topicId: 57 },
        { name: "Diego", topicId: 60 },
        { name: "Joaquín", topicId: 67 },
        { name: "Allizon", topicId: 56 },
        { name: "Helymar", topicId: 52 }
      ]
    }
  ];

  const refs = {
    classFilters: document.getElementById("classFilters"),
    typeFilters: document.getElementById("typeFilters"),
    searchInput: document.getElementById("searchInput"),
    countLine: document.getElementById("countLine"),
    cardsGrid: document.getElementById("cardsGrid"),
    timelineShell: document.getElementById("timelineShell"),
    templateTabs: document.getElementById("templateTabs"),
    templatePreview: document.getElementById("templatePreview"),
    printTemplate: document.getElementById("printTemplate"),
    raffleForm: document.getElementById("raffleForm"),
    raffleClass: document.getElementById("raffleClass"),
    raffleNames: document.getElementById("raffleNames"),
    saveRaffle: document.getElementById("saveRaffle"),
    clearRaffle: document.getElementById("clearRaffle"),
    raffleHelp: document.getElementById("raffleHelp"),
    raffleResult: document.getElementById("raffleResult"),
    savedRaffles: document.getElementById("savedRaffles")
  };

  const RAFFLE_KEY = "hc_sorteo_clase_";

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

  function raffleKey(clase) {
    return `${RAFFLE_KEY}${clase}`;
  }

  function parseNames(value) {
    const seen = new Map();
    return String(value || "")
      .split(/[\n,;]+/)
      .map(name => name.trim())
      .filter(Boolean)
      .map(name => {
        const key = normalize(name);
        const count = seen.get(key) || 0;
        seen.set(key, count + 1);
        return count ? `${name} ${count + 1}` : name;
      });
  }

  function shuffle(items) {
    const result = [...items];
    const cryptoObj = window.crypto || window.msCrypto;
    for (let i = result.length - 1; i > 0; i--) {
      let random = Math.random();
      if (cryptoObj?.getRandomValues) {
        const buffer = new Uint32Array(1);
        cryptoObj.getRandomValues(buffer);
        random = buffer[0] / 4294967296;
      }
      const j = Math.floor(random * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function getClassTopics(clase) {
    return CLAVES.filter(item => item.clase === clase);
  }

  function loadSavedRaffle(clase) {
    try {
      const raw = localStorage.getItem(raffleKey(clase));
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function getOfficialRaffle(clase) {
    return OFFICIAL_RAFFLES.find(result => result.clase === clase) || null;
  }

  function saveRaffleResult(clase, result) {
    localStorage.setItem(raffleKey(clase), JSON.stringify(result));
  }

  function clearSavedRaffle(clase) {
    localStorage.removeItem(raffleKey(clase));
  }

  function buildRaffleRows(names, clase) {
    const topics = shuffle(getClassTopics(clase));
    return names.map((name, index) => ({
      name,
      topicId: topics[index].id
    }));
  }

  function getTopicById(id) {
    return CLAVES.find(item => Number(item.id) === Number(id));
  }

  function renderRaffle(result, mode = "empty") {
    if (!refs.raffleResult) return;

    if (!result?.rows?.length) {
      refs.raffleResult.innerHTML = `<p class="empty-state">El resultado aparecerá aquí.</p>`;
      refs.saveRaffle.disabled = true;
      refs.raffleHelp.textContent = "No se guarda nada hasta que pulses guardar.";
      return;
    }

    const saved = mode === "saved";
    const official = mode === "official";
    refs.saveRaffle.disabled = saved || official;
    refs.raffleHelp.textContent = official
      ? `Sorteo oficial de la clase ${result.clase}. Está publicado para consulta.`
      : saved
      ? `Sorteo guardado para la clase ${result.clase}. Se conserva en este navegador.`
      : "Sorteo provisional. Puedes repetirlo o guardarlo cuando te encaje.";

    refs.raffleResult.innerHTML = `
      <div class="raffle-result-head">
        <div>
          <p class="eyebrow">${official ? "Oficial" : saved ? "Guardado" : "Provisional"} · Clase ${escapeHtml(result.clase)}</p>
          <h3>${result.rows.length} asignaciones</h3>
        </div>
        <span>${escapeHtml(result.createdAt || "")}</span>
      </div>
      <div class="raffle-table-wrap">
        <table class="raffle-table">
          <thead>
            <tr>
              <th>Alumno</th>
              <th>Tema</th>
              <th>Tipo</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            ${result.rows.map(row => {
              const topic = getTopicById(row.topicId);
              const type = getType(topic?.tipo);
              return `
                <tr>
                  <td>${escapeHtml(row.name)}</td>
                  <td>${topic ? `<a href="detalle.html?id=${topic.id}">${escapeHtml(topic.titulo)}</a>` : "Tema no encontrado"}</td>
                  <td>${escapeHtml(type.label)}</td>
                  <td>${escapeHtml(topic?.periodo || "")}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function getSavedRaffles() {
    return ["A", "B", "C"]
      .map(clase => loadSavedRaffle(clase) || getOfficialRaffle(clase))
      .filter(result => result?.rows?.length);
  }

  function resultToText(result) {
    const lines = [
      `Clase ${result.clase} · ${result.createdAt || ""}`,
      "Alumno\tTema\tTipo\tFecha"
    ];
    result.rows.forEach(row => {
      const topic = getTopicById(row.topicId);
      const type = getType(topic?.tipo);
      lines.push(`${row.name}\t${topic?.titulo || ""}\t${type.label}\t${topic?.periodo || ""}`);
    });
    return lines.join("\n");
  }

  function resultToCsv(result) {
    const escapeCsv = value => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const lines = [["Alumno", "Tema", "Tipo", "Fecha", "Clase"].map(escapeCsv).join(",")];
    result.rows.forEach(row => {
      const topic = getTopicById(row.topicId);
      const type = getType(topic?.tipo);
      lines.push([row.name, topic?.titulo || "", type.label, topic?.periodo || "", result.clase].map(escapeCsv).join(","));
    });
    return lines.join("\n");
  }

  function downloadText(filename, content, mime = "text/plain") {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function renderSavedRaffles() {
    if (!refs.savedRaffles) return;
    const saved = getSavedRaffles();
    if (!saved.length) {
      refs.savedRaffles.innerHTML = `
        <div class="saved-raffles-head">
          <div>
            <p class="eyebrow">Consulta</p>
          <h3>Sorteos consultables</h3>
          </div>
        </div>
        <p class="empty-state">Todavía no hay sorteos guardados o publicados.</p>
      `;
      return;
    }

    refs.savedRaffles.innerHTML = `
      <div class="saved-raffles-head">
        <div>
          <p class="eyebrow">Consulta</p>
          <h3>Sorteos consultables</h3>
        </div>
        <span>${saved.length} clase${saved.length === 1 ? "" : "s"}</span>
      </div>
      <div class="saved-raffle-list">
        ${saved.map(result => `
          <article class="saved-raffle-card">
            <div class="saved-raffle-title">
              <div>
                <strong>${result.official ? `Sorteo oficial de 6º ${escapeHtml(result.clase)}` : `Clase ${escapeHtml(result.clase)}`}</strong>
                <small>${escapeHtml(result.createdAt || "")} · ${result.rows.length} asignaciones</small>
              </div>
              <div class="saved-raffle-actions">
                <button class="btn ghost" type="button" data-copy-raffle="${escapeHtml(result.clase)}">Copiar</button>
                <button class="btn ghost" type="button" data-download-raffle="${escapeHtml(result.clase)}">CSV</button>
              </div>
            </div>
            <div class="raffle-table-wrap">
              <table class="raffle-table compact">
                <thead><tr><th>Alumno</th><th>Tema</th><th>Fecha</th></tr></thead>
                <tbody>
                  ${result.rows.map(row => {
                    const topic = getTopicById(row.topicId);
                    return `
                      <tr>
                        <td>${escapeHtml(row.name)}</td>
                        <td>${topic ? `<a href="detalle.html?id=${topic.id}">${escapeHtml(topic.titulo)}</a>` : "Tema no encontrado"}</td>
                        <td>${escapeHtml(topic?.periodo || "")}</td>
                      </tr>
                    `;
                  }).join("")}
                </tbody>
              </table>
            </div>
          </article>
        `).join("")}
      </div>
    `;
  }

  function refreshSavedRaffle() {
    if (!refs.raffleClass) return;
    state.rafflePreview = null;
    const clase = refs.raffleClass.value;
    const saved = loadSavedRaffle(clase);
    const official = getOfficialRaffle(clase);
    const result = saved || official;
    renderRaffle(result, saved ? "saved" : official ? "official" : "empty");
    renderSavedRaffles();
  }

  function runRaffle(event) {
    event.preventDefault();
    const clase = refs.raffleClass.value;
    const names = parseNames(refs.raffleNames.value);
    const topics = getClassTopics(clase);

    if (!names.length) {
      refs.raffleResult.innerHTML = `<p class="empty-state">Pega primero los nombres.</p>`;
      refs.saveRaffle.disabled = true;
      refs.raffleHelp.textContent = "Puedes escribir un nombre por línea o separarlos por comas.";
      return;
    }

    if (names.length > topics.length) {
      refs.raffleResult.innerHTML = `<p class="empty-state">Hay ${names.length} nombres y solo ${topics.length} temas en la clase ${escapeHtml(clase)}.</p>`;
      refs.saveRaffle.disabled = true;
      refs.raffleHelp.textContent = "Reduce nombres o reparte algún tema manualmente.";
      return;
    }

    const result = {
      clase,
      createdAt: new Date().toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" }),
      rows: buildRaffleRows(names, clase)
    };
    state.rafflePreview = result;
    renderRaffle(result, "preview");
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
    refs.templateTabs.innerHTML = "";
  }

  function renderTemplate() {
    refs.templatePreview.innerHTML = `
      <article class="report-sheet image-sheet common-template-sheet" style="--type-color:#18344a">
        <img class="sheet-bg" src="${COMMON_TEMPLATE}" alt="Documento visual de Historia Contemporánea">
      </article>

      <div class="template-note template-downloads">
        <strong>Documento de trabajo:</strong>
        <a class="btn primary" href="${COMMON_TEMPLATE}" download="documento-historia-contemporanea.png">Descargar PNG en alta calidad</a>
        <a class="btn" href="${COMMON_TEMPLATE}" target="_blank" rel="noopener">Abrir imagen completa</a>
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

    if (refs.raffleForm) {
      refs.raffleForm.addEventListener("submit", runRaffle);
      refs.raffleClass.addEventListener("change", refreshSavedRaffle);

      refs.saveRaffle.addEventListener("click", () => {
        if (!state.rafflePreview) return;
        const saved = loadSavedRaffle(state.rafflePreview.clase);
        if (saved && !window.confirm(`Ya hay un sorteo guardado para la clase ${state.rafflePreview.clase}. ¿Quieres sustituirlo?`)) return;
        saveRaffleResult(state.rafflePreview.clase, state.rafflePreview);
        renderRaffle(state.rafflePreview, "saved");
        renderSavedRaffles();
        state.rafflePreview = null;
      });

      refs.clearRaffle.addEventListener("click", () => {
        const clase = refs.raffleClass.value;
        const saved = loadSavedRaffle(clase);
        if (!saved) {
          refreshSavedRaffle();
          return;
        }
        if (!window.confirm(`¿Borrar el sorteo guardado de la clase ${clase}?`)) return;
        clearSavedRaffle(clase);
        refreshSavedRaffle();
      });

      refs.savedRaffles?.addEventListener("click", async event => {
        const copyBtn = event.target.closest("[data-copy-raffle]");
        const downloadBtn = event.target.closest("[data-download-raffle]");
        const clase = copyBtn?.dataset.copyRaffle || downloadBtn?.dataset.downloadRaffle;
        if (!clase) return;

        const result = loadSavedRaffle(clase) || getOfficialRaffle(clase);
        if (!result) return;

        if (copyBtn) {
          const text = resultToText(result);
          try {
            await navigator.clipboard.writeText(text);
            refs.raffleHelp.textContent = `Sorteo de la clase ${clase} copiado.`;
          } catch {
            downloadText(`sorteo-clase-${clase}.txt`, text);
          }
        }

        if (downloadBtn) {
          downloadText(`sorteo-clase-${clase}.csv`, resultToCsv(result), "text/csv");
        }
      });
    }
  }

  function init() {
    renderClassFilters();
    renderTypeFilters();
    renderCards();
    renderTimeline();
    renderTemplateTabs();
    renderTemplate();
    setupEvents();
    refreshSavedRaffle();
  }

  init();
})();
