/* ============================================================
   slides.js — content for the UAE property investment handbook
   ------------------------------------------------------------
   HOW IT WORKS
   • DECK.sections   → the chapter list (left) and the menu.
                       `short` is the wrapped label in the chapter list.
   • DECK.slides     → an ordered list. Each slide has:
       id       unique, used in the URL  (#/slide-id)
       section  which section it belongs to
       tpl      which template renders it (see templates in app.js)
       market   OPTIONAL — "dubai" | "abudhabi" | "compare"
                A slide with a market only appears in that journey.
                Slides without a market appear in every journey.
       bg       OPTIONAL — image name from /img (without extension)
       light    OPTIONAL — render on the light (#ede8e4) page instead
                of a photo on black
       ...      template-specific fields

   JOURNEYS
   The cover (and any "hub" slide) offers the three guides. Choosing
   one sets the current market, which filters the slide list. Switch
   the market at any time from the menu — the deck re-routes instantly.

   To add a slide: append an object here. No other changes needed.
   ============================================================ */

window.DECK = {
  meta: { title: "UAE property investment handbook", year: "2026", rail: "Investment guide", brand: "betterhomes",
    /* WEBHOOKS — optional named endpoints. A button can then say  hook: "consultant"  instead of repeating the URL.
       A button can also carry its own:  hook: { url: "https://…", event: "book_consultation", data: { source: "08" } }
       Button keys (one per button):  hook | href | jump | save.
       Hook fields: url (required) · event (sent in the payload; defaults to the button label) · data (extra fields merged in)
                    · done ("Done ✓") · fail ("Try again") · then ({ jump: "slide-id" } or { href: "…" } to run after success)
       The payload is JSON: { event, slide, market, answers: { goal, market, budget, route, sid, … }, url, sent_at, …data }. */
    hooks: {
      // consultant: { url: "https://hooks.example.com/consultant", event: "speak_to_consultant" }
    } },

  markets: {
    dubai:    { label: "Dubai" },
    abudhabi: { label: "Abu Dhabi" },
    compare:  { label: "Compare both" }
  },

  sections: [
    { id: "s1", num: "01", title: "Why the UAE remains on the investor radar",            short: "Why the UAE remains on the investor radar" },
    { id: "s2", num: "02", title: "Why the UAE keeps attracting global property investors", short: "Why the UAE keeps attracting global property investors" },
    { id: "s3", num: "03", title: "Your investment focus",                                 short: "Your investment focus" },
    { id: "s4", num: "04", title: "What to check before you buy",                          short: "What to check before you buy" },
    { id: "s5", num: "05", title: "The communities worth considering",                     short: "The communities worth considering" },
    { id: "s6", num: "06", title: "What happens after you choose a property",              short: "What happens after you choose a property" },
    { id: "s7", num: "07", title: "The support you may need along the way",                short: "The support you may need along the way" },
    { id: "s8", num: "08", title: "What to consider before investing from abroad",         short: "What to consider before investing from abroad" },
    { id: "s9", num: "09", title: "Your next step",                                        short: "Your next step" }
  ],

  slides: [

    /* ───────────────────────── COVER & CONTENTS ───────────────────────── */
    { id: "cover", tpl: "cover", bg: "cover", video: "cover",
      title: "UAE property investment handbook", sub: "Your personalised guide" },

    { id: "contents", tpl: "toc", title: "Table of contents",
      groups: [
        { title: "Why the UAE remains on the investor radar", page: "01", items: [
          // "1.1 What you’ll learn in this handbook",
          "1.2 How the UAE property market responded to uncertainty",
          "1.3 Where the UAE property market stands today",
          "1.4 How residents see the market ahead" ] },
        { title: "Why the UAE keeps attracting global property investors", page: "02", items: [
          "2.1 The demand drivers behind the UAE property market",
          "2.2 How the UAE compares within the GCC",
          "2.3 How the UAE compares with global property markets" ] },
        { title: "Your investment focus", page: "03", items: [] },
        { title: "What to check before you buy", page: "04", items: [
          "4.1 Verify your property", "4.2 Know the full cost before you buy" ] },
        { title: "The communities worth considering", page: "05", items: [] },
        { title: "What happens after you choose a property", page: "06", items: [
          "6.1 Buying a ready property in Dubai", "6.2 Buying an off-plan property in Dubai", "6.3 Buying a ready property in Abu Dhabi", "6.4 Buying an off-plan property in Abu Dhabi" ] },
        { title: "The support you may need along the way", page: "07", items: [ "7.1 Where specialist support can help" ] },
        { title: "What to consider before investing from abroad", page: "08", items: [] },
        { title: "Your next step", page: "09", items: [] }
      ] },

    /* ───────────────────────── 01  INVESTOR RADAR ───────────────────────── */
    { id: "s1-open", section: "s1", tpl: "opener", bg: "img/villa-pool-m.png", num: "01",
      title: "Why the UAE remains on the investor radar",
      kicker: "UAE property:",
      lede: "Why Dubai and Abu Dhabi continue to command investor attention",
      body: "Before comparing prices, returns or locations, it is worth starting with the question behind every investment decision: what continues to draw people, businesses and capital to the UAE?",
      author: { name: "Richard Waind", role: "Chief Executive Officer", photo: "img/richard-waind.png",
        quoteTitle: "The confidence behind the UAE’s property market",
        quote: "The UAE has built more than a successful property market. It has created an environment where people choose to live, establish businesses and invest for the long term. That depth of commitment continues to reinforce our confidence in the country’s direction and the long-term strength and fundamentals of its property markets." },
      statsTitle: "Confidence reflected in the market",
      stats: [
        { v: "+161,000", unit2: "residents", t: "Added to Dubai’s population between January and July 2026, supporting the long-term need for homes." },
        { pre: "AED", v: "13.8", unit: "bn", unit2: "in foreign investment", t: "Entered Abu Dhabi real estate during H1 2026, an increase of 309% year on year." },
        { pre: "AED", v: "73.8", unit: "bn", unit2: "in residential sales", t: "More than 34,600 apartment, villa and townhouse sales were completed in Dubai during Q3 2026 (July–September)." },
        { v: "+16%", unit: " resale", unit2: "transactions", t: "Sales of ready homes rose quarter on quarter in Q3, as more buyers chose completed property they can use or rent out straight away." },
        { v: "+44%", unit2: "tenant enquiries", t: "Tenant enquiries increased quarter on quarter in Q3 and were 21% above the same period last year, pointing to sustained rental demand." },
        { v: "+64%", unit2: "off-plan villa and townhouse sales", t: "Sales increased year on year in Q3, with 2,148 homes sold, reflecting continued demand for new family homes." }
      ] },

    // { id: "s1-learn", section: "s1", tpl: "learn", bg: "penthouse-terrace",
    //   num: "1.1", title: "What you’ll learn in this handbook",
    //   lede: "From understanding the UAE market to choosing an investment route, comparing locations, and navigating the buying process, this handbook helps you weigh your options and know what to expect at each stage.",
    //   cols: [
    //     { n: "01", h: "Understand the market", items: [
    //       ["How Dubai and Abu Dhabi markets responded to uncertainty", "See how both property markets reacted as conditions changed.", "s1-2-hub"],
    //       ["Where Dubai and Abu Dhabi’s property markets stand today", "Understand the current market position across both emirates.", "s1-3-hub"],
    //       ["How residents see the market ahead", "Explore what people living in the UAE expect from the property market next.", "s1-4-hub"] ] },
    //     { n: "02", h: "Understand why investors choose the UAE", items: [
    //       ["Why the UAE keeps attracting global property investors", "See what continues to support the UAE’s investment appeal.", "s2-open"],
    //       ["The demand drivers behind the UAE property market", "Explore the population, business, connectivity and capital trends shaping property demand.", "s2-1-intro"],
    //       ["How the UAE compares with global property markets", "Compare the UAE with other major international property cities.", "s2-3-hub"],
    //       ["How the UAE compares within the GCC", "Understand how the UAE investment market compares with neighbouring Gulf markets.", "s2-2-hub"] ] },
    //     { n: "03", h: "Find your investment focus", items: [
    //       ["Your investment focus", "See how your priorities shape what to look for, and where this handbook can help most.", "s3-open"] ] },
    //     { n: "04", h: "Assess an opportunity", items: [
    //       ["What to check before you buy", "Know the key numbers, costs, and risks to examine before making an investment decision.", "s4-open"] ] }
    //   ] },

    // { id: "s1-learn-2", section: "s1", tpl: "learn", bg: "penthouse-terrace",
    //   num: "1.1", title: "What you’ll learn in this handbook",
    //   lede: "From understanding the UAE market to choosing an investment route, comparing locations, and navigating the buying process, this handbook helps you weigh your options and know what to expect at each stage.",
    //   cols: [
    //     { n: "05", h: "Decide where to invest", items: [
    //       ["The communities worth considering", "Explore Dubai and Abu Dhabi communities and identify which locations may be better suited to your investment goals.", "s5-open"] ] },
    //     { n: "06", h: "Understand the buying process", items: [
    //       ["What happens after you choose a property", "Follow the buying journey for ready and off-plan property, from reservation through to ownership.", "s6-open"] ] },
    //     { n: "07", h: "Know what support is available", items: [
    //       ["The support you may need along the way", "See where specialist support can help before, during, and after your purchase.", "s7-open"] ] },
    //     { n: "08", h: "Investing from abroad", items: [
    //       ["What to consider before investing from abroad", "Understand the additional financial, tax and practical considerations that come with investing in UAE property from overseas.", "s8-open"] ] },
    //     { n: "09", h: "Take the next step", items: [
    //       ["Your next step", "Turn what you have learned into a clearer next step for your investment.", "s9-open"] ] }
    //   ] },

    /* 1.2 — hub + three journeys */
    { id: "s1-2-hub", section: "s1", tpl: "hub", bg: "img/page 4.png",
      num: "1.2", title: "How the UAE property market responded to uncertainty",
      lede: "Dubai’s sales market has been quieter since March, but Q3 brought more activity in ready homes and stronger rental interest.",
      body: "Residential sales stayed close to Q2 levels, although activity eased in August and September. More resale homes changed hands, while off-plan sales and buyer enquiries fell. For investors, these signals raise two separate questions: how much interest is there from people who would rent the property, and from people who might buy it later? Understanding both helps you assess a property against your plans.",
      callouts: [{ label: "Dubai", x: .82, y: .55 }, { label: "Abu Dhabi", x: .39, y: .61 }],
      prompt: "Choose your view" },

    { id: "s1-2-dxb-signals", section: "s1", market: "dubai", tpl: "signals", bg: "img/page 5.png", city: "Dubai",
      title: "Sales held steady in Q3, with more activity in ready homes",
      lede: "The number of homes sold changed little from Q2, but the pattern of sales shifted. More ready homes changed hands, while off-plan sales and average sale values fell. Rental enquiries rose sharply; buyer enquiries were lower overall, with a pickup in September.",
      group: "Q3 market signals",
      signals: [
        { v: "−2%", l: "residential transactions", t: "34,615 homes were sold, compared with 35,421 in Q2. Overall activity changed little, making the differences between ready and off-plan sales more useful when deciding where to focus your search.", dir: "down" },
        { v: "−12%", l: "average transaction value", t: "The average sale value fell to AED 2.13m, with fewer high-value off-plan homes sold. When fewer expensive homes change hands, the average can fall without showing that a property like the one you are considering has become cheaper.", dir: "down" },
        { v: "+16%", l: "resale transactions", t: "Ready-home sales rose from 8,661 to 10,055, the first quarterly increase this year. This points to stronger buying activity in existing homes, which matters when considering who might buy your property later.", dir: "up" },
        { v: "−8%", l: "off-plan transactions", t: "Off-plan sales fell from 26,760 to 24,560, but still accounted for 71% of all sales. It remained the main purchase route, so a slower quarter makes demand for the specific development worth examining more closely.", dir: "down" },
        { v: "+44%", l: "tenant enquiries", t: "Rental enquiries rose sharply from Q2, suggesting stronger interest in finding a home to rent. For a rental investment, check whether that interest is also leading to agreed tenancies in the community you are considering.", dir: "up" },
        { v: "−12%", l: "buyer enquiries", t: "Buyer enquiries fell from Q2, although they rose 29% in September. Interest improved towards the quarter’s end, making recent local activity worth checking alongside the quarterly figures.", dir: "down" }
      ],
      note: { paras: [
        "More ready apartments changed hands in Q3, even as other parts of the market slowed. Apartment resale transactions rose by 22%, while off-plan apartment sales fell by 8% and villa and townhouse activity dipped by 5%.",
        "For investors, a busier resale market helps show where buyers are active. That matters because, when you sell, you will need someone willing to buy your property. The next step is to look closer: are similar homes in your chosen community also selling, and at what prices?" ] } },

    { id: "s1-2-dxb-values", section: "s1", market: "dubai", tpl: "chartcards", light: true, city: "Dubai",
      title: "Understanding Dubai’s residential sale values",
      axis: ["+10%", "0%", "-10%"],
      cards: [
        { v: "−14%", l: "residential sales value", t: "Residential sales totalled AED 73.8bn, down from Q2. The amount spent fell more sharply than the number of homes sold.", trend: -1 },
        { v: "−12%", l: "average transaction value", t: "The average amount paid per home fell, with fewer large and premium properties changing hands.", trend: -1 },
        { v: "−10%", l: "average resale transaction value", t: "The average amount paid for a resale home was lower than in Q2.", trend: -1 },
        { v: "−15%", l: "average off-plan transaction value", t: "Average off-plan sale values also fell, more sharply than those for resale homes.", trend: -1 }
      ],
      notes: [
        { h: "Does a lower average mean lower prices?", t: "The average depends on what sells. When fewer large and premium homes change hands, the average amount paid falls. That does not, by itself, mean a home like the one you are considering has become cheaper." },
        { t: "Community prices tell a more detailed story. 63 of 95 tracked community segments were higher than a year ago, although most dipped slightly over the last three months. Both can be true: prices can ease over a quarter and still be above last year’s level." } ],
      wide: "When assessing an asking price, look at what similar homes nearby have recently sold for. That gives you a firmer basis for judging the price than the city-wide average." },

    { id: "s1-2-dxb-types", section: "s1", market: "dubai", tpl: "chartcards", bg: "img/page 7.png", city: "Dubai",
      title: "Apartment, villa and townhouse sales in Q3",
      axis: ["+100%", "0%", "-100%"],
      cards: [
        { v: "−2%", l: "apartment transactions — compared with Q2", t: "Apartment sales changed little overall, although ready and off-plan apartments performed differently.", trend: 0 },
        { v: "−5%", l: "villa and townhouse transactions — compared with Q2", t: "Slightly fewer larger homes changed hands than in the previous quarter.", trend: -1 },
        { v: "+64%", l: "off-plan villa and townhouse transactions — year on year", t: "Sales were 9% below Q2, but substantially higher than in Q3 2025.", trend: 1 },
        { v: "+91%", l: "off-plan villa and townhouse sales value — year on year", t: "Total spending on these homes almost doubled compared with Q3 2025.", trend: 1 }
      ],
      notes: [
        { h: "Why the time period matters", t: "A quieter quarter can follow strong growth over a year. Off-plan villas and townhouses illustrate this: sales eased from Q2 but remained well above last year’s level." },
        { t: "For investors, both comparisons matter. The annual figures show how much activity has grown; the quarterly figures show its more recent direction. When considering a property, look at recent sales of similar homes in the development or community to understand what buyers are purchasing and paying now." } ] },

    { id: "s1-2-dxb-enq", section: "s1", market: "dubai", tpl: "statgrid", city: "Dubai",
      title: "Rental and buyer enquiries moved in different directions",
      stats: [
        { v: "+44%", l: "tenant enquiries — compared with Q2", t: "Rental enquiries also stood 21% above Q3 2025, showing stronger interest over both periods.", photo: "villa-arch" },
        { v: "−12%", l: "buyer enquiries — compared with Q2", t: "Buyer enquiries were also 31% below Q3 2025, showing lower buying interest across both comparisons.", photo: "dubai-canal" },
        { v: "+66%", l: "apartment leasing enquiries — compared with Q2", t: "Interest in renting apartments recorded the strongest quarterly increase.", photo: "balcony-marina" },
        { v: "+14%", l: "villa and townhouse leasing enquiries — compared with Q2", t: "Rental interest in larger homes also increased, although less sharply than for apartments.", photo: "villa-garden" } ],
      rows: [
        { h: "What enquiries can tell you", cols: [
          "More tenant enquiries are an encouraging signal for a rental investment. To understand what a property could earn, the next step is to check whether similar homes are being let, how quickly and at what rents.",
          "Buyer enquiries provide an earlier indication of potential purchasers. They were lower across Q3, although interest picked up again in September." ] } ],
      // latest: { h: "Latest month: September 2026", items: [
      //   ["10,342", "homes sold: 7% fewer than August, but 8% above the May low."],
      //   ["AED 2.28m", "average transaction value: up 6% from August."],
      //   ["+11%", "resale villa and townhouse transactions: more ready homes in this segment changed hands than in August."],
      //   ["+15%", "tenant enquiries: rental interest rose from August and was 35% above September 2025."] ] } },
        },
    { id: "s1-2-dxb-means", section: "s1", market: "dubai", tpl: "hub", bg: "img/page 9.png", shade: "topleft", city: "Dubai", nochoice: true,
      title: "What this means for you",
      lede: "Dubai’s Q3 figures point to stronger rental interest and a recovery in resale activity within a quieter sales market. For investors, this makes the demand for a particular home more useful than the overall direction of the market alone.",
      paras: [
        "For a rental investment, the relationship between the purchase price and achievable rent is central to the decision. If you expect to sell within a few years, weigh the recent improvement in resale activity against weaker buying activity over the longer period.",
        "From March to September 2026, off-plan sales were 21% below August 2025 to February 2026, while resale transactions were 42% lower. The quarterly resale recovery therefore represents an improvement within a weaker period overall.",
        "A purchase supported by realistic rental income and flexibility over when you sell gives you more room to respond if buying activity remains subdued." ] },

    { id: "s1-2-auh-signals", section: "s1", market: "abudhabi", tpl: "signals", bg: "abudhabi-aerial", city: "Abu Dhabi",
      title: "Fewer sales in Q3, with buying activity shifting towards larger homes",
      lede: "The number of homes sold fell from Q2, but performance varied across the market. Apartment sales declined, while more off-plan villas and townhouses changed hands. A greater share of larger homes lifted the average sale value. Rental enquiries increased, while buyer enquiries fell.",
      group: "Q3 market signals",
      signals: [
        { v: "−18%", l: "residential transactions", t: "5,890 homes were sold, compared with 7,164 in Q2. The decline was concentrated in apartments, making the differences between property types and purchase routes more useful when deciding where to focus your search.", dir: "down" },
        { v: "+12%", l: "average transaction value", t: "The average sale value rose to AED 4.55m, as villas and townhouses made up more of the homes sold. A higher average does not, by itself, show that a property like the one you are considering has become more expensive.", dir: "up" },
        { v: "0%", l: "change in resale transactions", t: "Ready-home sales were almost unchanged at 1,197, compared with 1,198 in Q2. Activity held steadier than in the off-plan market, although demand for similar homes in your chosen community remains the more useful measure.", dir: "flat" },
        { v: "−21%", l: "off-plan transactions", t: "Off-plan sales fell from 5,966 to 4,693, but still accounted for 80% of all sales. Fewer off-plan apartments sold, while purchases of larger off-plan homes increased, making the specific development and property type important to your assessment.", dir: "down" },
        { v: "+28%", l: "tenant enquiries", t: "Tenant enquiries increased from Q2, suggesting stronger interest in finding a home to rent. For a rental investment, check whether that interest is also leading to agreed tenancies in the community you are considering.", dir: "up" },
        { v: "−23%", l: "buyer enquiries", t: "Buyer enquiries fell from Q2 and were also lower than a year ago. When assessing a possible future sale, look at recent buying activity for similar properties alongside the wider enquiry figures.", dir: "down" } ],
      note: { h: "What changed?", paras: [
        "Apartment resale transactions fell by just 1%, while off-plan apartment sales declined by 44%. Villas and townhouses moved in the other direction, recording 54% more sales than in Q2, largely through off-plan purchases.",
        "For investors, this points to different conditions within the same city. Check how actively similar homes are selling in your chosen community, which purchase routes buyers are using and what they are paying. These details provide a firmer basis for assessing future resale demand." ] } },

    { id: "s1-2-auh-values", section: "s1", market: "abudhabi", tpl: "chartcards", light: true, city: "Abu Dhabi",
      title: "Understanding Abu Dhabi’s residential sale values",
      axis: ["+10%", "0%", "-10%"],
      cards: [
        { v: "−8%", l: "residential sales value", t: "Residential sales totalled AED 26.79bn, down from Q2. The amount spent fell less sharply than the number of homes sold because the average purchase was larger.", trend: -1 },
        { v: "+12%", l: "average transaction value", t: "The average amount paid per home rose, with villas and townhouses accounting for a greater share of purchases.", trend: 1 },
        { v: "−10%", l: "average resale transaction value", t: "The average amount paid for a resale home fell from AED 2.71m to AED 2.44m.", trend: -1 },
        { v: "+18%", l: "average off-plan transaction value", t: "The average off-plan sale value rose from AED 4.32m to AED 5.09m, as the balance of purchases shifted towards larger homes.", trend: 1 }
      ],
      notes: [
        { h: "Does a higher average mean higher prices?", t: "The average depends on what sells. Villas and townhouses represented 41% of transactions, up from 22% in Q2. Because these homes typically sold for more than apartments, their greater share lifted the combined average." },
        { t: "Within each property group, the averages moved differently. Average apartment sale values fell by 5%, while villa and townhouse averages fell by 18%. These figures also reflect the homes sold; they do not measure the price change of the same property over time." } ],
      wide: "When assessing an asking price, look at what similar homes nearby have recently sold for. Compare their size, condition and location to establish whether the price makes sense for the property you are considering." },

    { id: "s1-2-auh-types", section: "s1", market: "abudhabi", tpl: "chartcards", bg: "abudhabi-marina", city: "Abu Dhabi",
      title: "Apartment, villa and townhouse sales in Q3",
      axis: ["+100%", "0%", "-100%"],
      cards: [
        { v: "−38%", l: "apartment transactions — compared with Q2", t: "Apartment sales fell from 5,613 to 3,499, with most of the decline coming from off-plan purchases.", trend: -1 },
        { v: "+54%", l: "villa and townhouse transactions — compared with Q2", t: "Sales of larger homes rose from 1,551 to 2,391, led by off-plan purchases.", trend: 1 },
        { v: "+126%", l: "off-plan villa and townhouse transactions — year on year", t: "Sales were also 72% above Q2, showing stronger activity over both comparison periods.", trend: 1 },
        { v: "+195%", l: "off-plan villa and townhouse sales value — year on year", t: "Total spending on these homes almost tripled, reaching AED 16.31bn compared with AED 5.53bn in Q3 2025.", trend: 1 }
      ],
      notes: [
        { h: "Why the time period matters", t: "Off-plan villas and townhouses recorded more sales than both the previous quarter and a year earlier. This shows where buying activity strengthened, even as overall residential transactions fell." },
        { t: "For investors, both comparisons matter. The annual figures show how much activity has grown; the quarterly figures show its recent direction. When considering a property, look at sales within the development and the homes expected to compete with it when it is completed." } ] },

    { id: "s1-2-auh-enq", section: "s1", market: "abudhabi", tpl: "statgrid", city: "Abu Dhabi",
      title: "Rental and buyer enquiries moved in different directions",
      stats: [
        { v: "+28%", l: "tenant enquiries — compared with Q2", t: "Tenant enquiries also stood 51% above Q3 2025, showing stronger rental interest over both periods.", photo: "abudhabi-coast" },
        { v: "−23%", l: "buyer enquiries — compared with Q2", t: "Buyer enquiries were also 27% below Q3 2025, showing lower buying interest across both comparisons.", photo: "abudhabi-skyline" },
        { v: "+52%", l: "apartment leasing enquiries — compared with Q2", t: "Apartment leasing enquiries increased sharply and were also 52% above Q3 2025.", photo: "abudhabi-balcony" },
        { v: "−20%", l: "villa and townhouse leasing enquiries — compared with Q2", t: "Rental interest in larger homes eased from Q2 but remained 37% above Q3 2025.", photo: "abudhabi-marina" } ],
      rows: [
        { h: "What enquiries can tell you", cols: [
          "Rental interest strengthened overall, with growth concentrated in apartments. Enquiries for larger homes fell from Q2 but remained well above a year ago. The quarterly decline therefore sits alongside stronger annual interest in villas and townhouses.",
          "For a rental investment, this makes demand for your property type and community particularly relevant. Lower buyer enquiries also make it useful to examine how actively similar homes are selling when assessing a possible future exit.",
          "Enquiries provide an early signal of interest. Signed tenancies and completed sales show actual commitments. Reading both helps you assess whether interest is translating into rental income and buying activity for properties like the one you are considering." ] } ] },

    { id: "s1-2-auh-means", section: "s1", market: "abudhabi", tpl: "hub", bg: "abudhabi-aerial", shade: "topleft", city: "Abu Dhabi", nochoice: true,
      title: "What this means for you",
      lede: "Abu Dhabi’s Q3 figures point to a more selective market. Stronger purchases of larger off-plan homes show where buyers are committing, while rising tenant enquiries suggest growing interest in renting. For investors, the opportunity depends on how well a particular property serves that demand.",
      paras: [
        "If rental income is your priority, the key question is whether achievable rent can justify the purchase price and ownership costs. If you are buying off-plan, consider who will want the home when it is completed and how much competing supply they will have to choose from. Strong launch sales show commitment today; your return will depend on conditions at handover and throughout ownership.",
        "The wider slowdown also puts more weight on your holding period. Allowing time to secure a tenant or find a buyer gives you greater flexibility if activity remains subdued. The strongest investment case is one supported by a sensible entry price, identifiable demand and a timeframe that works for your finances." ] },

    { id: "s1-2-compare", section: "s1", market: "compare", tpl: "compare",
      title: "How Dubai and Abu Dhabi compare across key Q3 indicators",
      head: ["Indicator", "Dubai", "Abu Dhabi"], subhead: ["Q3 vs Q2", "Q3 vs Q2"],
      photos: ["dubai-towers", "abudhabi-skyline"],
      rows: [
        ["Residential transactions", "−2%", "−18%"],
        ["Average transaction value", "−12%", "+12%"],
        ["Villas and townhouses transactions", "−5%", "+54%"],
        ["Off-plan villas and townhouses transactions", "−9%", "+72%"],
        ["Buyer enquiries", "−12%", "−23%"],
        ["Tenant enquiries", "+44%", "+28%"],
        ["What to watch", "Stronger resale activity and rental interest", "Growth in larger off-plan homes and stronger rental interest"] ],
      after: { h: "What this means for your decision", cols: [
        "The relevant comparison depends on your goal and the property you are considering. If you want rental income sooner, assess completed homes in either city using recent agreed rents, letting activity and ownership costs. Dubai’s increase in tenant enquiries provides an encouraging signal of rental interest; check how that interest translates into tenancies in your chosen community.",
        "If you are considering Abu Dhabi’s growing off-plan villa and townhouse segment, look ahead to completion. Compare the purchase price, payment plan and delivery record with the homes expected to compete for tenants or buyers at that time. Strong sales today are one part of assessing how the property could fit your longer-term plans." ] } },

    /* 1.3 — hub + journeys */
    { id: "s1-3-hub", section: "s1", tpl: "hub", bg: "img/page 10.png",
      num: "1.3", title: "Where the UAE property market stands today",
      lede: "Dubai offers greater sales volume; Abu Dhabi has a higher off-plan share",
      paras: [
        "Dubai remains the larger of the two markets by transaction volume, with substantial activity across ready and off-plan homes. Abu Dhabi’s sales are more heavily weighted towards off-plan property, particularly when measured by the amount invested.",
        "These differences affect the evidence available when assessing a purchase. Existing-home transactions help establish comparable sale prices, while off-plan purchases require a closer view of delivery, competing supply and demand at completion." ],
      callouts: [{ label: "Abu Dhabi", x: .24, y: .58 }, { label: "Dubai", x: .72, y: .52 }],
      prompt: "Select a market to explore",
    },

    { id: "s1-3-dxb", section: "s1", market: "dubai", tpl: "fivecols", bg: "img/page 11.png", city: "Dubai view",
      title: "Dubai offers scale across ready and off-plan homes",
      source: "Latest residential market position · Q3 2026",
      cols: [
        { q: "How active is the market?", ico: "down", v: "34,615", l: "residential sales worth AED 73.8bn", t: "The number of homes sold was 2% below Q2, while total sales value fell 14%. Overall transaction activity remained close to the previous quarter’s level." },
        { q: "What is driving activity?", v: "71%", l: "of transactions were off-plan", t: "Off-plan homes accounted for 24,560 sales and 63% of residential sales value. The market also recorded 10,055 ready-home sales, providing a substantial body of transactions to examine when comparing existing properties." },
        { q: "What is happening to sale values?", v: "−12%", l: "average transaction value from Q2", t: "The average amount paid per home fell to AED 2.13m. This figure reflects the mix of properties purchased during the quarter; recent sales of similar homes provide a more useful guide to an individual property’s price." },
        { q: "What is supporting demand?", v: "+44%", l: "tenant enquiries from Q2", t: "Tenant enquiries were also 21% above Q3 2025, while buyer enquiries fell 12% from Q2. Recorded interest strengthened on the rental side, although agreed tenancies are needed to assess actual letting activity." },
        { q: "What should you watch?", hl: "Differences between ready homes, off-plan developments and individual communities", t: "A large city-wide sales total can include quieter developments and property types. Local transactions, agreed rents and competing supply provide the more relevant evidence when judging a particular opportunity." } ] },

    { id: "s1-3-auh", section: "s1", market: "abudhabi", tpl: "fivecols", bg: "abudhabi-skyline", city: "Abu Dhabi view",
      title: "Abu Dhabi’s market is weighted towards new development",
      source: "Latest residential market position · Q3 2026",
      cols: [
        { q: "How active is the market?", ico: "down", v: "5,890", l: "residential sales worth AED 26.79bn", t: "The number of homes sold fell 18% from Q2. Total sales value fell 8% over the quarter but remained 32% above Q3 2025, reflecting a different mix of properties purchased." },
        { q: "What is driving activity?", v: "80%", l: "of transactions were off-plan", t: "Off-plan homes accounted for 4,693 sales and 89% of residential sales value. Most of the capital committed during the quarter went into new developments." },
        { q: "What is happening to sale values?", v: "+12%", l: "average transaction value from Q2", t: "The average amount paid rose to AED 4.55m. Villas and townhouses represented 41% of sales, up from 22% in Q2, lifting the combined average even as average values within both property groups fell." },
        { q: "What is supporting demand?", v: "+28%", l: "tenant enquiries from Q2", t: "Tenant enquiries were also 51% above Q3 2025, while buyer enquiries fell 23% from Q2. Rental interest strengthened alongside more selective buying activity." },
        { q: "What should you watch?", v: "47%", l: "of residential sales value came from the ten largest projects", t: "A small number of developments strongly influence the overall figures. This concentration makes project selection important: assess pricing, delivery and competing supply against the demand expected when the property is completed." } ] },

    { id: "s1-3-compare", section: "s1", market: "compare", tpl: "compare",
      title: "Compare both views",
      intro: "Q3 2026. Percentage changes compare with Q2 2026 unless otherwise stated.",
      head: ["What should you compare?", "Dubai", "Abu Dhabi"],
      photos: ["dubai-towers", "abudhabi-skyline"],
      rows: [
        ["Current position", "A larger transaction market, with substantial ready and off-plan activity", "A market more heavily weighted towards off-plan purchases"],
        ["Latest activity", "34,615 residential sales worth AED 73.8bn", "5,890 residential sales worth AED 26.79bn"],
        ["Off-plan share", "71% of transactions and 63% of sales value", "80% of transactions and 89% of sales value"],
        ["Average sale value", "AED 2.13m, down 12% from Q2", "AED 4.55m, up 12% from Q2"],
        ["Buyer and tenant enquiries", "Tenant enquiries increased 44%; buyer enquiries fell 12%", "Tenant enquiries increased 28%; buyer enquiries fell 23%"],
        ["What should you watch?", "Differences between ready and off-plan activity, and local rental demand", "Off-plan delivery and competing supply around major developments"] ],
      after: { h: "What the different sales patterns mean for your decision", cols: [
        "Dubai’s greater sales volume provides more completed transactions overall to inform purchase-price and resale comparisons. For a ready-home investment, this can provide a useful starting point, provided the evidence matches the community and property type you are considering.",
        "In Abu Dhabi, a higher share of capital is committed to off-plan homes, making delivery and future demand particularly important to the market picture. For an off-plan purchase in either city, the investment needs to work through the payment period and have a credible source of tenant or buyer demand once completed." ] } },

    /* 1.4 — hub + journeys */
    { id: "s1-4-hub", section: "s1", tpl: "hub", bg: "img/page 12.png",
      num: "1.4", title: "How residents see the market ahead",
      lede: "The people living here are planning for the long term",
      body: "Property data tells us what people are buying today. Our Future Living Survey looks further ahead: how long residents plan to stay, how confident they feel about the market and whether buying property is part of their future.",
      callouts: [{ label: "Abu Dhabi", x: .24, y: .58 }, { label: "Dubai", x: .72, y: .52 }],
      prompt: "Select a market to explore" },

    /* 1.4 journeys render on the flat navy page (`navy: true`): sky-blue title, four frosted cards, photo on hover */
    { id: "s1-4-dxb", section: "s1", market: "dubai", tpl: "survey", navy: true, city: "Dubai", title: "Residents are thinking long term",
      stats: [
        { v: "69%", l: "intend to stay in Dubai for more than 10 years", t: "The longer people stay, the longer they need somewhere to live. For property investors, that helps support a deeper, more established pool of rental and buyer demand.", photo: "palm-villa" },
        { v: "70%", l: "are confident in Dubai’s long-term economic growth and property prospects", t: "Property is usually a long-term decision. When residents are confident about where a city is heading, they have more reason to put down roots, rent for longer or eventually buy.", photo: "villa-garden" },
        { v: "67%", l: "kept or strengthened their property plans despite recent regional uncertainty", t: "Most residents surveyed did not step back from their property plans, suggesting that many are looking beyond short-term events and taking a longer view.", photo: "villa-lawn" },
        { v: "55%", l: "of renters intend to buy within the next one to three years", t: "Today’s renters can become tomorrow’s buyers. A sizable group considering ownership could add to future resale demand.", photo: "lounge-burj" } ] },

    { id: "s1-4-auh", section: "s1", market: "abudhabi", tpl: "survey", navy: true, city: "Abu Dhabi", title: "Residents are thinking long term",
      stats: [
        { v: "59%", l: "intend to stay in Abu Dhabi for more than 10 years", t: "A large share of residents expect to remain in Abu Dhabi for the long term, supporting a more stable base of housing demand.", photo: "abudhabi-coast" },
        { v: "70%", l: "are confident in Abu Dhabi’s long-term economic growth and property prospects", t: "Confidence in the city’s future outlook gives residents more reason to make long-term decisions about where they live and what they own. That matters in a market attracting new residential development and investment.", photo: "abudhabi-balcony" },
        { v: "74%", l: "kept or strengthened their property plans despite recent regional uncertainty", t: "Demand is more reassuring when it can hold up through less certain periods. Most residents surveyed did not retreat from their property plans, giving investors another measure of longer-term commitment.", photo: "abudhabi-marina" },
        { v: "43%", l: "of renters intend to buy within the next one to three years", t: "Today’s tenants can become tomorrow’s buyers. As more renters consider ownership, investors have another potential source of demand when they eventually decide to sell.", photo: "abudhabi-aerial" } ] },

    { id: "s1-4-compare", section: "s1", market: "compare", tpl: "compare", navy: true, title: "Compare both",
      head: ["Investor question", "Dubai", "Abu Dhabi"], photos: ["dubai-towers", "abudhabi-skyline"],
      rows: [
        ["Plan to stay 10+ years", "69%", "59%"],
        ["Confident in long-term economic and property prospects", "70%", "70%"],
        ["Property plans maintained or strengthened despite regional uncertainty", "67%", "74%"],
        ["Renters intending to buy within 1–3 years", "55%", "43%"] ],
      after: { lead: "Residents in both cities are looking beyond the short term", cols: [
        "Dubai residents show a stronger intention to stay for the long term, and a larger share of renters plan to buy within the next one to three years. In Abu Dhabi, more residents maintained or strengthened their property plans despite recent uncertainty. Confidence in the long-term economic and property outlook is equally strong across both cities, at 70%.",
        "For investors, the wider picture is one of long-term resident commitment. People who expect to stay need homes, renters support demand today, and some may become buyers over time. The survey does not predict future transactions, but it does show that many residents in both cities are planning with the long term in mind." ],
        foot: "Source: betterhomes Future Living Surveys 2026. Dubai: 1,714 completed responses. Abu Dhabi: 442 completed responses. Purchase intention is based on renters surveyed in each emirate. “Property plans maintained or strengthened” combines respondents whose plans were unchanged, who became more committed to buying or staying, or who accelerated their plans following recent regional developments. Self-selected betterhomes audiences; findings are directional and not representative of all Dubai or Abu Dhabi residents." } },

    /* ───────────────────────── 02  GLOBAL APPEAL ───────────────────────── */
    { id: "s2-open", section: "s2", tpl: "opener", bg: "img/page 14.png", num: "02", shade: "deep",
      title: "Why the UAE keeps attracting global property investors",
      body: "For investors, the UAE stands out not because of one advantage, but because several factors come together in the same market. Three in particular are worth understanding.",
      author: { name: "Harry Martin", role: "Head of Off-Plan and Capital Markets, betterhomes", photo: "img/harry-martin.png",
        quoteTitle: "The UAE’s appeal to global investors isn’t a trend,",
        quote: "it’s far more structural. When you look at the fundamentals: a tax-efficient environment, a rapidly maturing legal framework, strong population growth, and a government that actively courts international capital, you start to understand why this market has continued to outperform. I’ve worked across London, Singapore, Hong Kong, and the broader Gulf, and what the UAE has achieved in a relatively short period is remarkable. Within the GCC it stands apart on liquidity and transparency, and when you benchmark it against established global property cities, the yield premium and growth trajectory still make a compelling case. For sophisticated investors, it’s no longer about diversifying into the UAE, it’s about whether they can afford not to be here." },
      statsTitle: "Three reasons investors continue to consider the UAE",
      reasons: [
        { l: "Strong rental income potential", v: "6%", v2: "Approaching", l2: "Indicative gross rental yields in this benchmark.", t: "This gives investors the potential to generate income from the property, before service charges, maintenance, financing and personal tax are taken into account." },
        { l: "No annual property tax",v: "0%", l2: "Dubai and Abu Dhabi do not apply an annual tax simply for owning a property.", t: "This can help investors retain more of the property’s income, although service charges and other ownership costs still apply." },
        { l: "Property ownership can support long-term residency", pre: "AED", v: "2", unit: " million", l2: "qualifying property investment", t: "Eligible property investment may provide access to a ten-year UAE Golden Visa, subject to current requirements. For some investors, that means the property can serve both an investment goal and a longer-term plan to live in or spend more time in the UAE." } ],
      foot: "For some investors, the property can therefore support both a financial objective and a longer-term plan to live in or spend more time in the UAE." },

    { id: "s2-1-intro", section: "s2", tpl: "hub", bg: "img/page 15.png", num: "2.1", nochoice: true,
      title: "The demand drivers behind the UAE property market",
      lede: "What is supporting property demand beyond transactions?",
      paras: [
        "Property prices and transactions tell you what has already happened. To understand where demand may come from next, it helps to look at what creates the need for homes in the first place: population growth, employment, business expansion and the amount of new housing coming to market.",
        "The important question is not simply whether demand is growing. It is whether the number of people who need homes is growing faster than the supply available to them." ] },

    { id: "s2-1-cards", section: "s2", tpl: "cards", bg: "img/page 16.png",
      title: "Four demand signals",
      cards: [
        { n: "01", h: "More people need homes", v: "4.58", v2: "million residents", l: "Dubai population at the end of 2025 · 332,000 more than the year before", jump: "s2-1-drivers",
          paras: ["Dubai added more than 300,000 residents in a single year. More residents signals a larger pool of potential tenants and future buyers, but investors also need to consider how quickly new homes are being delivered alongside that growth."] },
        { n: "02", h: "Employment supports housing demand", v: "+2.5%", l: "UAE private-sector workforce growth · Q1 2026", jump: "s2-1-drivers",
          paras: ["Jobs give people both a reason and the means to live here. The UAE’s private-sector workforce continued to expand in early 2026, while the skilled workforce grew by a further 1.5%.", "For investors, employment matters because growing businesses and workforces can translate into more households looking for somewhere to live."] },
        { n: "03", h: "Employment centres remain heavily occupied", v: "94%/96%", v2: "Dubai/Abu Dhabi", l: "Average office occupancy · Q2 2026 · CBRE", jump: "s2-1-drivers",
          paras: ["High office occupancy gives another indication of active business demand in both cities. CBRE describes demand as particularly concentrated around major employment centres including DIFC, TECOM and DMCC in Dubai, and ADGM in Abu Dhabi.", "People often choose to live close to where they work, so access to major employment centres can have a direct impact on housing demand."] },
        { n: "04", h: "Business expansion is creating new centres of demand", v: "10,000+", v2: "active companies", l: "Registered in DIFC by the end of June 2026 · +30% YoY", jump: "s2-1-drivers",
          paras: ["Dubai’s employment base is continuing to broaden. DIFC reported more than 10,000 active registered companies, while its AI, fintech and innovation business base reached 1,933 firms, up 39% YoY.", "Business growth does not automatically translate into property demand everywhere. But when employment expands within specific commercial hubs, nearby residential communities can benefit from a larger potential tenant and buyer pool."] } ] },

    { id: "s2-1-drivers", section: "s2", tpl: "tabs", bg: "img/page 17.png", title: "The demand drivers",
      tabs: [
        { n: "01", h: "More people need homes", sub: "Population growth creates the most direct source of housing demand",
          stats: [ { v: "4.58", u: "million residents", l: "Dubai population at the end of 2025." }, { v: "+332,000", u: "residents", l: "Increase compared with the previous year." }, { v: "4.14", u: "million residents", l: "Abu Dhabi population · 2024." }, { v: "+7.5%", u: "YoY", l: "Abu Dhabi population growth · 2024." } ],
          mid: "More residents usually means more demand for homes. But for an investor, there is another number that matters just as much: how many new homes are being built for them.",
          h2: "Demand only tells half the story", cols: [
            "Dubai delivered approximately 24,800 new homes in H1 2026, the highest level of completions on record and 37.6% more than the same period last year. The current full-year 2026 pipeline is estimated at approximately 68,000 units, while the 2027 pipeline is estimated at approximately 162,500 units. That makes the demand-versus-supply comparison increasingly important.",
            "If demand grows faster than supply, occupancy and rents can hold up. If supply grows faster, tenants and buyers have more choice and properties face more competition. This is why citywide population growth is only the starting point. The more useful comparison is at community level: how quickly demand is growing versus how many competing homes are being delivered nearby." ] },
        { n: "02", h: "Employment supports housing demand", sub: "Jobs give people a reason, and the means, to live here",
          stats: [ { v: "+2.5%", l: "UAE private-sector workforce growth · Q1 2026." }, { v: "+1.5%", l: "UAE skilled private-sector workforce growth · Q1 2026." }, { v: "+0.4%", l: "Growth in the number of private-sector companies · Q1 2026." } ],
          mid: "Population growth tells you that more people are here. Employment helps explain why they are here, and whether there is an economic base capable of supporting housing costs. When companies expand, they hire people. Those employees need somewhere to live, and some will bring families with them. That is one of the ways business growth can turn into housing demand. These employment figures are UAE-wide rather than Dubai-specific, so they should be read as a broader economic demand signal rather than a direct measure of Dubai housing demand.",
          h2: "Where people work influences where they live", cols: [
            "For a property investor, national or citywide employment growth is only part of the picture. Where people work, and how easily they can get there, can influence where they choose to live.",
            "Communities with convenient access to growing employment centres may benefit from a larger potential tenant pool. But supply matters too: if many similar homes are being delivered nearby, tenants have more choice and individual properties face more competition." ] },
        { n: "03", h: "Employment centres remain heavily occupied", sub: "Business activity helps show where residential demand may concentrate",
          stats: [ { v: "~94%", l: "Average office occupancy in Dubai · Q2 2026." }, { v: "~96%", l: "Average office occupancy in Abu Dhabi · Q2 2026." } ],
          mid: "Office occupancy is not the same as residential occupancy, but it provides useful context about the strength of major employment centres. CBRE describes both markets as operating with tight office supply, with demand concentrated around DIFC, TECOM and DMCC in Dubai and ADGM in Abu Dhabi. For an investor, the important point is not simply that offices are full. It is that concentrations of jobs can influence residential demand around them.",
          h2: "Look at where jobs are growing, then check the supply", cols: [
            "A community close to a growing employment hub may attract residents who value a shorter commute or easier access to work. But proximity alone is not enough.",
            "The number and type of residential properties being built nearby still matters. A location can benefit from strong employment demand and still face pressure if too many similar homes are competing for the same tenants." ] },
        { n: "04", h: "Business expansion is creating new centres of demand", sub: "A growing business base can create new housing requirements",
          stats: [ { v: "10,000+", l: "Active registered companies in DIFC · end-June 2026 · +30% YoY." }, { v: "1,933", l: "AI, fintech and innovation firms in DIFC · +39% YoY." }, { v: "+35%", l: "Growth in wealth and asset-management firms." } ],
          mid: "DIFC is only one part of Dubai’s economy, so these figures should not be treated as a measure of business growth across the entire city. What they do show is how quickly one of Dubai’s major employment centres continues to expand. As businesses grow, they can bring in new employees, increase demand for skilled workers and create additional housing requirements around the places where those employees work.",
          h2: "Citywide growth becomes more useful at community level", cols: [
            "For a property investor, the practical question is where that employment growth is happening. A growing business district can support housing demand in surrounding communities, but the strength of an individual investment will still depend on accessibility, price, property type and competing supply.",
            "Strong housing demand depends not just on job growth, but on having the right level of housing supply in those areas." ] } ] },

    { id: "s2-1-summary", section: "s2", tpl: "hub", bg: "img/page 18.png", shade: "topleft",
      title: "Demand is giving the market room to grow", nochoice: true,
      cols: [
        "Population growth, expanding private-sector employment and continued business activity are all adding to the number of people who may need homes across the UAE.",
        "At the same time, housing supply is increasing. Dubai delivered approximately 24,800 new homes in H1 2026, the highest level of completions on record, so the demand-versus-supply picture at community level matters more than any single citywide figure.",
        "Dubai added 332,000 residents in 2025, while the UAE’s private-sector workforce continued to grow in early 2026. Business registrations in DIFC also expanded, broadening the employment base.",
        "Together, these factors point to a growing demand base, but the strength of that demand will vary by location, property type and price point." ] },

    /* 2.2 GCC */
    { id: "s2-2-hub", section: "s2", tpl: "hub", bg: "img/page 19.png", num: "2.2",
      title: "How the UAE compares within the GCC",
      paras: [
        "More GCC markets are opening up to international property investment, giving investors more choice across the region. Saudi Arabia is expanding international access, Qatar already allows foreign ownership in designated locations, and Muscat is developing a growing proposition around tourism, lifestyle communities and branded residences.",
        "For an investor, the useful question is no longer simply where you can buy. It is what you can buy, what it could earn, what it costs to own and how easy it may be to sell later." ],
      callouts: [{ label: "Abu Dhabi", x: .24, y: .58 }, { label: "Dubai", x: .72, y: .52 }],
      prompt: "Select a market to explore" },

    { id: "s2-2-dxb", section: "s2", market: "dubai", tpl: "glance", bg: "img/page 20.png", city: "Dubai", title: "Established scale",
      source: "Dubai at a glance",
      intro: [
        "The region’s most established international property market",
        "Dubai combines broad freehold choice with a large rental and resale market and a wide range of ready and off-plan property.",
        "For an investor, that scale provides more evidence to work with. You can compare prices, achieved rents and competing properties before you buy, while a larger resale market gives you a broader pool of potential buyers when you eventually decide to sell." ],
      cols: [
        { q: "Representative one-bedroom price", pre: "~AED", v: "1.2M" },
        { q: "Indicative gross rental yield", v: "~7%" },
        { q: "International ownership", hl: "Broad freehold access in designated areas" },
        { q: "Property choice", hl: "Wide choice across ready and off-plan property" },
        { q: "Resale market", hl: "The GCC’s broadest international resale market" },
        { q: "Residency connection", hl: "Qualifying property investment can provide a route to the UAE Golden Visa." } ],
      trade: { h: "What investors should consider", a: "More choice also means more competition between individual properties.", t: "That makes selection important. The price you pay, future supply nearby, achievable rent and the number of similar properties competing for buyers can all affect how an investment performs." } },

    { id: "s2-2-dxb-cities", section: "s2", market: "dubai", tpl: "cities", city: "Dubai", title: "How Dubai compares across the GCC",
      cities: [
        { name: "Riyadh", tag: "Transformation market", photo: "riyadh", t: "Economic expansion and major developments are creating new residential opportunities as international access continues to evolve." },
        { name: "Doha", tag: "Established smaller market", photo: "doha", t: "International buyers can access property in designated locations, but property choice and the resale market are more concentrated." },
        { name: "Muscat", tag: "Emerging lifestyle market", photo: "muscat", t: "Tourism-led communities and branded residences are expanding the choice available to international buyers, particularly for investors combining property ownership with lifestyle use." } ] },

    /* 2.2 — full GCC table for the Dubai journey: the compare journey's table without the other emirate */
    { id: "s2-2-dubai-gcc", section: "s2", market: "dubai", tpl: "compare", city: "Dubai", title: "View full GCC comparison",
      head: ["Decision factor", "Dubai", "Riyadh", "Doha", "Muscat"],
      photos: ["dubai-towers", "riyadh", "doha", "muscat"],
      rows: [
        ["International access", "Broad freehold in designated areas", "Designated zones (2026 law)", "10 freehold zones; leasehold in others", "Freehold in ITCs only"],
        ["Representative entry price", "~AED 1.2M", "~AED 0.85M", "~AED 1.65M", "~AED 1.0M"],
        ["Indicative gross rental yield", "~7%", "~7%", "~5.5%", "~6%"],
        ["Estimated buying costs", "~4% transfer fee (+ ~2% agency)", "~5% transaction tax (RETT)", "~0.25% registration fee", "~3% registration fee (~5–7% all-in)"],
        ["Recurring property costs / tax", "No annual property tax; ~5% housing fee on rent; service charges", "No annual residential property tax; no tax on rental income", "No annual property tax; service charges", "~3% municipality tax on rent; service charges"],
        ["Property choice", "Broad ready and off-plan range", "Broadening; new supply in designated zones", "Concentrated in selected districts", "Growing lifestyle and branded-residence offer"],
        ["Resale market", "Deepest international pool in the GCC", "Early-stage for international buyers", "Smaller and location-dependent", "Concentrated in ITC communities"],
        ["Residency connection", "Qualifying UAE Golden Visa route", "Premium Residency route (property-linked)", "Property-linked residency (from ~US$200k)", "Investor residency via ITC property"] ],
      after: { cols: [], foot: "Data note: all market benchmarks, ownership rules and residency criteria should be dated and verified before publication. Representative prices and yields are indicative and will vary by location, property type and development." } },

    { id: "s2-2-auh", section: "s2", market: "abudhabi", tpl: "glance", bg: "abudhabi-balcony", city: "Abu Dhabi", title: "Development-led growth",
      source: "Abu Dhabi at a glance",
      intro: [
        "A smaller market with a growing international proposition",
        "Abu Dhabi is widening the property choice available to international investors through designated investment zones and new development.",
        "For an investor, this provides access to a market at a different stage from Dubai. Much of the current opportunity is tied to newer development, so the developer, location, price and completion timeline can matter just as much as the wider direction of the market." ],
      cols: [
        { q: "Representative one-bedroom price", pre: "~AED", v: "1.4M" },
        { q: "Indicative gross rental yield", v: "~6.5%" },
        { q: "International ownership", hl: "Freehold ownership within designated investment zones" },
        { q: "Property choice", hl: "A more concentrated market with a greater emphasis on newer and off-plan development" },
        { q: "Resale market", hl: "Growing, but more concentrated than Dubai" },
        { q: "Residency connection", hl: "Qualifying property investment can provide a route to the UAE Golden Visa." } ],
      trade: { h: "Why project selection matters", a: "New development can give investors access to growing areas, but there may be fewer completed properties to compare against.", t: "For investors, the individual project matters more. Look closely at the developer, future supply, expected rental demand and the likely pool of renters or buyers once the development is complete." } },

    { id: "s2-2-auh-cities", section: "s2", market: "abudhabi", tpl: "cities", city: "Abu Dhabi", title: "How Abu Dhabi compares across the GCC",
      cities: [
        { name: "Riyadh", tag: "Transformation market", photo: "riyadh", t: "Economic expansion and major developments are creating new residential opportunities as international access continues to evolve." },
        { name: "Doha", tag: "Established smaller market", photo: "doha", t: "International buyers can access property in designated locations, but property choice and the resale market are more concentrated." },
        { name: "Muscat", tag: "Emerging lifestyle market", photo: "muscat", t: "Tourism-led communities and branded residences are expanding the choices available to international buyers, particularly for investors combining property ownership with lifestyle use." } ] },

    /* 2.2 — full GCC table for the Abu Dhabi journey: the compare journey's table without the other emirate */
    { id: "s2-2-abudhabi-gcc", section: "s2", market: "abudhabi", tpl: "compare", city: "Abu Dhabi", title: "View full GCC comparison",
      head: ["Decision factor", "Abu Dhabi", "Riyadh", "Doha", "Muscat"],
      photos: ["abudhabi-skyline", "riyadh", "doha", "muscat"],
      rows: [
        ["International access", "Freehold in designated investment zones", "Designated zones (2026 law)", "10 freehold zones; leasehold in others", "Freehold in ITCs only"],
        ["Representative entry price", "~AED 1.4M", "~AED 0.85M", "~AED 1.65M", "~AED 1.0M"],
        ["Indicative gross rental yield", "~6.5%", "~7%", "~5.5%", "~6%"],
        ["Estimated buying costs", "~2% transfer fee (+ ~2% agency)", "~5% transaction tax (RETT)", "~0.25% registration fee", "~3% registration fee (~5–7% all-in)"],
        ["Recurring property costs / tax", "No annual property tax; service charges", "No annual residential property tax; no tax on rental income", "No annual property tax; service charges", "~3% municipality tax on rent; service charges"],
        ["Property choice", "More concentrated and off-plan led", "Broadening; new supply in designated zones", "Concentrated in selected districts", "Growing lifestyle and branded-residence offer"],
        ["Resale market", "Growing, but more concentrated", "Early-stage for international buyers", "Smaller and location-dependent", "Concentrated in ITC communities"],
        ["Residency connection", "Qualifying UAE Golden Visa route", "Premium Residency route (property-linked)", "Property-linked residency (from ~US$200k)", "Investor residency via ITC property"] ],
      after: { cols: [], foot: "Data note: all market benchmarks, ownership rules and residency criteria should be dated and verified before publication. Representative prices and yields are indicative and will vary by location, property type and development." } },

    { id: "s2-2-both", section: "s2", market: "compare", tpl: "compare", title: "Two UAE markets. Two different investment propositions.",
      intro: "Dubai and Abu Dhabi give international investors access to the same wider UAE environment, but their property markets offer different opportunities.",
      head: ["Decision factor", "Dubai", "Abu Dhabi"],
      photos: ["dubai-towers", "abudhabi-skyline"],
      rows: [
        ["Market position", "Established international market", "Development-led growth market"],
        ["Representative 1BR price", "~AED 1.2M", "~AED 1.4M"],
        ["Indicative gross yield", "~7%", "~6.5%"],
        ["International ownership", "Broad freehold access in designated areas", "Freehold within designated investment zones"],
        ["Property choice", "Broad ready and off-plan range", "More concentrated and off-plan led"],
        ["Resale market", "Deepest international pool in the GCC", "Growing, but more concentrated"],
        ["Residency connection", "Qualifying UAE Golden Visa route", "Qualifying UAE Golden Visa route"] ],
      after: { cols: [
        "Dubai provides greater scale, more ready-property choice and a deeper rental and resale market. Abu Dhabi is smaller and more heavily shaped by newer development and expanding investment areas.",
        "Neither difference tells you which property will perform better. It tells you what to examine before deciding which market better fits your investment goals." ] } },

    { id: "s2-2-compare", section: "s2", market: "compare", tpl: "compare", title: "View full GCC comparison",
      head: ["Decision factor", "Dubai", "Abu Dhabi", "Riyadh", "Doha", "Muscat"],
      photos: ["dubai-towers", "abudhabi-skyline", "riyadh", "doha", "muscat"],
      rows: [
        ["International access", "Broad freehold in designated areas", "Freehold in designated investment zones", "Designated zones (2026 law)", "10 freehold zones; leasehold in others", "Freehold in ITCs only"],
        ["Representative entry price", "~AED 1.2M", "~AED 1.4M", "~AED 0.85M", "~AED 1.65M", "~AED 1.0M"],
        ["Indicative gross rental yield", "~7%", "~6.5%", "~7%", "~5.5%", "~6%"],
        ["Estimated buying costs", "~4% transfer fee (+ ~2% agency)", "~2% transfer fee (+ ~2% agency)", "~5% transaction tax (RETT)", "~0.25% registration fee", "~3% registration fee (~5–7% all-in)"],
        ["Recurring property costs / tax", "No annual property tax; ~5% housing fee on rent; service charges", "No annual property tax; service charges", "No annual residential property tax; no tax on rental income", "No annual property tax; service charges", "~3% municipality tax on rent; service charges"],
        ["Property choice", "Broad ready and off-plan range", "More concentrated and off-plan led", "Broadening; new supply in designated zones", "Concentrated in selected districts", "Growing lifestyle and branded-residence offer"],
        ["Resale market", "Deepest international pool in the GCC", "Growing, but more concentrated", "Early-stage for international buyers", "Smaller and location-dependent", "Concentrated in ITC communities"],
        ["Residency connection", "Qualifying UAE Golden Visa route", "Qualifying UAE Golden Visa route", "Premium Residency route (property-linked)", "Property-linked residency (from ~US$200k)", "Investor residency via ITC property"] ],
      after: { cols: [], foot: "Data note: all market benchmarks, ownership rules and residency criteria should be dated and verified before publication. Representative prices and yields are indicative and will vary by location, property type and development." } },

    { id: "s2-2-why", section: "s2", market: "compare", tpl: "trio", bg: "img/page 18 CB.png", title: "Why these differences matter",
      callouts: [{ label: "Dubai", x: .62, y: .56 }, { label: "Doha", x: .5, y: .64 }, { label: "Abu Dhabi", x: .38, y: .5 }, { label: "Muscat", x: .2, y: .6 }, { label: "Riyadh", x: .8, y: .66 }],
      cards: [
        { h: "More evidence to compare", t: "Dubai’s larger ready, rental and resale markets give investors more completed properties and transactions to use when assessing price, achievable rent and potential resale demand." },
        { h: "More exposure to newer development", t: "Abu Dhabi and Riyadh offer different development-led propositions. That makes the individual project, future supply and likely demand after completion especially important." },
        { h: "More concentrated lifestyle markets", t: "Doha and Muscat offer a narrower range of international investment locations. In Muscat, a growing branded-residence and resort market adds another option for investors interested in combining lifestyle use with property investment." } ] },

    /* 2.3 Global */
    { id: "s2-3-hub", section: "s2", tpl: "hub", bg: "img/page 22.png", num: "2.3",
      title: "How the UAE compares with global property markets",
      body: "Compared with other established property markets, the UAE offers lower average purchase prices, gross rental yields of close to 6%, and no annual property tax. For an investor, the important point is how these factors work together: the price needed to enter the market, the income a property could produce and the costs that reduce that income. Across those measures, the UAE presents a strong overall proposition in this 2026 benchmark.",
      nochoice: true },

    { id: "s2-3-global", section: "s2", tpl: "global", bg: "img/page 23.png", title: "Dubai, Abu Dhabi and global property cities",
      cities: [
        { name: "Dubai", key: "dubai", uae: true, blocks: [
          { l: "Representative one-bedroom price", s: "Approximately", v: "Dhs 1.102 million" },
          { l: "Indicative gross rental yield", s: "Approximately", v: "5.5–6.0%" },
          { l: "Estimated net rental yield", s: "Approximately", v: "4.0–4.5%", t: "The gap between gross and net yield is the part likely to be absorbed by typical property-level costs. It gives investors a more realistic view of the income they may retain before financing and personal tax." },
          { l: "Estimated total entry cost", s: "Approximately", v: "Dhs 1.168–1.179 million", t: "This comprises the representative property price plus approximately", v2: "Dhs 66,000–77,000", t2: "in buying costs. The purchase price is therefore only part of the money needed to complete the investment." },
          { l: "Recurring property tax", s: "No annual property tax.", t: "A housing fee equivalent to 5% of annual rent is generally paid by the occupier. Service charges and other ownership expenses still apply, so investors should include these when estimating the income they may keep." },
          { l: "Foreign ownership", t: "Foreign investors can purchase freehold property in designated areas, which include most established investor locations. This gives overseas investors access to a broad choice of commonly considered investment areas." },
          { l: "Property-linked residency", t: "A qualifying property investment of", v2: "Dhs 2 million", t2: "may provide access to a ten-year UAE Golden Visa, subject to the applicable eligibility requirements. For investors who qualify, the property may therefore support both an investment goal and a longer-term residency plan." } ] },
        { name: "Abu Dhabi", key: "abudhabi", uae: true, blocks: [
          { l: "Representative one-bedroom price", s: "Approximately", v: "Dhs 1.050 million", t: "Based on Al Reem Island." },
          { l: "Indicative gross rental yield", s: "Approximately", v: "5.8%" },
          { l: "Estimated net rental yield", s: "Approximately", v: "4.0–4.5%", t: "The net estimate allows for typical property-level costs, giving investors a clearer view of the income they may retain before financing and personal tax." },
          { l: "Estimated total entry cost", s: "Approximately", v: "Dhs 1.091–1.102 million", t: "This comprises the representative property price plus approximately", v2: "Dhs 40,000–51,000", t2: "in buying costs. Comparing the full entry cost helps investors understand the amount required to complete the purchase, not simply the advertised property price." },
          { l: "Recurring property tax", s: "No annual property tax.", t: "Service charges and other property-level ownership expenses still apply. These costs should be deducted when estimating how much rental income the property may produce for its owner." },
          { l: "Foreign ownership", t: "Foreign investors can purchase freehold property within designated investment zones. Different ownership structures may apply outside these zones, so the location affects both what an overseas investor can buy and the type of ownership available." },
          { l: "Property-linked residency", t: "A qualifying property investment of", v2: "Dhs 2 million", t2: "may provide access to a ten-year UAE Golden Visa, subject to the applicable eligibility requirements. For investors who qualify, the property may therefore support both an investment goal and a longer-term residency plan." } ] },
        { name: "London", blocks: [
          { l: "Representative one-bedroom price", s: "Approximately", v: "Dhs 1.968 million", t: "Indicative range:", v2: "Dhs 1.836–2.093 million" },
          { l: "Indicative gross rental yield", s: "Approximately", v: "4–5%", t: "for typical property and approximately 3–3.5% in prime locations. A higher property price does not automatically produce a higher percentage return; in prime areas, investors may accept a lower yield in exchange for the location and type of asset." },
          { l: "Estimated net rental yield", s: "Approximately", v: "2.5–3.5%", t: "The difference from the gross yield shows how property-level costs can reduce the income an investor ultimately retains." },
          { l: "Estimated total entry cost", s: "Approximately", v: "Dhs 2.167 million", t: "This comprises the representative property price plus approximately", v2: "Dhs 198,000", t2: "in buying costs for a non-resident investor. The estimate includes applicable Stamp Duty Land Tax, foreign-buyer and additional-property surcharges, and legal costs. These charges raise the amount needed at the start and should be considered alongside the property price." },
          { l: "Recurring property tax", t: "Council tax of approximately", v2: "Dhs 5,900–8,800 per year", t2: "depending on the property and local authority. This is an ongoing charge to allow for when estimating the property’s annual costs." },
          { l: "Foreign ownership", t: "Foreign ownership is permitted, although non-resident and additional-property tax surcharges may apply. Overseas investors can buy, but their purchase costs may be higher." },
          { l: "Property-linked residency", t: "Property ownership does not provide a direct residency route. The investment and any plans to live in the UK therefore need to be considered separately." } ] },
        { name: "Frankfurt", blocks: [
          { l: "Representative one-bedroom price", s: "Approximately", v: "Dhs 1.506 million", t: "Indicative range:", v2: "Dhs 1.285–1.726 million" },
          { l: "Indicative gross rental yield", s: "Approximately", v: "3.3%" },
          { l: "Estimated net rental yield", s: "Approximately", v: "2.0–2.5%", t: "After typical property-level costs, the income retained may be lower than the headline yield suggests." },
          { l: "Estimated total entry cost", s: "Approximately", v: "Dhs 1.664–1.671 million", t: "This comprises the representative property price plus approximately", v2: "Dhs 158,000–165,000", t2: "in buying costs. The estimate includes the 6% property-transfer tax and typical notary and agency costs. For an investor, these costs increase the amount committed before the property begins producing any income." },
          { l: "Recurring property tax", t: "Grundsteuer of approximately", v2: "Dhs 1,300–2,600 per year", t2: "although the amount depends on the property and its assessed tax value. This recurring cost should be included when estimating the property’s annual return." },
          { l: "Foreign ownership", t: "Foreign ownership is permitted without a specific foreign-buyer surcharge. Overseas investors can enter the market without paying an additional purchase surcharge solely because they are foreign." },
          { l: "Property-linked residency", t: "Property ownership does not provide a direct residency route. The investment and any plans to live in Germany therefore need to be considered separately." } ] },
        { name: "Singapore", blocks: [
          { l: "Representative one-bedroom price", s: "Approximately", v: "Dhs 3.122 million", t: "Indicative range:", v2: "Dhs 2.975–3.397 million" },
          { l: "Indicative gross rental yield", s: "Approximately", v: "3.1%" },
          { l: "Estimated net rental yield", s: "Approximately", v: "2.0–2.5%", t: "The net estimate gives investors a clearer view of the income that may remain after typical property-level expenses." },
          { l: "Estimated total entry cost", s: "Approximately", v: "Dhs 5.068 million or more", t: "for a foreign buyer. This comprises the representative property price, the 60% Additional Buyer’s Stamp Duty, Buyer’s Stamp Duty and legal costs. For a foreign investor, these charges make the amount required to enter the market substantially higher than the property price alone." },
          { l: "Recurring property tax", t: "For a non-owner-occupied property, the tax is calculated progressively at approximately 12–36% of the property’s assessed annual value. Annual value is an assessment of the property’s potential annual rent, not its purchase price. The tax therefore rises according to assessed rental value and reduces the income an investor may ultimately keep." },
          { l: "Foreign ownership", t: "Foreign investors can generally purchase condominium units. Restrictions apply to landed homes and public HDB housing, which means overseas buyers have access to only part of the residential market." },
          { l: "Property-linked residency", t: "Purchasing property does not provide a direct residency route. Singapore’s Global Investor Programme requires a qualifying business investment rather than a residential property purchase, so the two decisions need to be considered separately." } ] },
        { name: "Hong Kong", blocks: [
          { l: "Representative one-bedroom price", s: "Approximately", v: "Dhs 2.571 million", t: "Indicative range:", v2: "Dhs 2.479–2.828 million" },
          { l: "Indicative gross rental yield", s: "Approximately", v: "3.2–3.9%" },
          { l: "Estimated net rental yield", s: "Approximately", v: "2.5–3.0%", t: "The net estimate shows how much of the headline yield may remain after typical property-level costs." },
          { l: "Estimated total entry cost", s: "Approximately", v: "Dhs 2.611–2.681 million or more", t: "This comprises the representative property price plus approximately", v2: "Dhs 40,000–110,000", t2: "in stamp duty. Legal and agency costs may be additional, so investors should allow for more than the headline purchase price when planning how much money they need." },
          { l: "Recurring property tax", t: "Rates are approximately 5% of the property’s rateable value, with government rent of approximately 3% where applicable. Rateable value reflects the property’s estimated annual rental value rather than its purchase price. These recurring charges reduce the rental income an investor may ultimately retain." },
          { l: "Foreign ownership", t: "Foreign ownership is permitted. Hong Kong removed its additional buyer duties in February 2024, so overseas buyers are not subject to those former additional duties." },
          { l: "Property-linked residency", t: "Residential property can make only a limited contribution under the New Capital Investment Entrant Scheme. The scheme has a HK$30 million investment threshold (approximately", v2: "Dhs 14.050 million", t2: ") and specific rules governing eligible property, so buying a residential property alone should not be treated as a direct route to residency." } ] },
        { name: "Manhattan", blocks: [
          { l: "Representative one-bedroom price", s: "Approximately", v: "Dhs 3.948 million", t: "Based on the condominium median." },
          { l: "Indicative gross rental yield", s: "Approximately", v: "3.5–4.5%" },
          { l: "Estimated net rental yield", s: "Approximately", v: "2.0–2.5%", t: "The wider difference between gross and net yield shows how building and ownership costs can reduce the income an investor keeps." },
          { l: "Estimated total entry cost", s: "Approximately", v: "Dhs 4.029–4.146 million", t: "This comprises the representative property price plus approximately", v2: "Dhs 81,000–198,000", t2: "in buying costs. The estimate may include mansion tax, mortgage-recording tax where applicable, title costs and legal fees. These charges add to the money required before the property begins producing income." },
          { l: "Recurring property tax", t: "Approximately 0.5–0.9% of the property value per year, equivalent to roughly", v2: "Dhs 20,000–36,000 per year", t2: "on the representative property. Building common charges and other ownership expenses are separate. Together, these recurring costs help explain why the net yield may be considerably lower than the gross yield." },
          { l: "Foreign ownership", t: "Foreign investors can purchase condominium units. Co-operative buildings may apply more restrictive financial and residency requirements, so the type of building affects what is realistically available to an overseas buyer. Foreign Investment in Real Property Tax Act withholding may apply when a foreign owner sells, adding a tax consideration at the point of exit." },
          { l: "Property-linked residency", t: "Residential property ownership does not provide a direct residency route. The EB-5 programme requires a qualifying investment and is not based on purchasing a personal investment property." } ] },
        { name: "Miami", blocks: [
          { l: "Representative one-bedroom price", s: "Miami-Dade County · approximately", v: "Dhs 1.542 million", t: "Indicative range:", v2: "Dhs 1.414–1.653 million" },
          { l: "Indicative gross rental yield", s: "Approximately", v: "6.8%", t: "Indicative range: 5–7%. This is a strong headline income figure, but it needs to be considered alongside the market’s higher recurring ownership costs." },
          { l: "Estimated net rental yield", s: "Approximately", v: "3.5–4.5%", t: "The difference between gross and net yield shows how property tax, insurance, condominium fees and other costs can reduce the income an investor ultimately retains." },
          { l: "Estimated total entry cost", s: "Approximately", v: "Dhs 1.557–1.583 million", t: "This comprises the representative property price plus approximately", v2: "Dhs 15,000–40,000", t2: "in buyer costs. Estimated buyer costs are approximately 1–2.5%. Florida does not apply a mansion tax, and the seller generally pays the documentary stamp tax on a resale transaction. This keeps the initial buying costs relatively close to the representative property price." },
          { l: "Recurring property tax", t: "Approximately 1.38% of the property value per year in Miami-Dade County. This is equivalent to approximately", v2: "Dhs 21,000 per year", t2: "on the representative property. Condominium fees, insurance and other ownership expenses are separate, so the annual cost of holding the property extends beyond property tax alone. Florida does not impose state individual income tax, although federal taxation and other liabilities may still apply." },
          { l: "Foreign ownership", t: "Foreign ownership is permitted. Foreign Investment in Real Property Tax Act withholding may apply when a foreign owner sells, adding a tax consideration at the point of exit." },
          { l: "Property-linked residency", t: "Residential property ownership does not provide a direct residency route. The EB-5 programme requires a qualifying investment and is not based on purchasing a personal investment property." } ] }
      ] },

    { id: "s2-3-summary", section: "s2", tpl: "hub", bg: "img/page 24.png", shade: "topleft", nochoice: true,
      title: "The UAE’s advantage is the balance between cost and income",
      paras: [
        "The UAE’s advantage is not based on one figure alone. It comes from the combination of a more accessible representative entry price, competitive rental income, no annual property tax and a broad route to foreign ownership in designated areas.",
        "Miami may show a higher indicative gross yield, but property tax, insurance, condominium fees and other operating costs reduce the amount an investor may ultimately keep. This is why the net yield can tell a different story from the headline figure.",
        "The most useful comparison is therefore not simply which market advertises the highest yield. It is which market offers the right balance of purchase price, buying costs, annual expenses and income after property-level costs for the investor’s own goals." ] },

    /* ───────────────────────── 03  YOUR INVESTMENT FOCUS ─────────────────────────
       Personalised from the form (goal=, market=, budget=, route=) — see app.js → focus. */
    { id: "s3-open", section: "s3", tpl: "focus", bg: "img/page 25.png", num: "03", title: "Your investment focus",
      goalLabels: { A1: "Rental income", A2: "Capital growth", A3: "UAE residency", A4: "Personal use", A5: "Portfolio diversification" },
      routes: { completed_rent: "Ready property to rent out", completed_resell: "Ready property to resell", off_plan_sell_before_handover: "Off-plan, sell before handover", off_plan_rent_after_handover: "Off-plan, rent out after handover", off_plan_resell_after_handover: "Off-plan, resell after handover", undecided: "Still deciding" },
      cta: { label: "Explore what to check before you buy",jump: "s4-open"},
      variants: {
        A1: { lede: "A property with an income case you can examine.",
          body: "Your priority is rental income. A useful comparison begins with what similar homes have actually earned and what it costs to own, maintain and let the property. That gives you a clearer basis for judging the income it could provide.",
          rows: [
            { h: "Where to begin your search", paras: ["Use the community section to explore your selected market and price range. Then compare individual buildings and homes: tenant appeal, layout, condition, service charges and nearby alternatives can make a substantial difference within the same community.", "A community-wide yield can help you begin a search. An individual property needs its own evidence."] },
            { h: "Your purchase route", paras: ["Compare completed and off-plan property against when you want income to begin. For each option, map the purchase payments, preparation costs and period before the home could be let.", "A completed property lets you assess the home and its current rental position before buying. If it is tenanted, review the existing agreement and payment history. If it is vacant, allow for any work, marketing and tenant arrangements needed before rent begins.", "With an off-plan property, your income plan begins at handover, while your financial commitments may begin much earlier. Map the instalments, completion costs and any payments continuing after handover. Then consider the work and time needed to prepare and let the home. If you want rent to begin soon, compare the project’s expected completion with your timing and allow for delays."] },
            { h: "The numbers to compare", paras: ["Bring together the purchase price, buying fees, ongoing ownership costs and evidence of achievable rent. Allow for maintenance, letting and management costs, and periods without a tenant.", "If you plan to borrow, show mortgage payments separately so you can see how financing changes the cash left each month."] },
            { h: "What to pay attention to", paras: ["An attractive advertised return can depend on assumptions about rent, occupancy or costs. Ask what supports each assumption.", "For a tenanted property, review the lease and payment record. For an off-plan property, examine the payments due before income can begin and the competing homes that may become available around completion."] },
            { h: "Support you may need", paras: ["A property consultant can help gather comparable rental evidence and narrow the shortlist. Depending on the purchase, you may also value help with inspection, conveyancing, mortgage arrangements, leasing or property management."] } ] },
        A2: { lede: "Understand what could make the property more valuable to its next buyer.",
          body: "Your priority is growth in value. Begin with the price you would pay and the evidence behind it. Then examine what could strengthen future demand and how you would sell when the time comes.",
          rows: [
            { h: "Where to begin your search", paras: ["Use the community section to compare locations within your selected market and price range. Look at access, established amenities, planned changes and the supply of similar homes.", "Move from the area to the individual property. Layout, building quality, condition and the alternatives available to buyers all influence how it competes."] },
            { h: "Your purchase route", paras: ["Compare completed and off-plan purchases against your intended holding period. Examine what you would pay, what could support future demand and how the purchase terms would affect a later sale.", "For a completed property, review its condition and compare the purchase price with completed sales for similar homes. If improvements are part of your plan, include their scope, cost and timing alongside holding and selling costs. Separate the value you hope to add from wider market movement.", "If you plan to sell an off-plan purchase before handover, check when resale is permitted, what payments must be made first and which approvals or fees apply. Consider who might buy from you while the developer or other owners are also offering homes. If you plan to resell after handover, compare the total purchase and completion cost with similar completed homes, and review delivery quality, nearby supply and the costs of holding the property while you find a buyer."] },
            { h: "The numbers to compare", paras: ["Compare the full acquisition cost with completed sales for closely matched properties. Include the costs of holding and selling before judging what a higher future price would mean for you.", "If you are considering a mortgage, compare borrowing costs and repayment commitments with the cash purchase. Keep a separate view of the money committed and the cash you would need available."] },
            { h: "What to pay attention to", paras: ["A project’s launch price or a nearby asking price does not establish what you could achieve on resale. Test the assumptions about delivery, demand and competing supply.", "Your intended sale date also needs flexibility. Consider whether you could continue holding the property if the market or your circumstances changed."] },
            { h: "Support you may need", paras: ["You may value help comparing completed sales, assessing a project or building, reviewing purchase and resale terms, and understanding financing options."] } ] },
        A3: { lede: "Bring your residency plans and property search together.",
          body: "You are considering property as part of your plans for a longer-term connection to the UAE. Begin by confirming the requirements for the residency route you have in mind, then assess the property against how you intend to use it.",
          rows: [
            { h: "Where to begin your search", paras: ["Your residency plans provide one part of the brief. Your preferred market, price range and intended use provide the rest.", "Use the community section to compare locations that suit your wider priorities, whether you want a home for yourself, rental income or a property to hold over time."] },
            { h: "Your purchase route", paras: ["Before committing, check how the proposed ownership, funding arrangements and purchase stage relate to the residency application you are considering. Confirm which documents would be needed and when they would become available."] },
            { h: "The numbers to compare", paras: ["Consider the full property purchase and ownership costs alongside the application and renewal costs relevant to your plans. If you expect rental income, assess it separately using evidence for the property."] },
            { h: "What to pay attention to", paras: ["A property being marketed for residency purposes does not establish your individual eligibility. Confirm the current requirements and your circumstances before relying on the purchase to support an application.", "The home should also make sense if your plans change. Consider its usefulness to you and its appeal to future tenants or buyers."] },
            { h: "Support you may need", paras: ["You may need specialist support to confirm residency requirements and documentation, alongside help with property selection, conveyancing and financing."] } ] },
        A4: { lede: "A home that works for the life you plan to lead.",
          body: "Your priority is a home for your own use. Begin with how you would live there: the location, space and everyday details that would make it comfortable and convenient.",
          rows: [
            { h: "Where to begin your search", paras: ["Use the community section to compare your selected locations. Consider the journeys you would make regularly, the amenities you would use and the surroundings you prefer.", "Within each area, compare layout, natural light, privacy, parking, building upkeep and ongoing charges. A home that looks appealing on a viewing needs to work in daily life too."] },
            { h: "Your purchase route", paras: ["For a completed property, confirm its condition and when you could take possession.", "For an off-plan home, compare the expected handover with when you want to use it. Review the agreed specification and consider what you would do if completion were delayed."] },
            { h: "The numbers to compare", paras: ["Look beyond the purchase price to buying fees, service charges, maintenance and any furnishing or improvement work. If you plan to borrow, include the repayment commitment within your wider household budget.", "For occasional use, consider how the property would be maintained while you are away."] },
            { h: "What to pay attention to", paras: ["Confirm the practical details that affect your plans: access, parking, building rules, condition and possession timing. If the home is tenanted, establish the position before relying on a move-in date.", "If resale value also matters to you, consider how the features you enjoy would appeal to a future buyer."] },
            { h: "Support you may need", paras: ["You may value help arranging viewings, inspecting the home, reviewing possession arrangements, coordinating finance and completing the purchase."] } ] },
        A5: { lede: "Give the property a clear role within your wider investments.",
          body: "Your priority is how UAE property fits alongside what you already hold. Begin with the role you want it to play and the commitments it would introduce.",
          rows: [
            { h: "Where to begin your search", paras: ["Consider where your existing investments are concentrated: location, asset type, currency, developer or source of income.", "Use the community section to compare properties within your selected market and price range. Assess each against the role you want it to serve, rather than assuming that another property automatically creates greater diversification."] },
            { h: "Your purchase route", paras: ["A completed property and an off-plan purchase create different payment schedules and periods before the home can be used or let. Compare those commitments with your existing holdings and expected cash needs.", "If you are considering several purchases, look at how their payments and completion dates would overlap."] },
            { h: "The numbers to compare", paras: ["Review the capital committed, ongoing costs and any expected income alongside your wider financial obligations. Consider how much cash would remain available for other plans or unexpected costs.", "Assess each property individually, then examine what the combined holdings would depend on."] },
            { h: "What to pay attention to", paras: ["Several homes can share the same exposure if they depend on one location, developer, tenant market or completion period. Consider how a change affecting one could affect the others.", "Also think about your exit: which properties could be sold, the costs involved and whether your plans depend on selling within a particular period."] },
            { h: "Support you may need", paras: ["A property consultant can help compare opportunities and understand the market evidence. You may also value independent advice on ownership structure, tax, currency and the role of property within your wider investments."] } ] }
      } },

    /* ───────────────────────── 04  WHAT TO CHECK ───────────────────────── */
    { id: "s4-open", section: "s4", tpl: "opener", bg: "img/page 26.png", num: "04", simple: true,
      title: "What to check before you buy",
      paras: [
        "A good property is not automatically a good investment. Before committing, look beyond the asking price, projected return or launch offer.",
        "First, verify what you are buying. Then understand how much money the purchase will really require, what it may cost to own and whether the property supports the outcome you are buying for.",
        "Some checks apply to every purchase. Others become more important depending on your property type and investment goals." ],
      chooser: { label: "Property type", key: "ptype", options: [["ready", "Ready"], ["offplan", "Off-plan"]] } },

    { id: "s4-1-verify", section: "s4", tpl: "checklist", bg: "img/page 27.png", num: "4.1", title: "Verify your property", perPage: 6,   // all six checks on one slide (two rows); omit for the 3-per-page pager
      variants: {
        ready: [
          { n: "01", h: "Verify the property details", t: "Start by making sure the property, project and listing information can be independently verified.", items: ["Property or project name", "Unit details", "Advertised price", "Broker or agency", "Listing or advertising permit, where applicable", "Current availability"], sub: "Where possible, verify the information through the relevant property authority rather than relying only on the advertisement." },
          { n: "02", h: "Verify who you are dealing with", t: "Make sure the people and companies involved in the transaction can be independently verified.", items: ["Broker name and registration", "Brokerage company", "Developer, where applicable", "Project registration, where applicable", "Who is authorised to receive payments"] },
          { n: "03", h: "Check that the paperwork matches the property", t: "Small differences matter when you are buying a specific unit, so make sure the documents match what you were shown and agreed to.", items: ["Unit number", "Building or project", "Floor", "Internal area", "Balcony or external area", "Layout", "Parking allocation", "Purchase price", "Payment schedule", "Completion or handover date, where applicable", "Included fixtures or specifications, where relevant"] },
          { n: "04", h: "Verify the ownership details", t: "Confirm the property’s ownership position before progressing with the transfer.", rv: "Consider", items: ["Registered owner", "Property details", "Existing mortgage, where applicable", "Whether the property is vacant or tenanted", "Documentation required before transfer"] },
          { n: "05", h: "Review the tenancy details", t: "If the property is rented, remember that you are acquiring an existing tenancy as well as the property itself.", items: ["Current tenancy contract", "Annual rent", "Contract dates", "Payment schedule", "Security deposit details", "Renewal history, where available", "Relevant notices already issued", "Property management arrangement, if applicable"], q: "Am I comfortable with the tenancy I will be taking over?" },
          { n: "06", h: "Assess the property condition", t: "The purchase price does not always reflect how much additional capital the property may require after completion.", items: ["General property condition", "Age of major fittings and equipment", "Known repairs", "Renovation requirements", "Building condition and common areas", "Inspection or snagging requirements, where appropriate"] } ],
        offplan: [
          { n: "01", h: "Verify the property details", t: "Start by making sure the property, project and listing information can be independently verified.", items: ["Property or project name", "Unit details", "Advertised price", "Broker or agency", "Listing or advertising permit, where applicable", "Current availability"], sub: "Where possible, verify the information through the relevant property authority rather than relying only on the advertisement." },
          { n: "02", h: "Verify who you are dealing with", t: "Make sure the people and companies involved in the transaction can be independently verified.", items: ["Broker name and registration", "Brokerage company", "Developer, where applicable", "Project registration, where applicable", "Who is authorised to receive payments"] },
          { n: "03", h: "Check that the paperwork matches the property", t: "Small differences matter when you are buying a specific unit, so make sure the documents match what you were shown and agreed to.", items: ["Unit number", "Building or project", "Floor", "Internal area", "Balcony or external area", "Layout", "Parking allocation", "Purchase price", "Payment schedule", "Completion or handover date, where applicable", "Included fixtures or specifications, where relevant"] },
          { n: "04", h: "Verify the project details", t: "Confirm that the project is properly registered and that the information provided matches its current status.", items: ["Developer", "Project registration", "Current construction status", "Expected handover date", "Unit details", "Payment arrangements", "Payment schedule"] },
          { n: "05", h: "Assess the developer’s track record", t: "Brand recognition can be useful context, but past delivery gives a clearer picture of what a developer has actually completed.", rv: "Consider", items: ["Previously completed projects", "Delivery history", "Quality of completed buildings", "Management of completed communities", "Performance of comparable completed projects"], q: "What does the developer’s delivery history tell me about this project?" },
          { n: "06", h: "Review the payment plan", t: "The payment plan affects when your capital is committed, how much flexibility you retain and what obligations remain through to handover.", rv: "Map the full payment journey", items: ["Reservation", "Contract", "Construction payments", "Handover payment", "Post-handover payments, if applicable"], sub: "Understand how much is due at each stage and whether you can meet each payment on time, including any balance after handover." } ] } },

    { id: "s4-2-cost", section: "s4", tpl: "checklist", bg: "img/page 28.png", num: "4.2", title: "Know the full cost before you buy",
      lede: "The asking price is only the starting point.",
      body: "Understand what you will need to buy, what it may cost to own and how realistic the expected rental income is.",
      formula: ["Annual rent", "−", "Ownership and letting costs", "=", "Income before financing"],
      steps: [
        { n: "01", h: "When you buy", t: "Work out how much cash you need and when each payment is due.", rv: "Towards the purchase price", items: ["Deposit and remaining balance", "For off-plan: instalments, handover payment and any post-handover balance"], sub: "Additional costs, where applicable: registration and transaction fees; brokerage and conveyancing fees; mortgage setup and valuation; currency conversion and transfers; initial repairs, furnishing or fit-out. If using a mortgage, confirm how much the lender will fund and what you must cover yourself." },
        { n: "02", h: "While you own", t: "Properties with similar purchase prices can have very different running costs.", rv: "Allow for", items: ["Service charges", "Maintenance and replacements", "Insurance, where applicable", "Mortgage repayments, if financed", "Management and letting fees, if rented"], sub: "If renting, allow for periods without rental income. Use previous years’ costs where available to build a realistic annual budget." },
        { n: "03", h: "If you rent it out", t: "Check whether the expected rent is supported by comparable properties and recent signed leases.", rv: "Compare", items: ["Location and building or community", "Property type, bedrooms and size", "Condition and furnishing", "View, where relevant"], sub: "Look beyond the headline rent to what may remain after ownership and letting costs. If financed, also deduct mortgage payments to understand your cash flow." } ] },

    // { id: "s4-3-fit", section: "s4", tpl: "checklist", bg: "dubai-canal", num: "4.3", title: "Check whether the property fits your investment goal", perPage: 4,   // all four checks on one slide (one row); omit for the 3-per-page pager
    //   lede: "Look at the property through your investor profile",
    //   body: "After checking the property and the numbers, your next question should be whether this particular opportunity fits what you are trying to achieve. The priorities below change according to your investor profile.",
    //   chooser: { label: "Investor profile", key: "profile", options: [["income", "Income Builder"], ["growth", "Growth Investor"]] },
    //   variants: {
    //     income: [
    //       { n: "01", h: "Is the expected rent realistic?", t: "Look at recent rents achieved for comparable properties rather than relying only on advertised rents.", items: ["The same building or community, where possible", "The same property type and bedroom count", "A similar condition and level of furnishing", "Floor, view or position, where relevant", "Current availability"] },
    //       { n: "02", h: "What will you earn after costs?", t: "Gross yield only tells part of the story. Allow for the ongoing costs of owning and letting the property.", items: ["Service charges", "Property management", "Maintenance", "Financing costs, where applicable", "Other recurring expenses"] },
    //       { n: "03", h: "How strong is tenant demand?", t: "Reliable income depends on being able to attract and replace tenants without long gaps.", items: ["Who typically rents in the area", "How many similar properties are available", "How long comparable homes take to let", "Whether demand changes at different times of year", "Which features tenants are willing to pay more for"] },
    //       { n: "04", h: "How well does the income hold up?", t: "Test the investment using slightly less favourable assumptions.", items: ["Rent 5–10% lower", "A longer vacancy period", "Higher maintenance or service charges", "Higher financing costs", "Ready exit if plans change"], focus: ["Achievable rent", "Net income", "Tenant demand", "Vacancy risk"] } ],
    //     growth: [
    //       { n: "01", h: "Are you buying at a sensible price?", t: "Compare the property with other options before deciding what represents good value.", items: ["Recent sale prices for comparable properties", "Similar units in the same development or community", "Comparable properties in competing developments", "Price per square foot, where useful", "Ready and off-plan alternatives"] },
    //       { n: "02", h: "What could support future demand?", t: "Look beyond the property itself and consider what could make the wider area more attractive over time.", items: ["New infrastructure", "Transport and connectivity", "Access to employment centres", "Population growth", "Schools and amenities", "New commercial districts", "Development of the wider community"] },
    //       { n: "03", h: "How much competing supply is coming?", t: "New development can strengthen an area, but it can also give future buyers more choice.", items: ["New projects nearby", "Similar property types and sizes", "Expected handover dates", "Developer incentives for buyers", "Scale of the development pipeline"] },
    //       { n: "04", h: "Who might buy it from you later?", t: "Think about the future buyer before you buy.", items: ["End users", "Families", "Investors", "Residents considering ownership", "Recent resale demand"], focus: ["Entry price", "Future demand", "Future supply", "Resale demand"] } ] } },

    /* 04 close — strategy consultation. The button has no target yet: add `href` or `jump` when the booking form exists. */
    { id: "s4-strategy", section: "s4", tpl: "opener", bg: "img/page 28.png", simple: true,
      title: "Your goals and the market conditions shape your strategy",
      paras: [
        "Market conditions can change how you buy, how long you hold a property and when it makes sense to sell. We’ll help you plan each decision around the current market and what you want your investment to achieve.",
        "What we’ll plan with you: how to buy, how long to hold, and when and how to sell.",
        "Or keep reading. The communities that follow offer a starting point for that conversation." ],
      cta: { label: "Book a strategy consultation", hook:{url: 'https://engageteam.app.n8n.cloud/webhook/815ef7b9-118e-44df-9bf4-00088615cb3a', then:{jump:'s5-open'} } },
    },
    /* ───────────────────────── 05  COMMUNITIES ─────────────────────────
       Community profiles, pin positions and the archetype highlight grid
       live in communities.js — NOT here. These two slides only carry their
       chrome (titles, backgrounds, map artwork). */
    { id: "s5-open", section: "s5", tpl: "map", bg: "dubai-aerial-sun", bgs: { dubai: "img/page 31.png", abudhabi: "img/page 31 AD.png" }, cornerBgs: { dubai: "img/cornerDu.png", abudhabi: "img/cornerAD.png" }, num: "05",
      title: "The communities worth considering", sub: "Recommended communities",
      marketLabels: { dubai: "Dubai", abudhabi: "Abu Dhabi" },
      filters: ["Featured for you", "All communities"], allId: "s5-list" },

    { id: "s5-list", section: "s5", tpl: "communities",
      nums: { dubai: "5.1", abudhabi: "5.2" }, titles: { dubai: "Dubai communities", abudhabi: "Abu Dhabi communities" },
      /* Map artwork. A bare name looks in /img for .webp, then .png, then .jpg;
         a path with a slash or extension is used as-is — e.g. the reference's
         "assets/slide-42-map.png" copied into this folder. Pin positions
         (`map` in communities.js) are fractions of this image. */
      maps: { dubai: "img/slide-42-map.png", abudhabi: "img/abudhabi-map.png" } },

    /* ───────────────────────── 06  AFTER YOU CHOOSE ───────────────────────── */
    /* 06 opener — one photo (img/after-choice.webp: the build site on the left, the finished living room on the
       right) with two glass diamonds. Clicking one sets `ptype` and moves on. */
    { id: "s6-open", section: "s6", tpl: "split", bg: "after-choice", num: "06", title: "What happens after you choose a property",
      left:  { key: "offplan", h: "Off-plan property", t: "A property you buy before construction is complete." },
      right: { key: "ready",   h: "Ready property",    t: "A completed property you can buy and take ownership of now." },
      chooserKey: "ptype" },

    { id: "s6-1-ready", section: "s6", tpl: "process", bg: "img/page 34.png", num: "6.1", title: "Buying a ready property in Dubai",
      body: "Once you are happy with the property and ready to proceed, the purchase moves through four main stages. For a straightforward purchase, allow around 2–4 weeks from an accepted offer to ownership. A mortgage, an existing mortgage on the property or missing paperwork can make the process longer.",
      steps: [
        { n: "01", h: "Agree on the purchase", time: "1–3 days",
          paras: ["You make your offer and agree on the price, completion date and main terms with the seller. The agreement is then put in writing.", "In Dubai, this agreement is known as Form F, the contract that records the agreed sale between you and the seller."],
          cols: [ { h: "What to have in place:", items: ["Passport or Emirates ID", "Deposit funds", "Agreed purchase price", "Preferred completion timeframe", "Mortgage pre-approval, if you are borrowing"] }, { h: "If you need a mortgage:", items: ["Have your mortgage pre-approval before you commit. Your bank will still need to value the property and give its final approval before transfer."] } ],
          end: "At the end of this step: the deal is agreed and the sale contract is signed." },
        { n: "02", h: "Get ready for transfer", time: "around 1–3 weeks", wide: true,
          paras: ["This is where most of the administration takes place. The property needs to be cleared for sale, your funds need to be in place and, if you are financing the purchase, the bank needs to complete its checks."],
          cols: [ { h: "What to have in place:", items: ["Signed Form F", "Passport or Emirates ID", "Remaining purchase funds", "Money for purchase and registration costs", "Mortgage documents, if applicable", "Power of attorney, if someone is legally representing you"] },
                  { h: "During this stage:", items: ["The required developer No Objection Certificate (NOC) is obtained", "Outstanding amounts that could prevent the transfer are dealt with", "Your bank values the property if you are using a mortgage", "Final mortgage approval and bank documents are completed", "If the seller has a mortgage, its settlement and release are arranged", "The transfer is booked once the property, paperwork and funds are ready"] },
                  { h: "Buying from abroad?", items: ["Confirm the process early. Depending on the transaction, you may be able to complete it remotely or appoint someone to act on your behalf under a valid power of attorney."] } ],
          end: "At the end of this step: the property, paperwork, financing and money are ready for completion." },
        { n: "03", h: "Become the owner", time: "Transfer day", wide: true,
          paras: ["DLD registration · around 30 minutes once everything is ready. This is the completion stage. The remaining purchase balance and applicable fees are settled, and the sale is formally registered."],
          cols: [ { h: "What to have in place:", items: ["Passport or Emirates ID", "Developer e-NOC", "Funds for the remaining purchase balance", "Funds for DLD and other applicable transaction fees", "Bank documents, if you have a mortgage", "Valid power of attorney, if someone is acting on your behalf"] },
                  { h: "What happens:", items: ["Final documents are checked", "The remaining balance and applicable fees are settled", "The sale is registered", "Ownership is transferred into your name", "Your electronic title deed is issued"] },
                  { h: "If you have a mortgage:", items: ["Your bank is part of the completion process, so its documents and funds need to be ready before the transfer can take place."] } ],
          end: "At the end of this step: the property is officially yours." },
        { n: "04", h: "Start earning rental income", time: "After transfer", wide: true,
          paras: ["Can begin once ownership transfers. If you bought the property to rent out, the next step is making sure everything is in place for a tenant."],
          cols: [ { h: "If the property is vacant, have ready:", items: ["Budget for any maintenance or furnishing", "Target asking rent", "Keys and access", "Bank details for rental payments", "A decision on whether to manage the property yourself or use a property manager"] },
                  { h: "If the property is already rented, have ready:", items: ["Existing tenancy agreement", "Current rent and payment schedule", "Security deposit details", "Tenancy expiry date", "Existing property management arrangements, if any"] },
                  { h: "What happens next:", items: ["A vacant property is prepared, priced and marketed", "A new tenancy is registered through Ejari, Dubai’s tenancy registration system", "If the property is already occupied, the existing tenancy continues as part of your ownership", "If needed, property management can take care of rent collection, maintenance and renewals"] } ],
          end: "At the end of this step: everything is in place for the property to generate rental income." } ] },

    { id: "s6-2-offplan", section: "s6", tpl: "process", bg: "img/page 34.png", num: "6.2", title: "Buying an off-plan property in Dubai",
      body: "Once you have chosen the project and unit, the first part of the purchase can move quickly. But unlike a ready property, you are buying before construction is complete, so payments continue over the agreed schedule and ownership comes at handover.",
      steps: [
        { n: "01", h: "Reserve the property", time: "1–3 days", wide: true,
          paras: ["Once you are happy with the unit, you complete the developer’s reservation or booking process and pay the required booking amount to secure it."],
          cols: [ { h: "Have ready:", items: ["Passport or Emirates ID", "Chosen project and unit", "Booking amount", "Full purchase price", "Payment plan", "Expected completion date", "Reservation terms"] },
                  { h: "Before you pay, check:", items: ["What the booking amount secures", "Whether it forms part of the purchase price", "Whether and when it is refundable", "When the next payment is due", "What you need to do to proceed to contract"] },
                  { h: "Buying from abroad?", items: ["Reservation can often be handled remotely, subject to the developer’s process. Make sure you understand how payments will be made before reserving."] } ],
          end: "At the end of this step: the unit is reserved and you know what you need to pay next." },
        { n: "02", h: "Sign and register the purchase", time: "1–3 weeks", wide: true,
          paras: ["Allow for developer paperwork and DLD registration. You receive the Sale and Purchase Agreement (SPA), the main contract between you and the developer. It sets out what you are buying, what you will pay, when payments are due and the terms around construction, completion and handover."],
          cols: [ { h: "Have ready:", items: ["Passport or Emirates ID", "Signed reservation documents", "SPA", "Registration fees", "Any additional documents requested by the developer", "Funds for the next payment when due"] },
                  { h: "Before you sign, check:", items: ["Property and unit details", "Total purchase price", "Full payment schedule", "Expected completion date", "Delay provisions", "Handover requirements", "Your obligations if a payment is late", "Developer’s obligations under the contract"] },
                  { h: "Registration:", items: ["The developer then registers the off-plan sale in Dubai’s provisional property register through Oqood. DLD requires off-plan sales to be registered, and the purchaser receives the provisional registration output electronically."] } ],
          end: "At the end of this step: you have signed the purchase contract and your interest in the off-plan property is registered." },
        { n: "03", h: "Follow the payment plan", time: "Throughout construction", wide: true,
          paras: ["This is the longest part of an off-plan purchase. Rather than paying the full price at once, you make instalments according to the schedule in your SPA. Depending on the project, payments may run throughout construction and sometimes beyond handover."],
          cols: [ { h: "Have ready:", items: ["Full payment schedule", "Calendar of payment dates", "Funds for each instalment", "Receipts and payment records", "Currency plan if your money is held outside the UAE", "Buffer for later payments and handover costs"] },
                  { h: "What happens:", items: ["You make each payment when it becomes due", "The developer continues construction", "You receive project or construction updates", "You keep records of every payment", "You prepare in advance for the amount due at handover", "Dubai requires registered off-plan projects to have a dedicated project escrow account. Payments made by off-plan purchasers are deposited into the project’s escrow structure rather than simply forming part of the developer’s general funds."] },
                  { h: "Buying from abroad?", items: ["Think about currency as part of your investment cost. If your payment plan runs for several years, changes in the exchange rate can change what each instalment costs you in your home currency."] } ],
          end: "At the end of this step: you have kept up with the agreed payments while the property is being built." },
        { n: "04", h: "Inspect at handover", time: "1 day", wide: true,
          paras: ["When construction is complete, you inspect the actual property before taking possession. This is your opportunity to check that what has been delivered is in the condition expected and identify defects or unfinished items that need attention."],
          cols: [ { h: "Have ready:", items: ["Handover notice", "SPA and property details", "Record of payments", "Remaining amount due", "Inspection or snagging checklist", "Professional inspector, if you choose to use one", "Funds for any remaining handover costs"] },
                  { h: "Check:", items: ["Finishes and fittings", "Doors and windows", "Plumbing and drainage", "Electrical fittings", "Air conditioning", "Appliances included in the purchase", "Any visible defects or unfinished work"] },
                  { h: "Buying from abroad?", items: ["You can travel for the inspection or arrange for a suitably qualified professional or authorised representative to inspect the property on your behalf."] } ],
          end: "At the end of this step: you know what has been delivered and what, if anything, needs to be addressed before you take possession." },
        { n: "05", h: "Complete and take ownership", time: "At handover", wide: true,
          paras: ["Once the property is ready and you have completed the payments and requirements due at handover, the purchase moves from an off-plan interest to ownership of a completed property."],
          cols: [ { h: "Have ready:", items: ["Remaining payment due", "Identification", "Required developer documentation", "Registration and handover fees", "Mortgage approval and documents, if you are financing an eligible balance at completion", "Power of attorney if someone is legally representing you"] },
                  { h: "What happens:", items: ["Remaining contractual payments are settled", "Required completion and registration formalities are completed", "You receive the keys", "The completed property is registered in your ownership", "Your ownership documentation is issued"] },
                  { h: "If you need a mortgage:", items: ["Do not assume you will automatically be able to finance the final payment. Check mortgage eligibility, property eligibility and lender requirements well before handover."] } ],
          end: "At the end of this step: the property is completed and you are the owner." },
        { n: "06", h: "Start generating income from the property", time: "After handover", wide: true,
          paras: ["Can begin after handover and when the property is ready to let. If you bought for rental income, the final job is preparing the completed property for its first tenant."],
          cols: [ { h: "Have ready:", items: ["Keys and access", "Snagging follow-up, if required", "Furnishing budget, if applicable", "Target asking rent", "Photography and marketing", "Bank details for rental income", "Property management decision"] },
                  { h: "What happens next:", items: ["Any outstanding snagging is followed up", "The property is furnished or prepared if required", "An asking rent is set", "The property is marketed", "A tenant is selected", "The new tenancy is registered through Ejari", "Ongoing management can handle rent, maintenance and renewals"] } ],
          end: "At the end of this step: the off-plan purchase becomes a completed, income-producing property." } ] },

    { id: "s6-3-ready-auh", section: "s6", tpl: "process", bg: "img/page 20 AD.png", num: "6.3", title: "Buying a ready property in Abu Dhabi",
      body: "Once you are happy with the property and ready to proceed, the purchase moves through four main stages. For a straightforward purchase, allow around 2–4 weeks from an accepted offer to ownership. A mortgage, an existing mortgage on the property or missing paperwork can make the process longer.",
      steps: [
        { n: "01", h: "Agree to the purchase terms", time: "1–3 days",
          paras: ["You make your offer and agree on the price, completion timeframe and main terms with the seller. The agreement is then put in writing."],
          cols: [ { h: "Have ready:", items: ["Passport or Emirates ID", "Deposit funds", "Agreed purchase price", "Preferred completion timeframe", "Mortgage pre-approval, if you are borrowing"] }, { h: "If you need a mortgage:", items: ["Have your mortgage pre-approval before you commit. Your lender will still need to value the property, approve it and complete the mortgage requirements before ownership can transfer."] } ],
          end: "At the end of this step: the deal is agreed and the sale documentation is in place." },
        { n: "02", h: "Get ready for transfer", time: "1–3 weeks", wide: true,
          paras: ["This is where most of the administrative steps happen. The property needs to be ready for sale, your money needs to be available and, if you are borrowing, the bank needs to complete its paperwork."],
          cols: [ { h: "Have ready:", items: ["Signed sale documentation", "Passport or Emirates ID", "Remaining purchase funds", "Money for registration and other applicable purchase costs", "Mortgage documents, if applicable", "Power of attorney, if someone is legally representing you"] },
                  { h: "During this stage:", items: ["The property’s ownership and registration details are checked", "Required property or community clearances are completed", "Outstanding amounts that could prevent the transfer are dealt with", "Your bank values the property if you are using a mortgage", "Final mortgage approval and documentation are completed", "If the seller has an existing mortgage, its settlement and release are coordinated", "The transfer is arranged once the property, paperwork and funds are ready"] },
                  { h: "Buying from abroad?", items: ["Tell your agent or conveyancer at the beginning. Establish which parts can be completed remotely and whether you will need an authorised representative or power of attorney."] } ],
          end: "At the end of this step: the property, paperwork, financing and money are ready for completion." },
        { n: "03", h: "Become the owner", time: "1 day once everything is ready", wide: true,
          paras: ["This is completion. The remaining purchase amount and applicable fees are settled and the transaction is formally registered. In Abu Dhabi, ownership changes through registration. Signing the sale agreement alone does not transfer the property into your name."],
          cols: [ { h: "Have ready:", items: ["Passport or Emirates ID", "Required property and transfer documents", "Remaining purchase funds", "Money for applicable registration and transaction fees", "Bank documentation if you have a mortgage", "Valid power of attorney if someone is acting for you"] },
                  { h: "What happens:", items: ["Final documents are checked", "Purchase funds and applicable fees are settled", "The sale is registered", "Ownership transfers into your name", "Your ownership documentation is issued"] },
                  { h: "If you have a mortgage:", items: ["Your lender forms part of the completion process, so its documentation and funds need to be ready before the transfer can take place."] } ],
          end: "At the end of this step: you own the property." },
        { n: "04", h: "Get the property earning", time: "After transfer", wide: true,
          paras: ["Can begin after ownership transfers. If you bought for rental income, the final job is getting the property ready for a tenant."],
          cols: [ { h: "If the property is vacant, have ready:", items: ["Any maintenance or furnishing budget", "Target asking rent", "Keys and access", "Bank details for rental income", "Decision on whether you will manage it yourself or appoint a property manager"] },
                  { h: "If the property is already rented, have ready:", items: ["Existing tenancy agreement", "Current rent and payment schedule", "Security-deposit details", "Tenancy expiry date", "Existing property-management arrangements, if any"] },
                  { h: "What happens next:", items: ["A vacant property is prepared, priced and marketed", "The new tenancy is completed and registered through the applicable Abu Dhabi system", "If the property is already occupied, the existing tenancy forms part of your ongoing ownership", "Property management can handle rent collection, maintenance and renewals if required"] } ],
          end: "At the end of this step: the purchase becomes an income-producing property." } ] },

    { id: "s6-4-offplan-auh", section: "s6", tpl: "process", bg: "img/page 7 AD.png", num: "6.4", title: "Buying an off-plan property in Abu Dhabi",
      body: "Once you have chosen the project and unit, you can move relatively quickly to securing the property. But because you are buying before construction is complete, payments continue according to the agreed schedule and ownership comes later, after completion and handover.",
      steps: [
        { n: "01", h: "Reserve the property", time: "1–3 days", wide: true,
          paras: ["Once you are happy with the unit, you complete the developer’s reservation or booking process and pay the required booking amount."],
          cols: [ { h: "Have ready:", items: ["Passport or Emirates ID", "Chosen project and unit", "Booking amount", "Full purchase price", "Payment plan", "Expected completion date", "Reservation terms"] },
                  { h: "Before you pay, check:", items: ["What the booking amount secures", "Whether it forms part of the purchase price", "Whether and when it is refundable", "When the next payment is due", "What you need to do next to proceed with the purchase"] },
                  { h: "Buying from abroad?", items: ["The reservation may be handled remotely depending on the developer. Establish how the documents will be signed and how you will make the required payments before reserving."] } ],
          end: "At the end of this step: the unit is reserved and you know what you need to pay next." },
        { n: "02", h: "Sign and register the purchase", time: "1–3 weeks", wide: true,
          paras: ["You sign the Sale and Purchase Agreement (SPA), the main contract between you and the developer. It records the property you are buying, the total price, payment schedule, expected completion and the obligations of both you and the developer."],
          cols: [ { h: "Have ready:", items: ["Passport or Emirates ID", "Reservation documents", "SPA", "Required registration payment", "Any additional documents requested by the developer", "Funds for the next payment when due"] },
                  { h: "Before you sign, check:", items: ["Property and unit details", "Total purchase price", "Full payment schedule", "Expected completion date", "Delay provisions", "Handover requirements", "What happens if a payment is late", "The developer’s obligations"] },
                  { h: "Registration:", items: ["The off-plan purchase is registered within Abu Dhabi’s regulated property system. ADREC states that off-plan sales are registered through the SPA."] } ],
          end: "At the end of this step: your purchase contract is signed and your interest in the property is registered." },
        { n: "03", h: "Follow the payment plan", time: "Throughout construction", wide: true,
          paras: ["This is the longest part of an off-plan purchase. Instead of paying the full price at once, you make instalments according to the schedule in your SPA while the property is being built."],
          cols: [ { h: "Have ready:", items: ["Full payment schedule", "Calendar of payment dates", "Funds for each instalment", "Payment receipts and records", "Currency plan if your money is held outside the UAE", "Buffer for the final payment and handover costs"] },
                  { h: "What happens:", items: ["You make each instalment when it becomes due", "Construction continues", "You monitor project progress", "You keep a record of each payment", "You prepare for the amount required at completion and handover", "Buyer payments for registered Abu Dhabi off-plan projects go into the project’s ADREC-approved escrow account."] },
                  { h: "Buying from abroad?", items: ["If the payment plan runs for several years, consider currency movements as part of your investment cost. The price in dirhams may not change, but what each instalment costs in your home currency can."] } ],
          end: "At the end of this step: you have kept up with the agreed payments while the property is being built." },
        { n: "04", h: "Inspect at handover", time: "1 day", wide: true,
          paras: ["Once the property is completed and ready for handover, inspect what has actually been delivered before taking possession."],
          cols: [ { h: "Have ready:", items: ["Handover notice", "SPA and property details", "Record of payments", "Remaining amount due", "Inspection or snagging checklist", "Professional inspector, if you choose to use one", "Funds for remaining handover costs"] },
                  { h: "Check:", items: ["Finishes and fittings", "Doors and windows", "Plumbing and drainage", "Electrical fittings", "Air conditioning", "Appliances included in the purchase", "Visible defects or unfinished work"] },
                  { h: "Buying from abroad?", items: ["You can travel for handover or appoint someone suitably qualified to inspect the property on your behalf."] } ],
          end: "At the end of this step: you know what has been delivered and what, if anything, needs attention." },
        { n: "05", h: "Complete and take ownership", time: "Several days to a few weeks", wide: true,
          paras: ["Once the project is complete and you have met your obligations under the SPA, the purchase moves from an off-plan interest towards registered ownership of the completed property. In plain English: the property you bought before construction is now a completed property registered in your name."],
          cols: [ { h: "Have ready:", items: ["Remaining payment due", "Passport or Emirates ID", "Required developer documentation", "Applicable registration and handover costs", "Mortgage documents, if you are financing an eligible amount at completion", "Power of attorney if someone is legally representing you"] },
                  { h: "What happens:", items: ["Remaining contractual payments are settled", "Completion and registration requirements are met", "The completed property is registered in your name", "You receive the property and keys", "Your ownership documentation is issued"] },
                  { h: "If you need a mortgage:", items: ["Do not wait until handover to find out whether you can finance the remaining amount. Check your eligibility, the property’s eligibility and lender requirements well before completion."] } ],
          end: "At the end of this step: you own the completed property." },
        { n: "06", h: "Get the property earning", time: "After handover", wide: true,
          paras: ["If you bought for rental income, the property now moves from construction into operation."],
          cols: [ { h: "Have ready:", items: ["Keys and access", "Snagging follow-up, if required", "Furnishing or preparation budget", "Target asking rent", "Photography and marketing", "Bank details for rental income", "Property-management decision"] },
                  { h: "What happens next:", items: ["Outstanding snagging is followed up", "The property is prepared or furnished if required", "An asking rent is set", "The property is marketed", "A tenant is selected", "The tenancy is registered through the applicable Abu Dhabi system", "Property management can handle rent collection, maintenance and renewals"] } ],
          end: "At the end of this step: the off-plan purchase becomes a completed, income-producing property." } ] },

    /* ───────────────────────── 07  SUPPORT ───────────────────────── */
    { id: "s7-open", section: "s7", tpl: "opener", bg: "img/page 38.png", num: "07", simple: true, inkTitle: true,
      title: "The support you may need along the way",
      paras: ["Buying a property involves more than choosing the right home. There is funding to arrange, a transfer to complete and, once you own it, decisions about letting, management and maintenance.",
        "This section shows where support may be useful before you buy, while you own and when you decide to sell. You can choose what you want to handle yourself and where you would prefer expert help."],
      cta: { label: "Explore the support available", jump: "s7-1-support" } },

    /* 7.1 — six support areas on the stage line, from first shortlist to a future sale. */
    { id: "s7-1-support", section: "s7", tpl: "process", bg: "img/page 38.png", num: "7.1", title: "Where specialist support can help",
      body: "From your first shortlist to a future sale, these are the areas where the right support can make the process easier.",
      steps: [
        { n: "01", h: "Does the property fit your plans?",
          paras: ["A property needs to work for your goals and your budget. Your consultant can help you narrow the search, compare recent sales and achieved rents, and review available information on service charges and ownership costs."],
          cols: [ { h: "who can help to contact a specialist:", items: ["[betterhomes](https://www.bhomes.com/en/contact) · Property consultants"] } ],
          end: "" },
        { n: "02", h: "Is your funding ready?",
          paras: ["Knowing what you can borrow, what it will cost and when the funds will be available helps you plan before committing to a purchase.", "Lomond can help you compare mortgage options, understand repayments and fees, and manage the application with the lender. If you are transferring money from overseas, GC Partners can help you plan the currency exchange and transfer around your payment dates."],
          cols: [ { h: "who can help to contact a specialist:", items: ["[Lomond](https://www.lomondfs.ae/) · Mortgages", "[GC Partners](https://www.gcpartners.co/) · Currency transfers"] } ],
          end: "" },
        { n: "03", h: "Who will manage the transfer?",
          paras: ["Documents, clearances, payments and deadlines all need to come together before ownership can transfer.", "Clarity can help coordinate the paperwork and transfer process, keeping you clear on what is needed and when. For buyers completing remotely, support may also include power of attorney representation and escrow services for non-residents without a UAE bank account, where applicable."],
          cols: [ { h: "who can help to contact a specialist:", items: ["[Clarity](https://www.clarity.ae/) · Conveyancing"] } ],
          end: "" },
        { n: "04", h: "Who will look after the tenancy?",
          paras: ["Finding a tenant is only the beginning. Move-in, maintenance, tenant queries, renewals and move-out all need managing.", "betterhomes can help find a tenant, while the property management team can take care of the ongoing work according to your chosen package. Agree from the start what will be managed for you and which decisions will need your approval."],
          cols: [ { h: "who can help to contact a specialist:", items: ["[betterhomes](https://www.bhomes.com/en/property-management) · Letting and property management"] } ],
          end: "" },
        { n: "05", h: "Who will handle maintenance and repairs?",
          paras: ["Regular maintenance helps protect the condition of the property, while unexpected issues need a quick response.", "Octopus offers annual maintenance packages covering scheduled air-conditioning servicing, electrical and plumbing checks, as well as emergency and non-emergency call-outs. Customers with an active annual contract also have access to a 24/7 emergency line. Check what labour, repairs and parts are included in your package."],
          cols: [ { h: "who can help to contact a specialist:", items: ["[Octopus](https://octopus.ae/) · Subject to service coverage for your property"] } ],
          end: "" },
        { n: "06", h: "When you sell, who will guide you?",
          paras: ["When the time comes to sell, your consultant can help you review recent sales, position the property, manage enquiries and negotiate offers.", "Looking at the timing, terms and selling costs together can help you understand what an offer really means for you."],
          cols: [ { h: "who can help to contact a specialist:", items: ["[betterhomes](https://www.bhomes.com/en/contact) · Sales consultants"] }, { h: "Support when you need it", items: ["Through betterhomes, its group businesses and specialist partners, you can access support at each stage of ownership. Use the services that are useful to you, while continuing to work with your own advisers where you prefer."] } ],
          end: "" } ] },

    /* ───────────────────────── 08  FROM ABROAD ───────────────────────── */
    { id: "s8-open", section: "s8", tpl: "abroad", bg: "img/page 39.png", num: "08", title: "What to consider before investing from abroad",
      regions: [
        { key: "mena", label: "Middle East & UAE", countries: [
          { name: "Living in the UAE", items: [
            ["Moving your money", "Funding from a UAE salary is simple. Savings still held at home follow that country’s transfer rules."],
            ["Your currency", "Earning in dirhams removes currency risk while you live here. It returns if you move home."],
            ["Tax on rental income", "No UAE personal tax. Check whether your home country still treats you as tax resident."],
            ["Tax when you sell", "Some countries tax gains when you leave, or for years after. Check before you buy."],
            ["Reporting", "UAE banks share account information with your home country. US citizens report wherever they live."],
            ["Your will", "As a resident, UAE default inheritance rules apply to you. Register a will in the DIFC or Abu Dhabi."] ] },
          { name: "Saudi Arabia", items: [
            ["Moving your money", "No limits on sending money abroad. Your bank will ask for proof of funds."],
            ["Your currency", "No currency risk. The riyal and the dirham are both pegged to the US dollar."],
            ["Tax on rental income", "Saudi Arabia does not tax individuals on rental income."],
            ["Tax when you sell", "No personal tax on the gain at home."],
            ["Reporting", "UAE banks share account information with Saudi Arabia under the Common Reporting Standard."],
            ["Your will", "Sharia inheritance applies by default. Plan with a UAE succession adviser."] ] },
          { name: "Egypt", items: [
            ["Moving your money", "Banks may limit foreign-currency transfers. Ask your bank early."],
            ["Your currency", "The pound has moved sharply against the dirham since 2024."],
            ["Tax on rental income", "Residents whose business base is in Egypt are taxed on foreign income."],
            ["Tax when you sell", "A future sale may fall under Egyptian tax rules."],
            ["Reporting", "Declare overseas income in your Egyptian tax return."],
            ["Your will", "Egyptian inheritance law applies by default. Align your wills."] ] },
           ] },
        { key: "europe", label: "Europe", countries: [
          { name: "UK", items: [
            ["Moving your money", "No limits on sending money abroad. Your bank will ask for proof of funds and the sale agreement."],
            ["Your currency", "Pounds move against the dirham, which is pegged to the US dollar. That changes your cost to buy and the rent you bring home."],
            ["Tax on rental income", "If you are UK resident, overseas rent goes on your Self Assessment return."],
            ["Tax when you sell", "A future sale may fall under UK capital gains rules."],
            ["Reporting", "Keep every record in pounds and dirhams from day one. It makes Self Assessment simpler."],
            ["Your will", "UK inheritance tax can reach worldwide assets. Align your English will with a UAE-registered will."] ] },
          { name: "Germany", items: [
            ["Moving your money", "No limits. Payments abroad over €12,500 are reported to the Bundesbank."],
            ["Your currency", "Euros move against the dirham, which is pegged to the US dollar."],
            ["Tax on rental income", "German residents are taxed on Dubai rent. Germany and the UAE no longer have a tax treaty."],
            ["Tax when you sell", "A sale may be tax-free after 10 years of ownership."],
            ["Reporting", "Declare Dubai rent in your German tax return."],
            ["Your will", "German inheritance tax can reach worldwide assets, and it can still apply for 5 years after a German citizen moves abroad."] ] },
          { name: "France", items: [
            ["Moving your money", "No limits. Your bank will ask for proof of funds."],
            ["Your currency", "Euros move against the dirham, which is pegged to the US dollar."],
            ["Tax on rental income", "Under the France–UAE treaty, Dubai rent may be taxed in the UAE, but France can still count it when setting your tax rate."],
            ["Tax when you sell", "A future sale may fall under French rules and the treaty."],
            ["Reporting", "Declare UAE bank accounts every year. Dubai property may count towards France’s wealth tax on property above €1.3m."],
            ["Your will", "French rules reserve shares of an estate for children, and they can override a will."] ] } ] },
        { key: "asia", label: "Asia", countries: [
          { name: "India", items: [
            ["Moving your money", "Residents can send up to USD 250,000 a year under the Liberalised Remittance Scheme. Tax is collected at source above a set amount."],
            ["Your currency", "Rupees move against the dirham, which is pegged to the US dollar."],
            ["Tax on rental income", "Indian residents are taxed on worldwide income, including rent from Dubai."],
            ["Tax when you sell", "A future sale may fall under Indian capital gains rules."],
            ["Reporting", "Overseas property must be disclosed in your Indian tax return."],
            ["Your will", "Align your Indian will with a UAE-registered will."] ] },
          { name: "China", items: [
            ["Moving your money", "The personal USD 50,000 yearly allowance can’t be used to buy property abroad. Funds must move through approved routes."],
            ["Your currency", "The yuan moves against the dirham, which is pegged to the US dollar."],
            ["Tax on rental income", "Chinese tax residents are taxed on worldwide income."],
            ["Tax when you sell", "A future sale may fall under Chinese tax rules."],
            ["Reporting", "UAE banks share account information with China under the Common Reporting Standard."],
            ["Your will", "Align your Chinese will with a UAE-registered will."] ] },
          { name: "Pakistan", items: [
            ["Moving your money", "Buying foreign currency is capped at USD 100,000 a year per person. Ask your bank about property payments."],
            ["Your currency", "Rupees move against the dirham, which is pegged to the US dollar."],
            ["Tax on rental income", "Pakistani residents are taxed on worldwide income."],
            ["Tax when you sell", "A future sale may fall under Pakistani tax rules."],
            ["Reporting", "Declare foreign assets in your wealth statement."],
            ["Your will", "Islamic inheritance rules apply to Muslims by default. Align your wills."] ] } ] },
        { key: "americas", label: "Americas & Australia", countries: [
          { name: "US", items: [
            ["Moving your money", "No limits on sending money abroad. Your bank will ask for proof of funds."],
            ["Your currency", "No currency risk. The dirham is pegged to the US dollar."],
            ["Tax on rental income", "US citizens are taxed on worldwide income, wherever they live."],
            ["Tax when you sell", "A future sale falls under US capital gains rules."],
            ["Reporting", "UAE bank accounts over USD 10,000 in total need FBAR reporting. FATCA reporting can also apply."],
            ["Your will", "US estate tax can reach worldwide assets. Align your US will with a UAE-registered will."] ] },
          { name: "Canada", items: [
            ["Moving your money", "No limits on sending money abroad. Your bank will ask for proof of funds."],
            ["Your currency", "Canadian dollars move against the dirham, which is pegged to the US dollar."],
            ["Tax on rental income", "Canadian residents are taxed on worldwide income, including rent from Dubai."],
            ["Tax when you sell", "A future sale may fall under Canadian capital gains rules."],
            ["Reporting", "A rental property abroad costing over CAD 100,000 goes on form T1135. A home kept only for personal use does not."],
            ["Your will", "Align your Canadian will with a UAE-registered will."] ] },
          { name: "Australia", items: [
            ["Moving your money", "No limits. International transfers are reported to AUSTRAC, Australia’s financial intelligence agency."],
            ["Your currency", "Australian dollars move against the dirham, which is pegged to the US dollar."],
            ["Tax on rental income", "Australian residents declare foreign rent in their tax return."],
            ["Tax when you sell", "Capital gains tax applies. Holding the property more than 12 months can halve the taxable gain."],
            ["Reporting", "Declare overseas income and gains each year."],
            ["Your will", "Australia has no inheritance tax. Align your Australian will with a UAE-registered will."] ] } ] } ],
      foot: { q: "Didn’t find your country on the list? The same six checks apply.", t: "Book a consultation and we’ll help you understand what applies to your situation.", label: "Book a consultation", hook:{url: 'https://engageteam.app.n8n.cloud/webhook/815ef7b9-118e-44df-9bf4-00088615cb3a', then: {jump:'s9-open'}},
        small: ["Tax, legal and succession rules depend on your circumstances and can change.", "This information is correct as of October 2026, and specialist advice should be taken before making any decisions."] } },

    /* ───────────────────────── 09  NEXT STEP ───────────────────────── */
    /* 09 opener (the reference's slide 50). The three cards read the visitor's answers from the URL (market, bmin/bmax or budget, goal —
       written by form.html); `marketLabels` and `goalLabels` are the words shown for each answer. Anything missing shows "Not set". */
    { id: "s9-open", section: "s9", tpl: "nextstep", bg: "img/page 41.png", num: "09", title: "Your next step",
      kicker: "From your goals to your next property",
      paras: [
        "You now have a clearer view of the market, what to look for and the questions to ask before you buy. The next step is finding a property that fits what you want from the investment.",
        "Whether you are just starting your search or already considering a specific opportunity, a betterhomes property consultant can help you compare the options, understand the numbers and see which properties best match your plans." ],
      directionTitle: "Your investment direction",
      marketLabels: { dubai: "Dubai", abu_dhabi: "Abu Dhabi", both: "Dubai + Abu Dhabi", undecided: "Still deciding" },
      goalLabels: { rental_income: "Rental income", capital_growth: "Long-term capital growth", uae_residency: "UAE residency", personal_use: "A home for my own use", portfolio_diversification: "Portfolio diversification", exploring: "Still exploring" },
      note: "Based on the preferences you shared when creating your handbook." },

    /* 09 — "Where would you like to begin?" + the closing panels, on one page (the reference's slide 51).
       Five option cards (hover highlights one) and a "Speak to consultant" button; then three panels: betterhomes PRIME, Leading Real
       Estate Companies of the World and "Return to it when you're ready" (pale). A panel with a `logo` shows the logo and keeps its `h`
       as a hidden heading for screen readers. Buttons: `save` copies this personalised link (the URL carries every answer);
       the others have no target yet — add `href` (opens in a new tab) or `jump` (a slide id) when the forms exist. */
    { id: "s9-begin", section: "s9", tpl: "begin", bg: "img/page 41.png", title: "Where would you like to begin?", btn: "Speak to consultant", hook:{url: 'https://engageteam.app.n8n.cloud/webhook/815ef7b9-118e-44df-9bf4-00088615cb3a'},
      cards: [
        { h: "Find properties that fit my goals", t: "Explore ready and off-plan opportunities around your priorities." },
        { h: "Compare my options", t: "Weigh up locations, property types and purchase routes." },
        { h: "Discuss a property I have found", t: "Take a closer look at an opportunity you are considering." },
        { h: "Understand the buying process", t: "Talk through the steps, costs and support involved." },
        { h: "Talk through my investment plan", t: "Discuss what you want to achieve before beginning your search." } ],
      panels: [
        { logo: "prime", h: "A more personal approach with betterhomes PRIME", btn: "Explore Prime", href: 'https://prime.bhomes.com/en',
          t: "For those considering an exceptional home or a prime property investment, our PRIME team can help shape the search around your priorities, with personal attention throughout the purchase." },
        { logo: "leadingre", h: "Looking further afield?", btn: "Explore Leading RE", href: 'https://www.bhomes.com/en/global-affiliations',
          t: "If your property plans extend beyond the UAE, we can introduce you to a local specialist through Leading Real Estate Companies of the World®." },
        { pale: true, h: "Return to it when you’re ready.", btn: "Save my handbook", save: true,
          t: "Keep your personalised handbook to revisit the locations, considerations and opportunities that interest you." } ],
      note: "This handbook provides general information and does not constitute financial, legal or tax advice. Seek independent professional advice where appropriate." }
  ]
};
