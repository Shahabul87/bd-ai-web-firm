import { normalizeEmail } from '../normalizeEmail';

describe('normalizeEmail', () => {
  it('lowercases the whole address', () => {
    expect(normalizeEmail('Bob@Example.COM')).toBe('bob@example.com');
    expect(normalizeEmail('ADMIN@CRAFTSAI.ORG')).toBe('admin@craftsai.org');
  });

  it('trims leading and trailing whitespace', () => {
    expect(normalizeEmail('  bob@example.com  ')).toBe('bob@example.com');
    expect(normalizeEmail('\tbob@example.com\n')).toBe('bob@example.com');
  });

  it('collapses local-part and domain case variants to one identity', () => {
    const variants = ['bob@x.com', 'Bob@x.com', 'BOB@X.COM', ' bob@X.com '];
    const normalized = new Set(variants.map(normalizeEmail));
    expect(normalized.size).toBe(1);
    expect([...normalized][0]).toBe('bob@x.com');
  });

  it('is idempotent', () => {
    const once = normalizeEmail('  Bob@Example.com ');
    expect(normalizeEmail(once)).toBe(once);
  });
});
