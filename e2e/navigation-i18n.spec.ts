import { test, expect } from '@playwright/test';
import en from '../messages/en.json';
import bn from '../messages/bn.json';

// The locale toggle is localized: on an English page the switch control reads
// the EN catalog ("Switch to Bengali"); on a Bengali page it reads the BN
// catalog ("ইংরেজিতে দেখুন"). Reference the catalogs, never hardcode, so the
// test tracks the real accessible names — the same source of truth the
// component (LocaleToggle) resolves its aria-label from.
const SWITCH_TO_BN = en.LocaleToggle.switchToBengali;
const SWITCH_TO_EN_FROM_BN = bn.LocaleToggle.switchToEnglish;

/**
 * Interactive-chrome smoke tests (Phase 7 Task 7.4): menus, dialogs, locale
 * switching, skip link, and the progressively-enhanced floating widgets.
 *
 * DB-independent — all public marketing routes. Runs across the whole browser
 * matrix (chromium, firefox, webkit, mobile) via `E2E_ALL_BROWSERS=1`. Viewports
 * are set explicitly per group so each test is deterministic under any project:
 * the header switches on WIDTH (a CSS breakpoint), not on a user-agent sniff, so
 * forcing a desktop or mobile viewport exercises the real code path regardless
 * of the project's device.
 */

test.describe('Header services dropdown (desktop width)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('toggles as an aria-expanded disclosure and closes on Escape', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: /services/i });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#header-services-menu')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#header-services-menu')).toBeHidden();
  });
});

test.describe('Mobile menu dialog (narrow width)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('opens as a modal dialog and Escape closes it, restoring focus', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: /open menu/i });
    await toggle.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveAttribute('id', 'mobile-menu');

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    // Focus returns to the toggle so a keyboard user is not stranded.
    await expect(page.getByRole('button', { name: /open menu/i })).toBeFocused();
  });

  test('navigating from the menu closes it', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /open menu/i }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('link', { name: /about/i }).first().click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.getByRole('dialog')).toBeHidden();
  });
});

test.describe('Locale switching', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('switches EN → BN and back, keeping the same route and updating <html lang>', async ({
    page,
  }) => {
    await page.goto('/services');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    await page.getByRole('link', { name: SWITCH_TO_BN }).click();
    await expect(page).toHaveURL(/\/bn\/services$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'bn');

    await page.getByRole('link', { name: SWITCH_TO_EN_FROM_BN }).click();
    await expect(page).toHaveURL(/\/services$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});

test.describe('Skip link (keyboard)', () => {
  test('a skip-to-content link is the first focus stop and targets #main-content', async ({
    page,
    browserName,
  }) => {
    await page.goto('/');
    const skip = page.getByRole('link', { name: /skip to content/i });
    await expect(skip).toHaveAttribute('href', '#main-content');

    if (browserName === 'webkit') {
      // Safari/WebKit does not move Tab focus to links by default (only to form
      // controls, unless the OS "Full Keyboard Access" is enabled), so pressing
      // Tab here would not land on the link — a browser default, not a defect.
      // Assert the contract we actually control: the link is focusable and
      // reveals itself (focus:not-sr-only) when focused.
      await skip.focus();
      await expect(skip).toBeFocused();
    } else {
      // Chrome/Firefox: the skip link must be the very first focus stop so a
      // keyboard user reaches it before anything else.
      await page.keyboard.press('Tab');
      await expect(skip).toBeFocused();
    }
  });
});

test.describe('Deferred floating widgets (progressive enhancement)', () => {
  test('chatbot launcher and WhatsApp button mount after user intent', async ({ page }) => {
    await page.goto('/');
    // ssr:false + idle/intent gate: not in the initial paint.
    const launcher = page.getByRole('button', { name: 'Open CraftsAI Help Assistant' });
    const whatsapp = page.getByRole('link', { name: 'Chat on WhatsApp' });

    // A scroll is real intent — it should mount both (they also mount on their
    // own after idle, so this only makes the wait deterministic). Use
    // window.scrollBy rather than page.mouse.wheel: the latter throws on mobile
    // WebKit ("Mouse wheel is not supported"), while a real programmatic scroll
    // fires the same 'scroll' event the widgets listen for on every engine.
    await page.evaluate(() => window.scrollBy(0, 500));
    await expect(launcher).toBeVisible({ timeout: 5_000 });
    await expect(whatsapp).toBeVisible();
  });
});
