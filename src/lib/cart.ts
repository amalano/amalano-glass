/**
 * Pure, framework-free cart logic.
 *
 * Everything here is deterministic and side-effect free so it can be unit
 * tested in isolation and reused by the client script. Persistence (localStorage)
 * and DOM wiring live in `src/scripts/cart-ui.ts`; this file never touches the
 * browser. Money is tracked in integer minor units (cents) to avoid float drift.
 */

export interface CartLine {
  readonly id: string;
  readonly quantity: number;
}

export type Cart = readonly CartLine[];

/** Versioned storage key — bump the suffix if the shape ever changes. */
export const CART_STORAGE_KEY = 'amalano-glass:cart:v1';

/** Upper bound on a single line's quantity, clamped everywhere. */
export const MAX_QUANTITY = 99;

export function emptyCart(): Cart {
  return [];
}

/** Clamp an arbitrary value to an integer quantity in [0, MAX_QUANTITY]. */
function clampQuantity(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  const floored = Math.floor(n);
  if (floored <= 0) return 0;
  return Math.min(floored, MAX_QUANTITY);
}

/**
 * Coerce untrusted input (e.g. parsed localStorage) into a valid cart:
 * - drops anything that is not a `{ id, quantity }` object
 * - drops ids that fail `isValidId` (removed/renamed products)
 * - clamps quantities to whole numbers in [1, MAX_QUANTITY]
 * - merges duplicate ids by summing, preserving first-seen order
 */
export function normalizeCart(input: unknown, isValidId: (id: string) => boolean): Cart {
  if (!Array.isArray(input)) return [];

  const order: string[] = [];
  const totals = new Map<string, number>();

  for (const raw of input) {
    if (!raw || typeof raw !== 'object') continue;
    const id = (raw as { id?: unknown }).id;
    if (typeof id !== 'string' || id.length === 0) continue;
    if (!isValidId(id)) continue;

    const qty = clampQuantity((raw as { quantity?: unknown }).quantity);
    if (qty <= 0) continue;

    if (!totals.has(id)) order.push(id);
    totals.set(id, Math.min((totals.get(id) ?? 0) + qty, MAX_QUANTITY));
  }

  return order.map((id) => ({ id, quantity: totals.get(id) as number }));
}

/** Add `qty` of `id`, incrementing an existing line (clamped). No-op for qty<=0. */
export function addToCart(cart: Cart, id: string, qty = 1): Cart {
  const add = clampQuantity(qty);
  if (add <= 0) return cart;

  const existing = cart.find((line) => line.id === id);
  if (existing) {
    return cart.map((line) =>
      line.id === id
        ? { id, quantity: Math.min(line.quantity + add, MAX_QUANTITY) }
        : line,
    );
  }
  return [...cart, { id, quantity: add }];
}

/** Set an exact quantity. A quantity of 0 or less removes the line. */
export function setQuantity(cart: Cart, id: string, qty: number): Cart {
  const next = clampQuantity(qty);
  if (next <= 0) return removeFromCart(cart, id);

  let found = false;
  const updated = cart.map((line) => {
    if (line.id !== id) return line;
    found = true;
    return { id, quantity: next };
  });
  return found ? updated : [...cart, { id, quantity: next }];
}

export function removeFromCart(cart: Cart, id: string): Cart {
  return cart.filter((line) => line.id !== id);
}

/** Total number of items (sum of quantities) — drives the header badge. */
export function cartCount(cart: Cart): number {
  return cart.reduce((sum, line) => sum + line.quantity, 0);
}

/**
 * Subtotal in cents. `priceOf` returns a per-unit price (cents) or undefined
 * for unknown ids, which are skipped defensively.
 */
export function cartSubtotalCents(
  cart: Cart,
  priceOf: (id: string) => number | undefined,
): number {
  return cart.reduce((sum, line) => {
    const unit = priceOf(line.id);
    if (typeof unit !== 'number' || !Number.isFinite(unit)) return sum;
    return sum + unit * line.quantity;
  }, 0);
}

export function serializeCart(cart: Cart): string {
  return JSON.stringify(cart.map(({ id, quantity }) => ({ id, quantity })));
}

/** Parse a JSON string from storage into a normalized cart; never throws. */
export function parseCart(json: string | null, isValidId: (id: string) => boolean): Cart {
  if (!json) return [];
  try {
    return normalizeCart(JSON.parse(json), isValidId);
  } catch {
    return [];
  }
}
