# Email KPI dashboard

Use Shopify-confirmed economics and Brevo delivery facts. Opens are diagnostic
only and do not determine winners or automation branches.

## Dashboard grain

Every row is one calendar day × journey × message ID × audience/offer. Keep
mailbox provider and skin concern as drill-down dimensions, not top-line rows.

Required dimensions:

- Date and local timezone.
- Journey and message ID from the manifest.
- Automation/version ID.
- Audience: lead, cart, first buyer, repeat buyer, subscriber state.
- Offer: single, two-pack, subscription, or none.
- Skin concern where known.
- Mailbox provider.

## Metric definitions

| Metric | Formula | Decision use |
| --- | --- | --- |
| Eligible entrants | Distinct authoritative entry keys after consent/state exclusions | Denominator for journey performance |
| Sent | Provider-accepted sends | Operational volume only |
| Delivered | Sent minus hard and soft bounces | Denominator for content performance |
| Delivery rate | Delivered / sent | Deliverability guardrail |
| Unique human click rate | Bot-filtered unique recipients clicking / delivered | Intent diagnostic |
| Click-confirmed orders | Distinct Shopify paid orders within seven days of latest eligible click | Primary direct-response conversion |
| Entrant conversion rate | Distinct paid converters in journey window / eligible entrants | Journey outcome, not causal lift |
| Cart recovery rate | Distinct abandoned carts followed by paid order within 72 hours / eligible abandoned carts | Cart program outcome |
| Net revenue | Paid product revenue minus discounts and product refunds; report shipping/tax separately | Economic numerator |
| Contribution | Net revenue minus COGS, outbound shipping, payment fees, and refund loss | Primary value measure |
| Contribution per entrant | Contribution / eligible entrants | Primary cross-flow comparison |
| Revenue per delivered | Net revenue / delivered | Content/offer efficiency |
| Unsubscribe rate | Unique unsubscribes / delivered | Pressure guardrail |
| Complaint rate | Unique complaints / delivered | Immediate safety guardrail |
| Duplicate-send incidents | Contacts receiving the same message ID more than once for one entry key | Must remain zero |
| Exit latency | Purchase/withdrawal timestamp to pre-purchase journey exit timestamp | Must remain under five minutes |
| Frequency collisions | Contacts receiving >1 marketing email in 20h or >3 in 7d | Must remain zero |

Do not combine platform-reported attributed revenue with Shopify-confirmed
revenue. Display it in a separate diagnostic column labeled `Brevo 48h model`.

## Operating thresholds

| Metric | Healthy | Investigate | Pause |
| --- | ---: | ---: | ---: |
| Delivery rate | >=99% | <98.5% | <98% |
| Hard bounce | <0.5% | >=1% | >=2% |
| Complaint rate | <0.05% | >=0.05% | >=0.1% |
| Unsubscribe rate | <0.3% | >=0.5% | >=1% |
| Duplicate sends | 0 | — | Any |
| Marketing after unsubscribe/refund | 0 | — | Any |
| Exit latency | <5 minutes | >=5 minutes | Any recovery after purchase |
| Frequency collisions | 0 | Any isolated case | Repeated or systemic |

At Base Layer's current volume, investigate every complaint and duplicate even
when the percentage appears small.

## Day 0 baseline

Before changing content, capture the previous 30 days where available:

- Entrants, sends, delivery, bounces, complaints, and unsubscribes by active
  automation.
- Unique human clicks and Shopify-paid orders.
- Gross/net revenue, discounts, refunds, COGS, shipping, and payment fees.
- Duplicate and frequency-collision incidents.
- Current authenticated-domain and mailbox-provider status.

If a field is unavailable, label it `not instrumented`; do not substitute a
proxy without documenting it.

## Day 30 review

Goal: prove measurement and customer safety.

- Reconcile eligible entrants, Brevo entries, sends, and deliveries daily.
- Trace at least five orders end to end or every order if fewer than five.
- Confirm zero duplicate, stale, or suppressed sends.
- Establish baseline contribution per entrant for welcome, cart, and
  replenishment.
- Review every unsubscribe and complaint by message and mailbox provider.

Do not run a creative winner test until the measurement reconciliation is
stable.

## Day 60 review

Goal: run one sequential improvement.

- Select one variable with the largest evidenced bottleneck: cart delay,
  concern-specific education, proof placement, or replenishment timing.
- Freeze every other variable.
- Compare Shopify-confirmed contribution per entrant and guardrails against the
  prior period.
- Require approximately 200 delivered recipients per treatment or 20
  conversions before treating the result as directional; otherwise continue.

Do not select a winner using opens.

## Day 90 review

Goal: decide whether email is creating profitable retention.

- Compare 90-day contribution per lead and per first-time buyer.
- Measure first repeat-purchase rate, days to repeat, subscription conversion,
  first renewal, refunds, cancellations, and support contacts.
- Compare one-bottle, two-pack, and subscription cohorts.
- Decide whether to expand browse/winback, adjust cadence, or keep the program
  deliberately narrow.
- Archive losing creative and document the next single-variable test.

## Weekly operator view

Keep one screen with:

1. Safety: complaints, bounces, unsubscribes, duplicates, collisions.
2. Funnel: entrants → delivered → human clicks → paid orders.
3. Economics: net revenue and contribution per entrant.
4. Lifecycle: purchase exits, refund/subscription suppression, replenishment
   eligibility.
5. Data quality: unmatched events, missing UTMs, duplicate credit, unknown
   consent, and unknown subscription states.
