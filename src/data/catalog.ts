/**
 * Central, typed catalog data.
 *
 * These entries are DRAFT merchandising hypotheses for a pre-launch concept.
 * They intentionally avoid unverifiable claims (materials, capacities as fact,
 * dishwasher/lead-free/warranty language). Every field framed as "intent" is
 * a design direction, not a promise. See CLAUDE.md / AGENTS.md.
 *
 * This module is framework-free (no Astro imports) so it can be unit-tested and
 * imported by the client cart script. Image bindings live in `product-images.ts`.
 */

export type ProductId = 'universal' | 'burgundy' | 'coupe';

/** Every catalog entry is a draft until real products are supplied. */
export type ProductStatus = 'draft';

export interface Product {
  readonly id: ProductId;
  readonly slug: string;
  /** Display name, e.g. "The Universal". */
  readonly name: string;
  /** Short shape descriptor for scannable comparison, e.g. "Universal bowl". */
  readonly shape: string;
  /** One-line description of the form language (design intent, not a spec). */
  readonly form: string;
  /** Longer editorial copy, framed as intent rather than a claim. */
  readonly intent: string;
  /** Occasions / pours this shape is drawn for — guidance, not a guarantee. */
  readonly bestFor: readonly string[];
  /** DRAFT price hypothesis, in minor currency units (cents). Not a live price. */
  readonly priceCents: number;
  readonly currency: 'USD';
  /** Conceptual unit: the set is imagined as a pair. */
  readonly setSize: number;
  /** Key into `product-images.ts`. */
  readonly imageKey: ProductId;
  /**
   * Honest alt text. Describes the concept photograph without asserting it is
   * an authentic photo of a finished, purchasable product.
   */
  readonly alt: string;
  readonly status: ProductStatus;
}

export const CURRENCY = 'USD' as const;

export const products: readonly Product[] = [
  {
    id: 'universal',
    slug: 'universal',
    name: 'The Universal',
    shape: 'Universal bowl',
    form: 'An upright, tapered bowl meant to read as the one glass you reach for by default.',
    intent:
      'Drawn to be the everyday stem — a bowl narrow enough to feel composed on a small table, ' +
      'open enough to give a weeknight white or a light red some room. The intent is one honest ' +
      'shape that earns its place in a cabinet rather than a shelf of specialists.',
    bestFor: ['Weeknight whites', 'Lighter reds', 'Everyday pours', 'Small tables'],
    priceCents: 6800,
    currency: 'USD',
    setSize: 2,
    imageKey: 'universal',
    alt: 'Concept photograph: a pair of tall, tapered universal wine glasses on a warm ivory surface in soft directional light.',
    status: 'draft',
  },
  {
    id: 'burgundy',
    slug: 'burgundy',
    name: 'The Burgundy',
    shape: 'Wide burgundy bowl',
    form: 'A generous, rounded bowl that pulls inward at the rim to gather aromatics.',
    intent:
      'Imagined for the slow bottle — a wide bowl that gives an aromatic red space to open, then ' +
      'narrows at the rim to keep it close. The direction here is presence without heaviness: a ' +
      'glass that feels like an occasion but still balances in the hand.',
    bestFor: ['Aromatic reds', 'Long dinners', 'Bottles worth slowing down for'],
    priceCents: 7200,
    currency: 'USD',
    setSize: 2,
    imageKey: 'burgundy',
    alt: 'Concept photograph: a pair of wide-bowled burgundy glasses against a deep oxblood background with a faint wine-red reflection.',
    status: 'draft',
  },
  {
    id: 'coupe',
    slug: 'coupe',
    name: 'The Coupe',
    shape: 'Shallow coupe',
    form: 'A low, open coupe on a fine stem — deliberately celebratory, deliberately restrained.',
    intent:
      'A nod to the aperitif hour: shallow, open, and quick to the hand. Drawn for sparkling and ' +
      'stirred drinks where the ritual is half the point. The intent is a coupe that feels vintage ' +
      'in spirit but clean in line — nothing ornamental it has not earned.',
    bestFor: ['Sparkling', 'Aperitifs', 'Stirred cocktails', 'A short toast'],
    priceCents: 6400,
    currency: 'USD',
    setSize: 2,
    imageKey: 'coupe',
    alt: 'Concept photograph: a pair of shallow coupe glasses on a warm travertine surface catching bright pinpoint highlights.',
    status: 'draft',
  },
] as const;

export const PRODUCT_IDS: readonly ProductId[] = products.map((p) => p.id);

const PRODUCT_MAP: Readonly<Record<ProductId, Product>> = Object.freeze(
  Object.fromEntries(products.map((p) => [p.id, p])) as Record<ProductId, Product>,
);

export function isProductId(id: string): id is ProductId {
  return Object.prototype.hasOwnProperty.call(PRODUCT_MAP, id);
}

export function getProduct(id: string): Product | undefined {
  return isProductId(id) ? PRODUCT_MAP[id] : undefined;
}

/** Price lookup used by cart subtotal math; returns undefined for unknown ids. */
export function priceOf(id: string): number | undefined {
  return getProduct(id)?.priceCents;
}
