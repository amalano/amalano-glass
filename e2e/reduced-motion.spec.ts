import { test, expect } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test.describe('reduced motion', () => {
  test('honours the preference and stays fully functional', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // The preference is actually in effect.
    const prefers = await page.evaluate(
      () => matchMedia('(prefers-reduced-motion: reduce)').matches,
    );
    expect(prefers).toBe(true);

    await page.locator('[data-add-to-cart="universal"]').click();
    const drawer = page.locator('#cart-dialog');
    await expect(drawer).toBeVisible();

    // Our reduced-motion rule collapses animation to a negligible duration.
    const durationSeconds = await drawer.evaluate((el) => {
      const value = getComputedStyle(el).animationDuration; // e.g. "0.000001s"
      return parseFloat(value);
    });
    expect(durationSeconds).toBeLessThan(0.05);

    // Still closes normally.
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
  });
});
