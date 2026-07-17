import 'server-only';
import { z } from 'zod';
import { normalizeEmail } from './normalizeEmail';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Centralised, server-only runtime environment validation.
 *
 * Why: authentication (admin + portal), database writes, lead alerts, and
 * notify-svc all depend on env vars. Previously some secrets silently fell back
 * to empty strings (e.g. HMAC signing with `?? ''`), which is unacceptable
 * production auth material. This module is the single source of truth and fails
 * fast in production if required secrets are missing or too weak.
 *
 * Runtime vs build: `next build` sets NODE_ENV=production too, but the build
 * container legitimately may not have every runtime secret. We therefore only
 * throw during real server startup / requests, never during the build phase.
 */

const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';
const isProd = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

/** Secrets must carry at least 32 bytes of entropy (openssl rand -base64 32). */
const MIN_SECRET_LEN = 32;

/** Obvious placeholder/example values that must never reach production. */
const PLACEHOLDER_RE =
  /(dev-only|change[-_ ]?me|placeholder|example|your[-_ ]?secret|xxxx|secret123|todo|replace[-_ ]?me)/i;

const strongSecret = (name: string) =>
  z
    .string()
    .min(MIN_SECRET_LEN, `${name} must be at least ${MIN_SECRET_LEN} characters`)
    .refine((v) => !PLACEHOLDER_RE.test(v), `${name} looks like a placeholder — set a real secret`);

/** Loopback: no network exists to intercept, so plaintext is acceptable there. */
const LOOPBACK_HOST = /^(localhost|127\.0\.0\.1|\[::1\])$/i;

/**
 * Requires TLS for any REAL host, while still permitting http://localhost.
 *
 * A blanket https-only rule also rejected `next start` on localhost — which is
 * how local CI runs the production build (the plan requires Playwright to run
 * against the production server, never `next dev`). Loopback is not a public
 * URL, so allowing plaintext there costs nothing; http://notify.craftsai.org is
 * still rejected.
 */
const httpsUrl = (name: string) =>
  z
    .string()
    .url(`${name} must be a valid URL`)
    .refine((v) => {
      try {
        const u = new URL(v);
        if (u.protocol === 'https:') return true;
        return u.protocol === 'http:' && LOOPBACK_HOST.test(u.hostname);
      } catch {
        return false;
      }
    }, `${name} must use https:// (plaintext http:// is allowed only for localhost)`);

const prodSchema = z
  .object({
    DATABASE_URL: z
      .string()
      .min(1, 'DATABASE_URL is required')
      .refine((v) => /^postgres(ql)?:\/\//.test(v), 'DATABASE_URL must be a postgres:// connection string'),
    AUTH_SECRET: strongSecret('AUTH_SECRET'),
    PORTAL_AUTH_SECRET: strongSecret('PORTAL_AUTH_SECRET'),
    AUTH_URL: httpsUrl('AUTH_URL'),
    ADMIN_EMAILS: z
      .string()
      .min(1, 'ADMIN_EMAILS is required')
      .refine((raw) => {
        const entries = raw.split(',').map((e) => e.trim()).filter(Boolean);
        if (entries.length === 0) return false;
        const normalized = entries.map(normalizeEmail);
        const allValid = normalized.every((e) => EMAIL_RE.test(e));
        const noDuplicates = new Set(normalized).size === normalized.length;
        return allValid && noDuplicates;
      }, 'ADMIN_EMAILS must be a comma-separated list of unique, valid email addresses'),
    NOTIFY_URL: httpsUrl('NOTIFY_URL'),
    NOTIFY_API_KEY: z
      .string()
      .min(1, 'NOTIFY_API_KEY is required')
      .refine((v) => !PLACEHOLDER_RE.test(v), 'NOTIFY_API_KEY looks like a placeholder — set a real key'),
  })
  .superRefine((env, ctx) => {
    // The admin and portal login systems must not share signing material, or a
    // token minted for one could be replayed against the other.
    if (env.AUTH_SECRET && env.PORTAL_AUTH_SECRET && env.AUTH_SECRET === env.PORTAL_AUTH_SECRET) {
      ctx.addIssue({
        code: 'custom',
        path: ['PORTAL_AUTH_SECRET'],
        message: 'PORTAL_AUTH_SECRET must differ from AUTH_SECRET',
      });
    }
  });

let validated = false;

/**
 * Validate the production environment. Throws an aggregated, human-readable
 * error if anything required is missing or weak. Safe to call multiple times
 * (only the first call does work). No-op outside production runtime.
 */
export function validateEnv(): void {
  if (validated) return;
  validated = true;

  // Never fail the build container, and never gate the dev/test loop on prod
  // secrets (dev uses notify-svc devMode fallbacks and local login flows).
  if (!isProd || isBuildPhase || isTest) return;

  const result = prodSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    // Do NOT print the values themselves — only which keys failed and why.
    throw new Error(
      `Invalid production environment. Fix these before starting the server:\n${issues}`,
    );
  }
}

// Non-empty, stable dev fallback so local HMAC signing is never keyed with ''.
// This value is NEVER used in production (prodSchema guarantees a real secret).
const DEV_FALLBACK_SECRET = 'dev-only-insecure-secret-do-not-use-in-production-000';

let warnedAuth = false;
let warnedPortal = false;

/**
 * Admin cookie signing secret. Guaranteed non-empty. In production it is a
 * validated strong secret; in dev/test it falls back to a fixed dev key (with a
 * one-time warning) so local login flows work without a configured secret.
 */
export function authSecret(): string {
  const v = process.env.AUTH_SECRET;
  if (v && v.length >= MIN_SECRET_LEN) return v;
  if (isProd && !isBuildPhase) {
    throw new Error('AUTH_SECRET is missing or too weak in production');
  }
  if (v && v.length > 0) return v; // dev/test: respect a short custom value
  if (!warnedAuth) {
    warnedAuth = true;
    console.warn('AUTH_SECRET not set — using an insecure dev-only fallback (never for production).');
  }
  return DEV_FALLBACK_SECRET;
}

/** Portal cookie signing secret. Same guarantees as {@link authSecret}. */
export function portalAuthSecret(): string {
  const v = process.env.PORTAL_AUTH_SECRET;
  if (v && v.length >= MIN_SECRET_LEN) return v;
  if (isProd && !isBuildPhase) {
    throw new Error('PORTAL_AUTH_SECRET is missing or too weak in production');
  }
  if (v && v.length > 0) return v;
  if (!warnedPortal) {
    warnedPortal = true;
    console.warn('PORTAL_AUTH_SECRET not set — using an insecure dev-only fallback (never for production).');
  }
  return `${DEV_FALLBACK_SECRET}-portal`;
}
