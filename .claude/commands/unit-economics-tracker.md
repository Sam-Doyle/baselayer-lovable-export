# Unit Economics Tracker

**DTC unit economics model for Base Layer Skin. Tracks COGS, CAC, LTV, contribution margin, payback period, and break-even ROAS. Accepts manual input or platform exports. Persists a running model, runs scenario analysis, and alerts on danger thresholds.**

---

## Inputs

The user provides financial data. Accept any combination:

```
INPUT TYPE:      manual | shopify-export | meta-export | combined
UPDATE MODE:     snapshot (default) | trend-update | scenario | full-rebuild
TIME PERIOD:     Current month | Last 30/60/90 days | Custom range
```

## When NOT to Use
- For weekly performance snapshots (use `/weekly-growth-report`)
- For ad spend optimization (use `/campaign-auditor`)
- For pricing research vs competitors (use `/competitive-intel`)

### Manual Input

```
/unit-economics-tracker

## Product
Product: Performance Daily Face Cream
Retail Price: $XX (founding: $38, post-launch: $48)
COGS per unit: $XX.XX (product cost + packaging + fulfillment labor)
Shipping cost per order: $X.XX
Payment processing: X.X% + $0.XX (Shopify Payments default: 2.9% + $0.30)
Shopify fee per order: $X.XX (if applicable beyond payment processing)

## Revenue
Total revenue: $X,XXX
Total orders: XXX
Refunds: $XXX (count: X)
Multi-unit orders: X% of total
Average units per order: X.X
Subscription orders: XX (% of total)

## Acquisition
Meta spend: $X,XXX
Google spend: $XXX
Other marketing spend: $XXX (list: email tools, content, etc.)
New customers: XXX
Returning customers: XX

## Retention (if available)
30-day repurchase rate: XX%
60-day repurchase rate: XX%
90-day repurchase rate: XX%
180-day repurchase rate: XX%
365-day repurchase rate: XX%
Active subscribers (if subscription model): XX
Subscriber churn rate: X.X%
```

### Shopify Export
Parse from Shopify orders export CSV:
- Calculate AOV, units per order, refund rate, new vs returning split
- Extract revenue by month for trend analysis

### Meta Ads Export
Parse from Ads Manager export:
- Total spend, CPA, purchases attributed, ROAS
- Spend by campaign for channel-level CAC

---

## Persisted Model

Maintain a running unit economics model at:
```
reports/unit-economics/model.json
```

### Model Schema

```json
{
  "last_updated": "YYYY-MM-DD",
  "product": {
    "name": "Performance Daily Face Cream",
    "sku": "BL-PDFC-50ML",
    "retail_price": 38.00,
    "post_launch_price": 48.00,
    "cogs": 0.00,
    "shipping_cost": 0.00,
    "payment_processing_pct": 2.9,
    "payment_processing_fixed": 0.30,
    "packaging_cost": 0.00
  },
  "current_snapshot": {
    "period": "YYYY-MM-DD to YYYY-MM-DD",
    "revenue": 0,
    "orders": 0,
    "aov": 0,
    "units_per_order": 0,
    "refund_rate": 0,
    "subscription_pct": 0,
    "new_customers": 0,
    "returning_customers": 0,
    "gross_margin_pct": 0,
    "contribution_margin_pct": 0,
    "contribution_margin_per_order": 0,
    "blended_cac": 0,
    "meta_cac": 0,
    "meta_roas": 0,
    "mer": 0,
    "ltv_30": 0,
    "ltv_60": 0,
    "ltv_90": 0,
    "ltv_180": 0,
    "ltv_365": 0,
    "ltv_cac_ratio": 0,
    "payback_period_days": 0,
    "break_even_roas": 0
  },
  "history": [],
  "alerts": []
}
```

When the user provides new data, update `current_snapshot` and append the previous state to `history`. Never overwrite history entries.

### File Structure

```
reports/unit-economics/
  model.json              — Current model state (persists across runs)
  history.csv             — One row per update for trend analysis
  snapshots/
    YYYY-MM-DD-snapshot.md — Archived snapshots
  scenarios/
    YYYY-MM-DD-[name].md  — Saved scenario analyses
```

Create directories as needed on first run.

---

## Analysis Pipeline

```
1. INGEST      -> Parse input data (manual, CSV, or combined)
2. CALCULATE   -> Run all unit economics formulas
3. PERSIST     -> Update model.json with new snapshot
4. COMPARE     -> Trend analysis against historical snapshots
5. ALERT       -> Check danger thresholds, flag issues
6. SCENARIO    -> Run "what if" models if requested
7. OUTPUT      -> Structured report with snapshot + trends + recommendations
```

---

## Calculations

### Gross Margin

```
Revenue per Unit = Retail Price
COGS per Unit = Product Cost + Packaging
Gross Profit per Unit = Revenue per Unit - COGS per Unit
Gross Margin % = Gross Profit per Unit / Revenue per Unit * 100
```

Target: >65% (skincare industry standard: 60-80%)

### Contribution Margin (fully loaded)

```
Variable Cost per Order =
  COGS per Unit * Units per Order
  + Shipping Cost
  + (Order Value * Payment Processing %) + Payment Processing Fixed
  + Shopify Transaction Fee (if applicable)

Contribution Margin per Order = AOV - Variable Cost per Order
Contribution Margin % = Contribution Margin per Order / AOV * 100
```

Target: >50% of AOV

### Customer Acquisition Cost (CAC)

```
Blended CAC = Total Marketing Spend / New Customers Acquired
Meta CAC = Meta Spend / Meta-attributed New Customers
Google CAC = Google Spend / Google-attributed New Customers
```

Include in Total Marketing Spend:
- Meta ad spend, Google ad spend
- Email platform costs (Klaviyo/Mailchimp)
- Content creation costs
- Influencer/affiliate costs
- Marketing tool subscriptions

Exclude: COGS, shipping, Shopify platform fees, payment processing.

Target: <$12.67 (1/3 of first-order revenue at $38)

### Average Order Value (AOV)

```
AOV = Total Revenue / Total Orders
```

Track multi-unit order rate separately — AOV above $38 means multi-unit purchasing.

### Marketing Efficiency Ratio (MER)

```
MER = Total Revenue / Total Marketing Spend
```

MER captures blended efficiency across all channels including organic lift. Target: >3.0x

### Break-even ROAS

```
Break-even ROAS = 1 / Contribution Margin %
```

Example: 65% contribution margin = 1.54x break-even ROAS.
Any Meta ROAS above this number is profitable on first order.

### Lifetime Value (LTV)

Calculate at multiple time horizons:

```
LTV(T) = AOV * Average Orders per Customer within T days

Simplified (early stage, limited data):
LTV(T) = First Order AOV + (First Order AOV * Repurchase Rate at T days)

With subscription:
LTV(T) = First Order AOV + (Monthly Subscription Value * Average Months Retained within T)
```

**For Base Layer specifically:**
- Product lasts 6-8 weeks, so first natural repurchase is at ~45-60 days
- LTV_30 is almost always = first order value (no repurchase window yet)
- LTV_60 and LTV_90 are the first meaningful retention signals
- LTV_365 is the north star for paid acquisition decisions

### LTV:CAC Ratio

```
LTV:CAC = LTV_365 / Blended CAC
```

| Ratio | Health | Interpretation |
|-------|--------|----------------|
| <1.0 | CRITICAL | Losing money on every customer. Stop spending. |
| 1.0-2.0 | DANGER | Barely breaking even. Improve retention or reduce CAC. |
| 2.0-3.0 | CAUTION | Functional but tight. Optimize. |
| 3.0-5.0 | HEALTHY | Good balance of growth and profitability. Scale. |
| >5.0 | STRONG | May be underinvesting in acquisition. |

### Payback Period

```
If first order contribution margin > CAC: Payback = 0 (profitable on first order)
If not: Payback = Days until cumulative contribution margin >= CAC
```

Target: <90 days. Danger: >120 days (cash flow risk).

### Max Allowable CAC

```
Max CAC (conservative) = First Order Contribution Margin (break even on first order)
Max CAC (moderate) = LTV_90 * 0.33 (pay back within 90 days at 33% of LTV)
Max CAC (aggressive) = LTV_365 * Target Margin % (e.g., 30% margin on LTV)
```

---

## Report Structure

### 1. Current Snapshot

```markdown
## Unit Economics Snapshot
**Period:** [date range]
**Last Updated:** [date]

### Per-Unit Economics
| Line Item | Amount |
|-----------|--------|
| Retail Price | $XX.XX |
| COGS | -$XX.XX |
| **Gross Profit** | **$XX.XX** |
| **Gross Margin** | **XX%** |
| Shipping | -$X.XX |
| Payment Processing | -$X.XX |
| **Contribution Margin (per unit)** | **$XX.XX** |
| **Contribution Margin %** | **XX%** |

### Per-Order Economics
| Metric | Value |
|--------|-------|
| AOV | $XX.XX |
| Units per Order | X.X |
| Variable Cost per Order | $XX.XX |
| **Contribution Margin per Order** | **$XX.XX** |

### Acquisition Economics
| Metric | Value | Health |
|--------|-------|--------|
| Blended CAC | $XX.XX | [status vs $12.67 target] |
| Meta CAC | $XX.XX | [status] |
| Google CAC | $XX.XX | [status] |
| Meta ROAS | X.Xx | [status vs break-even X.Xx] |
| MER | X.Xx | [status vs 3.0x target] |
| Break-even ROAS | X.Xx | — |

### Lifetime Value
| Horizon | LTV | LTV:CAC |
|---------|-----|---------|
| 30-day | $XX.XX | X.Xx |
| 60-day | $XX.XX | X.Xx |
| 90-day | $XX.XX | X.Xx |
| 180-day | $XX.XX | X.Xx |
| 365-day | $XX.XX | X.Xx |

### Payback & Profitability
| Metric | Value |
|--------|-------|
| Payback Period | XX days |
| First-Order Profitable? | YES/NO |
| Max CAC (conservative) | $XX.XX |
| Max CAC (moderate, 90-day) | $XX.XX |
| Max CAC (aggressive, 365-day) | $XX.XX |
```

### 2. Trend Analysis

```markdown
## Trend Analysis

### Key Metrics Over Time
| Period | Revenue | AOV | Blended CAC | Meta ROAS | Gross Margin | LTV:CAC | Payback |
|--------|---------|-----|-------------|-----------|--------------|---------|---------|
| [period 1] | $X,XXX | $XX | $XX | X.Xx | XX% | X.Xx | XX days |
| [period 2] | $X,XXX | $XX | $XX | X.Xx | XX% | X.Xx | XX days |
| [period 3] | $X,XXX | $XX | $XX | X.Xx | XX% | X.Xx | XX days |

### Trend Alerts
- [Flag any metric trending wrong direction for 3+ consecutive periods]
- [Flag if CAC is increasing faster than LTV]
- [Flag if contribution margin is compressing]
```

### 3. Scenario Modeling

When the user requests scenarios or when triggered by alert thresholds:

**Pre-built scenarios to run on request:**

```
1. CAC +20%:          What if acquisition gets 20% more expensive?
2. CAC -20%:          What if we find a more efficient channel?
3. AOV +$10:          What if we add a bundle/upsell?
4. AOV -$5:           What if we have to discount more?
5. COGS +15%:         What if supplier costs increase?
6. Price to $48:      What if we move to post-launch pricing?
7. Subscription 15%:  What if we add subscription at 15% discount ($32.30)?
8. Retention +15%:    What if we improve subscription retention by 15%?
```

**Scenario output format:**

```markdown
### Scenario: [Description]
| Metric | Current | Scenario | Change |
|--------|---------|----------|--------|
| [metric] | $XX | $XX | +/-XX% |
| LTV:CAC (365) | X.Xx | X.Xx | -XX% |
| Payback Period | XX days | XX days | +XX days |
| First-Order Profitable? | YES/NO | YES/NO | — |
| **Verdict:** [Still viable / Danger zone / Not sustainable] |
```

### 4. Break-Even by Channel

```markdown
## Break-Even Analysis by Channel

| Channel | Spend | Revenue | ROAS | Break-even ROAS | Profitable? | Max Spend at Current Efficiency |
|---------|-------|---------|------|-----------------|-------------|-------------------------------|
| Meta (total) | $X,XXX | $X,XXX | X.Xx | X.Xx | YES/NO | $X,XXX |
| Meta (prospecting) | $XXX | $XXX | X.Xx | X.Xx | YES/NO | $XXX |
| Meta (retargeting) | $XXX | $XXX | X.Xx | X.Xx | YES/NO | $XXX |
| Email/SMS | $XXX | $XXX | X.Xx | — | YES | — |
| Organic | $0 | $XXX | inf | — | YES | — |

### Recommended Spend Allocation
Based on current efficiency, optimal allocation of $[total budget]:
- Meta prospecting: $XXX (XX%) — [rationale]
- Meta retargeting: $XXX (XX%) — [rationale]
- Email: $XXX (XX%) — [rationale]
- Content/SEO: $XXX (XX%) — [rationale]
```

---

## Danger Threshold Alerts

Automatically flag when any metric crosses these thresholds:

| Metric | Danger Threshold | Alert Level | Action |
|--------|-----------------|-------------|--------|
| CAC > 1/3 first-order revenue | CAC > $12.67 (at $38) | HIGH | Audit Meta campaigns, pause low-ROAS creatives |
| LTV:CAC < 2:1 | LTV_365:CAC < 2.0 | HIGH | Cut spend or improve retention before scaling |
| Gross Margin < 60% | GM < 60% | HIGH | Renegotiate COGS or raise price |
| Contribution Margin < 50% | CM < 50% | MEDIUM | Optimize shipping, reduce variable costs |
| Payback Period > 90 days | Payback > 90d | HIGH | Must improve first-order economics |
| Meta ROAS < break-even | ROAS < 1/CM% | HIGH | Losing money on every Meta-acquired customer |
| Refund Rate > 10% | Refunds > 10% | HIGH | Product or expectation issue — investigate immediately |
| MER < 2.0x | MER < 2.0 | MEDIUM | Total marketing efficiency too low |
| AOV declining 3+ periods | AOV trend negative | MEDIUM | Multi-unit or bundle strategy needed |
| CAC increasing 3+ periods | CAC trend positive | MEDIUM | Creative fatigue or auction pressure |
| Subscription Churn > 20%/month | — | MEDIUM | LTV projections overstated. Fix onboarding. |
| Repeat Purchase Rate < 15% (90d) | — | MEDIUM | Low retention undermines LTV. Push replenishment. |
| Cart Abandonment > 80% | — | MEDIUM | Checkout optimization needed |

Alert format:

```markdown
## Active Alerts

[ALERT: HIGH] CAC at $XX.XX exceeds 1/3 of first-order revenue ($12.67 threshold)
  -> Action: Review Meta campaigns. Pause any campaign with CPA > $15. Test new creatives.
  -> Impact: At current CAC, first-order contribution after acquisition cost is only $X.XX

[ALERT: MEDIUM] Payback period at XX days, approaching 90-day threshold
  -> Action: Focus on 60-day retention. Activate post-purchase email flow. Consider subscription offer.
  -> Impact: Cash flow risk — every customer costs $XX upfront with XX-day recovery
```

---

## Subscription / Replenishment LTV Model

When Base Layer has subscription data:

```
SUBSCRIPTION LTV MODEL
======================

Monthly subscription price: $XX.XX (e.g., $32.30 at 15% discount)
Average subscriber retention: X months
Subscriber churn rate: X.X% monthly

LTV_subscription = Monthly Price * (1 / Monthly Churn Rate)
Example: $32.30 * (1 / 0.10) = $323 LTV for 10% monthly churn

Blended LTV = (% one-time * LTV_one-time) + (% subscription * LTV_subscription)

Subscription break-even:
  Subscription COGS per shipment = $XX.XX
  Subscription contribution per month = $XX.XX
  Months to recover CAC = CAC / Monthly Contribution

COMPARISON:
                     Subscriber    Non-Subscriber    Delta
LTV (365d):          $[X]          $[X]              [+/-X%]
Gross Margin:        [X]%          [X]%              [+/-X%]
Retention (12mo):    [X]%          [X]%              [+/-X%]
Predictability:      HIGH          LOW               —

VERDICT: Every [X]% increase in subscription adoption improves LTV by $[X]
```

Track subscription metrics separately:
- Subscriber conversion rate (what % of customers convert to subscription)
- Average subscription duration (months)
- Churn by cohort month (Month 1 churn vs Month 6 churn)
- Subscription revenue as % of total revenue

---

## Base Layer Defaults

When data is missing, use these reasonable defaults for a founding-stage DTC skincare brand:

```
Retail Price: $38.00 (founding) / $48.00 (post-launch)
COGS estimate: $8-12 per unit (cosmetics industry standard for premium formulation at small batch)
Packaging estimate: $2-4 per unit
Shipping estimate: $5-8 per order (USPS First Class or similar)
Payment processing: 2.9% + $0.30 (Shopify Payments)
Refund rate estimate: 2-5% (model conservatively despite zero from 50 testers)
Replenishment cycle: 45-60 days (50mL at daily use)
```

Flag all defaults clearly as ESTIMATED and prompt user to replace with actual numbers.

---

## Cross-References

This model integrates with other Base Layer skills:
- **Weekly Growth Report** (`/weekly-growth-report`): Pulls break-even ROAS and CAC thresholds
- **Email Analyzer** (`/email-analyzer`): Email channel contribution to LTV
- **Competitive Intel** (`/competitive-intel`): Competitor pricing for market positioning context

---

## Edge Cases
- If this is the first run (no model.json exists): create the initial model file and establish baseline. Skip trend analysis. Set all "previous" values to null.
- If COGS data is missing: use $8-12 range as placeholder, clearly marked as ESTIMATED. Prompt user to get exact COGS from manufacturer.
- If orders are zero (pre-launch): switch to "Pre-Launch Economics" mode showing projected unit economics at 100, 500, and 1000 orders/month.
- If LTV:CAC drops below 3x: trigger "PROFITABILITY WARNING" with specific levers to pull and estimated impact of each.
- If user provides revenue but not order count: ask for order count. Do not assume an AOV — inaccurate AOV cascades errors through all downstream metrics.

---

## Quality Gate

Before delivering:
- [ ] All calculations shown with formulas (user should be able to verify)
- [ ] Gross margin and contribution margin clearly distinguished
- [ ] CAC includes all marketing costs, not just ad spend
- [ ] LTV calculated at multiple time horizons (30/60/90/180/365)
- [ ] Break-even ROAS uses contribution margin, not gross margin
- [ ] Danger thresholds checked and alerts generated for any violations
- [ ] Model persisted to model.json
- [ ] History log updated (never overwrite, only append)
- [ ] If scenario analysis requested: at least 3 scenarios with clear verdicts
- [ ] Subscription/replenishment model included if subscription data provided
- [ ] Missing data points flagged explicitly (not silently assumed)
- [ ] All dollar amounts rounded to 2 decimal places
- [ ] Percentages include % symbol and are rounded to 1 decimal
- [ ] Payback period accounts for skincare replenishment cycle (45-60 days)
