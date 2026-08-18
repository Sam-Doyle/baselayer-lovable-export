const REQUEST_TIMEOUT_MS = 25_000;

export async function runCommerceSync({ env = process.env, fetcher = globalThis.fetch } = {}) {
  const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || "").replace(/\/$/u, "");
  const workerSecret = env.COMMERCE_SYNC_WORKER_SECRET || "";
  if (!supabaseUrl || !workerSecret) {
    throw new Error("Commerce sync scheduler is missing required environment configuration");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;
  try {
    response = await fetcher(`${supabaseUrl}/functions/v1/commerce-signal-worker`, {
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

  if (!response.ok) throw new Error(`Commerce sync worker returned HTTP ${response.status}`);
  const result = await response.json();
  if (result?.success !== true) throw new Error("Commerce sync worker did not acknowledge success");
  return result;
}

export default async () => {
  const result = await runCommerceSync();
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
};

