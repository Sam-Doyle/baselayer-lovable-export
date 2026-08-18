import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  EMAIL_CAMPAIGN_SESSION_KEY,
  appendStoredEmailCampaignParams,
  captureEmailCampaignSession,
  emailLandingTarget,
  promisedEmailDiscount,
  shouldSuppressQuizForEmailCampaign,
} from "@/lib/emailCampaign";

describe("email campaign storefront handoff", () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it("suppresses repeat capture for the whole email-origin tab", () => {
    expect(captureEmailCampaignSession("?utm_medium=email&utm_campaign=welcome_day_1")).toBe(true);
    expect(sessionStorage.getItem(EMAIL_CAMPAIGN_SESSION_KEY)).toBe("true");
    expect(shouldSuppressQuizForEmailCampaign("")).toBe(true);
  });

  it("keeps explicit quiz previews available to QA", () => {
    captureEmailCampaignSession("?utm_medium=email");
    expect(shouldSuppressQuizForEmailCampaign("?quiz=preview")).toBe(false);
  });

  it("accepts only the published email discount and allow-listed anchors", () => {
    captureEmailCampaignSession("?utm_medium=email");
    expect(promisedEmailDiscount("?discount=skin15")).toBe("SKIN15");
    expect(promisedEmailDiscount("?discount=UNPUBLISHED50")).toBeNull();
    expect(emailLandingTarget("#formula")).toBe("formula");
    expect(emailLandingTarget("#reviews")).toBe("reviews");
    expect(emailLandingTarget("#not-a-campaign-target")).toBeNull();
  });

  it("carries bounded email UTMs into checkout without dropping its key", () => {
    captureEmailCampaignSession("?utm_medium=email");
    sessionStorage.setItem("utm_source", "brevo");
    sessionStorage.setItem("utm_medium", "email");
    sessionStorage.setItem("utm_campaign", "replenishment");
    sessionStorage.setItem("utm_content", "day_35_single");
    sessionStorage.setItem("utm_term", "x".repeat(201));

    const result = appendStoredEmailCampaignParams(
      new URL("https://example.myshopify.com/cart/c/abc?key=secret&utm_source=shopify"),
    );

    expect(result.searchParams.get("key")).toBe("secret");
    expect(result.searchParams.get("utm_source")).toBe("shopify");
    expect(result.searchParams.get("utm_medium")).toBe("email");
    expect(result.searchParams.get("utm_campaign")).toBe("replenishment");
    expect(result.searchParams.get("utm_content")).toBe("day_35_single");
    expect(result.searchParams.has("utm_term")).toBe(false);
    expect(emailLandingTarget("#%E0%A4%A")).toBeNull();
  });

  it("degrades safely when privacy controls make storage methods throw", () => {
    const originalStorage = window.sessionStorage;
    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      value: {
        getItem: () => { throw new DOMException("blocked", "SecurityError"); },
        setItem: () => { throw new DOMException("blocked", "SecurityError"); },
      },
    });

    try {
      expect(captureEmailCampaignSession("?utm_medium=email")).toBe(true);
      expect(shouldSuppressQuizForEmailCampaign("?utm_medium=email")).toBe(true);
      expect(shouldSuppressQuizForEmailCampaign("")).toBe(false);
      expect(appendStoredEmailCampaignParams(new URL("https://example.com/?key=secret")).search)
        .toBe("?key=secret");
    } finally {
      Object.defineProperty(window, "sessionStorage", {
        configurable: true,
        value: originalStorage,
      });
    }
  });
});
