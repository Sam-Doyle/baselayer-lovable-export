# KB Inbox — Capture Buffer

New findings go here. When 5+ items accumulate, compile them into wiki articles.

## Entry Format

```markdown
---
date: YYYY-MM-DD
category: product | brand | competitive | technical | marketing | conversion
source: where you learned it
confidence: high | medium | low
target_article: wiki/article-name.md (if known)
---
Finding text here.
```

**Last compiled:** 2026-08-18 — 12 entries cleared. Five SEO/prerender findings
seeded the new `wiki/technical-seo.md`; four measurement findings (GA4 reserved
`source`, `_gl` on subdomains, Meta catalog content IDs, Brevo lifecycle split)
went to `site-architecture`; two CRO hypotheses to `conversion-learnings`; the
product-scoped selling plan to `shipping-economics`.

<!-- New entries below this line -->

---
date: 2026-08-18
category: technical
source: GSC URL Inspection API across 6 URLs on sc-domain:baselayerskin.co
confidence: high
target_article: wiki/technical-seo.md
---
Index-state snapshot, and it revises the earlier "all three landing pages are
unindexed" claim.

| URL | State | Last crawl |
|---|---|---|
| `/` | Submitted and indexed | 2026-08-17 20:09Z |
| `/face-cream` | Submitted and indexed | 2026-08-11 14:31Z |
| `/all-in-one-skincare-for-men` | **Submitted and indexed** | 2026-08-17 20:09Z |
| `/comparisons/best-mens-face-moisturizers-compared` | Submitted and indexed | 2026-08-11 14:31Z |
| `/matte-moisturizer-for-men` | Crawled, currently not indexed | **2026-05-21** |
| `/non-greasy-moisturizer-for-men` | Discovered, currently not indexed | never crawled |

`/all-in-one-skincare-for-men` got indexed on the 2026-08-17 crawl, so the
three landing pages are no longer a single cohort and should stop being
described as one. `/matte-moisturizer-for-men` was last crawled three months
ago, on 2026-05-21, and `/non-greasy-moisturizer-for-men` has never been
fetched at all despite sitting in the sitemap since March.

Supporting the authority-not-content diagnosis: `referringUrls` for all three
landing pages contains exactly one entry, the homepage. By contrast
`/comparisons/best-mens-face-moisturizers-compared` carries an internal link
from `/ingredients/squalane` and is indexed. One internal link is close to no
internal link.

Also surfaced and not previously tracked: the homepage Merchant listings block
reports `Missing field "validFrom"` and `Missing field "returnMethod"`,
separate from the known `aggregateRating`/`review` pair. The rich-results
verdict is still PASS on all of them; these are warnings, not errors.

Caveat on reading any of this: every crawl above predates the 2026-08-18
deploys (`3eddebd` at 00:48Z, `ff8ba06`/`64a64a7` at 01:10Z), so the reported
schema and title state is what Google saw before the fixes, not after.

---
date: 2026-08-18
category: technical
source: GSC Merchant listings + Product snippets emails, Google merchant listing structured data docs re-read same day, served JSON-LD
confidence: high
target_article: wiki/technical-seo.md
---
Four non-critical structured data warnings on baselayerskin.co, and only one of
them was a bug.

`Missing field "validFrom" (in "offers")` looked already-fixed because
`priceSpecification.validFrom` was present and had been since 2026-08-10.
Google documents `validFrom` in **two** places, directly on the Offer node and
on a nested PriceSpecification, and Search Console asks for them
independently. The tell is in GSC's own path notation: it printed the full
dotted path for the returnMethod issue (`offers.hasMerchantReturnPolicy`) and
plain `offers` for this one. Read the path literally. Fixed 2026-08-18 in
`d19b80e`, both emitted from one `OFFER_VALID_FROM` constant. All six Product
offers spread `merchantOfferFields`, so it was a single edit site.

`Missing field "returnMethod"` is permanent and correct to ignore. Google's
enumeration is still ReturnByMail / ReturnInStore / ReturnAtKiosk with no
no-return option, confirmed by re-reading the docs on 2026-08-18. A 30-day
keep-the-bottle guarantee has no honest value in that vocabulary. Picking
ReturnByMail would be a false statement about the policy, and the earlier
KeepProduct attempt was rejected outright as an invalid enum, which is a worse
outcome than a warning. Now documented in the code so nobody re-attempts it.

`Missing field "aggregateRating"` and `Missing field "review"` on Product
snippets are a product decision, not a code gap. They fire on the homepage
Product block. Google requires a rating in `aggregateRating` markup to be
visible to the user on the same page, and the homepage deliberately does not
show one: the 2026-08-14 finding was that an above-fold `4.8/5 from 5 customer
reviews` made the small sample size more salient than the score and read as
negative social proof, which is why it was replaced with a single verified
review quote. Clearing these two warnings means reintroducing a pattern
already judged to hurt conversion. Recommendation is to leave them until the
review count is high enough that the aggregate helps rather than hurts, then
add the visible rating and the markup together.

Standing rule: a non-critical structured data warning is not automatically
worth clearing. Check what clearing it costs on the page first. Google's own
wording is that non-critical issues do not prevent the page or feature from
appearing, and the Product snippets verdict stayed PASS throughout.
