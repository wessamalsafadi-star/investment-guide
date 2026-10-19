# UAE property investment handbook — interactive web presentation

A static, dependency-free web presentation that replaces the PDF deck. Built to scale to 100+ slides without slowing down.

## Files

| File | What it is | Who edits it |
|---|---|---|
| `index.html` | Shell + all CSS (design tokens, templates, responsive rules) | Developer / designer |
| `app.js` | Engine: routing, journeys, rendering, preloading, keyboard/swipe | Developer |
| `slides.js` | **All slide content**, sections and journeys | Content team |
| `communities.js` | **One profile per community** (17 fields), pin positions and the archetype highlight grid | Content / data team |
| `img/*.webp` | Background photography, 1920w + 960w versions | Designer |
| `img/lqip.js` | 24px blur placeholders (auto-generated) | Build step |

Host it anywhere static (S3, Netlify, Vercel, WordPress upload…). No build needed.

## How journeys work

Every slide in `slides.js` can carry a `market` key: `"dubai"`, `"abudhabi"` or `"compare"`.

- No `market` → the slide appears in every journey.
- With `market` → it only appears when that journey is active.

A `hub` slide shows the three choice buttons. Picking one sets the journey; the deck re-routes instantly and the progress bar / page count reflect only the slides on that route. The journey can be changed any time from the ☰ menu, and it's carried in the URL (`#/s1-3-dxb?m=dubai`) so links are shareable and the browser Back button works.

In-slide choices (Off-plan / Ready, Income Builder / Growth Investor, tab 01–04, step 01–04, map pin) are also stored in the URL, e.g. `#/s3-1-verify?ptype=offplan`.

**The PDF's repeated pages** (a hub shown three times with a different button highlighted, the "Verify your property" slide shown with 01–03 then 04–06, the four demand-driver tabs, the four process steps) are each ONE slide here with internal state. 68 PDF pages → 41 slides; a 100-slide PDF will typically become 55–65.

## Community highlighting (section 05)

The logic from the personalisation doc, as built:

- **One profile per community** lives in `communities.js`. Its text and figures never change between archetypes.
- **Archetype changes highlighting only.** Each community has a `fit` map: `2` = ● strong match, `1` = ○ secondary match, absent = none, for A1 Income Builder · A2 Growth Investor · A3 Residency Investor · A4 Lifestyle Owner · A5 Wealth Diversifier.
- The visitor's goals arrive from `form.html` in the URL (`goal=` main, `goals=` up to two additional) and map to archetypes. Score per community = `fit[main] × 70 + Σ fit[additional] × (30 ÷ additional count)`. Score > 0 → highlighted; otherwise faded but still clickable and keyboard-reachable.
- **Skyline (`s5-open`)** shows the top 8 highlighted communities, ranked by score (ties keep file order), placed on `COMMUNITIES.slots[market]` in rank order. "All communities" jumps to `s5-list`.
- **Full map (`s5-list`)** shows every community; non-matches fade, the chip row lists matches first.
- **No goals** ("still exploring"): nothing fades; the skyline shows the 8 communities with the most marks overall.
- Budget is deliberately ignored here.
- The ☰ menu has an **Investor profile** switcher so one deck can be re-used for several clients; it's carried in the URL (`?goal=rental_income`).

**To edit:** change `fit` values, figures or text in `communities.js` only. Rows marked `// CONFIRM FIT`, `// verify` and `// TODO` need the data team's attention (see the header comment in that file). Community `name`s must match the `COMMUNITIES` list in `form.html` — if you add, rename or remove one, update both.

## Adding a slide

Append an object to `DECK.slides`:

```js
{ id: "s2-4-new", section: "s2", market: "dubai", tpl: "fivecols", bg: "dubai-canal",
  city: "Dubai", title: "…", cols: [ … ] }
```

Nothing else changes. Templates available: `cover`, `toc`, `opener`, `learn`, `hub`, `signals`, `chartcards`, `statgrid`, `survey`, `compare`, `fivecols`, `tabs`, `cities`, `global`, `checklist`, `map`, `communities`, `split`, `process`. Look at an existing slide of the same template to see the fields. New templates are added in `app.js` → `TPL` (one function returning HTML) plus CSS under `/* TEMPLATES */` in `index.html`.

## Adding an image

Drop `name.webp` (≤1920px wide, quality ~75) and `name-m.webp` (960px) into `img/`, then reference it as `bg: "name"`. Optionally add a blur placeholder to `img/lqip.js` (any 24px WebP as a data URI).

## Performance design

- **One slide in the DOM at a time.** Slide count has zero effect on load time or memory.
- **First paint is ~60 KB** (HTML + CSS + JS + content). Fonts come from Google Fonts with `display=swap`.
- **Images are lazy.** Each slide pulls one ~150–250 KB WebP, with a blurred placeholder visible instantly. The next and previous slides' images are pre-fetched while the reader is on the current one, so Next feels instant.
- **Two image sizes** via `srcset`: phones never download the 1920px version.
- **Whole asset set is 8.4 MB** (the PDF was 195 MB), but a full read-through on one journey loads ~5 MB.

## Keyboard & touch

← → / PageUp / PageDown / Space to move · M for menu · Esc to close · swipe left/right on touch.

## Brand fonts

Headlines use Fraunces and body uses Figtree as stand-ins. To use the brand fonts, add `@font-face` rules for Ivy Mode / Ivy Epic and change `--font-display` / `--font-body` in `:root`.