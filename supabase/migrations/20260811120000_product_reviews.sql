-- Product reviews, restricted to verified purchasers.
--
-- READ THIS BEFORE ADDING A POLICY. Every other table in this schema
-- (waitlist, survey_responses, analytics_events) carries an "anyone can
-- insert" policy. This one deliberately does not, and copying that pattern
-- here would quietly destroy the only claim the table makes: that every row
-- came from someone who actually bought the product. Writes happen in exactly
-- one place — the submit-review edge function, which checks the order against
-- the Shopify Admin API first and then writes with the service role key.
-- anon and authenticated get no INSERT grant and no INSERT policy.

CREATE TABLE public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_handle TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 80),
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 20 AND 2000),
  display_name TEXT NOT NULL CHECK (char_length(display_name) BETWEEN 2 AND 40),

  -- Proof of purchase. Never exposed publicly: reviewer_email is PII, and
  -- shopify_order_id would let anyone walk the order book.
  reviewer_email TEXT NOT NULL,
  shopify_order_id TEXT NOT NULL,
  shopify_order_name TEXT NOT NULL,

  -- Nothing publishes automatically. The Shopify check proves the purchase
  -- happened; it says nothing about whether the text is publishable. A human
  -- flips this to 'approved' in the Supabase table editor.
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- One review per order per product. The edge function proves the order is
-- real; this is what stops one real order from being replayed a hundred times.
CREATE UNIQUE INDEX product_reviews_one_per_order
  ON public.product_reviews (shopify_order_id, product_handle);

CREATE INDEX product_reviews_public_lookup
  ON public.product_reviews (product_handle, status, created_at DESC);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- No policies are defined on purpose. RLS with zero policies denies every
-- operation to anon and authenticated. The service role bypasses RLS, which is
-- how the edge function writes. The REVOKE is belt and braces against a future
-- migration that adds a permissive policy without thinking about the grant.
REVOKE ALL ON public.product_reviews FROM anon, authenticated;

-- The public read surface.
--
-- RLS is row-level, not column-level. An "approved rows are readable" policy on
-- the base table would still hand reviewer_email and shopify_order_id to anyone
-- holding the anon key, because the client controls the column list. A view is
-- the column filter.
CREATE VIEW public.public_product_reviews AS
  SELECT
    id,
    product_handle,
    rating,
    title,
    body,
    display_name,
    created_at
  FROM public.product_reviews
  WHERE status = 'approved';

-- Definer rights, deliberately. This view has to read a base table that anon
-- cannot touch; security_invoker = true would make it return zero rows for
-- every visitor. Supabase's security advisor flags definer views generically —
-- this one is the intended design, not an oversight.
ALTER VIEW public.public_product_reviews SET (security_invoker = false);

GRANT SELECT ON public.public_product_reviews TO anon, authenticated;
