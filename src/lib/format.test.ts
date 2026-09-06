import { describe, it, expect } from 'vitest';
import { formatPrice } from './format';

describe('formatPrice', () => {
  it('formats whole-dollar cents as USD', () => {
    expect(formatPrice(6800)).toBe('$68.00');
  });

  it('formats fractional cents correctly', () => {
    expect(formatPrice(20000)).toBe('$200.00');
    expect(formatPrice(6450)).toBe('$64.50');
  });

  it('formats zero', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('treats non-finite input as zero rather than NaN', () => {
    expect(formatPrice(Number.NaN)).toBe('$0.00');
    expect(formatPrice(Number.POSITIVE_INFINITY)).toBe('$0.00');
  });
});
