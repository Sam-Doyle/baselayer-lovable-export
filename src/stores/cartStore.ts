import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';
import { storefrontApiRequest, ShopifyHttpError, ShopifyProduct } from '@/lib/shopify';

export interface CartItem {
  lineId: string | null;
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
  /** Shopify selling plan GID — present only for subscription lines */
  sellingPlanId?: string | null;
}

function toLineInput(item: CartItem) {
  const line: { quantity: number; merchandiseId: string; sellingPlanId?: string } = {
    quantity: item.quantity,
    merchandiseId: item.variantId,
  };
  if (item.sellingPlanId) line.sellingPlanId = item.sellingPlanId;
  return line;
}

interface MutationResult {
  success: boolean;
}

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isOpen: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  addItem: (item: Omit<CartItem, 'lineId'>) => Promise<MutationResult>;
  updateQuantity: (variantId: string, quantity: number) => Promise<MutationResult>;
  removeItem: (variantId: string) => Promise<MutationResult>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  getCheckoutUrl: () => string | null;
  toggleCart: (open?: boolean) => void;
}

const CART_QUERY = `query cart($id: ID!) { cart(id: $id) { id totalQuantity } }`;

// `code` is requested (in addition to the existing `field`/`message`) so
// failures can be classified into user-facing buckets (quantity/stock limit
// vs. transient vs. everything else) instead of pattern-matching Shopify's
// free-text message, which is what the human-facing toast copy in
// notifyCartError() switches on.
const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id checkoutUrl
        lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }
      }
      userErrors { code field message }
    }
  }
`;

const CART_LINES_ADD_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { id lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } } }
      userErrors { code field message }
    }
  }
`;

const CART_LINES_UPDATE_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id }
      userErrors { code field message }
    }
  }
`;

const CART_LINES_REMOVE_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { id }
      userErrors { code field message }
    }
  }
`;

function formatCheckoutUrl(checkoutUrl: string): string {
  try {
    const url = new URL(checkoutUrl);
    url.searchParams.set('channel', 'online_store');
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}

/* ────────────────────────────────────────────────────────────────
 * Error classification
 *
 * Shopify's CartUserError carries a `code` (from the CartErrorCode enum,
 * verified against the live 2025-07 Storefront API schema) alongside the
 * free-text `message`. We bucket on `code` where we can and only fall back
 * to matching `message` text for "cart not found", which Shopify doesn't
 * expose as a distinct code — it surfaces as a plain-language userError.
 * ──────────────────────────────────────────────────────────────── */

interface ShopifyUserError {
  code?: string | null;
  field: string[] | null;
  message: string;
}

type CartErrorKind = 'limit' | 'network' | 'other' | 'silent';

function isCartNotFoundError(userErrors: ShopifyUserError[]): boolean {
  return userErrors.some(e => e.message.toLowerCase().includes('cart not found') || e.message.toLowerCase().includes('does not exist'));
}

// Quantity-rule / merchandise-availability codes — the "can't add that many
// / that item right now" bucket. Verified against the Storefront 2025-07
// CartErrorCode enum.
const LIMIT_ERROR_CODES = new Set([
  'MINIMUM_NOT_MET',
  'MAXIMUM_EXCEEDED',
  'INVALID_INCREMENT',
  'MERCHANDISE_NOT_APPLICABLE',
  'INVALID_MERCHANDISE_LINE',
  'VARIANT_REQUIRES_SELLING_PLAN',
  'SELLING_PLAN_NOT_APPLICABLE',
  'CART_TOO_LARGE',
]);

function classifyUserErrors(userErrors: ShopifyUserError[]): CartErrorKind {
  if (userErrors.some(e => e.code && LIMIT_ERROR_CODES.has(e.code))) return 'limit';
  // SERVICE_UNAVAILABLE = "An error occurred while saving the cart" — a
  // transient server-side condition, so it gets the same copy as a network
  // failure even though it arrives as a normal 200 response, not a thrown
  // error. (Not auto-retried — see requestWithRetry below.)
  if (userErrors.some(e => e.code === 'SERVICE_UNAVAILABLE')) return 'network';
  return 'other';
}

// Brand voice: direct, short, declarative. No apologising, no "Oops!". Never
// the raw Shopify message — that goes to console.error only, for debugging.
const CART_ERROR_COPY: Record<Exclude<CartErrorKind, 'silent'>, { title: string; description: string }> = {
  limit: {
    title: "That quantity isn't available.",
    description: 'Adjust it and try again.',
  },
  network: {
    title: 'Connection dropped.',
    description: 'Check your signal and try again.',
  },
  other: {
    title: "That didn't go through.",
    description: 'Try again in a moment.',
  },
};

function notifyCartError(kind: CartErrorKind, rawMessage: string): void {
  console.error('Shopify cart error:', rawMessage);
  // 'silent' = storefrontApiRequest already surfaced its own toast (the 402
  // payment-required path) — don't stack a second one on top of it.
  if (kind === 'silent') return;
  const copy = CART_ERROR_COPY[kind];
  toast.error(copy.title, { description: copy.description });
}

/* ────────────────────────────────────────────────────────────────
 * Bounded retry for transient transport failures only — a fetch-level
 * network failure (offline/DNS/CORS, surfaces as a TypeError per the Fetch
 * spec) or an HTTP 429/5xx from Shopify. A hard rejection that already
 * completed a round-trip (userErrors) is never retried here. One retry,
 * short delay — not a generic retry framework.
 * ──────────────────────────────────────────────────────────────── */

const RETRY_DELAY_MS = 400;

function isRetryableTransportError(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  if (error instanceof ShopifyHttpError) return error.status === 429 || error.status >= 500;
  return false;
}

async function requestWithRetry(query: string, variables: Record<string, unknown>) {
  try {
    return await storefrontApiRequest(query, variables);
  } catch (error) {
    if (!isRetryableTransportError(error)) throw error;
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
    return await storefrontApiRequest(query, variables);
  }
}

// Flat shape with optional fields rather than a discriminated union: this
// repo builds with strictNullChecks off (see tsconfig.json), under which TS
// does not reliably narrow a union on a boolean literal `success` field —
// every `if (result.success) {...}` below would otherwise still see the
// error-only fields as missing from the type. Matches the flat-optional
// shape the original mutation helpers already used.
interface CreateCartResult {
  success: boolean;
  cartId?: string;
  checkoutUrl?: string;
  lineId?: string;
  errorKind?: CartErrorKind;
  errorMessage?: string;
}

async function createShopifyCart(item: CartItem): Promise<CreateCartResult> {
  try {
    const data = await requestWithRetry(CART_CREATE_MUTATION, {
      input: { lines: [toLineInput(item)] },
    });
    if (data === undefined) return { success: false, errorKind: 'silent', errorMessage: 'Storefront request blocked (402 — see prior toast).' };
    const userErrors: ShopifyUserError[] = data?.data?.cartCreate?.userErrors || [];
    if (userErrors.length > 0) {
      return { success: false, errorKind: classifyUserErrors(userErrors), errorMessage: userErrors.map(e => e.message).join('; ') };
    }
    const cart = data?.data?.cartCreate?.cart;
    const lineId = cart?.lines?.edges?.[0]?.node?.id;
    if (!cart?.checkoutUrl || !lineId) {
      return { success: false, errorKind: 'other', errorMessage: 'Shopify returned no cart or checkout URL.' };
    }
    return { success: true, cartId: cart.id, checkoutUrl: formatCheckoutUrl(cart.checkoutUrl), lineId };
  } catch (error) {
    return { success: false, errorKind: 'network', errorMessage: error instanceof Error ? error.message : String(error) };
  }
}

// Same flat-shape rationale as CreateCartResult above.
interface LineMutationResult {
  success: boolean;
  lineId?: string;
  cartNotFound?: boolean;
  errorKind?: CartErrorKind;
  errorMessage?: string;
}

async function addLineToShopifyCart(cartId: string, item: CartItem): Promise<LineMutationResult> {
  try {
    const data = await requestWithRetry(CART_LINES_ADD_MUTATION, {
      cartId, lines: [toLineInput(item)],
    });
    if (data === undefined) return { success: false, cartNotFound: false, errorKind: 'silent', errorMessage: 'Storefront request blocked (402 — see prior toast).' };
    const userErrors: ShopifyUserError[] = data?.data?.cartLinesAdd?.userErrors || [];
    if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
    if (userErrors.length > 0) {
      return { success: false, cartNotFound: false, errorKind: classifyUserErrors(userErrors), errorMessage: userErrors.map(e => e.message).join('; ') };
    }
    const lines = data?.data?.cartLinesAdd?.cart?.lines?.edges || [];
    const newLine = lines.find((l: { node: { id: string; merchandise: { id: string } } }) => l.node.merchandise.id === item.variantId);
    return { success: true, lineId: newLine?.node?.id };
  } catch (error) {
    return { success: false, cartNotFound: false, errorKind: 'network', errorMessage: error instanceof Error ? error.message : String(error) };
  }
}

async function updateShopifyCartLine(cartId: string, lineId: string, quantity: number): Promise<LineMutationResult> {
  try {
    const data = await requestWithRetry(CART_LINES_UPDATE_MUTATION, {
      cartId, lines: [{ id: lineId, quantity }],
    });
    if (data === undefined) return { success: false, cartNotFound: false, errorKind: 'silent', errorMessage: 'Storefront request blocked (402 — see prior toast).' };
    const userErrors: ShopifyUserError[] = data?.data?.cartLinesUpdate?.userErrors || [];
    if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
    if (userErrors.length > 0) {
      return { success: false, cartNotFound: false, errorKind: classifyUserErrors(userErrors), errorMessage: userErrors.map(e => e.message).join('; ') };
    }
    return { success: true };
  } catch (error) {
    return { success: false, cartNotFound: false, errorKind: 'network', errorMessage: error instanceof Error ? error.message : String(error) };
  }
}

async function removeLineFromShopifyCart(cartId: string, lineId: string): Promise<LineMutationResult> {
  try {
    const data = await requestWithRetry(CART_LINES_REMOVE_MUTATION, {
      cartId, lineIds: [lineId],
    });
    if (data === undefined) return { success: false, cartNotFound: false, errorKind: 'silent', errorMessage: 'Storefront request blocked (402 — see prior toast).' };
    const userErrors: ShopifyUserError[] = data?.data?.cartLinesRemove?.userErrors || [];
    if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
    if (userErrors.length > 0) {
      return { success: false, cartNotFound: false, errorKind: classifyUserErrors(userErrors), errorMessage: userErrors.map(e => e.message).join('; ') };
    }
    return { success: true };
  } catch (error) {
    return { success: false, cartNotFound: false, errorKind: 'network', errorMessage: error instanceof Error ? error.message : String(error) };
  }
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isOpen: false,
      isLoading: false,
      isSyncing: false,

      toggleCart: (open?: boolean) => set({ isOpen: open !== undefined ? open : !get().isOpen }),

      addItem: async (item) => {
        // Double-submit guard. Every CTA on the site funnels through here (most via
        // EarlyAccessContext.openModal), and a second click before the Storefront API
        // responds creates a duplicate line instead of incrementing quantity.
        // Guarding here rather than per-component covers all call sites.
        if (get().isLoading) return { success: false };
        const { items, cartId, clearCart } = get();
        const existingItem = items.find(i => i.variantId === item.variantId && (i.sellingPlanId || null) === (item.sellingPlanId || null));
        set({ isLoading: true });
        try {
          if (!cartId) {
            const result = await createShopifyCart({ ...item, lineId: null });
            if (result.success) {
              set({ cartId: result.cartId, checkoutUrl: result.checkoutUrl, items: [{ ...item, lineId: result.lineId }], isOpen: true });
              return { success: true };
            }
            notifyCartError(result.errorKind, result.errorMessage);
            return { success: false };
          }

          if (existingItem) {
            if (!existingItem.lineId) return { success: false };
            const newQuantity = existingItem.quantity + item.quantity;
            const result = await updateShopifyCartLine(cartId, existingItem.lineId, newQuantity);
            if (result.success) {
              set({ items: get().items.map(i => i.variantId === item.variantId ? { ...i, quantity: newQuantity } : i), isOpen: true });
              return { success: true };
            }
            if (result.cartNotFound) {
              // The cart Shopify holds is gone (expired/invalid ID). Recover by
              // dropping the stale local cart and recreating it from scratch at
              // the quantity the shopper actually asked for, instead of just
              // clearing state and leaving their click unanswered.
              clearCart();
              const recreate = await createShopifyCart({ ...existingItem, quantity: newQuantity, lineId: null });
              if (recreate.success) {
                set({ cartId: recreate.cartId, checkoutUrl: recreate.checkoutUrl, items: [{ ...existingItem, quantity: newQuantity, lineId: recreate.lineId }], isOpen: true });
                return { success: true };
              }
              notifyCartError(recreate.errorKind, recreate.errorMessage);
              return { success: false };
            }
            notifyCartError(result.errorKind, result.errorMessage);
            return { success: false };
          }

          const result = await addLineToShopifyCart(cartId, { ...item, lineId: null });
          if (result.success) {
            set({ items: [...get().items, { ...item, lineId: result.lineId ?? null }], isOpen: true });
            return { success: true };
          }
          if (result.cartNotFound) {
            // Same recovery as above: rebuild the cart fresh with this item.
            clearCart();
            const recreate = await createShopifyCart({ ...item, lineId: null });
            if (recreate.success) {
              set({ cartId: recreate.cartId, checkoutUrl: recreate.checkoutUrl, items: [{ ...item, lineId: recreate.lineId }], isOpen: true });
              return { success: true };
            }
            notifyCartError(recreate.errorKind, recreate.errorMessage);
            return { success: false };
          }
          notifyCartError(result.errorKind, result.errorMessage);
          return { success: false };
        } catch (error) {
          console.error('Failed to add item:', error);
          notifyCartError('network', error instanceof Error ? error.message : String(error));
          return { success: false };
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (variantId, quantity) => {
        // Same in-flight guard as addItem. The drawer's +/- buttons stay clickable
        // while the Storefront API round-trips, and each click sends an absolute
        // quantity rather than a delta, so two overlapping calls race and the
        // slower response wins — the cart lands on a quantity the user never chose.
        if (get().isLoading) return { success: false };
        // Delegating below is safe because isLoading is still false here; the
        // set({ isLoading: true }) is deliberately after this branch so removeItem's
        // own guard doesn't reject the call. Don't hoist it.
        if (quantity <= 0) return await get().removeItem(variantId);
        const { items, cartId, clearCart } = get();
        const item = items.find(i => i.variantId === variantId);
        if (!item?.lineId || !cartId) return { success: false };
        set({ isLoading: true });
        try {
          const result = await updateShopifyCartLine(cartId, item.lineId, quantity);
          if (result.success) {
            set({ items: get().items.map(i => i.variantId === variantId ? { ...i, quantity } : i) });
            return { success: true };
          }
          if (result.cartNotFound) {
            // Same recovery as addItem's cartNotFound path: rebuild the cart
            // targeting the quantity the shopper asked for.
            clearCart();
            const recreate = await createShopifyCart({ ...item, quantity, lineId: null });
            if (recreate.success) {
              set({ cartId: recreate.cartId, checkoutUrl: recreate.checkoutUrl, items: [{ ...item, quantity, lineId: recreate.lineId }], isOpen: true });
              return { success: true };
            }
            notifyCartError(recreate.errorKind, recreate.errorMessage);
            return { success: false };
          }
          notifyCartError(result.errorKind, result.errorMessage);
          return { success: false };
        } catch (error) {
          console.error('Failed to update quantity:', error);
          notifyCartError('network', error instanceof Error ? error.message : String(error));
          return { success: false };
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (variantId) => {
        // Same in-flight guard as addItem. Reached both from the drawer's remove
        // button and from updateQuantity when quantity hits zero; that delegation
        // happens before updateQuantity sets isLoading, so it still passes.
        if (get().isLoading) return { success: false };
        const { items, cartId, clearCart } = get();
        const item = items.find(i => i.variantId === variantId);
        if (!item?.lineId || !cartId) return { success: false };
        set({ isLoading: true });
        try {
          const result = await removeLineFromShopifyCart(cartId, item.lineId);
          if (result.success) {
            const newItems = get().items.filter(i => i.variantId !== variantId);
            newItems.length === 0 ? clearCart() : set({ items: newItems });
            return { success: true };
          }
          if (result.cartNotFound) {
            // Cart's already gone server-side, which is the end state a remove
            // wants anyway — clearing local state achieves the shopper's intent
            // without needing to recreate a cart just to immediately empty it.
            clearCart();
            return { success: true };
          }
          notifyCartError(result.errorKind, result.errorMessage);
          return { success: false };
        } catch (error) {
          console.error('Failed to remove item:', error);
          notifyCartError('network', error instanceof Error ? error.message : String(error));
          return { success: false };
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: () => set({ items: [], cartId: null, checkoutUrl: null, isOpen: false }),
      getCheckoutUrl: () => get().checkoutUrl,

      syncCart: async () => {
        const { cartId, isSyncing, clearCart } = get();
        if (!cartId || isSyncing) return;
        set({ isSyncing: true });
        try {
          const data = await storefrontApiRequest(CART_QUERY, { id: cartId });
          if (!data) return;
          const cart = data?.data?.cart;
          if (!cart || cart.totalQuantity === 0) clearCart();
        } catch (error) { console.error('Failed to sync cart:', error); }
        finally { set({ isSyncing: false }); }
      },
    }),
    {
      name: 'shopify-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, cartId: state.cartId, checkoutUrl: state.checkoutUrl }),
    }
  )
);
