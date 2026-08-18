---
title: Technical SEO — Crawl, Index, Schema, Prerender
domain: technical
created: 2026-08-18
last_compiled: 2026-08-18
revision: 2
sources: [Google Search Console warnings, served HTML on baselayerskin.co, curl host/protocol probes, puppeteer polling probe, vite.config.ts prerender plugin, /seo-os:tech-debt full-sitemap crawl 2026-08-18, GA4 property 526066920]
codePaths:
  - vite.config.ts
  - public/_redirects
  - src/pages/advertorials/
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

## Instance 4 — Ad Landing Pages Ship the Homepage's `<title>` (2026-08-18, `/seo-os:tech-debt` crawl + curl of served HTML, confidence: high)

Same governing rule, fourth instance, and the one with the widest blast radius
because it hits paid traffic rather than organic.

`vite.config.ts` (~line 967) deliberately excludes three route families from
prerendering and rewrites them to a generic shell with a 200 status:

```
/lp          /__shell.html  200
/article/*   /__shell.html  200
/product/*   /__shell.html  200
```

`__shell.html` is 8,171 bytes and carries the **homepage's** title with no
canonical at all:

```
$ curl -sSL https://baselayerskin.co/article/5-reasons | grep -o '<title>.*</title>'
<title>Base Layer | Men's Face Cream That Actually Works | $38</title>
```

All five advertorials do set their own title, description and self-canonical on
hydration via `useCanonical()` / `useMetaTags()` in `src/pages/advertorials/*.tsx`.
Googlebot renders JS, so Googlebot is fine. Everything that does not render JS is
not:

- **Social unfurlers.** Facebook, Instagram, X and LinkedIn read raw HTML. Every
  shared or paid placement of an advertorial previews as "Base Layer | Men's Face
  Cream That Actually Works | $38" instead of "5 Reasons Men Are Switching From
  Drugstore Face Creams". The hook the ad was written around is discarded at the
  preview card.
- **AI crawlers.** `robots.txt` explicitly welcomes GPTBot, ClaudeBot,
  PerplexityBot, CCBot and the rest. All five advertorials currently present to
  them as the homepage.

The five affected routes are `/article/5-reasons`, `/article/2-minute-routine`,
`/article/one-bottle-experiment`, `/article/peptide-stack`,
`/article/concentration-test`, plus `/lp` and the `/product/*` wildcard.

**Fix:** the prerender pipeline works as of `ff8ba06` (2026-08-17). Add these
routes to the prerender list and drop the shell rewrites, so they ship a real
head like every other route. Keep them out of `sitemap.xml` — prerendering and
sitemap inclusion are separate decisions.

**Do not confuse this with the indexability question.** Whether advertorials
*should* be indexable is a separate open decision tracked in
`kb/wiki/seo-strategy.md`. Adding `noindex` would resolve that one and leave this
one broken, because a social unfurler does not read robots directives either.
Prerendering fixes both surfaces; `noindex` fixes one.

---

## Crawl Health Baseline (2026-08-18, `/seo-os:tech-debt`, all 60 sitemap URLs, confidence: high)

Full sequential crawl of every sitemap URL with a normal Chrome UA. **60/60
returned 200.** Zero redirects, zero chains, zero loops, zero canonical
mismatches, zero `noindex`, exactly one title, one canonical and one h1 per page,
no duplicate titles, no duplicate canonicals, and nothing 4xx that is internally
linked.

Record this as the baseline: **technical delivery is not what is capping this
site.** Future audits should compare against 60/60 clean rather than re-deriving
it. The two pages carrying 78% of all sessions (`/` at 138 and `/face-cream` at
71 over 90 days) have nothing wrong with them.

The residual hygiene items, all on pages with zero sessions and zero impressions:

- **Five 2-hop redirect chains through `/blog/*`.** `/blog/3-step-skincare-routine-men`,
  `/blog/skincare-ingredients-that-work`, `/blog/post-shave-recovery`,
  `/blog/razor-burn-guide` and `/blog/skin-barrier-guide` each match the
  `/blog/* → /articles/:splat` wildcard first, then the article-slug rule.
  Netlify takes the first matching rule, so five explicit
  `/blog/<old-slug> → <final> 301` lines placed *above* the wildcard in
  `public/_redirects` collapse every one to a single hop.
- **One internal link to a 301.** `/articles/the-ultimate-3-step-skincare-routine-for-urban-commuters`
  links to `/skin-concerns/barrier-damage`, which 301s to
  `/skin-concerns/dry-dehydrated-skin-men`.
- **`/product/*` is an open 200 wildcard**, so unknown handles are soft-404s
  rather than real 404s. Nothing links there and the plural `/products/*`
  correctly 301s to `/face-cream`, so live exposure is zero.

**Core Web Vitals were not measured** in this run and no claim about them appears
anywhere in it. There is no PageSpeed Insights key at `~/.seo-os/psi-key.txt`.
The key is free; without it the tech-debt skill skips CWV entirely rather than
substituting a heuristic.

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

# Ad landing pages must NOT carry the homepage title (Instance 4)
curl -sSL https://baselayerskin.co/article/5-reasons | grep -o '<title>.*</title>'

# Redirect hop count — anything above 1 is a chain
curl -sS -o /dev/null -L -w 'hops=%{num_redirects} -> %{url_effective}\n' \
  https://baselayerskin.co/blog/3-step-skincare-routine-men
```

---

## See Also

- `kb/wiki/seo-strategy.md` — keywords, content strategy, internal linking
- `kb/wiki/site-architecture.md` — the prerender plugin in build context
- `kb/wiki/performance-metrics.md` — the LCP deferral that collides with prerendering
