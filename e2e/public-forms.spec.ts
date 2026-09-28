import { test, expect } from '@playwright/test';

/**
 * Public lead-funnel smoke tests. These are intentionally DB-independent:
 *
 *  - The API-level checks exercise validation / honeypot branches, which the
 *    route handlers evaluate BEFORE touching the database, so they pass without
 *    a configured Postgres.
 *  - The UI round-trip check tolerates either a success message (DB configured)
 *    or the graceful "try again" error (no DB → route returns 503), because the
 *    point of the smoke test is that the form talks to the API and renders the
 *    result. Tighten to expect success once you run against a seeded test DB.
 */

test.describe('Contact form (UI)', () => {
  test('renders and completes a submit round-trip', async ({ page }) => {
    await page.goto('/contact');

    const send = page.getByRole('button', { name: 'Send message' });
    await expect(page.getByLabel('Name', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Email', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Message', { exact: true })).toBeVisible();
    await expect(send).toBeVisible();

    await page.getByLabel('Message', { exact: true }).fill(
      'Our support team answers the same questions all day. Could an agent handle the routine ones?',
    );
    // Service chips are real radios laid invisibly over each chip.
    const agents = page.getByRole('radio', { name: 'AI agents & automation' });
    await agents.check();
    await expect(agents).toBeChecked();
    await page.getByLabel('Name', { exact: true }).fill('Ada Lovelace');
    await page.getByLabel('Email', { exact: true }).fill('ada@example.com');
    await page.locator('#company').fill('Analytical Engines Ltd');

    await send.click();

    // Either terminal state proves the form → API → UI round-trip works: the
    // generated reply (DB configured) or the rose error panel (no DB → 503).
    const success = page.getByText('Your request is with a person now', { exact: false });
    const failure = page.getByRole('alert').filter({ hasText: /Not sent yet/ });
    await expect(success.or(failure).first()).toBeVisible({ timeout: 15_000 });
  });
});

test.describe('Contact API (validation is DB-independent)', () => {
  test('rejects an invalid submission with 400 + field errors', async ({ request }) => {
    const res = await request.post('/api/contact', {
      data: { name: 'A', email: 'not-an-email', message: 'too short' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.errors).toBeTruthy();
  });

  test('silently accepts (200) when the honeypot is filled, without persisting', async ({ request }) => {
    const res = await request.post('/api/contact', {
      data: {
        name: 'Spam Bot',
        email: 'bot@example.com',
        message: 'Buy cheap things now!!!',
        website: 'http://spam.example', // honeypot field
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test('answers the CORS preflight (OPTIONS)', async ({ request }) => {
    const res = await request.fetch('/api/contact', { method: 'OPTIONS' });
    expect(res.status()).toBe(200);
  });
});

test.describe('Quote API (validation is DB-independent)', () => {
  test('rejects an empty quote with 400 + field errors', async ({ request }) => {
    const res = await request.post('/api/quote', {
      data: { projectDetails: {}, companyInfo: {} },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.errors).toBeTruthy();
  });
});

test.describe('Demo API (validation is DB-independent)', () => {
  test('rejects an invalid demo request with 400', async ({ request }) => {
    const res = await request.post('/api/demo', {
      data: { name: 'A', email: 'bad-email' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test('silently accepts (200) when the honeypot is filled', async ({ request }) => {
    const res = await request.post('/api/demo', {
      data: { name: 'Bot', email: 'bot@example.com', product: 'X', website: 'http://spam' },
    });
    expect(res.status()).toBe(200);
  });
});

test.describe('Quote form (UI)', () => {
  test('walks the four-step pipeline and completes a submit round-trip', async ({ page }) => {
    await page.goto('/quote');

    const rail = page.getByRole('navigation', { name: 'Estimate steps' });
    await expect(rail.getByRole('button', { name: /Step 1: Problem/ })).toHaveAttribute('aria-current', 'step');
    await expect(page.getByRole('heading', { name: 'What should AI take on?' })).toBeVisible();
    const next = page.getByRole('button', { name: /Continue/ });

    // Step validation: an empty step does not advance.
    await next.click();
    await expect(page.getByText('Pick at least one service', { exact: false })).toBeVisible();

    // Chips are real checkboxes / radios laid invisibly over each chip.
    await page.getByRole('checkbox', { name: 'AI agents & automation' }).check();
    await page.getByLabel('The workflow, in your words').fill(
      'Our support team answers the same questions all day. Could an agent handle the routine ones?',
    );
    await next.click();

    await expect(page.getByRole('heading', { name: 'What will it work from?' })).toBeVisible();
    await page.getByRole('checkbox', { name: 'Helpdesk & tickets' }).check();
    await page.getByRole('radio', { name: 'In our own cloud' }).check();
    await next.click();

    await expect(page.getByRole('heading', { name: 'How will you judge it?' })).toBeVisible();
    await page.getByRole('radio', { name: 'Exploring an idea' }).check();
    await page.getByRole('radio', { name: 'In the next few months' }).check();
    await page.getByRole('radio', { name: 'Not sure yet' }).check();
    await next.click();

    await expect(page.getByRole('heading', { name: 'Who should we reply to?' })).toBeVisible();
    await page.locator('#qt-name').fill('Ada Lovelace');
    await page.locator('#qt-email').fill('ada@example.com');
    await page.locator('#qt-company').fill('Analytical Engines Ltd');
    await page.getByRole('checkbox', { name: /terms of service/ }).check();

    await page.getByRole('button', { name: 'Send the spec' }).click();

    // Either terminal state proves the wizard → API → UI round-trip works: the
    // streamed reply (DB configured) or the rose error panel (no DB → 503).
    const success = page.getByRole('heading', { name: 'Reply' });
    const failure = page.getByRole('alert').filter({ hasText: /Not sent yet/ });
    await expect(success.or(failure).first()).toBeVisible({ timeout: 15_000 });
  });
});
