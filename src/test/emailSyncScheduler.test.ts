import { describe, expect, it, vi } from "vitest";
import { runEmailSync } from "../../netlify/functions/email-sync-scheduler.mjs";

describe("email sync scheduler", () => {
  it("calls the Supabase worker with the shared secret", async () => {
    const fetcher = vi.fn(async (_url: string, _init?: RequestInit) =>
      new Response(JSON.stringify({ success: true, claimed: 1, succeeded: 1 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }));

    const result = await runEmailSync({
      env: {
        SUPABASE_URL: "https://project.supabase.co/",
        EMAIL_SYNC_WORKER_SECRET: "scheduler-secret",
      },
      fetcher,
    });

    expect(result).toMatchObject({ success: true, claimed: 1, succeeded: 1 });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0][0]).toBe("https://project.supabase.co/functions/v1/email-sync-worker");
    expect(fetcher.mock.calls[0][1]?.headers).toMatchObject({
      Authorization: "Bearer scheduler-secret",
    });
  });

  it("fails closed when required environment configuration is missing", async () => {
    const fetcher = vi.fn();
    await expect(runEmailSync({ env: {}, fetcher })).rejects.toThrow(
      "missing required environment configuration",
    );
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("reports only the worker status and never leaks its response or secret", async () => {
    const secret = "do-not-log-this-secret";
    const fetcher = vi.fn(async () => new Response(`provider details ${secret}`, { status: 503 }));

    let message = "";
    try {
      await runEmailSync({
        env: {
          VITE_SUPABASE_URL: "https://project.supabase.co",
          EMAIL_SYNC_WORKER_SECRET: secret,
        },
        fetcher,
      });
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }

    expect(message).toBe("Email sync worker returned HTTP 503");
    expect(message).not.toContain(secret);
    expect(message).not.toContain("provider details");
  });

  it("rejects a 2xx response that does not acknowledge success", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ success: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));

    await expect(runEmailSync({
      env: { SUPABASE_URL: "https://project.supabase.co", EMAIL_SYNC_WORKER_SECRET: "secret" },
      fetcher,
    })).rejects.toThrow("did not acknowledge success");
  });
});
