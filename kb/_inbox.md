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
