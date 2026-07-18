/**
 * Stable machine codes returned by the public contact & quote API routes.
 *
 * The routes used to return English prose that the client rendered verbatim, so
 * a Bengali visitor saw English server messages. The routes now return the codes
 * below; each client maps a code to a translated string via the `FormErrors`
 * message namespace (messages/en.json + messages/bn.json), keyed identically.
 *
 * Contact and quote keep SEPARATE codes wherever their original prose differed
 * (e.g. the invalid-email message, the success line, the 5xx line) so every
 * code's English value can stay byte-identical to the exact prose it replaced.
 * The rate-limit codes carry the retry unit in their name (seconds vs minutes)
 * so the numeric retry value interpolates into the correct string.
 */

/** Contact field-validation codes, keyed by the form field they belong to. */
export const CONTACT_FIELD_CODES = {
  name: 'name_too_short',
  email: 'email_invalid',
  message: 'message_too_short',
} as const;

export type ContactField = keyof typeof CONTACT_FIELD_CODES;
export type ContactFieldCode = (typeof CONTACT_FIELD_CODES)[ContactField];

/**
 * Quote field-validation codes, keyed by the form field they belong to.
 *
 * Only fields the wizard actually collects appear here. `projectType` and
 * `companyName` were removed: the API required them, but the wizard has no
 * projectType control (it duplicates `services`) and labels company "optional",
 * so every submission failed on errors that had no field to render against.
 * `budget` and `terms` were added — the wizard enforced them client-side while
 * the API accepted a direct request without either.
 */
export const QUOTE_FIELD_CODES = {
  services: 'services_required',
  description: 'description_required',
  budget: 'budget_required',
  contactName: 'contact_name_required',
  email: 'email_required',
  terms: 'terms_required',
} as const;

export type QuoteField = keyof typeof QUOTE_FIELD_CODES;
export type QuoteFieldCode = (typeof QUOTE_FIELD_CODES)[QuoteField];

/**
 * Which wizard step owns each quote field. A server-side validation failure
 * returns the visitor to the step containing the offending input (and focuses
 * it) instead of always bouncing to step 1 with no indication of what to fix.
 */
export const QUOTE_FIELD_STEP: Record<QuoteField, number> = {
  services: 1,
  description: 2,
  budget: 3,
  contactName: 4,
  email: 4,
  terms: 5,
};

/** Top-level (non field-specific) result codes. */
export const CONTACT_SUCCESS = 'contact_success';
export const QUOTE_SUCCESS = 'quote_success';
export const RATE_LIMITED_SECONDS = 'rate_limited_seconds'; // interpolates {seconds}
export const RATE_LIMITED_MINUTES = 'rate_limited_minutes'; // interpolates {minutes}
export const CONTACT_SUBMIT_FAILED = 'contact_submit_failed'; // 503, lead not persisted
export const QUOTE_SUBMIT_FAILED = 'quote_submit_failed'; // 503, lead not persisted
export const CONTACT_SERVER_ERROR = 'contact_server_error'; // 500
export const QUOTE_SERVER_ERROR = 'quote_server_error'; // 500

export type ContactTopLevelCode =
  | typeof CONTACT_SUCCESS
  | typeof RATE_LIMITED_SECONDS
  | typeof CONTACT_SUBMIT_FAILED
  | typeof CONTACT_SERVER_ERROR;

export type QuoteTopLevelCode =
  | typeof QUOTE_SUCCESS
  | typeof RATE_LIMITED_MINUTES
  | typeof QUOTE_SUBMIT_FAILED
  | typeof QUOTE_SERVER_ERROR;

/** Every code that must exist as a key in the FormErrors message namespace. */
export type FormErrorCode =
  | ContactFieldCode
  | QuoteFieldCode
  | ContactTopLevelCode
  | QuoteTopLevelCode;

// ── API response shapes (shared by routes and clients) ──────────────────────

export interface ContactErrorResponse {
  success: false;
  /** Present on 400 validation failures; each value is a FormErrors code. */
  errors?: Partial<Record<ContactField, ContactFieldCode>>;
  /** Present on rate-limit / 503 / 500 responses. */
  code?: ContactTopLevelCode;
  /** Seconds until the rate-limit window resets (rate-limited responses only). */
  retrySeconds?: number;
}

export interface ContactSuccessResponse {
  success: true;
  code: typeof CONTACT_SUCCESS;
  /** Stable id for this submission — quotable by the visitor, traceable by the
   *  operator to the persisted lead and its logs. */
  submissionId?: string;
}

export type ContactResponse = ContactSuccessResponse | ContactErrorResponse;

export interface QuoteErrorResponse {
  success: false;
  errors?: Partial<Record<QuoteField, QuoteFieldCode>>;
  code?: QuoteTopLevelCode;
  /** Minutes until the rate-limit window resets (rate-limited responses only). */
  retryMinutes?: number;
}

export interface QuoteSuccessResponse {
  success: true;
  code: typeof QUOTE_SUCCESS;
  /** Stable id for this submission — quotable by the visitor, traceable by the
   *  operator to the persisted lead and its logs. */
  submissionId?: string;
}

export type QuoteResponse = QuoteSuccessResponse | QuoteErrorResponse;
