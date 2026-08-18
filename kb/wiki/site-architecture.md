---
title: Site Architecture
domain: technical
created: 2026-04-03
last_compiled: 2026-08-18
revision: 5
sources: [package.json, vite.config.ts, App.tsx, netlify.toml, tailwind.config.ts, tsconfig.json, analytics.ts, sanity.ts, netlify _redirects, live Storefront API testing, production debugging, /last30days research, Sanity assets API, GA4 sessionSource report, Meta Commerce Manager, Brevo tracker documentation]
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

**RESOLVED 2026-08-12** (source: live Judge.me API probing, which required reading the store's domain settings). Option 2 shipped — the Shopify primary domain is now `shop.baselayerskin.co`. Both myshopify handles (`kpfzdg-kw.myshopify.com` and the `base-layer-skin.myshopify.com` alias) 301 there. The "requires Shopify admin action" framing above is historical; treat the redirect loop as closed.

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

---

## Product Reviews on a Headless Storefront (2026-08-12, rev 3)

### Vendor selection is a narrower question than the roundups suggest

Source: `/last30days` reviews-app research — vendor docs + 2026 comparison roundups. Confidence: high.

Generic "best Shopify reviews app" lists are close to useless here, because **theme app extensions — the delivery mechanism nearly every review app relies on — do not exist on a Vite SPA.** The only criterion that matters is whether the vendor exposes a public read API.

| Vendor | Headless story | Pricing | Verdict |
|---|---|---|---|
| **Judge.me** | REST API v1 + explicitly documented "platform-independent widgets" for the Shopify-backend/non-Shopify-pages case | Free tier includes photo+video reviews, unlimited review requests, SEO rich snippets. $15/mo flat above | **Chosen** |
| Okendo | Strongest architecture of the field — Storefront REST API, `@okendo/shopify-hydrogen` npm package, React and Vue reference implementations | Headless requires the **Advanced** plan; scales by order volume (free ≤50 orders → $19 → $119 → $299 at 10k) | Right answer at scale, wrong price now |
| Loox | None documented | — | Out |
| Yotpo / Stamped | — | $169+ quote-gated / $59–199 | Priced for a stage Base Layer isn't at |
| Trustpilot | — | ~$199/mo entry, onboarding in days-to-weeks | Solves brand reputation across channels, **not** product reviews on a PDP. Wrong tool for a one-SKU pre-scale brand |

**Compliance constraint that shapes the build regardless of vendor:** the FTC Consumer Reviews Rule (**16 CFR 465**) has been enforceable since Oct 2024, penalties up to ~$53k/violation, warning letters issued Dec 2025. Incentivized reviews are lawful only when the incentive is disclosed clearly and conspicuously **in or beside the review** AND is **not conditioned on sentiment**. Suppressing or reordering reviews by rating is a violation. See `kb/wiki/customer-insights.md` for why it's also a conversion mistake.

### Judge.me API facts the public docs get wrong or omit

Source: live API probing against the Base Layer store, 2026-08-12. Confidence: high. These cost about an hour to establish; don't re-derive them.

1. **The public token cannot read reviews.** `GET https://api.judge.me/api/v1/reviews` returns **403 "You are using a public token which does not have enough permissions"** for the public token, 200 for the private one. Judge.me's help centre describes the public token as "suitable for making GET requests to our widget API" — the *widget* API, not the REST review API. Two consequences: reviews cannot be fetched from a browser at all, which makes the build-time fetch **architecturally required** rather than merely a prerender optimisation; and `JUDGEME_PRIVATE_TOKEN` must never carry a `VITE_` prefix, since Vite inlines those into the client bundle.
2. **API access is not plan-gated.** It works on the free plan — the $15/mo Awesome tier is not required for the integration.
3. **`shop_domain` is `kpfzdg-kw.myshopify.com`** — Shopify's original auto-generated handle. Not `base-layer-skin.myshopify.com` (the alias `VITE_SHOPIFY_DOMAIN` uses for the Storefront API) and not the `shop.baselayerskin.co` primary domain. All three reach the same store; **only the original handle authenticates against Judge.me.**
4. **Judge.me returns an identical 401 "Shop domain or Api Token is wrong" for a bad domain and a bad token.** A domain mismatch reads exactly like a credential problem. Check the domain first — it's printed on the same Settings → Integrations page as the tokens.

### The theme app embed is a red herring; collection flow is the real dependency

Source: Judge.me collection-flow docs + observed theme-app-embed behaviour on a headless store. Confidence: high.

Judge.me's install toggles a "Core Snippet" app embed into the Shopify theme. On this stack **that theme is never served** (both myshopify handles 301 to the primary domain, which DNS points at Netlify), so the embed injects script into a page no shopper loads. It is inert, not harmful, and disabling it buys nothing — Judge.me treats it as its install signal.

What actually matters is **`Settings → Collection flow` → "Where customer gets redirected when writing reviews from emails" → set to "External form."** Left on the default "In-store review form," every review request email deep-links into the dead theme and the customer lands on the homepage with no form, **silently wasting the request.** Available on all plans, needs no widget.

**Generalises beyond Judge.me:** when evaluating any review/UGC app for a headless store, the question is never "does it have a theme block" but *"can review collection complete without touching the theme, and can the data be read server-side."*

Cold-start tool: `Settings → Request reviews → Links, QR codes` generates a widget-free shareable review link. It is **public by design** — anyone holding it can submit — so do not put it anywhere indexable.

### Research-method note: `/last30days` is the wrong instrument here

Source: two full `/last30days` runs on the reviews-app topic, 2026-08-12. Confidence: high.

Both runs returned effectively zero signal. Reddit 403'd on every targeted subreddit (r/shopify, r/ecommerce, r/shopifyDev, r/ShopifyeCommerce, r/bigseo, plus the global search endpoint), X surfaced three marginally relevant posts across both runs, and the topic keyword "Judge" poisoned Polymarket with county-judge elections and Aaron Judge prop markets. The usable answer came entirely from vendor documentation via WebSearch.

**Rule:** tooling/vendor selection lives in docs and blogs, not in 30 days of social chatter — lead with WebSearch and use the social pipeline only for sentiment on things people actually argue about (creative, pricing changes, platform policy shifts). Also note the Reddit 403s look like a persistent block on the public JSON endpoints rather than transient rate limiting, and no ScrapeCreators key is configured as a backup (`INCLUDE_SOURCES=none`) — **Reddit is currently dark for this skill regardless of topic.**

### As-built integration

- `scripts/fetch-reviews.mjs` — runs in `npm run build` before `vite build`. Paginates all published reviews, computes the aggregate across the full set, sorts photo-first then newest, writes the top 50 to `src/data/reviews.json`. **Never fails the build**: any error warns and exits 0, leaving the committed snapshot in place, so a Judge.me outage degrades to last-known-good rather than an empty page.
- `src/lib/reviews.ts` — single source of truth. `REVIEW_GATE = 5`; below it the aggregate is zeroed and the list is empty, so the section, the star rating and the JSON-LD all hide on one condition.
- `src/components/ReviewsSection.tsx` — PDP block. Verified badge renders only when Judge.me confirms the buyer.
- `vite.config.ts` — `REVIEW_AGGREGATE` reads the same snapshot at config load and spreads `aggregateRating` into the three SEO landing-route Product schemas. The gate is duplicated there and **must stay in sync** with `src/lib/reviews.ts`.
- CSP: `img-src` must allow **`https://review-images.judgeme.com`** — that is the host Judge.me actually serves review photos from, confirmed against live review data on 2026-08-12. Judge.me's docs point at `judgeme.imgix.net` / `cdn.judge.me`; those are kept in the allowlist but **were not sufficient on their own and would have blocked every review photo in production.** This lives in **both** `netlify.toml` and `public/_headers` — separate files, must be edited together.

### Verified badges depend on order matching, not on the review existing

First real data (2026-08-12): four reviews arrived with **`verified: false` on all four.** Judge.me only sets the verified-buyer flag when it can tie the reviewer to a confirmed order — reviews submitted through a shared review link carry no order, so no badge renders. This is the practical argument for setting Collection flow → External form and driving requests off real orders: unverified reviews still display, but they forfeit the single strongest trust signal on the block.

Also note the aggregate at this point is **5.0**, above the 4.7 authenticity-skepticism ceiling in `kb/wiki/customer-insights.md`. A perfect average is a conversion liability, not a win.

**FTC exposure to watch:** reviews authored by the founder, employees, or their households are insider reviews under 16 CFR 465 and require clear and conspicuous disclosure of the material connection — the same rule that governs incentivized reviews. Check reviewer identities before a review block goes live.

## Judge.me Production Pipeline Corrections (2026-08-12, live API and dashboard comparison, confidence: high)

The review gate is now **1**, not 5. Four real reviews at 4.8 with three customer-photo reviews were more useful than an empty section; the zero gate remains essential because `aggregateRating` with `reviewCount: 0` can invalidate Product rich-result markup. The constant is duplicated in `src/lib/reviews.ts`, `vite.config.ts`, and `scripts/fetch-reviews.mjs`; update all three together. This supersedes the older as-built notes above.

The rating UI is native and build-time by design. Judge.me's theme extension cannot render on this Vite/Netlify storefront, and its public token receives 403 on the reviews REST API. `src/data/reviews.json` is therefore the only safe client source; do not add a Judge.me embed script later.

Three live-data corrections are now load-bearing:

1. `verified` is an enum. Only `buyer`, `confirmed-buyer`, `verified-purchase`, `semi-verified-purchase`, and `admin` earn a badge. Unknown values fail closed through `VERIFIED_STATUSES`.
2. Product and store reviews share the endpoint. `PRODUCT_EXTERNAL_ID` filters shop-level reviews so brand feedback is never attributed to the moisturizer.
3. The committed snapshot is the live source. Moderating a review in Judge.me does not remove it from production until the next build/deploy.

Post-fix snapshot: 4 product reviews, 4.8 average, 1 verified purchase.

## Analytics Funnel Audit (2026-08-13, live resource/event inspection, confidence: high)

Cold PDP landings previously dropped browser `ViewContent` and GA4 `view_item` because React fired before deferred analytics globals existed. The fix is an event queue flushed after script initialization, preserving the Meta event ID used for CAPI deduplication. The same audit corrected invented catalog IDs, the hardcoded $38 value on the preselected $68 tier, missing GA4 `items`, duplicate advertorial pageviews, and CTA events that never mapped to Meta.

The Shopify checkout remains a separate measurement surface. External inspection found no Facebook & Instagram or Google & YouTube app pixel (`facebookCapiEnabled` was false); a hidden custom-pixel implementation cannot be excluded without Shopify admin. When Shopify-side tags are connected, only one surface should own checkout-start events or they will double-count. GA4 cross-domain settings alone are insufficient while the handoff uses `window.location.href`, because the linker decorates real anchor/form interactions.

Deployment state must be verified independently from the working tree: a correct local bundle can remain unpushed while production continues serving stale event IDs and consent behavior.

---

## GA4 Reserved Parameter Collision — `source` Destroyed Attribution (2026-08-13, GA4 sessionSource report on property 526066920 cross-checked against `src/lib/analytics.ts`, confidence: high)

`source`, `medium`, and `campaign` are **reserved GA4 event parameters**. Sent
on any event, they are read as a manual traffic source and written to the
session, replacing the real acquisition source.

Base Layer had roughly 20 call sites passing `source` to mean *which CTA was
clicked* — `"hero"`, `"buy_box"`, `"navbar"`, `"cart_upsell"`, `"content_cta"` —
and `fireBrowserEvent` spread the whole payload straight into `gtag("event", …)`.

A session-source report on 2026-08-13 listed `buy_box` and `hero` alongside
`facebook.com / referral` as if they were traffic sources, confirming live
damage. The sessions affected are precisely the ones that clicked a CTA — the
ones most likely to convert — so ad attribution was being destroyed exactly
where it mattered most.

Fixed in `49ce3a5` by renaming to `cta_location` **once on the way into gtag**
rather than at each call site, so the Meta pixel and CAPI keep receiving
`source` unchanged, and a new call site written in the house style cannot
reintroduce the bug. `cta_location` is registered as an event-scoped custom
dimension in GA4.

**Historic GA4 attribution before 2026-08-13 is unreliable for any session
containing a CTA click, and does not backfill.**

---

## `_gl` Is the Wrong Cross-Domain Test on a Subdomain (2026-08-13, direct measurement across baselayerskin.co and shop.baselayerskin.co, confidence: high)

A `_gl` linker parameter is not evidence of GA4 cross-domain continuity on a
subdomain hop. `_ga` is written on `.baselayerskin.co` and is therefore already
readable by `shop.baselayerskin.co` natively, so gtag has no reason to decorate
the URL and `_gl` will never appear.

Verified by reading the same client id `GA1.1.34396408.1786630663` on both
hosts. **The correct test is comparing the `_ga` value across the two hosts.**

Corollary: the anchor-click checkout handoff in
`ShopifyCartDrawer.goToCheckout` is not required for cross-domain measurement
on this subdomain — its comment overstates the rationale. It remains harmless
and is still preferable to a location assignment for the general case.

The genuine remaining attribution gap is **Shop Pay**, which redirects to
`shop.app`: a different registrable domain, no cookie continuity, no linker fix
available.

---

## Meta Catalog Content IDs Are Bare Variant IDs (2026-08-13, Meta Commerce Manager catalog 2505734419891235 Items view, confidence: high)

The Shopify Facebook & Instagram channel publishes **bare Shopify variant IDs**
as Meta catalog Content IDs for this store — `42940461023303` and
`42940461056071` — with product id `7469557612615` as the item group id. No
`shopify_US_<product>_<variant>` prefix, contrary to the standing worry recorded
in `metaContentId`. The site's existing `metaContentId` (last path segment of
the GID) already matches the catalog and needs no change.

Two things learned alongside:

- **The Events Manager catalog match rate reports on a trailing 28-day window.**
  It read 0% for days after the content-ID fix landed in `386ec7b` because the
  window still covered the old invented `base-layer-face-cream` string. A stale
  window, not a live mismatch.
- **The business holds two catalogs for the same store**:
  `2038277147036399` ("Products from base-layer-skin.myshopify.com", access
  lost) and `2505734419891235` (created 2026-08-13 by the channel connection).

`base-layer-skin.myshopify.com` and `kpfzdg-kw.myshopify.com` are one store:
both 301 to `shop.baselayerskin.co` and both authenticate the same read-only
Storefront token against product GID `7469557612615`.

---

## Brevo Lifecycle Ownership Is Necessarily Hybrid (2026-08-17, headless cart audit against Brevo tracker/eCommerce documentation, confidence: high)

The Brevo Shopify plugin **cannot observe Storefront API cart mutations** made
on the Netlify React app, so lifecycle ownership splits by surface:

| Event | Owner | Why |
|---|---|---|
| `product_viewed`, `cart_updated`, empty-cart-only `cart_deleted` | Storefront (Brevo tracker, consent-gated) | The plugin is blind to Storefront API mutations |
| `order_created` / `order_completed` | Shopify ↔ Brevo server-side integration | Hosted checkout does not reliably return to the storefront |

Sending purchase completion from the browser would be unreliable for that
second reason. Running both Shopify and Brevo recovery automations would also
duplicate sends — pick one owner per event.

The storefront queues pre-opt-in behaviour **in memory only**, identifies the
visitor after explicit marketing opt-in plus analytics consent, and keeps these
events separate from GA4/Meta measurement to prevent duplicate commerce events.
