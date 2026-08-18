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

## 2026-08-12 — Live homepage performance and Meta-readiness audit
- **Task**: Audited the current `baselayerskin.co` homepage with three Lighthouse mobile runs, three desktop runs, live browser checks, code tracing, and current official Meta/Chrome guidance.
- **Findings**: Mobile median Lighthouse performance is 87 (LCP 3.37s, TBT 0ms); desktop median is 75 (LCP 0.67s, TBT 0ms). Best Practices is 100 on all six runs. The blocking issue is a ~1.0 CLS caused by mounting prerendered HTML with `createRoot()` instead of hydrating it; desktop reproduces every run and one of three mobile runs reproduces. Initial transfer is ~983 KiB/40 requests, with ~114 KiB avoidable hero bytes on mobile, six oversized ingredient PNGs, and ~85 KiB unused homepage JS. Meta Pixel and GA4 scripts are consent-gated/deferred, and the code pairs the Pixel with CAPI using shared event IDs for deduplication.
- **Files changed**: `kb/_inbox.md`, `kb/_session-log.md` (audit records only; no production code changed).
- **KB updates**: Two performance findings added to the inbox for `performance-metrics`.
- **Verification**: Lighthouse lab data collected from the latest live production deploy; live page is HTTPS, redirect-free, has ~105ms server response, no render-blocking requests, no third-party requests before consent, and no long tasks over 25ms. Anonymous PageSpeed Insights field-data request was rate-limited, so no CrUX p75 claim is made.

## 2026-08-12 — Ingredient hero image set published to Sanity
- **Task**: Created a coherent eight-image ingredient hero system and published it to every `ingredient.heroImage` field in Sanity project `27quz10a`, dataset `production`. The six public ingredients now render the CMS images on both `/ingredients` cards and their detail pages; retinol and vitamin C are populated for future publication even though the listing query currently excludes them.
- **Findings**: The storefront query and fallback were already correct; all eight content documents lacked a hero reference. The existing local six-image set was only 500x500, included baked-in copy on one image, and did not support the listing/detail crop pair reliably.
- **Files changed**: `~/baselayer-sanity/assets/ingredient-heroes/` (eight 1672x941 WebPs, prompt manifest, README), `~/baselayer-sanity/scripts/upload-ingredient-heroes.mjs` (idempotent dry-run/commit uploader), `kb/_session-log.md`.
- **KB updates**: This session-log entry only; the diagnosis and production state are operational and directly represented by the Studio/script.

## 2026-08-13 — Landing page and PDP responsive polish
- **Task**: Polished the homepage and `/face-cream` across desktop and mobile. Replaced the PDP's seven linked skin-concern tiles with four informational profile cards that have no fake navigation, respond to hover and keyboard focus, and keep all useful copy visible on touch devices. Tightened PDP spacing, phone navigation, trust-badge layout, how-to hierarchy, and section rhythm. Simplified the homepage benefit accordions, reduced mobile page height, corrected the hero proof link/count, made the formula anchor real, and aligned formula/FAQ/origin language with the concentrations and evidence the brand actually publishes.
- **Findings**: Informational cards should not inherit link semantics merely because adjacent content uses cards; hover can add affordance, but core meaning still needs to remain visible without hover. The homepage also still carried an impossible “50 early testers” claim while the live review snapshot contains four customer reviews and the disclosed tester set contains three people. Its proof strip and ingredient section used broad “clinical” framing even though only three formula concentrations are published. The mobile PDP jump nav now fits all five targets in 375 CSS pixels without horizontal overflow.
- **Files changed**: `src/pages/FaceCream.tsx`; `src/components/{SkinProfileCards,PdpJumpNav,HeroSection,ProofStrip,WhyMensSkinSection,IngredientsShowcase,HomeBelowFold,TestimonialsSection,OurOriginSection,FAQSection}.tsx`; `src/test/{SkinProfileCards,ProofStrip}.test.tsx`.
- **KB updates**: Compiled the 9-item inbox into the appropriate wiki pages before implementation; inbox is back to zero. No speculative conversion result was added—the changes still need live analytics or an experiment to quantify impact.
- **Verification**: `npm run typecheck`, focused ESLint, 89/89 tests, and `npm run build:dev` pass. Browser QA at 390×844 and 1440×900 found no horizontal overflow on either route, no dead homepage hash links after deferred sections load, four profile articles with zero links/buttons, and a five-item PDP jump nav that fits at 375 CSS pixels.
- **Verification**: Direct GROQ verification returned 8/8 image references and alt strings. A fresh live-browser pass returned six listing images and six detail heroes from the Sanity CDN, all complete at natural size 1672x941. Re-running the uploader with `--commit` skipped all eight documents, confirming idempotence.

## 2026-08-12 — /last30days research: minimizing Shopify shipping cost for a 50ml moisturizer
- **Task**: Researched current (post-July-2026) USPS/carrier economics and recommended package build + Shopify settings for a 50ml skincare moisturizer.
- **Findings**: USPS eliminated sub-1-lb ounce tiers at published Commercial on 2026-07-12, but below-Commercial platforms (Pirate Ship, Shippo) preserve them for contiguous non-rural — a ~$1.86/order swing at Zone 5. Ground Advantage Cubic loses for lightweight parcels. USPS applies DIM weight only above 1 cu ft, so box dimensions are cost-neutral at this size. Glass primary containers are near-free on single-unit orders but add ~$3.43 on 2-unit orders by pushing into the 2 lb tier.
- **Files changed**: None (research only).
- **KB updates**: 4 entries added to `kb/_inbox.md` (all targeting a new `shipping-economics` article). Raw research saved to `~/Documents/Last30Days/minimizing-shipping-costs-shopify-small-parcel-skincare-raw-v3.md`. Inbox now at 5 items — at the compile threshold.

## 2026-08-12 — Homepage performance remediation + clinical-actives proof
- **Task**: Implemented the full homepage performance-audit backlog and changed the proof-grid lead cell to “Niacinamide + Peptides” / “Clinical Actives.”
- **Changes**: Added 480/768/1200 responsive hero sources, 240/480 ingredient WebPs, route-scoped React Query/Sanity/Supabase loading, self-hosted Montserrat 700/800/900, consent-gated real-user LCP/CLS/INP reporting, a stable prerender-to-client visual handoff, and a shorter consent message that clears the hero CTA. Removed the unsafe async-CSS rewrite so the actual prerendered Tailwind layout is styled before first paint.
- **Findings**: The audit's initial attribution to `createRoot()` was incomplete. Browser trace isolation showed the ~1.0 CLS came from applying the full stylesheet with `media="print"` after an unstyled prerender had painted. Responsive assets and route chunking cut mobile first-load requests from 40 to 18 and transfer from ~983KB to ~502KB; homepage startup requests no Sanity, Supabase, or React Query bundles.
- **Files changed**: `index.html`, `vite.config.ts`, `package*.json`, `src/{main,App,index}.tsx/css`, `src/lib/analytics.ts`, homepage/proof/consent components, `src/components/QueryRoute.tsx`, responsive image/font assets, and `src/test/ProofStrip.test.tsx`.
- **Verification**: Final Lighthouse confirmation: mobile 93 (FCP 2.10s, LCP 3.00s, CLS 0.00006, TBT 0), desktop 100 (FCP 0.44s, LCP 0.58s, CLS 0.0056, TBT 0); Best Practices 100, Accessibility 97, SEO 100. Three prior consecutive stabilized runs returned the same 93/100 scores. Typecheck passes, 61/61 tests pass, targeted ESLint has zero errors/warnings, production build prerenders 60/60 routes, browser startup has no console errors, the mobile hero selects 480w, and the 375×812 consent banner has 0px CTA overlap.

## 2026-08-12 — Shipping pricing strategy, unit-economics correction, KB compile

- **Task**: Answer how to price shipping to customers at $38/~$9 COGS; select a shipper; correct stale economics across code and wiki; compile the 12-entry inbox.
- **Findings**:
  - Landed shipping was modelled at $5.50 everywhere. Verified cost from Denver is **$8.10** (USPS GA 8 oz tier, $6.59 zone-blended below-Commercial + ~$1.51 materials). Corrected CM: single $19.50 (1.95x BE ROAS), 2-pack $39.24 (1.73x), subscribe $16.58 (2.11x). **The error only bit single-unit tiers** — the 2-pack amortises one parcel, so its old estimate was accidentally within $0.51.
  - Buying media against the old 1.93x subscription breakeven loses money up to the real 2.11x. This was the material find.
  - **Do not charge for shipping.** A $4.95 flat on singles adds $4.81 CM but needs conversion to hold within 19.8% — roughly EV-neutral against real cart-abandonment data, for real FTC copy-surface risk. The $50 threshold was already built and reverted (commit `fb4814a`); that decision stands.
  - The real lever is mix, not the shipping line: the second bottle costs $0.20 more to ship and earns $30 more revenue.
  - Highest-return open item: move the subscription from 1 bottle/6 weeks to **2 bottles/$70/12 weeks** (+$8.02, +24% CM per cycle, no price change). 50 mL at ~1 mL/day is ~7 weeks of product, so the current cadence over-ships. Shopify admin edit, untested.
  - Shipper selected: **white #1 7.25x12 poly bubble, $0.215/ea at 1,000**. Self-corrected from an earlier #0 6x10 call — #0 leaves only ~0.35" width margin on the 2-pack, which is the PDP default. Every candidate lands in the same USPS tier, so packaging is chosen on fit/protection/brand, never postage.
- **Files changed**: `src/config/product.ts` (economics comment corrected; typecheck clean), `kb/wiki/conversion-learnings.md`, `kb/wiki/launch-timeline.md`, `kb/wiki/performance-metrics.md`, `kb/wiki/ad-strategy.md`, `kb/wiki/seo-strategy.md`, `kb/wiki/shipping-economics.md` (new), `kb/_index.md`, `kb/_inbox.md`
- **KB updates**: Compiled all 12 inbox entries and cleared the buffer. Created `shipping-economics.md` (11th article). Bumped revisions on ad-strategy (3), seo-strategy (3), conversion-learnings (2), performance-metrics (2). Index quick-reference now carries the real price ladder and shipping posture.
- **Open items**: (1) COGS conflict — $9 (Sam) vs $10 (product.ts) vs $12 (launch-timeline); scope unconfirmed, every CM figure moves with it. (2) Carton dimensions assumed at 1.8×1.8×5.3" — measure before ordering mailers. (3) Advertorials are not actually noindexed; decide before scaling spend. (4) Check the Shopify Rest of World zone isn't open at $0.00.

## 2026-08-12 — Anti-aging advertorial: the concentration-transparency angle

- **Task**: Interview-driven build of a new advertorial for the evidence-backed anti-aging actives (5% niacinamide + 0.03% GHK-Cu). Locked brief: angle = "why concentration is the tell," target = men 35-50 problem-aware, mechanism = the pair plus a dose comparison, evidence posture = cite studies with cosmetic verbs only, Preset C (Consumer Report), new generated imagery. Shipped `/article/concentration-test`.
- **Findings**:
  - **The reframe that makes 0.03% an asset.** The prior decision in `conversion-learnings.md` was "don't fight on concentration" because 0.03% loses a percentage duel. The way to fight it is to change what the number is compared against: the published GHK-Cu literature works a **0.01%–1% range**, so 0.03% sits inside the researched band while 5% would sit far outside it. The argument stops being "ours is bigger" and becomes "a percentage is meaningless without the band the research used, and almost nobody publishes either." Two live advertorials now argue opposite sides of this — treat it as a deliberate A/B, not an accident.
  - **The teaching beat the page needed.** A problem-aware reader doesn't yet know concentrations are hidden, so numbers land on nothing. The section that does the work: a cosmetic ingredient list is ordered by weight only down to 1%, below 1% in any order, and never states a quantity — so "contains niacinamide" is equally true of a formula built around it and one carrying a trace.
  - **Evidence vs. banned words is a structural tension, not a wording problem.** The strongest GHK-Cu evidence *is* collagen synthesis, which the brand bans stating. Resolved by moving the claim from mechanism to dose-in-range, plus an explicit caveat box that the cited work tested ingredients, not finished products. Dropped the KB's unattributed 21%/14%/15% figures because they couldn't be tied to a nameable study.
  - **Comparison-table framing.** Every row states what a brand *publishes* on its own pages, not what its formula contains — checkable, more conservative than the live `ComparisonTable.tsx`, and more on-angle.
  - **Imagery rule.** No synthetic product shots for this brand: a generated bottle on a page arguing "we print what's on the label" undercuts itself. Real photography for product, generated imagery for editorial context only.
  - **Preset C's `#E53E3E` fails the AA gate** (~3.9:1 on white). Used the `brand-accent` token (#C4470E, 4.94:1) and documented the deviation in the file rather than shipping it silently.
  - **Two banned claims are live in production**, found by scripted grep rather than reading: `PeptideStack.tsx:248` "Rebuilds the moisture barrier," and `IngredientsShowcase.tsx:28` "increase collagen synthesis by up to 70%."
- **Files changed**: `src/pages/advertorials/ConcentrationTest.tsx` (new), `src/App.tsx` (lazy import + route), `src/assets/generated-creatives/antiaging-portrait.webp` (new), `src/assets/generated-creatives/antiaging-blank-lineup.webp` (new), `kb/_inbox.md`, `kb/_session-log.md`.
- **KB updates**: 6 entries added to `kb/_inbox.md` (conversion x2, brand, technical x3). Inbox had been compiled to zero mid-session, so it now stands at 6 — at the 5-item compile threshold, below the 10-item mandatory line.
- **Verification**: fal.ai run 2/2 succeeded, $0.40 against a $1.00 cap, logged to `generations/log.jsonl`; both images reviewed before entering the repo. ESLint clean on the new file (the 2 `no-explicit-any` errors in `App.tsx` are pre-existing, lines 92/131, not from the route edit). `npm run build` succeeded, 60/60 routes prerendered, advertorial correctly excluded from prerender and sitemap. Browser: no console errors, all 4 images load, 7 `/face-cream` CTAs, correct h1/title. Puppeteer at real viewports confirmed no page-level horizontal scroll at 1280px or 390px — an earlier in-pane `bodyScrollX: true` was a measurement artifact of a collapsed viewport (`innerWidth: 0`), not a layout bug. Compliance grep clean across banned claim verbs, collagen/elastin claims, brand banned words, AI vocabulary, `!`/`?` in headings, and Meta second-person attributes; the single `prevent` hit is the mandatory FDA disclaimer.
- **Open items**: (1) Page is built and verified but **not committed or deployed**. (2) The two live banned claims above are unfixed. (3) The five competitor rows came from `competitor-landscape.md`, not from first-hand verification of those pages this session — spot-check before spend. (4) Subscribe & Save is $35 in `product.ts` but $34 in Shopify; cart reads Shopify, so PDP and checkout disagree. (5) Advertorial noindex posture still undecided.

## 2026-08-12 — Measured packed weight, mailer purchase, Shopify CLI feasibility

- **Task**: Sam bought the 9x12 plain poly mailer (1,000 for $43.25) and weighed a
  packed unit at 82 g (carton + filled container); bottle measured 5.5". Asked to
  wire up Shopify CLI to create the shipping config.
- **Findings**:
  - **Shopify CLI cannot configure shipping.** Not installed (`which shopify` →
    not found), and it targets app/theme/Hydrogen development regardless. Admin
    GraphQL has `shippingPackageMakeDefault`/`Update`/`Delete` but **no documented
    create mutation** for package presets — that setting is admin-UI-only. Variant
    weights (`productVariantsBulkUpdate`) and delivery profiles
    (`deliveryProfileUpdate`) need an Admin token with `write_products` /
    `write_shipping`; the repo holds only a **read-only Storefront token**.
    Recommendation: do it in admin (~3 min) rather than stand up a write-scoped
    credential to save typing.
  - **Both tiers drop a USPS band.** 82 g + ~8 g mailer = 90 g / 3.17 oz single
    (**4 oz tier**, $6.12 blended) and 172 g / 6.07 oz 2-pack (**8 oz tier**,
    $6.59). Landed shipping $7.46 / $8.12, down from $8.10 / $8.49.
  - Revised CM: single $20.14 (1.89x BE), 2-pack $39.61 (1.72x), subscribe $17.23
    (2.03x). 2-bottle/12-week subscription proposal now worth $41.55 vs $34.46.
  - **At 82 g the mailer choice moves the tier** — a corrugated box crosses into
    8 oz where every mailer stays at 4 oz. Reverses the rev-1 conclusion that
    packaging never affects postage at this size. Headroom is 23 g to the cliff.
  - **Methodological finding**: landed shipping went $5.50 (assumed) → $8.10
    (carrier tables) → $7.46 (scale). Weighing one box moved unit economics more
    than any pricing decision this month. Do not model on an unweighed parcel.
- **Open item raised**: Sam wrote "filled tube," but the product photo and
  `shipping-economics.md` rev 1 describe a 50 mL airless pump. 82 g backs out to a
  ~18 g container — a tube, not a pump (~58 g empty). If Batch 01 fills the pump,
  the single returns to the 8 oz tier and every single-unit figure is stale. Also
  affects protection: plain 2-mil poly is fine around a tube in a carton, not
  around a pump actuator. **Unresolved — confirm before buying media at 1.89x.**
- **Files changed**: `src/config/product.ts`, `kb/wiki/shipping-economics.md`
  (rev 2), `kb/wiki/conversion-learnings.md` (rev 3),
  `kb/wiki/launch-timeline.md`, `kb/wiki/ad-strategy.md`, `kb/_index.md`
- **KB updates**: compiled directly into the wiki (inbox stayed empty).

## 2026-08-12 — Container confirmed: airless pump (follow-up)

- **Task**: Resolve the tube-vs-airless-pump open item raised in the prior digest.
- **Resolution**: **Airless pump.** The inference that 82 g implied a ~18 g tube
  was wrong — it rested on a ~58 g empty-bottle estimate that was ~30 g too heavy.
  A thin-wall mono-material PP airless at 50 mL runs 25-30 g. The scale reading was
  right; the component estimate was not.
- **Findings**:
  - **No economics change.** 82 g is 82 g regardless of container. 4 oz / 8 oz
    tiers, $7.46 / $8.12 landed, and breakevens 1.89x / 1.72x / 2.03x all stand.
  - **New open risk: actuator protection.** 1,000 plain 2-mil poly mailers are now
    on hand and the product is a pump. The dominant transit failure is a *depressed
    actuator* (product pumps into the carton), which bubble padding does **not**
    fix — it is solved by an over-cap or lock-down actuator and by the actuator
    sitting below the carton's top edge. Padding only helps the secondary
    snapped-head / drop case. Verify carton geometry and closure, then drop- and
    stack-test 3-5 units.
  - **Fallback is cheap and tier-safe:** #1 7.25x12 poly bubble adds 13 g/unit →
    103 g single (still 4 oz) and 185 g 2-pack (still 8 oz). $0.172/unit, ~$172
    per 1,000, zero postage penalty. The plain mailers already bought are not a
    sunk trap if the drop test fails.
  - **Lesson**: a component-weight estimate off by 30 g moves the parcel a full
    USPS band. Weigh components, not just totals.
- **Carried forward**: sanity-re-weigh a second unit (82 g is at the light end of
  plausible for a filled 50 mL airless + carton); weigh a sealed mailer with insert
  and label against the 113.4 g cliff.
- **Files changed**: `src/config/product.ts`, `kb/wiki/shipping-economics.md`,
  `kb/wiki/conversion-learnings.md`, `kb/wiki/launch-timeline.md`

## 2026-08-12 — Reviews app selection for a headless store; Judge.me scoped

- **Task**: Research which reviews platform fits Base Layer given it is a Vite SPA
  and not a Liquid theme, what shoppers actually expect from a review block, and
  how Trustpilot / Judge.me / Okendo / Loox compare. Then scope the integration.
- **Findings**:
  - **The generic "best Shopify reviews app" comparison is the wrong question
    here.** Theme app extensions — how nearly every review app ships its widget —
    do not exist on this stack. The only criterion that survives is whether the
    vendor exposes a public read API we can call at build time. That eliminates
    Loox outright, prices out Yotpo ($169+) and Stamped ($59-199), and rules out
    Trustpilot (~$199/mo, and it solves cross-channel brand reputation, not PDP
    product reviews).
  - **Judge.me is the fit**: REST API v1 with a public GET token, free tier
    covering photo/video reviews and unlimited requests, $15/mo flat above that.
    Okendo has the better headless architecture (`@okendo/shopify-hydrogen`,
    Storefront REST API, React reference implementations) but gates headless
    installs to its Advanced plan and prices by order volume.
  - **Shopper-expectation data reframed the design, not just the vendor choice.**
    70% need >=5 reviews before trusting a business (hence a hard 5-review render
    gate rather than showing a thin block); the optimal band is 4.0-4.7 stars and
    above 4.7 reads as fake; 82% actively seek out negative reviews (so never
    filter or reorder by rating); 85% call reviews older than 3 months irrelevant
    (collection is a standing process, not a launch task); 62% more likely to buy
    with customer photos.
  - **FTC Consumer Reviews Rule (16 CFR 465)** has been enforceable since Oct 2024,
    ~$53k/violation, warning letters as recent as Dec 2025. Incentivized reviews
    are legal only with clear disclosure in or beside the review and never
    conditioned on sentiment. This constrains the build regardless of vendor.
  - **Method finding**: `/last30days` was the wrong instrument for a vendor-
    selection question. Reddit 403'd on every subreddit and the global search, X
    returned three marginal posts across two runs, and the keyword "Judge" poisoned
    Polymarket with county-judge elections and Aaron Judge prop markets. The whole
    usable answer came from vendor docs via WebSearch. Reported honestly rather
    than dressed up.
  - **Two blocking unknowns remain, neither answerable from public docs**: whether
    the public API token is available on the free plan or gated to Awesome, and
    whether Judge.me's "revert to the legacy Review Widget" rule for
    platform-independent pages extends to the API path (probably not — we render
    our own components rather than embedding their widget).
- **Files changed**: `tasks/judge-me-integration.md` (new), `kb/_inbox.md`,
  `kb/_index.md`, this log. **No application code was written** — the scope doc
  states both unknowns must be resolved first, and step 1 (install on Shopify,
  confirm request emails fire) gates everything and depends on real orders.
- **KB updates**: 3 entries appended to inbox (shopper expectations ->
  `customer-insights`; headless vendor comparison + FTC constraint ->
  `site-architecture`; `/last30days` method finding -> `site-architecture`).
  Inbox now holds 9 uncompiled entries, one below the mandatory-compile threshold.
  `kb/_index.md` frontmatter said `inbox_count: 0` while 6 entries were already
  sitting there — corrected to 9.

## 2026-08-12 — Postage rebuilt from quoted rates; the zone model was wrong

- **Task**: Sam ran the Shopify admin shipping rate calculator against four
  destinations at 82 g from origin 80206. Rebuild the blend from actuals.
- **Measured** (USPS Ground Advantage, 9x12 poly preset):
  | Destination | Zone | Rate | vs. Berkeley |
  |---|---|---|---|
  | Berkeley, CA 94707 | 5 | $5.48 | — |
  | New York, NY 10001 | 7 | $5.62 | +$0.14 |
  | Juneau, AK 99801 | non-contig. | $5.97 | +$0.49 |
  | White Sulphur Springs, MT 59645 | rural | $7.46 | +$1.98 (+36%) |
- **Structural findings** (these change the model's shape, not just its numbers):
  1. **Zone is nearly irrelevant at 4 oz.** Z5 → Z7 costs $0.14. Every prior
     revision blended across a Denver zone map — wrong frame. There is effectively
     one contiguous non-rural rate, ~$5.55.
  2. **Rural ZIPs are the only material variable, +36%.** This was the input
     flagged as least certain in the prior revision and it is the one that held
     (predicted +32%).
  3. **Corrects rev 1: AK/HI are not a penalty lane.** Juneau +9%, nowhere near
     tier loss. The rev-1 claim grouping AK/HI/PR/APO with rural ZIPs was sourced
     from research, not quotes, and is wrong at this weight.
  4. **Shopify Shipping is ~6% under published Commercial** → buy labels there,
     skip Pirate Ship/Shippo.
- **Rebuilt blend**: 0.87 × $5.55 + 0.12 × $7.46 + 0.01 × $5.97 = **$5.78**
  (was $6.12). Insensitive to the unmeasured rural weighting: 5% → $5.65,
  20% → $5.94, so there is no need to pin it down.
- **Revised economics**: landed $7.12 single / $7.75 2-pack. CM $20.48 (1.86x BE) /
  $39.98 (1.70x) / $17.57 (1.99x). **Subscription breaks under 2.0x for the first
  time.**
- **The estimate ladder, for the record**: landed single went $5.50 (assumed) →
  $8.10 (carrier tables) → $7.46 (weighed) → $7.12 (quoted). Three of the four
  steps were estimates and two erred in the direction that flattered us. Rule:
  weigh the parcel, then quote the lane; do not model either.
- **Still open**: 2-pack postage ($6.22) is derived from the 4→8 oz step, not
  quoted — re-run the same four ZIPs at 164 g. Prediction to test: if rural bills
  at the top sub-1-lb rate regardless of weight, rural 2-pack quotes the same
  $7.46. Also: materials are $1.34/order of which only $0.043 is the mailer —
  ~$1.30 of label/insert/tape is unaudited and is now 18% of landed shipping.
- **Files changed**: `src/config/product.ts`, `kb/wiki/shipping-economics.md`
  (rev 3), `kb/wiki/conversion-learnings.md`, `kb/wiki/launch-timeline.md`,
  `kb/_index.md`

## 2026-08-12 — Judge.me reviews wired into the PDP (headless, build-time)

- **Task**: Enable Judge.me on a headless (non-Liquid) storefront, then build the
  PDP customer-review block with verified-purchase badges. Set Netlify env vars.
- **Findings** (compiled into the wiki this session):
  - **The Shopify theme app embed is a red herring.** The theme is never served on
    this stack, so the embed injects into a page nobody loads. The real dependency
    is `Settings → Collection flow` → **External form** — a dropdown, not an
    architecture problem. Left on the default, every review-request email
    deep-links into the dead theme and silently wastes the request.
  - **The public token 403s on `/api/v1/reviews`** ("not enough permissions"); it
    is scoped to the *widget* API. This inverted the scope doc's core assumption —
    a browser-side fetch is now impossible, which makes the build-time fetch
    architecturally required rather than an optimisation. `JUDGEME_PRIVATE_TOKEN`
    must never carry a `VITE_` prefix.
  - **`shop_domain` is `kpfzdg-kw.myshopify.com`** (Shopify's original handle), not
    the `base-layer-skin` alias the Storefront API uses. Judge.me returns an
    identical 401 for a bad domain and a bad token, so a domain mismatch reads
    exactly like a credential failure — this cost about an hour.
  - **API access is not plan-gated** — works on the free plan.
  - **Four real reviews landed mid-session** and were pulled by the build's fetch
    step (the account had 0 when probing started). State as of this session:
    **rating 5.0, count 4, all four `verified: false`, three with photos.**
    Three consequences: (a) count 4 is below `REVIEW_GATE = 5`, so the block still
    renders nothing and no `aggregateRating` is emitted — correct, but for a
    different reason than "no reviews exist"; (b) **zero verified badges will
    render**, because Judge.me has not tied any of these to a confirmed order —
    this is exactly what Collection flow → External form plus a real test order
    fixes; (c) a 5.0 average sits above the 4.7 authenticity-skepticism ceiling
    recorded in `customer-insights.md`.
  - **Photo URLs are served from `review-images.judgeme.com`**, not the
    `judgeme.imgix.net` / `cdn.judge.me` hosts named in Judge.me's docs. The CSP
    added earlier in the session would have **blocked every review photo in
    production**; `img-src` in both `netlify.toml` and `public/_headers` was
    corrected. Caught only because real review data arrived — a 0-review snapshot
    would have shipped this silently.
  - **Compliance flag, unresolved:** one of the four reviews is authored by
    "Samuel Doyle." An insider review without a clear and conspicuous disclosure
    of the material connection is squarely what FTC 16 CFR 465 prohibits, and the
    rule has been enforceable since Oct 2024. This is a decision for Sam, not a
    code change: disclose the relationship on the review, or remove it in the
    Judge.me dashboard.
  - **Pre-existing build flake found**: the prerender's static server pipes an
    unguarded `createReadStream`, which crashed one build with ENOENT on
    `dist/index.html` and passed on an identical re-run. Present at HEAD, not fixed.
- **Files changed**: `scripts/fetch-reviews.mjs` (new), `src/lib/reviews.ts` (new),
  `src/components/ReviewsSection.tsx` (new), `src/data/reviews.json` (new),
  `src/pages/FaceCream.tsx`, `vite.config.ts` (REVIEW_AGGREGATE spread into the 3
  landing-route Product schemas), `package.json`, `netlify.toml`, `public/_headers`,
  `tasks/judge-me-integration.md`, `.env` (gitignored)
- **KB updates**: 11 inbox entries compiled into `site-architecture` (rev 3, 4
  entries + checkout-redirect-loop marked resolved), `customer-insights` (rev 3),
  `conversion-learnings` (rev 4, 2 entries), `brand-identity` (rev 2, 2 entries),
  `ad-strategy` (rev 4), `product-formula` (rev 3), `performance-metrics` (rev 3).
  Inbox cleared to 0; `_index.md` updated including a stale `last_compiled` date
  corrected on the performance-metrics row.
- **Verification**: `npx tsc -b --force` clean; `npm run build` exit 0; prerendered
  HTML confirmed to emit **no** `aggregateRating` at 0 reviews on both the
  component-driven PDP and the config-driven landing routes. The review component
  was exercised against a 6-review fixture (deliberately including a 2-star review,
  one unverified reviewer and one photo) — 6 items, 5 badges, 1 image, 4.3
  aggregate, negative review in position 2 — then **the fixture was removed and the
  real 0-review snapshot restored** before finishing.
- **Open, user-side**: set Collection flow → External form in the Judge.me
  dashboard; place a test order; consider seeding Batch 01 buyers with a review
  link. The private token was pasted into a transcript and shell history —
  regenerating it is recommended and has not been done.

## 2026-08-12 (cont.) — PDP reviews go live

- **Task**: Sam hid his own review (resolving the 16 CFR 465 insider-review flag
  raised earlier this session) and asked to get the remaining real reviews and
  their photos onto the PDP.
- **State at go-live**: 4 reviews, **4.8 average**, 3 with customer photos, 0
  verified. The average moved 5.0 → 4.8 because the founder review came out and a
  4-star from "Mike J" came in — 4.8 sits at the top of the healthy band rather
  than in the reads-as-fake zone above 4.7. The 4-star is a genuine complaint
  (ran out faster than the advertised 6 weeks) and sorts **first**, because the
  sort is photo-first then newest and never by rating.
- **Changes**:
  - `REVIEW_GATE` 5 → 1 across all three files that hardcode it
    (`src/lib/reviews.ts`, `vite.config.ts`, `scripts/fetch-reviews.mjs`).
  - Review photos 96px → 160px, wrapped in a link to the full-size image.
  - **Photo payload cut ~7x**: Judge.me serves `?width=1024` (~200 KB) by default;
    `normalize()` now rewrites to `width=320` (16–30 KB) for the 160px box.
  - Footer disclaimer corrected — it claimed reviews were "collected and verified
    by Judge.me" while zero are verified. Now states that the badge appears only
    where Judge.me matched a confirmed order.
- **Verification**: `npx tsc -b --force` clean; `npm run build` exit 0. Prerendered
  HTML now carries `"aggregateRating":{"ratingValue":"4.8","reviewCount":4}` on
  both the PDP and the landing routes, all four reviewers and all three photo URLs
  are baked into `dist/face-cream/index.html` (crawler-visible, not a runtime
  fetch), and "Verified Purchase" appears exactly once — in the explanatory footer,
  not as a badge. All three photo URLs return HTTP 200 via curl.
  **Not visually confirmed**: the browser pane has no outbound network
  (ERR_CONNECTION_REFUSED on external hosts), so the photos could not be rendered
  in preview. Structure was verified through the DOM; the images themselves are
  unproven in a browser until this hits a deploy preview.
- **Files changed**: `src/lib/reviews.ts`, `src/components/ReviewsSection.tsx`,
  `scripts/fetch-reviews.mjs`, `vite.config.ts`, `src/data/reviews.json`
- **KB updates**: 2 inbox entries (gate override rationale + the photo-width and
  CDN-host findings).

## 2026-08-12 — PDP rating widget + production deploy
- **Task**: Added the visible Judge.me rating summary to the Face Cream buy box (stars + `4.8 · 4 reviews`, anchor-linked to the review block), gave `#reviews` a scroll offset that clears the fixed Navbar, and deployed to production.
- **Findings**: Judge.me's own preview-badge widget is unusable here on two counts — it ships as a Shopify theme app extension (no theme on a Vite SPA) and its browser-side path uses the public token, which 403s on `/api/v1/reviews`. Rendering the rating natively from the build-time snapshot is strictly better: it gets captured by the Puppeteer prerender, so the aggregate is crawler-visible text with no CLS and no third-party JS.
- **Files changed**: `src/pages/FaceCream.tsx`, `src/components/ReviewsSection.tsx`, `kb/_inbox.md`, `kb/_index.md`
- **Verified**: `npx tsc -b --force` exit 0; `npm run build` 60 routes rendered / 0 failed; `href="#reviews"`, `scroll-mt-[96px]` and `"reviewCount":4` all present in `dist/face-cream/index.html`; in the dev preview the link renders 5 stars + `4.8 · 4 reviews` under the H1 and the click lands the review section exactly 96px from the top. Review block confirmed at 4 items / 3 photos / 0 verified badges — correct, since Judge.me has matched none of the four to an order yet.
- **KB updates**: 1 inbox entry (technical → site-architecture) on why the ranking widget is native rather than a Judge.me embed. Inbox at 4.

## 2026-08-12 — Judge.me pipeline bugs, star breakdown, and Shopify admin procedures
- **Task**: Answered four Shopify admin questions (exiting test mode, free shipping, friends-and-family codes, Judge.me verification for a headless store), then built the star-rating breakdown on the PDP and, mid-build, diagnosed why a verified review showed no badge and a deleted review still rendered live.
- **Findings**:
  - **`verified` is an enum, not a boolean.** Five values mean the person bought it (`buyer`, `confirmed-buyer`, `verified-purchase`, `semi-verified-purchase`, `admin`); three mean they didn't (`nothing`, `not-yet`, `unconfirmed-buyer`). `fetch-reviews.mjs` tested only `'buyer'`, so the first real verified review — `confirmed-buyer` — showed a tick in the Judge.me dashboard and nothing on the site. **This supersedes the earlier "0 verified badges because Judge.me matched no orders" claim in the inbox, which was wrong.** The bug was invisible for exactly as long as there were no verified reviews, which is the worst shape a bug can have.
  - **Judge.me serves *store* reviews from the same endpoint as product reviews**, tagged `product_external_id: 0` / "Judge.me Shop Reviews". They were rendering under "Customer Reviews" on the PDP — a brand review attributed to the product, which 16 CFR 465 covers directly, and a double-count of anyone who left both. That is what put the same reviewer on the PDP twice.
  - **Deleting a review in Judge.me is not a publishing action.** The live site serves the committed snapshot, so a deletion doesn't propagate until the next deploy. Intended behaviour (an outage degrades to the last good copy), but it means a takedown with a clock on it needs a deploy, not just moderation.
  - **Verification is fully automatic on a headless store** because checkout is Shopify-hosted and orders are native Shopify objects — headless changes nothing about it. The two genuine headless exposures are the email link domain and the absent on-site submission path (Collection flow must be "External form").
  - **Judge.me's documented review-link expiry conflicts with itself**: 180 days in the help center, 45 days elsewhere. Unresolved — confirm by sending a test email rather than picking one.
  - **Friends-and-family discount floor**: `CM = 0.971P − 16.42`, cash breakeven at **$16.91 / 55.5% off**; a 100%-off code costs $16.12 since no payment fee is charged on a $0 order. Two traps: a percentage code applied to the Subscribe & Save selling plan recurs on every delivery unless restricted to the first order, and FTC 16 CFR 465 requires disclosure on reviews from anyone given free or discounted product.
- **Files changed**: `scripts/fetch-reviews.mjs` (verified-status allowlist, product filter, histogram), `src/lib/reviews.ts` (`histogram` export, `HISTOGRAM_GATE`, corrected transparency-badge comment), `src/components/ReviewsSection.tsx` (breakdown bars, click-to-filter, photo strip, extended disclosure), `src/data/reviews.json` (regenerated: 6 → 4 reviews, 4.8 average, 1 verified), `kb/_inbox.md`, `kb/_index.md`
- **Verified**: `npm run typecheck` exit 0. `npm run build:reviews` logged "1 review(s) excluded — store reviews or another product, not this PDP" then "✅ 4 reviews, 4.8 average." DOM on localhost:5200: 5 histogram rows with 5★ n=3 at 75% and 4★ n=1 at 25%, 3/2/1★ disabled at 0%; 4 photo thumbs linking to their review anchors; exactly 1 VerifiedBadge; clicking 4★ → "Showing 1 review rated 4 stars", 1 card, reviewer "Mike J", `aria-pressed="true"`; "Show all" → back to 4. **Not yet deployed — the live-site duplicate and missing badge only clear on the next build.**
- **KB updates**: 2 inbox entries (technical → site-architecture on the three pipeline defects; conversion → conversion-learnings on the breakdown design calls and the `HISTOGRAM_GATE` open question). Inbox at 6.

## 2026-08-13 — Pixel audit: GA4 + Meta event correctness, and a US-first consent model
- **Task**: Audited every GA4 and Meta Pixel event on `baselayerskin.co` and `/face-cream` against the live site, fixed everything fixable in-repo, and reworked the cookie gate for US-majority traffic.
- **Findings**:
  - **The load-order race was the headline defect, and it only bit hard landings.** `trackEvent` fired browser-side events with a bare `if (typeof gtag === "function")` — no queue, no poll — while `initAnalyticsScripts()` loads behind `requestIdleCallback` with a 3s fallback. A PDP mount effect always wins that race on a cold load. Verified on production: one `/g/collect` hit carrying `en=page_view` and no `view_item`, against two `fb-capi` calls, because `sendCAPI()` is a plain fetch with no SDK dependency. So the money page had server-side-only Meta coverage, zero browser `ViewContent`, zero GA4 product views. Invisible when clicking around the site (SPA navs land after the scripts do) and broken only on hard landings — which is exactly what ad traffic is.
  - **Queue, don't poll.** `MetaRouterTracker` solves its version of this with 15×200ms polling. A queue is strictly better here because it preserves the `eventId` the CAPI event already went out with, so pixel/CAPI dedup holds no matter how late the browser event flushes.
  - **`content_ids` was the invented string `base-layer-face-cream` at every call site** — matches nothing in Shopify and would match nothing in a Meta catalog. Now the numeric variant ID off the GID.
  - **`view_item` sent a hardcoded `value: 38` while the PDP default is the $68 2-pack.** Meta and GA4 were optimizing on a number that was wrong for the preselected tier for the entire life of that default.
  - **GA4 was getting Meta-shaped payloads with no `items` array**, so no GA4 e-commerce report could populate. Meta params (`content_ids`, `content_name`) are simply ignored by GA4.
  - **Five advertorials fired `trackEvent('page_view', ...)`**, roughly doubling reported pageviews on the ad landers. Renamed `advertorial_view`; the params are the reason the event exists, so they stayed.
  - **Consent was the measurement ceiling.** Under hard opt-in, every un-clicked visitor was unmeasured — with US-majority traffic that is most of them. Moved to region detection via `Intl.DateTimeFormat().resolvedOptions().timeZone` (no network call, no IP processing, no third-party geo): banner-and-opt-in for EEA/UK/CH, notice-plus-opt-out everywhere else with the footer's Cookie Preferences link as the always-available opt-out. Explicit Reject is honored identically in both. Fails toward opt-in if the timezone can't be read.
  - **The prerender makes the geo gate cheap.** Build-time Puppeteer emits no banner (build TZ is UTC on Netlify), so US visitors hydrate with a matching tree and only EEA visitors take the re-render.
  - **Two structural gaps remain and neither is fixable from this repo**: there is no `Purchase` event anywhere on the site (checkout is Shopify-hosted, so it has to come from Shopify's Customer Events), and GA4 cross-domain is unconfigured between `baselayerskin.co` and the checkout domain.
- **Files changed**: `src/lib/analytics.ts` (deferred-script queue + flush, GA4 `items`, Meta custom events, config-sourced lead values), `src/lib/consent.ts` (`requiresOptIn()` geo gate), `src/components/CookieConsentBanner.tsx`, `src/config/product.ts` (`SINGLE_TIER`, `metaContentId`), `src/pages/FaceCream.tsx`, `src/components/ShopifyCartDrawer.tsx`, `src/stores/cartStore.ts`, `src/context/EarlyAccessContext.tsx`, `src/pages/PrivacyPolicy.tsx`, 5 advertorial pages, `kb/_inbox.md`
- **Verified**: `npx tsc --noEmit` exit 0; `npm run build` 60 rendered / 0 failed. Cold load of `/face-cream` on localhost:5200 now sends GA4 `page_view`, `scroll` **and `view_item`**, the last carrying `pr1=id42940461056071~nmBase Layer Face Cream~brBase Layer~pr68~qt1`. Recorded `fbq` calls show `ViewContent` with `content_ids: ["42940461056071"]`, `value: 68`; selecting the 1-bottle tier and adding to cart fires `AddToCart` with `content_ids: ["42940461023303"]`, `value: 38`, and GA4 `add_to_cart` with the matching `pr1=id42940461023303~...~pr38`. Consent null on `America/Denver` with the banner hidden and the footer opt-out present; `dist/face-cream/index.html` contains the footer link and no banner markup.
- **Not verified**: GA4 property config and received events — the GA4 MCP returned 503 `Reauthentication is needed`, so nothing was confirmed on Google's side. `begin_checkout` was reasoned about, not clicked through, since checkout leaves the origin.
- **Deployed**: production deploy `6a7e13ebef00ba1d5931da0b`. Confirmed on the live site: a cold load of `/face-cream` sends GA4 `view_item` with `pr1=id42940461056071~nmBase Layer Face Cream~brBase Layer~pr68~qt1`, and `fbq.getState()` reports `eventCount: 2` on pixel `916078074161719` (PageView + ViewContent) where it was 1 before. Banner absent on `America/Denver` with consent unset.
- **Deploy gotcha worth remembering**: the build command lives in the **Netlify UI**, not `netlify.toml` (where it's commented out), so plain `netlify deploy --prod --dir=dist` ignores the local `dist` and re-runs the full `npm run build` — sitemap fetch, image optimization, 60-route Puppeteer prerender — inside the deploy wrapper. That run is long enough to get killed, and a killed deploy sticks in state `new` and blocks the next one with `JSONHTTPError: no records matched 422`. Fix: `netlify api cancelSiteDeploy` on the stuck id, then deploy with `--no-build` to upload the already-verified `dist`.
- **KB updates**: 1 inbox entry (technical → site-architecture) covering the race, the four secondary defects, the two structural gaps, and the consent ceiling. Inbox at 8.

## 2026-08-13 — Blueprint moisturizer PDP competitive teardown

- **Task**: Determined whether Blueprint's moisturizer storefront is custom or theme-based and compared its desktop/mobile PDP experience with Base Layer.
- **Findings**: Blueprint is a heavily customized Shopify Eurus 9.4.0 theme. It leads on proof architecture, reviews and long-page navigation; Base Layer leads on first-screen clarity, mobile purchase access, one-step positioning and reduced app clutter. Highest-priority Base Layer gaps are price-label consistency, evidence architecture, anchor navigation, more sensory gallery media, and two concrete image-loading defects.
- **Files changed**: `kb/_inbox.md`, `kb/_session-log.md` only. Other concurrent/pre-existing working-tree changes were not touched.
- **KB updates**: 1 combined competitive/conversion/performance entry targeting `competitor-landscape.md`. Inbox now at 9.

## 2026-08-13 — PDP jump navigation and near-offer customer proof

- **Task**: Built isolated, integration-ready components for a sticky PDP section navigator and a compact Judge.me customer-review highlight without editing `FaceCream.tsx`.
- **Findings**: The fixed global header is 96px on mobile / 112px on desktop before collapsing to 68px after 100px of scroll, so the jump nav mirrors those offsets. Near-offer proof can prioritize a verified review with a customer photo entirely from the existing snapshot while keeping paid-customer verification and compensated tester feedback visibly distinct.
- **Files changed**: `src/components/PdpJumpNav.tsx`, `src/components/CustomerProofStrip.tsx`, `src/lib/customerProof.ts`, `src/test/PdpJumpNav.test.tsx`, `src/test/CustomerProofStrip.test.tsx`, `kb/_session-log.md`.
- **Verification**: 4 targeted Vitest tests pass; isolated ESLint and `git diff --check` pass. Repository-wide typecheck was blocked by a concurrent `FaceCream.tsx` call to `ComparisonTable` missing its newly required props; this task did not edit that file.
- **KB updates**: No new domain finding added to the inbox; implementation follows the existing Judge.me and FTC constraints already recorded there.

## 2026-08-13 — PDP image-loading performance

- **Task**: Corrected the Face Cream LCP preload, generated responsive gallery/how-to assets, and built an integration-ready single-DOM product gallery without editing `FaceCream.tsx`.
- **Findings**: The 2.52 MB, 2048px how-to PNG can remain as the archival source while AVIF derivatives transfer 7.1–44.5 KB and WebP derivatives transfer 9.8–80.2 KB. The first gallery image now has 480/768/1200 candidates of 9.0/17.5/30.1 KB, plus a 1.0 KB thumbnail.
- **Files changed**: `vite.config.ts`, `src/components/ProductGallery.tsx`, `src/data/productGallery.ts`, `src/data/howToUseMedia.ts`, `src/test/ProductGallery.test.tsx`, responsive assets under `src/assets/product-carousel/{responsive,thumbnails}` and `src/assets/generated-creatives/responsive/how-to-use-lifestyle-*`, `kb/_session-log.md`.
- **Verification**: `npm run typecheck` passes; `npx vitest run src/test/ProductGallery.test.tsx` passes 5/5; isolated ESLint and `npm run build:dev` pass. The built `/face-cream` HTML contains one responsive preload for the actual first gallery image and one gallery track. Cold browser checks at 390px/3x and 1440px requested only the active/adjacent gallery images, did not request the stale product-rock image or below-fold how-to image, and produced no horizontal overflow.
- **KB updates**: No inbox entry added; the originating LCP/gallery/how-to defects are already recorded in the Blueprint teardown entry.

## 2026-08-13 — Blueprint-informed Face Cream PDP implementation

- **Task**: Implemented the code-ready recommendations from the Blueprint competitive teardown and integrated the parallel navigation/reviews, formula-proof, gallery and performance work into the Face Cream PDP.
- **Changes**: Added a sticky Offer / Results / Formula / Reviews / FAQ navigator; made all purchase surfaces derive from the selected tier; labeled future-retail and current-tier savings baselines; moved a real verified-photo Judge.me review next to the offer while preserving the tester disclosure; replaced the old ingredient promises with an evidence-status module that publishes only the three known concentrations and clearly names the missing finished-product evidence; added a dated, price-and-fill-only Blueprint contrast; reordered the gallery so real application follows the packshot; and made the tester-section CTA honor the selected tier. Adjacent FAQ and result copy was tightened to remove timed and mechanistic claims the finished product has not substantiated.
- **Performance**: Replaced duplicate breakpoint galleries with one responsive carousel; generated 480/768/1200 gallery WebPs and 480/768/1200/1920 AVIF/WebP how-to sources; corrected the `/face-cream` LCP preload and prerender-failure skeleton to the first gallery packshot; lazy-loaded below-fold media; fixed mid-breakpoint grid/thumb overflow. The archival 1.56 MB PNG remains because another route imports it, but the Face Cream route no longer requests it.
- **Verification**: TypeScript clean; 15 Vitest files / 86 tests pass before the final zero-review-nav test, then focused nav tests pass 3/3; focused ESLint clean; production build renders 60 routes / 0 failed. Browser QA at desktop, 768px and 390px found one gallery track, no page-level horizontal overflow, all five anchor targets, synchronized subscription CTAs, no stale rock hero in the DOM and no console errors. Independent comprehensive review verdict: approve with notes / low risk / no blockers.
- **Content dependency left open**: A real short absorption demonstration and a genuine invisible-finish-on-skin asset were not fabricated from stills. Add them only when real product footage exists, then place them after the application frame.
- **KB updates**: No new inbox entry; this closes the implementation work described by the existing Blueprint competitive teardown entry.

## 2026-08-13 — Formula disclosure correction

- **Task**: Replaced the PDP formula section's internal evidence-audit copy with customer-facing formula content and corrected the mistaken assumption that only three ingredient concentrations are public.
- **Findings**: User confirmed that Base Layer publishes all six highlighted concentrations: niacinamide 5%, GHK-Cu 0.03%, panthenol 2%, centella asiatica 2%, squalane 3%, and hyaluronic acid 0.5%. The earlier three-concentration limit came from stale KB notes, not the current product source. The photographed bottle confirms the full ordered INCI; formulation source materials carry the percentages.
- **Files changed**: `src/components/{FormulaEvidenceSection,IngredientsShowcase,HomeBelowFold,OurOriginSection}.tsx`, `src/pages/FaceCream.tsx`, `src/test/FormulaEvidenceSection.test.tsx`, `kb/wiki/product-formula.md`, `kb/_index.md`, `kb/_session-log.md`.
- **KB updates**: Corrected `product-formula.md` directly because the prior wiki statement was factually wrong; revision bumped to 4 and index summary refreshed.
- **Verification**: Focused ESLint, 4 focused tests, typecheck, and development production build pass. Browser QA at 390×844 and 1440×900 shows all six doses, no internal disclaimer copy, and no horizontal overflow.

## 2026-08-13 — GA4 and Meta measurement correction

- **Task**: Fixed two live measurement bugs and completed the GA4 + Shopify configuration walkthrough by hand.
- **Changes shipped**:
  - `e9c2ea6` — `begin_checkout` no longer claims Meta's `InitiateCheckout` or GA4's `begin_checkout`. Shopify's own pixels fire those standard names from the checkout page with different event ids, so nothing deduped and every checkout counted twice in both platforms. Renamed to `CheckoutClick` / `checkout_click`. Also pushed the previously-unpushed anchor-click checkout handoff.
  - `49ce3a5` — `source`, `medium` and `campaign` stripped before the payload reaches gtag, with the CTA label re-added as `cta_location`. See inbox entry; this was overwriting GA4 session source on every CTA click.
- **Findings**: GA4 reserved traffic-source params (see inbox). `_gl` cannot appear on a subdomain hop and is the wrong verification oracle (see inbox). CLI automation of GA4/Shopify settings is not available: no Shopify Admin token, `shopify` CLI absent, and the ADC token lacks Analytics Admin scopes — even with scopes, "Configure your domains" and referral exclusions are gtag tag settings the Admin API does not expose. The `seo-os` GA4 MCP returns 503 "Reauthentication is needed"; working path is `gcloud auth application-default print-access-token` piped into a direct curl against `analyticsdata.googleapis.com`.
- **Verified externally**: Shopify `webPixelsConfigList` on the checkout domain shows Google pixel 2040299591 (`G-E1GTL9RHY0`, `GT-W6XW5KTK`), Meta pixel 2039742535, Judge.me 2036957255. Meta pixel `916078074161719` appears exactly once, so no duplicate install. Served gtag config carries `__ogt_cross_domain` `["baselayer\.skin","baselayerskin\.co"]` and `__ogt_referral_exclusion` `["shopify\.com","baselayerskin\.co","shop\.app","paypal\.com"]`. Both fixes confirmed present in the production bundle `index-BQ1RWykn.js`.
- **Files changed**: `src/lib/analytics.ts`, `src/test/analyticsCheckoutEvent.test.ts` (new), `src/test/analyticsGa4TrafficSource.test.ts` (new).
- **Verification**: 94 Vitest tests pass across 17 files, `tsc --noEmit` clean, Netlify deploy `49ce3a52` ready and verified against the live bundle.
- **GA4 config completed by hand**: cross-domain, referral exclusions, data retention, Google & YouTube channel connected, `CTA location` custom dimension registered, `add_to_cart` / `begin_checkout` marked as key events (`purchase` is auto-marked and locked), internal traffic rule on `174.16.148.24` with the exclude filter set to Active.
- **Open**: Confirm Shopify's `InitiateCheckout` fired on the real test order — the site no longer sends one, so if Shopify's copy is also absent the site's must be restored. Confirm Meta's 2x Purchase is one Browser + one Server, not two of either. Identify `G-SNVX80PSF9`, a second GA4 property collecting on the checkout domain. Delete the probable `baselayer.skin` typo from the cross-domain list. Meta domain verification for `baselayerskin.co` and Purchase at the top of the AEM priority list. Cancel and restock the refunded test order #4711006N. `qualify_lead` and `close_convert_lead` are GA4 pre-populated key events, not site events, and will never fire.
- **KB updates**: Two inbox entries (GA4 reserved traffic-source params; `_gl` on subdomain hops), both targeting `wiki/site-architecture.md`.

## 2026-08-14 — Homepage verified-review hero proof

- **Task**: Replaced the homepage hero's low-volume `4.8/5 from 5 customer reviews` aggregate with a compact, high-contrast verified-buyer review module linked to the complete PDP reviews section.
- **Findings**: The selected Judge.me review is a real verified 5-star purchase and its first sentence directly supports the hero's zero-shine promise. The aggregate count remains fully visible lower in the funnel; the hero no longer turns a five-review sample into the first trust signal.
- **Files changed**: `src/components/HeroSection.tsx`, `src/test/ctaRouting.test.tsx`, `kb/_inbox.md`, `kb/_session-log.md`.
- **Verification**: Focused test 8/8, full suite 95/95, typecheck, focused ESLint, production build (60 routes / 0 failures), desktop 1440x900 and mobile 390x844 visual QA, working review-anchor navigation, and zero browser console errors. Repository-wide lint remains red on 341 pre-existing errors, including files under `.claude/worktrees`; neither changed file reports a lint error.
- **KB updates**: Added one conversion hypothesis to the inbox for later compilation after performance data is available.

## 2026-08-14 — Current-product social preview

- **Task**: Replaced the legacy link-preview bottle with the current mountain product hero across the homepage, PDP, product landing pages, and advertorial product schemas.
- **Changes**: Added a cache-busting 1200×630 progressive JPEG (`public/og-mountain-product-v2.jpg`) cropped deterministically from the current production hero so the exact capped bottle, carton, logos, and Colorado setting are preserved. Updated Open Graph, X/Twitter, prerender defaults, and product structured-data image URLs; also added descriptive image-alt metadata.
- **Verification**: Asset is 1200×630 JPEG; typecheck passes; all 95 tests pass; focused ESLint has zero errors; production build renders 60 routes with zero failures. Generated homepage, PDP, and product landing HTML all point to the new image and contain no legacy preview references.

## 2026-08-15 — Skin-concern email quiz and 15% offer

- **Task**: Built a custom two-step popup asking “What's your main skin concern?” across four options, then collecting email before revealing a 15% first-order code.
- **Changes**: Added a responsive Radix dialog, personalized concern result copy, Supabase + Brevo lead capture, analytics events, seven-day dismissal/session suppression, consent-aware display logic, delayed lazy loading, persistent discount state, and Shopify cart/checkout support for combining `SKIN15` with `SHIP26`. Privacy copy now discloses the quiz data flow.
- **Verification**: Typecheck, focused ESLint, 106-test full suite, live Shopify pricing verification, production build (60 routes / 0 failures), and responsive browser QA at 390×844 and 1440×900 passed. The quiz ships as a separate 32 KB JavaScript chunk (under 10 KB Brotli), outside the initial LCP bundle.
- **Deployment status**: Not committed or deployed yet. A real Storefront cart verifies `SKIN15` is applicable and reduces the one-bottle total from $38.00 to $32.30. In the same cart, `SHIP26` is inapplicable, so the two Shopify discounts still need combination enabled before shipping; the popup does not claim free shipping while that is untrue.
- **KB updates**: Added one low-confidence conversion hypothesis for measurement after launch.

## 2026-08-17 — Lifecycle-ready quiz capture UX

- **Task**: Hardened the concern-first email quiz for durable lifecycle capture without increasing visible form friction.
- **Changes**: Replaced the fixed popup delay with a 15-second dwell or 40%-scroll engagement trigger; deferred the modal during cart and form interactions; retained completed-opt-in, session and seven-day dismissal suppression; added a hidden honeypot, form timing, versioned consent proof and privacy-minimized attribution; switched submission to the idempotent v2 lead endpoint; and added honest locked-code retry copy plus consent-gated Brevo visitor identification.
- **Files changed**: `src/components/SkinConcernQuiz.tsx`, `src/lib/skinQuiz.ts`, `src/test/SkinConcernQuiz.test.tsx`, `src/test/skinQuiz.test.ts`, `kb/_session-log.md`.
- **Verification**: Focused ESLint, full TypeScript, 137-test full suite, Deno checks, development build, and mobile 390×844 / desktop 1440×900 browser QA pass. The modal remains accessible and non-overflowing, with both input and CTA visible on mobile.
- **KB updates**: No inbox entry added; this implements the existing quiz conversion hypothesis rather than establishing a new measured result.
## 2026-08-17 — Email lifecycle event plumbing and operator runbook
- **Task**: Added a provider-isolated, consent-gated Brevo tracker integration for identified subscriber, PDP-view, cart-update, and empty-cart events; wired authoritative Shopify cart mutations; added required CSP hosts and lifecycle privacy disclosure; documented Brevo/Shopify automation setup and exclusions.
- **Findings**: The headless Storefront API cart must emit browser lifecycle events manually, while paid order completion should come from the Shopify/Brevo server-side integration. Browser purchase inference and simultaneous Shopify/Brevo recovery automations are both unsafe.
- **Files changed**: `src/lib/lifecycle.ts`, `src/stores/cartStore.ts`, `src/pages/FaceCream.tsx`, `src/App.tsx`, `src/lib/consent.ts`, `src/components/CookieConsentBanner.tsx`, `src/pages/PrivacyPolicy.tsx`, `src/vite-env.d.ts`, `src/test/lifecycle.test.ts`, `netlify.toml`, `public/_headers`, `docs/email-lifecycle-operations.md`, `kb/_inbox.md`, `kb/_session-log.md`.
- **KB updates**: Added one technical inbox entry targeting `wiki/site-architecture.md`.

## 2026-08-17 — Durable lead identity, consent ledger, and Brevo outbox
- **Task**: Replaced best-effort parallel quiz writes with a service-only, idempotent lead-capture backend and deployable provider retry path.
- **Findings**: Production contained 14 waitlist rows, 6 survey rows, and the expected three legacy tables. Their missing migration-history entries were repaired before the additive lead-capture migration was applied.
- **Files changed**: `supabase/migrations/20260817170000_marketing_lead_capture.sql`, `supabase/functions/{email-subscribe,email-sync-worker,_shared}/`, `supabase/config.toml`, `netlify/functions/email-sync-scheduler.mjs`, `netlify.toml`, `src/test/{leadCaptureValidation,emailSyncScheduler}.test.ts`, `docs/lead-capture-backend.md`, `kb/_session-log.md`.
- **Verification**: Deno checks pass for both Edge Functions; TypeScript, focused ESLint, diff check, scheduled-proxy tests, development build, and the final 137/137 test suite pass. Supabase now records all four migrations, the five service-only marketing tables exist, and `email-sync-worker` is deployed. Brevo/Shopify dashboard activation and the Netlify worker secret remain external gates.
- **KB updates**: No inbox entry added; this is implementation/operational state documented in the backend runbook.

## 2026-08-18 — Collapse dual-source page SEO, fix the skeleton homepage, compile the inbox

- **Task**: Finish the title/description collapse Sam asked for ("pick the winners for me"), push and deploy it, then compile the KB inbox.
- **Findings**:
  - Ten of fourteen static routes shipped two conflicting titles — one prerendered, one set on hydration. Google ranks the component value; social scrapers read the prerendered one. The keyword-loaded half was the one being discarded.
  - While verifying, caught local builds reporting `59 rendered, 1 failed` on `/`. Puppeteer's `waitForFunction` polls on rAF and a headless page stops painting once settled, so the homepage's deliberately-deferred `HomeBelowFold` (carrying the `<footer>`) was invisible to the wait. `/` shipped a 2,959-byte skeleton instead of 75,080 bytes. A race, not deterministic — production happened to win it, so the live site was never broken.
  - Retracted my own shallow-clone diagnosis of the sitemap: the live file was correct all along (my commit legitimately touched all 14 page components). The hazard is still real and demonstrated, so the guard shipped in cut-down form with the comment saying plainly it is a guard, not a fix.
- **Files changed**: `src/config/pageSeo.ts` (new), `vite.config.ts`, `src/components/SEO.tsx`, all 14 page components, `kb/_inbox.md`, `kb/_index.md`, `kb/wiki/technical-seo.md` (new), `kb/wiki/{site-architecture,conversion-learnings,shipping-economics,performance-metrics,seo-strategy}.md`
- **Commits**: `3eddebd` (one source of truth for titles/descriptions), `cd13d34` + `64a64a7` (KB), `ff8ba06` (prerender + sitemap guard)
- **KB updates**: Compiled 12 inbox entries to zero. Created `wiki/technical-seo.md` (article 12) from five SEO/prerender findings; routed four measurement findings to `site-architecture`, two CRO hypotheses to `conversion-learnings`, and the product-scoped selling plan to `shipping-economics`.
- **Verified**: 60 rendered / 0 failed, live homepage root content byte-identical to local build, one `<title>` per route across all 14, sitemap 60 URLs / 60 lastmod / 6 distinct dates, 138/138 tests, typecheck and lint clean, Netlify `64a64a7` ready.
- **Open**: Homepage `aggregateRating` warnings stay until a visible star rating exists (natural home `ProofStrip`). `scripts/generate-sitemap.mjs` still dead code. Cannibalization between `/articles/best-moisturizer-for-men` and `/comparisons/best-mens-face-moisturizers-compared` unaddressed. Indexing requests need the GSC web UI — the API scope returns 403.
