import { hasAnalyticsConsent } from "@/lib/consent";

/**
 * Brevo is the lifecycle/CRM provider. This module is deliberately separate
 * from analytics.ts: GA4 and Meta measure acquisition, while these events are
 * used only to identify subscribers and power email automations.
 *
 * The tracker is not loaded for an anonymous visitor. Events are held in
 * memory until the visitor has explicitly submitted a marketing opt-in, then
 * the current session is identified and the queued events are flushed. This
 * prevents an email address from being attached to browsing behaviour without
 * both marketing opt-in and the site's analytics-cookie consent gate.
 */

const BREVO_SDK_URL = "https://cdn.brevo.com/js/sdk-loader.js";
const BREVO_SCRIPT_ID = "brevo-lifecycle-sdk";
const LIFECYCLE_OPT_IN_KEY = "bl_lifecycle_opt_in";
const PENDING_EVENT_CAP = 20;

type ContactAttributeValue = string | number | boolean;
export type LifecycleContactAttributes = Record<string, ContactAttributeValue>;

export interface LifecycleProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  url: string;
  image?: string;
  variant?: string;
}

export interface LifecycleCart {
  id: string;
  total: number;
  currency: string;
  url: string;
  items: LifecycleProduct[];
}

interface LifecycleEvent {
  name: "product_viewed" | "cart_updated" | "cart_deleted";
  eventData: {
    id: string;
    data: Record<string, unknown>;
  };
}

const STOREFRONT_ORIGIN = "https://baselayerskin.co";

/**
 * Brevo renders product images from the event payload inside an email client,
 * where storefront-relative asset paths have no base URL. Keep the public
 * payload compatible with Brevo's abandoned-cart template field names while
 * preserving the cleaner internal LifecycleProduct shape.
 */
function brevoProduct(product: LifecycleProduct): Record<string, unknown> {
  const image = product.image?.trim();
  return {
    ...product,
    ...(image ? { image: new URL(image, STOREFRONT_ORIGIN).href } : {}),
    variant_id_name: product.variant || "",
  };
}

type BrevoQueueItem = unknown[] | ((...args: unknown[]) => unknown);
type BrevoQueue = { push: (item: BrevoQueueItem) => unknown };

declare global {
  interface Window {
    Brevo?: BrevoQueue;
  }
}

let trackerInitialized = false;
let contactIdentifiedThisPage = false;
const pendingEvents: LifecycleEvent[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function trackerKey(): string {
  return (import.meta.env.VITE_BREVO_TRACKER_CLIENT_KEY || "").trim();
}

function hasLifecycleOptIn(): boolean {
  if (!isBrowser()) return false;
  try {
    return window.localStorage.getItem(LIFECYCLE_OPT_IN_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberLifecycleOptIn(): void {
  try {
    window.localStorage.setItem(LIFECYCLE_OPT_IN_KEY, "1");
  } catch {
    // The Brevo visitor cookie can still associate this page's events. The
    // marker only enables tracker initialization on a later visit.
  }
}

function brevoQueue(): BrevoQueue {
  if (!window.Brevo) window.Brevo = [] as unknown as BrevoQueue;
  return window.Brevo;
}

function appendTrackerScript(): void {
  if (document.getElementById(BREVO_SCRIPT_ID)) return;
  const script = document.createElement("script");
  script.id = BREVO_SCRIPT_ID;
  script.src = BREVO_SDK_URL;
  script.async = true;
  script.referrerPolicy = "strict-origin-when-cross-origin";
  document.head.appendChild(script);
}

function flushPendingEvents(): void {
  if (!trackerInitialized) return;
  while (pendingEvents.length > 0) {
    const event = pendingEvents.shift() as LifecycleEvent;
    brevoQueue().push(["track", event.name, {}, event.eventData]);
  }
}

/**
 * Initializes Brevo for a returning, previously identified subscriber.
 * First-time anonymous visitors remain untracked by Brevo until
 * identifyLifecycleContact() records an explicit marketing opt-in.
 */
export function initLifecycleTracking(): boolean {
  if (!isBrowser() || trackerInitialized) return trackerInitialized;
  if (!hasAnalyticsConsent() || !hasLifecycleOptIn() || !trackerKey()) return false;

  brevoQueue().push(["init", { client_key: trackerKey() }]);
  appendTrackerScript();
  trackerInitialized = true;
  flushPendingEvents();
  return true;
}

/**
 * Associates the Brevo visitor with the address submitted through an explicit
 * marketing opt-in. Call only after the subscription backend succeeds.
 * Attributes must already exist in Brevo or Brevo will ignore them.
 */
export function identifyLifecycleContact(
  email: string,
  attributes: LifecycleContactAttributes = {},
): boolean {
  if (!isBrowser() || !hasAnalyticsConsent() || !trackerKey()) return false;
  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return false;

  rememberLifecycleOptIn();
  if (!trackerInitialized) {
    brevoQueue().push(["init", { client_key: trackerKey() }]);
    appendTrackerScript();
    trackerInitialized = true;
  }

  brevoQueue().push([
    "identify",
    {
      identifiers: { email_id: normalizedEmail },
      attributes,
    },
  ]);
  contactIdentifiedThisPage = true;
  flushPendingEvents();
  return true;
}

function sendOrQueue(event: LifecycleEvent): void {
  if (!isBrowser() || !hasAnalyticsConsent() || !trackerKey()) return;

  if (!trackerInitialized) {
    if (hasLifecycleOptIn()) initLifecycleTracking();
  }

  if (trackerInitialized) {
    brevoQueue().push(["track", event.name, {}, event.eventData]);
    return;
  }

  // Keep pre-opt-in behaviour in memory only. It leaves the browser only if
  // identifyLifecycleContact() is called later in the same page session.
  if (pendingEvents.length < PENDING_EVENT_CAP) pendingEvents.push(event);
}

export function trackLifecycleProductViewed(product: Omit<LifecycleProduct, "quantity">): void {
  sendOrQueue({
    name: "product_viewed",
    eventData: {
      id: `product:${product.id}`,
      data: {
        currency: "USD",
        url: product.url,
        items: [brevoProduct({ ...product, quantity: 1 })],
      },
    },
  });
}

export function trackLifecycleCartUpdated(cart: LifecycleCart): void {
  if (cart.items.length === 0) {
    trackLifecycleCartDeleted(cart.id);
    return;
  }
  sendOrQueue({
    name: "cart_updated",
    eventData: {
      id: `cart:${cart.id}`,
      data: {
        total: cart.total,
        currency: cart.currency,
        url: cart.url,
        items: cart.items.map(brevoProduct),
      },
    },
  });
}

/** cart_deleted is intentionally sent only when the cart is empty. */
export function trackLifecycleCartDeleted(cartId: string): void {
  sendOrQueue({
    name: "cart_deleted",
    eventData: {
      id: `cart:${cartId}`,
      data: { total: 0, currency: "USD", items: [] },
    },
  });
}

/**
 * Stops application-owned lifecycle calls after consent is revoked. Like the
 * existing GA/Meta cleanup, the already-executing vendor script cannot be
 * unloaded safely mid-page. The first-party visitor cookie is removed; the
 * non-PII marketing-opt-in marker remains so tracking can resume if the same
 * visitor later accepts optional cookies again.
 */
export function clearLifecycleTracking(): boolean {
  if (!isBrowser()) return false;
  const wasActive = trackerInitialized
    || document.getElementById(BREVO_SCRIPT_ID) !== null
    || window.Brevo !== undefined;
  pendingEvents.length = 0;
  document.cookie = "visitor_id=; path=/; max-age=0";
  const domain = window.location.hostname.replace(/^www\./, "");
  document.cookie = `visitor_id=; path=/; max-age=0; domain=${domain}`;
  document.getElementById(BREVO_SCRIPT_ID)?.remove();
  delete window.Brevo;
  trackerInitialized = false;
  contactIdentifiedThisPage = false;
  return wasActive;
}

/** Test-only visibility without exposing subscriber PII. */
export function getLifecycleDebugState(): {
  initialized: boolean;
  identified: boolean;
  pendingEventCount: number;
} {
  return {
    initialized: trackerInitialized,
    identified: contactIdentifiedThisPage,
    pendingEventCount: pendingEvents.length,
  };
}

export function resetLifecycleForTests(): void {
  trackerInitialized = false;
  contactIdentifiedThisPage = false;
  pendingEvents.length = 0;
}
