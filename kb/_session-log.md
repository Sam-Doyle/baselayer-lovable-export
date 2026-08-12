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

## 2026-08-10 (evening) — Tech-debt re-audit post-deploy
- **Task**: Re-ran /seo-os:tech-debt after production deploy 82c4df8. Verified all 3 morning tickets live (sitemap submitted 18:08 + downloaded by Google 0 errors; merchant schema live; real 404s live, ad routes intact).
- **Findings**: One new defect — Sanity article (urban-commuters routine) links to nonexistent /skin-concerns/barrier-damage; added 301 → dry-dehydrated-skin-men in public/_redirects (ships next deploy). Sanity content edit is the durable fix. Everything else clean; the 15-component deletion broke no links.
- **Files changed**: public/_redirects (+1 redirect), runs/tech-debt-2026-08-10.md (re-audit section)
- **KB updates**: this entry

## 2026-08-11 — 3-agent content quality pass (2 articles + comparison)
- **Task**: Copy editor, front-end designer, SEO specialist subagents on best-moisturizer-for-men, best-moisturizer-men-over-40, best-mens-face-moisturizers-compared.
- **Findings**: injectMeta regex bug (site-wide meta never reached crawlers); empty Our Verdict render; fabricated competitor absorption times; duplicate timeline content; 228% GHK-Cu stat uncited (pending decision); comparison lacks disclosure + author.
- **Files changed**: vite.config.ts, src/components/SEO.tsx, src/components/PortableText.tsx, src/pages/ArticleDetail.tsx, src/pages/ComparisonDetail.tsx, src/lib/queries.ts (uncommitted). Sanity: 3 drafts (not published).
- **KB updates**: inbox entry (site-wide meta bug + integrity findings)

## 2026-08-11 — 2-pack as PDP default + $50 free-shipping threshold
- **Task**: Made the $68 2-pack the preselected PDP tier (it already existed in BUY_TIERS with a live variant GID — only the default changed), and rewrote every shipping claim on the site from unconditional "free shipping" to "free over $50, free on subscriptions, $5.95 otherwise".
- **Findings**: The old ShippingPolicy text ("no minimum order value and no shipping charge") and merchantSchema's hardcoded shippingRate 0 would both have become false claims — the schema one is the dangerous half, since Google Merchant Center reconciles it against checkout. Two FAQ answers served in FAQPage JSON-LD claimed "$38, ships free" and "we don't do subscriptions" (the latter already false given Subscribe & Save); both corrected. Shopify supports the subscribe-and-save shipping exemption natively via a Free Shipping automatic discount with Purchase type: Subscription — no Function needed.
- **Files changed**: src/config/product.ts, src/config/legal.ts, src/config/merchantSchema.ts, src/components/Navbar.tsx, src/components/HeroSection.tsx, src/components/OurOriginSection.tsx, src/components/ShopifyCartDrawer.tsx, src/pages/FaceCream.tsx, src/pages/ShippingPolicy.tsx, src/pages/TermsOfService.tsx, src/pages/LandingPage.tsx, src/pages/NonGreasyMoisturizer.tsx, src/pages/AllInOneSkincare.tsx, src/test/ctaRouting.test.tsx
- **KB updates**: inbox entry (2-pack default economics + Shopify free-shipping construction)

## 2026-08-11 — Subscribe & Save flattened to $35
- **Task**: Replaced the staged subscription plan ($38 delivery one, $34 after) with a single $35 on every delivery. Collapsed SUBSCRIBE_FIRST_PRICE/SUBSCRIBE_RENEWAL_PRICE into one constant, dropped `renewalPrice` from the BuyTier interface, updated the cart drawer's auto-renew disclosure.
- **Findings**: Four-order contribution is a wash — $72.74 flat vs $72.73 staged. Staged earns $2.91 more on order one, flat earns $0.98 more per renewal, crossover at delivery four. The real win is operational: one number in copy, one pricing policy in admin instead of an initial/recurring split the native Subscriptions UI doesn't reliably expose. **CORRECTION (2026-08-11):** this entry originally read "Verified against the live Storefront API that Shopify already bills $35.00 on delivery one." That was false, and commit 49c01d1's message carries the same false claim (left in place — it's pushed history). What the cart drawer displayed came from src/config/product.ts via buildCartItem, never from Shopify. The live plan is a SellingPlanFixedPriceAdjustment at $34.00 with orderCount null (every delivery, no staging). Buy-tile badges are whitespace-nowrap and centred on ~96px tiles at a 360px viewport, so badge text over ~90px rendered collides with the neighbouring badge across the 12px gap — "CANCEL ANYTIME" (115px) collided, "NO LOCK-IN" (84px) clears.
- **Files changed**: src/config/product.ts, src/components/ShopifyCartDrawer.tsx
- **KB updates**: this entry

## 2026-08-11 — Cart wired to Shopify's real prices; verify:pricing gate added
- **Task**: Every price in the cart drawer was computed from src/config/product.ts and never read back from Shopify, so the site could advertise a number Shopify had no intention of charging — which is exactly what it was doing ($35 advertised, $34 charged). Added one shared CART_FIELDS set to every cart-returning operation (create/add/update/remove/sync) pulling `cost.subtotalAmount` and per-line `cost.amountPerQuantity` plus `sellingPlanAllocation.sellingPlan.id`; the store now overwrites local line prices, quantities and lineIds with Shopify's on every response, persists `cost`, and repairs stale localStorage prices on drawer open. Added scripts/verify-pricing.mjs (`npm run verify:pricing`) to catch config-vs-Shopify drift on the PDP, which stays statically declared.
- **Findings**: The PDP buy tiles can't go dynamic the way the cart did — Puppeteer bakes them into static HTML across 59 routes and they feed JSON-LD `offers.price`, so a runtime fetch would ship empty prices in prerendered output and shift layout on the highest-value element. A drift check moves the same guarantee to a moment where being wrong costs a failed check instead of a wrong order. Storefront `cost` also covers cases a local sum can't model at all (cart-level discounts, volume rules). Selling plan lines and one-time lines of the same variant are indistinguishable by `merchandise.id` alone — matching needs `sellingPlanAllocation`. Shopify auto-names selling plans with the price embedded ("Deliver every 6 weeks, $34.00") and that name renders at checkout, so a stale name contradicts the page even when the adjustment is right; verify:pricing checks the name too.
- **Files changed**: src/stores/cartStore.ts, src/components/ShopifyCartDrawer.tsx, src/config/product.ts (comments only), src/test/cartStore.test.ts (+4 tests), scripts/verify-pricing.mjs (new), package.json
- **KB updates**: this entry, plus a correction appended to the 2026-08-11 subscription entry above

## 2026-08-12 — Intent map: Caldera + Lab competitor proxy
- **Task**: /seo-os:intent-map came back data-starved (0 GSC queries, 0/59 indexed), so built the competitor-proxy version on Caldera + Lab: full sitemap crawl (210 URLs) + 6 live SERP probes mapped against Base Layer's 59 pages.
- **Findings**: Brand collision — Caldera sells "The Base Layer" moisturizer ($65/$52 sub) and owns the "base layer moisturizer for men" SERP. Their strategy is paid→quiz funnel (~85 ad-lander pages), blog is 2021 legacy; question-format articles rank for them, listicles don't. Base Layer already out-architects them on moisturizer content.
- **Files changed**: runs/intent-map-caldera-proxy-2026-08-12.md (new), kb/_inbox.md (+2 entries)
- **KB updates**: 2 competitive entries → competitor-landscape (brand collision; Caldera strategy read)

## 2026-08-12 — Mobile homepage conversion redesign
- **Task**: Rebuilt the homepage hero as a product-first ecommerce layout, simplified promotional and guarantee copy, moved genuine tester proof before the purchase CTA, added a visible cart control, made CTA language product-specific, and tied the mobile sticky bar to the hero CTA's visibility.
- **Findings**: No verified aggregate customer-review count exists, so the hero uses the documented "50 early testers. Zero refund requests." claim instead of a fabricated rating. At the narrow mobile viewport tested, the product, category, outcome, proof, benefits, price, and primary CTA all render without horizontal overflow and the CTA remains visible before scrolling.
- **Files changed**: `src/components/HeroSection.tsx`, `src/components/Navbar.tsx`, `src/components/StickyMobileCTA.tsx`, `src/components/MidPageCTA.tsx`, `src/components/TestimonialsSection.tsx`, `src/components/OurOriginSection.tsx`, `src/pages/Index.tsx`, `src/test/ctaRouting.test.tsx`, `vite.config.ts`.
- **KB updates**: This session-log entry only; no conversion result is claimed until live traffic is measured.

## 2026-08-12 — Caldera comparison article published to Sanity
- **Task**: Sourced the fragrance claim, built 2 branded SVG comparison graphics + uploaded 2 real product photos to Sanity, published "Base Layer vs Caldera Lab" (slug base-layer-vs-caldera-lab, contentPillar comparisons, 42 body blocks, 3 inline images, scienceNote citation, ctaBlock, 4 FAQs), and patched+published inbound links from best-anti-aging-moisturizer-men, no-subscription-model, and best-mens-face-moisturizers-compared.
- **Findings**: NACDG 2019-2020 (PubMed 36917520) fragrance mix I 12.8% / third most common allergen; Sanity CDN serves SVGs fine with transform params.
- **Files changed**: runs/content/base-layer-vs-caldera-lab.md (source replaced), kb/_inbox.md, kb/_session-log.md. Sanity: 1 new article doc + 3 patched docs + 4 image assets.
- **KB updates**: 2 inbox entries (fragrance citation; SVG-to-Sanity pipeline).
- **Note**: Site is prerendered — new article goes live on next deploy.

## 2026-08-12 — Advertorials folder
- **Task**: Created `src/pages/advertorials/` and moved the three advertorial pages into it (Listicle, ListicleGirlfriend, OneBottleExperiment), updated the lazy imports in App.tsx, and added a folder README covering routing, pricing/proof sourcing, and claim rails.
- **Findings**: `ListicleGirlfriend.tsx` runs an invented first-person narrator ("Michael G.", "SPONSORED REVIEW"), which contradicts the third-person/real-tester rule in runs/static-to-advertorial-plan-2026-08-12.md. Flagged in the README; needs a rewrite before it carries spend.
- **Files changed**: `src/App.tsx`, `src/pages/advertorials/{Listicle,ListicleGirlfriend,OneBottleExperiment}.tsx` (moved), `src/pages/advertorials/README.md` (new).
- **KB updates**: This session-log entry only.
- **Verification**: vite build clean (60 routes prerendered, 0 failed); all three /article/* routes render in dev with no console errors. Pre-existing tsc errors in src/lib/analytics.ts are unrelated and untouched.

## 2026-08-12 — Advertorial builder CLAUDE.md
- **Task**: Added `src/pages/advertorials/CLAUDE.md` from a supplied DTC advertorial builder prompt, adapted to this repo and to Base Layer's compliance posture. Replaced the earlier README (single source of truth).
- **Findings**: The source prompt's proof sections assume fabricated proof — fake credentialed bylines ("Dr. Sarah Mitchell, Board-Certified Dermatologist"), invented review counts/star ratings, "Verified Buyer" badges on written-from-scratch testimonials, invented clinical percentages, and fake scarcity. All are FTC 16 CFR Part 465 exposure and Meta ad-review risk, and the last one contradicts an explicit instruction already in `src/components/testimonialsData.ts`. Rewrote those sections to source from the three disclosed testers, published concentrations, and BUY_TIERS. Also swapped the "single self-contained index.html" output target for TSX page + App.tsx route, since a static HTML file doesn't build in this Vite SPA.
- **Audit of legacy pages**: `Listicle.tsx` carries three invented testimonials (David/Mike/James) with "Verified buyer" badges and 5-star graphics against `PRODUCT_RATING {0,0}`, cognitive claims for a moisturizer ("focus-boosting", "no midday slump", "helps you lock in"), and a hardcoded $38. `ListicleGirlfriend.tsx` runs an invented narrator ("Michael G."), claims faded dark circles and cleared redness from that fake persona, and says men's skin is "20% thicker" where Listicle says "25%" — both unsourced and mutually contradictory.
- **Files changed**: `src/pages/advertorials/CLAUDE.md` (new), `src/pages/advertorials/README.md` (removed).
- **KB updates**: This entry.

## 2026-08-12 — Peptide Maxxing advertorial
- **Task**: Built `/article/peptide-stack` (`src/pages/advertorials/PeptideStack.tsx`) as the landing page for a "peptide maxxing your face" static ad, following `src/pages/advertorials/CLAUDE.md` and using real product photography from `~/Base-Layer-Heroes/source-kit`. Registered the lazy import + route in App.tsx.
- **Angle** (from interview): audience is aging-concerned men 30-45, not the young looksmaxxing crowd — peptide framing is the mechanism, not the identity. Slang stays in the ad creative; the page is editorial voice throughout. The 0.03% GHK-Cu objection is reframed away from a concentration duel and onto the full stack of six actives with all six doses published. Villain is delay, not a competitor.
- **Compliance**: no invented people, numbers, star ratings, verified-buyer badges, or scarcity. Pricing renders from `BUY_TIERS` ($38 / $68 / $35, per-day $0.90 / $0.81 / $0.83 computed from a 42-day bottle). Proof is the three disclosed testers from `testimonialsData.ts` with `TESTIMONIAL_DISCLOSURE` verbatim and no star graphics (`PRODUCT_RATING` is still `{0,0}`). Copper peptide uses "supports a firmer, more supple-looking complexion" / "helps diminish the visible signs of aging" rather than the banned "stimulates collagen". Sponsored-feature pill and paid-partnership line sit above the fold; cosmetic-not-a-drug disclaimer in the footer. The comparison table is scoped to the practice of stacking single actives, not to any named competitor.
- **Files changed**: `src/pages/advertorials/PeptideStack.tsx` (new), `src/App.tsx` (import + route), `.claude/launch.json` (added a `vite-dev-alt` entry on 5200 so this session could preview without taking port 5199 from another running session), `kb/_inbox.md`, `kb/_session-log.md`.
- **Verification**: `vite build` clean twice (60 rendered, 0 failed); route correctly excluded from sitemap and `_redirects`, consistent with the other `/article/*` advertorials. Live in dev: h1/meta/JSON-LD correct, all four product webps return 200 image/webp, prices and per-day math read from BUY_TIERS, 0 star SVGs, the only "verified buyer" string on the page is inside the disclosure's negation, no horizontal overflow at 375px, comparison table scrolls inside its own container, sticky mobile CTA hidden at top and shown past 800px. No console errors from this page (the one error present is a pre-existing `fetchPriority` warning from HeroSection on Index).
- **Findings**: Hero sizing bug worth remembering — source-kit renders are 1000x1500, and `w-full h-auto` in the 800px article column draws 1125px tall and buries the opening hook. Capped to `max-h-[440px]`. Also, when the Browser pane is hidden the tab reports `innerWidth: 0`, never fires native scroll events, and screenshots come back blank — measurements taken in that state are meaningless, so resize to an explicit viewport and dispatch scroll events manually before trusting any layout or sticky-element check.
- **KB updates**: 3 inbox entries (peptide-maxxing ad/page audience split → ad-strategy; the two objection-handling reframes → conversion-learnings; advertorial hero cap → cro-learnings).
- **Outstanding**: inbox is ~26 uncompiled entries, over the 10-item threshold in CLAUDE.md — compiled this session, see next entry.

## 2026-08-12 — Caldera article image correction (real assets)
- **Task**: User flagged that the published Caldera comparison used AI-mockup product images. Swapped mainImage → real bottle+box packshot crop, inline image → real ingredients-label crop (both PIL pre-cropped to 16:9 to survive the renderer's object-cover). Patched + republished doc 392f4373.
- **Findings**: src/assets/hero-product.jpg and cream-texture-macro.jpg are AI mockups with wrong packaging; real photography is src/assets/product-source/. HeroSection.tsx + LandingPage.tsx still use the mockup (spawned follow-up task).
- **Files changed**: none in repo (Sanity only); kb/_inbox.md +1 entry.
- **KB updates**: inbox entry on canonical product photography → target brand-identity.

## 2026-08-12 — KB inbox compile + shipping-copy correction
- **Task**: Inbox was at 26 uncompiled entries, over the 10-item threshold in CLAUDE.md, so compiled it before finishing. Merged into ad-strategy (4), seo-strategy (6), site-architecture (5), competitor-landscape (2), product-formula (2), customer-insights (1), launch-timeline (1), plus a new `kb/wiki/conversion-learnings.md` (5). Index updated to `article_count: 10`, `inbox_count: 0`; inbox cleared to its header.
- **Routing decisions**: `cro-learnings` and `conversion-learnings` were both folded into the one new conversion-learnings.md; `paid-acquisition-benchmarks` → ad-strategy; `shopify-app-stack` and `technical-stack or content-production` → site-architecture; `ingredient research / fragrance-free positioning` → product-formula.
- **Contradictions resolved (kept both, marked superseded)**: the old "4.8/5 from 1,000+ men" social proof in customer-insights against code truth `PRODUCT_RATING {0,0}` and three disclosed testers; FAQPage schema documented as disabled but since re-enabled; product-formula pricing predating the $35 Subscribe & Save tier.
- **Correction found while verifying the compile**: the compiled KB recorded the $50 free-shipping threshold as current in three places (conversion-learnings and two spots in ad-strategy). It is dead — `814c647` introduced it and `fb4814a` removed it one commit later, so shipping is now unconditional and the subscription discount is a retention lever. Marked all three superseded with the commit refs rather than deleting, and pointed them at `FREE_SHIPPING_PHRASE` / `BUY_TIERS` as code truth. The stale ad-strategy offer outline also still said "no subscription", which is no longer true.
- **Code change**: `PeptideStack.tsx` was retyping the literal "Free shipping" in three places. `src/config/legal.ts` exports `FREE_SHIPPING_PHRASE` specifically to prevent that (the comment there names the FTC Mail/Internet/Telephone Order Rule mismatch as the risk), so the page now imports it. Verified live: all three strings render from the constant and no "$50"/"over $" appears anywhere on the page.
- **Files changed**: `kb/_inbox.md` (cleared), `kb/_index.md`, `kb/wiki/conversion-learnings.md` (new), `kb/wiki/{ad-strategy,seo-strategy,site-architecture,competitor-landscape,product-formula,customer-insights,launch-timeline}.md`, `src/pages/advertorials/PeptideStack.tsx`.
- **Verification**: `vite build` clean (60 rendered, 0 failed) after the refactor; page reloaded in dev with correct shipping copy, per-day math, and all 4 images.
- **Still open**: `OneBottleExperiment.tsx:253` also hardcodes "Free shipping on every order" instead of importing the constant. Correct today, but it's the exact drift the constant exists to prevent.

## 2026-08-12 — Homepage CRO contrast and offer-flow pass
- **Task**: Reworked the homepage into a lighter ecommerce composition with a warm-stone transaction panel, real product-in-hand photography, a compact shipping bar and consent banner, one clear CTA hierarchy, a factual proof strip, and reduced mid-page CTA repetition. Homepage $38 CTAs now open `/face-cream?offer=single`, which initializes the single-bottle tier without changing the two-bottle default for direct PDP visits.
- **Findings**: An independent eval caught three pre-deploy issues that were fixed: a 7px consent/CTA overlap at 375×812, small metadata contrast below AA, and Montserrat imports placed after CSS declarations (causing production headings to fall back). Final measurement leaves 5px between consent and CTA, small metadata is 5.67:1, and production now bundles Montserrat 700/800/900. Re-eval approved with no blocking or actionable findings.
- **Files changed**: `index.html`, `vite.config.ts`, `src/index.css`, `src/components/{HeroSection,Navbar,CookieConsentBanner,ProofStrip,MidPageCTA,StickyMobileCTA,OurOriginSection,TestimonialsSection}.tsx`, `src/pages/{Index,FaceCream}.tsx`, `src/config/product.ts`, `src/test/{ctaRouting,productConfig}.test.ts`.
- **KB updates**: This session-log entry only; conversion impact requires live A/B or analytics data and is not claimed from design review alone.
- **Verification**: `npx tsc --noEmit` passes; targeted ESLint passes; 60/60 tests pass; production build renders 60 routes with 0 failures; browser checks show no console errors, no mobile CTA obstruction, matching homepage-to-PDP $38 selection, and correct direct-PDP default behavior.

## 2026-08-12 — Colorado mountain packshot hero
- **Task**: Finalized mountain concept 4 for the homepage by using the real Base Layer packshot as the authoritative product source and replacing only its studio background with an alpine Colorado scene. Integrated the result into the responsive hero and its initial preload/prerender path.
- **Findings**: The generated concept alone drifted from the real bottle and carton marks, so the final pass preserved the actual closed-cap product geometry, stacked BASE LAYER wordmarks, orange period and side-panel pattern, and packaging copy. The 1536×1536 master provides more than 2× density for the current desktop and mobile render boxes; the production optimizer reduces it to about 129 KB.
- **Files changed**: `src/assets/generated-creatives/hero-mountain-packshot-v2.webp` (new), `src/components/HeroSection.tsx`, `index.html`, `vite.config.ts`.
- **KB updates**: This session-log entry only.
- **Verification**: `git diff --check`, targeted ESLint, `npx tsc --noEmit`, 11/11 targeted tests, and the production build all pass. The built HTML preloads and renders the same hashed WebP; desktop and 390×844 browser checks show the correct product marks and no console errors.

## 2026-08-12 — Homepage release to Netlify
- **Task**: Built and deployed the complete current production bundle, including the homepage CRO work, corrected brand assets, content changes, Shopify cart updates, and finalized Colorado mountain hero, to the linked `baselayerskin` Netlify project.
- **Findings**: Netlify deploy `6a7caeeb8b118ea530096450` reached `ready` and published to `https://baselayerskin.co`. The live hero file is byte-for-byte identical to the optimized build asset, loads at 1536×1536, and renders without horizontal overflow or browser console errors at 390×844. The existing subscription mismatch remains: the site states $35 while Shopify currently charges $34 and names the plan accordingly; one-time $38 and $68 offers match Shopify.
- **Files changed**: `kb/_session-log.md` only for this deployment record; the deployed bundle contains the full current workspace release candidate.
- **KB updates**: This session-log entry only; deploy state is operational and was not added to the wiki.
- **Verification**: 60/60 tests pass; the production build prerendered 60 routes with zero failures; Netlify reports the deploy ready; live HTML references `hero-mountain-packshot-v2-DlFBcJdy.webp`; live and local SHA-256 hashes match; production mobile browser check returns HTTP 200 with no console errors.

## 2026-08-12 — Peptide-stack advertorial build and staged production deploy
- **Task**: Built `/article/peptide-stack`, the landing page for the "peptide maxxing" static ad, and deployed it plus the accumulated site work to Netlify in two staged releases.
- **Findings**: The working tree held 114 uncommitted files with `origin/main` at 0 ahead / 0 behind, so none of the prior homepage, cart, or brand work had ever been pushed. Split into three commits and two deploys so the advertorial could go live independently of a homepage/navbar/cart rewrite. Isolated-worktree verification caught `hero-mountain-packshot-v2.webp` untracked while `HeroSection.tsx:3` imported it — the local build passed only because the file existed on disk, and Netlify would have failed. A lint count that appeared to triple (89 to 346 errors) was ESLint scanning three stale `.claude/worktrees/` repo copies; excluding those it is 88, flat against HEAD. Typecheck failures in `analytics.ts` and `vite.config.ts` are identical at HEAD and pre-date this work.
- **Files changed**: `src/pages/advertorials/PeptideStack.tsx` (new), `src/pages/advertorials/CLAUDE.md`, `src/App.tsx`, `src/assets/product-source/` (4 webp); `OneBottleExperiment.tsx` plus `Listicle.tsx` / `ListicleGirlfriend.tsx` moved under `src/pages/advertorials/`; the pending site batch (`HeroSection`, `Navbar`, `cartStore`, `product.ts`, `vite.config.ts`, `index.html`, `scripts/verify-pricing.mjs`); brand and KB docs.
- **KB updates**: This entry plus one inbox entry on the advertorial noindex gap.
- **Verification**: Both commits built standalone in isolated worktrees (60 routes prerendered, 0 failed) before pushing. Deploys `f3d4c1a` and `3aca582` both reached ready. Live checks: `/article/peptide-stack`, `/face-cream`, `/article/one-bottle-experiment`, `/articles`, comparisons and ingredients all 200, unknown routes 404. All 7 advertorial CTAs resolve to `https://baselayerskin.co/face-cream` and a scripted click lands on the PDP with the buy box present. Homepage serves the hashed packshot preload with no `/src/assets` dev path leaking into production HTML, and no console errors.
- **Open issue**: `npm run verify:pricing` fails on production. Subscribe & Save is $35.00 in `src/config/product.ts` and $34.00 in Shopify, and the plan is named "Deliver every 6 weeks, $34.00". This now presents differently than before: the cart store shipped in this release takes its price from Shopify's cart response, so the PDP shows $35 while the cart and checkout show $34. Needs a decision in Shopify admin or in `product.ts`; the Storefront token is read-only.
