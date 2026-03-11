
CREATE TABLE public.survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  waitlist_email TEXT NOT NULL,
  biggest_issue TEXT,
  would_try TEXT,
  preference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert survey responses"
ON public.survey_responses
FOR INSERT
WITH CHECK (true);
