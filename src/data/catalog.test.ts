import { describe, it, expect } from 'vitest';
import {
  CURRENCY,
  getProduct,
  isProductId,
  priceOf,
  PRODUCT_IDS,
  products,
  type Product,
} from './catalog';

describe('catalog shape', () => {
  it('exposes exactly the three concept products', () => {
    expect(products).toHaveLength(3);
    expect(PRODUCT_IDS).toEqual(['universal', 'burgundy', 'coupe']);
  });

  it('has unique ids and slugs', () => {
    const ids = products.map((p) => p.id);
    const slugs = products.map((p) => p.slug);
    expect(new Set(ids).size).toBe(products.length);
    expect(new Set(slugs).size).toBe(products.length);
  });
});

describe('draft invariants (truth-in-merchandising)', () => {
  it('every product is explicitly a draft — nothing is ever marked orderable', () => {
    for (const p of products) {
      expect(p.status).toBe('draft');
    }
  });

  it('prices are positive whole-cent integers in the site currency', () => {
    for (const p of products) {
      expect(Number.isInteger(p.priceCents)).toBe(true);
      expect(p.priceCents).toBeGreaterThan(0);
      expect(p.currency).toBe(CURRENCY);
    }
  });

  it('every product ships with meaningful, honest alt text', () => {
    for (const p of products) {
      expect(p.alt.trim().length).toBeGreaterThan(20);
      // Alt text must disclose that imagery is a concept, not authentic product photography.
      expect(p.alt.toLowerCase()).toContain('concept');
    }
  });

  it('never asserts forbidden/unverified claims in copy', () => {
    const forbidden = [
      'lead-free',
      'dishwasher',
      'handmade',
      'sustainable',
      'lifetime warranty',
      'in stock',
      'ships',
    ];
    for (const p of products) {
      const haystack = `${p.name} ${p.form} ${p.intent} ${p.bestFor.join(' ')}`.toLowerCase();
      for (const claim of forbidden) {
        expect(haystack).not.toContain(claim);
      }
    }
  });

  it('has a positive set size and at least one occasion for guidance', () => {
    for (const p of products) {
      expect(p.setSize).toBeGreaterThanOrEqual(1);
      expect(p.bestFor.length).toBeGreaterThan(0);
    }
  });

  it('binds every product to an image key', () => {
    for (const p of products) {
      expect(p.imageKey).toBe(p.id);
    }
  });
});

describe('lookup helpers', () => {
  it('isProductId recognizes real and rejects unknown ids', () => {
    expect(isProductId('universal')).toBe(true);
    expect(isProductId('ghost')).toBe(false);
    expect(isProductId('')).toBe(false);
    // Guards against prototype-pollution style keys.
    expect(isProductId('toString')).toBe(false);
    expect(isProductId('constructor')).toBe(false);
  });

  it('getProduct returns the entry or undefined', () => {
    expect(getProduct('coupe')?.name).toBe('The Coupe');
    expect(getProduct('nope')).toBeUndefined();
  });

  it('priceOf mirrors the catalog and is undefined for unknown ids', () => {
    const coupe = getProduct('coupe') as Product;
    expect(priceOf('coupe')).toBe(coupe.priceCents);
    expect(priceOf('nope')).toBeUndefined();
  });
});
