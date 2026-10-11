/* Blair's Atelier — Pro layer
   Live, key-free data pulls:
   · OpenStreetMap Overpass  → luxury boutiques currently mapped on the Las Vegas Strip
   · Wikimedia Pageviews API → 30-day attention index for the top luxury houses
   · Open-Meteo              → Las Vegas conditions
   · Wikipedia / Commons / Openverse → verified imagery, with a designed fallback for every slot
   Every external call is wrapped: if a source is down the page still renders complete. */
(function () {
  "use strict";

  var C = window.AtelierCore;
  if (!C) { return; }

  var UA = { headers: { Accept: "application/json" } };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function norm(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9& ]+/g, " ").replace(/\s+/g, " ").trim();
  }
  function timeout(ms) {
    var ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
    if (ctl) { setTimeout(function () { ctl.abort(); }, ms); }
    return ctl ? ctl.signal : undefined;
  }
  function mapsLink(q) { return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q); }

  /* ───────────────────────── Brand master list (top houses only) ───────────────────────── */
  // kind: f = fashion/leather, j = jewellery, w = watches. c = monogram colours. m = OSM/name stem.
  var B = {
    "Louis Vuitton":      { kind: "f", cat: "Leather goods · Travel",        c: ["#2b1a10", "#c9a45c"], m: "louis vuitton", wiki: "Louis_Vuitton" },
    "Chanel":             { kind: "f", cat: "Couture · Accessories",         c: ["#0d0d0d", "#e8dcc4"], m: "chanel", wiki: "Chanel" },
    "Hermès":             { kind: "f", cat: "Craft · Leather · Silk",        c: ["#b34a12", "#f4d9b8"], m: "hermes", wiki: "Hermès" },
    "Dior":               { kind: "f", cat: "Couture · Beauty",              c: ["#2a2d3a", "#d9d3c7"], m: "dior", wiki: "Dior" },
    "Gucci":              { kind: "f", cat: "Italian house codes",           c: ["#0f3d2e", "#b3202a"], m: "gucci", wiki: "Gucci" },
    "Prada":              { kind: "f", cat: "Intellectual luxury",           c: ["#101010", "#bdbdbd"], m: "prada", wiki: "Prada" },
    "Saint Laurent":      { kind: "f", cat: "Modern Parisian codes",         c: ["#050505", "#c8b88f"], m: "saint laurent|yves saint laurent|ysl", wiki: "Yves_Saint_Laurent_(brand)" },
    "Fendi":              { kind: "f", cat: "Roman leather craft",           c: ["#3b2a10", "#e3b94d"], m: "fendi", wiki: "Fendi" },
    "Celine":             { kind: "f", cat: "Parisian minimalism",           c: ["#1b1b1b", "#d8c9a6"], m: "celine", wiki: "Celine_(brand)" },
    "Loewe":              { kind: "f", cat: "Leather craft · Art",           c: ["#3a2412", "#d9b46a"], m: "loewe", wiki: "Loewe_(fashion_house)" },
    "Bottega Veneta":     { kind: "f", cat: "Intrecciato craft",             c: ["#1d4a2f", "#e3d9b5"], m: "bottega veneta", wiki: "Bottega_Veneta" },
    "Valentino":          { kind: "f", cat: "Couture romance · Colour",      c: ["#8b1423", "#f2d9d3"], m: "valentino", wiki: "Valentino_(fashion_house)" },
    "Balenciaga":         { kind: "f", cat: "Silhouette experimentation",    c: ["#111", "#9aa3ad"], m: "balenciaga", wiki: "Balenciaga" },
    "Alexander McQueen":  { kind: "f", cat: "Dramatic tailoring",            c: ["#0a0a0a", "#b8a37a"], m: "alexander mcqueen|mcqueen", wiki: "Alexander_McQueen_(brand)" },
    "Tom Ford":           { kind: "f", cat: "Sharp glamour",                 c: ["#0b0b0b", "#c4a56a"], m: "tom ford", wiki: "Tom_Ford_(brand)" },
    "Dolce & Gabbana":    { kind: "f", cat: "Sicilian glamour",              c: ["#1a1a1a", "#c9a24c"], m: "dolce", wiki: "Dolce_%26_Gabbana" },
    "Brunello Cucinelli": { kind: "f", cat: "Quiet luxury · Cashmere",       c: ["#3b3a35", "#e2d8c3"], m: "brunello cucinelli|cucinelli", wiki: "Brunello_Cucinelli" },
    "Loro Piana":         { kind: "f", cat: "Textile excellence",            c: ["#2d3a45", "#e5dccb"], m: "loro piana", wiki: "Loro_Piana" },
    "Moncler":            { kind: "f", cat: "Performance luxury",            c: ["#14233b", "#d8dde6"], m: "moncler", wiki: "Moncler" },
    "Christian Louboutin":{ kind: "f", cat: "Footwear · Red sole",           c: ["#1a0a0d", "#d3203a"], m: "louboutin", wiki: "Christian_Louboutin" },
    "Giorgio Armani":     { kind: "f", cat: "Italian tailoring",             c: ["#1d232b", "#cfc8bb"], m: "armani", wiki: "Giorgio_Armani_(brand)" },
    "Tiffany & Co.":      { kind: "j", cat: "Jewellery · Tiffany Blue",      c: ["#2aa9a2", "#ffffff"], m: "tiffany", wiki: "Tiffany_%26_Co." },
    "Cartier":            { kind: "j", cat: "Fine jewellery · Watches",      c: ["#7d0f1d", "#e8cf9a"], m: "cartier", wiki: "Cartier_(jeweler)" },
    "Van Cleef & Arpels": { kind: "j", cat: "High jewellery",                c: ["#12322b", "#e6c882"], m: "van cleef", wiki: "Van_Cleef_%26_Arpels" },
    "Bulgari":            { kind: "j", cat: "Roman jewellery",               c: ["#1b1b1b", "#d4af37"], m: "bulgari|bvlgari", wiki: "Bulgari" },
    "Harry Winston":      { kind: "j", cat: "Diamonds · High jewellery",     c: ["#10131c", "#d7dbe3"], m: "harry winston", wiki: "Harry_Winston,_Inc." },
    "Rolex":              { kind: "w", cat: "Watchmaking",                   c: ["#0b3b25", "#d9b84a"], m: "rolex", wiki: "Rolex" },
    "Audemars Piguet":    { kind: "w", cat: "Haute horlogerie",              c: ["#0f1c2e", "#cfd6e0"], m: "audemars", wiki: "Audemars_Piguet" },
    "Omega":              { kind: "w", cat: "Watchmaking",                   c: ["#8a0f1c", "#e7e1d0"], m: "omega", wiki: "Omega_SA" },
    "Breguet":            { kind: "w", cat: "Haute horlogerie",              c: ["#16243d", "#d2c08a"], m: "breguet", wiki: "Breguet_(brand)" }
  };

  function brandFallbackSvg(name) {
    var b = B[name] || { c: ["#170e20", "#c4a484"] };
    var initials = String(name).replace(/&/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase();
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + b.c[0] + '"/><stop offset="1" stop-color="#000" stop-opacity=".92"/></linearGradient>' +
      '<radialGradient id="r" cx=".82" cy=".14" r=".7"><stop offset="0" stop-color="' + b.c[1] + '" stop-opacity=".55"/><stop offset="1" stop-color="' + b.c[1] + '" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="900" height="600" fill="url(#g)"/><rect width="900" height="600" fill="url(#r)"/>' +
      '<g fill="none" stroke="' + b.c[1] + '" stroke-opacity=".28"><rect x="36" y="36" width="828" height="528" rx="6"/><rect x="48" y="48" width="804" height="504" rx="4"/></g>' +
      '<text x="450" y="352" text-anchor="middle" font-family="Georgia,\'Playfair Display\',serif" font-size="210" font-weight="700" fill="' + b.c[1] + '" fill-opacity=".92">' + esc(initials) + '</text></svg>';
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  }

  /* ───────────────────────── Brand imagery (verified, cached, always resolves) ───────────────────────── */
  var imgCache = {};
  var queue = [], active = 0, MAX = 4;
  function enqueue(fn) {
    return new Promise(function (resolve) {
      queue.push({ fn: fn, resolve: resolve });
      pump();
    });
  }
  function pump() {
    while (active < MAX && queue.length) {
      (function (job) {
        active++;
        job.fn().then(job.resolve, function () { job.resolve(null); }).then(function () { active--; pump(); });
      })(queue.shift());
    }
  }

  function firstVerified(rows) {
    return rows.reduce(function (p, r) {
      return p.catch(function () {
        return C.verifyImage(r.url).then(function (u) { return { url: u, provider: r.provider, license: r.license, source: r.source, title: r.title }; });
      });
    }, Promise.reject());
  }

  function resolveBrandImage(name, kind) {
    if (imgCache[name]) { return imgCache[name]; }
    var meta = B[name] || {};
    var k = kind || meta.kind || "f";
    var q = k === "j" ? name + " jewelry" : k === "w" ? name + " watch" : name + " fashion show runway";
    imgCache[name] = enqueue(function () {
      try {
        var hit = sessionStorage.getItem("atl-img:" + name);
        if (hit) { return Promise.resolve(JSON.parse(hit)); }
      } catch (e) { /* storage unavailable */ }
      return C.fetchFashionImages(q, 4).catch(function () { return []; }).then(function (rows) {
        rows = rows.filter(function (r) { return !C.isLogoLike(r.title) && !C.isLogoLike(r.url); });
        return firstVerified(rows);
      }).catch(function () {
        if (!meta.wiki) { return null; }
        return C.wikiLeadImage(meta.wiki).then(function (f) { return C.verifyImage(f.url).then(function (u) { return { url: u, provider: f.provider, license: f.license, source: f.source, title: f.title }; }); });
      }).then(function (res) {
        if (res) { try { sessionStorage.setItem("atl-img:" + name, JSON.stringify(res)); } catch (e) { /* ignore */ } }
        return res || null;
      }).catch(function () { return null; });
    });
    return imgCache[name];
  }

  // Paints a slot: designed monogram first (never empty), then the verified photograph replaces it.
  function paintBrandArt(slot, name, creditEl) {
    var base = brandFallbackSvg(name);
    slot.style.backgroundImage = "url(\"" + base + "\")";
    resolveBrandImage(name).then(function (res) {
      if (!res) { return; }
      var img = document.createElement("img");
      img.alt = name + " — " + (res.title || "luxury imagery");
      img.loading = "lazy"; img.decoding = "async"; img.referrerPolicy = "no-referrer";
      img.onerror = function () { img.remove(); };
      img.onload = function () { slot.classList.add("has-photo"); };
      img.src = res.url;
      slot.insertBefore(img, slot.firstChild);
      if (creditEl) {
        creditEl.innerHTML = '<a href="' + esc(res.source) + '" target="_blank" rel="noopener">' + esc(res.provider) + (res.license ? " · " + esc(res.license) : "") + " ↗</a>";
      }
    });
  }

  /* ───────────────────────── Las Vegas directory ───────────────────────── */
  var CENTRES = [
    { id: "crystals", name: "The Shops at Crystals", short: "Crystals", lat: 36.1068, lon: -115.1771, r: 420,
      place: "CityCenter · beside ARIA", map: "The Shops at Crystals, Las Vegas",
      note: "Simon-owned and architecturally led (Studio Libeskind, Rockwell Group). The centre cites more than 50 luxury brands and what it calls the largest Louis Vuitton in North America; Loewe opened its second Las Vegas boutique here in 2026.",
      link: ["https://www.simon.com/mall/the-shops-at-crystals", "Official centre ↗"],
      brands: ["Louis Vuitton", "Gucci", "Prada", "Celine", "Fendi", "Tiffany & Co.", "Dior", "Cartier", "Bulgari", "Tom Ford", "Dolce & Gabbana", "Loewe", "Alexander McQueen", "Brunello Cucinelli", "Audemars Piguet"],
      notes: { "Louis Vuitton": "Positioned by the centre as the largest in North America.", "Loewe": "Second Las Vegas boutique, opened 2026.", "Tiffany & Co.": "Named by the centre among its flagship anchors." } },
    { id: "bellagio", name: "Via Bellagio", short: "Via Bellagio", lat: 36.1128, lon: -115.1768, r: 380,
      place: "Bellagio Resort", map: "Via Bellagio, Las Vegas",
      note: "A compact promenade on the Bellagio's main floor. Fewer than thirty stores, almost all of them maison names, set among the resort's glass ceilings and fountain views.",
      link: ["https://bellagio.mgmresorts.com/en/shopping.html", "Bellagio shopping ↗"],
      brands: ["Chanel", "Hermès", "Louis Vuitton", "Dior", "Gucci", "Prada", "Fendi", "Bottega Veneta", "Saint Laurent", "Tiffany & Co.", "Giorgio Armani", "Breguet", "Omega"],
      notes: {} },
    { id: "wynn", name: "Wynn & Encore Esplanades", short: "Wynn & Encore", lat: 36.1276, lon: -115.1656, r: 520,
      place: "Wynn Las Vegas · Encore · Wynn Plaza", map: "Wynn Esplanade, Las Vegas",
      note: "Individually designed boutiques with private-appointment service. Wynn Plaza, on the Strip, adds a second contemporary tier (Celine, Loewe, Balenciaga, Saint Laurent).",
      link: ["https://www.wynnlasvegas.com/shopping", "Wynn shopping ↗"],
      brands: ["Chanel", "Hermès", "Louis Vuitton", "Dior", "Cartier", "Rolex", "Van Cleef & Arpels", "Prada", "Loro Piana", "Moncler", "Brunello Cucinelli", "Christian Louboutin", "Alexander McQueen", "Celine", "Loewe", "Balenciaga", "Saint Laurent", "Bottega Veneta"],
      notes: { "Loewe": "Wynn Plaza boutique.", "Celine": "Wynn Plaza.", "Balenciaga": "Wynn Plaza.", "Saint Laurent": "Wynn Plaza.", "Bottega Veneta": "Wynn Plaza." } },
    { id: "forum", name: "The Forum Shops at Caesars", short: "Forum Shops", lat: 36.1172, lon: -115.1738, r: 420,
      place: "Caesars Palace", map: "The Forum Shops at Caesars Palace, Las Vegas",
      note: "The original resort-retail template, with among the highest sales per square foot in US retail. Anchors the Strip's jewellery and watch register; Louis Vuitton runs separate men's and women's boutiques.",
      link: ["https://www.simon.com/mall/the-forum-shops-at-caesars-palace", "Official centre ↗"],
      brands: ["Louis Vuitton", "Dior", "Gucci", "Valentino", "Christian Louboutin", "Cartier", "Van Cleef & Arpels", "Tiffany & Co.", "Harry Winston", "Rolex", "Omega"],
      notes: { "Louis Vuitton": "Separate men's and women's boutiques." } }
  ];

  var vegasState = { active: "crystals", osm: null, osmStatus: "pending" };

  function haversine(lat1, lon1, lat2, lon2) {
    var R = 6371000, rad = Math.PI / 180;
    var dLat = (lat2 - lat1) * rad, dLon = (lon2 - lon1) * rad;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  function brandFromName(name) {
    var n = norm(name);
    var keys = Object.keys(B);
    for (var i = 0; i < keys.length; i++) {
      var stems = B[keys[i]].m.split("|");
      for (var j = 0; j < stems.length; j++) { if (n.indexOf(stems[j]) >= 0) { return keys[i]; } }
    }
    return null;
  }

  function overpassQuery() {
    var stems = [];
    Object.keys(B).forEach(function (k) { B[k].m.split("|").forEach(function (s) { stems.push(s); }); });
    stems.push("hermès", "céline", "bvlgari");
    var re = stems.join("|").replace(/\\/g, "");
    return "[out:json][timeout:20];(nwr[\"shop\"][\"name\"~\"" + re + "\",i](36.085,-115.195,36.140,-115.145););out center tags 400;";
  }

  function fetchOverpass() {
    var endpoints = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];
    var body = "data=" + encodeURIComponent(overpassQuery());
    function attempt(i) {
      if (i >= endpoints.length) { return Promise.reject(new Error("overpass")); }
      return fetch(endpoints[i], { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body, signal: timeout(16000) })
        .then(function (r) { if (!r.ok) { throw new Error("overpass " + r.status); } return r.json(); })
        .catch(function () { return attempt(i + 1); });
    }
    return attempt(0);
  }

  function assignHits(elements) {
    var hits = [];
    var seen = {};
    (elements || []).forEach(function (e) {
      var t = e.tags || {};
      var lat = e.lat != null ? e.lat : (e.center && e.center.lat);
      var lon = e.lon != null ? e.lon : (e.center && e.center.lon);
      if (lat == null || lon == null) { return; }
      var brand = brandFromName(t.name || t.brand || "");
      if (!brand) { return; }
      var best = null, bestD = 1e9;
      CENTRES.forEach(function (c) {
        var d = haversine(lat, lon, c.lat, c.lon);
        if (d < bestD) { bestD = d; best = c; }
      });
      if (!best || bestD > best.r) { return; }
      var key = best.id + "|" + brand;
      if (seen[key]) { return; }
      seen[key] = true;
      var addr = [t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" ");
      hits.push({ brand: brand, centre: best.id, lat: lat, lon: lon, addr: addr, hours: t.opening_hours || "", website: t.website || t["contact:website"] || "", osm: "https://www.openstreetmap.org/" + e.type + "/" + e.id, name: t.name || brand });
    });
    return hits;
  }

  function renderVegasTabs() {
    var tabs = document.getElementById("vegasTabs");
    if (!tabs) { return; }
    tabs.innerHTML = "";
    CENTRES.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "vegas-tab" + (c.id === vegasState.active ? " active" : "");
      b.textContent = c.short;
      b.setAttribute("data-centre", c.id);
      b.addEventListener("click", function () { vegasState.active = c.id; renderVegasTabs(); renderVegas(); });
      tabs.appendChild(b);
    });
  }

  function renderVegas() {
    var grid = document.getElementById("vegasGrid"), meta = document.getElementById("vegasMeta");
    if (!grid || !meta) { return; }
    var centre = CENTRES.filter(function (c) { return c.id === vegasState.active; })[0] || CENTRES[0];
    var hits = (vegasState.osm || []).filter(function (h) { return h.centre === centre.id; });
    var hitBy = {};
    hits.forEach(function (h) { hitBy[h.brand] = h; });

    var names = centre.brands.slice();
    hits.forEach(function (h) { if (names.indexOf(h.brand) < 0) { names.push(h.brand); } });
    // Verified-on-map brands lead; the rest follow in editorial order.
    names.sort(function (a, b) { return (hitBy[b] ? 1 : 0) - (hitBy[a] ? 1 : 0); });

    var osmTotal = (vegasState.osm || []).length;
    var pill = vegasState.osmStatus === "ok"
      ? '<span class="live-pill"><i></i> Live · OpenStreetMap · ' + osmTotal + ' maison boutiques mapped on the Strip</span>'
      : vegasState.osmStatus === "pending"
        ? '<span class="live-pill fallback"><i></i> Checking OpenStreetMap…</span>'
        : '<span class="live-pill fallback"><i></i> Editorial lineup · live map unavailable right now</span>';
    meta.innerHTML = pill +
      '<span>' + esc(centre.place) + '</span>' +
      '<a href="' + esc(centre.link[0]) + '" target="_blank" rel="noopener">' + esc(centre.link[1]) + '</a>' +
      '<a href="' + esc(mapsLink(centre.map)) + '" target="_blank" rel="noopener">Open in Maps ↗</a>' +
      '<p class="centre-note">' + esc(centre.note) + '</p>';

    grid.innerHTML = "";
    names.forEach(function (name) {
      var b = B[name]; if (!b) { return; }
      var hit = hitBy[name];
      var card = document.createElement("article");
      card.className = "brand-card";
      var extra = "";
      if (hit) {
        extra = [hit.addr, hit.hours].filter(Boolean).map(esc).join(" · ");
      }
      var note = centre.notes[name] || "";
      card.innerHTML =
        '<div class="brand-art"><span class="brand-mark">' + esc(name) + '</span></div>' +
        '<div class="brand-body">' +
          '<small>' + esc(b.cat) + '</small>' +
          (hit ? '<span class="src-tag osm">Mapped on OpenStreetMap</span>' : '<span class="src-tag">Editorial lineup</span>') +
          (note ? '<p>' + esc(note) + '</p>' : '') +
          (extra ? '<p>' + extra + '</p>' : '') +
          '<p class="img-credit"></p>' +
          '<div class="brand-links">' +
            '<a href="' + esc(mapsLink(name + " " + centre.map)) + '" target="_blank" rel="noopener">Find in Maps ↗</a>' +
            (hit ? '<a href="' + esc(hit.osm) + '" target="_blank" rel="noopener">OSM ↗</a>' : '') +
            '<a href="https://en.wikipedia.org/wiki/' + esc(b.wiki) + '" target="_blank" rel="noopener">House ↗</a>' +
          '</div>' +
        '</div>';
      grid.appendChild(card);
      paintBrandArt(card.querySelector(".brand-art"), name, card.querySelector(".img-credit"));
    });
  }

  function loadVegas() {
    vegasState.osmStatus = "pending";
    renderVegasTabs();
    renderVegas();
    return fetchOverpass().then(function (data) {
      vegasState.osm = assignHits(data && data.elements);
      vegasState.osmStatus = vegasState.osm.length ? "ok" : "empty";
    }).catch(function () {
      vegasState.osm = [];
      vegasState.osmStatus = "fail";
    }).then(renderVegas);
  }

  /* ───────────────────────── Trending: Wikimedia attention index ───────────────────────── */
  var TREND = [
    ["Louis Vuitton", ["Louis_Vuitton"], "Heritage leader"],
    ["Chanel", ["Chanel"], "Heritage leader"],
    ["Hermès", ["Hermès"], "Heritage leader"],
    ["Dior", ["Dior", "Christian_Dior_SE"], "Heritage leader"],
    ["Gucci", ["Gucci"], "Heritage leader"],
    ["Prada", ["Prada"], "Heritage leader"],
    ["Saint Laurent", ["Yves_Saint_Laurent_(brand)", "Saint_Laurent_(brand)"], "Heritage leader"],
    ["Fendi", ["Fendi"], "Heritage leader"],
    ["Bottega Veneta", ["Bottega_Veneta"], "Influential house"],
    ["Loewe", ["Loewe_(fashion_house)", "Loewe_S.A.", "Loewe"], "Influential house"],
    ["Miu Miu", ["Miu_Miu"], "Influential house"],
    ["Celine", ["Celine_(brand)", "Celine"], "Influential house"],
    ["Valentino", ["Valentino_(fashion_house)", "Valentino_S.p.A."], "Influential house"],
    ["Balenciaga", ["Balenciaga"], "Influential house"],
    ["Cartier", ["Cartier_(jeweler)", "Cartier"], "Jewellery & watches"],
    ["Tiffany & Co.", ["Tiffany_%26_Co."], "Jewellery & watches"],
    ["Van Cleef & Arpels", ["Van_Cleef_%26_Arpels"], "Jewellery & watches"],
    ["Bulgari", ["Bulgari"], "Jewellery & watches"],
    ["Rolex", ["Rolex"], "Jewellery & watches"],
    ["Moncler", ["Moncler"], "Performance luxury"]
  ];
  var trendData = [];

  function ymd(d) { return d.getUTCFullYear() + ("0" + (d.getUTCMonth() + 1)).slice(-2) + ("0" + d.getUTCDate()).slice(-2); }

  function pageviews(title, startStr, endStr) {
    var url = "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/" +
      encodeURIComponent(decodeURIComponent(title)).replace(/%2F/g, "/") + "/daily/" + startStr + "00/" + endStr + "00";
    return fetch(url, { headers: { Accept: "application/json" }, signal: timeout(15000) }).then(function (r) {
      if (!r.ok) { throw new Error("pv " + r.status); }
      return r.json();
    }).then(function (d) { return (d.items || []).map(function (i) { return i.views || 0; }); });
  }

  function firstTitle(titles, s, e) {
    function go(i) {
      if (i >= titles.length) { return Promise.reject(new Error("none")); }
      return pageviews(titles[i], s, e).then(function (v) { if (!v.length) { throw new Error("empty"); } return v; }).catch(function () { return go(i + 1); });
    }
    return go(0);
  }

  function fmt(n) { return n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? (n / 1e3).toFixed(n >= 1e5 ? 0 : 1) + "K" : String(n); }

  function loadTrending() {
    var grid = document.getElementById("trendGrid"), meta = document.getElementById("trendMeta");
    if (!grid || !meta) { return Promise.resolve(); }
    grid.innerHTML = '<div class="wire-loading" style="grid-column:1/-1">Reading the attention index…</div>';
    var end = new Date(); end.setUTCDate(end.getUTCDate() - 2);       // newest day with complete data
    var start = new Date(end); start.setUTCDate(start.getUTCDate() - 59);
    var s = ymd(start), e = ymd(end);
    return Promise.all(TREND.map(function (t) {
      return firstTitle(t[1], s, e).then(function (v) { return { name: t[0], tier: t[2], v: v }; }).catch(function () { return null; });
    })).then(function (rows) {
      rows = rows.filter(Boolean).map(function (r) {
        var v = r.v, n = v.length, split = Math.max(0, n - 30);
        var cur = v.slice(split), prev = v.slice(Math.max(0, split - 30), split);
        var sum = function (a) { return a.reduce(function (x, y) { return x + y; }, 0); };
        var c = sum(cur), p = sum(prev);
        return { name: r.name, tier: r.tier, total: c, delta: p ? Math.round(((c - p) / p) * 100) : null, spark: cur };
      }).sort(function (a, b) { return b.total - a.total; });
      trendData = rows;
      if (!rows.length) {
        meta.innerHTML = '<span class="live-pill fallback"><i></i> Attention index unavailable on this network</span>';
        grid.innerHTML = '<div class="wire-empty" style="grid-column:1/-1">The Wikimedia pageview service could not be reached. The Maison Index below lists the same houses by tier.</div>';
        return;
      }
      meta.innerHTML = '<span class="live-pill"><i></i> Live · Wikimedia Pageviews API</span>' +
        '<span>' + start.toISOString().slice(0, 10) + ' → ' + end.toISOString().slice(0, 10) + ' (latest 30 days vs prior 30)</span>' +
        '<span>English Wikipedia · human traffic · attention, not sales</span>';
      grid.innerHTML = "";
      rows.slice(0, 15).forEach(function (r) {
        var max = Math.max.apply(null, r.spark) || 1;
        var bars = r.spark.map(function (x) { return '<i style="height:' + Math.max(6, Math.round((x / max) * 100)) + '%"></i>'; }).join("");
        var d = r.delta == null ? "" : '<span class="trend-delta ' + (r.delta >= 0 ? "up" : "down") + '">' + (r.delta >= 0 ? "▲ " : "▼ ") + Math.abs(r.delta) + '%</span>';
        var card = document.createElement("article");
        card.className = "trend-card";
        card.innerHTML = '<h3>' + esc(r.name) + '</h3><div class="views">' + fmt(r.total) + ' views' + d + '</div><div class="spark" aria-hidden="true">' + bars + '</div><div class="trend-tier">' + esc(r.tier) + '</div>';
        grid.appendChild(card);
      });
      renderPulse();
    });
  }

  function renderPulse() {
    var host = document.getElementById("pulseLive");
    if (!host || !trendData.length) { return; }
    host.innerHTML = "";
    trendData.slice(0, 8).forEach(function (r) {
      var chip = document.createElement("div");
      chip.className = "pulse-chip";
      chip.innerHTML = "<strong>" + esc(r.name) + "</strong><span>" + fmt(r.total) + " views" + (r.delta == null ? "" : " · " + (r.delta >= 0 ? "+" : "") + r.delta + "% vs prior 30d") + "</span>";
      host.appendChild(chip);
    });
  }

  /* ───────────────────────── Collaborations ───────────────────────── */
  var PAIRS = [
    { a: "Louis Vuitton", b: "Supreme", year: "2017", title: "Monogram meets streetwear", body: "A Fall/Winter 2017 capsule that put the Vuitton monogram into skate culture and made the high-low collaboration a mainstream luxury strategy.", lesson: "Borrowed cultural credibility, sold through drop mechanics.", qa: "f", qb: "Supreme streetwear" },
    { a: "Dior", b: "Nike", year: "2020", title: "Air Jordan 1 High OG Dior", body: "A tightly limited sneaker release in Dior's grey and white palette that turned a couture house into a resale-market headline.", lesson: "Scarcity plus sport heritage, with resale as a brand-equity signal.", qa: "f", qb: "Nike Air Jordan sneakers" },
    { a: "Fendi", b: "Versace", year: "2021", title: "Fendace", body: "Two Italian houses swapped creative directors and each reinterpreted the other's codes in a joint collection shown in Milan.", lesson: "Two heritage identities, one controlled moment of desire.", qa: "f", qb: "Versace runway" },
    { a: "Gucci", b: "Balenciaga", year: "2021", title: "The Hacker Project", body: "Gucci's 100th-anniversary collection, shown as the \"Aria\" presentation, reworked Balenciaga codes and Gucci's own archive under one Kering roof.", lesson: "Sister brands competing and collaborating inside a portfolio.", qa: "f", qb: "Balenciaga runway" },
    { a: "Tiffany & Co.", b: "Patek Philippe", year: "2021", title: "Nautilus in Tiffany Blue", body: "A numbered, limited Nautilus with a Tiffany Blue dial, sold through a single retail partnership and priced far above its standard sibling.", lesson: "A colour trademark becomes a transferable luxury asset.", qa: "j", qb: "Patek Philippe watch" },
    { a: "Louis Vuitton", b: "Yayoi Kusama", year: "2012 · 2023", title: "Dots across the monogram", body: "Two chapters with the Japanese artist, from window installations to leather goods, treating the maison as a canvas for art.", lesson: "Art collaboration lifts price perception without discounting heritage.", qa: "f", qb: "Yayoi Kusama exhibition" },
    { a: "Prada", b: "adidas", year: "2019 →", title: "Re-Nylon meets Superstar", body: "A continuing partnership that blends Prada's industrial nylon language with adidas footwear, crossing luxury and sportswear audiences.", lesson: "A long-running collaboration as a platform, not a one-off drop.", qa: "f", qb: "adidas sneakers" },
    { a: "Hermès", b: "Apple", year: "2015 →", title: "Apple Watch Hermès", body: "Hermès leather bands and exclusive watch faces sold through Hermès stores, a rare technology partnership that kept the house's own retail control.", lesson: "Craft leads, technology follows, distribution stays with the house.", qa: "f", qb: "Apple Watch" },
    { a: "Chanel", b: "Pharrell Williams", year: "2019", title: "Chanel x Pharrell capsule", body: "A capsule of ready-to-wear and accessories that reworked the Chanel codes through a cultural figure's eye.", lesson: "A cultural ambassador as co-author, inside a very controlled house.", qa: "f", qb: "Pharrell Williams" }
  ];

  function pairImage(name, kind) {
    if (B[name]) { return resolveBrandImage(name, B[name].kind); }
    if (imgCache[name]) { return imgCache[name]; }
    var q = kind;
    imgCache[name] = enqueue(function () {
      return C.fetchFashionImages(q, 4).catch(function () { return []; }).then(function (rows) {
        rows = rows.filter(function (r) { return !C.isLogoLike(r.title) && !C.isLogoLike(r.url); });
        return firstVerified(rows);
      }).catch(function () { return null; });
    });
    return imgCache[name];
  }

  function renderPairs() {
    var grid = document.getElementById("pairGrid");
    if (!grid) { return; }
    grid.innerHTML = "";
    PAIRS.forEach(function (p) {
      var card = document.createElement("article");
      card.className = "pair-card";
      card.innerHTML =
        '<div class="pair-art"><div class="pair-half" data-n="a"><span>' + esc(p.a) + '</span></div><div class="pair-x">×</div><div class="pair-half" data-n="b"><span>' + esc(p.b) + '</span></div></div>' +
        '<div class="pair-body"><div class="year">' + esc(p.year) + '</div><h3>' + esc(p.title) + '</h3><p>' + esc(p.body) + '</p><p class="lesson">' + esc(p.lesson) + '</p></div>';
      grid.appendChild(card);
      [["a", p.a, p.qa], ["b", p.b, p.qb]].forEach(function (x) {
        var slot = card.querySelector('[data-n="' + x[0] + '"]');
        slot.style.backgroundImage = 'url("' + brandFallbackSvg(x[1]) + '")';
        pairImage(x[1], x[0] === "a" ? x[1] : p.qb).then(function (res) {
          if (!res) { return; }
          var img = document.createElement("img");
          img.alt = x[1]; img.loading = "lazy"; img.decoding = "async"; img.referrerPolicy = "no-referrer";
          img.onerror = function () { img.remove(); };
          img.src = res.url;
          slot.insertBefore(img, slot.firstChild);
        });
      });
    });
  }

  /* ───────────────────────── Las Vegas weather ───────────────────────── */
  var WX = { 0: "Clear", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast", 45: "Fog", 48: "Fog", 51: "Drizzle", 53: "Drizzle", 55: "Drizzle", 61: "Rain", 63: "Rain", 65: "Heavy rain", 71: "Snow", 80: "Showers", 81: "Showers", 82: "Heavy showers", 95: "Thunderstorm" };
  function loadWeather() {
    var node = document.getElementById("vegasWeather");
    if (!node) { return; }
    var url = "https://api.open-meteo.com/v1/forecast?latitude=36.1147&longitude=-115.1728&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=America%2FLos_Angeles";
    fetch(url, { signal: timeout(10000) }).then(function (r) { if (!r.ok) { throw new Error("wx"); } return r.json(); }).then(function (d) {
      var c = d.current || {};
      if (c.temperature_2m == null) { throw new Error("wx"); }
      node.textContent = Math.round(c.temperature_2m) + "°F · " + (WX[c.weather_code] || "Strip conditions");
    }).catch(function () { node.textContent = "Pacific Time"; });
  }

  /* ───────────────────────── Global image rescue ───────────────────────── */
  // Any <img> that fails and is not managed by a recovery chain is swapped for designed artwork,
  // so no broken-image icon can ever appear.
  document.addEventListener("error", function (ev) {
    var t = ev.target;
    if (!t || t.tagName !== "IMG" || t.onerror || t.getAttribute("data-rescued")) { return; }
    t.setAttribute("data-rescued", "1");
    t.classList.add("image-fallback");
    t.src = C.fashionFallbackSvg(t.alt || "Atelier");
  }, true);

  /* ───────────────────────── Boot ───────────────────────── */
  function refresh() {
    imgCache = {};
    loadVegas();
    loadTrending();
    loadWeather();
  }

  window.AtelierPro = { refresh: refresh, renderPulse: renderPulse };

  function start() {
    renderPairs();
    loadVegas();
    loadTrending();
    loadWeather();
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", start); } else { start(); }
})();
