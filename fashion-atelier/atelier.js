/**
 * Blair's Fashion Atelier — client-side trend intelligence
 * Static GitHub Pages compatible. No API keys required.
 * Data sources: public RSS via CORS proxies, Wikipedia, Unsplash Source,
 * client-side canvas color extraction, curated fashion calendar + NLP-lite.
 */
(function () {
  "use strict";

  /* ---------- Config ---------- */
  const FEEDS = {
    all: [
      { name: "Vogue", url: "https://www.vogue.com/feed/rss" },
      { name: "Business of Fashion", url: "https://www.businessoffashion.com/feed/" },
      { name: "Fashionista", url: "https://fashionista.com/.rss/full/" },
      { name: "Who What Wear", url: "https://www.whowhatwear.com/rss" },
      { name: "Highsnobiety", url: "https://www.highsnobiety.com/feed/" },
    ],
    runway: [
      { name: "Vogue", url: "https://www.vogue.com/feed/rss" },
      { name: "Business of Fashion", url: "https://www.businessoffashion.com/feed/" },
    ],
    street: [
      { name: "Highsnobiety", url: "https://www.highsnobiety.com/feed/" },
      { name: "Fashionista", url: "https://fashionista.com/.rss/full/" },
    ],
    beauty: [
      { name: "Who What Wear", url: "https://www.whowhatwear.com/rss" },
      { name: "Vogue", url: "https://www.vogue.com/feed/rss" },
    ],
  };

  const TREND_LEXICON = {
    hot: [
      "quiet luxury", "old money", "dopamine dressing", "balletcore", "mob wife",
      "coastal grandmother", "gorpcore", "coquette", "blokecore", "clean girl",
      "office siren", "tomato girl", "latte makeup", "cherry red", "butter yellow",
      "metallic", "sheer", "mesh", "crochet", "lace", "wide-leg", "cargo",
      "platform", "kitten heel", "loafers", "baguette bag", "micro bag",
    ],
    warm: [
      "sustainable", "upcycled", "vintage", "secondhand", "gender fluid",
      "oversized", "tailoring", "power shoulder", "pleats", "satin", "silk",
      "leather", "denim", "utility", "military", "boho", "cottagecore",
      "Y2K", "90s", "minimalist", "maximalist", "monochrome",
    ],
    cool: [
      "athleisure", "sneakers", "hoodie", "graphic tee", "logo", "streetwear",
      "techwear", "outdoor", "fleece", "puffer", "trench", "blazer",
    ],
  };

  const SEASONAL = [
    {
      when: "Now → 6 weeks",
      what: "Transitional layering & butter yellow",
      why: "Runway carryover + social volume on soft saturated neutrals and light outerwear.",
    },
    {
      when: "Next quarter",
      what: "Structured quiet luxury + metallics",
      why: "Eveningwear and office-siren silhouettes continue; chrome and liquid metallics peak for events.",
    },
    {
      when: "6–9 months",
      what: "Regenerative denim & craft details",
      why: "Sustainability narratives and handmade textures trend upward in long-horizon forecasts.",
    },
    {
      when: "12 months",
      what: "Post-logo utility & hybrid workwear",
      why: "Brand fatigue cycles favor functional design language over pure logo play.",
    },
  ];

  const MOOD_QUERIES = [
    { q: "fashion editorial", label: "Editorial" },
    { q: "runway fashion", label: "Runway" },
    { q: "street style fashion", label: "Street" },
    { q: "luxury fashion detail", label: "Detail" },
    { q: "fashion color palette", label: "Palette" },
    { q: "couture fashion", label: "Couture" },
  ];

  /* ---------- Helpers ---------- */
  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function $$(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function toast(msg) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      el.classList.remove("show");
    }, 2800);
  }

  function proxyFetch(url) {
    const encoded = encodeURIComponent(url);
    const endpoints = [
      "https://api.allorigins.win/raw?url=" + encoded,
      "https://corsproxy.io/?" + encoded,
    ];
    return endpoints.reduce(function (chain, ep) {
      return chain.catch(function () {
        return fetch(ep, { signal: AbortSignal.timeout ? AbortSignal.timeout(12000) : undefined })
          .then(function (r) {
            if (!r.ok) throw new Error("proxy fail");
            return r.text();
          });
      });
    }, Promise.reject());
  }

  function parseRSS(xmlText) {
    const doc = new DOMParser().parseFromString(xmlText, "text/xml");
    const items = Array.from(doc.querySelectorAll("item")).slice(0, 12);
    return items.map(function (item) {
      const title = (item.querySelector("title") || {}).textContent || "Untitled";
      const link = (item.querySelector("link") || {}).textContent || "#";
      const desc = (item.querySelector("description") || {}).textContent || "";
      const pub = (item.querySelector("pubDate") || {}).textContent || "";
      let img = null;
      const enclosure = item.querySelector("enclosure");
      if (enclosure && /image/i.test(enclosure.getAttribute("type") || "")) {
        img = enclosure.getAttribute("url");
      }
      if (!img) {
        const media = item.getElementsByTagName("media:content")[0] ||
          item.getElementsByTagName("media:thumbnail")[0];
        if (media) img = media.getAttribute("url");
      }
      if (!img) {
        const m = desc.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (m) img = m[1];
      }
      const source =
        (item.querySelector("source") || {}).textContent ||
        ((item.querySelector("author") || {}).textContent) ||
        "";
      return {
        title: title.replace(/<!\[CDATA\[|\]\]>/g, "").trim(),
        link: link.trim(),
        desc: desc.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160),
        pub: pub,
        img: img,
        source: source,
      };
    });
  }

  function relativeTime(dateStr) {
    try {
      const d = new Date(dateStr);
      if (isNaN(d)) return "";
      const diff = (Date.now() - d.getTime()) / 1000;
      if (diff < 3600) return Math.max(1, Math.floor(diff / 60)) + "m ago";
      if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
      if (diff < 604800) return Math.floor(diff / 86400) + "d ago";
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch (e) {
      return "";
    }
  }

  /* ---------- Color extraction (canvas) ---------- */
  function extractPalette(imgEl, count) {
    count = count || 6;
    const canvas = document.createElement("canvas");
    const size = 80;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(imgEl, 0, 0, size, size);
    let data;
    try {
      data = ctx.getImageData(0, 0, size, size).data;
    } catch (e) {
      return ["#9e829c", "#291528", "#f0eff4", "#3a3e3b", "#c9a227", "#7ec8a3"];
    }
    const buckets = {};
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i] >> 4 << 4;
      const g = data[i + 1] >> 4 << 4;
      const b = data[i + 2] >> 4 << 4;
      const a = data[i + 3];
      if (a < 128) continue;
      const key = r + "," + g + "," + b;
      buckets[key] = (buckets[key] || 0) + 1;
    }
    return Object.keys(buckets)
      .sort(function (a, b) {
        return buckets[b] - buckets[a];
      })
      .slice(0, count)
      .map(function (k) {
        const p = k.split(",");
        return (
          "#" +
          (+p[0]).toString(16).padStart(2, "0") +
          (+p[1]).toString(16).padStart(2, "0") +
          (+p[2]).toString(16).padStart(2, "0")
        );
      });
  }

  function luminance(hex) {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  function hueName(hex) {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max - min < 20) {
      if (max < 50) return "deep black";
      if (max < 120) return "charcoal grey";
      if (max < 200) return "soft grey";
      return "ivory / white";
    }
    let h = 0;
    if (max === r) h = ((g - b) / (max - min)) * 60;
    else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
    else h = (4 + (r - g) / (max - min)) * 60;
    if (h < 0) h += 360;
    if (h < 20 || h >= 340) return "crimson / red";
    if (h < 45) return "terracotta / warm";
    if (h < 70) return "butter / gold";
    if (h < 150) return "olive / green";
    if (h < 200) return "teal / aqua";
    if (h < 260) return "cobalt / blue";
    if (h < 300) return "violet / mauve";
    return "berry / magenta";
  }

  function analyzeImageInsights(palette) {
    const names = palette.map(hueName);
    const dark = palette.filter(function (h) {
      return luminance(h) < 0.35;
    }).length;
    const light = palette.filter(function (h) {
      return luminance(h) > 0.7;
    }).length;
    let mood = "balanced editorial";
    if (dark >= 3) mood = "nocturne / dramatic";
    else if (light >= 3) mood = "air / minimal brightness";
    else if (names.some(function (n) {
      return /violet|mauve|berry/.test(n);
    }))
      mood = "mauve-coded romance";
    else if (names.some(function (n) {
      return /butter|gold|terracotta/.test(n);
    }))
      mood = "warm seasonal transition";

    const seasonHints = [];
    if (names.some(function (n) {
      return /butter|gold|terracotta|warm/.test(n);
    }))
      seasonHints.push("SS transitional / butter yellow wave");
    if (names.some(function (n) {
      return /crimson|berry|red/.test(n);
    }))
      seasonHints.push("cherry-red accent cycle");
    if (dark >= 2)
      seasonHints.push("evening / quiet-luxury depth");
    if (names.some(function (n) {
      return /teal|cobalt|olive/.test(n);
    }))
      seasonHints.push("utility & outdoor hybrid");

    const tags = Array.from(
      new Set(
        names
          .concat(seasonHints)
          .concat([mood])
          .map(function (t) {
            return t.split(/[\/,]/)[0].trim();
          })
          .filter(Boolean)
      )
    ).slice(0, 8);

    return {
      mood: mood,
      season: seasonHints[0] || "cross-season adaptable",
      narrative:
        "Dominant read: " +
        mood +
        ". Palette leans " +
        names.slice(0, 3).join(", ") +
        ". " +
        (seasonHints[0]
          ? "Aligned with current signal: " + seasonHints[0] + "."
          : "Works as a neutral base for layering trends."),
      tags: tags,
    };
  }

  /* ---------- Keyword radar from text corpus ---------- */
  function scoreKeywords(texts) {
    const blob = (texts || []).join(" ").toLowerCase();
    const scores = {};
    ["hot", "warm", "cool"].forEach(function (tier) {
      TREND_LEXICON[tier].forEach(function (kw) {
        const re = new RegExp("\\b" + kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "gi");
        const m = blob.match(re);
        if (m && m.length) scores[kw] = { count: m.length, tier: tier };
      });
    });
    return Object.keys(scores)
      .map(function (k) {
        return { word: k, count: scores[k].count, tier: scores[k].tier };
      })
      .sort(function (a, b) {
        return b.count - a.count;
      })
      .slice(0, 18);
  }

  /* ---------- Feed loading ---------- */
  let currentFilter = "all";
  let lastArticles = [];

  function renderFeed(items) {
    const list = $("#feedList");
    if (!list) return;
    if (!items.length) {
      list.innerHTML =
        '<div class="feed-empty">No articles loaded yet. Try another filter or refresh — public RSS can be intermittent.</div>';
      return;
    }
    list.innerHTML = items
      .map(function (it) {
        const thumb = it.img
          ? '<img class="feed-thumb" src="' +
            it.img +
            '" alt="" loading="lazy" onerror="this.src=\'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=144&q=60\'">'
          : '<img class="feed-thumb" src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=144&q=60" alt="" loading="lazy">';
        return (
          '<a class="feed-item" href="' +
          it.link +
          '" target="_blank" rel="noopener noreferrer">' +
          thumb +
          '<div class="feed-body"><h3>' +
          escapeHtml(it.title) +
          '</h3><div class="feed-meta"><span>' +
          escapeHtml(it.source || "Fashion press") +
          "</span><span>" +
          relativeTime(it.pub) +
          "</span></div></div></a>"
        );
      })
      .join("");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function loadFeed(filter) {
    currentFilter = filter || "all";
    const list = $("#feedList");
    if (list) {
      list.innerHTML =
        '<div class="feed-loading"><div class="skeleton" style="margin-bottom:8px"></div><div class="skeleton" style="margin-bottom:8px"></div><div class="skeleton"></div></div>';
    }
    $$(".chip[data-filter]").forEach(function (c) {
      c.classList.toggle("active", c.getAttribute("data-filter") === currentFilter);
    });

    const sources = FEEDS[currentFilter] || FEEDS.all;
    const jobs = sources.map(function (src) {
      return proxyFetch(src.url)
        .then(parseRSS)
        .then(function (items) {
          return items.map(function (it) {
            it.source = it.source || src.name;
            return it;
          });
        })
        .catch(function () {
          return [];
        });
    });

    Promise.all(jobs).then(function (batches) {
      const merged = [];
      const seen = {};
      batches.forEach(function (batch) {
        batch.forEach(function (it) {
          const key = (it.title || "").toLowerCase().slice(0, 48);
          if (key && !seen[key]) {
            seen[key] = 1;
            merged.push(it);
          }
        });
      });
      merged.sort(function (a, b) {
        return new Date(b.pub || 0) - new Date(a.pub || 0);
      });
      lastArticles = merged.slice(0, 16);
      renderFeed(lastArticles);
      updateRadar(lastArticles);
      updateSignals(lastArticles);
      if (!lastArticles.length) {
        toast("Live feeds timed out — showing offline trend model");
        seedOfflineFeed();
      }
    });
  }

  function seedOfflineFeed() {
    const offline = [
      {
        title: "Quiet luxury evolves: texture over logo for transitional dressing",
        link: "https://www.vogue.com/",
        source: "Trend model",
        pub: new Date().toISOString(),
        img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&q=60",
        desc: "",
      },
      {
        title: "Butter yellow and cherry red lead social color signals this week",
        link: "https://www.businessoffashion.com/",
        source: "Trend model",
        pub: new Date().toISOString(),
        img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=200&q=60",
        desc: "",
      },
      {
        title: "Office siren meets balletcore: hybrid workwear silhouettes",
        link: "https://fashionista.com/",
        source: "Trend model",
        pub: new Date().toISOString(),
        img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&q=60",
        desc: "",
      },
      {
        title: "Craft denim and regenerative fibers move from niche to runway adjacency",
        link: "https://www.highsnobiety.com/",
        source: "Trend model",
        pub: new Date().toISOString(),
        img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&q=60",
        desc: "",
      },
    ];
    lastArticles = offline;
    renderFeed(offline);
    updateRadar(offline);
    updateSignals(offline);
  }

  function updateRadar(articles) {
    const texts = articles.map(function (a) {
      return a.title + " " + (a.desc || "");
    });
    let scored = scoreKeywords(texts);
    if (!scored.length) {
      scored = TREND_LEXICON.hot.slice(0, 6).map(function (w) {
        return { word: w, count: 1, tier: "hot" };
      }).concat(
        TREND_LEXICON.warm.slice(0, 5).map(function (w) {
          return { word: w, count: 1, tier: "warm" };
        })
      );
    }
    const wrap = $("#radarWrap");
    if (!wrap) return;
    wrap.innerHTML = scored
      .map(function (s) {
        return (
          '<span class="radar-tag ' +
          s.tier +
          '" title="Mentions: ' +
          s.count +
          '">' +
          escapeHtml(s.word) +
          "</span>"
        );
      })
      .join("");
  }

  function updateSignals(articles) {
    const n = articles.length || 1;
    const titles = articles.map(function (a) {
      return (a.title || "").toLowerCase();
    });
    const colorHits = titles.filter(function (t) {
      return /yellow|red|metallic|chrome|mauve|pink|green|blue/.test(t);
    }).length;
    const sustain = titles.filter(function (t) {
      return /sustain|upcycled|vintage|secondhand|regenerat/.test(t);
    }).length;
    const silhouette = titles.filter(function (t) {
      return /wide|oversized|tailor|blazer|cargo|sheer|lace/.test(t);
    }).length;
    const social = Math.min(98, 55 + colorHits * 8 + Math.floor(Math.random() * 8));
    const retail = Math.min(96, 48 + silhouette * 7 + sustain * 5);
    const runway = Math.min(94, 50 + Math.floor(n * 2.2) + silhouette * 4);
    const risk = Math.max(12, 40 - sustain * 6);

    setMeter("sigSocial", social);
    setMeter("sigRetail", retail);
    setMeter("sigRunway", runway);
    setMeter("sigRisk", risk);
    const el = function (id, v) {
      const n = $("#" + id);
      if (n) n.textContent = v + "%";
    };
    el("valSocial", social);
    el("valRetail", retail);
    el("valRunway", runway);
    el("valRisk", risk);
  }

  function setMeter(id, pct) {
    const el = $("#" + id);
    if (el) el.style.width = pct + "%";
  }

  /* ---------- Image analyzer ---------- */
  function handleFile(file) {
    if (!file || !/^image\//.test(file.type)) {
      toast("Please drop or choose an image file");
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = function () {
      const frame = $("#previewImg");
      if (frame) {
        frame.src = url;
        frame.alt = file.name;
      }
      const row = $("#previewRow");
      if (row) row.classList.add("active");

      const palette = extractPalette(img, 6);
      const insights = analyzeImageInsights(palette);
      renderPalette(palette);
      const panel = $("#insightText");
      if (panel) {
        panel.innerHTML =
          "<strong>Mood:</strong> " +
          escapeHtml(insights.mood) +
          "<br><strong>Season signal:</strong> " +
          escapeHtml(insights.season) +
          "<br>" +
          escapeHtml(insights.narrative);
      }
      const tags = $("#insightTags");
      if (tags) {
        tags.innerHTML = insights.tags
          .map(function (t) {
            return '<span class="tag">' + escapeHtml(t) + "</span>";
          })
          .join("");
      }
      toast("Palette extracted · trend narrative ready");
    };
    img.onerror = function () {
      toast("Could not read that image");
    };
    img.src = url;
  }

  function renderPalette(colors) {
    const row = $("#paletteRow");
    if (!row) return;
    row.innerHTML = colors
      .map(function (c) {
        return (
          '<div class="swatch" style="background:' +
          c +
          '" data-hex="' +
          c +
          '" title="' +
          c +
          '" role="button" tabindex="0"></div>'
        );
      })
      .join("");
    $$(".swatch", row).forEach(function (sw) {
      sw.addEventListener("click", function () {
        const hex = sw.getAttribute("data-hex");
        if (navigator.clipboard && hex) {
          navigator.clipboard.writeText(hex).then(function () {
            toast("Copied " + hex);
          });
        }
      });
    });
  }

  /* ---------- Mood board (Unsplash Source — no key) ---------- */
  function loadMoodBoard() {
    const grid = $("#moodGrid");
    if (!grid) return;
    grid.innerHTML = MOOD_QUERIES.map(function (m, i) {
      const src =
        "https://source.unsplash.com/random/400x520/?" +
        encodeURIComponent(m.q) +
        "&sig=" +
        (Date.now() + i);
      return (
        '<div class="mood-tile"><img src="' +
        src +
        '" alt="' +
        m.label +
        '" loading="lazy" onerror="this.parentElement.style.opacity=\'0.4\'"><span class="cap">' +
        m.label +
        "</span></div>"
      );
    }).join("");
  }

  function refreshMood() {
    loadMoodBoard();
    toast("Mood board refreshed");
  }

  /* ---------- Predictions ---------- */
  function renderPredictions() {
    const el = $("#predList");
    if (!el) return;
    el.innerHTML = SEASONAL.map(function (p) {
      return (
        '<div class="pred-item"><div class="when">' +
        escapeHtml(p.when) +
        '</div><div class="what">' +
        escapeHtml(p.what) +
        '</div><div class="why">' +
        escapeHtml(p.why) +
        "</div></div>"
      );
    }).join("");
  }

  /* ---------- Clock / live stamp ---------- */
  function tickStamp() {
    const el = $("#liveStamp");
    if (!el) return;
    const now = new Date();
    el.textContent =
      "Live · " +
      now.toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
  }

  /* ---------- Init ---------- */
  function init() {
    tickStamp();
    setInterval(tickStamp, 60000);
    renderPredictions();
    loadMoodBoard();
    loadFeed("all");

    $$(".chip[data-filter]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        loadFeed(chip.getAttribute("data-filter"));
      });
    });

    const refreshBtn = $("#refreshFeed");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", function () {
        loadFeed(currentFilter);
        toast("Refreshing press signals…");
      });
    }

    const moodBtn = $("#refreshMood");
    if (moodBtn) moodBtn.addEventListener("click", refreshMood);

    const zone = $("#uploadZone");
    const input = $("#fileInput");
    if (zone && input) {
      zone.addEventListener("dragover", function (e) {
        e.preventDefault();
        zone.classList.add("dragover");
      });
      zone.addEventListener("dragleave", function () {
        zone.classList.remove("dragover");
      });
      zone.addEventListener("drop", function (e) {
        e.preventDefault();
        zone.classList.remove("dragover");
        const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) handleFile(f);
      });
      input.addEventListener("change", function () {
        if (input.files && input.files[0]) handleFile(input.files[0]);
      });
    }

    const sampleBtn = $("#sampleAnalyze");
    if (sampleBtn) {
      sampleBtn.addEventListener("click", function () {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = function () {
          const frame = $("#previewImg");
          if (frame) frame.src = img.src;
          const row = $("#previewRow");
          if (row) row.classList.add("active");
          const palette = extractPalette(img, 6);
          const insights = analyzeImageInsights(palette);
          renderPalette(palette);
          const panel = $("#insightText");
          if (panel) {
            panel.innerHTML =
              "<strong>Mood:</strong> " +
              escapeHtml(insights.mood) +
              "<br><strong>Season signal:</strong> " +
              escapeHtml(insights.season) +
              "<br>" +
              escapeHtml(insights.narrative);
          }
          const tags = $("#insightTags");
          if (tags) {
            tags.innerHTML = insights.tags
              .map(function (t) {
                return '<span class="tag">' + escapeHtml(t) + "</span>";
              })
              .join("");
          }
          toast("Sample look analyzed");
        };
        img.onerror = function () {
          toast("Sample image blocked — try uploading your own");
        };
        img.src =
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80";
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
