jest.mock('../db', () => ({
  prisma: {
    // findFirst backs the rapid-repeat duplicate check.
    lead: { create: jest.fn(), findFirst: jest.fn() },
    // reportError persists incidents on the final-failure path.
    incident: { create: jest.fn().mockResolvedValue({}) },
  },
}));
jest.mock('../notify', () => ({
  sendAnnouncement: jest.fn().mockResolvedValue({ ok: true }),
  sendPush: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../email', () => ({
  CONTACT_EMAIL: 'owner@craftsai.org',
  SITE_URL: 'https://www.craftsai.org',
}));

import { prisma } from '../db';
import { sendAnnouncement } from '../notify';
import { createLead, leadsToCsv } from '../leads';

const createMock = prisma.lead.create as jest.Mock;
const findFirstMock = prisma.lead.findFirst as unknown as jest.Mock;

describe('createLead', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    findFirstMock.mockResolvedValue(null); // no recent duplicate by default
  });

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

  it('returns null, pages the founder, and does not throw if the DB write fails', async () => {
    createMock.mockRejectedValue(new Error('db down'));
    const r = await createLead({ source: 'DEMO', name: 'B', email: 'b@x.com', payload: {} });
    expect(r).toBeNull();
    // On final failure the founder is alerted about the lost lead (exactly once),
    // so a persistence failure is never silent.
    expect(sendAnnouncement).toHaveBeenCalledTimes(1);
    expect(sendAnnouncement).toHaveBeenCalledWith(
      'owner@craftsai.org',
      expect.stringContaining('Lead capture FAILED'),
      expect.stringContaining('b@x.com'),
    );
  });

  it('retries a transient connection error and then succeeds', async () => {
    createMock
      .mockRejectedValueOnce(new Error("Can't reach database server at postgres:5432"))
      .mockResolvedValueOnce({ id: 'lead_2' });
    const r = await createLead({ source: 'CONTACT', name: 'C', email: 'c@x.com', payload: {} });
    expect(r).toEqual({ id: 'lead_2' });
    expect(createMock).toHaveBeenCalledTimes(2);
    expect(sendAnnouncement).toHaveBeenCalledTimes(1);
  });
});

describe('createLead — rapid-repeat idempotency', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns the existing lead instead of creating a duplicate', async () => {
    findFirstMock.mockResolvedValue({ id: 'lead_existing' });
    const r = await createLead({
      source: 'CONTACT',
      name: 'Ada',
      email: 'ada@x.com',
      message: 'hi',
      payload: { message: 'hi' },
    });
    expect(r).toEqual({ id: 'lead_existing' });
    expect(createMock).not.toHaveBeenCalled();
    expect(sendAnnouncement).not.toHaveBeenCalled(); // no second founder alert
  });

  it('still captures the lead if the duplicate lookup fails', async () => {
    findFirstMock.mockRejectedValue(new Error('db hiccup'));
    createMock.mockResolvedValue({ id: 'lead_2' });
    const r = await createLead({
      source: 'CONTACT',
      name: 'Ada',
      email: 'ada@x.com',
      payload: { message: 'hi' },
    });
    expect(r).toEqual({ id: 'lead_2' });
    expect(createMock).toHaveBeenCalled();
  });
});

describe('createLead — founder alert completeness', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    findFirstMock.mockResolvedValue(null);
  });

  it('includes payload fields beyond the core four (e.g. service interest)', async () => {
    createMock.mockResolvedValue({ id: 'lead_3' });
    await createLead({
      source: 'CONTACT',
      name: 'Ada',
      email: 'ada@x.com',
      message: 'hi',
      payload: { name: 'Ada', email: 'ada@x.com', message: 'hi', service: 'web-development' },
    });
    const body = (sendAnnouncement as jest.Mock).mock.calls[0][2] as string;
    expect(body).toContain('service: web-development');
  });
});

describe('leadsToCsv — formula-injection neutralization', () => {
  const row = (over: Partial<Parameters<typeof leadsToCsv>[0][number]>) => ({
    id: 'l1',
    source: 'CONTACT' as const,
    name: 'Ada',
    email: 'ada@x.com',
    company: null,
    status: 'NEW' as const,
    createdAt: new Date('2026-07-16T00:00:00.000Z'),
    ...over,
  });

  it.each([
    ['=1+1', "'="],
    ['+1', "'+"],
    ['-1', "'-"],
    ['@X', "'@"],
  ])('prefixes a formula-triggering value %j so spreadsheets treat it as text', (name, marker) => {
    const dataLine = leadsToCsv([row({ name })]).trim().split('\n')[1];
    // The neutralizing single quote precedes the formula character...
    expect(dataLine).toContain(marker);
    // ...and no cell begins with a bare formula character right after a comma.
    expect(dataLine).not.toContain(`,${name[0]}`);
  });

  it('leaves ordinary values unprefixed', () => {
    const csv = leadsToCsv([row({ name: 'Ada Lovelace' })]);
    expect(csv).toContain('Ada Lovelace');
    expect(csv).not.toContain("'Ada");
  });
});
