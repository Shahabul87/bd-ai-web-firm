jest.mock('../db', () => {
  const tx = { client: { create: jest.fn() }, project: { create: jest.fn() } };
  return {
    prisma: {
      lead: { findUnique: jest.fn() },
      client: { findUnique: jest.fn() },
      $transaction: jest.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
      __tx: tx,
    },
  };
});
jest.mock('../audit', () => ({ writeAudit: jest.fn() }));
jest.mock('../notify', () => ({ sendAnnouncement: jest.fn() }));
jest.mock('../email', () => ({ SITE_URL: 'https://www.craftsai.org', CONTACT_EMAIL: 'o@c.org' }));

import { prisma } from '../db';
import { convertLeadToClient } from '../leads';

const db = prisma as unknown as {
  lead: { findUnique: jest.Mock };
  client: { findUnique: jest.Mock };
  __tx: { client: { create: jest.Mock }; project: { create: jest.Mock } };
};

describe('convertLeadToClient', () => {
  beforeEach(() => jest.clearAllMocks());

  it('refuses an already-converted lead', async () => {
    db.lead.findUnique.mockResolvedValue({ id: 'l1', name: 'A', email: 'a@b.com', company: null });
    db.client.findUnique.mockResolvedValue({ id: 'existing' });
    const r = await convertLeadToClient('l1', 'admin@x.com', 'Web build');
    expect(r).toEqual({ error: 'Lead already converted.' });
  });

  it('refuses a missing lead', async () => {
    db.lead.findUnique.mockResolvedValue(null);
    const r = await convertLeadToClient('nope', 'admin@x.com', 'X');
    expect(r).toEqual({ error: 'Lead not found.' });
  });

  it('creates client + project from the lead', async () => {
    db.lead.findUnique.mockResolvedValue({ id: 'l1', name: 'Ada', email: 'ada@x.com', company: 'Acme' });
    db.client.findUnique.mockResolvedValue(null);
    db.__tx.client.create.mockResolvedValue({ id: 'c1' });
    db.__tx.project.create.mockResolvedValue({ id: 'p1' });
    const r = await convertLeadToClient('l1', 'admin@x.com', 'Web build');
    expect(r).toEqual({ clientId: 'c1', projectId: 'p1' });
    expect(db.__tx.client.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: 'Ada', email: 'ada@x.com', company: 'Acme', sourceLeadId: 'l1' }),
      }),
    );
    expect(db.__tx.project.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ clientId: 'c1', title: 'Web build' }) }),
    );
  });
});
