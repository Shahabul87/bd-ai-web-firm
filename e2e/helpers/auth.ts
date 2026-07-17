import type { Page, APIRequestContext } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

/**
 * Authenticated-flow helpers.
 *
 * These drive the REAL multi-factor login through the UI — no session is forged
 * — using the notify double (scripts/notify-double.mjs) as the notify-svc test
 * tenant. The double captures each challenge and exposes its code, which is what
 * finally makes these flows testable; they were `test.fixme` because that
 * infrastructure did not exist.
 *
 * Fixtures come from scripts/seed-ci.mjs.
 */

export const NOTIFY_DOUBLE = process.env.NOTIFY_URL ?? 'http://localhost:4010';

export const FIXTURES = {
  adminEnrolled: 'enrolled-admin@ci.test',
  adminUnenrolled: 'new-admin@ci.test',
  notAllowlisted: 'stranger@ci.test',
  clientA: 'client-a@ci.test',
  clientB: 'client-b@ci.test',
  clientDisabled: 'portal-disabled@ci.test',
  clientArchived: 'archived@ci.test',
  projectA: 'ci_project_a',
  projectB: 'ci_project_b',
  invoiceSent: 'ci_invoice_sent',
  invoiceDraft: 'ci_invoice_draft',
} as const;

/** The double issues this for every challenge, so tests need no clock/secret. */
export const TEST_CODE = '123456';

/** True when the notify double is reachable (these specs require it). */
export async function notifyDoubleUp(request: APIRequestContext): Promise<boolean> {
  try {
    const r = await request.get(`${NOTIFY_DOUBLE}/__health`);
    return r.ok();
  } catch {
    return false;
  }
}

/** Forget everything the double captured, so one spec cannot see another's mail. */
export async function resetNotify(request: APIRequestContext): Promise<void> {
  await request.post(`${NOTIFY_DOUBLE}/__reset`);
}

let prisma: PrismaClient | null = null;

/**
 * Clear the shared rate-limit buckets between tests.
 *
 * Login is limited to 10 requests / 5 min PER IP, and every test drives a real
 * login from the same loopback address — so the suite would throttle ITSELF and
 * report false failures. The limiter is Postgres-backed, so emptying the table
 * resets it for the app process too. (This only ever runs against the isolated
 * CI database; the preflight guarantees DATABASE_URL cannot be anything else.)
 */
export async function resetRateLimits(): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  prisma ??= new PrismaClient();
  await prisma.rateLimit.deleteMany({}).catch(() => {
    /* table may not exist yet — never fail a test on cleanup */
  });
}

/** The most recent challenge the app asked the double to send to `to`. */
export async function latestChallenge(
  request: APIRequestContext,
  to: string,
): Promise<{ code: string; token: string } | null> {
  const r = await request.get(`${NOTIFY_DOUBLE}/__captured/latest?to=${encodeURIComponent(to)}`);
  if (!r.ok()) return null;
  const j = (await r.json()) as { code: string; token: string };
  return { code: j.code, token: j.token };
}

/** Everything the app tried to send — for asserting a notification happened. */
export async function captured(request: APIRequestContext): Promise<{
  notifications: Array<{ channel: string; to: string; data?: { subject?: string } }>;
  challenges: Array<{ to: string; code: string; token: string }>;
}> {
  const r = await request.get(`${NOTIFY_DOUBLE}/__captured`);
  return r.json();
}

/**
 * Sign in an allowlisted admin through the real UI: email factor (OTP read from
 * the double) followed by the authenticator factor.
 */
export async function loginAdmin(page: Page, email: string = FIXTURES.adminEnrolled): Promise<void> {
  await page.goto('/admin/login');
  await page.getByLabel(/admin email/i).fill(email);
  await page.getByRole('button', { name: /email me a code instead/i }).click();

  // The email factor.
  await page.getByLabel(/code from your email/i).fill(TEST_CODE);
  await page.getByRole('button', { name: /continue/i }).click();

  // The second factor. A seeded enrolled admin goes straight to the
  // authenticator prompt; an unenrolled one is shown setup first.
  const enrollHeading = page.getByText(/add craftsai admin to your authenticator/i);
  if (await enrollHeading.isVisible().catch(() => false)) {
    await page.getByRole('button', { name: /i've added it/i }).click();
  }
  await page.getByLabel(/authenticator code/i).fill(TEST_CODE);
  await page.getByRole('button', { name: /continue/i }).click();

  // Sign-in completes via a server action that redirects. Without waiting for
  // it, a caller's next goto() can race the session cookie and land back on
  // the login page.
  await page.waitForURL(/\/admin(?!\/login)/, { timeout: 20_000 });
}

/** Sign in a portal-enabled client through the real UI (single email factor). */
export async function loginPortal(page: Page, email: string = FIXTURES.clientA): Promise<void> {
  await page.goto('/portal/login');
  await page.getByLabel(/your email/i).fill(email);
  await page.getByRole('button', { name: /email me a code instead/i }).click();
  await page.getByLabel(/code from your email/i).fill(TEST_CODE);
  await page.getByRole('button', { name: /continue/i }).click();
  await page.waitForURL(/\/portal(?!\/login)/, { timeout: 20_000 });
}
