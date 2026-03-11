# Email Analyzer

**Email performance analysis for Base Layer Skin. Ingests Klaviyo or Mailchimp exports, benchmarks against DTC skincare standards, identifies top/bottom performers, and delivers quick wins you can act on this week.**

## References — Auto-Load
Read and internalize before executing:
- `brand/references/channels/email-specs.md`
- `brand/references/benchmarks/dtc-skincare.md`

---

## When NOT to Use
- For planning new email sequences or automation flows (use `/email-strategist`)
- For writing or rewriting email copy (use `/email-copywriter`)
- For building or modifying HTML email templates (use `/email-template-builder`)
- For ad performance analysis (use `/campaign-auditor`)
- For site analytics or weekly business overview (use `/weekly-growth-report`)

---

## Inputs

The user provides email platform exports. Accept any of these formats:

```
DATA SOURCE:     Klaviyo CSV/JSON export | Mailchimp CSV/JSON export | Pasted metrics
REPORT TYPE:     campaign-review | flow-analysis | list-health | full-audit (default: full-audit)
TIME PERIOD:     Last 7 days | Last 30 days | Last 90 days | Custom range
COMPARISON:      Previous period (default) | Same period last month | Same period last year
```

If the user pastes raw data without context, assume:
- Report type: full-audit
- Time period: Last 30 days
- Comparison: Previous 30 days

### Data Ingestion

Parse and normalize data from either platform:

**Klaviyo exports:**
- Campaign performance: CSV from Campaigns -> Analytics
- Flow performance: CSV from Flows -> Analytics
- List/segment data: CSV from Lists & Segments

**Mailchimp exports:**
- Campaign reports: CSV from Reports -> Export
- Automation reports: CSV from Automations -> Reports
- Audience data: CSV from Audience -> Export

**Normalize to standard schema:**
```
email_id, email_name, type (campaign|flow), send_date,
sent, delivered, delivery_rate,
opened, unique_opens, open_rate,
clicked, unique_clicks, click_rate,
converted, conversion_rate, revenue, revenue_per_recipient,
unsubscribed, unsubscribe_rate,
bounced, bounce_rate, spam_complaints
```

---

## ICP Context — Hardcoded

When analyzing performance, evaluate against this audience:
- **Males 20-40**, acquired primarily through Meta ads (Instagram/Facebook)
- Skeptical of marketing — higher unsubscribe sensitivity to pushy copy
- Low email engagement baseline — these are not "email-first" buyers
- Product: Performance Daily Face Cream, $38 founding / $48 post-launch
- Replenishment cycle: 6-8 weeks per bottle
- Single SKU business: revenue attribution is straightforward

---

## Analysis Pipeline

```
1. INGEST    -> Parse all provided data, normalize to standard schema
2. VALIDATE  -> Check for data quality issues (missing fields, outliers, date gaps)
3. BENCHMARK -> Compare against DTC skincare benchmarks
4. ANALYZE   -> Campaign, flow, segment, and pattern analysis
5. DIAGNOSE  -> Identify issues (fatigue, deliverability, list health)
6. PRESCRIBE -> Generate quick wins and strategic recommendations
7. OUTPUT    -> Structured report
```

---

## Benchmarks — DTC Skincare (Men's)

### Campaign Benchmarks

| Metric | Below Average | Average | Good | Excellent |
|--------|---------------|---------|------|-----------|
| Open Rate | <25% | 25-35% | 35-45% | >45% |
| Click Rate | <1.5% | 1.5-2.5% | 2.5-4.0% | >4.0% |
| Click-to-Open Rate | <8% | 8-12% | 12-18% | >18% |
| Conversion Rate | <0.5% | 0.5-1.5% | 1.5-3.0% | >3.0% |
| Revenue per Recipient (RPR) | <$0.10 | $0.10-0.30 | $0.30-0.75 | >$0.75 |
| Unsubscribe Rate | >0.5% | 0.3-0.5% | 0.15-0.3% | <0.15% |
| Bounce Rate | >3.0% | 1.5-3.0% | 0.5-1.5% | <0.5% |
| Spam Complaint Rate | >0.1% | 0.05-0.1% | 0.01-0.05% | <0.01% |

### Flow Benchmarks

| Metric | Below Average | Average | Good | Excellent |
|--------|---------------|---------|------|-----------|
| Welcome Series Completion | <30% | 30-50% | 50-70% | >70% |
| Welcome Series CVR | <3% | 3-8% | 8-15% | >15% |
| Post-Purchase Open Rate | <35% | 35-50% | 50-65% | >65% |
| Cart Abandonment Recovery | <3% | 3-8% | 8-15% | >15% |
| Winback Re-engagement | <2% | 2-5% | 5-10% | >10% |
| Replenishment Reorder Rate | <15% | 15-25% | 25-35% | >35% |
| Flow RPR | <$0.50 | $0.50-1.50 | $1.50-3.00 | >$3.00 |

### List Health Benchmarks

| Metric | Danger | Caution | Healthy | Excellent |
|--------|--------|---------|---------|-----------|
| List Growth Rate (monthly) | <1% | 1-3% | 3-5% | >5% |
| 90-day Engagement Rate | <15% | 15-30% | 30-50% | >50% |
| Hard Bounce Rate | >2% | 1-2% | 0.3-1% | <0.3% |

**Note on Open Rate:** Apple Mail Privacy Protection inflates open rates. Weight click-based metrics (CTOR, click rate, RPR) more heavily than open rate for performance evaluation. Flag this caveat in every report.

---

## Report Sections

### 1. Executive Summary

```markdown
## Executive Summary

**Period:** [date range]
**Emails Analyzed:** [count campaigns + flows]
**Total Revenue Attributed:** $X,XXX

### Performance Snapshot
| Metric | Value | Benchmark | Status |
|--------|-------|-----------|--------|
| Avg Open Rate | XX% | 35-45% | [GOOD/BELOW/ABOVE] |
| Avg Click Rate | X.X% | 2.5-4% | [GOOD/BELOW/ABOVE] |
| Avg RPR | $X.XX | $0.30-0.75 | [GOOD/BELOW/ABOVE] |
| Avg Unsub Rate | X.XX% | <0.3% | [GOOD/BELOW/ABOVE] |
| List Size | X,XXX | — | [+/-XXX vs last period] |

### Key Findings
1. [Most important insight — revenue or conversion related]
2. [Second insight — engagement or deliverability]
3. [Third insight — opportunity or risk]
```

### 2. Campaign Performance

```markdown
## Campaign Performance

### All Campaigns (sorted by RPR, descending)
| Campaign | Send Date | Sent | Open % | Click % | CTOR % | CVR % | Revenue | RPR | Unsub % |
|----------|-----------|------|--------|---------|--------|-------|---------|-----|---------|

### Top 3 Performers (by RPR)
| Campaign | Subject | RPR | Why It Worked |
|----------|---------|-----|---------------|
| [name] | "[subject]" | $X.XX | [Analysis: subject line pattern, send time, content type, segment] |

### Bottom 3 Performers (by RPR)
| Campaign | Subject | RPR | Why It Underperformed + Fix |
|----------|---------|-----|-----------------------------|
| [name] | "[subject]" | $X.XX | [Specific diagnosis + actionable fix] |

### Campaign Type Performance
| Type | Count | Avg Open % | Avg Click % | Avg RPR | Avg Unsub % |
|------|-------|------------|-------------|---------|-------------|
```

### 3. Flow Performance

```markdown
## Flow Performance

### Flow Summary
| Flow | Emails | Completion Rate | Total Revenue | RPR | Drop-off Point |
|------|--------|-----------------|---------------|-----|----------------|

### Flow Step Analysis (per flow)

WELCOME SERIES:
| Step | Email Name | Open % | Click % | CVR % | Revenue | Drop-off % |
|------|-----------|--------|---------|-------|---------|------------|

Drop-off Analysis:
- Biggest drop: Between Email [X] and Email [X] ([X]% loss)
- Likely cause: [timing, content mismatch, no new value]
- Fix: [specific recommendation]
```

### 4. Subject Line Analysis

```markdown
## Subject Line Patterns

### What's Working
| Pattern | Avg Open Rate | Avg Click Rate | Example |
|---------|---------------|----------------|---------|

### What's Not Working
| Pattern | Avg Open Rate | Avg Click Rate | Example |
|---------|---------------|----------------|---------|

### Subject Line Insights
- Optimal length: [X-X words / XX-XX chars based on data]
- Best-performing word triggers: [list from actual data]
- Worst-performing patterns: [list from actual data]
- Personalization impact: [first name in subject: +/-XX% open rate]

### Winning Subject Line Formula
[Data-driven formula based on what the numbers actually show]
```

### 5. Send Time Analysis

```markdown
## Send Time Analysis

### Performance by Day of Week
| Day | Emails Sent | Avg Open % | Avg Click % | Avg RPR |
|-----|-------------|------------|-------------|---------|

### Performance by Time of Day
| Time Block | Avg Open % | Avg Click % | Avg RPR |
|------------|------------|-------------|---------|
| 6am-9am | XX% | X.X% | $X.XX |
| 9am-12pm | XX% | X.X% | $X.XX |
| 12pm-3pm | XX% | X.X% | $X.XX |
| 3pm-6pm | XX% | X.X% | $X.XX |
| 6pm-9pm | XX% | X.X% | $X.XX |

Best send window: [Day] at [Time] (based on RPR, not opens)
```

### 6. Segment Performance

```markdown
## Segment Performance

| Segment | Size | Open % | Click % | CVR % | RPR | Unsub % | Health |
|---------|------|--------|---------|-------|-----|---------|--------|
| All subscribers | X,XXX | XX% | X.X% | X.X% | $X.XX | X.XX% | — |
| Engaged 30-day | X,XXX | XX% | X.X% | X.X% | $X.XX | X.XX% | [status] |
| Engaged 90-day | X,XXX | XX% | X.X% | X.X% | $X.XX | X.XX% | [status] |
| Never purchased | X,XXX | XX% | X.X% | X.X% | $X.XX | X.XX% | [status] |
| Purchased 1x | XXX | XX% | X.X% | X.X% | $X.XX | X.XX% | [status] |
| Purchased 2x+ | XXX | XX% | X.X% | X.X% | $X.XX | X.XX% | [status] |
| Lapsed (60+ days) | XXX | XX% | X.X% | X.X% | $X.XX | X.XX% | [status] |
| Meta-acquired | X,XXX | XX% | X.X% | X.X% | $X.XX | X.XX% | [status] |
| Organic-acquired | XXX | XX% | X.X% | X.X% | $X.XX | X.XX% | [status] |

### Segment Insights
- Highest RPR segment: [segment] at $X.XX — [why and what to do]
- Lowest engagement segment: [segment] at X.X% click — [suppress or re-engage?]
- Revenue concentration: Top XX% of subscribers generate XX% of email revenue
```

### 7. List Health

```markdown
## List Health

### Growth
| Metric | This Period | Last Period | Change |
|--------|-------------|-------------|--------|
| Total Subscribers | X,XXX | X,XXX | +/-XXX |
| New Subscribers | XXX | XXX | +/-XX% |
| Unsubscribes | XX | XX | +/-XX% |
| Net Growth | +/-XXX | +/-XXX | — |
| Growth Rate | X.X% | X.X% | +/-X.X pts |

### Deliverability
| Metric | Value | Benchmark | Status |
|--------|-------|-----------|--------|
| Delivery Rate | XX.X% | >98% | [status] |
| Hard Bounce Rate | X.XX% | <0.3% | [status] |
| Soft Bounce Rate | X.XX% | <2% | [status] |
| Spam Complaint Rate | X.XXX% | <0.01% | [status] |

### Engagement Distribution
| Segment | Size | % of List | Recommendation |
|---------|------|-----------|----------------|
| Highly engaged (30 days) | X,XXX | XX% | Core segment — send all campaigns |
| Engaged (90 days) | X,XXX | XX% | Standard cadence |
| Disengaged (90+ days) | XXX | XX% | Sunset campaign, then suppress |
| Never engaged | XXX | XX% | Verify signup source, clean if >120 days |

### Deliverability Alerts
- [Flag any delivery rate drops, bounce spikes, spam complaint increases]
- [Flag if list is >30% disengaged — sending to dead addresses hurts domain reputation]
- [Flag if unsubscribe rate is trending up across consecutive sends]
```

### 8. Creative Fatigue Detection

```markdown
## Creative Fatigue Analysis

### Fatigue Indicators
| Metric | Trend (last 4 sends) | Direction | Alert |
|--------|----------------------|-----------|-------|
| Open Rate | XX% -> XX% -> XX% -> XX% | [declining/stable/improving] | [YES/NO] |
| Click Rate | X.X% -> X.X% -> X.X% -> X.X% | [declining/stable/improving] | [YES/NO] |
| Unsub Rate | X.XX% -> X.XX% -> X.XX% -> X.XX% | [increasing/stable/decreasing] | [YES/NO] |

### Fatigue by Content Type
| Content Type | First Send Performance | Most Recent | Decay % |
|--------------|----------------------|-------------|---------|
| Product-focused | XX% open / X.X% click | XX% open / X.X% click | -XX% |
| Educational | XX% open / X.X% click | XX% open / X.X% click | -XX% |
| Social proof | XX% open / X.X% click | XX% open / X.X% click | -XX% |
| Promotional | XX% open / X.X% click | XX% open / X.X% click | -XX% |

### Fatigue Diagnosis
- [If open rates declining 3+ consecutive sends: subject line fatigue — test radically different formats]
- [If click rates declining but opens stable: body copy fatigue — new angles needed]
- [If unsubs increasing: frequency or relevance issue — check cadence and segmentation]
```

---

## Quick Wins Section

Every report ends with the three highest-impact changes implementable this week:

```markdown
## Quick Wins — Do This Week

### 1. [Highest Impact Change]
**Current state:** [what's happening now, with data]
**Action:** [specific, step-by-step what to change]
**Expected impact:** [quantified improvement estimate]
**Effort:** [Low/Medium — must be achievable in <2 hours]

### 2. [Second Highest Impact Change]
**Current state:** [data]
**Action:** [specific steps]
**Expected impact:** [quantified]
**Effort:** [Low/Medium]

### 3. [Third Highest Impact Change]
**Current state:** [data]
**Action:** [specific steps]
**Expected impact:** [quantified]
**Effort:** [Low/Medium]
```

Quick win criteria:
- Must be implementable in under 2 hours
- Must be tied to a specific data point in the report
- Must have a measurable expected outcome
- Prioritized by revenue impact, then engagement impact
- Must be specific ("Resend X to non-openers with new subject") not vague ("improve subject lines")

---

## Calculations Reference

### Revenue per Recipient (RPR)
```
RPR = Total Email Revenue / Emails Delivered
```

### Click-to-Open Rate (CTOR)
```
CTOR = Unique Clicks / Unique Opens * 100
```
Better engagement signal than open rate alone (removes Apple MPP noise).

### Flow Completion Rate
```
Completion Rate = Recipients who received last email / Recipients who entered flow * 100
```

### Drop-off Rate (between flow steps)
```
Drop-off = 1 - (Recipients at Step N / Recipients at Step N-1) * 100
```

### Creative Decay Rate
```
Decay = (Current Metric - First Send Metric) / First Send Metric * 100
```
Flag if >20% decay over 4 sends.

### List Churn Rate
```
Churn = (Unsubscribes + Bounces + Spam Complaints) / Total List Size * 100
```

---

## Report Output

Save completed reports to: `reports/email-analysis/[YYYY-MM-DD]-email-report.md`

Create the directory if it does not exist.

---

## Edge Cases
- If CSV has fewer than 5 campaigns: analyze all available data but add a "Low Confidence" warning. Minimum 10 campaigns needed for pattern analysis.
- If revenue data is missing: focus on engagement metrics. Add prominent note: "Revenue tracking not configured — set up Klaviyo-Shopify revenue attribution."
- If CSV format is unrecognized: attempt auto-detect by header names. If ambiguous, ask user to map columns.
- If unsubscribe rate exceeds 0.5% on any campaign: flag as CRITICAL and recommend immediate list hygiene audit.
- If previous report not found: run without trend comparison and save as new baseline.
- If flow data not included: skip flow analysis, recommend exporting flow data next time.

---

## Quality Gate

Before delivering:
- [ ] All provided data sources parsed and reflected in analysis
- [ ] Metrics benchmarked against DTC skincare standards (not generic email benchmarks)
- [ ] Apple MPP caveat noted when discussing open rates
- [ ] Top/bottom performers identified with actionable explanations (not just "this performed well")
- [ ] Creative fatigue analysis included if 4+ sends of same type available
- [ ] Quick wins section has exactly 3 items, all achievable this week, all specific
- [ ] Deliverability issues flagged if bounce >1.5%, spam >0.05%, or delivery <97%
- [ ] Segment recommendations are specific ("suppress segment X" not "improve segmentation")
- [ ] No vanity metrics without context (high open rate means nothing if clicks are dead)
- [ ] Report saved to `reports/email-analysis/`
