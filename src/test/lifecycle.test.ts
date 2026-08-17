import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearLifecycleTracking,
  getLifecycleDebugState,
  identifyLifecycleContact,
  initLifecycleTracking,
  resetLifecycleForTests,
  trackLifecycleCartDeleted,
  trackLifecycleCartUpdated,
  trackLifecycleProductViewed,
} from "@/lib/lifecycle";

function acceptAnalytics(): void {
  localStorage.setItem("bl_consent", JSON.stringify({
    version: 2,
    choice: "accepted",
    timestamp: new Date().toISOString(),
  }));
}

function rejectAnalytics(): void {
  localStorage.setItem("bl_consent", JSON.stringify({
    version: 2,
    choice: "rejected",
    timestamp: new Date().toISOString(),
  }));
}

describe("Brevo lifecycle tracking", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_BREVO_TRACKER_CLIENT_KEY", "test-client-key");
    localStorage.clear();
    acceptAnalytics();
    resetLifecycleForTests();
    delete window.Brevo;
    document.getElementById("brevo-lifecycle-sdk")?.remove();
  });

  afterEach(() => {
    clearLifecycleTracking();
    vi.unstubAllEnvs();
  });

  it("keeps anonymous product and cart behaviour in memory before marketing opt-in", () => {
    trackLifecycleProductViewed({
      id: "variant-1",
      name: "Base Layer Face Cream",
      price: 38,
      url: "https://baselayerskin.co/face-cream",
    });
    trackLifecycleCartUpdated({
      id: "cart-1",
      total: 38,
      currency: "USD",
      url: "https://shop.baselayerskin.co/cart/c/1",
      items: [{
        id: "variant-1",
        name: "Base Layer Face Cream",
        price: 38,
        quantity: 1,
        url: "https://baselayerskin.co/face-cream",
      }],
    });

    expect(window.Brevo).toBeUndefined();
    expect(document.getElementById("brevo-lifecycle-sdk")).toBeNull();
    expect(getLifecycleDebugState()).toEqual({
      initialized: false,
      identified: false,
      pendingEventCount: 2,
    });
  });

  it("identifies only after opt-in, then flushes queued behaviour without email in event payloads", () => {
    trackLifecycleProductViewed({
      id: "variant-1",
      name: "Base Layer Face Cream",
      price: 38,
      url: "https://baselayerskin.co/face-cream",
    });

    expect(identifyLifecycleContact("  SAM@EXAMPLE.COM ", {
      SKIN_CONCERN: "dryness",
      LAST_SOURCE: "skin_concern_quiz",
    })).toBe(true);

    const commands = window.Brevo as unknown as unknown[][];
    expect(commands[0]).toEqual(["init", { client_key: "test-client-key" }]);
    expect(commands[1]).toEqual(["identify", {
      identifiers: { email_id: "sam@example.com" },
      attributes: {
        SKIN_CONCERN: "dryness",
        LAST_SOURCE: "skin_concern_quiz",
      },
    }]);
    expect(commands[2]?.[0]).toBe("track");
    expect(JSON.stringify(commands[2])).not.toContain("sam@example.com");
    expect(document.getElementById("brevo-lifecycle-sdk")).toHaveAttribute(
      "src",
      "https://cdn.brevo.com/js/sdk-loader.js",
    );
    expect(localStorage.getItem("bl_lifecycle_opt_in")).toBe("1");
  });

  it("does not initialize, identify, or retain queued events after analytics consent is rejected", () => {
    rejectAnalytics();

    trackLifecycleCartDeleted("cart-1");
    expect(identifyLifecycleContact("sam@example.com")).toBe(false);
    expect(initLifecycleTracking()).toBe(false);

    expect(window.Brevo).toBeUndefined();
    expect(document.getElementById("brevo-lifecycle-sdk")).toBeNull();
    expect(getLifecycleDebugState().pendingEventCount).toBe(0);
  });

  it("initializes on a later page only for a previously identified subscriber", () => {
    localStorage.setItem("bl_lifecycle_opt_in", "1");

    expect(initLifecycleTracking()).toBe(true);
    expect((window.Brevo as unknown as unknown[][])[0]).toEqual([
      "init",
      { client_key: "test-client-key" },
    ]);
  });

  it("uses cart_deleted only for an empty cart", () => {
    identifyLifecycleContact("sam@example.com");
    trackLifecycleCartUpdated({
      id: "cart-1",
      total: 0,
      currency: "USD",
      url: "https://shop.baselayerskin.co/cart/c/1",
      items: [],
    });

    const commands = window.Brevo as unknown as unknown[][];
    expect(commands[commands.length - 1]?.[1]).toBe("cart_deleted");
  });

  it("reports an active SDK on revocation and removes its queue, script, and visitor cookie", () => {
    document.cookie = "visitor_id=test-visitor; path=/";
    identifyLifecycleContact("sam@example.com");

    expect(clearLifecycleTracking()).toBe(true);
    expect(window.Brevo).toBeUndefined();
    expect(document.getElementById("brevo-lifecycle-sdk")).toBeNull();
    expect(document.cookie).not.toContain("visitor_id=");
    expect(getLifecycleDebugState()).toEqual({
      initialized: false,
      identified: false,
      pendingEventCount: 0,
    });
  });
});
