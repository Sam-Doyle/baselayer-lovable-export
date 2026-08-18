-- Extend the closed journey allowlist for the due-time post-purchase signals
-- added in the previous migration.

alter table public.commerce_lifecycle_outbox
  drop constraint if exists commerce_outbox_journey;

alter table public.commerce_lifecycle_outbox
  add constraint commerce_outbox_journey check (
    journey_type in (
      'authority',
      'subscription_projection',
      'delivery_estimate',
      'replenishment',
      'postpurchase_quickstart_actual',
      'postpurchase_quickstart_estimate',
      'postpurchase_results_actual',
      'postpurchase_results_estimate'
    )
  );
