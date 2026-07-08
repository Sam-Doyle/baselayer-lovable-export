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
