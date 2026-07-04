jest.mock('../db', () => ({ prisma: { client: { findUnique: jest.fn(), update: jest.fn() } } }));
jest.mock('../notify', () => ({ sendAnnouncement: jest.fn() }));
jest.mock('../audit', () => ({ writeAudit: jest.fn() }));
jest.mock('../email', () => ({ SITE_URL: 'https://www.craftsai.org', CONTACT_EMAIL: 'o@c.org' }));

import { prisma } from '../db';
import { inviteClientToPortal } from '../clients';
import { sendAnnouncement } from '../notify';
import { writeAudit } from '../audit';

const find = (prisma.client as unknown as { findUnique: jest.Mock }).findUnique;
const update = (prisma.client as unknown as { update: jest.Mock }).update;

describe('inviteClientToPortal', () => {
  beforeEach(() => jest.clearAllMocks());

  it('enables portal + emails the client + audits', async () => {
    find.mockResolvedValue({ id: 'c1', name: 'Ada', email: 'a@b.com' });
    update.mockResolvedValue({});
    const r = await inviteClientToPortal('c1', 'admin@x.com');
    expect(r).toEqual({ ok: true });
    expect(update).toHaveBeenCalledWith({ where: { id: 'c1' }, data: { portalEnabled: true } });
    expect(sendAnnouncement).toHaveBeenCalledWith('a@b.com', expect.any(String), expect.stringContaining('portal'));
    expect(writeAudit).toHaveBeenCalledWith('client.portal.invite', expect.objectContaining({ actorEmail: 'admin@x.com' }));
  });

  it('errors when the client is missing', async () => {
    find.mockResolvedValue(null);
    const r = await inviteClientToPortal('nope', 'admin@x.com');
    expect(r).toEqual({ error: 'Client not found.' });
    expect(update).not.toHaveBeenCalled();
  });
});
