import { z } from 'zod';
import { sanitizeInput } from './sanitize';
import { CONTACT_FIELD_CODES, type ContactField, type ContactFieldCode } from './formErrors';

/**
 * ONE shared contract per public form, used by the API route (and whose inferred
 * type the client imports). Client-side checks and API requirements previously
 * evolved independently, which is how the quote funnel ended up requiring a
 * field the client had no control for.
 *
 * Values are normalized (control chars stripped, trimmed, capped) but NOT
 * HTML-escaped — see sanitize.ts for the store-original/escape-at-sink policy.
 */
const text = (max: number) => z.preprocess((v) => sanitizeInput(v, max), z.string());

export const ContactSchema = z.object({
  name: text(100).pipe(z.string().min(2)),
  email: text(100).pipe(z.string().email()),
  message: text(2000).pipe(z.string().min(10)),
  /** Labelled "optional" in the UI, so it is optional here too. Persisted when given. */
  company: text(200).pipe(z.string()).optional().default(''),
  /** Service interest selected on the contact form. Persisted when given. */
  service: text(100).pipe(z.string()).optional().default(''),
});

export type ContactInput = z.infer<typeof ContactSchema>;

export const DemoSchema = z.object({
  name: text(100).pipe(z.string().min(2)),
  email: text(100).pipe(z.string().email()),
  product: text(200).pipe(z.string().min(1)),
  company: text(200).pipe(z.string()).optional().default(''),
  message: text(2000).pipe(z.string()).optional().default(''),
});

export type DemoInput = z.infer<typeof DemoSchema>;

/**
 * Map Zod issues onto the stable per-field codes the clients localize.
 * Only fields that have a code are reported; unknown paths are ignored.
 */
export function contactFieldErrors(
  error: z.ZodError,
): Partial<Record<ContactField, ContactFieldCode>> {
  const errors: Partial<Record<ContactField, ContactFieldCode>> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === 'string' && field in CONTACT_FIELD_CODES) {
      const key = field as ContactField;
      errors[key] = CONTACT_FIELD_CODES[key];
    }
  }
  return errors;
}
