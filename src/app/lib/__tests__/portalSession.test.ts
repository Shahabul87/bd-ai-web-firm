jest.mock('@/authPortal', () => ({ authPortal: jest.fn() }));
jest.mock('../db', () => ({ prisma: { client: { findUnique: jest.fn() } } }));

import { authPortal } from '@/authPortal';
import { prisma } from '../db';
import { getPortalClient } from '../portalSession';

const authMock = authPortal as unknown as jest.Mock;
const find = (prisma.client as unknown as { findUnique: jest.Mock }).findUnique;

describe('getPortalClient', () => {
  beforeEach(() => jest.clearAllMocks());

  it('null when no session', async () => {
    authMock.mockResolvedValue(null);
    expect(await getPortalClient()).toBeNull();
  });

  it('null when session has no clientId', async () => {
    authMock.mockResolvedValue({ user: { email: 'a@b.com' } });
    expect(await getPortalClient()).toBeNull();
  });

  it('null when client is portalDisabled', async () => {
    authMock.mockResolvedValue({ clientId: 'c1' });
    find.mockResolvedValue({ id: 'c1', email: 'a@b.com', name: 'A', status: 'ACTIVE', portalEnabled: false });
    expect(await getPortalClient()).toBeNull();
  });

  it('null when client is archived', async () => {
    authMock.mockResolvedValue({ clientId: 'c1' });
    find.mockResolvedValue({ id: 'c1', email: 'a@b.com', name: 'A', status: 'ARCHIVED', portalEnabled: true });
    expect(await getPortalClient()).toBeNull();
  });

  it('returns client when active + enabled', async () => {
    authMock.mockResolvedValue({ clientId: 'c1' });
    find.mockResolvedValue({ id: 'c1', email: 'a@b.com', name: 'Ada', status: 'ACTIVE', portalEnabled: true });
    expect(await getPortalClient()).toEqual({ clientId: 'c1', email: 'a@b.com', name: 'Ada' });
  });
});
