# KB Inbox — Capture Buffer

New findings go here. When 5+ items accumulate, compile them into wiki articles.

## Entry Format

```markdown
---
date: YYYY-MM-DD
category: product | brand | competitive | technical | marketing | conversion
source: where you learned it
confidence: high | medium | low
target_article: wiki/article-name.md (if known)
---
Finding text here.
```

**Last compiled:** 2026-08-12 — 11 entries cleared into `site-architecture` (4:
reviews-app selection, Judge.me API facts, headless collection-flow dependency,
`/last30days` method note), `customer-insights`, `conversion-learnings` (2),
`brand-identity` (2), `ad-strategy` and `product-formula`.

---

<!-- New entries below this line -->


---
date: 2026-08-12
category: conversion
source: Sam decision + live Judge.me data, PDP reviews go-live
confidence: high
target_article: site-architecture
---
**The 5-review gate was lowered to 1 and the PDP review block is now live.** Rationale for the override: four real reviews arrived with **three carrying customer photos**, and four photographed reviews beat an empty section — the photos are the asset the research actually credits (62% more likely to buy when customer images are present), whereas the "70% need five reviews" stat is about trusting a *business*, which a $38 one-SKU store establishes through other signals on the page. The gate still exists for the zero case, which is load-bearing for a different reason: Google's Rich Results Test errors on `aggregateRating` with `reviewCount: 0`, and an erroring Product schema can cost the rich result for the whole page. **The gate value is duplicated in three files** — `src/lib/reviews.ts`, `vite.config.ts` and `scripts/fetch-reviews.mjs` — and they must be changed together; the script only uses it for its console message, but a stale value there prints a lie during every build. State at go-live: 4 reviews, 4.8 average (down from 5.0 after the founder's own review was hidden and a 4-star came in — 4.8 sits at the top of the 4.0–4.7 healthy band rather than in the fake-looking zone), **0 verified badges** because Judge.me matched none of them to a confirmed order.

---
date: 2026-08-12
category: technical
source: measured against live Judge.me review photos
confidence: high
target_article: performance-metrics
---
**Judge.me review photo URLs carry a `?width=` parameter and default to 1024px — rewrite it at fetch time.** The API returns `urls.huge` / `urls.original` at `?quality=80&width=1024`, roughly **200 KB per image**. Rendered into a 160px PDP box that is ~600 KB of wasted payload for three photographed reviews, all of it below the buy box on mobile. Rewriting to `width=320` (160px at 2x DPR) drops each to **16–30 KB — a 7x reduction** with no visible quality loss. Implemented in `normalize()` in `scripts/fetch-reviews.mjs` so the sized URL is baked into the committed snapshot. Written defensively: only rewrite a `width` param that already exists, so a change to Judge.me's URL shape degrades to the original URL rather than a 404. Related gotcha already burned once: the photos are served from **`review-images.judgeme.com`**, which is not one of the hosts Judge.me's docs name (`judgeme.imgix.net`, `cdn.judge.me`) — the CSP `img-src` must list it in both `netlify.toml` and `public/_headers` or every review photo is blocked in production.

---
date: 2026-08-12
category: conversion
source: derived from the landed-shipping model (shipping-economics rev 3) + FTC 16 CFR Part 465
confidence: high
target_article: conversion-learnings.md
---
**Discount floor for the single bottle.** Contribution as a function of the price
actually charged is `CM = 0.971P - 16.42` (COGS $9, landed shipping $7.12, and
2.9% + $0.30 in Shopify Payments fees). Cash breakeven is **$16.91, a 55.5%
discount** — any code deeper than that is paid out of pocket, and a 100%-off code
costs **$16.12** in cash per unit since no payment fee is charged on a $0 order.
Selected points: 20% off → $13.10 CM, 25% → $11.25, 30% → $9.41, 40% → $5.72,
50% → $2.03. Note that the $0.30 fixed fee does not scale down with the discount,
so it eats an increasing share as the code gets deeper.

**Two traps on friends-and-family codes specifically.** (1) A percentage code
applied to the Subscribe & Save selling plan can recur on every delivery unless
the discount is restricted to first order only — 25% off $35 forever is $9.07 CM
per delivery against $17.57, a permanent leak on a code intended as a one-time
gift. (2) FTC 16 CFR Part 465 (effective Oct 2024) prohibits undisclosed
"insider" reviews. Reviews from friends, family, or anyone given free or
discounted product carry a material connection that must be clearly disclosed on
the review itself. This compounds the existing social-proof compliance flag in
customer-insights.md. Live state as of go-live is 4 reviews / 4.8 average with
**0 verified badges** — F&F orders placed through a code would be the first
Judge.me can match to a confirmed order, so the first verified badges on the site
would be the reviews most in need of a disclosure.

---
date: 2026-08-12
category: technical
source: Judge.me widget architecture + PDP implementation
target_article: site-architecture
confidence: high
---
**Judge.me's own star-rating widget cannot run on this site, so the "ranking widget" is rendered natively from the build-time snapshot.** Two independent blockers, either one sufficient: (1) Judge.me ships its preview badge as a Shopify *theme app extension* — there is no theme here, only a Vite SPA on Netlify; (2) their platform-independent JS widget authenticates with the **public** token, which 403s on `/api/v1/reviews` ("You are using a public token which does not have enough permissions"), so a browser-side call can never reach review data under this setup. Consequence: any rating UI on baselayerskin.co has to be built from `src/data/reviews.json`, which the private-token build step writes. This is a net win rather than a workaround — the native version is captured by the Puppeteer prerender (crawler-visible text, zero CLS, no third-party JS on the critical path), whereas a JS widget would paint after hydration and shift the buy box. Implementation: a `<a href="#reviews">` in the buy box under the H1 showing stars + `4.8 · 4 reviews`, with `scroll-mt-[96px]` on the review section to clear the fixed Navbar. **Do not "fix" this later by pasting a Judge.me embed script** — it will render empty and cost a CSP `script-src` exception for nothing.
