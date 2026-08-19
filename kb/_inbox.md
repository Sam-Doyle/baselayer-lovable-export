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

**Last compiled:** 2026-08-18 — 12 entries cleared. Five SEO/prerender findings
seeded the new `wiki/technical-seo.md`; four measurement findings (GA4 reserved
`source`, `_gl` on subdomains, Meta catalog content IDs, Brevo lifecycle split)
went to `site-architecture`; two CRO hypotheses to `conversion-learnings`; the
product-scoped selling plan to `shipping-economics`.

<!-- New entries below this line -->

_Last compiled: 2026-08-18 — 4 entries compiled into `wiki/technical-seo.md` (rev 2) and `wiki/seo-strategy.md` (rev 5)._

---
date: 2026-08-19
category: technical
source: art-director subagent verification (get_schema + ComparisonDetail.tsx read)
confidence: high
target_article: technical-seo
---
Comparison detail pages have no og:image path at all: the deployed `comparison` schema has no image field, and ComparisonDetail.tsx calls useMetaTags({title, description}) with no image param, so every comparison page falls back to the generic /og-mountain-product-v2.jpg (not even /og-comparisons.jpg, which is wired only to the /comparisons index). Fix requires a schema field + frontend change. Related: the commuter article's working hero lives in a legacy `heroImage` field not in the current article schema (kept alive by coalesce(heroImage, mainImage) in queries.ts), so it may not be editable from Studio.

---
date: 2026-08-19
category: conversion
source: 2026-08-19 article overhaul (comparison page a2f9507e)
confidence: high
target_article: conversion-learnings
---
FAQ answers drift from comparison tables: the comparison page's FAQ schema cited CeraVe $19 / Bulldog $9 / Base Layer $44 / Kiehl's $38 while the table said $20/$16/$38/$48, and "Best for Beginners" + verdict recommended Cetaphil, a product not in the 5-brand table (same class of error as the Jack Black/Lab Series ghosts). When repricing or repositioning a comparison, sweep FAQs and verdict blocks too, and grep for brands not in itemsCompared. Also: copy agents told "no em dashes" will substitute literal " -- " which renders as double hyphens; scan agent copy for "--" before publishing.

---
date: 2026-08-19
category: technical
source: this session (Sanity CLI 7.18.0)
confidence: high
target_article: site-architecture
---
Sanity asset upload path that works from CLI: `npx sanity@latest api "https://27quz10a.api.sanity.io/v2024-01-01/assets/images/production?filename=X" -X POST --input <file> -H "Content-Type: image/webp"` (the CLI has no assets-upload command; MCP dataset_assets_upload is guidance-only). Content edits via MCP patch_documents save to drafts; publish_documents makes live; served HTML then needs a Netlify rebuild (`netlify api createSiteBuild`) because article/comparison pages are prerendered with Sanity content baked in.

---
date: 2026-08-19
category: marketing
source: /last30days research (YouTube transcripts, X, web — raw: kb/raw/research/2026-08-19-instagram-viral-iphone-settings.md)
confidence: high
target_article: instagram-content-strategy
---
IG Reels algorithm (Aug 2026, Mosseri-confirmed ranking order, unchanged through July/Aug): watch time/completion first, then sends per reach (DM shares), then likes per reach. Original content gets 40-60% more distribution than reposts; accounts posting 10+ reposts in 30 days are excluded from recommendations entirely. heyDominik (389K views) benchmark: sub-30% completion to cold audiences = bad, 35-50% = blow-up range. Best viral length 7-45s; hook decides in first 2s; 3-5 niche hashtags; use Trial Reels to test on non-followers first. Aug 2026 trend: low-production single-take content outperforming polished posts.

---
date: 2026-08-19
category: marketing
source: /last30days research (Dunna Did It YouTube 476K views, CapCut/Lilach Bullock guides)
confidence: high
target_article: instagram-content-strategy
---
Reels upload quality settings: export exactly 1080x1920 (NOT 4K — IG's downconversion butchers it), 30fps, H.264 MP4, ~8-16 Mbps bitrate (Dunna Did It uses 16,000 kbps), AAC 256kbps/48kHz audio. In IG app: Upload at Highest Quality ON (Settings > Media quality), Data Saver OFF.

---
date: 2026-08-19
category: marketing
source: /last30days research (Andrew Ethan Zeng 726K views, George Lock 460K views, @faye.gela TikTok)
confidence: high
target_article: instagram-content-strategy
---
iPhone filming settings consensus for social content: 4K 30fps default (60fps only for motion, needs more light), HDR Video OFF (crunchy skin tones, inconsistent after IG compression), High Efficiency format, PAL formats OFF, macro/flower auto-switch OFF, only shoot at native zoom stops (1x/2x/3x/5x — never 1.7x/2.4x, quality drops), back camera, native camera app not in-app IG/TikTok camera, Grid + Level ON, clean lens before filming. Photos: 24MP default, switch to 48MP RAW for hero shots/low light.

---
date: 2026-08-19
category: product
source: product photography (src/assets/product-source/) + FaceCream.tsx + live comparison audit
confidence: high
target_article: product facts
---
Canonical active concentrations (per FaceCream.tsx FAQ, the site's source of truth): niacinamide 5%, GHK-Cu 0.03%, panthenol 2%, centella asiatica 2%, squalane 3%, hyaluronic acid 0.5%. The physical packaging prints ONLY "5% Niacinamide + Copper Peptides" (box); the bottle back label is a plain INCI list with zero percentages (copper appears as Copper Tripeptide-1). The comparison page shipped with fabricated numbers (GHK-Cu 1.5%, Squalane 8-12%, Panthenol 3%) that contradicted the site; corrected to canonical set 2026-08-19. Any future copy claiming label-printed concentrations is only defensible for niacinamide 5%.

---
date: 2026-08-19
category: conversion
source: GSC index_inspect API, 2026-08-19
confidence: high
target_article: seo-indexing
---
GSC verdicts on the three "failed" SEO pages: /all-in-one-skincare-for-men was actually INDEXED (crawled 2026-08-17). /matte-moisturizer-for-men: "Crawled - currently not indexed", last crawl 2026-05-21 (crawled once, rejected). /non-greasy-moisturizer-for-men: "Discovered - currently not indexed" (never crawled). Root cause found: zero crawlable internal links pointed at these pages; the only referring URL Google knew was the homepage, the footer skipped them, and SkinConcernQuiz navigates client-side. Fix shipped 2026-08-19: footer links (site-wide), Learn More grid links from the indexed all-in-one page, Related Reading cross-links between siblings, plus full copy differentiation (matte = oily skin/shine angle, non-greasy = texture/absorption angle) and real photography replacing the duplicated generated-creative PNGs both pages shared. Sitemap lastmod updates automatically from git commit dates on static routes.

---
date: 2026-08-19
category: product
source: user (Sam), authoritative formulation spec
confidence: high
target_article: formulation / canonical concentrations
---
CORRECTION to earlier canonical-concentrations entry from today: Sam's authoritative spec is Niacinamide 5%, GHK-Cu 0.03%, Panthenol 2% (confirmed keep), Centella asiatica 1%, Disodium EDTA 0.075% (chelator, full-disclosure contexts only, not a marketing active), Hyaluronic Acid = the cream base (no percentage claim), Squalane = no published percentage. The earlier entry's centella 2%, squalane 3%, and HA 0.5% values are WRONG and came from a stale FaceCream.tsx FAQ. Fixed 2026-08-19 in code (FaceCream FAQ, centella cards on matte/non-greasy/all-in-one pages) and in Sanity (comparison keyIngredients plus four skinConcern docs that claimed GHK-Cu 1.5% and squalane 8-12%).
