---
article_count: 11
inbox_count: 6
last_updated: 2026-08-12
---

# Base Layer Knowledge Base — Index

Read this file at session start. It tells you what's in the wiki and where to find it.

## Quick Reference

- **Product**: Performance Daily Face Cream (BL-PDFC-50ML), 50 mL
- **Price**: $38 single / **$68 2-pack (PDP default)** / $35 Subscribe & Save every 6 weeks. $48 retail is the strikethrough anchor and the Batch 02 target. Source of truth: `src/config/product.ts` (`npm run verify:pricing`)
- **Shipping**: Free on all orders, no threshold (`freeShippingOnAllOrders` in `src/config/legal.ts`). Landed cost **$7.12 single / $7.75 2-pack** (measured 82 g packed unit + 9x12 poly mailer, USPS GA 4 oz / 8 oz tiers, postage blended from quoted Shopify Shipping rates). Buy labels through **Shopify Shipping** — ~6% under published Commercial
- **Domain**: baselayerskin.co
- **Stack**: React 18 + Vite + Tailwind + Supabase + Sanity
- **Brand context**: `~/BaseLayer/brand/_brand-context.md`

## Wiki Articles

| Article | Domain | Last Compiled | Summary |
|---------|--------|---------------|---------|
| [product-formula.md](wiki/product-formula.md) | product | 2026-08-12 | SKU, pricing (flagged stale vs. current $35 Subscribe & Save tier), full ingredient list with concentrations, efficacy data, synergy framework, formulation notes, fragrance-free claim substantiation (NACDG/AAD citation), regulatory/compliance rules, per-ingredient claim restrictions, two live banned-claim violations found by grep (PeptideStack.tsx:248 "rebuilds", IngredientsShowcase.tsx:28 collagen-synthesis claim) with the process lesson to script the sweep rather than read by eye |
| [brand-identity.md](wiki/brand-identity.md) | brand | 2026-08-12 | Brand archetype ("Your Sharp Friend"), voice rules, banned words, messaging pillars, headline formulas, CTA patterns, color systems (monochrome dark + Alpine Navy), typography (DM Sans/Inter + Montserrat), photography direction, logo usage, consistency checklist, advertorial imagery rules (never generate synthetic product shots; Preset C's #E53E3E fails the 4.5:1 accent gate — use the brand-accent token) |
| [customer-insights.md](wiki/customer-insights.md) | brand | 2026-08-12 | ICP profile (M 25-35), 7 named segments, testimonial themes (oil control, partner validation, travel simplicity), 10 ranked objections with FAQ-sourced rebuttals, objection handling patterns, social proof inventory (4.8/5 + 1,000+ claims corrected to false — code truth is 0 rating/0 count, 3 real testers), compliance flag on live banned-phrase FAQ copy, customer language patterns (exact quotes), pain-point-to-feature mapping, purchase trigger archetypes, 2026 shopper review expectations (4.0–4.7 optimal band with 5.0 hurting conversion, 5-review trust threshold, 82% seek negatives, 85% call >3-month reviews irrelevant, 62% lift from photos) |
| [site-architecture.md](wiki/site-architecture.md) | technical | 2026-08-12 | Full stack (React 18/Vite 5/Tailwind 3/shadcn), 20-page routing map, analytics (GA4 + Meta Pixel + server-side CAPI), Sanity CMS (7 content types, SVG upload support), Shopify Storefront API checkout integration (domain conflict fix, variant GID gotchas), Shopify app stack research, Netlify deploy gotchas (CLI hang workaround, header precedence), Netlify deploy with Puppeteer SSR prerender, image optimization pipeline, code splitting strategy, caching/security headers, **checkout redirect loop RESOLVED** (primary domain now shop.baselayerskin.co), **Judge.me headless reviews integration** — vendor comparison for headless, public token 403s on the REST API so build-time fetch is architecturally required, shop_domain is the original kpfzdg-kw handle, theme app embed is inert and Collection flow → External form is the real dependency, FTC 16 CFR 465 constraints, as-built pipeline |
| [performance-metrics.md](wiki/performance-metrics.md) | technical | 2026-08-12 | Build pipeline (Vite+Terser+Brotli+Gzip), code splitting (28 lazy routes, deferred QueryClient, manual chunks), image optimization (vite-plugin-image-optimizer, responsive WebP heroes, picture elements, lazy loading, fetchPriority), Netlify caching (immutable assets, stale-while-revalidate HTML), 4 LCP optimizations (async CSS, per-page preloads, HTML skeletons, baked hero pictures), CLS prevention (inline critical CSS, font-display swap, explicit dimensions), third-party deferral (requestIdleCallback analytics), Puppeteer SSR details, known gaps (no AVIF, no web-vitals, no PWA), prerender static server has an unguarded createReadStream that can crash the build intermittently |
| [competitor-landscape.md](wiki/competitor-landscape.md) | competitive | 2026-08-12 | 11 competitor profiles (Caldera Lab, Kiehl's, Brickell, Lumin, Tiege Hanley, Bulldog, Harry's, Jack Black, Cardon, Geologie, CeraVe) with prices/positioning/weaknesses, Caldera brand-name-collision risk ("The Base Layer" product, SERP ownership) + organic strategy read (paid→quiz funnel, question-format content wins), ComparisonTable ingredient matrix (6/6 vs 0-1/6), 7 CMS comparison pages (+ Caldera page gap flagged), 6 exploitable weaknesses, price tier analysis with $/oz, 6 market gaps, claims comparison matrix, positioning map |
| [launch-timeline.md](wiki/launch-timeline.md) | brand | 2026-08-12 | 10-week pre-launch phases, launch day schedule, Batch 01/02/03 strategy (1K/3-5K/10K+ units), pricing ($38 founding/$48 retail with increase at Batch 02), Subscribe & Save added as optional tier + anti-subscription copy reconciliation (2026-07-07), real waitlist count (13 emails) vs. display floor, social proof claim removal, testimonial authenticity flag, all email capture entry points and waitlist flow (8 entry points), GTM channels, 12-month roadmap, compliance checklist, unit economics, outcome scenarios |
| [seo-strategy.md](wiki/seo-strategy.md) | marketing | 2026-08-12 | Technical SEO setup (SEO.tsx: meta tags, OG, canonical, JSON-LD schemas — FAQPage re-enabled, supersedes prior disabled status), sitemap generation, robots.txt, prerender strategy, Netlify caching/security headers, content SEO, keyword strategy, internal linking architecture, performance optimization priorities, SEO baseline audit (zero impressions, no sitemap submitted, GA4 snapshot), tech-debt audit (soft-404 + Offer schema gaps across 5 files), backlink outreach targets, site-wide meta-injection bug fix (homepage meta shipped on every page) |
| [ad-strategy.md](wiki/ad-strategy.md) | marketing | 2026-08-12 | Meta ad platform strategy (specs, benchmarks, fatigue thresholds), 2026 paid-acquisition/ROAS benchmarks by channel + breakeven-ROAS math, 6 audience segments with pain points/objections, creative approaches, 18-hook bank, 8 ad copy variations, native static ads research (cost/CPM/fatigue data), peptide-maxxing ad angle (slang-hook/editorial-lander split), AI creative system, advertorial landing page design, conversion landing page structure, social content playbook, founding batch conversion psychology, compliance checklist, measured image-gen routing (fal.ai nano-banana-pro ~$0.20/img is the working path; higgsfield free plan 403s on recraft_v4_1) |
| [conversion-learnings.md](wiki/conversion-learnings.md) | conversion | 2026-08-12 | ROAS levers and traffic-routing validation, **contribution margin + breakeven ROAS by tier rebuilt against a measured packed unit** **and four quoted Shopify Shipping lanes** (single $20.48/1.86x, 2-pack $39.98/1.70x, subscribe $17.57/1.99x — supersedes the $5.50 estimate, the $8.10 carrier-table correction and the $7.46 pre-quote figure; do not model on an unweighed parcel or an unquoted lane), $50 threshold documented as dead (free shipping on all orders), proposed subscription cadence fix (2 bottles/$70/12 weeks, +24% CM, untested), cold-traffic landing page research (pre-sell vs. PDP, message match, Bloom case study), advertorial creation frameworks and format-to-warmth matching, peptide-led creative objection handling (untested), advertorial hero image layout fix, concentration-framing contradiction flagged as a deliberate A/B (peptide-stack breadth vs. concentration-test dose-in-context), disclosure-only framing for competitor comparison tables |
| [shipping-economics.md](wiki/shipping-economics.md) | technical | 2026-08-12 | rev 3 — landed shipping from Denver rebuilt on a **measured** 82 g packed unit and **quoted** carrier rates ($7.12 single / $7.75 2-pack, USPS GA 4 oz / 8 oz tiers), three counterintuitive rules (DIM irrelevant under 1 cu ft, GA Cubic is a trap for light parcels, below-Commercial label source is worth ~$1.86/order after the 2026-07-12 ounce-tier elimination), 2026 GA rate cliffs by weight, Denver zone map, container weight as the top packaging lever, mailer fit rule + size table (**9x12 plain poly purchased at $43.25/1,000**, supersedes #1 bubble and #0), supplier list (SupplyHut, PackagingSupplies, EcoEnclose in Louisville CO), Shopify weight/package/rate config, **why Shopify CLI and the Admin API cannot script it** (no package-preset create mutation; repo has read-only Storefront token only), **postage rebuilt from four quoted Shopify Shipping lanes** (Berkeley $5.48 / NYC $5.62 / Juneau $5.97 / rural MT $7.46 → $5.78 blended) — **zone is nearly irrelevant ($0.14 Z5→Z7), rural ZIPs are the only material variable (+36%), and the rev-1 AK/HI tier-loss claim is corrected (Juneau only +9%)**; buy labels through Shopify Shipping (~6% under published Commercial), airless-pump actuator protection analysis in unpadded poly |

## How to Use This Index

1. **Looking for info?** Scan the table above. If an article exists, read it before researching from scratch.
2. **Found new info?** Add to `kb/_inbox.md`, not directly to wiki articles.
3. **Compiling?** Move inbox entries into wiki articles, then update this table.
4. **Creating a new article?** Add it to `kb/wiki/`, then add a row here.

## Directory Layout

```
kb/
├── _index.md          ← You are here (routing table)
├── _inbox.md          ← Capture buffer for new findings
├── _session-log.md    ← Append-only audit trail
├── _health.md         ← Generated by health-check.sh
├── wiki/              ← Compiled articles (source of truth)
├── raw/
│   ├── research/      ← Raw /last30days output
│   ├── sessions/      ← Full session transcripts (if saved)
│   └── experiments/   ← A/B test results, ad experiments
└── scripts/
    └── health-check.sh
```
