import { test, expect } from '@playwright/test';
import { sitePath } from './server';

test.describe('cart flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(sitePath('/'));
    // Start from a clean slate regardless of prior runs.
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('add, adjust quantity, subtotal, remove, and cross-reload persistence', async ({
    page,
  }) => {
    const badge = page.locator('[data-cart-count]');
    await expect(badge).toHaveAttribute('data-empty', 'true');

    // Add the Universal — the drawer opens automatically.
    await page.locator('[data-add-to-cart="universal"]').click();
    const drawer = page.locator('#cart-dialog');
    await expect(drawer).toBeVisible();
    await expect(badge).toHaveText('1');
    await expect(badge).toHaveAttribute('data-empty', 'false');
    await expect(page.locator('[data-cart-lines] .cart-line')).toHaveCount(1);
    await expect(page.locator('[data-cart-subtotal]')).toHaveText('$68.00');
    await expect(drawer.locator('[data-cart-status]')).toHaveText(
      'Added The Universal to your cart. Cart now has 1 item.',
    );

    // Increase to 2 via the stepper.
    await page.locator('[data-cart-inc="universal"]').click();
    await expect(page.locator('[data-cart-qty="universal"]')).toHaveValue('2');
    await expect(page.locator('[data-cart-subtotal]')).toHaveText('$136.00');
    await expect(page.locator('.cart-line__price')).toHaveText('$136.00');
    await expect(drawer.locator('[data-cart-status]')).toHaveText(
      'Quantity of The Universal is 2.',
    );

    // Type an exact quantity.
    await page.locator('[data-cart-qty="universal"]').fill('3');
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-cart-subtotal]')).toHaveText('$204.00');

    // Decrease back to 2.
    await page.locator('[data-cart-dec="universal"]').click();
    await expect(page.locator('[data-cart-qty="universal"]')).toHaveValue('2');

    // Add a second product (close the modal drawer first so the page is active).
    await page.locator('[data-cart-close]').click();
    await expect(drawer).toBeHidden();
    await page.locator('[data-add-to-cart="burgundy"]').click();
    await expect(drawer).toBeVisible();
    await expect(badge).toHaveText('3');
    await expect(page.locator('[data-cart-lines] .cart-line')).toHaveCount(2);
    await expect(page.locator('[data-cart-subtotal]')).toHaveText('$208.00');

    // Remove the Burgundy line.
    await page.locator('[data-cart-remove="burgundy"]').click();
    await expect(page.locator('[data-cart-lines] .cart-line')).toHaveCount(1);
    await expect(badge).toHaveText('2');
    await expect(drawer.locator('[data-cart-status]')).toHaveText(
      'Removed The Burgundy from your cart.',
    );

    // Persistence: reload and confirm the cart survived.
    await page.reload();
    await expect(page.locator('[data-cart-count]')).toHaveText('2');
    await page.locator('[data-cart-open]').click();
    await expect(page.locator('#cart-dialog')).toBeVisible();
    await expect(page.locator('[data-cart-subtotal]')).toHaveText('$136.00');
  });

  test('empty cart shows an honest empty state', async ({ page }) => {
    await page.locator('[data-cart-open]').click();
    await expect(page.locator('[data-cart-empty]')).toBeVisible();
    await expect(page.locator('[data-cart-empty]')).toContainText('Nothing selected yet');
    await expect(page.locator('[data-cart-foot]')).toBeHidden();
  });

  test('checkout fails closed to an honest boundary that collects no data', async ({
    page,
  }) => {
    await page.locator('[data-add-to-cart="coupe"]').click();
    await page.locator('[data-boundary-open]').click();

    const boundary = page.locator('#boundary-dialog');
    await expect(boundary).toBeVisible();
    await expect(boundary).toContainText("Ordering isn't enabled yet");
    // Lists the exact requirements to activate ordering.
    await expect(boundary.locator('.checklist li')).toHaveCount(5);
    await expect(boundary).toContainText('payment provider');

    // No data collection: no form and no inputs of any kind.
    await expect(boundary.locator('form')).toHaveCount(0);
    await expect(boundary.locator('input, textarea, select')).toHaveCount(0);

    // Closes back to the cart.
    await page.locator('[data-boundary-close]').first().click();
    await expect(boundary).toBeHidden();
    await expect(page.locator('#cart-dialog')).toBeVisible();
  });
});
