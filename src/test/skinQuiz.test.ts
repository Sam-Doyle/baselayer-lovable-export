import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  SKIN_QUIZ_CONSENT_TEXT,
  SKIN_QUIZ_CONSENT_VERSION,
  submitSkinQuizLead,
} from "@/lib/skinQuiz";

const mockInvoke = vi.fn();
const mockSetCapturedEmail = vi.fn();
const mockTrackEvent = vi.fn();
const mockIdentifyLifecycleContact = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke: (...args: unknown[]) => mockInvoke(...args) } },
}));

vi.mock("@/lib/analytics", () => ({
  setCapturedEmail: (...args: unknown[]) => mockSetCapturedEmail(...args),
  trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
}));

vi.mock("@/lib/lifecycle", () => ({
  identifyLifecycleContact: (...args: unknown[]) => mockIdentifyLifecycleContact(...args),
}));

describe("submitSkinQuizLead", () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockInvoke.mockReset();
    mockSetCapturedEmail.mockReset();
    mockTrackEvent.mockReset();
    mockIdentifyLifecycleContact.mockReset();
    window.history.replaceState({}, "", "/face-cream?offer=single");
    sessionStorage.setItem("utm_source", "meta");
    sessionStorage.setItem("utm_medium", "paid_social");
    sessionStorage.setItem("utm_campaign", "launch\u0000-cold");
  });

  it("sends an idempotent v2 lead with concern, attribution, consent, and bot signals", async () => {
    mockInvoke.mockResolvedValue({
      data: { success: true, lead_id: "lead-1", sync_status: "pending", duplicate: false },
      error: null,
    });

    await submitSkinQuizLead({
      submissionId: "09b3f156-9005-4dcc-b821-79ee70a4f90f",
      email: " Test@Example.com ",
      concern: "shine",
      consent: {
        capturedAt: "2026-08-17T16:00:00.000Z",
        disclosureVersion: SKIN_QUIZ_CONSENT_VERSION,
      },
      botSignals: { website: "", formStartedAt: 1_760_000_000_000 },
    });

    expect(mockInvoke).toHaveBeenCalledWith("email-subscribe", {
      body: expect.objectContaining({
        request_version: 2,
        submission_id: expect.stringMatching(/^[0-9a-f-]{36}$/),
        email: "test@example.com",
        concern: "shine",
        source: "skin_concern_quiz",
        discount_code: "SKIN15",
        attribution: expect.objectContaining({
          first_source: "meta",
          last_source: "skin_concern_quiz",
          utm_source: "meta",
          utm_medium: "paid_social",
          utm_campaign: "launch-cold",
          landing_path: "/face-cream",
        }),
        consent: {
          version: SKIN_QUIZ_CONSENT_VERSION,
          text: SKIN_QUIZ_CONSENT_TEXT,
          captured_at: "2026-08-17T16:00:00.000Z",
          source: "skin_concern_quiz",
        },
        client: { honeypot: "", form_started_at: 1_760_000_000_000 },
      }),
    });
    expect(mockSetCapturedEmail).toHaveBeenCalledWith("test@example.com");
    expect(mockTrackEvent).toHaveBeenCalledWith(
      "email_signup",
      expect.not.objectContaining({ email: expect.anything() }),
    );
    expect(mockIdentifyLifecycleContact).toHaveBeenCalledWith("test@example.com", {
      SKIN_CONCERN: "shine",
      LAST_SOURCE: "skin_concern_quiz",
      CONSENT_VERSION: SKIN_QUIZ_CONSENT_VERSION,
      DISCOUNT_CODE: "SKIN15",
    });
  });

  it("keeps the reward locked when the durable endpoint rejects the lead", async () => {
    mockInvoke.mockResolvedValue({ data: null, error: new Error("rejected") });

    await expect(submitSkinQuizLead({
      submissionId: "09b3f156-9005-4dcc-b821-79ee70a4f90f",
      email: "test@example.com",
      concern: "dryness",
      consent: {
        capturedAt: "2026-08-17T16:00:00.000Z",
        disclosureVersion: SKIN_QUIZ_CONSENT_VERSION,
      },
      botSignals: { website: "spam", formStartedAt: Date.now() },
    })).rejects.toThrow("Lead capture failed");

    expect(mockSetCapturedEmail).not.toHaveBeenCalled();
    expect(mockIdentifyLifecycleContact).not.toHaveBeenCalled();
  });

  it("normalizes campaign sources without discarding the original UTM value", async () => {
    sessionStorage.setItem("utm_source", "Meta Ads / Cold");
    mockInvoke.mockResolvedValue({
      data: { success: true, sync_status: "pending" },
      error: null,
    });

    await submitSkinQuizLead({
      submissionId: "09b3f156-9005-4dcc-b821-79ee70a4f90f",
      email: "sam@example.com",
      concern: "shine",
      consent: {
        capturedAt: "2026-08-17T16:00:00.000Z",
        disclosureVersion: SKIN_QUIZ_CONSENT_VERSION,
      },
      botSignals: { website: "", formStartedAt: 1_760_000_000_000 },
    });

    expect(mockInvoke).toHaveBeenCalledWith(
      "email-subscribe",
      expect.objectContaining({
        body: expect.objectContaining({
          attribution: expect.objectContaining({
            first_source: "meta_ads_cold",
            utm_source: "Meta Ads / Cold",
          }),
        }),
      }),
    );
  });
});
