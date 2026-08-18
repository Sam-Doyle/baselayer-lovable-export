-- Dark-by-default Shopify -> Supabase -> Brevo lifecycle bridge.
--
-- Shopify is the order/fulfillment authority. Supabase stores a minimized,
-- idempotent audit projection and durable provider outbox. Brevo events are
-- never claimable unless the ingestion function was explicitly deployed in
-- publish mode and positive Shopify email consent was known. The worker adds a
-- second send-time Brevo blocklist check before publishing.

create table if not exists public.commerce_lifecycle_receipts (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_event_id text not null,
  shop_domain text not null,
  topic text not null,
  event_type text not null,
  api_version text,
  resource_id text,
  payload_sha256 text not null,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  constraint commerce_receipts_source check (source in ('shopify_webhook')),
  constraint commerce_receipts_fingerprint check (payload_sha256 ~ '^[a-f0-9]{64}$'),
  constraint commerce_receipts_event_id_length check (length(source_event_id) between 1 and 255),
  constraint commerce_receipts_shop_length check (length(shop_domain) between 1 and 255)
);

create unique index if not exists commerce_receipts_delivery_unique
  on public.commerce_lifecycle_receipts (source, shop_domain, topic, source_event_id);
create index if not exists commerce_receipts_occurred_idx
  on public.commerce_lifecycle_receipts (occurred_at desc);

create table if not exists public.commerce_orders (
  shop_domain text not null,
  order_id text not null,
  customer_id text,
  email text,
  paid_at timestamptz,
  cancelled_at timestamptz,
  fulfilled_at timestamptz,
  delivered_at timestamptz,
  purchased_bottles integer,
  refunded_bottles integer not null default 0,
  has_product_line_refund boolean not null default false,
  has_shipping_adjustment boolean not null default false,
  is_full_order_refund boolean not null default false,
  is_subscription_order boolean,
  subscription_plan_id text,
  updated_at timestamptz not null default now(),
  primary key (shop_domain, order_id),
  constraint commerce_orders_email_normalized check (email is null or email = lower(btrim(email))),
  constraint commerce_orders_bottles check (
    (purchased_bottles is null or purchased_bottles >= 0) and refunded_bottles >= 0
  )
);

create index if not exists commerce_orders_email_paid_idx
  on public.commerce_orders (shop_domain, email, paid_at desc)
  where email is not null and paid_at is not null;

create table if not exists public.commerce_customer_state (
  shop_domain text not null,
  email text not null,
  customer_id text,
  marketing_consent_state text not null default 'unknown',
  order_count integer not null default 0,
  last_order_id text,
  last_order_at timestamptz,
  last_order_bottle_count integer,
  last_order_is_subscription boolean,
  last_fulfilled_at timestamptz,
  last_delivered_at timestamptz,
  last_refunded_at timestamptz,
  has_subscription_order boolean not null default false,
  last_subscription_order_at timestamptz,
  last_subscription_plan_id text,
  subscription_projection text,
  subscription_projection_observed_at timestamptz,
  subscription_tag_count integer,
  replenishment_blocked boolean not null default false,
  lifecycle_hold_until timestamptz,
  lifecycle_hard_exit boolean not null default false,
  lifecycle_hard_exit_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (shop_domain, email),
  constraint commerce_customer_email_normalized check (email = lower(btrim(email))),
  constraint commerce_customer_consent check (
    marketing_consent_state in ('subscribed', 'unsubscribed', 'not_subscribed', 'pending', 'unknown')
  ),
  constraint commerce_customer_subscription_projection check (
    subscription_projection is null or subscription_projection in (
      'active', 'paused', 'cancelled', 'expired', 'failed', 'unknown', 'unknown_conflict'
    )
  ),
  constraint commerce_customer_counts check (
    order_count >= 0 and (subscription_tag_count is null or subscription_tag_count >= 0)
  )
);

create unique index if not exists commerce_customer_shopify_id_unique
  on public.commerce_customer_state (shop_domain, customer_id)
  where customer_id is not null;
create index if not exists commerce_customer_holds_idx
  on public.commerce_customer_state (lifecycle_hold_until)
  where lifecycle_hold_until is not null;

create table if not exists public.commerce_lifecycle_outbox (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid references public.commerce_lifecycle_receipts(id) on delete restrict,
  shop_domain text not null,
  email text not null,
  source_order_id text,
  event_name text not null,
  journey_type text not null,
  payload jsonb not null,
  status text not null default 'held',
  hold_reason text,
  available_at timestamptz not null default now(),
  next_attempt_at timestamptz not null default now(),
  attempts integer not null default 0,
  max_attempts integer not null default 6,
  locked_at timestamptz,
  completed_at timestamptz,
  last_error text,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint commerce_outbox_email_normalized check (email = lower(btrim(email))),
  constraint commerce_outbox_event_namespace check (event_name ~ '^bl_[a-z0-9_]+_v1$'),
  constraint commerce_outbox_journey check (
    journey_type in ('authority', 'subscription_projection', 'delivery_estimate', 'replenishment')
  ),
  constraint commerce_outbox_status check (
    status in ('held', 'pending', 'processing', 'succeeded', 'failed', 'suppressed', 'cancelled')
  ),
  constraint commerce_outbox_attempts check (attempts >= 0 and max_attempts between 1 and 20)
);

create unique index if not exists commerce_outbox_idempotency_unique
  on public.commerce_lifecycle_outbox (idempotency_key);
create index if not exists commerce_outbox_ready_idx
  on public.commerce_lifecycle_outbox (available_at, created_at)
  where status in ('pending', 'processing');

alter table public.commerce_lifecycle_receipts enable row level security;
alter table public.commerce_orders enable row level security;
alter table public.commerce_customer_state enable row level security;
alter table public.commerce_lifecycle_outbox enable row level security;

revoke all on table public.commerce_lifecycle_receipts from anon, authenticated;
revoke all on table public.commerce_orders from anon, authenticated;
revoke all on table public.commerce_customer_state from anon, authenticated;
revoke all on table public.commerce_lifecycle_outbox from anon, authenticated;

create or replace function public.commerce_contact_properties(p_shop_domain text, p_email text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_strip_nulls(jsonb_build_object(
    'CUSTOMER_STATUS', case when cs.order_count > 1 then 'repeat' else 'customer' end,
    'ORDER_COUNT', cs.order_count,
    'LAST_ORDER_ID', cs.last_order_id,
    'LAST_ORDER_AT', case when cs.last_order_at is null then null else to_char(cs.last_order_at at time zone 'UTC', 'YYYY-MM-DD') end,
    'LAST_ORDER_STATUS', case
      when cs.lifecycle_hard_exit then 'exited'
      when cs.last_delivered_at is not null then 'delivered'
      when cs.last_fulfilled_at is not null then 'fulfilled'
      else 'paid'
    end,
    'LAST_ORDER_BOTTLE_COUNT', cs.last_order_bottle_count,
    'LAST_ORDER_IS_SUBSCRIPTION', cs.last_order_is_subscription,
    'LAST_FULFILLED_AT', case when cs.last_fulfilled_at is null then null else to_char(cs.last_fulfilled_at at time zone 'UTC', 'YYYY-MM-DD') end,
    'LAST_DELIVERED_AT', case when cs.last_delivered_at is null then null else to_char(cs.last_delivered_at at time zone 'UTC', 'YYYY-MM-DD') end,
    'LAST_REFUNDED_AT', case when cs.last_refunded_at is null then null else to_char(cs.last_refunded_at at time zone 'UTC', 'YYYY-MM-DD') end,
    'HAS_SUBSCRIPTION_ORDER', cs.has_subscription_order,
    'LAST_SUBSCRIPTION_ORDER_AT', case when cs.last_subscription_order_at is null then null else to_char(cs.last_subscription_order_at at time zone 'UTC', 'YYYY-MM-DD') end,
    'SUBSCRIPTION_PLAN_ID', cs.last_subscription_plan_id,
    'SUBSCRIPTION_PROJECTION', cs.subscription_projection,
    'MARKETING_CONSENT_STATE', cs.marketing_consent_state,
    'LIFECYCLE_HOLD_UNTIL', case when cs.lifecycle_hold_until is null then null else to_char(cs.lifecycle_hold_until at time zone 'UTC', 'YYYY-MM-DD') end
  ))
  from public.commerce_customer_state cs
  where cs.shop_domain = p_shop_domain and cs.email = p_email;
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
  v_receipt_id uuid;
  v_existing_receipt_id uuid;
  v_shop text := lower(p_signal->>'shop_domain');
  v_source_event_id text := p_signal->>'source_event_id';
  v_topic text := p_signal->>'topic';
  v_event_type text := p_signal->>'event_type';
  v_occurred_at timestamptz := (p_signal->>'occurred_at')::timestamptz;
  v_order_id text := nullif(p_signal->>'order_id', '');
  v_customer_id text := nullif(p_signal->>'customer_id', '');
  v_email text := lower(nullif(btrim(p_signal->>'email'), ''));
  v_consent text := coalesce(nullif(p_signal->>'marketing_consent_state', ''), 'unknown');
  v_projection text := nullif(p_signal->>'subscription_projection', '');
  v_tag_count integer := case when p_signal ? 'subscription_tag_count' and p_signal->>'subscription_tag_count' <> ''
    then (p_signal->>'subscription_tag_count')::integer else null end;
  v_is_new_paid boolean := false;
  v_is_subscription boolean := null;
  v_purchased_bottles integer := null;
  v_product_refund boolean := coalesce((p_signal->>'has_product_line_refund')::boolean, false);
  v_full_refund boolean := coalesce((p_signal->>'is_full_order_refund')::boolean, false);
  v_brevo_event_name text;
  v_status text;
  v_hold_reason text;
  v_payload jsonb;
  v_order commerce_orders%rowtype;
  v_customer commerce_customer_state%rowtype;
begin
  select clr.id into v_existing_receipt_id
  from public.commerce_lifecycle_receipts clr
  where clr.source = p_signal->>'source'
    and clr.shop_domain = v_shop
    and clr.topic = v_topic
    and clr.source_event_id = v_source_event_id;
  if v_existing_receipt_id is not null then
    return query select v_existing_receipt_id, true, null::text;
    return;
  end if;

  insert into public.commerce_lifecycle_receipts (
    source, source_event_id, shop_domain, topic, event_type, api_version,
    resource_id, payload_sha256, occurred_at
  ) values (
    p_signal->>'source', v_source_event_id, v_shop, v_topic, v_event_type,
    nullif(p_signal->>'api_version', ''), coalesce(v_order_id, v_customer_id),
    p_signal->>'payload_sha256', v_occurred_at
  )
  on conflict (source, shop_domain, topic, source_event_id) do nothing
  returning id into v_receipt_id;

  if v_receipt_id is null then
    select clr.id into v_existing_receipt_id
    from public.commerce_lifecycle_receipts clr
    where clr.source = p_signal->>'source'
      and clr.shop_domain = v_shop
      and clr.topic = v_topic
      and clr.source_event_id = v_source_event_id;
    return query select v_existing_receipt_id, true, null::text;
    return;
  end if;

  if v_email is null and v_order_id is not null then
    select co.email into v_email
    from public.commerce_orders co
    where co.shop_domain = v_shop and co.order_id = v_order_id;
  end if;
  if v_email is null and v_customer_id is not null then
    select cs.email into v_email
    from public.commerce_customer_state cs
    where cs.shop_domain = v_shop and cs.customer_id = v_customer_id;
  end if;

  if v_event_type = 'order_paid' then
    v_purchased_bottles := (p_signal->>'purchased_bottles')::integer;
    v_is_subscription := (p_signal->>'is_subscription_order')::boolean;
    select not exists (
      select 1 from public.commerce_orders co
      where co.shop_domain = v_shop and co.order_id = v_order_id and co.paid_at is not null
    ) into v_is_new_paid;

    insert into public.commerce_orders (
      shop_domain, order_id, customer_id, email, paid_at, purchased_bottles,
      is_subscription_order, subscription_plan_id
    ) values (
      v_shop, v_order_id, v_customer_id, v_email, v_occurred_at, v_purchased_bottles,
      v_is_subscription, nullif(p_signal->>'subscription_plan_id', '')
    )
    on conflict (shop_domain, order_id) do update set
      customer_id = coalesce(excluded.customer_id, commerce_orders.customer_id),
      email = coalesce(excluded.email, commerce_orders.email),
      paid_at = coalesce(commerce_orders.paid_at, excluded.paid_at),
      purchased_bottles = excluded.purchased_bottles,
      is_subscription_order = excluded.is_subscription_order,
      subscription_plan_id = excluded.subscription_plan_id,
      updated_at = now();

    if v_email is not null then
      insert into public.commerce_customer_state (
        shop_domain, email, customer_id, marketing_consent_state, order_count,
        last_order_id, last_order_at, last_order_bottle_count, last_order_is_subscription,
        has_subscription_order, last_subscription_order_at, last_subscription_plan_id,
        replenishment_blocked, lifecycle_hard_exit, lifecycle_hard_exit_at
      ) values (
        v_shop, v_email, v_customer_id, v_consent, case when v_is_new_paid then 1 else 0 end,
        v_order_id, v_occurred_at, v_purchased_bottles, v_is_subscription,
        v_is_subscription, case when v_is_subscription then v_occurred_at else null end,
        nullif(p_signal->>'subscription_plan_id', ''), v_is_subscription, false, null
      )
      on conflict (shop_domain, email) do update set
        customer_id = coalesce(excluded.customer_id, commerce_customer_state.customer_id),
        marketing_consent_state = case when v_consent = 'unknown'
          then commerce_customer_state.marketing_consent_state else v_consent end,
        order_count = commerce_customer_state.order_count + case when v_is_new_paid then 1 else 0 end,
        last_order_id = case when commerce_customer_state.last_order_at is null or excluded.last_order_at >= commerce_customer_state.last_order_at
          then excluded.last_order_id else commerce_customer_state.last_order_id end,
        last_order_at = greatest(commerce_customer_state.last_order_at, excluded.last_order_at),
        last_order_bottle_count = case when commerce_customer_state.last_order_at is null or excluded.last_order_at >= commerce_customer_state.last_order_at
          then excluded.last_order_bottle_count else commerce_customer_state.last_order_bottle_count end,
        last_order_is_subscription = case when commerce_customer_state.last_order_at is null or excluded.last_order_at >= commerce_customer_state.last_order_at
          then excluded.last_order_is_subscription else commerce_customer_state.last_order_is_subscription end,
        has_subscription_order = commerce_customer_state.has_subscription_order or excluded.has_subscription_order,
        last_subscription_order_at = case when v_is_subscription
          then greatest(commerce_customer_state.last_subscription_order_at, v_occurred_at)
          else commerce_customer_state.last_subscription_order_at end,
        last_subscription_plan_id = case when v_is_subscription
          then excluded.last_subscription_plan_id else commerce_customer_state.last_subscription_plan_id end,
        replenishment_blocked = case
          when v_is_subscription then true
          when commerce_customer_state.subscription_projection in ('active', 'paused', 'unknown', 'unknown_conflict') then true
          when commerce_customer_state.has_subscription_order
            and commerce_customer_state.subscription_projection not in ('cancelled', 'expired', 'failed') then true
          when commerce_customer_state.subscription_projection in ('cancelled', 'expired', 'failed')
            and v_occurred_at > coalesce(commerce_customer_state.subscription_projection_observed_at, '-infinity'::timestamptz)
            then false
          else commerce_customer_state.replenishment_blocked
        end,
        lifecycle_hard_exit = case
          when v_consent = 'subscribed'
            and (
              commerce_customer_state.lifecycle_hard_exit_at is null
              or v_occurred_at > commerce_customer_state.lifecycle_hard_exit_at
            ) then false
          else commerce_customer_state.lifecycle_hard_exit end,
        lifecycle_hard_exit_at = case
          when v_consent = 'subscribed'
            and commerce_customer_state.lifecycle_hard_exit_at is not null
            and v_occurred_at > commerce_customer_state.lifecycle_hard_exit_at then null
          else commerce_customer_state.lifecycle_hard_exit_at end,
        updated_at = now();

      -- A later paid order replaces only older replenishment journeys. Existing
      -- PushOwl order/cart exits remain active as an independent fail-safe.
      update public.commerce_lifecycle_outbox clo
      set status = 'cancelled', hold_reason = 'superseded_by_later_order', updated_at = now()
      where clo.shop_domain = v_shop and clo.email = v_email
        and clo.journey_type = 'replenishment'
        and clo.status in ('pending', 'processing', 'held')
        and clo.source_order_id <> v_order_id;
    end if;
  elsif v_event_type = 'order_cancelled' then
    insert into public.commerce_orders (shop_domain, order_id, email, cancelled_at)
    values (v_shop, v_order_id, v_email, v_occurred_at)
    on conflict (shop_domain, order_id) do update set
      email = coalesce(excluded.email, commerce_orders.email),
      cancelled_at = greatest(commerce_orders.cancelled_at, excluded.cancelled_at),
      updated_at = now();
    if v_email is not null then
      insert into public.commerce_customer_state (
        shop_domain, email, customer_id, marketing_consent_state,
        lifecycle_hard_exit, lifecycle_hard_exit_at
      )
      values (v_shop, v_email, v_customer_id, v_consent, true, v_occurred_at)
      on conflict (shop_domain, email) do update set
        lifecycle_hard_exit = true,
        lifecycle_hard_exit_at = greatest(commerce_customer_state.lifecycle_hard_exit_at, v_occurred_at),
        updated_at = now();
    end if;
    update public.commerce_lifecycle_outbox
    set status = 'cancelled', hold_reason = 'order_cancelled', updated_at = now()
    where shop_domain = v_shop and source_order_id = v_order_id
      and status in ('pending', 'processing', 'held')
      and journey_type in ('delivery_estimate', 'replenishment');
  elsif v_event_type = 'refund_created' then
    insert into public.commerce_orders (
      shop_domain, order_id, email, refunded_bottles, has_product_line_refund,
      has_shipping_adjustment, is_full_order_refund
    ) values (
      v_shop, v_order_id, v_email, coalesce((p_signal->>'refunded_bottles_delta')::integer, 0),
      v_product_refund, not v_product_refund, v_full_refund
    )
    on conflict (shop_domain, order_id) do update set
      email = coalesce(excluded.email, commerce_orders.email),
      refunded_bottles = commerce_orders.refunded_bottles + excluded.refunded_bottles,
      has_product_line_refund = commerce_orders.has_product_line_refund or excluded.has_product_line_refund,
      has_shipping_adjustment = commerce_orders.has_shipping_adjustment or excluded.has_shipping_adjustment,
      is_full_order_refund = commerce_orders.is_full_order_refund or excluded.is_full_order_refund,
      updated_at = now();
    if v_email is not null then
      insert into public.commerce_customer_state (
        shop_domain, email, marketing_consent_state, last_refunded_at,
        lifecycle_hold_until, lifecycle_hard_exit, lifecycle_hard_exit_at
      ) values (
        v_shop, v_email, v_consent, v_occurred_at,
        case when v_product_refund and not v_full_refund then v_occurred_at + interval '60 days' else null end,
        v_full_refund, case when v_full_refund then v_occurred_at else null end
      )
      on conflict (shop_domain, email) do update set
        last_refunded_at = greatest(commerce_customer_state.last_refunded_at, excluded.last_refunded_at),
        lifecycle_hold_until = case
          when v_product_refund and not v_full_refund
            then greatest(commerce_customer_state.lifecycle_hold_until, v_occurred_at + interval '60 days')
          else commerce_customer_state.lifecycle_hold_until end,
        lifecycle_hard_exit = commerce_customer_state.lifecycle_hard_exit or v_full_refund,
        lifecycle_hard_exit_at = case when v_full_refund
          then greatest(commerce_customer_state.lifecycle_hard_exit_at, v_occurred_at)
          else commerce_customer_state.lifecycle_hard_exit_at end,
        updated_at = now();
    end if;
    update public.commerce_lifecycle_outbox
    set status = 'cancelled',
        hold_reason = case when v_product_refund then 'product_line_refund' else 'shipping_adjustment_no_urgency' end,
        updated_at = now()
    where shop_domain = v_shop and source_order_id = v_order_id
      and status in ('pending', 'processing', 'held')
      and (journey_type = 'replenishment' or (v_product_refund and journey_type = 'delivery_estimate'));
  elsif v_event_type = 'order_fulfilled' then
    insert into public.commerce_orders (shop_domain, order_id, email, fulfilled_at)
    values (v_shop, v_order_id, v_email, v_occurred_at)
    on conflict (shop_domain, order_id) do update set
      email = coalesce(excluded.email, commerce_orders.email),
      fulfilled_at = least(commerce_orders.fulfilled_at, excluded.fulfilled_at),
      updated_at = now();
    if v_email is not null then
      insert into public.commerce_customer_state (shop_domain, email, marketing_consent_state, last_fulfilled_at)
      values (v_shop, v_email, v_consent, v_occurred_at)
      on conflict (shop_domain, email) do update set
        last_fulfilled_at = greatest(commerce_customer_state.last_fulfilled_at, excluded.last_fulfilled_at),
        updated_at = now();
    end if;
  elsif v_event_type = 'order_delivered' then
    insert into public.commerce_orders (shop_domain, order_id, email, delivered_at)
    values (v_shop, v_order_id, v_email, v_occurred_at)
    on conflict (shop_domain, order_id) do update set
      email = coalesce(excluded.email, commerce_orders.email),
      delivered_at = greatest(commerce_orders.delivered_at, excluded.delivered_at),
      updated_at = now();
    if v_email is not null then
      insert into public.commerce_customer_state (shop_domain, email, marketing_consent_state, last_delivered_at)
      values (v_shop, v_email, v_consent, v_occurred_at)
      on conflict (shop_domain, email) do update set
        last_delivered_at = greatest(commerce_customer_state.last_delivered_at, excluded.last_delivered_at),
        updated_at = now();
    end if;
    update public.commerce_lifecycle_outbox
    set status = 'cancelled', hold_reason = 'actual_delivery_received', updated_at = now()
    where shop_domain = v_shop and source_order_id = v_order_id
      and journey_type = 'delivery_estimate' and status in ('pending', 'processing', 'held');
  elsif v_event_type = 'subscription_projection_observed' then
    if v_email is not null then
      insert into public.commerce_customer_state (
        shop_domain, email, customer_id, marketing_consent_state,
        subscription_projection, subscription_projection_observed_at,
        subscription_tag_count, replenishment_blocked
      ) values (
        v_shop, v_email, v_customer_id, v_consent, v_projection,
        case when v_tag_count > 0 then v_occurred_at else null end,
        v_tag_count,
        coalesce(v_projection in ('active', 'paused', 'unknown', 'unknown_conflict'), true)
      )
      on conflict (shop_domain, email) do update set
        customer_id = coalesce(excluded.customer_id, commerce_customer_state.customer_id),
        marketing_consent_state = case when v_consent = 'unknown'
          then commerce_customer_state.marketing_consent_state else v_consent end,
        -- Flow removes old tags before adding the new one. A zero-tag webhook
        -- is therefore an intermediate observation and must preserve state.
        subscription_projection = case
          when v_tag_count = 0 then commerce_customer_state.subscription_projection
          when commerce_customer_state.subscription_projection_observed_at is null
            or v_occurred_at >= commerce_customer_state.subscription_projection_observed_at then v_projection
          else commerce_customer_state.subscription_projection end,
        subscription_projection_observed_at = case
          when v_tag_count > 0 and (
            commerce_customer_state.subscription_projection_observed_at is null
            or v_occurred_at >= commerce_customer_state.subscription_projection_observed_at
          ) then v_occurred_at else commerce_customer_state.subscription_projection_observed_at end,
        subscription_tag_count = case
          when v_tag_count > 0 then v_tag_count else commerce_customer_state.subscription_tag_count end,
        replenishment_blocked = case
          when v_tag_count = 0 then commerce_customer_state.replenishment_blocked
          when v_projection in ('active', 'paused', 'unknown', 'unknown_conflict') then true
          when v_projection in ('cancelled', 'expired', 'failed') then true
          else commerce_customer_state.replenishment_blocked end,
        updated_at = now();
    end if;
  end if;

  if v_email is null and v_order_id is not null then
    select co.email into v_email from public.commerce_orders co
    where co.shop_domain = v_shop and co.order_id = v_order_id;
  end if;
  if v_email is not null then
    select * into v_customer from public.commerce_customer_state cs
    where cs.shop_domain = v_shop and cs.email = v_email;
  end if;
  if v_order_id is not null then
    select * into v_order from public.commerce_orders co
    where co.shop_domain = v_shop and co.order_id = v_order_id;
  end if;

  v_brevo_event_name := case v_event_type
    when 'order_paid' then 'bl_order_paid_v1'
    when 'order_cancelled' then 'bl_order_cancelled_v1'
    when 'refund_created' then 'bl_refund_created_v1'
    when 'order_fulfilled' then 'bl_order_fulfilled_v1'
    when 'order_delivered' then 'bl_order_delivered_v1'
    when 'subscription_projection_observed' then 'bl_subscription_projection_v1'
  end;
  v_status := case when p_publish_enabled and v_customer.marketing_consent_state = 'subscribed'
    then 'pending' else 'held' end;
  v_hold_reason := case
    when not p_publish_enabled then 'audit_mode'
    when v_email is null then 'missing_email'
    when v_customer.marketing_consent_state <> 'subscribed' then 'no_positive_consent'
    else null end;

  if v_email is not null and v_brevo_event_name is not null
    and not (v_event_type = 'subscription_projection_observed' and coalesce(v_tag_count, 0) = 0) then
    v_payload := jsonb_build_object(
      'event_name', v_brevo_event_name,
      'event_date', v_occurred_at,
      'identifiers', jsonb_build_object('email_id', v_email),
      'contact_properties', coalesce(public.commerce_contact_properties(v_shop, v_email), '{}'::jsonb),
      'event_properties', jsonb_strip_nulls(jsonb_build_object(
        'order_id', v_order_id,
        'bottle_count', v_order.purchased_bottles,
        'refunded_bottle_count', v_order.refunded_bottles,
        'product_line_refund', case when v_event_type = 'refund_created' then v_product_refund else null end,
        'full_order_refund', case when v_event_type = 'refund_created' then v_full_refund else null end,
        'subscription_order', v_order.is_subscription_order,
        'subscription_plan_id', v_order.subscription_plan_id,
        'subscription_projection', v_projection,
        'subscription_tag_count', v_tag_count
      ))
    );
    insert into public.commerce_lifecycle_outbox (
      receipt_id, shop_domain, email, source_order_id, event_name, journey_type,
      payload, status, hold_reason, idempotency_key
    ) values (
      v_receipt_id, v_shop, v_email, v_order_id, v_brevo_event_name,
      case when v_event_type = 'subscription_projection_observed' then 'subscription_projection' else 'authority' end,
      v_payload, v_status, v_hold_reason, v_receipt_id::text || ':brevo-event'
    ) on conflict (idempotency_key) do nothing;
  end if;

  -- Estimated delivery is explicitly separate from an actual carrier event.
  if v_event_type = 'order_fulfilled' and v_email is not null
    and v_order.delivered_at is null and v_order.cancelled_at is null
    and not v_order.has_product_line_refund and not v_order.is_full_order_refund then
    insert into public.commerce_lifecycle_outbox (
      receipt_id, shop_domain, email, source_order_id, event_name, journey_type,
      payload, status, hold_reason, available_at, idempotency_key
    ) values (
      v_receipt_id, v_shop, v_email, v_order_id, 'bl_delivery_window_elapsed_v1', 'delivery_estimate',
      jsonb_build_object(
        'event_name', 'bl_delivery_window_elapsed_v1',
        'event_date', v_occurred_at + interval '5 days',
        'identifiers', jsonb_build_object('email_id', v_email),
        'contact_properties', public.commerce_contact_properties(v_shop, v_email),
        'event_properties', jsonb_build_object(
          'order_id', v_order_id, 'estimated', true, 'basis', 'fulfilled_plus_5d'
        )
      ),
      v_status, v_hold_reason, v_occurred_at + interval '5 days',
      v_shop || ':' || v_order_id || ':delivery-estimate-v1'
    ) on conflict (idempotency_key) do nothing;
  end if;

  if v_event_type = 'order_paid' and v_email is not null and not coalesce(v_is_subscription, false)
    and not v_customer.replenishment_blocked and v_order.cancelled_at is null
    and not v_order.has_product_line_refund and not v_order.has_shipping_adjustment
    and not v_order.is_full_order_refund then
    insert into public.commerce_lifecycle_outbox (
      receipt_id, shop_domain, email, source_order_id, event_name, journey_type,
      payload, status, hold_reason, available_at, idempotency_key
    ) values (
      v_receipt_id, v_shop, v_email, v_order_id, 'bl_replenishment_due_v1', 'replenishment',
      jsonb_build_object(
        'event_name', 'bl_replenishment_due_v1',
        'event_date', v_occurred_at + case when v_purchased_bottles >= 2 then interval '77 days' else interval '35 days' end,
        'identifiers', jsonb_build_object('email_id', v_email),
        'contact_properties', public.commerce_contact_properties(v_shop, v_email),
        'event_properties', jsonb_build_object(
          'order_id', v_order_id, 'bottle_count', v_purchased_bottles,
          'basis', case when v_purchased_bottles >= 2 then 'two_pack_day_77' else 'single_day_35' end
        )
      ),
      v_status, v_hold_reason,
      v_occurred_at + case when v_purchased_bottles >= 2 then interval '77 days' else interval '35 days' end,
      v_shop || ':' || v_order_id || ':replenishment-v1'
    ) on conflict (idempotency_key) do nothing;
  end if;

  return query select v_receipt_id, false, v_status;
end;
$$;

create or replace function public.claim_commerce_lifecycle_jobs(p_limit integer default 25)
returns table (
  id uuid,
  email text,
  payload jsonb,
  attempts integer
)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Cancel stale journeys atomically before claiming. This is the send-time
  -- commerce-state gate; the worker separately checks Brevo suppression.
  update public.commerce_lifecycle_outbox clo
  set status = 'cancelled', hold_reason = 'send_time_state_ineligible', updated_at = now()
  from public.commerce_customer_state cs
  where clo.shop_domain = cs.shop_domain and clo.email = cs.email
    and clo.status in ('pending', 'processing')
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
      or (clo.status = 'processing' and clo.locked_at < now() - interval '15 minutes')
    )
      and clo.attempts < clo.max_attempts
      and clo.next_attempt_at <= now()
      and cs.marketing_consent_state = 'subscribed'
    order by clo.available_at, clo.created_at
    for update of clo skip locked
    limit least(greatest(p_limit, 1), 100)
  ), updated as (
    update public.commerce_lifecycle_outbox clo
    set status = 'processing',
        attempts = clo.attempts + 1,
        locked_at = now(),
        payload = jsonb_set(
          clo.payload,
          '{contact_properties}',
          coalesce(public.commerce_contact_properties(clo.shop_domain, clo.email), '{}'::jsonb),
          true
        ),
        updated_at = now()
    from claimable
    where clo.id = claimable.id
    returning clo.id, clo.email, clo.payload, clo.attempts
  )
  select updated.id, updated.email, updated.payload, updated.attempts from updated;
end;
$$;

create or replace function public.complete_commerce_lifecycle_job(
  p_outbox_id uuid,
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
        when p_retryable and attempts < max_attempts then 'pending'
        else 'failed'
      end,
      next_attempt_at = case
        when p_outcome in ('succeeded', 'suppressed') then available_at
        else now() + make_interval(mins => least(1440, (power(2, least(attempts, 10)))::integer))
      end,
      locked_at = null,
      completed_at = case when p_outcome in ('succeeded', 'suppressed') then now() else null end,
      last_error = case when p_outcome = 'succeeded' then null else left(coalesce(p_error, p_outcome), 1000) end,
      updated_at = now()
  where id = p_outbox_id
  returning status into v_status;
  return v_status;
end;
$$;

revoke all on function public.commerce_contact_properties(text, text) from public, anon, authenticated;
revoke all on function public.record_commerce_lifecycle_signal(jsonb, boolean) from public, anon, authenticated;
revoke all on function public.claim_commerce_lifecycle_jobs(integer) from public, anon, authenticated;
revoke all on function public.complete_commerce_lifecycle_job(uuid, text, text, boolean) from public, anon, authenticated;

grant execute on function public.commerce_contact_properties(text, text) to service_role;
grant execute on function public.record_commerce_lifecycle_signal(jsonb, boolean) to service_role;
grant execute on function public.claim_commerce_lifecycle_jobs(integer) to service_role;
grant execute on function public.complete_commerce_lifecycle_job(uuid, text, text, boolean) to service_role;
