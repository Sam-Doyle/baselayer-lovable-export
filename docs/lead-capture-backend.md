# Lead capture backend

The skin quiz uses Supabase as the durable system of record and Brevo as the
system of engagement. The browser calls only `email-subscribe`; it never writes
marketing tables directly.

## Data model

- `marketing_leads`: one normalized row per lowercase email. `first_source`
  and `first_attribution` are immutable; the latest touchpoint updates the
  corresponding `last_*` fields.
- `marketing_consents`: append-only evidence containing the exact disclosure,
  version, source, browser capture time, server receive time, and request
  origin. Existing waitlist rows are not retroactively labeled as consented.
- `marketing_lead_events`: append-only acquisition/event ledger.
- `marketing_sync_outbox`: idempotent Brevo contact upserts with exponential
  backoff, stale-lock recovery, and a six-attempt dead-letter state.
- `marketing_capture_rate_limits`: salted one-way request-key buckets. Raw IP
  addresses are never stored.

All five tables have RLS enabled and no browser policy. The service-role Edge
Functions are their only writers. Legacy `waitlist` and `survey_responses`
remain intact for a rolling deploy and historical reference.

## Browser contract

`POST /functions/v1/email-subscribe`:

```json
{
  "request_version": 2,
  "submission_id": "09b3f156-9005-4dcc-b821-79ee70a4f90f",
  "email": "customer@example.com",
  "concern": "shine",
  "source": "skin_concern_quiz",
  "discount_code": "SKIN15",
  "attribution": {
    "first_source": "facebook",
    "last_source": "skin_concern_quiz",
    "utm_source": "facebook",
    "utm_medium": "paid_social",
    "utm_campaign": "launch",
    "utm_content": "creative-4",
    "utm_term": null,
    "landing_path": "/face-cream",
    "referrer": "facebook.com"
  },
  "consent": {
    "version": "skin-quiz-email-v1",
    "text": "By signing up, you agree to receive Base Layer emails. Unsubscribe anytime. See our Privacy Policy.",
    "captured_at": "2026-08-17T16:59:59.000Z",
    "source": "skin_concern_quiz"
  },
  "client": {
    "honeypot": "",
    "form_started_at": 1786985994000
  }
}
```

`submission_id` is the idempotency key for the event, consent, and Brevo
outbox records. Canonical concern values are `dryness`, `shine`, `irritation`,
and `texture`; never replace them with presentation labels.

A `200` response with `success: true` means Supabase has durably accepted the
lead. `sync_status: pending` means the Brevo retry worker owns delivery;
`sync_status: failed` means the lead is safe but an operator must correct a
permanent provider/configuration error. The browser must not resubmit either
status. Validation, origin, rate-limit, or database failures return non-2xx JSON
with `success: false`.

## Brevo contact attributes

Create these exact attributes **before** deploying the Edge Function. An
unknown attribute can make Brevo reject the whole upsert.

| Name | Brevo type | Value |
|---|---|---|
| `SOURCE` | Text | Backward-compatible alias of latest source |
| `FIRST_SOURCE` | Text | Immutable first acquisition source |
| `LAST_SOURCE` | Text | Latest capture touchpoint |
| `SKIN_CONCERN` | Text | One of the four canonical IDs |
| `DISCOUNT_CODE` | Text | `SKIN15` for this capture |
| `SIGNUP_AT` | Date | First capture date, UTC |
| `LAST_SIGNUP_AT` | Date | Latest capture date, UTC |
| `CONSENT_AT` | Date | Latest recorded consent date, UTC; exact time remains in Supabase |
| `CONSENT_VERSION` | Text | Disclosure version |
| `UTM_SOURCE` | Text | First-touch value |
| `UTM_MEDIUM` | Text | First-touch value |
| `UTM_CAMPAIGN` | Text | First-touch value |
| `UTM_CONTENT` | Text | First-touch value |
| `UTM_TERM` | Text | First-touch value |
| `LAST_UTM_SOURCE` | Text | Latest-touch value |
| `LAST_UTM_MEDIUM` | Text | Latest-touch value |
| `LAST_UTM_CAMPAIGN` | Text | Latest-touch value |
| `LAST_UTM_CONTENT` | Text | Latest-touch value |
| `LAST_UTM_TERM` | Text | Latest-touch value |
| `LANDING_PATH` | Text | Latest capture path |

## Required configuration

Already present in the production Supabase project:

- `BREVO_API_KEY`
- `BREVO_LIST_ID`
- Supabase-provided URL and service-role secrets

Add:

- `EMAIL_SYNC_WORKER_SECRET`: the same randomly generated value in Supabase and
  Netlify. The Netlify scheduled function calls the service-only worker every
  15 minutes.
- `ALLOW_LEGACY_LEAD_CAPTURE=true`: temporary rollout flag. Change it to
  `false` immediately after the v2 site is live.
- `LEAD_RATE_LIMIT_SECRET`: recommended Supabase-only random salt. If absent,
  the service-role key is used as a non-exported fallback salt.
- `ALLOWED_ORIGINS`: optional comma-separated override. Defaults cover the
  production domains, scoped Base Layer Netlify previews, and local dev ports.

## Safe production rollout

Production is linked as `rymidvhuyxqvvyjpodqn`. The three historical SQL files
exist locally, while their tables exist remotely without migration-history
rows. A blind `supabase db push` would try to recreate them and fail.

1. Confirm the linked ref and verify the three remote legacy tables/columns.
   `supabase inspect db table-stats --linked` currently reports
   `analytics_events`, `waitlist`, and `survey_responses`.
2. Mark only the historical versions as applied; this changes migration
   history and does not execute their SQL:

   ```sh
   supabase migration repair 20260225002345 20260225011019 20260225040445 --status applied --linked
   ```

3. Run `supabase migration list --linked` and
   `supabase db push --linked --dry-run`. The dry run must list only
   `20260817170000_marketing_lead_capture.sql`.
4. Set `ALLOW_LEGACY_LEAD_CAPTURE=true` and both copies of
   `EMAIL_SYNC_WORKER_SECRET`; create all Brevo attributes.
5. Apply the new migration, then deploy `email-sync-worker` and
   `email-subscribe` with the explicit production project ref.
6. Submit one tagged test lead on production. Verify one lead, one consent, one
   event, a succeeded outbox job, and the canonical Brevo attributes.
7. Deploy/verify the v2 frontend, then set
   `ALLOW_LEGACY_LEAD_CAPTURE=false`.
8. Trigger the Netlify scheduled function manually once and verify it returns
   a successful zero-or-more job summary.

Do not drop the legacy tables during this rollout. After at least one stable
release, add a separate migration revoking their public insert policies; retain
the rows for audit/history until a documented retention policy says otherwise.

## Operational checks

Run in the Supabase SQL editor:

```sql
select status, count(*)
from public.marketing_sync_outbox
group by status
order by status;

select id, attempts, next_attempt_at, left(last_error, 120) as last_error
from public.marketing_sync_outbox
where status in ('pending', 'failed')
order by created_at desc
limit 25;

select
  count(*) as leads,
  count(*) filter (where skin_concern is not null) as profiled_leads
from public.marketing_leads;
```

Investigate any `failed` outbox row. After fixing configuration, explicitly
reset only the confirmed affected rows to `pending`; never bulk-resend all
succeeded jobs.

Brevo remains the authoritative send suppression list. Contact upserts never
set `emailBlacklisted: false`; this prevents the quiz from overriding prior
unsubscribes, spam complaints, or hard bounces. Supabase is the durable grant
ledger, not a bypass around provider suppression. Mirror revocations into
Supabase later with a verified Brevo webhook if a local current-consent view is
needed.
