/* ============================================================
   communities.js — ONE profile per community + the archetype
   highlight grid. Edited by the content / data team.
   ------------------------------------------------------------
   HOW THE PERSONALISATION WORKS (see README → "Community highlighting")
   • Every community carries ONE fixed profile. Nothing below changes
     between archetypes — only which communities are highlighted.
   • `fit` is the highlight grid from the personalisation logic doc:
        2 = ● strong match      1 = ○ secondary match      absent = none
   • The visitor's goals arrive in the URL (`goal=` main, `goals=` up
     to two additional — written by form.html). app.js maps them to
     archetypes A1–A5 and scores each community:
        score = fit[main] × 70 + Σ fit[additional] × (30 ÷ additional count)
     score > 0  → highlighted.   score = 0 → faded (still clickable).
   • Skyline slide (s5-open) shows the top 8 highlighted, ranked by score
     (ties keep the order of this file). "All communities" jumps to the
     full map (s5-list), where everything is shown and non-matches fade.
   • No goals ("still exploring") → nothing fades; the skyline shows the
     8 communities with the most marks in total.

   ARCHETYPES (form goal id → archetype)
     rental_income             → A1 Income Builder
     capital_growth            → A2 Growth Investor
     uae_residency             → A3 Residency Investor
     personal_use              → A4 Lifestyle Owner
     portfolio_diversification → A5 Wealth Diversifier

   FIELDS (the 17-field location profile, same order as the doc)
     name          Community name as marketed. Must stay identical to the
                   names in form.html → COMMUNITIES (the form passes a
                   chosen community to the guide by name).
     short         Label used on the skyline pins (keep ≤ 16 chars).
     fit           Highlight grid — see above.
     map           [x, y] position on the line-map artwork, as fractions of
                   the 1920 × 1080 frame (img/slide-42-map.png for Dubai,
                   img/abudhabi-map.png for Abu Dhabi).
     photo         Image name from /img (no extension). Optional.
     overview      2–3 sentences, archetype-neutral.
     market        Ready / off-plan / mixed.
     types         Main property types.
     psf           Indicative price per sq ft (AED).
     yield         Average gross rental yield.
     entry         Indicative entry price (AED).
     range         Typical purchase price range (AED).
     rent          Typical annual rental range (AED).            ← TODO everywhere
     service       Average service charge per sq ft (AED/yr).    ← TODO everywhere
     growth5y      Five-year price growth (%).                    ← TODO everywhere
     daysToSell    Average time to find a buyer (days).           ← TODO everywhere
     demand        Main sources of buyer & rental demand.
     connectivity  Connectivity & nearby landmarks.
     strengths     Key investment strengths (2–4).
     risks         Important costs, limitations or risks (2–4).
     source        Data source, reporting period & last-updated.  ← TODO where blank

   CONFIDENCE NOTES
   • The `fit` grid was decoded from a pasted table whose columns had
     lost alignment. Rows marked "// CONFIRM FIT" are the ones where the
     decoding is least certain — please check against the master sheet.
   • Figures tagged "(verify)" in the source doc are marked `// verify`.
   • Abu Dhabi: the source doc had its fields shifted one row (yields
     sat under "price per sq ft", etc.). They have been re-keyed to the
     correct fields here; price per sq ft was missing and is TODO.
   ============================================================ */

window.COMMUNITIES = {

  archetypes: {
    A1: { goal: "rental_income",             label: "Income Builder",      line: "an income-focused investor" },
    A2: { goal: "capital_growth",            label: "Growth Investor",     line: "a growth-focused investor" },
    A3: { goal: "uae_residency",             label: "Residency Investor",  line: "an investor with residency plans" },
    A4: { goal: "personal_use",              label: "Lifestyle Owner",     line: "someone buying a home to use" },
    A5: { goal: "portfolio_diversification", label: "Wealth Diversifier",  line: "an investor diversifying their portfolio" }
  },

  /* Skyline pin slots for s5-open, per market: [x, y] fractions of the
     photo. Slot i is given to the community ranked i. Add/move slots
     to suit the photo; keep ≥ 8. Labels sit above the diamond. */
  slots: {
    dubai:    [[0.12, 0.26], [0.23, 0.32], [0.33, 0.39], [0.46, 0.34], [0.62, 0.30], [0.70, 0.17], [0.82, 0.12], [0.89, 0.18], [0.54, 0.22], [0.04, 0.36]],
    abudhabi: [[0.13, 0.47], [0.26, 0.42], [0.40, 0.28], [0.58, 0.50], [0.74, 0.62], [0.87, 0.31], [0.49, 0.18], [0.66, 0.24]]
  },

  /* ─────────────────────────── DUBAI ─────────────────────────── */
  dubai: [
    { name: "Marina", short: "Dubai Marina", fit: { A1: 2, A3: 2, A4: 2, A5: 2 }, map: [0.355, 0.830], photo: "dubai-aerial-sun", // CONFIRM FIT
      overview: "", // TODO overview
      market: "Ready (mature)", types: "1–3 bed apts, penthouses", psf: "AED 1,800–2,400", yield: "5.9%", entry: "~AED 1.5M (1-bed)", range: "AED 1.5M–5.5M",
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Largest tenant pool; expat professionals; strong holiday/short-let",
      connectivity: "Waterfront; metro & tram; JBR beach, Marina Walk; near Media/Internet City",
      strengths: "Deepest liquidity & fastest resale; established rental & resale",
      risks: "High service charge; slowest 5-yr growth of prime set; competes with holiday lets",
      source: "" },

    { name: "Emaar Beachfront", short: "Emaar Beachfront", fit: { A2: 2, A4: 1, A5: 1 }, map: [0.345, 0.800], photo: "",
      overview: "",
      market: "Off-plan / launch", types: "Beachfront apartments", psf: "AED 2,800–4,200 (launch)", yield: "~4.5–5.5% (prime waterfront)", entry: "~AED 2.5M+", range: "AED 2.5M–8M+", // verify
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Overseas off-plan investors; holiday/short-let",
      connectivity: "Gated island between Marina & JBR; private beach; Dubai Harbour cruise terminal",
      strengths: "Tightest supply pipeline; private-beach address; strong recent appreciation",
      risks: "Most expensive entry; small affordable-buyer pool; off-plan completion risk",
      source: "" },

    { name: "Palm Jumeirah", short: "Palm Jumeirah", fit: { A4: 2, A5: 2 }, map: [0.340, 0.735], photo: "", // CONFIRM FIT
      overview: "",
      market: "Ready (mature; some off-plan)", types: "Apts, villas, branded residences", psf: "AED 3,500–7,000+", yield: "~4.5–5% (prime)", entry: "~AED 3.5M+", range: "AED 3.5M–40M+",
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Holiday/short-let; luxury tenants; overseas HNW buyers",
      connectivity: "Man-made island; monorail; Atlantis, Nakheel Mall, The Pointe; beach access",
      strengths: "Most nights booked & highest nightly rates; strong 5-yr growth; iconic address",
      risks: "Highest service charge in Dubai; some towers restrict nightly lets; smaller buyer pool",
      source: "" },

    { name: "Jumeirah Lake Towers (JLT)", short: "JLT", fit: { A1: 1, A3: 1 }, map: [0.375, 0.860], photo: "",
      overview: "",
      market: "Ready (mature)", types: "Studios–3 bed apts", psf: "AED 1,500–1,900", yield: "~6–7% (metro apts)", entry: "~AED 1.1M", range: "AED 1.1M–3.2M",
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Professional tenants; SME owners; investors",
      connectivity: "Metro; lakes; adjacent to Dubai Marina; DMCC free zone",
      strengths: "Metro access; competitive yields; established mixed-use",
      risks: "Older towers vary in quality; service charges vary; parking pressure",
      source: "" },

    { name: "JBR (Jumeirah Beach Residence)", short: "JBR", fit: { A4: 1 }, map: [0.335, 0.845], photo: "", // CONFIRM FIT
      overview: "",
      market: "Ready (mature)", types: "Beachfront apts, some hotel-branded", psf: "AED 1,900–2,600", yield: "~5.5–6%", entry: "~AED 1.6M", range: "AED 1.6M–6M", // verify
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Holiday/short-let; beach-lifestyle tenants; investors",
      connectivity: "Beachfront; The Walk & The Beach retail; tram; next to Marina",
      strengths: "Direct beach; deep short-let demand; established footfall",
      risks: "High service charge; older stock; heavy short-let competition",
      source: "Waterfront-apt band (Sands Jun 2026); confirm area figure" },

    { name: "Tecom / Greens", short: "Tecom / Greens", fit: {}, map: [0.420, 0.845], photo: "", // TODO — in the list but not in the doc: no profile, no grid row. Remove or complete.
      overview: "",
      market: "", types: "", psf: "", yield: "", entry: "", range: "",
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "", connectivity: "", strengths: "", risks: "", source: "" },

    { name: "Town Square / Cherrywoods", short: "Town Square", fit: { A1: 1, A2: 1 }, map: [0.655, 0.965], photo: "", // map: TODO — not on the original list; position is a guess
      overview: "",
      market: "Mixed (ready + off-plan)", types: "Apts & townhouses", psf: "AED 1,100–1,450", yield: "~6–6.5%", entry: "~AED 700k", range: "AED 700k–2.5M", // verify
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Young families; value end-users; investors",
      connectivity: "Off Al Qudra Rd; Town Square park; car-reliant",
      strengths: "Affordable townhouses; community amenities; family demand",
      risks: "Peripheral; large supply pipeline; limited transport",
      source: "Affordable-community band; confirm area figure" },

    { name: "Damac Hills 2", short: "Damac Hills 2", fit: { A1: 1, A2: 1 }, map: [0.780, 0.985], photo: "", // map: TODO — not on the original list; position is a guess
      overview: "",
      market: "Mixed (off-plan heavy)", types: "Villas & townhouses", psf: "AED 700–950", yield: "~6.5–7.5%", entry: "~AED 1.1M", range: "AED 1.1M–2.5M", // verify
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Value villa buyers; end-users; yield investors",
      connectivity: "Remote (former Akoya Oxygen), off Jebel Ali–Lehbab Rd; car-reliant",
      strengths: "Lowest villa entry; high headline yields",
      risks: "Very remote; smaller plots; thin resale; amenity build-out ongoing",
      source: "Oliva/DLD context Apr 2026; confirm area figure" },

    { name: "Mira / Mira Oasis / Serena", short: "Mira / Serena", fit: { A3: 1 }, map: [0.700, 0.925], photo: "",
      overview: "",
      market: "Ready", types: "Townhouses", psf: "AED 1,200–1,600", yield: "~5.5–6.5%", entry: "~AED 2.2M", range: "AED 2.2M–4M", // verify
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Families; end-user driven; renewals",
      connectivity: "Reemram/Al Qudra area; Emaar/Dubai Properties townhouse communities",
      strengths: "Family townhouses; parks; established handover",
      risks: "Car-reliant; limited retail on-site; supply in adjacent phases",
      source: "Townhouse-community band; confirm area figure" },

    { name: "Damac Hills", short: "Damac Hills", fit: { A2: 1, A3: 1 }, map: [0.625, 0.945], photo: "",
      overview: "",
      market: "Mixed (villas ready; apt phases)", types: "Villas, townhouses, apts", psf: "~AED 1,300–1,800 (villa)", yield: "5.5–6.2%", entry: "~AED 3.8M (median 4-bed)", range: "AED 2M–8M",
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Families; golf/lifestyle buyers; investors",
      connectivity: "E311 & E611; ~22–28 min to Downtown; Trump golf; Jebel Ali School in-gate",
      strengths: "Golf; mid-tier pricing; yield + amenity mix",
      risks: "Build quality varies by cluster — cluster-level diligence needed",
      source: "Oliva/DLD Q1 2026 (Apr 2026)" },

    /* CONFIRM: the highlight grid lists "TAG (The Villa area group)" but the
       profile data lists "Tilal Al Ghaf" and has no TAG entry. Treated as the
       same community here. If they are different, split this into two rows
       and update form.html → COMMUNITIES to match. */
    { name: "Tilal Al Ghaf (TAG)", short: "Tilal Al Ghaf", fit: { A3: 1 }, map: [0.565, 0.965], photo: "", // CONFIRM FIT
      overview: "",
      market: "Ready", types: "Villas", psf: "AED 1,000–1,400", yield: "~5.5–6.5%", entry: "~AED 3M", range: "AED 3M–6M",
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Families; end-user villa buyers",
      connectivity: "Dubailand; Spanish-style villa community off E311",
      strengths: "Large plots; established community; value villas",
      risks: "Car-reliant; ageing infrastructure in parts; limited new supply",
      source: "" },

    { name: "Dubai Hills Estate", short: "Dubai Hills", fit: { A2: 2, A3: 2, A5: 2 }, map: [0.550, 0.725], photo: "",
      overview: "",
      market: "Mixed (villas ready; apt phases off-plan)", types: "Villas, townhouses, apts", psf: "AED 2,200–2,900", yield: "5.2%", entry: "~AED 1.8M (apt)", range: "AED 1.7M–12M",
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Owner-occupier families; schools; end-user driven",
      connectivity: "Dubai Hills Mall, park, golf, schools; between Downtown & Al Barsha",
      strengths: "Owner-occupier base steadies price; parks/schools/mall; controlled release",
      risks: "Lower rent share; apt phases compete; longer wait for new stock",
      source: "" },

    { name: "The Villa / Falcon City / Living Legends / Villanova / The Valley", short: "The Villa / Valley", fit: { A2: 1, A3: 1 }, map: [0.780, 0.780], photo: "",
      overview: "",
      market: "Mixed (ready + off-plan)", types: "Villas & townhouses", psf: "AED 1,100–1,600", yield: "~5.5–6.5%", entry: "~AED 1.8M", range: "AED 1.8M–6M",
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Families; end-user villa/townhouse buyers",
      connectivity: "Dubailand corridor; E311; car-reliant master communities",
      strengths: "Range of villa/townhouse budgets; family amenities",
      risks: "Car-reliant; mixed maturity; supply in newer phases (The Valley)",
      source: "" },

    { name: "The Sustainable City", short: "Sustainable City", fit: { A3: 1 }, map: [0.585, 0.995], photo: "",
      overview: "",
      market: "Ready", types: "Villas & apts", psf: "AED 1,300–1,700", yield: "~6–6.5%", entry: "~AED 2.5M", range: "AED 2.5M–5M",
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Eco-conscious families; end-users",
      connectivity: "Off Al Qudra Rd; net-zero community; car-reliant",
      strengths: "Sustainability USP; low utility costs; strong community",
      risks: "No dedicated specialist mapped; car-reliant; niche resale",
      source: "" },

    { name: "Arabian Ranches 1 & 2 / Polo Homes", short: "Arabian Ranches", fit: { A3: 1, A5: 1 }, map: [0.600, 0.855], photo: "",
      overview: "",
      market: "Ready", types: "Villas", psf: "~AED 1,500–2,000 (villa)", yield: "5.4–5.8%", entry: "~AED 4.6M (median 4-bed)", range: "AED 3M–8M",
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Families; schools; deepest villa resale market",
      connectivity: "E311 & E611; ~22–28 min to Downtown; JESS & Ranches Primary in-gate; 18-hole golf",
      strengths: "Emaar build quality; school catchment; deep secondary market; golf",
      risks: "Lower yield than newer communities; premium entry",
      source: "" },

    { name: "Arabian Ranches 3", short: "Ranches 3", fit: { A2: 1, A3: 1 }, map: [0.680, 0.865], photo: "",
      overview: "",
      market: "Off-plan / newly handing over", types: "Villas & townhouses", psf: "~AED 1,400–1,850", yield: "~5.5–6%", entry: "~AED 2.6M", range: "AED 2.6M–5M",
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Families; end-user; early investors",
      connectivity: "E611; newer Emaar phase; car-reliant",
      strengths: "Newer Emaar stock; family amenities; brand",
      risks: "Still building out; resale market immature; concurrent supply",
      source: "" },

    { name: "Victory Heights & JGE (Jumeirah Golf Estates)", short: "JGE", fit: { A3: 1, A5: 1 }, map: [0.480, 0.930], photo: "",
      overview: "",
      market: "Ready", types: "Villas", psf: "~AED 1,600–2,300 (villa)", yield: "~5–5.8%", entry: "~AED 4M", range: "AED 4M–15M",
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Golf-lifestyle families; end-users; overseas buyers",
      connectivity: "Off Sheikh Zayed/Emirates Rd; two championship golf courses (JGE)",
      strengths: "Golf-course villas; established prime community",
      risks: "Premium entry; lower yield; car-reliant",
      source: "" },

    { name: "DIP / Green Community", short: "DIP", fit: { A1: 1 }, map: [0.420, 0.975], photo: "",
      overview: "",
      market: "Ready", types: "Villas, townhouses, low-rise apts", psf: "AED 1,000–1,500", yield: "~6–7%", entry: "~AED 1.5M", range: "AED 1.5M–4M",
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Families; industrial/logistics workforce; value end-users",
      connectivity: "Dubai Investments Park; Green Community low-density; near Expo/EXPO City",
      strengths: "Green low-density living; value; near Expo growth corridor",
      risks: "Car-reliant; mixed industrial surroundings; niche resale",
      source: "Affordable villa/apt band; confirm area figure" },

    { name: "Emirates Living (Meadows / Springs / Lakes)", short: "Emirates Living", fit: { A3: 1, A5: 1 }, map: [0.405, 0.885], photo: "",
      overview: "",
      market: "Ready (mature)", types: "Villas & townhouses", psf: "~AED 1,600–2,200 (villa)", yield: "~5–6%", entry: "~AED 3.5M", range: "AED 3.5M–25M",
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Established families; end-user driven; renewals",
      connectivity: "Off Sheikh Zayed Rd; lakes; near Dubai Marina/JLT; Montgomerie golf nearby",
      strengths: "Mature Emaar villa communities; central location; strong schools nearby",
      risks: "Ageing stock in parts; premium entry; lower yields",
      source: "" },

    { name: "JVT / Jumeirah Park / Jumeirah Islands", short: "JVT / Jumeirah Park", fit: { A1: 1, A3: 1, A5: 1 }, map: [0.440, 0.900], photo: "",
      overview: "",
      market: "Mixed", types: "Townhouses, villas, some apts", psf: "AED 1,300–1,900", yield: "~5.5–6.8%", entry: "~AED 1.6M", range: "AED 1.6M–15M",
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Families; end-users; townhouse investors (JVT higher yield)",
      connectivity: "Off Sheikh Zayed Rd/Al Khail; near JLT & Marina; car-reliant",
      strengths: "Range from JVT townhouses to prime Jumeirah Islands villas; central",
      risks: "Wide quality spread across the three; confirm per-community",
      source: "" },

    { name: "Jumeirah Village Circle (JVC)", short: "JVC", fit: { A1: 2, A2: 2, A3: 2 }, map: [0.470, 0.865], photo: "",
      overview: "",
      market: "Mixed (large completed stock + pipeline)", types: "Studios–2 bed apts, some townhouses", psf: "AED 1,350–1,700", yield: "7.4–7.7%", entry: "~AED 750k", range: "AED 750k–2.2M",
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Deep mid-market tenant demand; end-users + investors",
      connectivity: "Central (Al Khail/SMBZ Rd); Circle Mall; bus (no metro)",
      strengths: "Wide completed stock; high rent share; accessible entry",
      risks: "Quality/running costs vary tower by tower; heavy supply pipeline",
      source: "DLD/REIDIN via Sands Jun 2026; guide yield" },

    { name: "Dubai South / Emaar South / Expo City", short: "Dubai South", fit: { A1: 1, A2: 2 }, map: [0.290, 0.985], photo: "",
      overview: "",
      market: "Off-plan / emerging", types: "Apts, townhouses, villas", psf: "AED 900–1,300", yield: "~6–7%", entry: "~AED 650k", range: "AED 650k–1.6M",
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Aviation/logistics workforce; long-term end-users; investors",
      connectivity: "Around Al Maktoum Airport (DWC) & Expo City",
      strengths: "Lowest entry; long-term airport & Expo growth story",
      risks: "Large concurrent supply; infrastructure maturing; slowest recent growth",
      source: "DLD/REIDIN via Sands Jun 2026" },

    { name: "Al Furjan / Jebel Ali", short: "Al Furjan", fit: { A1: 2, A3: 2 }, map: [0.370, 0.975], photo: "",
      overview: "",
      market: "Mixed (established + construction to 2027)", types: "Apts, townhouses, villas", psf: "AED 1,150–1,450", yield: "6.6–7.2%", entry: "~AED 2.4M (townhouse)", range: "AED 2.3M–2.8M (3-bed)",
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Established family tenants with strong renewals; end-users",
      connectivity: "Two metro stations (Route 2020); Ibn Battuta Mall; Sheikh Zayed Rd",
      strengths: "Metro access; family-tenant retention; townhouses clear outright",
      risks: "Construction nearby into 2027; new supply affects rent positioning",
      source: "" },

    { name: "Mudon", short: "Mudon", fit: { A1: 1, A3: 1 }, map: [0.560, 0.925], photo: "", // map: TODO — not on the original list; position is a guess
      overview: "",
      market: "Ready", types: "Villas & townhouses", psf: "~AED 1,300–1,700", yield: "6.2–6.8%", entry: "~AED 3.4M (median 4-bed)", range: "AED 2M–5M",
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Families; yield-focused villa investors",
      connectivity: "E311 & E611; ~22–28 min Downtown; schools nearby; parks-led",
      strengths: "Highest villa yield of the Dubailand three; newer build; rentable design",
      risks: "No in-gate school; slimmer resale liquidity than Arabian Ranches",
      source: "Oliva/DLD Q1 2026 (Apr 2026)" },

    { name: "DIFC", short: "DIFC", fit: { A5: 1 }, map: [0.575, 0.555], photo: "", // map: TODO — not on the original list; position is a guess
      overview: "",
      market: "Ready (prime)", types: "Branded & high-end apts", psf: "AED 2,600–3,900", yield: "~4.5–5.5%", entry: "~AED 2M", range: "AED 2M–15M",
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Finance-sector tenants; prime investors; overseas buyers",
      connectivity: "Financial centre; Gate District; near Downtown; metro nearby",
      strengths: "Prime financial-district address; branded stock; liquidity",
      risks: "High entry & service charge; narrower tenant pool",
      source: "" },

    { name: "Downtown / Old Town", short: "Downtown", fit: { A4: 2, A5: 2 }, map: [0.590, 0.585], photo: "",
      overview: "",
      market: "Ready (mature; some new towers)", types: "Apts, branded residences, penthouses", psf: "AED 2,600–3,500", yield: "~5% (guide context)", entry: "~AED 2.0M", range: "AED 2.0M–9M",
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Prestige tenants; tourists (short-let); overseas buyers",
      connectivity: "Burj Khalifa, Dubai Mall, Dubai Opera; two metro stations",
      strengths: "Address-driven demand holds through summer; overseas buyers steady price",
      risks: "Top-of-range service charge; more paid per sq ft for less space; large units slower",
      source: "DLD/Knight Frank via Sands Jun 2026" },

    { name: "Business Bay / SZR / Satwa", short: "Business Bay", fit: { A1: 2, A2: 2, A3: 2, A4: 2 }, map: [0.580, 0.610], photo: "",
      overview: "",
      market: "Mixed (ready + off-plan pipeline)", types: "Studios–2 bed apts, branded residences", psf: "AED 1,900–2,500", yield: "6.3–6.9%", entry: "~AED 1.3M", range: "AED 1.3M–4.5M",
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Professional tenants; central offices; investor + short-let",
      connectivity: "Beside Downtown & Dubai Water Canal; Business Bay metro; near DIFC/Burj Khalifa",
      strengths: "Central & liquid; widest choice above AED 2M; consistent resale",
      risks: "Higher service charges; studio/1-bed-heavy pipeline softens first",
      source: "" },

    { name: "Meydan / Dubai Creek / Festival City / Culture Village / Sobha Hartland", short: "Meydan / Creek", fit: { A2: 1, A3: 1, A4: 2 }, map: [0.700, 0.620], photo: "",
      overview: "",
      market: "Mixed (off-plan heavy)", types: "Apts, villas, waterfront townhouses", psf: "AED 1,700–2,600", yield: "~5.5–6.5%", entry: "~AED 1.2M", range: "AED 1.2M–8M",
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "New-community buyers; families; investors",
      connectivity: "Along Ras Al Khor/Dubai Creek & Nad Al Sheba; near Downtown; Meydan racecourse",
      strengths: "Waterfront/greenery masterplans near Downtown; newer stock",
      risks: "Off-plan completion & service-charge settling; wide sub-community spread",
      source: "" },

    { name: "Jumeirah / Al Barsha / Jumeirah Bay / La Mer / City Walk", short: "Jumeirah / City Walk", fit: { A4: 1, A5: 1 }, map: [0.520, 0.500], photo: "",
      overview: "",
      market: "Mixed (prime pockets)", types: "Villas, low-rise & branded apts", psf: "AED 2,200–3,500", yield: "~4.5–5.5%", entry: "~AED 2M", range: "AED 2M–40M+",
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Prime end-users; beach-lifestyle tenants; overseas buyers",
      connectivity: "Coastal Jumeirah belt; City Walk & La Mer lifestyle; near Downtown",
      strengths: "Beachside prime pockets; lifestyle retail; scarcity in Jumeirah Bay",
      risks: "Very wide spread (Al Barsha to ultra-prime Jumeirah Bay); confirm per-pocket",
      source: "" }
  ],

  /* ───────────────────────── ABU DHABI ─────────────────────────
     Proposed shortlist — grid marked "confirm" in the source doc.
     Al Ghadeer is fully researched; the rest carry registry/portal
     price bands with yields still to be confirmed at area level.  */
  abudhabi: [
    { name: "Al Ghadeer", short: "Al Ghadeer", fit: { A1: 1 }, map: [0.409, 0.935], photo: "",
      overview: "",
      market: "Mixed", types: "Studios, apartments, townhouses and villas", psf: "", /* TODO — missing in source */ yield: "~7–9% gross; net 5.7–6.6%", entry: "~AED 480k", range: "AED 480k–1.2M", // verify
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Value tenants & cross-emirate commuters; entry-level investors",
      connectivity: "", // TODO
      strengths: "Lowest AD entry (freehold); high gross yields; commuter position; Aldar amenities",
      risks: "Peripheral; large multi-phase supply; ~2% recent price dip; limited public transport",
      source: "" },

    { name: "Al Reem Island", short: "Al Reem Island", fit: { A1: 1, A3: 1 }, map: [0.427, 0.562], photo: "abudhabi-aerial",
      overview: "",
      market: "Mature", types: "Predominantly apartments", psf: "", /* TODO */ yield: "~7–8% gross (context: Al Reef 8.9%)", entry: "~AED 850k", range: "AED 850k–3.2M; 1-bed from ~AED 1.5M (off-plan)", // verify
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Professional tenants & investors; established island rental hub",
      connectivity: "Central island; future rail station; malls, multiple schools, Sorbonne University, hospitals",
      strengths: "Central island; deep rental demand; competitive yields",
      risks: "High apartment supply; service charges vary by tower / proximity to the mainland",
      source: "" },

    { name: "Masdar City", short: "Masdar City", fit: { A2: 1 }, map: [0.539, 0.873], photo: "",
      overview: "",
      market: "Predominantly off-plan", types: "Apartments and villas", psf: "", /* TODO */ yield: "~6–7% gross", entry: "~AED 650k", range: "AED 650k–1.6M",
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Sustainability & tech workforce; longer-term end-users",
      connectivity: "Home to major research institutions; direct highway and airport connectivity",
      strengths: "Sustainable-city masterplan; airport & free-zone growth narrative",
      risks: "Emerging demand; smaller resale market",
      source: "" },

    { name: "Al Raha Beach", short: "Al Raha Beach", fit: { A1: 1, A3: 1, A4: 1 }, map: [0.556, 0.530], photo: "",
      overview: "",
      market: "Mature", types: "Waterfront apartments; a rare number of villas and townhouses", psf: "", /* TODO */ yield: "~6–7% gross", entry: "~AED 1.4M; typical AED 1.8M+", range: "AED 1.4M–13M", // verify
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Professional & family tenants; end-user + investor",
      connectivity: "Private beach; water taxi; airport & Yas proximity",
      strengths: "Established waterfront address; gated; child-friendly",
      risks: "", // TODO
      source: "" },

    { name: "Yas Island", short: "Yas Island", fit: { A2: 1, A3: 1, A4: 1, A5: 1 }, map: [0.602, 0.734], photo: "",
      overview: "",
      market: "Predominantly off-plan", types: "Apartments, townhouses, villas", psf: "", /* TODO */ yield: "~6–7% gross", entry: "~AED 1.3M; 1-bed ~AED 1.5M", range: "AED 1.3M–13M", // verify
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Tourism/short-let; leisure-driven tenants; investors + families",
      connectivity: "Etihad Rail; airport proximity; beach clubs, malls, medical; schools upcoming. Top Golf, theme parks, F1 circuit, Disneyland Abu Dhabi + Sphere (upcoming)",
      strengths: "Leisure & tourism anchor; short-let demand; masterplanned",
      risks: "Demand partly seasonal/leisure-linked; ongoing supply; far from the mainland",
      source: "" },

    { name: "Al Maryah Island", short: "Al Maryah", fit: { A5: 1 }, map: [0.427, 0.785], photo: "",
      overview: "",
      market: "Ready", types: "Apartments", psf: "", /* TODO */ yield: "~5.5–6.5% gross", entry: "~AED 1.5M", range: "AED 1.5M–10M",
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Finance-sector tenants (ADGM); prime investors",
      connectivity: "Close to the city; home to ADGM and The Galleria mall",
      strengths: "Abu Dhabi's international financial centre: major banks, investment firms and professional services",
      risks: "High entry; narrower tenant/buyer pool",
      source: "" },

    { name: "Saadiyat Island", short: "Saadiyat", fit: { A2: 1, A3: 1, A4: 1, A5: 1 }, map: [0.334, 0.437], photo: "",
      overview: "",
      market: "Mixed", types: "Premium luxury villas and apartments", psf: "", /* TODO */ yield: "~5–6% gross", entry: "~AED 2.5M", range: "AED 2.5M–38M", // verify
      rent: "", service: "", growth5y: "", daysToSell: "",
      demand: "Prime end-users; cultural-district & beach buyers; overseas HNW; families",
      connectivity: "Landmarks include Ibrahim Square and Zayed National Museum",
      strengths: "Premium retail & beachfront address; capital-growth profile",
      risks: "Higher entry; longer selling times at the top end",
      source: "" }
  ]
};
