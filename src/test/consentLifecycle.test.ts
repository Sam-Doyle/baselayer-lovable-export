import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const originalLocal = Object.getOwnPropertyDescriptor(window, "localStorage")!;
const originalSession = Object.getOwnPropertyDescriptor(window, "sessionStorage")!;

function storage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() { return values.size; },
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
    clear: () => values.clear(),
    key: (index) => [...values.keys()][index] ?? null,
  };
}

function useStorage(name: "localStorage" | "sessionStorage", value: Storage): void {
  Object.defineProperty(window, name, { configurable: true, value });
}

function blockGetter(name: "localStorage" | "sessionStorage"): void {
  Object.defineProperty(window, name, {
    configurable: true,
    get: () => { throw new DOMException("Blocked", "SecurityError"); },
  });
}

function pinTimezone(timeZone: string): void {
  vi.spyOn(Intl, "DateTimeFormat").mockImplementation(
    () => ({ resolvedOptions: () => ({ timeZone }) }) as unknown as Intl.DateTimeFormat,
  );
}

const record = (choice: "accepted" | "rejected", timestamp = "2026-01-01T00:00:00.000Z") =>
  JSON.stringify({ version: 2, choice, timestamp });

beforeEach(() => {
  vi.resetModules();
  useStorage("localStorage", storage());
  useStorage("sessionStorage", storage());
  pinTimezone("America/Denver");
});

afterEach(() => {
  Object.defineProperty(window, "localStorage", originalLocal);
  Object.defineProperty(window, "sessionStorage", originalSession);
  vi.restoreAllMocks();
});

describe("consent persistence and withdrawal lifecycle", () => {
  it("preserves existing regional defaults and explicit choices", async () => {
    const consent = await import("@/lib/consent");
    expect(consent.hasAnalyticsConsent()).toBe(true);
    pinTimezone("Europe/Berlin");
    expect(consent.hasAnalyticsConsent()).toBe(false);
    consent.setConsent("accepted");
    expect(consent.hasAnalyticsConsent()).toBe(true);
    consent.setConsent("rejected");
    pinTimezone("America/Denver");
    expect(consent.hasAnalyticsConsent()).toBe(false);
  });

  it("keeps Reject effective when both storage getters throw", async () => {
    blockGetter("localStorage");
    blockGetter("sessionStorage");
    const consent = await import("@/lib/consent");
    const callback = vi.fn();
    const unsubscribe = consent.onConsentChange(callback);
    expect(() => consent.setConsent("rejected")).not.toThrow();
    expect(callback).toHaveBeenCalledWith("rejected");
    expect(consent.hasAnalyticsConsent()).toBe(false);
    expect(consent.getStoredConsent()?.choice).toBe("rejected");
    expect(consent.isConsentDecisionDurable()).toBe(false);
    consent.setConsent("accepted");
    expect(consent.hasAnalyticsConsent()).toBe(true);
    consent.setConsent("rejected");
    expect(consent.hasAnalyticsConsent()).toBe(false);
    unsubscribe();
  });

  it("uses session storage when the local getter throws, and survives module reload", async () => {
    blockGetter("localStorage");
    let consent = await import("@/lib/consent");
    consent.setConsent("rejected");
    expect(consent.isConsentDecisionDurable()).toBe(true);
    vi.resetModules();
    consent = await import("@/lib/consent");
    expect(consent.hasAnalyticsConsent()).toBe(false);
  });

  it("overrides a read-only stale acceptance through the session fallback", async () => {
    const local = window.localStorage;
    local.setItem("bl_consent", record("accepted"));
    vi.spyOn(local, "setItem").mockImplementation(() => { throw new Error("quota"); });
    let consent = await import("@/lib/consent");
    consent.setConsent("rejected");
    expect(consent.hasAnalyticsConsent()).toBe(false);
    expect(consent.isConsentDecisionDurable()).toBe(true);
    vi.resetModules();
    consent = await import("@/lib/consent");
    expect(consent.hasAnalyticsConsent()).toBe(false);
  });

  it("does not confuse successful/no-op writes with durable consent", async () => {
    window.localStorage.setItem("bl_consent", record("accepted"));
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {});
    vi.spyOn(window.sessionStorage, "setItem").mockImplementation(() => {});
    const consent = await import("@/lib/consent");
    consent.setConsent("rejected");
    expect(consent.hasAnalyticsConsent()).toBe(false);
    expect(consent.isConsentDecisionDurable()).toBe(false);
  });

  it("uses session fallback if local writes succeed but readback throws", async () => {
    vi.spyOn(window.localStorage, "getItem").mockImplementation(() => { throw new Error("blocked read"); });
    const consent = await import("@/lib/consent");
    consent.setConsent("rejected");
    expect(consent.hasAnalyticsConsent()).toBe(false);
    expect(consent.isConsentDecisionDurable()).toBe(true);
  });

  it("retains the current decision if storage becomes unreadable later", async () => {
    const consent = await import("@/lib/consent");
    consent.setConsent("rejected");
    blockGetter("localStorage");
    blockGetter("sessionStorage");
    expect(consent.hasAnalyticsConsent()).toBe(false);
    expect(consent.isConsentDecisionDurable()).toBe(false);
  });

  it("outranks stale future-dated fallback records when cleanup is blocked", async () => {
    window.sessionStorage.setItem("bl_consent_session", record("accepted", "2099-01-01T00:00:00.000Z"));
    vi.spyOn(window.sessionStorage, "removeItem").mockImplementation(() => { throw new Error("blocked cleanup"); });
    let consent = await import("@/lib/consent");
    consent.setConsent("rejected");
    expect(consent.hasAnalyticsConsent()).toBe(false);
    expect(consent.isConsentDecisionDurable()).toBe(true);
    vi.resetModules();
    consent = await import("@/lib/consent");
    expect(consent.hasAnalyticsConsent()).toBe(false);
  });

  it("handles the maximum date and fails closed on same-time conflicts", async () => {
    const maximum = "+275760-09-13T00:00:00.000Z";
    window.localStorage.setItem("bl_consent", record("accepted", maximum));
    window.sessionStorage.setItem("bl_consent_session", record("rejected", maximum));
    const consent = await import("@/lib/consent");
    expect(consent.hasAnalyticsConsent()).toBe(false);
    expect(() => consent.setConsent("rejected")).not.toThrow();
    expect(consent.hasAnalyticsConsent()).toBe(false);
  });

  it("invalidates pre-withdrawal work even after Accept, but not repeated Accept", async () => {
    const consent = await import("@/lib/consent");
    const initial = consent.getConsentEpoch();
    consent.setConsent("accepted");
    consent.setConsent("accepted");
    expect(consent.getConsentEpoch()).toBe(initial);
    consent.setConsent("rejected");
    consent.setConsent("accepted");
    expect(consent.getConsentEpoch()).toBeGreaterThan(initial);
  });

  it.each(["{", "null", JSON.stringify({ version: 1, choice: "rejected", timestamp: "2026-01-01" }),
    JSON.stringify({ version: 2, choice: "accepted", timestamp: "invalid" })])(
    "does not throw on malformed or superseded stored records: %s", async (raw) => {
      window.localStorage.setItem("bl_consent", raw);
      const consent = await import("@/lib/consent");
      expect(consent.getStoredConsent()).toBeNull();
    },
  );
});
