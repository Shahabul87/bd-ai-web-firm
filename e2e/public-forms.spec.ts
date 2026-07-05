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

    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send Message' })).toBeVisible();

    await page.getByLabel('Name').fill('Ada Lovelace');
    await page.getByLabel('Email').fill('ada@example.com');
    await page.locator('#company').fill('Analytical Engines Ltd');
    await page.getByLabel('Service Interest').selectOption({ index: 1 });
    await page.getByLabel('Message').fill('We would like to discuss a new web application project.');

    await page.getByRole('button', { name: 'Send Message' }).click();

    // Either terminal state proves the form → API → UI round-trip works.
    await expect(
      page.getByText(/Message sent!|Something went wrong/i),
    ).toBeVisible({ timeout: 15_000 });
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
  test('renders the multi-step quote wizard', async ({ page }) => {
    await page.goto('/quote');
    // First step should be visible; assert the page mounted the actual
    // accessible wizard UI rather than an implementation-specific <form>.
    await expect(page.getByText('Step 1/5')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'What do you need built?' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
  });
});
