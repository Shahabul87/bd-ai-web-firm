jest.mock('../db', () => ({ prisma: { client: { findFirst: jest.fn() } } }));
jest.mock('../notify', () => ({ authChallenge: jest.fn() }));
jest.mock('../email', () => ({ SITE_URL: 'https://www.craftsai.org' }));

import { prisma } from '../db';
import { authChallenge } from '../notify';
import { startPortalLogin } from '../portalLogin';

const findFirst = (prisma.client as unknown as { findFirst: jest.Mock }).findFirst;
const challenge = authChallenge as unknown as jest.Mock;

describe('startPortalLogin (invite gate)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sends NOTHING for a client that is not portalEnabled', async () => {
    findFirst.mockResolvedValue(null); // where enforces portalEnabled:true
    const r = await startPortalLogin('a@b.com', 'otp');
    expect(r).toBeNull();
    expect(challenge).not.toHaveBeenCalled();
  });

  it('queries with the invite gate (ACTIVE + portalEnabled)', async () => {
    findFirst.mockResolvedValue(null);
    await startPortalLogin('a@b.com', 'otp');
    expect(findFirst.mock.calls[0][0].where).toEqual(
      expect.objectContaining({ email: 'a@b.com', status: 'ACTIVE', portalEnabled: true }),
    );
  });

  it('sends a challenge for an enabled client', async () => {
    findFirst.mockResolvedValue({ id: 'c1', name: 'Ada' });
    challenge.mockResolvedValue({ challengeId: 'ch1' });
    const r = await startPortalLogin('a@b.com', 'magic_link');
    expect(challenge).toHaveBeenCalledTimes(1);
    expect(r).toEqual({ challengeId: 'ch1', email: 'a@b.com' });
  });
});
