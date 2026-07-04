jest.mock('../db', () => ({
  prisma: { client: { findMany: jest.fn(), update: jest.fn(), create: jest.fn() } },
}));
jest.mock('../audit', () => ({ writeAudit: jest.fn() }));

import { prisma } from '../db';
import { listClients, archiveClient } from '../clients';
import { writeAudit } from '../audit';

const c = prisma.client as unknown as { findMany: jest.Mock; update: jest.Mock };

describe('clients', () => {
  beforeEach(() => jest.clearAllMocks());

  it('filters + searches + maps projectCount', async () => {
    c.findMany.mockResolvedValue([
      {
        id: '1',
        name: 'A',
        email: 'a@b.com',
        company: null,
        status: 'ACTIVE',
        createdAt: new Date(),
        _count: { projects: 3 },
      },
    ]);
    const r = await listClients({ status: 'ACTIVE', q: 'ada' });
    const arg = c.findMany.mock.calls[0][0];
    expect(arg.where.status).toBe('ACTIVE');
    expect(arg.where.OR).toEqual(
      expect.arrayContaining([{ name: { contains: 'ada', mode: 'insensitive' } }]),
    );
    expect(r[0].projectCount).toBe(3);
  });

  it('archives + audits', async () => {
    c.update.mockResolvedValue({});
    await archiveClient('1', 'admin@x.com');
    expect(c.update).toHaveBeenCalledWith({ where: { id: '1' }, data: { status: 'ARCHIVED' } });
    expect(writeAudit).toHaveBeenCalledWith('client.archive', expect.objectContaining({ actorEmail: 'admin@x.com' }));
  });
});
