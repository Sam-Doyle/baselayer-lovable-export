# Weekly Growth Report

**Unified weekly growth report for Base Layer Skin. Ingests data from Shopify, GA4, Meta Ads, Klaviyo, and Search Console. Synthesizes into a single document with trend arrows, anomaly flags, and specific action items.**

## References — Auto-Load
Read and internalize before executing:
- `brand/references/product/catalog.md`
- `brand/references/benchmarks/dtc-skincare.md`

---

## Data Sources & Input Formats

Provide data from any combination of these sources. Paste raw exports, CSVs, screenshots, or JSON. The skill normalizes everything.

### Required (minimum viable report)
1. **Shopify** — Orders export or Admin dashboard screenshot
   - Total revenue, order count, AOV, new vs returning customers, refunds
2. **Meta Ads Manager** — Campaign-level export (CSV or paste)
   - Spend, impressions, reach, frequency, clicks, CPA, ROAS, purchases

### Recommended
3. **GA4** — Traffic acquisition report + engagement overview
   - Sessions, users, new users, bounce rate, pages/session, avg session duration, conversion rate by channel/source
4. **Klaviyo** (or Mailchimp) — Campaign + flow performance
   - Emails sent, delivered, opened, clicked, revenue attributed, unsubscribes, list size
5. **Google Search Console** — Performance report (last 7 days vs previous 7)
   - Total impressions, clicks, CTR, average position, top queries, top pages

### Optional
6. **Shopify Subscriptions** (ReCharge, Skio, Loop) — Active subscribers, churn, MRR
7. **Organic Social** — Instagram Insights export (reach, engagement, follower delta)
8. **Referral/Affiliate** — Any referral platform data

---

## Input Instructions

When invoking this skill, provide data in this format:

```
/weekly-growth-report

## Period
Week of: YYYY-MM-DD to YYYY-MM-DD
Previous week: YYYY-MM-DD to YYYY-MM-DD (for WoW)
Same week last month: YYYY-MM-DD to YYYY-MM-DD (for MoM, if available)

## Shopify
[Paste order export, dashboard screenshot, or key numbers]

## Meta Ads
[Paste campaign export CSV or key numbers]

## GA4
[Paste traffic acquisition + engagement data]

## Klaviyo
[Paste campaign/flow performance data]

## Search Console
[Paste performance data]

## Notes
[Anything unusual this week: new product launch, sale, PR hit, site outage, etc.]
```

If prior week or month data is unavailable, note "baseline week" and skip comparisons.

---

## Report Generation Process

```
1. INGEST   -> Parse all provided data sources, normalize metrics
2. VALIDATE -> Cross-reference revenue across Shopify/GA4/Meta (flag discrepancies >10%)
3. COMPARE  -> Calculate WoW and MoM deltas for every metric
4. FLAG     -> Identify anomalies (any metric moved >20% WoW)
5. ANALYZE  -> Interpret what the numbers mean for the business
6. PRESCRIBE -> Generate specific action items
7. OUTPUT   -> Write structured report to file
```

---

## Report Structure

### 1. Executive Summary

3-5 bullet TL;DR of the week. Each bullet includes a trend indicator.

```markdown
## Executive Summary

- Revenue $X,XXX (arrow_up XX% WoW) — driven by [cause]
- Meta ROAS X.Xx (arrow_down XX% WoW) — [reason], action needed
- Email revenue $XXX, XX% of total — flow optimization paying off
- Organic traffic +XX% — [keyword/content] driving growth
- CAC $XX.XX blended — within/above/below target of $XX
```

Use `arrow_up` for positive trends and `arrow_down` for negative. Flag anything that needs immediate attention with `[ACTION NEEDED]`.

### 2. Revenue Dashboard

```markdown
## Revenue Dashboard

| Metric | This Week | Last Week | WoW Change | Last Month Avg | MoM Change |
|--------|-----------|-----------|------------|----------------|------------|
| Total Revenue | $X,XXX | $X,XXX | +/-XX% | $X,XXX | +/-XX% |
| Order Count | XX | XX | +/-XX% | XX | +/-XX% |
| AOV | $XX.XX | $XX.XX | +/-XX% | $XX.XX | +/-XX% |
| Refunds | $XXX | $XXX | — | — | — |
| Net Revenue | $X,XXX | $X,XXX | +/-XX% | $X,XXX | +/-XX% |

### Revenue by Channel
| Channel | Revenue | % of Total | WoW Change |
|---------|---------|------------|------------|
| Meta (Paid) | $X,XXX | XX% | +/-XX% |
| Organic Search | $XXX | XX% | +/-XX% |
| Email/SMS | $XXX | XX% | +/-XX% |
| Direct | $XXX | XX% | +/-XX% |
| Referral | $XXX | XX% | +/-XX% |
| Other | $XXX | XX% | +/-XX% |
```

Flag channel concentration risk: if any single channel is >70% of revenue, call it out.

### 3. Acquisition

```markdown
## Acquisition

| Metric | This Week | Last Week | WoW Change |
|--------|-----------|-----------|------------|
| New Customers | XX | XX | +/-XX% |
| Blended CAC | $XX.XX | $XX.XX | +/-XX% |
| Meta CAC | $XX.XX | $XX.XX | +/-XX% |
| Organic CAC | $X.XX | $X.XX | +/-XX% |
| Email CAC | $X.XX | $X.XX | +/-XX% |
| Meta Spend | $X,XXX | $X,XXX | +/-XX% |
| Meta ROAS | X.Xx | X.Xx | +/-XX% |
| MER (Total Rev / Total Spend) | X.Xx | X.Xx | +/-XX% |
```

**CAC Calculation:**
- Blended CAC = Total marketing spend / Total new customers
- Channel CAC = Channel spend / New customers attributed to channel
- Organic CAC = Fixed costs (tools, content) / Organic new customers (approximate at $0 if not tracked)

**Health Check:**
- Blended CAC vs first-order AOV: CAC should be <33% of AOV for skincare DTC
- Meta ROAS vs break-even ROAS (reference unit economics model at `reports/unit-economics/model.json` if available)

### 4. Engagement

```markdown
## Engagement

| Metric | This Week | Last Week | WoW Change |
|--------|-----------|-----------|------------|
| Sessions | X,XXX | X,XXX | +/-XX% |
| Users | X,XXX | X,XXX | +/-XX% |
| New Users | X,XXX | X,XXX | +/-XX% |
| Pages/Session | X.X | X.X | +/-XX% |
| Avg Session Duration | Xm XXs | Xm XXs | +/-XX% |
| Bounce Rate | XX% | XX% | +/-XX pts |

### Email Engagement
| Metric | This Week | Last Week | WoW Change |
|--------|-----------|-----------|------------|
| Emails Sent | X,XXX | X,XXX | +/-XX% |
| Open Rate | XX% | XX% | +/-XX pts |
| Click Rate | X.X% | X.X% | +/-XX pts |
| Revenue per Email | $X.XX | $X.XX | +/-XX% |
| Unsubscribes | XX | XX | — |
```

### 5. Conversion

```markdown
## Conversion

| Metric | This Week | Last Week | WoW Change |
|--------|-----------|-----------|------------|
| Overall CVR | X.X% | X.X% | +/-XX pts |
| Meta Traffic CVR | X.X% | X.X% | +/-XX pts |
| Organic CVR | X.X% | X.X% | +/-XX pts |
| Email CVR | X.X% | X.X% | +/-XX pts |
| Direct CVR | X.X% | X.X% | +/-XX pts |
| Add-to-Cart Rate | X.X% | X.X% | +/-XX pts |
| Cart Abandonment Rate | XX% | XX% | +/-XX pts |
| Checkout Completion | XX% | XX% | +/-XX pts |
```

**Funnel analysis:** Identify the biggest drop-off point (sessions -> ATC -> checkout -> purchase) and quantify revenue left on the table.

### 6. Retention

```markdown
## Retention

| Metric | This Week | Last Week | WoW Change |
|--------|-----------|-----------|------------|
| Returning Customers | XX | XX | +/-XX% |
| Returning Revenue | $XXX | $XXX | +/-XX% |
| Repeat Purchase Rate | XX% | XX% | +/-XX pts |
| Email List Size | X,XXX | X,XXX | +XX |
| List Growth Rate | X.X% | X.X% | +/-XX pts |
| Active Subscribers (if applicable) | XX | XX | +/-XX% |
```

For skincare DTC, repeat purchase rate is the single most important long-term metric. Product lasts 6-8 weeks, so track 60-90 day repurchase cohorts.

### 7. SEO

```markdown
## SEO & Organic

| Metric | This Week | Last Week | WoW Change |
|--------|-----------|-----------|------------|
| Organic Impressions | X,XXX | X,XXX | +/-XX% |
| Organic Clicks | XXX | XXX | +/-XX% |
| CTR | X.X% | X.X% | +/-XX pts |
| Avg Position | XX.X | XX.X | +/-X.X |

### Top Queries (by clicks)
| Query | Clicks | Impressions | CTR | Position |
|-------|--------|-------------|-----|----------|
| [query] | XX | XXX | X.X% | X.X |

### Ranking Changes
| Keyword | Previous Position | Current Position | Change |
|---------|-------------------|------------------|--------|
| [keyword] | XX | XX | +/-X |
```

### 8. Meta Ads Deep Dive

```markdown
## Meta Ads Deep Dive

### Spend & Efficiency
| Metric | This Week | Last Week | WoW Change |
|--------|-----------|-----------|------------|
| Total Spend | $X,XXX | $X,XXX | +/-XX% |
| Impressions | XX,XXX | XX,XXX | +/-XX% |
| Reach | XX,XXX | XX,XXX | +/-XX% |
| Frequency | X.X | X.X | +/-X.X |
| CPM | $XX.XX | $XX.XX | +/-XX% |
| CPC | $X.XX | $X.XX | +/-XX% |
| CTR | X.X% | X.X% | +/-XX pts |
| CPA | $XX.XX | $XX.XX | +/-XX% |
| ROAS | X.Xx | X.Xx | +/-XX% |
| Purchases | XX | XX | +/-XX% |

### Top 3 Creatives (by ROAS)
| Creative | Spend | ROAS | CPA | Purchases | Notes |
|----------|-------|------|-----|-----------|-------|
| [name] | $XXX | X.Xx | $XX | XX | [what's working] |

### Bottom 3 Creatives (by ROAS)
| Creative | Spend | ROAS | CPA | Purchases | Notes |
|----------|-------|------|-----|-----------|-------|
| [name] | $XXX | X.Xx | $XX | XX | [what's failing] |

### Audience Performance
| Audience | Spend | ROAS | CPA | Notes |
|----------|-------|------|-----|-------|
| [audience] | $XXX | X.Xx | $XX | [insight] |

### Placement Breakdown
| Placement | Spend | ROAS | CPA |
|-----------|-------|------|-----|
| Instagram Feed | $XXX | X.Xx | $XX |
| Instagram Stories | $XXX | X.Xx | $XX |
| Instagram Reels | $XXX | X.Xx | $XX |
| Facebook Feed | $XXX | X.Xx | $XX |
| Audience Network | $XXX | X.Xx | $XX |
```

Frequency warning: flag if frequency >2.5 (creative fatigue risk for cold audiences) or >4.0 (retargeting).

### 9. Anomaly Flags

Automatically flag any metric that moved >20% WoW:

```markdown
## Anomaly Flags

| Metric | This Week | Last Week | Change | Severity | Likely Cause |
|--------|-----------|-----------|--------|----------|--------------|
| [metric] | XX | XX | +/-XX% | HIGH/MED/LOW | [hypothesis] |
```

Severity levels:
- **HIGH**: Revenue, ROAS, CAC, CVR (directly impacts profitability)
- **MED**: Traffic, engagement, email metrics (leading indicators)
- **LOW**: Impressions, reach, avg position (informational)

### 10. Action Items

```markdown
## Action Items This Week

1. **[Priority: HIGH/MED/LOW]** — [Specific, actionable task]
   - Why: [data point that triggered this]
   - Expected impact: [what improvement you expect]

2. **[Priority: HIGH/MED/LOW]** — [Specific, actionable task]
   - Why: [data point]
   - Expected impact: [improvement]

3. **[Priority: HIGH/MED/LOW]** — [Specific, actionable task]
   - Why: [data point]
   - Expected impact: [improvement]

4. **[Priority: HIGH/MED/LOW]** — [Specific, actionable task]
   - Why: [data point]
   - Expected impact: [improvement]

5. **[Priority: HIGH/MED/LOW]** — [Specific, actionable task]
   - Why: [data point]
   - Expected impact: [improvement]
```

Action items must be:
- Specific (not "improve ROAS" but "pause Creative X, duplicate Creative Y with new headline test")
- Achievable in one week by a solo operator
- Tied to a data point from the report
- Prioritized by expected revenue impact

---

## Output

Save the completed report to:
```
reports/weekly/YYYY-MM-DD-growth-report.md
```

Use the Monday date of the reporting week. Create the directory if it does not exist.

Also maintain a running summary file at `reports/weekly/summary-log.csv` with one row per week:
```csv
week_of,revenue,orders,aov,meta_spend,meta_roas,blended_cac,cvr,email_revenue,organic_sessions,list_size
```
This enables quick trend lookups across weeks without opening full reports.

---

## Calculations Reference

### Blended CAC
```
Blended CAC = Total Marketing Spend / New Customers Acquired
```
Include: Meta spend, influencer costs, content creation costs, tool subscriptions for marketing.
Exclude: COGS, shipping, Shopify fees.

### Marketing Efficiency Ratio (MER)
```
MER = Total Revenue / Total Marketing Spend
```
Target for skincare DTC: >3.0x (early stage), >5.0x (mature).

### Break-even ROAS
```
Break-even ROAS = 1 / Contribution Margin %
```
Example: 70% contribution margin = break-even ROAS of 1.43x. Anything above is profitable on first order.
Cross-reference with unit economics model at `reports/unit-economics/model.json` if available.

### Channel CVR
```
Channel CVR = (Purchases attributed to channel / Sessions from channel) * 100
```

### Cart Abandonment Rate
```
Cart Abandonment = 1 - (Completed Checkouts / Carts Created) * 100
```

### Revenue Per Email (RPE)
```
RPE = Email-attributed Revenue / Emails Delivered
```

### List Growth Rate
```
List Growth Rate = (New Subscribers - Unsubscribes) / Previous List Size * 100
```

---

## Base Layer Context

When analyzing data, keep these Base Layer specifics in mind:

- **Product**: Performance Daily Face Cream, $38 founding / $48 post-launch
- **Single SKU business** (for now): Revenue = orders * price. AOV variance comes from multi-unit purchases or bundles.
- **Primary channel**: Meta (Instagram/Facebook). This will likely be 60-80% of revenue initially.
- **ICP**: Men 25-40, active, time-conscious. Skeptical of skincare marketing.
- **Replenishment cycle**: 6-8 weeks per bottle. Track 60-90 day repurchase.
- **Target metrics** (early stage DTC skincare):
  - Gross margin: >65%
  - Blended CAC: <$20 (at $38 price point)
  - Meta ROAS: >2.0x minimum, >3.0x target
  - CVR (Meta cold traffic): 1.5-3.0%
  - CVR (email traffic): 5-10%
  - Email list growth: >5% weekly in launch phase
  - Repeat purchase rate: >25% at 90 days (subscription model helps)

---

## When NOT to Use
- For email-specific analysis (use `/email-analyzer`)
- For SEO-specific monitoring (use `/seo-monitor`)
- For competitive intelligence (use `/competitive-intel`)
- For unit economics modeling (use `/unit-economics-tracker`)
- For ad campaign deep dives (use `/campaign-auditor`)

---

## Example

### Input
```
/weekly-growth-report
Week: 2026-03-03 to 2026-03-09
Data sources: shopify-export.csv, ga4-export.csv, meta-ads-march.csv, klaviyo-march.csv
Previous: reports/weekly/2026-W09-growth.md
```

### Output (abbreviated)
```markdown
# Weekly Growth Report — W10 (Mar 3-9, 2026)

## Executive Summary
Revenue: $4,280 (↑12% WoW, ↑34% MoM)
Sessions: 8,420 (↑8% WoW)
Conversion Rate: 2.1% (↓0.3pp WoW) ⚠️
Email Revenue: $890 (21% of total)
Meta ROAS: 3.2x (↑0.4x WoW)

**Top story:** Revenue up driven by Meta ad spend increase, but conversion rate dipping suggests landing page friction — investigate.

## Revenue Breakdown
| Channel | Revenue | % of Total | WoW Change |
|---------|---------|-----------|------------|
| Meta Ads | $2,140 | 50% | ↑18% |
| Organic Search | $940 | 22% | ↑6% |
| Email/Klaviyo | $890 | 21% | ↑15% |
| Direct | $310 | 7% | ↓4% |

## Anomaly Flags
🔴 Conversion rate dropped 0.3pp despite traffic increase — check: cart abandonment rate, page load speed, checkout errors
⚠️ Meta CPM up 14% WoW — approaching seasonal increase, may need creative refresh
✅ Email open rates holding steady at 42% — above benchmark

## Action Items (Priority Order)
1. **This week:** Run cart abandonment analysis — conversion drop with traffic increase = funnel leak
2. **This week:** Refresh top Meta ad creative (frequency approaching 3.0)
3. **Next week:** A/B test landing page hero CTA copy
4. **Ongoing:** Monitor CPM trend — if +20% MoM, shift budget to email acquisition
```

---

## Edge Cases
- If one or more data source CSVs are missing: generate report with available data only. Clearly mark missing sections as "[DATA SOURCE UNAVAILABLE]" and list what export is needed for next week.
- If this is the first report (no previous week): skip all WoW comparisons, establish baseline metrics, and set benchmark targets for next week based on DTC skincare industry averages.
- If revenue is $0 for the week (pre-launch or stockout): pivot report to pre-revenue metrics: traffic growth, email list growth, social engagement, SEO position changes. Do not show revenue sections with zeros.
- If Meta Ads data shows $0 spend: omit the Meta Deep Dive section entirely and redistribute report focus to organic channels. Flag that paid acquisition is paused.
- If any metric shows >50% WoW change (up or down): automatically flag as anomaly requiring investigation, even if the direction is positive (could indicate tracking issues or one-time events).

---

## Cross-References

This report integrates with other Base Layer skills:
- **Unit Economics Tracker** (`/unit-economics-tracker`): Break-even ROAS and CAC thresholds
- **Email Analyzer** (`/email-analyzer`): Detailed email performance breakdown
- **Competitive Intel** (`/competitive-intel`): Context for Meta ad performance vs. market

When data from these models is available at their respective file paths, pull relevant benchmarks automatically.

---

## Quality Gate

Before finalizing the report:
- [ ] All provided data sources are reflected in the report
- [ ] Revenue cross-referenced across sources (Shopify is source of truth)
- [ ] WoW comparisons calculated correctly (not inverted)
- [ ] Anomaly flags populated for any >20% WoW swings
- [ ] Action items are specific, data-driven, and achievable in one week
- [ ] Report saved to correct file path with correct date
- [ ] Summary log CSV updated
- [ ] No vanity metrics without context (impressions alone mean nothing)
- [ ] Meta Ads section includes top 3 AND bottom 3 creatives
- [ ] Channel concentration risk flagged if applicable
