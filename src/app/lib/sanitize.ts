import validator from 'validator';

/**
 * Escapes HTML-significant characters and trims/caps length.
 * Used on every user-supplied field before it is placed into an
 * email body (HTML or text) or logged to Google Sheets.
 */
export function sanitizeInput(input: unknown, maxLength: number = 1000): string {
  const str = typeof input === 'string' ? input : '';
  return validator.escape(str.trim()).slice(0, maxLength);
}

export function validateEmail(email: string): boolean {
  return validator.isEmail(email);
}
