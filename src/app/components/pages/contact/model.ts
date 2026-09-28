/**
 * Pure data + rules for the /contact composer. No React here, so the rules the
 * form shows (and the trace that "compiles" from them) are easy to read and
 * mirror the API route exactly (src/app/api/contact/route.ts).
 */

/**
 * The `value` posted to /api/contact must stay stable and translator-proof, so
 * it lives in code keyed by a slug; only the visible chip label comes from the
 * messages (Contact.composer.services.<slug>).
 */
export const SERVICE_OPTIONS = [
  { slug: 'agents', value: 'AI agents & automation' },
  { slug: 'assistants', value: 'Assistants on your data' },
  { slug: 'models', value: 'Custom models & fine-tuning' },
  { slug: 'product', value: 'AI inside your product' },
  { slug: 'evals', value: 'Data & evaluation pipelines' },
  { slug: 'sprint', value: 'AI strategy sprint' },
  { slug: 'unsure', value: 'Not sure yet' },
] as const;

export type ServiceSlug = (typeof SERVICE_OPTIONS)[number]['slug'];

/** Trace steps, in order (Contact.trace.steps.<key>). */
export const TRACE_STEPS = ['read', 'reply', 'call', 'view'] as const;
export type TraceStep = (typeof TRACE_STEPS)[number];

/** Same limits the API enforces (name ≥ 2, message ≥ 10) and truncates to. */
export const NAME_MIN = 2;
export const MESSAGE_MIN = 10;
export const NAME_MAX = 100;
export const EMAIL_MAX = 100;
export const MESSAGE_MAX = 2000;

/** The context meter fills toward this many (approximate) tokens. */
export const CONTEXT_TARGET = 100;

export interface ContactFields {
  name: string;
  email: string;
  company: string;
  service: string;
  message: string;
  /** Honeypot. Real visitors never see or fill it. */
  website: string;
}

export const EMPTY_FIELDS: ContactFields = {
  name: '',
  email: '',
  company: '',
  service: '',
  message: '',
  website: '',
};

/** Rough token estimate: about four characters per token. */
export const estimateTokens = (text: string): number => Math.ceil(text.length / 4);

export type HintKey = 'empty' | 'short' | 'tools' | 'good' | 'plenty';

/** Which nudge the meter shows for a message of this length. */
export function hintFor(message: string): HintKey {
  const trimmed = message.trim();
  if (trimmed.length === 0) return 'empty';
  if (trimmed.length < MESSAGE_MIN) return 'short';
  const tokens = estimateTokens(trimmed);
  if (tokens < 36) return 'tools';
  if (tokens < 80) return 'good';
  return 'plenty';
}

// Deliberately simple: the API's validator (validator.isEmail) is the judge;
// this only decides when the trace may light up and when to show a hint.
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const nameOk = (v: string) => v.trim().length >= NAME_MIN;
export const emailOk = (v: string) => EMAIL_SHAPE.test(v.trim());
export const messageOk = (v: string) => v.trim().length >= MESSAGE_MIN;

/**
 * How many trace steps are lit: one per requirement met, in any order, so the
 * trace always fills top-down as the request "compiles".
 */
export function litSteps(fields: ContactFields): number {
  return [messageOk(fields.message), emailOk(fields.email), nameOk(fields.name), fields.service !== ''].filter(
    Boolean,
  ).length;
}
