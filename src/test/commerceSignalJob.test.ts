import { describe, expect, it, vi } from "vitest";
import { processCommerceSignalJob } from "../../supabase/functions/_shared/commerce-signal-job";

const job = {
  id: "0ab1cfb7-668f-4b43-b613-b017085280b7",
  email: "audit@example.com",
  payload: { event_name: "bl_replenishment_due_v1" },
  attempts: 1,
};

describe("commerce signal send-time gates", () => {
  it("rechecks local lifecycle state after Brevo suppression and before publish", async () => {
    const callOrder: string[] = [];
    const publish = vi.fn(async () => { callOrder.push("publish"); });

    const result = await processCommerceSignalJob(job, {
      contactIsSendable: async () => { callOrder.push("brevo"); return true; },
      jobIsStillEligible: async () => { callOrder.push("state"); return true; },
      publish,
    });

    expect(result.outcome).toBe("succeeded");
    expect(callOrder).toEqual(["brevo", "state", "publish"]);
  });

  it("suppresses a job when consent or commerce state changes after claim", async () => {
    const publish = vi.fn();

    const result = await processCommerceSignalJob(job, {
      contactIsSendable: async () => true,
      jobIsStillEligible: async () => false,
      publish,
    });

    expect(result).toMatchObject({
      outcome: "suppressed",
      retryable: false,
    });
    expect(publish).not.toHaveBeenCalled();
  });

  it("does not query local state or publish when Brevo is already blocking the contact", async () => {
    const jobIsStillEligible = vi.fn();
    const publish = vi.fn();

    const result = await processCommerceSignalJob(job, {
      contactIsSendable: async () => false,
      jobIsStillEligible,
      publish,
    });

    expect(result.outcome).toBe("suppressed");
    expect(jobIsStillEligible).not.toHaveBeenCalled();
    expect(publish).not.toHaveBeenCalled();
  });
});
