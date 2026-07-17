import { createHash } from 'crypto';

jest.mock('../db', () => ({
  prisma: {
    authTicket: {
      create: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

import { prisma } from '../db';
import { issueTicket, redeemTicket, cleanupExpiredTickets } from '../authTicket';

const t = prisma.authTicket as unknown as {
  create: jest.Mock;
  findUnique: jest.Mock;
  updateMany: jest.Mock;
  deleteMany: jest.Mock;
};

const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');

describe('authTicket', () => {
  beforeEach(() => jest.clearAllMocks());

  it('issues a random token and stores only its hash (never the token)', async () => {
    t.create.mockResolvedValue({ id: 'row_1' });
    const token = await issueTicket('  Admin@X.com ');
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);
    const data = t.create.mock.calls[0][0].data;
    expect(data.tokenHash).toBe(sha256(token));
    expect(data.tokenHash).not.toBe(token); // stored value is the hash, not the token
    expect(data.email).toBe('admin@x.com'); // normalized
    expect(data.scope).toBe('admin');
  });

  it('issues with an explicit portal scope', async () => {
    t.create.mockResolvedValue({ id: 'row_1' });
    await issueTicket('a@b.com', 'portal');
    expect(t.create.mock.calls[0][0].data.scope).toBe('portal');
  });

  it('redeems a fresh ticket once via an atomic conditional update', async () => {
    t.updateMany.mockResolvedValue({ count: 1 });
    t.findUnique.mockResolvedValue({ email: 'a@b.com' });
    const token = 'the-token';
    expect(await redeemTicket(token)).toBe('a@b.com');
    const where = t.updateMany.mock.calls[0][0].where;
    expect(where).toEqual(
      expect.objectContaining({ tokenHash: sha256(token), scope: 'admin', usedAt: null }),
    );
    expect(where.expiresAt).toEqual({ gt: expect.any(Date) });
  });

  it('returns null (and does not read email) when the atomic burn affects 0 rows', async () => {
    // Covers already-used, expired, wrong-scope, and the losing side of a race —
    // all collapse to count === 0.
    t.updateMany.mockResolvedValue({ count: 0 });
    expect(await redeemTicket('the-token')).toBeNull();
    expect(t.findUnique).not.toHaveBeenCalled();
  });

  it('scopes redemption: a portal token cannot be redeemed as admin', async () => {
    t.updateMany.mockResolvedValue({ count: 0 });
    expect(await redeemTicket('portal-token', 'admin')).toBeNull();
    expect(t.updateMany.mock.calls[0][0].where.scope).toBe('admin');
  });

  it('cleans up expired and used tickets', async () => {
    t.deleteMany.mockResolvedValue({ count: 3 });
    expect(await cleanupExpiredTickets()).toBe(3);
    expect(t.deleteMany.mock.calls[0][0].where.OR).toEqual([
      { expiresAt: { lt: expect.any(Date) } },
      { usedAt: { not: null } },
    ]);
  });
});
