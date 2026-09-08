import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Metric } from "web-vitals";

type TrackingWindow = Window & {
  __BL?: { u: string; q: string };
  __BL_PV_EID?: string;
  __META_PIXEL_DISABLED__?: boolean;
  dataLayer?: unknown[][];
  gtag?: (...args: unknown[]) => void;
  fbq?: ((...args: unknown[]) => void) & { queue?: unknown[][] };
  _fbq?: unknown;
  "ga-disable-G-E1GTL9RHY0"?: boolean;
};
const w = window as TrackingWindow;
const originalSession = Object.getOwnPropertyDescriptor(window, "sessionStorage")!;
let fetchMock: ReturnType<typeof vi.fn>;
let insertMock: ReturnType<typeof vi.fn>;
let releaseProvider: () => void;
let providerReady: Promise<void>;

beforeEach(() => {
  vi.resetModules();
  window.localStorage.clear();
  window.sessionStorage.clear();
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.trim().split("=")[0];
    for (const suffix of ["", `; domain=${window.location.hostname}`]) {
      document.cookie = `${name}=; path=/; max-age=0${suffix}`;
    }
  }
  document.querySelectorAll('script[src*="googletagmanager.com/gtag"],script[src*="connect.facebook.net"]')
    .forEach((script) => script.remove());
  delete w.gtag;
  delete w.fbq;
  delete w._fbq;
  delete w.dataLayer;
  delete w.__BL;
  delete w.__BL_PV_EID;
  delete w.__META_PIXEL_DISABLED__;
  delete w["ga-disable-G-E1GTL9RHY0"];
  fetchMock = vi.fn().mockResolvedValue({ ok: true });
  vi.stubGlobal("fetch", fetchMock);
  insertMock = vi.fn().mockResolvedValue({ error: null });
  providerReady = Promise.resolve();
  releaseProvider = () => {};
  // Only the analytics implementation is under test, never a live client.
  vi.doMock("@/integrations/supabase/client", async () => {
    await providerReady;
    return { supabase: { from: () => ({ insert: insertMock }) } };
  });
  vi.spyOn(Intl, "DateTimeFormat").mockImplementation(
    () => ({ resolvedOptions: () => ({ timeZone: "America/Denver" }) }) as unknown as Intl.DateTimeFormat,
  );
});

afterEach(() => {
  releaseProvider();
  Object.defineProperty(window, "sessionStorage", originalSession);
  vi.doUnmock("@/integrations/supabase/client");
  vi.doUnmock("web-vitals");
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function capiEvents(): Array<{ event_name: string; event_id: string; user_data: Record<string, string> }> {
  return fetchMock.mock.calls
    .filter(([url]) => String(url).includes("/functions/v1/fb-capi"))
    .map(([, init]) => JSON.parse((init as RequestInit).body as string));
}

const metaEvents = () => w.fbq?.queue?.filter(([method]) => method === "track" || method === "trackCustom") ?? [];

describe("analytics consent lifecycle — actual local implementation, mocked providers", () => {
  it("has no no-JavaScript Meta request outside the consent gate", () => {
    const html = readFileSync(resolve(process.cwd(), "index.html"), "utf8");
    expect(html).not.toContain("facebook.com/tr");
    expect(html).not.toContain("noscript=1");
  });

  it("rejects all initializers and events without storing landing identifiers", async () => {
    const consent = await import("@/lib/consent");
    consent.setConsent("rejected");
    w.__BL = { u: "https://example.test/?fbclid=qa&utm_source=meta", q: "?fbclid=qa&utm_source=meta" };
    const analytics = await import("@/lib/analytics");
    analytics.fireInitialCapiPageView();
    analytics.initAnalyticsScripts();
    await analytics.trackEvent("add_to_cart", { value: 38 });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
    expect(w.gtag).toBeUndefined();
    expect(w.fbq).toBeUndefined();
    expect(window.sessionStorage.getItem("_fbc")).toBeNull();
    expect(window.sessionStorage.getItem("utm_source")).toBeNull();
    expect(document.cookie).not.toContain("bl_session=");
  });

  it.each(["capi-first", "scripts-first"])("uses one shared PageView ID across repeated Accept: %s", async (order) => {
    const consent = await import("@/lib/consent");
    const analytics = await import("@/lib/analytics");
    if (order === "capi-first") analytics.fireInitialCapiPageView();
    analytics.initAnalyticsScripts();
    analytics.fireInitialCapiPageView();
    consent.setConsent("accepted");
    analytics.fireInitialCapiPageView();
    analytics.initAnalyticsScripts();
    const events = capiEvents();
    const pageViews = metaEvents().filter(([, name]) => name === "PageView");
    expect(events).toHaveLength(1);
    expect(pageViews).toHaveLength(1);
    expect(pageViews[0][3]).toEqual({ eventID: events[0].event_id });
    expect(w.dataLayer?.filter(([name]) => name === "config")).toHaveLength(1);
    expect(Object.prototype.toString.call(w.dataLayer?.find(([name]) => name === "config"))).toBe("[object Arguments]");
  });

  it("grants loaded providers after Reject→Accept without adding another initial PageView", async () => {
    const consent = await import("@/lib/consent");
    const analytics = await import("@/lib/analytics");
    consent.setConsent("accepted");
    analytics.initAnalyticsScripts();
    const id = capiEvents()[0].event_id;
    const gtag = vi.fn();
    const fbq = vi.fn();
    w.gtag = gtag;
    w.fbq = fbq;
    consent.setConsent("rejected");
    analytics.revokeAnalyticsTracking();
    expect(w["ga-disable-G-E1GTL9RHY0"]).toBe(true);
    expect(gtag).toHaveBeenCalledWith("consent", "update", expect.objectContaining({ analytics_storage: "denied", ad_storage: "denied" }));
    expect(fbq).toHaveBeenCalledWith("consent", "revoke");
    await analytics.trackEvent("add_to_cart", { value: 38 });
    expect(capiEvents()).toHaveLength(1);
    consent.setConsent("accepted");
    analytics.fireInitialCapiPageView();
    analytics.initAnalyticsScripts();
    expect(w["ga-disable-G-E1GTL9RHY0"]).toBe(false);
    expect(gtag).toHaveBeenCalledWith("consent", "update", expect.objectContaining({ analytics_storage: "granted" }));
    expect(fbq).toHaveBeenCalledWith("consent", "grant");
    expect(capiEvents()).toHaveLength(1);
    expect(w.__BL_PV_EID).toBe(id);
    expect(fbq.mock.calls.filter(([method]) => method === "track")).toHaveLength(0);
    await analytics.trackEvent("add_to_cart", { content_ids: ["42940461023303"], value: 38, currency: "USD" });
    const add = capiEvents().find(({ event_name }) => event_name === "AddToCart")!;
    expect(fbq).toHaveBeenCalledWith("track", "AddToCart", expect.any(Object), { eventID: add.event_id });
  });

  it("discards pre-reject events and a delayed PageView counterpart even when Accept follows", async () => {
    const consent = await import("@/lib/consent");
    const analytics = await import("@/lib/analytics");
    analytics.fireInitialCapiPageView();
    await analytics.trackEvent("add_to_cart", { value: 38 });
    consent.setConsent("rejected");
    analytics.revokeAnalyticsTracking();
    consent.setConsent("accepted");
    analytics.initAnalyticsScripts();
    expect(metaEvents()).toHaveLength(0);
    expect(w.dataLayer?.find(([command]) => command === "config")?.[2]).toMatchObject({ send_page_view: false });
    expect(capiEvents().filter(({ event_name }) => event_name === "PageView")).toHaveLength(1);
    // The two already-started, pre-rejection server requests cannot be recalled.
    expect(capiEvents()).toHaveLength(2);
  });

  it("drops work awaiting the analytics client after withdrawal and quick re-acceptance", async () => {
    providerReady = new Promise((resolve) => { releaseProvider = resolve; });
    const consent = await import("@/lib/consent");
    const analytics = await import("@/lib/analytics");
    const pending = analytics.trackEvent("local_ui_test", { source: "qa" });
    consent.setConsent("rejected");
    analytics.revokeAnalyticsTracking();
    consent.setConsent("accepted");
    releaseProvider();
    await pending;
    expect(insertMock).not.toHaveBeenCalled();
    expect(document.cookie).not.toContain("bl_session=");
  });

  it("removes events already queued in the owned vendor stubs before delayed scripts load", async () => {
    const consent = await import("@/lib/consent");
    const analytics = await import("@/lib/analytics");
    analytics.initAnalyticsScripts();
    await analytics.trackEvent("add_to_cart", { value: 38 });
    expect(metaEvents()).toHaveLength(2);
    expect(w.dataLayer?.some(([command]) => command === "event")).toBe(true);
    consent.setConsent("rejected");
    analytics.revokeAnalyticsTracking();
    consent.setConsent("accepted");
    analytics.initAnalyticsScripts();
    expect(metaEvents()).toHaveLength(0);
    expect(w.dataLayer?.some(([command]) => command === "event")).toBe(false);
    expect(w.dataLayer?.find(([command]) => command === "config")?.[2]).toMatchObject({ send_page_view: false });
    expect(w.fbq?.queue).toContainEqual(["init", "916078074161719"]);
  });

  it("does not send metrics from a pre-withdrawal observer after resumption", async () => {
    let report: ((metric: Metric) => void) | undefined;
    vi.doMock("web-vitals", () => ({
      onCLS: (callback: (metric: Metric) => void) => { report = callback; },
      onINP: vi.fn(),
      onLCP: vi.fn(),
    }));
    const consent = await import("@/lib/consent");
    const analytics = await import("@/lib/analytics");
    analytics.initWebVitalsReporting();
    await vi.waitFor(() => expect(report).toBeTypeOf("function"));
    const oldReport = report!;
    consent.setConsent("rejected");
    analytics.revokeAnalyticsTracking();
    consent.setConsent("accepted");
    analytics.initWebVitalsReporting();
    await vi.waitFor(() => expect(report).not.toBe(oldReport));
    const metric = { name: "CLS", value: 0, delta: 0, rating: "good", id: "qa", navigationType: "navigate", entries: [] } as Metric;
    oldReport(metric);
    expect(insertMock).not.toHaveBeenCalled();
    report!(metric);
    await vi.waitFor(() => expect(insertMock).toHaveBeenCalledTimes(1));
  });

  it("clears reachable host/domain analytics cookies and session IDs without clearing consent/cart", async () => {
    const consent = await import("@/lib/consent");
    const analytics = await import("@/lib/analytics");
    consent.setConsent("accepted");
    for (const name of ["_ga", "_ga_TEST", "_gat_TEST", "_fbp", "_fbc", "bl_session"]) {
      document.cookie = `${name}=qa; path=/; domain=${window.location.hostname}`;
    }
    document.cookie = "cart_qa=keep; path=/";
    for (const key of ["bl_session", "_fbc", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
      window.sessionStorage.setItem(key, "qa");
    }
    window.localStorage.setItem("shopify-cart", "keep");
    consent.setConsent("rejected");
    analytics.revokeAnalyticsTracking();
    expect(document.cookie).toBe("cart_qa=keep");
    expect(window.sessionStorage.getItem("_fbc")).toBeNull();
    expect(window.sessionStorage.getItem("bl_session")).toBeNull();
    expect(window.sessionStorage.getItem("utm_source")).toBeNull();
    expect(window.localStorage.getItem("shopify-cart")).toBe("keep");
    expect(consent.hasAnalyticsConsent()).toBe(false);
  });

  it("does not restore captured email/click identity on same-document resumption", async () => {
    const consent = await import("@/lib/consent");
    const analytics = await import("@/lib/analytics");
    w.__BL = { u: "https://example.test/?fbclid=qa", q: "?fbclid=qa" };
    analytics.initAnalyticsScripts();
    analytics.setCapturedEmail("qa@example.invalid");
    consent.setConsent("rejected");
    analytics.revokeAnalyticsTracking();
    consent.setConsent("accepted");
    analytics.initAnalyticsScripts();
    await analytics.trackEvent("add_to_cart", { value: 38 });
    const last = capiEvents().at(-1)!;
    expect(last.user_data).not.toHaveProperty("em");
    expect(last.user_data).not.toHaveProperty("fbc");
    expect(window.sessionStorage.getItem("_fbc")).toBeNull();
  });

  it("initializes and cleans up safely when the sessionStorage getter throws", async () => {
    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      get: () => { throw new DOMException("Blocked", "SecurityError"); },
    });
    const consent = await import("@/lib/consent");
    consent.setConsent("accepted");
    const analytics = await import("@/lib/analytics");
    expect(() => analytics.initAnalyticsScripts()).not.toThrow();
    consent.setConsent("rejected");
    expect(() => analytics.revokeAnalyticsTracking()).not.toThrow();
    expect(capiEvents()).toHaveLength(1);
  });

  it("continues cleanup when a vendor denial command throws", async () => {
    const analytics = await import("@/lib/analytics");
    const consent = await import("@/lib/consent");
    w.gtag = () => { throw new Error("vendor failure"); };
    const fbq = vi.fn();
    w.fbq = fbq;
    document.cookie = "_fbp=qa; path=/";
    consent.setConsent("rejected");
    expect(() => analytics.revokeAnalyticsTracking()).not.toThrow();
    expect(fbq).toHaveBeenCalledWith("consent", "revoke");
    expect(document.cookie).not.toContain("_fbp=");
  });
});
