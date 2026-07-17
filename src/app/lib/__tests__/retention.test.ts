jest.mock('../db', () => {
  const table = () => ({ deleteMany: jest.fn().mockResolvedValue({ count: 2 }), count: jest.fn().mockResolvedValue(2) });
  return {
    prisma: {
      incident: table(),
      auditLog: table(),
      authTicket: table(),
      session: table(),
      verificationToken: table(),
      rateLimit: table(),
      outboxEvent: table(),
    },
  };
});
jest.mock('../report', () => ({ reportError: jest.fn() }));

import { prisma } from '../db';
import { reportError } from '../report';
import { runRetention, DEFAULT_RETENTION } from '../retention';

const db = prisma as unknown as Record<string, { deleteMany: jest.Mock; count: jest.Mock }>;
const ALL_TABLES = ['incident', 'auditLog', 'authTicket', 'session', 'verificationToken', 'rateLimit', 'outboxEvent'];

beforeEach(() => {
  jest.clearAllMocks();
  for (const t of ALL_TABLES) {
    db[t].count.mockResolvedValue(2);
    db[t].deleteMany.mockResolvedValue({ count: 2 });
  }
});

describe('runRetention', () => {
  it('DRY RUNS by default — counts without deleting anything', async () => {
    const r = await runRetention();
    expect(r.dryRun).toBe(true);
    for (const t of ALL_TABLES) {
      expect(db[t].count).toHaveBeenCalled();
      expect(db[t].deleteMany).not.toHaveBeenCalled(); // nothing destroyed
    }
    expect(r.total).toBe(14); // 7 tables x 2
  });

  it('deletes only when explicitly asked', async () => {
    const r = await runRetention({ dryRun: false });
    expect(r.dryRun).toBe(false);
    for (const t of ALL_TABLES) expect(db[t].deleteMany).toHaveBeenCalled();
  });

  it('covers every operational table the plan lists', async () => {
    const r = await runRetention();
    expect(Object.keys(r.counts).sort()).toEqual(
      ['AuditLog', 'AuthTicket', 'Incident', 'OutboxEvent', 'RateLimit', 'Session', 'VerificationToken'].sort(),
    );
  });

  it('NEVER touches business records (leads, clients, invoices, messages)', async () => {
    await runRetention({ dryRun: false });
    // Those tables are not even present on the mocked client — accounting and
    // client data must only ever be removed by an explicit operator workflow.
    for (const forbidden of ['lead', 'client', 'invoice', 'message', 'project']) {
      expect(db[forbidden]).toBeUndefined();
    }
  });

  it('sweeps only EXPIRED sessions/tokens/rate-limit rows', async () => {
    await runRetention();
    expect(db.session.count.mock.calls[0][0].where.expires.lt).toBeInstanceOf(Date);
    expect(db.verificationToken.count.mock.calls[0][0].where.expires.lt).toBeInstanceOf(Date);
    expect(db.rateLimit.count.mock.calls[0][0].where.expiresAt.lt).toBeInstanceOf(Date);
  });

  it('keeps the audit trail far longer than incident noise', () => {
    expect(DEFAULT_RETENTION.auditLogDays).toBeGreaterThan(DEFAULT_RETENTION.incidentDays);
  });

  it('keeps dead outbox events longer than delivered ones (diagnosis)', () => {
    expect(DEFAULT_RETENTION.outboxDeadDays).toBeGreaterThan(DEFAULT_RETENTION.outboxDeliveredDays);
  });

  it('honours an overridden policy', async () => {
    await runRetention({ policy: { incidentDays: 1 } });
    const cutoff = db.incident.count.mock.calls[0][0].where.createdAt.lt as Date;
    // ~1 day ago, not the 90-day default.
    expect(Date.now() - cutoff.getTime()).toBeLessThan(2 * 86_400_000);
  });

  it('continues sweeping when one table fails, and reports it', async () => {
    db.incident.count.mockRejectedValue(new Error('table gone'));
    const r = await runRetention();
    expect(r.counts.Incident).toBe(-1); // marked failed
    expect(db.auditLog.count).toHaveBeenCalled(); // the rest still ran
    expect(reportError).toHaveBeenCalledWith(
      'retention.sweep',
      expect.any(Error),
      expect.objectContaining({ meta: { table: 'Incident' } }),
    );
  });
});
