/* Blair's Atelier — Freedom, Beauty, Truth & Love
   Live fashion imagery (Wikipedia · Wikimedia Commons · Openverse), public fashion feeds, editorial layers.
   No credentials. */

(function () {
  "use strict";

  var OV = "https://api.openverse.org/v1/images/";
  var UA = { headers: { Accept: "application/json" } };

  /* ─── Load status & verification ─── */
  var LoadStatus = {
    wire: "pending",
    mood: "pending",
    charts: "pending",
    pulse: "pending",
    hero: "pending",
    briefs: "pending"
  };

  function setStatus(key, state) {
    LoadStatus[key] = state;
    var el = document.getElementById("systemStatus");
    if (!el) return;
    var parts = [];
    Object.keys(LoadStatus).forEach(function (k) {
      var s = LoadStatus[k];
      var mark = s === "ok" ? "●" : s === "pending" ? "○" : "◌";
      parts.push('<span class="st st-' + s + '" title="' + k + '">' + mark + " " + k + "</span>");
    });
    el.innerHTML = parts.join(" ");
  }

  function withRetry(fn, attempts, delay) {
    attempts = attempts || 2;
    delay = delay || 900;
    return fn().catch(function (err) {
      if (attempts <= 1) throw err;
      return new Promise(function (resolve) {
        setTimeout(resolve, delay);
      }).then(function () {
        return withRetry(fn, attempts - 1, delay * 1.4);
      });
    });
  }

  function verifyImage(url) {
    return new Promise(function (resolve, reject) {
      if (!url) return reject();
      var img = new Image();
      img.onload = function () {
        if (img.naturalWidth > 0) resolve(url);
        else reject();
      };
      img.onerror = reject;
      img.referrerPolicy = "no-referrer";
      img.src = url;
    });
  }


  // Highest-signal houses only: the maisons with the most attention, the deepest Las Vegas presence,
  // and the strongest runway documentation on open image libraries.
  var FASHION_QUERIES = [
    "Louis Vuitton fashion show runway",
    "Chanel haute couture runway",
    "Dior haute couture runway",
    "Hermès runway fashion show",
    "Gucci runway fashion show",
    "Prada runway Milan fashion week",
    "Saint Laurent runway Paris fashion week",
    "Bottega Veneta runway",
    "Miu Miu runway Paris",
    "Loewe runway Paris fashion week",
    "Celine runway Paris",
    "Fendi runway Milan",
    "Valentino couture runway",
    "Balenciaga runway Paris",
    "Cartier high jewellery",
    "Tiffany & Co. jewelry"
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
      label: "Global icons · couture & leather goods",
      title: "The heritage leaders",
      items: [
        ["Louis Vuitton", "Leather goods · travel · global retail"],
        ["Chanel", "House codes · couture · accessories"],
        ["Hermès", "Craft · scarcity · enduring desirability"],
        ["Dior", "Couture heritage · beauty · client experience"],
        ["Gucci", "Italian codes · cultural relevance"],
        ["Prada", "Intellectual design · retail innovation"],
        ["Saint Laurent", "Modern Parisian codes · accessories"],
        ["Fendi", "Roman craft · leather goods"]
      ]
    },
    {
      label: "High desirability · luxury fashion",
      title: "The influential houses",
      items: [
        ["Bottega Veneta", "Material intelligence · intrecciato craft"],
        ["Loewe", "Leather craft · art and design"],
        ["Miu Miu", "Youth culture · high fashion momentum"],
        ["Celine", "Parisian minimalism · leather goods"],
        ["Valentino", "Couture romance · colour"],
        ["Balenciaga", "Fashion experimentation · silhouette"],
        ["The Row", "Discretion · exceptional materials"],
        ["Loro Piana", "Textile excellence · quiet luxury"],
        ["Brunello Cucinelli", "Italian craft · refined lifestyle"]
      ]
    },
    {
      label: "Jewellery · watches · performance luxury",
      title: "The wider luxury ecosystem",
      items: [
        ["Cartier", "Fine jewellery · watchmaking"],
        ["Tiffany & Co.", "American luxury jewellery"],
        ["Van Cleef & Arpels", "High jewellery · poetic codes"],
        ["Bulgari", "Roman jewellery · hospitality"],
        ["Rolex", "Watchmaking · enduring brand equity"],
        ["Audemars Piguet", "Haute horlogerie · Royal Oak"],
        ["Moncler", "Performance luxury · outerwear"]
      ]
    }
  ];

  var MARKET_PRIMARY = {
    kicker: "2026 market reading · editorial analysis",
    title: "Desirability, value and client trust",
    body: "Luxury is navigating a more selective demand environment: headline brand power alone is not a guarantee of growth. The strategic questions are how each house protects desirability, demonstrates craft and value, localises client experience, and converts cultural relevance into full-price demand. This dashboard separates editorial interpretation from reported facts; indicators are directional hypotheses for discussion, not audited forecasts or financial advice.",
    stats: [
      { value: "Desirability", label: "Brand priority" },
      { value: "Client trust", label: "Experience priority" },
      { value: "Evidence-led", label: "Decision standard" }
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
      query: "Valentino couture red dress runway",
      horizon: "6–9 months",
      title: "Colour doctrine & the hand",
      body: "Saturated blocks — red, turquoise, cobalt, gold — paired with visible artisanal detail. Colour and the hand become the primary differentiators after a quieter, more muted cycle."
    },
    {
      query: "Chanel couture summer layering",
      horizon: "9–14 months",
      title: "Climate-adapted construction",
      body: "Second-skin fabrics, airy layering and reduced bulk that honour formality while answering extended warmth — a construction language for maison and elevated diffusion alike."
    },
    {
      query: "Hermès archive luxury fashion",
      horizon: "12–18 months",
      title: "Collector wardrobe logic",
      body: "Fewer, more singular pieces: rare hardware, archive conversation, limited fabrication. The long wardrobe replaces pure seasonal replenishment from full-price to elevated outlet discovery."
    }
  ];

  var MATERIALS = [
    { query: "silk couture fabric Hermès Chanel", name: "Fluid silks & georgette", note: "Movement, transparency, evening weight" },
    { query: "Valentino couture lace dress", name: "Technical lace", note: "Structure meeting delicacy" },
    { query: "Dior wool couture textile", name: "Lightweight wool crepe", note: "Transitional authority" },
    { query: "Bottega Veneta knitwear runway", name: "Sculptural knitwear", note: "Precision and volume" },
    { query: "Hermès Birkin leather handbag", name: "Supple nappa & suede", note: "Hand-feel as argument" },
    { query: "Loro Piana luxury cotton fabric", name: "High-twist cotton", note: "Crisp seasonal layers" }
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

  // Multi-source, no-key image discovery. Openverse is primary; Wikimedia Commons
  // is an independent fallback. Actual image elements also retry on load errors.
  function isLogoLike(s) {
    return /logo|wordmark|icon|flag|coat of arms|\.svg|map of|diagram|screenshot|signature/i.test(String(s || ""));
  }

  // Quality-first image search. Wikimedia Commons (documented runway/retail photography, size-filtered),
  // then Openverse, then Wikipedia lead images. Every URL is later load-tested by the caller.
  function fetchFashionImages(query, count) {
    count = count || 1;
    var commons = function () {
      var url = "https://commons.wikimedia.org/w/api.php?action=query&generator=search" +
        "&gsrsearch=" + encodeURIComponent(query + " filetype:bitmap -logo") +
        "&gsrnamespace=6&gsrlimit=" + Math.min(count + 14, 30) +
        "&prop=imageinfo&iiprop=url%7Csize%7Cextmetadata&iiurlwidth=1280&format=json&origin=*";
      return fetch(url, UA).then(function (r) {
        if (!r.ok) throw new Error("Wikimedia " + r.status);
        return r.json();
      }).then(function (data) {
        return Object.keys((data && data.query && data.query.pages) || {}).map(function (key) {
          var page = data.query.pages[key], info = page.imageinfo && page.imageinfo[0];
          if (!info || !(info.thumburl || info.url)) return null;
          if ((info.width || 0) < 1000 || (info.height || 0) < 700) return null;
          if (isLogoLike(page.title)) return null;
          var meta = info.extmetadata || {};
          return { id: "wc-" + page.pageid, url: info.thumburl || info.url,
            fullUrl: info.url, title: (page.title || "Fashion reference").replace(/^File:/, ""),
            creator: stripHtml((meta.Artist && meta.Artist.value) || ""),
            provider: "Wikimedia Commons",
            license: stripHtml((meta.LicenseShortName && meta.LicenseShortName.value) || ""),
            source: "https://commons.wikimedia.org/?curid=" + page.pageid };
        }).filter(Boolean);
      });
    };
    var openverse = function () {
      var url = OV + "?q=" + encodeURIComponent(query) +
        "&page_size=" + Math.min(count + 10, 20) + "&mature=false&category=photograph&aspect_ratio=wide,tall";
      return fetch(url, UA).then(function (r) {
        if (!r.ok) throw new Error("Openverse " + r.status);
        return r.json();
      }).then(function (data) {
        return ((data && data.results) || []).filter(function (img) {
          return img && (img.url || img.thumbnail) && !img.mature && (img.width || 1200) >= 800 && !isLogoLike(img.title);
        }).map(function (img) {
          return { id: "ov-" + (img.id || img.url), url: img.thumbnail || img.url,
            fullUrl: img.url, title: img.title || "Fashion image",
            creator: img.creator || "", provider: "Openverse",
            license: img.license || "", source: img.foreign_landing_url || img.url };
        });
      });
    };
    var wikipedia = function () {
      var url = "https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=" +
        encodeURIComponent(query) + "&gsrlimit=8&prop=pageimages&piprop=thumbnail&pithumbsize=1200&format=json&origin=*";
      return fetch(url, UA).then(function (r) {
        if (!r.ok) throw new Error("Wikipedia " + r.status);
        return r.json();
      }).then(function (data) {
        return Object.keys((data && data.query && data.query.pages) || {}).map(function (key) {
          var p = data.query.pages[key];
          if (!p.thumbnail || isLogoLike(p.thumbnail.source)) return null;
          return { id: "wp-" + p.pageid, url: p.thumbnail.source, fullUrl: p.thumbnail.source,
            title: p.title, creator: "", provider: "Wikipedia", license: "See article",
            source: "https://en.wikipedia.org/?curid=" + p.pageid };
        }).filter(Boolean);
      });
    };
    function dedupe(rows) {
      var seen = {};
      return rows.filter(function (img) {
        if (!img || !img.url || seen[img.id]) return false;
        seen[img.id] = true; return true;
      });
    }
    var out = [];
    return withRetry(commons, 2, 500).catch(function () { return []; }).then(function (rows) {
      out = out.concat(rows);
      if (dedupe(out).length >= count + 2) return;
      return withRetry(openverse, 2, 500).catch(function () { return []; }).then(function (more) { out = out.concat(more); });
    }).then(function () {
      if (dedupe(out).length >= count) return;
      return wikipedia().catch(function () { return []; }).then(function (more) { out = out.concat(more); });
    }).then(function () { return dedupe(out); });
  }

  function fashionFallbackSvg(label) {
    var safe = String(label || "Atelier").replace(/[&<>"]/g, "");
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#170e20"/><stop offset=".52" stop-color="#5d3b72"/><stop offset="1" stop-color="#c4a484"/></linearGradient>' +
      '<radialGradient id="r"><stop stop-color="#ef4f9a" stop-opacity=".65"/><stop offset="1" stop-color="#170e20" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="1200" height="900" fill="url(#g)"/><circle cx="930" cy="180" r="390" fill="url(#r)"/>' +
      '<path d="M380 900 L510 220 Q600 150 690 220 L820 900" fill="none" stroke="#f5f0eb" stroke-opacity=".65" stroke-width="3"/>' +
      '<path d="M470 430 Q600 510 730 430 M440 580 Q600 680 760 580" fill="none" stroke="#ffd28f" stroke-opacity=".8" stroke-width="2"/>' +
      (safe && safe !== "Editorial cover" ? '<text x="72" y="812" fill="#f5f0eb" font-family="Georgia,serif" font-size="30" letter-spacing="4">' + safe.slice(0,48).toUpperCase() + '</text>' : '') + '</svg>';
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  }

  function attachImageRecovery(image, results, label) {
    var candidates = (results || []).map(imgFromResult).filter(Boolean);
    var index = 0, done = false;
    function next() {
      if (done) return;
      if (index >= candidates.length) {
        done = true;
        image.onerror = null;
        image.src = fashionFallbackSvg(label);
        image.classList.add("image-fallback");
        return;
      }
      image.src = candidates[index++];
    }
    image.onerror = next;
    image.onload = function () { image.classList.remove("image-fallback"); };
    next();
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

  var heroRotationTimer = null;
  function setHero() {
    var bg = document.getElementById("heroBg");
    if (!bg) return;
    var queryIndex = 0, candidates = [], active = 0;
    var queries = [
      "Chanel Dior Hermès haute couture runway",
      "Louis Vuitton runway fashion show",
      "Prada Gucci Saint Laurent fashion runway",
      "luxury fashion atelier embroidery craftsmanship",
      "luxury fashion flagship architecture Paris Milan"
    ];
    function showNext() {
      if (!candidates.length) return;
      var attempts = candidates.length, url = "";
      function tryCandidate() {
        if (!attempts--) {
          bg.style.backgroundImage = "url(\"" + fashionFallbackSvg("Editorial cover") + "\")";
          bg.style.backgroundSize = "cover";
          bg.style.backgroundPosition = "center";
          setStatus("hero", "fallback");
          return;
        }
        url = candidates[(active++) % candidates.length];
        verifyImage(url).then(function () {
          bg.style.backgroundImage = "url('" + url.replace(/'/g, "%27") + "')";
          setStatus("hero", "ok");
        }).catch(tryCandidate);
      }
      tryCandidate();
    }
    function loadNextQuery() {
      if (queryIndex >= queries.length) {
        if (candidates.length) showNext();
        else { bg.style.backgroundImage = "url(\"" + fashionFallbackSvg("Editorial cover") + "\")"; bg.style.backgroundSize = "cover"; bg.style.backgroundPosition = "center"; setStatus("hero", "fallback"); }
        return;
      }
      fetchFashionImages(queries[queryIndex++], 6).then(function (imgs) {
        imgs.forEach(function (img) { var u = imgFromResult(img); if (u && candidates.indexOf(u) < 0) candidates.push(u); });
        if (candidates.length >= 5) showNext();
        else loadNextQuery();
      }).catch(loadNextQuery);
    }
    loadNextQuery();
    // Editorial cover rotates through verified images without stacking timers on refresh.
    if (heroRotationTimer) window.clearInterval(heroRotationTimer);
    heroRotationTimer = window.setInterval(function () { if (candidates.length > 1) showNext(); }, 14000);
  }

  function renderMood() {
    var grid = document.getElementById("moodGrid");
    if (!grid) return;
    grid.innerHTML = "";
    for (var i = 0; i < 12; i++) {
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
      grid.innerHTML = "";
      if (!pool.length) {
        setStatus("mood", "fallback");
        pool = FASHION_QUERIES.map(function (q, qi) { return { id: "fb-" + qi, url: "", title: q.replace(/ (runway|fashion show|haute couture|high jewellery|jewelry|Milan fashion week|Paris fashion week|Paris|Milan|couture).*$/i, "") }; });
      } else {
        setStatus("mood", "ok");
      }
      for (var j = 0; j < 12; j++) {
        var img = pool[j % pool.length];
        var cell = el("div", "mood-cell");
        var image = document.createElement("img");
        image.alt = attribution(img) || MOOD_CAPTIONS[j] || "Luxury fashion editorial";
        image.loading = "lazy";
        image.decoding = "async";
        image.referrerPolicy = "no-referrer";
        attachImageRecovery(image, pool.slice((j + 1) % pool.length).concat([img]), MOOD_CAPTIONS[j] || "Luxury fashion");
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
    grid.innerHTML = '<div class="wire-loading">Loading industry feeds…</div>';
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
        setStatus("wire", "ok");
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
            setStatus("wire", "ok");
          })
          .catch(function () {
            var g = "https://content.guardianapis.com/search?section=fashion&order-by=newest&page-size=9&show-fields=trailText&api-key=test";
            return fetch(g).then(function (r) { if (!r.ok) throw new Error("guardian"); return r.json(); }).then(function (data) {
              var rows = (data && data.response && data.response.results) || [];
              if (!rows.length) throw new Error("empty3");
              grid.innerHTML = "";
              rows.forEach(function (item) {
                var card = el("article", "wire-card");
                var desc = stripHtml((item.fields && item.fields.trailText) || "").slice(0, 140);
                card.innerHTML = '<div class="source">Guardian Fashion</div><h3><a href="' + item.webUrl + '" target="_blank" rel="noopener">' + stripHtml(item.webTitle) + "</a></h3>" +
                  (desc ? '<p class="snippet">' + desc + "</p>" : "") + '<div class="meta">' + (formatDate(item.webPublicationDate) || "Recent") + "</div>";
                grid.appendChild(card);
              });
              if (status) status.textContent = "Live";
              setStatus("wire", "ok");
            }).catch(function () {
              setStatus("wire", "fail");
              grid.innerHTML = '<div class="wire-empty">Industry wire is temporarily unreachable from this network. Everything else on the page stays live. Try Refresh.</div>';
              if (status) status.textContent = "Offline";
            });
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
    // Populated by atelier-pro.js from the Wikimedia attention index (see #trending).
    if (window.AtelierPro && window.AtelierPro.renderPulse) window.AtelierPro.renderPulse();
    setStatus("pulse", "ok");
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

  // Locations are ordered with Blair's Las Vegas home market first. Image queries are
  // deliberately destination-specific; generic fashion photos are not used as place proof.
  var LUXURY_LOCATIONS = [
    {region:"Las Vegas",priority:true,name:"The Shops at Crystals",city:"Las Vegas · CityCenter / ARIA",desc:"The Strip's ultra-luxury centre: more than 50 brands, including flagship stores and what the centre describes as the largest Louis Vuitton in North America. Architecture by Studio Libeskind and Rockwell Group.",brands:"Louis Vuitton · Gucci · Prada · Celine · Fendi · Tiffany & Co. · Loewe",tags:["Ultra-luxury flagships","Maison retail","Architecture"],map:"The Shops at Crystals Las Vegas",source:"https://www.simon.com/mall/the-shops-at-crystals",sourceLabel:"Simon · official centre",wiki:["Crystals (Las Vegas)","Crystals at CityCenter","CityCenter"],imageQueries:["Crystals CityCenter Las Vegas shopping","Crystals Las Vegas Libeskind architecture"]},
    {region:"Las Vegas",priority:true,name:"Via Bellagio",city:"Las Vegas · Bellagio Resort",desc:"A compact promenade of ultra-luxury names on the Bellagio's main floor, paired with the resort's art, fountains and high-touch guest journey.",brands:"Chanel · Hermès · Louis Vuitton · Dior · Gucci · Prada · Fendi · Bottega Veneta · Saint Laurent · Tiffany & Co.",tags:["Luxury promenade","Clienteling","Resort experience"],map:"Via Bellagio Las Vegas",source:"https://bellagio.mgmresorts.com/en/shopping.html",sourceLabel:"Bellagio resort",wiki:["Bellagio (resort)","Via Bellagio"],imageQueries:["Bellagio Las Vegas resort exterior","Bellagio Las Vegas fountains"]},
    {region:"Las Vegas",priority:true,name:"Wynn & Encore Esplanades",city:"Las Vegas · Wynn / Encore",desc:"A resort-led luxury corridor where individually designed boutiques, fine watches and private appointments meet a premium hospitality environment. Wynn Plaza adds a second, more contemporary tier along the Strip.",brands:"Chanel · Hermès · Louis Vuitton · Dior · Cartier · Rolex · Van Cleef & Arpels · Loewe · Celine · Saint Laurent",tags:["Resort luxury","Fine watches","Service design"],map:"Wynn Esplanade Las Vegas",source:"https://www.wynnlasvegas.com/shopping",sourceLabel:"Wynn shopping",wiki:["Wynn Las Vegas","Encore Las Vegas"],imageQueries:["Wynn Las Vegas resort exterior","Wynn Las Vegas Esplanade"]},
    {region:"Las Vegas",priority:true,name:"Forum Shops at Caesars Palace",city:"Las Vegas · Caesars Palace",desc:"A landmark of experiential retail with theatrical architecture and some of the highest sales per square foot in US retail. Anchors the Strip's jewellery and watch register alongside separate Louis Vuitton men's and women's boutiques.",brands:"Louis Vuitton · Dior · Gucci · Cartier · Van Cleef & Arpels · Tiffany & Co. · Rolex · Christian Louboutin",tags:["Experiential retail","Visitor economy","Retail theatre"],map:"The Forum Shops at Caesars Palace Las Vegas",source:"https://www.simon.com/mall/the-forum-shops-at-caesars-palace",sourceLabel:"Simon · official centre",wiki:["Forum Shops at Caesars","The Forum Shops at Caesars","Caesars Palace"],imageQueries:["Forum Shops Caesars Palace Las Vegas","Caesars Palace Las Vegas Forum Shops interior"]},
    {region:"Las Vegas",priority:true,name:"Louis Vuitton · Crystals",city:"Las Vegas · The Shops at Crystals",desc:"A brand-specific lens on travel heritage, leather-goods merchandising, iconic product architecture and premium client journeys.",brands:"Louis Vuitton",tags:["Leather goods","Travel heritage","Flagship merchandising"],map:"Louis Vuitton The Shops at Crystals Las Vegas",source:"https://us.louisvuitton.com/eng-us/stores/usa/nevada",sourceLabel:"Louis Vuitton store finder",wiki:["Louis Vuitton"],imageQueries:["Louis Vuitton store Las Vegas","Louis Vuitton flagship storefront"]},
    {region:"Las Vegas",priority:true,name:"Hermès · Bellagio",city:"Las Vegas · Via Bellagio",desc:"An ultra-luxury reference for craft, leather goods, silk, equestrian heritage and relationship-led service in a resort setting.",brands:"Hermès",tags:["Artisan craft","Leather & silk","Client relationship"],map:"Hermes Bellagio Las Vegas",source:"https://www.hermes.com/us/en/find-a-store/",sourceLabel:"Hermès store finder",wiki:["Hermès"],imageQueries:["Hermès boutique storefront","Hermès Faubourg Saint-Honoré"]},
    {region:"Las Vegas",priority:true,name:"Gucci · Crystals",city:"Las Vegas · The Shops at Crystals",desc:"A case study in Italian house codes, cultural visibility, accessories and the balance between heritage and contemporary fashion expression.",brands:"Gucci",tags:["Italian house codes","Accessories","Cultural relevance"],map:"Gucci The Shops at Crystals Las Vegas",source:"https://www.gucci.com/us/en/store",sourceLabel:"Gucci store locator",wiki:["Gucci"],imageQueries:["Gucci store storefront","Gucci boutique Milan"]},
    {region:"Las Vegas",priority:true,name:"Fashion Show Las Vegas",city:"Las Vegas · North Strip",desc:"A broad fashion-retail counterpoint to the Strip's ultra-luxury enclaves, with a department-store mix useful for comparing premium positioning and visitor segmentation.",brands:"Saks Fifth Avenue · Neiman Marcus · Nordstrom · Macy's",tags:["Market comparison","Retail mix","Tourism"],map:"Fashion Show Las Vegas",source:"https://www.thefashionshow.com/",sourceLabel:"Official centre",wiki:["Fashion Show Mall","Fashion Show (mall)"],imageQueries:["Fashion Show Mall Las Vegas","Fashion Show Las Vegas Strip"]},
    {region:"Europe",name:"Via Montenapoleone",city:"Milan · Quadrilatero della Moda",desc:"One of the defining luxury shopping streets for Italian craft, global maisons, flagship design and fashion-week retail signals.",brands:"Prada · Bottega Veneta · Giorgio Armani · Versace · Loro Piana",tags:["Fashion capital","Italian craft","Flagships"],map:"Via Montenapoleone Milan luxury boutiques",source:"https://montenapoleonedistrict.it/en/",sourceLabel:"District association",imageQueries:["Via Montenapoleone Milan luxury fashion street boutiques","Quadrilatero della Moda Milan flagship luxury storefronts"]},
    {region:"Europe",name:"Avenue Montaigne",city:"Paris · Triangle d’Or",desc:"A signature couture corridor for maison heritage, runway-to-retail storytelling, luxury window design and high-value client journeys.",brands:"Dior · Chanel · Louis Vuitton · Saint Laurent · Valentino",tags:["Couture heritage","Maison codes","Paris"],map:"Avenue Montaigne Paris couture luxury fashion",source:"https://parisjetaime.com/eng/",sourceLabel:"Paris tourism",imageQueries:["Avenue Montaigne Paris luxury fashion boutiques Dior","Avenue Montaigne Paris haute couture flagship storefronts"]},
    {region:"Europe",name:"Rue du Faubourg Saint-Honoré",city:"Paris · 8th arrondissement",desc:"An iconic heritage corridor for discreet luxury, historic maisons, art adjacency and the value of a consistent house identity.",brands:"Hermès · Lanvin · luxury maisons and galleries",tags:["Heritage","Art adjacency","Paris"],map:"Rue du Faubourg Saint-Honoré Paris luxury boutiques",source:"https://parisjetaime.com/eng/",sourceLabel:"Paris tourism",imageQueries:["Rue du Faubourg Saint-Honoré Paris Hermès luxury street","Faubourg Saint Honore Paris luxury boutiques architecture"]},
    {region:"Europe",name:"New Bond Street",city:"London · Mayfair",desc:"A globally recognised luxury street connecting designer fashion, fine jewellery, watches, art and auction-house adjacency.",brands:"Chanel · Dior · Louis Vuitton · Cartier · Rolex",tags:["Luxury street","Fine jewellery","Mayfair"],map:"New Bond Street London luxury shops",source:"https://www.visitlondon.com/things-to-do/place/7883674-bond-street",sourceLabel:"Visit London",imageQueries:["New Bond Street London luxury fashion storefronts","Bond Street London luxury boutiques architecture"]},
    {region:"Global",name:"Fifth Avenue",city:"New York · Manhattan",desc:"A benchmark for global flagship strategy, luxury department stores, tourism and high-street brand theatre.",brands:"Louis Vuitton · Gucci · Tiffany & Co. · Saks Fifth Avenue",tags:["Flagship strategy","Tourism","Retail economics"],map:"Fifth Avenue New York luxury shopping flagship stores",source:"https://www.nyctourism.com/",sourceLabel:"NYC tourism",imageQueries:["Fifth Avenue New York luxury flagship storefronts Tiffany Louis Vuitton","Fifth Avenue Manhattan luxury shopping architecture"]},
    {region:"Global",name:"Rodeo Drive",city:"Beverly Hills · Los Angeles",desc:"A globally legible luxury destination where brand theatre, destination marketing, private-client service and fashion visibility converge.",brands:"Chanel · Dior · Gucci · Prada · Hermès",tags:["Brand theatre","Clienteling","Destination retail"],map:"Rodeo Drive Beverly Hills luxury boutiques",source:"https://www.rodeodrive-bh.com/",sourceLabel:"Rodeo Drive",imageQueries:["Rodeo Drive Beverly Hills luxury storefronts palm trees","Rodeo Drive luxury fashion boutiques Beverly Hills architecture"]},
    {region:"Global",name:"Ginza",city:"Tokyo · Chūō",desc:"A premium retail district for observing Japanese service culture, refined presentation, beauty, watches and international maisons.",brands:"Chanel · Dior · Louis Vuitton · Ginza Six luxury houses",tags:["Service culture","Beauty & watches","Tokyo"],map:"Ginza Tokyo luxury fashion flagship stores",source:"https://www.gotokyo.org/en/",sourceLabel:"Tokyo tourism",imageQueries:["Ginza Tokyo luxury fashion flagship storefronts","Ginza Tokyo luxury shopping street architecture at night"]},
    {region:"Global",name:"Dubai Mall · Fashion Avenue",city:"Dubai · Downtown",desc:"A major international luxury retail destination where global tourism, hospitality, couture maisons and multi-category shopping intersect.",brands:"Chanel · Dior · Louis Vuitton · Cartier · regional luxury retail",tags:["Global clients","Luxury ecosystem","Tourism"],map:"Dubai Mall Fashion Avenue luxury stores",source:"https://thedubaimall.com/",sourceLabel:"Dubai Mall",imageQueries:["Dubai Mall Fashion Avenue luxury fashion retail interior","Dubai Mall Fashion Avenue designer boutiques architecture"]}
  ];

  function renderLuxuryLocations(filter) {
    var host = document.getElementById("luxuryLocations");
    if (!host) return;
    filter = filter || "Las Vegas";
    host.innerHTML = "";
    LUXURY_LOCATIONS.filter(function (item) { return filter === "all" || item.region === filter; }).forEach(function (item) {
      var card = el("article", "location-card" + (item.priority ? " vegas-priority" : ""));
      card.setAttribute("data-location-name", item.name);
      var tags = item.tags.map(function (tag) { return "<span>" + tag + "</span>"; }).join("");
      var mapUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(item.map);
      var priority = item.priority ? '<span class="location-priority">LAS VEGAS HOME MARKET</span>' : '';
      card.innerHTML = '<div class="location-art" data-location-art="' + item.name.replace(/&/g,"&amp;").replace(/"/g,"&quot;") + '">' + priority + '<span class="location-art-title">' + item.name + '</span><small class="location-image-credit">Searching destination imagery…</small></div><div class="location-body"><h3>' + item.city + '</h3><p>' + item.desc + '</p><p class="location-brands"><strong>Maison focus:</strong> ' + item.brands + '</p><div class="location-tags">' + tags + '</div><div class="location-links"><a href="' + mapUrl + '" target="_blank" rel="noopener">Explore map ↗</a><a href="' + item.source + '" target="_blank" rel="noopener">' + item.sourceLabel + ' ↗</a></div></div>';
      host.appendChild(card);
    });
  }

  function bindLocationFilters() {
    var buttons = document.querySelectorAll("[data-location-filter]");
    Array.prototype.forEach.call(buttons, function (button) {
      button.addEventListener("click", function () {
        Array.prototype.forEach.call(buttons, function (b) { b.classList.toggle("active", b === button); });
        renderLuxuryLocations(button.getAttribute("data-location-filter"));
        loadLocationPhotography();
      });
    });
  }

  // Open, no-key sources: Wikimedia Commons (imageinfo + licence metadata) first,
  // then Openverse. Per-place queries prevent a random runway image being presented
  // as if it depicts a real retail destination. Each selected image is load-tested.
  function searchCommonsLocation(query, limit) {
    var url = "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=" +
      encodeURIComponent(query) + "&gsrnamespace=6&gsrlimit=" + (limit || 8) +
      "&prop=imageinfo&iiprop=url%7Csize%7Cextmetadata&iiurlwidth=1280&format=json&origin=*";
    return fetch(url, UA).then(function (r) { if (!r.ok) throw new Error("Commons " + r.status); return r.json(); })
      .then(function (data) {
        return Object.keys((data && data.query && data.query.pages) || {}).map(function (key) {
          var page = data.query.pages[key], info = page.imageinfo && page.imageinfo[0];
          if (!info || !(info.thumburl || info.url)) return null;
          if ((info.width || 0) && (info.width < 900)) return null;
          var meta = info.extmetadata || {};
          var title = (page.title || "").replace(/^File:/, "").replace(/_/g, " ");
          return { url: info.thumburl || info.url, title: title, provider: "Wikimedia Commons",
            source: "https://commons.wikimedia.org/?curid=" + page.pageid,
            license: stripHtml((meta.LicenseShortName && meta.LicenseShortName.value) || "License details"),
            creator: stripHtml((meta.Artist && meta.Artist.value) || "") };
        }).filter(Boolean);
      });
  }

  function searchOpenverseLocation(query, limit) {
    var url = OV + "?q=" + encodeURIComponent(query) + "&page_size=" + (limit || 12) + "&mature=false";
    return fetch(url, UA).then(function (r) { if (!r.ok) throw new Error("Openverse " + r.status); return r.json(); })
      .then(function (data) {
        return ((data && data.results) || []).filter(function (img) { return img && (img.thumbnail || img.url) && !img.mature; })
          .map(function (img) { return { url: img.thumbnail || img.url, title: img.title || "Luxury retail image", provider: "Openverse", source: img.foreign_landing_url || img.url, license: img.license || "Check source licence", creator: img.creator || "" }; });
      });
  }

  function locationRelevantCandidates(candidates, item) {
    var stop = {the:1,shops:1,shop:1,at:1,and:1,street:1,fashion:1,luxury:1,mall:1,avenue:1,rue:1,du:1,de:1,la:1,le:1,global:1,city:1,las:1,vegas:1,store:1,stores:1,boutique:1,boutiques:1,drive:1};
    var words = String(item.name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/[^a-z0-9]+/).filter(function (word) { return word.length >= 4 && !stop[word]; });
    var phrase = String(item.name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
    return (candidates || []).filter(function (candidate) {
      var haystack = (String(candidate.title || "") + " " + String(candidate.source || "")).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ");
      if (phrase && phrase.length > 7 && haystack.indexOf(phrase) >= 0) return true;
      return words.some(function (word) { return haystack.indexOf(word) >= 0; });
    });
  }

  function upscaleWikiThumb(src) {
    return String(src || "").replace(/\/(\d+)px-/, "/1280px-");
  }

  function wikiLeadImage(title) {
    var url = "https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(String(title).replace(/ /g, "_"));
    return fetch(url, UA).then(function (r) { if (!r.ok) throw new Error("wiki"); return r.json(); }).then(function (d) {
      var src = (d.thumbnail && d.thumbnail.source) || (d.originalimage && d.originalimage.source) || "";
      if (!src || isLogoLike(src)) throw new Error("no image");
      return { url: upscaleWikiThumb(src), title: d.title || title, provider: "Wikipedia", license: "See article",
        source: (d.content_urls && d.content_urls.desktop && d.content_urls.desktop.page) || ("https://en.wikipedia.org/wiki/" + encodeURIComponent(title)) };
    });
  }

  function paintLocationArt(art, credit, found, url) {
    art.style.backgroundImage = "linear-gradient(0deg,rgba(20,12,27,.82),rgba(20,12,27,.06)),url(\"" + url.replace(/\\/g, "\\\\").replace(/"/g, "%22") + "\")";
    art.style.backgroundSize = "cover"; art.style.backgroundPosition = "center";
    art.classList.add("location-photo-loaded");
    if (credit) {
      credit.innerHTML = '<a href="' + String(found.source || "#").replace(/"/g, "&quot;") + '" target="_blank" rel="noopener">' + (found.provider || "Image source") + " · " + (found.license || "check licence") + " ↗</a>";
    }
  }

  function loadLocationPhotography() {
    var cards = Array.prototype.slice.call(document.querySelectorAll("#luxuryLocations .location-card"));
    if (!cards.length) return Promise.resolve();
    var cursor = 0, concurrency = 4;
    function fallback(art, credit, item) {
      if (credit) credit.textContent = "Atelier-designed artwork · destination links below";
      art.style.backgroundImage = "linear-gradient(0deg,rgba(20,12,27,.82),rgba(20,12,27,.16)),url(\"" + fashionFallbackSvg(item.name) + "\")";
      art.style.backgroundSize = "cover"; art.style.backgroundPosition = "center";
    }
    // Designed artwork first so no card is ever empty; real photography replaces it when verified.
    cards.forEach(function (card) {
      var item = LUXURY_LOCATIONS.find(function (loc) { return loc.name === card.getAttribute("data-location-name"); });
      if (item) fallback(card.querySelector(".location-art"), card.querySelector(".location-image-credit"), item);
    });
    function tryWiki(titles, i) {
      if (i >= titles.length) return Promise.reject();
      return wikiLeadImage(titles[i]).then(function (found) {
        return verifyImage(found.url).then(function (u) { return { found: found, url: u }; });
      }).catch(function () { return tryWiki(titles, i + 1); });
    }
    function tryGeneric(item) {
      var queries = item.imageQueries || [item.name + " luxury retail"];
      function nextQuery(qi) {
        if (qi >= queries.length) return Promise.reject();
        return searchCommonsLocation(queries[qi], 8).catch(function () { return []; }).then(function (rows) {
          rows = rows.filter(function (r) { return !isLogoLike(r.title); });
          return rows.reduce(function (p, cand) {
            return p.catch(function () { return verifyImage(cand.url).then(function (u) { return { found: cand, url: u }; }); });
          }, Promise.reject());
        }).catch(function () {
          return searchOpenverseLocation(queries[qi], 10).catch(function () { return []; }).then(function (rows) {
            return rows.reduce(function (p, cand) {
              return p.catch(function () { return verifyImage(cand.url).then(function (u) { return { found: cand, url: u }; }); });
            }, Promise.reject());
          });
        }).catch(function () { return nextQuery(qi + 1); });
      }
      return nextQuery(0);
    }
    function worker() {
      if (cursor >= cards.length) return Promise.resolve();
      var card = cards[cursor++];
      var item = LUXURY_LOCATIONS.find(function (loc) { return loc.name === card.getAttribute("data-location-name"); });
      if (!item) return worker();
      var art = card.querySelector(".location-art"), credit = card.querySelector(".location-image-credit");
      var chain = item.wiki && item.wiki.length ? tryWiki(item.wiki, 0).catch(function () { return tryGeneric(item); }) : tryGeneric(item);
      return chain.then(function (r) { paintLocationArt(art, credit, r.found, r.url); }).catch(function () {}).then(worker);
    }
    var workers = [];
    for (var n = 0; n < Math.min(concurrency, cards.length); n++) workers.push(worker());
    return Promise.all(workers);
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
        wrap.innerHTML = "";
        var img = document.createElement("img");
        img.alt = f.title;
        img.loading = "lazy";
        img.referrerPolicy = "no-referrer";
        wrap.appendChild(img);
        attachImageRecovery(img, imgs, f.title);
      }).catch(function () {});
      (function () {
        var wrap = document.getElementById("fc-img-" + idx);
        if (wrap && !wrap.firstChild) { var fb = document.createElement("img"); fb.alt = f.title; fb.src = fashionFallbackSvg(f.title); fb.className = "image-fallback"; wrap.appendChild(fb); }
      })();
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
        if (!sw) return;
        if (!imgs.length) {
          sw.style.backgroundImage = "url('" + fashionFallbackSvg(m.name) + "')";
          return;
        }
        var probe = new Image();
        probe.onload = function () { sw.style.backgroundImage = "url('" + imgFromResult(imgs[0]).replace(/'/g, "%27") + "')"; };
        probe.onerror = function () { sw.style.backgroundImage = "url('" + fashionFallbackSvg(m.name) + "')"; };
        probe.src = imgFromResult(imgs[0]);
      });
    });
  }

  function tickClock() {
    var node = document.getElementById("liveClock");
    if (!node) return;
    node.textContent = new Date().toLocaleString(undefined, {
      weekday: "short",
      hour: "numeric",
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
    fetchHouseBriefs();
    loadLocationPhotography();
    if (window.AtelierPro && window.AtelierPro.refresh) window.AtelierPro.refresh();
  }


  function renderProCharts() {
    if (typeof Chart === "undefined") { setStatus("charts", "fail"); return; }
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
    setStatus("charts", "ok");
    makeBar(
      "chartCategory",
      ["Bags", "RTW", "Footwear", "Beauty", "Jewellery", "Outerwear"],
      [86, 48, 52, 80, 58, 42]
    );
  }


  var HOUSE_PAGES = [
    "Louis_Vuitton", "Chanel", "Hermès", "Christian_Dior_SE", "Gucci", "Prada",
    "Yves_Saint_Laurent_(brand)", "Bottega_Veneta", "Cartier_(jeweler)", "Tiffany_%26_Co."
  ];

  function fetchHouseBriefs() {
    var host = document.getElementById("houseBriefs");
    if (!host) return;
    host.innerHTML = '<div class="wire-loading">Loading maison briefs…</div>';
    var tasks = HOUSE_PAGES.map(function (title) {
      var url =
        "https://en.wikipedia.org/api/rest_v1/page/summary/" +
        encodeURIComponent(title);
      return fetch(url, UA)
        .then(function (r) {
          if (!r.ok) throw new Error("wiki");
          return r.json();
        })
        .then(function (data) {
          return {
            title: data.title || title.replace(/_/g, " "),
            extract: (data.extract || "").slice(0, 220),
            link: (data.content_urls && data.content_urls.desktop && data.content_urls.desktop.page) || ("https://en.wikipedia.org/wiki/" + title)
          };
        })
        .catch(function () {
          return null;
        });
    });
    Promise.all(tasks).then(function (rows) {
      var ok = rows.filter(Boolean);
      host.innerHTML = "";
      if (!ok.length) {
        host.innerHTML =
          '<div class="wire-empty">Maison briefs temporarily unavailable — cartography and ledger remain active.</div>';
        setStatus("briefs", "fail");
        return;
      }
      ok.forEach(function (b) {
        var card = el("article", "brief-card");
        var extract = b.extract;
        if (extract.length >= 220) extract += "…";
        card.innerHTML =
          "<h3>" +
          b.title +
          "</h3><p>" +
          extract +
          '</p><a href="' +
          b.link +
          '" target="_blank" rel="noopener">Open reference ↗</a>';
        host.appendChild(card);
      });
      setStatus("briefs", "ok");
    });
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

  window.AtelierCore = {
    el: el, verifyImage: verifyImage, withRetry: withRetry, setStatus: setStatus, wikiLeadImage: wikiLeadImage,
    fashionFallbackSvg: fashionFallbackSvg, isLogoLike: isLogoLike, stripHtml: stripHtml,
    searchCommons: searchCommonsLocation, searchOpenverse: searchOpenverseLocation, fetchFashionImages: fetchFashionImages
  };

  function init() {
    setStatus("wire", "pending");
    setStatus("mood", "pending");
    setStatus("hero", "pending");
    setStatus("pulse", "pending");
    setStatus("charts", "pending");
    setStatus("briefs", "pending");
    setHero();
    renderMood();
    renderSignals();
    renderBarSet("regionBars", "Regional demand posture", GROWTH_BARS);
    renderBarSet("categoryBars", "Category demand posture", CATEGORY_BARS);
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
    renderLuxuryLocations("Las Vegas");
    bindLocationFilters();
    loadLocationPhotography();
    renderProCharts();
    fetchHouseBriefs();
    var btn = document.getElementById("refreshAll");
    if (btn) btn.addEventListener("click", refreshAll);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
