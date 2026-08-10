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

const mockStorefrontApiRequest = vi.fn();
vi.mock("@/lib/shopify", () => ({
  storefrontApiRequest: (...args: unknown[]) => mockStorefrontApiRequest(...args),
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
  it("a double invocation in the same tick (double-click) fires add_to_cart exactly once", () => {
    // Keep the Storefront API pending so isLoading stays true for the
    // duration of the test, mirroring the window a real double-click
    // lands in.
    mockStorefrontApiRequest.mockReturnValueOnce(new Promise(() => {}));

    const { result } = renderHook(() => useEarlyAccess(), { wrapper: EarlyAccessProvider });

    act(() => {
      result.current.openModal("hero");
      result.current.openModal("hero");
    });

    // This is the assertion that catches removing the
    // `if (useCartStore.getState().isLoading) return;` guard from
    // openModal: without it, both invocations would call trackEvent.
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

    act(() => {
      result.current.openModal("hero");
    });

    expect(mockTrackEvent).toHaveBeenCalledTimes(2);
  });
});
