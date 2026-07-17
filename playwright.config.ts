import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for CraftsAI end-to-end tests.
 *
 * Runs against the PRODUCTION build (`next start`), never `next dev`. Dev mode
 * differs from what ships in ways that matter to these tests — route caching,
 * error overlays, no minification, different prerendering — so a green dev-mode
 * suite proves nothing about the artifact being released. `npm run ci:local`
 * builds, starts the production server, and points here via E2E_BASE_URL.
 */

// A non-default port so a smoke run never reuses another app already listening
// on 3000 (which would turn real route checks into false 404s against the wrong
// project). 3100 is commonly taken by Docker services, so default to 3101.
const PORT = Number(process.env.E2E_PORT ?? 3101);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

/**
 * Firefox and WebKit are not installed by default (`npx playwright install
 * firefox webkit`). Running the whole matrix on every commit also triples the
 * suite for little day-to-day signal, so the extra engines are opt-in and the
 * release gate turns them on.
 */
const allBrowsers = process.env.E2E_ALL_BROWSERS === '1';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // A real mobile viewport, not just a resized desktop one — the quote wizard
    // and mobile menu behave differently under touch.
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
    ...(allBrowsers
      ? [
          { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
          { name: 'webkit', use: { ...devices['Desktop Safari'] } },
          { name: 'mobile-safari', use: { ...devices['iPhone 14'] } },
        ]
      : []),
  ],
  // ci:local builds and starts the production server itself and sets
  // E2E_BASE_URL. This fallback is for running the suite by hand; it also uses
  // the production build so a local run matches CI.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npm run build && npx next start --port ${PORT}`,
        url: baseURL,
        reuseExistingServer: process.env.E2E_REUSE_SERVER === '1',
        timeout: 180_000,
      },
});
