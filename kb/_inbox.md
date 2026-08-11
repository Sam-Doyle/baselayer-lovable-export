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

---

<!-- New entries below this line -->

---
date: 2026-07-06
category: technical
source: live Storefront API testing during checkout wiring
confidence: high
target_article: site-architecture.md
---
Shopify domain conflict: baselayerskin.co is set as the Shopify store's primary domain while DNS serves Netlify. Storefront-API checkoutUrls therefore point at baselayerskin.co/cart/c/* which the SPA swallows, and base-layer-skin.myshopify.com 301s back to the apex (redirect loop). Fix requires Shopify admin: either remove the apex domain from Shopify (checkout falls back to myshopify domain) or connect shop.baselayerskin.co as Shopify primary (branded checkout, no Netlify conflict). Netlify /cart/c/* passthrough rules added as backstop. Also: only one variant exists (1-bottle $38); 2/3-bottle tiers hidden in src/config/product.ts until variants are created and GIDs pasted.

---
date: 2026-07-07
category: conversion
source: checkout browser test + Supabase count query
confidence: high
target_article: launch-timeline.md
---
Positioning shift: Subscribe & Save added as OPTIONAL tier alongside 1-bottle/$38 and 2-bottle/$68. All absolute "no subscription" copy reconciled to "no subscription required"/"never locked in"; FAQ answers rewritten. The anti-subscription WEDGE is retained as anti-forced-subscription. Note: Sanity CMS articles (no-subscription-model) and comparison pages may still carry absolute claims — needs CMS pass. Also: real waitlist = 13 emails; all 1,000+/4.8-star claims removed sitewide, replaced with true "Founding Batch 01 = 1,000 bottles" scarcity framing. Testimonial cards (Sean/Marcus/Cooper) kept but authenticity unverified — founder must confirm real testers or replace.

---
date: 2026-07-08
category: technical
source: production debugging (CSP fix never deployed)
confidence: high
target_article: technical/deploy-pipeline (create if missing)
---
Netlify deploy gotchas found while wiring Shopify checkout: (1) A `netlify.toml` copied into the publish dir (we had a stale duplicate in `public/`) takes precedence over `_headers` on deploy — root netlify.toml + public/_headers are the only two places headers should live; the duplicate is now deleted. (2) `netlify deploy --prod` CLI hangs indefinitely at deploy creation (three deploys stuck in "new" state, 0 files attached, incl. one 51 min). Workaround that works reliably: zip dist and POST to `api.netlify.com/api/v1/sites/<id>/deploys` with Content-Type application/zip. (3) Adding an option to a Shopify product RECREATES all variants — old variant GIDs die; always re-fetch GIDs from the Storefront API after structural product changes.

---
date: 2026-08-10
category: marketing
source: Search Console API (sc-domain:baselayerskin.co)
confidence: high
target_article: seo baseline / organic search
---
SEO baseline as of 2026-08-10: zero recorded search impressions for baselayerskin.co over the trailing 6 months (Feb–Aug 2026). Site is starting organic search from scratch. GA4 property: properties/526066920 (account "Base Layer Skin", 385687789).

---
date: 2026-08-10
category: technical
source: GSC URL inspection API + sitemaps API (/seo-os:dashboard run)
confidence: high
target_article: seo baseline / organic search
---
Root cause of zero impressions found: NO sitemap submitted to Search Console (0 sitemaps), and Google last crawled the homepage 2026-07-01 (40 days stale). Homepage IS indexed ("Submitted and indexed", robots allowed, fetch OK). Rich results: Product snippets PASS, Review snippets PASS (4 reviews detected), Merchant listings have 3 warnings — missing shippingDetails, hasMerchantReturnPolicy, validFrom in product schema. Fix = generate + submit sitemap.xml, patch Offer schema fields.

---
date: 2026-08-10
category: marketing
source: GA4 API (properties/526066920)
confidence: medium
target_article: seo baseline / organic search
---
GA4 last 28d (Jul 14–Aug 10): 40 total sessions — Direct 31, Organic Search 3 (100% engagement, non-Google since GSC=0 clicks; likely Bing/DDG), Organic Social 2, Referral 1. Top pages: / (17), /face-cream (6), /skin-concerns/post-shave-irritation (4). Article + ingredient pages already receiving trickle traffic. Action: submit sitemap to Bing Webmaster Tools too.

---
date: 2026-08-10
category: technical
source: /seo-os:tech-debt live crawl of all 59 sitemap URLs + repo inspection
confidence: high
target_article: seo baseline / organic search
---
Tech-debt audit result: site is structurally clean (0 redirect chains, 0 canonical errors, 0 noindex, 0 4xx; prerendered HTML has correct canonicals; www/http variants 301 correctly; trailing-slash dupes neutralized by canonicals). A valid 59-URL sitemap.xml IS live and referenced in robots.txt — the only gap is it was never SUBMITTED to GSC (submit API blocked: our OAuth is webmasters.readonly by design; manual UI submit required). Two real defects: (1) soft-404 — SPA fallback `/* /index.html 200` in public/_redirects serves homepage shell at unknown URLs; fix = prerender 404.html + `/* /404.html 404`. (2) product Offer schema duplicated across 5 page files (FaceCream.tsx, Index.tsx, ProductDetail.tsx, MatteMoisturizer.tsx, NonGreasyMoisturizer.tsx) missing shippingDetails/hasMerchantReturnPolicy/validFrom. Tickets: runs/tech-debt-2026-08-10.md.

---
date: 2026-08-10
category: marketing
source: SERP sweep (/seo-os:backlinks scrappy version)
confidence: medium
target_article: seo-strategy.md
---
Link outreach targets (no Ahrefs — SERP-derived): Tier 1 niche DTC reviewers that hand-test competitor brands: The Adult Man (has Geologie vs Tiege vs Lumin head-to-head), Fin vs Fin (DTC comparison specialist), Honest Brand Reviews, ReadySleek, Dapper & Groomed (over-40 tested roundup), The Modest Man, The Dermatology Review, Effortless Gent. Free listings: Skinsort ingredient DB, Trustpilot claim. Big pubs (Forbes Vetted/CNN/Rolling Stone) parked until review corpus exists. Key unlock: affiliate program before any outreach — all Tier 1 sites monetize via affiliate. Competitor-owned fake roundups to ignore: striveskin, henkeys, rawdog. Full list: runs/backlinks-2026-08-10.md.

---
date: 2026-08-11
category: technical
source: 3-agent content improvement pass (copy editor / designer / SEO)
confidence: high
target_article: seo-strategy.md
---
Site-wide SEO bug found+fixed: injectMeta() in vite.config.ts had rigid regexes that failed on multi-line and self-closing meta tags — EVERY page shipped the homepage meta description/og/twitter tags to crawlers since launch. Also fixed: buildFaqSchema() was hardcoded null (re-enabled for AI-search extraction), comparison page "Our Verdict" rendered empty (string passed to PortableText), comparison extractableSummary was never rendered (now a Key Takeaways block), ItemList schema missing. Content integrity findings: over-40 article had fabricated competitor absorption times (reframed to label-based formula-weight analysis in drafts); "we tested 10+" metaDescription false on two counts (5 products, no testing). Brand doc ~/BaseLayer/brand/_brand-context.md describes dark monochrome visual identity but live site is light theme w/ navy/orange — doc is stale. Comparison schema type has no author field (E-E-A-T gap).

---
date: 2026-08-11
category: marketing
source: /last30days research (hawky.ai, prooflytics, adamigo.ai, dtcroas.com) — kb/raw/research/2026-08-11-shopify-apps-and-roas-benchmarks.md
confidence: medium
target_article: paid-acquisition-benchmarks
---
2026 ROAS benchmarks by channel for ecommerce: Google Ads median ~3.5-3.7x (Shopping 4-8x), Meta ~1.86-2.2x (2-4x direct attribution), TikTok ~1.4x. Beauty & personal care industry benchmark ~4.2x. Meta B2C is strongly seasonal: 4-5x in Q4, 2-2.5x Jan/Feb, 3-3.5x summer. Attribution windows are not comparable across platforms (Google 30-day click vs Meta 7-day click + 1-day view), so raw platform ROAS cannot be ranked head-to-head.

---
date: 2026-08-11
category: marketing
source: /last30days research (usedaymark.io, shopify-fee-calc.com, Eightx, Shopify MER blog)
confidence: medium
target_article: paid-acquisition-benchmarks
---
Breakeven math, not benchmark ROAS, is the number that matters for a new store. Breakeven ROAS = 1 / gross margin. A DTC skincare brand at 65% gross margin and $55 AOV breaks even at ~1.5x; at 35% COGS with Shopify Payments it lands ~2.0-2.5x. Breakeven blended MER = 1 / contribution margin (30% CM -> MER 3.3; 40% CM -> 2.5). Healthy blended MER target is 3.0-5.0. Base Layer at $38 needs its own version of this calculated from real COGS + shipping + Shopify fees before any spend target is set.

---
date: 2026-08-11
category: conversion
source: /last30days research (Triple Whale, convertcart, easyappsecom ROAS guides)
confidence: medium
target_article: cro-learnings
---
Three fastest ROAS levers in order: (1) raise AOV via bundles/upsells — a 10% AOV lift is a 10% ROAS lift with zero ad changes; (2) cut CPA via creative and landing page; (3) shift budget from low- to high-ROAS audiences. Sending paid traffic to the homepage suppresses ROAS versus PDP or a dedicated landing page — this validates the Hero -> PDP routing decision already implemented. Suggested budget split: 60% prospecting, 25% retargeting, 15% creative testing. Test creative at $50-100 per variant before scaling.

---
date: 2026-08-11
category: technical
source: /last30days research (X merchant stack posts, Reddit app roundups, beauty app guides)
confidence: medium
target_article: shopify-app-stack
---
Consensus minimum Shopify app stack for a new DTC skincare store: reviews (Judge.me, cited 5-15% PDP conversion lift), email/SMS (Klaviyo, cited 10-30% incremental revenue once flows are tuned), subscriptions (Recharge / Loop / Skio), bundles for AOV. Beauty-specific finding: beauty buyers read reviews more than any other category, and filterable reviews (skin type, age, concern) outperform an unsegmented review block. Caveat for Base Layer: this site is a headless custom storefront, not a Shopify theme, so storefront-rendering apps (reviews widgets, upsell apps, popups) mostly do not apply — only apps that operate server-side or at checkout do.

---
date: 2026-08-11
category: marketing
source: /last30days research — X posts from @shabnam_774, @riyazmd774, @heyalexmoore (July 29 - Aug 1 2026)
confidence: high
target_article: shopify-app-stack
---
"App overload" is the loudest Shopify app narrative on X right now, but it is largely an affiliate pattern: three separate accounts posted near-identical "one app for reviews, another for upsells, another for email..." copy within four days, all funneling toward all-in-one bundle apps (Vitals named explicitly). Treat this as paid promotion, not organic community consensus. The one genuinely organic stack post in the window is @seempaq (86 likes) listing a real merchant stack: FoxSell Bundles, Zapiet, DiscountKit, Recheck, Judge.me for storefront/conversion.

---
date: 2026-08-11
category: conversion
source: unit-economics model (COGS $10) + Shopify Help Center free-shipping/automatic-discount docs
confidence: high
target_article: cro-learnings
---
Base Layer moved the PDP default from the $38 single to the $68 2-pack and put shipping behind a $50 threshold (subscriptions exempt). The economics driving it: at COGS $10 and ~$5.50 landed shipping, a single carries ~$21.10 contribution (breakeven ROAS 1.80x) while the 2-pack carries ~$38.73 (breakeven 1.76x) — the CAC ceiling nearly doubles while breakeven ROAS is flat, so the same ad spend buys a materially better customer. Free-shipping threshold construction: Shopify natively supports both halves as automatic discounts — a Free Shipping automatic discount with "Minimum purchase amount" for the $50 rule, and a second one with "Purchase type: Subscription" for the subscribe-and-save exemption. No Shopify Function or second shipping profile is required. Limit is 25 active automatic discounts and Shopify applies the best applicable one, so the two coexist safely. Watch: shipping fees at checkout are a top cart-abandonment driver, so the single-bottle tier's conversion rate is the metric that decides whether the threshold nets out positive.
