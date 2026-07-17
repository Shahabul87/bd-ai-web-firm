/**
 * Shared site constants used by the API routes and lead pipeline.
 * All transactional email now flows through notify-svc (see lib/notify.ts);
 * there is no direct SMTP path anymore.
 */

// Re-exported from the single canonical source so every link the app emails
// points at the environment that actually sent it. Hardcoding the production
// origin here meant a staging deploy emailed production links.
export { SITE_URL } from './siteUrl';

/** Recipient for new-lead alerts; defaults to the public .org inbox. */
export const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'hello@craftsai.org';
