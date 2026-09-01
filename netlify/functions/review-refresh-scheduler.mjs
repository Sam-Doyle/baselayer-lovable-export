const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Trigger the production build that refreshes the build-time Judge.me
 * snapshot. The hook URL is a write-only Netlify function secret; keeping it
 * out of the repository prevents arbitrary third parties from consuming build
 * minutes or forcing deploys.
 */
export async function runReviewRefresh({ env = process.env, fetcher = globalThis.fetch } = {}) {
  const buildHookUrl = env.NETLIFY_REVIEW_BUILD_HOOK || "";
  if (!buildHookUrl) {
    throw new Error("Review refresh scheduler is missing NETLIFY_REVIEW_BUILD_HOOK");
  }

  let parsed;
  try {
    parsed = new URL(buildHookUrl);
  } catch {
    throw new Error("Review refresh scheduler has an invalid build hook URL");
  }
  if (parsed.protocol !== "https:" || parsed.hostname !== "api.netlify.com") {
    throw new Error("Review refresh scheduler build hook must use api.netlify.com over HTTPS");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;
  try {
    response = await fetcher(buildHookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trigger_title: "Scheduled Judge.me review refresh" }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`Review refresh build hook returned HTTP ${response.status}`);
  }

  return { success: true, status: response.status };
}

export default async () => {
  const result = await runReviewRefresh();
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
};
