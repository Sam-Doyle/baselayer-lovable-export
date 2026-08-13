import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { trackEvent } from "@/lib/analytics";
import { setConsent } from "@/lib/consent";

/*
 * Guards the one analytics decision most likely to get "fixed" back into a
 * bug: `begin_checkout` must NOT claim Meta's InitiateCheckout or GA4's
 * begin_checkout.
 *
 * Shopify's own Meta and GA4 tags fire those standard names from the checkout
 * page on shop.baselayerskin.co. This event fires on the Checkout button click
 * a moment earlier, from a different origin with a different event id, so
 * nothing dedupes the pair — restoring the standard names silently doubles
 * every checkout in both platforms and inflates the cart→checkout rate that
 * ad bidding reads. The names below look wrong to anyone skimming a mapping
 * table of standard ecommerce events, which is exactly why they're pinned.
 *
 * add_to_cart is asserted alongside as the control: it has no Shopify-side
 * twin before checkout, so it stays standard, and a change that swept every
 * event into custom names would fail here.
 */

const originalFetch = global.fetch;
let gtag: ReturnType<typeof vi.fn>;
let fbq: ReturnType<typeof vi.fn>;
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  window.localStorage.clear();
  setConsent("accepted");
  gtag = vi.fn();
  fbq = vi.fn();
  (window as unknown as { gtag: unknown; fbq: unknown }).gtag = gtag;
  (window as unknown as { gtag: unknown; fbq: unknown }).fbq = fbq;
  fetchMock = vi.fn().mockResolvedValue({ ok: true });
  global.fetch = fetchMock as unknown as typeof fetch;
});

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

/** The single CAPI request body, parsed. */
function capiBody() {
  const call = fetchMock.mock.calls.find(([url]) => String(url).includes("/functions/v1/fb-capi"));
  if (!call) throw new Error("no fb-capi request was sent");
  return JSON.parse((call[1] as RequestInit).body as string);
}

describe("begin_checkout must not collide with Shopify's checkout events", () => {
  it("sends Meta a custom CheckoutClick, never the standard InitiateCheckout", async () => {
    await trackEvent("begin_checkout", { content_ids: ["42940461056071"], value: 68, currency: "USD" });

    expect(fbq).toHaveBeenCalledTimes(1);
    const [method, name] = fbq.mock.calls[0];
    expect(method).toBe("trackCustom");
    expect(name).toBe("CheckoutClick");
  });

  it("sends the same custom name server-side, so pixel and CAPI still dedupe on one event", async () => {
    await trackEvent("begin_checkout", { value: 68 });

    expect(capiBody().event_name).toBe("CheckoutClick");
    // Same event id on both sides is what makes them one event, not two.
    expect(capiBody().event_id).toBe(fbq.mock.calls[0][3].eventID);
  });

  it("sends GA4 checkout_click, never begin_checkout, and keeps the items array", async () => {
    await trackEvent("begin_checkout", { content_ids: ["42940461056071"], value: 68 });

    expect(gtag).toHaveBeenCalledTimes(1);
    const [hit, name, params] = gtag.mock.calls[0];
    expect(hit).toBe("event");
    expect(name).toBe("checkout_click");
    expect(params.items).toHaveLength(1);
    expect(params.items[0]).toMatchObject({ item_id: "42940461056071" });
  });

  it("control: add_to_cart keeps its standard names on both platforms", async () => {
    await trackEvent("add_to_cart", { content_ids: ["42940461056071"], value: 68 });

    expect(fbq.mock.calls[0][0]).toBe("track");
    expect(fbq.mock.calls[0][1]).toBe("AddToCart");
    expect(gtag.mock.calls[0][1]).toBe("add_to_cart");
  });
});
