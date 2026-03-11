import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DATASET_ID = "916078074161719";
const API_VERSION = "v21.0";

async function sha256(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const accessToken = Deno.env.get("FB_CAPI_ACCESS_TOKEN");
  if (!accessToken) {
    return new Response(
      JSON.stringify({ error: "FB_CAPI_ACCESS_TOKEN not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const {
      event_name,
      event_id,
      event_source_url,
      user_data = {},
      custom_data = {},
    } = body;

    if (!event_name) {
      return new Response(
        JSON.stringify({ error: "event_name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Grab client IP from request headers (forwarded by edge runtime)
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("cf-connecting-ip")
      || user_data.client_ip_address;

    // Hash PII fields per Meta requirements
    const hashedUserData: Record<string, unknown> = {};
    if (user_data.em) hashedUserData.em = [await sha256(user_data.em)];
    if (user_data.fn) hashedUserData.fn = [await sha256(user_data.fn)];
    if (user_data.ln) hashedUserData.ln = [await sha256(user_data.ln)];
    if (user_data.external_id) hashedUserData.external_id = [await sha256(user_data.external_id)];
    if (clientIp) hashedUserData.client_ip_address = clientIp;
    if (user_data.client_user_agent) hashedUserData.client_user_agent = user_data.client_user_agent;
    if (user_data.fbc) hashedUserData.fbc = user_data.fbc;
    if (user_data.fbp) hashedUserData.fbp = user_data.fbp;

    const payload: Record<string, unknown> = {
      data: [
        {
          event_name,
          event_time: Math.floor(Date.now() / 1000),
          event_id,
          event_source_url,
          action_source: "website",
          user_data: hashedUserData,
          custom_data,
        },
      ],
    };

    // Support Meta Test Events tab
    if (body.test_event_code) {
      payload.test_event_code = body.test_event_code;
    }

    const url = `https://graph.facebook.com/${API_VERSION}/${DATASET_ID}/events?access_token=${accessToken}`;

    const fbRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const fbData = await fbRes.json();

    if (!fbRes.ok) {
      console.error("FB CAPI error:", JSON.stringify(fbData));
      return new Response(JSON.stringify({ error: "FB CAPI request failed", details: fbData }), {
        status: fbRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, ...fbData }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("fb-capi error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
