import { test, expect } from '@playwright/test';

function activeInDialog(page: import('@playwright/test').Page, id: string) {
  return page.evaluate((dialogId) => {
    const d = document.getElementById(dialogId);
    return !!d && d.contains(document.activeElement) && document.activeElement !== document.body;
  }, id);
}

test.describe('keyboard dialog behaviour', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('cart opens by keyboard, traps focus, closes on Escape, restores focus', async ({
    page,
  }) => {
    const cartButton = page.locator('[data-cart-open]');

    // Open with the keyboard.
    await cartButton.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#cart-dialog')).toBeVisible();

    // Focus moved into the dialog.
    expect(await activeInDialog(page, 'cart-dialog')).toBe(true);

    // Tabbing repeatedly keeps focus trapped inside the dialog.
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      expect(await activeInDialog(page, 'cart-dialog')).toBe(true);
    }

    // Escape closes and returns focus to the opener.
    await page.keyboard.press('Escape');
    await expect(page.locator('#cart-dialog')).toBeHidden();
    await expect(cartButton).toBeFocused();
  });

  test('boundary dialog stacks over the cart and Escape returns to it', async ({ page }) => {
    await page.locator('[data-add-to-cart="universal"]').click();
    await expect(page.locator('#cart-dialog')).toBeVisible();

    await page.locator('[data-boundary-open]').click();
    await expect(page.locator('#boundary-dialog')).toBeVisible();
    expect(await activeInDialog(page, 'boundary-dialog')).toBe(true);

    // Escape closes only the topmost dialog; the cart remains open.
    await page.keyboard.press('Escape');
    await expect(page.locator('#boundary-dialog')).toBeHidden();
    await expect(page.locator('#cart-dialog')).toBeVisible();
  });

  test('clicking modal padding is not mistaken for the backdrop', async ({ page }) => {
    await page.locator('[data-add-to-cart="universal"]').click();
    await page.locator('[data-boundary-open]').click();

    const boundary = page.locator('#boundary-dialog');
    const box = await boundary.boundingBox();
    expect(box).not.toBeNull();

    await page.mouse.click(box!.x + 4, box!.y + 4);
    await expect(boundary).toBeVisible();

    await page.mouse.click(1, 1);
    await expect(boundary).toBeHidden();
    await expect(page.locator('#cart-dialog')).toBeVisible();
  });

  test('removing a line by typing zero keeps focus inside the cart', async ({ page }) => {
    await page.locator('[data-add-to-cart="universal"]').click();
    const quantity = page.locator('[data-cart-qty="universal"]');
    await quantity.fill('0');
    await quantity.press('Tab');

    await expect(page.locator('#cart-dialog')).toBeVisible();
    await expect(page.locator('[data-cart-empty]')).toBeVisible();
    expect(await activeInDialog(page, 'cart-dialog')).toBe(true);
    await expect(page.locator('#cart-dialog [data-cart-close]').first()).toBeFocused();
  });
});
