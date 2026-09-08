# Mobile PDP conversion changes — verification

Verification status: PASSED for the approved release scope (video deferred by user)
Confidence: high for tested purchase behavior; conversion lift is unmeasured.
Depth: standard. Method: adversarial-verifier claim decomposition, direct source tracing, browser inspection, and automated checks.

## Scope and ground truth

- Changes based on origin/main at d81809e in an isolated worktree. Other worktrees and their uncommitted changes were untouched.
- Ground truth: product.ts variant/selling-plan mapping, live Shopify cart responses, Judge.me snapshot, rendered DOM and screenshots in the Codex in-app browser.
- No prices, selling plans, cart-store implementation, checkout integration, or analytics implementation were changed.

## Claims and checks

1. **A shorter mobile hero must still show the entire product.** The compact carousel uses object-contain on mobile, object-cover and a square viewport on desktop. Pagination remains operable; the unnecessary native horizontal scrollbar was removed. Production-build inspection at 390×844 placed the main CTA at y=748–800, with all three purchase rows above it.
2. **Narrow screens must not clip purchase choices or recurring terms.** At 320×568, rows measured 64/64/80px; subscription copy and the CTA wrapped within the viewport. A sticky purchase button remained available above the fold when the inline button was below it. No document horizontal overflow was observed. Desktop 1440×1000 retained the two-column layout and square 528px gallery.
3. **Every CTA must buy the selected offer.** Tests cover single, two-pack, subscription, unknown query fallback, switching in both directions, and same-route offer changes. All buttons use the same selected tier. Native radio inputs supply standard keyboard selection semantics.
4. **Subscription state must not leak into a one-time purchase.** Browser-selected two-pack returned one Shopify cart line for $68, without subscription terms. Browser-selected subscription returned $35 with an every-six-weeks renewal disclosure. Both temporary items were removed; the preview cart returned to empty. Automated tests check exact variant/selling-plan payloads, including a null plan on one-time purchases.
5. **Failed or repeated adds must not fabricate conversion events.** Existing cart guard retained; regression tests verify disabled purchase buttons while loading and no add_to_cart event after an unsuccessful response. Production checkout/payment submission was not attempted.
6. **Sticky visibility must not remove all purchase access.** Tests cover no/partial/full intersection. The bar hides only at full inline-button intersection, and its tab index follows visibility. A negative top root margin accounts for the compact sticky headers.
7. **Proof must remain authentic and accessible.** The near-buy-box component accepts only verified, nonempty customer reviews in compact mode. The text is a verbatim prefix with an ellipsis when shortened and a direct link to the complete review. All published reviews, including the critical review, remain unchanged below. The snapshot was refreshed through the existing importer to eight published product reviews.
8. **The campaign price must survive navigation.** All shared /lp $38 CTAs now use offer=single. Routing tests verify every instance. The direct-PDP default remains unchanged.

## Results

- 242 tests passed across 43 files.
- TypeScript project check passed.
- ESLint passed for all changed source/test files.
- git diff --check passed.
- Production build passed: 66 prerendered pages, zero failures.
- Inspected the actual dist/face-cream/index.html via the preview server's /face-cream/ route. Vite preview's slashless URL falls back to homepage HTML; production Netlify already explicitly rewrites /face-cream to the PDP document. The correctly served document showed the intended mobile layout after React handoff.

## Outstanding and limits

- No application/finish video was found in the repository or Base Layer asset directory. The user explicitly deferred video on September 8 and approved deploying the other changes. No fabricated demonstration, placeholder video, or unverified third-party footage was added.
- Production deployment authorized September 8 after the checks above; deployment outcome will be verified separately.
- No completed purchase, payment transaction, live-pixel dashboard audit, physical iOS/Android test, or conversion-lift experiment was performed. Existing analytics wiring was preserved and add-to-cart event conditions are covered by tests.
