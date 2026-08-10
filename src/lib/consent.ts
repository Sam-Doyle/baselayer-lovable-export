/*
 * COOKIE CONSENT STATE
 *
 * Single source of truth for whether the visitor has agreed to
 * non-essential (analytics/advertising) cookies and scripts. Everything
 * that loads GA4, the Meta Pixel, Meta CAPI, or writes the bl_session
 * cookie must check `hasAnalyticsConsent()` first — see src/lib/analytics.ts.
 *
 * Default (no decision on file yet) is "no" — strictly-necessary only.
 * This module never touches window/document/localStorage at module scope;
 * every access happens inside a function so it stays safe to import from
 * code that runs during the Puppeteer prerender (see vite.config.ts).
 *
 * VERSIONING: bump CONSENT_VERSION whenever the cookie inventory changes
 * (a tag is added/removed/repurposed — keep this in sync with the table in
 * src/pages/PrivacyPolicy.tsx). A stored decision for an old version is
 * treated as "no decision" so the banner reappears and the visitor makes a
 * fresh, informed choice.
 */

export const CONSENT_VERSION = 1;

const STORAGE_KEY = "bl_consent";
const CHANGE_EVENT = "bl-consent-change";
const OPEN_REQUEST_EVENT = "bl-consent-open-request";

export type ConsentChoice = "accepted" | "rejected";

export interface ConsentRecord {
  version: number;
  choice: ConsentChoice;
  timestamp: string;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/** Reads the stored decision. Returns null if none exists, it's malformed,
 *  or it was recorded against a previous CONSENT_VERSION. */
export function getStoredConsent(): ConsentRecord | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentRecord>;
    if (parsed.version !== CONSENT_VERSION) return null;
    if (parsed.choice !== "accepted" && parsed.choice !== "rejected") return null;
    return parsed as ConsentRecord;
  } catch {
    return null;
  }
}

/** True only once the visitor has explicitly accepted analytics/advertising
 *  cookies under the current CONSENT_VERSION. This is the single gate that
 *  GA4, the Meta Pixel, Meta CAPI, and the bl_session cookie must pass. */
export function hasAnalyticsConsent(): boolean {
  return getStoredConsent()?.choice === "accepted";
}

/** Records the visitor's choice and notifies any mounted listeners
 *  (the banner, and the analytics init code in App.tsx) synchronously. */
export function setConsent(choice: ConsentChoice): void {
  if (!isBrowser()) return;
  const record: ConsentRecord = { version: CONSENT_VERSION, choice, timestamp: new Date().toISOString() };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Storage unavailable (private browsing, quota, disabled) — the choice
    // still applies for the rest of this page load via the event below, it
    // just won't survive a reload. Fails safe: hasAnalyticsConsent() reads
    // storage fresh each time, so a failed write here means the site keeps
    // treating the visitor as undecided (strictly-necessary only) later.
  }
  window.dispatchEvent(new CustomEvent<ConsentRecord>(CHANGE_EVENT, { detail: record }));
}

/** Subscribes to consent decisions (accept/reject). Returns an unsubscribe
 *  function. Safe to call outside the browser — it's just a no-op there. */
export function onConsentChange(cb: (choice: ConsentChoice) => void): () => void {
  if (!isBrowser()) return () => {};
  const handler = (e: Event) => cb((e as CustomEvent<ConsentRecord>).detail.choice);
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
}

/** Called by the footer's "Cookie Preferences" affordance to bring the
 *  banner back so the visitor can change their earlier choice. Does not
 *  itself change the stored decision — only a subsequent Accept/Reject
 *  click does that. */
export function requestConsentReview(): void {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(OPEN_REQUEST_EVENT));
}

/** Subscribes to "please show the banner again" requests. Returns an
 *  unsubscribe function. */
export function onConsentReviewRequest(cb: () => void): () => void {
  if (!isBrowser()) return () => {};
  window.addEventListener(OPEN_REQUEST_EVENT, cb);
  return () => window.removeEventListener(OPEN_REQUEST_EVENT, cb);
}
