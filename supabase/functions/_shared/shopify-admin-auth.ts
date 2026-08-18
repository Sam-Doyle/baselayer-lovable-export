const DEFAULT_TIMEOUT_MS = 6_000;
const MAX_REFRESH_SKEW_MS = 5 * 60 * 1_000;
const MIN_REFRESH_SKEW_MS = 1_000;

export const REQUIRED_SHOPIFY_ADMIN_SCOPES = [
  "read_customers",
  "read_fulfillments",
  "read_orders",
] as const;

export interface ShopifyClientCredentials {
  shopDomain: string;
  clientId: string;
  clientSecret: string;
}

interface ShopifyTokenResponse {
  access_token?: unknown;
  expires_in?: unknown;
  scope?: unknown;
}

interface CachedToken {
  accessToken: string;
  refreshAtMs: number;
}

export interface ShopifyAdminTokenProvider {
  getAccessToken(credentials: ShopifyClientCredentials): Promise<string>;
  invalidate(shopDomain: string, clientId: string): void;
}

interface ProviderDependencies {
  fetcher?: typeof fetch;
  now?: () => number;
  timeoutMs?: number;
  requiredScopes?: readonly string[];
}

function cacheKey(shopDomain: string, clientId: string): string {
  return `${shopDomain}\u0000${clientId}`;
}

function validateCredentials(credentials: ShopifyClientCredentials): void {
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/u.test(credentials.shopDomain)) {
    throw new Error("shopify_token_invalid_shop");
  }
  if (!credentials.clientId || !credentials.clientSecret) {
    throw new Error("shopify_token_not_configured");
  }
}

function validateGrantedScopes(scope: unknown, requiredScopes: readonly string[]): void {
  if (requiredScopes.length === 0) return;
  if (typeof scope !== "string") throw new Error("shopify_token_invalid_response");
  const granted = new Set(scope.split(",").map((value) => value.trim()).filter(Boolean));
  if (requiredScopes.some((required) => !granted.has(required))) {
    throw new Error("shopify_token_missing_scopes");
  }
}

/**
 * Creates an isolate-local token provider. Shopify's client-credentials tokens
 * expire after roughly 24 hours, so the provider refreshes five minutes early
 * and coalesces concurrent refreshes. It never logs credentials, token values,
 * response bodies, or upstream exception messages.
 */
export function createShopifyAdminTokenProvider(
  dependencies: ProviderDependencies = {},
): ShopifyAdminTokenProvider {
  const fetcher = dependencies.fetcher ?? fetch;
  const now = dependencies.now ?? Date.now;
  const timeoutMs = dependencies.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const requiredScopes = dependencies.requiredScopes ?? REQUIRED_SHOPIFY_ADMIN_SCOPES;
  const cache = new Map<string, CachedToken>();
  const inFlight = new Map<string, Promise<string>>();

  async function mint(credentials: ShopifyClientCredentials): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let response: Response;
    try {
      const body = new URLSearchParams({
        grant_type: "client_credentials",
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
      });
      response = await fetcher(`https://${credentials.shopDomain}/admin/oauth/access_token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        signal: controller.signal,
      });
    } catch {
      throw new Error("shopify_token_unavailable");
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) throw new Error(`shopify_token_http_${response.status}`);

    let payload: ShopifyTokenResponse;
    try {
      payload = await response.json() as ShopifyTokenResponse;
    } catch {
      throw new Error("shopify_token_invalid_response");
    }

    if (
      typeof payload.access_token !== "string" || payload.access_token.length < 8 ||
      typeof payload.expires_in !== "number" || !Number.isFinite(payload.expires_in) ||
      payload.expires_in <= 0
    ) {
      throw new Error("shopify_token_invalid_response");
    }
    validateGrantedScopes(payload.scope, requiredScopes);

    const lifetimeMs = payload.expires_in * 1_000;
    const refreshSkewMs = Math.min(
      MAX_REFRESH_SKEW_MS,
      Math.max(MIN_REFRESH_SKEW_MS, lifetimeMs * 0.1),
    );
    const key = cacheKey(credentials.shopDomain, credentials.clientId);
    cache.set(key, {
      accessToken: payload.access_token,
      refreshAtMs: now() + Math.max(0, lifetimeMs - refreshSkewMs),
    });
    return payload.access_token;
  }

  return {
    async getAccessToken(credentials) {
      validateCredentials(credentials);
      const key = cacheKey(credentials.shopDomain, credentials.clientId);
      const cached = cache.get(key);
      if (cached && now() < cached.refreshAtMs) return cached.accessToken;

      const pending = inFlight.get(key);
      if (pending) return pending;

      const request = mint(credentials).finally(() => inFlight.delete(key));
      inFlight.set(key, request);
      return request;
    },

    invalidate(shopDomain, clientId) {
      cache.delete(cacheKey(shopDomain, clientId));
    },
  };
}

export const shopifyAdminTokenProvider = createShopifyAdminTokenProvider();
