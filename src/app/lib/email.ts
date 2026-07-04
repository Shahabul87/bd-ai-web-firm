/**
 * Shared site constants used by the API routes and lead pipeline.
 * All transactional email now flows through notify-svc (see lib/notify.ts);
 * there is no direct SMTP path anymore.
 */

export const SITE_URL = 'https://www.craftsai.org';

/** Recipient for new-lead alerts; defaults to the public .org inbox. */
export const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'hello@craftsai.org';
