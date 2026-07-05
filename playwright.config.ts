import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for CraftsAI end-to-end smoke tests.
 *
 * Runs against a local dev server (auto-started below). The public-form specs
 * are DB-independent (they assert validation / honeypot / round-trip behaviour);
 * the authenticated-flow specs are documented stubs that need a seeded test DB
 * and a notify-svc test tenant — see e2e/README.md.
 */

// Use a non-default port so local smoke tests do not accidentally reuse another
// app already listening on 3000 (which would turn real route checks into false
// 404s against the wrong project). 3100 is commonly occupied by Docker-based
// local services, so default to 3101 while still allowing E2E_PORT override.
const PORT = Number(process.env.E2E_PORT ?? 3101);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

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
  ],
  // Start the app for the tests unless we're pointed at an external URL.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npm run dev -- --port ${PORT}`,
        url: baseURL,
        reuseExistingServer: process.env.E2E_REUSE_SERVER === '1',
        timeout: 120_000,
      },
});
