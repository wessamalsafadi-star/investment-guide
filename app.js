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
    function bgHTML(name, cls = "", video) {
    if (!name) return "";
    const lq = LQIP[name] ? ` style="background-image:url(${LQIP[name]})"` : "";
    const vid = video && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? `<video autoplay muted loop playsinline preload="metadata" aria-hidden="true" oncanplay="this.classList.add('ready');this.play().catch(()=>{})">
          <source src="${IMG}${video}.webm" type="video/webm"><source src="${IMG}${video}.mp4" type="video/mp4"></video>` : "";
    return `<div class="bg ${cls}" data-src="${h(name)}"${lq}><img alt="" decoding="async" fetchpriority="high"
      src="${src(name, true)}" srcset="${src(name, true)} 960w, ${src(name)} 1920w" sizes="1920px"
      onload="this.classList.add('ready')">${vid}</div>`;
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
    // "Your plans at a glance" glyphs (section 03), sky blue: a location pin with a heart, a house with a chart line, a receipt
    pin: `<svg width="31" height="39" viewBox="0 0 31 39" aria-hidden="true"><path transform="translate(2 2)" d="M12.5 0C18.562 0 25 4.662 25 12.896C25 18.116 21.906 23.083 18.94 26.666C17.443 28.474 15.949 29.966 14.829 31.006C14.268 31.527 13.8 31.935 13.471 32.215C13.153 32.484 12.827 32.742 12.5 33C12.173 32.742 11.846 32.484 11.528 32.213C11.199 31.933 10.731 31.524 10.171 31.003C9.051 29.961 7.556 28.466 6.06 26.657C3.094 23.071 0 18.104 0 12.896C0 4.662 6.438 0 12.5 0ZM16.233 6.866C14.648 6.866 13.464 7.913 12.5 9.088C11.538 7.911 10.352 6.866 8.767 6.866C6.361 6.866 4.412 8.919 4.412 11.452C4.412 15.783 10.706 20.509 12.5 21.361C14.294 20.509 20.588 15.783 20.588 11.452C20.588 8.919 18.637 6.866 16.233 6.866Z" fill="#86b8cb" fill-rule="evenodd"/></svg>`,
    house: `<svg width="42" height="38" viewBox="0 0 42 38" aria-hidden="true"><path transform="translate(2 2)" d="M18.195 0L36.389 14.296L34.93 16.153L18.195 3.004L1.459 16.153L0 14.296L18.195 0Z" fill="#86b8cb" fill-rule="evenodd"/><path transform="translate(6.81 8.01)" d="M26.773 10.518L26.773 22.267C26.773 24.876 24.658 26.991 22.048 26.991L4.725 26.991C2.115 26.991 0 24.876 0 22.267L0 10.518L13.386 0L26.773 10.518ZM18.111 11.636L19.686 13.605L12.148 20.633L7.201 15.911L3.33 19.587L4.955 21.3L5.813 20.487L7.196 19.172L12.148 23.899L16.791 19.467L20.204 22.881L21.875 21.211L18.5 17.836L21.261 15.18L23.229 16.754L23.229 11.636L18.111 11.636ZM4.901 11.758L6.571 13.429L8.661 11.339L13.75 16.427L15.42 14.757L8.662 7.997L4.901 11.758Z" fill="#86b8cb" fill-rule="evenodd"/></svg>`,
    receipt: `<svg width="31" height="39" viewBox="0 0 31 39" aria-hidden="true"><path transform="translate(2 2)" d="M25.5 4.5C25.5 2.015 23.485 0 21 0L4.5 0C2.015 0 0 2.015 0 4.5L0 33L3.75 30.188L6.75 32.438L9.75 30.188L12.75 32.438L15.75 30.188L18.75 32.438L21.75 30.188L25.5 33L25.5 4.5ZM6 10.5L14.25 10.5L14.25 8.25L6 8.25L6 10.5ZM6 16.5L6 14.25L14.25 14.25L14.25 16.5L6 16.5ZM19.5 10.5L16.5 10.5L16.5 8.25L19.5 8.25L19.5 10.5ZM19.5 16.5L19.5 14.25L16.5 14.25L16.5 16.5L19.5 16.5ZM6 22.5L14.25 22.5L14.25 20.25L6 20.25L6 22.5ZM19.5 22.5L19.5 20.25L16.5 20.25L16.5 22.5L19.5 22.5Z" fill="#86b8cb" fill-rule="evenodd"/></svg>`,
    // partner logos for the closing panels (09), white
    logoPrime: `<svg aria-label="betterhomes PRIME" width="171" height="62" viewBox="0 0 171 62"><path transform="matrix(1 0 0 1 37.76 3.01)" d="M33.355 37.191L25.964 37.191C24.79 36.448 23.838 35.225 23.222 34.113L17.628 23.854C16.981 22.71 15.959 21.797 14.717 21.252L6.659 21.252L6.659 37.191L0 37.191L0 0L16.06 0C24.232 0 30.5 4.462 30.5 10.626C30.5 16.097 25.575 20.243 18.691 21.093C21.771 21.729 24.343 23.164 25.519 25.503L29.94 33.153C30.827 34.799 32.179 36.448 33.355 37.191ZM6.659 20.19L14.618 20.19C20.045 20.19 23.628 16.416 23.628 10.626C23.628 4.836 20.034 1.062 14.618 1.062L6.659 1.062L6.659 20.19Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 75.75 3.01)" d="M0 0L6.659 0L6.659 37.191L0 37.191L0 0Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 90.95 3.01)" d="M40.355 0L40.355 37.191L33.691 37.191L33.691 2.337L17.966 27.835L17.07 27.835L1.343 2.337L1.343 37.191L0 37.191L0 0L7.331 0L20.372 21.102L33.471 0L40.355 0Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 139.45 3.01)" d="M28.263 36.127L28.263 37.191L0 37.191L0 0L27.705 0L27.705 1.062L6.662 1.062L6.662 17.805L23.227 17.805L23.227 18.86L6.662 18.86L6.662 36.127L28.263 36.127Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 2 3)" d="M31.621 11.582C31.621 18.223 25.353 23.164 17.181 23.164L6.659 23.164L6.659 37.191L0 37.191L0 0L17.181 0C25.353 0 31.621 4.941 31.621 11.582ZM24.737 11.582C24.737 5.26 21.032 1.062 15.447 1.062L6.659 1.062L6.659 22.102L15.447 22.102C21.043 22.102 24.737 17.904 24.737 11.582Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 107.04 46.81)" d="M3.207 3.377C2.669 3.377 2.216 3.571 1.824 3.891L1.824 4.146C2.121 3.908 2.422 3.801 2.723 3.801C3.101 3.801 3.409 3.96 3.622 4.34C3.834 4.721 3.953 5.323 3.953 6.211C3.953 7.885 3.489 8.873 2.632 8.873C2.087 8.873 1.664 8.459 1.493 7.844L1.493 0L0 1.493L0 8.953L0.293 8.953L0.867 8.379C1.321 8.793 1.936 9.044 2.823 9.044C4.316 9.044 5.536 7.834 5.536 6.1C5.536 4.497 4.507 3.377 3.207 3.377L3.207 3.377Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 136.38 46.81)" d="M0 8.953L1.493 8.953L1.493 0L0 1.493L0 8.953Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 138.21 50.19)" d="M1.484 0C0.859 0 0.397 0.207 0 0.53L0 0.754C0.284 0.549 0.554 0.464 0.839 0.464C1.767 0.464 1.777 1.445 1.777 1.818L1.777 5.971L3.269 4.478L3.269 1.926C3.269 0.605 2.614 0 1.485 0L1.484 0Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 113.1 50.19)" d="M1.552 2.495L1.552 2.536C1.552 4.291 2.303 5.103 3.368 5.103C3.967 5.103 4.606 4.839 5.113 4.21L5.235 4.281C4.556 5.296 3.653 5.702 2.679 5.702C1.147 5.702 0 4.647 0 2.962C0 1.146 1.238 0 2.922 0C4.606 0 5.306 1.156 5.245 2.496L1.552 2.496L1.552 2.495ZM1.552 2.333L3.916 2.333C4.048 1.014 3.551 0.151 2.841 0.151C2.07 0.151 1.603 1.105 1.552 2.333Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 118.67 48.43)" d="M3.774 6.869C3.288 7.214 2.801 7.457 2.131 7.457C0.812 7.457 0.67 6.534 0.67 6.016L0.67 2.1L0 2.1L0 1.928L0.649 1.877L2.12 0L2.161 0L2.161 1.877L4.263 1.877L3.622 2.1L2.16 2.1L2.16 6.067C2.16 6.321 2.16 7 2.871 7C3.094 7 3.368 6.929 3.693 6.747L3.774 6.869L3.774 6.869Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 122.28 48.43)" d="M3.774 6.869C3.288 7.214 2.801 7.457 2.131 7.457C0.812 7.457 0.67 6.534 0.67 6.016L0.67 2.1L0 2.1L0 1.928L0.649 1.877L2.12 0L2.161 0L2.161 1.877L3.754 1.877L3.622 2.1L2.161 2.1L2.161 6.067C2.161 6.321 2.161 7 2.871 7C3.094 7 3.368 6.929 3.693 6.747L3.774 6.869L3.774 6.869Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 126 50.19)" d="M1.552 2.495L1.552 2.536C1.552 4.291 2.303 5.103 3.368 5.103C3.967 5.103 4.606 4.839 5.113 4.21L5.235 4.281C4.556 5.296 3.653 5.702 2.679 5.702C1.147 5.702 0 4.647 0 2.962C0 1.146 1.238 0 2.922 0C4.606 0 5.306 1.156 5.245 2.496L1.552 2.496L1.552 2.495ZM1.552 2.333L3.916 2.333C4.048 1.014 3.551 0.151 2.841 0.151C2.07 0.151 1.603 1.105 1.552 2.333Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 132.05 50.16)" d="M3.511 0.091L3.115 1.197C2.933 1.105 2.74 1.065 2.577 1.065C2.07 1.065 1.654 1.43 1.492 1.988L1.492 5.61L0 5.61L0 0.355L1.41 0L1.451 0L1.451 1.674C1.715 0.67 2.334 0.03 3.064 0.03C3.247 0.03 3.44 0.071 3.511 0.091L3.511 0.091Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 142.11 50.18)" d="M0 2.881C0 1.146 1.268 0 2.952 0C4.636 0 5.824 1.075 5.824 2.821C5.824 4.566 4.545 5.702 2.871 5.702C1.198 5.702 0 4.626 0 2.881ZM4.241 2.892C4.241 1.248 3.754 0.142 2.892 0.142C2.029 0.142 1.583 1.208 1.583 2.831C1.583 4.454 2.069 5.56 2.922 5.56C3.774 5.56 4.241 4.495 4.241 2.892L4.241 2.892Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 148.57 50.16)" d="M8.594 1.968L8.594 5.61L7.092 5.61L7.092 1.826C7.092 1.45 7.092 0.497 6.159 0.497C5.753 0.497 5.398 0.68 4.941 1.176C5.012 1.4 5.043 1.663 5.043 1.968L5.043 5.61L3.551 5.61L3.551 1.826C3.551 1.45 3.541 0.497 2.608 0.497C2.232 0.497 1.887 0.649 1.492 1.065L1.492 5.61L0 5.61L0 0.355L1.451 0L1.491 0L1.491 0.873C1.958 0.375 2.465 0.03 3.277 0.03C4.089 0.03 4.636 0.345 4.89 1.004C5.387 0.436 5.915 0.03 6.828 0.03C7.944 0.03 8.594 0.639 8.594 1.968L8.594 1.968Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 157.81 50.19)" d="M1.552 2.495L1.552 2.536C1.552 4.291 2.303 5.103 3.368 5.103C3.967 5.103 4.606 4.839 5.113 4.21L5.235 4.281C4.556 5.296 3.653 5.702 2.679 5.702C1.147 5.702 0 4.647 0 2.962C0 1.146 1.238 0 2.922 0C4.606 0 5.306 1.156 5.245 2.496L1.552 2.496L1.552 2.495ZM1.552 2.333L3.916 2.333C4.048 1.014 3.551 0.151 2.841 0.151C2.07 0.151 1.603 1.105 1.552 2.333Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 163.54 50.18)" d="M0 5.287L0.203 4.556C0.609 5.104 1.339 5.56 2.192 5.56C2.953 5.56 3.379 5.195 3.379 4.667C3.379 4.059 2.78 3.815 2.141 3.572L1.715 3.409C1.116 3.176 0.081 2.77 0.081 1.694C0.081 0.781 0.822 0 2.212 0C3.013 0 3.743 0.254 4.007 0.385L3.835 1.025C3.48 0.619 2.851 0.142 2.059 0.142C1.369 0.142 0.994 0.508 0.994 0.964C0.994 1.573 1.633 1.806 2.242 2.039L2.658 2.192C3.236 2.425 4.292 2.821 4.292 3.947C4.292 4.89 3.541 5.702 2.039 5.702C1.238 5.702 0.315 5.469 0 5.286L0 5.287Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 90.94 46.33)" d="M3.518 2.908C4.945 2.908 6.074 4.149 6.074 5.927C6.074 7.851 4.735 9.193 3.098 9.193C2.124 9.193 1.449 8.913 0.951 8.455L0.044 9.159L0 9.159L0 0.47L1.593 0L1.637 0L1.637 3.825C2.146 3.266 2.755 2.908 3.518 2.908ZM2.887 9.003C3.828 9.003 4.337 7.907 4.337 6.05C4.337 4.082 3.817 3.377 2.987 3.377C2.533 3.377 2.08 3.601 1.637 4.116L1.637 7.862C1.825 8.544 2.29 9.003 2.887 9.003Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 90.94 46.33)" d="M10.857 3.042L11.676 3.042C11.178 4.004 10.813 4.876 10.16 6.408L8.633 9.976C8.08 11.273 7.184 11.676 6.133 11.676L6.222 10.848C6.432 10.938 6.675 10.982 6.896 10.982C7.483 10.982 8.124 10.68 8.423 9.965L8.755 9.193L6.089 3.042L7.848 3.042L9.618 7.146L9.972 6.33C10.614 4.809 10.835 3.769 10.857 3.042Z" fill="#ffffff"/></svg>`,
    logoLeadingRE: `<svg aria-label="Leading Real Estate Companies of the World" width="169" height="74" viewBox="0 0 169 74"><path transform="matrix(1 0 0 1 2 52.04)" d="M1.153 4.277L2.599 4.277L4.215 6.566L5.574 6.566L3.802 4.083C4.719 3.818 5.368 3.173 5.368 2.095L5.368 2.074C5.368 1.5 5.169 1.012 4.822 0.657C4.401 0.244 3.752 0 2.926 0L0 0L0 6.566L1.153 6.566L1.153 4.277ZM1.153 1.05L2.835 1.05C3.69 1.05 4.194 1.434 4.194 2.136L4.194 2.157C4.194 2.822 3.669 3.256 2.843 3.256L1.153 3.256L1.153 1.05Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 10.66 52.04)" d="M4.917 5.537L1.157 5.537L1.157 3.773L4.45 3.773L4.45 2.74L1.157 2.74L1.157 1.033L4.872 1.033L4.872 0L0 0L0 6.566L4.917 6.566L4.917 5.537Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 18.22 51.99)" d="M1.855 5.029L4.963 5.029L5.628 6.616L6.847 6.616L3.959 0L2.888 0L0 6.616L1.182 6.616L1.855 5.029ZM3.405 1.38L4.541 4.008L2.281 4.008L3.405 1.38Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 28.07 52.04)" d="M4.607 5.516L1.157 5.516L1.157 0L0 0L0 6.566L4.607 6.566L4.607 5.516Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 40.45 52.04)" d="M4.868 1.033L4.868 0L0 0L0 6.566L4.917 6.566L4.917 5.537L1.153 5.537L1.153 3.773L4.446 3.773L4.446 2.74L1.153 2.74L1.153 1.033L4.868 1.033Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 48.23 51.95)" d="M2.979 2.851C1.723 2.55 1.421 2.326 1.421 1.818L1.421 1.802C1.421 1.368 1.814 1.025 2.492 1.025C3.091 1.025 3.682 1.26 4.273 1.698L4.892 0.826C4.227 0.289 3.467 0 2.508 0C1.202 0 0.264 0.777 0.264 1.905L0.264 1.926C0.264 3.136 1.054 3.55 2.45 3.884C3.669 4.165 3.934 4.421 3.934 4.888L3.934 4.905C3.934 5.401 3.483 5.731 2.769 5.731C1.95 5.731 1.322 5.421 0.694 4.876L0 5.702C0.789 6.405 1.735 6.752 2.74 6.752C4.12 6.752 5.087 6.021 5.087 4.789L5.087 4.773C5.087 3.686 4.364 3.186 2.975 2.847L2.979 2.851Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 55.88 52.04)" d="M0 1.07L2.083 1.07L2.083 6.566L3.248 6.566L3.248 1.07L5.33 1.07L5.33 0L0 0L0 1.07Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 62.89 51.99)" d="M2.888 0L0 6.616L1.182 6.616L1.855 5.029L4.963 5.029L5.628 6.616L6.847 6.616L3.959 0L2.888 0ZM2.277 4.004L3.401 1.376L4.537 4.004L2.277 4.004Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 71.43 52.04)" d="M0 1.07L2.083 1.07L2.083 6.566L3.248 6.566L3.248 1.07L5.33 1.07L5.33 0L0 0L0 1.07Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 79.86 52.04)" d="M4.868 1.033L4.868 0L0 0L0 6.566L4.917 6.566L4.917 5.537L1.153 5.537L1.153 3.773L4.446 3.773L4.446 2.74L1.153 2.74L1.153 1.033L4.868 1.033Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 92.47 51.9)" d="M5.264 4.884C4.702 5.409 4.186 5.74 3.38 5.74C2.124 5.74 1.215 4.69 1.215 3.405L1.215 3.384C1.215 2.099 2.124 1.066 3.38 1.066C4.132 1.066 4.694 1.393 5.219 1.88L5.959 1.025C5.33 0.426 4.599 0 3.388 0C1.401 0 0 1.529 0 3.397L0 3.413C0 5.302 1.426 6.789 3.339 6.789C4.57 6.789 5.318 6.339 6.004 5.624L5.264 4.872L5.264 4.884Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 101.09 51.91)" d="M6.868 3.397L6.868 3.376C6.868 1.529 5.459 0 3.442 0C1.426 0 0 1.55 0 3.397L0 3.413C0 5.26 1.405 6.789 3.426 6.789C5.446 6.789 6.868 5.244 6.868 3.392L6.868 3.397ZM5.657 3.417C5.657 4.694 4.748 5.735 3.442 5.735C2.136 5.735 1.211 4.673 1.211 3.401L1.211 3.38C1.211 2.103 2.12 1.062 3.426 1.062C4.731 1.062 5.657 2.124 5.657 3.397L5.657 3.413L5.657 3.417Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 111.13 52.02)" d="M5.302 6.566L6.459 6.566L6.459 0L5.227 0L3.231 3.103L1.231 0L0 0L0 6.566L1.136 6.566L1.136 1.876L3.19 4.954L3.231 4.954L5.302 1.855L5.302 6.566Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 121.3 52.02)" d="M5.087 2.211L5.087 2.194C5.087 0.872 4.12 0 2.591 0L0 0L0 6.566L1.153 6.566L1.153 4.454L2.459 4.454C3.905 4.454 5.087 3.686 5.087 2.211ZM1.153 1.05L2.496 1.05C3.359 1.05 3.913 1.455 3.913 2.223L3.913 2.244C3.913 2.93 3.368 3.417 2.496 3.417L1.153 3.417L1.153 1.054L1.153 1.05Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 128.14 51.97)" d="M2.888 0L0 6.616L1.182 6.616L1.855 5.029L4.963 5.029L5.628 6.616L6.847 6.616L3.959 0L2.888 0ZM2.281 4.008L3.405 1.38L4.541 4.008L2.281 4.008Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 137.93 52.02)" d="M1.136 1.893L4.76 6.566L5.727 6.566L5.727 0L4.591 0L4.591 4.541L1.07 0L0 0L0 6.566L1.136 6.566L1.136 1.893Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 147.34 52.02)" d="M1.153 0L0 0L0 6.566L1.153 6.566L1.153 0Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 152.2 52.02)" d="M4.917 5.533L1.153 5.533L1.153 3.773L4.446 3.773L4.446 2.74L1.153 2.74L1.153 1.029L4.868 1.029L4.868 0L0 0L0 6.566L4.917 6.566L4.917 5.533Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 159.91 51.92)" d="M2.769 5.735C1.95 5.735 1.322 5.425 0.694 4.88L0 5.706C0.789 6.409 1.735 6.756 2.74 6.756C4.12 6.756 5.087 6.025 5.087 4.793L5.087 4.777C5.087 3.69 4.364 3.19 2.975 2.851C1.719 2.55 1.417 2.326 1.417 1.818L1.417 1.802C1.417 1.368 1.81 1.025 2.488 1.025C3.087 1.025 3.678 1.26 4.268 1.698L4.888 0.826C4.223 0.293 3.463 0 2.504 0C1.198 0 0.26 0.777 0.26 1.905L0.26 1.926C0.26 3.136 1.05 3.55 2.446 3.884C3.665 4.165 3.93 4.417 3.93 4.888L3.93 4.905C3.93 5.401 3.479 5.731 2.764 5.731L2.769 5.735Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 54.17 63.8)" d="M0 1.07L2.083 1.07L2.083 6.57L3.248 6.57L3.248 1.07L5.33 1.07L5.33 0L0 0L0 1.07Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 62.56 63.8)" d="M4.289 2.731L1.153 2.731L1.153 0L0 0L0 6.57L1.153 6.57L1.153 3.802L4.289 3.802L4.289 6.57L5.442 6.57L5.442 0L4.289 0L4.289 2.731Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 71.57 63.8)" d="M1.157 3.773L4.45 3.773L4.45 2.744L1.157 2.744L1.157 1.033L4.872 1.033L4.872 0L0 0L0 6.57L4.917 6.57L4.917 5.537L1.157 5.537L1.157 3.773Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 83.91 63.78)" d="M7.016 4.888L5.405 0L4.43 0L2.814 4.888L1.248 0.017L0 0.017L2.289 6.632L3.285 6.632L4.897 1.913L6.512 6.632L7.504 6.632L9.797 0.017L8.587 0.017L7.016 4.888Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 95.97 63.69)" d="M3.442 0C1.426 0 0 1.55 0 3.397L0 3.417C0 5.264 1.409 6.793 3.426 6.793C5.442 6.793 6.868 5.244 6.868 3.397L6.868 3.38C6.868 1.533 5.463 0.004 3.442 0.004L3.442 0ZM5.657 3.417C5.657 4.694 4.748 5.735 3.442 5.735C2.136 5.735 1.211 4.673 1.211 3.401L1.211 3.384C1.211 2.107 2.12 1.066 3.426 1.066C4.731 1.066 5.657 2.124 5.657 3.401L5.657 3.421L5.657 3.417Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 106.04 63.8)" d="M5.368 2.091L5.368 2.074C5.368 1.5 5.169 1.012 4.822 0.657C4.401 0.244 3.752 0 2.926 0L0 0L0 6.566L1.153 6.566L1.153 4.277L2.599 4.277L4.215 6.566L5.574 6.566L3.802 4.078C4.719 3.814 5.368 3.169 5.368 2.091ZM1.157 3.252L1.157 1.045L2.835 1.045C3.69 1.045 4.194 1.43 4.194 2.132L4.194 2.149C4.194 2.814 3.669 3.248 2.843 3.248L1.153 3.248L1.157 3.252Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 114.9 63.8)" d="M1.157 0L0 0L0 6.57L4.607 6.57L4.607 5.521L1.157 5.521L1.157 0Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 122.47 63.8)" d="M2.45 0L0 0L0 6.566L2.45 6.566C4.516 6.566 5.942 5.132 5.942 3.281L5.942 3.264C5.942 1.417 4.516 0 2.45 0ZM4.731 3.306C4.731 4.591 3.83 5.521 2.45 5.521L1.157 5.521L1.157 1.054L2.45 1.054C3.83 1.054 4.731 2 4.731 3.285L4.731 3.306Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 38.64 63.71)" d="M0 1.864L0 1.872C0 2.897 0.818 3.719 1.921 3.719C3.025 3.719 3.851 2.888 3.851 1.859L3.851 1.847C3.851 0.822 3.033 0 1.93 0C0.826 0 0 0.831 0 1.859L0 1.864ZM1.017 1.851C1.017 1.335 1.38 0.897 1.921 0.897C2.463 0.897 2.839 1.347 2.839 1.864L2.839 1.872C2.839 2.388 2.475 2.826 1.93 2.826C1.384 2.826 1.017 2.376 1.017 1.864L1.017 1.851Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 44.43 63.79)" d="M2.859 0.868L2.859 0L0 0L0 3.574L0.992 3.574L0.992 2.297L2.682 2.297L2.682 1.475L0.992 1.475L0.992 0.868L2.859 0.868Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 38.62 69.33)" d="M8.677 0L0 0L0 1.037L8.677 1.037L8.677 0Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 104.22 18.41)" d="M0 2.153C0 2.793 0.43 3.256 1.017 3.256C2.062 3.256 3.054 2.211 3.054 1.103C3.054 0.463 2.624 0 2.037 0C0.992 0 0 1.045 0 2.153Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 31.6 2)" d="M1.467 37.66C2.669 37.66 3.942 37.036 5.248 35.805C5.851 35.937 6.512 36.086 7.202 36.247C10.095 36.908 13.367 37.66 15.496 37.66C18.495 37.66 20.198 36.036 22.458 33.557C22.723 33.268 23.057 32.884 23.417 32.441C23.338 32.941 23.297 33.421 23.297 33.875C23.297 36.243 24.508 37.656 26.537 37.656C29.722 37.656 33.384 34.879 35.743 32.276C35.925 32.074 36.123 31.834 36.321 31.582C36.065 32.714 35.958 33.85 36.016 34.925C36.119 36.801 37.239 37.656 38.235 37.656C39.797 37.656 42.094 35.466 43.751 33.111C43.263 34.363 42.97 35.317 42.97 36.057C42.97 37.045 43.47 37.656 44.28 37.656C44.999 37.656 45.83 37.28 46.896 36.474C48.115 35.545 50.061 33.429 51.586 31.462C51.309 32.636 51.189 33.809 51.251 34.925C51.354 36.801 52.474 37.656 53.47 37.656C55.032 37.656 57.329 35.466 58.986 33.111C59.019 33.061 59.056 33.02 59.09 32.974C58.647 34.404 58.544 35.363 58.544 35.941C58.544 37.016 59.065 37.656 59.941 37.656C61.404 37.656 63.701 36.218 65.796 33.991C65.846 33.937 66.457 33.28 67.238 32.338C66.395 34.507 66.172 35.388 66.172 36.202C66.172 37.069 66.697 37.656 67.482 37.656C68.201 37.656 69.031 37.28 70.098 36.474C71.131 35.689 72.68 34.053 74.06 32.375L71.982 37.454L74.176 37.454L77.114 30.293C78.205 27.681 79.242 26.404 80.106 25.45C81.738 23.64 82.858 23.446 83.374 23.454C83.866 23.462 84.399 23.842 84.399 24.475C84.399 25.545 83.531 27.665 82.614 29.913C81.647 32.284 80.643 34.735 80.643 36.057C80.643 37.045 81.143 37.656 81.953 37.656C82.672 37.656 83.502 37.28 84.568 36.474C85.758 35.565 87.651 33.52 89.159 31.59C88.903 32.722 88.795 33.85 88.853 34.925C88.957 36.801 90.076 37.656 91.072 37.656C92.634 37.656 94.932 35.466 96.589 33.111C96.593 33.103 96.601 33.094 96.605 33.09C96.411 33.541 96.237 33.95 96.072 34.317C94.936 36.793 93.762 38.859 93.101 39.908C90.428 44.16 87.287 46.268 83.527 46.268C80.06 46.268 79.151 44.371 79.118 42.834C79.106 42.189 79.217 41.64 79.862 40.449L79.316 39.888C78.163 40.995 77.713 42.321 77.713 43.152C77.713 44.433 78.321 45.503 79.465 46.243C80.436 46.871 81.862 47.251 83.238 47.251C87.667 47.251 92.047 44.677 94.787 40.251C95.047 39.83 95.428 39.222 95.709 38.726L95.737 38.673C97.704 35.222 99.031 31.966 100.275 28.892L103.117 21.904L100.923 21.904L100.498 22.892C100.027 22.256 99.543 21.929 98.998 21.805C98.204 21.586 96.985 21.847 96.043 22.301C94.452 23.028 92.828 24.454 91.498 26.326C90.717 27.425 90.089 28.648 89.638 29.908C87.329 33.012 84.159 35.97 83.279 35.97C83.064 35.97 82.957 35.805 82.957 35.474C82.957 34.664 83.746 32.772 84.585 30.768C85.622 28.284 86.8 25.47 86.8 23.946C86.8 22.198 85.481 21.747 84.787 21.735C83.444 21.706 81.915 22.706 81.122 23.347C80.242 24.053 79.436 24.983 78.845 25.71L80.523 21.913L78.325 21.913L74.92 30.231C72.639 33.214 69.651 35.97 68.804 35.97C68.515 35.97 68.482 35.664 68.482 35.532C68.482 35.16 68.701 34.123 70.602 29.454L73.676 21.913L71.482 21.913L68.201 29.913C68.151 30.036 68.098 30.16 68.048 30.28C66.924 31.751 65.676 33.103 64.817 33.896C63.329 35.272 62.164 35.97 61.354 35.97C61.098 35.97 60.858 35.883 60.858 35.243C60.858 34.673 61.032 32.908 62.627 28.9C65.036 22.946 69.354 13.206 71.003 10.219C74.399 10.801 78.858 11.463 83.358 11.463C87.176 11.463 90.295 10.682 92.374 9.211C93.965 8.082 94.915 6.541 94.915 5.091C94.915 1.996 91.498 0 86.213 0C82.498 0 78.494 1.256 75.221 3.45C73.131 4.868 71.341 6.632 69.907 8.694L69.635 8.632C65.085 7.607 60.387 6.549 55.8 6.549C51.705 6.549 48.329 7.859 45.54 10.868L45.896 11.628C47.458 9.954 49.689 8.058 53.966 8.058C58.242 8.058 63.829 8.987 69.06 9.888L69.11 9.896C67.618 12.45 65.891 16.285 64.222 19.991C63.924 20.652 62.899 22.9 62.899 22.9C62.428 22.26 61.945 21.933 61.399 21.805C60.606 21.586 59.387 21.847 58.445 22.301C56.854 23.028 55.23 24.454 53.9 26.326C53.156 27.375 52.553 28.528 52.106 29.722C49.788 32.892 46.507 35.97 45.615 35.97C45.4 35.97 45.292 35.805 45.292 35.474C45.292 34.553 45.953 32.528 47.441 28.9L50.284 21.913L48.09 21.913L47.664 22.9C47.193 22.26 46.71 21.933 46.164 21.805C45.371 21.586 44.152 21.847 43.21 22.301C41.619 23.028 39.995 24.454 38.664 26.326C37.888 27.421 37.264 28.636 36.813 29.888C36.388 30.466 35.999 30.913 35.636 31.317C33.636 33.603 30.107 35.97 27.665 35.97C26.322 35.97 25.644 35.107 25.644 33.408C25.644 32.813 25.706 32.173 25.867 31.487C26.115 31.458 26.384 31.429 26.656 31.396C27.735 31.276 29.528 30.888 30.4 30.491C33.83 28.933 34.941 25.648 34.941 24.313C34.941 22.702 33.718 21.735 32.536 21.735C30.801 21.735 28.437 23.057 26.921 24.88C25.47 26.627 24.318 28.892 23.727 31.02C22.983 31.946 22.293 32.71 21.892 33.111C19.962 35.012 18.64 35.59 16.219 35.59C14.847 35.59 12.458 35.169 10.153 34.76C8.975 34.553 7.76 34.338 6.715 34.185C8.103 32.384 9.012 30.528 9.343 29.801C10.368 27.512 11.368 24.913 12.248 22.615C12.744 21.33 13.21 20.111 13.62 19.115C14.442 17.119 16.797 12.475 20.876 12.475C23.206 12.475 23.553 14.425 23.553 15.591C23.553 19.363 20.69 23.508 18.082 23.508C17.843 23.508 17.504 23.462 17.194 23.268C16.929 23.099 16.814 22.871 16.731 22.714L16.024 23.235C16.148 23.495 16.425 23.822 16.686 23.979C17.248 24.318 17.76 24.355 18.136 24.355C19.57 24.355 21.235 23.64 22.586 22.442C24.367 20.863 25.611 18.206 25.611 15.975C25.611 13.297 23.851 11.698 20.896 11.698C19.822 11.698 14.305 12.045 11.244 18.938C10.669 20.235 9.983 22.033 8.611 25.611C8.169 26.768 7.653 28.107 7.049 29.681C6.706 30.578 5.987 32.322 5.016 33.958C4.744 33.933 4.504 33.933 4.306 33.933C1.612 33.933 0 35.177 0 36.375C0 37.177 0.545 37.656 1.455 37.656L1.467 37.66ZM94.977 24.995C96.184 23.429 97.056 23.028 97.51 22.842C97.766 22.739 98.167 22.632 98.477 22.632C99.023 22.632 99.667 22.892 100.192 23.64L98.056 28.743L98.047 28.768C96.75 31.875 93.576 35.656 92.337 35.838C91.738 35.925 91.213 35.59 91.209 34.429C91.196 31.293 93.101 27.429 94.973 24.995L94.977 24.995ZM76.354 3.909C79.151 1.913 82.779 0.723 86.056 0.723C91.585 0.723 94.06 2.888 94.06 5.033C94.06 7.826 90.552 10.653 83.841 10.653C79.424 10.653 75.23 9.863 71.693 9.078C72.709 7.401 73.986 5.616 76.349 3.909L76.354 3.909ZM57.379 24.995C58.585 23.429 59.457 23.028 59.912 22.842C60.168 22.739 60.569 22.632 60.879 22.632C61.428 22.632 62.069 22.892 62.598 23.64L60.461 28.747C59.172 31.859 55.986 35.656 54.743 35.838C54.143 35.925 53.619 35.59 53.614 34.429C53.602 31.293 55.507 27.429 57.379 24.995ZM42.144 24.995C43.35 23.429 44.222 23.028 44.677 22.842C44.933 22.739 45.334 22.632 45.644 22.632C46.193 22.632 46.834 22.892 47.358 23.64L45.222 28.747C43.933 31.859 40.747 35.656 39.503 35.838C38.904 35.925 38.379 35.59 38.375 34.429C38.363 31.293 40.268 27.429 42.14 24.995L42.144 24.995ZM28.694 24.933C29.644 23.57 30.722 22.756 31.582 22.756C32.685 22.756 32.739 24.008 32.739 24.26C32.739 26.119 31.446 28.714 29.284 29.908C28.673 30.247 27.537 30.644 26.603 30.751C26.413 30.772 26.223 30.793 26.037 30.813C26.603 28.76 27.698 26.334 28.694 24.933ZM2.516 35.363C2.876 35.363 3.401 35.445 3.93 35.541C3.157 36.479 2.306 36.995 1.529 36.995C1.19 36.995 0.831 36.813 0.831 36.412C0.831 35.892 1.409 35.363 2.521 35.363L2.516 35.363Z" fill="#ffffff"/><path transform="matrix(1 0 0 1 124.37 46.01)" d="M0 1.595L0 1.587C0 0.723 0.702 0 1.591 0C2.479 0 3.173 0.715 3.173 1.578L3.173 1.587C3.173 2.45 2.471 3.173 1.583 3.173C0.694 3.173 0 2.459 0 1.595ZM3.004 1.587L3.004 1.578C3.004 0.793 2.397 0.161 1.591 0.161C0.785 0.161 0.169 0.806 0.169 1.587L0.169 1.595C0.169 2.38 0.777 3.016 1.583 3.016C2.388 3.016 3.004 2.372 3.004 1.587ZM0.946 0.711L1.686 0.711C1.905 0.711 2.074 0.777 2.19 0.888C2.277 0.971 2.326 1.091 2.326 1.236L2.326 1.244C2.326 1.512 2.169 1.678 1.942 1.744L2.388 2.372L2.012 2.372L1.607 1.797L1.26 1.797L1.26 2.372L0.946 2.372L0.946 0.711ZM1.674 1.521C1.88 1.521 2 1.421 2 1.264L2 1.256C2 1.091 1.876 1 1.674 1L1.26 1L1.26 1.525L1.674 1.525L1.674 1.521Z" fill="#ffffff"/></svg>`,
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
  // Trend glyph for the enquiries cards (the reference's 88 × 79 arrow): sky blue rising for a "+" figure, coral falling for a "−" figure.
  // Gradient ids carry a suffix so four icons on one slide don't share a <defs> id.
  const TREND_PATH = "M4.085 33.386L3.932 32.398L3.196 32.512L3.095 33.25L4.085 33.386ZM45.594 26.951L45.747 27.939L46.188 27.871L46.432 27.497L45.594 26.951ZM0 63.143L0.991 63.279L5.076 33.522L4.085 33.386L3.095 33.25L-0.991 63.007L0 63.143ZM4.085 33.386L4.238 34.374L45.747 27.939L45.594 26.951L45.441 25.963L3.932 32.398L4.085 33.386ZM45.594 26.951L46.432 27.497L63.981 0.546L63.143 0L62.305 -0.546L44.756 26.406L45.594 26.951Z";
  const TREND_HEAD = "M0 11.576L-0.74 10.904L-1.351 11.576L-0.74 12.249L0 11.576ZM10.524 0L9.784 -0.673L-0.74 10.904L0 11.576L0.74 12.249L11.264 0.673L10.524 0ZM0 11.576L-0.74 12.249L9.784 23.825L10.524 23.152L11.264 22.48L0.74 10.904L0 11.576Z";
  const trendIcon = (v, i) => {
    const s = String(v).trim(); if (!/^[+−-]/.test(s)) return "";
    const up = s[0] === "+", col = up ? "#86b8cb" : "#f3777a", id = `tg-${i}-${up ? "u" : "d"}`;
    return `<svg class="trend" width="88" height="79" viewBox="0 0 88 79" aria-hidden="true"><defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="1.93" y1="-10.48" x2="-10.39" y2="56.51"><stop offset="0" stop-color="${col}" stop-opacity="0"/><stop offset="1" stop-color="${col}"/></linearGradient></defs>
      <path transform="${up ? "matrix(-1 0 0 -1 73.84 67.59)" : "matrix(-1 0 0 1 73.84 10.16)"}" d="${TREND_PATH}" fill="url(#${id})"/>
      <rect transform="${up ? "matrix(0.71 -0.71 -0.71 -0.71 10.41 75.3)" : "matrix(0.71 0.71 -0.71 0.71 10.41 2.46)"}" width="10.49" height="10.49" fill="${col}"/>
      <path transform="${up ? "matrix(-0.15 0.99 -0.99 -0.15 85 6.04)" : "matrix(-0.15 -0.99 -0.99 0.15 84.99 71.71)"}" d="${TREND_HEAD}" fill="${col}"/></svg>`;
  };
  // Share glyph for the survey cards (the reference's 66 px pie): a sky-blue wedge from 3 o'clock, clockwise, sized by the figure ("69%" → 69 %).
  const pieSVG = v => {
    const pct = parseFloat(String(v).replace(/[^\d.]/g, "")); if (isNaN(pct)) return "";
    const p = Math.max(0, Math.min(100, pct)) / 100, r = 33, c = 33, a = p * Math.PI * 2;
    const x = c + r * Math.cos(a), y = c + r * Math.sin(a);
    const wedge = p >= 1 ? `<circle cx="${c}" cy="${c}" r="${r}" fill="#86b8cb"/>` : p <= 0 ? "" : `<path d="M${c + r} ${c}A${r} ${r} 0 ${p > .5 ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)}L${c} ${c}Z" fill="#86b8cb"/>`;
    return `<svg class="pie" width="66" height="66" viewBox="0 0 66 66" aria-hidden="true"><circle cx="${c}" cy="${c}" r="27" fill="#86b8cb" fill-opacity=".15"/>${wedge}</svg>`;
  };

  /* ---------------- templates ---------------- */
  const TPL = {
    cover: s => `${bgHTML(s.bg, "", s.video)}<div class="inner">
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

    /* statgrid (1.2 enquiries): four light cards with a trend arrow, the figure, a hairline, label and note (photo fades in on hover);
       then "What enquiries can tell you" and "Latest month" as rows with the heading on the left and the content to its right. */
    statgrid: s => `<div class="inner tpl-statgrid ${s.pending ? "pending" : ""}">${placeLine(s)}<h1 class="t-title">${h(s.title)}</h1><hr class="hr head-rule">
      <div class="grid">${s.stats.map((x, i) => `<div class="tile">${x.photo ? `<div class="ph" style="background-image:${photoURL(x.photo)}"></div>` : ""}
        ${trendIcon(x.v, i)}<div class="v">${h(x.v)}</div><hr class="hr"><div class="l">${h(x.l)}</div><div class="t">${h(x.t)}</div></div>`).join("")}</div>
      ${s.rows ? `<div class="rows">${s.rows.map(r => `<div class="row" style="--n:${(r.cols || [r.t]).length}"><h3>${h(r.h)}</h3><div class="cols">${(r.cols || [r.t]).map(c => `<p>${h(c)}</p>`).join("")}</div></div>`).join("")}</div>` : ""}
      ${s.latest ? `<div class="latest"><h3>${h(s.latest.h).replace(/:\s*/, ": <br>")}</h3><div class="grid">${s.latest.items.map(([v, t]) => `<div><div class="v">${h(v)}</div><p>${h(t)}</p></div>`).join("")}</div></div>` : ""}</div>`,

    /* survey (1.4 "Residents are thinking long term"): four sky-blue frosted cards on the navy page — a pie glyph sized by the figure,
       the figure in cream, a hairline, a bold label and the paragraph. On hover the card's photo fades in under the text (57 %). */
    survey: s => `<div class="inner tpl-survey">${placeLine(s)}<h1 class="t-title">${h(s.title)}</h1><hr class="hr head-rule">
      <div class="grid">${s.stats.map(x => `<div class="scard">${x.photo ? `<div class="ph" style="background-image:${photoURL(x.photo)}"></div>` : ""}
        <div class="in">${pieSVG(x.v)}<div class="v">${h(x.v)}</div><hr class="hr"><div class="l">${h(x.l)}</div><div class="t">${h(x.t)}</div></div></div>`).join("")}</div></div>`,

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

    /* fivecols (1.3 market position): five glass cards over the photo, each with a glyph (trend arrow, pie or the twin circles),
       the question, the figure, label and notes. `ico` on a column forces the glyph ("up" | "down" | "pie" | "watch"); otherwise it
       follows the figure: a signed figure → arrow, a plain percentage → pie, no figure → the circles. Hover turns a card solid light. */
    fivecols: s => {
      const glyph = (c, i) => {
        const v = String(c.v || "").trim();
        const kind = c.ico || (!v ? "watch" : /^[+−-]/.test(v) ? "trend" : /%$/.test(v) ? "pie" : "");
        if (kind === "watch") return `<svg class="ico watch" width="81" height="54" viewBox="0 0 81 54" aria-hidden="true"><circle cx="54" cy="27" r="27" fill="#ffffff"/><circle cx="27" cy="27" r="27" fill="#86b8cb"/></svg>`;
        if (kind === "pie") return pieSVG(v);
        if (kind === "trend") return trendIcon(v, "f" + i);
        if (kind === "up" || kind === "down") return trendIcon(kind === "up" ? "+" : "−", "f" + i);
        return "";
      };
      return `${bgHTML(s.bg)}<div class="inner tpl-fivecols">${placeLine(s)}<h1 class="t-title">${h(s.title)}</h1><hr class="hr head-rule">
      ${s.source ? `<p class="sub">${h(s.source)}</p>` : ""}
      <div class="grid">${s.cols.map((c, i) => `<div class="col"><div class="ico-row">${glyph(c, i)}</div><div class="q">${h(c.q)}</div>
        ${c.v ? `<div class="v">${bigV(c)}</div>` : ""}${c.l ? `<div class="l">${h(c.l)}</div>` : ""}
        ${c.hl ? `<div class="hl">${h(c.hl)}</div>` : ""}${(c.paras || (c.t ? [c.t] : [])).map(p => `<div class="t">${h(p)}</div>`).join("")}</div>`).join("")}</div></div>`;
    },

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
        <div class="ctl"><span class="cap">Select the UAE market to compare</span><div class="seg">${[["dubai", "Dubai"], ["abudhabi", "Abu Dhabi"], ["both", "Compare both"]].map(([k, l]) => `<button type="button" data-view="${k}" aria-pressed="${view === k}">${l}</button>`).join("")}</div></div>
        <div style="display:flex;gap:13px"><div class="ctl"><span class="cap">Select a global city to compare against</span><label class="sel"><select data-select="cmp" aria-label="Compare the UAE with">${others.map(c => `<option value="${h(c.name)}" ${c.name === cmp ? "selected" : ""} ${c.pending ? "disabled" : ""}>${h(c.name)}${c.pending ? " (soon)" : ""}</option>`).join("")}</select></label></div>
        <div class="ctl"><span class="cap">Choose your preferred currency</span><label class="sel"><select data-select="cur" aria-label="Currency">${Object.entries(CURRENCIES).map(([k, c]) => `<option value="${k}" ${k === curKey ? "selected" : ""}>${k} · ${h(c.label)}</option>`).join("")}</select></label></div></div></div><hr class="hr">
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
        <div class="sum"><h3>Your plans at a glance</h3><div class="items">${[["Preferred market", lab, ICO.pin], ["Property price range", budget, ICO.house], ["Purchase plan", route, ICO.receipt]].map(([l, v, ic]) => `<div class="item">${ic}<div class="l">${h(l)}</div><div class="v">${h(v)}</div></div>`).join("")}</div></div>
        <div class="rows">${c.rows.map((r, i) => `<button type="button" class="row" data-row="${i}" aria-expanded="${i === openRow}"><div class="rh"><span>${h(r.h)}</span>${ICO.chev}</div><div class="body">${r.paras.map(p => `<p>${h(p)}</p>`).join("")}</div></button>`).join("")}</div>
        <div class="cta-row"><button type="button" class="cta" data-jump-id="${h(s.cta.jump)}">${h(s.cta.label)} ${ICO.arrow}</button><span class="seemore">See more ${ICO.chev}</span></div></div>`;
    },

    checklist: s => {
      const key = s.chooser ? s.chooser.key : "ptype";
      const variant = state.choices[key] || (s.chooser ? s.chooser.options[0][0] : "ready");
      const steps = s.steps || s.variants[variant] || s.variants[Object.keys(s.variants)[0]];
      const per = MOBILE.matches ? steps.length : (s.perPage || 3);                      // cards per page; set `perPage` on the slide to show them all (4.1 → 6, two rows; 4.3 → 4, one row)
      const layout = per === 4 ? "four-up" : per > 3 ? "two-rows" : "";
      const page = +(state.choices["pg-" + s.id] || 0), pages = Math.ceil(steps.length / per);
      const shown = steps.slice(page * per, page * per + per);
      const chooser = s.chooser || (s.variants ? { label: "Property type", key: "ptype", options: [["offplan", "Off-plan"], ["ready", "Ready"]] } : null);
      const open = local["open-" + s.id] ?? -1;
      const focusStep = shown.find(x => x.focus);
      return `${bgHTML(s.bg)}<div class="shade dim"></div><div class="inner tpl-checklist ${layout}"><div class="title-row"><div>${title(s)}${s.lede ? `<p class="t-lead" style="margin-top:10px">${h(s.lede)}</p>` : ""}${s.body ? `<p class="t-body" style="margin-top:2px;max-width:1100px">${h(s.body)}</p>` : ""}</div>
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
      return `<div class="map ${open ? "dim" : ""}" data-src="${h(mapName || "")}"${lq ? ` style="${lq}"` : ""}>${mapName ? `<img alt="" src="${src(mapName)}" data-try="${/[\/.]/.test(mapName) ? "" : "png,jpg"}" onerror="var t=(this.dataset.try||'').split(',').filter(Boolean);if(t.length){this.dataset.try=t.slice(1).join(',');this.src='${IMG}${mapName}.'+t[0];}else this.remove()">` : ""}</div>${pins}
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
      ${[s.left, s.right].map((x, i) => `<button type="button" class="dia ${i ? "dark" : ""}" data-choice="${h(s.chooserKey)}:${h(x.key)}" data-go="next"><span class="face"></span><span class="lbl"><b>${h(x.h).replace(/ /, "<br>")}</b><small>${h(x.t)}</small></span></button>`).join("")}</div>`,

    closing: s => `${bgHTML(s.bg)}<div class="inner tpl-closing"><h1 class="t-title">${h(s.title)}</h1><hr class="hr head-rule">
      ${s.blocks.map(b => `<div class="blk">${b.h ? `<h2 class="t-title">${h(b.h)}</h2>` : ""}<p class="t-body">${h(b.t)}</p>
        <button type="button" class="btn" ${b.save ? 'data-save="1"' : b.jump ? `data-jump-id="${h(b.jump)}"` : b.href ? `data-href="${h(b.href)}"` : ""}>${h(b.btn)} ${ICO.arrow}</button>
        ${b.note ? `<p class="t-lead note">${h(b.note)}</p>` : ""}</div>`).join('<hr class="hr">')}</div>`,

    /* begin (09, the reference's slide 51): the title, five frosted option cards (hover highlights one), one salmon button,
       a hairline, then three panels (PRIME, Leading RE, and the pale "Return to it" panel) each with a salmon button; the disclaimer last. */
    begin: s => {
      const btn = (b, cls = "") => `<button type="button" class="btn ${cls}" ${b.save ? 'data-save="1"' : b.jump ? `data-jump-id="${h(b.jump)}"` : b.href ? `data-href="${h(b.href)}"` : ""}>${h(b.btn || s.btn)} ${ICO.arrow}</button>`;
      const logo = k => k === "prime" ? ICO.logoPrime : k === "leadingre" ? ICO.logoLeadingRE : "";
      return `${bgHTML(s.bg)}<div class="inner tpl-begin"><h1 class="t-title">${h(s.title)}</h1><hr class="hr head-rule">
      <div class="cards">${s.cards.map(c => `<article class="card"><h3>${h(c.h)}</h3><hr class="hr"><p>${h(c.t)}</p>${c.btn || c.href || c.jump ? btn(c) : ""}</article>`).join("")}</div>
      ${s.btn ? btn(s, "solid main") : ""}
      ${s.panels ? `<hr class="hr panel-rule"><div class="panels">${s.panels.map(p => `<article class="panel ${p.pale ? "pale" : ""}">${p.logo ? `<div class="plogo">${logo(p.logo)}</div><h2 class="sr-only">${h(p.h)}</h2>` : `<h2>${h(p.h)}</h2>`}<p>${h(p.t)}</p><hr class="hr"><div>${btn(p, "solid")}</div></article>`).join("")}</div>` : ""}
      ${s.prime ? `<hr class="hr prime-rule"><h2 class="t-title">${h(s.prime.h)}</h2><p class="t-body">${h(s.prime.t)}</p>${btn(s.prime, "solid")}` : ""}
      ${s.note ? `<p class="note">${h(s.note)}</p>` : ""}</div>`;
    },

    abroad: s => {
      /* 08: region tabs and a row of country cards that scroll under the frame (the reference's slide 48 + 75). */
      const regions = s.regions, cur = state.choices["region-" + s.id] || regions.find(r => r.countries.length)?.key || regions[0].key;
      const r = regions.find(x => x.key === cur) || regions[0];
      return `${bgHTML(s.bg)}<div class="shade dim"></div><div class="inner tpl-abroad"><div class="scroll"><div class="page">
        <div class="t-num">${h(s.num)}</div><h1 class="t-hero">${h(s.title)}</h1><hr class="hr">
        <div class="lead"><div class="copy">${s.foot.q ? `<p class="q">${h(s.foot.q)}</p>` : ""}<p>${h(s.foot.t)}</p></div>
          <button type="button" class="cta" ${s.foot.jump ? `data-jump-id="${h(s.foot.jump)}"` : s.foot.href ? `data-href="${h(s.foot.href)}"` : `data-go="next"`}>${h(s.foot.label)} ${ICO.arrow}</button></div>
        <div class="tabs" role="tablist">${regions.map(x => `<button type="button" role="tab" data-region="${h(x.key)}" aria-selected="${x.key === cur}" ${x.countries.length ? "" : 'disabled title="Coming soon"'}>${h(x.label)}</button>`).join("")}</div>
        ${r.countries.length ? `<div class="cards" style="grid-template-columns:repeat(${r.countries.length},1fr)">${r.countries.map(c => `<article class="card"><h2>${h(c.name)}</h2><hr class="hr">
          ${c.items.map(([k, v], i) => `${i ? `<hr class="hr soft">` : ""}<h3>${h(k)}</h3><p>${h(v)}</p>`).join("")}</article>`).join("")}</div>`
          : `<p class="empty">${h(r.empty || "Guidance for this region is being prepared.")}</p>`}
        <div class="foot"><div class="small">${s.foot.small.map(x => `<p>${h(x)}</p>`).join("")}</div></div></div></div>
        <div class="fade"></div><button type="button" class="cue" data-cue="1">Scroll<br>${ICO.chev}</button></div>`;
    },

    process: s => {
      /* Stage line (the reference's 6.1): a soft hairline with a diamond per stage, a cream progress line up to the selected
         stage (light blue, larger), a number above and name + duration below; small frosted chevrons sit between stages. */
      const cur = +(state.choices["step-" + s.id] || 0), st = s.steps[cur], n = s.steps.length;
      return `${bgHTML(s.bg)}<div class="shade dim"></div><div class="inner tpl-process">${title(s)}<hr class="hr head-rule"><p class="t-body">${h(s.body)}</p>
        <div class="timeline" role="tablist" style="--n:${n};--cur:${cur}">
          <span class="rail"></span><span class="prog"></span>
          ${s.steps.map((x, i) => `<button class="tl ${i > cur ? "future" : ""}" role="tab" data-tab="${i}" aria-selected="${i === cur}"><span class="n">${h(x.n)}</span><span class="d"></span><span class="h">${h(x.h)}</span><span class="tm">${h(x.time)}</span></button>
            ${i < n - 1 ? `<button type="button" class="step" style="left:calc(${(i + 1) * 100 / n}% - 63px)" data-tab="${i + 1}" aria-label="Next stage">${ICO.chev}</button>` : ""}`).join("")}</div>
        <div class="detail"><span class="n">${h(st.n)}</span><h3>${h(st.h)}</h3><hr class="hr">
          ${st.wide ? `<div class="intro"><b>Typical planning time · ${h(st.time)}</b>${(st.paras || [st.t]).map(p => `<p>${h(p)}</p>`).join("")}</div><hr class="hr">` : ""}
          <div class="cols">${st.wide ? "" : `<div><b>Typical planning time · ${h(st.time)}</b>${(st.paras || [st.t]).map(p => `<p>${h(p)}</p>`).join("")}</div>`}
          ${st.cols.map((c, i) => `<div><b>${h(c.h)}</b>${c.items.length === 1 && !c.list ? `<p>${h(c.items[0])}</p>` : `<ul>${c.items.map(it => `<li>${h(it)}</li>`).join("")}</ul>`}${i === st.cols.length - 1 ? `<p class="end">${h(st.end)}</p>` : ""}</div>`).join("")}</div></div></div>`;
    }
  };
  const LIGHT = new Set(["statgrid", "survey", "compare", "cities"]);   // light (#ede8e4) pages; everything else is a photo on black
  // A slide with `navy: true` renders on the flat navy page (#1d2331, white type, sky-blue title) instead — the 1.4 survey and compare slides.

  /* ---------------- render ---------------- */
  function render(id, dir = 1, replace = false) {
    const slide = byId(id); if (!slide) return;
    state.id = id;
    slidesEl.querySelectorAll(".slide.exit").forEach(x => x.remove());
    const prev = current();
    const el = document.createElement("section");
    const navy = !!slide.navy;
    const light = !!((LIGHT.has(slide.tpl) || slide.light) && !slide.dark && !navy);
    el.className = `slide tpl-${slide.tpl} ${light ? "light" : "dark"} ${navy ? "navy" : ""} enter`;
    el.innerHTML = TPL[slide.tpl](slide);
    if (prev) {
      prev.classList.remove("enter"); prev.classList.add("exit");
      prev.addEventListener("animationend", e => { if (e.target === prev) prev.remove(); });
      setTimeout(() => prev.remove(), 600);
    }
    slidesEl.appendChild(el);
    if (MOBILE.matches) window.scrollTo(0, 0);
    stage.classList.toggle("light", light);
    stage.classList.toggle("navy", navy);
    stage.classList.toggle("chrome-none", slide.tpl === "cover");
    stage.classList.toggle("chrome-min", slide.tpl === "toc");
    writeHash(replace);
    updateChrome(slide);
    const p = path(), i = p.findIndex(s => s.id === id);
    preload(p[i + 1]); preload(p[i - 1]);
    document.title = (slide.title || DECK.meta.title) + " · betterhomes";
  }
  function current() { const all = slidesEl.querySelectorAll(".slide:not(.exit)"); return all[all.length - 1] || null; }
    function rerender() {
    const el = current(); if (!el) return;
    const s = byId(state.id);
    const tmp = document.createElement("div");
    tmp.innerHTML = TPL[s.tpl](s);
    // keep the existing background photo / map so the image doesn't reload; only the content is rebuilt.
    // The photo is only reused when it is the SAME image (data-src): the 05 slides swap their map / skyline
    // when the market changes, and reusing the old element would leave the Dubai map under the Abu Dhabi list.
    const kept = [];
    el.querySelectorAll(":scope > .bg, :scope > .map").forEach(k => {
      const n = tmp.querySelector(":scope > ." + k.classList[0]);
      if (n && n.dataset.src === k.dataset.src) { k.className = n.className; n.remove(); kept.push(k); }
    });
    el.replaceChildren(...kept, ...tmp.childNodes);
    el.classList.add("settled");                       // the cards' entrance animation only plays once per slide
    writeHash(true); updateChrome(s);
  }
  function updateChrome(slide) {
    const p = path(), i = p.findIndex(s => s.id === slide.id), n = p.length;
    const pct = Math.round(i / (n - 1) * 100);
    $("#pfill").style.width = pct + "%"; $("#pdot").style.left = pct + "%"; $("#ppct").style.left = pct + "%"; $("#ppct").textContent = pct + "%";
    $("#counter").textContent = `Page ${String(i + 1).padStart(2, "0")} / ${n}`;
    const g = goalsOf(), gl = g.length && CM.archetypes[g[0]] ? " · " + CM.archetypes[g[0]].label : "";
    $("#jlabel").textContent = (state.market ? DECK.markets[state.market].label + " journey" : "") + gl;
    $("#back").disabled = i === 0; $("#next").disabled = i === n - 1 || (slide.tpl === "cover" && !state.market);
    stage.classList.toggle("chrome-nopager", i === n - 1);   // last page of the journey: no Back / Next
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
    menu.classList.toggle("open", open);
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
  // The hamburger opens the table of contents (the menu overlay with the market / goal switches stays on the M key).
$("#burger").addEventListener("click", () => { openMenu(false); render("contents", 1); });
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
