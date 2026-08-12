---
title: Site Architecture
domain: technical
created: 2026-04-03
last_compiled: 2026-08-12
revision: 2
sources: [package.json, vite.config.ts, App.tsx, netlify.toml, tailwind.config.ts, tsconfig.json, analytics.ts, sanity.ts, netlify _redirects, live Storefront API testing, production debugging, /last30days research, Sanity assets API]
codePaths:
  - src/App.tsx
  - vite.config.ts
  - tailwind.config.ts
  - netlify.toml
  - public/_redirects
  - src/lib/analytics.ts
  - src/lib/sanity.ts
  - src/analytics/MetaRouterTracker.tsx
  - src/analytics/ScrollDepthTracker.tsx
  - src/analytics/SectionViewTracker.tsx
  - src/integrations/supabase/client.ts
  - supabase/config.toml
  - scripts/generate-sitemap.mjs
---

## Stack Overview

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | React | 18.3 |
| **Build tool** | Vite | 5.4 (SWC plugin) |
| **Language** | TypeScript | 5.8 |
| **CSS** | Tailwind CSS | 3.4 + tailwindcss-animate |
| **UI library** | shadcn/ui (Radix primitives) | ~20 Radix packages |
| **State** | Zustand | 5.0 |
| **Data fetching** | TanStack React Query | 5.83 (deferred load) |
| **Routing** | React Router DOM | 6.30 |
| **CMS** | Sanity | Client 7.17 + image-url 2.0 |
| **Backend** | Supabase | JS client 2.97 |
| **Deploy** | Netlify | Static + edge headers |
| **Fonts** | Montserrat (heading), Inter (body) via @fontsource | - |

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `@vitejs/plugin-react-swc` | Fast React compilation via SWC |
| `@portabletext/react` | Renders Sanity Portable Text (rich content) |
| `@sanity/client` + `@sanity/image-url` | CMS data fetching and image URL generation |
| `@supabase/supabase-js` | Backend: auth, waitlist, analytics events, edge functions |
| `@tanstack/react-query` | Async data fetching with caching (deferred load to avoid blocking FCP) |
| `zustand` | Lightweight client state (cart, UI state) |
| `react-hook-form` + `zod` | Form handling with schema validation |
| `sharp` | Build-time image processing |
| `svgo` | SVG optimization at build |
| `terser` | JS minification (strips console.log/warn/debug/info) |
| `vite-plugin-image-optimizer` | PNG/JPEG/WebP quality optimization at build (quality: 75) |
| `vite-plugin-compression` | Brotli + gzip pre-compression of assets |
| `puppeteer` | Build-time Puppeteer SSR for pre-rendering pages |
| `lovable-tagger` | Dev-mode component tagging (Lovable platform) |
| `recharts` | Data visualization (comparison charts) |
| `embla-carousel-react` | Carousel/slider component |
| `sonner` + `@radix-ui/react-toast` | Toast notifications |
| `vaul` | Drawer component |
| `cmdk` | Command palette component |
| `next-themes` | Dark mode class toggling |
| `class-variance-authority` + `clsx` + `tailwind-merge` | shadcn/ui styling utilities |

## Routing Structure

**Router**: `BrowserRouter` (client-side, no SSR runtime)

### Static Pages

| Route | Component | Lazy | Notes |
|-------|-----------|------|-------|
| `/` | `Index` | No (eagerly loaded) | Homepage, hero skeleton baked into HTML |
| `/face-cream` | `FaceCream` | Yes | Product detail page, hero skeleton baked |
| `/matte-moisturizer-for-men` | `MatteMoisturizer` | Yes | SEO landing page variant |
| `/non-greasy-moisturizer-for-men` | `NonGreasyMoisturizer` | Yes | SEO landing page variant |
| `/all-in-one-skincare-for-men` | `AllInOneSkincare` | Yes | SEO landing page variant |
| `/about` | `About` | Yes | Brand story |
| `/checkout` | `Checkout` | Yes | noindex/nofollow via headers |
| `/articles` | `Articles` | Yes | Article index (Sanity) |
| `/articles/:slug` | `ArticleDetail` | Yes | Individual article (Sanity) |
| `/ingredients` | `Ingredients` | Yes | Ingredient index (Sanity) |
| `/ingredients/:slug` | `IngredientDetail` | Yes | Individual ingredient (Sanity) |
| `/skin-concerns` | `SkinConcerns` | Yes | Skin concern index (Sanity) |
| `/skin-concerns/:slug` | `SkinConcernDetail` | Yes | Individual skin concern (Sanity) |
| `/comparisons` | `Comparisons` | Yes | Comparison index (Sanity) |
| `/comparisons/:slug` | `ComparisonDetail` | Yes | Individual comparison (Sanity) |
| `/product/:handle` | `ProductDetail` | Yes | Generic product by handle |
| `/lp` | `LandingPage` | Yes | Ad landing page |
| `/article/5-reasons` | `Listicle` | Yes | Listicle ad creative |
| `/article/2-minute-routine` | `ListicleGirlfriend` | Yes | Listicle ad creative |
| `*` | `NotFound` | Yes | 404 fallback |

### Redirects (client-side)

| From | To | Type |
|------|----|------|
| `/blog` | `/articles` | `<Navigate replace>` |
| `/blog/:slug` | `/articles` | `<Navigate replace>` |
| `/ingredients/copper-peptide-ghk-cu` | `/ingredients/copper-peptide` | `<Navigate replace>` |

### Redirects (Netlify `_redirects`)

Defined in `public/_redirects`. Includes:
- Product URL variants (`/product`, `/shop`, `/products/*`) to `/face-cream`
- Blog canonical redirects (`/blog/*` to `/articles/*`)
- Article slug variants (old slugs to current)
- Ingredient slug variants (long-form to short-form)
- Skin concern slug variants (generic to specific)
- SPA fallback: `/* /index.html 200` (last rule)

At build time, the prerender plugin rewrites the `_redirects` to insert per-page forced rewrites (e.g., `/face-cream /face-cream/index.html 200!`) and changes the SPA fallback to `/* /__shell.html 200`.

## Analytics and Tracking

### Architecture

Three-tier tracking: GA4 (browser) + Meta Pixel (browser) + Meta Conversions API (server-side via Supabase Edge Function). All events use a shared `event_id` (UUID) for browser/server deduplication.

### GA4 (Google Analytics 4)

- **Measurement ID**: `G-E1GTL9RHY0`
- **Loading**: Deferred via `requestIdleCallback` / 3s fallback in `App.tsx`
- **Events**: `page_view` (automatic + SPA route changes), `scroll_depth`, `section_view`, plus custom events via `trackEvent()`
- **UTM handling**: Captured from `window.__BL` (set in index.html before React) and persisted to sessionStorage

### Meta Pixel (Facebook)

- **Pixel ID**: `916078074161719`
- **Loading**: Deferred alongside GA4
- **Standard events**: `PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`, `Lead`, `CompleteRegistration`
- **Custom events**: `ScrollDepth`, `SectionView`
- **Bot detection**: Disabled for Lighthouse/HeadlessChrome/iframes via `__META_PIXEL_DISABLED__`
- **CAPI Gateway block**: Requests to `capig.datah04.com` are silently dropped (CAPI handled server-side)

### Meta Conversions API (Server-Side)

- **Endpoint**: Supabase Edge Function at `${VITE_SUPABASE_URL}/functions/v1/fb-capi`
- **Immediate PageView**: Fired from `App.tsx` on mount (before pixel loads) for 100% coverage
- **SPA PageView**: Fired from `MetaRouterTracker` on every route change
- **High-value events**: `email_signup`, `waitlist_signup`, `begin_checkout`, `purchase_intent`, `add_to_cart`, `reserve_intent`, `view_item`
- **User data**: `client_user_agent`, `external_id` (bl_session cookie), `_fbc`, `_fbp`, email (when captured)
- **Uses raw `fetch()` with `keepalive: true`** -- no Supabase SDK dependency on the CAPI path

### Supabase Analytics Events

- All `trackEvent()` calls also insert into `analytics_events` table
- Fields: `event_name`, `payload`, `session_id`, `user_agent`, `referrer`

### Tracker Components

| Component | Location | Behavior |
|-----------|----------|----------|
| `MetaRouterTracker` | `src/analytics/MetaRouterTracker.tsx` | SPA route-change tracking for GA4 + Pixel + CAPI. Skips initial mount. Polls up to 3s for deferred scripts. |
| `ScrollDepthTracker` | `src/analytics/ScrollDepthTracker.tsx` | Fires at 25/50/75/100% scroll thresholds (GA4 + Pixel custom event) |
| `SectionViewTracker` | `src/analytics/SectionViewTracker.tsx` | IntersectionObserver (30% threshold) on named sections: Hero, Ingredients, Why Men Quit, Payoff, Testimonials, Guarantee, Product, Who We Are |

### Session Management

- **`bl_session`**: Persistent cookie (30 days) + sessionStorage fallback. Generated as UUID. Used as `external_id` for Meta CAPI.
- **`_fbp`**: Generated immediately on first visit if missing (bypasses pixel load race condition). Format: `fb.1.{timestamp}.{random}`.
- **`_fbc`**: Extracted from `fbclid` URL parameter on landing. Format: `fb.1.{timestamp}.{fbclid}`.
- **UTMs**: Captured from URL on mount, persisted to sessionStorage, attached to CAPI custom_data.

## CMS Integration (Sanity)

**Project ID**: `27quz10a`
**Dataset**: `production`
**API Version**: `2024-01-01`
**CDN**: Enabled for client-side reads; disabled for build-time fetches
**Client**: `src/lib/sanity.ts`

### Content Types (defined in `src/lib/sanity.ts` TypeScript interfaces)

| Type | Route Pattern | Key Fields |
|------|--------------|------------|
| `article` | `/articles/:slug` | title, slug, author (ref), mainImage, body (Portable Text), contentPillar, relatedIngredients/Concerns/Products, FAQs, SEO |
| `ingredient` | `/ingredients/:slug` | name, inciName, slug, benefits (with efficacy + study links), concentration range, maleSpecificBenefits, heroImage, FAQs, SEO |
| `skinConcern` | `/skin-concerns/:slug` | title, slug, overview, rootCauses, preventionTips (all Portable Text), recommendedIngredients/Products, FAQs, SEO |
| `comparison` | `/comparisons/:slug` | title, slug, comparisonType, itemsCompared (name/pros/cons), verdict, body (Portable Text), FAQs, SEO |
| `product` | `/product/:handle` | name, slug, price, inStock, image, ingredients (refs), skinTypes, rating, reviewCount, SEO |
| `routineGuide` | (not currently routed) | title, slug, skinType, concern (ref), timeOfDay, steps, commonMistakes, FAQs, SEO |
| `author` | (not directly routed) | name, slug, credentials, image, bio, linkedin |

### Image Handling

Sanity images use `@sanity/image-url` builder via `urlFor(source)` helper in `src/lib/sanity.ts`.

**SVG support (2026-08-12, Sanity assets API + cdn.sanity.io):** Sanity accepts SVG image uploads (`POST /assets/images/{dataset}`), and the CDN serves them 200 even with `?w=&auto=format` transform params, so the existing PortableText image renderer works unchanged on SVG assets. Hand-built branded SVG comparison graphics (16:9 to match the renderer's crop) are the right tool for text-heavy article graphics — AI image generation garbles numbers/text.

### Build-Time Sanity Fetches

The Vite prerender plugin fetches all published slugs from Sanity at build time to:
1. Generate pre-rendered HTML files with correct meta tags and JSON-LD
2. Generate `sitemap.xml` with all dynamic URLs

## Backend Integration (Supabase)

**Project ID**: `rxcoecpfznxkprnvqmem`
**Client**: `src/integrations/supabase/client.ts` (auto-generated)
**Auth**: localStorage persistence, auto-refresh tokens

### Edge Functions

| Function | JWT Verify | Purpose |
|----------|-----------|---------|
| `fb-capi` | No | Meta Conversions API proxy. Receives event data from browser, forwards to Facebook. |
| `email-subscribe` | (default) | Email/waitlist signup handler |

### Database Tables (inferred from code)

- `analytics_events`: Event tracking (event_name, payload, session_id, user_agent, referrer)
- Waitlist/email tables (used by email-subscribe function)

### Migrations

Three migrations exist in `supabase/migrations/` (dated 2026-02-25).

## Shopify Checkout Integration

Base Layer's checkout runs through the Shopify Storefront API rather than the originally-planned Shopify Buy Button (see `kb/wiki/launch-timeline.md` for the pre-launch plan). Wired in and debugged July 2026.

### Domain Conflict (2026-07-06, live Storefront API testing during checkout wiring)

`baselayerskin.co` is set as the Shopify store's primary domain while DNS actually serves Netlify. As a result, Storefront-API `checkoutUrls` point at `baselayerskin.co/cart/c/*`, which the SPA swallows (no matching route), and `base-layer-skin.myshopify.com` 301s back to the apex, creating a redirect loop.

**Fix requires Shopify admin action** (one of):
1. Remove the apex domain from Shopify — checkout falls back to the myshopify domain, or
2. Connect `shop.baselayerskin.co` as the Shopify primary domain — branded checkout, no Netlify conflict.

**Interim mitigation:** Netlify `/cart/c/*` passthrough rules added as a backstop.

**Also noted:** only one Shopify variant existed as of 2026-07-06 (1-bottle, $38); 2/3-bottle tiers were hidden in `src/config/product.ts` pending variant creation and GID pasting.

### Netlify Deploy Gotchas (2026-07-08, production debugging — CSP fix never deployed)

1. A `netlify.toml` copied into the publish dir (there was a stale duplicate in `public/`) takes precedence over `_headers` on deploy. Only the root `netlify.toml` + `public/_headers` should define headers — the duplicate has been deleted.
2. `netlify deploy --prod` via the CLI hung indefinitely at deploy creation on multiple occasions (three deploys stuck in "new" state, 0 files attached, one for 51 minutes). **Reliable workaround:** zip `dist` and `POST` it directly to `api.netlify.com/api/v1/sites/<id>/deploys` with `Content-Type: application/zip`.
3. Adding an option to a Shopify product **recreates all of its variants** — old variant GIDs die. Always re-fetch GIDs from the Storefront API after any structural product change.

## Shopify App Stack Research (2026-08-11, /last30days research)

**Note:** Base Layer is a headless custom storefront (this React/Vite site), not a Shopify theme, so most storefront-rendering Shopify apps (reviews widgets, upsell apps, popups) do not apply directly — only apps that operate server-side or at checkout are relevant.

**Consensus minimum stack for a new DTC skincare store** (source: X merchant posts, Reddit app roundups, beauty app guides): reviews (Judge.me, cited 5-15% PDP conversion lift), email/SMS (Klaviyo, cited 10-30% incremental revenue once flows are tuned), subscriptions (Recharge / Loop / Skio), bundles for AOV. Beauty-specific finding: beauty buyers read reviews more than any other category, and filterable reviews (skin type, age, concern) outperform an unsegmented review block.

**"App overload" narrative caveat (2026-08-11, X posts from @shabnam_774, @riyazmd774, @heyalexmoore, July 29–Aug 1 2026):** the loudest "app overload" narrative on X right now is largely affiliate promotion, not organic consensus — three accounts posted near-identical "one app for reviews, another for upsells, another for email..." copy within four days, all funneling toward all-in-one bundle apps (Vitals named explicitly). Treat as paid promotion. The one genuinely organic stack post in the window is @seempaq (86 likes), listing a real merchant stack: FoxSell Bundles, Zapiet, DiscountKit, Recheck, Judge.me.

## Deploy Pipeline (Netlify)

**Domain**: `baselayerskin.co`
**Publish dir**: `dist`
**Node version**: 18
**Puppeteer cache**: `/opt/build/cache/.puppeteer`

### Build Process

1. `npm run build` executes: `node scripts/generate-sitemap.mjs && vite build`
2. **Pre-build**: `generate-sitemap.mjs` fetches all Sanity slugs and writes `public/sitemap.xml`
3. **Vite build**: Compiles React app, optimizes images, applies code splitting
4. **Post-build** (Vite `closeBundle` hook):
   a. Fetches all dynamic pages from Sanity
   b. Generates per-page HTML files with injected meta tags, JSON-LD, OG data, canonical URLs
   c. Injects above-the-fold skeletons (hero images + critical copy baked into HTML)
   d. Runs **Puppeteer SSR**: spins up local server, renders each page in headless Chrome (concurrency 4, 20s timeout), captures `#root` innerHTML, replaces skeleton with full rendered content
   e. Generates `_redirects` with per-page forced rewrites + SPA fallback to `__shell.html`
   f. Generates final `sitemap.xml`
   g. Applies Brotli + gzip compression

### Code Splitting (manualChunks)

| Chunk | Contents |
|-------|----------|
| `vendor` | react, react-dom, react-router-dom |
| `query` | @tanstack/react-query |
| `supabase` | @supabase/supabase-js |
| `sanity` | @sanity/client, @sanity/image-url |

Module preload filtering: chunks for query, supabase, sanity, format, and browser modules are excluded from `<link rel="modulepreload">` to avoid blocking initial load.

### Caching Headers

| Pattern | Cache-Control |
|---------|--------------|
| `/assets/*`, `/*.js`, `/*.css`, `/*.woff2`, `/fonts/*` | `public, max-age=31536000, immutable` (1 year) |
| `/images/*`, `/lovable-uploads/*` | `public, max-age=31536000, immutable` (1 year) |
| `/*.jpg`, `/*.webp`, `/*.png` (root-level) | `public, max-age=2592000` (30 days) |
| `/*.html` | `public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400` |

### Security Headers (all routes)

- `Strict-Transport-Security`: max-age=31536000; includeSubDomains; preload
- `X-Frame-Options`: DENY
- `X-Content-Type-Options`: nosniff
- `Referrer-Policy`: strict-origin-when-cross-origin
- `Permissions-Policy`: camera=(), microphone=(), geolocation=()
- `Content-Security-Policy`: Allows self, Google Analytics, GTM, Facebook pixel/connect, Supabase, Sanity CDN, Google Fonts

### Redirects

- `www.baselayerskin.co/*` to `baselayerskin.co/:splat` (301, forced)
- `/checkout` and `/checkout/*` get `X-Robots-Tag: noindex, nofollow`

## Image Optimization

### Build-Time (Vite Plugin)

`vite-plugin-image-optimizer` processes images during build:
- PNG: quality 75
- JPEG/JPG: quality 75, progressive
- WebP: quality 75

### Responsive Hero Images

The prerender plugin generates `<picture>` elements with responsive WebP srcsets:
- 480w, 768w, 1200w variants for hero images
- `fetchpriority="high"` on hero images
- `<link rel="preload" as="image">` with `imagesrcset` injected early in `<head>`

### LCP Optimization Strategy

1. **Non-blocking CSS**: External stylesheet loaded with `media="print" onload="this.media='all'"` pattern
2. **Hero image preloads**: Per-page `<link rel="preload">` for the correct hero variant
3. **Baked HTML skeletons**: Full hero content (text + picture element) baked into static HTML, replaced by React on hydration
4. **Puppeteer SSR**: Full page content captured and injected into HTML so crawlers get complete content at FCP

## Pre-Rendering / SSR

**Type**: Build-time SSR via Puppeteer (not runtime SSR)

### Process

1. Vite builds the SPA normally
2. `closeBundle` hook starts a local HTTP server serving `dist/`
3. Puppeteer launches headless Chrome and visits each route
4. Waits for: nav + footer rendered, loading skeletons gone, main content > 200 chars
5. Captures `#root` innerHTML and writes it into the static HTML file
6. Concurrency: 4 pages at a time, 20s per-page timeout
7. Blocked during rendering: googletagmanager, google-analytics, facebook, supabase functions
8. Non-prerendered routes: `/checkout`

### Fallback

Unknown routes fall back to `__shell.html` (generic SPA shell with no page-specific content).

## Build Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `vite` | Local dev server on port 8080 |
| `build` | `node scripts/generate-sitemap.mjs && vite build` | Production build with sitemap generation + prerender |
| `build:sitemap` | `node scripts/generate-sitemap.mjs` | Standalone sitemap generation |
| `build:dev` | `vite build --mode development` | Development build (no minification) |
| `lint` | `eslint .` | ESLint check |
| `preview` | `vite preview` | Preview production build locally |
| `test` | `vitest run` | Run tests once |
| `test:watch` | `vitest` | Run tests in watch mode |

### Utility Scripts (in `scripts/`)

| Script | Purpose |
|--------|---------|
| `generate-sitemap.mjs` | Fetches all Sanity slugs and generates `public/sitemap.xml` |
| `article-cleanup.mjs` | One-off article data cleanup |
| `fix-remaining.mjs` | One-off data fix |
| `skin-concern-cleanup.mjs` | One-off skin concern data cleanup |

## TypeScript Configuration

- Project references pattern: `tsconfig.json` references `tsconfig.app.json` + `tsconfig.node.json`
- Path alias: `@/*` maps to `./src/*`
- Strict null checks: disabled
- Implicit any: allowed
- Unused locals/params: allowed
- skipLibCheck: true

## Tailwind Configuration

- **Dark mode**: Class-based (`darkMode: ["class"]`)
- **Fonts**: `font-heading` (Montserrat), `font-body` (Inter)
- **Colors**: HSL CSS custom properties pattern (shadcn/ui default)
- **Custom colors**: `surface-light` (with foreground + muted variants), `sidebar` (full theme)
- **Animations**: accordion, fade-in-up, marquee
- **Typography plugin**: `@tailwindcss/typography` (dev dependency)
- **Container**: Centered, 2rem padding, max 1400px at 2xl

## Context Providers (wrapping order)

1. `DeferredQueryProvider` — deferred TanStack Query (loads async, renders children immediately)
2. `TooltipProvider` — Radix tooltip context
3. `EarlyAccessProvider` — early access modal state
4. `CartProvider` — shopping cart state
5. `BrowserRouter` — React Router

## SEO

- JSON-LD schemas: `Organization` + `WebSite` (global), `Product` (product pages), `Article` (articles), `BreadcrumbList` (detail pages)
- Canonical URLs injected per-page during prerender
- OG tags (title, description, image, type, url) injected per-page
- Twitter card meta tags injected per-page
- `sitemap.xml` generated at build time with all static + dynamic URLs
