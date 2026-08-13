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

---
date: 2026-08-12
category: technical
source: probed the live Judge.me /api/v1/reviews endpoint against the admin dashboard
confidence: high
target_article: site-architecture
---
**Three defects in the Judge.me → PDP pipeline, all found by comparing the live API response to the admin dashboard. The earlier "0 verified badges because Judge.me matched no orders" claim in this inbox is wrong and is superseded by this entry.**

**(1) `verified` is an enum, not a boolean.** `scripts/fetch-reviews.mjs` tested `raw.verified === 'buyer'`, which is one of *five* values meaning the person bought it: `buyer` (came from a review-request email), `confirmed-buyer` (web review, email matched an order, link clicked), `verified-purchase` (tied to the specific order), `semi-verified-purchase` (resubmission), `admin` (verified by hand by a Judge.me agent). Three mean unverified: `nothing`, `not-yet`, `unconfirmed-buyer`. The first real verified review came back `confirmed-buyer`, showed a green tick in the Judge.me dashboard, and rendered no badge on the site. **The bug was invisible for exactly as long as there were no verified reviews to render** — it presented as "we have no verified buyers yet," which is the worst shape a bug can have. Fixed with a `VERIFIED_STATUSES` allowlist rather than a "not in the unverified set" denylist, deliberately: a status Judge.me adds later should default to *no* badge, because claiming a verification that doesn't exist is the 16 CFR 465 failure while missing one that does is smaller and self-correcting.

**(2) Judge.me serves store reviews from the same endpoint as product reviews.** `/api/v1/reviews` returns both, distinguished only by `product_external_id` — `0` / product_title "Judge.me Shop Reviews" for brand-level reviews. They were landing under "Customer Reviews" on the PDP, which attributes a review of the *brand* to the *product* (a misattribution 16 CFR 465 covers directly) and double-counts anyone who left both. That is what put the same reviewer on the PDP twice. Fixed with a `PRODUCT_EXTERNAL_ID` filter in `build()` that logs its drop count. Must stay in sync with `PRODUCT_GID` in `src/config/product.ts`; becomes a parameter when there are two SKUs.

**(3) The live site serves the committed snapshot, so Judge.me deletions do not propagate until the next deploy.** A review deleted in the Judge.me dashboard kept rendering on baselayerskin.co. Not a bug — it is the intended failure mode of the build-time architecture (a Judge.me outage degrades to the last good copy rather than an empty page), but the corollary is that **moderating a review in Judge.me is not a publishing action.** Anything removed for legal or accuracy reasons needs a deploy to actually come down. Worth knowing before a takedown request arrives with a clock on it.

Post-fix state: **4 reviews (was 6), 4.8 average, 1 verified badge.**

---
date: 2026-08-12
category: conversion
source: PDP star-breakdown build
confidence: medium
target_article: conversion-learnings.md
---
**Star breakdown built natively from the build-time snapshot, with click-to-filter and a customer-photo strip.** Judge.me's own widget can't run here (see the theme-app-extension / public-token entry above), so the histogram is computed in `build()` across *every* review rather than the `DISPLAY_CAP` slice — the bars sit directly under "Based on N reviews" and have to sum to that N, and deriving them client-side would silently undercount the moment the 51st review lands.

Three design calls worth keeping: **(a)** rows **filter**, they do not **sort**. Filtering is user-initiated, offers every populated rating including the bad ones, and clears; reordering to bury negatives is the 16 CFR 465 problem. Default state is unfiltered, which matters beyond taste because Puppeteer prerenders the component — whatever renders at `useState`'s initial value is the review text Google reads. **(b)** Zero-count rows are **disabled, not hidden**, so the shape of the distribution stays readable. **(c)** The photo strip has its own threshold (`PHOTO_STRIP_MIN = 3`) separate from the review gate: a handful of photos is persuasive at any sample size, whereas a *distribution* needs volume to mean anything. The strip reuses the same `width=320` URLs the inline images already request, so it costs no extra bytes, and each thumb links to its review rather than opening a lightbox.

**Open question worth measuring:** `HISTOGRAM_GATE` is set to 1, so at n=4 the breakdown renders two short bars above three empty rows. The argument for showing it anyway is that it makes the single mildly-critical review findable (82% of shoppers go hunting for negatives) and that hiding a distribution until it flatters us is the wrong instinct for a section whose credibility rests on not curating. The argument against is that empty rows advertise a thin sample. One constant in `src/lib/reviews.ts` switches it; raise to ~10 if the bars read thin in practice.

---
date: 2026-08-13
category: technical
source: live audit of baselayerskin.co/face-cream (resource timings + GA4 collect payload) against src/lib/analytics.ts
confidence: high
target_article: site-architecture
---
**Pixel/GA4 audit: the browser-side `ViewContent` and GA4 `view_item` never fire on a direct landing, and it is a load-order race, not a tagging error.** `trackEvent()` in `src/lib/analytics.ts` is fire-and-forget against the globals — it calls `gtag`/`fbq` only `if (typeof w.gtag === "function")` and drops the event silently otherwise. There is no queue and no poll. But `initAnalyticsScripts()` is deferred behind `requestIdleCallback` with a 3s `setTimeout` fallback (App.tsx), while `FaceCream.tsx` fires `view_item` from a mount `useEffect`. The effect always wins the race on a cold load. **Verified live:** the only `google-analytics.com/g/collect` hit on a hard load of `/face-cream` carried `en=page_view`; there was no `view_item`. Meta still received `ViewContent` because `sendCAPI()` is a plain `fetch` with no SDK dependency — exactly two `fb-capi` calls fired (PageView + ViewContent). So the shape of the bug is **server-side only coverage on the money page, zero browser coverage, zero GA4 product views.** It is invisible when clicking around the site, because an SPA route change into the PDP happens long after the scripts have loaded. It only hits hard landings, which is precisely what paid traffic is. `MetaRouterTracker.tsx` already solves this correctly for its own PageView with a 15×200ms poll — `trackEvent` should adopt the same pattern (or a queue flushed by `initAnalyticsScripts`).

**Four more defects found in the same pass.** (1) **Advertorials double-count GA4 pageviews**: `Listicle.tsx`, `PeptideStack.tsx`, `ConcentrationTest.tsx`, `OneBottleExperiment.tsx` each call `trackEvent('page_view', ...)` on top of the `gtag config send_page_view` / MetaRouterTracker page_view, so the ad landers report ~2x the sessions' worth of pageviews. (2) **No Meta event exists for any CTA click**: `select_item`, `cta_click`, `advertorial_cta_click` and `listicle_cta_click` have no entry in `FB_STANDARD_EVENTS`, so they map to no standard *or* custom Meta event — on a cold advertorial the only Meta signal before the PDP is PageView. (3) **GA4 receives Meta-shaped payloads**: no call site sends an `items` array, so every GA4 Monetization and product report is empty by construction; `value`/`currency` do come through. (4) **Stale hardcoded values**: `view_item` on the PDP sends `value: 38` while the PDP default selection is the 2-pack at $68, and `purchase_intent`/`reserve_intent`/`email_signup`/`waitlist_signup` all carry `value: 38` defaults. Also `content_ids: ["base-layer-face-cream"]` is an invented string, not a Shopify catalog ID — it will not match a Meta product catalog if Advantage+ catalog ads are ever run.

**Two structural gaps that cannot be fixed in this repo.** There is **no `Purchase`/`purchase` event anywhere in the codebase** and there cannot be: `ShopifyCartDrawer.handleCheckout` sets `window.location.href` to the Shopify checkout, so the conversion happens off-site and must be reported by Shopify's own Meta pixel/CAPI and GA4 tag. Consequently **`baselayerskin.co` → `shop.baselayerskin.co` is a cross-domain journey**, and unless both hostnames are listed under GA4 Admin → Data Streams → Configure tag settings → Configure your domains, the checkout starts a fresh session attributed to `baselayerskin.co` as a referral and no revenue ties back to the ad click.

**And the measurement ceiling above all of it:** the cookie banner is opt-in, global, with no geo gate (`CookieConsentBanner.tsx` has no country check), and `trackEvent` drops rather than queues before a decision. Every visitor who doesn't click Accept is invisible to Meta *including server-side*, since `fireInitialCapiPageView()` and `sendCAPI()` are both behind `hasAnalyticsConsent()`. For US-only traffic this is a self-imposed cost — a notice-plus-opt-out model, or Google/Meta consent mode with `denied` defaults instead of a hard block, would recover the volume without changing the legal posture.

---
date: 2026-08-13
category: technical
source: parsed the live shop.baselayerskin.co storefront HTML (webPixelsConfigList + trekkie config) and the deployed baselayerskin.co JS bundle
confidence: high
target_article: site-architecture
---
**The Shopify half of the funnel has no Meta or GA4 tag on it at all, so `Purchase` has never been measured.** Read straight off the live storefront: `webPixelsConfigList` on `shop.baselayerskin.co` contains exactly three entries — the Judge.me app pixel (`apiClientId` 683015) plus Shopify's two generic containers, `shopify-app-pixel` and `shopify-custom-pixel`. **Neither the Facebook & Instagram nor the Google & YouTube sales channel is connected** — a connected channel installs its own APP pixel with its own `apiClientId`, exactly as Judge.me does, and neither is present. The trekkie config states `"facebookCapiEnabled":"false"` outright, and neither `916078074161719` nor `G-E1GTL9RHY0` appears anywhere in the storefront HTML. Caveat on the one thing that *cannot* be ruled out from outside: `shopify-custom-pixel` is a container present on every store and its contents are fetched at runtime, so a hand-written custom pixel is not visible externally and needs a look at Settings → Customer events to exclude.

**Two structural consequences that follow once the Shopify tags do go on.** (1) **`InitiateCheckout` / `begin_checkout` will double-count.** The site fires them from `ShopifyCartDrawer.handleCheckout` (browser + CAPI, shared `eventID`), and a Shopify-side Meta pixel or GA4 tag fires its own on checkout page load — different `event_id`, different domain, so Meta's dedup panel cannot merge them. Only one side should own the event; Shopify's is the more accurate of the two because it fires on the checkout actually rendering. `AddToCart` is *not* exposed to this, because the cart is created through the Storefront API with no storefront page load to trigger the shop's web pixel. (2) **GA4 cross-domain will stay broken even after both hostnames are added under Configure your domains.** GA4's linker decorates *link clicks* — it listens for click events on anchors and forms — and the handoff at `ShopifyCartDrawer.tsx:36` is `window.location.href = checkoutUrl`, a programmatic navigation the listener never sees. No `_gl` parameter is appended, so the checkout opens a fresh session attributed to `baselayerskin.co` as a referral. Configuring the domains is necessary but not sufficient; the handoff has to become a real anchor click for the linker to fire.

**Deploy-state gotcha found in the same pass:** commit `386ec7b` (the event queue, real variant IDs, US-first consent) was committed locally but left **unpushed**, and the production bundle at `/assets/index-DncNwB9p.js` still serves the old code — verified by marker: no `Atlantic/Reykjavik` (old hard opt-in gate), no `ProductCTAClick`, and `base-layer-face-cream` still present as the `content_ids` value. Any Meta Test Events check for a browser-side `ViewContent` will fail until that push lands, and would be read as a tagging problem rather than an undeployed fix.
