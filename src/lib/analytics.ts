import { hasAnalyticsConsent } from "@/lib/consent";

let _supabase: typeof import("@/integrations/supabase/client")["supabase"] | null = null;

async function getSupabase() {
  if (!_supabase) {
    const mod = await import("@/integrations/supabase/client");
    _supabase = mod.supabase;
  }
  return _supabase;
}

/**
 * Maps internal event names → Meta standard events with default params.
 * See https://www.facebook.com/business/help/402791146561655
 */
const FB_STANDARD_EVENTS: Record<string, { event: string; defaults?: Record<string, unknown> }> = {
  view_item: { event: "ViewContent", defaults: { content_type: "product" } },
  add_to_cart: { event: "AddToCart", defaults: { content_type: "product", currency: "USD" } },
  begin_checkout: { event: "InitiateCheckout", defaults: { currency: "USD" } },
  purchase_intent: { event: "Lead", defaults: { content_type: "product", content_name: "Purchase Intent", value: 38, currency: "USD" } },
  email_signup: { event: "CompleteRegistration", defaults: { content_name: "Early Access Signup", value: 38, currency: "USD" } },
  waitlist_signup: { event: "CompleteRegistration", defaults: { content_name: "Waitlist Signup", value: 38, currency: "USD" } },
  reserve_intent: { event: "Lead", defaults: { content_type: "product", content_name: "Reserve Intent", value: 38, currency: "USD" } },
};

/** Events worth sending server-side via Conversions API for better attribution */
const CAPI_EVENTS = new Set(["email_signup", "waitlist_signup", "begin_checkout", "purchase_intent", "add_to_cart", "reserve_intent", "view_item"]);

function getSessionId(): string {
  // 1. Try to read the persistent cookie (survives IG browser closes)
  const match = document.cookie.split(";").find(c => c.trim().startsWith("bl_session="));
  let id = match ? match.split("=")[1] : null;

  // 2. Fallback to sessionStorage, then to generating a new UUID
  if (!id) {
    id = sessionStorage.getItem("bl_session") || crypto.randomUUID();
  }

  // 3. Always ensure it is written both to cookie & session for safety
  sessionStorage.setItem("bl_session", id);
  document.cookie = `bl_session=${id}; path=/; max-age=2592000`; // 30 days
  return id;
}

/** Store email after capture so all subsequent events include it */
let capturedEmail: string | null = null;
export function setCapturedEmail(email: string) {
  capturedEmail = email.trim().toLowerCase();
}

/** Read Meta cookies for deduplication */
function getMetaCookies() {
  const cookies = document.cookie.split(";").reduce((acc, c) => {
    const [k, v] = c.trim().split("=");
    if (k && v) acc[k] = v;
    return acc;
  }, {} as Record<string, string>);
  return { fbc: cookies._fbc || null, fbp: cookies._fbp || null };
}

/** Fire server-side Conversions API event (non-blocking).
 *  Uses raw fetch() with keepalive:true so the request survives page
 *  navigations — no Supabase SDK dependency on the CAPI path. */
function sendCAPI(
  eventName: string,
  eventId: string,
  payload: Record<string, unknown>
) {
  const fbMapping = FB_STANDARD_EVENTS[eventName];
  if (!fbMapping) return;

  const { fbc: cookieFbc, fbp } = getMetaCookies();
  const fbc = cookieFbc || sessionStorage.getItem("_fbc");
  const sessionId = getSessionId();
  const userData: Record<string, unknown> = {
    client_user_agent: navigator.userAgent,
    external_id: sessionId,
    ...(fbc && { fbc }),
    ...(fbp && { fbp }),
  };

  const email = (payload.email && typeof payload.email === "string")
    ? payload.email
    : capturedEmail;
  if (email) {
    userData.em = email;
  }

  const { email: _email, ...safePayload } = payload;

  fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fb-capi`, {
    method: "POST",
    keepalive: true,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({
      event_name: fbMapping.event,
      event_id: eventId,
      event_source_url: window.location.href,
      user_data: userData,
      custom_data: {
        ...fbMapping.defaults,
        ...safePayload,
        ...(sessionStorage.getItem("utm_source") && { utm_source: sessionStorage.getItem("utm_source") }),
        ...(sessionStorage.getItem("utm_medium") && { utm_medium: sessionStorage.getItem("utm_medium") }),
        ...(sessionStorage.getItem("utm_campaign") && { utm_campaign: sessionStorage.getItem("utm_campaign") }),
      },
    }),
  }).catch(() => { });
}

export async function trackEvent(eventName: string, payload: Record<string, unknown> = {}) {
  // Consent gate: until the visitor has explicitly accepted analytics
  // cookies (src/lib/consent.ts), every event is dropped here — nothing
  // reaches gtag/fbq/CAPI/Supabase, and getSessionId() below (which writes
  // the bl_session cookie) never runs. Events fired before a decision are
  // NOT queued; they're simply lost, which is intentional — queuing and
  // replaying arbitrary interaction events (add_to_cart, etc.) risks
  // sending stale/misleading data once consent is later granted.
  if (!hasAnalyticsConsent()) return;

  // Generate a unique event_id for deduplication between pixel + CAPI
  const eventId = crypto.randomUUID();

  // GA4 + Meta Pixel (browser-side)
  try {
    const w = window as any;

    // GA4 via gtag() — fires properly with gtag.js (no GTM needed)
    if (typeof w.gtag === "function") {
      const { email: _email, ...safePayload } = payload;
      w.gtag("event", eventName, safePayload);
    }

    // Meta Pixel — standard events with required params
    const fbMapping = FB_STANDARD_EVENTS[eventName];
    if (fbMapping && typeof w.fbq === "function") {
      w.fbq("track", fbMapping.event, { ...fbMapping.defaults, ...payload }, { eventID: eventId });
    }
  } catch {
    // silently ignore
  }

  // Server-side Conversions API for high-value events
  if (CAPI_EVENTS.has(eventName)) {
    sendCAPI(eventName, eventId, payload);
  }

  // Supabase analytics
  try {
    const supabase = await getSupabase();
    await supabase.from("analytics_events").insert({
      event_name: eventName,
      payload: payload as any,
      session_id: getSessionId(),
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
    });
  } catch {
    // non-blocking
  }
}

/* ────────────────────────────────────────────────────────────────
 * ANALYTICS INITIALIZATION — GA4, Meta Pixel, Meta CAPI page view
 *
 * Moved here from App.tsx (verbatim logic, relocated) so the same code can
 * run at two points: on mount if a consent decision already says
 * "accepted" (returning visitor), and again the moment the visitor clicks
 * Accept on the cookie banner — so the page_view/PageView that would have
 * fired on load fires immediately instead of being lost. Both functions
 * self-gate on hasAnalyticsConsent() and on the bot/iframe flag App.tsx
 * sets on window.__META_PIXEL_DISABLED__, so callers can invoke them
 * unconditionally.
 * ──────────────────────────────────────────────────────────────── */

/** True until the visitor has granted analytics consent, or if the
 *  bot/iframe flag (window.__META_PIXEL_DISABLED__, set in App.tsx) is set.
 *  This is the single gate every GA4/Meta call site in this app must check
 *  — reads consent fresh from storage on every call, so callers that check
 *  it at fire time (rather than caching the result) pick up a consent
 *  change without needing a page reload. Exported so MetaRouterTracker.tsx
 *  (the route-change PageView tracker) can reuse the same gate instead of
 *  relying on the bot/iframe flag alone. */
export function analyticsBlocked(): boolean {
  const flagged = (window as unknown as { __META_PIXEL_DISABLED__?: boolean }).__META_PIXEL_DISABLED__;
  return !hasAnalyticsConsent() || !!flagged;
}

/** Fires the immediate server-side Meta CAPI PageView and upgrades
 *  bl_session/_fbp to persistent cookies. Consent-gated. */
export function fireInitialCapiPageView(): void {
  if (analyticsBlocked()) return;

  const pageViewEventId = crypto.randomUUID();
  (window as any).__BL_PV_EID = pageViewEventId;

  const bl = (window as any).__BL || { u: location.href, q: location.search };
  const cookies = document.cookie.split(";").reduce((acc, c) => {
    const [k, v] = c.trim().split("=");
    if (k && v) acc[k] = v;
    return acc;
  }, {} as Record<string, string>);

  // Immediate _fbp generation to bypass Race Condition. (The bot/iframe
  // check that used to guard this lives in analyticsBlocked() above —
  // reaching this line already means neither is true.)
  let fbp = cookies._fbp || null;
  if (!fbp) {
    // format: fb.subdomainIndex.creationTime.random
    fbp = `fb.1.${Date.now()}.${Math.floor(Math.random() * 10000000000)}`;
    const domain = window.location.hostname.replace("www.", "");
    document.cookie = `_fbp=${fbp}; path=/; max-age=7776000; domain=${domain}`; // 90 days
  }

  const fbc = cookies._fbc || sessionStorage.getItem("_fbc") || null;

  // Upgrade bl_session to persistent cookie (max-age 30 days)
  let sessionId = cookies.bl_session;
  if (!sessionId) {
    sessionId = sessionStorage.getItem("bl_session") || crypto.randomUUID();
    sessionStorage.setItem("bl_session", sessionId);
    document.cookie = `bl_session=${sessionId}; path=/; max-age=2592000`; // 30 days
  }

  fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fb-capi`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({
      event_name: "PageView",
      event_id: pageViewEventId,
      event_source_url: bl.u,
      user_data: {
        client_user_agent: navigator.userAgent,
        external_id: sessionId,
        ...(fbc && { fbc }),
        ...(fbp && { fbp }),
      },
      custom_data: {
        ...(sessionStorage.getItem("utm_source") && { utm_source: sessionStorage.getItem("utm_source") }),
        ...(sessionStorage.getItem("utm_medium") && { utm_medium: sessionStorage.getItem("utm_medium") }),
        ...(sessionStorage.getItem("utm_campaign") && { utm_campaign: sessionStorage.getItem("utm_campaign") }),
      },
    }),
  }).catch(() => { });
}

let _analyticsScriptsInitialized = false;

/** Loads GA4 (gtag.js) and the Meta Pixel and fires their first page_view /
 *  PageView. Consent-gated, and safe to call more than once — the GA4 and
 *  Meta Pixel branches already no-op if already loaded, and a local flag
 *  short-circuits repeat calls regardless. */
export function initAnalyticsScripts(): void {
  if (analyticsBlocked()) return;
  if (_analyticsScriptsInitialized) return;
  _analyticsScriptsInitialized = true;

  const w = window as any;
  const bl = w.__BL || { u: location.href, q: location.search };
  const landingParams = new URLSearchParams(bl.q || "");

  // ── GA4 (gtag.js) ──
  if (!document.querySelector('script[src*="googletagmanager.com/gtag"]')) {
    const gtagScript = document.createElement("script");
    gtagScript.src = "https://www.googletagmanager.com/gtag/js?id=G-E1GTL9RHY0";
    gtagScript.async = true;
    document.head.appendChild(gtagScript);

    w.dataLayer = w.dataLayer || [];
    w.gtag = function () { w.dataLayer.push(arguments); };
    w.gtag("js", new Date());
    w.gtag("config", "G-E1GTL9RHY0", {
      send_page_view: true,
      page_location: bl.u,
      // Pass UTMs explicitly so GA4 attributes correctly even if
      // the URL has already been rewritten by React Router
      ...(landingParams.get("utm_source") && { campaign_source: landingParams.get("utm_source") }),
      ...(landingParams.get("utm_medium") && { campaign_medium: landingParams.get("utm_medium") }),
      ...(landingParams.get("utm_campaign") && { campaign_name: landingParams.get("utm_campaign") }),
      ...(landingParams.get("utm_content") && { campaign_content: landingParams.get("utm_content") }),
      ...(landingParams.get("utm_term") && { campaign_term: landingParams.get("utm_term") }),
    });
  }

  // ── Meta Pixel ──
  if (!w.fbq) {
    const f = w;
    const n = (f.fbq = function () {
      // eslint-disable-next-line prefer-rest-params
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    });
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];

    const fbScript = document.createElement("script");
    fbScript.src = "https://connect.facebook.net/en_US/fbevents.js";
    fbScript.async = true;
    document.head.appendChild(fbScript);

    w.fbq("init", "916078074161719");
    // Use the same event_id as the CAPI PageView for deduplication
    w.fbq("track", "PageView", {}, { eventID: (window as any).__BL_PV_EID });
  }
}

/** Best-effort cleanup for a visitor who had accepted and then revokes via
 *  the footer's "Cookie Preferences" link. Only clears the cookies this
 *  file writes directly (bl_session, _fbp) — it cannot retroactively purge
 *  GA4's own _ga/_ga_* cookies or unload an already-injected gtag.js /
 *  fbevents.js, since a loaded script can't be un-run. Going forward,
 *  hasAnalyticsConsent() returning false keeps trackEvent()/CAPI/bl_session
 *  off; full effect (GA4/Meta scripts not reloading at all) takes hold on
 *  the next page load. */
export function clearAnalyticsCookies(): void {
  if (typeof document === "undefined") return;
  document.cookie = "bl_session=; path=/; max-age=0";
  document.cookie = "_fbp=; path=/; max-age=0";
  try {
    sessionStorage.removeItem("bl_session");
  } catch {
    // ignore — best-effort cleanup only
  }
}
