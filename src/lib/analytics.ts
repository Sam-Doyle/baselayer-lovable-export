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
