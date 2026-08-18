-- Follow-up guards for chronology-sensitive and intermediate Flow updates.
-- This remains additive and dark-mode safe.

alter table public.commerce_customer_state
  add column if not exists lifecycle_hard_exit_at timestamptz;

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
  -- Derive the count from idempotent order rows instead of delivery order.
  select count(*)::integer into v_order_count
  from public.commerce_orders co
  where co.shop_domain = new.shop_domain and co.email = new.email and co.paid_at is not null;
  new.order_count := v_order_count;

  -- A first-ever zero-tag Flow transition is ambiguous and must fail closed.
  new.replenishment_blocked := coalesce(new.replenishment_blocked, true);

  select max(co.cancelled_at) into v_latest_cancel_at
  from public.commerce_orders co
  where co.shop_domain = new.shop_domain and co.email = new.email and co.cancelled_at is not null;

  v_candidate_exit_at := greatest(
    case when tg_op = 'UPDATE' then old.lifecycle_hard_exit_at else null end,
    case when new.lifecycle_hard_exit then new.last_refunded_at else null end,
    v_latest_cancel_at,
    new.lifecycle_hard_exit_at
  );

  if new.lifecycle_hard_exit then
    new.lifecycle_hard_exit_at := coalesce(v_candidate_exit_at, now());
  elsif tg_op = 'UPDATE' and old.lifecycle_hard_exit
    and old.lifecycle_hard_exit_at is not null
    and (new.last_order_at is null or new.last_order_at <= old.lifecycle_hard_exit_at) then
    -- An older paid webhook arriving after a cancel/full-refund receipt cannot
    -- reopen the lifecycle. Only a genuinely later positive purchase can.
    new.lifecycle_hard_exit := true;
    new.lifecycle_hard_exit_at := old.lifecycle_hard_exit_at;
  else
    new.lifecycle_hard_exit_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists commerce_customer_state_hardening on public.commerce_customer_state;
create trigger commerce_customer_state_hardening
before insert or update on public.commerce_customer_state
for each row execute function public.harden_commerce_customer_state();

create or replace function public.quarantine_intermediate_subscription_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.event_name = 'bl_subscription_projection_v1'
    and coalesce((new.payload #>> '{event_properties,subscription_tag_count}')::integer, 0) = 0 then
    new.status := 'cancelled';
    new.hold_reason := 'intermediate_zero_subscription_tags';
  end if;
  return new;
end;
$$;

drop trigger if exists commerce_outbox_subscription_quarantine on public.commerce_lifecycle_outbox;
create trigger commerce_outbox_subscription_quarantine
before insert on public.commerce_lifecycle_outbox
for each row execute function public.quarantine_intermediate_subscription_event();

revoke all on function public.harden_commerce_customer_state() from public, anon, authenticated;
revoke all on function public.quarantine_intermediate_subscription_event() from public, anon, authenticated;
