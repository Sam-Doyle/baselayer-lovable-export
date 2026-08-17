import { createClient } from "npm:@supabase/supabase-js@2.97.0";
import {
  LeadCaptureValidationError,
  isOriginAllowed,
  validateLeadCapture,
  type BrevoSyncPayload,
} from "../_shared/lead-capture.ts";
import { BrevoSyncError, syncBrevoContact } from "../_shared/brevo.ts";

const DEFAULT_ALLOWED_ORIGINS = [
  "https://baselayerskin.co",
  "https://www.baselayerskin.co",
  "https://baselayerskin.netlify.app",
  "https://*--baselayerskin.netlify.app",
  "http://127.0.0.1:8080",
  "http://localhost:8080",
  "http://127.0.0.1:5173",
  "http://localhost:5173",
  "http://127.0.0.1:4173",
  "http://localhost:4173",
];

const MAX_REQUEST_BYTES = 16_384;

interface CaptureRow {
  lead_id: string;
  outbox_id: string;
  sync_status: string;
  should_sync: boolean;
  sync_payload: BrevoSyncPayload | null;
  duplicate: boolean;
}

function allowedOrigins(): string[] {
  const configured = Deno.env.get("ALLOWED_ORIGINS")
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  return configured?.length ? configured : DEFAULT_ALLOWED_ORIGINS;
}

function responseHeaders(origin: string | null): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    Vary: "Origin",
  };
  if (origin && isOriginAllowed(origin, allowedOrigins())) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Headers"] =
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version";
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    headers["Access-Control-Max-Age"] = "86400";
  }
  return headers;
}

function jsonResponse(origin: string | null, status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders(origin) });
}

async function requestKey(req: Request, secret: string): Promise<string | null> {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || req.headers.get("cf-connecting-ip")?.trim();
  if (!address || address.length > 64) return null;
  const input = new TextEncoder().encode(`${secret}:${address}`);
  const digest = await crypto.subtle.digest("SHA-256", input);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  if (!isOriginAllowed(origin, allowedOrigins())) {
    return jsonResponse(origin, 403, { success: false, error: "origin_not_allowed" });
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: responseHeaders(origin) });
  }
  if (req.method !== "POST") {
    return jsonResponse(origin, 405, { success: false, error: "method_not_allowed" });
  }

  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return jsonResponse(origin, 413, { success: false, error: "request_too_large" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("email-subscribe: Supabase service configuration is missing");
    return jsonResponse(origin, 500, { success: false, error: "service_unavailable" });
  }

  let capture;
  try {
    const bodyText = await req.text();
    if (new TextEncoder().encode(bodyText).byteLength > MAX_REQUEST_BYTES) {
      return jsonResponse(origin, 413, { success: false, error: "request_too_large" });
    }
    capture = validateLeadCapture(JSON.parse(bodyText));
  } catch (error) {
    if (error instanceof LeadCaptureValidationError) {
      return jsonResponse(origin, error.status, { success: false, error: error.code });
    }
    return jsonResponse(origin, 400, { success: false, error: "invalid_json" });
  }

  if (capture.requestVersion === 1 && Deno.env.get("ALLOW_LEGACY_LEAD_CAPTURE") !== "true") {
    return jsonResponse(origin, 426, { success: false, error: "client_upgrade_required" });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const rateKey = await requestKey(req, Deno.env.get("LEAD_RATE_LIMIT_SECRET") || serviceRoleKey);
    if (rateKey) {
      const { data: withinLimit, error: rateLimitError } = await supabase.rpc(
        "check_marketing_capture_rate_limit",
        { p_request_key: rateKey, p_max_requests: 10, p_window_minutes: 60 },
      );
      if (rateLimitError) {
        console.error("email-subscribe: rate-limit check failed", rateLimitError.code);
        return jsonResponse(origin, 503, { success: false, error: "service_unavailable" });
      }
      if (!withinLimit) {
        return jsonResponse(origin, 429, { success: false, error: "rate_limited" });
      }
    }

    const occurredAt = capture.consent?.captured_at ?? new Date().toISOString();
    const { data, error: captureError } = await supabase.rpc("capture_marketing_lead", {
      p_submission_id: capture.submissionId,
      p_email: capture.email,
      p_source: capture.source,
      p_skin_concern: capture.concern,
      p_discount_code: capture.discountCode,
      p_attribution: capture.attribution,
      p_consent: capture.consent,
      p_occurred_at: occurredAt,
      p_request_origin: origin,
    });
    if (captureError) {
      console.error("email-subscribe: durable capture failed", captureError.code);
      return jsonResponse(origin, 503, { success: false, error: "capture_failed" });
    }

    const row = (Array.isArray(data) ? data[0] : data) as CaptureRow | null;
    if (!row?.lead_id || !row.outbox_id) {
      console.error("email-subscribe: capture RPC returned no durable record");
      return jsonResponse(origin, 503, { success: false, error: "capture_failed" });
    }

    let syncStatus = row.sync_status === "succeeded" ? "succeeded" : "pending";
    if (row.should_sync && row.sync_payload) {
      const apiKey = Deno.env.get("BREVO_API_KEY");
      const listId = Number(Deno.env.get("BREVO_LIST_ID"));
      try {
        if (!apiKey) throw new BrevoSyncError("Brevo is not configured", true);
        await syncBrevoContact(row.sync_payload, apiKey, listId);
        const { data: completedStatus, error: completionError } = await supabase.rpc(
          "complete_marketing_sync_job",
          { p_outbox_id: row.outbox_id, p_succeeded: true, p_error: null, p_retryable: false },
        );
        if (completionError) {
          console.error("email-subscribe: provider success could not be recorded", completionError.code);
        } else {
          syncStatus = completedStatus === "succeeded" ? "succeeded" : "pending";
        }
      } catch (error) {
        const syncError = error instanceof BrevoSyncError
          ? error
          : new BrevoSyncError("Unexpected provider sync failure", true);
        const { data: completedStatus, error: completionError } = await supabase.rpc("complete_marketing_sync_job", {
          p_outbox_id: row.outbox_id,
          p_succeeded: false,
          p_error: syncError.message,
          p_retryable: syncError.retryable,
        });
        if (completionError) {
          console.error("email-subscribe: provider failure could not be recorded", completionError.code);
        }
        // The lead and consent are durable either way. Retryable failures stay
        // pending; permanent provider/configuration failures are made visible
        // to telemetry and operators without asking the browser to resubmit.
        syncStatus = completionError
          ? "pending"
          : completedStatus === "failed"
            ? "failed"
            : "pending";
      }
    }

    return jsonResponse(origin, 200, {
      success: true,
      lead_id: row.lead_id,
      sync_status: syncStatus,
      duplicate: row.duplicate,
    });
  } catch (error) {
    console.error(
      "email-subscribe: unexpected failure",
      error instanceof Error ? error.name : "UnknownError",
    );
    return jsonResponse(origin, 500, { success: false, error: "service_unavailable" });
  }
});
