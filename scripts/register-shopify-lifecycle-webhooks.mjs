const REQUIRED_TOPICS = [
  "ORDERS_PAID",
  "ORDERS_CANCELLED",
  "REFUNDS_CREATE",
  "CUSTOMERS_UPDATE",
  "FULFILLMENTS_CREATE",
  "FULFILLMENTS_UPDATE",
  "FULFILLMENT_EVENTS_CREATE",
];

const API_VERSION = "2026-07";

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function validateShopDomain(value) {
  const domain = value.toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/u.test(domain)) {
    throw new Error("SHOPIFY_SHOP_DOMAIN must be a canonical *.myshopify.com domain");
  }
  return domain;
}

function validateCallbackUrl(value) {
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error("SHOPIFY_LIFECYCLE_CALLBACK_URL must use HTTPS");
  return url.toString();
}

async function graphql(shopDomain, token, query, variables = {}) {
  const response = await fetch(`https://${shopDomain}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });
  const body = await response.json();
  if (!response.ok || body.errors?.length) {
    throw new Error(`Shopify GraphQL failed: HTTP ${response.status}`);
  }
  return body.data;
}

async function main() {
  const shopDomain = validateShopDomain(requireEnv("SHOPIFY_SHOP_DOMAIN"));
  const clientId = requireEnv("SHOPIFY_CLIENT_ID");
  const clientSecret = requireEnv("SHOPIFY_CLIENT_SECRET");
  const callbackUrl = validateCallbackUrl(requireEnv("SHOPIFY_LIFECYCLE_CALLBACK_URL"));
  const dryRun = process.argv.includes("--dry-run");

  const tokenResponse = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  const tokenBody = await tokenResponse.json();
  if (!tokenResponse.ok || typeof tokenBody.access_token !== "string") {
    throw new Error(`Shopify token mint failed: HTTP ${tokenResponse.status}`);
  }

  const existingData = await graphql(
    shopDomain,
    tokenBody.access_token,
    "query ExistingLifecycleWebhooks { webhookSubscriptions(first: 100) { nodes { id topic uri } } }",
  );
  const existing = new Map(
    existingData.webhookSubscriptions.nodes
      .filter((node) => node.uri === callbackUrl)
      .map((node) => [node.topic, node]),
  );

  const mutation = `
    mutation CreateLifecycleWebhook(
      $topic: WebhookSubscriptionTopic!
      $input: WebhookSubscriptionInput!
    ) {
      webhookSubscriptionCreate(topic: $topic, webhookSubscription: $input) {
        webhookSubscription { id topic uri }
        userErrors { field message }
      }
    }
  `;

  for (const topic of REQUIRED_TOPICS) {
    if (existing.has(topic)) {
      console.log(`${topic}: already registered`);
      continue;
    }
    if (dryRun) {
      console.log(`${topic}: would register`);
      continue;
    }
    const data = await graphql(shopDomain, tokenBody.access_token, mutation, {
      topic,
      input: { callbackUrl, format: "JSON" },
    });
    const result = data.webhookSubscriptionCreate;
    if (result.userErrors.length) {
      throw new Error(`${topic}: ${result.userErrors.map((error) => error.message).join("; ")}`);
    }
    console.log(`${topic}: registered`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Webhook registration failed");
  process.exitCode = 1;
});
