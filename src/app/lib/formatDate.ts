/**
 * Format a date-only content string (e.g. "2026-03-01") for display.
 *
 * Two bugs this fixes, both duplicated across five resource pages:
 *
 * 1. TIMEZONE DRIFT. `new Date("2026-03-01")` parses as UTC midnight, and
 *    `toLocaleDateString()` then renders it in the runtime's local zone — so on
 *    a server (or visitor) behind UTC it shows **28 February**. Formatting with
 *    `timeZone: 'UTC'` pins it to the date that was actually written.
 *
 * 2. LOCALE. The date was hardcoded to `en-US`, so Bengali pages showed English
 *    month names. It now follows the active locale.
 */
export function formatContentDate(
  dateString: string,
  locale: string,
  month: 'short' | 'long' = 'long',
): string {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString; // never throw on bad content
  return new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month,
    day: 'numeric',
  }).format(d);
}
