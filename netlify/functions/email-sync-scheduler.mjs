const REQUEST_TIMEOUT_MS = 25_000;

export async function runEmailSync({ env = process.env, fetcher = globalThis.fetch } = {}) {
  const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || "").replace(/\/$/u, "");
  const workerSecret = env.EMAIL_SYNC_WORKER_SECRET || "";
  if (!supabaseUrl || !workerSecret) {
    throw new Error("Email sync scheduler is missing required environment configuration");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;
  try {
    response = await fetcher(`${supabaseUrl}/functions/v1/email-sync-worker`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${workerSecret}`,
        "Content-Type": "application/json",
      },
      body: "{}",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    // Do not include the provider response in logs: a future worker version may
    // return diagnostic context that should remain inside Supabase.
    throw new Error(`Email sync worker returned HTTP ${response.status}`);
  }

  const result = await response.json();
  if (result?.success !== true) throw new Error("Email sync worker did not acknowledge success");
  return result;
}

export default async () => {
  const result = await runEmailSync();
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
};
