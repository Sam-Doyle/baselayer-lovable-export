# Email Strategist

**Designs complete email automation flows, segmentation strategy, and KPI framework for Base Layer Skin's DTC email program.**

Takes a flow request or "full program" directive and outputs production-ready automation blueprints — every email mapped with trigger, timing, subject line, content outline, CTA, and exit conditions.

## References — Auto-Load
Read and internalize before executing:
- `brand/references/voice/tone-rules.md`
- `brand/references/product/catalog.md`
- `brand/references/audience/icp-core.md`
- `brand/references/audience/segments.md`
- `brand/references/channels/email-specs.md`
- `brand/references/benchmarks/dtc-skincare.md`

## When NOT to Use
- For writing specific email copy and subject lines (use `/email-copywriter`)
- For building HTML email templates (use `/email-template-builder`)
- For analyzing past email campaign performance (use `/email-analyzer`)
- For content calendar planning across channels (use `/content-calendar`)
- For one-off campaign sends — write copy first (use `/email-copywriter` + `/email-template-builder`)

---

## Inputs

The user specifies a scope:

```
SCOPE:     full-program | single-flow
FLOW:      (single-flow only) — welcome | abandoned-cart | post-purchase | browse-abandonment |
           win-back | vip | replenishment | birthday
ESP:       Klaviyo (default) | Mailchimp
PRODUCT:   Performance Daily Face Cream (default — only SKU)
```

If the user says "build the whole email program" or similar, default to:
- Scope: full-program (all 8 flows + segmentation + KPIs)
- ESP: Klaviyo
- Product: Performance Daily Face Cream

---

## ICP — Hardcoded

Every flow targets:
- **Males 20-40** (skew 25-35)
- Active, time-conscious, performance-oriented
- Skeptical of traditional skincare marketing
- 0-1 products in current routine
- Responds to: efficiency, proof, directness
- Entry points: Meta ads (primary), organic search, referral
- Reading on mobile (70%+ of opens)
- Low tolerance for marketing fluff

---

## Brand Voice — Non-Negotiable

Key rules for email strategy:
- **Direct, confident, conversational.** Like a sharp friend who knows skincare.
- **Short. Punchy.** Respect their time. Every email earns its place in the inbox.
- **No flowery/feminine language.** No "curated", "elevated", "artisanal".
- **No emojis.** In subject lines, preview text, or body copy. Ever.
- **No exclamation marks in subject lines.**
- **Lead with value.** Every email teaches something or offers something. No "just checking in."
- **Masculine-neutral tone.** Confident, not aggressive. Not "bro" marketing.
- **Price anchoring.** "$38" and "founding price" are power phrases.
- **Social proof over claims.** "50 guys tested it. Zero refund requests." > "Best moisturizer ever."

---

## Anti-Patterns (Hard Rules)

These mistakes will destroy engagement for male 20-40 DTC. Avoid at all costs:

| Anti-Pattern | Why It Fails | Instead |
|-------------|-------------|---------|
| **Daily sends** | Men unsubscribe fast when overwhelmed. 2-3/week max, 1/week for non-buyers. | Space emails. Quality > quantity. |
| **Excessive discounting** | Trains customers to wait for sales. Destroys margin. Devalues the brand. | Discount only in abandoned cart (one-time), win-back (final email). Never in welcome flow. |
| **"Just checking in"** | Zero value. Men delete immediately. | Every email must teach, offer, or prove something. |
| **Long subject lines** | Truncated on mobile. Over 50 chars is waste. | Under 40 chars ideal. Under 50 max. |
| **Emojis in subject lines** | Spam signal for male audience. Brand violation. | Clean, direct copy only. |
| **Generic personalization** | "Hey {{first_name}}" as the only personalization is lazy. | Segment by behavior and entry point. |
| **All emails look the same** | Template fatigue. Brain stops registering them. | Vary layout, length, and format across flows. |
| **No plain-text variant** | Some men prefer plain text. Spam filters penalize HTML-only. | Always generate a plain-text version. |
| **Ignoring engagement signals** | Sending to dead subscribers hurts deliverability. | Sunset non-openers after 90 days. |

---

## Flow 1: Welcome Series

**Trigger:** Email signup (from Meta ad funnel, popup, footer form, or checkout)
**Duration:** 14 days, 5-7 emails
**Goal:** Brand education → first purchase conversion
**Exit:** Purchase made (move to post-purchase flow)

| # | Day | Subject Line | Content | CTA | Notes |
|---|-----|-------------|---------|-----|-------|
| 1 | 0 (immediate) | "You're in" | Brand intro. What Base Layer is. What to expect from these emails. One product, one step, Breckenridge origin. | EXPLORE THE FORMULA | Set expectations. No discount. No hard sell. Deliverability matters — get this opened. |
| 2 | 1 | "Why one product beats five" | The simplicity argument. Pain point: most routines fail because they're too complex. Data: average man quits in 14 days. | SEE THE FORMULA | Educational. Builds the "why" before the "what." |
| 3 | 3 | "What 50 guys said after 30 days" | Social proof email. 3 testimonials. Star rating. Zero refund stat. | READ THEIR REVIEWS | Pure social proof. Let others sell for you. |
| 4 | 5 | "6 ingredients. Zero filler." | Ingredient breakdown. What each one does. Why no fragrance. Why no filler. Science credibility. | SEE FULL INGREDIENT LIST | Education builds trust. Men want to know what's in it. |
| 5 | 7 | "Engineered at 9,600 ft" | Origin story. Breckenridge. Altitude as proving ground. Colorado lifestyle angle. | GET EARLY ACCESS — $38 | First direct CTA to purchase. Day 7 = interested but undecided. |
| 6 | 10 | "The 15-second test" | Usage demonstration. How to apply. What to expect immediately, at 2 weeks, at 8 weeks. Results timeline. | TRY IT — $38 | Remove usage anxiety. Make it feel easy. |
| 7 | 14 | "Still thinking it over?" | Objection handling. FAQ format: What if it doesn't work? What skin types? How long does it last? 30-day guarantee reminder. | LOCK IN THE FOUNDING PRICE | Final welcome email. Soft urgency. Last chance before moving to regular cadence. |

**Conditional logic:**
- If opens email 1 but not 2 → resend email 2 with alternate subject line after 24h
- If clicks product link in any email → skip to email 5 (purchase CTA)
- If purchases → exit flow, enter post-purchase

---

## Flow 2: Abandoned Cart

**Trigger:** Product added to cart, no purchase within 1 hour
**Duration:** 3 emails over 3 days
**Goal:** Recover the sale
**Exit:** Purchase made OR 3 emails sent

| # | Delay | Subject Line | Content | CTA | Notes |
|---|-------|-------------|---------|-----|-------|
| 1 | 1 hour | "You left something behind" | Product image + name + price. No discount. Social proof line. Guarantee reminder. | COMPLETE YOUR ORDER | First nudge. No pressure. Most recoveries happen here. |
| 2 | 24 hours | "Still on the fence?" | Address top objection (greasy feel → "absorbs in 15 seconds"). One testimonial. Guarantee. | FINISH CHECKOUT | Objection handling. Still no discount. |
| 3 | 72 hours | "Last call — your cart expires" | Cart expiration urgency. Optional: 10% off or free shipping (ONLY if margin supports it and customer is first-time). | CLAIM YOUR ORDER | Final attempt. Light discount acceptable here. Not before. |

**Rules:**
- Never discount in email 1 or 2. Trains customers to abandon and wait.
- If the customer is a repeat buyer: skip the flow entirely (they know the product, they'll come back or they won't).
- Track recovery rate per email to identify which one converts.

---

## Flow 3: Post-Purchase

**Trigger:** Order confirmed
**Duration:** 4 emails over 30 days
**Goal:** Reduce buyer's remorse, build usage habit, earn a review, set up replenishment
**Exit:** Flow completion

| # | Delay | Subject Line | Content | CTA | Notes |
|---|-------|-------------|---------|-----|-------|
| 1 | Immediate | "Good call" | Order confirmation. Shipping timeline. What to expect. Usage instructions: "One pump. Clean, dry skin. 15 seconds." | TRACK YOUR ORDER | Reinforce the purchase. Reduce remorse. |
| 2 | 5 days (est. delivery) | "Day 1 with Base Layer" | Welcome to the product. Application tips. First-week expectations: immediate hydration, skin adjusting. | (no hard CTA — value only) | Set expectations so they don't judge too early. |
| 3 | 14 days | "Two weeks in — what you should notice" | Oil control kicking in. Pores appearing smaller. Matte finish holding longer. Ask: "How's it working for you?" | TELL US HOW IT'S GOING | Progress check. Prime for review. |
| 4 | 30 days | "Your honest take" | Review request. Direct: "We don't pay for reviews. We don't use influencers. Your honest feedback helps other guys decide." Link to review form. | LEAVE A REVIEW | Authentic review collection. Time with product = informed review. |

**Rules:**
- Never cross-sell or upsell in post-purchase flow (one SKU brand — stay focused).
- Email 2 and 3 are pure value. No selling.
- Review request goes to satisfied customers only (if NPS/survey data available, filter to promoters).

---

## Flow 4: Browse Abandonment

**Trigger:** Viewed product page 2+ times without adding to cart, within 7 days
**Duration:** 2 emails over 3 days
**Goal:** Move from interest to cart
**Exit:** Add to cart or purchase

| # | Delay | Subject Line | Content | CTA | Notes |
|---|-------|-------------|---------|-----|-------|
| 1 | 24 hours | "Checking this out?" | "You've been looking at [product]." Social proof: star rating + review count. Key benefit reminder. | SEE WHAT'S INSIDE | Acknowledge interest without being creepy. Light touch. |
| 2 | 72 hours | "Here's what 50 guys think" | Testimonial-led. 2-3 reviews. Address the hesitation: "Most guys wonder if it'll work for their skin type. It does." | TRY IT — $38 | Social proof to push past the fence. |

**Rules:**
- 2 emails max. Do not stalk.
- Exclude anyone who's already in the abandoned cart flow.
- Exclude existing customers.

---

## Flow 5: Win-Back

**Trigger:** No email opens in 60 days AND no site visit in 60 days
**Duration:** 3 emails over 21 days
**Goal:** Re-engage or clean the list
**Exit:** Re-engagement (open or click) OR unsubscribe OR sunset

| # | Delay | Subject Line | Content | CTA | Notes |
|---|-------|-------------|---------|-----|-------|
| 1 | Day 0 | "Been a while" | Short, direct. "We noticed you haven't been around. Here's what's new at Base Layer." Product update or new content. | COME BACK | No discount. Just a nudge. |
| 2 | Day 7 | "Miss us? Honest question." | Self-aware tone. "If you're over it, no hard feelings. Hit unsubscribe. If not, here's [value offer]." | STAY ON THE LIST | Give them an easy out. Respect their choice. |
| 3 | Day 21 | "Last email from us" | Final attempt. Optional: 15% off comeback order. "This is our last email unless you tell us otherwise." | ONE LAST LOOK — 15% OFF | Discount acceptable as final re-engagement tool. Makes the offer real. |

**Post-flow:**
- If no engagement across all 3: suppress from all sends for 90 days
- After 90-day suppression: move to sunset list (only receive 1 email/quarter)
- If still no engagement after 180 days total: unsubscribe permanently (protects deliverability)

---

## Flow 6: VIP / Loyalty

**Trigger:** 2+ purchases OR total spend > $100 OR referred a friend
**Duration:** Ongoing (event-driven, not time-based)
**Goal:** Retain high-value customers, encourage advocacy
**Exit:** None (ongoing)

| Email | Trigger | Subject Line | Content | CTA |
|-------|---------|-------------|---------|-----|
| VIP Welcome | Qualifies for VIP | "You're one of us now" | Welcome to inner circle. What VIP gets: early access, exclusive content, founding member recognition. | (no CTA — recognition only) |
| Early Access | New product/batch | "First look — before anyone else" | Product preview or pre-order access, 24-48 hours before public launch. | GET EARLY ACCESS |
| Anniversary | 1-year anniversary | "One year of Base Layer" | Celebrate the milestone. Usage stats if available. Thank them. Optional: gift with next order. | ORDER AGAIN |
| Referral Ask | 30 days post-2nd purchase | "Know someone who'd get it?" | Referral program intro. "Give $10, get $10" or equivalent. | SHARE YOUR LINK |

**Rules:**
- VIP emails are rare and high-signal. Max 2/month even for VIPs.
- No discounting for VIPs. Give them access and recognition instead.
- Referral ask goes to satisfied repeat buyers only.

---

## Flow 7: Replenishment

**Trigger:** Purchase date + estimated usage duration
**Duration:** 2 emails timed to product lifecycle
**Goal:** Drive repeat purchase before they run out
**Exit:** Reorder or 2 emails sent

**Product Lifecycle: Performance Daily Face Cream**
- Bottle size: 50 mL
- Estimated usage: 6-8 weeks (42-56 days)
- First reminder: Day 35 (one week before earliest empty)
- Second reminder: Day 49 (one week before latest empty)

| # | Day | Subject Line | Content | CTA | Notes |
|---|-----|-------------|---------|-----|-------|
| 1 | 35 | "Running low?" | "If you've been using Base Layer daily, you're about a week out. Don't go back to whatever you were using before." One-click reorder. | REORDER NOW | Timed to catch them before they run out. |
| 2 | 49 | "Don't break the streak" | "Consistency is where the results happen. Week 6-8 is when anti-aging benefits really show. Keep going." Reorder link. | KEEP IT GOING | Last nudge. Ties reorder to results momentum. |

**Rules:**
- Calculate send dates from order fulfillment date, not order date.
- If they reorder before reminder 1: skip the flow.
- If they haven't opened a reminder in 3 cycles: stop sending (they found another product or stopped using).
- Track reorder rate per reminder to optimize timing.

---

## Flow 8: Birthday

**Trigger:** Birthday date (collected via profile or survey)
**Duration:** 1 email
**Goal:** Personal connection + small incentive
**Exit:** Single send

| # | Timing | Subject Line | Content | CTA |
|---|--------|-------------|---------|-----|
| 1 | Birthday morning (8am local) | "It's your day" | Short and direct. "Happy birthday. Here's something from us." Free shipping on next order OR $5 off. No pressure. | TREAT YOURSELF |

**Rules:**
- One email only. Not a "birthday week" blast.
- Small incentive. Not a deep discount.
- If no birthday data: skip. Don't ask for it in a dedicated email (too intrusive for male audience).

---

## Segmentation Strategy

### Primary Segments

| Segment | Definition | Use Case |
|---------|-----------|----------|
| **New Subscribers** | Signed up in last 14 days, no purchase | Welcome flow. Nurture-focused. |
| **Prospects** | Subscriber 14+ days, no purchase | Educational content. Soft CTAs. Monthly cadence. |
| **First-Time Buyers** | 1 purchase, <90 days ago | Post-purchase flow → replenishment flow. |
| **Repeat Buyers** | 2+ purchases | VIP consideration. Referral asks. |
| **Lapsed Prospects** | No open in 60 days, no purchase | Win-back flow. |
| **Lapsed Customers** | Purchased 90+ days ago, no reorder | Replenishment reminder → win-back. |
| **VIP** | 2+ purchases OR $100+ lifetime value | VIP flow. Early access. |

### Secondary Segments (Behavioral)

| Segment | Definition | Use Case |
|---------|-----------|----------|
| **Engaged Non-Buyers** | Opens 50%+ of emails, no purchase | Retargeting audiences. Discount-eligible. |
| **Click-Happy** | Clicks links but doesn't buy | Likely price-sensitive. Highlight guarantee and value. |
| **One-and-Done** | Purchased once, 90+ days ago, no reorder | Win-back with product reminder. |
| **Referrers** | Has used referral link | Advocate. VIP fast-track. |

### Entry Point Segments

| Segment | Source | Behavior Difference |
|---------|--------|-------------------|
| **Meta Cold Traffic** | Instagram/Facebook ad | Needs more education. Skeptical. |
| **Organic Search** | Google | Already searching for solution. Closer to purchase. |
| **Referral** | Friend/link | High trust. Fast conversion. |
| **Blog Reader** | Content → email capture | Values education. Slower funnel. |

### Skin Concern Segments (if collected)

| Segment | Tag | Content Strategy |
|---------|-----|-----------------|
| **Oily Skin** | skin:oily | Lead with matte finish, oil control, niacinamide |
| **Dry Skin** | skin:dry | Lead with hydration, barrier repair, squalane |
| **Aging Concerns** | skin:aging | Lead with peptides, collagen, results timeline |
| **Sensitive** | skin:sensitive | Lead with fragrance-free, centella, gentle formula |
| **General/Unknown** | skin:unknown | Default messaging. Simplicity angle. |

---

## KPI Targets

### DTC Skincare Benchmarks (Male 20-40 Audience)

| Metric | Target | Good | Excellent |
|--------|--------|------|-----------|
| **Overall open rate** | 25-30% | 35% | 40%+ |
| **Overall click rate** | 2-3% | 4% | 5%+ |
| **Welcome flow open rate** | 40-50% | 55% | 60%+ |
| **Welcome flow click rate** | 5-8% | 10% | 12%+ |
| **Abandoned cart recovery rate** | 5-8% | 10% | 15%+ |
| **Unsubscribe rate per send** | <0.3% | <0.2% | <0.1% |
| **Spam complaint rate** | <0.08% | <0.05% | <0.02% |
| **Revenue per recipient (flows)** | $1.50-3.00 | $4.00 | $6.00+ |
| **Revenue per recipient (campaigns)** | $0.10-0.30 | $0.50 | $1.00+ |
| **List growth rate (monthly)** | 5-10% | 15% | 20%+ |
| **Replenishment reorder rate** | 20-30% | 35% | 45%+ |
| **Win-back re-engagement** | 5-10% | 15% | 20%+ |
| **Email-attributed revenue %** | 25-30% | 35% | 40%+ |

### Flow-Specific KPIs

| Flow | Primary KPI | Target |
|------|------------|--------|
| Welcome | Conversion to first purchase | 8-12% within 14 days |
| Abandoned Cart | Cart recovery rate | 10-15% |
| Post-Purchase | Review submission rate | 15-20% |
| Browse Abandonment | Add-to-cart rate | 3-5% |
| Win-Back | Re-engagement rate | 10-15% |
| Replenishment | Reorder rate | 30-40% |
| VIP | Referral activation | 5-10% |
| Birthday | Redemption rate | 20-30% |

---

## Deliverability Rules

Hardcoded rules to protect sender reputation:

1. **Max send frequency:** 3 emails/week for buyers, 2/week for prospects, 1/week for low engagement
2. **Sunset policy:** Suppress after 90 days of no opens. Unsubscribe after 180 days.
3. **Spam complaint threshold:** If >0.1% on any send, pause and investigate.
4. **Authentication:** SPF, DKIM, DMARC must be configured before any sends.
5. **Warm-up new domain:** Start with engaged segment only. Ramp volume 20%/day over 2 weeks.
6. **List hygiene:** Remove hard bounces immediately. Remove soft bounces after 5 consecutive.
7. **Plain-text version:** Every HTML email must have a plain-text alternative.
8. **Unsubscribe link:** Above the fold or in header. Not buried in footer gray text.

---

## Output Format

### Flow Blueprint Document

For each flow, output:

```markdown
# [Flow Name] — Email Automation Blueprint

## Flow Overview
- **Trigger:** [trigger event]
- **Duration:** [timeframe]
- **Emails:** [count]
- **Goal:** [primary conversion goal]
- **Exit conditions:** [when to remove from flow]

## Flow Diagram
[trigger] → (delay) → Email 1 → (delay) → Email 2 → ... → [exit]
         ↓ (if purchase)
         [exit to post-purchase]

## Email Details

### Email 1: [Name]
- **Delay:** [time from trigger]
- **Subject line:** "[subject]"
- **Alt subject:** "[alternate for A/B]"
- **Preview text:** "[preview]"
- **Content outline:**
  - [Section 1: what it covers]
  - [Section 2: what it covers]
  - [CTA placement and text]
- **CTA:** [text] → [URL]
- **Exit if:** [condition to skip remaining emails]

### Email 2: [Name]
...

## Conditional Logic
- [Condition] → [Action]
- [Condition] → [Action]

## KPIs
| Metric | Target |
|--------|--------|
| [metric] | [target] |
```

### Full Program Document

When `full-program` scope, output a master document:

```markdown
# Base Layer Skin — Email Program Blueprint

## Program Overview
- **ESP:** [Klaviyo/Mailchimp]
- **Total flows:** 8
- **Total automated emails:** [count]
- **Segments:** [count]
- **Estimated email-attributed revenue target:** 30%+ of total

## Flow Summary
| Flow | Trigger | Emails | Goal | Priority |
|------|---------|--------|------|----------|
| Welcome | Signup | 5-7 | First purchase | P0 — build first |
| Abandoned Cart | Cart abandon | 3 | Recovery | P0 — build first |
| Post-Purchase | Order confirmed | 4 | Review + retention | P1 |
| Replenishment | Day 35/49 post-purchase | 2 | Reorder | P1 |
| Browse Abandonment | 2+ product views | 2 | Add to cart | P2 |
| Win-Back | 60 days inactive | 3 | Re-engage | P2 |
| VIP | 2+ purchases | Ongoing | Retention + referral | P3 |
| Birthday | Birthday date | 1 | Personal touch | P3 |

## Implementation Priority
1. Welcome + Abandoned Cart (immediate revenue impact)
2. Post-Purchase + Replenishment (retention loop)
3. Browse Abandonment + Win-Back (recovery)
4. VIP + Birthday (loyalty layer)

## [Individual flow blueprints follow]
```

---

## Quality Gate

Before delivering the email strategy:

- [ ] All 8 flows defined with trigger, timing, subject, content, CTA, exit conditions
- [ ] Every subject line under 50 characters
- [ ] No emojis in any subject line or preview text
- [ ] No exclamation marks in subject lines
- [ ] Brand voice check: direct, confident, masculine-neutral
- [ ] Anti-patterns avoided: no daily sends, no excessive discounting, no "just checking in"
- [ ] Discount only appears in: abandoned cart email 3 (optional), win-back email 3, birthday
- [ ] Welcome flow has zero discounts
- [ ] Segmentation strategy covers: engagement level, purchase behavior, entry point, skin concern
- [ ] KPI targets set for every flow
- [ ] Deliverability rules documented
- [ ] Sunset policy defined (90-day suppress, 180-day remove)
- [ ] Conditional logic defined per flow (skip, exit, branch)
- [ ] Implementation priority order provided
- [ ] ESP-specific syntax noted (Klaviyo default)
- [ ] Plain-text version requirement noted

---

## Example Usage

**Full email program:**
```
/email-strategist full-program
```

**Single flow:**
```
/email-strategist single-flow welcome
```

**Specific ESP:**
```
/email-strategist full-program --esp mailchimp
```

**After reviewing existing flows:**
```
/email-strategist single-flow win-back — our current win-back has 12% open rate, need to improve
```
