-- Final activation guards for chronology, duplicate Shopify deliveries, and
-- the claim-to-provider consent window. This migration is additive and safe
-- while COMMERCE_LIFECYCLE_MODE remains audit.

create or replace function public.dedupe_order_lifecycle_outbox()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.source_order_id is not null
    and new.event_name in (
      'bl_order_paid_v1',
      'bl_order_cancelled_v1',
      'bl_order_fulfilled_v1',
      'bl_order_delivered_v1',
      'bl_delivery_window_elapsed_v1',
      'bl_replenishment_due_v1'
    )
    and exists (
      select 1
      from public.commerce_lifecycle_outbox existing
      where existing.shop_domain = new.shop_domain
        and existing.source_order_id = new.source_order_id
        and existing.event_name = new.event_name
    ) then
    return null;
  end if;
  return new;
end;
$$;

drop trigger if exists commerce_outbox_order_event_dedupe on public.commerce_lifecycle_outbox;
create trigger commerce_outbox_order_event_dedupe
before insert on public.commerce_lifecycle_outbox
for each row execute function public.dedupe_order_lifecycle_outbox();

create or replace function public.reconcile_commerce_after_paid_outbox()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.commerce_orders%rowtype;
  v_properties jsonb;
begin
  if new.event_name <> 'bl_order_paid_v1' or new.source_order_id is null then
    return new;
  end if;

  select * into v_order
  from public.commerce_orders co
  where co.shop_domain = new.shop_domain
    and co.order_id = new.source_order_id;

  if not found or v_order.email is null then
    return new;
  end if;

  v_properties := coalesce(
    public.commerce_contact_properties(new.shop_domain, v_order.email),
    '{}'::jsonb
  );

  -- Shopify can redeliver fulfillment/delivery before orders/paid. Those
  -- receipts have no resolvable email at that moment, so orders/paid is the
  -- first safe point to backfill the minimized Brevo authority event.
  if v_order.delivered_at is not null then
    insert into public.commerce_lifecycle_outbox (
      receipt_id, shop_domain, email, source_order_id, event_name, journey_type,
      payload, status, hold_reason, available_at, idempotency_key
    ) values (
      new.receipt_id, new.shop_domain, v_order.email, new.source_order_id,
      'bl_order_delivered_v1', 'authority',
      jsonb_build_object(
        'event_name', 'bl_order_delivered_v1',
        'event_date', v_order.delivered_at,
        'identifiers', jsonb_build_object('email_id', v_order.email),
        'contact_properties', v_properties,
        'event_properties', jsonb_build_object(
          'order_id', new.source_order_id,
          'reconciled_after_paid', true
        )
      ),
      new.status, new.hold_reason, now(),
      new.shop_domain || ':' || new.source_order_id || ':delivered-v1'
    ) on conflict (idempotency_key) do nothing;
  elsif v_order.fulfilled_at is not null then
    insert into public.commerce_lifecycle_outbox (
      receipt_id, shop_domain, email, source_order_id, event_name, journey_type,
      payload, status, hold_reason, available_at, idempotency_key
    ) values (
      new.receipt_id, new.shop_domain, v_order.email, new.source_order_id,
      'bl_order_fulfilled_v1', 'authority',
      jsonb_build_object(
        'event_name', 'bl_order_fulfilled_v1',
        'event_date', v_order.fulfilled_at,
        'identifiers', jsonb_build_object('email_id', v_order.email),
        'contact_properties', v_properties,
        'event_properties', jsonb_build_object(
          'order_id', new.source_order_id,
          'reconciled_after_paid', true
        )
      ),
      new.status, new.hold_reason, now(),
      new.shop_domain || ':' || new.source_order_id || ':fulfilled-v1'
    ) on conflict (idempotency_key) do nothing;

    if v_order.cancelled_at is null
      and not v_order.has_product_line_refund
      and not v_order.is_full_order_refund then
      insert into public.commerce_lifecycle_outbox (
        receipt_id, shop_domain, email, source_order_id, event_name, journey_type,
        payload, status, hold_reason, available_at, idempotency_key
      ) values (
        new.receipt_id, new.shop_domain, v_order.email, new.source_order_id,
        'bl_delivery_window_elapsed_v1', 'delivery_estimate',
        jsonb_build_object(
          'event_name', 'bl_delivery_window_elapsed_v1',
          'event_date', v_order.fulfilled_at + interval '5 days',
          'identifiers', jsonb_build_object('email_id', v_order.email),
          'contact_properties', v_properties,
          'event_properties', jsonb_build_object(
            'order_id', new.source_order_id,
            'estimated', true,
            'basis', 'fulfilled_plus_5d',
            'reconciled_after_paid', true
          )
        ),
        new.status, new.hold_reason, v_order.fulfilled_at + interval '5 days',
        new.shop_domain || ':' || new.source_order_id || ':delivery-estimate-v1'
      ) on conflict (idempotency_key) do nothing;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists commerce_outbox_paid_reconciliation on public.commerce_lifecycle_outbox;
create trigger commerce_outbox_paid_reconciliation
after insert on public.commerce_lifecycle_outbox
for each row execute function public.reconcile_commerce_after_paid_outbox();

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

  -- Exit/suppression events must still reach Brevo when the contact remains
  -- opted in. All events capable of starting education or replenishment are
  -- rechecked against the newest Shopify-derived state immediately before the
  -- provider call.
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

revoke all on function public.dedupe_order_lifecycle_outbox() from public, anon, authenticated;
revoke all on function public.reconcile_commerce_after_paid_outbox() from public, anon, authenticated;
revoke all on function public.commerce_lifecycle_job_is_still_eligible(uuid) from public, anon, authenticated;
grant execute on function public.commerce_lifecycle_job_is_still_eligible(uuid) to service_role;
