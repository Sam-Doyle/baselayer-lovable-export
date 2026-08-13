import { hasAnalyticsConsent } from "@/lib/consent";
import { DEFAULT_TIER, SINGLE_TIER, metaContentId } from "@/config/product";
import type { Metric } from "web-vitals";

interface MetaPixelFunction {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  loaded: boolean;
  push: MetaPixelFunction;
  queue: unknown[][];
  version: string;
}

let _supabase: typeof import("@/integrations/supabase/client")["supabase"] | null = null;

async function getSupabase() {
  if (!_supabase) {
    const mod = await import("@/integrations/supabase/client");
    _supabase = mod.supabase;
  }
  return _supabase;
}

/**
 * Maps internal event names → Meta events with default params.
 * See https://www.facebook.com/business/help/402791146561655
 *
 * `custom: true` sends the event through fbq("trackCustom", …) instead of
 * fbq("track", …). Meta has no standard event for "clicked a product CTA", and
 * inventing one by reusing a standard name would corrupt the standard event's
 * meaning for optimization. A custom event can still back a custom conversion,
 * which is what these are for.
 *
 * Anything absent from this table reaches GA4 and Supabase but never Meta.
 * That is deliberate for `cta_click`, which fires alongside `select_item` on
 * the article, ingredient, comparison and skin-concern pages — mapping both
 * would double-count a single click.
 *
 * Lead values come from src/config/product.ts rather than being written out
 * here. They were hardcoded at 38 through a pricing change that made the
 * 2-pack the PDP default, so Meta spent that window optimizing against a
 * number the store had stopped charging.
 */
const FB_STANDARD_EVENTS: Record<string, { event: string; custom?: boolean; defaults?: Record<string, unknown> }> = {
  view_item: { event: "ViewContent", defaults: { content_type: "product", currency: "USD" } },
  add_to_cart: { event: "AddToCart", defaults: { content_type: "product", currency: "USD" } },
  /*
   * Deliberately NOT InitiateCheckout. Shopify's own Meta pixel (web pixel
   * 2039742535, installed via the Facebook & Instagram channel) fires the
   * standard InitiateCheckout when the checkout page loads on
   * shop.baselayerskin.co. This event fires on the Checkout button click a
   * moment earlier, from a different origin with a different event id, so
   * nothing dedupes them and Meta counted two InitiateCheckouts per shopper.
   *
   * Shopify's copy is the one to keep: it fires on the checkout actually
   * opening rather than on an intent to open it, it carries Shopify's own cart
   * data, and it shares a source with the Purchase that follows. So this
   * becomes a custom event — still usable for a custom conversion or an
   * audience, no longer polluting the standard one Meta optimizes against.
   */
  begin_checkout: { event: "CheckoutClick", custom: true, defaults: { currency: "USD" } },
  purchase_intent: { event: "Lead", defaults: { content_type: "product", content_name: "Purchase Intent", value: DEFAULT_TIER.price, currency: "USD" } },
  reserve_intent: { event: "Lead", defaults: { content_type: "product", content_name: "Reserve Intent", value: DEFAULT_TIER.price, currency: "USD" } },
  // Signups are a weaker signal than a product-page intent click, so they
  // carry the single-bottle price rather than the preselected pack.
  email_signup: { event: "CompleteRegistration", defaults: { content_name: "Early Access Signup", value: SINGLE_TIER.price, currency: "USD" } },
  waitlist_signup: { event: "CompleteRegistration", defaults: { content_name: "Waitlist Signup", value: SINGLE_TIER.price, currency: "USD" } },
  // Product CTA clicks. On a cold advertorial these are the only funnel step
  // between the ad click and the PDP — without them Meta sees a PageView and
  // then nothing until an AddToCart that most visitors never reach.
  select_item: { event: "ProductCTAClick", custom: true },
  advertorial_cta_click: { event: "AdvertorialCTAClick", custom: true },
  listicle_cta_click: { event: "AdvertorialCTAClick", custom: true },
};

/** Events worth sending server-side via Conversions API for better attribution */
const CAPI_EVENTS = new Set(["email_signup", "waitlist_signup", "begin_checkout", "purchase_intent", "add_to_cart", "reserve_intent", "view_item"]);

/**
 * Events that get a GA4 `items` array built for them.
 *
 * Every call site in this app passes Meta's parameter shape (content_ids,
 * content_name, value). GA4 ignores all of it and reads `items`, so without
 * this the Monetization and product reports are empty by construction even
 * though the events themselves arrive. Derived here rather than at ~8 call
 * sites: the inputs are already present in the payload, and one place to fix
 * beats eight places to forget.
 */
const GA4_ITEM_EVENTS = new Set(["view_item", "add_to_cart", "begin_checkout"]);

/**
 * GA4 name overrides, for the same reason as the Meta mapping above.
 *
 * Shopify's GA4 tag (Google & YouTube channel → G-E1GTL9RHY0) sends its own
 * `begin_checkout` from the checkout page, so leaving this one named
 * `begin_checkout` double-counts the step and inflates the funnel's
 * cart→checkout rate. Renaming here rather than at the call site keeps the
 * internal event name aligned with the Meta table and the items logic.
 *
 * Ordering note: until that channel is connected, GA4 has no `begin_checkout`
 * at all. Connect it in the same sitting as this ships.
 */
const GA4_EVENT_NAMES: Record<string, string> = {
  begin_checkout: "checkout_click",
};

function ga4Items(payload: Record<string, unknown>): Record<string, unknown>[] {
  const ids = Array.isArray(payload.content_ids) ? payload.content_ids : [];
  const value = typeof payload.value === "number" ? payload.value : undefined;
  return (ids.length ? ids : [metaContentId(DEFAULT_TIER.variantGid as string)]).map((id, i) => ({
    item_id: String(id),
    item_name: typeof payload.content_name === "string" ? payload.content_name : "Base Layer Face Cream",
    item_brand: "Base Layer",
    // Split the event value across the lines it covers, so item revenue sums
    // back to the event's `value` instead of multiplying by the line count.
    ...(value !== undefined && { price: Math.round((value / Math.max(ids.length, 1)) * 100) / 100 }),
    quantity: 1,
    index: i,
  }));
}

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

/* ────────────────────────────────────────────────────────────────
 * DEFERRED-SCRIPT QUEUE
 *
 * gtag.js and fbevents.js load behind requestIdleCallback with a 3s fallback
 * (App.tsx), while pages fire their view_item from a mount effect. The effect
 * always wins that race on a hard load, and this file used to check
 * `typeof gtag === "function"` and silently drop the event when it lost.
 *
 * Measured on production before the fix: a cold load of /face-cream sent GA4
 * exactly one hit, `en=page_view`. No view_item. Meta received ViewContent
 * server-side only, because sendCAPI() is a plain fetch with no SDK to wait
 * for. So the PDP — the money page — had zero browser-side ViewContent and
 * GA4 had zero product views. It looked fine when clicking around the site,
 * because an SPA route change into the PDP happens long after the scripts
 * land. It only broke on hard landings, which is exactly what ad traffic is.
 *
 * MetaRouterTracker.tsx already solved the same race for its own PageView by
 * polling; queueing is the better shape here because it preserves the eventId
 * that the CAPI event already went out with, so pixel/CAPI dedup still holds
 * however late the browser event fires.
 * ──────────────────────────────────────────────────────────────── */

interface QueuedBrowserEvent {
  eventName: string;
  eventId: string;
  payload: Record<string, unknown>;
}

/* Bounded so a page where the scripts never arrive at all (bot, iframe,
   blocked by an extension) can't grow this without limit. Twenty-five is far
   more than the handful of events a page fires in its first three seconds. */
const PENDING_CAP = 25;
const pendingBrowserEvents: QueuedBrowserEvent[] = [];

function fireBrowserEvent({ eventName, eventId, payload }: QueuedBrowserEvent): void {
  try {
    const w = window as any;
    const { email: _email, ...safePayload } = payload;

    // GA4 via gtag() — fires properly with gtag.js (no GTM needed)
    if (typeof w.gtag === "function") {
      w.gtag("event", GA4_EVENT_NAMES[eventName] ?? eventName, {
        ...safePayload,
        ...(GA4_ITEM_EVENTS.has(eventName) && { items: ga4Items(safePayload) }),
      });
    }

    // Meta Pixel — standard events with required params
    const fbMapping = FB_STANDARD_EVENTS[eventName];
    if (fbMapping && typeof w.fbq === "function") {
      w.fbq(
        fbMapping.custom ? "trackCustom" : "track",
        fbMapping.event,
        { ...fbMapping.defaults, ...payload },
        { eventID: eventId },
      );
    }
  } catch {
    // silently ignore
  }
}

/** Sends anything that was fired before gtag/fbq existed. Called at the end
 *  of initAnalyticsScripts(), once both globals are defined. */
function flushPendingBrowserEvents(): void {
  while (pendingBrowserEvents.length) {
    fireBrowserEvent(pendingBrowserEvents.shift() as QueuedBrowserEvent);
  }
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

  // GA4 + Meta Pixel (browser-side). Fires now if the scripts have loaded,
  // otherwise waits in the queue for initAnalyticsScripts() to flush it —
  // see the DEFERRED-SCRIPT QUEUE note above.
  const w = window as any;
  const queued: QueuedBrowserEvent = { eventName, eventId, payload };
  if (typeof w.gtag === "function" || typeof w.fbq === "function") {
    fireBrowserEvent(queued);
  } else if (pendingBrowserEvents.length < PENDING_CAP) {
    pendingBrowserEvents.push(queued);
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
let _webVitalsInitialized = false;

/**
 * Records real-user Core Web Vitals after analytics consent. Keeping the
 * library behind a dynamic import prevents measurement code (and Supabase,
 * which trackEvent loads only when it writes) from entering the critical
 * homepage bundle.
 */
export function initWebVitalsReporting(): void {
  if (analyticsBlocked() || _webVitalsInitialized) return;
  _webVitalsInitialized = true;

  void import("web-vitals")
    .then(({ onCLS, onINP, onLCP }) => {
      const report = (metric: Metric) => {
        void trackEvent("web_vital", {
          metric_name: metric.name,
          value: metric.value,
          delta: metric.delta,
          rating: metric.rating,
          metric_id: metric.id,
          navigation_type: metric.navigationType,
        });
      };

      onCLS(report);
      onINP(report);
      onLCP(report);
    })
    .catch(() => {
      _webVitalsInitialized = false;
    });
}

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
    const n = ((...args: unknown[]) => {
      if (n.callMethod) n.callMethod(...args);
      else n.queue.push(args);
    }) as MetaPixelFunction;
    f.fbq = n;
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

  // Both globals exist now (gtag's stub is defined synchronously above, and
  // fbq's queue accepts calls before fbevents.js lands), so anything that
  // fired during the deferred window can go out. PageView first, then the
  // queue, which keeps the sequence Meta expects.
  flushPendingBrowserEvents();
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
