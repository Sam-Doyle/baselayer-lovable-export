import { SKIN_QUIZ_PROMOTION } from "@/config/promotions";

export const EMAIL_CAMPAIGN_SESSION_KEY = "bl_email_campaign_session";

export const EMAIL_CAMPAIGN_UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

const EMAIL_LANDING_TARGETS = new Set(["offer", "formula", "results", "reviews"]);
const MAX_CAMPAIGN_VALUE_LENGTH = 200;

function safeSessionStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function sessionGet(key: string): string | null {
  try {
    return safeSessionStorage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function sessionSet(key: string, value: string): void {
  try {
    safeSessionStorage()?.setItem(key, value);
  } catch {
    // Storage is optional in privacy-restricted browsers. The current URL
    // remains sufficient to suppress the quiz for this render.
  }
}

function paramsFrom(search: string): URLSearchParams {
  return new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
}

function isEmailMedium(value: string | null): boolean {
  return value?.trim().toLowerCase() === "email";
}

/**
 * Marks the current tab as an email-origin session. The tab-scoped marker is
 * deliberate: a subscriber should not be asked for their email again after
 * following an in-app link that drops the original query string, but a future
 * organic visit should still be eligible for the quiz.
 */
export function captureEmailCampaignSession(search: string): boolean {
  const params = paramsFrom(search);
  if (isEmailMedium(params.get("utm_medium"))) {
    sessionSet(EMAIL_CAMPAIGN_SESSION_KEY, "true");
  }
  return isEmailMedium(params.get("utm_medium")) || sessionGet(EMAIL_CAMPAIGN_SESSION_KEY) === "true";
}

export function isEmailCampaignSession(search: string): boolean {
  const params = paramsFrom(search);
  return isEmailMedium(params.get("utm_medium"))
    || sessionGet(EMAIL_CAMPAIGN_SESSION_KEY) === "true";
}

/** Explicit preview always wins so QA can inspect the quiz from an email URL. */
export function shouldSuppressQuizForEmailCampaign(search: string): boolean {
  const params = paramsFrom(search);
  if (params.get("quiz") === "preview") return false;
  return isEmailCampaignSession(search);
}

/** Only the published first-order code can be activated from a campaign URL. */
export function promisedEmailDiscount(search: string): string | null {
  if (!isEmailCampaignSession(search)) return null;
  const code = paramsFrom(search).get("discount")?.trim().toUpperCase();
  return code === SKIN_QUIZ_PROMOTION.code ? code : null;
}

/**
 * Returns the allow-listed PDP target for deterministic campaign deep links.
 * Unknown fragments are ignored instead of being used as arbitrary selectors.
 */
export function emailLandingTarget(hash: string): string | null {
  try {
    const target = decodeURIComponent(hash.replace(/^#/, "")).trim();
    return EMAIL_LANDING_TARGETS.has(target) ? target : null;
  } catch {
    return null;
  }
}

/**
 * Carries first-party campaign attribution into Shopify checkout without
 * touching its required `key` parameter or replacing values supplied by the
 * current checkout URL. Values are bounded before crossing the domain.
 */
export function appendStoredEmailCampaignParams(url: URL): URL {
  if (sessionGet(EMAIL_CAMPAIGN_SESSION_KEY) !== "true") return url;

  for (const key of EMAIL_CAMPAIGN_UTM_KEYS) {
    const value = sessionGet(key)?.trim();
    if (value && value.length <= MAX_CAMPAIGN_VALUE_LENGTH && !url.searchParams.has(key)) {
      url.searchParams.set(key, value);
    }
  }
  return url;
}
