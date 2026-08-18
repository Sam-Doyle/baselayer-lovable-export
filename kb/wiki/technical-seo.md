---
title: Technical SEO — Crawl, Index, Schema, Prerender
domain: technical
created: 2026-08-18
last_compiled: 2026-08-18
revision: 1
sources: [Google Search Console warnings, served HTML on baselayerskin.co, curl host/protocol probes, puppeteer polling probe, vite.config.ts prerender plugin]
codePaths:
  - vite.config.ts
  - src/config/pageSeo.ts
  - src/components/SEO.tsx
  - src/pages/Index.tsx
  - src/components/HomeBelowFold.tsx
---

What Google actually receives from this site, and the ways this codebase has
been caught sending it something other than what the source implies.
Complements `kb/wiki/seo-strategy.md` (keywords, content, internal linking —
what we *want* to rank for) — this article is strictly about delivery
mechanics. See also `kb/wiki/site-architecture.md` for how the prerender fits
the wider build, and `kb/wiki/performance-metrics.md` for the LCP work that
collides with it below.

---

## The Governing Rule: Two Sources, One Head

Every finding in this article is an instance of a single structural fact.

**In this codebase, anything the prerender plugin injects into `<head>` also
has a React component that writes it.** The plugin bakes one value into the
static HTML; the component overwrites it on hydration. Both are live. Neither
is obviously wrong when you read only one of them.

The consequence is a split audience. Google renders JavaScript, so the
*component* value is what ranks. Facebook, Twitter, Slack, Meta's ad-review
crawler, and every non-rendering fetcher read the *prerendered* value. When the
two disagree, nothing errors — you simply ship two different pages to two
different audiences and find out months later.

**Practice:** read the built HTML in `dist/`, not the source. Check both
writers before trusting either. When you settle a route on one source, say so
in a comment or it drifts back.

Three confirmed instances follow.

---

## Instance 1 — Duplicate Product Schema on the Landing Pages (2026-08-17, served HTML, confidence: high)

`/matte-moisturizer-for-men`, `/non-greasy-moisturizer-for-men`, and
`/all-in-one-skincare-for-men` each shipped **two conflicting Product
entities**:

| Source | `name` | Rating | Offer |
|---|---|---|---|
| `STATIC_PAGES` in `vite.config.ts` | "Base Layer Performance Face Moisturizer — …" | aggregateRating 4.8/5 | bare |
| React component | "Base Layer Performance Daily Face Cream — …" | none | full merchant fields |

Same `sku` (BL-PDFC-50ML), different names, same URL. Google picks one of a
pair like that arbitrarily.

The second, worse problem: **none of the three renders a star rating anywhere
in its UI.** Google requires the rating in `aggregateRating` markup to be
visible to the user on the same page. Marked-up-but-unshown ratings risk rich
result suppression beyond the offending URL. Only `/face-cream` displays the
Judge.me aggregate, so it is now the only route that claims one.

Fixed 2026-08-17 by removing the `vite.config.ts` injection. No `jsonLd` is
declared for static routes at all now — every static path is a React page
emitting its own schema, and Puppeteer runs it during prerender, so declaring
one in the build config would ship a rival entity by construction. `jsonLd`
remains on the `PageMeta` type for the dynamic Sanity routes, which genuinely
use it.

---

## Instance 2 — Dual-Source Titles and Descriptions (2026-08-17, grep of 14 `useMetaTags` call sites vs `STATIC_PAGES`, confidence: high)

Page titles and descriptions were declared twice. `STATIC_PAGES` baked one set
into the prerendered HTML; each page component set another through
`useMetaTags` on hydration.

**Ten of the fourteen static routes disagreed with themselves**, including `/`
and `/face-cream`. Only the four policy pages matched.

The build-config titles were the keyword-loaded ones — carrying "$38", "2026",
"Best Men's Face Moisturizer" — and were precisely the half being thrown away
on the surface that ranks.

Fixed 2026-08-17 by collapsing both into `src/config/pageSeo.ts`, imported
**relatively** by `vite.config.ts` (the `@/` alias is not resolvable while that
config is itself loading) and via the alias by the components. Verified in
`dist/`: all 14 routes ship exactly one title and one description, and
`document.title` after hydration equals the prerendered value.

A third copy of `BASE_URL` and the default OG image lived in `SEO.tsx` and was
folded into the same file in the same pass.

### Title guideline

Roughly 60 characters. Ten of the fourteen live titles were chosen 2026-08-17
by picking the stronger of each competing pair; four were merges. The chosen
set is in `src/config/pageSeo.ts` and is the source of truth — do not
reconstruct it from memory.

---

## Instance 3 — The Homepage Shipping as a Skeleton (2026-08-17, three consecutive failing builds plus a puppeteer polling probe, confidence: high)

The most expensive one, because it had no wrong value to spot — it shipped an
empty page.

Puppeteer's `waitForFunction` polls on **requestAnimationFrame by default**,
and a headless page stops painting once it settles. Any predicate that only
becomes true *after* that first paint is therefore never re-evaluated, and
burns its full timeout while the condition is already satisfied in the DOM.

The prerender's structure wait requires `nav` **and** `footer`. The homepage
defers `HomeBelowFold`, which carries the `<footer>`, roughly 3s behind a
`setTimeout` plus `requestIdleCallback` to keep it off the LCP path. So `/`
timed out at 20s and fell back to the skeleton shell: **2,959 bytes of root
content against 75,080 when it renders.**

Measured directly against the same predicate on the same built page:

| Polling mode | Result |
|---|---|
| default (rAF) | timed out at 20,005ms — footer confirmed present in the DOM |
| `polling: 500` | resolved in 3,514ms |
| `polling: "mutation"` | resolved in 3,078ms |

Fixed 2026-08-17 with `polling: 500` on both waits (the dynamic-content wait
has the same stall and fails silently, so it got the same treatment).

**Two durable rules out of this.**

1. **LCP deferral and prerendering are in direct tension.** Anything moved off
   the initial paint becomes invisible to a rAF-polled wait. Any future work
   that defers a component for Core Web Vitals needs the prerender wait checked
   in the same pass.
2. **`N rendered, 1 failed` is not a warning, it is a page shipping empty.**
   The build still exits 0 and the whole signal is one line in a 60-line log.
   The render count deserves to be a build failure.

It was a race, not a deterministic failure, which is why it survived unnoticed.
Production happened to win it, so the live homepage was never actually broken.
A build that lost it would have shipped a contentless homepage on the only
route currently indexed and ranking (position 2).

---

## Reading GSC Warnings Correctly

### Match the item name before assuming the URL (2026-08-17, confidence: high)

GSC's "Missing field review / aggregateRating (optional)" on "Base Layer
Performance Daily Face Cream" was firing on **the homepage, not the PDP**. The
exact schema name in the warning (no "Men's") matches `Index.tsx`, and
`/face-cream` already carried `aggregateRating`.

**Five routes on this site emit a Product schema with five different names and
one shared SKU.** Match the warning's item name against the `name` field in
each Product block before assuming which URL it refers to.

The homepage warnings stay open until a visible star rating exists on the
homepage. Natural home is `ProofStrip`. Adding the markup without the visible
rating would trade a warning for a policy violation.

### "Page with redirect" on the homepage is the www variant (2026-08-17, curl against host variants, confidence: high)

Host and protocol variants all resolve correctly:

- http apex → 301 → https apex
- https www → 301 → apex
- http www → two hops (http www → https www → apex)
- apex returns 200 to a Googlebot UA, self-referencing canonical, no robots meta
- all 60 sitemap URLs return 200, zero redirects or 404s

So a GSC "Page with redirect" on the homepage is **the www or http variant
being reported, which is the expected and correct state**, not an indexing
blocker. Check which property variant the report is scoped to before treating
it as a bug.

---

## Sitemap `lastmod`

`lastmod` is derived from `git log -1 --format=%cs -- <source file>`. An absent
`lastmod` is a normal sitemap; a wrong one is a claim Google can check against
what actually changed, and the penalty is that it discounts the field
site-wide. So the function returns `undefined` rather than guessing.

**Shallow-clone hazard (confidence: high, demonstrated).** In a `--depth=1`
checkout, `git log -1 -- <path>` does **not** fail and does **not** return
empty — it returns the single commit it has, which is the deploy commit. Every
static route would then claim it changed today, on every deploy, silently,
because a valid-looking date comes back. Proven with a local `--depth=1` clone:
`Navbar.tsx` returned 2026-08-17 while shallow and 2026-08-14 both truly and
after `--unshallow`.

Netlify's checkout has full history today — the live sitemap carries dates back
to March — so `gitHistoryIsShallow()` in `vite.config.ts` is a guard against
that changing, not a fix for a live problem. `git rev-parse
--is-shallow-repository` is the reliable detector.

**Related trap:** `scripts/generate-sitemap.mjs` runs first in `build` and
writes 56 URLs to `public/sitemap.xml`, then the vite plugin overwrites
`dist/sitemap.xml` with 60 and wins. The script is effectively dead code whose
committed output would ship stale if the plugin ever bailed early.

---

## Live Verification Snippets

Reading served HTML beats reading source. These are the checks that caught the
findings above.

```bash
# Root content size — a skeleton is ~3KB, a rendered homepage ~75KB
curl -s https://baselayerskin.co/ | python3 -c "import sys;h=sys.stdin.read();print(len(h.split('<div id=\"root\">')[1]))"

# Exactly one title per page
curl -s https://baselayerskin.co/face-cream | grep -c '<title>'

# Sitemap shape
curl -s https://baselayerskin.co/sitemap.xml | grep -c '<loc>'
```

---

## See Also

- `kb/wiki/seo-strategy.md` — keywords, content strategy, internal linking
- `kb/wiki/site-architecture.md` — the prerender plugin in build context
- `kb/wiki/performance-metrics.md` — the LCP deferral that collides with prerendering
