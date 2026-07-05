import { test, expect } from '@playwright/test';

/**
 * Authenticated-flow smoke tests — STUBS.
 *
 * These flows need infrastructure the public-form specs don't:
 *   • a seeded test Postgres (admin user allowlisted, a client + project + invoice),
 *   • a notify-svc TEST tenant (or the built-in dev auth fallback) so login
 *     OTP / magic-link challenges can be issued and verified deterministically.
 *
 * They are marked `test.fixme` so the suite documents the intended coverage
 * without failing until that environment exists. Fill each in against a test
 * tenant — see e2e/README.md for the fixtures each one needs.
 */

test.describe('Admin login', () => {
  test.fixme('logs in an allowlisted admin via email challenge and lands on the dashboard', async ({ page }) => {
    // 1. goto('/admin/login'); enter an ADMIN_EMAILS address.
    // 2. Complete the challenge (dev auth: fixed code; test tenant: fetch code).
    // 3. Expect redirect to /admin and the leads table to render.
    await page.goto('/admin/login');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test.fixme('rejects a non-allowlisted email', async ({ page }) => {
    // Enter an email NOT in ADMIN_EMAILS and expect the flow to refuse access.
    await page.goto('/admin/login');
  });
});

test.describe('Admin lead triage', () => {
  test.fixme('lists leads and updates a lead status', async () => {
    // With an authenticated admin session (storageState) and a seeded lead:
    // open /admin/leads, change a status, expect the audit + UI to reflect it.
  });
});

test.describe('Client portal', () => {
  test.fixme('logs in an enabled client and scopes projects to that client', async () => {
    // Log in as a seeded client; assert they see ONLY their own project(s) and
    // cannot load another client's project/invoice by id (expect 404/redirect).
  });
});

test.describe('Invoices', () => {
  test.fixme('admin creates + sends an invoice; client can view it', async () => {
    // Admin: create an invoice on a project and mark it sent.
    // Client: open the portal and view that invoice; totals/tax label render.
  });
});
