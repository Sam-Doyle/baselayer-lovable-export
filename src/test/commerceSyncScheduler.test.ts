import { describe, expect, it, vi } from "vitest";
import { runCommerceSync } from "../../netlify/functions/commerce-sync-scheduler.mjs";

describe("commerce lifecycle scheduler", () => {
  it("calls only the authenticated service worker", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      success: true,
      mode: "audit",
      claimed: 0,
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    await expect(runCommerceSync({
      env: {
        SUPABASE_URL: "https://example.supabase.co/",
        COMMERCE_SYNC_WORKER_SECRET: "worker-secret",
      },
      fetcher,
    })).resolves.toMatchObject({ success: true, mode: "audit", claimed: 0 });
    expect(fetcher).toHaveBeenCalledWith(
      "https://example.supabase.co/functions/v1/commerce-signal-worker",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer worker-secret" }),
      }),
    );
  });

  it("fails closed when configuration is missing", async () => {
    await expect(runCommerceSync({ env: {}, fetcher: vi.fn() })).rejects.toThrow(
      "missing required environment configuration",
    );
  });

  it("surfaces worker job failures instead of acknowledging a healthy schedule", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      success: false,
      mode: "publish",
      claimed: 1,
      failed: 1,
    }), { status: 503, headers: { "Content-Type": "application/json" } }));

    await expect(runCommerceSync({
      env: {
        SUPABASE_URL: "https://example.supabase.co",
        COMMERCE_SYNC_WORKER_SECRET: "worker-secret",
      },
      fetcher,
    })).rejects.toThrow("HTTP 503");
  });
});
