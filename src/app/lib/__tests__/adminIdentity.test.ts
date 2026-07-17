jest.mock('../db', () => ({
  prisma: { user: { findMany: jest.fn(), create: jest.fn(), update: jest.fn() } },
}));
jest.mock('../report', () => ({ reportError: jest.fn() }));

import { prisma } from '../db';
import { reportError } from '../report';
import { findAdminUser, findOrCreateAdminUser } from '../adminIdentity';

const user = prisma.user as unknown as {
  findMany: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
};

describe('findAdminUser', () => {
  beforeEach(() => jest.clearAllMocks());

  it('resolves on the normalized key rather than the case-sensitive email', async () => {
    user.findMany.mockResolvedValue([{ id: 'u1', email: 'Bob@X.com', totpEnrolled: true }]);
    const r = await findAdminUser('  BOB@x.COM ');
    expect(r?.id).toBe('u1');
    expect(user.findMany.mock.calls[0][0].where).toEqual({ normalizedEmail: 'bob@x.com' });
  });

  it('returns null when there is no match', async () => {
    user.findMany.mockResolvedValue([]);
    await expect(findAdminUser('nobody@x.com')).resolves.toBeNull();
  });

  it('fails closed and reports when two users share a normalized email', async () => {
    user.findMany.mockResolvedValue([
      { id: 'u1', email: 'bob@x.com', totpEnrolled: true },
      { id: 'u2', email: 'Bob@x.com', totpEnrolled: false },
    ]);
    await expect(findAdminUser('bob@x.com')).resolves.toBeNull();
    expect(reportError).toHaveBeenCalledWith(
      'admin.identity.ambiguous',
      expect.any(Error),
      expect.objectContaining({ meta: expect.objectContaining({ userIds: ['u1', 'u2'] }) }),
    );
  });
});

describe('findOrCreateAdminUser', () => {
  beforeEach(() => jest.clearAllMocks());

  it('finds a PRE-EXISTING mixed-case row instead of duplicating it', async () => {
    // The regression this closes: normalizing only the input meant
    // upsert({where:{email:'bob@x.com'}}) could not see the stored 'Bob@X.com'
    // row, and created a SECOND identity with a fresh MFA state.
    user.findMany.mockResolvedValue([{ id: 'u1', email: 'Bob@X.com', totpEnrolled: true }]);
    const r = await findOrCreateAdminUser('bob@x.com');
    expect(r).toEqual({ id: 'u1', email: 'Bob@X.com', totpEnrolled: true });
    expect(user.create).not.toHaveBeenCalled();
  });

  it('creates a new identity stored canonically', async () => {
    user.findMany.mockResolvedValue([]);
    user.create.mockResolvedValue({ id: 'u2', email: 'new@x.com', totpEnrolled: false });
    await findOrCreateAdminUser('  New@X.com ');
    const data = user.create.mock.calls[0][0].data;
    expect(data.email).toBe('new@x.com');
    expect(data.normalizedEmail).toBe('new@x.com');
    expect(data.role).toBe('ADMIN');
  });

  it('updates totpEnrolled on the existing identity when it changes', async () => {
    user.findMany.mockResolvedValue([{ id: 'u1', email: 'bob@x.com', totpEnrolled: false }]);
    user.update.mockResolvedValue({});
    const r = await findOrCreateAdminUser('bob@x.com', { totpEnrolled: true });
    expect(user.update).toHaveBeenCalledWith({ where: { id: 'u1' }, data: { totpEnrolled: true } });
    expect(r?.totpEnrolled).toBe(true);
    expect(user.create).not.toHaveBeenCalled();
  });

  it('does not write when totpEnrolled already matches', async () => {
    user.findMany.mockResolvedValue([{ id: 'u1', email: 'bob@x.com', totpEnrolled: true }]);
    await findOrCreateAdminUser('bob@x.com', { totpEnrolled: true });
    expect(user.update).not.toHaveBeenCalled();
  });
});
