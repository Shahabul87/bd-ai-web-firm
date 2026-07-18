import { z } from 'zod';
import { sanitizeInput } from './sanitize';
import {
  CONTACT_FIELD_CODES,
  QUOTE_FIELD_CODES,
  type ContactField,
  type ContactFieldCode,
  type QuoteField,
  type QuoteFieldCode,
} from './formErrors';

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

// ── Quote ───────────────────────────────────────────────────────────────────

/**
 * The quote contract. Requirements match EXACTLY what the wizard collects —
 * previously the API required `projectType` (which has no control) and
 * `companyName` (which the UI labels optional), so every submission 400'd on
 * errors with no field to render against; meanwhile `budget` and `agreedToTerms`
 * were enforced only client-side and a direct API call could skip both.
 */
export const QuoteSchema = z.object({
  projectDetails: z.object({
    services: z.array(text(100).pipe(z.string().min(1))).min(1),
    /** Optional: no control collects it and it duplicates `services`. */
    projectType: text(200).pipe(z.string()).optional().default(''),
    complexity: text(100).pipe(z.string()).optional().default(''),
    description: text(5000).pipe(z.string().min(20)),
    requirements: text(5000).pipe(z.string()).optional().default(''),
    timeline: text(100).pipe(z.string()).optional().default(''),
    budget: text(100).pipe(z.string().min(1)),
  }),
  companyInfo: z.object({
    /** Labelled "optional" in the UI, so it is optional here too. */
    companyName: text(200).pipe(z.string()).optional().default(''),
    industry: text(100).pipe(z.string()).optional().default(''),
    companySize: text(100).pipe(z.string()).optional().default(''),
    contactName: text(100).pipe(z.string().min(2)),
    email: text(100).pipe(z.string().email()),
    phone: text(50).pipe(z.string()).optional().default(''),
    preferredContact: text(50).pipe(z.string()).optional().default(''),
  }),
  specialRequirements: text(2000).pipe(z.string()).optional().default(''),
  /** Must be explicitly true — the API previously accepted a submission without it. */
  agreedToTerms: z.literal(true),
});

export type QuoteInput = z.infer<typeof QuoteSchema>;

/** Leaf path segment -> the quote field whose code/step the client understands. */
const QUOTE_PATH_TO_FIELD: Record<string, QuoteField> = {
  services: 'services',
  description: 'description',
  budget: 'budget',
  contactName: 'contactName',
  email: 'email',
  agreedToTerms: 'terms',
};

export function quoteFieldErrors(
  error: z.ZodError,
): Partial<Record<QuoteField, QuoteFieldCode>> {
  const errors: Partial<Record<QuoteField, QuoteFieldCode>> = {};
  for (const issue of error.issues) {
    // Paths are nested (e.g. ['projectDetails','services']) and may end in an
    // array index, so take the last STRING segment.
    const leaf = [...issue.path].reverse().find((p) => typeof p === 'string');
    if (typeof leaf !== 'string') continue;
    const field = QUOTE_PATH_TO_FIELD[leaf];
    if (field && !errors[field]) errors[field] = QUOTE_FIELD_CODES[field];
  }
  return errors;
}
