---
article_count: 11
inbox_count: 0
last_updated: 2026-08-13
---

# Base Layer Knowledge Base — Index

Read this file at session start. It tells you what's in the wiki and where to find it.

## Quick Reference

- **Product**: Performance Daily Face Cream (BL-PDFC-50ML), 50 mL
- **Price**: $38 single / **$68 2-pack (PDP default)** / $35 Subscribe & Save every 6 weeks. $48 retail is the strikethrough anchor and the Batch 02 target. Source of truth: `src/config/product.ts` (`npm run verify:pricing`)
- **Shipping**: SHIP26 is applied automatically for free U.S. standard shipping. Landed cost **$7.12 single / $7.75 2-pack** (measured 88 g product + carton per unit, plus 8 g 9x12 poly mailer; USPS GA 4 oz / 8 oz tiers). Shopify variant weights: **88 g single / 176 g 2-pack**. Buy labels through **Shopify Shipping** — ~6% under published Commercial
- **Domain**: baselayerskin.co
- **Stack**: React 18 + Vite + Tailwind + Supabase + Sanity
- **Brand context**: `~/BaseLayer/brand/_brand-context.md`

## Wiki Articles

| Article | Domain | Last Compiled | Summary |
|---------|--------|---------------|---------|
| [product-formula.md](wiki/product-formula.md) | product | 2026-08-13 | SKU, pricing (flagged stale vs. current $35 Subscribe & Save tier), all six published formula concentrations (5% niacinamide, 0.03% GHK-Cu, 2% panthenol, 2% centella, 3% squalane, 0.5% hyaluronic acid), full ordered INCI, efficacy data, synergy framework, formulation notes, fragrance-free substantiation, regulatory/compliance rules, and per-ingredient claim restrictions |
| [brand-identity.md](wiki/brand-identity.md) | brand | 2026-08-12 | Brand archetype ("Your Sharp Friend"), voice rules, banned words, messaging pillars, headline formulas, CTA patterns, color systems (monochrome dark + Alpine Navy), typography (DM Sans/Inter + Montserrat), photography direction, logo usage, consistency checklist, advertorial imagery rules (never generate synthetic product shots; Preset C's #E53E3E fails the 4.5:1 accent gate — use the brand-accent token) |
| [customer-insights.md](wiki/customer-insights.md) | brand | 2026-08-12 | ICP profile (M 25-35), 7 named segments, testimonial themes (oil control, partner validation, travel simplicity), 10 ranked objections with FAQ-sourced rebuttals, objection handling patterns, social proof inventory (4.8/5 + 1,000+ claims corrected to false — code truth is 0 rating/0 count, 3 real testers), compliance flag on live banned-phrase FAQ copy, customer language patterns (exact quotes), pain-point-to-feature mapping, purchase trigger archetypes, 2026 shopper review expectations (4.0–4.7 optimal band with 5.0 hurting conversion, 5-review trust threshold, 82% seek negatives, 85% call >3-month reviews irrelevant, 62% lift from photos) |
| [site-architecture.md](wiki/site-architecture.md) | technical | 2026-08-13 | Full React/Vite/Netlify architecture, Shopify Storefront checkout, Sanity CMS, Puppeteer prerender, security/caching, native build-time Judge.me pipeline with corrected verification/product filtering, analytics event queue and checkout measurement boundaries |
| [performance-metrics.md](wiki/performance-metrics.md) | technical | 2026-08-13 | Build compression/code-splitting, responsive media, preload/skeleton LCP work, CLS remediation and web-vitals monitoring, Judge.me 320px photo delivery, and the intermittent prerender read-stream race |
| [competitor-landscape.md](wiki/competitor-landscape.md) | competitive | 2026-08-13 | 11 core competitor profiles plus Blueprint's customized Shopify/Eurus PDP teardown, positioning/price matrices, exploitable category weaknesses, and the Base Layer UX/performance priorities adopted from the audit |
| [launch-timeline.md](wiki/launch-timeline.md) | brand | 2026-08-12 | 10-week pre-launch phases, launch day schedule, Batch 01/02/03 strategy (1K/3-5K/10K+ units), pricing ($38 founding/$48 retail with increase at Batch 02), Subscribe & Save added as optional tier + anti-subscription copy reconciliation (2026-07-07), real waitlist count (13 emails) vs. display floor, social proof claim removal, testimonial authenticity flag, all email capture entry points and waitlist flow (8 entry points), GTM channels, 12-month roadmap, compliance checklist, unit economics, outcome scenarios |
| [seo-strategy.md](wiki/seo-strategy.md) | marketing | 2026-08-12 | Technical SEO setup (SEO.tsx: meta tags, OG, canonical, JSON-LD schemas — FAQPage re-enabled, supersedes prior disabled status), sitemap generation, robots.txt, prerender strategy, Netlify caching/security headers, content SEO, keyword strategy, internal linking architecture, performance optimization priorities, SEO baseline audit (zero impressions, no sitemap submitted, GA4 snapshot), tech-debt audit (soft-404 + Offer schema gaps across 5 files), backlink outreach targets, site-wide meta-injection bug fix (homepage meta shipped on every page) |
| [ad-strategy.md](wiki/ad-strategy.md) | marketing | 2026-08-12 | Meta ad platform strategy (specs, benchmarks, fatigue thresholds), 2026 paid-acquisition/ROAS benchmarks by channel + breakeven-ROAS math, 6 audience segments with pain points/objections, creative approaches, 18-hook bank, 8 ad copy variations, native static ads research (cost/CPM/fatigue data), peptide-maxxing ad angle (slang-hook/editorial-lander split), AI creative system, advertorial landing page design, conversion landing page structure, social content playbook, founding batch conversion psychology, compliance checklist, measured image-gen routing (fal.ai nano-banana-pro ~$0.20/img is the working path; higgsfield free plan 403s on recraft_v4_1) |
| [conversion-learnings.md](wiki/conversion-learnings.md) | conversion | 2026-08-13 | ROAS and traffic routing, measured tier economics, single-bottle discount floor, subscription/F&F guardrails, cold-traffic and advertorial frameworks, conservative competitor disclosure, plus native review histogram/photo-strip behavior and its open low-volume gate test |
| [shipping-economics.md](wiki/shipping-economics.md) | technical | 2026-08-13 | rev 4 — canonical **88 g product-plus-carton weight per unit** (96 g single / 184 g 2-pack including mailer), with quoted carrier rates still in the same 4 oz / 8 oz tiers ($7.12 single / $7.75 2-pack landed), three counterintuitive rules (DIM irrelevant under 1 cu ft, GA Cubic is a trap for light parcels, below-Commercial label source is worth ~$1.86/order after the 2026-07-12 ounce-tier elimination), supplier and Shopify configuration, and airless-pump protection analysis in the purchased 9x12 poly mailer |

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
