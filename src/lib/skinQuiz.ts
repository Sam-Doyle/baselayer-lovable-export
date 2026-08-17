import { setCapturedEmail, trackEvent } from "@/lib/analytics";
import { SKIN_QUIZ_PROMOTION, type SkinConcernId } from "@/config/promotions";

export const SKIN_QUIZ_CONSENT_VERSION = "skin-quiz-email-v1";
export const SKIN_QUIZ_CONSENT_TEXT =
  "By signing up, you agree to receive Base Layer emails. Unsubscribe anytime. See our Privacy Policy.";

export interface SkinQuizLead {
  submissionId: string;
  email: string;
  concern: SkinConcernId;
  consent: {
    capturedAt: string;
    disclosureVersion: typeof SKIN_QUIZ_CONSENT_VERSION;
  };
  botSignals: {
    website: string;
    formStartedAt: number | null;
  };
}

interface SubscribeResponse {
  success?: boolean;
  lead_id?: string;
  sync_status?: "succeeded" | "pending" | "failed";
  duplicate?: boolean;
}

const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

function safeStorageValue(key: string): string | null {
  try {
    const value = window.sessionStorage.getItem(key)?.trim();
    if (!value) return null;
    // Marketing parameters are untrusted URL input. Keep the useful portion,
    // strip control characters, and never forward arbitrary query strings.
    return Array.from(value)
      .filter((character) => {
        const code = character.charCodeAt(0);
        return code >= 32 && code !== 127;
      })
      .join("")
      .slice(0, 160) || null;
  } catch {
    return null;
  }
}

function safeAcquisitionSource(value: string | null): string {
  if (!value) return SKIN_QUIZ_PROMOTION.source;
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9_.:-]+/gu, "_")
    .replace(/^_+|_+$/gu, "")
    .slice(0, 64);
  return normalized || SKIN_QUIZ_PROMOTION.source;
}

function safeReferrer(): string | null {
  try {
    return document.referrer ? new URL(document.referrer).hostname.slice(0, 160) : null;
  } catch {
    return null;
  }
}

export function createSkinQuizSubmissionId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
}

export async function submitSkinQuizLead({ submissionId, email, concern, consent, botSignals }: SkinQuizLead): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  const utms = Object.fromEntries(ATTRIBUTION_KEYS.map((key) => [key, safeStorageValue(key)]));
  const acquisitionSource = safeAcquisitionSource(utms.utm_source);
  const { supabase } = await import("@/integrations/supabase/client");

  const { data, error } = await supabase.functions.invoke<SubscribeResponse>("email-subscribe", {
    body: {
      request_version: 2,
      submission_id: submissionId,
      email: normalizedEmail,
      concern,
      source: SKIN_QUIZ_PROMOTION.source,
      discount_code: SKIN_QUIZ_PROMOTION.code,
      attribution: {
        first_source: acquisitionSource,
        last_source: SKIN_QUIZ_PROMOTION.source,
        ...utms,
        landing_path: window.location.pathname.slice(0, 300),
        referrer: safeReferrer(),
      },
      consent: {
        version: consent.disclosureVersion,
        text: SKIN_QUIZ_CONSENT_TEXT,
        captured_at: consent.capturedAt,
        source: SKIN_QUIZ_PROMOTION.source,
      },
      client: {
        honeypot: botSignals.website,
        form_started_at: botSignals.formStartedAt,
      },
    },
  });

  // The v2 endpoint acknowledges only after the lead is durable. A pending
  // Brevo sync is safe: the outbox will retry without asking the shopper to
  // submit again. Invalid or rejected responses keep the discount locked.
  if (error || !data?.success) throw new Error("Lead capture failed");

  setCapturedEmail(normalizedEmail);
  void trackEvent("email_signup", {
    source: SKIN_QUIZ_PROMOTION.source,
    skin_concern: concern,
    discount_code: SKIN_QUIZ_PROMOTION.code,
    email_sync_status: data.sync_status,
    duplicate: data.duplicate,
  });
  void trackEvent("skin_quiz_completed", {
    source: SKIN_QUIZ_PROMOTION.source,
    skin_concern: concern,
  });

  // This only identifies an already-consented browser-side lifecycle tracker;
  // the server-side Brevo upsert above remains authoritative.
  try {
    const { identifyLifecycleContact } = await import("@/lib/lifecycle");
    identifyLifecycleContact(normalizedEmail, {
      SKIN_CONCERN: concern,
      LAST_SOURCE: SKIN_QUIZ_PROMOTION.source,
      CONSENT_VERSION: SKIN_QUIZ_CONSENT_VERSION,
      DISCOUNT_CODE: SKIN_QUIZ_PROMOTION.code,
    });
  } catch {
    // Tracker identity is optional and must never undo a durable signup.
  }
}
