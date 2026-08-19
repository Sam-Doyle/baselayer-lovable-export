import { describe, expect, it, vi } from "vitest";
import { processCommerceSignalJob } from "../../supabase/functions/_shared/commerce-signal-job";

const job = {
  id: "0ab1cfb7-668f-4b43-b613-b017085280b7",
  shop_domain: "kpfzdg-kw.myshopify.com",
  email: "audit@example.com",
  payload: { event_name: "bl_replenishment_due_v1" },
  attempts: 1,
  lease_token: "657f3db2-5e45-407b-86f4-12761882d094",
};

describe("commerce signal send-time gates", () => {
  it("rechecks local lifecycle state after Brevo suppression and before publish", async () => {
    const callOrder: string[] = [];
    const publish = vi.fn(async () => { callOrder.push("publish"); });

    const result = await processCommerceSignalJob(job, {
      contactIsSendable: async () => { callOrder.push("brevo"); return true; },
      beginDispatch: async () => { callOrder.push("dispatch"); return true; },
      publish,
    });

    expect(result.outcome).toBe("succeeded");
    expect(callOrder).toEqual(["brevo", "dispatch", "publish"]);
  });

  it("suppresses a job when consent or commerce state changes after claim", async () => {
    const publish = vi.fn();

    const result = await processCommerceSignalJob(job, {
      contactIsSendable: async () => true,
      beginDispatch: async () => false,
      publish,
    });

    expect(result).toMatchObject({
      outcome: "suppressed",
      retryable: false,
    });
    expect(publish).not.toHaveBeenCalled();
  });

  it("does not query local state or publish when Brevo is already blocking the contact", async () => {
    const beginDispatch = vi.fn();
    const publish = vi.fn();

    const result = await processCommerceSignalJob(job, {
      contactIsSendable: async () => false,
      beginDispatch,
      publish,
    });

    expect(result.outcome).toBe("suppressed");
    expect(beginDispatch).not.toHaveBeenCalled();
    expect(publish).not.toHaveBeenCalled();
  });

  it("passes the fenced lease token into the dispatch transition", async () => {
    const beginDispatch = vi.fn(async () => true);
    await processCommerceSignalJob(job, {
      contactIsSendable: async () => true,
      beginDispatch,
      publish: async () => undefined,
    });

    expect(beginDispatch).toHaveBeenCalledWith(job.id, job.lease_token);
  });
});
