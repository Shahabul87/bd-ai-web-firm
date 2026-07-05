import { checkRateLimit, getClientIP } from '../rateLimit';

// These tests exercise the in-memory fallback (no UPSTASH_* env in the test
// environment). Each test uses a unique key so the module-level store does not
// leak state between tests.

describe('checkRateLimit (in-memory fallback)', () => {
  it('allows up to the limit then blocks', async () => {
    const opts = { maxRequests: 3, windowMs: 60_000 };
    const key = 'test:allow-then-block';
    const r1 = await checkRateLimit(key, opts);
    const r2 = await checkRateLimit(key, opts);
    const r3 = await checkRateLimit(key, opts);
    const r4 = await checkRateLimit(key, opts);

    expect(r1.success).toBe(true);
    expect(r1.remaining).toBe(2);
    expect(r2.success).toBe(true);
    expect(r2.remaining).toBe(1);
    expect(r3.success).toBe(true);
    expect(r3.remaining).toBe(0);
    expect(r4.success).toBe(false);
    expect(r4.remaining).toBe(0);
  });

  it('keeps separate buckets per key (multi-route keys are independent)', async () => {
    const opts = { maxRequests: 1, windowMs: 60_000 };
    const a1 = await checkRateLimit('contact:9.9.9.9', opts);
    const a2 = await checkRateLimit('contact:9.9.9.9', opts);
    const b1 = await checkRateLimit('quote:9.9.9.9', opts);

    expect(a1.success).toBe(true);
    expect(a2.success).toBe(false); // second hit on the contact bucket is blocked
    expect(b1.success).toBe(true); // different route key → its own bucket
  });

  it('resets after the window elapses', async () => {
    jest.useFakeTimers();
    try {
      const start = 1_000_000;
      jest.setSystemTime(start);
      const opts = { maxRequests: 1, windowMs: 1_000 };
      const key = 'test:reset';

      expect((await checkRateLimit(key, opts)).success).toBe(true);
      expect((await checkRateLimit(key, opts)).success).toBe(false);

      // Advance past the window; the bucket should reset.
      jest.setSystemTime(start + 1_500);
      expect((await checkRateLimit(key, opts)).success).toBe(true);
    } finally {
      jest.useRealTimers();
    }
  });
});

// Minimal stand-in for a Request — getClientIP only reads header values.
// (The global Request is not available in this Jest environment.)
function reqWith(headers: Record<string, string> = {}): Request {
  return {
    headers: { get: (k: string) => headers[k.toLowerCase()] ?? null },
  } as unknown as Request;
}

describe('getClientIP', () => {
  it('uses the first x-forwarded-for entry', () => {
    expect(getClientIP(reqWith({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }))).toBe('203.0.113.7');
  });

  it('falls back to x-real-ip', () => {
    expect(getClientIP(reqWith({ 'x-real-ip': '198.51.100.4' }))).toBe('198.51.100.4');
  });

  it("returns 'unknown' when no IP headers are present", () => {
    expect(getClientIP(reqWith())).toBe('unknown');
  });
});
