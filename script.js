// ========= Helpers =========
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const lerp  = (a, b, t) => a + (b - a) * t;

// ========= Mobile nav =========
const navToggle = document.getElementById("navToggle");
const navMenu   = document.getElementById("navMenu");

if (navToggle && navMenu) {
  const closeMenu = () => {
    navMenu.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  navToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = navMenu.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  document.addEventListener("click", (e) => {
    const clickInside = navMenu.contains(e.target) || navToggle.contains(e.target);
    if (!clickInside) closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
}

// ========= Active nav link (IntersectionObserver) =========
const sections = ["proceso", "beneficios", "servicios", "precios", "faq"]
  .map((id) => document.getElementById(id))
  .filter(Boolean);

const links = Array.from(document.querySelectorAll(".nav-links .nav-link"));

const setActive = (id) => {
  links.forEach((l) => {
    const href = l.getAttribute("href") || "";
    l.classList.toggle("active", href === `#${id}`);
  });
};

if (sections.length && links.length && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target?.id) setActive(visible.target.id);
    },
    { threshold: [0.25, 0.5, 0.75] }
  );
  sections.forEach((s) => io.observe(s));
}

// ========= Reveal on scroll =========
const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
if ("IntersectionObserver" in window) {
  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const el = e.target;
          const d = Number(el.getAttribute("data-delay") || "0");
          if (d) el.style.transitionDelay = `${d}ms`;
          el.classList.add("in");
          revealObs.unobserve(el);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => revealObs.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("in"));
}

// ========= Cursor glow follow (smooth) =========
const glow = document.getElementById("cursorGlow");
let gx = window.innerWidth * 0.5,
  gy = window.innerHeight * 0.3;
let tx = gx,
  ty = gy;

if (glow) {
  window.addEventListener(
    "pointermove",
    (e) => {
      tx = e.clientX;
      ty = e.clientY;
    },
    { passive: true }
  );

  const glowTick = () => {
    gx = lerp(gx, tx, 0.12);
    gy = lerp(gy, ty, 0.12);
    glow.style.left = gx + "px";
    glow.style.top = gy + "px";
    requestAnimationFrame(glowTick);
  };
  requestAnimationFrame(glowTick);
}

// ========= Hover "spotlight" for cards & buttons (CSS vars mx/my) =========
function attachSpotlight(selector) {
  document.querySelectorAll(selector).forEach((el) => {
    el.addEventListener(
      "pointermove",
      (e) => {
        const r = el.getBoundingClientRect();
        const mx = ((e.clientX - r.left) / r.width) * 100;
        const my = ((e.clientY - r.top) / r.height) * 100;
        el.style.setProperty("--mx", `${mx}%`);
        el.style.setProperty("--my", `${my}%`);
      },
      { passive: true }
    );
  });
}
attachSpotlight(".card");
attachSpotlight(".btn");

// ========= Tilt effect (cards/stats) =========
const tilts = Array.from(document.querySelectorAll("[data-tilt]"));
tilts.forEach((el) => {
  let raf = null;

  const onMove = (e) => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;

    const rx = lerp(6, -6, py);
    const ry = lerp(-8, 8, px);

    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-1px)`;
    });
  };

  const reset = () => {
    if (raf) cancelAnimationFrame(raf);
    el.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
  };

  el.addEventListener("pointermove", onMove, { passive: true });
  el.addEventListener("pointerleave", reset);
});

// ================================
// HERO Rotating Words (JS)
// ================================
(() => {
  const el = document.getElementById("heroRotatorWord");
  if (!el) return;

  // keys de i18n en orden
  const keys = ["hero.word1", "hero.word2", "hero.word3"];

  // timings (ajustá a gusto)
  const HOLD_MS = 1400;   // cuánto se queda quieta cada palabra
  const TRANS_MS = 520;   // debe coincidir aprox con el CSS transition

  let i = 0;
  let timer = null;

  // Obtiene el texto correcto según el idioma actual (usa tu localStorage)
  function getLang() {
    return localStorage.getItem("site_lang") || "es";
  }

  // Diccionario fallback por si todavía no está cargado i18n o falta alguna key.
  // (Igual, vos lo tenés en translations; esto es por seguridad.)
  const fallback = {
    es: { "hero.word1": "CREA", "hero.word2": "TU", "hero.word3": "WEB" },
    en: { "hero.word1": "BUILD", "hero.word2": "YOUR", "hero.word3": "SITE" },
  };

  function readWord(key) {
    const lang = getLang();
    // Si tu i18n ya escribió el texto en el DOM, lo tomamos de fallback solo si hiciera falta.
    // Como aquí seteo yo el texto, necesito una fuente:
    // - si vos mantenés el objeto translations dentro de otro scope, no puedo leerlo desde acá
    // - entonces usamos fallback + el propio atributo data-i18n como referencia.
    return (fallback[lang] && fallback[lang][key]) ? fallback[lang][key] : key;
  }

  function setWordByIndex(idx) {
    const key = keys[idx % keys.length];
    el.setAttribute("data-i18n", key); // mantiene compatibilidad i18n
    el.textContent = readWord(key);
  }

  function show() {
    el.classList.remove("is-out");
    el.classList.add("is-in");
  }

  function hide() {
    el.classList.remove("is-in");
    el.classList.add("is-out");
  }

  function tick() {
    // salir
    hide();

    // esperar transición, cambiar texto, entrar
    window.setTimeout(() => {
      i = (i + 1) % keys.length;
      setWordByIndex(i);
      show();
    }, TRANS_MS);

    // siguiente ciclo
    timer = window.setTimeout(tick, HOLD_MS + TRANS_MS);
  }

  function start() {
    // inicial
    i = 0;
    setWordByIndex(i);
    show();

    // loop
    timer = window.setTimeout(tick, HOLD_MS + TRANS_MS);
  }

  function stop() {
    if (timer) window.clearTimeout(timer);
    timer = null;
  }

  // Re-sincroniza cuando cambia el idioma
  function resyncOnLangChange() {
    // parar y reiniciar para que tome el idioma nuevo
    stop();
    // mantiene el índice actual, pero actualiza texto
    setWordByIndex(i);
    show();
    timer = window.setTimeout(tick, HOLD_MS + TRANS_MS);
  }

  // Iniciar cuando el DOM está listo (tu script ya corre al final, pero por seguridad)
  document.addEventListener("DOMContentLoaded", start);

  // Si ya está cargado el DOM (por si pegás esto al final), arrancamos igual
  if (document.readyState !== "loading") start();

  // Hook al botón de idioma (si existe)
  const langBtn = document.getElementById("langToggle");
  if (langBtn) {
    langBtn.addEventListener("click", () => {
      // tu i18n cambia localStorage; esperamos un tick para que se actualice y resync
      setTimeout(resyncOnLangChange, 0);
    });
  }

  // Si alguien cambia el idioma por código (por ej tu setLang), también lo capturamos
  window.addEventListener("storage", (e) => {
    if (e.key === "site_lang") resyncOnLangChange();
  });
})();


// ========= Magnetic hover (subtle) =========
const magnetics = Array.from(document.querySelectorAll(".magnetic"));
magnetics.forEach((el) => {
  let raf = null;

  const move = (e) => {
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    const dx = clamp(x / 12, -10, 10);
    const dy = clamp(y / 12, -10, 10);

    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
  };

  const leave = () => {
    if (raf) cancelAnimationFrame(raf);
    el.style.transform = `translate(0px, 0px)`;
  };

  el.addEventListener("pointermove", move, { passive: true });
  el.addEventListener("pointerleave", leave);
});

// ========= Counters (animate once) =========
const counters = Array.from(document.querySelectorAll(".counter"));

const animateCounter = (el) => {
  const to = Number(el.dataset.to || "0");
  const suffix = el.dataset.suffix || "";
  const dur = 900;

  const start = performance.now();
  const from = 0;

  const step = (now) => {
    const t = clamp((now - start) / dur, 0, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const val = Math.round(lerp(from, to, eased));
    el.textContent = `${val}${suffix}`;
    if (t < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
};

if ("IntersectionObserver" in window) {
  const counterObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animateCounter(e.target);
          counterObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((c) => counterObs.observe(c));
}

// ========= FAQ: solo uno abierto =========
const faqItems = Array.from(document.querySelectorAll(".faq-item"));
faqItems.forEach((item) => {
  item.addEventListener("toggle", () => {
    if (item.open) {
      faqItems.forEach((other) => {
        if (other !== item) other.open = false;
      });
    }
  });
});


// ===== Model-viewer: pausa auto-rotate mientras arrastras =====
(() => {
  const mv = document.querySelector(".model-viewer");
  if (!mv) return;

  const stop = () => (mv.autoRotate = false);
  const start = () => (mv.autoRotate = true);

  mv.addEventListener("pointerdown", stop);
  window.addEventListener("pointerup", start, { passive: true });

  mv.addEventListener("touchstart", stop, { passive: true });
  window.addEventListener("touchend", start, { passive: true });
})();

// ===== Debug: ver animaciones disponibles en model-viewer =====
(() => {
  const mv = document.querySelector("model-viewer");
  if (!mv) return;

  mv.addEventListener("load", () => {
    console.log("availableAnimations:", mv.availableAnimations);
  });
})();


// ================================
// i18n SIMPLE (ES/EN) - EVA Studio
// ================================
// ================================
// i18n SIMPLE (ES/EN) - EVA Studio
// ================================
(() => {
  const translations = {
    es: {
      // Topbar
      "topbar.text": "✨ Cupos disponibles este mes",
      "topbar.link": "Hablemos",

      // Nav
      "nav.process": "Proceso",
      "nav.benefits": "Beneficios",
      "nav.services": "Servicios",
      "nav.pricing": "Precios",
      "nav.faqs": "FAQs",
      "nav.cta": "Hablemos",

      // Hero
      "hero.pill": "Diseño • Desarrollo • Conversión",
      "hero.title1": "Webs diseñadas para vender,",
      "hero.title2": "no para decorar",
      "hero.subtitle": "Convertí visitantes en clientes con un sitio rápido, claro y pensado para tu negocio.",
      "hero.btnPricing": "Ver precios",
      "hero.btnProjects": "Ver proyectos",
      "hero.stats.delivered": "proyectos entregados",
      "hero.stats.days": "días promedio",
      "hero.stats.responsive": "responsive",

      // Projects
      "projects.kicker": "Portfolio",
      "projects.title": "Proyectos recientes",
      "projects.subtitle": "Piezas claras y enfocadas en resultados.",
      "projects.p1.title": "Proyecto 01",
      "projects.p1.desc": "Landing enfocada en consultas y conversión.",
      "projects.p2.title": "Proyecto 02",
      "projects.p2.desc": "Sitio institucional moderno y rápido.",
      "projects.p3.title": "Proyecto 03",
      "projects.p3.desc": "Web a medida con secciones escalables.",

      // Process
      "process.kicker": "Proceso",
      "process.title": "Nuestro proceso",
      "process.subtitle": "Tres pasos simples para pasar de idea a sitio publicado.",
      "process.s1.title": "Análisis y planificación",
      "process.s1.desc": "Alineamos objetivos, estructura y funcionalidades desde el primer día.",
      "process.s2.title": "Diseño y desarrollo",
      "process.s2.desc": "Construimos tu sitio optimizado, responsive y listo para convertir.",
      "process.s3.title": "Entrega y publicación",
      "process.s3.desc": "Revisamos, ajustamos y dejamos tu web online lista para usar.",

      // Benefits
      "benefits.kicker": "Beneficios",
      "benefits.title": "¿Qué obtenés con nosotros?",
      "benefits.subtitle": "Un servicio integral, claro y orientado a resultados.",
      "benefits.b1.title": "Web a medida",
      "benefits.b1.desc": "Diseño y contenido alineados a tu diferencial para atraer al cliente correcto.",
      "benefits.b2.title": "Performance real",
      "benefits.b2.desc": "Sitios rápidos y livianos para mejorar experiencia y conversiones.",
      "benefits.b3.title": "Autogestionable",
      "benefits.b3.desc": "Podés editar contenido y crecer sin depender de terceros.",

      // Services
      "services.kicker": "Servicios",
      "services.title": "Soluciones digitales en un solo lugar",
      "services.subtitle": "Todo pensado para vender más.",
      "services.s1.title": "Diseño y desarrollo",
      "services.s1.desc": "Una web clara, profesional y coherente con tu marca.",
      "services.s2.title": "Responsive",
      "services.s2.desc": "Se ve perfecto en celular, tablet y computadora.",
      "services.s3.title": "Integración WhatsApp",
      "services.s3.desc": "Acortamos el camino entre interés y consulta.",
      "services.s4.title": "Formularios optimizados",
      "services.s4.desc": "Capturá datos útiles con fricción mínima.",
      "services.s5.title": "Seguridad y backups",
      "services.s5.desc": "Protección y respaldos automáticos para evitar pérdidas.",
      "services.s6.title": "Métricas",
      "services.s6.desc": "Configuración de analítica para medir resultados.",

      // Pricing
      "pricing.kicker": "Precios",
      "pricing.title": "Planes que se ajustan a tus necesidades",
      "pricing.subtitle": "Elegí un plan base y lo adaptamos.",
      "pricing.usdNote": "Precio en dólares",
      "pricing.badge": "Más elegido",

      "pricing.p1.title": "Landing Page",
      "pricing.p1.li1": "1 página",
      "pricing.p1.li2": "Diseño personalizado",
      "pricing.p1.li3": "100% responsive",
      "pricing.p1.li4": "WhatsApp o formulario",
      "pricing.p1.cta": "Quiero mi web",

      "pricing.p2.title": "Institucional",
      "pricing.p2.li1": "Hasta 5 secciones",
      "pricing.p2.li2": "Diseño personalizado",
      "pricing.p2.li3": "SEO básico",
      "pricing.p2.li4": "Formulario + WhatsApp",
      "pricing.p2.cta": "Quiero mi web",

      "pricing.p3.title": "Web a medida",
      "pricing.p3.price": "Personalizada",
      "pricing.p3.note": "Cotizamos según alcance",
      "pricing.p3.li1": "Estructura y diseño",
      "pricing.p3.li2": "Optimización de rendimiento",
      "pricing.p3.li3": "Integraciones",
      "pricing.p3.li4": "Analítica y medición",
      "pricing.p3.cta": "Agendar una llamada",

      // FAQ
      "faq.kicker": "FAQ",
      "faq.title": "Preguntas frecuentes",
      "faq.subtitle": "Resolvemos dudas comunes sobre tiempos, contenido y cambios.",

      "faq.q1.q": "¿En cuánto tiempo está lista la web?",
      "faq.q1.a": "Depende del alcance. Una landing suele estar en 7–10 días y un institucional en 10–14 días.",
      "faq.q2.q": "¿La web es autogestionable?",
      "faq.q2.a": "Sí. Te dejamos todo preparado para que puedas editar textos e imágenes sin complicaciones.",
      "faq.q3.q": "¿Tengo que aportar el contenido?",
      "faq.q3.a": "Idealmente sí (texto base, fotos, servicios). Si no lo tenés, te ayudamos a ordenarlo y redactarlo.",
      "faq.q4.q": "¿Incluye versión móvil?",
      "faq.q4.a": "Sí. Diseñamos pensando primero en celular para asegurar una experiencia excelente.",
      "faq.q5.q": "¿Puedo pedir cambios una vez entregada?",
      "faq.q5.a": "Incluimos una ronda de ajustes posteriores a la entrega. Extra cambios se cotizan aparte.",
      "faq.q6.q": "¿El dominio y hosting están incluidos?",
      "faq.q6.a": "Podemos gestionarlos con vos. La compra y renovación dependen del proveedor elegido.",

      // CTA
      "cta.title": "¿Tenés alguna consulta? Hablemos.",
      "cta.subtitle": "Agendá una llamada gratuita y te decimos qué conviene para tu caso.",
      "cta.btn1": "Consulta gratis",
      "cta.btn2": "Volver arriba",

      // Footer
      "footer.rights": "© Todos los derechos reservados",
      "footer.process": "Proceso",
      "footer.benefits": "Beneficios",
      "footer.services": "Servicios",
      "footer.pricing": "Precios",
      "footer.faqs": "FAQs",
    },

    en: {
      // Topbar
      "topbar.text": "✨ Spots available this month",
      "topbar.link": "Let’s talk",

      // Nav
      "nav.process": "Process",
      "nav.benefits": "Benefits",
      "nav.services": "Services",
      "nav.pricing": "Pricing",
      "nav.faqs": "FAQs",
      "nav.cta": "Let’s talk",

      // Hero
      "hero.pill": "Design • Development • Conversion",
      "hero.title1": "Websites built to sell,",
      "hero.title2": "not just to look pretty",
      "hero.subtitle": "Turn visitors into customers with a fast, clear website built for your business.",
      "hero.btnPricing": "See pricing",
      "hero.btnProjects": "View projects",
      "hero.stats.delivered": "projects delivered",
      "hero.stats.days": "avg. days",
      "hero.stats.responsive": "responsive",

      // Projects
      "projects.kicker": "Portfolio",
      "projects.title": "Recent projects",
      "projects.subtitle": "Clear pieces focused on results.",
      "projects.p1.title": "Project 01",
      "projects.p1.desc": "Landing page focused on inquiries and conversion.",
      "projects.p2.title": "Project 02",
      "projects.p2.desc": "Modern, fast institutional website.",
      "projects.p3.title": "Project 03",
      "projects.p3.desc": "Custom website with scalable sections.",

      // Process
      "process.kicker": "Process",
      "process.title": "Our process",
      "process.subtitle": "Three simple steps from idea to published website.",
      "process.s1.title": "Analysis & planning",
      "process.s1.desc": "We align goals, structure, and features from day one.",
      "process.s2.title": "Design & development",
      "process.s2.desc": "We build an optimized, responsive site ready to convert.",
      "process.s3.title": "Delivery & launch",
      "process.s3.desc": "We review, polish, and leave your website live and ready to use.",

      // Benefits
      "benefits.kicker": "Benefits",
      "benefits.title": "What do you get with us?",
      "benefits.subtitle": "A complete service—clear and results-driven.",
      "benefits.b1.title": "Tailor-made website",
      "benefits.b1.desc": "Design and content aligned with your differentiator to attract the right customer.",
      "benefits.b2.title": "Real performance",
      "benefits.b2.desc": "Fast, lightweight websites to improve experience and conversions.",
      "benefits.b3.title": "Self-manageable",
      "benefits.b3.desc": "You can edit content and grow without relying on third parties.",

      // Services
      "services.kicker": "Services",
      "services.title": "Digital solutions in one place",
      "services.subtitle": "Everything designed to help you sell more.",
      "services.s1.title": "Design & development",
      "services.s1.desc": "A clear, professional website consistent with your brand.",
      "services.s2.title": "Responsive",
      "services.s2.desc": "Looks perfect on mobile, tablet, and desktop.",
      "services.s3.title": "WhatsApp integration",
      "services.s3.desc": "We shorten the path between interest and inquiry.",
      "services.s4.title": "Optimized forms",
      "services.s4.desc": "Capture useful data with minimal friction.",
      "services.s5.title": "Security & backups",
      "services.s5.desc": "Protection and automated backups to prevent data loss.",
      "services.s6.title": "Metrics",
      "services.s6.desc": "Analytics setup to measure results.",

      // Pricing
      "pricing.kicker": "Pricing",
      "pricing.title": "Plans that fit your needs",
      "pricing.subtitle": "Choose a base plan and we tailor it to you.",
      "pricing.usdNote": "Price in USD",
      "pricing.badge": "Most popular",

      "pricing.p1.title": "Landing Page",
      "pricing.p1.li1": "1 page",
      "pricing.p1.li2": "Custom design",
      "pricing.p1.li3": "100% responsive",
      "pricing.p1.li4": "WhatsApp or form",
      "pricing.p1.cta": "I want my website",

      "pricing.p2.title": "Institutional",
      "pricing.p2.li1": "Up to 5 sections",
      "pricing.p2.li2": "Custom design",
      "pricing.p2.li3": "Basic SEO",
      "pricing.p2.li4": "Form + WhatsApp",
      "pricing.p2.cta": "I want my website",

      "pricing.p3.title": "Custom website",
      "pricing.p3.price": "Custom",
      "pricing.p3.note": "Quoted based on scope",
      "pricing.p3.li1": "Structure & design",
      "pricing.p3.li2": "Performance optimization",
      "pricing.p3.li3": "Integrations",
      "pricing.p3.li4": "Analytics & tracking",
      "pricing.p3.cta": "Book a call",

      // FAQ
      "faq.kicker": "FAQ",
      "faq.title": "Frequently asked questions",
      "faq.subtitle": "Answers to common questions about timelines, content, and changes.",

      "faq.q1.q": "How long does it take to get the website ready?",
      "faq.q1.a": "It depends on scope. A landing page is usually ready in 7–10 days and an institutional site in 10–14 days.",
      "faq.q2.q": "Can I manage the website myself?",
      "faq.q2.a": "Yes. We leave everything ready so you can edit text and images without hassle.",
      "faq.q3.q": "Do I need to provide the content?",
      "faq.q3.a": "Ideally yes (base copy, photos, services). If you don’t have it, we help you organize and write it.",
      "faq.q4.q": "Does it include a mobile version?",
      "faq.q4.a": "Yes. We design mobile-first to ensure an excellent experience.",
      "faq.q5.q": "Can I request changes after delivery?",
      "faq.q5.a": "We include one round of post-delivery tweaks. Extra changes are quoted separately.",
      "faq.q6.q": "Are domain and hosting included?",
      "faq.q6.a": "We can manage them with you. Purchase and renewal depend on the provider you choose.",

      // CTA
      "cta.title": "Have a question? Let’s talk.",
      "cta.subtitle": "Book a free call and we’ll tell you what makes the most sense for your case.",
      "cta.btn1": "Free consultation",
      "cta.btn2": "Back to top",

      // Footer
      "footer.rights": "© All rights reserved",
      "footer.process": "Process",
      "footer.benefits": "Benefits",
      "footer.services": "Services",
      "footer.pricing": "Pricing",
      "footer.faqs": "FAQs",
    },
  };

  const STORAGE_KEY = "site_lang";

  function getCurrentLang() {
    return localStorage.getItem(STORAGE_KEY) || "es";
  }

  function setLang(lang) {
    const dict = translations[lang];
    if (!dict) return;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const value = dict[key];
      if (typeof value === "string") el.textContent = value;
    });

    document.documentElement.lang = lang;

    const btn = document.getElementById("langToggle");
    if (btn) btn.textContent = lang.toUpperCase();

    localStorage.setItem(STORAGE_KEY, lang);
  }

  function toggleLang() {
    const current = getCurrentLang();
    setLang(current === "es" ? "en" : "es");
  }

  document.addEventListener("DOMContentLoaded", () => {
    setLang(getCurrentLang());
    const btn = document.getElementById("langToggle");
    if (btn) btn.addEventListener("click", toggleLang);
  });
})();