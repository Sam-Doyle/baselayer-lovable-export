-- Canonical marketing identity, consent evidence, and retryable provider sync.
--
-- This migration is intentionally additive. The production project's three
-- legacy tables predate Supabase migration history, and the currently deployed
-- client still writes to waitlist/survey_responses. Those tables and policies
-- stay untouched until the new Edge Function and frontend have both shipped.

create table if not exists public.marketing_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  first_source text not null,
  last_source text not null,
  skin_concern text,
  first_attribution jsonb not null default '{}'::jsonb,
  last_attribution jsonb not null default '{}'::jsonb,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketing_leads_normalized_email check (email = lower(btrim(email))),
  constraint marketing_leads_email_length check (length(email) between 3 and 254),
  constraint marketing_leads_source_length check (
    length(first_source) between 1 and 64 and length(last_source) between 1 and 64
  ),
  constraint marketing_leads_skin_concern check (
    skin_concern is null or skin_concern in ('dryness', 'shine', 'irritation', 'texture')
  )
);

create unique index if not exists marketing_leads_email_unique
  on public.marketing_leads (email);

create table if not exists public.marketing_consents (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.marketing_leads(id) on delete cascade,
  channel text not null default 'email',
  status text not null,
  consent_version text not null,
  consent_text text not null,
  source text not null,
  captured_at timestamptz not null,
  received_at timestamptz not null default now(),
  idempotency_key text not null,
  request_origin text,
  constraint marketing_consents_channel check (channel in ('email')),
  constraint marketing_consents_status check (status in ('granted', 'revoked')),
  constraint marketing_consents_version_length check (length(consent_version) between 1 and 64),
  constraint marketing_consents_text_length check (length(consent_text) between 1 and 1000),
  constraint marketing_consents_source_length check (length(source) between 1 and 64)
);

create unique index if not exists marketing_consents_idempotency_unique
  on public.marketing_consents (idempotency_key);
create index if not exists marketing_consents_lead_captured_idx
  on public.marketing_consents (lead_id, captured_at desc);

create table if not exists public.marketing_lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.marketing_leads(id) on delete cascade,
  event_type text not null,
  source text not null,
  properties jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  idempotency_key text not null,
  constraint marketing_lead_events_type_length check (length(event_type) between 1 and 64),
  constraint marketing_lead_events_source_length check (length(source) between 1 and 64)
);

create unique index if not exists marketing_lead_events_idempotency_unique
  on public.marketing_lead_events (idempotency_key);
create index if not exists marketing_lead_events_lead_occurred_idx
  on public.marketing_lead_events (lead_id, occurred_at desc);

create table if not exists public.marketing_sync_outbox (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.marketing_leads(id) on delete cascade,
  provider text not null default 'brevo',
  operation text not null default 'contact_upsert',
  payload jsonb not null,
  status text not null default 'pending',
  attempts integer not null default 0,
  max_attempts integer not null default 6,
  next_attempt_at timestamptz not null default now(),
  locked_at timestamptz,
  completed_at timestamptz,
  last_error text,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketing_sync_outbox_provider check (provider in ('brevo')),
  constraint marketing_sync_outbox_operation check (operation in ('contact_upsert')),
  constraint marketing_sync_outbox_status check (status in ('pending', 'processing', 'succeeded', 'failed')),
  constraint marketing_sync_outbox_attempts check (attempts >= 0 and max_attempts between 1 and 20)
);

create unique index if not exists marketing_sync_outbox_idempotency_unique
  on public.marketing_sync_outbox (idempotency_key);
create index if not exists marketing_sync_outbox_ready_idx
  on public.marketing_sync_outbox (next_attempt_at, created_at)
  where status in ('pending', 'processing');

create table if not exists public.marketing_capture_rate_limits (
  request_key text not null,
  bucket_started_at timestamptz not null,
  request_count integer not null default 1,
  updated_at timestamptz not null default now(),
  primary key (request_key, bucket_started_at),
  constraint marketing_capture_rate_limits_count check (request_count > 0)
);
create index if not exists marketing_capture_rate_limits_bucket_idx
  on public.marketing_capture_rate_limits (bucket_started_at);

alter table public.marketing_leads enable row level security;
alter table public.marketing_consents enable row level security;
alter table public.marketing_lead_events enable row level security;
alter table public.marketing_sync_outbox enable row level security;
alter table public.marketing_capture_rate_limits enable row level security;

-- These are service-only tables. Supabase's service role bypasses RLS; browser
-- clients receive no direct policies or table grants.
revoke all on table public.marketing_leads from anon, authenticated;
revoke all on table public.marketing_consents from anon, authenticated;
revoke all on table public.marketing_lead_events from anon, authenticated;
revoke all on table public.marketing_sync_outbox from anon, authenticated;
revoke all on table public.marketing_capture_rate_limits from anon, authenticated;

create or replace function public.capture_marketing_lead(
  p_submission_id uuid,
  p_email text,
  p_source text,
  p_skin_concern text,
  p_discount_code text,
  p_attribution jsonb,
  p_consent jsonb,
  p_occurred_at timestamptz,
  p_request_origin text
)
returns table (
  lead_id uuid,
  outbox_id uuid,
  sync_status text,
  should_sync boolean,
  sync_payload jsonb,
  duplicate boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead_id uuid;
  v_outbox_id uuid;
  v_existing_lead_id uuid;
  v_duplicate boolean := false;
  v_sync_status text;
  v_payload jsonb;
  v_should_sync boolean := false;
  v_first_source text := coalesce(nullif(p_attribution->>'first_source', ''), p_source);
  v_last_source text := coalesce(nullif(p_attribution->>'last_source', ''), p_source);
  v_consent_at timestamptz;
begin
  select id into v_existing_lead_id
  from public.marketing_leads
  where email = p_email;
  v_duplicate := found;

  insert into public.marketing_leads (
    email,
    first_source,
    last_source,
    skin_concern,
    first_attribution,
    last_attribution,
    first_seen_at,
    last_seen_at
  ) values (
    p_email,
    v_first_source,
    v_last_source,
    p_skin_concern,
    coalesce(p_attribution, '{}'::jsonb),
    coalesce(p_attribution, '{}'::jsonb),
    p_occurred_at,
    p_occurred_at
  )
  on conflict (email) do update set
    last_source = excluded.last_source,
    skin_concern = coalesce(excluded.skin_concern, marketing_leads.skin_concern),
    last_attribution = excluded.last_attribution,
    last_seen_at = greatest(marketing_leads.last_seen_at, excluded.last_seen_at),
    updated_at = now()
  returning id into v_lead_id;

  insert into public.marketing_lead_events (
    lead_id,
    event_type,
    source,
    properties,
    occurred_at,
    idempotency_key
  ) values (
    v_lead_id,
    'email_signup',
    p_source,
    jsonb_strip_nulls(jsonb_build_object(
      'skin_concern', p_skin_concern,
      'discount_code', p_discount_code,
      'attribution', p_attribution
    )),
    p_occurred_at,
    p_submission_id::text || ':event'
  )
  on conflict (idempotency_key) do nothing;

  if p_consent is not null then
    v_consent_at := (p_consent->>'captured_at')::timestamptz;
    insert into public.marketing_consents (
      lead_id,
      channel,
      status,
      consent_version,
      consent_text,
      source,
      captured_at,
      idempotency_key,
      request_origin
    ) values (
      v_lead_id,
      'email',
      'granted',
      p_consent->>'version',
      p_consent->>'text',
      p_consent->>'source',
      v_consent_at,
      p_submission_id::text || ':consent',
      p_request_origin
    )
    on conflict (idempotency_key) do nothing;
  end if;

  select jsonb_strip_nulls(jsonb_build_object(
    'email', ml.email,
    'first_source', ml.first_source,
    'last_source', ml.last_source,
    'skin_concern', ml.skin_concern,
    'discount_code', p_discount_code,
    'first_seen_at', ml.first_seen_at,
    'last_seen_at', ml.last_seen_at,
    'consent_at', p_consent->>'captured_at',
    'consent_version', p_consent->>'version',
    'utm_source', ml.first_attribution->>'utm_source',
    'utm_medium', ml.first_attribution->>'utm_medium',
    'utm_campaign', ml.first_attribution->>'utm_campaign',
    'utm_content', ml.first_attribution->>'utm_content',
    'utm_term', ml.first_attribution->>'utm_term',
    'last_utm_source', ml.last_attribution->>'utm_source',
    'last_utm_medium', ml.last_attribution->>'utm_medium',
    'last_utm_campaign', ml.last_attribution->>'utm_campaign',
    'last_utm_content', ml.last_attribution->>'utm_content',
    'last_utm_term', ml.last_attribution->>'utm_term',
    'landing_path', p_attribution->>'landing_path'
  )) into v_payload
  from public.marketing_leads ml
  where ml.id = v_lead_id;

  insert into public.marketing_sync_outbox (
    lead_id,
    payload,
    status,
    attempts,
    locked_at,
    idempotency_key
  ) values (
    v_lead_id,
    v_payload,
    'processing',
    1,
    now(),
    p_submission_id::text || ':brevo-contact-upsert'
  )
  on conflict (idempotency_key) do nothing
  returning id into v_outbox_id;

  if v_outbox_id is not null then
    v_should_sync := true;
    v_sync_status := 'processing';
  else
    select id, status into v_outbox_id, v_sync_status
    from public.marketing_sync_outbox
    where idempotency_key = p_submission_id::text || ':brevo-contact-upsert';
  end if;

  return query select
    v_lead_id,
    v_outbox_id,
    v_sync_status,
    v_should_sync,
    case when v_should_sync then v_payload else null end,
    v_duplicate;
end;
$$;

create or replace function public.check_marketing_capture_rate_limit(
  p_request_key text,
  p_max_requests integer default 10,
  p_window_minutes integer default 60
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bucket timestamptz;
  v_count integer;
begin
  if p_max_requests < 1 or p_window_minutes < 1 then
    return false;
  end if;
  v_bucket := to_timestamp(
    floor(extract(epoch from now()) / (p_window_minutes * 60)) * (p_window_minutes * 60)
  );
  -- The buckets are anti-abuse state, not analytics. Keep only a short window
  -- so hashed network identifiers do not accumulate indefinitely.
  delete from public.marketing_capture_rate_limits
  where bucket_started_at < now() - interval '48 hours';
  insert into public.marketing_capture_rate_limits (
    request_key,
    bucket_started_at,
    request_count
  ) values (
    p_request_key,
    v_bucket,
    1
  )
  on conflict (request_key, bucket_started_at) do update set
    request_count = marketing_capture_rate_limits.request_count + 1,
    updated_at = now()
  returning request_count into v_count;
  return v_count <= p_max_requests;
end;
$$;

create or replace function public.claim_marketing_sync_jobs(p_limit integer default 25)
returns table (
  id uuid,
  payload jsonb,
  attempts integer
)
language sql
security definer
set search_path = public
as $$
  with claimable as (
    select mso.id
    from public.marketing_sync_outbox mso
    where (
      (mso.status = 'pending' and mso.next_attempt_at <= now())
      or (mso.status = 'processing' and mso.locked_at < now() - interval '15 minutes')
    )
      and mso.attempts < mso.max_attempts
    order by mso.next_attempt_at, mso.created_at
    for update skip locked
    limit least(greatest(p_limit, 1), 100)
  )
  update public.marketing_sync_outbox mso
  set
    status = 'processing',
    attempts = mso.attempts + 1,
    locked_at = now(),
    updated_at = now()
  from claimable
  where mso.id = claimable.id
  returning mso.id, mso.payload, mso.attempts;
$$;

create or replace function public.complete_marketing_sync_job(
  p_outbox_id uuid,
  p_succeeded boolean,
  p_error text default null,
  p_retryable boolean default true
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
begin
  update public.marketing_sync_outbox
  set
    status = case
      when p_succeeded then 'succeeded'
      when p_retryable and attempts < max_attempts then 'pending'
      else 'failed'
    end,
    next_attempt_at = case
      when p_succeeded then next_attempt_at
      else now() + make_interval(mins => least(1440, (power(2, least(attempts, 10)))::integer))
    end,
    locked_at = null,
    completed_at = case when p_succeeded then now() else null end,
    last_error = case when p_succeeded then null else left(coalesce(p_error, 'Provider sync failed'), 1000) end,
    updated_at = now()
  where id = p_outbox_id
  returning status into v_status;
  return v_status;
end;
$$;

revoke all on function public.capture_marketing_lead(uuid, text, text, text, text, jsonb, jsonb, timestamptz, text) from public, anon, authenticated;
revoke all on function public.check_marketing_capture_rate_limit(text, integer, integer) from public, anon, authenticated;
revoke all on function public.claim_marketing_sync_jobs(integer) from public, anon, authenticated;
revoke all on function public.complete_marketing_sync_job(uuid, boolean, text, boolean) from public, anon, authenticated;

grant execute on function public.capture_marketing_lead(uuid, text, text, text, text, jsonb, jsonb, timestamptz, text) to service_role;
grant execute on function public.check_marketing_capture_rate_limit(text, integer, integer) to service_role;
grant execute on function public.claim_marketing_sync_jobs(integer) to service_role;
grant execute on function public.complete_marketing_sync_job(uuid, boolean, text, boolean) to service_role;

-- Backfill normalized identity only. We intentionally do not infer consent
-- evidence for old records because the exact copy/version was not persisted.
do $$
begin
  if to_regclass('public.waitlist') is not null then
    execute $backfill$
      insert into public.marketing_leads (
        email,
        first_source,
        last_source,
        first_attribution,
        last_attribution,
        first_seen_at,
        last_seen_at
      )
      select
        normalized_email,
        (array_agg(left(coalesce(nullif(source, ''), 'legacy_waitlist'), 64) order by created_at asc))[1],
        (array_agg(left(coalesce(nullif(source, ''), 'legacy_waitlist'), 64) order by created_at desc))[1],
        '{}'::jsonb,
        '{}'::jsonb,
        min(created_at),
        max(created_at)
      from (
        select lower(btrim(email)) as normalized_email, source, created_at
        from public.waitlist
        where email is not null
          and length(lower(btrim(email))) between 3 and 254
          and lower(btrim(email)) ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]{2,}$'
      ) legacy
      group by normalized_email
      on conflict (email) do nothing
    $backfill$;

    insert into public.marketing_lead_events (
      lead_id,
      event_type,
      source,
      properties,
      occurred_at,
      idempotency_key
    )
    select
      ml.id,
      'legacy_import',
      'legacy_waitlist',
      '{}'::jsonb,
      ml.first_seen_at,
      'legacy:' || ml.id::text
    from public.marketing_leads ml
    on conflict (idempotency_key) do nothing;
  end if;

  if to_regclass('public.survey_responses') is not null then
    execute $backfill_concern$
      with latest_concern as (
        select distinct on (lower(btrim(waitlist_email)))
          lower(btrim(waitlist_email)) as email,
          case lower(btrim(biggest_issue))
            when 'dry / tight' then 'dryness'
            when 'oily / shiny' then 'shine'
            when 'red / irritated' then 'irritation'
            when 'texture / fine lines' then 'texture'
            when 'dryness' then 'dryness'
            when 'shine' then 'shine'
            when 'irritation' then 'irritation'
            when 'texture' then 'texture'
            else null
          end as skin_concern
        from public.survey_responses
        where waitlist_email is not null
        order by lower(btrim(waitlist_email)), created_at desc
      )
      update public.marketing_leads ml
      set skin_concern = lc.skin_concern,
          updated_at = now()
      from latest_concern lc
      where ml.email = lc.email
        and lc.skin_concern is not null
        and ml.skin_concern is null
    $backfill_concern$;
  end if;
end;
$$;
