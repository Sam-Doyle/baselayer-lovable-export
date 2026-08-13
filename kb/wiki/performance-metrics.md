---
title: Performance Metrics & Optimization
domain: technical
created: 2026-04-03
last_compiled: 2026-08-12
revision: 3
sources: [vite.config.ts, netlify.toml, index.html, src/App.tsx, src/pages/Index.tsx, src/components/HeroSection.tsx, package.json, Lighthouse 13 lab audits of live baselayerskin.co (3 mobile + 3 desktop), Lighthouse 13 local production audit post-remediation]
codePaths:
  - vite.config.ts
  - netlify.toml
  - index.html
  - src/App.tsx
  - src/pages/Index.tsx
  - src/index.css
  - src/components/HeroSection.tsx
---

# Performance Metrics & Optimization

This article documents every performance optimization currently in the codebase, what techniques are in place, and what gaps remain. Use this before touching anything performance-related so you don't duplicate work or regress an existing fix.

---

## 1. Build Pipeline

**Bundler:** Vite 5 with `@vitejs/plugin-react-swc` (SWC compiler, faster than Babel).

**Build command:** `node scripts/generate-sitemap.mjs && vite build`

**Build target:** `es2020`

**Minification:** Terser with dead-code stripping. `console.log`, `console.warn`, `console.debug`, `console.info` are stripped via `pure_funcs`.

**CSS minification:** Enabled (`cssMinify: true`).

**Prerender step (closeBundle):** A custom Vite plugin runs after the bundle is written:
1. Injects per-page meta tags, Open Graph, JSON-LD, and canonical URLs for all static + Sanity-fetched dynamic pages.
2. Generates per-page hero image `<link rel="preload">` tags.
3. Bakes above-the-fold HTML skeletons (hero `<picture>` + headline text) directly into the HTML for LCP-critical pages (`/`, `/face-cream`, `/matte-moisturizer-for-men`, `/non-greasy-moisturizer-for-men`, `/all-in-one-skincare-for-men`).
4. Runs Puppeteer SSR (headless Chrome, concurrency 4, 20s timeout) to capture full React-rendered content into the HTML, replacing skeletons with `<!--SSR-->` blocks. Analytics/tracking scripts are blocked during render.
5. Generates `_redirects` for Netlify (prerendered routes get `200!` forced rewrites; unknown routes fall back to `__shell.html` SPA shell).
6. Generates `sitemap.xml` from all static + dynamic pages.

**Compression plugins:** Both Brotli (`brotliCompress`) and Gzip are generated at build time via `vite-plugin-compression`.

---

## 2. Code Splitting & Lazy Loading

### Route-level splitting (React.lazy)

Every page except `Index` (homepage) is lazy-loaded in `App.tsx`:

- `FaceCream`, `MatteMoisturizer`, `NonGreasyMoisturizer`, `AllInOneSkincare`
- `Articles`, `ArticleDetail`, `Ingredients`, `IngredientDetail`
- `SkinConcerns`, `SkinConcernDetail`, `Comparisons`, `ComparisonDetail`
- `About`, `Checkout`, `NotFound`, `ProductDetail`, `LandingPage`, `Listicle`, `ListicleGirlfriend`
- UI overlays: `Toaster`, `Sonner`, `EarlyAccessModal`, `ShopifyCartDrawer`

All lazy routes are wrapped in `<Suspense fallback={<PageFallback />}>` which renders a dark full-viewport div to prevent flash.

### Component-level splitting on homepage (Index.tsx)

Below-the-fold homepage sections are also lazy-loaded:

- `TestimonialsSection`, `FAQSection`, `WhyMensSkinSection`, `OurOriginSection`
- `Footer`, `PressBanner`, `IngredientsShowcase`, `ScrollProgressBar`

Only `Navbar` and `HeroSection` are eagerly imported for the homepage.

### Deferred QueryClientProvider

`@tanstack/react-query` (~36KB) is dynamically imported outside the synchronous module chain. The homepage renders immediately without waiting for it. A `DeferredQueryProvider` wrapper renders children without the provider until the chunk loads; pages using `useQuery` are already behind lazy boundaries.

### Manual chunk splitting (rollupOptions.manualChunks)

| Chunk name | Contents |
|------------|----------|
| `vendor` | `react`, `react-dom`, `react-router-dom` |
| `query` | `@tanstack/react-query` |
| `supabase` | `@supabase/supabase-js` |
| `sanity` | `@sanity/client`, `@sanity/image-url` |

### Module preload filtering

`build.modulePreload.resolveDependencies` strips non-critical chunks from preload hints: `query-*`, `supabase-*`, `queries-*`, `format-*`, `browser-*`, `sanity-*`. This prevents the browser from eagerly fetching chunks that are only needed on secondary pages.

---

## 3. Image Optimization Pipeline

### Build-time optimization (vite-plugin-image-optimizer)

Applied to all images processed through Vite's asset pipeline (`src/assets/`):

| Format | Quality | Notes |
|--------|---------|-------|
| PNG | 75 | |
| JPEG/JPG | 75 | Progressive encoding enabled |
| WebP | 75 | |

**Sharp** is listed as a runtime dependency (`sharp@0.34.5`). Used by `vite-plugin-image-optimizer` under the hood.

### Responsive hero images

Pre-generated responsive WebP variants exist in `src/assets/` at multiple widths:

- `hero-product-{480w,768w,1200w,1920w}.webp`
- `product-hero-rock-{480w,768w,1200w}.webp`

The prerender plugin dynamically discovers these built files and generates per-page `<link rel="preload" as="image" imagesrcset="..." imagesizes="100vw" fetchpriority="high">` tags.

### `<picture>` element usage

WebP-first `<picture>` elements with PNG/JPEG fallbacks are used throughout:

- `HeroSection.tsx` -- hero background with mobile/desktop `<source>` breakpoints (`max-width: 768px`)
- `ProductSection.tsx` -- product image
- `OurOriginSection.tsx` -- lifestyle image
- `WhyMenQuitSection.tsx` -- texture background
- `TheGearSection.tsx` -- packaging images
- `TestimonialsSection.tsx` -- avatar images
- `IngredientsSection.tsx` -- ingredient card images

### Lazy loading attributes

`loading="lazy"` is applied to all below-the-fold images across 15+ components. Verified in: `OurOriginSection`, `WhyMenQuitSection`, `IngredientsShowcase`, `PortableText`, `PayoffSection`, `TheGearSection`, `ProductSection`, `IngredientsSection`, `TestimonialsSection`, `CartDrawer`, `WhyMensSkinSection`, `WhoWeAreSection`, `GuaranteeSection`.

### fetchPriority usage

- `fetchPriority="high"`: Hero image in `HeroSection.tsx`, first gallery image on `FaceCream.tsx`, article hero in `ArticleDetail.tsx`
- `fetchPriority="low"`: Below-fold decorative images in `WhyMenQuitSection`, `PayoffSection`, `IngredientsSection`

### Explicit dimensions

Images include `width` and `height` attributes where applicable (e.g., `ProductSection`: 1024x1024, `TestimonialsSection`: 48x48, `FaceCream` gallery: 1024x1024) to reserve layout space and prevent CLS.

---

## 4. Caching Strategy (Netlify)

Source: `netlify.toml`

| Resource | Cache-Control | TTL |
|----------|---------------|-----|
| `/assets/*` (hashed Vite output) | `public, max-age=31536000, immutable` | 1 year |
| `/*.js` | `public, max-age=31536000, immutable` | 1 year |
| `/*.css` | `public, max-age=31536000, immutable` | 1 year |
| `/*.woff2` | `public, max-age=31536000, immutable` | 1 year |
| `/fonts/*` | `public, max-age=31536000, immutable` | 1 year |
| `/images/*` | `public, max-age=31536000, immutable` | 1 year |
| `/lovable-uploads/*` | `public, max-age=31536000, immutable` | 1 year |
| `/*.jpg` (root OG images) | `public, max-age=2592000` | 30 days |
| `/*.webp` (root) | `public, max-age=2592000` | 30 days |
| `/*.png` (root) | `public, max-age=2592000` | 30 days |
| `/*.html` | `public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400` | 1hr edge, 24hr stale |

### Security headers (all routes)

- `Strict-Transport-Security`: 1 year, includeSubDomains, preload
- `X-Frame-Options`: DENY
- `X-Content-Type-Options`: nosniff
- `Referrer-Policy`: strict-origin-when-cross-origin
- `Permissions-Policy`: camera/mic/geo disabled
- `Content-Security-Policy`: defined with script-src, style-src, font-src, img-src, connect-src directives

### Redirects

- `www.baselayerskin.co` -> `baselayerskin.co` (301)
- `/checkout` has `X-Robots-Tag: noindex, nofollow`

---

## 5. LCP Optimizations (Applied)

Multiple LCP fixes are baked into the prerender plugin (`vite.config.ts`):

### LCP Optimization 0 -- Non-blocking CSS

The external CSS stylesheet is converted to async loading at build time:
```
<link rel="preload" as="style" ...>
<link rel="stylesheet" ... media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" ...></noscript>
```
This prevents the ~85KB CSS file from blocking FCP/LCP. Critical inline CSS in `index.html` `<style>` covers above-the-fold rendering.

### LCP Optimization 1 -- Per-page hero image preloads

Each route gets a targeted `<link rel="preload" as="image" imagesrcset="..." fetchpriority="high">` injected early in `<head>` (after `<meta viewport>`) so the browser discovers the LCP image before any CSS or JS blocks rendering. Pages without hero images get no preload tag (no wasted bandwidth).

### LCP Optimization 2 -- Hero image in HTML skeleton

The actual `<picture>` element for the hero is baked directly into the pre-rendered HTML skeleton. The browser can start painting the LCP image at FCP time, without waiting for React to hydrate.

### LCP Optimization 3 -- Above-the-fold skeletons

Full hero content (headline text, subheadline, gradient overlays) is baked into the HTML for key pages. Saves ~500-1000ms on mobile by making LCP paint happen with FCP, before React mounts.

---

## 6. CLS Prevention

- **Critical inline CSS** in `index.html` `<head>` defines layout primitives (`min-h-screen`, `relative`, `absolute`, `flex`, `items-center`, etc.) so the skeleton renders correctly before the external stylesheet loads.
- **Font-display: swap** on all self-hosted Inter fonts (`index.css`). Text renders immediately with system font, then upgrades.
- **Explicit image dimensions** (`width`/`height` attributes) on product images, testimonial avatars, gallery images.
- **min-height reservations** on hero sections prevent layout shift when content loads.
- **Skeleton placeholder** in `index.html` (`<!--SKELETON-->` block) provides a dark viewport with centered BL logo until React mounts.
- **Hero animation deferred**: Cinematic pan animation on hero image starts only after the image `load` event fires (not before LCP).

---

## 7. Third-Party Script Deferral

### Analytics (GA4 + Meta Pixel)

Loaded in `App.tsx` after critical rendering via a two-tier deferral:
1. `requestIdleCallback` (fires when browser is truly idle)
2. `setTimeout(loadOnce, 3000)` as guaranteed fallback

Scripts are never loaded for bots (`Lighthouse`, `HeadlessChrome`, `PageSpeed`) or iframes.

### CAPI PageView

Fires immediately via raw `fetch()` to Supabase edge function -- no SDK import required. Uses the same `event_id` as the deferred browser pixel for deduplication.

### DNS Prefetch / Preconnect

In `index.html <head>`:
- `dns-prefetch`: `googletagmanager.com`, `connect.facebook.net`, `google-analytics.com`, `supabase.co`, `sanity.io`, `myshopify.com`
- `preconnect`: `cdn.sanity.io` (with crossorigin)

### Blocked requests

The CAPI Gateway (`capig.datah04.com`) is intercepted at runtime -- both `fetch()` and `sendBeacon()` are patched to silently drop these requests.

---

## 8. Font Strategy

### Self-hosted fonts (in `/public/fonts/`)

| Font | Weights | Format |
|------|---------|--------|
| Inter | 400, 500, 600 | woff2 |
| DM Sans | 700, 800, 900 | woff2 |

### Font loading

- `font-display: swap` on all Inter `@font-face` declarations
- Montserrat 700/800/900 imported via `@fontsource/montserrat` (also uses swap)
- `Inter 400` is preloaded in `index.html`: `<link rel="preload" as="font" type="font/woff2" href="/fonts/inter-400.woff2" crossorigin>`

### CLS note from codebase comment

> "Keep Montserrat as swap (not optional) -- the min-height reservations on hero content prevent CLS, while swap ensures the headline renders immediately with system font then upgrades to Montserrat. The preload tag in index.html ensures Montserrat arrives before FCP in most cases."

---

## 9. Puppeteer SSR Details

- **Concurrency:** 4 pages in parallel
- **Page timeout:** 20 seconds
- **Skipped paths:** `/checkout`
- **Blocked during render:** `googletagmanager.com`, `google-analytics.com`, `facebook.net`, `facebook.com/tr`, `supabase.co/functions`
- **Two-phase wait:** First waits for nav + footer (basic structure), then waits for loading skeletons to disappear and main content to have 200+ chars
- **Fallback:** If Puppeteer SSR fails, pages retain their meta tags, JSON-LD, and HTML skeletons

---

## 10. What's NOT in Place (Known Gaps)

- **No service worker / PWA manifest.** `public/` has `robots.txt` and `favicon.ico` but no `manifest.json` or `sw.js`.
- **No AVIF format.** WebP is used throughout but AVIF (better compression at equivalent quality) is not generated.
- ~~**No runtime performance monitoring.**~~ **CLOSED 2026-08-12** — real-user LCP/CLS/INP reporting now ships via `web-vitals`, consent-gated. See §13.
- **No image CDN.** Images are served from Netlify's CDN (which is fine) but there's no on-the-fly resize service (e.g., Cloudinary, Imgix). Sanity images use `cdn.sanity.io` with URL-based transforms.
- **No responsive `sizes` attribute on most images.** Only the hero uses `sizes="100vw"`. Other `<picture>` elements lack `sizes`, so the browser may over-fetch.
- **No HTTP/2 server push.** Netlify supports it but no `Link` headers are configured for critical resources.
- **Homepage hero image (HeroSection.tsx) uses public/ paths** (`/images/hero-product-mountain.webp`) rather than Vite-processed `src/assets/` paths, so `vite-plugin-image-optimizer` does not process these at build time. Only the prerender plugin's responsive hero variants (from `src/assets/`) get optimization.

---

## 11. Baseline Metrics

~~No Lighthouse scores or Core Web Vitals baselines are documented.~~ **SUPERSEDED
2026-08-12 — baselines now captured in §13.** The homepage has both a pre- and
post-remediation measurement. The recommendation to extend coverage to the other
four key pages (`/face-cream`, `/articles`, `/ingredients`, `/skin-concerns`)
still stands; only `/` has been measured.

---

## 12. IntersectionObserver Usage (Viewport-triggered Rendering)

Multiple below-the-fold sections use `IntersectionObserver` to defer animations/rendering until visible:

- `OurOriginSection` (threshold 0.1)
- `HowToUseSection`
- `WhyMenQuitSection`
- `IngredientsShowcase`
- `PressBanner`
- `ComparisonTable`
- `PerformanceSpecsSection`
- `PayoffSection`
- `ProductSection`

These don't defer data loading (that's handled by route-level lazy), but they prevent animation/paint work from happening off-screen.

---

## 13. Lighthouse Audit & CLS Remediation (2026-08-12)

### Baseline — live site, pre-remediation

Lighthouse 13 lab audit of live `baselayerskin.co`, 3 mobile + 3 desktop runs.
*(confidence: high)*

| Metric | Value |
|---|---|
| Desktop median score | **75** |
| Desktop LCP | ~0.67s (fast) |
| Desktop CLS | **~1.007** |
| TBT | 0 ms |
| Server response | ~105 ms |
| First-load transfer | ~983 KiB / 40 requests |
| — images | 652 KiB |
| — JavaScript | 212 KiB |
| — fonts | 111 KiB |

Payload findings: the 1536px hero was correctly preloaded with
`fetchpriority=high` but carried **no `srcset`** (~114 KiB avoidable mobile,
~80 KiB desktop). Six ingredient PNGs added ~500 KiB. Lighthouse flagged ~85 KiB
unused JS on the homepage (Supabase ~41 KiB, Sanity ~25 KiB, main bundle ~21 KiB)
and an estimated **~550 ms mobile LCP opportunity**. No render-blocking requests
or redirects.

### The CLS diagnosis — initial read, then corrected

**Initial hypothesis (wrong):** the prerendered homepage is mounted with
`createRoot()` in `src/main.tsx` rather than hydrated, and the ~1.0 CLS was React
replacing the existing hero grid — main shift node `main > section > div.mx-auto`.

**Corrected diagnosis (2026-08-12, follow-up tracing, confidence: high):**
`createRoot()` *exposed* the shift but was not the cause. The near-1.0 movement
was primarily **`vite.config.ts` rewriting the built stylesheet to
`media="print"`**, while the inline critical CSS only covered the obsolete
skeleton rather than the prerendered Tailwind DOM. The page painted unstyled
prerendered markup, then snapped when the real stylesheet loaded.

This correction matters as a pattern: an async-CSS optimization (§5) silently
became a CLS bug the moment the prerender output changed shape underneath it.
Critical CSS and prerender output are coupled and must be revalidated together.

### Fix and result

Keeping the ~14 KB Brotli stylesheet **render-blocking**, and retaining the
first-viewport prerender as an **inert visual shell**, collapsed the shift.

| Metric | Before | After |
|---|---|---|
| CLS (mobile) | ~1.0 | **0.00006** |
| CLS (desktop) | ~1.007 | **0.0056** |
| Lighthouse score (mobile) | — | **93** |
| Lighthouse score (desktop) | 75 | **100** |
| Best Practices | — | 100 |
| TBT | 0 ms | 0 ms |
| Mobile requests | 40 | **18** |
| Transfer | ~983 KB | **~502 KB** |

*(Post-fix numbers are a local production audit, not the live site — re-measure
against production before treating them as shipped.)*

Payload reduction came from responsive hero delivery, responsive ingredient
WebPs, and route-scoped Query/Sanity/Supabase chunks. Real-user LCP/CLS/INP
reporting now flows through `web-vitals`, consent-gated — closing the monitoring
gap listed in §10.

---

## Build Hazard: Unguarded ReadStream in the Prerender Static Server (2026-08-12, observed during a Judge.me integration build, confidence: high)

`npm run build` failed once with an unhandled `'error'` event and a non-zero exit:

```
Error: ENOENT: no such file or directory, open '<repo>/dist/index.html'
Emitted 'error' event on ReadStream instance
```

An immediate re-run of the identical tree succeeded, so this is **intermittent, not deterministic** — a race, not a broken config.

**Cause.** The prerender plugin in `vite.config.ts` spins up a local static server to serve `dist/` to Puppeteer. Its handler ends in:

```js
fs.createReadStream(filePath).pipe(res);
```

with **no `error` handler on the stream**. `existsSync` is checked before the stream is opened, so any file that disappears or is mid-write in that window — `dist/index.html` is rewritten by the `/` prerender while other Puppeteer pages (concurrency 4) are still requesting the SPA fallback — throws an unhandled `'error'` that takes down the whole Node process and fails the build.

**Status:** pre-existing (present at `HEAD`, unrelated to any current change) and **not yet fixed.** The one-line fix is `.on("error", () => { res.statusCode = 500; res.end(); })` on the stream, or `res.writeHead` deferred until the stream's `open` event fires.

**Why it matters:** on Netlify this surfaces as a random red deploy that goes green on retry — the most expensive kind of flake to diagnose later, because it looks like a platform problem rather than a code one.
