import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/*
 * SUBMIT-REVIEW
 *
 * The whole point of this function is the word "verified" on the badge the site
 * renders next to a review. Nothing else in the stack can establish it: the
 * browser can claim anything, and the product_reviews table has no public
 * INSERT path precisely so that this check cannot be routed around. If you make
 * this function lenient, the badge becomes a false advertising claim, not a
 * feature.
 *
 * The bar a submission has to clear:
 *   1. An order with that number exists.
 *   2. Its email matches the one the reviewer typed.
 *   3. It was actually paid for.
 *   4. It was fulfilled — you don't get to review a bottle still in the box.
 *   5. It contains this product.
 *   6. That order hasn't already been used for a review (DB unique index).
 *
 * Approval is separate and manual. Clearing all six gets you status='pending',
 * not a published review.
 *
 * KNOWN LIMITATION: there is no per-IP rate limit here, because there is no
 * shared store to keep counters in. An attacker who knows an order number can
 * grind email addresses against it. The mitigation today is that both halves
 * are needed and neither is published anywhere. If order volume gets big enough
 * that order numbers are guessable at scale, put a counter table or an edge
 * rate limiter in front of this before it matters.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SHOPIFY_DOMAIN = "base-layer-skin.myshopify.com";
const SHOPIFY_API_VERSION = "2025-07";

/*
 * Which storefront handle maps to which Shopify product. Kept here rather than
 * imported because edge functions don't share the Vite module graph. If a
 * second product ever ships, it has to be added in both places — the handle in
 * src/config/reviews.ts and the GID here — or reviews for it are rejected as
 * "not in that order".
 */
const PRODUCT_GIDS: Record<string, string> = {
  "face-cream": "gid://shopify/Product/7469557612615",
};

// A purchase that was paid for at some point. REFUNDED is in the list on
// purpose: a refund doesn't unmake the purchase, and the person who returned it
// has more standing to review it than most, not less.
const PAID_STATUSES = new Set(["PAID", "PARTIALLY_REFUNDED", "REFUNDED"]);
const FULFILLED_STATUSES = new Set(["FULFILLED", "PARTIALLY_FULFILLED"]);

/*
 * One message for both "no such order" and "email doesn't match". Splitting
 * them turns this endpoint into an order-number oracle: an attacker could walk
 * sequential numbers and learn exactly how many orders the store has taken.
 * Once both halves match, more specific errors are safe — you already had to
 * know the pair to get there.
 */
const NO_MATCH = "We couldn't match that order number and email. Check both against your order confirmation.";

const ORDER_QUERY = `
  query VerifyOrder($q: String!) {
    orders(first: 10, query: $q) {
      edges {
        node {
          id
          name
          email
          displayFinancialStatus
          displayFulfillmentStatus
          lineItems(first: 50) {
            edges { node { product { id } } }
          }
        }
      }
    }
  }
`;

interface OrderNode {
  id: string;
  name: string;
  email: string | null;
  displayFinancialStatus: string | null;
  displayFulfillmentStatus: string | null;
  lineItems: { edges: Array<{ node: { product: { id: string } | null } }> };
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function fail(error: string, status = 400) {
  return json({ error }, status);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return fail("Method not allowed", 405);
  }

  const adminToken = Deno.env.get("SHOPIFY_ADMIN_TOKEN");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  // Fail closed. A missing admin token means we cannot verify anything, and
  // writing an unverified row would be worse than rejecting the submission.
  if (!adminToken || !supabaseUrl || !serviceKey) {
    console.error("submit-review: missing SHOPIFY_ADMIN_TOKEN / SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    return fail("Reviews are temporarily unavailable.", 503);
  }

  try {
    const body = await req.json();

    const productHandle = String(body.product_handle ?? "").trim();
    const rating = Number(body.rating);
    const title = String(body.title ?? "").trim();
    const reviewBody = String(body.body ?? "").trim();
    const displayName = String(body.display_name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    // Shoppers type "1001", "#1001", or paste "  #1001 ". Shopify stores it as
    // "#1001". Normalise to the bare digits for the search, compare both forms
    // after.
    const rawOrder = String(body.order_name ?? "").trim();
    const orderDigits = rawOrder.replace(/^#/, "").trim();

    const productGid = PRODUCT_GIDS[productHandle];
    if (!productGid) return fail("Unknown product.");
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return fail("Pick a rating from 1 to 5 stars.");
    if (title.length < 3 || title.length > 80) return fail("Give your review a headline between 3 and 80 characters.");
    if (reviewBody.length < 20 || reviewBody.length > 2000) return fail("Your review needs to be between 20 and 2000 characters.");
    if (displayName.length < 2 || displayName.length > 40) return fail("Enter a display name between 2 and 40 characters.");
    if (!email.includes("@") || email.length > 254) return fail("Enter the email address you ordered with.");
    if (!orderDigits || !/^[A-Za-z0-9-]{1,32}$/.test(orderDigits)) return fail("Enter your order number, e.g. 1001.");

    const shopRes = await fetch(
      `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": adminToken,
        },
        body: JSON.stringify({ query: ORDER_QUERY, variables: { q: `name:${orderDigits}` } }),
      },
    );

    if (!shopRes.ok) {
      console.error("submit-review: Shopify admin HTTP", shopRes.status, await shopRes.text());
      return fail("We couldn't reach our order system. Try again in a minute.", 502);
    }

    const shopJson = await shopRes.json();
    if (shopJson.errors) {
      console.error("submit-review: Shopify admin errors", JSON.stringify(shopJson.errors));
      return fail("We couldn't reach our order system. Try again in a minute.", 502);
    }

    // `name:1001` is a search, not an exact lookup — it can return #11001 too.
    // Compare the name exactly, and require the email to match on the same row.
    const nodes: OrderNode[] = (shopJson.data?.orders?.edges ?? []).map((e: { node: OrderNode }) => e.node);
    const order = nodes.find((n) => {
      const nameMatches = n.name === `#${orderDigits}` || n.name === orderDigits;
      const emailMatches = (n.email ?? "").trim().toLowerCase() === email;
      return nameMatches && emailMatches;
    });

    if (!order) return fail(NO_MATCH, 404);

    if (!PAID_STATUSES.has(order.displayFinancialStatus ?? "")) {
      return fail("That order hasn't been paid yet, so we can't verify it as a purchase.", 403);
    }
    if (!FULFILLED_STATUSES.has(order.displayFulfillmentStatus ?? "")) {
      return fail("That order hasn't shipped yet. Come back once you've had a couple of weeks with it.", 403);
    }

    const hasProduct = (order.lineItems?.edges ?? []).some((e) => e.node?.product?.id === productGid);
    if (!hasProduct) {
      return fail("That order doesn't include this product.", 403);
    }

    // Service role write. RLS is enabled on product_reviews with no policies,
    // so this is the only path that can insert.
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/product_reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        product_handle: productHandle,
        rating,
        title,
        body: reviewBody,
        display_name: displayName,
        reviewer_email: email,
        shopify_order_id: order.id,
        shopify_order_name: order.name,
      }),
    });

    if (insertRes.status === 409) {
      return fail("You've already left a review for that order. Thanks — one per order.", 409);
    }
    if (!insertRes.ok) {
      console.error("submit-review: insert failed", insertRes.status, await insertRes.text());
      return fail("We couldn't save your review. Try again in a minute.", 500);
    }

    return json({ success: true }, 200);
  } catch (err) {
    console.error("submit-review error:", err);
    return fail("Something went wrong. Try again in a minute.", 500);
  }
});
