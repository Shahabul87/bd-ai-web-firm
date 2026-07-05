import 'server-only';
import { z } from 'zod';

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

const prodSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  AUTH_SECRET: z.string().min(MIN_SECRET_LEN, `AUTH_SECRET must be at least ${MIN_SECRET_LEN} characters`),
  PORTAL_AUTH_SECRET: z
    .string()
    .min(MIN_SECRET_LEN, `PORTAL_AUTH_SECRET must be at least ${MIN_SECRET_LEN} characters`),
  AUTH_URL: z.string().url('AUTH_URL must be a valid URL'),
  ADMIN_EMAILS: z.string().min(1, 'ADMIN_EMAILS is required'),
  NOTIFY_URL: z.string().url('NOTIFY_URL must be a valid URL'),
  NOTIFY_API_KEY: z.string().min(1, 'NOTIFY_API_KEY is required'),
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
