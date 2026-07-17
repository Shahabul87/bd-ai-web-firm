import { test, expect } from '@playwright/test';
import {
  FIXTURES,
  TEST_CODE,
  loginAdmin,
  loginPortal,
  notifyDoubleUp,
  resetNotify,
  resetRateLimits,
  latestChallenge,
  captured,
} from './helpers/auth';

/**
 * Authenticated-flow tests (Phase 4 Task 4.5).
 *
 * These were `test.fixme` stubs because they needed a seeded test database and a
 * notify-svc test tenant. Both now exist (compose.ci.yml + scripts/seed-ci.mjs +
 * scripts/notify-double.mjs), so they are implemented and RUN.
 *
 * They drive the real multi-factor login through the UI — no session is forged —
 * and the notify double guarantees no mail reaches a real person.
 *
 * Run them via `npm run ci:local`, which brings up the services, seeds the
 * fixtures, and serves the production build.
 */

// Every test drives a real login from the same loopback IP, and the notify
// double's captured state is global — so these must not race each other.
test.describe.configure({ mode: 'serial' });

// Skip (loudly, not silently) when the isolated services are not running, so a
// bare `npx playwright test` does not report phantom failures.
test.beforeEach(async ({ request }) => {
  test.skip(!(await notifyDoubleUp(request)), 'notify double not running — use `npm run ci:local`');
  await resetNotify(request);
  // Otherwise the suite throttles itself: login allows 10 requests / 5 min per
  // IP and every test here spends two of them.
  await resetRateLimits();
});

test.describe('Admin login', () => {
  test('logs in an allowlisted admin via email challenge and lands on the dashboard', async ({
    page,
    request,
  }) => {
    await page.goto('/admin/login');
    await page.getByLabel(/admin email/i).fill(FIXTURES.adminEnrolled);
    await page.getByRole('button', { name: /email me a code instead/i }).click();

    // Wait for the step to advance BEFORE inspecting the double — the click
    // fires an async POST, so querying immediately races the request.
    await expect(page.getByLabel(/code from your email/i)).toBeVisible();

    // The app must have asked notify to send a challenge to exactly this admin.
    const challenge = await latestChallenge(request, FIXTURES.adminEnrolled);
    expect(challenge, 'a challenge should have been issued').not.toBeNull();

    await page.getByLabel(/code from your email/i).fill(challenge!.code);
    await page.getByRole('button', { name: /continue/i }).click();

    // Email alone must NOT be enough — the second factor is demanded.
    await expect(page.getByLabel(/authenticator code/i)).toBeVisible();
    await page.getByLabel(/authenticator code/i).fill(TEST_CODE);
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page).toHaveURL(/\/admin(?!\/login)/, { timeout: 15_000 });
  });

  test('rejects a non-allowlisted email without revealing that it is unknown', async ({
    page,
    request,
  }) => {
    await page.goto('/admin/login');
    await page.getByLabel(/admin email/i).fill(FIXTURES.notAllowlisted);
    await page.getByRole('button', { name: /email me a code instead/i }).click();

    // Enumeration safety: the UI responds the same as for a real admin…
    await expect(page.getByLabel(/code from your email/i)).toBeVisible();

    // …but NO challenge was actually issued to that address.
    expect(await latestChallenge(request, FIXTURES.notAllowlisted)).toBeNull();

    // And a guessed code cannot get in.
    await page.getByLabel(/code from your email/i).fill(TEST_CODE);
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('an already-enrolled admin is never offered enrollment (email factor alone cannot reset MFA)', async ({
    page,
  }) => {
    await page.goto('/admin/login');
    await page.getByLabel(/admin email/i).fill(FIXTURES.adminEnrolled);
    await page.getByRole('button', { name: /email me a code instead/i }).click();
    await page.getByLabel(/code from your email/i).fill(TEST_CODE);
    await page.getByRole('button', { name: /continue/i }).click();

    // The seeded admin is enrolled: passing only the email factor must lead to
    // the authenticator prompt, never to a fresh enrollment QR.
    await expect(page.getByLabel(/authenticator code/i)).toBeVisible();
    await expect(page.getByText(/add craftsai admin to your authenticator/i)).toBeHidden();
  });
});

test.describe('Admin lead triage', () => {
  test('lists the seeded lead on the dashboard and opens its detail', async ({ page }) => {
    // loginAdmin lands on /admin, which IS the leads list (there is no
    // /admin/leads index route — only /admin/leads/[id]).
    await loginAdmin(page);
    await expect(page.getByText('CI Lead').first()).toBeVisible({ timeout: 15_000 });

    await page.goto('/admin/leads/ci_lead_1');
    await expect(page.getByRole('heading', { name: 'CI Lead' })).toBeVisible();
    // The company the contact route now persists (it used to be discarded).
    await expect(page.getByText('lead@ci.test').first()).toBeVisible();
  });
});

test.describe('Client portal', () => {
  test('logs in an enabled client and scopes projects to that client', async ({ page }) => {
    await loginPortal(page, FIXTURES.clientA);
    await expect(page).toHaveURL(/\/portal(?!\/login)/, { timeout: 15_000 });

    // Sees their OWN project…
    await expect(page.getByText('CI Project A').first()).toBeVisible();
    // …and never the other tenant's.
    await expect(page.getByText('CI Project B')).toHaveCount(0);
  });

  test("cannot open another client's project by changing the URL", async ({ page }) => {
    await loginPortal(page, FIXTURES.clientA);
    // Client A asks for Client B's project id directly. getClientProject scopes
    // by the caller's clientId, so this must not resolve.
    const res = await page.goto(`/portal/projects/${FIXTURES.projectB}`);
    expect(res?.status()).toBe(404);
    await expect(page.getByText('CI Project B')).toHaveCount(0);
  });

  test('a portal-disabled client cannot sign in', async ({ page, request }) => {
    await page.goto('/portal/login');
    await page.getByLabel(/your email/i).fill(FIXTURES.clientDisabled);
    await page.getByRole('button', { name: /email me a code instead/i }).click();
    // Wait for the request to land before inspecting the double.
    await expect(page.getByLabel(/code from your email/i)).toBeVisible();
    // The invite gate sends nothing at all for a disabled client…
    expect(await latestChallenge(request, FIXTURES.clientDisabled)).toBeNull();
    // …while the UI stays enumeration-safe.
    await page.getByLabel(/code from your email/i).fill(TEST_CODE);
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page).toHaveURL(/\/portal\/login/);
  });
});

test.describe('Invoices', () => {
  test('a client sees their SENT invoice but never a DRAFT one', async ({ page }) => {
    await loginPortal(page, FIXTURES.clientA);
    await page.goto('/portal/invoices');

    // INV-9001 is SENT → visible.
    await expect(page.getByText(/9001/).first()).toBeVisible({ timeout: 15_000 });
    // INV-9002 is a DRAFT → must never reach the client.
    await expect(page.getByText(/9002/)).toHaveCount(0);
  });

  test('a DRAFT invoice is not reachable by direct URL either', async ({ page }) => {
    await loginPortal(page, FIXTURES.clientA);
    const res = await page.goto(`/portal/invoices/${FIXTURES.invoiceDraft}`);
    expect(res?.status()).toBe(404);
  });

  test("cannot open another client's invoice by changing the URL", async ({ page }) => {
    await loginPortal(page, FIXTURES.clientB);
    // Client B asks for Client A's sent invoice.
    const res = await page.goto(`/portal/invoices/${FIXTURES.invoiceSent}`);
    expect(res?.status()).toBe(404);
  });
});

test.describe('notify isolation', () => {
  test('no test traffic ever leaves for a real recipient', async ({ page, request }) => {
    await page.goto('/portal/login');
    await page.getByLabel(/your email/i).fill(FIXTURES.clientA);
    await page.getByRole('button', { name: /email me a code instead/i }).click();
    await expect(page.getByLabel(/code from your email/i)).toBeVisible();

    const { challenges, notifications } = await captured(request);
    const recipients = [...challenges.map((c) => c.to), ...notifications.map((n) => n.to)];
    expect(recipients.length).toBeGreaterThan(0);
    for (const to of recipients) {
      // Everything the suite sends must be a .test address held by the double.
      expect(to).toMatch(/\.test$|^client:|^admin$|^user:/);
    }
  });
});
