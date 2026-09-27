import { expect, test } from '@playwright/test';

/**
 * The "Attention" home page against the production build. What unit tests
 * cannot prove: the headline is in the server HTML (crawlers, no-JS), the
 * generation sequence actually completes in a real browser, and making a
 * word the query draws its attention arcs.
 */

const HEADLINE = 'Stop demoing AI. Start profiting from it.';

test.describe('Home: generated headline and attention', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('serves the complete headline in the HTML, before any script runs', async ({ request }) => {
    const html = await (await request.get('/')).text();
    for (const word of HEADLINE.split(' ')) expect(html).toContain(`>${word}</span>`);
  });

  test('generates the headline, then a focused word becomes the query', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('.attn-hero');
    await expect(hero).toHaveAttribute('data-state', 'done', { timeout: 30_000 });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(HEADLINE);

    // Resting arcs are drawn once the headline is complete.
    await expect(page.locator('.attn-arcs .g-base path').first()).toBeAttached();

    // Keyboard: pin "profiting" as the query.
    const word = page.getByRole('heading', { level: 1 }).getByRole('button', { name: 'profiting' });
    await word.focus();
    await page.keyboard.press('Enter');
    await expect(word).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.attn-arcs .g-q path')).toHaveCount(6);
    await expect(page.locator('.attn-arcs .g-q text').first()).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('.attn-arcs .g-q path')).toHaveCount(0);
  });

  test('reduced motion gets the finished hero immediately', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('.attn-hero')).toHaveAttribute('data-state', 'static');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(HEADLINE);
    await expect(page.getByRole('link', { name: 'Book a discovery call' }).first()).toBeVisible();
    await context.close();
  });

  test('the process step buttons activate their step', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Test' }).click();
    await expect(page.locator('.attn-step').nth(4)).toHaveClass(/is-active/, { timeout: 10_000 });
    await expect(page.locator('.attn-art-stage > .attn-art').nth(4)).toHaveClass(/is-active/);
  });
});
