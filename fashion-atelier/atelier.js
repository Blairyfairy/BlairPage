/* Fashion Atelier — live layers, no credentials */

(function () {
  "use strict";

  // ─── Live image helper (public placeholder service, seeded for stability + variety)
  function liveImg(seed, w, h) {
    return `https://picsum.photos/seed/${seed}/${w}/${h}`;
  }

  // ─── Content data (curated market + trend intelligence)
  const SIGNALS = [
    {
      tag: "Silhouette",
      title: "Expressive femininity returns",
      body: "Fluid fabrics, asymmetry, lace, bustiers and deliberate transparency are cutting through quiet-luxury restraint. Paris buyers flagged collector-minded pieces over logo volume.",
      meta: "Paris · AW26 reads"
    },
    {
      tag: "Climate",
      title: "Seasons out of sync",
      body: "Longer, hotter summers are pushing outerwear later and elevating transitional layers. Houses are lightening constructions; winter margin is under pressure.",
      meta: "Retail calendar shift"
    },
    {
      tag: "Value",
      title: "Price resistance is real",
      body: "After multi-year increases, clients are more selective. Craft, service and early access now outrank artificial scarcity in both US and China.",
      meta: "BoF / McKinsey signals"
    },
    {
      tag: "Category",
      title: "Handbags still outpace apparel",
      body: "Bags have absorbed successive price rises more cleanly than ready-to-wear. Apparel and footwear have seen softer price realisation in recent cycles.",
      meta: "Luxury category split"
    },
    {
      tag: "Channel",
      title: "Resale as behaviour, not niche",
      body: "Second-hand is growing multi-times faster than primary. Platforms and brand-authorised channels are becoming part of the client journey rather than a threat.",
      meta: "Market structure"
    },
    {
      tag: "Creative",
      title: "Director reset wave",
      body: "A concentrated period of creative-director changes is aimed at re-igniting desire. Results are selective: coherent codes and clear authorship still win.",
      meta: "House leadership"
    }
  ];

  const TIERS = [
    {
      label: "High luxury",
      title: "Maisons",
      items: [
        ["Hermès", "Resilient"],
        ["Chanel", "Selective growth"],
        ["Louis Vuitton", "Creative continuity"],
        ["Dior", "Reset watch"],
        ["The Row", "Quiet power"]
      ]
    },
    {
      label: "Mid / accessible luxury",
      title: "Aspirational",
      items: [
        ["Saint Laurent", "Return to growth"],
        ["Gucci", "Turnaround phase"],
        ["Loewe", "Craft focus"],
        ["Bottega Veneta", "Texture language"],
        ["Celine", "Refined codes"]
      ]
    },
    {
      label: "Outlet & off-price",
      title: "Resilience layer",
      items: [
        ["Outlets", "Volume buffer"],
        ["Off-price", "Margin protection"],
        ["Sample / archive", "Rising interest"],
        ["Authorised resale", "Channel expansion"],
        ["Private sales", "Client retention"]
      ]
    },
    {
      label: "Emerging independents",
      title: "New signals",
      items: [
        ["Independent ateliers", "Artisanal detail"],
        ["Direct-to-client", "Service edge"],
        ["Material-first labels", "Fabric stories"],
        ["Gender-fluid houses", "Silhouette play"],
        ["Regional voices", "Non-Paris origin"]
      ]
    }
  ];

  const MARKET_PRIMARY = {
    kicker: "2026 outlook",
    title: "Stabilisation, not decline — growth in the low single digits",
    body: "Global luxury is expected to expand roughly 2–4% in 2026. The US remains the largest market; China is projected to recover and outpace other regions. Europe stays fragile under rent, regulation and cautious spend. Japan, Southeast Asia and the Middle East are relative outperformers, driven in part by younger affluent clients entering the category.",
    stats: [
      { value: "2–4%", label: "Global growth" },
      { value: "US + CN", label: "Demand anchors" },
      { value: "Selective", label: "House recovery" }
    ]
  };

  const MARKET_SIDE = [
    {
      title: "Emotional connection first",
      body: "Desirability is now driven more by emotional bond than by logo or pure heritage. Bespoke service and early access rank above waitlists in key markets."
    },
    {
      title: "Outlet & off-price buffer",
      body: "Outlet and off-price continue to absorb inventory pressure and protect brand equity when primary full-price demand softens."
    },
    {
      title: "M&A tone: selective",
      body: "Capital is cautious. Quality assets with clear creative direction and controllable distribution remain the focus; pure volume plays are less favoured."
    }
  ];

  const FORECAST = [
    {
      seed: "atelier-horizon-1",
      horizon: "6–9 months",
      title: "Bold colour & artisanal detail",
      body: "Blocks of red, turquoise, blue and yellow alongside elevated materials and hand-work as primary differentiators after a quieter cycle."
    },
    {
      seed: "atelier-horizon-2",
      horizon: "9–14 months",
      title: "Climate-adapted construction",
      body: "Lighter, second-skin fabrics and airy layering systems that respond to extended warm seasons without surrendering formality."
    },
    {
      seed: "atelier-horizon-3",
      horizon: "12–18 months",
      title: "Collector wardrobe logic",
      body: "Fewer, more singular pieces — rare hardware, vintage conversation, limited fabrication — replacing pure seasonal replenishment."
    }
  ];

  const MATERIALS = [
    { seed: "mat-silk", name: "Fluid silks & georgette", note: "Movement and transparency" },
    { seed: "mat-lace", name: "Technical lace", note: "Structure meets delicacy" },
    { seed: "mat-wool", name: "Lightweight wool crepe", note: "Transitional weight" },
    { seed: "mat-knit", name: "Sculptural knitwear", note: "Precision and volume" },
    { seed: "mat-leather", name: "Supple nappa & suede", note: "Hand-feel first" },
    { seed: "mat-cotton", name: "High-twist cotton", note: "Crisp seasonal layers" }
  ];

  const MOOD_CAPTIONS = [
    "Volume & line", "Texture study", "Evening light", "Street read",
    "Studio still", "Colour block", "Detail crop", "Movement", "Archive mood"
  ];

  // ─── Render helpers
  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }

  function renderMood() {
    const grid = document.getElementById("moodGrid");
    grid.innerHTML = "";
    const base = Date.now().toString(36).slice(-5);
    for (let i = 0; i < 9; i++) {
      const cell = el("div", "mood-cell");
      const img = document.createElement("img");
      img.src = liveImg(`fashion-mood-${base}-${i}`, 800, 900);
      img.alt = MOOD_CAPTIONS[i] || "Mood";
      img.loading = "lazy";
      const cap = el("div", "caption", MOOD_CAPTIONS[i] || "");
      cell.appendChild(img);
      cell.appendChild(cap);
      grid.appendChild(cell);
    }
  }

  function renderSignals() {
    const grid = document.getElementById("signalGrid");
    grid.innerHTML = "";
    SIGNALS.forEach((s, i) => {
      const card = el("article", "signal-card");
      card.style.animationDelay = `${i * 0.06}s`;
      card.innerHTML = `
        <span class="signal-tag">${s.tag}</span>
        <h3>${s.title}</h3>
        <p>${s.body}</p>
        <div class="signal-meta">${s.meta}</div>
      `;
      grid.appendChild(card);
    });
  }

  function renderBrands() {
    const wrap = document.getElementById("brandTiers");
    wrap.innerHTML = "";
    TIERS.forEach((t, i) => {
      const tier = el("div", "tier");
      tier.style.animationDelay = `${i * 0.07}s`;
      const items = t.items
        .map(([name, note]) => `<li>${name}<span>${note}</span></li>`)
        .join("");
      tier.innerHTML = `
        <div class="tier-label">${t.label}</div>
        <h3>${t.title}</h3>
        <ul>${items}</ul>
      `;
      wrap.appendChild(tier);
    });
  }

  function renderMarket() {
    const primary = document.getElementById("marketPrimary");
    const stats = MARKET_PRIMARY.stats
      .map((s) => `<div class="stat"><strong>${s.value}</strong><span>${s.label}</span></div>`)
      .join("");
    primary.innerHTML = `
      <div>
        <div class="kicker">${MARKET_PRIMARY.kicker}</div>
        <h3>${MARKET_PRIMARY.title}</h3>
        <p>${MARKET_PRIMARY.body}</p>
      </div>
      <div class="stat-row">${stats}</div>
    `;

    const side = document.getElementById("marketSide");
    side.innerHTML = "";
    MARKET_SIDE.forEach((m) => {
      const card = el("div", "side-card");
      card.innerHTML = `<h4>${m.title}</h4><p>${m.body}</p>`;
      side.appendChild(card);
    });
  }

  function renderForecast() {
    const track = document.getElementById("forecastTrack");
    track.innerHTML = "";
    FORECAST.forEach((f, i) => {
      const card = el("article", "forecast-card");
      card.style.animationDelay = `${i * 0.08}s`;
      card.innerHTML = `
        <div class="img-wrap">
          <img src="${liveImg(f.seed, 700, 500)}" alt="" loading="lazy" />
        </div>
        <div class="forecast-body">
          <span class="horizon">${f.horizon}</span>
          <h3>${f.title}</h3>
          <p>${f.body}</p>
        </div>
      `;
      track.appendChild(card);
    });
  }

  function renderMaterials() {
    const grid = document.getElementById("matGrid");
    grid.innerHTML = "";
    MATERIALS.forEach((m, i) => {
      const card = el("div", "mat-card");
      card.style.animationDelay = `${i * 0.05}s`;
      card.innerHTML = `
        <div class="swatch" style="background-image:url('${liveImg(m.seed, 400, 200)}')"></div>
        <h4>${m.name}</h4>
        <p>${m.note}</p>
      `;
      grid.appendChild(card);
    });
  }

  function setHero() {
    const bg = document.getElementById("heroBg");
    const seed = "atelier-hero-" + new Date().getFullYear();
    bg.style.backgroundImage = `url('${liveImg(seed, 1600, 1000)}')`;
  }

  function tickClock() {
    const el = document.getElementById("liveClock");
    if (!el) return;
    const now = new Date();
    el.textContent = now.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function refreshAll() {
    setHero();
    renderMood();
    // content layers stay; images reseed
    renderForecast();
    renderMaterials();
  }

  // ─── Boot
  function init() {
    setHero();
    renderMood();
    renderSignals();
    renderBrands();
    renderMarket();
    renderForecast();
    renderMaterials();
    tickClock();
    setInterval(tickClock, 30000);

    const btn = document.getElementById("refreshAll");
    if (btn) btn.addEventListener("click", refreshAll);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
