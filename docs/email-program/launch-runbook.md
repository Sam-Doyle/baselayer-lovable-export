# Email-program launch runbook

This runbook controls changes to lifecycle email content, links, automation
logic, and frequency. It does not authorize deployment or activation by
itself. Written operator approval is required after every gate passes.

## Roles

| Role | Responsibility |
| --- | --- |
| Lifecycle operator | Brevo automation, timing, exits, frequency, seed sends |
| Commerce engineer | Shopify/Supabase authority, idempotency, consent, event shape |
| Creative reviewer | Brand, copy, mobile, accessibility, dark mode |
| Release approver | Reviews evidence and authorizes one controlled activation |

One person may perform multiple roles, but the release approver must review the
evidence after the operator completes it.

## Gate 0 — freeze and inventory

- Record the current active/inactive state of every Brevo automation, Shopify
  recovery sender, PushOwl sender, Shopify Flow, and commerce publisher.
- Export current Brevo automation definitions and templates.
- Confirm the seed list contains only approved internal addresses.
- Confirm historical held/audit rows will not be released.
- Assign one platform as the sole owner of cart recovery.

**Pass:** inventory is timestamped, recipients are explicit, and no customer
send is possible during QA.

## Gate 1 — repository checks

Run:

```bash
npm run test:email-program
npm test -- src/test/emailCampaign.test.ts src/test/EmailCampaignLanding.test.tsx src/test/cartStore.test.ts src/test/lifecycle.test.ts src/test/commerceLifecycle.test.ts src/test/commerceSignalJob.test.ts src/test/brevoSuppression.test.ts
npm run typecheck
```

When Brevo HTML has been exported:

```bash
npm run test:email-program -- --templates path/to/exported-html
```

**Pass:** all commands exit zero; manifest content IDs are unique; no exported
HTML exceeds 90 KB; every link and required element passes.

## Gate 2 — event and state acceptance

- Run every relevant row in `lifecycle-test-matrix.md` against the lifecycle QA
  store in audit mode.
- Run the remote SQL acceptance verifier twice with separate run IDs.
- Confirm synthetic fixtures are removed and external provider calls remain
  zero during SQL verification.
- Verify duplicate, out-of-order, consent chronology, email migration, lease
  fencing, provider uncertainty, refund, and subscription cases.

**Pass:** the matrix passes twice, queues return to the recorded quiescent
state, and no audit row is publishable.

## Gate 3 — Brevo automation logic

For each journey, capture entry, delays, branches, exits, re-entry, and global
exclusions. Verify:

- Welcome: immediate, day 2, day 5; purchase exit; re-entry off.
- Cart: configured restore delay and 20–24-hour objection step; purchase and
  empty-cart exits; newer-cart restart.
- Post-purchase: delivery-ready custom events; cancelled/refunded exclusion.
- Replenishment: single day 35 and two-pack day 77; active/uncertain
  subscription suppression; newer-order exit.
- No obsolete `order_created` workflow or second internal 35/77-day delay.
- Frequency: no marketing within 20 hours and no more than three in seven days.

**Pass:** all branches agree with the matrix and only one sender owns each job.

## Gate 4 — delivered-message QA

Send one production-format test per message to the seed address only. Do not
bulk-trigger a flow to test multiple templates.

- Confirm subject and preheader are separate and correctly rendered.
- Test Gmail desktop/mobile, Apple Mail, Outlook, dark mode, and image-off.
- Click every CTA from the delivered message.
- Verify offer, anchor, discount, restored cart, and quiz suppression.
- Inspect Gmail raw source for aligned SPF/DKIM/DMARC and one-click unsubscribe.
- Complete a visible unsubscribe and prove it suppresses immediately.
- Confirm the recipient list and exact send count.

**Pass:** every message has an evidence bundle and zero unintended recipients.

## Gate 5 — measurement readiness

- Confirm Brevo delivery/click exports contain message and automation IDs.
- Confirm UTMs arrive at the storefront and survive Shopify checkout.
- Trace one seed order from link click → storefront session → Shopify paid
  order → Supabase receipt → Brevo exit.
- Calculate one KPI row using the formulas in `kpi-dashboard.md`.
- Separate click-confirmed revenue from entrant conversion and Brevo's own
  attributed-revenue report.

**Pass:** one order traces end to end without duplicated credit.

## Gate 6 — controlled activation

Activation order:

1. Welcome and cart for newly entering contacts only.
2. Observe 72 hours.
3. Post-purchase for newly qualifying orders only.
4. Observe seven days.
5. Replenishment for newly qualifying orders only.

Require written approval at each numbered step. Do not backfill contacts, old
orders, or held events. Monitor the first ten entrants individually.

**Pass:** no stop condition occurs and KPI data reconcile daily.

## Rollback

For any stop condition:

1. Deactivate the affected Brevo automation.
2. Return the commerce publisher to audit mode if authority or duplication is
   uncertain.
3. Do not replay held or delivery-uncertain rows.
4. Record exact recipient, provider message ID, source event, and timestamps.
5. Suppress any unsafe pending entries.
6. Fix in QA, rerun the failed row and its neighboring scenarios twice, then
   restart from the previous gate.

## Release pass/fail summary

The program may launch only when all are true:

- Repository, manifest, template, and type checks pass.
- Acceptance matrix passes twice.
- Zero duplicate or unintended-recipient sends.
- Zero marketing after purchase exit, unsubscribe, full refund, or cancellation.
- Exact cart restoration passes for single, two-pack, and subscription.
- Frequency collision scenarios pass.
- Authentication, unsubscribe, rendering, and accessibility checks pass.
- One order traces from email click to Shopify/Supabase/Brevo without duplicate
  attribution.
- Release approver provides written approval.
