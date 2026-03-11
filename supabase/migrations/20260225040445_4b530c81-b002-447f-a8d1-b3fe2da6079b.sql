
-- Block all public reads on waitlist table
CREATE POLICY "Block public reads on waitlist"
  ON public.waitlist
  FOR SELECT
  USING (false);

-- Block all public reads on survey_responses table
CREATE POLICY "Block public reads on survey_responses"
  ON public.survey_responses
  FOR SELECT
  USING (false);

-- Block all public reads on analytics_events table (defense in depth)
CREATE POLICY "Block public reads on analytics_events"
  ON public.analytics_events
  FOR SELECT
  USING (false);
