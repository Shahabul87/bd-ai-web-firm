import validator from 'validator';

const TAB = 0x09;
const LINE_FEED = 0x0a;
const CARRIAGE_RETURN = 0x0d;
const UNIT_SEPARATOR = 0x1f;
const DELETE = 0x7f;

/**
 * Drop C0 control characters and DEL, keeping tab/newline/carriage return —
 * those are legitimate inside a message body. Done by code point rather than a
 * regex so no control-character literals appear in this source file.
 */
function stripControlChars(value: string): string {
  let out = '';
  for (const ch of value) {
    const code = ch.charCodeAt(0);
    const isControl =
      (code <= UNIT_SEPARATOR && code !== TAB && code !== LINE_FEED && code !== CARRIAGE_RETURN) ||
      code === DELETE;
    if (!isControl) out += ch;
  }
  return out;
}

/**
 * Normalize a user-supplied string for STORAGE: strip control characters, trim,
 * and cap length.
 *
 * It deliberately does NOT HTML-escape. Escaping at the storage boundary
 * corrupts every non-HTML sink: the admin UI (React already escapes text nodes,
 * so a pre-escaped value renders as the literal `R&amp;D`), plain-text
 * notification bodies ("Hi Ada&#x27;s"), and CSV export. The policy is
 * store-the-original / escape-at-the-final-sink:
 *   - React text nodes     -> React escapes automatically (nothing to do)
 *   - CSV                  -> quoting + formula neutralization (see leads.ts)
 *   - HTML email templates -> must escape at render (see {@link escapeHtml})
 */
export function sanitizeInput(input: unknown, maxLength: number = 1000): string {
  const str = typeof input === 'string' ? input : '';
  return stripControlChars(str).trim().slice(0, maxLength);
}

/**
 * Escape HTML-significant characters. Use ONLY at an HTML sink (e.g. building an
 * HTML email body), never before storage.
 */
export function escapeHtml(input: string): string {
  return validator.escape(input);
}

export function validateEmail(email: string): boolean {
  return validator.isEmail(email);
}
