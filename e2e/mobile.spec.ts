import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 360, height: 740 } });

async function hasNoHorizontalOverflow(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth <= doc.clientWidth + 1;
  });
}

async function meetsTouchTarget(locator: import('@playwright/test').Locator, min = 44) {
  const box = await locator.boundingBox();
  expect(box, 'element should be laid out').not.toBeNull();
  // Allow a 0.5px sub-pixel rounding tolerance.
  expect(box!.height).toBeGreaterThanOrEqual(min - 0.5);
  expect(box!.width).toBeGreaterThanOrEqual(min - 0.5);
}

test.describe('mobile layout & touch targets', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('no horizontal overflow on key pages', async ({ page }) => {
    expect(await hasNoHorizontalOverflow(page)).toBe(true);

    await page.goto('/about/');
    expect(await hasNoHorizontalOverflow(page)).toBe(true);

    await page.goto('/policies/');
    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });

  test('primary controls meet the 44px touch target minimum', async ({ page }) => {
    await meetsTouchTarget(page.locator('[data-cart-open]'));
    await meetsTouchTarget(page.locator('[data-add-to-cart="universal"]').first());

    // Open the cart and check its interactive controls.
    await page.locator('[data-add-to-cart="universal"]').first().click();
    await expect(page.locator('#cart-dialog')).toBeVisible();
    expect(await hasNoHorizontalOverflow(page)).toBe(true);

    await meetsTouchTarget(page.locator('[data-cart-inc="universal"]'));
    await meetsTouchTarget(page.locator('[data-cart-dec="universal"]'));
    await meetsTouchTarget(page.locator('[data-cart-close]'));
    // The remove control must be tall enough to tap comfortably.
    const removeBox = await page.locator('[data-cart-remove="universal"]').boundingBox();
    expect(removeBox!.height).toBeGreaterThanOrEqual(43.5);
  });
});
