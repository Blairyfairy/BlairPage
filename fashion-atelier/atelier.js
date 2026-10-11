/* Blair's Atelier — Freedom, Beauty, Truth & Love
   Live fashion imagery (Openverse), public fashion feeds, editorial layers.
   No credentials. */

(function () {
  "use strict";

  var OV = "https://api.openverse.org/v1/images/";
  var UA = { headers: { Accept: "application/json" } };

  var FASHION_QUERIES = [
    "fashion runway model",
    "haute couture dress",
    "fashion week street style",
    "luxury fashion handbag",
    "designer evening gown",
    "fashion fabric textile",
    "paris fashion week",
    "fashion portrait editorial",
    "couture silhouette"
  ];

  var FEEDS = {
    guardian: { label: "Guardian Fashion", url: "https://www.theguardian.com/fashion/rss" },
    wwd: { label: "WWD Fashion", url: "https://wwd.com/fashion-news/feed/" },
    "wwd-biz": { label: "WWD Business", url: "https://wwd.com/business-news/feed/" },
    "guardian-life": { label: "Guardian Lifestyle", url: "https://www.theguardian.com/lifeandstyle/rss" }
  };

  var SIGNALS = [
    {
      tag: "Silhouette",
      title: "Expressive femininity, refined",
      body: "Fluid volumes, asymmetry, lace and considered transparency are rebalancing quiet-luxury restraint. From couture ateliers to elevated diffusion, buyers favour singular, collector-minded pieces over pure logo density.",
      meta: "Paris · AW26 silhouette doctrine"
    },
    {
      tag: "Climate",
      title: "The long season",
      body: "Extended warmth compresses the outerwear window and elevates transitional layering. Maisons and refined mid-market houses are lightening construction; winter margin is recalibrated across full-price and outlet floors.",
      meta: "Seasonal calendar · climate read"
    },
    {
      tag: "Value",
      title: "Craft as the new scarcity",
      body: "After successive price cycles, the discerning client — maison through elevated outlet — privileges finish, service and early access over artificial waitlists. Emotional connection outranks emblem alone.",
      meta: "Client behaviour · US & China"
    },
    {
      tag: "Category",
      title: "Leather goods lead",
      body: "Handbags and small leather goods have absorbed price architecture more cleanly than ready-to-wear. Apparel and footwear remain more sensitive — a split visible from flagship to off-price corridor.",
      meta: "Category economics"
    },
    {
      tag: "Channel",
      title: "Resale and the long wardrobe",
      body: "Authorised resale, archive and elevated outlet are no longer peripheral. They form part of a continuous client journey — discovery, ownership, recirculation — for the long wardrobe rather than the short season.",
      meta: "Channel architecture"
    },
    {
      tag: "Creative",
      title: "Authorship over noise",
      body: "Creative-director transitions remain concentrated. Houses that pair a coherent code with visible craft and controlled distribution recover desire more reliably — whether historic maison or scaled independent.",
      meta: "House leadership"
    },
    {
      tag: "Colour",
      title: "Saturated return",
      body: "After a muted cycle, blocks of red, cobalt, turquoise and antique gold re-enter the conversation — as accent and as full silhouette — from couture colour stories to elevated outlet discovery.",
      meta: "Colour doctrine · AW26–SS27"
    },
    {
      tag: "Client",
      title: "Younger affluent entry",
      body: "Southeast Asia, the Middle East and pockets of the US see first-time luxury clients entering through leather goods, beauty adjacency and elevated off-price — a pipeline maisons increasingly design for.",
      meta: "Demand architecture"
    }
  ];

  var TIERS = [
    {
      label: "High luxury",
      title: "Maisons",
      items: [
        ["Hermès", "Structural resilience"],
        ["Chanel", "Selective growth"],
        ["Louis Vuitton", "Creative continuity"],
        ["Dior", "Reset in progress"],
        ["The Row", "Quiet authority"],
        ["Balenciaga", "Code recalibration"],
        ["Valentino", "Romantic precision"],
        ["Givenchy", "New authorship"]
      ]
    },
    {
      label: "Accessible luxury",
      title: "Aspirational houses",
      items: [
        ["Saint Laurent", "Return to growth"],
        ["Gucci", "Turnaround phase"],
        ["Loewe", "Craft-led desire"],
        ["Bottega Veneta", "Texture language"],
        ["Celine", "Refined codes"],
        ["Prada", "Intellectual chic"],
        ["Miu Miu", "Youthful velocity"],
        ["Burberry", "British recalibration"]
      ]
    },
    {
      label: "Elevated outlet & off-price",
      title: "Resilience corridor",
      items: [
        ["Designer outlet villages", "Volume with equity"],
        ["Off-price floors", "Margin protection"],
        ["Sample & archive", "Collector interest"],
        ["Authorised resale", "Journey extension"],
        ["Private client sales", "Retention"],
        ["Seasonal clearance suites", "Controlled dilution"]
      ]
    },
    {
      label: "Emerging independents",
      title: "New authorship",
      items: [
        ["Independent ateliers", "Artisanal detail"],
        ["Direct-to-client", "Service as luxury"],
        ["Material-first labels", "Fabric narrative"],
        ["Gender-fluid houses", "Silhouette play"],
        ["Regional voices", "Beyond the capital"],
        ["Archive-led labels", "Long wardrobe logic"]
      ]
    }
  ];

  var MARKET_PRIMARY = {
    kicker: "2026 outlook",
    title: "Stabilisation with selective desire",
    body: "Global luxury is expected to advance in the low single digits — roughly 2–4% — as the industry shifts from volume-led expansion to stabilisation. The United States remains the largest market; China is positioned to recover and outpace other regions. Europe navigates rent, regulation and cautious spend. Japan, Southeast Asia and the Middle East offer relative strength, including younger affluent clients entering the category. Across maison floors and the elevated outlet corridor, the governing principle is selectivity: fewer, better, more enduring purchases.",
    stats: [
      { value: "2–4%", label: "Global growth" },
      { value: "US · CN", label: "Demand anchors" },
      { value: "Selective", label: "Client posture" }
    ]
  };

  var MARKET_SIDE = [
    {
      title: "Emotional connection first",
      body: "Desirability is increasingly rooted in emotional bond rather than logo or heritage alone — a truth that holds from couture clients to the elevated outlet shopper seeking a first meaningful luxury touchpoint."
    },
    {
      title: "The outlet corridor as buffer",
      body: "Designer outlet villages and refined off-price floors absorb inventory pressure while protecting brand equity, offering discovery without diluting the full-price narrative."
    },
    {
      title: "Capital remains selective",
      body: "Attention concentrates on assets with clear creative authorship, controllable distribution and legible craft — historic houses and scaled independents alike."
    },
    {
      title: "Beauty as adjacency",
      body: "Fragrance and beauty continue to outperform pure apparel for several groups — a lower-ticket entry that still carries maison codes and feeds the longer client relationship."
    }
  ];

  var FORECAST = [
    {
      query: "bold colour fashion dress runway",
      horizon: "6–9 months",
      title: "Colour doctrine & the hand",
      body: "Saturated blocks — red, turquoise, cobalt, gold — paired with visible artisanal detail. Colour and the hand become the primary differentiators after a quieter, more muted cycle."
    },
    {
      query: "lightweight fashion layering summer couture",
      horizon: "9–14 months",
      title: "Climate-adapted construction",
      body: "Second-skin fabrics, airy layering and reduced bulk that honour formality while answering extended warmth — a construction language for maison and elevated diffusion alike."
    },
    {
      query: "vintage archive fashion collector style",
      horizon: "12–18 months",
      title: "Collector wardrobe logic",
      body: "Fewer, more singular pieces: rare hardware, archive conversation, limited fabrication. The long wardrobe replaces pure seasonal replenishment from full-price to elevated outlet discovery."
    }
  ];

  var MATERIALS = [
    { query: "silk fabric fashion drape couture", name: "Fluid silks & georgette", note: "Movement, transparency, evening weight" },
    { query: "lace fashion dress couture detail", name: "Technical lace", note: "Structure meeting delicacy" },
    { query: "wool crepe fashion textile luxury", name: "Lightweight wool crepe", note: "Transitional authority" },
    { query: "knitwear fashion runway sculptural", name: "Sculptural knitwear", note: "Precision and volume" },
    { query: "leather fashion handbag luxury texture", name: "Supple nappa & suede", note: "Hand-feel as argument" },
    { query: "cotton fashion shirt luxury fabric", name: "High-twist cotton", note: "Crisp seasonal layers" }
  ];

  var MOOD_CAPTIONS = [
    "Runway line", "Couture texture", "Evening light", "Street read",
    "Studio still", "Colour block", "Detail crop", "Movement", "Archive mood"
  ];

  /* Relative strength charts — editorial indices, not financial advice */
  var GROWTH_BARS = [
    { label: "US luxury", pct: 72 },
    { label: "China recovery", pct: 68 },
    { label: "Europe", pct: 38 },
    { label: "SE Asia / ME", pct: 78 },
    { label: "Resale corridor", pct: 88 },
    { label: "Leather goods", pct: 82 },
    { label: "Elevated outlet", pct: 65 },
    { label: "Beauty adjacency", pct: 84 }
  ];

  var CATEGORY_BARS = [
    { label: "Handbags & SLG", pct: 86 },
    { label: "Ready-to-wear", pct: 48 },
    { label: "Footwear", pct: 52 },
    { label: "Fragrance & beauty", pct: 80 },
    { label: "Jewellery & watches", pct: 58 },
    { label: "Outerwear", pct: 42 }
  ];

  var COLOUR_THEME = [
    { name: "Antique gold", hex: "#c4a484", note: "Hardware & accent" },
    { name: "Deep plum", hex: "#5d3b72", note: "Evening & brand" },
    { name: "Cobalt", hex: "#2175a9", note: "Statement block" },
    { name: "Rose", hex: "#b86b8f", note: "Femininity return" },
    { name: "Turquoise", hex: "#2a9d8f", note: "Seasonal pop" },
    { name: "Obsidian", hex: "#170e20", note: "Structure & base" },
    { name: "Ivory", hex: "#f5f0eb", note: "Quiet luxury ground" },
    { name: "Crimson", hex: "#9b1b30", note: "Bold return" }
  ];

  var SEASON_NOTES = [
    { season: "AW26", focus: "Outerwear delayed; transitional layers elevated; saturated colour against dark base." },
    { season: "SS27", focus: "Second-skin construction; airy formality; collector pieces over pure replenishment." },
    { season: "Resort", focus: "Climate-aware travel wardrobe; lightweight structure; destination colour." },
    { season: "Pre-Fall", focus: "Bridge season strength; commercial precision; outlet-ready depth." }
  ];

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }

  function stripHtml(s) {
    if (!s) return "";
    var d = document.createElement("div");
    d.innerHTML = s;
    return (d.textContent || d.innerText || "").trim();
  }

  function formatDate(d) {
    if (!d) return "";
    try {
      var dt = new Date(d);
      if (isNaN(dt.getTime())) return String(d).slice(0, 16);
      return dt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    } catch (e) {
      return "";
    }
  }

  function fetchFashionImages(query, count) {
    count = count || 1;
    var url =
      OV +
      "?q=" +
      encodeURIComponent(query) +
      "&page_size=" +
      Math.min(count + 4, 20) +
      "&mature=false";
    return fetch(url, UA)
      .then(function (r) {
        if (!r.ok) throw new Error("ov " + r.status);
        return r.json();
      })
      .then(function (data) {
        var results = (data && data.results) || [];
        return results
          .filter(function (img) {
            return img && img.url && !img.mature;
          })
          .slice(0, count);
      })
      .catch(function () {
        return [];
      });
  }

  function imgFromResult(result) {
    if (!result) return "";
    return result.url || result.thumbnail || "";
  }

  function attribution(result) {
    if (!result) return "";
    var t = result.title || "Fashion image";
    var c = result.creator || result.provider || "";
    return c ? t + " · " + c : t;
  }

  function setHero() {
    var bg = document.getElementById("heroBg");
    if (!bg) return;
    fetchFashionImages("haute couture fashion runway", 6).then(function (imgs) {
      if (!imgs.length) {
        fetchFashionImages("fashion week model", 6).then(function (imgs2) {
          if (imgs2.length) bg.style.backgroundImage = "url('" + imgFromResult(imgs2[0]) + "')";
        });
        return;
      }
      var pick = imgs[Math.floor(Math.random() * imgs.length)];
      bg.style.backgroundImage = "url('" + imgFromResult(pick) + "')";
    });
  }

  function renderMood() {
    var grid = document.getElementById("moodGrid");
    if (!grid) return;
    grid.innerHTML = "";
    for (var i = 0; i < 9; i++) {
      var cell = el("div", "mood-cell");
      cell.innerHTML =
        '<div style="width:100%;height:100%;min-height:160px;background:linear-gradient(135deg,#2a1736,#5d3b72);opacity:.4"></div>';
      grid.appendChild(cell);
    }
    var promises = FASHION_QUERIES.map(function (q) {
      return fetchFashionImages(q, 2);
    });
    Promise.all(promises).then(function (allBatches) {
      var pool = [];
      allBatches.forEach(function (batch) {
        batch.forEach(function (img) {
          if (img && img.url) pool.push(img);
        });
      });
      var seen = {};
      pool = pool.filter(function (img) {
        if (seen[img.id]) return false;
        seen[img.id] = true;
        return true;
      });
      if (!pool.length) {
        grid.innerHTML =
          '<div class="wire-empty" style="grid-column:1/-1">Fashion imagery temporarily quiet — editorial layers remain active.</div>';
        return;
      }
      grid.innerHTML = "";
      for (var j = 0; j < 9; j++) {
        var img = pool[j % pool.length];
        var cell = el("div", "mood-cell");
        var image = document.createElement("img");
        image.src = imgFromResult(img);
        image.alt = attribution(img) || MOOD_CAPTIONS[j] || "Fashion";
        image.loading = "lazy";
        image.referrerPolicy = "no-referrer";
        cell.appendChild(image);
        cell.appendChild(el("div", "caption", MOOD_CAPTIONS[j] || attribution(img).slice(0, 40)));
        grid.appendChild(cell);
      }
    });
  }

  function fetchWire(feedKey) {
    var grid = document.getElementById("wireGrid");
    var status = document.getElementById("feedStatus");
    if (!grid) return;
    var feed = FEEDS[feedKey] || FEEDS.guardian;
    grid.innerHTML = '<div class="wire-loading">Pulling the fashion wire…</div>';
    if (status) status.textContent = "Loading";
    var bridge =
      "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(feed.url);
    fetch(bridge)
      .then(function (r) {
        if (!r.ok) throw new Error("bridge");
        return r.json();
      })
      .then(function (data) {
        grid.innerHTML = "";
        var items = (data && data.items) || [];
        if (!items.length) throw new Error("empty");
        items.slice(0, 9).forEach(function (item) {
          var card = el("article", "wire-card");
          var title = item.title || "Untitled";
          var link = item.link || "#";
          var desc = stripHtml(item.description || item.content || "").slice(0, 140);
          if (desc.length === 140) desc += "…";
          card.innerHTML =
            '<div class="source">' +
            feed.label +
            "</div><h3><a href=\"" +
            link +
            "\" target=\"_blank\" rel=\"noopener\">" +
            title +
            "</a></h3>" +
            (desc ? '<p class="snippet">' + desc + "</p>" : "") +
            '<div class="meta">' +
            (formatDate(item.pubDate) || "Recent") +
            "</div>";
          grid.appendChild(card);
        });
        if (status) status.textContent = "Live";
      })
      .catch(function () {
        var alt =
          "https://rssjson.vercel.app/api?url=" + encodeURIComponent(feed.url);
        return fetch(alt)
          .then(function (r) {
            if (!r.ok) throw new Error("alt");
            return r.json();
          })
          .then(function (data) {
            grid.innerHTML = "";
            var items =
              data.items || data.entries || (data.feed && data.feed.entries) || [];
            if (!items.length) throw new Error("empty2");
            items.slice(0, 9).forEach(function (item) {
              var card = el("article", "wire-card");
              var title = item.title || "Untitled";
              var link = item.link || item.url || "#";
              var desc = stripHtml(
                item.description || item.content || item.summary || ""
              ).slice(0, 140);
              if (desc.length === 140) desc += "…";
              card.innerHTML =
                '<div class="source">' +
                feed.label +
                "</div><h3><a href=\"" +
                link +
                "\" target=\"_blank\" rel=\"noopener\">" +
                title +
                "</a></h3>" +
                (desc ? '<p class="snippet">' + desc + "</p>" : "") +
                '<div class="meta">' +
                (formatDate(item.pubDate || item.published) || "Recent") +
                "</div>";
              grid.appendChild(card);
            });
            if (status) status.textContent = "Live";
          })
          .catch(function () {
            grid.innerHTML =
              '<div class="wire-empty">Wire temporarily unreachable from this network. Mood Loom, Pulse, Houses, Ledger, Horizon and Grammar remain active.</div>';
            if (status) status.textContent = "Offline";
          });
      });
  }

  function bindWireTabs() {
    document.querySelectorAll(".wire-tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        document.querySelectorAll(".wire-tab").forEach(function (t) {
          t.classList.remove("active");
        });
        tab.classList.add("active");
        fetchWire(tab.getAttribute("data-feed"));
      });
    });
  }

  function fetchPulseLive() {
    var host = document.getElementById("pulseLive");
    if (!host) return;
    fetch("https://www.newsylist.com/api/live.json")
      .then(function (r) {
        if (!r.ok) throw new Error("pulse");
        return r.json();
      })
      .then(function (data) {
        var list = data.trends || data.items || data || [];
        if (!Array.isArray(list) || !list.length) return;
        host.innerHTML = "";
        list.slice(0, 10).forEach(function (t) {
          var name = t.name || t.title || t.trend || String(t);
          var chip = el("div", "pulse-chip");
          chip.innerHTML =
            "<strong>" + name + "</strong><span>Culture ticker</span>";
          host.appendChild(chip);
        });
      })
      .catch(function () {});
  }

  function renderSignals() {
    var grid = document.getElementById("signalGrid");
    if (!grid) return;
    grid.innerHTML = "";
    SIGNALS.forEach(function (s) {
      var card = el("article", "signal-card");
      card.innerHTML =
        '<span class="signal-tag">' +
        s.tag +
        "</span><h3>" +
        s.title +
        "</h3><p>" +
        s.body +
        '</p><div class="signal-meta">' +
        s.meta +
        "</div>";
      grid.appendChild(card);
    });
  }

  function renderBarSet(containerId, title, data) {
    var host = document.getElementById(containerId);
    if (!host) return;
    host.innerHTML = "";
    if (title) {
      var h = el("h3", "chart-title", title);
      host.appendChild(h);
    }
    var wrap = el("div", "data-bars");
    data.forEach(function (b) {
      var row = el("div", "bar-row");
      row.innerHTML =
        '<span class="label">' +
        b.label +
        '</span><div class="bar-track"><div class="bar-fill" style="width:' +
        b.pct +
        '%"></div></div><span class="val">' +
        b.pct +
        "</span>";
      wrap.appendChild(row);
    });
    host.appendChild(wrap);
  }

  function renderColourDoctrine() {
    var host = document.getElementById("colourDoctrine");
    if (!host) return;
    host.innerHTML = "";
    COLOUR_THEME.forEach(function (c) {
      var card = el("div", "colour-chip");
      card.innerHTML =
        '<div class="colour-swatch" style="background:' +
        c.hex +
        '"></div><strong>' +
        c.name +
        "</strong><span>" +
        c.note +
        "</span>";
      host.appendChild(card);
    });
  }

  function renderSeasonNotes() {
    var host = document.getElementById("seasonNotes");
    if (!host) return;
    host.innerHTML = "";
    SEASON_NOTES.forEach(function (s) {
      var card = el("div", "season-note-card");
      card.innerHTML =
        '<span class="season-tag">' +
        s.season +
        "</span><p>" +
        s.focus +
        "</p>";
      host.appendChild(card);
    });
  }

  function renderBrands() {
    var wrap = document.getElementById("brandTiers");
    if (!wrap) return;
    wrap.innerHTML = "";
    TIERS.forEach(function (t) {
      var tier = el("div", "tier");
      var items = t.items
        .map(function (p) {
          return "<li>" + p[0] + "<span>" + p[1] + "</span></li>";
        })
        .join("");
      tier.innerHTML =
        '<div class="tier-label">' +
        t.label +
        "</div><h3>" +
        t.title +
        "</h3><ul>" +
        items +
        "</ul>";
      wrap.appendChild(tier);
    });
  }

  function renderMarket() {
    var primary = document.getElementById("marketPrimary");
    if (!primary) return;
    var stats = MARKET_PRIMARY.stats
      .map(function (s) {
        return (
          '<div class="mstat"><strong>' +
          s.value +
          "</strong><span>" +
          s.label +
          "</span></div>"
        );
      })
      .join("");
    primary.innerHTML =
      '<div><div class="kicker-inline">' +
      MARKET_PRIMARY.kicker +
      "</div><h3>" +
      MARKET_PRIMARY.title +
      "</h3><p>" +
      MARKET_PRIMARY.body +
      '</p></div><div class="stat-row">' +
      stats +
      "</div>";

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
    FORECAST.forEach(function (f, idx) {
      var card = el("article", "forecast-card");
      card.innerHTML =
        '<div class="img-wrap" id="fc-img-' +
        idx +
        '"></div><div class="forecast-body"><span class="horizon">' +
        f.horizon +
        "</span><h3>" +
        f.title +
        "</h3><p>" +
        f.body +
        "</p></div>";
      track.appendChild(card);
      fetchFashionImages(f.query, 3).then(function (imgs) {
        var wrap = document.getElementById("fc-img-" + idx);
        if (!wrap || !imgs.length) return;
        var img = document.createElement("img");
        img.src = imgFromResult(imgs[0]);
        img.alt = f.title;
        img.loading = "lazy";
        img.referrerPolicy = "no-referrer";
        wrap.appendChild(img);
      });
    });
  }

  function renderMaterials() {
    var grid = document.getElementById("matGrid");
    if (!grid) return;
    grid.innerHTML = "";
    MATERIALS.forEach(function (m, idx) {
      var card = el("div", "mat-card");
      card.innerHTML =
        '<div class="swatch" id="mat-sw-' +
        idx +
        '"></div><h4>' +
        m.name +
        "</h4><p>" +
        m.note +
        "</p>";
      grid.appendChild(card);
      fetchFashionImages(m.query, 2).then(function (imgs) {
        var sw = document.getElementById("mat-sw-" + idx);
        if (!sw || !imgs.length) return;
        sw.style.backgroundImage = "url('" + imgFromResult(imgs[0]) + "')";
      });
    });
  }

  function tickClock() {
    var node = document.getElementById("liveClock");
    if (!node) return;
    node.textContent = new Date().toLocaleString(undefined, {
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
    var active = document.querySelector(".wire-tab.active");
    fetchWire(active ? active.getAttribute("data-feed") : "guardian");
    fetchPulseLive();
  }


  function renderProCharts() {
    if (typeof Chart === "undefined") return;
    var plum = "#5d3b72";
    var rose = "#b86b8f";
    var gold = "#c4a484";
    var cobalt = "#2175a9";
    var deep = "#2a1736";
    var mint = "#2a9d8f";

    function makeBar(id, labels, data) {
      var el = document.getElementById(id);
      if (!el) return;
      new Chart(el, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: [plum, rose, cobalt, mint, gold, deep, rose, plum],
            borderWidth: 0,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: deep,
              titleFont: { family: "Inter", weight: "700" },
              bodyFont: { family: "Inter" }
            }
          },
          scales: {
            x: {
              ticks: { font: { family: "Inter", size: 10, weight: "600" }, color: "#241825" },
              grid: { display: false }
            },
            y: {
              beginAtZero: true,
              max: 100,
              ticks: { font: { family: "Inter", size: 10 }, color: "rgba(36,24,37,.5)" },
              grid: { color: "rgba(93,59,114,.12)" }
            }
          }
        }
      });
    }

    makeBar(
      "chartRegion",
      ["US", "China", "Europe", "SE Asia", "Resale", "Leather", "Outlet", "Beauty"],
      [72, 68, 38, 78, 88, 82, 65, 84]
    );
    makeBar(
      "chartCategory",
      ["Bags", "RTW", "Footwear", "Beauty", "Jewellery", "Outerwear"],
      [86, 48, 52, 80, 58, 42]
    );
  }

  function setupToTop() {
    var btn = document.getElementById("toTop");
    if (!btn) {
      btn = document.createElement("button");
      btn.id = "toTop";
      btn.type = "button";
      btn.setAttribute("aria-label", "Back to top");
      btn.innerHTML = "▲";
      document.body.appendChild(btn);
    }
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    function onScroll() {
      if (window.scrollY > 420) btn.classList.add("visible");
      else btn.classList.remove("visible");
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function init() {
    setHero();
    renderMood();
    renderSignals();
    renderBarSet("regionBars", "Regional relative strength", GROWTH_BARS);
    renderBarSet("categoryBars", "Category relative strength", CATEGORY_BARS);
    renderColourDoctrine();
    renderSeasonNotes();
    renderBrands();
    renderMarket();
    renderForecast();
    renderMaterials();
    bindWireTabs();
    fetchWire("guardian");
    fetchPulseLive();
    tickClock();
    setInterval(tickClock, 30000);
    setupToTop();
    renderProCharts();
    var btn = document.getElementById("refreshAll");
    if (btn) btn.addEventListener("click", refreshAll);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
