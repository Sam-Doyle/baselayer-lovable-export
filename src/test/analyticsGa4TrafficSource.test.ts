import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { trackEvent } from "@/lib/analytics";
import { setConsent } from "@/lib/consent";

/*
 * `source` is a reserved GA4 event parameter. GA4 reads it as a manual traffic
 * source and writes it to the session, so an event carrying source:"buy_box"
 * makes GA4 report sessionSource=buy_box and discards the real acquisition
 * source — on exactly the sessions that clicked a CTA, i.e. the ones that
 * convert. This was live: a session-source report showed `buy_box` and `hero`
 * sitting alongside `facebook.com / referral` as if they were traffic sources.
 *
 * Call sites use `source` to mean which CTA was clicked and there are ~20 of
 * them, so the rename happens once on the way into gtag. These tests pin both
 * halves: GA4 must never see the reserved key, and Meta must still see it,
 * because the CAPI side reports on it and has no reserved-name problem.
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

/** Params of the single gtag event hit. */
function ga4Params() {
  const call = gtag.mock.calls.find(([hit]) => hit === "event");
  if (!call) throw new Error("no gtag event was sent");
  return call[2] as Record<string, unknown>;
}

/** The single CAPI request body, parsed. */
function capiBody() {
  const call = fetchMock.mock.calls.find(([url]) => String(url).includes("/functions/v1/fb-capi"));
  if (!call) throw new Error("no fb-capi request was sent");
  return JSON.parse((call[1] as RequestInit).body as string);
}

describe("GA4 must never receive reserved traffic-source parameters", () => {
  it("renames source to cta_location so the CTA label can't overwrite session source", async () => {
    await trackEvent("add_to_cart", { content_ids: ["42940461056071"], value: 68, source: "buy_box" });

    expect(ga4Params()).not.toHaveProperty("source");
    expect(ga4Params().cta_location).toBe("buy_box");
  });

  it("drops medium and campaign too — same override, same damage", async () => {
    await trackEvent("select_item", { content_name: "Base Layer Face Cream", source: "hero", medium: "x", campaign: "y" });

    expect(ga4Params()).not.toHaveProperty("medium");
    expect(ga4Params()).not.toHaveProperty("campaign");
  });

  it("leaves an event with no source alone, and keeps the items array intact", async () => {
    await trackEvent("view_item", { content_ids: ["42940461056071"], value: 68 });

    expect(ga4Params()).not.toHaveProperty("cta_location");
    expect(ga4Params().items).toHaveLength(1);
  });

  it("still sends the items array when a source is present — the rename must not disturb ecommerce params", async () => {
    await trackEvent("add_to_cart", { content_ids: ["42940461056071"], value: 68, source: "cart_upsell" });

    const items = ga4Params().items as Array<Record<string, unknown>>;
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ item_id: "42940461056071" });
  });

  it("Meta still receives the original source key on both pixel and CAPI", async () => {
    await trackEvent("add_to_cart", { content_ids: ["42940461056071"], value: 68, source: "buy_box" });

    expect(fbq.mock.calls[0][2]).toMatchObject({ source: "buy_box" });
    expect(capiBody().custom_data).toMatchObject({ source: "buy_box" });
  });
});
