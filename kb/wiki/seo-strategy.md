---
title: SEO Strategy
domain: marketing
created: 2026-04-03
last_compiled: 2026-08-18
revision: 4
sources: [SEO.tsx, generate-sitemap.mjs, robots.txt, netlify.toml, SEO_AUDIT_REPORT.md, SEO_OPTIMIZATION_PLAN.md, KEYWORD_OPTIMIZATION_REPORT.md, INTERNAL_LINKING_VISUAL_MAP.md, content/CLAUDE.md, Search Console API, GA4 API, /seo-os:tech-debt crawl, /seo-os:backlinks SERP sweep, 3-agent content improvement pass, live verification of /article/peptide-stack after deploy 3aca582]
codePaths:
  - ~/baselayer-lovable-export/src/components/SEO.tsx
  - ~/baselayer-lovable-export/scripts/generate-sitemap.mjs
  - ~/baselayer-lovable-export/public/robots.txt
  - ~/baselayer-lovable-export/netlify.toml
  - ~/BaseLayer/marketing/seo/SEO_AUDIT_REPORT.md
  - ~/BaseLayer/marketing/seo/SEO_OPTIMIZATION_PLAN.md
  - ~/BaseLayer/marketing/seo/KEYWORD_OPTIMIZATION_REPORT.md
  - ~/BaseLayer/marketing/seo/INTERNAL_LINKING_VISUAL_MAP.md
---

# SEO Strategy

## Technical SEO Setup

### Meta Tags & Open Graph

**Implementation file:** `src/components/SEO.tsx`
**Pattern:** Client-side injection via React hooks (`useMetaTags`, `useCanonical`)

The `useMetaTags` hook dynamically sets per-page:
- `document.title`
- `meta[name="description"]`
- `og:title`, `og:description`, `og:type`, `og:url`, `og:image`, `og:image:alt`, `og:site_name`, `og:locale`
- `twitter:card` (summary_large_image), `twitter:title`, `twitter:description`, `twitter:image`, `twitter:site`, `twitter:creator`

**Default OG image:** `https://baselayerskin.co/og-mountain-product-v2.jpg`
**Twitter handle:** `@baselayerskin`

**Limitation (2026-03-18, IG_AD_AUDIT):** Because meta tags are injected client-side (React SPA), crawlers that don't execute JS (including Facebook's sharing debugger) may not see per-page OG data. This is a known issue flagged in the IG Ad Audit Implementation Checklist. Prerendering (see below) is the mitigation path.

### Canonical URLs

**Implementation:** `useCanonical()` hook in `SEO.tsx`
**Pattern:** Dynamically creates/updates `<link rel="canonical">` based on `react-router-dom` pathname
**Base URL:** `https://baselayerskin.co`
**Trailing slash handling:** Stripped (normalizes `/path/` to `/path`)

### www-to-apex Redirect

**Location:** `netlify.toml`
**Rule:** `https://www.baselayerskin.co/*` redirects 301 to `https://baselayerskin.co/:splat`

### JSON-LD Structured Data

**Implementation file:** `src/components/SEO.tsx`
**Renderer:** `<JsonLd data={...} />` component injects `<script type="application/ld+json">` tags

**Schemas implemented:**

| Schema Type | Scope | Location |
|---|---|---|
| Organization | Global (App.tsx) | `organizationSchema` constant |
| WebSite | Global (App.tsx) | `websiteSchema` constant |
| Product | `/face-cream` page | `PRODUCT_SCHEMA` in FaceCream.tsx |
| Article | `/articles/:slug` pages | `buildArticleSchema()` builder |
| BreadcrumbList | Multiple pages | `buildBreadcrumbSchema()` builder |
| ItemList | Index pages (articles, ingredients, etc.) | `buildItemListSchema()` builder |
| FAQPage | ⚠️ SUPERSEDED 2026-08-11 — see below | `buildFaqSchema()` returns null (restricted to gov/healthcare since Aug 2023) — **as compiled 2026-04-03. Corrected 2026-08-11 (3-agent content improvement pass): `buildFaqSchema()` was found hardcoded to return null and has been re-enabled for AI-search extraction.** See "Site-Wide Meta Injection Bug Fix" below. |

**Organization schema details:**
- Name: "Base Layer"
- Description: "Advanced men's skincare engineered for active lifestyles. Formulated in Breckenridge, Colorado."
- sameAs: Instagram profile
- foundingLocation: Breckenridge, Colorado

**Product schema details (face-cream):**
- Price: $38.00 USD
- Availability: InStock (sales opened 2026-08-10; was PreOrder)
- priceValidUntil: 2026-12-31

### Noindex Controls

**Checkout pages:** Blocked via both `robots.txt` (`Disallow: /checkout`) and Netlify `X-Robots-Tag: noindex, nofollow` header for `/checkout` and `/checkout/*`.

---

## Sitemap

**Generator:** `scripts/generate-sitemap.mjs`
**Trigger:** Runs automatically at build time (`"build": "node scripts/generate-sitemap.mjs && vite build"`)
**Output:** `public/sitemap.xml`
**Declared in robots.txt:** `Sitemap: https://baselayerskin.co/sitemap.xml`

**Data source:** Fetches slugs from Sanity CMS at build time via `@sanity/client`
**Project ID:** `27quz10a`
**Dataset:** `production`

### URL Categories in Sitemap

| Category | Priority | Changefreq | URL Pattern |
|---|---|---|---|
| Homepage | 1.0 | weekly | `/` |
| Product pages | 0.9 | monthly | `/face-cream`, `/matte-moisturizer-for-men`, `/non-greasy-moisturizer-for-men`, `/all-in-one-skincare-for-men` |
| Articles index | 0.8 | weekly | `/articles` |
| Content indexes | 0.7 | monthly | `/ingredients`, `/skin-concerns`, `/comparisons` |
| Individual articles | 0.7 | weekly | `/articles/:slug` (includes lastmod from Sanity) |
| Individual ingredients | 0.6 | monthly | `/ingredients/:slug` |
| Individual skin concerns | 0.6 | monthly | `/skin-concerns/:slug` |
| Individual comparisons | 0.6 | monthly | `/comparisons/:slug` |
| About | 0.5 | monthly | `/about` |

**Ingredient exclusions:** retinol and vitamin-c slugs are excluded (not in product formula).

---

## Robots.txt & AI Crawler Policy

**Location:** `public/robots.txt`
**Policy:** Permissive. All crawlers allowed on all pages except `/checkout`.

**AI crawlers explicitly allowed:**
GPTBot, ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended, Amazonbot, Bytespider, CCBot, anthropic-ai, FacebookBot

**Rationale:** Allowing AI crawlers maximizes visibility in AI-powered search (ChatGPT, Perplexity, Claude, Google AI Overviews).

---

## Prerender / SSR Strategy

**Current stack:** React 18 SPA (Vite), client-side rendered
**SSR status:** None. No server-side rendering.
**Prerender status:** Puppeteer is a dependency (`puppeteer: ^24.39.0` in package.json). Netlify build config includes `PUPPETEER_CACHE_DIR`.

**Known limitation (SEO_OPTIMIZATION_PLAN, March 2026):** Client-side rendering means:
- Crawlers that don't execute JS may not see full page content or meta tags
- Lighthouse performance score baseline: 69/100 (homepage)
- LCP was 10.1 seconds (target: <4s)
- Article page CLS: 0.236 (target: <0.1)

**Planned mitigation:** Puppeteer-based build-time prerendering to generate static HTML snapshots. This would solve both the SEO indexing issue and the performance floor for ad landing pages.

**Performance floor estimate (with optimization):** LCP 3.5-4.5s, FCP 1.8-2.2s, Performance Score 80-90/100.

---

## Caching & Performance Headers

**Location:** `netlify.toml`

| Asset Type | Cache-Control | Duration |
|---|---|---|
| `/assets/*`, `*.js`, `*.css`, `*.woff2`, `/fonts/*` | `public, max-age=31536000, immutable` | 1 year |
| `/images/*`, `/lovable-uploads/*` | `public, max-age=31536000, immutable` | 1 year |
| Root-level `*.jpg`, `*.webp`, `*.png` (OG images, logos) | `public, max-age=2592000` | 30 days |
| `*.html` | `public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400` | 1hr edge, 24hr stale |

**Security headers:** HSTS (preload), X-Frame-Options DENY, nosniff, strict referrer, restrictive permissions policy, CSP.

---

## Content SEO Approach

### Content Types & Volume

| Content Type | Sanity Type | Count | URL Pattern | Primary SEO Role |
|---|---|---|---|---|
| Ingredient pages | `ingredient` | 6 | `/ingredients/:slug` | Bottom-funnel, ingredient-specific searches |
| Skin concern pages | `skinConcern` | 6 | `/skin-concerns/:slug` | Mid-funnel, problem-aware searches |
| Blog articles | `article` | 15+ | `/articles/:slug` | Top-funnel education + comparisons |
| Comparison articles | `comparison` | 1+ | `/comparisons/:slug` | Bottom-funnel, brand vs. brand |
| Product landing pages | Static | 4 | `/face-cream`, `/matte-moisturizer-for-men`, etc. | Bottom-funnel, transactional |

### Ingredient Pages (6 pages)

**Ingredients covered:** Niacinamide, Copper Peptide GHK-Cu, Panthenol, Centella Asiatica, Squalane, Hyaluronic Acid
**Keyword pattern:** "[ingredient] for men", "[ingredient] benefits men", "[ingredient] moisturizer"
**Combined estimated search volume:** ~9,200/month
**SEO role:** Build topical authority, capture ingredient-specific searches, internal link to product page

### Skin Concern Pages (6 pages)

**Concerns covered:** Oily Skin Men, Acne-Prone Skin Men, Post-Shave Irritation, Dry/Dehydrated Skin Men, Aging/Wrinkles Men, Dark Circles Men
**Keyword pattern:** "best moisturizer for [concern] men", "[concern] moisturizer men"
**Combined estimated search volume:** ~14,500/month
**SEO role:** Capture problem-aware searches, link to ingredient pages and product

### Blog Articles

**Article types:** Educational (men's skin, routines, mistakes, ingredients), Comparison (vs CeraVe, vs Cetaphil, vs Neutrogena, vs Kiehl's, vs Brickell), Listicles (best moisturizer roundups by skin type)
**Keyword pattern:** "men's skincare routine", "best moisturizer for men", "Base Layer vs [competitor]"
**SEO role:** Top-of-funnel education, comparison intent capture, topical authority

### Product Landing Pages

**Pages:** `/face-cream` (primary), `/matte-moisturizer-for-men`, `/non-greasy-moisturizer-for-men`, `/all-in-one-skincare-for-men`
**Strategy:** Dedicated landing pages targeting high-intent transactional keywords:
- "matte moisturizer for men" (texture-specific)
- "non-greasy moisturizer for men" (texture-specific)
- "all-in-one skincare for men" (simplicity-specific)

---

## Keyword Strategy

### Keyword Optimization Status (March 2026)

**Pages optimized:** 19 content pages fully audited and keyword-optimized
**Strategy:** Natural keyword integration in H1/H2 headings, opening paragraphs, body text, and Sanity `targetKeywords` frontmatter arrays
**Rules:** One primary keyword per article, keyword in H1 + first paragraph + 2-3 H2s naturally, meta descriptions 150-160 chars

### Coverage Assessment

**Strong coverage (existing content):**
- Ingredient searches: ~9.2K monthly volume covered
- Skin concern searches: ~14.5K monthly volume covered
- Educational searches: ~7.5K monthly volume covered

**Critical gaps identified (SEO Audit, March 2026):**

| Gap | Missing Keywords | Est. Monthly Volume | Priority |
|---|---|---|---|
| "Best moisturizer for men" hub | best moisturizer for men, best face moisturizer for men, top rated men's moisturizer | 51K | CRITICAL |
| Skin type + moisturizer pairings | moisturizer for oily/dry/sensitive/combination skin men | 15K | HIGH |
| Ingredient + moisturizer searches | hyaluronic acid/niacinamide/peptide moisturizer for men | 7K | HIGH |
| Lightweight/texture searches | lightweight moisturizer for men, non-greasy face moisturizer | 8.5K | MEDIUM |
| Price-point searches | best men's moisturizer under $50, affordable moisturizer men | 4.6K | MEDIUM |
| Brand comparisons | Base Layer vs Cetaphil/Neutrogena/Kiehl's/Brickell | 8K | CRITICAL |

**Total gap volume:** ~28,000 monthly searches from identified gaps

### Recommended New Pages (from SEO Audit)

1. "Best Men's Face Moisturizer" buyer's guide (target: 8-12K searches)
2. 4-5 skin-type-specific landing pages (target: 600-1.2K visitors/page)
3. 4+ brand comparison pages (already partially built: vs CeraVe, vs Cetaphil, vs Neutrogena, vs Kiehl's, vs Brickell)
4. Lightweight/non-greasy landing pages (built: `/matte-moisturizer-for-men`, `/non-greasy-moisturizer-for-men`)
5. Price-point landing page ("Best Men's Moisturizer Under $50")

---

## Internal Linking Architecture

**Source:** `INTERNAL_LINKING_VISUAL_MAP.md`

**Hub structure:**
```
HOMEPAGE
  |-- PRODUCT PAGE (central hub)
  |     |-- INGREDIENTS (6 pages, bidirectional links)
  |     |-- SKIN CONCERNS (6 pages, bidirectional links)
  |     |-- ARTICLES (15+ pages, bidirectional links)
  |     |-- COMPARISONS (5+ pages, bidirectional links)
```

**Linking rules:**
- Every ingredient page links to: Product page, 2-3 relevant skin concern pages, 1-2 articles
- Every skin concern page links to: Product page, 2-3 relevant ingredient pages, 1-2 articles, comparison page
- Every article links to: Product page (natural placement), relevant ingredient/concern pages
- Product page links to: All ingredient pages, all skin concern pages

**Link anchor text patterns:**
- Product links: "See [ingredient] in our $38 formula"
- Ingredient cross-links: "[Ingredient] helps [concern]"
- Concern to article: "Modified routine for [concern]"

---

## Performance Optimization Priorities (from SEO_OPTIMIZATION_PLAN)

### Image Optimization (P0)

**Current state:** Homepage images 3,982KB (86% of page weight)
**Target:** 550KB (86% reduction)
**Tools planned:** `vite-plugin-image-optimizer`, AVIF/WebP format negotiation, responsive `<ResponsiveImage>` component, lazy loading below-the-fold

### Third-Party Script Optimization (P1)

**Current state:** 451KB in third-party scripts (GA4 151KB, FB Pixel 120KB, fbevents.js 94KB)
**Solution planned:** Partytown web worker offloading, strategic deferral

### Performance Targets

| Metric | Current | Target |
|---|---|---|
| Lighthouse Performance | 69/100 | 80-90/100 |
| LCP | 10.1s | 3.5-4.5s |
| FCP | ~3s | 1.8-2.2s |
| CLS (articles) | 0.236 | <0.1 |

---

---

## SEO Baseline & Technical Audit (2026-08-10)

*Routing note: these four findings arrived tagged `target_article: seo baseline / organic search`, which has no dedicated article — routed here as the closest existing fit.*

### Organic Search Baseline (Search Console API, sc-domain:baselayerskin.co, confidence: high)

Zero recorded search impressions for baselayerskin.co over the trailing 6 months (Feb–Aug 2026). Site is starting organic search from scratch. GA4 property: `properties/526066920` (account "Base Layer Skin", `385687789`).

### Root Cause of Zero Impressions (GSC URL inspection + sitemaps API, /seo-os:dashboard run, confidence: high)

**No sitemap had ever been submitted to Search Console** (0 sitemaps registered), and Google last crawled the homepage 2026-07-01 (40 days stale at time of finding). The homepage itself IS indexed ("Submitted and indexed", robots allowed, fetch OK). Rich results status: Product snippets PASS, Review snippets PASS (4 reviews detected). Merchant listings have 3 warnings — missing `shippingDetails`, `hasMerchantReturnPolicy`, `validFrom` in the Product/Offer schema. **Fix:** generate + submit sitemap.xml, patch the Offer schema fields (see Tech-Debt Audit below for the code-level detail).

### GA4 Traffic Snapshot (GA4 API, properties/526066920, confidence: medium)

Last 28 days (Jul 14–Aug 10): 40 total sessions — Direct 31, Organic Search 3 (100% engagement; non-Google since GSC shows 0 clicks, likely Bing/DDG), Organic Social 2, Referral 1. Top pages: `/` (17), `/face-cream` (6), `/skin-concerns/post-shave-irritation` (4). Article and ingredient pages are already receiving trickle traffic. **Action:** also submit the sitemap to Bing Webmaster Tools, not just Google.

### Tech-Debt Audit (2026-08-10, /seo-os:tech-debt live crawl of all 59 sitemap URLs + repo inspection, confidence: high)

Site is structurally clean: 0 redirect chains, 0 canonical errors, 0 noindex, 0 4xx; prerendered HTML has correct canonicals; www/http variants 301 correctly; trailing-slash duplicates are neutralized by canonicals. A valid 59-URL `sitemap.xml` IS live and referenced in `robots.txt` — the only submission gap is that it was never submitted to GSC via API (blocked: our OAuth scope is `webmasters.readonly` by design; manual UI submit required).

**Two real defects found:**
1. **Soft-404:** the SPA fallback `/* /index.html 200` in `public/_redirects` serves the homepage shell at unknown URLs instead of a real 404. Fix: prerender `404.html` + `/* /404.html 404`.
2. **Duplicated Offer schema gaps:** the product Offer schema is duplicated across 5 page files (`FaceCream.tsx`, `Index.tsx`, `ProductDetail.tsx`, `MatteMoisturizer.tsx`, `NonGreasyMoisturizer.tsx`) and all five are missing `shippingDetails`, `hasMerchantReturnPolicy`, `validFrom`.

Tickets logged at `runs/tech-debt-2026-08-10.md`.

## Link Building / Backlinks (2026-08-10, SERP sweep via /seo-os:backlinks, confidence: medium)

No Ahrefs access — targets are SERP-derived. **Tier 1 niche DTC reviewers** that hand-test competitor brands: The Adult Man (has a Geologie vs Tiege vs Lumin head-to-head), Fin vs Fin (DTC comparison specialist), Honest Brand Reviews, ReadySleek, Dapper & Groomed (over-40 tested roundup), The Modest Man, The Dermatology Review, Effortless Gent. **Free listings:** Skinsort ingredient DB, Trustpilot claim. **Parked until review corpus exists:** big pubs (Forbes Vetted, CNN, Rolling Stone). **Key unlock:** an affiliate program before any outreach — all Tier 1 sites monetize via affiliate. **Ignore** these competitor-owned fake roundups found in the sweep: striveskin, henkeys, rawdog. Full list at `runs/backlinks-2026-08-10.md`.

## Site-Wide Meta Injection Bug Fix (2026-08-11, 3-agent content improvement pass — copy editor / designer / SEO, confidence: high)

**Root bug:** `injectMeta()` in `vite.config.ts` had rigid regexes that failed on multi-line and self-closing meta tags — as a result, **every page shipped the homepage's meta description/OG/Twitter tags to crawlers since launch**, not its own.

**Also fixed in the same pass:**
- `buildFaqSchema()` was hardcoded to return `null` — re-enabled for AI-search extraction (supersedes the FAQPage row in the JSON-LD table above).
- Comparison page "Our Verdict" section rendered empty (a plain string was being passed to the PortableText renderer, which expects Portable Text blocks).
- Comparison page `extractableSummary` field was never rendered at all — now rendered as a Key Takeaways block.
- ItemList schema was missing on index pages that should have carried it.
- Comparison schema type has no `author` field — an E-E-A-T gap worth closing.

**Content integrity findings from the same pass:** the over-40 article had fabricated competitor absorption times (reframed to a label-based formula-weight analysis in drafts); the "we tested 10+" `metaDescription` was false on two counts (actually 5 products, and no formal testing was done). Also flagged: the brand doc `~/BaseLayer/brand/_brand-context.md` describes a dark monochrome visual identity, but the live site is a light theme with navy/orange — that doc is stale (see `kb/wiki/brand-identity.md` for the compiled brand system, which reflects the live site).

## Advertorials Are Not Actually Noindexed (2026-08-12, live verification of baselayerskin.co after deploy 3aca582, confidence: high)

⚠️ **Open decision — resolve before scaling spend to these URLs.**

Advertorials are kept out of the prerender and out of the sitemap, but **that is
not a noindex.** None of the four pages under `src/pages/advertorials/` emit
`<meta name="robots">`, and `robots.txt` disallows only `/checkout`.

Verified live: `/article/peptide-stack` returns **200 with a self-referencing
canonical and no robots directive.**

Sitemap exclusion only stops discovery *through the sitemap*. Google can still
index these from ad clicks, referrals, or external links. For paid presell pages
that carry a "paid partnership" disclosure, that is probably not the intended
posture.

Because they are served via `/article/*  /__shell.html  200`, enforcement is
either:
1. A `Disallow: /article/` line in `robots.txt`, or
2. A `noindex` emitted through `useMetaTags`

Option 2 is the stronger signal — `robots.txt` blocks crawling but does not
reliably prevent indexing of a URL that has inbound links.

---

## See Also

- `kb/wiki/technical-seo.md` -- crawl/index/schema/prerender delivery mechanics:
  duplicate schema and title drift, GSC warning triage, sitemap `lastmod`, and the
  prerender failure that shipped the homepage empty
- `kb/wiki/ad-strategy.md` -- ad landing page SEO considerations
- `~/BaseLayer/marketing/seo/` -- full SEO reports and keyword research
- `~/BaseLayer/content/CLAUDE.md` -- content writing SEO rules
