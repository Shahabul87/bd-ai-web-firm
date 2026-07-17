import { sanitizeInput, escapeHtml } from '../sanitize';

/**
 * Phase 2 Task 2.4/2.2 — storage normalization must NOT HTML-escape. Escaping
 * here corrupted every non-HTML sink: the admin UI rendered the literal
 * `R&amp;D`, the auto-reply email read "Hi Ada&#x27;s", and CSV exported
 * entities. Escaping belongs at the HTML sink only.
 */
describe('sanitizeInput — normalize for storage, never HTML-escape', () => {
  it('preserves ampersands, quotes, and apostrophes verbatim', () => {
    expect(sanitizeInput("R&D's \"best\" work")).toBe("R&D's \"best\" work");
    expect(sanitizeInput('Ada & Co')).toBe('Ada & Co');
  });

  it('does not entity-encode angle brackets at storage time', () => {
    // React/CSV/plain-text escape at their own sink; storage keeps the original.
    expect(sanitizeInput('a < b > c')).toBe('a < b > c');
  });

  it('trims surrounding whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });

  it('caps length', () => {
    expect(sanitizeInput('abcdef', 3)).toBe('abc');
  });

  it('keeps newlines and tabs inside a message body', () => {
    expect(sanitizeInput('line1\nline2\tend')).toBe('line1\nline2\tend');
  });

  it('strips control characters', () => {
    expect(sanitizeInput(`bad${String.fromCharCode(0)}value`)).toBe('badvalue');
    expect(sanitizeInput(`bell${String.fromCharCode(7)}`)).toBe('bell');
    expect(sanitizeInput(`del${String.fromCharCode(127)}`)).toBe('del');
  });

  it('returns an empty string for non-strings', () => {
    expect(sanitizeInput(undefined)).toBe('');
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput(42)).toBe('');
  });
});

describe('escapeHtml — for HTML sinks only', () => {
  it('escapes HTML-significant characters', () => {
    expect(escapeHtml('<script>')).toContain('&lt;');
    expect(escapeHtml('a & b')).toContain('&amp;');
  });
});
