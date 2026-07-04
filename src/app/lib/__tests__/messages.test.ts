jest.mock('../db', () => ({ prisma: { message: { create: jest.fn(), findMany: jest.fn() } } }));

import { prisma } from '../db';
import { addMessage, listMessages } from '../messages';

const create = (prisma.message as unknown as { create: jest.Mock }).create;
const findMany = (prisma.message as unknown as { findMany: jest.Mock }).findMany;

describe('messages', () => {
  beforeEach(() => jest.clearAllMocks());

  it('creates a message with sender type + email', async () => {
    create.mockResolvedValue({});
    await addMessage('p1', 'CLIENT', 'a@b.com', 'hi');
    expect(create).toHaveBeenCalledWith({
      data: { projectId: 'p1', senderType: 'CLIENT', senderEmail: 'a@b.com', body: 'hi' },
    });
  });

  it('lists a project thread oldest-first', async () => {
    findMany.mockResolvedValue([]);
    await listMessages('p1');
    expect(findMany).toHaveBeenCalledWith({ where: { projectId: 'p1' }, orderBy: { createdAt: 'asc' } });
  });
});
