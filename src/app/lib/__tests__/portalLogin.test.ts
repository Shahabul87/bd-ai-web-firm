jest.mock('../db', () => ({ prisma: { client: { findMany: jest.fn() } } }));
jest.mock('../notify', () => ({ authChallenge: jest.fn() }));
jest.mock('../email', () => ({ SITE_URL: 'https://www.craftsai.org' }));
jest.mock('../report', () => ({ reportError: jest.fn() }));

import { prisma } from '../db';
import { authChallenge } from '../notify';
import { reportError } from '../report';
import { startPortalLogin } from '../portalLogin';

const findMany = (prisma.client as unknown as { findMany: jest.Mock }).findMany;
const challenge = authChallenge as unknown as jest.Mock;

describe('startPortalLogin (invite gate)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sends NOTHING for a client that is not portalEnabled', async () => {
    findMany.mockResolvedValue([]); // where enforces portalEnabled:true
    const r = await startPortalLogin('a@b.com', 'otp');
    expect(r).toBeNull();
    expect(challenge).not.toHaveBeenCalled();
  });

  it('queries the invite gate on the normalized identity key', async () => {
    findMany.mockResolvedValue([]);
    await startPortalLogin('  A@B.com ', 'otp');
    expect(findMany.mock.calls[0][0].where).toEqual(
      expect.objectContaining({ normalizedEmail: 'a@b.com', status: 'ACTIVE', portalEnabled: true }),
    );
  });

  it('sends a challenge for an enabled client', async () => {
    findMany.mockResolvedValue([{ id: 'c1', name: 'Ada', email: 'a@b.com' }]);
    challenge.mockResolvedValue({ challengeId: 'ch1' });
    const r = await startPortalLogin('a@b.com', 'magic_link');
    expect(challenge).toHaveBeenCalledTimes(1);
    expect(r).toEqual({ challengeId: 'ch1', email: 'a@b.com' });
  });

  it('fails closed and sends NOTHING when two active clients share an email', async () => {
    // Never guess a tenant: the invite gate and the session (authPortal) must
    // not be able to disagree about which client an email belongs to.
    findMany.mockResolvedValue([
      { id: 'c1', name: 'Ada', email: 'a@b.com' },
      { id: 'c2', name: 'Ada Dup', email: 'a@b.com' },
    ]);
    const r = await startPortalLogin('a@b.com', 'otp');
    expect(r).toBeNull();
    expect(challenge).not.toHaveBeenCalled();
    expect(reportError).toHaveBeenCalled(); // operator must merge them deliberately
  });
});
