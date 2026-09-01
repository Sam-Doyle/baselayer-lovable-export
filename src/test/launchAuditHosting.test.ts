import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const repoFile = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

interface RedirectRule {
  from: string;
  to: string;
  status: string;
}

function redirectRules(path: string): RedirectRule[] {
  return repoFile(path)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const [from, to, status] = line.split(/\s+/);
      return { from, to, status };
    });
}

describe("analytics consent markup", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    document
      .querySelectorAll('script[src*="googletagmanager.com/gtag"], script[src*="connect.facebook.net"]')
      .forEach((node) => node.remove());
    delete (window as unknown as { fbq?: unknown }).fbq;
    delete (window as unknown as { _fbq?: unknown })._fbq;
    delete (window as unknown as { gtag?: unknown }).gtag;
    delete (window as unknown as { dataLayer?: unknown }).dataLayer;
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("has no no-JavaScript Meta request that can bypass the consent gate", () => {
    const html = repoFile("index.html");

    expect(html).not.toContain("facebook.com/tr");
    expect(html).not.toContain("noscript=1");
  });

  it("keeps GA4 and Meta scripts blocked after an explicit rejection", async () => {
    const { setConsent } = await import("@/lib/consent");
    setConsent("rejected");
    const { initAnalyticsScripts } = await import("@/lib/analytics");

    initAnalyticsScripts();

    expect(document.querySelector('script[src*="googletagmanager.com/gtag"]')).toBeNull();
    expect(document.querySelector('script[src*="connect.facebook.net"]')).toBeNull();
  });

  it("still loads GA4 and Meta after analytics consent is accepted", async () => {
    const { setConsent } = await import("@/lib/consent");
    setConsent("accepted");
    const { initAnalyticsScripts } = await import("@/lib/analytics");

    initAnalyticsScripts();

    expect(document.querySelector('script[src*="googletagmanager.com/gtag/js"]')).not.toBeNull();
    expect(document.querySelector('script[src="https://connect.facebook.net/en_US/fbevents.js"]')).not.toBeNull();
    expect((window as unknown as { fbq?: unknown }).fbq).toBeTypeOf("function");
  });

  it("sends the initial CAPI PageView only once when an already-trackable visitor reaffirms Accept", async () => {
    vi.spyOn(Intl, "DateTimeFormat").mockImplementation(
      () => ({ resolvedOptions: () => ({ timeZone: "America/Denver" }) }) as unknown as Intl.DateTimeFormat,
    );
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const { fireInitialCapiPageView } = await import("@/lib/analytics");
    const { setConsent } = await import("@/lib/consent");

    fireInitialCapiPageView();
    setConsent("accepted");
    fireInitialCapiPageView();

    expect(fetchMock.mock.calls.filter(([url]) => String(url).includes("/functions/v1/fb-capi"))).toHaveLength(1);
  });

  it("uses the session fallback when localStorage cannot replace an older acceptance", async () => {
    vi.spyOn(Intl, "DateTimeFormat").mockImplementation(
      () => ({ resolvedOptions: () => ({ timeZone: "America/Denver" }) }) as unknown as Intl.DateTimeFormat,
    );
    window.localStorage.setItem("bl_consent", JSON.stringify({
      version: 2,
      choice: "accepted",
      timestamp: "2026-01-01T00:00:00.000Z",
    }));
    const realLocalStorage = window.localStorage;
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: (key: string) => realLocalStorage.getItem(key),
        setItem: () => { throw new DOMException("Storage blocked", "SecurityError"); },
        removeItem: () => undefined,
      },
    });
    try {
      const { getStoredConsent, hasAnalyticsConsent, isConsentDecisionDurable, setConsent } = await import("@/lib/consent");

      setConsent("rejected");

      expect(getStoredConsent()?.choice).toBe("rejected");
      expect(hasAnalyticsConsent()).toBe(false);
      expect(isConsentDecisionDurable()).toBe(true);
    } finally {
      Object.defineProperty(window, "localStorage", { configurable: true, value: realLocalStorage });
    }
  });

  it("keeps a newer local rejection ahead of a stale session acceptance when fallback cleanup throws", async () => {
    const futureTimestamp = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    window.sessionStorage.setItem("bl_consent_session", JSON.stringify({
      version: 2,
      choice: "accepted",
      timestamp: futureTimestamp,
    }));
    const realSessionStorage = window.sessionStorage;
    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      value: {
        getItem: (key: string) => realSessionStorage.getItem(key),
        setItem: (key: string, value: string) => realSessionStorage.setItem(key, value),
        removeItem: () => { throw new DOMException("Storage blocked", "SecurityError"); },
      },
    });
    try {
      let consent = await import("@/lib/consent");

      consent.setConsent("rejected");

      expect(consent.getStoredConsent()?.choice).toBe("rejected");
      expect(consent.hasAnalyticsConsent()).toBe(false);
      expect(consent.isConsentDecisionDurable()).toBe(true);

      // Simulate the App reload: module memory disappears and the two durable
      // records must still resolve to the explicit rejection.
      vi.resetModules();
      consent = await import("@/lib/consent");
      expect(consent.getStoredConsent()?.choice).toBe("rejected");
      expect(consent.hasAnalyticsConsent()).toBe(false);
    } finally {
      Object.defineProperty(window, "sessionStorage", { configurable: true, value: realSessionStorage });
    }
  });

  it("records Reject without throwing when a corrupted record uses JavaScript's maximum date", async () => {
    window.sessionStorage.setItem("bl_consent_session", JSON.stringify({
      version: 2,
      choice: "accepted",
      timestamp: "+275760-09-13T00:00:00.000Z",
    }));
    const { getStoredConsent, hasAnalyticsConsent, setConsent } = await import("@/lib/consent");

    expect(() => setConsent("rejected")).not.toThrow();
    expect(getStoredConsent()?.choice).toBe("rejected");
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it("keeps a rejection in memory without reloading when all storage is blocked", async () => {
    vi.spyOn(Intl, "DateTimeFormat").mockImplementation(
      () => ({ resolvedOptions: () => ({ timeZone: "America/Denver" }) }) as unknown as Intl.DateTimeFormat,
    );
    const realLocalStorage = window.localStorage;
    const realSessionStorage = window.sessionStorage;
    const blockedStorage = {
      getItem: () => { throw new DOMException("Storage blocked", "SecurityError"); },
      setItem: () => { throw new DOMException("Storage blocked", "SecurityError"); },
      removeItem: () => { throw new DOMException("Storage blocked", "SecurityError"); },
    };
    Object.defineProperty(window, "localStorage", { configurable: true, value: blockedStorage });
    Object.defineProperty(window, "sessionStorage", { configurable: true, value: blockedStorage });
    try {
      const { getStoredConsent, hasAnalyticsConsent, isConsentDecisionDurable, setConsent } = await import("@/lib/consent");

      setConsent("rejected");

      expect(getStoredConsent()?.choice).toBe("rejected");
      expect(hasAnalyticsConsent()).toBe(false);
      expect(isConsentDecisionDurable()).toBe(false);
    } finally {
      Object.defineProperty(window, "localStorage", { configurable: true, value: realLocalStorage });
      Object.defineProperty(window, "sessionStorage", { configurable: true, value: realSessionStorage });
    }
  });

  it("still initializes accepted analytics when sessionStorage APIs throw", async () => {
    const realSessionStorage = window.sessionStorage;
    const blockedStorage = {
      getItem: () => { throw new DOMException("Storage blocked", "SecurityError"); },
      setItem: () => { throw new DOMException("Storage blocked", "SecurityError"); },
      removeItem: () => { throw new DOMException("Storage blocked", "SecurityError"); },
    };
    Object.defineProperty(window, "sessionStorage", { configurable: true, value: blockedStorage });
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    try {
      const { setConsent } = await import("@/lib/consent");
      setConsent("accepted");
      const { fireInitialCapiPageView, initAnalyticsScripts } = await import("@/lib/analytics");

      expect(() => {
        fireInitialCapiPageView();
        initAnalyticsScripts();
      }).not.toThrow();

      expect(fetchMock.mock.calls.filter(([url]) => String(url).includes("/functions/v1/fb-capi"))).toHaveLength(1);
      expect(document.querySelector('script[src*="googletagmanager.com/gtag"]')).not.toBeNull();
      expect(document.querySelector('script[src*="connect.facebook.net"]')).not.toBeNull();
    } finally {
      Object.defineProperty(window, "sessionStorage", { configurable: true, value: realSessionStorage });
    }
  });

  it("revokes loaded GA4 and Meta runtimes and clears their first-party cookies", async () => {
    const { setConsent } = await import("@/lib/consent");
    setConsent("accepted");
    const analytics = await import("@/lib/analytics");
    const gtag = vi.fn();
    const fbq = vi.fn();
    (window as unknown as { gtag?: unknown; fbq?: unknown }).gtag = gtag;
    (window as unknown as { gtag?: unknown; fbq?: unknown }).fbq = fbq;
    document.cookie = "_ga=test-ga; path=/";
    document.cookie = "_ga_TEST=test-ga-property; path=/";
    document.cookie = "_fbp=test-fbp; path=/";
    document.cookie = "_fbc=test-fbc; path=/";

    analytics.revokeAnalyticsTracking();

    expect(gtag).toHaveBeenCalledWith("consent", "update", expect.objectContaining({
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    }));
    expect(fbq).toHaveBeenCalledWith("consent", "revoke");
    expect(document.cookie).not.toMatch(/(?:^|;\s*)_ga(?:_|=)/);
    expect(document.cookie).not.toContain("_fbp=");
    expect(document.cookie).not.toContain("_fbc=");
  });
});

describe("canonical host redirects", () => {
  const expectedRules = [
    { from: "https://baselayer.skin/*", to: "https://baselayerskin.co/:splat", status: "301!" },
    { from: "https://www.baselayer.skin/*", to: "https://baselayerskin.co/:splat", status: "301!" },
    { from: "https://baselayerskin.netlify.app/*", to: "https://baselayerskin.co/:splat", status: "301!" },
    { from: "https://www.baselayerskin.co/*", to: "https://baselayerskin.co/:splat", status: "301!" },
  ];

  it("permanently redirects every duplicate HTTPS host while preserving the path splat", () => {
    const rules = redirectRules("public/_redirects");

    for (const rule of expectedRules) {
      expect(rules).toContainEqual(rule);
    }
  });

  it("puts host rules before all path-only rules and the catch-all", () => {
    const rules = redirectRules("public/_redirects");
    const firstPathOnlyRule = rules.findIndex((rule) => rule.from.startsWith("/"));

    expect(firstPathOnlyRule).toBe(expectedRules.length);
    expect(rules.slice(0, expectedRules.length)).toEqual(expectedRules);
    expect(rules.at(-1)).toEqual({ from: "/*", to: "/index.html", status: "200" });
  });
});
