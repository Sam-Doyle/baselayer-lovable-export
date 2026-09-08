import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor, within } from "@testing-library/react";
import ShopifyCartDrawer from "@/components/ShopifyCartDrawer";
import { BUY_TIERS, DEFAULT_TIER, buildCartItem } from "@/config/product";
import { EarlyAccessProvider, useEarlyAccess } from "@/context/EarlyAccessContext";
import { useCartStore, type CartItem } from "@/stores/cartStore";

// Exercise the real store and drawer. All outbound boundaries are mocked;
// these checks neither contact Shopify nor emit analytics/lifecycle events.
const mockRequest = vi.fn();
const mockToastError = vi.fn();
const mockTrackEvent = vi.fn();
vi.mock("@/lib/shopify", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/shopify")>(),
  storefrontApiRequest: (...args: unknown[]) => mockRequest(...args),
}));
vi.mock("sonner", () => ({ toast: { error: (...args: unknown[]) => mockToastError(...args) } }));
vi.mock("@/lib/analytics", () => ({ trackEvent: (...args: unknown[]) => mockTrackEvent(...args) }));
vi.mock("@/lib/lifecycle", () => ({
  trackLifecycleCartUpdated: vi.fn(),
  trackLifecycleCartDeleted: vi.fn(),
}));

const cartId = "gid://shopify/Cart/identity-test";
const checkoutUrl = "https://checkout.example.test/cart?key=test-only";
const oneTime: CartItem = {
  ...buildCartItem(BUY_TIERS[0]),
  lineId: "gid://shopify/CartLine/one-time",
  quantity: 2,
};
const subscription: CartItem = {
  ...buildCartItem(BUY_TIERS[2]),
  lineId: "gid://shopify/CartLine/subscription",
};
const thirdLine: CartItem = {
  ...buildCartItem(BUY_TIERS[1]),
  lineId: "gid://shopify/CartLine/third",
};

function shopifyCart(items: CartItem[]) {
  const amount = items.reduce((sum, item) => sum + Number(item.price.amount) * item.quantity, 0).toFixed(2);
  return {
    id: cartId,
    checkoutUrl,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    cost: {
      subtotalAmount: { amount, currencyCode: "USD" },
      totalAmount: { amount, currencyCode: "USD" },
    },
    lines: {
      edges: items.map(item => ({
        node: {
          id: item.lineId,
          quantity: item.quantity,
          cost: { amountPerQuantity: item.price },
          merchandise: {
            id: item.variantId,
            title: item.variantTitle,
            selectedOptions: item.selectedOptions,
            product: {
              id: item.product.node.id,
              title: item.product.node.title,
              handle: item.product.node.handle,
            },
          },
          sellingPlanAllocation: item.sellingPlanId ? { sellingPlan: { id: item.sellingPlanId } } : null,
        },
      })),
    },
  };
}

type Operation = "cartLinesUpdate" | "cartLinesRemove" | "cartLinesAdd";
function mutationResponse(operation: Operation, items: CartItem[]) {
  return { data: { [operation]: { cart: shopifyCart(items), userErrors: [] } } };
}

function seed(items = [oneTime, subscription, thirdLine]) {
  useCartStore.setState({ items, cartId, checkoutUrl, cost: shopifyCart(items).cost });
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}

beforeEach(() => {
  mockRequest.mockReset();
  mockToastError.mockReset();
  mockTrackEvent.mockReset();
  localStorage.clear();
  sessionStorage.clear();
  useCartStore.setState({
    items: [], cartId: null, checkoutUrl: null, cost: null,
    isOpen: false, isLoading: false, isSyncing: false,
  });
  // Fail closed if a future code path bypasses the mocked API boundary.
  vi.stubGlobal("fetch", vi.fn(() => { throw new Error("Network forbidden in cart regression tests"); }));
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe.each(["one-time first", "subscription first"])("line identity: %s", order => {
  const ordered = () => order === "one-time first"
    ? [oneTime, subscription, thirdLine]
    : [subscription, oneTime, thirdLine];

  it("creates both purchase types in order, then adds a third distinct line", async () => {
    const items = ordered();
    mockRequest
      .mockResolvedValueOnce({ data: { cartCreate: { cart: shopifyCart(items.slice(0, 1)), userErrors: [] } } })
      .mockResolvedValueOnce(mutationResponse("cartLinesAdd", items.slice(0, 2)))
      .mockResolvedValueOnce(mutationResponse("cartLinesAdd", items));

    for (const item of items) {
      expect(await useCartStore.getState().addItem(item)).toEqual({ success: true });
    }

    expect(mockRequest).toHaveBeenCalledTimes(3);
    const inputs = mockRequest.mock.calls.map(([, variables]) => variables.input?.lines ?? variables.lines);
    expect(inputs).toEqual(items.map(item => [{
      quantity: item.quantity,
      merchandiseId: item.variantId,
      ...(item.sellingPlanId ? { sellingPlanId: item.sellingPlanId } : {}),
    }]));
    expect(useCartStore.getState().items).toEqual(items);
    expect(useCartStore.getState().cost).toEqual(shopifyCart(items).cost);
  });

  it.each([
    ["update", oneTime], ["update", subscription],
    ["remove", oneTime], ["remove", subscription],
    ["zero", oneTime], ["zero", subscription],
  ] as const)("case %#: %s targets only the selected line", async (action, target) => {
    const initial = ordered();
    seed(initial);
    const expected = action === "update"
      ? initial.map(item => item.lineId === target.lineId ? { ...item, quantity: 3 } : item)
      : initial.filter(item => item.lineId !== target.lineId);
    const operation = action === "update" ? "cartLinesUpdate" : "cartLinesRemove";
    mockRequest.mockResolvedValueOnce(mutationResponse(operation, expected));

    const result = action === "remove"
      ? await useCartStore.getState().removeItem(target.lineId)
      : await useCartStore.getState().updateQuantity(target.lineId, action === "zero" ? 0 : 3);

    expect(result).toEqual({ success: true });
    expect(mockRequest).toHaveBeenCalledExactlyOnceWith(expect.stringContaining(operation), action === "update"
      ? { cartId, lines: [{ id: target.lineId, quantity: 3 }] }
      : { cartId, lineIds: [target.lineId] });
    expect(useCartStore.getState().items).toEqual(expected);
    expect(useCartStore.getState().cost).toEqual(shopifyCart(expected).cost);
    expect(useCartStore.getState().items.find(item => item.lineId === thirdLine.lineId)).toEqual(thirdLine);
  });

  it.each([oneTime, subscription])("re-add increments only $lineId", async target => {
    const initial = ordered();
    seed(initial);
    const expected = initial.map(item => item.lineId === target.lineId ? { ...item, quantity: item.quantity + 1 } : item);
    mockRequest.mockResolvedValueOnce(mutationResponse("cartLinesUpdate", expected));

    expect(await useCartStore.getState().addItem({ ...target, quantity: 1 })).toEqual({ success: true });
    expect(mockRequest).toHaveBeenCalledExactlyOnceWith(expect.stringContaining("cartLinesUpdate"), {
      cartId, lines: [{ id: target.lineId, quantity: target.quantity + 1 }],
    });
    expect(useCartStore.getState().items).toEqual(expected);
  });
});

describe("invalid line and retry identity", () => {
  it.each(["update", "remove", "re-add"] as const)("%s never changes a sibling when a legacy response omits line data", async action => {
    seed();
    const operation = action === "remove" ? "cartLinesRemove" : "cartLinesUpdate";
    mockRequest.mockResolvedValueOnce({ data: { [operation]: { cart: { id: cartId }, userErrors: [] } } });
    const result = action === "remove"
      ? await useCartStore.getState().removeItem(subscription.lineId)
      : action === "update"
        ? await useCartStore.getState().updateQuantity(subscription.lineId, 3)
        : await useCartStore.getState().addItem(subscription);
    expect(result).toEqual({ success: true });
    expect(useCartStore.getState().items).toEqual(action === "remove"
      ? [oneTime, thirdLine]
      : [oneTime, { ...subscription, quantity: action === "update" ? 3 : 2 }, thirdLine]);
  });

  it.each([null, oneTime.variantId, "gid://shopify/CartLine/missing"])("rejects invalid line %s without sending a mutation", async lineId => {
    seed();
    const initial = useCartStore.getState().items;
    expect(await useCartStore.getState().updateQuantity(lineId, 3)).toEqual({ success: false });
    expect(await useCartStore.getState().updateQuantity(lineId, 0)).toEqual({ success: false });
    expect(await useCartStore.getState().removeItem(lineId)).toEqual({ success: false });
    expect(mockRequest).not.toHaveBeenCalled();
    expect(useCartStore.getState().items).toBe(initial);
    expect(useCartStore.getState().isLoading).toBe(false);
  });

  it.each(["update", "remove"] as const)("%s retry retains the exact subscription line after reorder", async action => {
    seed();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const operation = action === "update" ? "cartLinesUpdate" : "cartLinesRemove";
    mockRequest.mockRejectedValueOnce(new Error("test transport failure"));
    const failed = action === "update"
      ? await useCartStore.getState().updateQuantity(subscription.lineId, 3)
      : await useCartStore.getState().removeItem(subscription.lineId);
    expect(failed).toEqual({ success: false });
    expect(useCartStore.getState().items).toEqual([oneTime, subscription, thirdLine]);
    expect(useCartStore.getState().isLoading).toBe(false);
    const retry = mockToastError.mock.calls[0][1].action.onClick as () => void;

    const reordered = [thirdLine, subscription, oneTime];
    seed(reordered);
    const expected = action === "update"
      ? reordered.map(item => item.lineId === subscription.lineId ? { ...item, quantity: 3 } : item)
      : reordered.filter(item => item.lineId !== subscription.lineId);
    mockRequest.mockResolvedValueOnce(mutationResponse(operation, expected));
    retry();
    await waitFor(() => expect(useCartStore.getState().isLoading).toBe(false));

    expect(mockRequest).toHaveBeenLastCalledWith(expect.stringContaining(operation), action === "update"
      ? { cartId, lines: [{ id: subscription.lineId, quantity: 3 }] }
      : { cartId, lineIds: [subscription.lineId] });
    expect(useCartStore.getState().items).toEqual(expected);
  });

  it("clears the cart only when the authoritative remaining line set is empty", async () => {
    seed([subscription]);
    mockRequest.mockResolvedValueOnce(mutationResponse("cartLinesRemove", []));
    expect(await useCartStore.getState().removeItem(subscription.lineId)).toEqual({ success: true });
    expect(useCartStore.getState()).toMatchObject({ items: [], cartId: null, checkoutUrl: null, cost: null, isLoading: false });
  });
});

describe("preparation serialization", () => {
  it.each(["successful", "failed"])("context double-clicks wait for a %s discount and produce one add/event", async outcome => {
    const defaultLine: CartItem = { ...buildCartItem(DEFAULT_TIER), lineId: "gid://shopify/CartLine/default" };
    seed([defaultLine]);
    const pendingDiscount = deferred<unknown>();
    const expected = [{ ...defaultLine, quantity: 2 }];
    mockRequest.mockReturnValueOnce(pendingDiscount.promise).mockResolvedValueOnce(mutationResponse("cartLinesUpdate", expected));
    const discount = useCartStore.getState().applyDiscountCode("TEST");
    const { result } = renderHook(() => useEarlyAccess(), { wrapper: EarlyAccessProvider });
    act(() => {
      result.current.openModal("discount-queue-test");
      result.current.openModal("discount-queue-test");
    });
    expect(mockRequest).toHaveBeenCalledTimes(1);
    await act(async () => {
      pendingDiscount.resolve(outcome === "successful"
        ? { data: { cartDiscountCodesUpdate: { cart: shopifyCart([defaultLine]), userErrors: [] } } }
        : undefined);
      await discount;
    });
    await waitFor(() => expect(useCartStore.getState().items).toEqual(expected));
    expect(mockRequest).toHaveBeenCalledTimes(2);
    expect(mockTrackEvent).toHaveBeenCalledExactlyOnceWith("add_to_cart", expect.objectContaining({
      source: "discount-queue-test", value: DEFAULT_TIER.price,
    }));
  });

  it("allows only one queued add after sync and preserves the recovered subscription", async () => {
    seed([oneTime, thirdLine]);
    const pendingSync = deferred<{ data: { cart: ReturnType<typeof shopifyCart> } }>();
    const expected = [{ ...oneTime, quantity: 3 }, subscription, thirdLine];
    const pendingUpdate = deferred<ReturnType<typeof mutationResponse>>();
    mockRequest.mockReturnValueOnce(pendingSync.promise).mockReturnValueOnce(pendingUpdate.promise);
    const sync = useCartStore.getState().syncCart();
    const firstAdd = useCartStore.getState().addItem({ ...oneTime, quantity: 1 });
    const doubleClick = useCartStore.getState().addItem({ ...oneTime, quantity: 1 });
    expect(mockRequest).toHaveBeenCalledTimes(1);

    pendingSync.resolve({ data: { cart: shopifyCart([oneTime, subscription, thirdLine]) } });
    await sync;
    await waitFor(() => expect(mockRequest).toHaveBeenCalledTimes(2));
    expect(await doubleClick).toEqual({ success: false });
    expect(useCartStore.getState().items).toEqual([oneTime, subscription, thirdLine]);
    pendingUpdate.resolve(mutationResponse("cartLinesUpdate", expected));
    expect(await firstAdd).toEqual({ success: true });
    expect(useCartStore.getState().items).toEqual(expected);
    expect(mockRequest).toHaveBeenCalledTimes(2);
  });

  it.each(["sync", "discount"] as const)("a failed %s releases the waiting add and does not deadlock", async preparation => {
    seed();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const pending = deferred<undefined>();
    const expected = [{ ...oneTime, quantity: 3 }, subscription, thirdLine];
    mockRequest.mockReturnValueOnce(pending.promise).mockResolvedValueOnce(mutationResponse("cartLinesUpdate", expected));
    const prepare = preparation === "sync"
      ? useCartStore.getState().syncCart()
      : useCartStore.getState().applyDiscountCode("TEST");
    const add = useCartStore.getState().addItem({ ...oneTime, quantity: 1 });
    expect(mockRequest).toHaveBeenCalledTimes(1);
    pending.resolve(undefined);
    await prepare;
    expect(await add).toEqual({ success: true });
    expect(useCartStore.getState()).toMatchObject({ items: expected, isLoading: false, isSyncing: false });
  });
});

describe("ShopifyCartDrawer line controls", () => {
  async function open(items = [oneTime, subscription, thirdLine]) {
    seed(items);
    useCartStore.setState({ isOpen: true });
    mockRequest.mockResolvedValueOnce({ data: { cart: shopifyCart(items) } });
    render(<ShopifyCartDrawer />);
    await waitFor(() => expect(useCartStore.getState().isSyncing).toBe(false));
    mockRequest.mockClear();
  }

  const rowFor = (item: CartItem) => screen.getByText(item.variantTitle).parentElement!.parentElement!;

  it("the single-to-two-bottle upsell removes the exact line before adding its replacement", async () => {
    const singleBottle = { ...oneTime, quantity: 1 };
    await open([singleBottle]);
    mockRequest
      .mockResolvedValueOnce(mutationResponse("cartLinesRemove", []))
      .mockResolvedValueOnce({ data: { cartCreate: { cart: shopifyCart([thirdLine]), userErrors: [] } } });
    fireEvent.click(screen.getByRole("button", { name: /Add a second bottle/ }));
    await waitFor(() => expect(useCartStore.getState().items).toEqual([thirdLine]));
    expect(mockRequest).toHaveBeenNthCalledWith(1, expect.stringContaining("cartLinesRemove"), {
      cartId, lineIds: [singleBottle.lineId],
    });
    expect(mockRequest).toHaveBeenNthCalledWith(2, expect.stringContaining("cartCreate"), {
      input: expect.objectContaining({ lines: [{ quantity: 1, merchandiseId: thirdLine.variantId }] }),
    });
  });

  it("a failed upsell removal keeps the single bottle and never adds the replacement", async () => {
    const singleBottle = { ...oneTime, quantity: 1 };
    await open([singleBottle]);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mockRequest.mockRejectedValueOnce(new Error("test removal failure"));
    fireEvent.click(screen.getByRole("button", { name: /Add a second bottle/ }));
    await waitFor(() => expect(useCartStore.getState().isLoading).toBe(false));
    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(useCartStore.getState().items).toEqual([singleBottle]);
  });

  it.each([
    ["Increase", oneTime], ["Increase", subscription],
    ["Decrease", oneTime], ["Decrease", subscription],
    ["Remove", oneTime], ["Remove", subscription],
  ] as const)("%s button sends the selected row's line ID", async (button, target) => {
    await open([subscription, oneTime, thirdLine]);
    const initial = useCartStore.getState().items;
    const quantity = target.quantity + (button === "Increase" ? 1 : -1);
    const remove = button === "Remove" || quantity === 0;
    const expected = remove
      ? initial.filter(item => item.lineId !== target.lineId)
      : initial.map(item => item.lineId === target.lineId ? { ...item, quantity } : item);
    const operation = remove ? "cartLinesRemove" : "cartLinesUpdate";
    mockRequest.mockResolvedValueOnce(mutationResponse(operation, expected));

    fireEvent.click(within(rowFor(target)).getByRole("button", { name: new RegExp(`^${button}`) }));
    await waitFor(() => expect(useCartStore.getState().isLoading).toBe(false));

    expect(mockRequest).toHaveBeenCalledExactlyOnceWith(expect.stringContaining(operation), remove
      ? { cartId, lineIds: [target.lineId] }
      : { cartId, lines: [{ id: target.lineId, quantity }] });
    expect(useCartStore.getState().items).toEqual(expected);
  });

  it("uses stable distinct row keys when same-variant lines reorder", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    await open();
    const subscriptionRow = rowFor(subscription);
    const oneTimeRow = rowFor(oneTime);
    act(() => useCartStore.setState({ items: [thirdLine, subscription, oneTime] }));
    expect(rowFor(subscription)).toBe(subscriptionRow);
    expect(rowFor(oneTime)).toBe(oneTimeRow);
    expect(consoleError.mock.calls.flat().join(" ")).not.toMatch(/same key|unique.*key/i);
  });

  it.each(["no line ID", "mutation pending", "sync pending"])("disables row mutations with %s", async reason => {
    await open();
    act(() => useCartStore.setState(reason === "no line ID"
      ? { items: [{ ...oneTime, lineId: null }, subscription, thirdLine] }
      : reason === "mutation pending" ? { isLoading: true } : { isSyncing: true }));
    for (const button of within(rowFor(oneTime)).getAllByRole("button")) {
      expect(button).toBeDisabled();
      fireEvent.click(button);
    }
    expect(mockRequest).not.toHaveBeenCalled();
  });
});
