import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';
import { storefrontApiRequest, ShopifyHttpError, ShopifyProduct } from '@/lib/shopify';
import { trackEvent } from '@/lib/analytics';
import { trackLifecycleCartDeleted, trackLifecycleCartUpdated } from '@/lib/lifecycle';
import { BUY_TIERS, buildCartItem, metaContentId } from '@/config/product';
import { activeCheckoutDiscountCodes } from '@/config/promotions';
import { appendStoredEmailCampaignParams } from '@/lib/emailCampaign';

export interface Money { amount: string; currencyCode: string }

export interface CartItem {
  lineId: string | null;
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  /**
   * Unit price. Seeded from local config when the line is built (so the toast
   * and the drawer have something to render before the round-trip lands), then
   * overwritten with Shopify's `cost.amountPerQuantity` on every cart response.
   * After the first successful mutation this is Shopify's number, not ours —
   * which is the point: a selling plan or variant repriced in admin can no
   * longer disagree with what the cart shows.
   */
  price: Money;
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
  /** Shopify selling plan GID — present only for subscription lines */
  sellingPlanId?: string | null;
}

/** Cart-level money straight from Shopify. Null until a cart response lands. */
export interface CartCost {
  subtotalAmount: Money;
  totalAmount: Money;
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
  /** Shopify's own subtotal/total. Render this, never a local sum. */
  cost: CartCost | null;
  isOpen: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  addItem: (item: Omit<CartItem, 'lineId'>) => Promise<MutationResult>;
  updateQuantity: (lineId: string | null, quantity: number) => Promise<MutationResult>;
  removeItem: (lineId: string | null) => Promise<MutationResult>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  applyDiscountCode: (code: string) => Promise<{ success: boolean; applicable?: boolean }>;
  getCheckoutUrl: () => string | null;
  toggleCart: (open?: boolean) => void;
}

// `syncCart()` and campaign/quiz discount reconciliation can both start outside
// the drawer. Keep their completion outside persisted state so an add can wait
// for the authoritative cart read before deciding which Shopify line to create
// or increment. Without this, an older response can land after a successful add
// and erase that new line from the drawer even though Shopify still charges it.
let activeCartPreparationPromise: Promise<void> | null = null;

async function waitForCartPreparation(): Promise<void> {
  while (activeCartPreparationPromise) {
    const pending = activeCartPreparationPromise;
    await pending;
    // A new preparation may have started while this one settled. Only return
    // once the promise we observed is still the latest completed operation.
    if (activeCartPreparationPromise === pending) return;
  }
}

/**
 * Sends the authoritative post-mutation Shopify cart to the lifecycle
 * provider. This is intentionally not routed through trackEvent(): GA4/Meta
 * already receive their own commerce events and Brevo needs a different event
 * shape for dynamic abandoned-cart emails.
 */
function emitLifecycleCart(state: CartStore): void {
  if (!state.cartId || state.items.length === 0) return;
  const fallbackTotal = state.items.reduce(
    (sum, item) => sum + Number(item.price.amount) * item.quantity,
    0,
  );
  const currency = state.cost?.subtotalAmount.currencyCode
    || state.items[0]?.price.currencyCode
    || 'USD';
  const checkoutUrl = state.getCheckoutUrl() || 'https://baselayerskin.co/face-cream';

  trackLifecycleCartUpdated({
    id: state.cartId,
    total: Number(state.cost?.subtotalAmount.amount ?? fallbackTotal),
    currency,
    url: checkoutUrl,
    items: state.items.map(item => ({
      id: metaContentId(item.variantId),
      name: item.product.node.title,
      variant: item.variantTitle,
      price: Number(item.price.amount),
      quantity: item.quantity,
      url: 'https://baselayerskin.co/face-cream',
      image: item.product.node.images?.edges?.[0]?.node?.url,
    })),
  });
}

/*
 * One field set for every cart-returning operation, so no code path can end up
 * holding a cart whose prices came from somewhere other than Shopify.
 *
 * `cost.subtotalAmount` is what the drawer's Subtotal renders and
 * `lines[].cost.amountPerQuantity` is what each line renders. Both used to be
 * computed locally from src/config/product.ts, which meant the site would
 * happily advertise a price Shopify had no intention of charging — exactly what
 * happened when the Subscribe & Save plan sat at $34 in admin while every
 * surface here said $35.
 *
 * `sellingPlanAllocation.sellingPlan.id` comes back so a subscription line and a
 * one-time line of the same variant can be told apart when matching Shopify's
 * lines to ours; `merchandise.id` alone can't.
 *
 * The mutations return the full set (not just `cart { id }`) because a cart
 * mutation is the cheapest moment to learn the real price — asking again
 * afterwards would be a second round-trip for something Shopify already sent.
 */
const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  cost {
    subtotalAmount { amount currencyCode }
    totalAmount { amount currencyCode }
  }
  discountCodes { code applicable }
  lines(first: 100) {
    edges {
      node {
        id
        quantity
        cost { amountPerQuantity { amount currencyCode } }
        merchandise {
          ... on ProductVariant {
            id
            title
            selectedOptions { name value }
            product { id title handle }
          }
        }
        sellingPlanAllocation { sellingPlan { id } }
      }
    }
  }
`;

const CART_QUERY = `query cart($id: ID!) { cart(id: $id) { ${CART_FIELDS} } }`;

// `code` is requested (in addition to the existing `field`/`message`) so
// failures can be classified into user-facing buckets (quantity/stock limit
// vs. transient vs. everything else) instead of pattern-matching Shopify's
// free-text message, which is what the human-facing toast copy in
// notifyCartError() switches on.
const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart { ${CART_FIELDS} }
      userErrors { code field message }
    }
  }
`;

const CART_LINES_ADD_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ${CART_FIELDS} }
      userErrors { code field message }
    }
  }
`;

const CART_LINES_UPDATE_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ${CART_FIELDS} }
      userErrors { code field message }
    }
  }
`;

const CART_LINES_REMOVE_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ${CART_FIELDS} }
      userErrors { code field message }
    }
  }
`;

const CART_DISCOUNT_CODES_UPDATE_MUTATION = `
  mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]!) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
      cart { ${CART_FIELDS} }
      userErrors { code field message }
    }
  }
`;

/** A cart line as CART_FIELDS returns it. */
interface ShopifyCartLine {
  id: string;
  quantity: number;
  cost?: { amountPerQuantity?: Money };
  merchandise?: {
    id?: string;
    title?: string;
    selectedOptions?: Array<{ name: string; value: string }>;
    product?: { id?: string; title?: string; handle?: string };
  };
  sellingPlanAllocation?: { sellingPlan?: { id?: string } } | null;
}

/** A cart as CART_FIELDS returns it. */
interface ShopifyCart {
  id: string;
  checkoutUrl?: string;
  totalQuantity?: number;
  cost?: CartCost;
  discountCodes?: Array<{ code: string; applicable: boolean }>;
  lines?: { edges?: Array<{ node: ShopifyCartLine }> };
}

function cartLines(cart: ShopifyCart | null | undefined): ShopifyCartLine[] {
  return (cart?.lines?.edges || []).map(e => e.node);
}

/**
 * Rebuild local line state from Shopify's complete authoritative line set.
 *
 * Match on lineId first (exact), falling back to variant + selling plan for a
 * line we just created and don't have an id for yet. Iterating Shopify's lines
 * instead of local items is deliberate: releases before 2026-09-01 could drop
 * a same-variant subscription locally while leaving it in Shopify. A returning
 * shopper must see every line checkout will charge, and local ghost lines must
 * disappear. Known catalog lines can be reconstructed from product config; an
 * unexpected line gets a transparent generic label rather than staying hidden.
 */
function reconcileItems(items: CartItem[], cart: ShopifyCart | null | undefined): CartItem[] {
  if (!cart?.lines?.edges) return items;
  const lines = cartLines(cart);
  const usedLocalIndexes = new Set<number>();

  return lines.map(line => {
    let localIndex = items.findIndex((item, index) =>
      !usedLocalIndexes.has(index) && !!item.lineId && item.lineId === line.id
    );
    if (localIndex < 0) {
      localIndex = items.findIndex((item, index) =>
        !usedLocalIndexes.has(index) &&
        item.variantId === line.merchandise?.id &&
        (item.sellingPlanId || null) === (line.sellingPlanAllocation?.sellingPlan?.id || null)
      );
    }

    if (localIndex >= 0) usedLocalIndexes.add(localIndex);

    const tier = BUY_TIERS.find(candidate =>
      candidate.variantGid === line.merchandise?.id &&
      (candidate.sellingPlanGid || null) === (line.sellingPlanAllocation?.sellingPlan?.id || null)
    );
    const unit = line.cost?.amountPerQuantity;
    const fallbackPrice = unit ?? { amount: '0.00', currencyCode: 'USD' };
    const baseItem: Omit<CartItem, 'lineId'> = localIndex >= 0
      ? items[localIndex]
      : tier
        ? buildCartItem(tier)
        : {
            product: {
              node: {
                id: line.merchandise?.product?.id ?? 'gid://shopify/Product/unknown',
                title: line.merchandise?.product?.title ?? 'Cart item',
                description: '',
                handle: line.merchandise?.product?.handle ?? '',
                priceRange: { minVariantPrice: fallbackPrice },
                images: { edges: [] },
                variants: { edges: [] },
                options: [],
              },
            },
            variantId: line.merchandise?.id ?? 'gid://shopify/ProductVariant/unknown',
            variantTitle: line.merchandise?.title ?? 'Item',
            price: fallbackPrice,
            quantity: line.quantity,
            selectedOptions: line.merchandise?.selectedOptions ?? [],
            sellingPlanId: line.sellingPlanAllocation?.sellingPlan?.id ?? null,
          };
    return {
      ...baseItem,
      lineId: line.id,
      quantity: typeof line.quantity === 'number' ? line.quantity : baseItem.quantity,
      price: unit?.amount ? { amount: unit.amount, currencyCode: unit.currencyCode } : baseItem.price,
    };
  });
}

function formatCheckoutUrl(checkoutUrl: string): string {
  try {
    const url = new URL(checkoutUrl);
    // Keep Shopify's required `key` parameter intact while carrying the
    // evergreen shipping offer into checkout. This also repairs checkout URLs
    // restored from localStorage before SHIP26 went live.
    url.searchParams.set('discount', activeCheckoutDiscountCodes().join(','));
    url.searchParams.set('channel', 'online_store');
    return appendStoredEmailCampaignParams(url).toString();
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

type CartErrorKind = 'quantity' | 'unavailable' | 'network' | 'other' | 'silent';

// Which cart call failed. Sent with the cart_error event so a spike can be
// attributed — "adds are failing" and "removes are failing" are very
// different problems, and the copy alone can't tell them apart.
type CartOperation = 'add' | 'update' | 'remove';

function isCartNotFoundError(userErrors: ShopifyUserError[]): boolean {
  return userErrors.some(e => e.message.toLowerCase().includes('cart not found') || e.message.toLowerCase().includes('does not exist'));
}

/*
  These two sets were one 'limit' bucket. Splitting them is the whole point:
  the codes below are things the shopper can fix by changing the number in the
  quantity stepper. Verified against the Storefront 2025-07 CartErrorCode enum.
*/
const QUANTITY_ERROR_CODES = new Set([
  'MINIMUM_NOT_MET',
  'MAXIMUM_EXCEEDED',
  'INVALID_INCREMENT',
  'CART_TOO_LARGE',
]);

/*
  These are NOT the shopper's fault and no amount of adjusting fixes them —
  the variant or its selling plan is misconfigured or no longer sellable.
  Telling someone to change their quantity here sends them into a loop they
  cannot win, so they get different copy and a way to reach a human.

  VARIANT_REQUIRES_SELLING_PLAN / SELLING_PLAN_NOT_APPLICABLE specifically
  fire when the Subscriptions app plan drifts from the GIDs pinned in
  src/config/product.ts — recreating the plan in admin changes its GID and
  every subscription add starts failing here. That is a merchandising break
  masquerading as a user error, which is why it now reports as its own kind.
*/
const UNAVAILABLE_ERROR_CODES = new Set([
  'MERCHANDISE_NOT_APPLICABLE',
  'INVALID_MERCHANDISE_LINE',
  'VARIANT_REQUIRES_SELLING_PLAN',
  'SELLING_PLAN_NOT_APPLICABLE',
]);

function classifyUserErrors(userErrors: ShopifyUserError[]): CartErrorKind {
  // Unavailable is checked first on purpose. If a response carries both, the
  // unfixable one has to win — otherwise we'd tell the shopper to adjust a
  // quantity that was never the problem.
  if (userErrors.some(e => e.code && UNAVAILABLE_ERROR_CODES.has(e.code))) return 'unavailable';
  if (userErrors.some(e => e.code && QUANTITY_ERROR_CODES.has(e.code))) return 'quantity';
  // SERVICE_UNAVAILABLE = "An error occurred while saving the cart" — a
  // transient server-side condition, so it gets the same copy as a network
  // failure even though it arrives as a normal 200 response, not a thrown
  // error. (Not auto-retried — see requestWithRetry below.)
  if (userErrors.some(e => e.code === 'SERVICE_UNAVAILABLE')) return 'network';
  return 'other';
}

/*
  Brand voice: direct, short, declarative. No apologising, no "Oops!". Never
  the raw Shopify message — that goes to console.error only, for debugging.

  Deliberate deviation from the brand doc: it says headings are always
  uppercase, and these are sentence case. A toast title is UI notification,
  not a headline, and "THAT DIDN'T GO THROUGH." shouted at someone whose
  purchase just failed reads as blame. Signed off as an exception.
*/
const CART_ERROR_COPY: Record<Exclude<CartErrorKind, 'silent'>, { title: string; description: string }> = {
  quantity: {
    title: "That quantity isn't available.",
    description: 'Change the amount and try again.',
  },
  unavailable: {
    title: "We can't add that right now.",
    description: "Email contact@baselayerskin.co and we'll sort it.",
  },
  network: {
    title: 'Connection dropped.',
    // Not "check your signal" — roughly half of sessions are desktop and have
    // no signal to check. The Retry action carries the instruction instead.
    description: 'Try that again.',
  },
  other: {
    title: "That didn't go through.",
    description: 'Try that again.',
  },
};

// Only these two are worth a Retry button. Retrying a quantity rule or an
// unsellable variant fails identically every time, and a button that always
// fails is worse than no button.
const RETRYABLE_KINDS = new Set<CartErrorKind>(['network', 'other']);

function notifyCartError(
  kind: CartErrorKind,
  rawMessage: string,
  operation: CartOperation,
  onRetry?: () => void,
): void {
  console.error('Shopify cart error:', rawMessage);

  /*
    Every cart failure was previously invisible: it reached the shopper's
    console and nowhere else, so a broken add button and an absence of demand
    looked identical in the funnel. This is the only signal that tells them
    apart.

    Deliberately does NOT send rawMessage. That is vendor free text and can
    carry variant/customer detail; kind + operation is enough to spot a spike
    and the full message is already in the console for debugging.

    Fires before the 'silent' bail — a 402 is still a cart failure worth
    counting, it just already has a toast on screen. trackEvent self-gates on
    consent, so this adds no new tracking for a shopper who declined.
  */
  void trackEvent('cart_error', { kind, operation });

  // 'silent' = storefrontApiRequest already surfaced its own toast (the 402
  // payment-required path) — don't stack a second one on top of it.
  if (kind === 'silent') return;
  const copy = CART_ERROR_COPY[kind];
  toast.error(copy.title, {
    description: copy.description,
    ...(onRetry && RETRYABLE_KINDS.has(kind)
      ? { action: { label: 'Retry', onClick: onRetry } }
      : {}),
  });
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
  /** The cart Shopify returned, carrying the authoritative line and cart costs. */
  cart?: ShopifyCart;
  errorKind?: CartErrorKind;
  errorMessage?: string;
}

async function createShopifyCart(item: CartItem): Promise<CreateCartResult> {
  try {
    const data = await requestWithRetry(CART_CREATE_MUTATION, {
      input: { lines: [toLineInput(item)], discountCodes: activeCheckoutDiscountCodes() },
    });
    if (data === undefined) return { success: false, errorKind: 'silent', errorMessage: 'Storefront request blocked (402 — see prior toast).' };
    const userErrors: ShopifyUserError[] = data?.data?.cartCreate?.userErrors || [];
    if (userErrors.length > 0) {
      return { success: false, errorKind: classifyUserErrors(userErrors), errorMessage: userErrors.map(e => e.message).join('; ') };
    }
    const cart: ShopifyCart = data?.data?.cartCreate?.cart;
    const lineId = cart?.lines?.edges?.[0]?.node?.id;
    if (!cart?.checkoutUrl || !lineId) {
      return { success: false, errorKind: 'other', errorMessage: 'Shopify returned no cart or checkout URL.' };
    }
    return { success: true, cartId: cart.id, checkoutUrl: formatCheckoutUrl(cart.checkoutUrl), lineId, cart };
  } catch (error) {
    return { success: false, errorKind: 'network', errorMessage: error instanceof Error ? error.message : String(error) };
  }
}

// Same flat-shape rationale as CreateCartResult above.
interface LineMutationResult {
  success: boolean;
  lineId?: string;
  /** The cart Shopify returned, carrying the authoritative line and cart costs. */
  cart?: ShopifyCart;
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
    const cart: ShopifyCart = data?.data?.cartLinesAdd?.cart;
    // Match the selling plan too: adding the subscription while the one-time
    // line of the same variant is already in the cart would otherwise latch
    // onto the wrong line and price the subscription at the one-time rate.
    const newLine = cartLines(cart).find(l =>
      l.merchandise?.id === item.variantId &&
      (l.sellingPlanAllocation?.sellingPlan?.id || null) === (item.sellingPlanId || null)
    );
    return { success: true, lineId: newLine?.id, cart };
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
    return { success: true, cart: data?.data?.cartLinesUpdate?.cart };
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
    return { success: true, cart: data?.data?.cartLinesRemove?.cart };
  } catch (error) {
    return { success: false, cartNotFound: false, errorKind: 'network', errorMessage: error instanceof Error ? error.message : String(error) };
  }
}

async function updateShopifyCartDiscountCodes(cartId: string, discountCodes: string[]): Promise<LineMutationResult> {
  try {
    const data = await requestWithRetry(CART_DISCOUNT_CODES_UPDATE_MUTATION, { cartId, discountCodes });
    if (data === undefined) return { success: false, errorKind: 'silent', errorMessage: 'Storefront request blocked (402 — see prior toast).' };
    const userErrors: ShopifyUserError[] = data?.data?.cartDiscountCodesUpdate?.userErrors || [];
    if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
    if (userErrors.length > 0) {
      return { success: false, errorKind: classifyUserErrors(userErrors), errorMessage: userErrors.map(e => e.message).join('; ') };
    }
    return { success: true, cart: data?.data?.cartDiscountCodesUpdate?.cart };
  } catch (error) {
    return { success: false, errorKind: 'network', errorMessage: error instanceof Error ? error.message : String(error) };
  }
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      cost: null,
      isOpen: false,
      isLoading: false,
      isSyncing: false,

      toggleCart: (open?: boolean) => set({ isOpen: open !== undefined ? open : !get().isOpen }),

      applyDiscountCode: async (code) => {
        const normalizedCode = code.trim().toUpperCase();
        if (activeCartPreparationPromise) await waitForCartPreparation();
        // An add/update/remove already in flight owns the authoritative line
        // state. The promotion itself is persisted separately and remains on
        // the checkout URL, so declining to race it is safer than applying a
        // stale cart snapshot over the mutation response.
        if (get().isLoading) return { success: false };
        const { cartId } = get();
        // No cart yet: the promotion module has already persisted the code,
        // and createShopifyCart() will include it on the shopper's first add.
        if (!cartId) return { success: true };

        let releasePreparation!: () => void;
        const preparation = new Promise<void>((resolve) => { releasePreparation = resolve; });
        activeCartPreparationPromise = preparation;
        set({ isLoading: true });
        try {
          const discountCodes = Array.from(new Set([...activeCheckoutDiscountCodes(), normalizedCode]));
          const result = await updateShopifyCartDiscountCodes(cartId, discountCodes);
          if (!result.success) {
            // Do not block the promised quiz reward on a stale or temporarily
            // unreachable cart. The checkout URL fallback still carries both
            // codes, and the next fresh cart includes them at creation.
            return { success: false };
          }

          const cart = result.cart;
          set({
            checkoutUrl: cart?.checkoutUrl ? formatCheckoutUrl(cart.checkoutUrl) : get().checkoutUrl,
            cost: cart?.cost ?? get().cost,
            items: reconcileItems(get().items, cart),
          });
          emitLifecycleCart(get());
          const applied = cart?.discountCodes?.find((discount) => discount.code.toUpperCase() === normalizedCode);
          return { success: true, applicable: applied?.applicable };
        } finally {
          set({ isLoading: false });
          releasePreparation();
          if (activeCartPreparationPromise === preparation) activeCartPreparationPromise = null;
        }
      },

      addItem: async (item) => {
        // Double-submit guard. Every CTA on the site funnels through here (most via
        // EarlyAccessContext.openModal), and a second click before the Storefront API
        // responds creates a duplicate line instead of incrementing quantity.
        // Guarding here rather than per-component covers all call sites.
        if (activeCartPreparationPromise) await waitForCartPreparation();
        // Multiple clicks can queue behind the same sync. Re-check after the
        // await so only the first one starts a mutation and the rest retain the
        // existing double-submit behavior.
        if (get().isLoading) return { success: false };
        const { items, cartId, clearCart } = get();
        const existingItem = items.find(i => i.variantId === item.variantId && (i.sellingPlanId || null) === (item.sellingPlanId || null));

        /*
          Retry handler for the error toast. Re-runs the whole add with the
          same item, so it re-enters every recovery path (cart recreation
          included) rather than replaying one failed mutation.

          It fires add_to_cart itself, which is the one place in the codebase
          that tracking lives in the store instead of at the call site. A
          normal add is tracked by whoever awaited addItem (the PDP,
          EarlyAccessContext); a toast retry has no such caller still waiting,
          so without this a recovered add — a real order — would complete
          unreported and under-count revenue in GA4 and Meta. It cannot
          double-fire with the call-site event, because that caller's promise
          already resolved { success: false } on the failure that produced
          this toast.

          isLoading is false again by the time this can run: the finally block
          clears it before the toast is ever clickable.
        */
        const retryAdd = () => {
          void get().addItem(item).then((result) => {
            if (!result.success) return;
            void trackEvent('add_to_cart', {
              content_name: 'Base Layer Face Cream',
              content_ids: [metaContentId(item.variantId)],
              value: Number(item.price.amount),
              currency: item.price.currencyCode,
              source: 'cart_error_retry',
            });
          });
        };

        set({ isLoading: true });
        try {
          if (!cartId) {
            const result = await createShopifyCart({ ...item, lineId: null });
            if (result.success) {
              set({
                cartId: result.cartId,
                checkoutUrl: result.checkoutUrl,
                items: reconcileItems([{ ...item, lineId: result.lineId }], result.cart),
                cost: result.cart?.cost ?? null,
                isOpen: true,
              });
              emitLifecycleCart(get());
              return { success: true };
            }
            notifyCartError(result.errorKind, result.errorMessage, 'add', retryAdd);
            return { success: false };
          }

          if (existingItem) {
            if (!existingItem.lineId) return { success: false };
            const newQuantity = existingItem.quantity + item.quantity;
            const result = await updateShopifyCartLine(cartId, existingItem.lineId, newQuantity);
            if (result.success) {
              set({
                items: reconcileItems(get().items.map(i => i.lineId === existingItem.lineId ? { ...i, quantity: newQuantity } : i), result.cart),
                cost: result.cart?.cost ?? get().cost,
                isOpen: true,
              });
              emitLifecycleCart(get());
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
                set({
                  cartId: recreate.cartId,
                  checkoutUrl: recreate.checkoutUrl,
                  items: reconcileItems([{ ...existingItem, quantity: newQuantity, lineId: recreate.lineId }], recreate.cart),
                  cost: recreate.cart?.cost ?? null,
                  isOpen: true,
                });
                emitLifecycleCart(get());
                return { success: true };
              }
              notifyCartError(recreate.errorKind, recreate.errorMessage, 'add', retryAdd);
              return { success: false };
            }
            notifyCartError(result.errorKind, result.errorMessage, 'add', retryAdd);
            return { success: false };
          }

          const result = await addLineToShopifyCart(cartId, { ...item, lineId: null });
          if (result.success) {
            set({
              items: reconcileItems([...get().items, { ...item, lineId: result.lineId ?? null }], result.cart),
              cost: result.cart?.cost ?? get().cost,
              isOpen: true,
            });
            emitLifecycleCart(get());
            return { success: true };
          }
          if (result.cartNotFound) {
            // Same recovery as above: rebuild the cart fresh with this item.
            clearCart();
            const recreate = await createShopifyCart({ ...item, lineId: null });
            if (recreate.success) {
              set({
                cartId: recreate.cartId,
                checkoutUrl: recreate.checkoutUrl,
                items: reconcileItems([{ ...item, lineId: recreate.lineId }], recreate.cart),
                cost: recreate.cart?.cost ?? null,
                isOpen: true,
              });
              emitLifecycleCart(get());
              return { success: true };
            }
            notifyCartError(recreate.errorKind, recreate.errorMessage, 'add', retryAdd);
            return { success: false };
          }
          notifyCartError(result.errorKind, result.errorMessage, 'add', retryAdd);
          return { success: false };
        } catch (error) {
          console.error('Failed to add item:', error);
          notifyCartError('network', error instanceof Error ? error.message : String(error), 'add', retryAdd);
          return { success: false };
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (lineId, quantity) => {
        // Same in-flight guard as addItem. The drawer's +/- buttons stay clickable
        // while the Storefront API round-trips, and each click sends an absolute
        // quantity rather than a delta, so two overlapping calls race and the
        // slower response wins — the cart lands on a quantity the user never chose.
        if (get().isLoading || get().isSyncing) return { success: false };
        // Delegating below is safe because isLoading is still false here; the
        // set({ isLoading: true }) is deliberately after this branch so removeItem's
        // own guard doesn't reject the call. Don't hoist it.
        if (quantity <= 0) return await get().removeItem(lineId);
        const { items, cartId, clearCart } = get();
        const item = items.find(i => i.lineId === lineId);
        if (!item?.lineId || !cartId) return { success: false };
        // No analytics on this retry: quantity edits inside the drawer aren't
        // tracked on the happy path either, so there is nothing to under-count.
        const retryUpdate = () => { void get().updateQuantity(lineId, quantity); };
        set({ isLoading: true });
        try {
          const result = await updateShopifyCartLine(cartId, item.lineId, quantity);
          if (result.success) {
            set({
              items: reconcileItems(get().items.map(i => i.lineId === lineId ? { ...i, quantity } : i), result.cart),
              cost: result.cart?.cost ?? get().cost,
            });
            emitLifecycleCart(get());
            return { success: true };
          }
          if (result.cartNotFound) {
            // Same recovery as addItem's cartNotFound path: rebuild the cart
            // targeting the quantity the shopper asked for.
            clearCart();
            const recreate = await createShopifyCart({ ...item, quantity, lineId: null });
            if (recreate.success) {
              set({
                cartId: recreate.cartId,
                checkoutUrl: recreate.checkoutUrl,
                items: reconcileItems([{ ...item, quantity, lineId: recreate.lineId }], recreate.cart),
                cost: recreate.cart?.cost ?? null,
                isOpen: true,
              });
              emitLifecycleCart(get());
              return { success: true };
            }
            notifyCartError(recreate.errorKind, recreate.errorMessage, 'update', retryUpdate);
            return { success: false };
          }
          notifyCartError(result.errorKind, result.errorMessage, 'update', retryUpdate);
          return { success: false };
        } catch (error) {
          console.error('Failed to update quantity:', error);
          notifyCartError('network', error instanceof Error ? error.message : String(error), 'update', retryUpdate);
          return { success: false };
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (lineId) => {
        // Same in-flight guard as addItem. Reached both from the drawer's remove
        // button and from updateQuantity when quantity hits zero; that delegation
        // happens before updateQuantity sets isLoading, so it still passes.
        if (get().isLoading || get().isSyncing) return { success: false };
        const { items, cartId, clearCart } = get();
        const item = items.find(i => i.lineId === lineId);
        if (!item?.lineId || !cartId) return { success: false };
        const retryRemove = () => { void get().removeItem(lineId); };
        set({ isLoading: true });
        try {
          const result = await removeLineFromShopifyCart(cartId, item.lineId);
          if (result.success) {
            const newItems = get().items.filter(i => i.lineId !== lineId);
            const reconciledItems = reconcileItems(newItems, result.cart);
            if (reconciledItems.length === 0) {
              clearCart();
              trackLifecycleCartDeleted(cartId);
            } else {
              set({ items: reconciledItems, cost: result.cart?.cost ?? get().cost });
              emitLifecycleCart(get());
            }
            return { success: true };
          }
          if (result.cartNotFound) {
            // Cart's already gone server-side, which is the end state a remove
            // wants anyway — clearing local state achieves the shopper's intent
            // without needing to recreate a cart just to immediately empty it.
            clearCart();
            return { success: true };
          }
          notifyCartError(result.errorKind, result.errorMessage, 'remove', retryRemove);
          return { success: false };
        } catch (error) {
          console.error('Failed to remove item:', error);
          notifyCartError('network', error instanceof Error ? error.message : String(error), 'remove', retryRemove);
          return { success: false };
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: () => set({ items: [], cartId: null, checkoutUrl: null, cost: null, isOpen: false }),
      getCheckoutUrl: () => {
        const checkoutUrl = get().checkoutUrl;
        return checkoutUrl ? formatCheckoutUrl(checkoutUrl) : null;
      },

      /*
       * Runs every time the drawer opens. Besides dropping a cart Shopify no
       * longer has, this is what repairs a cart restored from localStorage: the
       * prices persisted alongside it could be weeks old, and a price changed in
       * admin since then would otherwise sit in the drawer until checkout
       * contradicted it. Re-reading the cart makes the drawer agree with the
       * checkout page it hands off to.
       */
      syncCart: async () => {
        const { cartId, isLoading, isSyncing, clearCart } = get();
        if (!cartId || isLoading) return;
        if (isSyncing) {
          if (activeCartPreparationPromise) await activeCartPreparationPromise;
          return;
        }
        set({ isSyncing: true });
        const syncPromise = (async () => {
          try {
            const data = await storefrontApiRequest(CART_QUERY, { id: cartId });
            if (!data) return;
            const cart: ShopifyCart = data?.data?.cart;
            if (!cart || cart.totalQuantity === 0) { clearCart(); return; }
            set({
              items: reconcileItems(get().items, cart),
              cost: cart.cost ?? get().cost,
              checkoutUrl: cart.checkoutUrl ? formatCheckoutUrl(cart.checkoutUrl) : get().checkoutUrl,
            });
          } catch (error) { console.error('Failed to sync cart:', error); }
          finally { set({ isSyncing: false }); }
        })();
        activeCartPreparationPromise = syncPromise;
        try {
          await syncPromise;
        } finally {
          if (activeCartPreparationPromise === syncPromise) activeCartPreparationPromise = null;
        }
      },
    }),
    {
      name: 'shopify-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, cartId: state.cartId, checkoutUrl: state.checkoutUrl, cost: state.cost }),
    }
  )
);
