// ========= Helpers =========
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const lerp = (a, b, t) => a + (b - a) * t;

// ========= Mobile nav =========
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");

if (navToggle && navMenu) {
  const closeMenu = () => {
    navMenu.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  const toggleMenu = () => {
    const isOpen = navMenu.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  };

  navToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Cerrar al hacer click en un link
  navMenu.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => closeMenu());
  });

  // Cerrar al hacer click fuera (opcional pero recomendado)
  document.addEventListener("click", (e) => {
    const clickInside = navMenu.contains(e.target) || navToggle.contains(e.target);
    if (!clickInside) closeMenu();
  });

  // Cerrar con ESC (opcional)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
}

// ========= Active nav link (IntersectionObserver) =========
const sections = ["proceso","beneficios","servicios","precios","faq"]
  .map(id => document.getElementById(id))
  .filter(Boolean);

const links = Array.from(document.querySelectorAll(".nav .nav-link"));

const setActive = (id) => {
  links.forEach(l => {
    const href = l.getAttribute("href") || "";
    l.classList.toggle("active", href === `#${id}`);
  });
};

if (sections.length) {
  const io = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a,b) => (b.intersectionRatio - a.intersectionRatio))[0];
    if (visible?.target?.id) setActive(visible.target.id);
  }, { threshold: [0.25, 0.5, 0.75] });

  sections.forEach(s => io.observe(s));
}

// ========= Reveal on scroll =========
const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      const d = Number(el.getAttribute("data-delay") || "0");
      if (d) el.style.transitionDelay = `${d}ms`;
      el.classList.add("in");
      revealObs.unobserve(el);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => revealObs.observe(el));

// ========= Cursor glow follow (smooth) =========
const glow = document.getElementById("cursorGlow");
let gx = window.innerWidth * 0.5, gy = window.innerHeight * 0.3;
let tx = gx, ty = gy;

if (glow) {
  window.addEventListener("pointermove", (e) => {
    tx = e.clientX;
    ty = e.clientY;
  }, { passive: true });

  const tick = () => {
    gx = lerp(gx, tx, 0.12);
    gy = lerp(gy, ty, 0.12);
    glow.style.left = gx + "px";
    glow.style.top = gy + "px";
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// ========= Hover "spotlight" for cards & buttons (CSS vars mx/my) =========
function attachSpotlight(selector) {
  document.querySelectorAll(selector).forEach(el => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * 100;
      const my = ((e.clientY - r.top) / r.height) * 100;
      el.style.setProperty("--mx", `${mx}%`);
      el.style.setProperty("--my", `${my}%`);
    }, { passive: true });
  });
}
attachSpotlight(".card");
attachSpotlight(".btn");

// ========= Tilt effect (cards/stats/device) =========
const tilts = Array.from(document.querySelectorAll("[data-tilt]"));
tilts.forEach(el => {
  let raf = null;

  const onMove = (e) => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;

    const rx = lerp(6, -6, py);      // invert for natural feel
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

// ========= Magnetic hover (subtle) =========
const magnetics = Array.from(document.querySelectorAll(".magnetic"));
magnetics.forEach(el => {
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
  const dur = 900; // ms

  const start = performance.now();
  const from = 0;

  const step = (now) => {
    const t = clamp((now - start) / dur, 0, 1);
    // easeOutCubic
    const eased = 1 - Math.pow(1 - t, 3);
    const val = Math.round(lerp(from, to, eased));
    el.textContent = `${val}${suffix}`;
    if (t < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
};

const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target);
      counterObs.unobserve(e.target);
    }
  });
}, { threshold: 0.6 });

counters.forEach(c => counterObs.observe(c));

// ========= FAQ: solo uno abierto =========
const faqItems = Array.from(document.querySelectorAll(".faq-item"));
faqItems.forEach(item => {
  item.addEventListener("toggle", () => {
    if (item.open) {
      faqItems.forEach(other => {
        if (other !== item) other.open = false;
      });
    }
  });
});

// ========= Parallax suave (rings / blobs) =========
const parallaxEls = [
  ...document.querySelectorAll(".ring"),
  ...document.querySelectorAll(".blob"),
];

let sx = 0, sy = 0, px = 0, py = 0;
window.addEventListener("pointermove", (e) => {
  sx = (e.clientX / window.innerWidth - 0.5) * 2;
  sy = (e.clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });

const parallaxTick = () => {
  px = lerp(px, sx, 0.08);
  py = lerp(py, sy, 0.08);

  parallaxEls.forEach((el, i) => {
    const depth = (i + 1) * 6;
    el.style.transform = `translate3d(${px * depth}px, ${py * depth}px, 0)`;
  });

  requestAnimationFrame(parallaxTick);
};
requestAnimationFrame(parallaxTick);