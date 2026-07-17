/**
 * Redaction for anything that leaves the process as diagnostics — structured
 * logs, Incident.meta, and the observability webhook.
 *
 * Incident metadata is written by many callers and read by whoever can see the
 * logs. A single careless `meta: { token }` would persist authentication
 * material in plaintext, so redaction is enforced centrally at the sink rather
 * than trusted to every call site.
 */

/** Keys whose VALUE is never safe to record. */
const SECRET_KEY = /(token|secret|password|passwd|apikey|api_key|authorization|cookie|credential|otp|code|recovery|ticket)/i;

/** Keys that are personal data — kept but reduced to a non-identifying form. */
const PII_KEY = /(^email$|^to$|^actorEmail$|^recipient$|phone)/i;

const MAX_STRING = 500;
const MAX_DEPTH = 4;

/** ada.lovelace@example.com -> a***@example.com */
export function maskEmail(value: string): string {
  const at = value.indexOf('@');
  if (at <= 0) return '***';
  return `${value[0]}***${value.slice(at)}`;
}

function redactValue(value: unknown, depth: number): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return value.length > MAX_STRING ? `${value.slice(0, MAX_STRING)}…` : value;
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (depth >= MAX_DEPTH) return '[depth-limit]';
  if (Array.isArray(value)) return value.slice(0, 20).map((v) => redactValue(v, depth + 1));
  if (typeof value === 'object') return redactObject(value as Record<string, unknown>, depth + 1);
  return '[unsupported]';
}

function redactObject(input: Record<string, unknown>, depth: number): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (SECRET_KEY.test(key)) {
      out[key] = '[redacted]';
    } else if (PII_KEY.test(key) && typeof value === 'string') {
      out[key] = value.includes('@') ? maskEmail(value) : '[redacted-pii]';
    } else {
      out[key] = redactValue(value, depth);
    }
  }
  return out;
}

/**
 * Strip secret values and reduce personal data in a diagnostics payload.
 * Safe on arbitrary input: bounded depth, bounded string length.
 */
export function redactMeta(meta: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  return redactObject(meta, 0);
}
