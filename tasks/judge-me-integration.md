# Judge.me Integration — Scope

**Status:** scoped, not started
**Created:** 2026-08-12
**Decision record:** `kb/wiki/site-architecture.md` (app stack research), this file (implementation)

## Why Judge.me

Base Layer is a Vite SPA on Netlify that uses the Shopify Storefront API for cart/checkout
only. It is not a Liquid theme and not Hydrogen, so theme app extensions — the delivery
mechanism for most Shopify review apps — do not exist here. The selection criterion is
therefore narrow: does the vendor expose a public read API we can call at build time.

Judge.me does, at $0 (free tier) or $15/mo flat. Okendo also has a strong headless story
(`@okendo/shopify-hydrogen`, Storefront REST API) but gates headless installs behind its
Advanced plan and prices by order volume. Loox, Yotpo, Stamped and Trustpilot are either
widget-only, quote-gated, or solving brand reputation rather than product reviews.

Judge.me publishes a `@judgeme/shopify-hydrogen` package too, so headless is officially
supported rather than tolerated. We will not use it: it fetches widget markup client-side
from Judge.me's CDN, which the Puppeteer prerender would not capture and which hands
layout control to their stylesheet. Consuming JSON and rendering our own components is
both more crawlable and on-brand.

## Architecture

Four touchpoints. Only three involve code.

### 1. Collection — no code, but one setting is load-bearing

Judge.me installs on `base-layer-skin.myshopify.com`. Review request emails fire off
Shopify order webhooks. Customers write reviews on Judge.me's hosted form, linked from
that email.

**The theme app embed is a red herring.** Judge.me's install flow toggles a "Core Snippet"
app embed into the Shopify theme. That theme is never served — the myshopify domain
redirects to `baselayerskin.co` — so the embed injects script into a page no shopper ever
loads. It is inert, not harmful. Leave it enabled; Judge.me treats it as its install
signal, and disabling it buys nothing.

**The setting that actually matters is `Settings → Collection flow`.** The dropdown
"Where customer gets redirected when writing reviews from emails" must be set to
**External form (Recommended)**, not "In-store review form." In-store deep-links every
review request email into the dead theme, which redirects to the homepage — the customer
lands nowhere near a review form and the request is wasted. External sends them to
Judge.me's hosted page instead. Available on all plans, no widget required.

The sibling dropdown ("Where customers write reviews," governing the Review Widget and
Happy Customers Widget) is irrelevant to us — we render neither widget.

**Seeding the first five reviews:** `Settings → Request reviews → Links, QR codes and
point of sale review collection` generates a shareable review link that needs no widget
and no theme. Useful for reaching Batch 01 buyers directly while the 5-review gate is
still closed. Note these links are public by design — anyone holding one can submit.

**Deliberate v1 constraint: no on-site review submission form.** Writing a review through
the API requires the *private* token, which cannot ship in client JS. Routing submission
through Judge.me's emailed form removes that problem entirely. If an on-site form is
wanted later, it needs a Netlify Function proxy holding the private token — that is v2,
scoped separately.

### 2. Build-time fetch — `scripts/fetch-reviews.mjs` (new)

Fetch published reviews from `https://api.judge.me/api/v1/reviews` (note the `api.`
subdomain — the docs also cite `judge.me/api/v1` as the base, but the reviews endpoint is
documented on `api.judge.me`) using `shop_domain` plus the public API token. `shop_domain`
is `base-layer-skin.myshopify.com` — an identifier passed as a query param, not a URL
Judge.me resolves, so the storefront redirect does not affect it.

Query params available: `per_page` (max 100), `page`, `product_id`, `rating`, `published`,
`reviewer_id`, `reviewer_email`.

Write a normalized subset to `src/data/reviews.json`:

```json
{
  "fetchedAt": "2026-08-12",
  "rating": 4.6,
  "count": 23,
  "reviews": [
    { "id": 1, "rating": 5, "title": "...", "body": "...",
      "reviewer": "Sean M.", "verified": true, "createdAt": "2026-08-09",
      "pictures": ["https://..."] }
  ]
}
```

Rules:

- **Cap at 50 reviews** in the committed JSON. Full review bodies land in the JS bundle,
  so this is a size ceiling, not a display cap.
- **Commit `reviews.json`.** On API failure the script warns and exits 0, leaving the last
  good file in place. Same defensive posture as the Sanity fetch in
  [vite.config.ts:483](vite.config.ts:483), which warns and proceeds with static pages.
- Wire into `prebuild`, alongside the sitemap step in [package.json:8](package.json:8).
- Reviews refresh on deploy only. Add a daily Netlify scheduled build if that becomes a
  problem; review *dates* are what shoppers judge freshness on, not sync latency.

### 3. Display — `src/components/ReviewsSection.tsx` (new)

Renders from the static JSON import. Because it is a synchronous import rather than a
runtime fetch, the Puppeteer SSR pass at [vite.config.ts:530](vite.config.ts:530) captures
the rendered review DOM automatically — crawlers get real review text in the HTML with no
extra work.

- **Five-review gate.** Renders nothing below 5 reviews. 70% of shoppers need at least
  five before trusting a business at all; a "0 reviews" block is worse than no block.
- Sort newest first. Surface photo reviews above text-only (62% of shoppers are more
  likely to buy when they can see customer photos).
- **Show negative reviews.** 82% of shoppers actively seek them out. No filtering by
  rating, ever.
- Mount on [FaceCream.tsx:473](src/pages/FaceCream.tsx:473), above `<TestimonialsSection />`.

Also replace the `PRODUCT_RATING` placeholder at
[FaceCream.tsx:90](src/pages/FaceCream.tsx:90) with the fetched aggregate. That constant
was written as this exact seam. `<StarRating>` already renders nothing when `count === 0`
([StarRating.tsx:27](src/components/StarRating.tsx:27)), so the zero case is handled.

### 4. Structured data

No `aggregateRating` exists anywhere in the codebase today. Add it to both Product schemas:

- [FaceCream.tsx:28](src/pages/FaceCream.tsx:28) — `PRODUCT_SCHEMA`
- [vite.config.ts:140](vite.config.ts:140) — the static `/all-in-one-skincare-for-men` schema

The vite.config one has to read `reviews.json` at build time, which is why the fetch script
must run before `vite build`, not during it.

**Hard rule: never emit `aggregateRating` with `reviewCount: 0`.** Google's Rich Results
Test errors on it, and an erroring Product schema can cost the whole rich result. Gate both
sites on the same `count >= 5` check the component uses.

`Index.tsx:14`'s `REVIEW_SCHEMA` is misnamed — it is a plain Product schema with no review
data. Either rename it or fold the aggregate in there too; the homepage is a legitimate
place for the rating.

## Blocking unknowns — both resolved 2026-08-12

**1. API access works on the free plan.** `GET /api/v1/reviews` returns 200 with no paid
upgrade. But not with the token the docs imply:

- The **public** token returns **403** — *"You are using a public token which does not have
  enough permissions."* It is scoped to the widget API only.
- The **private** token returns **200**.

This inverts the assumption the first draft of this doc was built on, and it makes the
build-time architecture load-bearing rather than merely convenient: a browser-side fetch
could never hold this credential. `JUDGEME_PRIVATE_TOKEN` lives in `.env` locally and in
Netlify's env vars for CI. It must never be prefixed `VITE_`, never be imported from
`src/`, and never be committed — anything under `VITE_` is inlined into the client bundle.

**2. The "legacy Review Widget" restriction does not apply.** It governs the in-store form
and widget path only. Judge.me documents headless usage directly (Widget API with
`json_request=true`, plus an official Hydrogen package). Rendering our own components from
JSON carries no equivalent restriction.

**3. `shop_domain` is `kpfzdg-kw.myshopify.com`** — Shopify's original auto-generated
handle. Not `base-layer-skin.myshopify.com` (the alias `VITE_SHOPIFY_DOMAIN` uses for the
Storefront API) and not `shop.baselayerskin.co` (the primary domain). All three reach the
same store — both myshopify handles 301 to `shop.baselayerskin.co`, and `verify:pricing`
passes against the alias — but only the original handle authenticates against Judge.me.
Judge.me returns an identical 401 for a wrong domain and a wrong token, so this cost more
time than it should have.

## Compliance

The FTC Consumer Reviews Rule (16 CFR 465) has been enforceable since October 2024, with
civil penalties up to ~$53,000 per violation and warning letters issued as recently as
December 2025.

- Incentivized reviews are legal only if the incentive is disclosed clearly and
  conspicuously **in or beside the review**, and is **not conditioned on sentiment**.
  "$10 off for an honest review" is fine. "$10 off for 5 stars" is not.
- If review requests offer any incentive, `ReviewsSection` needs a per-review disclosure
  badge. Judge.me does not add this automatically.
- Do not suppress, reorder, or filter by rating.

Related: `kb/wiki/customer-insights.md` records that a false "4.8/5 · 1,000+ customers"
claim was live and had to be corrected. Everything here is built to make that class of
error structurally impossible — the numbers come from the API or the block does not render.

## Sequencing

1. ~~Install Judge.me free plan on the Shopify store.~~ **Done 2026-08-12.**
2. ~~Resolve blocking unknowns; obtain credentials.~~ **Done 2026-08-12.**
3. ~~`scripts/fetch-reviews.mjs` + build wiring + committed `src/data/reviews.json`.~~
   **Done 2026-08-12.** Runs clean against the live API, returns 0 reviews as expected.
4. **Set `Settings → Collection flow` → "Where customer gets redirected when writing
   reviews from emails" → External form.** Not yet done, and it is the one setting that
   decides whether review requests work at all on a headless store. Then place a test
   order and confirm the email link lands on Judge.me's hosted form rather than bouncing
   to the homepage.
5. Add `JUDGEME_SHOP_DOMAIN` and `JUDGEME_PRIVATE_TOKEN` to Netlify env vars, or every
   deploy silently ships the committed zero-review file. The script exits 0 when they are
   missing, so this failure is quiet by design — check the build log for the ✅ line.
6. Seed the first reviews: `Settings → Request reviews → Links, QR codes` generates a
   widget-free review link for Batch 01 buyers. The PDP block stays hidden until 5 exist.
7. `ReviewsSection.tsx` with the 5-review gate; mount on the PDP; wire `PRODUCT_RATING`.
8. `aggregateRating` in both Product schemas, gated identically.
9. Verify: Rich Results Test on `/face-cream` and `/all-in-one-skincare-for-men`; confirm
   review text appears in prerendered HTML (`curl` the built file, not the dev server).

Steps 7–8 are roughly a half day but are pointless before step 4 produces real reviews.
Sales opened 2026-08-10, so the gate is collection, not code.

## Not in scope

- On-site review submission form (needs a Netlify Function + private token)
- Review syndication to Google Shopping (Awesome plan feature, separate setup)
- Q&A widget, review carousels on non-PDP pages
- Migrating the three hand-written testers in `testimonialsData.ts` into Judge.me. They are
  real but were not collected through a verified-purchase flow, so importing them would
  make them look verified when they are not. Leave them where they are.
