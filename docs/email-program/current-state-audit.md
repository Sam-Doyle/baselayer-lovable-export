# Current email measurement and QA audit

Audit date: 2026-08-19. This is a repository audit only; no browser session or
live Brevo/Shopify setting was used as evidence.

## Implemented and covered

| Control | Evidence | Status |
| --- | --- | --- |
| Email-origin session | `captureEmailCampaignSession` keeps tab-scoped state and suppresses repeat quiz capture | Automated test passes |
| Allow-listed campaign discount | Only `SKIN15` may be activated from an email session | Automated test passes |
| Landing anchors | Only offer, formula, results, and reviews are accepted | Automated test passes |
| Checkout integrity | Stored email UTMs are appended without replacing Shopify's required key or existing source | Automated tests pass |
| Cart discount continuity | SKIN15 and SHIP26 are retained by new/existing carts | Automated tests pass |
| Consent fail-closed | Malformed Brevo blocklist responses do not become sendable | Automated tests pass |
| Commerce authority | Single/two-pack/subscription, refund type, consent, delivery, and duplicate Shopify events are normalized | Automated tests pass |
| Worker send-time gate | Brevo suppression and local lifecycle eligibility are rechecked before publish | Automated tests pass |
| SQL state machine | Existing remote verifier covers order, delivery, refund, subscription, consent, lease, and reconciliation scenarios | Environment-backed operator gate |

## Gaps found and disposition

| Gap | Risk | Disposition |
| --- | --- | --- |
| Link construction lived only in prose and Brevo | Silent campaign/content drift | Added machine-readable manifest and verifier |
| Static-link UTM rule conflicted with exact dynamic cart restoration | Operator could either lose attribution or corrupt the cart URL | Documented raw `params.url` exception; require unique Brevo click plus Shopify restored-cart measurement |
| No repository gate inspected rendered email HTML | Missing unsubscribe/address/CTA, empty alt text, or untracked links could ship | Added strict optional/default HTML scan integrated with the three master templates |
| Welcome cadence differs across legacy blueprint/operations documents | Frequency and copy version ambiguity | New program contract defines immediate/day 2/day 5; live Brevo must be reviewed before activation |
| Frequency precedence is not enforced by storefront code | Independent Brevo automations may collide | Manual launch gate and explicit collision matrix; requires Brevo configuration/evidence |
| No first-party dataset currently joins Brevo clicks to Shopify contribution | Cannot yet calculate causal profit from repository code alone | Exact event/data contract and 30/60/90 KPI definitions added; export/warehouse implementation remains operations work |
| Live templates and automations can drift after repository validation | Repository green does not prove Brevo green | Require exported HTML plus delivered seed test and automation screenshots on every release |
| Opens are available but unreliable | False winners from MPP/bots | Dashboard excludes opens from decisions and uses bot-filtered click/purchase economics |

## Not authorized by this package

- Enabling, disabling, or editing a Brevo automation.
- Publishing or replaying Supabase outbox jobs.
- Editing Shopify Flow, recovery, checkout, discount, or subscription settings.
- Adding production recipients or importing historical contacts.
- Claiming the lifecycle is production-safe without the full acceptance matrix
  and delivered-message evidence.

## Remaining operational blockers

Before activation or cadence expansion, an operator still must:

1. Export the actual Brevo HTML and pass `test:email-program` against it.
2. Align live automation timing and subject/preheader copy to the canonical
   message IDs.
3. Configure and prove purchase/refund/unsubscribe/subscription exits plus the
   20-hour and three-in-seven-day frequency rules.
4. Trace a seed click and order end to end.
5. Verify raw Gmail authentication and one-click unsubscribe headers.
6. Run the lifecycle matrix twice without any non-seed recipient.
