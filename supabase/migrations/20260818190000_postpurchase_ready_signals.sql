-- Schedule post-purchase education as due-time provider signals. Brevo can
-- therefore send immediately on receipt, while consent and refund/cancel
-- suppression are rechecked by the worker at the actual send time.

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
    or new.source_order_id is null or new.email is null then
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

  insert into public.commerce_lifecycle_outbox (
    receipt_id, shop_domain, email, source_order_id, event_name, journey_type,
    payload, status, hold_reason, available_at, idempotency_key
  ) values (
    new.receipt_id, new.shop_domain, new.email, new.source_order_id,
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
    new.status, new.hold_reason, v_base_at + interval '1 day',
    new.shop_domain || ':' || new.source_order_id || ':postpurchase-quickstart:' || v_basis || '-v1'
  ) on conflict (idempotency_key) do nothing;

  insert into public.commerce_lifecycle_outbox (
    receipt_id, shop_domain, email, source_order_id, event_name, journey_type,
    payload, status, hold_reason, available_at, idempotency_key
  ) values (
    new.receipt_id, new.shop_domain, new.email, new.source_order_id,
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
    new.status, new.hold_reason, v_base_at + interval '14 days',
    new.shop_domain || ':' || new.source_order_id || ':postpurchase-results:' || v_basis || '-v1'
  ) on conflict (idempotency_key) do nothing;

  return new;
end;
$$;

drop trigger if exists commerce_outbox_postpurchase_ready_signals
  on public.commerce_lifecycle_outbox;
create trigger commerce_outbox_postpurchase_ready_signals
after insert on public.commerce_lifecycle_outbox
for each row execute function public.schedule_postpurchase_ready_signals();

create or replace function public.commerce_lifecycle_job_is_still_eligible(
  p_outbox_id uuid
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

  if not found or v_job.status <> 'processing' then
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

  -- If an estimate-based education event already sent before the real carrier
  -- delivery arrived, do not send the corresponding actual-basis event again.
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

revoke all on function public.schedule_postpurchase_ready_signals()
  from public, anon, authenticated;
revoke all on function public.commerce_lifecycle_job_is_still_eligible(uuid)
  from public, anon, authenticated;
grant execute on function public.commerce_lifecycle_job_is_still_eligible(uuid)
  to service_role;
