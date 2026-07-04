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
      scope: 'admin',
    });
    t.update.mockResolvedValue({});
    expect(await redeemTicket('tk_1')).toBe('a@b.com');
    expect(t.update).toHaveBeenCalled();
  });

  it('issues with an explicit scope', async () => {
    t.create.mockResolvedValue({ id: 'tk_1' });
    await issueTicket('a@b.com', 'portal');
    expect(t.create.mock.calls[0][0].data).toEqual(expect.objectContaining({ email: 'a@b.com', scope: 'portal' }));
  });

  it('issues with default admin scope', async () => {
    t.create.mockResolvedValue({ id: 'tk_1' });
    await issueTicket('a@b.com');
    expect(t.create.mock.calls[0][0].data).toEqual(expect.objectContaining({ scope: 'admin' }));
  });

  it('rejects a ticket redeemed with the wrong scope (does not burn)', async () => {
    t.findUnique.mockResolvedValue({
      id: 'tk_1',
      email: 'a@b.com',
      usedAt: null,
      expiresAt: new Date(Date.now() + 60000),
      scope: 'admin',
    });
    expect(await redeemTicket('tk_1', 'portal')).toBeNull();
    expect(t.update).not.toHaveBeenCalled();
  });

  it('redeems a portal-scoped ticket with portal scope', async () => {
    t.findUnique.mockResolvedValue({
      id: 'tk_1',
      email: 'a@b.com',
      usedAt: null,
      expiresAt: new Date(Date.now() + 60000),
      scope: 'portal',
    });
    t.update.mockResolvedValue({});
    expect(await redeemTicket('tk_1', 'portal')).toBe('a@b.com');
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
