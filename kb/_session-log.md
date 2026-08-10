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

## 2026-08-10 — Technical debt cleanup + first real-browser verification
- **Task**: Set the legal entity to "Base Layer Skin LLC", cleared the three technical-debt items from the teardown, and verified the whole change set in Chrome against a `vite preview` of the production build.
- **Findings**:
  - There was a **second** brand orange nobody had catalogued: `#F35D1A`, used 34 times across 9 files for links, icons, rules, and `selection:` highlights. It is 3.29:1 on white and 4.11:1 on the `#1A2F4C` navy — both fail AA for normal-size text, both pass the 3:1 bar for large text and non-text UI. The earlier "sitewide AA sweep" only covered the CTA orange. Tokenized as `brand-accent` with the failure documented in `tailwind.config.ts`; values left unchanged because darkening it is a visible design decision.
  - The legacy cart was a closed orphan set of four files, not one file with live consumers: `Checkout.tsx` is the only entry point and nothing imports it (`/checkout` has redirected to `/face-cream` since 2026-07-06). `CartDrawer.tsx` and `SoldOutModal.tsx` are imported only by `Checkout.tsx`. `SoldOutModal` also carried a hardcoded `const counter = 387` — fabricated social proof that would have gone live if that page were ever re-routed.
  - `updateQuantity` delegates to `removeItem` when quantity hits zero, and that delegation happens **before** `set({ isLoading: true })`. That ordering is what makes an `isLoading` early-return guard safe in both functions; hoisting the `set` would silently break the decrement-to-zero path. Called out in a code comment.
  - **Testing gotcha**: the Chrome MCP tab runs with `document.visibilityState === "hidden"`, which pauses `requestAnimationFrame`. Any component that throttles through rAF (`StickyMobileCTA`) appears frozen. Patch `window.requestAnimationFrame = cb => cb()` in the page before dispatching scroll events. `vite preview` also SPA-falls-back to `index.html` for prerendered routes, so verify prerendered output against `dist/<route>/index.html` on disk, not over HTTP.
- **Browser verification** (localhost:4177, production build): 3 rapid clicks on add-to-cart → 1 cart line, qty 1, exactly 1 GA4 `add_to_cart` and 1 Meta `AddToCart`. Sequential `+` clicks increment normally (1→2→3), a 3-click burst adds only 1 (3→4), `−` decrements, and decrementing from 1 clears the cart through the delegation path. Every `brand`/`brand-accent` class resolves to the identical rgb it replaced — zero unresolved utilities. Hero CTA is `<a href="/face-cream">`. Sticky mobile bar toggles `aria-hidden`/`tabIndex`/`pointer-events` correctly across the fold. Only console output sitewide is Meta Pixel refusing localhost traffic.
- **Files changed**: `tailwind.config.ts` (brand token layer), `src/config/legal.ts` (entityName), `src/App.tsx` (CartProvider unmounted), `src/stores/cartStore.ts` (guards on updateQuantity + removeItem), plus 13 files swept from raw hex to tokens.
- **Outstanding**: The four legacy cart files still exist on disk — deletion was blocked by the permission classifier and is left for the user. `brand-accent` still fails AA at normal text size. No cookie-consent banner. Shipping/processing windows unconfirmed against real fulfilment. Cart quantity controls in `ShopifyCartDrawer` are icon-only buttons with no accessible name.
- **KB updates**: None beyond this entry; the accent-orange contrast finding is the one worth compiling.

## 2026-08-10 — Subscription cadence 8→6 weeks + Shopify product image swap to light packshot
- **Task**: Changed the Subscribe & Save plan from 8-week to 6-week delivery (Shopify admin + frontend copy), and put the light white-background packshot (`base-layer-carousel-01-primary.png`, product-page slide 1) on the Shopify product so checkout/cart thumbnails match the branded PDP instead of the dark rock hero.
- **Findings**:
  - Editing a Shopify Subscriptions app plan's frequency does NOT change the selling plan GID — `gid://shopify/SellingPlan/2934145095` survived the 8→6 week edit, so no frontend GID updates were needed. Storefront API confirms "Deliver every 6 weeks, $32.00". Changes apply to new subscribers only.
  - Admin media upload without a native file picker: inject `<input type="file">` into the page via JS, populate it with the browser MCP `file_upload` tool, then build a `DataTransfer` from `input.files` and dispatch synthetic `dragenter`/`dragover`/`drop` on the Polaris DropZone. Works with the full-res 1.4MB PNG; no base64 chunking needed.
  - Media drag-to-reorder in admin resists all automation: CDP click-drag, dnd-kit keyboard sensor (Space opens the viewer instead), synthetic pointer events, and synthetic HTML5 drag events all fail. The internal admin GraphQL endpoint (`/api/shopify/<store>?operation=X`) returns 403 from page-context fetch (CSRF).
  - The workaround that matters: **variant images override the featured image** in checkout and cart. Assigning the packshot to both variants via the click-only "Select image" dialog achieves the customer-facing goal without reordering media. Verified via Storefront API: both variants return `base-layer-carousel-01-primary.png`; featured image remains `product-hero-rock.png`.
- **Files changed**: `src/config/product.ts` (duration + cart line copy "every 6 weeks", updated stale wiring comment). Uncommitted — rides with `cro/day1-golive-fixes`.
- **Outstanding**: Live site still says "every 8 weeks" until the golive branch deploys. Featured image reorder is a 2-second manual drag in admin Media if wanted. Test-mode subscription checkout + Payments test-mode toggle still on Sam's list.
- **KB updates**: This entry only.

## 2026-08-10 — Subscription price $34 (save $4) + deploy prep
- **Task**: Subscription price moved from $32 to $34. Sam changed the Shopify selling plan himself to a fixed $34 (same GID, `SellingPlanFixedPriceAdjustment` $34.00 on both variants, verified via Storefront API). Frontend `SUBSCRIBE_PRICE` updated 32→34 in `src/config/product.ts`; savings auto-computes to $4 from the $38 one-time price.
- **Findings**: Changing a Subscriptions app plan's pricing model (percentage → fixed price) also preserves the selling plan GID. Existing subscribers keep their old price; new subscribers get $34.
- **Files changed**: `src/config/product.ts` — committed as 45b732d on `cro/day1-golive-fixes` ("feat(product): subscription $34 every 6 weeks to match live selling plan"). Typecheck clean, 15/15 tests pass, production build prerendered 59 routes; bundle spot-check confirms `price:34, savings:4, duration:"every 6 weeks"`. Deployed to Netlify (deploy 6a7a1a326595a52c9d0c0127), verified live on /face-cream.
- **KB updates**: This entry only.

## 2026-08-10 — Cart drawer subscription clarity + shop-subdomain redirect
- **Task**: Made subscription lines explicit in the cart drawer (variant title in brand orange, "Auto-renews every 6 weeks at $34. Pause or cancel anytime." sourced from live tier config, renewal disclosure above the checkout button, light packshot as cart thumbnail). Added a redirect to the unused Horizon theme's `layout/theme.liquid` so shop.baselayerskin.co storefront pages bounce to baselayerskin.co (post-checkout "Continue shopping" no longer strands buyers on the default Shopify theme).
- **Findings**:
  - Cart drawer prices come from localStorage-persisted items, so lines added before a price change keep showing the old price; deriving renewal copy from `BUY_TIERS` (matched by `sellingPlanGid`) sidesteps the staleness.
  - Theme id is exposed in storefront HTML as `Shopify.theme` — direct code-editor URL is `admin.shopify.com/store/<store>/themes/<id>?key=layout/theme.liquid`. The new VS Code-style editor never finishes loading in a backgrounded Chrome tab (rAF throttling); the tab must be visible. The permission classifier blocks typing into the admin code editor entirely — Sam pastes, agent verifies.
  - Theme-layout redirect is safe for checkout: `/checkouts/cn/*` and `/cart/c/*` never render `theme.liquid`. Curl-testing a cart permalink without cookies false-alarms (Shop Pay universal redirect bounces cookie-less clients to the homepage); verify in a real browser.
  - Shopify checkout already carries a subscription disclosure ("you agree to the future charges listed on this page and the cancellation policy").
- **Files changed**: `src/components/ShopifyCartDrawer.tsx`, `src/config/product.ts` (packshot import) — commit 6aa0a6b. Shopify theme 139500027975 `layout/theme.liquid` (manual paste by Sam, verified live).
- **KB updates**: This entry only.

## 2026-08-10 — Accent AA split, consent gate, homepage CTA band, go-live availability sweep
- **Task**: Applied the two-token accent split, deleted four orphan cart files, landed the consent gate and first test suite, closed the homepage CTA dead zone, and swept every pre-launch availability claim to "in stock" now that inventory exists and sales are on.
- **Findings**:
  - **The typecheck gate was a no-op for an entire session.** Root `tsconfig.json` uses `"files": []` with project `references`, so bare `tsc --noEmit` compiles zero files — proven with `--listFiles | wc -l` returning 0. It exited 0 on a JSX syntax error that broke the build. Any repo using project references needs `tsc -b`; a green `tsc --noEmit` there proves nothing.
  - **No single hex can pass AA on both white and #1A2F4C navy.** Darkening a foreground raises contrast on light grounds and lowers it on dark ones, and the two required luminance ranges do not overlap. Two tokens (`accent` #C4470E, `accent-on-dark` #FF7034) is the minimum correct fix, not over-engineering.
  - **Contrast must be computed against the composited ground, not the nominal one.** The testimonial tag pill is accent-at-15% over a 6% white card over navy, compositing to ~#484352, where accent-on-its-own-tint is 3.46:1. Walk the ancestor chain and composite alpha before judging any translucent surface.
  - **JSON-LD can be injected from outside `src/`.** Three pages emitted `schema.org/PreOrder` after `src/` was fully clean because `vite.config.ts` hardcodes per-route Product schema at build time. Grepping source alone missed it; only grepping `dist/` after a build caught it. Always verify structured data against built output.
  - **zsh does not word-split unquoted variables**, so `perl ... $FILES` passes one long filename. Use `${=FILES}` or an explicit list.
  - **`perl -CSD -i -pe` decodes input to characters but leaves the `-e` script as raw bytes**, so a literal em dash in the pattern never matches a decoded U+2014. Use `\x{2014}`.
- **Files changed**: `tailwind.config.ts`, `TestimonialsSection`, `OurOriginSection`, `ListicleGirlfriend` (accent split); `consent.ts`, `CookieConsentBanner`, `App.tsx`, `analytics.ts`, `Footer`, `PrivacyPolicy` (consent); `Index.tsx` (CTA band); 9 content pages + `vite.config.ts` (availability sweep); `package.json`, `.gitignore`, `src/test/*` (tooling + 15 tests). Deleted `Checkout.tsx`, `CartDrawer.tsx`, `SoldOutModal.tsx`, `CartContext.tsx`.
- **Outstanding**: "Ships in 1-2 business days" is now a binding FTC 16 CFR 435 claim and is unverified against real fulfilment. `/lp` and two article pages still carry fabricated testimonials, press blurbs and scarcity counts. All Shopify `userErrors` paths in `cartStore.ts` still fail silently. No ErrorBoundary. `MetaRouterTracker.tsx` fires CAPI outside the consent gate. Navbar is navy-on-navy over the hero at scroll-top (pre-existing).
- **KB updates**: This entry; the availability change is reflected in `kb/wiki/seo-strategy.md`.

## 2026-08-10 — SEO-OS setup (Search Console + GA4 connection)
- **Task**: Ran /seo-os:setup. Old gcloud auth (samuel.r.doyle@gmail.com / gws-personal-cli) was fully revoked; rebuilt under contact@baselayerskin.co on project steadfast-pivot-489901-u5. Google blocked the generic gcloud client (expected), so created a dedicated Internal OAuth desktop client (~/.seo-os/oauth-client.json, chmod 600) — Internal audience means no token expiry. Enabled searchconsole/analyticsdata/analyticsadmin/cloudresourcemanager APIs; set quota project.
- **Findings**: GSC verified (sc-domain:baselayerskin.co, siteOwner). GA4 verified (properties/526066920). Zero search impressions in trailing 6 months — organic baseline is zero.
- **Files changed**: none in repo (auth config only)
- **KB updates**: inbox entry with SEO baseline + GA4 property id

## 2026-08-10 — SEO dashboard + tech-debt audit
- **Task**: /seo-os:dashboard (score 6/100, runs/seo-dashboard.html) then /seo-os:tech-debt (runs/tech-debt-2026-08-10.md). Crawled all 59 sitemap URLs live.
- **Findings**: Zero-impression root cause = sitemap never submitted to GSC (sitemap itself is live + valid). Site structurally clean. Soft-404 on unknown paths; merchant schema missing 3 fields across 5 page files. GA4 90d: 110 sessions, 100% of organic is non-Google.
- **Files changed**: runs/seo-dashboard.html, runs/tech-debt-2026-08-10.md (new, audit outputs only — no site code touched)
- **KB updates**: 3 inbox entries (SEO baseline, indexing root cause, tech-debt results)

## 2026-08-10 — Implemented tech-debt tickets 2 & 3
- **Task**: Merchant schema fields (shared src/config/merchantSchema.ts spread into 5 Offer blocks) + soft-404 fix (prerender plugin now emits dist/404.html with noindex; fallback is /* /404.html 404 with explicit 200 shell rewrites for client-only ad routes /lp, /article/*, /product/*; /checkout got a server-side 301).
- **Findings**: /lp and /article/* listicles are client-only ad routes that depended on the SPA 200 fallback — naive 404 fallback would have served ad landing pages with HTTP 404 to Meta's crawler. Pre-existing typecheck failures on branch (analytics.ts fbq stub, vite.config.ts puppeteer callbacks) — spawned separate task.
- **Files changed**: src/config/merchantSchema.ts (new), FaceCream/Index/MatteMoisturizer/NonGreasyMoisturizer/ProductDetail.tsx, vite.config.ts, public/_redirects
- **KB updates**: this entry
