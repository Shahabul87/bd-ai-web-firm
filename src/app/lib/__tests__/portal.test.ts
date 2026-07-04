jest.mock('../db', () => ({
  prisma: { project: { findMany: jest.fn(), findFirst: jest.fn() } },
}));

import { prisma } from '../db';
import { listClientProjects, getClientProject } from '../portal';

const findMany = (prisma.project as unknown as { findMany: jest.Mock }).findMany;
const findFirst = (prisma.project as unknown as { findFirst: jest.Mock }).findFirst;

describe('portal data layer (scoped by clientId)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lists only the client\'s projects with milestone progress', async () => {
    findMany.mockResolvedValue([
      { id: 'p1', title: 'Site', status: 'BUILD', _count: { milestones: 3 }, milestones: [{ id: 'm1' }] },
    ]);
    const r = await listClientProjects('c1');
    expect(findMany.mock.calls[0][0].where).toEqual({ clientId: 'c1' });
    expect(r[0]).toEqual({ id: 'p1', title: 'Site', status: 'BUILD', done: 1, total: 3 });
  });

  it('getClientProject scopes by clientId (cannot load another client\'s project)', async () => {
    findFirst.mockResolvedValue(null);
    const r = await getClientProject('c1', 'pX');
    expect(r).toBeNull();
    expect(findFirst.mock.calls[0][0].where).toEqual(expect.objectContaining({ id: 'pX', clientId: 'c1' }));
  });

  it('getClientProject only includes CLIENT-visible updates', async () => {
    findFirst.mockResolvedValue({ id: 'p1', clientId: 'c1' });
    await getClientProject('c1', 'p1');
    const include = findFirst.mock.calls[0][0].include;
    expect(include.updates.where).toEqual({ visibility: 'CLIENT' });
  });
});
