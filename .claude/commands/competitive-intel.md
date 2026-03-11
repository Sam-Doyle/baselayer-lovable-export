# Competitive Intelligence

**Competitive monitoring and analysis for Base Layer Skin. Tracks competitor pricing, product launches, ad creative, SEO positioning, content strategy, and review sentiment. Generates market positioning maps, opportunity gaps, and actionable "steal this" recommendations.**

## References — Auto-Load
Read and internalize before executing:
- `brand/references/product/catalog.md`
- `brand/references/competitors/profiles.md`
- `brand/references/competitors/positioning-map.md`
- `brand/references/benchmarks/dtc-skincare.md`

---

## Inputs

The user can provide:

```
COMPETITORS:     Comma-separated brand names or URLs (defaults provided below)
REPORT TYPE:     full-scan (default) | pricing | ads | seo | content | reviews | pre-campaign
DEPTH:           quick (30 min) | standard (1 hr) | deep (2+ hr)
FOCUS AREA:      Any specific question (e.g., "what are Tiege Hanley's top ads right now?")
```

If the user gives a loose request ("check the competition"), default to:
- Competitors: Default list below
- Report type: full-scan
- Depth: standard
- Focus area: None (cover all areas)

## When NOT to Use
- For analyzing our own ad performance (use `/campaign-auditor`)
- For SEO-only competitor analysis (use `/seo-monitor` sub-skill)
- For real-time competitive response (this is strategic, not tactical)
- For pricing our own products (use `/unit-economics-tracker`)
- For researching keywords for our own content strategy (use `/keyword-cluster`)

### Default Competitor Set

| Brand | URL | Why They Matter |
|-------|-----|-----------------|
| Tiege Hanley | tiege.com | Direct competitor: men's skincare, subscription, similar ICP |
| Lumin | luminskin.com | Meta-heavy DTC men's skincare, strong ad game |
| Brickell | brickellmensproducts.com | Premium men's skincare, natural positioning |
| Jack Black | getjackblack.com | Established men's skincare, retail + DTC |
| Bulldog | bulldogskincare.com | Mass-market men's skincare, simplicity positioning |
| Harry's | harrys.com | Men's grooming DTC, strong brand, skincare line expansion |

### Optional Additions

| Brand | URL | When to Include |
|-------|-----|-----------------|
| Geologie | geologie.com | When analyzing personalization/quiz funnels |
| Hims | forhims.com | When analyzing subscription/telehealth angle |
| Disco | letsdisco.co | When analyzing clean/ingredient-forward positioning |
| Aesop | aesop.com | When analyzing premium positioning and brand aesthetic |
| Kiehl's | kiehls.com | When analyzing ingredient credibility and heritage |

---

## Research Pipeline

```
1. SCOPE       -> Confirm competitors, report type, focus area
2. PRICING     -> Current pricing, bundles, subscriptions, promos
3. PRODUCT     -> Product lines, launches, formulations, claims
4. ADS         -> Meta Ad Library scan, creative analysis, copy patterns
5. SEO         -> Ranking overlap, content strategy, domain authority
6. CONTENT     -> Blog, social, email (if visible), content calendar patterns
7. REVIEWS     -> Sentiment analysis from review sites, social mentions
8. SYNTHESIZE  -> Market positioning, gaps, threats, opportunities
9. OUTPUT      -> Structured report with actionable recommendations
```

---

## Phase 1: Pricing Intelligence

Use WebSearch and WebFetch to gather current pricing.

```markdown
## Pricing Landscape

### Product Pricing Comparison
| Brand | Hero Product | Price | Size | Price/mL | Subscription? | Sub Discount |
|-------|-------------|-------|------|----------|---------------|--------------|
| **Base Layer** | Performance Daily Face Cream | $38 | 50mL | $0.76 | TBD | TBD |
| Tiege Hanley | Level 1 System | $XX | XXmL | $X.XX | Yes | XX% |
| Lumin | Dark Circle Defense | $XX | XXmL | $X.XX | Yes | XX% |
| Brickell | Daily Essential Face Moisturizer | $XX | XXmL | $X.XX | Yes | XX% |
| Jack Black | Double-Duty Face Moisturizer | $XX | XXmL | $X.XX | No | — |
| Bulldog | Original Moisturiser | $XX | XXmL | $X.XX | No | — |
| Harry's | Face Lotion | $XX | XXmL | $X.XX | Yes | XX% |

### Pricing Strategy Analysis
- **Price positioning:** Where Base Layer sits (value / mid / premium / ultra-premium)
- **Bundle economics:** Competitors offering multi-product bundles — effective per-product discount?
- **Subscription incentives:** What discount % is standard? Free shipping thresholds?
- **Promotional patterns:** Seasonal sales, first-order discounts, referral programs?

### Base Layer Advantage/Disadvantage
- [Price advantage vs. multi-product systems (Tiege: $XX for system vs. $38 for all-in-one)]
- [Price vulnerability vs. mass-market (Bulldog: $XX, Harry's: $XX)]
- [Value proposition: "replaces 3 products" — effective price comparison]
```

---

## Phase 2: Product Intelligence

```markdown
## Product Landscape

### Product Line Comparison
| Brand | Total SKUs | Categories | Hero Product | Key Differentiator |
|-------|-----------|------------|--------------|-------------------|
| **Base Layer** | 1 | Moisturizer | Performance Daily Face Cream | All-in-one, 15-second absorption |
| [competitor] | XX | [list] | [product] | [differentiator] |

### Ingredient Comparison (Moisturizer Category)
| Ingredient | Base Layer | Tiege | Lumin | Brickell | Jack Black | Bulldog | Harry's |
|------------|-----------|-------|-------|----------|------------|---------|---------|
| Niacinamide | Y | ? | ? | ? | ? | ? | ? |
| Copper Peptides | Y | ? | ? | ? | ? | ? | ? |
| Hyaluronic Acid | Y | ? | ? | ? | ? | ? | ? |
| Squalane | Y | ? | ? | ? | ? | ? | ? |
| Centella Asiatica | Y | ? | ? | ? | ? | ? | ? |
| Panthenol | Y | ? | ? | ? | ? | ? | ? |
| SPF | N | ? | ? | ? | ? | ? | ? |
| Fragrance | N (free) | ? | ? | ? | ? | ? | ? |

### Claims Comparison
| Claim | Base Layer | Competitors Making Similar Claim |
|-------|-----------|----------------------------------|
| Absorbs in 15 seconds | Y | [who else?] |
| Replaces entire routine | Y | [who else?] |
| Matte/zero shine | Y | [who else?] |
| Fragrance-free | Y | [who else?] |
| Clean formula | Y | [who else?] |

### Recent Product Launches
| Brand | Product | Launch Date | Price | Positioning | Threat Level |
|-------|---------|-------------|-------|-------------|--------------|
| [brand] | [product] | [date] | $XX | [positioning] | HIGH/MED/LOW |
```

---

## Phase 3: Meta Ad Creative Analysis

Search the Meta Ad Library (https://www.facebook.com/ads/library/) for each competitor.

Use WebSearch with queries:
- "[brand name] Facebook ads library"
- "[brand name] Instagram ads [current year]"
- "[brand name] ad creative examples"
- "site:facebook.com/ads/library [brand name]"

```markdown
## Meta Ad Intelligence

### Active Ad Volume
| Brand | Estimated Active Ads | Primary Format | Dominant Angle |
|-------|---------------------|----------------|----------------|
| [brand] | XX | Image/Video/Carousel | [angle] |

### Creative Pattern Analysis
| Brand | Visual Style | Copy Tone | Hook Pattern | CTA Style |
|-------|-------------|-----------|-------------|-----------|
| Tiege | [describe] | [describe] | [pattern] | [style] |
| Lumin | [describe] | [describe] | [pattern] | [style] |
| Brickell | [describe] | [describe] | [pattern] | [style] |
| Jack Black | [describe] | [describe] | [pattern] | [style] |
| Bulldog | [describe] | [describe] | [pattern] | [style] |
| Harry's | [describe] | [describe] | [pattern] | [style] |

### Top Performing Ad Patterns (based on longevity and format)
Ads that have been running longest are likely performing well:

1. **[Brand] — [Ad Description]**
   - Format: [image/video/carousel]
   - Running since: [approximate date]
   - Visual: [description]
   - Hook: "[first line of copy]"
   - Angle: [benefit/pain/proof/urgency]
   - What makes it work: [analysis]

2. **[Brand] — [Ad Description]**
   [...]

3. **[Brand] — [Ad Description]**
   [...]

### Ad Copy Patterns
| Pattern | Used By | Frequency | Example |
|---------|---------|-----------|---------|
| Question hook | [brands] | Common/Rare | "[example]" |
| Testimonial-led | [brands] | Common/Rare | "[example]" |
| Ingredient callout | [brands] | Common/Rare | "[example]" |
| Price-led | [brands] | Common/Rare | "[example]" |
| Before/after | [brands] | Common/Rare | "[example]" |
| UGC style | [brands] | Common/Rare | "[example]" |

### Gaps in Competitor Ad Strategy
- [Gap 1: e.g., "Nobody is using dark/dramatic visuals — all clean/bright/clinical"]
- [Gap 2: e.g., "No one leads with simplicity/anti-routine messaging"]
- [Gap 3: e.g., "No altitude/origin story differentiation in the space"]
- [Gap 4: e.g., "Few are using honest/anti-marketing tone"]
```

---

## Phase 4: SEO & Organic Analysis

Use WebSearch to research:
- "[brand name] site:semrush.com OR site:ahrefs.com" for domain data
- "[brand name] blog" for content strategy
- Shared keyword targets

```markdown
## SEO Landscape

### Domain Comparison
| Brand | Est. Domain Authority | Est. Organic Traffic | Top Content Type |
|-------|----------------------|---------------------|------------------|
| [brand] | XX | XX,XXX/mo | [blog/product/landing] |

### Keyword Overlap
| Keyword | Monthly Volume | Base Layer Rank | [Competitor 1] | [Competitor 2] | [Competitor 3] |
|---------|---------------|-----------------|-----------------|-----------------|-----------------|
| men's face cream | X,XXX | XX | XX | XX | XX |
| men's moisturizer | X,XXX | XX | XX | XX | XX |
| best face cream for men | X,XXX | XX | XX | XX | XX |
| men's skincare routine | X,XXX | XX | XX | XX | XX |
| [additional keywords] | ... | ... | ... | ... | ... |

### Content Strategy Analysis
| Brand | Blog Frequency | Content Topics | Content Quality | SEO Focus |
|-------|---------------|----------------|-----------------|-----------|
| [brand] | X/month | [topics] | [assessment] | [on-page/links/content] |

### SEO Opportunities for Base Layer
- [Keywords where competitors rank but Base Layer doesn't yet]
- [Content gaps: topics competitors haven't covered well]
- [Long-tail opportunities specific to Base Layer's positioning]
```

---

## Phase 5: Content & Social Analysis

```markdown
## Content & Social Landscape

### Social Presence
| Brand | Instagram Followers | Posting Frequency | Content Mix | Engagement Rate |
|-------|--------------------|--------------------|-------------|-----------------|
| [brand] | XX,XXX | X/week | [mix: product/lifestyle/UGC/education] | X.X% |

### Content Themes by Brand
| Brand | Primary Theme | Secondary Theme | Unique Angle |
|-------|-------------- |-----------------|-------------|
| [brand] | [theme] | [theme] | [what's different] |

### Email Strategy (visible signals)
| Brand | Signup Incentive | Pop-up Timing | Welcome Offer | Estimated Frequency |
|-------|-----------------|--------------|---------------|---------------------|
| [brand] | [discount/content/access] | [immediate/delayed/exit] | [offer] | [X/week] |
```

---

## Phase 6: Review & Sentiment Analysis

Use WebSearch to find reviews on:
- Brand websites
- Amazon (if sold there)
- Reddit (r/SkincareAddiction, r/malegrooming, r/skincare)
- YouTube reviews

```markdown
## Review & Sentiment Analysis

### Rating Overview
| Brand | Primary Review Source | Avg Rating | Review Count | Sentiment |
|-------|---------------------|------------|-------------|-----------|
| [brand] | [source] | X.X/5 | X,XXX | Positive/Mixed/Negative |

### Common Praise (across competitors)
| Theme | Frequency | Brands | Implication for Base Layer |
|-------|-----------|--------|---------------------------|
| [e.g., "Easy routine"] | High | [brands] | [validate or differentiate] |
| [e.g., "Good ingredients"] | Medium | [brands] | [validate or differentiate] |

### Common Complaints (across competitors)
| Complaint | Frequency | Brands | Base Layer Advantage? |
|-----------|-----------|--------|-----------------------|
| Greasy/oily feel | High | [brands] | YES — 15-second absorption, matte finish |
| Too many products | High | [brands] | YES — single product |
| Expensive for what it is | Medium | [brands] | MAYBE — $38 for all-in-one vs $XX for system |
| Fragrance irritation | Medium | [brands] | YES — fragrance-free |
| Didn't see results | Low | [brands] | MITIGATE — set timeline expectations |

### Reddit/Forum Sentiment
| Thread/Source | Sentiment | Key Quote | Actionable Insight |
|---------------|-----------|-----------|-------------------|
| [thread] | [pos/neg/neutral] | "[quote]" | [insight] |
```

---

## Synthesis: Market Positioning

```markdown
## Market Positioning Map

### Positioning Matrix

                    PREMIUM
                       |
                       |
        Brickell       |       Aesop/Kiehl's
                       |
    COMPLEX ———————————+——————————— SIMPLE
                       |
        Tiege/Lumin    |       BASE LAYER
                       |       Harry's/Bulldog
                    VALUE

### Competitive Advantage Analysis

**Base Layer Advantages:**
| Advantage | vs. Whom | Strength | Defensibility |
|-----------|----------|----------|---------------|
| Single product simplicity | Tiege, Lumin, Brickell | HIGH | MEDIUM (easy to copy claim, hard to copy formulation) |
| 15-second absorption | All | HIGH | HIGH (formulation-dependent) |
| Altitude/origin story | All | MEDIUM | HIGH (unique, can't be copied) |
| No-BS brand voice | All | MEDIUM | MEDIUM (tone can be imitated) |
| Fragrance-free | Most | MEDIUM | LOW (easy to copy) |
| Founding batch/community | All | MEDIUM | MEDIUM (time-limited advantage) |

**Base Layer Vulnerabilities:**
| Vulnerability | vs. Whom | Severity | Mitigation |
|---------------|----------|----------|------------|
| Single SKU (no upsell) | All multi-product brands | HIGH | Plan product line expansion or subscription |
| No retail presence | Jack Black, Bulldog, Harry's | MEDIUM | DTC-first is a strategy, not a weakness — for now |
| New brand (no reviews at scale) | All established brands | HIGH | Accelerate review collection, leverage early tester program |
| No SPF | Jack Black, some others | LOW | Position as "pair with your SPF" or plan SPF product |
```

---

## Opportunity Gaps

```markdown
## Opportunity Gaps

### Gaps to Exploit
| Gap | Description | Action | Priority |
|-----|-------------|--------|----------|
| [gap] | [What competitors are missing or doing poorly] | [How Base Layer can capitalize] | HIGH/MED/LOW |

### Threat Alerts
| Threat | Source | Severity | Response |
|--------|--------|----------|----------|
| [threat] | [competitor] | HIGH/MED/LOW | [recommended action] |
```

---

## "Steal This" Section

Competitor tactics worth adapting for Base Layer (not copying — adapting to brand voice):

```markdown
## Steal This — Tactics to Adapt

### 1. [Tactic Name]
**Seen at:** [Competitor]
**What they do:** [Description]
**Why it works:** [Analysis]
**Base Layer adaptation:** [How to implement in Base Layer's voice/style]
**Effort:** Low/Medium/High
**Expected impact:** [Quantified if possible]

### 2. [Tactic Name]
**Seen at:** [Competitor]
**What they do:** [Description]
**Why it works:** [Analysis]
**Base Layer adaptation:** [Implementation plan]
**Effort:** Low/Medium/High
**Expected impact:** [Estimate]

### 3. [Tactic Name]
[...]

### 4. [Tactic Name]
[...]

### 5. [Tactic Name]
[...]
```

Rules for "Steal This":
- Never copy verbatim — adapt to Base Layer's voice and positioning
- Must be implementable within 2 weeks
- Must not conflict with brand guidelines (no emojis, no flowery language, no soft aesthetics)
- Prioritize tactics that leverage Base Layer's unique strengths (simplicity, altitude, formulation)

---

## Example

### Input
```
/competitive-intel
Competitors: Tiege Hanley, Lumin, Brickell
Focus: pricing, ads, reviews
Previous: reports/competitive/2026-02-competitive.md
```

### Output (abbreviated)
```markdown
# Competitive Intelligence Report — March 2026

## Pricing Comparison
| Brand | Moisturizer | Full Routine | Subscription Discount | Free Ship Threshold |
|-------|------------|-------------|----------------------|-------------------|
| Base Layer | $38 (founding) | $38 (single SKU) | — | $38+ |
| Tiege Hanley | $25/mo | $25-50/mo (tiered) | Subscription-only model | Included |
| Lumin | $16 | $40 (3-product kit) | 15% on subscribe | $50 |
| Brickell | $45 | $89 (full routine) | 10% on subscribe | $50 |

## Ad Creative Trends
### What's Working in Market
1. **Before/after UGC** — Tiege and Lumin both running 20+ active UGC ads showing transformation
2. **"Routine simplicity" hooks** — "Stop using 10 products" messaging across all 3 competitors
3. **Price anchoring** — Lumin leading with "$1/day" framing

### Creative Gaps (Our Opportunity)
1. **Ingredient transparency** — No competitor is leading with specific ingredient education in ads
2. **SPF integration** — Nobody is positioning moisturizer+SPF as a 2-in-1 solution in Meta ads
3. **Anti-marketing tone** — All competitors use typical DTC hype. Our "sharp friend" voice is differentiated.

## Customer Sentiment (from Reddit, reviews)
### Top Competitor Complaints (Our Opportunity)
1. "Tiege subscription is hard to cancel" → Position Base Layer as no-subscription-required
2. "Lumin products feel cheap for the price" → Emphasize ingredient quality and clinical grades
3. "Brickell is too expensive for what you get" → Our $38 single-product value prop

## "Steal This" Tactics
1. **Tiege's quiz funnel** — Interactive skin type quiz leading to personalized recommendation. Adapt: build a quiz that always leads to our one product but educates along the way.
2. **Lumin's "$1/day" framing** — Reframe our $38 as "$1.27/day for your entire skincare routine"
3. **Brickell's ingredient comparison pages** — SEO content comparing specific ingredients. Create vs-pages: "Niacinamide vs Retinol for Men"
```

---

## Edge Cases
- If a competitor website blocks web fetching (403, captcha): note "[WEBSITE BLOCKED]" for that competitor's pricing section and rely on cached search results, review sites, and Meta Ad Library data instead.
- If Meta Ad Library returns no results for a competitor: try alternative search terms (parent company name, product names). If still no results, note "Not running Meta ads" — this is useful competitive intelligence in itself.
- If user provides fewer than 3 competitors: run analysis but recommend expanding to at least 5 for meaningful pattern detection. Suggest additional competitors from the default set.
- If previous report exists: include a "Changes Since Last Report" section highlighting price changes, new ad creative themes, and any competitor launches or discontinuations.
- If a competitor has launched a product directly competing with Performance Daily Face Cream (moisturizer with SPF for men): escalate to a dedicated "Direct Threat Analysis" section with feature-by-feature comparison and recommended counter-positioning.

---

## Output & Storage

### Report Output

Save completed reports to:
```
reports/competitive/YYYY-MM-DD-competitive-intel.md
```

Create the directory if it does not exist.

### Historical Tracking

Maintain `reports/competitive/tracking.json` for longitudinal analysis:

```json
{
  "last_scan": "YYYY-MM-DD",
  "competitors": {
    "tiege-hanley": {
      "scans": [
        {
          "date": "YYYY-MM-DD",
          "hero_price": 0,
          "product_count": 0,
          "est_instagram_followers": 0,
          "active_meta_ads": 0,
          "notable_changes": [""]
        }
      ]
    }
  },
  "price_changes": [],
  "product_launches": [],
  "threat_log": []
}
```

### Change Alerts

When comparing to previous scans, flag:
- Price changes (any direction)
- New product launches
- Significant ad creative shifts
- New marketing channels or partnerships
- Review sentiment shifts

---

## Cadence

| Trigger | Report Type | Depth |
|---------|-------------|-------|
| Monthly (1st of month) | full-scan | standard |
| Pre-campaign launch | pre-campaign (focused on ads + positioning) | deep |
| Competitor launches product | product + pricing | quick |
| On demand | user-specified | user-specified |

---

## Tools Used

This skill uses:
- **WebSearch** — for pricing, product info, blog content, reviews, SEO data
- **WebFetch** — for scraping specific competitor pages, Meta Ad Library
- **Read/Write** — for persisting tracking data and generating reports

---

## Quality Gate

Before delivering:
- [ ] All default competitors covered (or user-specified list fully scanned)
- [ ] Pricing data is current (check dates on source pages)
- [ ] Meta Ad Library checked for each competitor (note if brand not found)
- [ ] Positioning map clearly shows Base Layer's relative position
- [ ] Advantages AND vulnerabilities identified (no blind spots)
- [ ] "Steal This" section has at least 3 actionable tactics
- [ ] Opportunity gaps are specific enough to act on (not generic "improve marketing")
- [ ] Threat alerts flagged for anything requiring immediate attention
- [ ] Report saved to reports/competitive/ with date stamp
- [ ] Tracking JSON updated with latest scan data
- [ ] No competitor mentioned by name in customer-facing copy recommendations (brand guideline)
- [ ] All recommendations aligned with Base Layer brand voice and positioning
