/* ============================================================
   app.js — presentation engine
   ------------------------------------------------------------
   • A fixed 1920 x 1080 stage is scaled to fit the window (fit()).
     Every value in the CSS is a Figma value in px.
   • Only ONE slide lives in the DOM at a time (plus the one
     cross-fading out). 100 or 1,000 slides cost the same.
   • Images load lazily: a 24px blur placeholder is inline, the
     real WebP streams in, and the NEXT slide's image is
     pre-fetched while the user reads.
   • State (journey + in-slide choices) lives in the URL hash,
     so links are shareable and Back/Forward work.
   • Community personalisation (section 05) and the investment
     focus copy (section 03) read communities.js; see the
     "communities: archetypes & highlighting" block below.
   ============================================================ */
(() => {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const h = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const IMG = "img/";
  const LQIP = window.LQIP || {};
  // src(): resolves an image name to a URL. If a build inlined images (window.IMGDATA), use those.
  // A name with a slash or an extension ("assets/slide-42-map.png") is used as-is.
  const src = (n, mobile) => /[\/.]/.test(n) ? n : (window.IMGDATA && window.IMGDATA[n]) || `${IMG}${n}${mobile ? "-m" : ""}.webp`;
  const stage = $("#stage"), slidesEl = $("#slides"), sectionsEl = $("#sections"), viewport = $("#viewport");

  /* ---------------- stage scaling ---------------- */
  const MOBILE = window.matchMedia("(max-width: 900px)");   // the mobile layout in index.html (no stage scaling)
  function fit() {
    if (MOBILE.matches) { viewport.style.removeProperty("--s"); viewport.style.removeProperty("--W"); viewport.style.removeProperty("--H"); return; }
    const cs = getComputedStyle(viewport);
    const w = viewport.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const hh = viewport.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const sc = Math.max(.05, Math.min(w / 1920, hh / 1080));
    // scale to fit, then let the stage grow past 1920 × 1080 so it covers the whole window
    viewport.style.setProperty("--s", sc);
    viewport.style.setProperty("--W", Math.max(1920, w / sc) + "px");
    viewport.style.setProperty("--H", Math.max(1080, hh / sc) + "px");
  }
  window.addEventListener("resize", fit);
  if (window.ResizeObserver) new ResizeObserver(fit).observe(viewport);
  fit();

  /* ---------------- state & routing ---------------- */
  const state = { id: null, market: null, choices: {} };   // choices: ptype, profile, goal, etc.
  const local = {};                                         // per-session UI state not worth a URL (revealed cards, open accordions)
  const DEFAULT_MARKET = "dubai";
  const marketOf = () => state.market || DEFAULT_MARKET;

  function path() { return DECK.slides.filter(s => !s.market || s.market === marketOf()); }

  /* ---------------- communities: archetypes & highlighting ----------------
     Data lives in communities.js (one fixed profile per community + a `fit`
     grid). The visitor's goals come from the URL: `goal=` (main) and
     `goals=` (up to two additional), written by form.html. They map to
     archetypes A1–A5 via COMMUNITIES.archetypes. The archetype only decides
     which communities are highlighted — never what a card says.             */
  const CM = window.COMMUNITIES || { archetypes: {}, slots: {}, dubai: [], abudhabi: [] };
  const GOAL_TO_A = Object.fromEntries(Object.entries(CM.archetypes).map(([a, x]) => [x.goal, a]));
  const SHARE = { main: 70, pool: 30 };                 // mirrors form.html → SHARES
  const SKYLINE_MAX = 8;                                // pins shown on s5-open
  function goalsOf() {
    const ids = [state.choices.goal, ...String(state.choices.goals || "").split(",")].filter(Boolean);
    return [...new Set(ids.map(g => GOAL_TO_A[g]).filter(Boolean))];
  }
  const fitSum = c => Object.values(c.fit || {}).reduce((a, b) => a + b, 0);
  function scoreOf(c, goals) {
    if (!goals.length) return 0;
    const f = c.fit || {}, [main, ...adds] = goals;
    return (f[main] || 0) * SHARE.main + adds.reduce((t, a) => t + (f[a] || 0) * (SHARE.pool / adds.length), 0);
  }
  const listOf = mk => CM[mk] || [];
  const isHighlighted = (c, goals) => !goals.length || scoreOf(c, goals) > 0;
  function featured(mk, goals, n = SKYLINE_MAX) {
    const list = listOf(mk).map((c, i) => ({ c, i, s: goals.length ? scoreOf(c, goals) : fitSum(c) }));
    return list.filter(x => x.s > 0).sort((a, b) => b.s - a.s || a.i - b.i).slice(0, n).map(x => x.c);
  }
  const findCommunity = (mk, name) => listOf(mk).find(c => c.name === name || c.short === name);
  const audienceLine = goals => goals.length && CM.archetypes[goals[0]] ? CM.archetypes[goals[0]].line : "";
  function cardOf(c) {
    if (!c) return null;
    return {
      name: c.name, short: c.short || c.name, status: c.market, market: c.market, type: c.types,
      price: c.psf, priceLabel: "AED / sqft", yield: c.yield, yieldLabel: "Average gross rental yield",
      entry: c.entry, entryLabel: "Entry price / AED", range: c.range, rangeLabel: "Price range / AED",
      more: [["Typical annual rent", c.rent], ["Service charge / sqft", c.service], ["5-yr price growth", c.growth5y], ["Avg. days to sell", c.daysToSell]].filter(([, v]) => v),
      photo: c.photo, blurb: c.overview, source: c.source,
      notes: [["Connectivity & landmarks", c.connectivity], ["Main buyer & rental demand", c.demand], ["Key strengths", c.strengths], ["Costs, limitations & risks", c.risks]]
    };
  }
  function indexOf(id) { return path().findIndex(s => s.id === id); }
  const byId = id => DECK.slides.find(s => s.id === id);

  function readHash() {
    const m = location.hash.match(/^#\/?([^?]*)\??(.*)$/);
    const id = m && m[1] ? decodeURIComponent(m[1]) : DECK.slides[0].id;
    const q = new URLSearchParams(m ? m[2] : "");
    if (q.get("m") && DECK.markets[q.get("m")]) state.market = q.get("m");
    q.forEach((v, k) => { if (k !== "m") state.choices[k] = v; });
    return byId(id) ? id : DECK.slides[0].id;
  }
  function writeHash(replace) {
    const q = new URLSearchParams();
    if (state.market) q.set("m", state.market);
    Object.entries(state.choices).forEach(([k, v]) => q.set(k, v));
    const hash = "#/" + state.id + (q.toString() ? "?" + q : "");
    if (hash === location.hash) return;
    history[replace ? "replaceState" : "pushState"](null, "", hash);
  }

  /* ---------------- images ---------------- */
  function bgHTML(name, cls = "") {
    if (!name) return "";
    const lq = LQIP[name] ? ` style="background-image:url(${LQIP[name]})"` : "";
    return `<div class="bg ${cls}"${lq}><img alt="" decoding="async" fetchpriority="high"
      src="${src(name, true)}" srcset="${src(name, true)} 960w, ${src(name)} 1920w" sizes="1920px"
      onload="this.classList.add('ready')"></div>`;
  }
  const photoURL = name => name ? `url(${src(name)})` : "";
  function preload(slide) {
    if (!slide) return;
    [slide.bg, slide.bg2, ...(slide.photos || []), ...((slide.cities || []).map(c => c.photo))].filter(Boolean)
      .forEach(n => { const i = new Image(); i.src = src(n); });
  }

  /* ---------------- shared pieces ---------------- */
  const ICO = {
    dubai: `<svg width="24" height="31" viewBox="0 0 24 31" fill="#e0bb9e" aria-hidden="true"><path transform="translate(7.96 21.5)" d="M7.153 0L0.734 4.063L0 4.063L0 0L7.153 0Z"/><path transform="translate(9.16 21.8)" d="M8.517 0C8.41 1.854 7.981 3.648 7.327 5.39L0 5.39L8.517 0Z"/><path transform="translate(7.96 11.21)" d="M3.98 0L0 3.184L0 0L3.98 0Z"/><path transform="translate(3.08 9.58)" d="M3.25 0L3.25 1.625L0 1.625L0 0L3.25 0Z"/><path transform="translate(3.62 2.81)" d="M1.083 0L2.708 0L2.708 23.833L0 23.833L1.083 0Z"/><path transform="translate(2 25.56)" d="M18.417 0L18.417 1.625L0 1.625L0 0L18.417 0Z"/><path transform="translate(7.96 5.29)" d="M0.807 0.454C2.592 1.459 4.173 2.763 5.509 4.296L0 4.296L0 0L0.807 0.454Z"/><path transform="translate(7.96 16.08)" d="M6.021 0L0 3.713L0 0L6.021 0Z"/><path transform="translate(10.93 16.12)" d="M6.095 0C6.444 1.221 6.661 2.481 6.743 3.759L0 3.759L6.095 0Z"/><path transform="translate(10.48 11.11)" d="M5.978 3.348L0 3.348L4.185 0C4.913 1.036 5.509 2.173 5.978 3.348Z"/></svg>`,
    abudhabi: `<svg width="30" height="31" viewBox="0 0 30 31" fill="#e0bb9e" aria-hidden="true"><path d="M15 2a8 8 0 0 0-8 8v3h16v-3a8 8 0 0 0-8-8zm-3 4.5h6v2h-6zM3 15h24v2H3zm2 4h20l-2 10H7z"/><circle cx="15" cy="8" r="2.2" fill="#1f343f"/></svg>`,
    quote: `<svg width="49" height="41" viewBox="0 0 49 41" aria-hidden="true"><path d="M18.393 0L19.166 1.082C13.292 4.791 10.201 9.737 10.201 15.147C10.201 20.866 14.529 26.739 21.175 30.912L13.138 40.804C5.101 37.713 0 31.067 0 23.03C0 13.292 8.655 4.791 18.393 0ZM46.214 0L46.987 1.082C41.114 4.791 38.022 9.737 38.022 15.147C38.022 20.866 42.35 26.739 48.996 30.912L40.959 40.804C32.922 37.713 27.821 31.067 27.821 23.03C27.821 13.292 36.477 4.791 46.214 0Z" fill="currentColor"/></svg>`,
    chev: `<svg width="18" height="13" viewBox="0 0 18 13" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M2 2l7 8 7-8"/></svg>`,
    arrow: `<svg class="arrow-r" width="22" height="14" viewBox="0 0 22 14" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M14 1l6 6-6 6M20 7H0"/></svg>`,
    arrowBig: `<svg width="35.667" height="22" viewBox="0 0 35.667 22" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M0 11H34.833"/><path d="M24.667 0L35.667 11L24.667 22"/></svg>`,
    ext: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M3 9 9 3M4 3h5v5"/></svg>`,
    cursor: `<svg width="38" height="33" viewBox="0 0 38 33" fill="none" stroke="#fff" stroke-width="1.4" aria-hidden="true"><path d="M14 2v14M14 16l-4-3-3 2 8 10h11l4-7-3-5-13-3"/></svg>`,
    trend: `<svg width="59" height="53" viewBox="0 0 59 53" aria-hidden="true"><defs><linearGradient id="tg" gradientUnits="userSpaceOnUse" x1="1.25" y1="-6.8" x2="-6.75" y2="36.7"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient></defs><path transform="matrix(-1 0 0 1 49 7.7)" d="M0 41L2.65 21.7L29.6 17.5L41 0" fill="none" stroke="url(#tg)"/><rect transform="matrix(0.71 0.71 -0.71 0.71 7.81 2.7)" width="6.81" height="6.81" fill="#f3777a"/><path transform="matrix(-0.15 -0.99 -0.99 0.15 56.24 47.67)" d="M0 7.5L6.8 0M0 7.5l6.8 7.5" fill="none" stroke="#fff"/></svg>`
  };
  const icon = dir => dir === "down"
    ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M4 8c3 3 6 6 9 5s4-4 7 1"/><path d="M20 10v4h-4"/></svg>`
    : dir === "flat" ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3 12h18"/></svg>`
    : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M4 16c3-3 6-6 9-5s4 4 7-1"/><path d="M20 14v-4h-4"/></svg>`;

  /* ---------------- currencies (2.3 global comparison) ----------------
     All figures in slides.js are written in AED as "Dhs 1.102 million", "Dhs 66,000–77,000", "Dhs 5,900–8,800 per year".
     convertDhs() rewrites every "Dhs <number>[–<number>] [million]" in a string into the chosen currency.
     RATES ARE INDICATIVE — update `rate` (value of 1 AED) and CURRENCY_AS_OF when the content is refreshed.
     AED, USD and SAR are pegged, so those three never change. */
  const CURRENCIES = {
    AED: { label: "UAE dirham",     symbol: "Dhs ",  rate: 1 },
    USD: { label: "US dollar",      symbol: "US$",   rate: 0.2723 },
    GBP: { label: "British pound",  symbol: "£",     rate: 0.205 },
    EUR: { label: "Euro",           symbol: "€",     rate: 0.235 },
    INR: { label: "Indian rupee",   symbol: "₹",     rate: 24.1 },
    SAR: { label: "Saudi riyal",    symbol: "SAR ",  rate: 1.021 }
  };
  const CURRENCY_AS_OF = "October 2026";
  function convertDhs(text, key) {
    const c = CURRENCIES[key]; if (!c || key === "AED" || !text) return text;
    const num = (n, mil) => parseFloat(String(n).replace(/,/g, "")) * (mil ? 1e6 : 1) * c.rate;
    const fmt = v => {
      if (v >= 1e6) return (v / 1e6).toFixed(v >= 1e7 ? 2 : 3).replace(/\.?0+$/, "") + " million";
      const step = v >= 100000 ? 1000 : v >= 10000 ? 100 : 10;
      return (Math.round(v / step) * step).toLocaleString("en-GB");
    };
    // "Dhs 1.836–2.093 million": the "million" applies to both ends of the range
    return text.replace(/Dhs\s*([\d.,]+)(?:\s*[–-]\s*([\d.,]+))?(\s*million)?/g, (m, a, b, mil) => {
      const A = fmt(num(a, mil)), B = b ? fmt(num(b, mil)) : "";
      if (!B) return c.symbol + A;
      const am = / million$/.test(A), bm = / million$/.test(B);
      return c.symbol + (am && bm ? A.replace(" million", "") + "–" + B : A + "–" + B);
    });
  }

  const numTitle = s => `${h(s.num)} ${h(s.title)}`;
  const title = (s, cls = "t-title") => `<h1 class="${cls}">${s.num ? `<span class="t-small">${h(s.num)}</span> ` : ""}${h(s.title)}</h1>`;
  const placeLine = s => s.city ? `<div class="place">${s.city.toLowerCase().includes("abu") ? ICO.abudhabi : ICO.dubai}<span>${h(s.city)}</span></div>` : "";
  const bigV = x => `${x.pre ? `<span class="u">${h(x.pre)}</span> ` : ""}${h(x.v)}${x.unit ? `<span class="u">${h(x.unit)}</span>` : ""}`;
  const sparkline = trend => {
    const pts = trend < 0 ? "0,40 60,44 110,62 170,70 240,86 290,92 320,80" : trend > 0 ? "0,100 60,98 110,92 170,80 240,46 290,38 320,40" : "0,72 60,72 110,70 170,73 240,72 290,72 320,72";
    const [lx, ly] = pts.split(" ").pop().split(",").map(Number), d = 6.5;   // last point = diamond centre; d = half its width
    return `<svg viewBox="0 0 397 212" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="sg${trend + 1}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff787a" stop-opacity=".55"/><stop offset="1" stop-color="#ff787a" stop-opacity="0"/></linearGradient></defs>
      <line x1="0" x2="397" y1="12" y2="12" stroke="currentColor" stroke-opacity=".3" stroke-dasharray="3 4"/>
      <line x1="0" x2="397" y1="72" y2="72" stroke="currentColor" stroke-opacity=".5"/>
      <line x1="0" x2="397" y1="132" y2="132" stroke="currentColor" stroke-opacity=".3" stroke-dasharray="3 4"/>
      <polygon points="0,212 ${pts} 397,${ly} 397,212" fill="url(#sg${trend + 1})"/>
      <polyline points="${pts}" fill="none" stroke="#f3777a" stroke-width="1.2"/>
      <polygon points="${lx},${ly - d} ${lx + d},${ly} ${lx},${ly + d} ${lx - d},${ly}" fill="#f3777a"/></svg>`;
  };
  const switchHTML = (c, cur, cls = "") => `<div class="switch on ${cls}" data-key="${h(c.key)}"><span class="label">${h(c.label)}</span><span class="track">
      ${c.options.map(([k, l]) => `<button type="button" data-val="${h(k)}" aria-pressed="${cur === k}">${h(l)}</button>`).join("")}</span></div>`;
  const marketChoices = (attr = "") => Object.entries(DECK.markets).map(([k, m]) => `<button type="button" class="choice" data-market="${k}" ${attr} aria-pressed="${state.market === k}">${h(m.label)}</button>`).join("");
  const pagerIn = (s, page, pages, per, n) => pages > 1 ? `<div class="pager-in">${Array.from({ length: pages }, (_, i) => `<button type="button" data-page="${i}" aria-pressed="${i === page}">${String(i * per + 1).padStart(2, "0")}–${String(Math.min(n, i * per + per)).padStart(2, "0")}</button>`).join("")}</div>` : "";
  const callouts = list => (list || []).map(c => `<span class="callout" style="left:${c.x * 100}%;top:${c.y * 100}%">${h(c.label)}</span>`).join("");

  /* ---------------- templates ---------------- */
  const TPL = {
    cover: s => `${bgHTML(s.bg)}<div class="inner">
      <header class="hero"><h1>${s.title.replace(/ investment/, "<br>investment")}</h1><p class="sub">${h(s.sub)}</p></header>
      <nav class="choices" aria-label="Choose your guide">${marketChoices('data-pick="1"')}
        <button type="button" class="choice next ${state.market ? "on" : ""}" data-go="next" ${state.market ? "" : "disabled"} aria-label="Next" title="${state.market ? "" : "Choose a guide to continue"}">${ICO.arrowBig}</button></nav>
      <p class="hint">You can switch guide at any time from the menu (M).</p>
      <div class="brand" aria-label="betterhomes">${$(".logo svg").outerHTML}</div></div>`,

    toc: s => {
      // split the groups into two columns of roughly equal row count
      const rows = g => 1 + g.items.length, total = s.groups.reduce((t, g) => t + rows(g), 0);
      let half = 0, acc = 0; while (half < s.groups.length && acc + rows(s.groups[half]) <= total / 2 + 1) acc += rows(s.groups[half++]);
      const col = gs => gs.map(g => `<li class="row ch"><button type="button" data-jump="${h(g.page)}"><b>${h(g.title)}</b></button><span>${h(g.page)}</span></li>
        ${g.items.map(i => `<li class="row sub"><button type="button" data-jump="${h(i.slice(0, 3))}">${h(i)}</button></li>`).join("")}`).join("");
      return `<div class="inner"><h1>${h(s.title)}</h1><ul class="col l">${col(s.groups.slice(0, half))}</ul><ul class="col r">${col(s.groups.slice(half))}</ul></div>`;
    },

    opener: s => {
      const ondark = s.ondark ? "ondark" : "";
      if (s.simple) {
        const cur = s.chooser ? (state.choices[s.chooser.key] || "") : "";
        return `${bgHTML(s.bg)}${s.inkTitle ? "" : `<div class="shade topleft"></div>`}<div class="inner tpl-opener simple ${ondark} ${s.inkTitle ? "ink" : ""}">
          <div class="t-num">${h(s.num)}</div><h1 class="t-hero">${h(s.title)}</h1><hr class="hr top-rule">
          <div class="head"><div class="l"><div class="copy spaced">${(s.paras || [s.lede, s.body]).filter(Boolean).map(p => `<p>${h(p)}</p>`).join("")}</div>
            ${s.cta ? `<button type="button" class="cta" ${s.cta.jump ? `data-jump-id="${h(s.cta.jump)}"` : `data-go="next"`}>${h(s.cta.label)} ${ICO.arrow}</button>` : ""}</div>
          <div class="r">${s.chooser ? `<div class="switch ${cur ? "on" : ""}" data-key="${h(s.chooser.key)}"><span class="label">${h(s.chooser.label)}</span><div class="row"><span class="track">${s.chooser.options.map(([k, l]) => `<button type="button" data-val="${h(k)}" aria-pressed="${cur === k}">${h(l)}</button>`).join("")}</span><button type="button" class="go" data-go="next" aria-label="Continue">${ICO.arrowBig}</button></div></div>` : ""}</div></div>
          ${s.pending ? `<p class="pending">${h(s.pending)}</p>` : ""}</div>`;
      }
      return `${bgHTML(s.bg)}<div class="shade ${s.shade || "bottom"}"></div><div class="inner tpl-opener ${ondark}">
        <div class="head"><div class="l">
          <div class="t-num">${h(s.num)}</div><h1 class="t-hero">${h(s.title)}</h1><hr class="hr">
          ${s.kicker ? `<div class="kicker">${h(s.kicker)}</div>` : ""}
          <div class="copy">${s.lede ? `<p>${h(s.lede)}</p>` : ""}${s.body ? `<p>${h(s.body)}</p>` : ""}</div>
        </div><div class="r">${s.author ? `
          <div class="author"><div class="ph" style="background-image:${photoURL(s.author.photo)}"></div><div><div class="name">${h(s.author.name)}</div><div class="role">${h(s.author.role)}</div></div></div>
          <div class="quote"><div class="qh"><span class="quote-mark">${ICO.quote}</span><h3 class="t-h3">${h(s.author.quoteTitle)}</h3></div><p class="copy">${h(s.author.quote)}</p></div>` : ""}</div></div>
        ${s.stats ? `<div class="stats-wrap"><h2 class="stats-title">${h(s.statsTitle)}</h2><div class="stats">${s.stats.map(x => `<div class="stat"><div class="v">${bigV(x)}</div>${x.unit2 ? `<div class="u">${h(x.unit2)}</div>` : ""}<p class="t">${h(x.t)}</p></div>`).join("")}</div></div>` : ""}
        ${s.reasons ? `<div class="stats-wrap"><h2 class="t-h2">${h(s.statsTitle)}</h2><div class="reasons">${s.reasons.map(r => `<div>${r.l ? `<div class="l">${h(r.l)}</div>` : ""}${r.v ? `<div class="v">${bigV(r)}</div>` : ""}${r.v2 ? `<div class="v2">${h(r.v2)}</div>` : ""}${r.l2 ? `<div class="l">${h(r.l2)}</div>` : ""}<p class="t">${h(r.t)}</p></div>`).join("")}</div>${s.foot ? `<p class="t-body" style="margin-top:28px">${h(s.foot)}</p>` : ""}</div>` : ""}</div>`;
    },

    learn: s => `${bgHTML(s.bg)}<div class="shade dim"></div><div class="inner tpl-learn">
      <h1 class="t-title">${numTitle(s)}</h1><p class="t-body">${h(s.lede)}</p><hr class="hr" style="margin-top:28px">
      <div class="grid" style="grid-template-columns:repeat(${s.cols.length},1fr)">${s.cols.map(c => `<div class="col"><span class="n">${h(c.n)}</span><h3>${h(c.h)}</h3><div class="rule"></div>
        ${c.items.map(([b, t, jump]) => `<div class="item"><button type="button" ${jump ? `data-jump-id="${h(jump)}"` : ""}><b>${h(b)}</b><p>${h(t)}</p></button></div>`).join("")}</div>`).join("")}</div></div>`,

    hub: s => `${bgHTML(s.bg, s.bg2 ? "first" : "")}${s.bg2 ? bgHTML(s.bg2, "second") : ""}${s.shade ? `<div class="shade ${s.shade}"></div>` : ""}
      ${callouts(s.callouts)}
      <div class="inner tpl-hub">${placeLine(s)}${title(s)}<hr class="hr head-rule">
      <div class="text ${s.cols ? "cols-2" : ""}">${s.lede ? `<p class="t-lead">${h(s.lede)}</p>` : ""}${(s.paras || (s.body ? [s.body] : [])).map(p => `<p class="t-body">${h(p)}</p>`).join("")}${s.cols ? s.cols.map(c => `<p class="t-body">${h(c)}</p>`).join("") : ""}</div>
      ${s.aside ? `<div class="aside"><h3>${h(s.aside.h)}</h3><p class="t-body" style="margin-bottom:8px">${h(s.aside.t)}</p><ul>${s.aside.items.map(i => `<li>${h(i)}</li>`).join("")}</ul></div>` : ""}
      ${s.nochoice ? "" : state.market ? `<div class="choose"><div class="choices"><span class="choice tag">${h(DECK.markets[state.market].label)} journey</span><button type="button" class="choice next on" data-go="next" aria-label="Continue">${ICO.arrowBig}</button></div></div>`
      : `<div class="choose"><h2 class="prompt">${h(s.prompt || "Choose your view")}</h2><div class="choices">${marketChoices()}<button type="button" class="choice next" data-go="next" disabled aria-label="Continue">${ICO.arrowBig}</button></div></div>`}</div>`,

    signals: s => {
      const seen = local["seen-" + s.id] || new Set();
      const firstBlur = s.signals.findIndex((_, i) => i > 0 && !seen.has(i));
      return `${bgHTML(s.bg)}<div class="shade soft"></div><div class="inner tpl-signals ${s.pending ? "pending" : ""}">${placeLine(s)}<h1 class="t-title">${h(s.title)}</h1><hr class="hr head-rule">
        <p class="t-lead lead">${h(s.lede)}</p><h2 class="t-h2 group-t">${h(s.group)}</h2>
        <hr class="hr accent"><div style="position:relative;margin-top:-8px"><span style="position:absolute;left:123px;top:-18px">${icon("up")}</span></div>
        <div class="grid">${s.signals.map((x, i) => `<div class="sig ${i > 0 && !seen.has(i) && !s.pending ? "blur" : ""}" data-reveal="${i}"><div class="in">
          <div class="v ${x.v.length > 7 ? "sm" : ""}">${h(x.v)}</div><div class="l">${h(x.l)}</div><div class="t">${h(x.t)}</div>${x.dir ? `<span class="ic">${ICO.trend}</span>` : ""}</div>
          ${i === firstBlur && !s.pending ? `<div class="hintnav">${ICO.cursor}Click to see</div>` : ""}</div>`).join("")}</div>
        <div class="notes">${s.note.h ? `<h3>${h(s.note.h)}</h3>` : ""}${(s.note.paras || [s.note.t]).map(p => `<p>${h(p)}</p>`).join("")}</div></div>`;
    },

    chartcards: s => `${bgHTML(s.bg)}${s.bg ? `<div class="shade bottom"></div>` : ""}<div class="inner tpl-chartcards ${s.plain ? "plain" : ""}">${placeLine(s)}<h1 class="t-title">${h(s.title)}</h1><hr class="hr head-rule">
      <div class="grid">${s.axis && !s.plain ? `<div class="axis">${s.axis.map(a => `<span>${h(a)}</span>`).join("")}</div>` : ""}
      ${s.cards.map(c => `<div class="card">${s.plain ? "" : sparkline(c.trend)}<div class="v">${bigV(c)}</div><hr class="hr"><div class="l">${h(c.l)}</div><div class="t">${h(c.t)}</div></div>`).join("")}</div>
      <div class="notes">${s.notes.length === 1 ? `<h3>${h(s.notes[0].h)}</h3>${(s.notes[0].paras || [s.notes[0].t]).map(p => `<p style="margin-top:14px">${h(p)}</p>`).join("")}`
        : `<div class="cols">${s.notes.map(n => `<div>${n.h ? `<h3>${h(n.h)}</h3>` : ""}${(n.paras || [n.t]).map(p => `<p>${h(p)}</p>`).join("")}</div>`).join("")}</div>`}${s.wide ? `<p class="wide">${h(s.wide)}</p>` : ""}</div></div>`,

    statgrid: s => `<div class="inner tpl-statgrid ${s.pending ? "pending" : ""}">${placeLine(s)}<h1 class="t-title">${h(s.title)}</h1><hr class="hr head-rule">
      <div class="grid">${s.stats.map(x => `<div class="tile">${x.photo ? `<div class="ph" style="background-image:${photoURL(x.photo)}"></div>` : ""}
        <div class="v">${h(x.v)}</div><hr class="hr"><div class="l">${h(x.l)}</div><div class="t">${h(x.t)}</div></div>`).join("")}</div>
      ${s.rows ? `<div class="rows">${s.rows.map(r => `<div class="row"><h3>${h(r.h)}</h3>${r.cols ? r.cols.map(c => `<p>${h(c)}</p>`).join("") : `<p style="grid-column:1/-1;max-width:1300px">${h(r.t)}</p>`}</div>`).join("")}</div>` : ""}
      ${s.latest ? `<div class="latest"><h3>${h(s.latest.h)}</h3><div class="grid">${s.latest.items.map(([v, t]) => `<div><div class="v">${h(v)}</div><p>${h(t)}</p></div>`).join("")}</div></div>` : ""}</div>`,

    survey: s => `<div class="inner tpl-survey">${placeLine(s)}<h1 class="t-title">${h(s.title)}</h1><hr class="hr head-rule">
      <div class="grid">${s.stats.map(x => `<div class="tile">${x.photo ? `<div class="ph" style="background-image:${photoURL(x.photo)}"></div>` : ""}
        <div class="v">${h(x.v)}</div><hr class="hr"><div class="l">${h(x.l)}</div><div class="t">${h(x.t)}</div></div>`).join("")}</div></div>`,

    compare: s => {
      const ph = s.photos || [], n = s.head.length - 1, R = s.rows.length + 1;
      const cols = `grid-template-columns:${n > 2 ? "1.3fr " + "1fr ".repeat(n) : "523px 1fr 1fr"};grid-template-rows:repeat(${R},auto)`;
      const cell = (txt, i, k, cls) => `<div class="${cls}" style="grid-column:${k + 1};grid-row:${i + 1}">${txt}</div>`;
      let cells = `<div class="panel-bg" style="grid-column:1;grid-row:1/${R + 1}"></div>` + s.head.slice(1).map((c, i) => `<div class="mcol" style="grid-column:${i + 2};grid-row:1/${R + 1};background-image:${photoURL(ph[i])}"><div class="glass-in"></div></div>`).join("");
      cells += cell(h(s.head[0]), 0, 0, "panel h") + s.head.slice(1).map((c, i) => cell(`${h(c)}${s.subhead ? `<small>${h(s.subhead[i])}</small>` : ""}`, 0, i + 1, "mc h")).join("");
      s.rows.forEach((r, i) => { cells += cell(h(r[0]), i + 1, 0, "panel r") + r.slice(1).map((c, k) => cell(h(c), i + 1, k + 1, "mc r")).join(""); });
      return `<div class="inner tpl-compare">${title(s)}${s.intro ? `<p class="t-lead" style="margin-top:10px">${h(s.intro)}</p>` : ""}<hr class="hr head-rule">
        <div class="scrollx"><div class="wrap ${n > 2 ? "wide" : ""}" style="${cols}">${cells}</div></div>
        ${s.after ? `<div class="after">${s.after.lead ? `<div class="lead">${h(s.after.lead)}</div>` : ""}${s.after.h ? `<h3>${h(s.after.h)}</h3>` : ""}<div class="cols">${s.after.cols.map(c => `<p>${h(c)}</p>`).join("")}</div>${s.after.foot ? `<p class="foot">${h(s.after.foot)}</p>` : ""}</div>` : ""}</div>`;
    },

    fivecols: s => `${bgHTML(s.bg)}<div class="shade bottom"></div><div class="inner tpl-fivecols">${placeLine(s)}<h1 class="t-title">${h(s.title)}</h1><hr class="hr head-rule">
      ${s.source ? `<p class="sub">${h(s.source)}</p>` : ""}
      <div class="grid">${s.cols.map(c => `<div class="col"><div class="q">${h(c.q)}</div><hr class="hr">
        ${c.v ? `<div class="v">${bigV(c)}</div>` : ""}${c.l ? `<div class="l">${h(c.l)}</div>` : ""}
        ${c.hl ? `<div class="hl">${h(c.hl)}</div>` : ""}${(c.paras || (c.t ? [c.t] : [])).map(p => `<div class="t">${h(p)}</div>`).join("")}</div>`).join("")}</div></div>`,

    glance: s => `${bgHTML(s.bg)}<div class="shade bottom"></div><div class="inner tpl-glance">${placeLine(s)}<h1 class="t-title">${h(s.title)}</h1><hr class="hr head-rule">
      <div class="intro"><p class="a">${h(s.intro[0])}</p><p class="b">${h(s.intro[1])}</p></div>${s.intro[2] ? `<p class="more">${h(s.intro[2])}</p>` : ""}
      <div class="card"><h3>${h(s.source)}</h3><div class="items">${s.cols.map(c => `<div class="item"><div class="l">${h(c.q)}</div>${c.v ? `<div class="v">${bigV(c)}</div>` : `<div class="t">${h(c.hl)}</div>`}</div>`).join("")}</div></div>
      ${s.trade ? `<div class="consider"><h3>${h(s.trade.h)}</h3><div class="c"><p>${h(s.trade.a)}</p><p>${h(s.trade.t)}</p></div></div>` : ""}</div>`,

    cards: s => `${bgHTML(s.bg)}<div class="inner tpl-cards"><div class="grid">${s.cards.map(c => `<div class="card"><div class="n">${h(c.n)}</div><div class="h">${h(c.h)}</div><hr class="hr">
      <div class="v ${c.vsmall ? "sm" : ""}">${bigV(c)}</div>${c.v2 ? `<div class="v2">${h(c.v2)}</div>` : ""}<div class="l">${h(c.l)}</div>${c.paras.map(p => `<p class="t">${h(p)}</p>`).join("")}
      <button type="button" class="go" data-jump-id="${h(c.jump)}">${h(c.btn || "Explore the demand signal")} ${ICO.arrow}</button></div>`).join("")}</div></div>`,

    tabs: s => {
      const cur = +(state.choices["tab-" + s.id] || 0), t = s.tabs[cur];
      return `${bgHTML(s.bg)}<div class="inner tpl-tabs"><div class="panel">
        <div class="tabs" role="tablist">${s.tabs.map((x, i) => `<button class="tab" role="tab" data-tab="${i}" aria-selected="${i === cur}"><span class="n">${h(x.n)}</span><span class="h">${h(x.h)}</span></button>`).join("")}</div>
        <div class="pane" role="tabpanel"><p class="sub">${h(t.sub)}</p>
          <div class="stats">${t.stats.map(x => `<div><div class="v">${h(x.v)}</div>${x.u ? `<div class="v2">${h(x.u)}</div>` : ""}<div class="t">${h(x.l)}</div></div>`).join("")}</div>
          ${t.mid ? `<p class="mid">${h(t.mid)}</p>` : ""}${t.h2 ? `<h3>${h(t.h2)}</h3>` : ""}<div class="cols">${t.cols.map(c => `<p>${h(c)}</p>`).join("")}</div>${t.foot ? `<p class="ft">${h(t.foot)}</p>` : ""}</div></div></div>`;
    },

    cities: s => `<div class="inner tpl-cities">${placeLine(s)}<h1 class="t-title">${h(s.title)}</h1><hr class="hr head-rule"><div class="grid">${s.cities.map(c => `<div class="cc"><div class="ph" style="background-image:${photoURL(c.photo)}"></div>
        <h3>${h(c.name)}</h3><hr class="hr"><div class="tag">${h(c.tag)}</div><p>${h(c.t)}</p></div>`).join("")}</div></div>`,

    trio: s => `${bgHTML(s.bg)}${callouts(s.callouts)}<div class="inner tpl-trio"><h1 class="t-title">${h(s.title)}</h1><hr class="hr head-rule"><div class="grid">${s.cards.map(c => `<div class="gc"><h3>${h(c.h)}</h3><hr class="hr"><p>${h(c.t)}</p></div>`).join("")}</div></div>`,

    global: s => {
      const view = state.choices["view-" + s.id] || "both", cmp = state.choices["cmp-" + s.id] || "London";
      const curKey = CURRENCIES[state.choices["cur-" + s.id]] ? state.choices["cur-" + s.id] : "AED";
      const cv = txt => convertDhs(txt, curKey);
      const uae = s.cities.filter(c => c.uae), others = s.cities.filter(c => !c.uae);
      const shown = [...uae.filter(c => view === "both" || c.key === view), ...others.filter(c => c.name === cmp)];
      const rows = 1 + Math.max(...shown.map(c => c.blocks.length));   // title + blocks: the shared row grid (see .tpl-global .grid)
      return `${bgHTML(s.bg)}<div class="inner tpl-global"><div class="controls">
        <div class="ctl"><span class="cap">Your UAE view</span><div class="seg">${[["dubai", "Dubai"], ["abudhabi", "Abu Dhabi"], ["both", "Compare both"]].map(([k, l]) => `<button type="button" data-view="${k}" aria-pressed="${view === k}">${l}</button>`).join("")}</div></div>
        <div style="display:flex;gap:13px"><div class="ctl"><span class="cap">Compare the UAE with</span><label class="sel"><select data-select="cmp" aria-label="Compare the UAE with">${others.map(c => `<option value="${h(c.name)}" ${c.name === cmp ? "selected" : ""} ${c.pending ? "disabled" : ""}>${h(c.name)}${c.pending ? " (soon)" : ""}</option>`).join("")}</select></label></div>
        <div class="ctl"><span class="cap">Show currency</span><label class="sel"><select data-select="cur" aria-label="Currency">${Object.entries(CURRENCIES).map(([k, c]) => `<option value="${k}" ${k === curKey ? "selected" : ""}>${k} · ${h(c.label)}</option>`).join("")}</select></label></div></div></div><hr class="hr">
        <div class="scroll"><div class="grid" style="grid-template-columns:repeat(${shown.length},1fr);--rows:${rows}">${shown.map(c => `<div class="gc ${c.uae ? (c.key === "abudhabi" ? "ad" : "") : "other"}"><h3>${h(c.name)}</h3>
          ${c.blocks.map(b => `<div class="blk"><div class="l">${h(b.l)}</div>${b.s ? `<div class="s">${h(cv(b.s))}</div>` : ""}${b.v ? `<div class="v">${h(cv(b.v))}</div>` : ""}${(b.paras || (b.t ? [b.t] : [])).map(p => `<p>${h(cv(p))}</p>`).join("")}${b.v2 ? `<div class="v">${h(cv(b.v2))}</div>` : ""}${b.t2 ? `<p>${h(cv(b.t2))}</p>` : ""}</div>`).join("")}</div>`).join("")}</div></div>
        ${curKey === "AED" ? "" : `<p class="ratenote">Converted from AED at an indicative rate of 1 AED = ${CURRENCIES[curKey].symbol}${CURRENCIES[curKey].rate} (${CURRENCY_AS_OF}) · figures rounded</p>`}
        <div class="fade"></div><div class="scrollhint">${ICO.chev}<br>Scroll</div></div>`;
    },

    focus: s => {
      const goals = goalsOf(), cur = goals[0] || "A1", a = CM.archetypes[cur], c = s.variants[cur] || s.variants.A1;
      const openRow = local["row-" + s.id] ?? 0;
      const ch = state.choices, mk = ch.market, lab = { dubai: "Dubai", abu_dhabi: "Abu Dhabi", both: "Dubai and Abu Dhabi", undecided: "Still deciding" }[mk] || (state.market ? DECK.markets[state.market].label : "Not set");
      const fmt = n => n >= 1e6 ? (n / 1e6).toFixed(n % 1e6 ? 1 : 0) + "m" : n >= 1e3 ? Math.round(n / 1e3) + "k" : n;
      const budget = ch.bmin || ch.bmax ? `AED ${ch.bmin ? fmt(+ch.bmin) : "…"} – ${ch.bmax ? fmt(+ch.bmax) : "…"}` : ch.budget === "flexible" ? "Flexible" : "Not set";
      const route = (s.routes || {})[ch.route] || "Not set";
      return `${bgHTML(s.bg)}<div class="shade dim"></div><div class="inner tpl-focus"><div class="top"><div><div class="t-num">${h(s.num)}</div><h1 class="t-hero">${h(s.title)}</h1></div>
        <div class="goals" role="tablist">${Object.entries(CM.archetypes).map(([k, x]) => `<button type="button" role="tab" data-goal="${h(x.goal)}" aria-pressed="${k === cur}">${h(s.goalLabels[k] || x.label)}</button>`).join("")}</div></div><hr class="hr">
        <div class="intro"><p class="t-body">${h(c.lede)}</p><p class="t-body">${h(c.body)}</p></div>
        <div class="sum"><h3>Your plans at a glance</h3><div class="items">${[["Preferred market", lab], ["Property price range", budget], ["Purchase plan", route]].map(([l, v]) => `<div class="item"><span class="diamond"></span><div><div class="l">${h(l)}</div><div class="v">${h(v)}</div></div></div>`).join("")}</div></div>
        <div class="rows">${c.rows.map((r, i) => `<button type="button" class="row" data-row="${i}" aria-expanded="${i === openRow}"><div class="rh"><span>${h(r.h)}</span>${ICO.chev}</div><div class="body">${r.paras.map(p => `<p>${h(p)}</p>`).join("")}</div></button>`).join("")}</div>
        <div class="cta-row"><button type="button" class="cta" data-jump-id="${h(s.cta.jump)}">${h(s.cta.label)} ${ICO.arrow}</button><span class="seemore">See more ${ICO.chev}</span></div></div>`;
    },

    checklist: s => {
      const key = s.chooser ? s.chooser.key : "ptype";
      const variant = state.choices[key] || (s.chooser ? s.chooser.options[0][0] : "ready");
      const steps = s.steps || s.variants[variant] || s.variants[Object.keys(s.variants)[0]];
      const per = MOBILE.matches ? steps.length : (s.perPage || 3);                      // cards per page; set `perPage` on the slide to show them all (4.1 → 6, two rows)
      const page = +(state.choices["pg-" + s.id] || 0), pages = Math.ceil(steps.length / per);
      const shown = steps.slice(page * per, page * per + per);
      const chooser = s.chooser || (s.variants ? { label: "Property type", key: "ptype", options: [["offplan", "Off-plan"], ["ready", "Ready"]] } : null);
      const open = local["open-" + s.id] ?? -1;
      const focusStep = shown.find(x => x.focus);
      return `${bgHTML(s.bg)}<div class="shade dim"></div><div class="inner tpl-checklist ${per > 3 ? "two-rows" : ""}"><div class="title-row"><div>${title(s)}${s.lede ? `<p class="t-lead" style="margin-top:10px">${h(s.lede)}</p>` : ""}${s.body ? `<p class="t-body" style="margin-top:2px;max-width:1100px">${h(s.body)}</p>` : ""}</div>
        ${chooser ? switchHTML(chooser, variant, "small") : ""}</div><hr class="hr head-rule">
        ${s.formula ? `<div class="formula">${s.formula.map((f, i) => i % 2 ? `<span class="op">${h(f)}</span>` : `<span>${h(f)}</span>`).join("")}</div>` : ""}
        <div class="steps">${shown.map((x, i) => `<button type="button" class="step" data-open="${i}" aria-expanded="${open === i}"><div class="n">${h(x.n)}</div><span class="chev">${ICO.chev}</span><h3>${h(x.h)}</h3><hr class="hr"><p class="t">${h(x.t)}</p>
          <div class="drop"><div class="rv">${h(x.rv || "Review")}</div><ul>${x.items.map(it => `<li>${h(it)}</li>`).join("")}</ul>${x.sub ? `<div class="sub">${h(x.sub)}</div>` : ""}${x.q ? `<div class="q">${h(x.q)}</div>` : ""}</div></button>`).join("")}</div>
        <div class="bottom">${pagerIn(s, page, pages, per, steps.length)}${focusStep ? `<div class="focus"><b>For your profile, focus on</b><ul>${focusStep.focus.map(f => `<li>${h(f)}</li>`).join("")}</ul></div>` : ""}</div></div>`;
    },

    map: s => {
      const mk = marketOf() === "abudhabi" ? "abudhabi" : "dubai", other = mk === "dubai" ? "abudhabi" : "dubai";
      const goals = goalsOf(), picks = featured(mk, goals), slots = (CM.slots || {})[mk] || [];
      const chosen = findCommunity(mk, state.choices["pin-" + s.id]);
      const curC = (chosen && picks.includes(chosen) ? chosen : picks[0]) || null, c = cardOf(curC);
      const who = audienceLine(goals);
      const sub = who ? `Recommended for ${who} in ${s.marketLabels[mk]}` : `${s.sub} in ${s.marketLabels[mk]}`;
      return `${bgHTML((s.bgs && s.bgs[mk]) || s.bg)}<div class="shade deep"></div><div class="inner tpl-map" style="padding-top:27px">
        <div class="title-row"><div><div class="t-num">${h(s.num)}</div><h1 class="t-hero">${h(s.title)}</h1></div>
          <div class="btns"><button type="button" class="pill-btn" aria-pressed="true">${h(s.filters[0])} ${ICO.arrow}</button><button type="button" class="pill-btn" data-jump-id="${h(s.allId)}">${h(s.filters[1])} ${ICO.arrow}</button></div></div>
        <hr class="hr head-rule"><h2 class="sub">${h(sub)}</h2>
        <div class="mapwrap">${picks.map((p, i) => { const [x, y] = slots[i] || [0.5, 0.3]; return `<button type="button" class="pin" style="left:${x * 100}%;top:${y * 100}%" data-pin="${h(p.name)}" aria-pressed="${p === curC}">${h(p.short || p.name)}</button>`; }).join("")}
          ${picks.length ? "" : `<p class="empty">No communities are mapped for this profile yet — add fit values in communities.js.</p>`}
          <div class="corner"><button type="button" data-market="${other}" data-stay="1">${h(DECK.markets[other].label)} ${ICO.arrow}</button></div></div>
        ${c ? `<div class="ccard"><div class="name">${h(c.short)}<small>${h(c.status)} · ${h(c.type)}</small></div>${c.blurb ? `<p class="desc">${h(c.blurb)}</p>` : ""}
          <div class="more"><div class="figs">${[[c.price, c.priceLabel], [c.yield, c.yieldLabel], [c.entry, c.entryLabel], [c.range, c.rangeLabel]].filter(([v]) => v).map(([v, l]) => `<div><div class="v">${h(v)}</div><div class="l">${h(l)}</div></div>`).join("")}</div>
          <div class="notes">${c.notes.map(([b, t]) => `<div><b>${h(b)}</b><p>${h(t)}</p></div>`).join("")}</div></div></div>` : ""}</div>`;
    },

    communities: s => {
      const mk = marketOf() === "abudhabi" ? "abudhabi" : "dubai";
      const goals = goalsOf(), list = listOf(mk), names = list.map(x => x.name);
      const hi = c => isHighlighted(c, goals);
      const cur = names.includes(state.choices["pin-" + s.id]) ? state.choices["pin-" + s.id] : null;
      const open = state.choices["chips-" + s.id] === "1";
      const c = cardOf(findCommunity(mk, cur));
      const chips = [...list].sort((a, b) => (hi(b) - hi(a)));
      const mapName = s.maps && s.maps[mk];
      const lq = mapName && LQIP[mapName] ? `background-image:url(${LQIP[mapName]})` : "";
      const who = audienceLine(goals);
      const pins = `<div class="pins">${list.map(x => { const pc = cardOf(x), [px, py] = x.map || [0.5, 0.5]; return `<button type="button" class="pin ${hi(x) ? "" : "faded"}" style="left:${px * 100}%;top:${py * 100}%" data-pin="${h(x.name)}" aria-pressed="${x.name === cur}" aria-label="${h(x.name)}${hi(x) ? "" : " (not a primary match)"}">
            <svg class="halo" width="130" height="130" viewBox="0 0 130 130" aria-hidden="true"><polygon points="65,0.5 129.5,65 65,129.5 0.5,65" fill="none" stroke="currentColor" stroke-width=".5" stroke-dasharray="3.6 3.6"/></svg><span class="dia"></span>
            <span class="hover"><span class="st">${h(pc.status)}</span><span class="nm">${h(x.name)}</span><span class="pr">${h(pc.price || pc.entry)}</span><span class="pl">${h(pc.price ? pc.priceLabel : pc.entryLabel)}</span></span></button>`; }).join("")}
        ${cur && c ? (() => { const [px, py] = (findCommunity(mk, cur).map || [0.5, 0.5]); return `<div class="pop ${px > .72 ? "flip" : ""} ${py > .72 ? "up" : ""}" style="left:${px * 100}%;top:${py * 100}%"><span class="st">${h(c.status)}</span><b>${h(c.short)}</b><span class="pr">${h(c.price || c.entry)}</span><span class="pl">${h(c.price ? c.priceLabel : c.entryLabel)}</span></div>`; })() : ""}</div>`;
      return `<div class="map ${open ? "dim" : ""}"${lq ? ` style="${lq}"` : ""}>${mapName ? `<img alt="" src="${src(mapName)}" data-try="${/[\/.]/.test(mapName) ? "" : "png,jpg"}" onerror="var t=(this.dataset.try||'').split(',').filter(Boolean);if(t.length){this.dataset.try=t.slice(1).join(',');this.src='${IMG}${mapName}.'+t[0];}else this.remove()">` : ""}</div>${pins}
        <div class="inner tpl-communities"><div class="title-row">
          <div>${title({ num: s.nums[mk], title: s.titles[mk] })}${who ? `<p class="legend"><span class="diamond" style="background:#fff"></span>Highlighted: best matches for ${h(who)}. Faded communities are still open to explore.</p>` : ""}</div>
          <div class="selects">
            <label class="sel"><select data-select="market" aria-label="Market">${["dubai", "abudhabi"].map(k => `<option value="${k}" ${mk === k ? "selected" : ""}>${h(DECK.markets[k].label)}</option>`).join("")}</select></label>
            <label class="sel"><select data-select="pin" aria-label="Community"><option value="" ${cur ? "" : "selected"}>Community</option>${chips.map(x => `<option value="${h(x.name)}" ${x.name === cur ? "selected" : ""}>${hi(x) ? "" : "· "}${h(x.name)}</option>`).join("")}</select></label>
          </div></div><hr class="hr head-rule">
        <div class="chips-list ${open ? "open" : ""}"><div class="row">${chips.map(x => `<button type="button" class="${hi(x) && goals.length ? "hi" : ""}" data-pin="${h(x.name)}" aria-pressed="${x.name === cur}">${h(x.name)}</button>`).join("")}</div>
          <button type="button" class="more" data-chips="${open ? "0" : "1"}" aria-label="${open ? "Show fewer" : "Show all"} communities" aria-expanded="${open}">${ICO.chev}</button></div>
        <div class="mapwrap">
          ${cur && c ? `<aside class="profile">${c.photo ? `<div class="ph" style="background-image:${photoURL(c.photo)}"></div>` : ""}
            <button type="button" class="blurb" data-pin="${h(cur)}" aria-label="Close"><b>${h(cur)}</b>${ICO.chev}<p>${h(c.blurb || "")}</p></button>
            <div class="facts"><div class="kinds"><div><div class="v">${h(c.market)}</div><div class="l">Market</div></div><div><div class="v">${h(c.type)}</div><div class="l">Main property types</div></div></div>
              <div class="metrics">${[[c.price, c.priceLabel], [c.yield, c.yieldLabel], [c.entry, c.entryLabel], [c.range, c.rangeLabel], ...c.more.map(([l, v]) => [v, l])].filter(([v]) => v).map(([v, l]) => `<div><div class="v">${h(v)}</div><div class="l">${h(l)}</div></div>`).join("")}</div>
              <div class="notes">${c.notes.map(([b, t]) => `<div><b>${h(b)}</b><p>${h(t)}</p></div>`).join("")}</div>
              ${c.source ? `<p class="source">Source: ${h(c.source)}</p>` : ""}</div></aside>` : ""}</div></div>`;
    },

    split: s => `${bgHTML(s.bg)}<div class="shade split"></div><div class="inner tpl-split">
      <div class="title"><div class="t-num">${h(s.num)}</div><h1 class="t-hero">${h(s.title)}</h1><hr class="hr"></div>
      ${[s.left, s.right].map((x, i) => `<button type="button" class="dia ${i ? "dark" : ""}" data-choice="${h(s.chooserKey)}:${h(x.key)}" data-go="next"><span class="face"></span><span class="lbl"><b>${h(x.h)}</b><small>${h(x.t)}</small></span></button>`).join("")}</div>`,

    closing: s => `${bgHTML(s.bg)}<div class="inner tpl-closing"><h1 class="t-title">${h(s.title)}</h1><hr class="hr head-rule">
      ${s.blocks.map(b => `<div class="blk">${b.h ? `<h2 class="t-title">${h(b.h)}</h2>` : ""}<p class="t-body">${h(b.t)}</p>
        <button type="button" class="btn" ${b.save ? 'data-save="1"' : b.jump ? `data-jump-id="${h(b.jump)}"` : b.href ? `data-href="${h(b.href)}"` : ""}>${h(b.btn)} ${ICO.arrow}</button>
        ${b.note ? `<p class="t-lead note">${h(b.note)}</p>` : ""}</div>`).join('<hr class="hr">')}</div>`,

    begin: s => `${bgHTML(s.bg)}<div class="inner tpl-begin"><h1 class="t-title">${h(s.title)}</h1><hr class="hr head-rule">
      <div class="cards">${s.cards.map(c => `<article class="card"><h3>${h(c.h)}</h3><hr class="hr"><p>${h(c.t)}</p>
        <button type="button" class="btn" ${c.jump ? `data-jump-id="${h(c.jump)}"` : c.href ? `data-href="${h(c.href)}"` : ""}>${h(c.btn || s.btn)} ${ICO.arrow}</button></article>`).join("")}</div>
      ${s.prime ? `<hr class="hr prime-rule"><h2 class="t-title">${h(s.prime.h)}</h2><p class="t-body">${h(s.prime.t)}</p>
        <button type="button" class="btn solid" ${s.prime.href ? `data-href="${h(s.prime.href)}"` : ""}>${h(s.prime.btn)} ${ICO.arrow}</button>` : ""}</div>`,

    abroad: s => {
      /* 08: region tabs and a row of country cards that scroll under the frame (the reference's slide 48 + 75). */
      const regions = s.regions, cur = state.choices["region-" + s.id] || regions.find(r => r.countries.length)?.key || regions[0].key;
      const r = regions.find(x => x.key === cur) || regions[0];
      return `${bgHTML(s.bg)}<div class="shade dim"></div><div class="inner tpl-abroad"><div class="scroll"><div class="page">
        <div class="t-num">${h(s.num)}</div><h1 class="t-hero">${h(s.title)}</h1><hr class="hr">
        <div class="tabs" role="tablist">${regions.map(x => `<button type="button" role="tab" data-region="${h(x.key)}" aria-selected="${x.key === cur}" ${x.countries.length ? "" : 'disabled title="Coming soon"'}>${h(x.label)}</button>`).join("")}</div>
        ${r.countries.length ? `<div class="cards" style="grid-template-columns:repeat(${r.countries.length},1fr)">${r.countries.map(c => `<article class="card"><h2>${h(c.name)}</h2><hr class="hr">
          ${c.items.map(([k, v], i) => `${i ? `<hr class="hr soft">` : ""}<h3>${h(k)}</h3><p>${h(v)}</p>`).join("")}</article>`).join("")}</div>`
          : `<p class="empty">${h(r.empty || "Guidance for this region is being prepared.")}</p>`}
        <div class="foot"><div class="copy"><p>${h(s.foot.q)}</p><p>${h(s.foot.t)}</p><button type="button" class="cta" ${s.foot.jump ? `data-jump-id="${h(s.foot.jump)}"` : `data-go="next"`}>${h(s.foot.label)} ${ICO.arrow}</button></div>
          <div class="small">${s.foot.small.map(x => `<p>${h(x)}</p>`).join("")}</div></div></div></div>
        <div class="fade"></div><button type="button" class="cue" data-cue="1">Scroll<br>${ICO.chev}</button></div>`;
    },

    process: s => {
      /* Stage line (the reference's 6.1): a soft hairline with a diamond per stage, a cream progress line up to the selected
         stage (light blue, larger), a number above and name + duration below; small frosted chevrons sit between stages. */
      const cur = +(state.choices["step-" + s.id] || 0), st = s.steps[cur], n = s.steps.length;
      return `${bgHTML(s.bg)}<div class="shade dim"></div><div class="inner tpl-process">${title(s)}<hr class="hr head-rule"><p class="t-body">${h(s.body)}</p>
        <div class="timeline" role="tablist" style="--n:${n};--cur:${cur}">
          <span class="rail"></span><span class="prog"></span>
          ${s.steps.map((x, i) => `<button class="tl" role="tab" data-tab="${i}" aria-selected="${i === cur}"><span class="n">${h(x.n)}</span><span class="d"></span><span class="h">${h(x.h)}</span><span class="tm">${h(x.time)}</span></button>
            ${i < n - 1 ? `<button type="button" class="step" style="left:calc(${(i + 1) * 100 / n}% - 63px)" data-tab="${i + 1}" aria-label="Next stage">${ICO.chev}</button>` : ""}`).join("")}</div>
        <div class="detail"><span class="n">${h(st.n)}</span><h3>${h(st.h)}</h3><hr class="hr">
          ${st.wide ? `<div class="intro"><b>Typical planning time · ${h(st.time)}</b>${(st.paras || [st.t]).map(p => `<p>${h(p)}</p>`).join("")}</div><hr class="hr">` : ""}
          <div class="cols">${st.wide ? "" : `<div><b>Typical planning time · ${h(st.time)}</b>${(st.paras || [st.t]).map(p => `<p>${h(p)}</p>`).join("")}</div>`}
          ${st.cols.map((c, i) => `<div><b>${h(c.h)}</b>${c.items.length === 1 && !c.list ? `<p>${h(c.items[0])}</p>` : `<ul>${c.items.map(it => `<li>${h(it)}</li>`).join("")}</ul>`}${i === st.cols.length - 1 ? `<p class="end">${h(st.end)}</p>` : ""}</div>`).join("")}</div></div></div>`;
    }
  };
  const LIGHT = new Set(["statgrid", "survey", "compare", "cities"]);   // light (#ede8e4) pages; everything else is a photo on black

  /* ---------------- render ---------------- */
  function render(id, dir = 1, replace = false) {
    const slide = byId(id); if (!slide) return;
    state.id = id;
    slidesEl.querySelectorAll(".slide.exit").forEach(x => x.remove());
    const prev = current();
    const el = document.createElement("section");
    const light = !!((LIGHT.has(slide.tpl) || slide.light) && !slide.dark);
    el.className = `slide tpl-${slide.tpl} ${light ? "light" : "dark"} enter`;
    el.innerHTML = TPL[slide.tpl](slide);
    if (prev) {
      prev.classList.remove("enter"); prev.classList.add("exit");
      prev.addEventListener("animationend", e => { if (e.target === prev) prev.remove(); });
      setTimeout(() => prev.remove(), 600);
    }
    slidesEl.appendChild(el);
    if (MOBILE.matches) window.scrollTo(0, 0);
    stage.classList.toggle("light", light);
    stage.classList.toggle("chrome-none", slide.tpl === "cover");
    stage.classList.toggle("chrome-min", slide.tpl === "toc");
    writeHash(replace);
    updateChrome(slide);
    const p = path(), i = p.findIndex(s => s.id === id);
    preload(p[i + 1]); preload(p[i - 1]);
    document.title = (slide.title || DECK.meta.title) + " · betterhomes";
  }
  function current() { const all = slidesEl.querySelectorAll(".slide:not(.exit)"); return all[all.length - 1] || null; }
  function rerender() { const el = current(); if (!el) return; const s = byId(state.id); el.innerHTML = TPL[s.tpl](s); writeHash(true); updateChrome(s); }

  function updateChrome(slide) {
    const p = path(), i = p.findIndex(s => s.id === slide.id), n = p.length;
    const pct = Math.round(i / (n - 1) * 100);
    $("#pfill").style.width = pct + "%"; $("#pdot").style.left = pct + "%"; $("#ppct").style.left = pct + "%"; $("#ppct").textContent = pct + "%";
    $("#counter").textContent = `Page ${String(i + 1).padStart(2, "0")} / ${n}`;
    const g = goalsOf(), gl = g.length && CM.archetypes[g[0]] ? " · " + CM.archetypes[g[0]].label : "";
    $("#jlabel").textContent = (state.market ? DECK.markets[state.market].label + " journey" : "") + gl;
    $("#back").disabled = i === 0; $("#next").disabled = i === n - 1 || (slide.tpl === "cover" && !state.market);
    sectionsEl.querySelectorAll("li").forEach(li => li.classList.toggle("active", li.dataset.sec === slide.section));
  }

  function go(delta) {
    const p = path(), i = indexOf(state.id);
    if (delta > 0 && byId(state.id).tpl === "cover" && !state.market) return;   // the cover waits for a pick
    let j = i + delta;
    if (i === -1) j = 0;
    if (j < 0 || j >= p.length) return;
    render(p[j].id, delta);
  }
  function jumpToSection(sec) { const s = path().find(x => x.section === sec); if (s) render(s.id, 1); }

  /* ---------------- chrome: sidebar + menu ---------------- */
  sectionsEl.innerHTML = DECK.sections.map(s => `<li data-sec="${s.id}"><button type="button"><b>${h(s.num)}</b>${h(s.short || s.title)}</button></li>`).join("");
  sectionsEl.addEventListener("click", e => { const li = e.target.closest("li"); if (li) jumpToSection(li.dataset.sec); });
  $("#sidetop").textContent = DECK.meta.rail || "Investment guide"; $("#sideyear").textContent = DECK.meta.year;

  const menu = $("#menu");
  function openMenu(open) {
    menu.classList.toggle("open", open); $("#burger").setAttribute("aria-expanded", open);
    if (!open) return;
    $("#menumarkets").innerHTML = Object.entries(DECK.markets).map(([k, m]) => `<button type="button" data-market="${k}" data-stay="1" aria-pressed="${state.market === k}">${h(m.label)}</button>`).join("");
    const goals = goalsOf(), gEl = $("#menugoals");
    if (gEl) gEl.innerHTML = Object.entries(CM.archetypes).map(([a, x]) => `<button type="button" data-goal="${h(x.goal)}" aria-pressed="${goals[0] === a}">${h(x.label)}</button>`).join("")
      + `<button type="button" data-goal="" aria-pressed="${!goals.length}">Not set</button>`;
    $("#menulist").innerHTML = DECK.sections.map(sec => { const items = path().filter(s => s.section === sec.id); return items.length ? `<div class="sec"><h3>${h(sec.num)} ${h(sec.title)}</h3>${items.map(s => `<button type="button" data-jump-id="${s.id}" class="${s.id === state.id ? "cur" : ""}">${h(s.num ? s.num + " " : "")}${h(s.title)}${s.city ? ` — ${h(s.city)}` : ""}</button>`).join("")}</div>` : ""; }).join("");
  }
  function setGoal(goal) {
    if (goal) state.choices.goal = goal; else delete state.choices.goal;
    delete state.choices.goals;                       // additional goals only come from the form
    DECK.slides.filter(s => s.tpl === "map" || s.tpl === "communities").forEach(s => delete state.choices["pin-" + s.id]);
  }
  $("#burger").addEventListener("click", () => openMenu(!menu.classList.contains("open")));
  $("#menuclose").addEventListener("click", () => openMenu(false));
  menu.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.market) { state.market = b.dataset.market; openMenu(true); rerender(); }
    if (b.dataset.goal !== undefined) { setGoal(b.dataset.goal); openMenu(true); rerender(); }
    if (b.dataset.jumpId) { openMenu(false); render(b.dataset.jumpId, 1); }
  });

  /* ---------------- in-slide interactions (event delegation) ---------------- */
  slidesEl.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    const s = byId(state.id);
    if (b.dataset.market) { state.market = b.dataset.market; if (b.dataset.stay) { delete state.choices["pin-" + s.id]; rerender(); } else { writeHash(true); rerender(); } return; }
    if (b.dataset.choice) { const [k, v] = b.dataset.choice.split(":"); state.choices[k] = v; }
    if (b.closest(".switch")) { state.choices[b.closest(".switch").dataset.key] = b.dataset.val; delete state.choices["pg-" + s.id]; local["open-" + s.id] = -1; rerender(); return; }
    if (b.dataset.goal !== undefined) { setGoal(b.dataset.goal); local["row-" + s.id] = 0; rerender(); return; }
    if (b.dataset.save) {
      const url = location.href, done = () => { const t = b.firstChild; const old = t.textContent; t.textContent = "Link copied "; setTimeout(() => t.textContent = old, 2000); };
      (navigator.clipboard ? navigator.clipboard.writeText(url).then(done, done) : done()); return;
    }
    if (b.dataset.href) { window.open(b.dataset.href, "_blank", "noopener"); return; }
    if (b.dataset.region) { state.choices["region-" + s.id] = b.dataset.region; rerender(); return; }
    if (b.dataset.cue) { const sc = b.closest(".inner").querySelector(".scroll"); sc.scrollTo({ top: sc.classList.contains("end") ? 0 : sc.scrollHeight, behavior: "smooth" }); return; }
    if (b.dataset.view) { state.choices["view-" + s.id] = b.dataset.view; rerender(); return; }
    if (b.dataset.tab !== undefined) { state.choices[(s.tpl === "process" ? "step-" : "tab-") + s.id] = b.dataset.tab; rerender(); return; }
    if (b.dataset.page !== undefined) { state.choices["pg-" + s.id] = b.dataset.page; local["open-" + s.id] = -1; rerender(); return; }
    if (b.dataset.open !== undefined) { const i = +b.dataset.open; local["open-" + s.id] = local["open-" + s.id] === i ? -1 : i; rerender(); return; }
    if (b.dataset.row !== undefined) { const i = +b.dataset.row; local["row-" + s.id] = local["row-" + s.id] === i ? -1 : i; rerender(); return; }
    if (b.dataset.pin) { if (s.tpl === "communities" && state.choices["pin-" + s.id] === b.dataset.pin) delete state.choices["pin-" + s.id]; else state.choices["pin-" + s.id] = b.dataset.pin; rerender(); return; }
    if (b.dataset.chips !== undefined) { state.choices["chips-" + s.id] = b.dataset.chips; rerender(); return; }
    if (b.dataset.jump) { const t = DECK.slides.find(x => x.num === b.dataset.jump) || DECK.slides.find(x => x.section === DECK.sections.find(sec => sec.num === b.dataset.jump)?.id); if (t) render(t.id, 1); return; }
    if (b.dataset.jumpId) { if (byId(b.dataset.jumpId)) render(b.dataset.jumpId, 1); return; }
    if (b.dataset.go === "next") go(1);
  });
  // blurred signal cards: a click sharpens that card (session-only, not in the URL)
  slidesEl.addEventListener("click", e => {
    const card = e.target.closest(".sig.blur"); if (!card) return;
    const s = byId(state.id); (local["seen-" + s.id] ||= new Set()).add(+card.dataset.reveal); rerender();
  });

  slidesEl.addEventListener("scroll", e => {
    const sc = e.target; if (!sc.classList || !sc.classList.contains("scroll")) return;
    sc.classList.toggle("scrolled", sc.scrollTop > 20);
    sc.classList.toggle("end", sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 10);
    const cue = sc.parentElement.querySelector(".cue"); if (cue) cue.classList.toggle("up", sc.classList.contains("end"));
  }, true);

  slidesEl.addEventListener("change", e => {
    const sel = e.target.closest("select[data-select]"); if (!sel) return;
    const s = byId(state.id);
    if (sel.dataset.select === "market") { state.market = sel.value; delete state.choices["pin-" + s.id]; }
    else if (sel.dataset.select === "pin") { if (sel.value) state.choices["pin-" + s.id] = sel.value; else delete state.choices["pin-" + s.id]; }
    else if (sel.dataset.select === "cmp") { state.choices["cmp-" + s.id] = sel.value; }
    else if (sel.dataset.select === "cur") { if (sel.value === "AED") delete state.choices["cur-" + s.id]; else state.choices["cur-" + s.id] = sel.value; }
    rerender();
  });

  $("#back").addEventListener("click", () => go(-1));
  $("#next").addEventListener("click", () => go(1));
  document.addEventListener("keydown", e => {
    if (e.target.matches("input,textarea,select")) return;
    const onButton = e.target.closest && e.target.closest("button");
    if (e.key === "ArrowRight" || e.key === "PageDown" || (e.key === " " && !onButton)) { e.preventDefault(); go(1); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(-1); }
    else if (e.key === "Escape") openMenu(false);
    else if (e.key.toLowerCase() === "m") openMenu(!menu.classList.contains("open"));
  });
  // swipe
  let tx = 0, ty = 0;
  stage.addEventListener("touchstart", e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  stage.addEventListener("touchend", e => { const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1); }, { passive: true });

  window.addEventListener("popstate", () => { const id = readHash(); const dir = indexOf(id) < indexOf(state.id) ? -1 : 1; render(id, dir, true); });

  /* ---------------- boot ---------------- */
  render(readHash(), 1, true);
})();
