---
title: SEO Strategy
domain: marketing
created: 2026-04-03
last_compiled: 2026-04-03
revision: 1
sources: [SEO.tsx, generate-sitemap.mjs, robots.txt, netlify.toml, SEO_AUDIT_REPORT.md, SEO_OPTIMIZATION_PLAN.md, KEYWORD_OPTIMIZATION_REPORT.md, INTERNAL_LINKING_VISUAL_MAP.md, content/CLAUDE.md]
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

**Default OG image:** `https://baselayerskin.co/og-image.jpg`
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
| FAQPage | DISABLED | `buildFaqSchema()` returns null (restricted to gov/healthcare since Aug 2023) |

**Organization schema details:**
- Name: "Base Layer"
- Description: "Advanced men's skincare engineered for active lifestyles. Formulated in Breckenridge, Colorado."
- sameAs: Instagram profile
- foundingLocation: Breckenridge, Colorado

**Product schema details (face-cream):**
- Price: $38.00 USD
- Availability: PreOrder
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

## See Also

- `kb/wiki/ad-strategy.md` -- ad landing page SEO considerations
- `~/BaseLayer/marketing/seo/` -- full SEO reports and keyword research
- `~/BaseLayer/content/CLAUDE.md` -- content writing SEO rules
