/**
 * Fail-closed test-environment preflight (Phase 4 Task 4.3).
 *
 * The single gate that must pass BEFORE anything capable of writing runs. It is
 * shared by scripts/ci-local.sh and the Jest setup so the CLI and the test
 * process enforce the SAME rules — a guard that only lives in the shell is one
 * `npx jest` away from being bypassed.
 *
 * Design: an ALLOWLIST, not a blocklist. The database name and notify URL must
 * positively match an approved local pattern; anything unrecognised is rejected.
 * A blocklist of "known prod hosts" alone would silently pass a host nobody
 * thought to add.
 *
 * NEVER prints a value — only variable NAMES and a derived/masked status, so a
 * CI log can be shared without leaking a secret.
 */

/** Database names we accept for destructive test runs. */
const APPROVED_DB_NAME = /^craftsai_(ci|test)[a-z0-9_]*$/i;
/** Hosts a test database may live on. */
const APPROVED_DB_HOST = /^(localhost|127\.0\.0\.1|\[::1\]|host\.docker\.internal|ci-db|craftsai-ci-db)$/i;
/** notify must point at the local capture double. */
const APPROVED_NOTIFY_HOST = /^(localhost|127\.0\.0\.1|\[::1\]|ci-notify|craftsai-ci-notify)$/i;

/**
 * Belt-and-braces: even though the allowlist above already excludes these, name
 * them explicitly so a mistake produces an OBVIOUS message rather than a generic
 * "not approved", and so the intent is documented for the next reader.
 */
const FORBIDDEN_HOST_HINT = /(railway|rlwy\.net|neon\.tech|supabase|amazonaws|azure|gcp|render\.com|heroku|craftsai\.org|prod|production|staging)/i;

/** Recipient domains that belong to real people. */
const REAL_RECIPIENT_DOMAIN = /(craftsai\.org|gmail\.com|googlemail\.com|outlook\.com|hotmail\.com|yahoo\.com|icloud\.com|proton\.me)/i;

export class EnvGuardError extends Error {
  constructor(failures) {
    super(`Refusing to run: the environment is not safe for test writes.\n${failures.map((f) => `  ✗ ${f}`).join('\n')}`);
    this.name = 'EnvGuardError';
    this.failures = failures;
  }
}

function parseUrl(raw) {
  try {
    // postgresql:// is not special-cased by WHATWG URL, but host/pathname parse fine.
    return new URL(raw);
  } catch {
    return null;
  }
}

/**
 * @param {Record<string,string|undefined>} env
 * @param {{ requireWriteGrant?: boolean }} [opts]
 *   requireWriteGrant=false checks only whether the ENVIRONMENT is safe, without
 *   requiring the write grant itself. ci-local.sh uses that mode to decide
 *   whether it may grant ALLOW_TEST_WRITES — otherwise the grant would be a
 *   precondition of earning the grant.
 * @returns {{ ok: boolean, failures: string[], checks: {name: string, status: string}[] }}
 */
export function inspectTestEnv(env, opts = {}) {
  const requireWriteGrant = opts.requireWriteGrant ?? true;
  const failures = [];
  const checks = [];
  const record = (name, status) => checks.push({ name, status });

  // 1. Explicit test mode.
  if (env.NODE_ENV !== 'test') {
    failures.push(`NODE_ENV must be "test" (got "${env.NODE_ENV ?? 'unset'}")`);
    record('NODE_ENV', 'REJECTED');
  } else {
    record('NODE_ENV', 'test');
  }

  // 2. Database must be an approved LOCAL test database.
  const rawDb = env.DATABASE_URL ?? '';
  if (!rawDb) {
    failures.push('DATABASE_URL is not set');
    record('DATABASE_URL', 'MISSING');
  } else {
    const u = parseUrl(rawDb);
    if (!u) {
      failures.push('DATABASE_URL is not a parseable URL');
      record('DATABASE_URL', 'UNPARSEABLE');
    } else {
      const host = u.hostname;
      const name = u.pathname.replace(/^\//, '');
      if (FORBIDDEN_HOST_HINT.test(`${host}${name}`)) {
        failures.push(`DATABASE_URL host/name looks like a real environment — refusing (host masked)`);
      }
      if (!APPROVED_DB_HOST.test(host)) {
        failures.push(`DATABASE_URL host is not an approved local test host`);
      }
      if (!APPROVED_DB_NAME.test(name)) {
        failures.push(`DATABASE_URL database name "${name}" is not an approved test database (craftsai_ci*/craftsai_test*)`);
      }
      // Name is safe to show (it is the thing being asserted); host/creds are not.
      record('DATABASE_URL', `host=<masked> db=${name}`);
    }
  }

  // 3. notify must be the local capture double — never the real service.
  const rawNotify = env.NOTIFY_URL ?? '';
  if (!rawNotify) {
    failures.push('NOTIFY_URL is not set (tests must point at the local notify double)');
    record('NOTIFY_URL', 'MISSING');
  } else {
    const u = parseUrl(rawNotify);
    if (!u || !APPROVED_NOTIFY_HOST.test(u.hostname)) {
      failures.push('NOTIFY_URL does not point at the local notify double');
      record('NOTIFY_URL', 'REJECTED');
    } else {
      record('NOTIFY_URL', `host=${u.hostname} (capture double)`);
    }
  }

  // 4. No real humans as recipients.
  const recipients = [env.CONTACT_EMAIL, env.ADMIN_EMAILS].filter(Boolean).join(',');
  if (recipients && REAL_RECIPIENT_DOMAIN.test(recipients) && env.ALLOW_REAL_RECIPIENTS !== '1') {
    failures.push(
      'CONTACT_EMAIL/ADMIN_EMAILS contain a real recipient domain; use *.test addresses ' +
        '(set ALLOW_REAL_RECIPIENTS=1 only for a deliberate manual test)',
    );
    record('ADMIN_EMAILS', 'REJECTED (real domain)');
  } else if (recipients) {
    record('ADMIN_EMAILS', 'test domains only');
  }

  // 5. The write capability itself is opt-in, granted only by the guarded script
  //    once checks 1-4 have passed.
  if (env.ALLOW_TEST_WRITES === '1') {
    record('ALLOW_TEST_WRITES', 'granted');
  } else if (requireWriteGrant) {
    failures.push('ALLOW_TEST_WRITES=1 is required (it is set by scripts/ci-local.sh AFTER these checks pass)');
    record('ALLOW_TEST_WRITES', 'not granted');
  } else {
    record('ALLOW_TEST_WRITES', 'pending (will be granted if the checks above pass)');
  }

  return { ok: failures.length === 0, failures, checks };
}

/** Throws EnvGuardError unless the environment is safe for test writes. */
export function assertTestEnv(env = process.env) {
  const { ok, failures } = inspectTestEnv(env);
  if (!ok) throw new EnvGuardError(failures);
}

/** Human-readable, secret-free summary for a CI log. */
export function formatChecks(env = process.env) {
  const { checks } = inspectTestEnv(env);
  return checks.map((c) => `  ${c.name.padEnd(20)} ${c.status}`).join('\n');
}
