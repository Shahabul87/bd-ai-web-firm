jest.mock('../db', () => ({
  prisma: {
    lead: { findMany: jest.fn(), count: jest.fn(), update: jest.fn() },
    leadNote: { create: jest.fn() },
  },
}));
jest.mock('../audit', () => ({ writeAudit: jest.fn() }));
jest.mock('../notify', () => ({ sendAnnouncement: jest.fn() }));
jest.mock('../email', () => ({ SITE_URL: 'https://www.craftsai.org', CONTACT_EMAIL: 'o@c.org' }));

import { prisma } from '../db';
import { listLeads, leadsToCsv } from '../leads';

const lead = prisma.lead as unknown as { findMany: jest.Mock; count: jest.Mock };

describe('listLeads', () => {
  beforeEach(() => jest.clearAllMocks());

  it('filters by status/source and searches q', async () => {
    lead.findMany.mockResolvedValue([]);
    await listLeads({ status: 'NEW', source: 'QUOTE', q: 'ada' });
    const arg = lead.findMany.mock.calls[0][0];
    expect(arg.where.status).toBe('NEW');
    expect(arg.where.source).toBe('QUOTE');
    expect(arg.where.OR).toEqual(
      expect.arrayContaining([{ name: { contains: 'ada', mode: 'insensitive' } }]),
    );
    expect(arg.orderBy).toEqual({ createdAt: 'desc' });
  });

  it('omits where clauses when no filters', async () => {
    lead.findMany.mockResolvedValue([]);
    await listLeads();
    const arg = lead.findMany.mock.calls[0][0];
    expect(arg.where.status).toBeUndefined();
    expect(arg.where.OR).toBeUndefined();
  });
});

describe('leadsToCsv', () => {
  it('emits header + escaped rows', () => {
    const csv = leadsToCsv([
      {
        id: '1',
        source: 'CONTACT',
        name: 'A, B',
        email: 'a@b.com',
        company: null,
        status: 'NEW',
        createdAt: new Date('2026-01-01T00:00:00Z'),
      },
    ]);
    const lines = csv.trim().split('\n');
    expect(lines[0]).toBe('id,source,name,email,company,status,createdAt');
    expect(lines[1]).toContain('"A, B"');
  });
});
