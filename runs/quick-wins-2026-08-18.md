# Quick Wins — baselayerskin.co
**Date:** 2026-08-18
**Source:** GSC `sc-domain:baselayerskin.co`, 2026-05-20 → 2026-08-18, dimensions `query` + `page`
**Prior run:** none in `runs/` — this is the baseline

---

## There are no quick wins. Here is the proof.

The skill's filter is position 4–20 with ≥100 impressions. That returns **zero rows**.
Relaxing to ≥5 impressions returns **zero rows**. Dropping the impression floor to 1 still
returns **zero rows**, because nothing on this site ranks in positions 4–20 for anything.

| Filter | Rows |
|---|---|
| Position 4–20, ≥100 impressions (default) | 0 |
| Position 4–20, ≥5 impressions (relaxed) | 0 |
| Position 4–20, any impressions | 0 |
| Position ≤30, any impressions | 7 (14 impressions total) |
| Position ≤40, any impressions | 11 |

**Best position anywhere in 90 days: 26**, on the query "moisturizer for men", with 1
impression. That is page 3. Everything else is page 4 and deeper.

Totals for the window: 141 query+page rows, **366 impressions, 0 clicks**. The single click
the property recorded (`/` at position 2) does not appear in the query breakdown, which means
GSC anonymized the query — that is the signature of a branded or near-branded search.

I am not going to build a "estimated clicks at position 3" table off this. Every row would be
`impressions × 0.11` and every row would be fiction, because getting from position 65 to
position 3 is not a title-tag fix, it is a different project. The rule for this skill is that
every row cites real GSC numbers and no estimate is presented as data, and an estimate built
on a 62-position jump is not data.

---

## What the data does say

Both ranking pages are chasing the identical query set, and they are colliding.

| Page | Impressions | Queries | Best position | Avg position |
|---|---|---|---|---|
| `/articles/best-moisturizer-for-men` | 185 | 73 | 26 | 65.2 |
| `/comparisons/best-mens-face-moisturizers-compared` | 181 | 67 | 28 | 64.3 |
| `/face-cream` | 2 | 1 | 52 | 52 |
| `/` | 2 | (anonymized) | 2 | 2 |

**21 distinct queries have both URLs ranking simultaneously, carrying 125 of the 366
impressions.** A third of everything this site surfaces for is two of its own pages splitting
the same result.

The ten biggest collisions, all real GSC numbers, all zero clicks:

| Query | Impr | `/articles/…` pos | `/comparisons/…` pos |
|---|---|---|---|
| best moisturizer for men | 31 | 56.8 | 69.3 |
| best men's moisturiser | 14 | 60.0 | 30.0 |
| best skin moisturizer for men | 13 | 61.1 | 72.0 |
| best men's moisturizer | 10 | 50.0 | 72.7 |
| best male moisturizer | 7 | 66.8 | 66.7 |
| best mens moisturizer | 6 | 56.0 | 60.0 |
| best moisturiser for men | 6 | 59.8 | 56.5 |
| best face moisturiser for men | 4 | 58.0 | 81.0 |
| best moisturizer for dry skin face men | 4 | 81.0 | 30.0 |
| best moisturizer for guys | 4 | 66.0 | 78.0 |

There is a pattern underneath it. The article page wins the "best moisturizer for men"
phrasings; the comparison page wins the "best **face** moisturizer for men" phrasings and
holds every one of the seven sub-position-30 results. `best face moisturizer for men`
(28 impressions, the second-largest single query) is comparison-only. `best moisturizer for
men` (25 impressions on the article) is article-dominant.

So the split is real but neither page is enforcing it, and on 21 queries they hand Google a
choice it resolves badly for both.

**Branded queries:** none appeared in the query dimension. The one branded-looking click on
`/` was anonymized by GSC and is excluded, as the skill requires.

**DEINDEX candidates:** none. No thank-you, opt-in or utility page is earning impressions.

**Noise floor:** 96 of the 141 rows have a single impression. Positions on those rows are one
observation each and should not be read as rankings. Only 8 queries in the entire window broke
5 impressions.

**One oddity worth naming:** four rows are full conversational prompts, e.g. *"i'm male and
whether i'm in my 20s or 60s, i usually want things to be direct, functional… how does Kiehl's
Ultra Facial Cream compare"* — 5 impressions at position 91.8. Those are AI-Overview-style
queries, and the comparison page is what Google reached for. Small, but it says the comparison
page is the asset with the clearer job.

---

## The #1 fix, shipped

The highest-value change available is not a title tag. It is picking a winner between two
pages that are splitting 366 impressions and producing zero clicks.

**Recommendation: the comparison page wins the head terms, the article becomes a different
piece.** Reasoning from the data, not preference: the comparison page holds all seven
sub-position-30 results, owns the second-biggest single query outright, is already indexed
with two internal referring URLs, and is the page Google surfaces for conversational
comparison prompts. The article page has one referring URL and no query it wins decisively
except `best moisturizer for men` at position 57, which is not a position worth defending.

### 1. Comparison page — title tag

Current title targets the plural comparison framing. Make it carry the head term the page
already half-owns, with the qualifier that separates it from the article.

```
Best Face Moisturizers for Men, Compared (2026) | 8 Brands, Published Percentages
```

Under 60 characters of meaningful content before the pipe, leads with the exact match on the
28-impression query, and "published percentages" is the differentiator no competitor in that
SERP can copy.

### 2. Comparison page — H1

```
We Compared 8 Men's Face Moisturizers. Only 3 Print Their Concentrations.
```

The current H1 and title say the same thing twice. This one restates the promise as a finding,
which is what a comparison page is for.

### 3. Article page — retarget away from the collision

Change the article's title and H1 to stop competing on "best … for men" and own the decision
question instead:

```
Title: How to Choose a Face Moisturizer if You're a Man (and What Actually Matters)
H1:    Most Men Pick a Moisturizer by Smell. Here's What to Pick It By.
```

### 4. Comparison page — ~100 words to add

Paste this above the comparison table. It targets `best face moisturizer for men` and
`best men's moisturiser` directly, in the site's voice, and says something the other eight
results on that page don't:

> Most "best face moisturizer for men" lists rank by brand recognition and price. This one
> ranks by what's actually in the bottle. Every brand here was checked for one thing: does it
> publish the concentration of its active ingredients, or does it just list them? An
> ingredient list is a ranking, not a recipe. Niacinamide at 5% does something for oil and
> tone; niacinamide at 0.1%, listed second-to-last, does nothing but let the label say
> niacinamide. Three of the eight publish their numbers. Five don't. That's the whole
> comparison, and it's the only one that survives contact with a dermatologist.

### 5. Internal links

Both pages have one or two internal referring URLs. That is the actual ceiling here. Link the
comparison page from `/face-cream`, `/`, and the four `/skin-concerns/*` pages that already
get traffic, with anchor text using the head term.

---

## Honest expected value

Do all five and the realistic outcome is the collisions collapse and each page consolidates to
a single position somewhere in the 40s or 50s. That is still page 4. It produces zero clicks.

The value is that it stops splitting the signal so the authority work has something to
compound onto. At 366 impressions and 0 clicks across 90 days, search is not a channel for
this site yet, and no title tag changes that. The tech-debt audit run the same day found the
site technically clean, and the constraint it identified was internal links and external
authority. This run agrees from a different direction.

Re-run this in 30 days. The number to watch is not position, it is whether the 21 cannibalized
queries drop to zero.
