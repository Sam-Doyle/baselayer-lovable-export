# Session Log — Append Only

Each session appends a digest here. Never edit or delete prior entries.

## Entry Format

```markdown
## YYYY-MM-DD — Brief task description
- **Task**: What was done
- **Findings**: Key learnings (if any)
- **Files changed**: List of modified files
- **KB updates**: What was added to inbox or wiki
```

---

<!-- Session entries below this line -->

## 2026-04-03 — KB Foundation + Seed (Phases 1-3)
- **Task**: Built continuous learning knowledge base system from scratch. Created CLAUDE.md with KB protocol rules, directory structure (wiki/raw/scripts), index, inbox, session log, and health check script. Seeded 9 wiki articles via parallel subagents. Created learned skill for KB maintenance. Updated MEMORY.md.
- **Findings**: Karpathy-inspired LLM Knowledge Base pattern works well with CLAUDE.md rules as the automation mechanism — agents read rules at session start, which is more reliable than hooks for triggering KB behavior.
- **Files changed**: CLAUDE.md (new), kb/_index.md, kb/_inbox.md, kb/_session-log.md, kb/scripts/health-check.sh, kb/wiki/ (9 articles), ~/.claude/skills/learned/baselayer-kb-maintenance.md, MEMORY.md
- **KB updates**: 9 wiki articles seeded (product-formula, brand-identity, competitor-landscape, site-architecture, customer-insights, performance-metrics, seo-strategy, ad-strategy, launch-timeline). Index updated with full summaries. Health check: HEALTHY.

## 2026-07-06 — Wire live Shopify checkout, remove email capture
- **Task**: Switch site from waitlist/email-capture mode to live Shopify cart + checkout (products arriving this week)
- **Findings**: Store live at base-layer-skin.myshopify.com with 1 variant ($38, gid://shopify/ProductVariant/42561862402119); Storefront API works. CRITICAL: baselayerskin.co is Shopify's primary domain but DNS serves Netlify → checkoutUrls dead-end into SPA; myshopify domain 301s back (loop). Requires Shopify admin domain fix (remove apex or move to shop. subdomain). Bundle tiers (2/3 bottles) have no Shopify variants yet — hidden until GIDs added to src/config/product.ts.
- **Files changed**: src/config/product.ts (new), src/context/EarlyAccessContext.tsx (openModal → real add-to-cart, exit-intent removed), src/components/HeroSection.tsx (email form → buy CTA, "Cancel anytime" → "No subscription"), src/pages/FaceCream.tsx (real variants, tier filter, InStock schema, ship copy), src/pages/Index.tsx + src/App.tsx (ExitIntentPopup/EarlyAccessModal unmounted, /checkout → redirect), src/components/FAQSection.tsx + StickyCartBar.tsx (ship copy), src/components/ShopifyCartDrawer.tsx (begin_checkout event, same-tab nav for IG WebView), public/_redirects (/cart/c/* + /checkouts/* passthrough)
- **KB updates**: inbox entry on Shopify domain conflict

## 2026-07-07 — Test order verified, S&S tier wired, honest-proof sweep
- **Task**: Browser-test checkout with test payment; wire 2-bottle + Subscribe & Save tiers; implement audit conversion fixes
- **Findings**: TEST ORDER COMPLETED (#VTQIU5898, card 4242, $38) via local site → shop.baselayerskin.co checkout. CRITICAL: checkout collects NO shipping address — product not marked "physical" in Shopify admin (fix: product → check physical + weight). Real waitlist count = 13 (not 1,000+) — all "1,000+ men"/"4.8/5" claims were fabricated and removed. Custom web pixel present on Shopify checkout (verify Meta ID). Tier config: 2-bottle variant + selling plan GIDs still needed from admin (src/config/product.ts).
- **Files changed**: cartStore.ts (sellingPlanId support), config/product.ts (3-tier config w/ S&S), FaceCream.tsx (tier rendering, sub CTA, FAQ rewrite), FAQSection.tsx, HeroSection.tsx/Navbar.tsx/TestimonialsSection.tsx/Listicle.tsx (fabricated proof → Founding Batch 01 framing), PressBanner.tsx (press logos → spec marquee), Index.tsx (fabricated schema reviews/aggregateRating stripped), ShopifyCartDrawer.tsx (2-bottle upsell, gated), LandingPage/AllInOneSkincare/NonGreasyMoisturizer (subscription copy reconciled), public/llms.txt (broken paths fixed + Buying section)
- **KB updates**: inbox entries on shipping config + positioning shift

## 2026-07-08 — Shopify variants + Subscribe & Save live, CSP deploy fix
- **Task**: Resume Shopify wiring: 2-bottle variant, Subscribe & Save plan, verify checkout end-to-end
- **Findings**: Production add-to-cart was broken since launch — stale public/netlify.toml inside dist overrode _headers CSP on every deploy. Netlify CLI deploys hang; zip API deploy works. Shopify recreated variant GIDs when Pack option added.
- **Files changed**: src/config/product.ts (new variant + selling plan GIDs), public/netlify.toml (deleted)
- **KB updates**: Deploy pipeline gotchas added to inbox

## 2026-08-10 — Product carousel replacement on /face-cream
- **Task**: Replaced 6 legacy gallery images with 7-slide Base-Layer-Heroes WebP carousel set (guide order, lifestyle v2); gallery frames aspect-[4/5] → aspect-square to fit square assets uncropped.
- **Findings**: Carousel images are Vite-bundled static assets, not Sanity/Shopify. 1254px squares cover up to 3x DPR mobile; slide 1 (54KB, eager + fetchPriority high) is the LCP element. KB zip-POST deploy workaround still the working path (CLI deploy unavailable).
- **Files changed**: src/pages/FaceCream.tsx, src/assets/product-carousel/* (7 new). Commit 3f1dfc7 on cro/day1-golive-fixes, pushed to origin.
- **KB updates**: None (deploy gotcha already in inbox).

## 2026-08-10 — Day 1 go-live teardown fixes: CRO, accessibility, legal pages
- **Task**: Implemented the 7-finding store teardown. Add-to-cart double-fire fix, WCAG AA contrast sweep, hero→PDP funnel rearchitecture, Trustpilot mark removal + FTC disclosure, and four legal policy pages taken from scaffold to full text.
- **Findings**:
  - Add-to-cart double-fire root cause was a missing in-flight lock in `cartStore.addItem`, not a component bug — every CTA funnels through it. Fixing only the store still left a duplicate `add_to_cart` firing to GA4/Meta from `EarlyAccessContext.openModal`, so the guard is needed in both places.
  - Brand orange `#D94E12` on white text is 4.16:1 and fails AA. It was hardcoded across 18 CTAs in 8 files because the brand colors were never added to the Tailwind token layer (shadcn tokens exist; brand colors don't). Swept to `#C04510` (5.12:1), hover `#A83C0E` (6.33:1). 10 buttons already had `hover:bg-[#C04510]` and would have become dead hovers if the base changed without touching them.
  - Hero and sticky-mobile CTAs were adding to cart directly, which locked every cold-traffic conversion to the `$38` `DEFAULT_TIER`, bypassed the `$68`/subscription tiers that exist only in the PDP selector, and handed Meta an AddToCart with no preceding ViewContent (`view_item` fires only at `FaceCream.tsx`). Retargeting loss is unrecoverable retroactively. Hero + sticky now link to `/face-cream`; deep-scroll CTAs still add direct.
  - `select_item` is unmapped in `FB_STANDARD_EVENTS`, so it reaches GA4 + Supabase and correctly skips Meta.
  - Meta/Google ad-review crawlers fetch policy URLs without reliably executing JS, so the policy routes must be prerendered — registered in both `vite.config.ts` STATIC_PAGES and `scripts/generate-sitemap.mjs` (two separate lists).
- **Files changed**: 22 files. New: `src/config/legal.ts`, 4 policy pages, `MidPageCTA`, `StickyMobileCTA`, `StarRating`, `testimonialsData`. Deleted: `TrustpilotStars.tsx` (rendered Trustpilot's trademarked mark implying a nonexistent 4.8 aggregate).
- **Outstanding**: No cookie-consent banner while GA4/Meta Pixel/`bl_session` fire unconditionally. `legal.ts` `entityName` is the trading name, not a registered entity. No binding arbitration clause (deliberate). Two coexisting cart systems — legacy `CartProvider` mounted at `App.tsx` with its drawer never rendered. Brand colors still not tokenized.
- **KB updates**: Contrast and funnel findings above are the durable ones; conversion-category entries worth compiling to inbox next session.
