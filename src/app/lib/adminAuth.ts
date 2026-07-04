/**
 * Admin allowlist. Only emails listed in the ADMIN_EMAILS env var
 * (comma-separated) may authenticate. There is no open registration.
 */
export function isAdminEmail(email: string): boolean {
  const raw = process.env.ADMIN_EMAILS ?? '';
  const set = raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return set.includes(email.trim().toLowerCase());
}
