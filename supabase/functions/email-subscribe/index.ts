import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = Deno.env.get("BREVO_API_KEY");
  const listId = Deno.env.get("BREVO_LIST_ID");

  if (!apiKey || !listId) {
    return new Response(
      JSON.stringify({ error: "Brevo not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { email, source } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        listIds: [Number(listId)],
        updateEnabled: true,
        attributes: {
          SOURCE: source || "website",
        },
      }),
    });

    const data = await res.json();

    // "Contact already exist" is not an error
    if (!res.ok && data.code !== "duplicate_parameter") {
      console.error("Brevo error:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: data.message || "Brevo request failed" }),
        { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("email-subscribe error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
