import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCartStore, type CartItem } from "@/stores/cartStore";
import { ShopifyHttpError } from "@/lib/shopify";
import { FREE_SHIPPING_CODE } from "@/config/legal";

// The cart mutation guards are the revenue path: every CTA on the site
// funnels through addItem/updateQuantity/removeItem, all wrapping the
// Shopify Storefront API. We mock the Storefront API boundary and drive
// the real store so the guard logic (the `if (get().isLoading) return;`
// checks and their `finally` cleanup) runs for real.
//
// importOriginal keeps the real ShopifyHttpError class (cartStore's retry
// logic does `error instanceof ShopifyHttpError`; a bare object mock here
// would make that check throw instead of returning false).
const mockStorefrontApiRequest = vi.fn();
vi.mock("@/lib/shopify", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/shopify")>();
  return {
    ...actual,
    storefrontApiRequest: (...args: unknown[]) => mockStorefrontApiRequest(...args),
  };
});

// cartStore calls toast.error(...) directly (following the pattern already
// in src/lib/shopify.ts) rather than through analytics.ts, so we mock
// sonner here to assert on the exact copy shown to the shopper.
const mockToastError = vi.fn();
vi.mock("sonner", () => ({
  toast: { error: (...args: unknown[]) => mockToastError(...args) },
}));

// notifyCartError reports every failure as a cart_error event — that is the
// only thing separating "the add button is broken" from "nobody clicked" in
// the funnel, so it is asserted on rather than left as an untested side
// effect. Mocked here so the real consent gate doesn't swallow it in jsdom.
const mockTrackEvent = vi.fn();
vi.mock("@/lib/analytics", () => ({
  trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
  setCapturedEmail: vi.fn(),
  analyticsBlocked: () => false,
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
  mockToastError.mockClear();
  mockTrackEvent.mockClear();
  localStorage.clear();
  // Reset the mutable fields only (merge, not replace) so the action
  // functions defined at store-creation time stay attached.
  useCartStore.setState({
    items: [],
    cartId: null,
    checkoutUrl: null,
    cost: null,
    isOpen: false,
    isLoading: false,
    isSyncing: false,
  });
});

describe("cartStore — SHIP26 checkout handoff", () => {
  it("creates new Shopify carts with the free-shipping code already attached", async () => {
    mockStorefrontApiRequest.mockResolvedValueOnce(cartCreateResponse());

    await useCartStore.getState().addItem(testItem);

    expect(mockStorefrontApiRequest).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        input: expect.objectContaining({ discountCodes: [FREE_SHIPPING_CODE] }),
      }),
    );
  });

  it("adds SHIP26 without dropping Shopify's required checkout key", () => {
    useCartStore.setState({
      checkoutUrl: "https://example.myshopify.com/cart/c/abc123?key=secret-key",
    });

    const checkoutUrl = new URL(useCartStore.getState().getCheckoutUrl());

    expect(checkoutUrl.searchParams.get("key")).toBe("secret-key");
    expect(checkoutUrl.searchParams.get("discount")).toBe(FREE_SHIPPING_CODE);
    expect(checkoutUrl.searchParams.get("channel")).toBe("online_store");
  });
});

/*
 * The site advertised $35 for a subscription Shopify was going to charge $34
 * for, because every price the cart drawer rendered came from
 * src/config/product.ts and nothing ever asked Shopify. These tests are the
 * check on that: what the shopper sees in the cart has to be what Shopify said,
 * even when — especially when — the local number disagrees.
 */
describe("cartStore — prices come from Shopify, not from local config", () => {
  const shopifyPricedCart = (unitAmount: string, subtotal: string, lineId = "gid://shopify/CartLine/1", quantity = 1) => ({
    id: "gid://shopify/Cart/1",
    checkoutUrl: "https://example.myshopify.com/checkout",
    totalQuantity: quantity,
    cost: {
      subtotalAmount: { amount: subtotal, currencyCode: "USD" },
      totalAmount: { amount: subtotal, currencyCode: "USD" },
    },
    lines: {
      edges: [{
        node: {
          id: lineId,
          quantity,
          cost: { amountPerQuantity: { amount: unitAmount, currencyCode: "USD" } },
          merchandise: { id: testItem.variantId },
          sellingPlanAllocation: null,
        },
      }],
    },
  });

  it("overwrites the seeded config price with the line price Shopify returns", async () => {
    // testItem carries 38.00 from config; Shopify says 34.00. Shopify wins.
    mockStorefrontApiRequest.mockResolvedValueOnce({
      data: { cartCreate: { cart: shopifyPricedCart("34.00", "34.00"), userErrors: [] } },
    });

    await useCartStore.getState().addItem(testItem);

    expect(useCartStore.getState().items[0].price.amount).toBe("34.00");
    expect(useCartStore.getState().cost.subtotalAmount.amount).toBe("34.00");
  });

  it("takes the subtotal from Shopify rather than multiplying the line price out", async () => {
    // A quantity-2 line at 34.00 that Shopify subtotals at 60.00 — a volume
    // rule or cart discount we don't model locally. The drawer must show
    // Shopify's 60.00, not the 68.00 a local sum would produce.
    mockStorefrontApiRequest.mockResolvedValueOnce({
      data: { cartCreate: { cart: shopifyPricedCart("34.00", "60.00", "gid://shopify/CartLine/1", 2), userErrors: [] } },
    });

    await useCartStore.getState().addItem({ ...testItem, quantity: 2 });

    expect(useCartStore.getState().cost.subtotalAmount.amount).toBe("60.00");
  });

  it("repairs a stale price restored from localStorage when the drawer syncs", async () => {
    // The cart was persisted when the plan billed 38.00; admin has since moved
    // it to 35.00. Opening the drawer calls syncCart, which must correct it —
    // otherwise the shopper reads one price here and pays another at checkout.
    useCartStore.setState({
      cartId: "gid://shopify/Cart/1",
      items: [{ ...testItem, lineId: "gid://shopify/CartLine/1", price: { amount: "38.00", currencyCode: "USD" } }],
    });
    mockStorefrontApiRequest.mockResolvedValueOnce({ data: { cart: shopifyPricedCart("35.00", "35.00") } });

    await useCartStore.getState().syncCart();

    expect(useCartStore.getState().items[0].price.amount).toBe("35.00");
    expect(useCartStore.getState().cost.subtotalAmount.amount).toBe("35.00");
  });

  it("matches the subscription line to its own selling plan, not the one-time line of the same variant", async () => {
    // Both lines are the same variant; only sellingPlanAllocation tells them
    // apart. Matching on merchandise id alone would price the subscription at
    // the one-time rate.
    useCartStore.setState({ cartId: "gid://shopify/Cart/1", items: [{ ...testItem, lineId: "gid://shopify/CartLine/1" }] });
    mockStorefrontApiRequest.mockResolvedValueOnce({
      data: {
        cartLinesAdd: {
          cart: {
            id: "gid://shopify/Cart/1",
            cost: { subtotalAmount: { amount: "73.00", currencyCode: "USD" }, totalAmount: { amount: "73.00", currencyCode: "USD" } },
            lines: {
              edges: [
                { node: { id: "gid://shopify/CartLine/1", quantity: 1, cost: { amountPerQuantity: { amount: "38.00", currencyCode: "USD" } }, merchandise: { id: testItem.variantId }, sellingPlanAllocation: null } },
                { node: { id: "gid://shopify/CartLine/2", quantity: 1, cost: { amountPerQuantity: { amount: "35.00", currencyCode: "USD" } }, merchandise: { id: testItem.variantId }, sellingPlanAllocation: { sellingPlan: { id: "gid://shopify/SellingPlan/9" } } } },
              ],
            },
          },
          userErrors: [],
        },
      },
    });

    await useCartStore.getState().addItem({ ...testItem, sellingPlanId: "gid://shopify/SellingPlan/9" });

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(2);
    expect(items.find(i => !i.sellingPlanId).price.amount).toBe("38.00");
    expect(items.find(i => i.sellingPlanId === "gid://shopify/SellingPlan/9").price.amount).toBe("35.00");
    expect(items.find(i => i.sellingPlanId === "gid://shopify/SellingPlan/9").lineId).toBe("gid://shopify/CartLine/2");
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

// The defect this file exists to close: every userErrors path used to
// collapse to a bare `{ success: false }` with the Shopify message thrown
// away and nothing shown to the shopper. GRAB YOURS would just appear to do
// nothing. These tests exercise the actual failure paths and assert both a
// visible toast and a false success result (which gates analytics — see
// EarlyAccessContext.test.tsx for the add_to_cart gating itself).
describe("cartStore addItem — userErrors are surfaced, not swallowed", () => {
  it("a quantity-limit userError (MAXIMUM_EXCEEDED) shows a toast and reports failure, without touching the cart state", async () => {
    mockStorefrontApiRequest.mockResolvedValueOnce({
      data: {
        cartCreate: {
          cart: null,
          userErrors: [{ code: "MAXIMUM_EXCEEDED", field: ["lines", "0", "quantity"], message: "The quantity you requested is not available." }],
        },
      },
    });

    const result = await useCartStore.getState().addItem(testItem);

    expect(result.success).toBe(false);
    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().cartId).toBeNull();
    expect(useCartStore.getState().isLoading).toBe(false);

    // Human, brand-voice copy shown — never the raw Shopify message.
    expect(mockToastError).toHaveBeenCalledTimes(1);
    const [title, opts] = mockToastError.mock.calls[0];
    expect(title).not.toMatch(/quantity you requested/i);
    expect(typeof title).toBe("string");
    expect(opts.description).toEqual(expect.any(String));
  });

  it("a generic userError with no matching code falls back to the generic copy", async () => {
    mockStorefrontApiRequest.mockResolvedValueOnce({
      data: {
        cartCreate: {
          cart: null,
          userErrors: [{ code: "VALIDATION_CUSTOM", field: null, message: "Something Shopify-specific went wrong." }],
        },
      },
    });

    const result = await useCartStore.getState().addItem(testItem);

    expect(result.success).toBe(false);
    expect(mockToastError).toHaveBeenCalledTimes(1);
    const [title] = mockToastError.mock.calls[0];
    expect(title).not.toMatch(/Shopify-specific/i);
  });
});

// The four-way split exists because the old single 'limit' bucket told a
// shopper hitting SELLING_PLAN_NOT_APPLICABLE to "adjust it and try again" —
// a loop they cannot win, since nothing about their quantity is the problem.
// These tests pin the classification, the copy it selects, and which kinds
// get a Retry button.
describe("cartStore — cart error classification, copy, and retry affordance", () => {
  function addFailsWith(userErrors: Array<{ code: string | null; message: string }>) {
    mockStorefrontApiRequest.mockResolvedValueOnce({
      data: { cartCreate: { cart: null, userErrors: userErrors.map(e => ({ ...e, field: null })) } },
    });
  }

  it("an unavailable-variant code gets its own copy and a contact route, never 'change the quantity'", async () => {
    addFailsWith([{ code: "SELLING_PLAN_NOT_APPLICABLE", message: "Selling plan is not applicable." }]);

    await useCartStore.getState().addItem(testItem);

    const [, opts] = mockToastError.mock.calls[0];
    expect(opts.description).toMatch(/contact@baselayerskin\.co/);
    expect(opts.description).not.toMatch(/quantity|amount/i);
  });

  it("unavailable wins over quantity when a response carries both", async () => {
    // Order deliberately puts the quantity code first: classification must not
    // be first-match-wins, or the unfixable error hides behind fixable copy.
    addFailsWith([
      { code: "MAXIMUM_EXCEEDED", message: "Too many." },
      { code: "MERCHANDISE_NOT_APPLICABLE", message: "Not sellable." },
    ]);

    await useCartStore.getState().addItem(testItem);

    const [, opts] = mockToastError.mock.calls[0];
    expect(opts.description).toMatch(/contact@baselayerskin\.co/);
    expect(mockTrackEvent).toHaveBeenCalledWith("cart_error", { kind: "unavailable", operation: "add" });
  });

  it("neither unavailable nor quantity errors offer a Retry button — retrying them fails identically", async () => {
    addFailsWith([{ code: "MAXIMUM_EXCEEDED", message: "Too many." }]);
    await useCartStore.getState().addItem(testItem);
    expect(mockToastError.mock.calls[0][1].action).toBeUndefined();

    mockToastError.mockClear();
    addFailsWith([{ code: "MERCHANDISE_NOT_APPLICABLE", message: "Not sellable." }]);
    await useCartStore.getState().addItem(testItem);
    expect(mockToastError.mock.calls[0][1].action).toBeUndefined();
  });

  it("a generic failure offers Retry, and pressing it actually re-runs the add", async () => {
    addFailsWith([{ code: "VALIDATION_CUSTOM", message: "nope" }]);

    const result = await useCartStore.getState().addItem(testItem);
    expect(result.success).toBe(false);

    const [, opts] = mockToastError.mock.calls[0];
    expect(opts.action.label).toBe("Retry");

    // The retry has no caller awaiting it, so the store fires add_to_cart
    // itself on success — the only place tracking lives inside the store.
    mockStorefrontApiRequest.mockResolvedValueOnce(cartCreateResponse());
    opts.action.onClick();
    await vi.waitFor(() => expect(useCartStore.getState().items).toHaveLength(1));
    await vi.waitFor(() =>
      expect(mockTrackEvent).toHaveBeenCalledWith(
        "add_to_cart",
        expect.objectContaining({ source: "cart_error_retry" })
      )
    );
  });

  it("a transport failure reports as network and does not tell desktop shoppers to check their signal", async () => {
    mockStorefrontApiRequest.mockRejectedValueOnce(new ShopifyHttpError(400));

    await useCartStore.getState().addItem(testItem);

    const [title, opts] = mockToastError.mock.calls[0];
    expect(title).toBe("Connection dropped.");
    expect(opts.description).not.toMatch(/signal/i);
    expect(opts.action.label).toBe("Retry");
    expect(mockTrackEvent).toHaveBeenCalledWith("cart_error", { kind: "network", operation: "add" });
  });

  it("tags the failing operation, so a spike in removes is distinguishable from a spike in adds", async () => {
    mockStorefrontApiRequest.mockResolvedValueOnce(cartCreateResponse("gid://shopify/CartLine/1"));
    await useCartStore.getState().addItem(testItem);
    mockTrackEvent.mockClear();

    mockStorefrontApiRequest.mockResolvedValueOnce({
      data: { cartLinesRemove: { cart: null, userErrors: [{ code: "VALIDATION_CUSTOM", field: null, message: "nope" }] } },
    });
    await useCartStore.getState().removeItem(testItem.variantId);
    expect(mockTrackEvent).toHaveBeenCalledWith("cart_error", { kind: "other", operation: "remove" });

    mockTrackEvent.mockClear();
    mockStorefrontApiRequest.mockResolvedValueOnce({
      data: { cartLinesUpdate: { cart: null, userErrors: [{ code: "MAXIMUM_EXCEEDED", field: null, message: "Too many." }] } },
    });
    await useCartStore.getState().updateQuantity(testItem.variantId, 5);
    expect(mockTrackEvent).toHaveBeenCalledWith("cart_error", { kind: "quantity", operation: "update" });
  });

  it("never sends the raw Shopify message to analytics — it is vendor free text", async () => {
    addFailsWith([{ code: "VALIDATION_CUSTOM", message: "leaky-variant-detail-12345" }]);

    await useCartStore.getState().addItem(testItem);

    const payloads = JSON.stringify(mockTrackEvent.mock.calls);
    expect(payloads).not.toMatch(/leaky-variant-detail/);
  });
});

describe("cartStore addItem — cartNotFound recovery actually recreates and retries", () => {
  it("recovers from a stale cartId on a brand-new line: recreates the cart and lands the item, no toast, no lost click", async () => {
    // Seed an existing (now-stale) cart with one different line already in it.
    useCartStore.setState({
      cartId: "gid://shopify/Cart/stale",
      checkoutUrl: "https://example.myshopify.com/checkout/stale",
      items: [{ ...testItem, variantId: "gid://shopify/ProductVariant/OTHER", lineId: "gid://shopify/CartLine/other" }],
    });

    // First call: cartLinesAdd against the stale cart — Shopify says it's gone.
    mockStorefrontApiRequest.mockResolvedValueOnce({
      data: { cartLinesAdd: { cart: null, userErrors: [{ code: "INVALID", field: ["cartId"], message: "Cart does not exist" }] } },
    });
    // Second call: cartCreate — the recovery path rebuilding a fresh cart.
    mockStorefrontApiRequest.mockResolvedValueOnce(cartCreateResponse("gid://shopify/CartLine/new"));

    const result = await useCartStore.getState().addItem(testItem);

    expect(mockStorefrontApiRequest).toHaveBeenCalledTimes(2);
    const [, secondCallVars] = mockStorefrontApiRequest.mock.calls[1];
    // Confirms the recovery call is a real cartCreate carrying the item the
    // shopper actually tried to add, not just clearCart() with nothing after.
    expect(secondCallVars).toEqual({
      input: {
        lines: [{ quantity: 1, merchandiseId: testItem.variantId }],
        discountCodes: [FREE_SHIPPING_CODE],
      },
    });

    expect(result.success).toBe(true);
    expect(useCartStore.getState().cartId).toBe("gid://shopify/Cart/1");
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].variantId).toBe(testItem.variantId);
    expect(useCartStore.getState().isOpen).toBe(true);
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("recovers from a stale cartId when incrementing an existing line: recreates the cart at the combined quantity", async () => {
    useCartStore.setState({
      cartId: "gid://shopify/Cart/stale",
      checkoutUrl: "https://example.myshopify.com/checkout/stale",
      items: [{ ...testItem, quantity: 2, lineId: "gid://shopify/CartLine/existing" }],
    });

    // cartLinesUpdate against the stale cart fails with cart-not-found.
    mockStorefrontApiRequest.mockResolvedValueOnce({
      data: { cartLinesUpdate: { cart: null, userErrors: [{ code: "INVALID", field: ["cartId"], message: "Cart does not exist" }] } },
    });
    // Recovery: cartCreate at the combined quantity (2 existing + 1 new = 3).
    mockStorefrontApiRequest.mockResolvedValueOnce(cartCreateResponse("gid://shopify/CartLine/new"));

    const result = await useCartStore.getState().addItem(testItem);

    expect(mockStorefrontApiRequest).toHaveBeenCalledTimes(2);
    const [, secondCallVars] = mockStorefrontApiRequest.mock.calls[1] as [string, { input: { lines: Array<{ quantity: number }> } }];
    expect(secondCallVars.input.lines[0].quantity).toBe(3);

    expect(result.success).toBe(true);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(3);
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("if recovery itself also fails, surfaces the generic toast rather than silently dropping the click", async () => {
    useCartStore.setState({
      cartId: "gid://shopify/Cart/stale",
      checkoutUrl: "https://example.myshopify.com/checkout/stale",
      items: [],
    });

    mockStorefrontApiRequest.mockResolvedValueOnce({
      data: { cartLinesAdd: { cart: null, userErrors: [{ code: "INVALID", field: ["cartId"], message: "Cart does not exist" }] } },
    });
    // Recovery attempt also fails.
    mockStorefrontApiRequest.mockResolvedValueOnce({
      data: { cartCreate: { cart: null, userErrors: [{ code: "VALIDATION_CUSTOM", field: null, message: "still broken" }] } },
    });

    const result = await useCartStore.getState().addItem(testItem);

    expect(result.success).toBe(false);
    expect(useCartStore.getState().cartId).toBeNull();
    expect(mockToastError).toHaveBeenCalledTimes(1);
  });
});

describe("cartStore — bounded retry on transient transport failures only", () => {
  it("retries once on a 429 (throttled) and succeeds on the second attempt", async () => {
    mockStorefrontApiRequest.mockRejectedValueOnce(new ShopifyHttpError(429));
    mockStorefrontApiRequest.mockResolvedValueOnce(cartCreateResponse());

    const result = await useCartStore.getState().addItem(testItem);

    expect(mockStorefrontApiRequest).toHaveBeenCalledTimes(2);
    expect(result.success).toBe(true);
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("retries once on a 500 and gives up with a toast if the retry also fails", async () => {
    mockStorefrontApiRequest.mockRejectedValueOnce(new ShopifyHttpError(500));
    mockStorefrontApiRequest.mockRejectedValueOnce(new ShopifyHttpError(500));

    const result = await useCartStore.getState().addItem(testItem);

    // Exactly one retry — not an unbounded loop.
    expect(mockStorefrontApiRequest).toHaveBeenCalledTimes(2);
    expect(result.success).toBe(false);
    expect(mockToastError).toHaveBeenCalledTimes(1);
  });

  it("does NOT retry a hard client error (e.g. 400) — that's not a transient failure", async () => {
    mockStorefrontApiRequest.mockRejectedValueOnce(new ShopifyHttpError(400));

    const result = await useCartStore.getState().addItem(testItem);

    expect(mockStorefrontApiRequest).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(false);
    expect(mockToastError).toHaveBeenCalledTimes(1);
  });

  it("does NOT retry a plain thrown Error (not a recognized transport failure)", async () => {
    mockStorefrontApiRequest.mockRejectedValueOnce(new Error("network fail"));

    const result = await useCartStore.getState().addItem(testItem);

    expect(mockStorefrontApiRequest).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(false);
  });
});

describe("cartStore updateQuantity / removeItem — same userErrors handling as addItem", () => {
  async function seedCartWithOneItem() {
    mockStorefrontApiRequest.mockResolvedValueOnce(cartCreateResponse("gid://shopify/CartLine/1"));
    await useCartStore.getState().addItem(testItem);
    mockStorefrontApiRequest.mockClear();
    mockToastError.mockClear();
  }

  it("updateQuantity: a userError shows a toast, reports failure, and leaves quantity unchanged", async () => {
    await seedCartWithOneItem();
    mockStorefrontApiRequest.mockResolvedValueOnce({
      data: { cartLinesUpdate: { cart: null, userErrors: [{ code: "MAXIMUM_EXCEEDED", field: ["lines", "0", "quantity"], message: "Too many." }] } },
    });

    const result = await useCartStore.getState().updateQuantity(testItem.variantId, 5);

    expect(result.success).toBe(false);
    expect(useCartStore.getState().items[0].quantity).toBe(1);
    expect(mockToastError).toHaveBeenCalledTimes(1);
  });

  it("updateQuantity: cartNotFound recovers by recreating the cart at the target quantity", async () => {
    await seedCartWithOneItem();
    mockStorefrontApiRequest.mockResolvedValueOnce({
      data: { cartLinesUpdate: { cart: null, userErrors: [{ code: "INVALID", field: ["cartId"], message: "Cart does not exist" }] } },
    });
    mockStorefrontApiRequest.mockResolvedValueOnce(cartCreateResponse("gid://shopify/CartLine/new"));

    const result = await useCartStore.getState().updateQuantity(testItem.variantId, 5);

    expect(result.success).toBe(true);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("removeItem: a userError shows a toast, reports failure, and leaves the item in the cart", async () => {
    await seedCartWithOneItem();
    mockStorefrontApiRequest.mockResolvedValueOnce({
      data: { cartLinesRemove: { cart: null, userErrors: [{ code: "VALIDATION_CUSTOM", field: null, message: "nope" }] } },
    });

    const result = await useCartStore.getState().removeItem(testItem.variantId);

    expect(result.success).toBe(false);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(mockToastError).toHaveBeenCalledTimes(1);
  });

  it("removeItem: cartNotFound is treated as success — the item's already gone, which is what remove wants", async () => {
    await seedCartWithOneItem();
    mockStorefrontApiRequest.mockResolvedValueOnce({
      data: { cartLinesRemove: { cart: null, userErrors: [{ code: "INVALID", field: ["cartId"], message: "Cart does not exist" }] } },
    });

    const result = await useCartStore.getState().removeItem(testItem.variantId);

    expect(result.success).toBe(true);
    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().cartId).toBeNull();
    expect(mockToastError).not.toHaveBeenCalled();
  });
});
