-- Backfill customer suppression and minimized Brevo exit authority when
-- Shopify delivers a cancel/refund webhook before orders/paid supplies the
-- canonical email address. This stays dark while lifecycle mode is audit.

create or replace function public.reconcile_commerce_exit_after_paid_outbox()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.commerce_orders%rowtype;
  v_properties jsonb;
  v_exit_at timestamptz;
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

  if v_order.cancelled_at is not null then
    v_exit_at := v_order.cancelled_at;

    insert into public.commerce_customer_state (
      shop_domain, email, customer_id, marketing_consent_state,
      replenishment_blocked, lifecycle_hard_exit, lifecycle_hard_exit_at
    ) values (
      new.shop_domain, v_order.email, v_order.customer_id, 'unknown',
      true, true, v_exit_at
    )
    on conflict (shop_domain, email) do update set
      customer_id = coalesce(excluded.customer_id, commerce_customer_state.customer_id),
      replenishment_blocked = true,
      lifecycle_hard_exit = true,
      lifecycle_hard_exit_at = greatest(
        commerce_customer_state.lifecycle_hard_exit_at,
        excluded.lifecycle_hard_exit_at
      ),
      updated_at = now();

    insert into public.commerce_lifecycle_outbox (
      receipt_id, shop_domain, email, source_order_id, event_name, journey_type,
      payload, status, hold_reason, available_at, idempotency_key
    ) values (
      new.receipt_id, new.shop_domain, v_order.email, new.source_order_id,
      'bl_order_cancelled_v1', 'authority',
      jsonb_build_object(
        'event_name', 'bl_order_cancelled_v1',
        'event_date', v_exit_at,
        'identifiers', jsonb_build_object('email_id', v_order.email),
        'contact_properties', v_properties,
        'event_properties', jsonb_build_object(
          'order_id', new.source_order_id,
          'reconciled_after_paid', true
        )
      ),
      new.status, new.hold_reason, now(),
      new.shop_domain || ':' || new.source_order_id || ':cancelled-v1'
    ) on conflict (idempotency_key) do nothing;
  end if;

  if v_order.is_full_order_refund or v_order.has_product_line_refund
    or v_order.has_shipping_adjustment then
    select coalesce(max(clr.occurred_at), new.created_at)
    into v_exit_at
    from public.commerce_lifecycle_receipts clr
    where clr.shop_domain = new.shop_domain
      and clr.resource_id = new.source_order_id
      and clr.event_type = 'refund_created';

    insert into public.commerce_customer_state (
      shop_domain, email, customer_id, marketing_consent_state,
      last_refunded_at, lifecycle_hold_until, replenishment_blocked,
      lifecycle_hard_exit, lifecycle_hard_exit_at
    ) values (
      new.shop_domain, v_order.email, v_order.customer_id, 'unknown',
      v_exit_at,
      case
        when v_order.has_product_line_refund and not v_order.is_full_order_refund
          then v_exit_at + interval '60 days'
        else null
      end,
      true,
      v_order.is_full_order_refund,
      case when v_order.is_full_order_refund then v_exit_at else null end
    )
    on conflict (shop_domain, email) do update set
      customer_id = coalesce(excluded.customer_id, commerce_customer_state.customer_id),
      last_refunded_at = greatest(
        commerce_customer_state.last_refunded_at,
        excluded.last_refunded_at
      ),
      lifecycle_hold_until = greatest(
        commerce_customer_state.lifecycle_hold_until,
        excluded.lifecycle_hold_until
      ),
      replenishment_blocked = true,
      lifecycle_hard_exit = commerce_customer_state.lifecycle_hard_exit
        or excluded.lifecycle_hard_exit,
      lifecycle_hard_exit_at = greatest(
        commerce_customer_state.lifecycle_hard_exit_at,
        excluded.lifecycle_hard_exit_at
      ),
      updated_at = now();

    insert into public.commerce_lifecycle_outbox (
      receipt_id, shop_domain, email, source_order_id, event_name, journey_type,
      payload, status, hold_reason, available_at, idempotency_key
    ) values (
      new.receipt_id, new.shop_domain, v_order.email, new.source_order_id,
      'bl_refund_created_v1', 'authority',
      jsonb_build_object(
        'event_name', 'bl_refund_created_v1',
        'event_date', v_exit_at,
        'identifiers', jsonb_build_object('email_id', v_order.email),
        'contact_properties', v_properties,
        'event_properties', jsonb_build_object(
          'order_id', new.source_order_id,
          'product_line_refund', v_order.has_product_line_refund,
          'full_order_refund', v_order.is_full_order_refund,
          'shipping_adjustment', v_order.has_shipping_adjustment,
          'reconciled_after_paid', true
        )
      ),
      new.status, new.hold_reason, now(),
      new.shop_domain || ':' || new.source_order_id || ':refund-reconciled-v1'
    ) on conflict (idempotency_key) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists commerce_outbox_paid_exit_reconciliation
  on public.commerce_lifecycle_outbox;
create trigger commerce_outbox_paid_exit_reconciliation
after insert on public.commerce_lifecycle_outbox
for each row execute function public.reconcile_commerce_exit_after_paid_outbox();

revoke all on function public.reconcile_commerce_exit_after_paid_outbox()
  from public, anon, authenticated;
