jest.mock('../db', () => ({ prisma: { client: { findMany: jest.fn() } } }));
jest.mock('../report', () => ({ reportError: jest.fn() }));

import { prisma } from '../db';
import { reportError } from '../report';
import { resolvePortalClient } from '../portalIdentity';

const findMany = (prisma.client as unknown as { findMany: jest.Mock }).findMany;

/**
 * Phase 3 Task 3.1 — portal auth must resolve ONE unambiguous active,
 * portal-enabled identity. Client.email has no unique constraint, and the old
 * findFirst silently picked whichever row sorted first, so the login gate and
 * the session could resolve to DIFFERENT tenants.
 */
describe('resolvePortalClient', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns the single matching identity', async () => {
    findMany.mockResolvedValue([{ id: 'c1', email: 'ada@x.com', name: 'Ada' }]);
    await expect(resolvePortalClient('ada@x.com')).resolves.toEqual({
      id: 'c1',
      email: 'ada@x.com',
      name: 'Ada',
    });
  });

  it('matches on the normalized key, so a case/whitespace variant still resolves', async () => {
    findMany.mockResolvedValue([{ id: 'c1', email: 'Ada@X.com', name: 'Ada' }]);
    const r = await resolvePortalClient('  ADA@x.COM ');
    expect(r?.id).toBe('c1');
    expect(findMany.mock.calls[0][0].where.normalizedEmail).toBe('ada@x.com');
  });

  it('only considers ACTIVE, portal-enabled clients', async () => {
    findMany.mockResolvedValue([]);
    await resolvePortalClient('ada@x.com');
    expect(findMany.mock.calls[0][0].where).toEqual(
      expect.objectContaining({ status: 'ACTIVE', portalEnabled: true }),
    );
  });

  it('returns null for an unknown / archived / disabled email', async () => {
    findMany.mockResolvedValue([]);
    await expect(resolvePortalClient('nobody@x.com')).resolves.toBeNull();
    expect(reportError).not.toHaveBeenCalled();
  });

  it('FAILS CLOSED when two active clients share an email, and reports it', async () => {
    findMany.mockResolvedValue([
      { id: 'c1', email: 'ada@x.com', name: 'Ada' },
      { id: 'c2', email: 'ada@x.com', name: 'Ada Dup' },
    ]);
    await expect(resolvePortalClient('ada@x.com')).resolves.toBeNull();
    expect(reportError).toHaveBeenCalledWith(
      'portal.identity.ambiguous',
      expect.any(Error),
      expect.objectContaining({ meta: expect.objectContaining({ clientIds: ['c1', 'c2'] }) }),
    );
  });

  it('returns null for an empty email without querying', async () => {
    await expect(resolvePortalClient('   ')).resolves.toBeNull();
    expect(findMany).not.toHaveBeenCalled();
  });
});
