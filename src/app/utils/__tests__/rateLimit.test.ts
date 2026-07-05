// Mock the DB + reporter so we can drive the Postgres backend deterministically
// and exercise the in-memory fallback without a real database.
jest.mock('@/app/lib/db', () => ({
  prisma: {
    $queryRaw: jest.fn(),
    rateLimit: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
  },
}));
jest.mock('@/app/lib/report', () => ({ reportError: jest.fn() }));

import { checkRateLimit, getClientIP } from '../rateLimit';
import { prisma } from '@/app/lib/db';

const queryRaw = prisma.$queryRaw as unknown as jest.Mock;

describe('checkRateLimit — Postgres backend', () => {
  beforeEach(() => queryRaw.mockReset());

  it('maps the DB row to a success result under the limit', async () => {
    queryRaw.mockResolvedValueOnce([{ count: 1, expiresAt: new Date(Date.now() + 60_000) }]);
    const r = await checkRateLimit('contact:1.1.1.1', { maxRequests: 5, windowMs: 60_000 });
    expect(r.success).toBe(true);
    expect(r.remaining).toBe(4);
    expect(r.resetIn).toBeGreaterThan(0);
  });

  it('blocks when the DB count exceeds the limit', async () => {
    queryRaw.mockResolvedValueOnce([{ count: 6, expiresAt: new Date(Date.now() + 30_000) }]);
    const r = await checkRateLimit('contact:2.2.2.2', { maxRequests: 5, windowMs: 60_000 });
    expect(r.success).toBe(false);
    expect(r.remaining).toBe(0);
  });
});

describe('checkRateLimit — in-memory fallback (DB unavailable)', () => {
  // Simulate the table not existing / DB down so every call falls back to memory.
  beforeEach(() => {
    queryRaw.mockReset();
    queryRaw.mockRejectedValue(new Error('relation "RateLimit" does not exist'));
  });

  it('allows up to the limit then blocks', async () => {
    const opts = { maxRequests: 3, windowMs: 60_000 };
    const key = 'fallback:allow-then-block';
    const r1 = await checkRateLimit(key, opts);
    const r2 = await checkRateLimit(key, opts);
    const r3 = await checkRateLimit(key, opts);
    const r4 = await checkRateLimit(key, opts);

    expect(r1.success).toBe(true);
    expect(r1.remaining).toBe(2);
    expect(r2.remaining).toBe(1);
    expect(r3.remaining).toBe(0);
    expect(r4.success).toBe(false);
  });

  it('keeps separate buckets per key (multi-route keys are independent)', async () => {
    const opts = { maxRequests: 1, windowMs: 60_000 };
    const a1 = await checkRateLimit('fallback:contact:9.9.9.9', opts);
    const a2 = await checkRateLimit('fallback:contact:9.9.9.9', opts);
    const b1 = await checkRateLimit('fallback:quote:9.9.9.9', opts);

    expect(a1.success).toBe(true);
    expect(a2.success).toBe(false);
    expect(b1.success).toBe(true);
  });

  it('resets after the window elapses', async () => {
    jest.useFakeTimers();
    try {
      const start = 1_000_000;
      jest.setSystemTime(start);
      const opts = { maxRequests: 1, windowMs: 1_000 };
      const key = 'fallback:reset';

      expect((await checkRateLimit(key, opts)).success).toBe(true);
      expect((await checkRateLimit(key, opts)).success).toBe(false);

      jest.setSystemTime(start + 1_500);
      expect((await checkRateLimit(key, opts)).success).toBe(true);
    } finally {
      jest.useRealTimers();
    }
  });
});

// Minimal stand-in for a Request — getClientIP only reads header values.
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
