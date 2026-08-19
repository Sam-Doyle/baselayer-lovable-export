-- The effective consent time and the time at which Shopify's current consent
-- snapshot was fetched are different clocks. Track both so a newer refund or
-- order event cannot invent consent chronology, while a fresh authoritative
-- Shopify snapshot can correct legacy observations safely.

alter table public.commerce_customer_state
  add column if not exists marketing_consent_snapshot_at timestamptz;

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
  v_event_type text := nullif(p_signal->>'event_type', '');
  v_consent text := coalesce(nullif(p_signal->>'marketing_consent_state', ''), 'unknown');
  v_occurred_at timestamptz := (p_signal->>'occurred_at')::timestamptz;
  v_consent_observed_at timestamptz := nullif(
    p_signal->>'marketing_consent_observed_at',
    ''
  )::timestamptz;
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

  if v_email is not null
    and v_consent <> 'unknown'
    and v_consent_observed_at is not null then
    insert into public.commerce_customer_state (
      shop_domain, email, customer_id, marketing_consent_state,
      marketing_consent_observed_at, marketing_consent_snapshot_at
    ) values (
      v_shop, v_email, v_customer_id, v_consent,
      v_consent_observed_at, v_occurred_at
    )
    on conflict (shop_domain, email) do update set
      customer_id = coalesce(excluded.customer_id, commerce_customer_state.customer_id),
      marketing_consent_state = case
        when commerce_customer_state.marketing_consent_snapshot_at is null
          or excluded.marketing_consent_snapshot_at > commerce_customer_state.marketing_consent_snapshot_at
          then excluded.marketing_consent_state
        when excluded.marketing_consent_snapshot_at < commerce_customer_state.marketing_consent_snapshot_at
          then commerce_customer_state.marketing_consent_state
        when commerce_customer_state.marketing_consent_state = 'unsubscribed'
          or excluded.marketing_consent_state = 'unsubscribed' then 'unsubscribed'
        when commerce_customer_state.marketing_consent_state = 'not_subscribed'
          or excluded.marketing_consent_state = 'not_subscribed' then 'not_subscribed'
        when commerce_customer_state.marketing_consent_state = 'pending'
          or excluded.marketing_consent_state = 'pending' then 'pending'
        else excluded.marketing_consent_state
      end,
      marketing_consent_observed_at = case
        when commerce_customer_state.marketing_consent_snapshot_at is null
          or excluded.marketing_consent_snapshot_at >= commerce_customer_state.marketing_consent_snapshot_at
          then excluded.marketing_consent_observed_at
        else commerce_customer_state.marketing_consent_observed_at
      end,
      marketing_consent_snapshot_at = greatest(
        commerce_customer_state.marketing_consent_snapshot_at,
        excluded.marketing_consent_snapshot_at
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

  if v_email is not null then
    if v_event_type = 'order_paid' then
      update public.commerce_customer_state cs
      set lifecycle_hard_exit = false,
          lifecycle_hard_exit_at = null,
          lifecycle_hold_until = null,
          replenishment_blocked = false,
          updated_at = now()
      where cs.shop_domain = v_shop
        and cs.email = v_email
        and cs.marketing_consent_state = 'subscribed'
        and cs.marketing_consent_observed_at is not null
        and cs.marketing_consent_observed_at <= v_occurred_at
        and cs.last_order_id = nullif(p_signal->>'order_id', '')
        and cs.last_order_at = v_occurred_at
        and (
          cs.lifecycle_hard_exit
          or (cs.lifecycle_hold_until is not null and cs.lifecycle_hold_until > v_occurred_at)
        )
        and (
          cs.lifecycle_hard_exit_at is null
          or v_occurred_at > cs.lifecycle_hard_exit_at
        );
    end if;

    perform public.ensure_commerce_replenishment_journey(v_shop, v_email, p_publish_enabled);

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

revoke all on function public.record_commerce_lifecycle_signal(jsonb, boolean)
  from public, anon, authenticated;
grant execute on function public.record_commerce_lifecycle_signal(jsonb, boolean)
  to service_role;
