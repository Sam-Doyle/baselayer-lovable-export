-- A true carrier/manual delivery observation supersedes fulfillment+5d
-- education immediately. Eligibility already rejected those estimate rows at
-- dispatch time; cancelling them eagerly makes the durable audit projection
-- explicit and prevents a held audit row from looking like a future send.

create or replace function public.schedule_postpurchase_ready_signals()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_basis text;
  v_base_at timestamptz;
  v_properties jsonb;
begin
  if new.event_name not in ('bl_order_delivered_v1', 'bl_delivery_window_elapsed_v1')
    or new.source_order_id is null
    or new.email is null then
    return new;
  end if;

  v_basis := case
    when new.event_name = 'bl_order_delivered_v1' then 'actual_delivery'
    else 'estimated_delivery'
  end;
  v_base_at := coalesce(
    nullif(new.payload ->> 'event_date', '')::timestamptz,
    new.available_at,
    now()
  );
  v_properties := coalesce(new.payload -> 'contact_properties', '{}'::jsonb);

  if v_basis = 'actual_delivery' then
    update public.commerce_lifecycle_outbox clo
    set status = 'cancelled',
        hold_reason = 'actual_delivery_received',
        updated_at = now()
    where clo.shop_domain = new.shop_domain
      and clo.source_order_id = new.source_order_id
      and clo.journey_type in (
        'postpurchase_quickstart_estimate',
        'postpurchase_results_estimate'
      )
      and clo.status in ('held', 'pending');
  end if;

  insert into public.commerce_lifecycle_outbox (
    receipt_id, shop_domain, email, source_order_id, event_name, journey_type,
    payload, status, hold_reason, available_at, idempotency_key
  ) values (
    new.receipt_id,
    new.shop_domain,
    new.email,
    new.source_order_id,
    'bl_postpurchase_quickstart_v1',
    case when v_basis = 'actual_delivery'
      then 'postpurchase_quickstart_actual'
      else 'postpurchase_quickstart_estimate' end,
    jsonb_build_object(
      'event_name', 'bl_postpurchase_quickstart_v1',
      'event_date', v_base_at + interval '1 day',
      'identifiers', jsonb_build_object('email_id', new.email),
      'contact_properties', v_properties,
      'event_properties', jsonb_build_object(
        'order_id', new.source_order_id,
        'delivery_basis', v_basis,
        'estimated', v_basis = 'estimated_delivery'
      )
    ),
    new.status,
    new.hold_reason,
    v_base_at + interval '1 day',
    new.shop_domain || ':' || new.source_order_id || ':postpurchase-quickstart:' || v_basis || '-v1'
  ) on conflict (idempotency_key) do nothing;

  insert into public.commerce_lifecycle_outbox (
    receipt_id, shop_domain, email, source_order_id, event_name, journey_type,
    payload, status, hold_reason, available_at, idempotency_key
  ) values (
    new.receipt_id,
    new.shop_domain,
    new.email,
    new.source_order_id,
    'bl_postpurchase_results_v1',
    case when v_basis = 'actual_delivery'
      then 'postpurchase_results_actual'
      else 'postpurchase_results_estimate' end,
    jsonb_build_object(
      'event_name', 'bl_postpurchase_results_v1',
      'event_date', v_base_at + interval '14 days',
      'identifiers', jsonb_build_object('email_id', new.email),
      'contact_properties', v_properties,
      'event_properties', jsonb_build_object(
        'order_id', new.source_order_id,
        'delivery_basis', v_basis,
        'estimated', v_basis = 'estimated_delivery'
      )
    ),
    new.status,
    new.hold_reason,
    v_base_at + interval '14 days',
    new.shop_domain || ':' || new.source_order_id || ':postpurchase-results:' || v_basis || '-v1'
  ) on conflict (idempotency_key) do nothing;

  return new;
end;
$$;

revoke all on function public.schedule_postpurchase_ready_signals()
  from public, anon, authenticated;

update public.commerce_lifecycle_outbox clo
set status = 'cancelled',
    hold_reason = 'actual_delivery_received',
    updated_at = now()
where clo.journey_type in (
    'postpurchase_quickstart_estimate',
    'postpurchase_results_estimate'
  )
  and clo.status in ('held', 'pending')
  and exists (
    select 1
    from public.commerce_orders co
    where co.shop_domain = clo.shop_domain
      and co.order_id = clo.source_order_id
      and co.delivered_at is not null
  );
