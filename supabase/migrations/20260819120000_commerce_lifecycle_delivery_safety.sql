-- Close the production-safety gaps found by the adversarial lifecycle audit:
-- chronological consent, customer-email migration, fenced worker leases,
-- send-time shop allowlisting, and at-most-once provider dispatch.

alter table public.commerce_customer_state
  add column if not exists marketing_consent_observed_at timestamptz;

update public.commerce_customer_state
set marketing_consent_observed_at = coalesce(updated_at, created_at)
where marketing_consent_state <> 'unknown'
  and marketing_consent_observed_at is null;

alter table public.commerce_lifecycle_outbox
  add column if not exists lease_token uuid,
  add column if not exists dispatch_started_at timestamptz;

alter table public.commerce_lifecycle_outbox
  drop constraint if exists commerce_outbox_status;

alter table public.commerce_lifecycle_outbox
  add constraint commerce_outbox_status check (
    status in (
      'held', 'pending', 'processing', 'succeeded', 'failed',
      'suppressed', 'cancelled', 'delivery_uncertain'
    )
  );

create or replace function public.reconcile_commerce_customer_identity(
  p_shop_domain text,
  p_customer_id text,
  p_email text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old public.commerce_customer_state%rowtype;
  v_target public.commerce_customer_state%rowtype;
  v_target_found boolean := false;
  v_projection_conflict boolean := false;
begin
  if p_customer_id is null or p_email is null then
    return;
  end if;

  select * into v_old
  from public.commerce_customer_state cs
  where cs.shop_domain = p_shop_domain
    and cs.customer_id = p_customer_id
  for update;

  if not found or v_old.email = p_email then
    return;
  end if;

  select * into v_target
  from public.commerce_customer_state cs
  where cs.shop_domain = p_shop_domain
    and cs.email = p_email
  for update;
  v_target_found := found;

  if v_target_found
    and v_target.customer_id is not null
    and v_target.customer_id <> p_customer_id then
    raise exception 'commerce_customer_identity_conflict';
  end if;

  update public.commerce_orders
  set email = p_email,
      customer_id = coalesce(customer_id, p_customer_id),
      updated_at = now()
  where shop_domain = p_shop_domain
    and (customer_id = p_customer_id or email = v_old.email);

  update public.commerce_lifecycle_outbox
  set email = p_email,
      updated_at = now()
  where shop_domain = p_shop_domain
    and email = v_old.email;

  if not v_target_found then
    update public.commerce_customer_state
    set email = p_email,
        updated_at = now()
    where shop_domain = p_shop_domain
      and email = v_old.email;
    return;
  end if;

  v_projection_conflict :=
    v_target.subscription_projection_observed_at is not null
    and v_old.subscription_projection_observed_at is not null
    and v_target.subscription_projection_observed_at = v_old.subscription_projection_observed_at
    and v_target.subscription_projection is distinct from v_old.subscription_projection;

  -- Release the independently unique customer ID before assigning it to the
  -- merged target row.
  update public.commerce_customer_state
  set customer_id = null,
      updated_at = now()
  where shop_domain = p_shop_domain
    and email = v_old.email;

  update public.commerce_customer_state
  set customer_id = p_customer_id,
      marketing_consent_state = case
        when v_old.marketing_consent_observed_at > v_target.marketing_consent_observed_at
          then v_old.marketing_consent_state
        when v_old.marketing_consent_observed_at < v_target.marketing_consent_observed_at
          then v_target.marketing_consent_state
        when v_old.marketing_consent_state = 'unsubscribed'
          or v_target.marketing_consent_state = 'unsubscribed' then 'unsubscribed'
        when v_old.marketing_consent_state = 'not_subscribed'
          or v_target.marketing_consent_state = 'not_subscribed' then 'not_subscribed'
        when v_old.marketing_consent_state = 'pending'
          or v_target.marketing_consent_state = 'pending' then 'pending'
        when v_old.marketing_consent_state = 'subscribed'
          or v_target.marketing_consent_state = 'subscribed' then 'subscribed'
        else 'unknown'
      end,
      marketing_consent_observed_at = greatest(
        v_target.marketing_consent_observed_at,
        v_old.marketing_consent_observed_at
      ),
      order_count = v_target.order_count + v_old.order_count,
      last_order_id = case
        when v_target.last_order_at is null
          or v_old.last_order_at > v_target.last_order_at then v_old.last_order_id
        else v_target.last_order_id
      end,
      last_order_at = greatest(v_target.last_order_at, v_old.last_order_at),
      last_order_bottle_count = case
        when v_target.last_order_at is null
          or v_old.last_order_at > v_target.last_order_at then v_old.last_order_bottle_count
        else v_target.last_order_bottle_count
      end,
      last_order_is_subscription = case
        when v_target.last_order_at is null
          or v_old.last_order_at > v_target.last_order_at then v_old.last_order_is_subscription
        else v_target.last_order_is_subscription
      end,
      last_fulfilled_at = greatest(v_target.last_fulfilled_at, v_old.last_fulfilled_at),
      last_delivered_at = greatest(v_target.last_delivered_at, v_old.last_delivered_at),
      last_refunded_at = greatest(v_target.last_refunded_at, v_old.last_refunded_at),
      has_subscription_order = v_target.has_subscription_order or v_old.has_subscription_order,
      last_subscription_order_at = greatest(
        v_target.last_subscription_order_at,
        v_old.last_subscription_order_at
      ),
      last_subscription_plan_id = case
        when v_target.last_subscription_order_at is null
          or v_old.last_subscription_order_at > v_target.last_subscription_order_at
          then v_old.last_subscription_plan_id
        else v_target.last_subscription_plan_id
      end,
      subscription_projection = case
        when v_projection_conflict then 'unknown_conflict'
        when v_target.subscription_projection_observed_at is null
          or v_old.subscription_projection_observed_at > v_target.subscription_projection_observed_at
          then v_old.subscription_projection
        else v_target.subscription_projection
      end,
      subscription_projection_observed_at = greatest(
        v_target.subscription_projection_observed_at,
        v_old.subscription_projection_observed_at
      ),
      subscription_tag_count = case
        when v_projection_conflict then 2
        when v_target.subscription_projection_observed_at is null
          or v_old.subscription_projection_observed_at > v_target.subscription_projection_observed_at
          then v_old.subscription_tag_count
        else v_target.subscription_tag_count
      end,
      replenishment_blocked = v_target.replenishment_blocked
        or v_old.replenishment_blocked
        or v_projection_conflict,
      lifecycle_hold_until = greatest(v_target.lifecycle_hold_until, v_old.lifecycle_hold_until),
      lifecycle_hard_exit = v_target.lifecycle_hard_exit or v_old.lifecycle_hard_exit,
      lifecycle_hard_exit_at = greatest(v_target.lifecycle_hard_exit_at, v_old.lifecycle_hard_exit_at),
      created_at = least(v_target.created_at, v_old.created_at),
      updated_at = now()
  where shop_domain = p_shop_domain
    and email = p_email;

  delete from public.commerce_customer_state
  where shop_domain = p_shop_domain
    and email = v_old.email;
end;
$$;

-- Keep the already-deployed projection function as an internal implementation.
alter function public.record_commerce_lifecycle_signal(jsonb, boolean)
  rename to record_commerce_lifecycle_signal_v1;

create or replace function public.record_commerce_lifecycle_signal(
  p_signal jsonb,
  p_publish_enabled boolean default false
)
returns table (
  receipt_id uuid,
  duplicate boolean,
  outbox_status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_shop text := lower(p_signal->>'shop_domain');
  v_email text := lower(nullif(btrim(p_signal->>'email'), ''));
  v_customer_id text := nullif(p_signal->>'customer_id', '');
  v_consent text := coalesce(nullif(p_signal->>'marketing_consent_state', ''), 'unknown');
  v_occurred_at timestamptz := (p_signal->>'occurred_at')::timestamptz;
  v_sanitized_signal jsonb;
begin
  -- A Shopify retry must remain a no-op even if its body differs unexpectedly.
  if exists (
    select 1
    from public.commerce_lifecycle_receipts clr
    where clr.source = p_signal->>'source'
      and clr.shop_domain = v_shop
      and clr.topic = p_signal->>'topic'
      and clr.source_event_id = p_signal->>'source_event_id'
  ) then
    return query
    select * from public.record_commerce_lifecycle_signal_v1(p_signal, p_publish_enabled);
    return;
  end if;

  perform public.reconcile_commerce_customer_identity(v_shop, v_customer_id, v_email);

  if v_email is not null and v_consent <> 'unknown' then
    insert into public.commerce_customer_state (
      shop_domain, email, customer_id, marketing_consent_state,
      marketing_consent_observed_at
    ) values (
      v_shop, v_email, v_customer_id, v_consent, v_occurred_at
    )
    on conflict (shop_domain, email) do update set
      customer_id = coalesce(excluded.customer_id, commerce_customer_state.customer_id),
      marketing_consent_state = case
        when commerce_customer_state.marketing_consent_observed_at is null
          or excluded.marketing_consent_observed_at > commerce_customer_state.marketing_consent_observed_at
          then excluded.marketing_consent_state
        when excluded.marketing_consent_observed_at < commerce_customer_state.marketing_consent_observed_at
          then commerce_customer_state.marketing_consent_state
        when commerce_customer_state.marketing_consent_state = 'unsubscribed'
          or excluded.marketing_consent_state = 'unsubscribed' then 'unsubscribed'
        when commerce_customer_state.marketing_consent_state = 'not_subscribed'
          or excluded.marketing_consent_state = 'not_subscribed' then 'not_subscribed'
        when commerce_customer_state.marketing_consent_state = 'pending'
          or excluded.marketing_consent_state = 'pending' then 'pending'
        else excluded.marketing_consent_state
      end,
      marketing_consent_observed_at = greatest(
        commerce_customer_state.marketing_consent_observed_at,
        excluded.marketing_consent_observed_at
      ),
      updated_at = now();
  end if;

  -- The wrapper above is the only writer of consent chronology. Passing
  -- unknown prevents the legacy state projection from overwriting it.
  v_sanitized_signal := jsonb_set(
    p_signal,
    '{marketing_consent_state}',
    to_jsonb('unknown'::text),
    true
  );
  return query
  select * from public.record_commerce_lifecycle_signal_v1(
    v_sanitized_signal,
    p_publish_enabled
  );
end;
$$;

drop function if exists public.commerce_lifecycle_job_is_still_eligible(uuid);

create or replace function public.commerce_lifecycle_job_is_still_eligible(
  p_outbox_id uuid,
  p_lease_token uuid,
  p_allowed_shop_domains text[]
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job public.commerce_lifecycle_outbox%rowtype;
  v_customer public.commerce_customer_state%rowtype;
  v_order public.commerce_orders%rowtype;
begin
  select * into v_job
  from public.commerce_lifecycle_outbox clo
  where clo.id = p_outbox_id;

  if not found
    or v_job.status <> 'processing'
    or v_job.lease_token is distinct from p_lease_token
    or v_job.dispatch_started_at is not null
    or coalesce(array_length(p_allowed_shop_domains, 1), 0) = 0
    or not (v_job.shop_domain = any(p_allowed_shop_domains)) then
    return false;
  end if;

  select * into v_customer
  from public.commerce_customer_state cs
  where cs.shop_domain = v_job.shop_domain and cs.email = v_job.email;

  if not found or v_customer.marketing_consent_state <> 'subscribed' then
    return false;
  end if;

  if v_job.source_order_id is not null then
    select * into v_order
    from public.commerce_orders co
    where co.shop_domain = v_job.shop_domain
      and co.order_id = v_job.source_order_id;
  end if;

  if v_job.event_name not in (
    'bl_order_cancelled_v1',
    'bl_refund_created_v1',
    'bl_subscription_projection_v1'
  ) then
    if v_customer.lifecycle_hard_exit
      or (v_customer.lifecycle_hold_until is not null and v_customer.lifecycle_hold_until > now()) then
      return false;
    end if;
    if v_job.source_order_id is not null and (
      v_order.cancelled_at is not null
      or v_order.is_full_order_refund
      or v_order.has_product_line_refund
    ) then
      return false;
    end if;
  end if;

  if v_job.journey_type = 'delivery_estimate' and (
    v_order.delivered_at is not null
    or v_order.cancelled_at is not null
    or v_order.has_product_line_refund
    or v_order.is_full_order_refund
  ) then
    return false;
  end if;

  if v_job.journey_type in (
    'postpurchase_quickstart_estimate',
    'postpurchase_results_estimate'
  ) and v_order.delivered_at is not null then
    return false;
  end if;

  if v_job.journey_type in (
    'postpurchase_quickstart_actual',
    'postpurchase_results_actual'
  ) and exists (
    select 1
    from public.commerce_lifecycle_outbox prior
    where prior.shop_domain = v_job.shop_domain
      and prior.source_order_id = v_job.source_order_id
      and prior.event_name = v_job.event_name
      and prior.id <> v_job.id
      and prior.status = 'succeeded'
  ) then
    return false;
  end if;

  if v_job.journey_type = 'replenishment' and (
    v_customer.replenishment_blocked
    or v_customer.last_order_id is distinct from v_job.source_order_id
    or v_order.cancelled_at is not null
    or v_order.has_product_line_refund
    or v_order.has_shipping_adjustment
    or v_order.is_full_order_refund
    or v_order.is_subscription_order
  ) then
    return false;
  end if;

  return true;
end;
$$;

drop function if exists public.claim_commerce_lifecycle_jobs(integer);

create or replace function public.claim_commerce_lifecycle_jobs(
  p_limit integer default 25,
  p_allowed_shop_domains text[] default '{}'::text[]
)
returns table (
  id uuid,
  shop_domain text,
  email text,
  payload jsonb,
  attempts integer,
  lease_token uuid
)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- A provider request that may already have reached Brevo is never retried.
  update public.commerce_lifecycle_outbox
  set status = 'delivery_uncertain',
      hold_reason = 'provider_outcome_unknown',
      locked_at = null,
      lease_token = null,
      completed_at = now(),
      last_error = coalesce(last_error, 'Provider dispatch was not acknowledged'),
      updated_at = now()
  where status = 'processing'
    and dispatch_started_at is not null
    and locked_at < now() - interval '15 minutes';

  update public.commerce_lifecycle_outbox clo
  set status = 'cancelled', hold_reason = 'send_time_state_ineligible', updated_at = now()
  from public.commerce_customer_state cs
  where clo.shop_domain = cs.shop_domain and clo.email = cs.email
    and clo.status in ('pending', 'processing')
    and clo.dispatch_started_at is null
    and clo.journey_type in ('delivery_estimate', 'replenishment')
    and (
      cs.marketing_consent_state <> 'subscribed'
      or cs.lifecycle_hard_exit
      or (cs.lifecycle_hold_until is not null and cs.lifecycle_hold_until > now())
      or exists (
        select 1 from public.commerce_orders co
        where co.shop_domain = clo.shop_domain and co.order_id = clo.source_order_id
          and (
            co.cancelled_at is not null
            or co.is_full_order_refund
            or (clo.journey_type = 'delivery_estimate' and (co.delivered_at is not null or co.has_product_line_refund))
            or (clo.journey_type = 'replenishment' and (
              co.has_product_line_refund or co.has_shipping_adjustment or co.is_subscription_order
            ))
          )
      )
      or (clo.journey_type = 'replenishment' and (
        cs.replenishment_blocked or cs.last_order_id <> clo.source_order_id
      ))
    );

  return query
  with claimable as (
    select clo.id
    from public.commerce_lifecycle_outbox clo
    join public.commerce_customer_state cs
      on cs.shop_domain = clo.shop_domain and cs.email = clo.email
    where (
      (clo.status = 'pending' and clo.available_at <= now())
      or (
        clo.status = 'processing'
        and clo.dispatch_started_at is null
        and clo.locked_at < now() - interval '15 minutes'
      )
    )
      and clo.attempts < clo.max_attempts
      and clo.next_attempt_at <= now()
      and cs.marketing_consent_state = 'subscribed'
      and coalesce(array_length(p_allowed_shop_domains, 1), 0) > 0
      and clo.shop_domain = any(p_allowed_shop_domains)
    order by clo.available_at, clo.created_at
    for update of clo skip locked
    limit least(greatest(p_limit, 1), 100)
  ), updated as (
    update public.commerce_lifecycle_outbox clo
    set status = 'processing',
        attempts = clo.attempts + 1,
        locked_at = now(),
        lease_token = gen_random_uuid(),
        dispatch_started_at = null,
        payload = jsonb_set(
          clo.payload,
          '{contact_properties}',
          coalesce(public.commerce_contact_properties(clo.shop_domain, clo.email), '{}'::jsonb),
          true
        ),
        updated_at = now()
    from claimable
    where clo.id = claimable.id
    returning clo.id, clo.shop_domain, clo.email, clo.payload, clo.attempts, clo.lease_token
  )
  select updated.id, updated.shop_domain, updated.email, updated.payload,
    updated.attempts, updated.lease_token
  from updated;
end;
$$;

create or replace function public.begin_commerce_lifecycle_dispatch(
  p_outbox_id uuid,
  p_lease_token uuid,
  p_allowed_shop_domains text[]
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_started boolean;
begin
  if not public.commerce_lifecycle_job_is_still_eligible(
    p_outbox_id,
    p_lease_token,
    p_allowed_shop_domains
  ) then
    return false;
  end if;

  update public.commerce_lifecycle_outbox
  set dispatch_started_at = now(),
      updated_at = now()
  where id = p_outbox_id
    and status = 'processing'
    and lease_token = p_lease_token
    and dispatch_started_at is null
    and shop_domain = any(p_allowed_shop_domains)
  returning true into v_started;

  return coalesce(v_started, false);
end;
$$;

drop function if exists public.complete_commerce_lifecycle_job(uuid, text, text, boolean);

create or replace function public.complete_commerce_lifecycle_job(
  p_outbox_id uuid,
  p_lease_token uuid,
  p_outcome text,
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
  if p_outcome not in ('succeeded', 'failed', 'suppressed') then
    raise exception 'Unsupported commerce lifecycle outcome';
  end if;

  update public.commerce_lifecycle_outbox
  set status = case
        when p_outcome = 'succeeded' then 'succeeded'
        when p_outcome = 'suppressed' then 'suppressed'
        when p_retryable and attempts < max_attempts and dispatch_started_at is null then 'pending'
        else 'failed'
      end,
      next_attempt_at = case
        when p_outcome in ('succeeded', 'suppressed') then available_at
        else now() + make_interval(mins => least(1440, (power(2, least(attempts, 10)))::integer))
      end,
      locked_at = null,
      lease_token = null,
      dispatch_started_at = case
        when p_retryable and dispatch_started_at is null then null
        else dispatch_started_at
      end,
      completed_at = case
        when p_outcome in ('succeeded', 'suppressed') or not p_retryable then now()
        else null
      end,
      last_error = case when p_outcome = 'succeeded' then null else left(coalesce(p_error, p_outcome), 1000) end,
      updated_at = now()
  where id = p_outbox_id
    and status = 'processing'
    and lease_token = p_lease_token
  returning status into v_status;

  return coalesce(v_status, 'stale_lease');
end;
$$;

revoke all on function public.reconcile_commerce_customer_identity(text, text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.record_commerce_lifecycle_signal_v1(jsonb, boolean)
  from public, anon, authenticated, service_role;
revoke all on function public.record_commerce_lifecycle_signal(jsonb, boolean)
  from public, anon, authenticated;
revoke all on function public.commerce_lifecycle_job_is_still_eligible(uuid, uuid, text[])
  from public, anon, authenticated;
revoke all on function public.claim_commerce_lifecycle_jobs(integer, text[])
  from public, anon, authenticated;
revoke all on function public.begin_commerce_lifecycle_dispatch(uuid, uuid, text[])
  from public, anon, authenticated;
revoke all on function public.complete_commerce_lifecycle_job(uuid, uuid, text, text, boolean)
  from public, anon, authenticated;

grant execute on function public.record_commerce_lifecycle_signal(jsonb, boolean) to service_role;
grant execute on function public.commerce_lifecycle_job_is_still_eligible(uuid, uuid, text[]) to service_role;
grant execute on function public.claim_commerce_lifecycle_jobs(integer, text[]) to service_role;
grant execute on function public.begin_commerce_lifecycle_dispatch(uuid, uuid, text[]) to service_role;
grant execute on function public.complete_commerce_lifecycle_job(uuid, uuid, text, text, boolean) to service_role;
