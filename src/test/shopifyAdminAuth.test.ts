import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createShopifyAdminTokenProvider,
  REQUIRED_SHOPIFY_ADMIN_SCOPES,
} from "../../supabase/functions/_shared/shopify-admin-auth";

const credentials = {
  shopDomain: "kpfzdg-kw.myshopify.com",
  clientId: "client-id-for-test",
  clientSecret: "client-secret-for-test",
};

function tokenResponse(accessToken: string, expiresIn = 86_399): Response {
  return new Response(JSON.stringify({
    access_token: accessToken,
    expires_in: expiresIn,
    scope: REQUIRED_SHOPIFY_ADMIN_SCOPES.join(","),
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Shopify Admin client-credentials tokens", () => {
  afterEach(() => vi.restoreAllMocks());

  it("mints once, sends form-encoded credentials, and coalesces concurrent callers", async () => {
    let resolveResponse: ((response: Response) => void) | undefined;
    const fetcher = vi.fn(() => new Promise<Response>((resolve) => {
      resolveResponse = resolve;
    })) as unknown as typeof fetch;
    const provider = createShopifyAdminTokenProvider({ fetcher });

    const first = provider.getAccessToken(credentials);
    const second = provider.getAccessToken(credentials);
    expect(fetcher).toHaveBeenCalledTimes(1);

    const [url, init] = vi.mocked(fetcher).mock.calls[0];
    expect(url).toBe("https://kpfzdg-kw.myshopify.com/admin/oauth/access_token");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toEqual({ "Content-Type": "application/x-www-form-urlencoded" });
    const body = init?.body as URLSearchParams;
    expect(body.get("grant_type")).toBe("client_credentials");
    expect(body.get("client_id")).toBe(credentials.clientId);
    expect(body.get("client_secret")).toBe(credentials.clientSecret);

    resolveResponse?.(tokenResponse("shpat_first_token"));
    await expect(Promise.all([first, second])).resolves.toEqual([
      "shpat_first_token",
      "shpat_first_token",
    ]);
    await expect(provider.getAccessToken(credentials)).resolves.toBe("shpat_first_token");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("refreshes before expiration and supports explicit invalidation", async () => {
    let nowMs = 1_000;
    const fetcher = vi.fn()
      .mockResolvedValueOnce(tokenResponse("shpat_first_token", 100))
      .mockResolvedValueOnce(tokenResponse("shpat_second_token", 100))
      .mockResolvedValueOnce(tokenResponse("shpat_third_token", 100)) as unknown as typeof fetch;
    const provider = createShopifyAdminTokenProvider({ fetcher, now: () => nowMs });

    await expect(provider.getAccessToken(credentials)).resolves.toBe("shpat_first_token");
    nowMs += 89_999;
    await expect(provider.getAccessToken(credentials)).resolves.toBe("shpat_first_token");
    nowMs += 1;
    await expect(provider.getAccessToken(credentials)).resolves.toBe("shpat_second_token");

    provider.invalidate(credentials.shopDomain, credentials.clientId);
    await expect(provider.getAccessToken(credentials)).resolves.toBe("shpat_third_token");
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it("rejects expired or malformed token responses without caching them", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(tokenResponse("shpat_expired", 0))
      .mockResolvedValueOnce(new Response("not json", { status: 200 })) as unknown as typeof fetch;
    const provider = createShopifyAdminTokenProvider({ fetcher });

    await expect(provider.getAccessToken(credentials)).rejects.toThrow("shopify_token_invalid_response");
    await expect(provider.getAccessToken(credentials)).rejects.toThrow("shopify_token_invalid_response");
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("fails closed when the installed app is missing an expected scope", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({
      access_token: "shpat_limited_token",
      expires_in: 86_399,
      scope: "read_orders,read_customers",
    }), { status: 200 })) as unknown as typeof fetch;
    const provider = createShopifyAdminTokenProvider({ fetcher });

    await expect(provider.getAccessToken(credentials)).rejects.toThrow("shopify_token_missing_scopes");
  });

  it("never logs or rethrows credentials, tokens, or upstream response bodies", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const fetcher = vi.fn(async () => {
      throw new Error(`upstream leaked ${credentials.clientSecret} shpat_leaked_token`);
    }) as unknown as typeof fetch;
    const provider = createShopifyAdminTokenProvider({ fetcher });

    let errorMessage = "";
    try {
      await provider.getAccessToken(credentials);
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : String(error);
    }

    expect(errorMessage).toBe("shopify_token_unavailable");
    const capturedOutput = JSON.stringify([...errorSpy.mock.calls, ...logSpy.mock.calls]);
    expect(capturedOutput).not.toContain(credentials.clientId);
    expect(capturedOutput).not.toContain(credentials.clientSecret);
    expect(capturedOutput).not.toContain("shpat_leaked_token");
  });
});
