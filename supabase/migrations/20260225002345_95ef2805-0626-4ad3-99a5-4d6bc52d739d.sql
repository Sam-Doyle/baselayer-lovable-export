
-- Waitlist table for email/checkout intent capture
CREATE TABLE public.waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'footer',
  first_name TEXT,
  last_name TEXT,
  address1 TEXT,
  address2 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  cart_items JSONB,
  cart_total NUMERIC,
  shipping_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert into waitlist"
  ON public.waitlist FOR INSERT
  WITH CHECK (true);

-- Analytics events table
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  session_id TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (true);
