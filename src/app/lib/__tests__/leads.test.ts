jest.mock('../db', () => ({ prisma: { lead: { create: jest.fn() } } }));
jest.mock('../notify', () => ({ sendAnnouncement: jest.fn().mockResolvedValue({ ok: true }) }));
jest.mock('../email', () => ({
  CONTACT_EMAIL: 'owner@craftsai.org',
  SITE_URL: 'https://www.craftsai.org',
}));

import { prisma } from '../db';
import { sendAnnouncement } from '../notify';
import { createLead } from '../leads';

const createMock = prisma.lead.create as jest.Mock;

describe('createLead', () => {
  beforeEach(() => jest.clearAllMocks());

  it('persists a lead and alerts the founder', async () => {
    createMock.mockResolvedValue({ id: 'lead_1' });
    const r = await createLead({
      source: 'CONTACT',
      name: 'Ada',
      email: 'ada@x.com',
      payload: { message: 'hi' },
      ip: '1.2.3.4',
    });
    expect(r).toEqual({ id: 'lead_1' });
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ source: 'CONTACT', name: 'Ada', email: 'ada@x.com' }),
      }),
    );
    expect(sendAnnouncement).toHaveBeenCalledWith(
      'owner@craftsai.org',
      expect.stringContaining('New CONTACT lead'),
      expect.stringContaining('Ada'),
    );
  });

  it('returns null and does not throw if the DB write fails', async () => {
    createMock.mockRejectedValue(new Error('db down'));
    const r = await createLead({ source: 'DEMO', name: 'B', email: 'b@x.com', payload: {} });
    expect(r).toBeNull();
    expect(sendAnnouncement).not.toHaveBeenCalled();
  });
});
