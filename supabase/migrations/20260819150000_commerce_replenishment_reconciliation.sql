-- Reconcile one-time replenishment after the real Shopify QA matrix exposed
-- two safe-but-overbroad fail-closed states:
--   1. a customer with no subscription history and zero BL subscription tags
--      remained replenishment-blocked after a verified one-time order; and
--   2. an eligible order received before positive consent could never acquire
--      its future replenishment journey after consent was later granted.
--
-- Audit-mode rows remain held. In publish mode, only rows held specifically for
-- missing consent may be promoted after a chronologically newer positive grant.

create or replace function public.harden_commerce_customer_state()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_count integer;
  v_latest_cancel_at timestamptz;
  v_candidate_exit_at timestamptz;
begin
  select count(*)::integer into v_order_count
  from public.commerce_orders co
  where co.shop_domain = new.shop_domain
    and co.email = new.email
    and co.paid_at is not null;
  new.order_count := v_order_count;

  -- Subscription evidence always wins. A zero-tag observation is ambiguous
  -- only when subscription history exists; it must not permanently block a
  -- verified one-time buyer who has never bought a subscription.
  new.replenishment_blocked := case
    when new.subscription_projection in ('active', 'paused', 'unknown', 'unknown_conflict') then true
    when coalesce(new.subscription_tag_count, 0) > 1 then true
    when coalesce(new.last_order_is_subscription, false) then true
    when new.has_subscription_order
      and new.subscription_projection not in ('cancelled', 'expired', 'failed') then true
    when new.has_subscription_order
      and new.subscription_projection in ('cancelled', 'expired', 'failed')
      and new.last_order_at is not null
      and not coalesce(new.last_order_is_subscription, false)
      and new.last_order_at > coalesce(new.subscription_projection_observed_at, '-infinity'::timestamptz)
      then false
    when not new.has_subscription_order
      and new.last_order_at is not null
      and not coalesce(new.last_order_is_subscription, false) then false
    else coalesce(new.replenishment_blocked, true)
  end;

  select max(co.cancelled_at) into v_latest_cancel_at
  from public.commerce_orders co
  where co.shop_domain = new.shop_domain
    and co.email = new.email
    and co.cancelled_at is not null;

  v_candidate_exit_at := greatest(
    case when tg_op = 'UPDATE' then old.lifecycle_hard_exit_at else null end,
    case when new.lifecycle_hard_exit then new.last_refunded_at else null end,
    v_latest_cancel_at,
    new.lifecycle_hard_exit_at
  );

  if new.lifecycle_hard_exit then
    new.lifecycle_hard_exit_at := coalesce(v_candidate_exit_at, now());
  elsif tg_op = 'UPDATE'
    and old.lifecycle_hard_exit
    and old.lifecycle_hard_exit_at is not null
    and (new.last_order_at is null or new.last_order_at <= old.lifecycle_hard_exit_at) then
    new.lifecycle_hard_exit := true;
    new.lifecycle_hard_exit_at := old.lifecycle_hard_exit_at;
  else
    new.lifecycle_hard_exit_at := null;
  end if;
  return new;
end;
$$;

create or replace function public.ensure_commerce_replenishment_journey(
  p_shop_domain text,
  p_email text,
  p_publish_enabled boolean default false
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer public.commerce_customer_state%rowtype;
  v_order public.commerce_orders%rowtype;
  v_receipt_id uuid;
  v_status text;
  v_hold_reason text;
  v_available_at timestamptz;
begin
  if p_shop_domain is null or p_email is null then
    return;
  end if;

  select * into v_customer
  from public.commerce_customer_state cs
  where cs.shop_domain = lower(p_shop_domain)
    and cs.email = lower(btrim(p_email));

  if not found
    or v_customer.last_order_id is null
    or v_customer.replenishment_blocked
    or v_customer.lifecycle_hard_exit
    or (v_customer.lifecycle_hold_until is not null and v_customer.lifecycle_hold_until > now()) then
    return;
  end if;

  select * into v_order
  from public.commerce_orders co
  where co.shop_domain = v_customer.shop_domain
    and co.order_id = v_customer.last_order_id;

  if not found
    or v_order.paid_at is null
    or v_order.cancelled_at is not null
    or coalesce(v_order.is_subscription_order, true)
    or v_order.has_product_line_refund
    or v_order.has_shipping_adjustment
    or v_order.is_full_order_refund
    or coalesce(v_order.purchased_bottles, 0) < 1 then
    return;
  end if;

  select clr.id into v_receipt_id
  from public.commerce_lifecycle_receipts clr
  where clr.shop_domain = v_order.shop_domain
    and clr.topic = 'orders/paid'
    and clr.resource_id = v_order.order_id
  order by clr.received_at asc
  limit 1;

  if v_receipt_id is null then
    return;
  end if;

  v_available_at := v_order.paid_at
    + case when v_order.purchased_bottles >= 2 then interval '77 days' else interval '35 days' end;
  v_status := case
    when p_publish_enabled and v_customer.marketing_consent_state = 'subscribed' then 'pending'
    else 'held'
  end;
  v_hold_reason := case
    when not p_publish_enabled then 'audit_mode'
    when v_customer.marketing_consent_state <> 'subscribed' then 'no_positive_consent'
    else null
  end;

  insert into public.commerce_lifecycle_outbox (
    receipt_id, shop_domain, email, source_order_id, event_name, journey_type,
    payload, status, hold_reason, available_at, next_attempt_at, idempotency_key
  ) values (
    v_receipt_id,
    v_order.shop_domain,
    v_customer.email,
    v_order.order_id,
    'bl_replenishment_due_v1',
    'replenishment',
    jsonb_build_object(
      'event_name', 'bl_replenishment_due_v1',
      'event_date', v_available_at,
      'identifiers', jsonb_build_object('email_id', v_customer.email),
      'contact_properties', public.commerce_contact_properties(v_customer.shop_domain, v_customer.email),
      'event_properties', jsonb_build_object(
        'order_id', v_order.order_id,
        'bottle_count', v_order.purchased_bottles,
        'basis', case when v_order.purchased_bottles >= 2 then 'two_pack_day_77' else 'single_day_35' end
      )
    ),
    v_status,
    v_hold_reason,
    v_available_at,
    v_available_at,
    v_order.shop_domain || ':' || v_order.order_id || ':replenishment-v1'
  )
  on conflict (idempotency_key) do nothing;
end;
$$;

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

  -- The legacy projection and hardening trigger have now converged the latest
  -- order/subscription state. Backfill only the single idempotent journey that
  -- remains eligible under that converged state.
  if v_email is not null then
    perform public.ensure_commerce_replenishment_journey(v_shop, v_email, p_publish_enabled);

    -- Audit rows can never be released here. In publish mode, a newer positive
    -- grant may release only rows held specifically because consent was absent.
    if p_publish_enabled and v_consent = 'subscribed' then
      update public.commerce_lifecycle_outbox clo
      set status = 'pending',
          hold_reason = null,
          updated_at = now()
      where clo.shop_domain = v_shop
        and clo.email = v_email
        and clo.status = 'held'
        and clo.hold_reason = 'no_positive_consent';
    end if;
  end if;
end;
$$;

revoke all on function public.ensure_commerce_replenishment_journey(text, text, boolean)
  from public, anon, authenticated;
revoke all on function public.harden_commerce_customer_state()
  from public, anon, authenticated;
revoke all on function public.record_commerce_lifecycle_signal(jsonb, boolean)
  from public, anon, authenticated;

grant execute on function public.ensure_commerce_replenishment_journey(text, text, boolean)
  to service_role;
grant execute on function public.record_commerce_lifecycle_signal(jsonb, boolean)
  to service_role;
