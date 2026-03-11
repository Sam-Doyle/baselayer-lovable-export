# Campaign Auditor

**Meta and Google Ads performance analysis for Base Layer Skin.**

Accepts CSV exports from Meta Ads Manager and Google Ads. Analyzes every performance dimension — creative, audience, placement, day-of-week — identifies winners and losers with statistical significance, flags creative fatigue, and outputs specific budget reallocation recommendations. Built for a DTC men's skincare brand running cold traffic on Meta to a $38 AOV product.

## References — Auto-Load
Read and internalize before executing:
- `brand/references/product/catalog.md`
- `brand/references/audience/icp-core.md`
- `brand/references/channels/meta-ad-specs.md`
- `brand/references/benchmarks/dtc-skincare.md`

## When NOT to Use
- For creating new ad creatives or copy (use `/ad-creative-pipeline` or `/ad-copy-variants`)
- For a high-level weekly business overview including ads (use `/weekly-growth-report`)
- For analyzing email campaign performance (use `/email-analyzer`)
- For researching competitor ad strategies (use `/competitive-intel`)
- For unit economics and margin analysis (use `/unit-economics-tracker`)

---

## Inputs

The user provides one or more CSV exports. Extract or ask for:

```
DATA SOURCE:      Meta Ads Manager CSV (required) and/or Google Ads CSV
DATE RANGE:       [start] to [end] (extracted from CSV if not stated)
SPEND TOTAL:      Confirm total spend matches the user's expectations
OBJECTIVE:        What campaigns optimized for (Purchases, Leads, Traffic, ThruPlay)
COMPARISON:       Previous period for trend analysis? (optional)
BUSINESS CONTEXT: Any known factors (new creative launched, seasonal, price change, landing page update)
```

### How to Export from Meta Ads Manager

If the user needs help:

1. Go to Meta Ads Manager > set date range
2. Choose level: Campaign, Ad Set, or Ad (Ad level gives creative-level data)
3. Breakdown: by delivery (age, gender, placement, time) for dimensional analysis
4. Columns > Customize columns > include all metrics listed below
5. Export > CSV (or Google Sheets link)

Optimal export strategy for a full audit:
- **Export 1:** Ad level, no breakdown (creative analysis)
- **Export 2:** Ad Set level, no breakdown (audience analysis)
- **Export 3:** Ad level, breakdown by placement (placement analysis)
- **Export 4:** Campaign level, breakdown by day (time analysis)

---

## Required Metrics (Meta Ads Manager)

Parse the CSV and map these columns (Meta uses varying column names across exports):

### Core Performance

| Metric | Common CSV Column Names | What It Tells Us |
|--------|------------------------|------------------|
| **Spend** | Amount spent, Spend | Total investment per entity |
| **Impressions** | Impressions | Scale/volume |
| **Reach** | Reach | Unique people reached |
| **Frequency** | Frequency | Avg times each person saw the ad |
| **Clicks** | Link clicks, Clicks (all) | Interest signal — use link clicks, not all clicks |
| **CTR** | CTR (link click-through rate), CTR (all) | Creative resonance — use link CTR |
| **CPC** | CPC (cost per link click), CPC (all) | Traffic acquisition cost |
| **CPM** | CPM (cost per 1,000 impressions) | Auction competitiveness/audience demand |
| **Conversions** | Results, Purchases, Leads, Website purchases | Bottom-line outcomes |
| **CPA** | Cost per result, Cost per purchase | Acquisition cost per customer |
| **ROAS** | Purchase ROAS, Website purchase ROAS | Revenue per dollar spent |
| **Revenue** | Purchase conversion value, Conversion value | Total revenue attributed |

### Meta-Specific Engagement

| Metric | Common CSV Column Names | What It Tells Us |
|--------|------------------------|------------------|
| **ThruPlay** | ThruPlays | Video views to completion (or 15s for longer videos) |
| **ThruPlay Rate** | ThruPlay rate | % of impressions that resulted in a ThruPlay |
| **Hook Rate** | 3-second video plays / Impressions | Scroll-stopping power — THE key creative metric |
| **Video Plays at 25%** | Video plays at 25% | Early retention |
| **Video Plays at 50%** | Video plays at 50% | Mid-funnel retention |
| **Video Plays at 75%** | Video plays at 75% | Late retention |
| **Video Plays at 100%** | Video plays at 100% | Completion (organic ThruPlay) |

### Funnel Metrics

| Metric | Common CSV Column Names | What It Tells Us |
|--------|------------------------|------------------|
| **Landing Page Views** | Landing page views | Clicks that actually loaded the page |
| **Add to Cart** | Adds to cart, Website adds to cart | Purchase intent |
| **Initiate Checkout** | Checkouts initiated, Website checkouts initiated | High intent |
| **Purchases** | Purchases, Website purchases | Conversions |
| **Cost per ATC** | Cost per add to cart | Mid-funnel efficiency |
| **Cost per Checkout** | Cost per checkout initiated | Late-funnel efficiency |

If columns are missing, note what is unavailable and work with what exists. Never fabricate metrics.

---

## Analysis Framework

Run all analyses in sequence. Use Python (via bash with pandas/scipy) for CSV parsing, calculations, and statistical tests.

### Step 1: Data Validation and Summary

```python
import pandas as pd
import numpy as np

df = pd.read_csv("[user's file path]")

# Validation checks
print(f"Date range: {df['Date'].min()} to {df['Date'].max()}")
print(f"Total spend: ${df['Amount spent'].sum():,.2f}")
print(f"Total revenue: ${df['Purchase conversion value'].sum():,.2f}")
print(f"Rows: {len(df)}")
print(f"Campaigns: {df['Campaign name'].nunique()}")
print(f"Ad Sets: {df['Ad set name'].nunique()}")
print(f"Ads: {df['Ad name'].nunique()}")

# Flag data issues
# - Rows with spend but zero impressions
# - Negative values in any metric
# - Missing critical columns
# - Duplicate rows
# - Date gaps
```

Present the data summary. Confirm spend total matches the user's expectation before proceeding. If discrepancies exist, flag them immediately.

### Step 2: Top-Level Performance Summary

```
CAMPAIGN PERFORMANCE SUMMARY
=============================
Date Range:        [X] to [Y] ([Z] days)
Total Spend:       $[X]
Total Revenue:     $[X]
Blended ROAS:      [X]x
Blended CPA:       $[X]
Blended CPM:       $[X]
Blended CTR:       [X]%
Total Conversions: [X]
Avg Frequency:     [X]
Avg Hook Rate:     [X]% (if video data available)
Avg ThruPlay Rate: [X]% (if video data available)

BENCHMARK COMPARISON (DTC Men's Skincare on Meta):
  Metric    Actual    Target         Verdict
  ------    ------    ------         -------
  ROAS:     [X]x     >2.5x cold     [ABOVE/BELOW/ON TARGET]
  CPA:      $[X]     <$30           [ABOVE/BELOW/ON TARGET]
  CTR:      [X]%     >1.0% feed     [ABOVE/BELOW/ON TARGET]
  CPM:      $[X]     $8-18          [ABOVE/BELOW/ON TARGET]
  Hook:     [X]%     >25%           [ABOVE/BELOW/ON TARGET]
  ThruPlay: [X]%     >20%           [ABOVE/BELOW/ON TARGET]
```

### Step 3: Performance by Dimension

Analyze and rank by each available dimension.

**By Creative (Ad Level):**
```
| Rank | Creative | Spend | Revenue | ROAS | CPA | CTR | CPM | Freq | Hook% | Status |
|------|----------|-------|---------|------|-----|-----|-----|------|-------|--------|
| 1    | [name]   | $X    | $X      | Xx   | $X  | X%  | $X  | X.X  | X%    | SCALE  |
| 2    | [name]   | $X    | $X      | Xx   | $X  | X%  | $X  | X.X  | X%    | TEST   |
| ...  | [name]   | $X    | $X      | Xx   | $X  | X%  | $X  | X.X  | X%    | KILL   |
```

**By Audience (Ad Set Level):**
```
| Rank | Audience | Spend | Revenue | ROAS | CPA | CTR | CPM | Reach | Freq | Status |
|------|----------|-------|---------|------|-----|-----|-----|-------|------|--------|
```

**By Placement:**
```
| Rank | Placement | Spend | Revenue | ROAS | CPA | CTR | CPM | Impressions | Status |
|------|-----------|-------|---------|------|-----|-----|-----|-------------|--------|
```

Common Meta placements to separate: Facebook Feed, Instagram Feed, Instagram Stories, Instagram Reels, Facebook Marketplace, Audience Network, Messenger. Reels and Stories have different performance profiles — always analyze them independently.

**By Day of Week:**
```
| Day | Spend | Revenue | ROAS | CPA | CTR | Conversions | Notes |
|-----|-------|---------|------|-----|-----|-------------|-------|
```

**By Age/Gender Breakdown (if available):**
```
| Age/Gender | Spend | Revenue | ROAS | CPA | CTR | Index vs Avg |
|------------|-------|---------|------|-----|-----|--------------|
```

For Base Layer, expect best performance in M25-34 and M35-44 segments. Flag if significant spend is going to off-target demographics (F18-24, M55+).

### Step 4: Statistical Significance

Do NOT declare winners or losers without sufficient data.

```python
from scipy import stats

# Minimum thresholds before any status assignment:
MIN_SPEND = 50            # At least $50 spent
MIN_IMPRESSIONS = 1000    # At least 1000 impressions
MIN_CONVERSIONS = 10      # At least 10 conversions for CPA/ROAS confidence
MIN_CLICKS = 100          # At least 100 clicks for CTR confidence

# For comparing two creatives/audiences (A vs B):
def conversion_rate_significance(conversions_a, clicks_a, conversions_b, clicks_b):
    """Two-proportion z-test. Returns p-value."""
    p1 = conversions_a / clicks_a
    p2 = conversions_b / clicks_b
    p_pool = (conversions_a + conversions_b) / (clicks_a + clicks_b)
    se = np.sqrt(p_pool * (1 - p_pool) * (1/clicks_a + 1/clicks_b))
    if se == 0:
        return 1.0
    z = (p1 - p2) / se
    return 2 * (1 - stats.norm.cdf(abs(z)))

# Classification:
# p < 0.05  -> statistically significant difference (95% confidence)
# p < 0.10  -> directional signal, needs more data
# p >= 0.10 -> no meaningful difference yet
```

**Status classification rules:**

| Status | Criteria |
|--------|----------|
| **SCALE** | ROAS > target AND CPA < target AND meets minimum thresholds AND frequency < 3 AND no declining trend |
| **TEST** | Promising metrics but below minimum data thresholds OR mixed signals across metrics |
| **WATCH** | Frequency 2.5-3.0 OR CTR declining week-over-week OR CPM rising but ROAS still acceptable |
| **REDUCE** | ROAS declining below target OR frequency > 3.0 OR clear fatigue signals |
| **KILL** | ROAS < 50% of target AND meets stat-sig thresholds AND no improving trend |
| **INSUFFICIENT** | Below $50 spend or 1000 impressions — cannot evaluate |

Always label results that don't meet thresholds: "INSUFFICIENT DATA — need $X more spend / X more conversions before judging."

### Step 5: Creative Fatigue Detection

Creative fatigue is the single biggest budget killer in Meta ads. Flag aggressively.

```
FATIGUE DETECTION THRESHOLDS:
- Frequency > 3.0           -> Hard fatigue. Audience has seen it too many times.
- Frequency > 2.5           -> Approaching fatigue. Monitor closely.
- CTR declining >20% W/W    -> Creative is losing scroll-stopping power.
- CPM increasing >15% W/W   -> Meta's auction is penalizing stale creative.
- Hook rate declining >15%   -> First 3 seconds no longer working.
- ThruPlay rate declining    -> People are watching less of the video over time.
- CPA increasing >25% W/W   -> Efficiency degrading (may be fatigue or audience saturation).

COMPOUND SIGNALS (two or more together = definite fatigue):
- High frequency + declining CTR          -> Classic fatigue pattern
- Rising CPM + declining hook rate        -> Auction penalty + creative decay
- Stable frequency + declining CPA        -> Audience exhaustion, not just frequency
```

**Fatigue Report Format:**
```
CREATIVE FATIGUE REPORT
=======================

| Creative | Freq | CTR Trend | CPM Trend | Hook Trend | CPA Trend | Days Live | Verdict |
|----------|------|-----------|-----------|------------|-----------|-----------|---------|
| [name]   | 3.8  | -24% W/W  | +18% W/W  | -15% W/W   | +30% W/W  | 21 days   | RETIRE  |
| [name]   | 2.1  | +5% W/W   | -3% W/W   | stable      | -8% W/W   | 14 days   | HEALTHY |
| [name]   | 2.8  | -12% W/W  | +8% W/W   | -10% W/W   | +15% W/W  | 28 days   | WARNING |

RECOMMENDED ACTIONS:
- RETIRE [creative X]: Replace immediately. Has been live [X] days at frequency [X].
  Replacement suggestion: Same angle, new visual (use /ad-creative-pipeline to generate).
- WARNING [creative Y]: Begin testing replacement. 5-7 days before expected fatigue.
```

### Step 6: Funnel Analysis

If funnel metrics are available (clicks > landing page views > ATC > checkout > purchase):

```
FUNNEL ANALYSIS
===============
                    Count     Rate         Benchmark     Verdict
Impressions:        [X]       --           --            --
Clicks:             [X]       [CTR]%       >1.0%         [OK/FIX]
Landing Page Views: [X]       [X]% of clk  >80%          [OK/FIX]
Add to Cart:        [X]       [X]% of LPV  >5%           [OK/FIX]
Init Checkout:      [X]       [X]% of ATC  >50%          [OK/FIX]
Purchase:           [X]       [X]% of IC   >50%          [OK/FIX]

BIGGEST BOTTLENECK: [Stage with largest drop-off vs benchmark]

DIAGNOSIS:
- Click > LPV drop (>20% loss): Slow page load or broken redirect. Check landing page speed.
- LPV > ATC drop (ATC rate <3%): Landing page is not converting. Review copy, offer, page experience.
- ATC > Checkout drop (>50% abandonment): Price shock, shipping cost, or friction in checkout.
- Checkout > Purchase drop (>50% abandonment): Payment issues, trust signals, or checkout UX.

RECOMMENDATION: [Specific fix for the bottleneck — creative problem vs. landing page vs. checkout]
```

### Step 7: Video-Specific Metrics

If the campaign includes video/reel ads:

```
VIDEO PERFORMANCE
=================

| Creative | Hook Rate (3s) | 25% View | 50% View | 75% View | ThruPlay | ThruPlay Rate | Cost/ThruPlay |
|----------|---------------|----------|----------|----------|----------|--------------|---------------|

DROP-OFF ANALYSIS:
- Impression -> 3s (Hook Rate): [X]%
  [If <20%: "Opening frame is not stopping the scroll. Test a new first 3 seconds — try a bold text hook, a surprising visual, or a direct question."]

- 3s -> 25%: [X]% retention
  [If <50%: "Losing people in the first quarter. The hook promises something the next few seconds don't deliver. Tighten the transition from hook to value."]

- 25% -> 50%: [X]% retention
  [If <60%: "Mid-video sag. Consider cutting length or adding a pattern interrupt (text overlay, scene change, new angle)."]

- 50% -> ThruPlay: [X]% retention
  [If <40%: "Ending is weak. Move the CTA earlier. For Base Layer, the product payoff should hit before 75%."]

COST EFFICIENCY:
- Cost per ThruPlay: $[X] (benchmark: <$0.10 for men's skincare)
- Cost per 3-second view: $[X]
- Video views are cheapest on: [placement with lowest cost/ThruPlay]
```

### Step 8: Meta-Specific Hook Rate Analysis

Hook rate (3-second video plays / impressions) is the most important creative metric on Meta. It measures pure scroll-stopping power independent of the rest of the ad.

```
HOOK RATE ANALYSIS
==================

| Creative | Hook Rate | Impressions | Spend | CPA | Correlation |
|----------|-----------|-------------|-------|-----|-------------|
| [name]   | 32%       | 50K         | $500  | $22 | High hook + low CPA |
| [name]   | 18%       | 30K         | $300  | $45 | Low hook + high CPA |
| [name]   | 28%       | 40K         | $400  | $28 | Good hook, good CPA |

INSIGHT: [Is there a correlation between hook rate and CPA? Usually yes.
Flag any anomalies — high hook but low conversion means the hook attracts the wrong audience or the body does not deliver.]

TOP HOOK PATTERNS THAT WORKED:
1. [Creative X] — Hook type: [text-on-screen question / surprising visual / product demo / etc.]
2. [Creative Y] — Hook type: [...]

HOOKS THAT FAILED:
1. [Creative Z] — Hook type: [...] — Possible reason: [...]
```

### Step 9: Cost Per Result Analysis

"Cost per result" is what Meta optimizes for. Analyze this metric specifically:

```
COST PER RESULT BREAKDOWN
==========================

| Creative/Audience | Cost/Purchase | Cost/ATC | Cost/LPV | Cost/Click | Cost/ThruPlay |
|-------------------|--------------|----------|----------|------------|---------------|

KEY INSIGHT: [Which stage of the funnel is most expensive? Is the cost driven by auction (high CPM) or by poor conversion (low CVR)?]

If CPM is high but CVR is good -> audience is competitive but creative resonates. Scale cautiously.
If CPM is low but CVR is poor -> cheap traffic that does not convert. Fix landing page or targeting.
If both are high -> wrong audience or exhausted creative. Rethink the approach.
```

---

## Recommendations Engine

### Budget Reallocation

Based on analysis, output dollar-specific reallocation:

```
BUDGET REALLOCATION PLAN
========================
Current total daily budget: $[X]
Recommended total daily budget: $[X] (same total — just reallocating)

SCALE (increase 20-30%):
  [Creative/Audience X]: $[current]/day -> $[recommended]/day (+[X]%)
  Reason: ROAS [X]x, CPA $[X], frequency [X], stat-sig winner.
  Action: Duplicate ad set at new budget (don't edit existing — preserves learning).

MAINTAIN (keep current):
  [Creative/Audience X]: $[current]/day -> $[current]/day
  Reason: Solid performance, no fatigue signals. Don't touch it.

REDUCE (decrease 50%):
  [Creative/Audience X]: $[current]/day -> $[recommended]/day (-[X]%)
  Reason: Frequency [X], CTR declining [X]% W/W. Approaching fatigue.
  Action: Reduce spend while testing replacement creative.

KILL (pause immediately):
  [Creative/Audience X]: $[current]/day -> $0/day
  Reason: ROAS [X]x (target: >2.5x), CPA $[X] (target: <$30). Stat-sig loser after $[X] spend.
  Savings: $[X]/day reallocated to winners.

NET PROJECTED IMPACT:
  Blended ROAS: [current]x -> [projected]x
  Blended CPA: $[current] -> $[projected]
  Weekly savings from killed spend: $[X]
```

### Scaling Rules for Base Layer

- Never increase a single ad set's budget more than 20% at a time (Meta resets learning phase above 20%)
- To scale aggressively: duplicate the winning ad set at the new budget level
- Scale horizontally first (winning creative to new audiences) before vertically (more budget to same audience)
- At $38 founding price with ~50% margin, break-even CPA is ~$19. Target CPA < $30 gives healthy margin for overhead.
- Retargeting should run at a fraction (10-20%) of cold traffic spend

### New Test Recommendations

```
RECOMMENDED TESTS (prioritized by expected impact)
===================================================

PRIORITY 1 — CREATIVE TESTS:
1. [Test name]: Based on winning [creative X], test [specific variation]
   Why: [Creative X] has the best hook rate ([X]%) — test the same hook with a different visual/offer.
   Use: /ad-creative-pipeline to generate variants.

2. [Test name]: Fresh creative to replace fatigued [creative Y]
   Why: [Creative Y] is at frequency [X] with declining CTR. Need replacement in same angle.
   Use: /ad-creative-pipeline with angle: [winning angle from Y].

PRIORITY 2 — AUDIENCE TESTS:
1. [Test name]: [New audience targeting] with winning [creative X]
   Why: [Winning creative has not been shown to this segment. Similar psychographic to winning audience.]

2. Lookalike expansion: [1%/2%/5%] from [email list / purchasers / ATC audience]
   Why: [Current LAL at X% is performing. Test broader expansion.]

PRIORITY 3 — PLACEMENT TESTS:
1. Shift [X]% of [placement A] budget to [placement B]
   Why: [Placement B] has [X]% lower CPA at lower spend — room to scale before competition increases.

PRIORITY 4 — COPY TESTS:
1. Same image as [winner], new hook: "[suggested hook]"
   Why: Isolate the copy variable. Image is proven. Test pain-point hook vs. social-proof hook.
   Use: /ad-copy-variants to generate options.
```

---

## Output Format

### Full Audit Report

```markdown
# Campaign Audit: Base Layer Skin
**Date Range:** [X] to [Y]
**Audited:** [current date]
**Data Source:** Meta Ads Manager export ([X] rows, [Y] campaigns, [Z] creatives)

## Executive Summary
- [Top finding: what is working best and why]
- [Second finding: biggest problem/waste identified]
- [Third finding: biggest opportunity]
- [Key number: total spend, ROAS, CPA in one line]
- [Top recommendation in one sentence]

## Performance Overview
[Top-level metrics table with benchmark comparison]

## Creative Analysis
[Ranked creative table with status flags]
[Top 3 and bottom 3 detailed breakdowns]

## Audience Analysis
[Ranked audience table with status flags]
[Audience overlap concerns if applicable]

## Placement Analysis
[Ranked placement table]
[Platform-specific insights: IG Reels vs Feed vs Stories performance]

## Time Analysis
[Day-of-week and time-of-day performance if available]
[Dayparting recommendations]

## Creative Fatigue Report
[All creatives with fatigue scoring]
[Retirement timeline for fatigued creatives]

## Funnel Analysis
[Stage-by-stage conversion with bottleneck identification]

## Video Performance
[Hook rate, retention, ThruPlay analysis]
[Hook pattern insights]

## Budget Reallocation
[Specific dollar-amount recommendations]
[Net projected impact]

## Recommended Tests
[Prioritized list with rationale]
[Reference to other slash commands for execution]

## Raw Data Tables
[CSV-formatted tables for copy-paste into sheets]
```

### CSV Output for Visualization

Output key tables in CSV format the user can paste into Google Sheets:

```csv
creative,spend,revenue,roas,cpa,ctr,cpm,frequency,hook_rate,status
"Creative A",500,1500,3.0,25,1.5,12,2.1,28,SCALE
"Creative B",300,450,1.5,45,0.8,15,3.2,18,KILL
"Creative C",200,500,2.5,30,1.2,10,1.8,25,TEST
```

---

## DTC Skincare Benchmarks — Reference

Men's skincare DTC brands spending primarily on Meta:

| Metric | Poor | Average | Good | Excellent |
|--------|------|---------|------|-----------|
| ROAS (cold) | <1.5x | 1.5-2.5x | 2.5-4.0x | >4.0x |
| ROAS (retargeting) | <3.0x | 3.0-5.0x | 5.0-8.0x | >8.0x |
| CPA | >$50 | $35-50 | $20-35 | <$20 |
| CTR (feed) | <0.5% | 0.5-1.0% | 1.0-2.0% | >2.0% |
| CTR (stories/reels) | <0.3% | 0.3-0.5% | 0.5-1.0% | >1.0% |
| CPM (men's skincare) | >$25 | $15-25 | $8-15 | <$8 |
| Hook Rate (3s video) | <15% | 15-25% | 25-35% | >35% |
| ThruPlay Rate | <10% | 10-20% | 20-30% | >30% |
| Landing Page CVR | <1% | 1-2% | 2-4% | >4% |
| ATC Rate (of LPV) | <3% | 3-5% | 5-8% | >8% |
| Checkout CVR (of ATC) | <40% | 40-60% | 60-75% | >75% |

**Base Layer-Specific Targets:**
- AOV: $38 (founding) / $48 (post-launch)
- COGS + fulfillment: ~$12 estimated
- Target CPA: <$30 founding / <$38 post-launch
- Break-even ROAS: ~1.5x (at ~50% gross margin)
- Profitable ROAS: >2.5x cold, >4x retargeting
- Max acceptable frequency: 3.0 (kill or refresh above this)
- Creative lifespan: 14-28 days typical before fatigue on Meta for DTC

---

## Google Ads Analysis (if provided)

### Google Ads Column Mapping

| Metric | Google Ads Column Name |
|--------|----------------------|
| Spend | Cost |
| Impressions | Impr. |
| Clicks | Clicks |
| CTR | CTR |
| CPC | Avg. CPC |
| Conversions | Conversions |
| CPA | Cost / conv. |
| Conv. Value | Conv. value |
| ROAS | Conv. value / cost |
| Search Impression Share | Search impr. share |
| Quality Score | Quality Score |

### Google-Specific Analysis

- **Search Term Report:** Identify high-spend, low-converting search terms to add as negatives.
- **Quality Score:** Flag any keywords below QS 6 — they are paying a premium.
- **Impression Share Lost (Budget):** If >20%, the campaign is budget-constrained on profitable keywords.
- **Impression Share Lost (Rank):** If >30%, bids or quality need improvement.
- **Cross-platform attribution:** Flag if both Meta and Google claim the same conversions (common with view-through attribution on Meta + last-click on Google).

---

## Implementation Notes

### Python Analysis Script

When CSV is provided, write and execute a Python script:

```bash
uv run --with pandas --with scipy python3 /tmp/bl_campaign_audit.py \
  --input "[user's CSV path]" \
  --output "[output directory]"
```

The script should:
1. Load and validate CSV (handle Meta's inconsistent column naming)
2. Calculate all derived metrics (ROAS, CPA, CTR, CPM if not pre-calculated)
3. Rank entities by each metric per dimension
4. Run z-tests on conversion rates for pairwise significance
5. Calculate week-over-week trends for fatigue detection
6. Classify each entity (SCALE/TEST/WATCH/REDUCE/KILL/INSUFFICIENT)
7. Generate reallocation recommendations
8. Output formatted markdown tables and CSV exports

Keep the script self-contained. Only dependencies: pandas, scipy, numpy. No external API calls.

### Handling Multiple CSV Files

If the user provides multiple CSVs:
- Parse each independently with validation
- Cross-reference where possible (same date range, matching campaign names)
- Flag potential double-counting if Meta and Google both claim conversions
- Present platform-specific analyses first, then a combined cross-platform view
- Use consistent CPA and ROAS calculations across platforms for apples-to-apples comparison

---

## Quality Gate

Before delivering the audit:

- [ ] Data validated — spend totals confirmed, no obvious errors or missing columns
- [ ] All available dimensions analyzed (creative, audience, placement, time)
- [ ] Statistical significance noted on every winner/loser classification
- [ ] Minimum data thresholds checked ($50+ spend, 1000+ impressions, 10+ conversions)
- [ ] Creative fatigue detection run on every active creative
- [ ] Fatigue uses compound signals, not just frequency alone
- [ ] Budget reallocation sums to the same total daily budget (redistributing, not adding)
- [ ] Funnel analysis identifies a specific bottleneck with a specific fix
- [ ] Video metrics analyzed if video creatives are present
- [ ] Hook rate analyzed and correlated with downstream metrics
- [ ] All recommendations are specific and actionable (not "test new creative" but "test X because Y")
- [ ] Tables are formatted for copy-paste into Google Sheets
- [ ] Benchmarks contextualized for Base Layer's $38 AOV and DTC men's skincare vertical
- [ ] No recommendations that conflict with each other
- [ ] Cross-references to other slash commands where relevant (/ad-creative-pipeline, /ad-copy-variants)
