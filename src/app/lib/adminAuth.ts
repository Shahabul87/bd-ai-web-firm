import { normalizeEmail } from './normalizeEmail';

/**
 * The normalized, de-duplicated admin allowlist parsed from ADMIN_EMAILS
 * (comma-separated). Shared by {@link isAdminEmail} and env validation so the
 * runtime check and the startup check apply the exact same normalization.
 */
export function adminEmailList(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? '';
  const list = raw.split(',').map(normalizeEmail).filter(Boolean);
  return Array.from(new Set(list));
}

/**
 * Admin allowlist. Only emails listed in the ADMIN_EMAILS env var
 * (comma-separated) may authenticate. There is no open registration.
 * Comparison is on the normalized (trimmed, lowercased) form.
 */
export function isAdminEmail(email: string): boolean {
  return adminEmailList().includes(normalizeEmail(email));
}
