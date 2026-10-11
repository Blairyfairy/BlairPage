/* Blair's Atelier — live layers, no credentials */

(function () {
  "use strict";

  function liveImg(seed, w, h) {
    return "https://picsum.photos/seed/" + seed + "/" + w + "/" + h;
  }

  var SIGNALS = [
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

  var TIERS = [
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

  var MARKET_PRIMARY = {
    kicker: "2026 outlook",
    title: "Stabilisation, not decline — growth in the low single digits",
    body: "Global luxury is expected to expand roughly 2–4% in 2026. The US remains the largest market; China is projected to recover and outpace other regions. Europe stays fragile under rent, regulation and cautious spend. Japan, Southeast Asia and the Middle East are relative outperformers, driven in part by younger affluent clients entering the category.",
    stats: [
      { value: "2–4%", label: "Global growth" },
      { value: "US + CN", label: "Demand anchors" },
      { value: "Selective", label: "House recovery" }
    ]
  };

  var MARKET_SIDE = [
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

  var FORECAST = [
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

  var MATERIALS = [
    { seed: "mat-silk", name: "Fluid silks & georgette", note: "Movement and transparency" },
    { seed: "mat-lace", name: "Technical lace", note: "Structure meets delicacy" },
    { seed: "mat-wool", name: "Lightweight wool crepe", note: "Transitional weight" },
    { seed: "mat-knit", name: "Sculptural knitwear", note: "Precision and volume" },
    { seed: "mat-leather", name: "Supple nappa & suede", note: "Hand-feel first" },
    { seed: "mat-cotton", name: "High-twist cotton", note: "Crisp seasonal layers" }
  ];

  var MOOD_CAPTIONS = [
    "Volume & line", "Texture study", "Evening light", "Street read",
    "Studio still", "Colour block", "Detail crop", "Movement", "Archive mood"
  ];

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }

  function renderMood() {
    var grid = document.getElementById("moodGrid");
    if (!grid) return;
    grid.innerHTML = "";
    var base = Date.now().toString(36).slice(-5);
    for (var i = 0; i < 9; i++) {
      var cell = el("div", "mood-cell");
      var img = document.createElement("img");
      img.src = liveImg("fashion-mood-" + base + "-" + i, 800, 900);
      img.alt = MOOD_CAPTIONS[i] || "Mood";
      img.loading = "lazy";
      var cap = el("div", "caption", MOOD_CAPTIONS[i] || "");
      cell.appendChild(img);
      cell.appendChild(cap);
      grid.appendChild(cell);
    }
  }

  function renderSignals() {
    var grid = document.getElementById("signalGrid");
    if (!grid) return;
    grid.innerHTML = "";
    SIGNALS.forEach(function (s) {
      var card = el("article", "signal-card");
      card.innerHTML =
        '<span class="signal-tag">' + s.tag + "</span>" +
        "<h3>" + s.title + "</h3>" +
        "<p>" + s.body + "</p>" +
        '<div class="signal-meta">' + s.meta + "</div>";
      grid.appendChild(card);
    });
  }

  function renderBrands() {
    var wrap = document.getElementById("brandTiers");
    if (!wrap) return;
    wrap.innerHTML = "";
    TIERS.forEach(function (t) {
      var tier = el("div", "tier");
      var items = t.items
        .map(function (pair) {
          return "<li>" + pair[0] + "<span>" + pair[1] + "</span></li>";
        })
        .join("");
      tier.innerHTML =
        '<div class="tier-label">' + t.label + "</div>" +
        "<h3>" + t.title + "</h3>" +
        "<ul>" + items + "</ul>";
      wrap.appendChild(tier);
    });
  }

  function renderMarket() {
    var primary = document.getElementById("marketPrimary");
    if (!primary) return;
    var stats = MARKET_PRIMARY.stats
      .map(function (s) {
        return '<div class="mstat"><strong>' + s.value + "</strong><span>" + s.label + "</span></div>";
      })
      .join("");
    primary.innerHTML =
      "<div>" +
      '<div class="kicker-inline">' + MARKET_PRIMARY.kicker + "</div>" +
      "<h3>" + MARKET_PRIMARY.title + "</h3>" +
      "<p>" + MARKET_PRIMARY.body + "</p>" +
      "</div>" +
      '<div class="stat-row">' + stats + "</div>";

    var side = document.getElementById("marketSide");
    if (!side) return;
    side.innerHTML = "";
    MARKET_SIDE.forEach(function (m) {
      var card = el("div", "side-card");
      card.innerHTML = "<h4>" + m.title + "</h4><p>" + m.body + "</p>";
      side.appendChild(card);
    });
  }

  function renderForecast() {
    var track = document.getElementById("forecastTrack");
    if (!track) return;
    track.innerHTML = "";
    FORECAST.forEach(function (f) {
      var card = el("article", "forecast-card");
      card.innerHTML =
        '<div class="img-wrap"><img src="' + liveImg(f.seed, 700, 500) + '" alt="" loading="lazy" /></div>' +
        '<div class="forecast-body">' +
        '<span class="horizon">' + f.horizon + "</span>" +
        "<h3>" + f.title + "</h3>" +
        "<p>" + f.body + "</p>" +
        "</div>";
      track.appendChild(card);
    });
  }

  function renderMaterials() {
    var grid = document.getElementById("matGrid");
    if (!grid) return;
    grid.innerHTML = "";
    MATERIALS.forEach(function (m) {
      var card = el("div", "mat-card");
      card.innerHTML =
        '<div class="swatch" style="background-image:url(\'' + liveImg(m.seed, 400, 200) + "')\"></div>" +
        "<h4>" + m.name + "</h4>" +
        "<p>" + m.note + "</p>";
      grid.appendChild(card);
    });
  }

  function setHero() {
    var bg = document.getElementById("heroBg");
    if (!bg) return;
    var seed = "atelier-hero-" + new Date().getFullYear();
    bg.style.backgroundImage = "url('" + liveImg(seed, 1600, 1000) + "')";
  }

  function tickClock() {
    var node = document.getElementById("liveClock");
    if (!node) return;
    var now = new Date();
    node.textContent = now.toLocaleString(undefined, {
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
    renderForecast();
    renderMaterials();
  }

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

    var btn = document.getElementById("refreshAll");
    if (btn) btn.addEventListener("click", refreshAll);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
