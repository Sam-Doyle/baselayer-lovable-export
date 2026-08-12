---
article_count: 10
inbox_count: 0
last_updated: 2026-08-12
---

# Base Layer Knowledge Base — Index

Read this file at session start. It tells you what's in the wiki and where to find it.

## Quick Reference

- **Product**: Performance Daily Face Cream (BL-PDFC-50ML), 50 mL
- **Price**: $38 founding / $48 retail
- **Domain**: baselayerskin.co
- **Stack**: React 18 + Vite + Tailwind + Supabase + Sanity
- **Brand context**: `~/BaseLayer/brand/_brand-context.md`

## Wiki Articles

| Article | Domain | Last Compiled | Summary |
|---------|--------|---------------|---------|
| [product-formula.md](wiki/product-formula.md) | product | 2026-08-12 | SKU, pricing (flagged stale vs. current $35 Subscribe & Save tier), full ingredient list with concentrations, efficacy data, synergy framework, formulation notes, fragrance-free claim substantiation (NACDG/AAD citation), regulatory/compliance rules, per-ingredient claim restrictions |
| [brand-identity.md](wiki/brand-identity.md) | brand | 2026-04-03 | Brand archetype ("Your Sharp Friend"), voice rules, banned words, messaging pillars, headline formulas, CTA patterns, color systems (monochrome dark + Alpine Navy), typography (DM Sans/Inter + Montserrat), photography direction, logo usage, consistency checklist |
| [customer-insights.md](wiki/customer-insights.md) | brand | 2026-08-12 | ICP profile (M 25-35), 7 named segments, testimonial themes (oil control, partner validation, travel simplicity), 10 ranked objections with FAQ-sourced rebuttals, objection handling patterns, social proof inventory (4.8/5 + 1,000+ claims corrected to false — code truth is 0 rating/0 count, 3 real testers), compliance flag on live banned-phrase FAQ copy, customer language patterns (exact quotes), pain-point-to-feature mapping, purchase trigger archetypes |
| [site-architecture.md](wiki/site-architecture.md) | technical | 2026-08-12 | Full stack (React 18/Vite 5/Tailwind 3/shadcn), 20-page routing map, analytics (GA4 + Meta Pixel + server-side CAPI), Sanity CMS (7 content types, SVG upload support), Shopify Storefront API checkout integration (domain conflict fix, variant GID gotchas), Shopify app stack research, Netlify deploy gotchas (CLI hang workaround, header precedence), Netlify deploy with Puppeteer SSR prerender, image optimization pipeline, code splitting strategy, caching/security headers |
| [performance-metrics.md](wiki/performance-metrics.md) | technical | 2026-04-03 | Build pipeline (Vite+Terser+Brotli+Gzip), code splitting (28 lazy routes, deferred QueryClient, manual chunks), image optimization (vite-plugin-image-optimizer, responsive WebP heroes, picture elements, lazy loading, fetchPriority), Netlify caching (immutable assets, stale-while-revalidate HTML), 4 LCP optimizations (async CSS, per-page preloads, HTML skeletons, baked hero pictures), CLS prevention (inline critical CSS, font-display swap, explicit dimensions), third-party deferral (requestIdleCallback analytics), Puppeteer SSR details, known gaps (no AVIF, no web-vitals, no PWA) |
| [competitor-landscape.md](wiki/competitor-landscape.md) | competitive | 2026-08-12 | 11 competitor profiles (Caldera Lab, Kiehl's, Brickell, Lumin, Tiege Hanley, Bulldog, Harry's, Jack Black, Cardon, Geologie, CeraVe) with prices/positioning/weaknesses, Caldera brand-name-collision risk ("The Base Layer" product, SERP ownership) + organic strategy read (paid→quiz funnel, question-format content wins), ComparisonTable ingredient matrix (6/6 vs 0-1/6), 7 CMS comparison pages (+ Caldera page gap flagged), 6 exploitable weaknesses, price tier analysis with $/oz, 6 market gaps, claims comparison matrix, positioning map |
| [launch-timeline.md](wiki/launch-timeline.md) | brand | 2026-08-12 | 10-week pre-launch phases, launch day schedule, Batch 01/02/03 strategy (1K/3-5K/10K+ units), pricing ($38 founding/$48 retail with increase at Batch 02), Subscribe & Save added as optional tier + anti-subscription copy reconciliation (2026-07-07), real waitlist count (13 emails) vs. display floor, social proof claim removal, testimonial authenticity flag, all email capture entry points and waitlist flow (8 entry points), GTM channels, 12-month roadmap, compliance checklist, unit economics, outcome scenarios |
| [seo-strategy.md](wiki/seo-strategy.md) | marketing | 2026-08-12 | Technical SEO setup (SEO.tsx: meta tags, OG, canonical, JSON-LD schemas — FAQPage re-enabled, supersedes prior disabled status), sitemap generation, robots.txt, prerender strategy, Netlify caching/security headers, content SEO, keyword strategy, internal linking architecture, performance optimization priorities, SEO baseline audit (zero impressions, no sitemap submitted, GA4 snapshot), tech-debt audit (soft-404 + Offer schema gaps across 5 files), backlink outreach targets, site-wide meta-injection bug fix (homepage meta shipped on every page) |
| [ad-strategy.md](wiki/ad-strategy.md) | marketing | 2026-08-12 | Meta ad platform strategy (specs, benchmarks, fatigue thresholds), 2026 paid-acquisition/ROAS benchmarks by channel + breakeven-ROAS math, 6 audience segments with pain points/objections, creative approaches, 18-hook bank, 8 ad copy variations, native static ads research (cost/CPM/fatigue data), peptide-maxxing ad angle (slang-hook/editorial-lander split), AI creative system, advertorial landing page design, conversion landing page structure, social content playbook, founding batch conversion psychology, compliance checklist |
| [conversion-learnings.md](wiki/conversion-learnings.md) | conversion | 2026-08-12 | NEW — ROAS levers and traffic-routing validation, pricing/shipping-threshold unit economics (PDP default to 2-pack, $50 free-shipping automatic-discount construction), cold-traffic landing page research (pre-sell vs. PDP conversion rates, message match, Bloom case study), advertorial creation frameworks and format-to-warmth matching, peptide-led creative objection handling (untested), advertorial hero image layout fix |

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
