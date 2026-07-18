jest.mock('../db', () => ({
  prisma: {
    outboxEvent: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
      createMany: jest.fn(),
      count: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));
jest.mock('../notify', () => ({
  sendAnnouncement: jest.fn(),
  sendPush: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../report', () => ({ reportError: jest.fn() }));

import { prisma } from '../db';
import { sendAnnouncement } from '../notify';
import { reportError } from '../report';
import {
  enqueueOutbox,
  dispatchOutbox,
  retryDeadEvent,
  cleanupOutbox,
  backoffMs,
  MAX_ATTEMPTS,
} from '../outbox';

const ob = prisma.outboxEvent as unknown as {
  findMany: jest.Mock;
  updateMany: jest.Mock;
  update: jest.Mock;
  createMany: jest.Mock;
  count: jest.Mock;
  deleteMany: jest.Mock;
};

const anEvent = (over: Record<string, unknown> = {}) => ({
  id: 'e1',
  type: 'invoice.sent',
  attempts: 0,
  payload: { channel: 'email', to: 'c@x.com', subject: 'S', body: 'B' },
  ...over,
});

beforeEach(() => {
  jest.clearAllMocks();
  ob.updateMany.mockResolvedValue({ count: 1 }); // claim succeeds by default
  ob.update.mockResolvedValue({});
  (sendAnnouncement as jest.Mock).mockResolvedValue({ ok: true });
});

describe('enqueueOutbox', () => {
  it('writes through the CALLER-SUPPLIED transaction client, not the global one', async () => {
    const tx = { outboxEvent: { createMany: jest.fn().mockResolvedValue({ count: 1 }) } };
    await enqueueOutbox(tx as never, {
      type: 'invoice.sent',
      aggregateId: 'inv1',
      idempotencyKey: 'invoice.sent:email:inv1',
      payload: { channel: 'email', to: 'c@x.com', subject: 'S', body: 'B' },
    });
    // Using the global client would break atomicity with the business write.
    expect(tx.outboxEvent.createMany).toHaveBeenCalledTimes(1);
    expect(ob.createMany).not.toHaveBeenCalled();
  });

  it('is idempotent: a duplicate key is skipped rather than queued twice', async () => {
    const tx = { outboxEvent: { createMany: jest.fn().mockResolvedValue({ count: 0 }) } };
    await enqueueOutbox(tx as never, {
      type: 'invoice.sent',
      idempotencyKey: 'invoice.sent:email:inv1',
      payload: { channel: 'email', to: 'c@x.com', subject: 'S', body: 'B' },
    });
    expect(tx.outboxEvent.createMany.mock.calls[0][0].skipDuplicates).toBe(true);
  });
});

describe('dispatchOutbox', () => {
  it('delivers a due event and marks it DELIVERED', async () => {
    ob.findMany.mockResolvedValue([anEvent()]);
    const r = await dispatchOutbox();
    expect(sendAnnouncement).toHaveBeenCalledWith('c@x.com', 'S', 'B');
    expect(r.delivered).toBe(1);
    expect(ob.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'DELIVERED' }) }),
    );
  });

  it('only picks up events that are PENDING and due', async () => {
    ob.findMany.mockResolvedValue([]);
    await dispatchOutbox();
    expect(ob.findMany.mock.calls[0][0].where).toEqual(
      expect.objectContaining({ status: 'PENDING', nextAttemptAt: { lte: expect.any(Date) } }),
    );
  });

  it('claims an event conditionally so two workers cannot both send it', async () => {
    ob.findMany.mockResolvedValue([anEvent({ attempts: 2 })]);
    ob.updateMany.mockResolvedValue({ count: 0 }); // another worker claimed it first
    const r = await dispatchOutbox();
    expect(r.claimed).toBe(0);
    expect(sendAnnouncement).not.toHaveBeenCalled(); // no duplicate delivery
    // The claim must be conditional on the observed attempt count.
    expect(ob.updateMany.mock.calls[0][0].where).toEqual(
      expect.objectContaining({ id: 'e1', status: 'PENDING', attempts: 2 }),
    );
  });

  it('keeps a failed event PENDING with a backoff instead of losing it', async () => {
    ob.findMany.mockResolvedValue([anEvent()]);
    (sendAnnouncement as jest.Mock).mockResolvedValue({ ok: false }); // notify-svc down
    const r = await dispatchOutbox();
    expect(r.failed).toBe(1);
    expect(r.delivered).toBe(0);
    const data = ob.update.mock.calls[0][0].data;
    expect(data.status).toBe('PENDING'); // still queued — will retry
    expect(data.nextAttemptAt.getTime()).toBeGreaterThan(Date.now());
    expect(data.lastError).toBeTruthy();
  });

  it('dead-letters after MAX_ATTEMPTS and reports it', async () => {
    ob.findMany.mockResolvedValue([anEvent({ attempts: MAX_ATTEMPTS - 1 })]);
    (sendAnnouncement as jest.Mock).mockResolvedValue({ ok: false });
    const r = await dispatchOutbox();
    expect(r.dead).toBe(1);
    expect(ob.update.mock.calls[0][0].data.status).toBe('DEAD');
    expect(reportError).toHaveBeenCalledWith('outbox.dead', expect.anything(), expect.anything());
  });

  it('truncates the stored error so a huge message cannot bloat the row', async () => {
    ob.findMany.mockResolvedValue([anEvent()]);
    (sendAnnouncement as jest.Mock).mockRejectedValue(new Error('x'.repeat(2000)));
    await dispatchOutbox();
    expect(ob.update.mock.calls[0][0].data.lastError.length).toBeLessThanOrEqual(500);
  });
});

describe('backoffMs', () => {
  it('grows exponentially with attempts', () => {
    const noJitter = () => 0;
    expect(backoffMs(2, noJitter)).toBeGreaterThan(backoffMs(1, noJitter));
    expect(backoffMs(3, noJitter)).toBeGreaterThan(backoffMs(2, noJitter));
  });

  it('is capped so a long outage does not schedule a retry days away', () => {
    const noJitter = () => 0;
    expect(backoffMs(50, noJitter)).toBeLessThanOrEqual(60 * 60_000);
  });

  it('adds jitter so recovering workers do not stampede together', () => {
    expect(backoffMs(3, () => 1)).toBeGreaterThan(backoffMs(3, () => 0));
  });
});

describe('operator controls', () => {
  it('retryDeadEvent requeues only a DEAD event', async () => {
    ob.updateMany.mockResolvedValue({ count: 1 });
    await expect(retryDeadEvent('e1')).resolves.toBe(true);
    expect(ob.updateMany.mock.calls[0][0].where).toEqual({ id: 'e1', status: 'DEAD' });
    expect(ob.updateMany.mock.calls[0][0].data).toEqual(
      expect.objectContaining({ status: 'PENDING', attempts: 0 }),
    );
  });

  it('retryDeadEvent reports false when the event was not DEAD', async () => {
    ob.updateMany.mockResolvedValue({ count: 0 });
    await expect(retryDeadEvent('e1')).resolves.toBe(false);
  });

  it('cleanupOutbox removes delivered + dead events past retention only', async () => {
    ob.deleteMany.mockResolvedValue({ count: 7 });
    await expect(cleanupOutbox()).resolves.toBe(7);
    const or = ob.deleteMany.mock.calls[0][0].where.OR;
    expect(or[0]).toEqual(expect.objectContaining({ status: 'DELIVERED' }));
    expect(or[1]).toEqual(expect.objectContaining({ status: 'DEAD' }));
  });
});
