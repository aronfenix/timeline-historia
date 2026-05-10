(() => {
  const CLAVES = window.HC_CLAVES || [];
  const TYPES = window.HC_TYPES || {};
  const root = document.getElementById("detailRoot");

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function getType(key) {
    return TYPES[key] || TYPES.acontecimiento || { label: "Historia", icon: "", color: "#18344a", sections: [] };
  }

  function list(items) {
    return `<ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }

  function getResearchPrompts(item, type) {
    const shared = [
      `Busca qué ocurrió antes de "${item.titulo}" para entender por qué pasó.`,
      `Localiza una fecha exacta o aproximada y un lugar en un mapa.`,
      "Anota 3 palabras que no entendías al principio y explícalas con tus palabras."
    ];

    const byType = {
      acontecimiento: [
        "Explica qué estaba cambiando justo en ese momento.",
        "Distingue entre lo que pasó ese día y las consecuencias que vinieron después."
      ],
      conflicto: [
        "Identifica quiénes se enfrentaban y qué quería cada parte.",
        "No te centres solo en armas o batallas: incluye consecuencias para la población."
      ],
      documento: [
        "Averigua quién lo escribió, firmó o aprobó.",
        "Elige una idea del documento y explica por qué era importante."
      ],
      concepto: [
        "Usa la escena concreta para explicar la idea general.",
        "Pon un ejemplo sencillo que ayude a la clase a entender el concepto."
      ],
      institucion: [
        "Explica para qué se creó o qué problema intentaba resolver.",
        "Señala si todavía existe o si se parece a alguna institución actual."
      ],
      sociedad: [
        "Piensa a qué personas afectó más esta historia.",
        "Busca un detalle de vida cotidiana: escuela, trabajo, familia, miedo, viaje, voto..."
      ],
      economia: [
        "Explica qué cambió en la vida diaria gracias a ese avance o crisis.",
        "Distingue entre invento, uso social y consecuencias históricas."
      ],
      lugar: [
        "Describe qué se puede ver en ese lugar, obra o símbolo.",
        "Explica por qué ese sitio u objeto se volvió memorable."
      ]
    };

    return [...shared, ...(byType[item.tipo] || [])];
  }

  function getSourceIdeas(item) {
    const byType = {
      acontecimiento: ["una fotografía histórica", "una portada de periódico", "una línea del tiempo breve"],
      conflicto: ["un mapa del lugar", "una imagen sobria del contexto", "un testimonio o cifra humana bien explicada"],
      documento: ["una imagen del documento", "un fragmento corto", "un sello, firma o portada"],
      concepto: ["un cartel de época", "una escena concreta", "un esquema antes/después"],
      institucion: ["el edificio o sala donde actúa", "un símbolo institucional", "una fotografía de una reunión"],
      sociedad: ["una fotografía de vida cotidiana", "un objeto personal", "un testimonio breve"],
      economia: ["un objeto técnico", "una máquina, tren, radio, moneda o gráfico sencillo", "una foto de ciudad o fábrica"],
      lugar: ["una imagen del lugar u obra", "un mapa de localización", "un detalle visual significativo"]
    };

    return byType[item.tipo] || ["una imagen relacionada", "un mapa", "un documento"];
  }

  function renderDetail(item) {
    const type = getType(item.tipo);
    const sections = type.sections || [];
    const index = CLAVES.findIndex(clave => clave.id === item.id);
    const prev = CLAVES[index - 1];
    const next = CLAVES[index + 1];

    document.title = `${item.titulo} · Tu minuto de historia`;
    root.innerHTML = `
      <section class="detail-hero" style="--type-color:${type.color}">
        <a class="crumb" href="index.html#claves">← Volver a las 72 historias</a>
        <div class="detail-title-row">
          <img src="${type.icon}" alt="">
          <div>
            <p class="eyebrow">Clase ${escapeHtml(item.clase)} · ${escapeHtml(type.label)}</p>
            <h1>${escapeHtml(item.titulo)}</h1>
          </div>
        </div>
        <div class="badges detail-badges">
          <span>${escapeHtml(item.periodo)}</span>
          <span>${escapeHtml(item.lugar)}</span>
        </div>
        <p class="detail-lead">${escapeHtml(item.resumen)}</p>
      </section>

      <section class="detail-layout">
        <article class="guide-card scene-card">
          <h2>La escena que debes imaginar</h2>
          <p>${escapeHtml(item.escena)}</p>
          <p class="soft-note">Empieza por esta pequeña historia. Después úsala para explicar algo más grande.</p>
        </article>

        <article class="guide-card">
          <h2>Sirve para hablar de...</h2>
          <p>${escapeHtml(item.foco)}</p>
        </article>

        <article class="guide-card">
          <h2>Preguntas para investigar</h2>
          ${list(getResearchPrompts(item, type))}
        </article>

        <article class="guide-card">
          <h2>Fuente o imagen que puede funcionar</h2>
          ${list(getSourceIdeas(item))}
          <p class="soft-note">La imagen no decora: debe ayudar a entender la historia.</p>
        </article>

        <article class="guide-card wide">
          <h2>Cómo llevarlo a tu hoja visual</h2>
          <div class="mini-columns">
            ${(sections.length ? sections : ["Qué pasó", "Cuándo y dónde", "Qué cambió", "Por qué importa"]).slice(0, 6).map(section => `
              <div>
                <strong>${escapeHtml(section)}</strong>
                <p>Rellena este apartado con una idea clara, no con un párrafo copiado.</p>
              </div>
            `).join("")}
          </div>
        </article>

        <article class="guide-card wide">
          <h2>Para tu minuto oral</h2>
          <p class="script-sample">Una entrada natural podría ser: <strong>“Voy a hablar de una historia llamada «${escapeHtml(item.titulo)}», que ocurrió en ${escapeHtml(item.periodo)}, en ${escapeHtml(item.lugar)}.”</strong></p>
          <ol class="clean-list">
            <li>Empieza nombrando la historia sin sonar como una ficha: “una historia llamada...”, “el día en que...”, “el momento en que...”.</li>
            <li>Sitúala con fecha y lugar: ${escapeHtml(item.periodo)} · ${escapeHtml(item.lugar)}.</li>
            <li>Cuenta la escena con tus palabras.</li>
            <li>Explica qué cambió o qué problema muestra.</li>
            <li>Cierra con por qué merece conocerse hoy.</li>
          </ol>
        </article>
      </section>

      <nav class="detail-nav">
        ${prev ? `<a class="btn" href="detalle.html?id=${prev.id}">← ${escapeHtml(prev.titulo)}</a>` : "<span></span>"}
        ${next ? `<a class="btn primary" href="detalle.html?id=${next.id}">${escapeHtml(next.titulo)} →</a>` : "<span></span>"}
      </nav>
    `;
  }

  function renderMissing() {
    root.innerHTML = `
      <section class="detail-hero">
        <a class="crumb" href="index.html#claves">← Volver a las 72 historias</a>
        <h1>No encuentro esta historia</h1>
        <p class="detail-lead">El enlace no tiene un identificador válido. Vuelve a la lista y elige una historia.</p>
      </section>
    `;
  }

  const id = Number(new URLSearchParams(window.location.search).get("id"));
  const item = CLAVES.find(clave => Number(clave.id) === id);
  if (item) renderDetail(item);
  else renderMissing();
})();
