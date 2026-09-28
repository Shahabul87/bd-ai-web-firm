import { expect, test } from '@playwright/test';

/**
 * /services "The router": a request is routed to the service that fits, and
 * the routed service links to its spec on the same page.
 */
test.describe('Services: router', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('serves all six specs in the HTML', async ({ request }) => {
    const html = await (await request.get('/services')).text();
    for (const id of ['agents', 'assistants', 'models', 'product', 'evals', 'sprint']) {
      expect(html).toContain(`id="${id}"`);
    }
  });

  test('a chosen request is routed to its service and links to the spec', async ({ page }) => {
    await page.goto('/services');
    // The router marks itself live once it has hydrated.
    await expect(page.locator('.sv-router')).toHaveAttribute('data-live', 'true', { timeout: 30_000 });
    const chip = page.getByRole('button', { name: "Can't measure it" });
    await chip.click();
    await expect(chip).toHaveAttribute('aria-pressed', 'true');

    const routed = page.locator('.sv-routed');
    await expect(routed).toHaveClass(/on/, { timeout: 10_000 });
    const link = routed.getByRole('link', { name: /Data & evaluation pipelines/ });
    await expect(link).toHaveAttribute('href', '#evals');

    // Choosing a request stops the cycle: it stays on the chosen request.
    await page.waitForTimeout(5_500);
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
  });

  test('reduced motion shows the finished routing with no cycle', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await page.goto('/services');
    await expect(page.locator('.sv-router')).toHaveAttribute('data-live', 'true', { timeout: 30_000 });
    await expect(page.locator('.sv-routed')).toHaveClass(/on/);
    await expect(page.getByRole('button', { name: 'Support inbox' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Pause' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Where to start' }).click();
    await expect(page.locator('.sv-routed').getByRole('link', { name: /AI strategy sprint/ })).toBeVisible();
    await context.close();
  });
});
