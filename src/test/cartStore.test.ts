import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCartStore, type CartItem } from "@/stores/cartStore";

// The cart mutation guards are the revenue path: every CTA on the site
// funnels through addItem/updateQuantity/removeItem, all wrapping the
// Shopify Storefront API. We mock the Storefront API boundary and drive
// the real store so the guard logic (the `if (get().isLoading) return;`
// checks and their `finally` cleanup) runs for real.
const mockStorefrontApiRequest = vi.fn();
vi.mock("@/lib/shopify", () => ({
  storefrontApiRequest: (...args: unknown[]) => mockStorefrontApiRequest(...args),
}));

const testItem: Omit<CartItem, "lineId"> = {
  product: {
    node: {
      id: "gid://shopify/Product/1",
      title: "Test Face Cream",
      description: "",
      handle: "test-face-cream",
      priceRange: { minVariantPrice: { amount: "38.00", currencyCode: "USD" } },
      images: { edges: [] },
      variants: { edges: [] },
      options: [],
    },
  },
  variantId: "gid://shopify/ProductVariant/1",
  variantTitle: "50mL",
  price: { amount: "38.00", currencyCode: "USD" },
  quantity: 1,
  selectedOptions: [],
  sellingPlanId: null,
};

function cartCreateResponse(lineId = "gid://shopify/CartLine/1") {
  return {
    data: {
      cartCreate: {
        cart: {
          id: "gid://shopify/Cart/1",
          checkoutUrl: "https://example.myshopify.com/checkout",
          lines: { edges: [{ node: { id: lineId, merchandise: { id: testItem.variantId } } }] },
        },
        userErrors: [],
      },
    },
  };
}

function cartLinesUpdateResponse() {
  return { data: { cartLinesUpdate: { cart: { id: "gid://shopify/Cart/1" }, userErrors: [] } } };
}

function cartLinesRemoveResponse() {
  return { data: { cartLinesRemove: { cart: { id: "gid://shopify/Cart/1" }, userErrors: [] } } };
}

function deferred<T>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

beforeEach(() => {
  mockStorefrontApiRequest.mockReset();
  localStorage.clear();
  // Reset the mutable fields only (merge, not replace) so the action
  // functions defined at store-creation time stay attached.
  useCartStore.setState({
    items: [],
    cartId: null,
    checkoutUrl: null,
    isOpen: false,
    isLoading: false,
    isSyncing: false,
  });
});

describe("cartStore addItem — in-flight guard", () => {
  it("drops a second addItem fired while the first is still in flight: one line, quantity 1", async () => {
    const { promise, resolve } = deferred<ReturnType<typeof cartCreateResponse>>();
    mockStorefrontApiRequest.mockReturnValueOnce(promise);

    const first = useCartStore.getState().addItem(testItem);
    const second = useCartStore.getState().addItem(testItem);

    // The guard must reject the second call before it ever reaches the
    // Storefront API — this is what removing `if (get().isLoading) return;`
    // from addItem would break.
    expect(mockStorefrontApiRequest).toHaveBeenCalledTimes(1);

    resolve(cartCreateResponse());
    await first;
    await second;

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(1);
    expect(useCartStore.getState().isLoading).toBe(false);
  });

  it("resets isLoading to false after a successful call", async () => {
    mockStorefrontApiRequest.mockResolvedValueOnce(cartCreateResponse());
    await useCartStore.getState().addItem(testItem);
    expect(useCartStore.getState().isLoading).toBe(false);
  });

  it("resets isLoading to false when the Storefront API throws (catch + finally both run)", async () => {
    mockStorefrontApiRequest.mockRejectedValueOnce(new Error("network fail"));
    await useCartStore.getState().addItem(testItem);
    expect(useCartStore.getState().isLoading).toBe(false);
  });

  it("does not permanently lock the store: after the in-flight request settles, the next call succeeds", async () => {
    const { promise, resolve } = deferred<ReturnType<typeof cartCreateResponse>>();
    mockStorefrontApiRequest.mockReturnValueOnce(promise);

    const first = useCartStore.getState().addItem(testItem);
    const dropped = useCartStore.getState().addItem(testItem); // guarded, no-op
    resolve(cartCreateResponse());
    await first;
    await dropped;

    // A real follow-up call (same variant → hits the "existingItem" update
    // branch) must go through once isLoading has settled back to false.
    mockStorefrontApiRequest.mockResolvedValueOnce(cartLinesUpdateResponse());
    await useCartStore.getState().addItem(testItem);

    expect(mockStorefrontApiRequest).toHaveBeenCalledTimes(2);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
    expect(useCartStore.getState().isLoading).toBe(false);
  });
});

describe("cartStore updateQuantity(variantId, 0) — delegates to removeItem", () => {
  async function seedCartWithOneItem() {
    mockStorefrontApiRequest.mockResolvedValueOnce(cartCreateResponse("gid://shopify/CartLine/1"));
    await useCartStore.getState().addItem(testItem);
    mockStorefrontApiRequest.mockClear();
  }

  it("actually removes the item via removeItem's full mutation, not a silent no-op", async () => {
    await seedCartWithOneItem();
    mockStorefrontApiRequest.mockResolvedValueOnce(cartLinesRemoveResponse());

    await useCartStore.getState().updateQuantity(testItem.variantId, 0);

    // This is the fragile assertion: updateQuantity delegates to removeItem
    // BEFORE setting isLoading: true, which is the only reason removeItem's
    // own `if (get().isLoading) return;` guard doesn't reject the call. If
    // that `set({ isLoading: true })` is ever hoisted above the delegation,
    // removeItem's guard trips immediately, the remove mutation below is
    // never sent, the item is never removed, and isLoading is left stuck
    // true (updateQuantity's own early `return` skips its finally block).
    // All three assertions below catch that regression.
    expect(mockStorefrontApiRequest).toHaveBeenCalledTimes(1);
    const [query] = mockStorefrontApiRequest.mock.calls[0];
    expect(query).toContain("cartLinesRemove");
    expect(query).not.toContain("cartLinesUpdate");

    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().isLoading).toBe(false);
  });
});

describe("cartStore persistence", () => {
  it("partialize excludes isLoading, so a rehydrated store never comes back stuck loading", () => {
    useCartStore.setState({ isLoading: true, items: [{ ...testItem, lineId: "gid://shopify/CartLine/1" }] });

    const raw = localStorage.getItem("shopify-cart");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string);

    expect(parsed.state).not.toHaveProperty("isLoading");
    expect(parsed.state.items).toHaveLength(1);
  });
});
