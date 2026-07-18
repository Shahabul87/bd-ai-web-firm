/**
 * @jest-environment node
 *
 * Phase 4 Task 4.3 — the fail-closed preflight. The plan's acceptance criterion
 * is that "a deliberately unsafe production-like database URL is rejected before
 * any connection/write", so these cases are deliberately adversarial.
 */
const { inspectTestEnv } = require('../../scripts/lib/test-env-guard.mjs');

type Env = Record<string, string | undefined>;

const SAFE: Env = {
  NODE_ENV: 'test',
  ALLOW_TEST_WRITES: '1',
  DATABASE_URL: 'postgresql://ci:ci@localhost:5439/craftsai_ci?schema=public',
  NOTIFY_URL: 'http://localhost:4010',
  ADMIN_EMAILS: 'enrolled-admin@ci.test',
};

const inspect = (over: Env = {}) => inspectTestEnv({ ...SAFE, ...over }) as {
  ok: boolean;
  failures: string[];
  checks: { name: string; status: string }[];
};

describe('the approved isolated CI environment', () => {
  it('passes', () => {
    expect(inspect().ok).toBe(true);
  });
});

describe('production-like database URLs are rejected', () => {
  it.each([
    ['Railway internal', 'postgresql://u:p@postgres.railway.internal:5432/railway'],
    ['Railway public proxy', 'postgresql://u:p@monorail.proxy.rlwy.net:41234/railway'],
    ['Neon', 'postgresql://u:p@ep-cool-lab.neon.tech/neondb'],
    ['Supabase', 'postgresql://u:p@db.abc.supabase.co:5432/postgres'],
    ['AWS RDS', 'postgresql://u:p@x.eu-west-1.rds.amazonaws.com:5432/app'],
    ['Heroku', 'postgresql://u:p@ec2-1-2-3-4.compute-1.amazonaws.com:5432/d123'],
  ])('rejects %s', (_label, DATABASE_URL) => {
    expect(inspect({ DATABASE_URL }).ok).toBe(false);
  });

  it('rejects a PROD database even when it is on localhost', () => {
    // The allowlist is on the NAME too — a tunnel/port-forward to prod would
    // otherwise look local and sail through.
    expect(inspect({ DATABASE_URL: 'postgresql://u:p@localhost:5432/craftsai_prod' }).ok).toBe(false);
  });

  it("rejects the developer's own dev database", () => {
    expect(inspect({ DATABASE_URL: 'postgresql://postgres:postgres@localhost:5438/craftsai_dev' }).ok).toBe(false);
  });

  it('rejects an unparseable or missing URL rather than guessing', () => {
    expect(inspect({ DATABASE_URL: 'not-a-url' }).ok).toBe(false);
    expect(inspect({ DATABASE_URL: undefined }).ok).toBe(false);
  });
});

describe('the other fail-closed dimensions', () => {
  it('requires NODE_ENV=test', () => {
    expect(inspect({ NODE_ENV: 'production' }).ok).toBe(false);
    expect(inspect({ NODE_ENV: 'development' }).ok).toBe(false);
    expect(inspect({ NODE_ENV: undefined }).ok).toBe(false);
  });

  it('requires ALLOW_TEST_WRITES=1, which only the guarded script grants', () => {
    expect(inspect({ ALLOW_TEST_WRITES: undefined }).ok).toBe(false);
    expect(inspect({ ALLOW_TEST_WRITES: '0' }).ok).toBe(false);
  });

  it('requires notify to be the local capture double, never the real service', () => {
    expect(inspect({ NOTIFY_URL: 'https://notify.craftsai.org' }).ok).toBe(false);
    expect(inspect({ NOTIFY_URL: undefined }).ok).toBe(false);
  });

  it('refuses real recipient domains so no test can email a real person', () => {
    expect(inspect({ ADMIN_EMAILS: 'isham251087@gmail.com' }).ok).toBe(false);
    expect(inspect({ ADMIN_EMAILS: 'owner@craftsai.org' }).ok).toBe(false);
    expect(inspect({ CONTACT_EMAIL: 'someone@outlook.com' }).ok).toBe(false);
  });

  it('allows a real recipient ONLY behind an explicit deliberate opt-in', () => {
    expect(inspect({ ADMIN_EMAILS: 'owner@craftsai.org', ALLOW_REAL_RECIPIENTS: '1' }).ok).toBe(true);
  });
});

describe('output safety', () => {
  it('never includes a secret value in the reported checks', () => {
    const { checks } = inspect({
      DATABASE_URL: 'postgresql://ci:SUPERSECRET@localhost:5439/craftsai_ci',
    });
    const rendered = JSON.stringify(checks);
    expect(rendered).not.toContain('SUPERSECRET');
    // …while still being useful for diagnosis.
    expect(rendered).toContain('craftsai_ci');
  });

  it('reports EVERY failure at once, not just the first', () => {
    const { failures } = inspect({ NODE_ENV: 'production', ALLOW_TEST_WRITES: undefined });
    expect(failures.length).toBeGreaterThanOrEqual(2);
  });
});
