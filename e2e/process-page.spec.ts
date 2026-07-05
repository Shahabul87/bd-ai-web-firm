import { test, expect } from '@playwright/test';

/**
 * /process "Conveyor" — e2e acceptance for the redesigned page.
 * Spec: docs/superpowers/specs/2026-07-05-process-page-conveyor-design.md
 */
test.describe('process page — conveyor', () => {
  test('renders five stations with station 01 active', async ({ page }) => {
    await page.goto('/process');
    const stations = page.getByRole('button', { name: /^Station \d{2}:/ });
    await expect(stations).toHaveCount(5);
    await expect(
      page.getByRole('button', { name: 'Station 01: Discovery' }),
    ).toHaveAttribute('aria-current', 'step');
    await expect(page.getByRole('heading', { name: 'Discovery', level: 3 })).toBeVisible();
  });

  test('clicking a station swaps the phase card', async ({ page }) => {
    await page.goto('/process');
    await page.getByRole('button', { name: 'Station 04: Testing' }).click();
    await expect(page.getByRole('heading', { name: 'Testing', level: 3 })).toBeVisible();
    await expect(page.getByText('User acceptance testing')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Station 04: Testing' }),
    ).toHaveAttribute('aria-current', 'step');
    await expect(
      page.getByRole('button', { name: 'Station 01: Discovery' }),
    ).not.toHaveAttribute('aria-current', 'step');
  });

  test('auto-advances to the next station while on screen', async ({ page }) => {
    await page.goto('/process');
    const track = page.getByRole('group', { name: 'Project phases' });
    await track.scrollIntoViewIfNeeded();
    // ADVANCE_MS is 5s; allow one full cycle plus slack.
    await expect(
      page.getByRole('button', { name: 'Station 02: Planning' }),
    ).toHaveAttribute('aria-current', 'step', { timeout: 8_000 });
  });

  test('does not auto-advance under prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/process');
    const track = page.getByRole('group', { name: 'Project phases' });
    await track.scrollIntoViewIfNeeded();
    await page.waitForTimeout(6_500);
    await expect(
      page.getByRole('button', { name: 'Station 01: Discovery' }),
    ).toHaveAttribute('aria-current', 'step');
    // Clicking still works — content is never motion-gated.
    await page.getByRole('button', { name: 'Station 03: Development' }).click();
    await expect(page.getByRole('heading', { name: 'Development', level: 3 })).toBeVisible();
  });
});
