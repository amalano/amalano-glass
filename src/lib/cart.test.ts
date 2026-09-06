import { describe, it, expect } from 'vitest';
import {
  addToCart,
  cartCount,
  cartSubtotalCents,
  emptyCart,
  MAX_QUANTITY,
  normalizeCart,
  parseCart,
  removeFromCart,
  serializeCart,
  setQuantity,
  type Cart,
} from './cart';

/** Simple id validator + price table for tests, independent of the real catalog. */
const VALID = new Set(['universal', 'burgundy', 'coupe']);
const isValid = (id: string) => VALID.has(id);
const prices: Record<string, number> = { universal: 6800, burgundy: 7200, coupe: 6400 };
const priceOf = (id: string) => prices[id];

describe('emptyCart', () => {
  it('returns an empty array', () => {
    expect(emptyCart()).toEqual([]);
  });
});

describe('addToCart', () => {
  it('adds a new line with the given quantity', () => {
    expect(addToCart(emptyCart(), 'universal', 2)).toEqual([
      { id: 'universal', quantity: 2 },
    ]);
  });

  it('defaults to a quantity of 1', () => {
    expect(addToCart(emptyCart(), 'coupe')).toEqual([{ id: 'coupe', quantity: 1 }]);
  });

  it('increments an existing line instead of duplicating it', () => {
    const cart = addToCart(addToCart(emptyCart(), 'burgundy', 1), 'burgundy', 3);
    expect(cart).toEqual([{ id: 'burgundy', quantity: 4 }]);
  });

  it('clamps a line to MAX_QUANTITY', () => {
    const cart = addToCart(emptyCart(), 'universal', MAX_QUANTITY + 50);
    expect(cart).toEqual([{ id: 'universal', quantity: MAX_QUANTITY }]);
  });

  it('ignores non-positive and non-finite quantities', () => {
    expect(addToCart(emptyCart(), 'coupe', 0)).toEqual([]);
    expect(addToCart(emptyCart(), 'coupe', -5)).toEqual([]);
    expect(addToCart(emptyCart(), 'coupe', Number.NaN)).toEqual([]);
  });

  it('does not mutate the input cart', () => {
    const original: Cart = [{ id: 'universal', quantity: 1 }];
    const next = addToCart(original, 'universal', 1);
    expect(original).toEqual([{ id: 'universal', quantity: 1 }]);
    expect(next).not.toBe(original);
  });
});

describe('setQuantity', () => {
  it('sets an exact quantity on an existing line', () => {
    const cart = setQuantity([{ id: 'universal', quantity: 1 }], 'universal', 5);
    expect(cart).toEqual([{ id: 'universal', quantity: 5 }]);
  });

  it('adds a line when the id is not present yet', () => {
    expect(setQuantity(emptyCart(), 'coupe', 2)).toEqual([{ id: 'coupe', quantity: 2 }]);
  });

  it('removes the line when set to zero or below', () => {
    const start: Cart = [
      { id: 'universal', quantity: 2 },
      { id: 'coupe', quantity: 1 },
    ];
    expect(setQuantity(start, 'universal', 0)).toEqual([{ id: 'coupe', quantity: 1 }]);
    expect(setQuantity(start, 'universal', -3)).toEqual([{ id: 'coupe', quantity: 1 }]);
  });

  it('clamps to MAX_QUANTITY and floors fractional input', () => {
    expect(setQuantity(emptyCart(), 'coupe', 999)).toEqual([
      { id: 'coupe', quantity: MAX_QUANTITY },
    ]);
    expect(setQuantity(emptyCart(), 'coupe', 2.9)).toEqual([{ id: 'coupe', quantity: 2 }]);
  });
});

describe('removeFromCart', () => {
  it('removes only the matching line', () => {
    const cart: Cart = [
      { id: 'universal', quantity: 2 },
      { id: 'burgundy', quantity: 1 },
    ];
    expect(removeFromCart(cart, 'universal')).toEqual([{ id: 'burgundy', quantity: 1 }]);
  });

  it('is a no-op for an unknown id', () => {
    const cart: Cart = [{ id: 'universal', quantity: 2 }];
    expect(removeFromCart(cart, 'nope')).toEqual(cart);
  });
});

describe('cartCount', () => {
  it('sums quantities across lines', () => {
    expect(
      cartCount([
        { id: 'universal', quantity: 2 },
        { id: 'coupe', quantity: 3 },
      ]),
    ).toBe(5);
  });

  it('is zero for an empty cart', () => {
    expect(cartCount(emptyCart())).toBe(0);
  });
});

describe('cartSubtotalCents', () => {
  it('multiplies unit prices by quantity and sums', () => {
    const cart: Cart = [
      { id: 'universal', quantity: 2 }, // 13600
      { id: 'coupe', quantity: 1 }, // 6400
    ];
    expect(cartSubtotalCents(cart, priceOf)).toBe(20000);
  });

  it('skips ids with no known price rather than producing NaN', () => {
    const cart: Cart = [
      { id: 'universal', quantity: 1 },
      { id: 'ghost', quantity: 4 },
    ];
    expect(cartSubtotalCents(cart, priceOf)).toBe(6800);
  });

  it('is zero for an empty cart', () => {
    expect(cartSubtotalCents(emptyCart(), priceOf)).toBe(0);
  });
});

describe('normalizeCart', () => {
  it('returns an empty cart for non-array input', () => {
    expect(normalizeCart(null, isValid)).toEqual([]);
    expect(normalizeCart(undefined, isValid)).toEqual([]);
    expect(normalizeCart('[]', isValid)).toEqual([]);
    expect(normalizeCart({ id: 'universal', quantity: 1 }, isValid)).toEqual([]);
  });

  it('drops unknown ids and malformed entries', () => {
    const input = [
      { id: 'universal', quantity: 2 },
      { id: 'unknown', quantity: 5 },
      { quantity: 3 },
      { id: 'coupe' },
      null,
      42,
      'burgundy',
    ];
    expect(normalizeCart(input, isValid)).toEqual([{ id: 'universal', quantity: 2 }]);
  });

  it('merges duplicate ids by summing, preserving first-seen order', () => {
    const input = [
      { id: 'coupe', quantity: 1 },
      { id: 'universal', quantity: 2 },
      { id: 'coupe', quantity: 3 },
    ];
    expect(normalizeCart(input, isValid)).toEqual([
      { id: 'coupe', quantity: 4 },
      { id: 'universal', quantity: 2 },
    ]);
  });

  it('clamps, floors, and drops non-positive quantities', () => {
    const input = [
      { id: 'universal', quantity: 2.7 },
      { id: 'burgundy', quantity: -1 },
      { id: 'coupe', quantity: 9999 },
    ];
    expect(normalizeCart(input, isValid)).toEqual([
      { id: 'universal', quantity: 2 },
      { id: 'coupe', quantity: MAX_QUANTITY },
    ]);
  });

  it('caps a merged total at MAX_QUANTITY', () => {
    const input = [
      { id: 'universal', quantity: 90 },
      { id: 'universal', quantity: 90 },
    ];
    expect(normalizeCart(input, isValid)).toEqual([
      { id: 'universal', quantity: MAX_QUANTITY },
    ]);
  });
});

describe('serialize + parse round trip', () => {
  it('round-trips a cart through storage form', () => {
    const cart: Cart = [
      { id: 'universal', quantity: 2 },
      { id: 'coupe', quantity: 1 },
    ];
    expect(parseCart(serializeCart(cart), isValid)).toEqual(cart);
  });

  it('parseCart tolerates null and invalid JSON', () => {
    expect(parseCart(null, isValid)).toEqual([]);
    expect(parseCart('not json', isValid)).toEqual([]);
    expect(parseCart('{"broken":', isValid)).toEqual([]);
  });

  it('parseCart sanitizes tampered storage', () => {
    const tampered = JSON.stringify([
      { id: 'universal', quantity: -4 },
      { id: 'evil', quantity: 1 },
      { id: 'coupe', quantity: 2 },
    ]);
    expect(parseCart(tampered, isValid)).toEqual([{ id: 'coupe', quantity: 2 }]);
  });
});
