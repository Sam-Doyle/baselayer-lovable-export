---
article_count: 9
inbox_count: 0
last_updated: 2026-04-03
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
| [product-formula.md](wiki/product-formula.md) | product | 2026-04-03 | SKU, pricing, full ingredient list with concentrations, efficacy data, synergy framework, formulation notes, regulatory/compliance rules, per-ingredient claim restrictions |
| [brand-identity.md](wiki/brand-identity.md) | brand | 2026-04-03 | Brand archetype ("Your Sharp Friend"), voice rules, banned words, messaging pillars, headline formulas, CTA patterns, color systems (monochrome dark + Alpine Navy), typography (DM Sans/Inter + Montserrat), photography direction, logo usage, consistency checklist |
| [customer-insights.md](wiki/customer-insights.md) | brand | 2026-04-03 | ICP profile (M 25-35), 7 named segments, testimonial themes (oil control, partner validation, travel simplicity), 10 ranked objections with FAQ-sourced rebuttals, objection handling patterns, social proof inventory, customer language patterns (exact quotes), pain-point-to-feature mapping, purchase trigger archetypes |
| [site-architecture.md](wiki/site-architecture.md) | technical | 2026-04-03 | Full stack (React 18/Vite 5/Tailwind 3/shadcn), 20-page routing map, analytics (GA4 + Meta Pixel + server-side CAPI), Sanity CMS (7 content types), Supabase backend (edge functions, analytics_events), Netlify deploy with Puppeteer SSR prerender, image optimization pipeline, code splitting strategy, caching/security headers |
| [performance-metrics.md](wiki/performance-metrics.md) | technical | 2026-04-03 | Build pipeline (Vite+Terser+Brotli+Gzip), code splitting (28 lazy routes, deferred QueryClient, manual chunks), image optimization (vite-plugin-image-optimizer, responsive WebP heroes, picture elements, lazy loading, fetchPriority), Netlify caching (immutable assets, stale-while-revalidate HTML), 4 LCP optimizations (async CSS, per-page preloads, HTML skeletons, baked hero pictures), CLS prevention (inline critical CSS, font-display swap, explicit dimensions), third-party deferral (requestIdleCallback analytics), Puppeteer SSR details, known gaps (no AVIF, no web-vitals, no PWA) |
| [competitor-landscape.md](wiki/competitor-landscape.md) | competitive | 2026-04-03 | 11 competitor profiles (Caldera Lab, Kiehl's, Brickell, Lumin, Tiege Hanley, Bulldog, Harry's, Jack Black, Cardon, Geologie, CeraVe) with prices/positioning/weaknesses, ComparisonTable ingredient matrix (6/6 vs 0-1/6), 7 CMS comparison pages, 6 exploitable weaknesses (subscription dark patterns, multi-product complexity, ingredient opacity, greasy textures, faceless brands, questionable ingredients), price tier analysis with $/oz, 6 market gaps, claims comparison matrix, positioning map |
| [launch-timeline.md](wiki/launch-timeline.md) | brand | 2026-04-03 | 10-week pre-launch phases, launch day schedule, Batch 01/02/03 strategy (1K/3-5K/10K+ units), pricing ($38 founding/$48 retail with increase at Batch 02), all email capture entry points and waitlist flow (8 entry points), GTM channels (Meta Ads, Brevo email, SEO/70 articles, founder social), 12-month roadmap (validation/optimize/growth/scale), current pre-launch status, compliance checklist, unit economics ($19 breakeven CAC, 68% gross margin), outcome scenarios |
| [seo-strategy.md](wiki/seo-strategy.md) | marketing | 2026-04-03 | Technical SEO setup (SEO.tsx: meta tags, OG, canonical, JSON-LD schemas for Organization/WebSite/Product/Article/BreadcrumbList/ItemList), sitemap generation (Sanity-driven, build-time), robots.txt (permissive, AI crawlers allowed), prerender strategy (Puppeteer, SPA limitation), Netlify caching/security headers, content SEO (6 ingredient pages, 6 skin concern pages, 15+ articles, 4 product landing pages), keyword strategy (19 pages optimized, 28K/mo gap identified), internal linking architecture (hub-spoke from product page), performance optimization priorities |
| [ad-strategy.md](wiki/ad-strategy.md) | marketing | 2026-04-03 | Meta ad platform strategy (specs, benchmarks, fatigue thresholds), 6 audience segments with pain points/objections, creative approaches (founder talking head, UGC, text statics, POV video), 18-hook bank with top performers, 8 ad copy variations, AI creative system (5-concept PMax framework via Nano Banana Pro), advertorial landing page design (10-section editorial format), conversion landing page structure (cold Meta traffic), social content playbook (4 pillars, TikTok/IG/YouTube strategy), founding batch conversion psychology, compliance checklist |

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
