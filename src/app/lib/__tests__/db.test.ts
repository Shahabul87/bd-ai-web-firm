import { prisma } from '../db';

describe('prisma singleton', () => {
  it('exports a PrismaClient with a lead delegate', () => {
    expect(prisma).toBeDefined();
    expect(typeof prisma.lead.create).toBe('function');
  });

  it('returns the same instance across imports', async () => {
    const again = (await import('../db')).prisma;
    expect(again).toBe(prisma);
  });
});
