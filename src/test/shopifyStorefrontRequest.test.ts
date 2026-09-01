import { afterEach, describe, expect, it, vi } from "vitest";
import { SHOPIFY_STOREFRONT_TIMEOUT_MS, storefrontApiRequest } from "@/lib/shopify";

describe("Shopify Storefront request availability", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("aborts a stalled request so cart sync cannot lock purchasing indefinitely", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn((_url: string, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => {
        reject(new DOMException("The operation was aborted", "AbortError"));
      });
    }));
    vi.stubGlobal("fetch", fetchMock);

    const request = storefrontApiRequest("query cart { cart { id } }");
    const rejection = expect(request).rejects.toMatchObject({ name: "AbortError" });
    await vi.advanceTimersByTimeAsync(SHOPIFY_STOREFRONT_TIMEOUT_MS);

    await rejection;
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("keeps the timeout active while a successful response body is still stalled", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn((_url: string, init?: RequestInit) => Promise.resolve({
      status: 200,
      ok: true,
      json: () => new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          reject(new DOMException("The operation was aborted", "AbortError"));
        });
      }),
    } as Response));
    vi.stubGlobal("fetch", fetchMock);

    const request = storefrontApiRequest("query cart { cart { id } }");
    const rejection = expect(request).rejects.toMatchObject({ name: "AbortError" });
    await vi.advanceTimersByTimeAsync(SHOPIFY_STOREFRONT_TIMEOUT_MS);

    await rejection;
  });
});
