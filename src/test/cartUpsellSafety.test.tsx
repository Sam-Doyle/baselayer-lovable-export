import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import ShopifyCartDrawer from '@/components/ShopifyCartDrawer';
import { BUY_TIERS, buildCartItem } from '@/config/product';
import { useCartStore, type CartItem } from '@/stores/cartStore';

const request = vi.fn();
const track = vi.fn();
const toastError = vi.fn();
vi.mock('@/lib/shopify', async original => ({
  ...await original<typeof import('@/lib/shopify')>(),
  storefrontApiRequest: (...args: unknown[]) => request(...args),
}));
vi.mock('@/lib/analytics', () => ({ trackEvent: (...args: unknown[]) => track(...args) }));
vi.mock('@/lib/lifecycle', () => ({ trackLifecycleCartUpdated: vi.fn(), trackLifecycleCartDeleted: vi.fn() }));
vi.mock('sonner', () => ({ toast: { error: (...args: unknown[]) => toastError(...args) } }));

const cartId = 'gid://shopify/Cart/upsell-offline';
const checkoutUrl = 'https://checkout.example.test/cart?key=offline-only';
const single: CartItem = { ...buildCartItem(BUY_TIERS[0]), lineId: 'line-single' };
const pack: CartItem = { ...buildCartItem(BUY_TIERS[1]), lineId: single.lineId };
const subscription: CartItem = { ...buildCartItem(BUY_TIERS[2]), lineId: 'line-subscription' };
function cart(items: CartItem[]) {
  const amount = items.reduce((s, i) => s + Number(i.price.amount) * i.quantity, 0).toFixed(2);
  return { id: cartId, checkoutUrl, totalQuantity: items.reduce((s,i) => s+i.quantity,0),
    cost: { subtotalAmount: { amount, currencyCode: 'USD' }, totalAmount: { amount, currencyCode: 'USD' } },
    lines: { edges: items.map(i => ({ node: { id: i.lineId, quantity: i.quantity,
      merchandise: { id: i.variantId, title: i.variantTitle, selectedOptions: i.selectedOptions,
        product: { id: i.product.node.id, title: i.product.node.title, handle: i.product.node.handle } },
      cost: { amountPerQuantity: i.price },
      sellingPlanAllocation: i.sellingPlanId ? { sellingPlan: { id: i.sellingPlanId } } : null,
    } })) },
  };
}
const response = (items: CartItem[]) => ({ data: { cartLinesUpdate: { cart: cart(items), userErrors: [] } } });
function seed(items = [single]) {
  useCartStore.setState({ items, cartId, checkoutUrl, cost: cart(items).cost,
    isOpen: false, isLoading: false, isSyncing: false, needsSync: false });
}
async function open() {
  useCartStore.setState({ isOpen: true });
  request.mockResolvedValueOnce({ data: { cart: cart(useCartStore.getState().items) } });
  render(<ShopifyCartDrawer />);
  await waitFor(() => expect(useCartStore.getState().isSyncing).toBe(false));
  request.mockClear();
}
function deferred() {
  let resolve!: (value: unknown) => void;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}
beforeEach(() => {
  request.mockReset(); track.mockReset(); toastError.mockReset();
  localStorage.clear(); sessionStorage.clear(); seed();
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  vi.stubGlobal('fetch', vi.fn(() => { throw new Error('Offline cart test forbids network'); }));
});
afterEach(() => { cleanup(); useCartStore.setState({ needsSync: false }); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('one-call upsell replacement', () => {
  it('rejected pack preserves the original single and never reports a successful add', async () => {
    await open();
    request.mockImplementation(async (query: string) => {
      // Baseline remove-then-add loses the single here; a single update is rejected intact.
      if (query.includes('cartLinesRemove')) return { data: { cartLinesRemove: { cart: cart([]), userErrors: [] } } };
      const operation = query.includes('cartCreate') ? 'cartCreate' : query.includes('cartLinesAdd') ? 'cartLinesAdd' : 'cartLinesUpdate';
      return { data: { [operation]: { cart: null, userErrors: [{ code: 'MERCHANDISE_NOT_APPLICABLE', field: ['lines'], message: 'Unavailable pack' }] } } };
    });
    fireEvent.click(screen.getByRole('button', { name: /Add a second bottle/ }));
    await waitFor(() => expect(useCartStore.getState().isLoading).toBe(false));
    expect(useCartStore.getState().items).toEqual([single]);
    expect(request).toHaveBeenCalledTimes(2);
    expect(request.mock.calls[1][0]).toContain('query cart');
    expect(useCartStore.getState().needsSync).toBe(true);
    expect(track.mock.calls.filter(([name]) => name === 'add_to_cart')).toHaveLength(0);
    expect(toastError).toHaveBeenCalledTimes(1);
  });

  it.each(['same', 'new'])('success reconciles %s line ID, target metadata and Shopify price; one event', async identity => {
    await open();
    const accepted = { ...pack, lineId: identity === 'same' ? single.lineId : 'new-pack-line', price: { amount: '67.00', currencyCode: 'USD' } };
    request.mockResolvedValueOnce(response([accepted]));
    fireEvent.click(screen.getByRole('button', { name: /Add a second bottle/ }));
    await waitFor(() => expect(useCartStore.getState().isLoading).toBe(false));
    expect(useCartStore.getState().items).toEqual([accepted]);
    expect(request).toHaveBeenCalledExactlyOnceWith(expect.stringContaining('cartLinesUpdate'), {
      cartId, lines: [{ id: single.lineId, merchandiseId: pack.variantId, quantity: 1 }],
    });
    expect(track.mock.calls.filter(([name]) => name === 'add_to_cart')).toHaveLength(1);
    expect(track).toHaveBeenCalledWith('add_to_cart', expect.objectContaining({ value: 67, source: 'cart_upsell' }));
    expect(useCartStore.getState().needsSync).toBe(false);
  });

  it('locks rapid duplicate upsells and all concurrent cart actions until the single mutation settles', async () => {
    const pending = deferred(); request.mockReturnValueOnce(pending.promise);
    const first = useCartStore.getState().upgradeToTwoPack(single.lineId);
    expect(JSON.parse(localStorage.getItem('shopify-cart')!).state.needsSync).toBe(true);
    expect(await useCartStore.getState().upgradeToTwoPack(single.lineId)).toEqual({ success: false });
    expect(await useCartStore.getState().addItem(buildCartItem(BUY_TIERS[2]))).toEqual({ success: false });
    expect(await useCartStore.getState().removeItem(single.lineId)).toEqual({ success: false });
    expect(await useCartStore.getState().updateQuantity(single.lineId, 2)).toEqual({ success: false });
    expect(await useCartStore.getState().applyDiscountCode('OFFLINE')).toEqual({ success: false });
    await useCartStore.getState().syncCart();
    expect(useCartStore.getState().getCheckoutUrl()).toBeNull();
    expect(request).toHaveBeenCalledTimes(1);
    pending.resolve(response([pack]));
    expect(await first).toEqual({ success: true });
  });

  it.each([[subscription], [{ ...single, quantity: 2 }], [single, subscription], [{ ...single, lineId: null }]].map(items => ({ items })))('rejects ineligible cart %# without touching a subscription/quantity', async ({ items }) => {
    seed(items);
    expect(await useCartStore.getState().upgradeToTwoPack(single.lineId)).toEqual({ success: false });
    expect(useCartStore.getState().items).toEqual(items);
    expect(request).not.toHaveBeenCalled();
  });

  it('revalidates eligibility after a pending authoritative sync discovers a subscription', async () => {
    const pending = deferred(); request.mockReturnValueOnce(pending.promise);
    const sync = useCartStore.getState().syncCart();
    const upgrade = useCartStore.getState().upgradeToTwoPack(single.lineId);
    pending.resolve({ data: { cart: cart([single, subscription]) } });
    await sync;
    expect(await upgrade).toEqual({ success: false });
    expect(request).toHaveBeenCalledTimes(1);
    expect(useCartStore.getState().items).toEqual([single, subscription]);
  });

  it('retains a previously unseen subscription in the authoritative response', async () => {
    request.mockResolvedValueOnce(response([pack, subscription]));
    expect(await useCartStore.getState().upgradeToTwoPack(single.lineId)).toEqual({ success: true });
    expect(useCartStore.getState().items).toEqual([pack, subscription]);
  });

  it('two rapid UI clicks produce one replacement and one success event', async () => {
    await open();
    const pending = deferred(); request.mockReturnValueOnce(pending.promise);
    const button = screen.getByRole('button', { name: /Add a second bottle/ });
    act(() => { fireEvent.click(button); fireEvent.click(button); });
    expect(request).toHaveBeenCalledTimes(1);
    await act(async () => { pending.resolve(response([pack])); });
    expect(track.mock.calls.filter(([name]) => name === 'add_to_cart')).toHaveLength(1);
  });
});

describe('ambiguous replacement acknowledgement', () => {
  it.each(['null', 'failed'])('SERVICE_UNAVAILABLE with %s readback remains guarded and reports no success', async outcome => {
    request.mockResolvedValueOnce({ data: { cartLinesUpdate: { cart: null, userErrors: [{ code: 'SERVICE_UNAVAILABLE', message: 'Saving cart failed' }] } } });
    if (outcome === 'null') request.mockResolvedValueOnce({ data: { cart: null } });
    else request.mockRejectedValueOnce(new Error('Readback unavailable'));
    expect(await useCartStore.getState().upgradeToTwoPack(single.lineId)).toEqual({ success: false });
    expect(useCartStore.getState()).toMatchObject({ items: [single], needsSync: true, isLoading: false });
    expect(useCartStore.getState().getCheckoutUrl()).toBeNull();
    expect(request).toHaveBeenCalledTimes(2);
    expect(request.mock.calls[1][0]).toContain('query cart');
    expect(track.mock.calls.filter(([name]) => name === 'add_to_cart')).toHaveLength(0);
  });

  it('ordinary rejection with a complete single receipt unlocks safely without a readback', async () => {
    request.mockResolvedValueOnce({ data: { cartLinesUpdate: { cart: cart([single]), userErrors: [{ code: 'MERCHANDISE_NOT_APPLICABLE', message: 'Unavailable pack' }] } } });
    expect(await useCartStore.getState().upgradeToTwoPack(single.lineId)).toEqual({ success: false });
    expect(useCartStore.getState()).toMatchObject({ items: [single], needsSync: false });
    expect(request).toHaveBeenCalledTimes(1);
  });

  it.each(['partial', 'foreign'])('rejection with a %s receipt and failed readback stays guarded', async outcome => {
    const receipt = outcome === 'partial' ? { id: cartId } : { ...cart([single]), id: 'other-cart' };
    request.mockResolvedValueOnce({ data: { cartLinesUpdate: { cart: receipt, userErrors: [{ code: 'MERCHANDISE_NOT_APPLICABLE', message: 'Unavailable pack' }] } } })
      .mockRejectedValueOnce(new Error('Readback unavailable'));
    expect(await useCartStore.getState().upgradeToTwoPack(single.lineId)).toEqual({ success: false });
    expect(useCartStore.getState()).toMatchObject({ items: [single], needsSync: true });
    expect(request).toHaveBeenCalledTimes(2);
  });

  it.each(['single', 'pack'])('rejected write with resolved %s readback reconciles but never attributes success', async outcome => {
    await open();
    request.mockResolvedValueOnce({ data: { cartLinesUpdate: { cart: null, userErrors: [{ code: 'SERVICE_UNAVAILABLE', message: 'Saving cart failed' }] } } })
      .mockResolvedValueOnce({ data: { cart: cart(outcome === 'pack' ? [pack] : [single]) } });
    fireEvent.click(screen.getByRole('button', { name: /Add a second bottle/ }));
    await waitFor(() => expect(useCartStore.getState().isLoading).toBe(false));
    expect(useCartStore.getState()).toMatchObject({ items: outcome === 'pack' ? [pack] : [single], needsSync: false });
    expect(track.mock.calls.filter(([name]) => name === 'add_to_cart')).toHaveLength(0);
    expect(request).toHaveBeenCalledTimes(2);
  });

  it.each(['committed', 'unchanged'])('does not retry the mutation; one readback resolves %s state', async outcome => {
    request.mockRejectedValueOnce(new TypeError('Lost acknowledgement'))
      .mockResolvedValueOnce({ data: { cart: cart(outcome === 'committed' ? [pack] : [single]) } });
    expect(await useCartStore.getState().upgradeToTwoPack(single.lineId)).toEqual({ success: outcome === 'committed' });
    expect(request).toHaveBeenCalledTimes(2);
    expect(request.mock.calls[1]).toEqual([expect.stringContaining('query cart'), { id: cartId }]);
    expect(useCartStore.getState().items).toEqual(outcome === 'committed' ? [pack] : [single]);
    expect(useCartStore.getState().needsSync).toBe(false);
  });

  it('incomplete success acknowledgement uses readback instead of reporting an unconfirmed pack', async () => {
    request.mockResolvedValueOnce({ data: { cartLinesUpdate: { cart: { id: cartId }, userErrors: [] } } })
      .mockResolvedValueOnce({ data: { cart: cart([single]) } });
    expect(await useCartStore.getState().upgradeToTwoPack(single.lineId)).toEqual({ success: false });
    expect(useCartStore.getState().items).toEqual([single]);
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('unresolved readback persists guard; only authoritative refresh releases edits/checkout', async () => {
    request.mockRejectedValueOnce(new TypeError('Lost acknowledgement')).mockRejectedValueOnce(new TypeError('Readback unavailable'));
    expect(await useCartStore.getState().upgradeToTwoPack(single.lineId)).toEqual({ success: false });
    expect(useCartStore.getState()).toMatchObject({ items: [single], needsSync: true, isLoading: false });
    const saved = localStorage.getItem('shopify-cart')!;
    expect(JSON.parse(saved).state.needsSync).toBe(true);
    useCartStore.setState({ needsSync: false });
    // Restore the actual persisted snapshot, then rehydrate through Zustand middleware.
    localStorage.setItem('shopify-cart', saved);
    await useCartStore.persist.rehydrate();
    expect(useCartStore.getState().getCheckoutUrl()).toBeNull();
    expect(await useCartStore.getState().addItem(buildCartItem(BUY_TIERS[0]))).toEqual({ success: false });
    expect(await useCartStore.getState().updateQuantity(single.lineId, 2)).toEqual({ success: false });
    expect(await useCartStore.getState().removeItem(single.lineId)).toEqual({ success: false });
    request.mockResolvedValueOnce({ data: { cart: { id: cartId } } });
    await useCartStore.getState().syncCart();
    expect(useCartStore.getState().needsSync).toBe(true);
    request.mockResolvedValueOnce({ data: { cart: cart([pack]) } });
    await useCartStore.getState().syncCart();
    expect(useCartStore.getState()).toMatchObject({ items: [pack], needsSync: false });
    expect(useCartStore.getState().getCheckoutUrl()).not.toBeNull();
  });

  it('drawer shows refresh and blocks checkout/edits while state is unresolved; no success analytics', async () => {
    await open();
    request.mockRejectedValueOnce(new Error('Lost acknowledgement')).mockResolvedValueOnce(undefined);
    fireEvent.click(screen.getByRole('button', { name: /Add a second bottle/ }));
    await waitFor(() => expect(screen.getByRole('button', { name: /Refresh cart/ })).toBeVisible());
    expect(screen.getByRole('button', { name: 'Checkout' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Increase quantity/ })).toBeDisabled();
    expect(track.mock.calls.filter(([name]) => name === 'add_to_cart')).toHaveLength(0);
    request.mockResolvedValueOnce({ data: { cart: cart([single]) } });
    fireEvent.click(screen.getByRole('button', { name: /Refresh cart/ }));
    await waitFor(() => expect(screen.queryByRole('button', { name: /Refresh cart/ })).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Checkout' })).toBeEnabled();
  });

  it('confirmed readback after a lost UI acknowledgement reports success once', async () => {
    await open();
    request.mockRejectedValueOnce(new TypeError('Lost acknowledgement')).mockResolvedValueOnce({ data: { cart: cart([pack]) } });
    fireEvent.click(screen.getByRole('button', { name: /Add a second bottle/ }));
    await waitFor(() => expect(useCartStore.getState().isLoading).toBe(false));
    expect(request).toHaveBeenCalledTimes(2);
    expect(track.mock.calls.filter(([name]) => name === 'add_to_cart')).toHaveLength(1);
  });

  it.each(['wrong cart', 'missing plan', 'invalid price', 'incomplete lines'])('does not unlock on %s readback', async reason => {
    const invalid = cart([pack]);
    if (reason === 'wrong cart') invalid.id = 'other-cart';
    if (reason === 'missing plan') delete invalid.lines.edges[0].node.sellingPlanAllocation;
    if (reason === 'invalid price') invalid.lines.edges[0].node.cost.amountPerQuantity = { amount: 'NaN', currencyCode: 'USD' };
    if (reason === 'incomplete lines') invalid.totalQuantity = 2;
    request.mockRejectedValueOnce(new Error('Lost acknowledgement')).mockResolvedValueOnce({ data: { cart: invalid } });
    expect(await useCartStore.getState().upgradeToTwoPack(single.lineId)).toEqual({ success: false });
    expect(useCartStore.getState()).toMatchObject({ items: [single], needsSync: true });
    expect(useCartStore.getState().getCheckoutUrl()).toBeNull();
  });

  it.each(['missing', 'empty'])('explicit refresh can resolve an authoritative %s cart without recreating it', async outcome => {
    seed(); useCartStore.setState({ needsSync: true });
    request.mockResolvedValueOnce({ data: { cart: outcome === 'missing' ? null : cart([]) } });
    await useCartStore.getState().syncCart();
    expect(useCartStore.getState()).toMatchObject({ cartId: null, items: [], needsSync: false });
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('null or malformed line receipts remain unresolved rather than throwing or unlocking', async () => {
    request.mockResolvedValueOnce({ data: { cartLinesUpdate: { cart: { ...cart([pack]), lines: { edges: [null] } }, userErrors: [] } } })
      .mockResolvedValueOnce({ data: { cart: { ...cart([pack]), lines: { edges: [{ node: null }] } } } });
    expect(await useCartStore.getState().upgradeToTwoPack(single.lineId)).toEqual({ success: false });
    expect(useCartStore.getState()).toMatchObject({ items: [single], needsSync: true, isLoading: false });
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('a fresh store module reloads the persisted guard and opens recovery instead of adding', async () => {
    request.mockRejectedValueOnce(new Error('Lost acknowledgement')).mockResolvedValueOnce(undefined);
    expect(await useCartStore.getState().upgradeToTwoPack(single.lineId)).toEqual({ success: false });
    vi.resetModules();
    const { useCartStore: reloaded } = await import('@/stores/cartStore');
    expect(reloaded.getState()).toMatchObject({ needsSync: true, items: [single], isLoading: false });
    expect(reloaded.getState().getCheckoutUrl()).toBeNull();
    expect(await reloaded.getState().addItem(buildCartItem(BUY_TIERS[0]))).toEqual({ success: false });
    expect(reloaded.getState().isOpen).toBe(true);
    expect(request).toHaveBeenCalledTimes(2);
  });
});
