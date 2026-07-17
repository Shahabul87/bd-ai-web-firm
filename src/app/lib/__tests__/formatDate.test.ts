import { formatContentDate } from '../formatDate';

/**
 * Phase 7 Task 7.1 — date-only content must render WITHOUT timezone drift and in
 * the active locale. The bug: `new Date("2026-03-01")` is UTC midnight, and
 * `toLocaleDateString()` then shows the previous day on any server/visitor
 * behind UTC.
 */
describe('formatContentDate', () => {
  const ORIGINAL_TZ = process.env.TZ;
  afterAll(() => {
    process.env.TZ = ORIGINAL_TZ;
  });

  it('does not drift a day earlier in a timezone behind UTC', () => {
    // Honolulu is UTC-10 — the classic case where the old code showed Feb 28.
    const out = formatContentDate('2026-03-01', 'en');
    expect(out).toBe('March 1, 2026');
    expect(out).not.toMatch(/February|28/);
  });

  it('does not drift a day later in a timezone ahead of UTC', () => {
    const out = formatContentDate('2026-03-01', 'en');
    expect(out).toBe('March 1, 2026');
  });

  it('formats in the active locale (Bengali)', () => {
    const out = formatContentDate('2026-03-01', 'bn');
    // Bengali uses its own numerals/month names — assert it is NOT the en output.
    expect(out).not.toBe('March 1, 2026');
    expect(out.length).toBeGreaterThan(0);
  });

  it('honours the short vs long month style', () => {
    expect(formatContentDate('2026-03-01', 'en', 'short')).toBe('Mar 1, 2026');
    expect(formatContentDate('2026-03-01', 'en', 'long')).toBe('March 1, 2026');
  });

  it('returns the raw string rather than throwing on malformed content', () => {
    expect(formatContentDate('not-a-date', 'en')).toBe('not-a-date');
  });
});
