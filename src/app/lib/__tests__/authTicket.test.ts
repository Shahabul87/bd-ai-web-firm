jest.mock('../db', () => ({
  prisma: { authTicket: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() } },
}));

import { prisma } from '../db';
import { issueTicket, redeemTicket } from '../authTicket';

const t = prisma.authTicket as unknown as {
  create: jest.Mock;
  findUnique: jest.Mock;
  update: jest.Mock;
};

describe('authTicket', () => {
  beforeEach(() => jest.clearAllMocks());

  it('issues a ticket', async () => {
    t.create.mockResolvedValue({ id: 'tk_1' });
    expect(await issueTicket('a@b.com')).toBe('tk_1');
  });

  it('redeems a fresh ticket once', async () => {
    t.findUnique.mockResolvedValue({
      id: 'tk_1',
      email: 'a@b.com',
      usedAt: null,
      expiresAt: new Date(Date.now() + 60000),
    });
    t.update.mockResolvedValue({});
    expect(await redeemTicket('tk_1')).toBe('a@b.com');
    expect(t.update).toHaveBeenCalled();
  });

  it('rejects a used ticket', async () => {
    t.findUnique.mockResolvedValue({
      id: 'tk_1',
      email: 'a@b.com',
      usedAt: new Date(),
      expiresAt: new Date(Date.now() + 60000),
    });
    expect(await redeemTicket('tk_1')).toBeNull();
  });

  it('rejects an expired ticket', async () => {
    t.findUnique.mockResolvedValue({
      id: 'tk_1',
      email: 'a@b.com',
      usedAt: null,
      expiresAt: new Date(Date.now() - 1000),
    });
    expect(await redeemTicket('tk_1')).toBeNull();
  });
});
