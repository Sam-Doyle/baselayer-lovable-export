import { createClient } from "npm:@supabase/supabase-js@2.97.0";
import {
  processCommerceSignalJob,
  type CommerceSignalJob,
} from "../_shared/commerce-signal-job.ts";

class ProviderError extends Error {
  constructor(message: string, readonly retryable: boolean) {
    super(message);
    this.name = "ProviderError";
  }
}

function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function bearerToken(req: Request): string | null {
  const authorization = req.headers.get("authorization");
  return authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
}

async function brevoContactIsSendable(email: string, apiKey: string): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4_000);
  let response: Response;
  try {
    response = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
      headers: { "api-key": apiKey, Accept: "application/json" },
      signal: controller.signal,
    });
  } catch {
    throw new ProviderError("Brevo contact lookup failed", true);
  } finally {
    clearTimeout(timeout);
  }
  if (response.status === 404) return false;
  if (!response.ok) {
    throw new ProviderError(`Brevo contact lookup HTTP ${response.status}`, response.status === 408 || response.status === 429 || response.status >= 500);
  }
  const body = await response.json() as { emailBlacklisted?: unknown };
  return body.emailBlacklisted !== true;
}

async function publishBrevoEvent(payload: Record<string, unknown>, apiKey: string): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4_000);
  let response: Response;
  try {
    response = await fetch("https://api.brevo.com/v3/events", {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch {
    throw new ProviderError("Brevo event publish failed", true);
  } finally {
    clearTimeout(timeout);
  }
  if (response.ok) return;
  throw new ProviderError(`Brevo event publish HTTP ${response.status}`, response.status === 408 || response.status === 429 || response.status >= 500);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return jsonResponse(405, { success: false, error: "method_not_allowed" });
  const workerSecret = Deno.env.get("COMMERCE_SYNC_WORKER_SECRET");
  if (!workerSecret || bearerToken(req) !== workerSecret) {
    return jsonResponse(401, { success: false, error: "unauthorized" });
  }

  // This second switch is deliberate. Even if an ingestion deployment were
  // accidentally changed, no provider jobs are claimed until rollout is
  // explicitly moved from audit to publish.
  if (Deno.env.get("COMMERCE_LIFECYCLE_MODE") !== "publish") {
    return jsonResponse(200, { success: true, mode: "audit", claimed: 0, succeeded: 0, suppressed: 0, pending: 0, failed: 0 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const brevoApiKey = Deno.env.get("BREVO_API_KEY");
  if (!supabaseUrl || !serviceRoleKey || !brevoApiKey) {
    return jsonResponse(503, { success: false, error: "service_unavailable" });
  }
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error: claimError } = await supabase.rpc("claim_commerce_lifecycle_jobs", { p_limit: 25 });
  if (claimError) {
    console.error("commerce-signal-worker: claim failed", claimError.code);
    return jsonResponse(503, { success: false, error: "claim_failed" });
  }

  const jobs = (data ?? []) as CommerceSignalJob[];
  const counts = { succeeded: 0, suppressed: 0, pending: 0, failed: 0 };
  for (let offset = 0; offset < jobs.length; offset += 5) {
    const outcomes = await Promise.all(jobs.slice(offset, offset + 5).map(async (job) => {
      let outcome = "succeeded";
      let retryable = false;
      let errorMessage: string | null = null;
      try {
        const result = await processCommerceSignalJob(job, {
          contactIsSendable: (email) => brevoContactIsSendable(email, brevoApiKey),
          jobIsStillEligible: async (id) => {
            const { data: eligible, error: eligibilityError } = await supabase.rpc(
              "commerce_lifecycle_job_is_still_eligible",
              { p_outbox_id: id },
            );
            if (eligibilityError) {
              throw new ProviderError("Commerce send-time eligibility check failed", true);
            }
            return eligible === true;
          },
          publish: (payload) => publishBrevoEvent(payload, brevoApiKey),
        });
        outcome = result.outcome;
        retryable = result.retryable;
        errorMessage = result.errorMessage;
      } catch (error) {
        const providerError = error instanceof ProviderError ? error : new ProviderError("Unexpected provider failure", true);
        outcome = "failed";
        retryable = providerError.retryable;
        errorMessage = providerError.message;
      }

      const { data: finalStatus, error: completionError } = await supabase.rpc("complete_commerce_lifecycle_job", {
        p_outbox_id: job.id,
        p_outcome: outcome,
        p_error: errorMessage,
        p_retryable: retryable,
      });
      if (completionError) {
        console.error("commerce-signal-worker: completion failed", completionError.code);
        return "pending";
      }
      return String(finalStatus ?? "pending");
    }));
    for (const outcome of outcomes) {
      if (outcome in counts) counts[outcome as keyof typeof counts] += 1;
      else counts.pending += 1;
    }
  }

  return jsonResponse(200, { success: true, mode: "publish", claimed: jobs.length, ...counts });
});
