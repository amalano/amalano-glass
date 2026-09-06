/** Small, pure formatting helpers shared by components and the cart script. */

/**
 * Format an integer amount of cents as a currency string.
 * Non-finite input is treated as 0 so the UI never renders "NaN".
 */
export function formatPrice(cents: number, currency = 'USD', locale = 'en-US'): string {
  const safe = Number.isFinite(cents) ? cents : 0;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(safe / 100);
}
