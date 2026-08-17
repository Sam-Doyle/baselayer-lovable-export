import { setCapturedEmail, trackEvent } from "@/lib/analytics";
import { SKIN_CONCERNS, SKIN_QUIZ_PROMOTION, type SkinConcernId } from "@/config/promotions";

export interface SkinQuizLead {
  email: string;
  concern: SkinConcernId;
}

export async function submitSkinQuizLead({ email, concern }: SkinQuizLead): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  const concernLabel = SKIN_CONCERNS.find((item) => item.id === concern)?.label ?? concern;
  const { supabase } = await import("@/integrations/supabase/client");

  const [waitlist, survey, emailList] = await Promise.all([
    supabase.from("waitlist").insert({
      email: normalizedEmail,
      source: SKIN_QUIZ_PROMOTION.source,
    }),
    supabase.from("survey_responses").insert({
      waitlist_email: normalizedEmail,
      biggest_issue: concernLabel,
    }),
    supabase.functions.invoke("email-subscribe", {
      body: {
        email: normalizedEmail,
        source: SKIN_QUIZ_PROMOTION.source,
      },
    }),
  ]);

  // Supabase operations resolve with an error object instead of rejecting.
  // Require at least one durable lead destination before revealing the code;
  // the optional survey row must never block the promised discount.
  if (waitlist.error && emailList.error) {
    throw new Error("Lead capture failed");
  }

  setCapturedEmail(normalizedEmail);
  void trackEvent("email_signup", {
    source: SKIN_QUIZ_PROMOTION.source,
    email: normalizedEmail,
    skin_concern: concern,
    discount_code: SKIN_QUIZ_PROMOTION.code,
  });
  void trackEvent("skin_quiz_completed", {
    source: SKIN_QUIZ_PROMOTION.source,
    skin_concern: concern,
  });

  // Keep a breadcrumb in the console without exposing the submitted email.
  if (survey.error) console.warn("Skin quiz survey response was not stored.");
}
