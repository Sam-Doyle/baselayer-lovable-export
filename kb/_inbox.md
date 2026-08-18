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
