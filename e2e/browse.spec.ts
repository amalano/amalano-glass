import { test, expect } from '@playwright/test';

test.describe('browse & honest framing', () => {
  test('homepage renders hero, the three sets, and comparison guidance', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Amalano Glass/);
    await expect(page.locator('h1')).toContainText('considered set of three');

    // Exactly the three concept products.
    const cards = page.locator('.product-card');
    await expect(cards).toHaveCount(3);
    await expect(page.getByRole('heading', { name: 'The Universal' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'The Burgundy' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'The Coupe' })).toBeVisible();

    // Shape/occasion comparison table.
    await expect(page.locator('#choosing table')).toBeVisible();
    await expect(page.locator('#choosing tbody tr')).toHaveCount(3);
  });

  test('pre-launch truth is visible and nothing links to a fake checkout', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('.prelaunch')).toContainText('Pre-launch');
    await expect(page.locator('#preview')).toContainText("what it would take to open");

    // Every product is labelled a draft concept.
    await expect(page.locator('.product-card__draft').first()).toHaveText('Draft concept');

    // No link anywhere points at a checkout/cart/payment URL.
    const hrefs = await page.locator('a[href]').evaluateAll((els) =>
      els.map((el) => (el as HTMLAnchorElement).getAttribute('href') ?? ''),
    );
    for (const href of hrefs) {
      expect(href).not.toMatch(/checkout|\/cart|payment|buy|stripe|paypal/i);
    }
  });

  test('SEO essentials: canonical, description, OG image, and JSON-LD without offers', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://glasses.amalano.dev/',
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /pre-launch concept/i,
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      /og-cover\.jpg$/,
    );

    const ldBlocks = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    expect(ldBlocks.length).toBeGreaterThan(0);
    const joined = ldBlocks.join(' ');
    // Deliberately no Product/Offer/availability schema — nothing is orderable.
    expect(joined).not.toMatch(/"@type"\s*:\s*"(Product|Offer)"/);
    expect(joined).not.toMatch(/availability/i);
  });

  test('secondary pages exist with honest, draft language', async ({ page }) => {
    await page.goto('/about/');
    await expect(page.locator('h1')).toContainText('kept honest');
    await expect(page.locator('main')).toContainText('AI-generated concept photography');

    await page.goto('/policies/');
    await expect(page.locator('h1')).toContainText('none in effect yet');
    await expect(page.locator('.policy-status')).toContainText('not in effect');
    await expect(page.locator('main')).toContainText('No application or ad cookie is set');
    await expect(page.locator('main')).toContainText('GitHub Pages logs and stores visitor IP addresses');
  });

  test('404 page is served for unknown routes', async ({ page }) => {
    const res = await page.goto('/does-not-exist/');
    expect(res?.status()).toBe(404);
    await expect(page.locator('h1')).toContainText("isn't set");
  });
});
