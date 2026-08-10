import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useEarlyAccess, EarlyAccessProvider } from "@/context/EarlyAccessContext";
import { useCartStore } from "@/stores/cartStore";

// analytics.ts is being edited concurrently by another agent — mock it,
// never touch the real module.
const mockTrackEvent = vi.fn();
vi.mock("@/lib/analytics", () => ({
  trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
  setCapturedEmail: vi.fn(),
}));

// importOriginal keeps the real ShopifyHttpError class — cartStore's retry
// logic does `error instanceof ShopifyHttpError`, which throws instead of
// returning false if that export is missing from the mock.
const mockStorefrontApiRequest = vi.fn();
vi.mock("@/lib/shopify", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/shopify")>();
  return {
    ...actual,
    storefrontApiRequest: (...args: unknown[]) => mockStorefrontApiRequest(...args),
  };
});

// cartStore shows its own toast on failure (via sonner, same pattern as
// src/lib/shopify.ts) — stub it so it doesn't matter here whether a Toaster
// is mounted; these tests only care about the analytics gating.
vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

function cartCreateResponse() {
  return {
    data: {
      cartCreate: {
        cart: {
          id: "gid://shopify/Cart/1",
          checkoutUrl: "https://example.myshopify.com/checkout",
          lines: { edges: [{ node: { id: "gid://shopify/CartLine/1", merchandise: { id: "test" } } }] },
        },
        userErrors: [],
      },
    },
  };
}

function cartLinesUpdateResponse() {
  return { data: { cartLinesUpdate: { cart: { id: "gid://shopify/Cart/1" }, userErrors: [] } } };
}

beforeEach(() => {
  mockTrackEvent.mockClear();
  mockStorefrontApiRequest.mockReset();
  useCartStore.setState({
    items: [],
    cartId: null,
    checkoutUrl: null,
    isOpen: false,
    isLoading: false,
    isSyncing: false,
  });
});

describe("EarlyAccessContext.openModal — analytics double-fire guard", () => {
  it("a double invocation in the same tick (double-click) fires add_to_cart exactly once", async () => {
    // trackEvent now only fires once addItem confirms success (see the
    // "does not fire" failure-path test below), so unlike before we need
    // the call to actually resolve to observe the guard's effect.
    mockStorefrontApiRequest.mockResolvedValueOnce(cartCreateResponse());

    const { result } = renderHook(() => useEarlyAccess(), { wrapper: EarlyAccessProvider });

    act(() => {
      result.current.openModal("hero");
      result.current.openModal("hero");
    });
    await waitFor(() => expect(useCartStore.getState().isLoading).toBe(false));

    // This is the assertion that catches removing the
    // `if (useCartStore.getState().isLoading) return;` guard from
    // openModal (or addItem's own internal guard): without it, both
    // invocations would reach the Storefront API and both would fire
    // trackEvent.
    expect(mockStorefrontApiRequest).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledWith(
      "add_to_cart",
      expect.objectContaining({ source: "hero" })
    );
  });

  it("is not a permanent lock: a new click after the add settles fires a second event", async () => {
    mockStorefrontApiRequest.mockResolvedValueOnce(cartCreateResponse());

    const { result } = renderHook(() => useEarlyAccess(), { wrapper: EarlyAccessProvider });

    act(() => {
      result.current.openModal("hero");
    });
    await waitFor(() => expect(useCartStore.getState().isLoading).toBe(false));

    mockStorefrontApiRequest.mockResolvedValueOnce(cartLinesUpdateResponse());
    act(() => {
      result.current.openModal("hero");
    });
    await waitFor(() => expect(useCartStore.getState().isLoading).toBe(false));

    expect(mockTrackEvent).toHaveBeenCalledTimes(2);
  });
});

describe("EarlyAccessContext.openModal — a failed add must not report a successful add_to_cart", () => {
  it("does not fire add_to_cart when the Storefront API returns userErrors", async () => {
    mockStorefrontApiRequest.mockResolvedValueOnce({
      data: {
        cartCreate: {
          cart: null,
          userErrors: [{ code: "MAXIMUM_EXCEEDED", field: ["lines", "0", "quantity"], message: "Quantity exceeds max" }],
        },
      },
    });

    const { result } = renderHook(() => useEarlyAccess(), { wrapper: EarlyAccessProvider });

    act(() => {
      result.current.openModal("hero");
    });
    await waitFor(() => expect(useCartStore.getState().isLoading).toBe(false));

    expect(mockTrackEvent).not.toHaveBeenCalled();
  });

  it("does not fire add_to_cart when the Storefront API throws", async () => {
    mockStorefrontApiRequest.mockRejectedValueOnce(new Error("network fail"));

    const { result } = renderHook(() => useEarlyAccess(), { wrapper: EarlyAccessProvider });

    act(() => {
      result.current.openModal("hero");
    });
    await waitFor(() => expect(useCartStore.getState().isLoading).toBe(false));

    expect(mockTrackEvent).not.toHaveBeenCalled();
  });

  it("a failed add followed by a real retry click fires add_to_cart exactly once, not twice", async () => {
    mockStorefrontApiRequest.mockResolvedValueOnce({
      data: { cartCreate: { cart: null, userErrors: [{ code: "VALIDATION_CUSTOM", field: null, message: "temporary" }] } },
    });

    const { result } = renderHook(() => useEarlyAccess(), { wrapper: EarlyAccessProvider });

    act(() => {
      result.current.openModal("hero");
    });
    await waitFor(() => expect(useCartStore.getState().isLoading).toBe(false));
    expect(mockTrackEvent).not.toHaveBeenCalled();

    // Shopper clicks GRAB YOURS again — this time it succeeds.
    mockStorefrontApiRequest.mockResolvedValueOnce(cartCreateResponse());
    act(() => {
      result.current.openModal("hero");
    });
    await waitFor(() => expect(useCartStore.getState().isLoading).toBe(false));

    expect(mockTrackEvent).toHaveBeenCalledTimes(1);
  });
});
