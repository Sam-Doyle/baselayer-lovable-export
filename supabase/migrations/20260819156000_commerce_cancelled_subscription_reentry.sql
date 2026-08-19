-- A cancelled/expired/failed subscription may permit replenishment only for a
-- genuinely later one-time order. A one-time order that predates the terminal
-- subscription observation must remain suppressed.

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

  new.replenishment_blocked := case
    when new.lifecycle_hard_exit then true
    when new.lifecycle_hold_until is not null and new.lifecycle_hold_until > now() then true
    when new.subscription_projection in ('active', 'paused', 'unknown', 'unknown_conflict') then true
    when coalesce(new.subscription_tag_count, 0) > 1 then true
    when coalesce(new.last_order_is_subscription, false) then true
    when new.subscription_projection in ('cancelled', 'expired', 'failed')
      and (
        new.last_order_at is null
        or new.last_order_at <= coalesce(
          new.subscription_projection_observed_at,
          'infinity'::timestamptz
        )
      ) then true
    when new.subscription_projection in ('cancelled', 'expired', 'failed')
      and new.last_order_at is not null
      and not coalesce(new.last_order_is_subscription, false)
      and new.last_order_at > coalesce(
        new.subscription_projection_observed_at,
        '-infinity'::timestamptz
      ) then false
    when new.has_subscription_order then true
    when new.last_order_at is not null
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
    new.replenishment_blocked := true;
  else
    new.lifecycle_hard_exit_at := null;
  end if;
  return new;
end;
$$;

revoke all on function public.harden_commerce_customer_state()
  from public, anon, authenticated;

-- Re-evaluate existing projections through the trigger without changing any
-- source facts.
update public.commerce_customer_state
set updated_at = now()
where subscription_projection in ('cancelled', 'expired', 'failed');
