jest.mock('../db', () => ({
  prisma: {
    project: { update: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
    milestone: { findUnique: jest.fn(), update: jest.fn(), create: jest.fn(), count: jest.fn() },
    projectUpdate: { create: jest.fn() },
  },
}));
jest.mock('../audit', () => ({ writeAudit: jest.fn() }));

import { prisma } from '../db';
import { setProjectStatus, toggleMilestone, addMilestone } from '../projects';

const p = prisma.project as unknown as { update: jest.Mock };
const m = prisma.milestone as unknown as { findUnique: jest.Mock; update: jest.Mock; count: jest.Mock; create: jest.Mock };

describe('projects', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sets status + audits', async () => {
    p.update.mockResolvedValue({});
    await setProjectStatus('p1', 'BUILD', 'admin@x.com');
    expect(p.update).toHaveBeenCalledWith({ where: { id: 'p1' }, data: { status: 'BUILD' } });
  });

  it('toggles milestone PENDING->DONE', async () => {
    m.findUnique.mockResolvedValue({ status: 'PENDING' });
    m.update.mockResolvedValue({});
    await toggleMilestone('m1', 'admin@x.com');
    expect(m.update).toHaveBeenCalledWith({ where: { id: 'm1' }, data: { status: 'DONE' } });
  });

  it('toggles milestone DONE->PENDING', async () => {
    m.findUnique.mockResolvedValue({ status: 'DONE' });
    m.update.mockResolvedValue({});
    await toggleMilestone('m1', 'admin@x.com');
    expect(m.update).toHaveBeenCalledWith({ where: { id: 'm1' }, data: { status: 'PENDING' } });
  });

  it('adds milestone with order = current count', async () => {
    m.count.mockResolvedValue(2);
    m.create.mockResolvedValue({});
    await addMilestone('p1', 'Ship', null);
    expect(m.create).toHaveBeenCalledWith({
      data: { projectId: 'p1', title: 'Ship', dueDate: null, order: 2 },
    });
  });
});
