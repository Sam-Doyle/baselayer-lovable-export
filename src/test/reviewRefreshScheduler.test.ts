import { describe, expect, it, vi } from "vitest";
import { runReviewRefresh } from "../../netlify/functions/review-refresh-scheduler.mjs";

const BUILD_HOOK = "https://api.netlify.com/build_hooks/example-token";

describe("review refresh scheduler", () => {
  it("triggers the configured Netlify production build hook", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));

    await expect(runReviewRefresh({
      env: { NETLIFY_REVIEW_BUILD_HOOK: BUILD_HOOK },
      fetcher,
    })).resolves.toEqual({ success: true, status: 200 });

    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher).toHaveBeenCalledWith(BUILD_HOOK, expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ trigger_title: "Scheduled Judge.me review refresh" }),
      signal: expect.any(AbortSignal),
    }));
  });

  it("fails closed when the build hook is missing", async () => {
    await expect(runReviewRefresh({ env: {}, fetcher: vi.fn() })).rejects.toThrow(
      "missing NETLIFY_REVIEW_BUILD_HOOK",
    );
  });

  it.each([
    "not-a-url",
    "http://api.netlify.com/build_hooks/example-token",
    "https://example.com/build_hooks/example-token",
  ])("rejects an unsafe build hook URL: %s", async (buildHookUrl) => {
    await expect(runReviewRefresh({
      env: { NETLIFY_REVIEW_BUILD_HOOK: buildHookUrl },
      fetcher: vi.fn(),
    })).rejects.toThrow(/invalid build hook URL|api\.netlify\.com over HTTPS/u);
  });

  it("surfaces a failed build hook request", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response("no", { status: 503 }));

    await expect(runReviewRefresh({
      env: { NETLIFY_REVIEW_BUILD_HOOK: BUILD_HOOK },
      fetcher,
    })).rejects.toThrow("HTTP 503");
  });
});
