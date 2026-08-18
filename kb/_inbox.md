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

**Last compiled:** 2026-08-13 — 9 entries cleared into `site-architecture`
(4: review gate/widget/pipeline corrections and analytics/checkout measurement),
`performance-metrics` (Judge.me photo sizing), `conversion-learnings` (2:
discount floor and review-breakdown behavior), and `competitor-landscape`
(Blueprint PDP teardown and performance findings).

---

<!-- New entries below this line -->

---
date: 2026-08-17
category: technical
source: Base Layer headless cart audit + Brevo official tracker/eCommerce documentation
confidence: high
target_article: wiki/site-architecture.md
---
The Brevo Shopify plugin cannot observe Storefront API cart mutations made on
the Netlify React app, so lifecycle ownership must be hybrid: the storefront
sends consent-gated `product_viewed`, `cart_updated`, and empty-cart-only
`cart_deleted` events through the Brevo tracker, while the Shopify/Brevo
server-side integration remains authoritative for `order_created` or
`order_completed`. Sending purchase completion from the browser would be
unreliable because hosted checkout does not reliably return to the storefront;
running both Shopify and Brevo recovery automations would also duplicate sends.
The storefront now queues pre-opt-in behaviour in memory only, identifies the
visitor after explicit marketing opt-in plus analytics consent, and keeps these
events separate from GA4/Meta measurement to prevent duplicate commerce events.

---
date: 2026-08-13
category: technical
source: GA4 sessionSource report for baselayerskin.co, property 526066920, cross-checked against src/lib/analytics.ts
confidence: high
target_article: wiki/site-architecture.md
---
`source`, `medium` and `campaign` are reserved GA4 event parameters. Sent on any
event they are read as a manual traffic source and written to the session,
replacing the real acquisition source. Base Layer had ~20 call sites passing
`source` to mean which CTA was clicked ("hero", "buy_box", "navbar",
"cart_upsell", "content_cta"), and `fireBrowserEvent` spread the whole payload
into `gtag("event", ...)`. A session-source report on 2026-08-13 listed
`buy_box` and `hero` alongside `facebook.com / referral` as if they were traffic
sources, confirming live damage. The sessions affected are precisely the ones
that clicked a CTA, i.e. the ones most likely to convert, so ad attribution was
being destroyed exactly where it mattered. Fixed in 49ce3a5 by renaming to
`cta_location` once on the way into gtag rather than at each call site, so Meta
pixel and CAPI keep receiving `source` unchanged and a new call site written in
the house style cannot reintroduce it. `cta_location` registered as an
event-scoped custom dimension in GA4. Historic GA4 attribution before
2026-08-13 is unreliable for any session containing a CTA click and does not
backfill.

---
date: 2026-08-13
category: technical
source: direct measurement on baselayerskin.co vs shop.baselayerskin.co
confidence: high
target_article: wiki/site-architecture.md
---
A `_gl` linker parameter is the wrong test for GA4 cross-domain continuity on a
subdomain hop. `_ga` is written on `.baselayerskin.co` and is therefore already
readable by `shop.baselayerskin.co` natively, so gtag has no reason to decorate
the URL and `_gl` will never appear. Verified by reading the same client id
`GA1.1.34396408.1786630663` on both hosts. The correct test is comparing the
`_ga` value across the two hosts. A corollary: the anchor-click checkout handoff
in `ShopifyCartDrawer.goToCheckout` is not required for cross-domain
measurement on this subdomain (its comment overstates the rationale); it remains
harmless and is still preferable to a location assignment for the general case.
The genuine remaining attribution gap is Shop Pay, which redirects to `shop.app`
— a different registrable domain with no cookie continuity and no linker fix
available.

---
date: 2026-08-13
category: technical
source: Shopify Storefront API sellingPlanAllocations query on base-layer-skin.myshopify.com, surfaced by odd pricing on Instagram Shop
confidence: high
target_article: wiki/shipping-economics.md
---
The "Subscribe & Save" selling plan (gid://shopify/SellingPlan/2934145095) was
attached to the whole product rather than the 1-bottle variant, so its fixed
$35-per-delivery policy also applied to the $68 2-pack variant. Instagram Shop
rendered it as a $33 discount. Two bottles for $35 every delivery forever
(orderCount null) leaves roughly $7.94 contribution against $39.98 for the
one-time 2-pack, moving breakeven ROAS from 1.70x to 4.41x, and at $17.50 per
bottle it was by a distance the cheapest way to buy the product. It never
appeared on the PDP because the subscription tile hardcodes
TIER_1_BOTTLE_GID; it was only visible on surfaces that render whatever the
Storefront API offers. `npm run verify:pricing` could not catch it because it
only walked the tiers product.ts declares and asked whether Shopify agreed —
blind to an offer Shopify makes that the repo never declared. Guard added in
59eed1a: the script now walks variants and flags any selling plan allocation
no tier pairs with. Fixed-price policies are the dangerous shape because they
ignore variant price; percentage and fixed-amount policies scale with it.

---
date: 2026-08-13
category: technical
source: Meta Commerce Manager, catalog 2505734419891235, Items view
confidence: high
target_article: wiki/site-architecture.md
---
The Shopify Facebook & Instagram channel publishes bare Shopify variant IDs as
Meta catalog Content IDs for this store — 42940461023303 and 42940461056071 —
with product ID 7469557612615 as the item group ID. No `shopify_US_<product>_<variant>`
prefix, contrary to the standing worry recorded in `metaContentId`. So the
site's existing `metaContentId` (last path segment of the GID) already matches
the catalog and needs no change. Two other things learned alongside: the
Events Manager catalog match rate reports on a trailing 28-day window, so it
read 0% for days after the content-ID fix landed in 386ec7b because the window
still covered the old invented `base-layer-face-cream` string — a stale window,
not a live mismatch. And the business holds two catalogs for the same store,
2038277147036399 ("Products from base-layer-skin.myshopify.com", access lost)
and 2505734419891235 (created 2026-08-13 by the channel connection).
`base-layer-skin.myshopify.com` and `kpfzdg-kw.myshopify.com` are one store:
both 301 to shop.baselayerskin.co and both authenticate the same read-only
Storefront token against product GID 7469557612615.

---
date: 2026-08-14
category: conversion
source: user first-impression review + responsive browser QA at 390x844 and 1440x900
confidence: medium
target_article: wiki/conversion-learnings.md
---
At five customer reviews, an above-fold aggregate (`4.8/5 from 5 customer
reviews`) made the small sample size more salient than the positive score and
read as negative social proof. The homepage hero now features one unedited
sentence from a real 5-star Judge.me review that Judge.me marks verified:
"So smooth going on, no grease or shine." The whole proof card links to the
complete PDP reviews section, where the 4.8 average, count, histogram, critical
review, photos, and per-review verification remain visible. Responsive QA kept
the $38 price and primary CTA in the first 390x844 viewport. This is a design
hypothesis, not a measured lift; evaluate against homepage-to-PDP click-through
and purchase conversion before treating it as a proven CRO result.

---
date: 2026-08-15
category: conversion
source: user-requested onsite quiz implementation and first-order offer economics
confidence: low
target_article: wiki/conversion-learnings.md
---
A two-step skin-concern quiz now offers 15% off a shopper's first one-time
order after collecting one of four concerns and an email address. The design
delays itself off the LCP path, suppresses repeat exposure, and carries the
merchandise code alongside the existing shipping code. This is an unmeasured
CRO hypothesis, not proof of lift. Evaluate quiz view-to-answer rate,
answer-to-email completion, new-subscriber purchase conversion, incremental
email revenue, and contribution margin net of the 15% discount before widening
the offer or increasing popup frequency.

---
date: 2026-08-17
category: technical
source: Google Search Console warning on "Base Layer Performance Daily Face Cream" + reading served HTML on baselayerskin.co
confidence: high
target_article: technical-seo
---
GSC's "Missing field review / aggregateRating (optional)" on the face cream was
firing on the homepage, not the PDP. The exact schema name in the warning
("Base Layer Performance Daily Face Cream", no "Men's") matches Index.tsx, and
/face-cream already carried aggregateRating. Lesson: match the warning's item
name against the `name` field in each Product block before assuming which URL
it refers to. Five routes on this site emit a Product schema with five
different names and one shared SKU.

---
date: 2026-08-17
category: technical
source: reading served HTML on /matte-moisturizer-for-men, /non-greasy-moisturizer-for-men, /all-in-one-skincare-for-men
confidence: high
target_article: technical-seo
---
Those three landing pages each shipped TWO conflicting Product entities: one
injected by STATIC_PAGES in vite.config.ts (named "Base Layer Performance Face
Moisturizer — …", carrying aggregateRating 4.8/5 but a bare offer) and one from
the React component (named "Base Layer Performance Daily Face Cream — …", no
rating, full merchant offer fields). Same sku BL-PDFC-50ML, different names,
same page. Google picks one of a pair like that arbitrarily.

Worse, none of the three renders a star rating anywhere in its UI. Google
requires the rating in aggregateRating markup to be visible to the user on the
same page. Marked-up-but-unshown ratings risk rich-result suppression beyond
the offending URL. Only /face-cream displays the Judge.me aggregate, so it is
now the only route claiming one. Removed the vite.config injection on
2026-08-17.

Generalisable rule for this codebase: prerender-time JSON-LD injection and
component-level JsonLd are two sources for the same entity. Pick one per route
and say so in a comment, or the two drift.

---
date: 2026-08-17
category: technical
source: curl against baselayerskin.co host variants, 2026-08-17
confidence: high
target_article: technical-seo
---
Host/protocol variants resolve correctly: http apex 301s to https apex, https
www 301s to apex, http www takes two hops (http www -> https www -> apex).
Apex returns 200 to a Googlebot user agent with a self-referencing canonical
and no robots meta. All 60 sitemap URLs return 200 with zero redirects or
404s. So a GSC "Page with redirect" on the homepage is the www or http variant
being reported, which is the expected and correct state, not an indexing
blocker. Check which property variant the report is scoped to before treating
it as a bug.

---
date: 2026-08-17
category: technical
source: grep of the 14 useMetaTags call sites vs STATIC_PAGES in vite.config.ts, then diffing built output
confidence: high
target_article: technical-seo
---
Same drift class as the double-Product-schema finding above, different field.
Page titles and descriptions were declared twice: STATIC_PAGES in
vite.config.ts baked one set into the prerendered HTML, and each page component
set another through useMetaTags on hydration. Ten of the fourteen static routes
disagreed with themselves, including / and /face-cream. Only the four policy
pages matched.

Consequence: Google renders JS, so the component title is what ranks, while
Facebook/Twitter/Slack scrapers and non-rendering crawlers read the prerendered
one. The build-config titles were the keyword-loaded ones (carrying "$38",
"2026", "Best Men's Face Moisturizer") and were the half being thrown away.

Fixed 2026-08-17 by moving both into src/config/pageSeo.ts, imported relatively
by vite.config.ts (the "@/" alias isn't resolvable while that config loads) and
via the alias by the components. Verified in dist/: all 14 routes ship exactly
one title and one description, and document.title after hydration equals the
prerendered value.

The generalisable rule now has two instances: in this codebase, anything the
prerender plugin injects into <head> has a component that also writes it. Check
both before trusting either, and read the built HTML rather than the source.

---
date: 2026-08-17
category: technical
source: three consecutive local builds failing to prerender / , then a puppeteer probe comparing polling strategies
confidence: high
target_article: technical-seo
---
Puppeteer's `waitForFunction` polls on requestAnimationFrame by default, and a
headless page stops painting once it settles. Any predicate that only becomes
true after that first paint is therefore never re-evaluated and burns its full
timeout while the condition is already satisfied in the DOM.

The prerender plugin's structure wait requires nav AND footer. The homepage
defers HomeBelowFold, which carries the footer, roughly 3s behind a timer plus
requestIdleCallback to keep it off the LCP path. So `/` timed out at 20s and
fell back to the skeleton shell: 2,959 bytes of root content against 75,080
when it renders. Measured directly — the same predicate resolves in 3,514ms
with `polling: 500` and 3,078ms with `polling: "mutation"`, and a probe
confirmed the footer was present the whole time the raf poller was blind to it.

It is a race, not a deterministic failure, which is why it survived. Production
happened to win it, so the live homepage was fine. A build that lost it would
have shipped a contentless homepage on the only route currently indexed and
ranking (position 2), and the build still exits 0 — the failure is one warning
line in a 60-line log.

Two rules out of this. Deferring content for LCP and prerendering it are in
direct tension: anything moved off the initial paint becomes invisible to a
raf-polled wait, so LCP deferral work needs the prerender wait checked in the
same pass. And "N rendered, 1 failed" is not a warning, it is a page shipping
empty; the render count deserves to be a build failure rather than a log line.
