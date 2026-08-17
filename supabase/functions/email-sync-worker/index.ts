import { createClient } from "npm:@supabase/supabase-js@2.97.0";
import type { BrevoSyncPayload } from "../_shared/lead-capture.ts";
import { BrevoSyncError, syncBrevoContact } from "../_shared/brevo.ts";

interface SyncJob {
  id: string;
  payload: BrevoSyncPayload;
  attempts: number;
}

function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function bearerToken(req: Request): string | null {
  const authorization = req.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  return authorization.slice("Bearer ".length);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return jsonResponse(405, { success: false, error: "method_not_allowed" });

  const workerSecret = Deno.env.get("EMAIL_SYNC_WORKER_SECRET");
  if (!workerSecret || bearerToken(req) !== workerSecret) {
    return jsonResponse(401, { success: false, error: "unauthorized" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const brevoApiKey = Deno.env.get("BREVO_API_KEY");
  const brevoListId = Number(Deno.env.get("BREVO_LIST_ID"));
  if (!supabaseUrl || !serviceRoleKey || !brevoApiKey || !Number.isInteger(brevoListId) || brevoListId <= 0) {
    console.error("email-sync-worker: provider or database configuration is missing");
    return jsonResponse(503, { success: false, error: "service_unavailable" });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error: claimError } = await supabase.rpc("claim_marketing_sync_jobs", { p_limit: 25 });
  if (claimError) {
    console.error("email-sync-worker: claim failed", claimError.code);
    return jsonResponse(503, { success: false, error: "claim_failed" });
  }

  const jobs = (data ?? []) as SyncJob[];
  let succeeded = 0;
  let pending = 0;
  let failed = 0;

  // Five concurrent provider calls keep a stalled batch inside the Netlify
  // proxy's 25-second request budget while avoiding an unbounded burst.
  for (let offset = 0; offset < jobs.length; offset += 5) {
    const batchStatuses = await Promise.all(jobs.slice(offset, offset + 5).map(async (job) => {
      let success = false;
      let retryable = true;
      let errorMessage: string | null = null;
      try {
        await syncBrevoContact(job.payload, brevoApiKey, brevoListId);
        success = true;
      } catch (error) {
        const syncError = error instanceof BrevoSyncError
          ? error
          : new BrevoSyncError("Unexpected provider sync failure", true);
        retryable = syncError.retryable;
        errorMessage = syncError.message;
      }

      const { data: finalStatus, error: completionError } = await supabase.rpc(
        "complete_marketing_sync_job",
        {
          p_outbox_id: job.id,
          p_succeeded: success,
          p_error: errorMessage,
          p_retryable: retryable,
        },
      );
      if (completionError) {
        console.error("email-sync-worker: completion failed", completionError.code);
        return "pending";
      }
      return finalStatus === "succeeded" || finalStatus === "failed" ? finalStatus : "pending";
    }));

    for (const status of batchStatuses) {
      if (status === "succeeded") succeeded += 1;
      else if (status === "failed") failed += 1;
      else pending += 1;
    }
  }

  return jsonResponse(200, {
    success: true,
    claimed: jobs.length,
    succeeded,
    pending,
    failed,
  });
});
