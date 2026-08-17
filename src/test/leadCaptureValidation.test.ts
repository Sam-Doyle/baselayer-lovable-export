import { describe, expect, it, vi } from "vitest";
import {
  LeadCaptureValidationError,
  buildBrevoAttributes,
  isOriginAllowed,
  validateLeadCapture,
} from "../../supabase/functions/_shared/lead-capture";
import { syncBrevoContact } from "../../supabase/functions/_shared/brevo";

const NOW = Date.parse("2026-08-17T17:00:00.000Z");

function validV2(overrides: Record<string, unknown> = {}) {
  return {
    request_version: 2,
    submission_id: "09b3f156-9005-4dcc-b821-79ee70a4f90f",
    email: "  Sam@Example.com ",
    concern: "shine",
    source: "skin_concern_quiz",
    discount_code: "skin15",
    attribution: {
      first_source: "meta_ads",
      last_source: "skin_concern_quiz",
      utm_source: "facebook",
      landing_path: "/face-cream",
      referrer: "https://www.facebook.com/path?email=private@example.com#tracking",
    },
    consent: {
      version: "skin-quiz-v1",
      text: "By signing up, you agree to receive Base Layer emails.",
      captured_at: "2026-08-17T16:59:59.000Z",
      source: "skin_concern_quiz",
    },
    client: {
      honeypot: "",
      form_started_at: NOW - 5_000,
    },
    ...overrides,
  };
}

describe("lead capture validation", () => {
  it("normalizes a v2 request and removes query data from the referrer", () => {
    const capture = validateLeadCapture(validV2(), NOW);

    expect(capture.email).toBe("sam@example.com");
    expect(capture.concern).toBe("shine");
    expect(capture.discountCode).toBe("SKIN15");
    expect(capture.attribution.first_source).toBe("meta_ads");
    expect(capture.attribution.referrer).toBe("https://www.facebook.com/path");
    expect(capture.consent?.captured_at).toBe("2026-08-17T16:59:59.000Z");
  });

  it("accepts the browser's privacy-preserving hostname-only referrer", () => {
    const payload = validV2();
    payload.attribution.referrer = "WWW.Facebook.com";
    expect(validateLeadCapture(payload, NOW).attribution.referrer).toBe("www.facebook.com");
  });

  it("accepts the legacy email/source payload during a rolling deploy", () => {
    const capture = validateLeadCapture({ email: "legacy@example.com", source: "website" }, NOW);

    expect(capture.requestVersion).toBe(1);
    expect(capture.email).toBe("legacy@example.com");
    expect(capture.consent).toBeNull();
    expect(capture.submissionId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it.each([
    ["invalid email", { email: "not-an-email" }],
    ["unknown concern", { concern: "acne" }],
    ["filled honeypot", { client: { honeypot: "bot", form_started_at: NOW - 5_000 } }],
    ["instant submission", { client: { honeypot: "", form_started_at: NOW - 50 } }],
    ["stale consent", { consent: { version: "v1", text: "Consent", captured_at: "2026-07-01T00:00:00Z", source: "skin_concern_quiz" } }],
  ])("rejects %s", (_label, overrides) => {
    expect(() => validateLeadCapture(validV2(overrides), NOW)).toThrow(LeadCaptureValidationError);
  });

  it("allows a fast autofill submission after a real interaction", () => {
    const capture = validateLeadCapture(
      validV2({ client: { honeypot: "", form_started_at: NOW - 300 } }),
      NOW,
    );

    expect(capture.email).toBe("sam@example.com");
  });

  it("allows exact origins and configured single-label wildcard previews", () => {
    const allowed = ["https://baselayerskin.co", "https://deploy-preview-*.netlify.app"];
    expect(isOriginAllowed("https://baselayerskin.co", allowed)).toBe(true);
    expect(isOriginAllowed("https://deploy-preview-42.netlify.app", allowed)).toBe(true);
    expect(isOriginAllowed("https://evil.netlify.app", allowed)).toBe(false);
    expect(isOriginAllowed(null, allowed)).toBe(false);
  });
});

describe("Brevo contact upsert", () => {
  const payload = {
    email: "sam@example.com",
    first_source: "meta_ads",
    last_source: "skin_concern_quiz",
    skin_concern: "shine",
    discount_code: "SKIN15",
    first_seen_at: "2026-08-17T16:00:00.000Z",
    last_seen_at: "2026-08-17T17:00:00.000Z",
    consent_at: "2026-08-17T17:00:00.000Z",
    consent_version: "skin-quiz-v1",
    utm_source: "facebook",
  };

  it("preserves first and last source as separate Brevo attributes", () => {
    expect(buildBrevoAttributes(payload)).toMatchObject({
      SOURCE: "skin_concern_quiz",
      FIRST_SOURCE: "meta_ads",
      LAST_SOURCE: "skin_concern_quiz",
      SKIN_CONCERN: "shine",
      DISCOUNT_CODE: "SKIN15",
      UTM_SOURCE: "facebook",
      SIGNUP_AT: "2026-08-17",
      LAST_SIGNUP_AT: "2026-08-17",
      CONSENT_AT: "2026-08-17",
    });
  });

  it("uses Brevo's idempotent contact upsert", async () => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
      new Response(null, { status: 201 }));
    await syncBrevoContact(payload, "secret", 12, fetcher);

    const init = fetcher.mock.calls[0][1] as RequestInit;
    const body = JSON.parse(String(init.body));
    expect(body).toMatchObject({
      email: "sam@example.com",
      listIds: [12],
      updateEnabled: true,
      attributes: { FIRST_SOURCE: "meta_ads", LAST_SOURCE: "skin_concern_quiz" },
    });
  });

  it("marks rate limits and server failures retryable", async () => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response('{"code":"rate_limit"}', {
      status: 429,
      headers: { "Content-Type": "application/json" },
    }));

    await expect(syncBrevoContact(payload, "secret", 12, fetcher)).rejects.toMatchObject({
      retryable: true,
      status: 429,
    });
  });

  it("bounds stalled provider requests and leaves them retryable", async () => {
    const fetcher = vi.fn((_input: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          reject(new DOMException("Aborted", "AbortError"));
        });
      }));

    await expect(syncBrevoContact(payload, "secret", 12, fetcher, 5)).rejects.toMatchObject({
      retryable: true,
      message: "Brevo request timed out",
    });
  });
});
