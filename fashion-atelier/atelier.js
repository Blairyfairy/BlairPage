/**
 * Blair's Fashion Atelier — client-side trend lab
 */
(function () {
  "use strict";

  var FEEDS = {
    all: [
      { name: "Vogue", url: "https://www.vogue.com/feed/rss" },
      { name: "Business of Fashion", url: "https://www.businessoffashion.com/feed/" },
      { name: "Fashionista", url: "https://fashionista.com/.rss/full/" },
      { name: "Who What Wear", url: "https://www.whowhatwear.com/rss" },
      { name: "Highsnobiety", url: "https://www.highsnobiety.com/feed/" }
    ],
    runway: [
      { name: "Vogue", url: "https://www.vogue.com/feed/rss" },
      { name: "Business of Fashion", url: "https://www.businessoffashion.com/feed/" }
    ],
    street: [
      { name: "Highsnobiety", url: "https://www.highsnobiety.com/feed/" },
      { name: "Fashionista", url: "https://fashionista.com/.rss/full/" }
    ],
    beauty: [
      { name: "Who What Wear", url: "https://www.whowhatwear.com/rss" },
      { name: "Vogue", url: "https://www.vogue.com/feed/rss" }
    ]
  };

  var TREND_LEXICON = {
    hot: [
      "quiet luxury", "old money", "dopamine dressing", "balletcore", "mob wife",
      "coastal grandmother", "gorpcore", "coquette", "blokecore", "clean girl",
      "office siren", "tomato girl", "latte makeup", "cherry red", "butter yellow",
      "metallic", "sheer", "mesh", "crochet", "lace", "wide-leg", "cargo",
      "platform", "kitten heel", "loafers", "baguette bag", "micro bag",
      "bourdaincore", "indie sleaze", "mobwife", "scandi"
    ],
    warm: [
      "sustainable", "upcycled", "vintage", "secondhand", "gender fluid",
      "oversized", "tailoring", "power shoulder", "pleats", "satin", "silk",
      "leather", "denim", "utility", "military", "boho", "cottagecore",
      "Y2K", "90s", "minimalist", "maximalist", "monochrome", "regenerative"
    ],
    cool: [
      "athleisure", "sneakers", "hoodie", "graphic tee", "logo", "streetwear",
      "techwear", "outdoor", "fleece", "puffer", "trench", "blazer", "outlet"
    ]
  };

  var SEASONAL = [
    {
      when: "Now → 6 weeks",
      what: "Butter yellow, transitional layering, soft structure",
      why: "Runway carryover meets real-weather dressing. Light outerwear and warm neutrals dominate editorial and retail floors."
    },
    {
      when: "Next quarter",
      what: "Quiet luxury tailoring + liquid metallics",
      why: "Evening and office-siren silhouettes hold. Chrome finishes and precise cuts peak for events and premium retail."
    },
    {
      when: "6–9 months",
      what: "Craft denim, regenerative fibers, hand-feel detail",
      why: "Sustainability moves from niche language into core assortment. Texture and provenance matter more than pure logo play."
    },
    {
      when: "12 months",
      what: "Post-logo utility and hybrid workwear",
      why: "Brand fatigue cycles favor functional design. Mid-tier and emerging labels that solve real outfits gain share."
    },
    {
      when: "18–24 months",
      what: "Regional craft × global distribution",
      why: "Lesser-known houses with strong local identity scale through selective partnerships and digital-first drops."
    }
  ];

  /* Curated stable image URLs (direct Unsplash CDN — no random source endpoint) */
  var MOOD_IMAGES = [
    { src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=480&q=80", label: "Runway stance" },
    { src: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=480&q=80", label: "Editorial line" },
    { src: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=480&q=80", label: "Street cut" },
    { src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=480&q=80", label: "City walk" },
    { src: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=480&q=80", label: "Fabric study" },
    { src: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=480&q=80", label: "Detail close" },
    { src: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=480&q=80", label: "Boutique floor" },
    { src: "https://images.unsplash.com/photo-1441984900000-8e5b0e0e5e5e?w=480&q=80", label: "Rack story" },
    { src: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=480&q=80", label: "Soft tailoring" },
    { src: "https://images.unsplash.com/photo-1539109133719-fb922696166a?w=480&q=80", label: "Evening form" },
    { src: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=480&q=80", label: "Color block" },
    { src: "https://images.unsplash.com/photo-1572804013305-851af67f8767?w=480&q=80", label: "Day dress" }
  ];

  var BRANDS = {
    luxury: [
      { name: "Louis Vuitton", meta: "LVMH · leather goods, RTW, travel", signal: "Core growth · high pricing power" },
      { name: "Chanel", meta: "Independent · couture, beauty, RTW", signal: "Scarcity model holds" },
      { name: "Hermès", meta: "Independent · leather, silk, equestrian", signal: "Waitlists still define demand" },
      { name: "Dior", meta: "LVMH · couture, beauty, menswear", signal: "Creative director cycles watched" },
      { name: "Gucci", meta: "Kering · RTW, leather, eyewear", signal: "Reset after peak logo cycle" },
      { name: "Prada", meta: "Prada Group · RTW, nylon, Miu Miu", signal: "Miu Miu outruns parent heat" },
      { name: "Saint Laurent", meta: "Kering · RTW, leather, footwear", signal: "Sharp tailoring demand steady" },
      { name: "Balenciaga", meta: "Kering · RTW, sneakers, campaign culture", signal: "Post-controversy rebuild" },
      { name: "Bottega Veneta", meta: "Kering · leather, intrecciato", signal: "Quiet luxury reference point" },
      { name: "Loewe", meta: "LVMH · leather, craft, RTW", signal: "Craft narrative still climbing" },
      { name: "Celine", meta: "LVMH · RTW, leather", signal: "Minimal codes remain bankable" },
      { name: "Fendi", meta: "LVMH · fur heritage, leather, RTW", signal: "Bag and logo hybrids" },
      { name: "Givenchy", meta: "LVMH · RTW, couture codes", signal: "Creative reset window" },
      { name: "Valentino", meta: "Mayhoola · RTW, couture, pink code", signal: "Red / pink signature enduring" },
      { name: "Burberry", meta: "Public · trench, check, British outerwear", signal: "Heritage reboot in progress" },
      { name: "Moncler", meta: "Public · outerwear, Genius collaborations", signal: "Puffer category leader" }
    ],
    mid: [
      { name: "Coach", meta: "Tapestry · leather, accessible luxury", signal: "Outlet + full-price dual engine" },
      { name: "Michael Kors", meta: "Capri Holdings · RTW, handbags", signal: "Value luxury floor" },
      { name: "Kate Spade", meta: "Tapestry · handbags, color storytelling", signal: "Optimistic color cycles help" },
      { name: "Tory Burch", meta: "Independent · RTW, accessories", signal: "Loyal base, steady full price" },
      { name: "Theory", meta: "Fast Retailing · workwear tailoring", signal: "Hybrid office still relevant" },
      { name: "AllSaints", meta: "Private · leather, British edge", signal: "Leather jackets as hero SKU" },
      { name: "Reiss", meta: "NEXT plc · occasion + work", signal: "Wedding and event tailwind" },
      { name: "Ted Baker", meta: "Abercrombie path · British print DNA", signal: "Rebuild after ownership shifts" },
      { name: "Club Monaco", meta: "Private · elevated basics", signal: "Quiet competitor to Theory" },
      { name: "Sandro", meta: "SMCP · Parisian contemporary", signal: "European mid-luxury lane" },
      { name: "Maje", meta: "SMCP · feminine contemporary", signal: "Sister brand to Sandro" },
      { name: "APC", meta: "Independent · denim, minimal RTW", signal: "Cult denim holds" },
      { name: "Acne Studios", meta: "Independent · denim, Scandinavian RTW", signal: "Art-adjacent fashion equity" },
      { name: "Ganni", meta: "Authentic Brands · Copenhagen color", signal: "Print and joy still sell" },
      { name: "Frame", meta: "Private · denim, California clean", signal: "Premium denim mainstay" },
      { name: "Rag & Bone", meta: "Private · denim, American sportswear", signal: "Heritage denim floor" }
    ],
    outlet: [
      { name: "Nike Factory", meta: "Nike · sport, lifestyle, outlet channel", signal: "Inventory discipline key" },
      { name: "Adidas Outlet", meta: "Adidas · sport, originals", signal: "Originals drive traffic" },
      { name: "Polo Ralph Lauren", meta: "Ralph Lauren · American classic", signal: "Outlet remains volume engine" },
      { name: "Tommy Hilfiger", meta: "PVH · preppy global", signal: "Strong outlet productivity" },
      { name: "Calvin Klein", meta: "PVH · underwear, jeans, RTW", signal: "Logo basics at value" },
      { name: "Gap Outlet / Factory", meta: "Gap Inc · American casual", signal: "Value traffic magnet" },
      { name: "Banana Republic Factory", meta: "Gap Inc · work casual", signal: "Office-adjacent value" },
      { name: "J.Crew Factory", meta: "L Catterton · preppy American", signal: "Factory vs. full-price split" },
      { name: "Ann Taylor Factory", meta: "Premium brands group · workwear", signal: "Career value lane" },
      { name: "Brooks Brothers", meta: "Authentic Brands · American formal", signal: "Heritage at outlet price" },
      { name: "Cole Haan", meta: "Authentic Brands · footwear", signal: "Comfort dress shoe demand" },
      { name: "Guess Factory", meta: "Guess · denim, logo", signal: "Y2K logo nostalgia helps" },
      { name: "Levi's Outlet", meta: "Levi Strauss · denim icon", signal: "Denim cycles favor heritage" },
      { name: "Under Armour Factory", meta: "Under Armour · performance", signal: "Value sport traffic" },
      { name: "Columbia Factory", meta: "Columbia · outdoor", signal: "Gorp-adjacent utility" },
      { name: "Saks Off 5th", meta: "Multi-brand off-price luxury", signal: "Designer clearance channel" },
      { name: "Nordstrom Rack", meta: "Nordstrom · off-price department", signal: "Discovery + deal hunting" },
      { name: "TJ Maxx / Marshalls", meta: "TJX · off-price treasure hunt", signal: "Traffic resilient in soft macro" }
    ],
    emerging: [
      { name: "The Row", meta: "Independent · extreme quiet luxury", signal: "Cult pricing power" },
      { name: "Khaite", meta: "Independent · New York sensual minimal", signal: "Handbag and knit heroes" },
      { name: "Toteme", meta: "Independent · Scandinavian precision", signal: "Uniform dressing demand" },
      { name: "Lemaire", meta: "Independent · Parisian soft tailoring", signal: "Intellectual luxury lane" },
      { name: "Jil Sander", meta: "Otb · pure minimal", signal: "Creative director dependent" },
      { name: "Jacquemus", meta: "Independent · playful French volume", signal: "Viral accessories engine" },
      { name: "Coperni", meta: "Independent · tech-forward French", signal: "Stunt moments drive awareness" },
      { name: "Marine Serre", meta: "Independent · crescent logo, upcycle", signal: "Sustainability as identity" },
      { name: "Sporty & Rich", meta: "Independent · wellness prep", signal: "Country-club athletic aesthetic" },
      { name: "Aime Leon Dore", meta: "New Balance partner · NY prep", signal: "Collab sneakers fuel growth" },
      { name: "Rhude", meta: "Independent · LA luxury street", signal: "Premium streetwear floor" },
      { name: "Fear of God", meta: "Independent · elevated essentials", signal: "Essentials line scales" },
      { name: "Wales Bonner", meta: "adidas partner · cultural luxury", signal: "Museum-level storytelling" },
      { name: "S.S. Daley", meta: "Independent · British queer heritage", signal: "LVMH Prize momentum" },
      { name: "Chopova Lowena", meta: "Independent · Bulgarian craft hybrid", signal: "Cult runway following" },
      { name: "Emily Adams Bode", meta: "Independent · American textile archive", signal: "Menswear craft leadership" },
      { name: "Live The Process", meta: "Independent · elevated movement", signal: "Wellness luxury adjacency" },
      { name: "Rotate Birger Christensen", meta: "Party-ready Scandinavian", signal: "Occasion dressing online" }
    ]
  };

  var DEALS = [
    {
      tag: "Group",
      title: "LVMH still sets the high-luxury benchmark",
      body: "Vuitton, Dior, Loewe, Celine and Fendi remain the reference for pricing power and tourism-linked demand. Watch creative-director transitions and China travel recovery."
    },
    {
      tag: "Group",
      title: "Kering rebuilds Gucci while Bottega and SL hold",
      body: "Gucci's post-logo reset is the central story. Bottega Veneta's quiet-luxury positioning and Saint Laurent's sharp tailoring cushion group results."
    },
    {
      tag: "Mid-tier",
      title: "Tapestry and Capri still define accessible luxury",
      body: "Coach, Kate Spade, Michael Kors and related names live in the tension between full-price brand health and outlet productivity. Inventory discipline decides the year."
    },
    {
      tag: "Outlet",
      title: "Off-price and factory channels stay resilient",
      body: "TJX, Nordstrom Rack, Saks Off 5th and brand factories absorb surplus and serve deal-seeking traffic when full-price slows. Treasure-hunt merchandising still wins."
    },
    {
      tag: "Emerging",
      title: "Independent houses monetize culture, not only product",
      body: "The Row, Khaite, Jacquemus, Wales Bonner and peers convert storytelling, scarcity and selective distribution into margin. Collaborations with sport and outdoor expand reach."
    },
    {
      tag: "Sport",
      title: "Nike, adidas and outdoor brands blur into fashion",
      body: "Gorpcore and lifestyle sneakers keep sport brands inside the fashion conversation. Factory outlets remain a volume valve when wholesale softens."
    },
    {
      tag: "M&A",
      title: "Selective deals over mega-consolidations",
      body: "Buyers favor brands with clear DNA, digital direct channels and controllable inventory. Distressed mid-tier names trade; true luxury rarely does."
    },
    {
      tag: "Values",
      title: "Provenance, repair and regeneration enter the brief",
      body: "Regenerative materials, repair programs and archive storytelling move from CSR pages into product merchandising — especially in denim, leather and knit."
    }
  ];

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function toast(msg) {
    var el = $("#toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove("show"); }, 2800);
  }

  function proxyFetch(url) {
    var encoded = encodeURIComponent(url);
    var endpoints = [
      "https://api.allorigins.win/raw?url=" + encoded,
      "https://corsproxy.io/?" + encoded
    ];
    return endpoints.reduce(function (chain, ep) {
      return chain.catch(function () {
        return fetch(ep).then(function (r) {
          if (!r.ok) throw new Error("fail");
          return r.text();
        });
      });
    }, Promise.reject());
  }

  function parseRSS(xmlText) {
    var doc = new DOMParser().parseFromString(xmlText, "text/xml");
    var items = Array.from(doc.querySelectorAll("item")).slice(0, 12);
    return items.map(function (item) {
      var title = (item.querySelector("title") || {}).textContent || "Untitled";
      var link = (item.querySelector("link") || {}).textContent || "#";
      var desc = (item.querySelector("description") || {}).textContent || "";
      var pub = (item.querySelector("pubDate") || {}).textContent || "";
      var img = null;
      var enclosure = item.querySelector("enclosure");
      if (enclosure && /image/i.test(enclosure.getAttribute("type") || "")) {
        img = enclosure.getAttribute("url");
      }
      if (!img) {
        var media = item.getElementsByTagName("media:content")[0] || item.getElementsByTagName("media:thumbnail")[0];
        if (media) img = media.getAttribute("url");
      }
      if (!img) {
        var m = desc.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (m) img = m[1];
      }
      var source = (item.querySelector("source") || {}).textContent || "";
      return {
        title: title.replace(/<!\[CDATA\[|\]\]>/g, "").trim(),
        link: link.trim(),
        desc: desc.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160),
        pub: pub,
        img: img,
        source: source
      };
    });
  }

  function relativeTime(dateStr) {
    try {
      var d = new Date(dateStr);
      if (isNaN(d)) return "";
      var diff = (Date.now() - d.getTime()) / 1000;
      if (diff < 3600) return Math.max(1, Math.floor(diff / 60)) + "m ago";
      if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
      if (diff < 604800) return Math.floor(diff / 86400) + "d ago";
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch (e) { return ""; }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function extractPalette(imgEl, count) {
    count = count || 6;
    var canvas = document.createElement("canvas");
    var size = 80;
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(imgEl, 0, 0, size, size);
    var data;
    try { data = ctx.getImageData(0, 0, size, size).data; }
    catch (e) { return ["#9e829c", "#291528", "#f0eff4", "#3a3e3b", "#c9a84b", "#8ec9a8"]; }
    var buckets = {};
    for (var i = 0; i < data.length; i += 16) {
      var r = data[i] >> 4 << 4;
      var g = data[i + 1] >> 4 << 4;
      var b = data[i + 2] >> 4 << 4;
      if (data[i + 3] < 128) continue;
      var key = r + "," + g + "," + b;
      buckets[key] = (buckets[key] || 0) + 1;
    }
    return Object.keys(buckets)
      .sort(function (a, b) { return buckets[b] - buckets[a]; })
      .slice(0, count)
      .map(function (k) {
        var p = k.split(",");
        return "#" + (+p[0]).toString(16).padStart(2, "0") + (+p[1]).toString(16).padStart(2, "0") + (+p[2]).toString(16).padStart(2, "0");
      });
  }

  function luminance(hex) {
    var n = parseInt(hex.slice(1), 16);
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  function hueName(hex) {
    var n = parseInt(hex.slice(1), 16);
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    if (max - min < 20) {
      if (max < 50) return "deep black";
      if (max < 120) return "charcoal";
      if (max < 200) return "soft grey";
      return "ivory";
    }
    var h = 0;
    if (max === r) h = ((g - b) / (max - min)) * 60;
    else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
    else h = (4 + (r - g) / (max - min)) * 60;
    if (h < 0) h += 360;
    if (h < 20 || h >= 340) return "crimson";
    if (h < 45) return "terracotta";
    if (h < 70) return "butter gold";
    if (h < 150) return "olive";
    if (h < 200) return "teal";
    if (h < 260) return "cobalt";
    if (h < 300) return "violet";
    return "berry";
  }

  function analyzeImageInsights(palette) {
    var names = palette.map(hueName);
    var dark = palette.filter(function (h) { return luminance(h) < 0.35; }).length;
    var light = palette.filter(function (h) { return luminance(h) > 0.7; }).length;
    var mood = "balanced editorial";
    if (dark >= 3) mood = "nocturne / dramatic";
    else if (light >= 3) mood = "air and brightness";
    else if (names.some(function (n) { return /violet|berry/.test(n); })) mood = "mauve-coded romance";
    else if (names.some(function (n) { return /butter|terracotta/.test(n); })) mood = "warm transition";

    var seasonHints = [];
    if (names.some(function (n) { return /butter|terracotta/.test(n); })) seasonHints.push("butter yellow wave");
    if (names.some(function (n) { return /crimson|berry/.test(n); })) seasonHints.push("cherry-red accent");
    if (dark >= 2) seasonHints.push("evening depth");
    if (names.some(function (n) { return /teal|cobalt|olive/.test(n); })) seasonHints.push("utility hybrid");

    var direction = "Build around the dominant hue; keep silhouettes clean so color carries the story.";
    if (dark >= 3) direction = "Lean into evening and quiet-luxury depth — matte leather, sharp shoulder, minimal hardware.";
    else if (light >= 3) direction = "Pair with structure so the look does not wash out — crisp tailoring against soft volume.";

    var tags = Array.from(new Set(names.concat(seasonHints).concat([mood]).map(function (t) {
      return t.split(/[\/,]/)[0].trim();
    }).filter(Boolean))).slice(0, 8);

    return {
      mood: mood,
      season: seasonHints[0] || "cross-season adaptable",
      direction: direction,
      narrative: "Read: " + mood + ". Palette leans " + names.slice(0, 3).join(", ") + ". " +
        (seasonHints[0] ? "Aligns with " + seasonHints[0] + "." : "Works as a neutral base for layering."),
      tags: tags
    };
  }

  function scoreKeywords(texts) {
    var blob = (texts || []).join(" ").toLowerCase();
    var scores = {};
    ["hot", "warm", "cool"].forEach(function (tier) {
      TREND_LEXICON[tier].forEach(function (kw) {
        var re = new RegExp("\\b" + kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "gi");
        var m = blob.match(re);
        if (m && m.length) scores[kw] = { count: m.length, tier: tier };
      });
    });
    return Object.keys(scores).map(function (k) {
      return { word: k, count: scores[k].count, tier: scores[k].tier };
    }).sort(function (a, b) { return b.count - a.count; }).slice(0, 20);
  }

  var currentFilter = "all";
  var lastArticles = [];
  var currentBrandTier = "luxury";

  function renderFeed(items) {
    var list = $("#feedList");
    if (!list) return;
    if (!items.length) {
      list.innerHTML = '<div class="feed-empty">Press is quiet right now. Try another filter or refresh.</div>';
      return;
    }
    list.innerHTML = items.map(function (it) {
      var thumb = it.img
        ? '<img class="feed-thumb" src="' + it.img + '" alt="" loading="lazy" onerror="this.src=\'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=152&q=60\'">'
        : '<img class="feed-thumb" src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=152&q=60" alt="" loading="lazy">';
      return '<a class="feed-item" href="' + it.link + '" target="_blank" rel="noopener noreferrer">' +
        thumb + '<div class="feed-body"><h3>' + escapeHtml(it.title) + '</h3><div class="feed-meta"><span>' +
        escapeHtml(it.source || "Fashion press") + "</span><span>" + relativeTime(it.pub) +
        "</span></div></div></a>";
    }).join("");
  }

  function loadFeed(filter) {
    currentFilter = filter || "all";
    var list = $("#feedList");
    if (list) {
      list.innerHTML = '<div class="feed-loading"><div class="skeleton" style="margin-bottom:8px"></div><div class="skeleton" style="margin-bottom:8px"></div><div class="skeleton"></div></div>';
    }
    $$(".chip[data-filter]").forEach(function (c) {
      c.classList.toggle("active", c.getAttribute("data-filter") === currentFilter);
    });
    var sources = FEEDS[currentFilter] || FEEDS.all;
    var jobs = sources.map(function (src) {
      return proxyFetch(src.url).then(parseRSS).then(function (items) {
        return items.map(function (it) { it.source = it.source || src.name; return it; });
      }).catch(function () { return []; });
    });
    Promise.all(jobs).then(function (batches) {
      var merged = [], seen = {};
      batches.forEach(function (batch) {
        batch.forEach(function (it) {
          var key = (it.title || "").toLowerCase().slice(0, 48);
          if (key && !seen[key]) { seen[key] = 1; merged.push(it); }
        });
      });
      merged.sort(function (a, b) { return new Date(b.pub || 0) - new Date(a.pub || 0); });
      lastArticles = merged.slice(0, 16);
      renderFeed(lastArticles);
      updateRadar(lastArticles);
      updateSignals(lastArticles);
      if (!lastArticles.length) {
        toast("Showing studio trend model");
        seedOfflineFeed();
      }
    });
  }

  function seedOfflineFeed() {
    var offline = [
      { title: "Quiet luxury leans into texture over logo for transitional dressing", link: "https://www.vogue.com/", source: "Studio model", pub: new Date().toISOString(), img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&q=60", desc: "" },
      { title: "Butter yellow and cherry red lead the color conversation", link: "https://www.businessoffashion.com/", source: "Studio model", pub: new Date().toISOString(), img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=200&q=60", desc: "" },
      { title: "Office siren meets balletcore in hybrid workwear", link: "https://fashionista.com/", source: "Studio model", pub: new Date().toISOString(), img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&q=60", desc: "" },
      { title: "Craft denim and regenerative fibers move closer to the main floor", link: "https://www.highsnobiety.com/", source: "Studio model", pub: new Date().toISOString(), img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&q=60", desc: "" },
      { title: "Outlet and off-price channels stay busy while full-price edits tighten", link: "https://www.whowhatwear.com/", source: "Studio model", pub: new Date().toISOString(), img: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&q=60", desc: "" }
    ];
    lastArticles = offline;
    renderFeed(offline);
    updateRadar(offline);
    updateSignals(offline);
  }

  function updateRadar(articles) {
    var texts = articles.map(function (a) { return a.title + " " + (a.desc || ""); });
    var scored = scoreKeywords(texts);
    if (!scored.length) {
      scored = TREND_LEXICON.hot.slice(0, 6).map(function (w) { return { word: w, count: 1, tier: "hot" }; })
        .concat(TREND_LEXICON.warm.slice(0, 5).map(function (w) { return { word: w, count: 1, tier: "warm" }; }));
    }
    var wrap = $("#radarWrap");
    if (!wrap) return;
    wrap.innerHTML = scored.map(function (s) {
      return '<span class="radar-tag ' + s.tier + '" title="Mentions: ' + s.count + '">' + escapeHtml(s.word) + "</span>";
    }).join("");
  }

  function updateSignals(articles) {
    var n = articles.length || 1;
    var titles = articles.map(function (a) { return (a.title || "").toLowerCase(); });
    var colorHits = titles.filter(function (t) { return /yellow|red|metallic|chrome|mauve|pink|green|blue/.test(t); }).length;
    var sustain = titles.filter(function (t) { return /sustain|upcycled|vintage|secondhand|regenerat/.test(t); }).length;
    var silhouette = titles.filter(function (t) { return /wide|oversized|tailor|blazer|cargo|sheer|lace/.test(t); }).length;
    var social = Math.min(98, 55 + colorHits * 8 + Math.floor(Math.random() * 8));
    var retail = Math.min(96, 48 + silhouette * 7 + sustain * 5);
    var runway = Math.min(94, 50 + Math.floor(n * 2.2) + silhouette * 4);
    var risk = Math.max(12, 40 - sustain * 6);
    setMeter("sigSocial", social);
    setMeter("sigRetail", retail);
    setMeter("sigRunway", runway);
    setMeter("sigRisk", risk);
    function el(id, v) { var n = $("#" + id); if (n) n.textContent = v + "%"; }
    el("valSocial", social); el("valRetail", retail); el("valRunway", runway); el("valRisk", risk);
  }

  function setMeter(id, pct) {
    var el = $("#" + id);
    if (el) el.style.width = pct + "%";
  }

  function handleFile(file) {
    if (!file || !/^image\//.test(file.type)) { toast("Choose an image file"); return; }
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () {
      var frame = $("#previewImg");
      if (frame) { frame.src = url; frame.alt = file.name; }
      var row = $("#previewRow");
      if (row) row.classList.add("active");
      var palette = extractPalette(img, 6);
      var insights = analyzeImageInsights(palette);
      renderPalette(palette);
      renderInsights(insights);
      toast("Palette ready");
    };
    img.onerror = function () { toast("Could not read that image"); };
    img.src = url;
  }

  function renderPalette(colors) {
    var row = $("#paletteRow");
    if (!row) return;
    row.innerHTML = colors.map(function (c) {
      return '<div class="swatch" style="background:' + c + '" data-hex="' + c + '" title="' + c + '" role="button" tabindex="0"></div>';
    }).join("");
    $$(".swatch", row).forEach(function (sw) {
      sw.addEventListener("click", function () {
        var hex = sw.getAttribute("data-hex");
        if (navigator.clipboard && hex) {
          navigator.clipboard.writeText(hex).then(function () { toast("Copied " + hex); });
        }
      });
    });
  }

  function renderInsights(insights) {
    var panel = $("#insightText");
    if (panel) {
      panel.innerHTML = "<strong>Mood</strong> — " + escapeHtml(insights.mood) +
        "<br><strong>Season</strong> — " + escapeHtml(insights.season) +
        "<br>" + escapeHtml(insights.narrative);
    }
    var dir = $("#insightDirection");
    if (dir) dir.textContent = insights.direction;
    var tags = $("#insightTags");
    if (tags) {
      tags.innerHTML = insights.tags.map(function (t) {
        return '<span class="tag">' + escapeHtml(t) + "</span>";
      }).join("");
    }
    var moodEl = $("#tileMood");
    var seasonEl = $("#tileSeason");
    if (moodEl) moodEl.textContent = insights.mood;
    if (seasonEl) seasonEl.textContent = insights.season;
  }

  function loadMoodBoard() {
    var grid = $("#moodGrid");
    if (!grid) return;
    var shuffled = MOOD_IMAGES.slice().sort(function () { return Math.random() - 0.5; }).slice(0, 6);
    grid.innerHTML = shuffled.map(function (m) {
      return '<div class="mood-tile"><img src="' + m.src + '" alt="' + escapeHtml(m.label) +
        '" loading="lazy" referrerpolicy="no-referrer"><span class="cap">' + escapeHtml(m.label) + "</span></div>";
    }).join("");
  }

  function renderPredictions() {
    var el = $("#predList");
    if (!el) return;
    el.innerHTML = SEASONAL.map(function (p) {
      return '<div class="pred-item"><div class="when">' + escapeHtml(p.when) +
        '</div><div class="what">' + escapeHtml(p.what) +
        '</div><div class="why">' + escapeHtml(p.why) + "</div></div>";
    }).join("");
  }

  function renderBrands(tier) {
    currentBrandTier = tier || "luxury";
    $$(".chip[data-tier]").forEach(function (c) {
      c.classList.toggle("active", c.getAttribute("data-tier") === currentBrandTier);
    });
    var list = BRANDS[currentBrandTier] || BRANDS.luxury;
    var grid = $("#brandGrid");
    if (!grid) return;
    grid.innerHTML = list.map(function (b) {
      return '<div class="brand-card"><div class="bc-tier">' + escapeHtml(currentBrandTier) +
        '</div><div class="bc-name">' + escapeHtml(b.name) +
        '</div><div class="bc-meta">' + escapeHtml(b.meta) +
        '</div><div class="bc-signal">' + escapeHtml(b.signal) + "</div></div>";
    }).join("");
  }

  function renderDeals() {
    var el = $("#dealList");
    if (!el) return;
    el.innerHTML = DEALS.map(function (d) {
      return '<div class="deal-row"><span class="deal-tag">' + escapeHtml(d.tag) +
        '</span><div><h4>' + escapeHtml(d.title) + '</h4><p>' + escapeHtml(d.body) + "</p></div></div>";
    }).join("");
  }

  function tickStamp() {
    var el = $("#liveStamp");
    if (!el) return;
    var now = new Date();
    el.textContent = "Live · " + now.toLocaleString(undefined, {
      weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    });
  }

  function init() {
    tickStamp();
    setInterval(tickStamp, 60000);
    renderPredictions();
    loadMoodBoard();
    renderBrands("luxury");
    renderDeals();
    loadFeed("all");

    $$(".chip[data-filter]").forEach(function (chip) {
      chip.addEventListener("click", function () { loadFeed(chip.getAttribute("data-filter")); });
    });

    $$(".chip[data-tier]").forEach(function (chip) {
      chip.addEventListener("click", function () { renderBrands(chip.getAttribute("data-tier")); });
    });

    var refreshBtn = $("#refreshFeed");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", function () {
        loadFeed(currentFilter);
        toast("Refreshing press…");
      });
    }

    var moodBtn = $("#refreshMood");
    if (moodBtn) {
      moodBtn.addEventListener("click", function () {
        loadMoodBoard();
        toast("Mood board shuffled");
      });
    }

    var zone = $("#uploadZone");
    var input = $("#fileInput");
    if (zone && input) {
      zone.addEventListener("dragover", function (e) { e.preventDefault(); zone.classList.add("dragover"); });
      zone.addEventListener("dragleave", function () { zone.classList.remove("dragover"); });
      zone.addEventListener("drop", function (e) {
        e.preventDefault();
        zone.classList.remove("dragover");
        var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) handleFile(f);
      });
      input.addEventListener("change", function () {
        if (input.files && input.files[0]) handleFile(input.files[0]);
      });
    }

    var sampleBtn = $("#sampleAnalyze");
    if (sampleBtn) {
      sampleBtn.addEventListener("click", function () {
        var img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = function () {
          var frame = $("#previewImg");
          if (frame) frame.src = img.src;
          var row = $("#previewRow");
          if (row) row.classList.add("active");
          var palette = extractPalette(img, 6);
          var insights = analyzeImageInsights(palette);
          renderPalette(palette);
          renderInsights(insights);
          toast("Sample look analyzed");
        };
        img.onerror = function () { toast("Try uploading your own image"); };
        img.src = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80";
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
