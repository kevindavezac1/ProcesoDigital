// ==========================
// PCR (Proyectos Carousel)
// Archivo: pcr.js
// ==========================

document.addEventListener("DOMContentLoaded", () => {
  const viewport = document.getElementById("pcrViewport");
  const track = document.getElementById("pcrTrack");

  const pauseBtn = document.getElementById("pcrPauseBtn");
  const speedBtn = document.getElementById("pcrSpeedBtn");

  const modal = document.getElementById("pcrModal");
  const closeBtn = document.getElementById("pcrClose");

  const elBadge = document.getElementById("pcrBadge");
  const elTitle = document.getElementById("pcrTitle");
  const elDesc = document.getElementById("pcrDesc");
  const elDays = document.getElementById("pcrDays");
  const elTech = document.getElementById("pcrTech");
  const elMainImg = document.getElementById("pcrMainImg");
  const elThumbs = document.getElementById("pcrThumbs");
  const elIncludes = document.getElementById("pcrIncludes");
  const elCtaBtn = document.getElementById("pcrCtaBtn");
  const elCtaLink = document.getElementById("pcrCtaLink");

  if (!viewport || !track) return;

  // EDITÁ ESTO CON TUS PROYECTOS + IMÁGENES
  const projects = [
    {
      badge: "Landing",
      tag: "Web",
      title: "Landing de Turnos",
      desc: "Landing enfocada en consultas y reservas con WhatsApp / formulario.",
      days: "7–10 días",
      tech: ["HTML", "CSS", "JS"],
      cover: "./img/proj-1-cover.jpg",
      images: ["./img/proj-1-1.jpg", "./img/proj-1-2.jpg", "./img/proj-1-3.jpg"],
      includes: ["Diseño UI", "Secciones a medida", "WhatsApp / Form", "Deploy + performance"],
      cta: "https://wa.link/"
    },
    {
      badge: "Automatización",
      tag: "App",
      title: "Registro de Asistencia",
      desc: "Registro automático con validación y reportes (Sheets / Apps Script).",
      days: "10–14 días",
      tech: ["Apps Script", "Google Sheets", "JS"],
      cover: "./img/proj-2-cover.jpg",
      images: ["./img/logo-nav.png", "./img/proj-2-2.jpg"],
      includes: ["Validación", "Registro", "Panel", "Documentación"],
      cta: "https://wa.link/"
    },
    {
      badge: "Data",
      tag: "Dashboard",
      title: "Panel de Métricas",
      desc: "Dashboard con KPIs, eventos y filtros para seguimiento real.",
      days: "5–7 días",
      tech: ["Analytics", "Tag Manager", "Looker"],
      cover: "./img/proj-3-cover.jpg",
      images: ["./img/proj-3-1.jpg", "./img/proj-3-2.jpg"],
      includes: ["KPIs", "Eventos", "Tableros", "Entrega final"],
      cta: "https://wa.link/"
    }
  ];

  // Velocidades
  const speeds = [
    { label: "Lenta", value: "34s" },
    { label: "Normal", value: "26s" },
    { label: "Rápida", value: "18s" }
  ];
  let speedIndex = 1;

  // Render cards (y duplicado para loop infinito)
  function cardHTML(p, i){
    const pills = [
      `<span class="pcr-pill">⏱ ${p.days}</span>`,
      `<span class="pcr-pill">⚙ ${p.tech.slice(0,2).join(" • ")}${p.tech.length > 2 ? " +" : ""}</span>`
    ].join("");

    return `
      <article class="pcr-card" role="button" tabindex="0" aria-label="Abrir detalle: ${escapeHTML(p.title)}" data-index="${i}">
        <div class="pcr-media">
          <img src="${p.cover}" alt="Preview ${escapeHTML(p.title)}" loading="lazy" />
          <div class="pcr-shimmer" aria-hidden="true"></div>
        </div>

        <div class="pcr-content">
          <div class="pcr-row">
            <h3 class="pcr-card-title">${escapeHTML(p.title)}</h3>
            <span class="pcr-tag">${escapeHTML(p.tag || "Proyecto")}</span>
          </div>
          <p class="pcr-desc">${escapeHTML(p.desc)}</p>
          <div class="pcr-meta-row">${pills}</div>
        </div>
      </article>
    `;
  }

  track.innerHTML = projects.map(cardHTML).join("") + projects.map(cardHTML).join("");

  // Config speed
  // setSpeed(speeds[speedIndex].value);
  // speedBtn.textContent = `Velocidad: ${speeds[speedIndex].label}`;

  function setSpeed(v){
    viewport.style.setProperty("--pcr-speed", v);
  }

  // Pause control
  pauseBtn?.addEventListener("click", () => {
    const paused = viewport.getAttribute("data-paused") === "true";
    viewport.setAttribute("data-paused", paused ? "false" : "true");
    pauseBtn.setAttribute("aria-pressed", paused ? "false" : "true");
    pauseBtn.textContent = paused ? "Pausar" : "Reanudar";
  });

  // Speed control
  speedBtn?.addEventListener("click", () => {
    speedIndex = (speedIndex + 1) % speeds.length;
    setSpeed(speeds[speedIndex].value);
    speedBtn.textContent = `Velocidad: ${speeds[speedIndex].label}`;
  });

  // Open modal
  track.addEventListener("click", (e) => {
    const card = e.target.closest(".pcr-card");
    if (!card) return;
    const i = Number(card.dataset.index || 0);
    openModal(projects[i]);
  });

  // Keyboard open
  track.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest(".pcr-card");
    if (!card) return;
    e.preventDefault();
    const i = Number(card.dataset.index || 0);
    openModal(projects[i]);
  });

  function openModal(p){
    if (!modal) return;

    elBadge.textContent = p.badge || "Proyecto";
    elTitle.textContent = p.title || "";
    elDesc.textContent = p.desc || "";
    elDays.textContent = p.days || "";

    // tech chips
    elTech.innerHTML = "";
    (p.tech || []).forEach(t => {
      const s = document.createElement("span");
      s.className = "pcr-chip";
      s.textContent = t;
      elTech.appendChild(s);
    });

    // includes
    elIncludes.innerHTML = "";
    (p.includes || []).forEach(it => {
      const li = document.createElement("li");
      li.textContent = it;
      elIncludes.appendChild(li);
    });

    // images
    const imgs = (p.images && p.images.length ? p.images : [p.cover]).filter(Boolean);
    elMainImg.src = imgs[0] || "";
    elMainImg.style.opacity = "1";

    elThumbs.innerHTML = "";
    imgs.forEach((src, idx) => {
      const b = document.createElement("button");
      b.className = "pcr-thumb";
      b.type = "button";
      b.setAttribute("aria-current", idx === 0 ? "true" : "false");
      b.innerHTML = `<img src="${src}" alt="Miniatura ${idx + 1}" loading="lazy" />`;

      b.addEventListener("click", () => {
        [...elThumbs.querySelectorAll(".pcr-thumb")].forEach(x => x.setAttribute("aria-current","false"));
        b.setAttribute("aria-current","true");
        elMainImg.style.opacity = "0.3";
        setTimeout(() => {
          elMainImg.src = src;
          elMainImg.style.opacity = "1";
        }, 120);
      });

      elThumbs.appendChild(b);
    });

    // CTA
    const cta = p.cta || "#";
    elCtaLink.href = cta;
    elCtaBtn.onclick = () => window.open(cta, "_blank", "noopener,noreferrer");

    modal.showModal();
    document.body.style.overflow = "hidden";
  }

  // Close modal
  closeBtn?.addEventListener("click", () => closeModal());
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal?.open) closeModal();
  });

  function closeModal(){
    if (!modal?.open) return;
    modal.close();
    document.body.style.overflow = "";
  }

  function escapeHTML(str){
    return String(str ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }
});