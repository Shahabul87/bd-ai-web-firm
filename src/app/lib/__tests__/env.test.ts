/**
 * Production environment validation (Phase 1 Tasks 1.2 / 1.6).
 * validateEnv() only enforces in production runtime, so each case re-imports the
 * module with NODE_ENV=production and a full set of otherwise-valid secrets.
 */
const BASE = {
  DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
  AUTH_SECRET: 'a'.repeat(32),
  PORTAL_AUTH_SECRET: 'b'.repeat(32),
  AUTH_URL: 'https://app.example.com',
  NOTIFY_URL: 'https://notify.example.com',
  NOTIFY_API_KEY: 'notify-key',
};

const OLD = process.env;

async function loadWith(overrides: Record<string, string>) {
  jest.resetModules();
  process.env = {
    ...OLD,
    NODE_ENV: 'production',
    NEXT_PHASE: '',
    ...BASE,
    ...overrides,
  };
  return import('../env');
}

afterEach(() => {
  process.env = OLD;
  jest.resetModules();
});

describe('validateEnv — ADMIN_EMAILS', () => {
  it('accepts a valid, unique comma-separated list', async () => {
    const { validateEnv } = await loadWith({ ADMIN_EMAILS: 'a@b.com, c@d.com' });
    expect(() => validateEnv()).not.toThrow();
  });

  it('rejects a case-variant duplicate', async () => {
    const { validateEnv } = await loadWith({ ADMIN_EMAILS: 'a@b.com, A@B.com' });
    expect(() => validateEnv()).toThrow(/ADMIN_EMAILS/);
  });

  it('rejects an invalid email entry', async () => {
    const { validateEnv } = await loadWith({ ADMIN_EMAILS: 'a@b.com, not-an-email' });
    expect(() => validateEnv()).toThrow(/ADMIN_EMAILS/);
  });

  it('rejects an empty list', async () => {
    const { validateEnv } = await loadWith({ ADMIN_EMAILS: '   ,  ' });
    expect(() => validateEnv()).toThrow(/ADMIN_EMAILS/);
  });
});
