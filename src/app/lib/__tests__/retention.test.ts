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
      lead: table(),
    },
  };
});
jest.mock('../report', () => ({ reportError: jest.fn() }));

import { prisma } from '../db';
import { reportError } from '../report';
import { runRetention, DEFAULT_RETENTION } from '../retention';

const db = prisma as unknown as Record<string, { deleteMany: jest.Mock; count: jest.Mock }>;
const ALL_TABLES = ['incident', 'auditLog', 'authTicket', 'session', 'verificationToken', 'rateLimit', 'outboxEvent', 'lead'];

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
    expect(r.total).toBe(ALL_TABLES.length * 2);
  });

  it('deletes only when explicitly asked', async () => {
    const r = await runRetention({ dryRun: false });
    expect(r.dryRun).toBe(false);
    for (const t of ALL_TABLES) expect(db[t].deleteMany).toHaveBeenCalled();
  });

  it('covers every operational table the plan lists', async () => {
    const r = await runRetention();
    expect(Object.keys(r.counts).sort()).toEqual(
      ['AuditLog', 'AuthTicket', 'Incident', 'Lead', 'OutboxEvent', 'RateLimit', 'Session', 'VerificationToken'].sort(),
    );
  });

  it('NEVER touches client, invoice, project or message records', async () => {
    await runRetention({ dryRun: false });
    // Not even present on the mocked client: these carry a 7-year accounting
    // retention and may only be removed by an explicit operator workflow.
    for (const forbidden of ['client', 'invoice', 'message', 'project']) {
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

  /**
   * The privacy policy publicly commits to deleting unconverted lead enquiries
   * after 24 months. The code has to keep that promise — and must NOT keep it so
   * enthusiastically that it destroys a record under an accounting hold.
   */
  it('sweeps unconverted leads at the 24 months the privacy policy promises', async () => {
    await runRetention();
    const where = db.lead.count.mock.calls[0][0].where;
    const cutoffDaysAgo = (Date.now() - (where.createdAt.lt as Date).getTime()) / 86_400_000;
    expect(Math.round(cutoffDaysAgo)).toBe(730); // 24 months, matching the policy
    expect(DEFAULT_RETENTION.leadDays).toBe(730);
  });

  it('LEGAL HOLD: never deletes a lead that became a client', async () => {
    await runRetention({ dryRun: false });
    // A converted lead is the origin record of an engagement whose invoices are
    // kept 7 years — and Client.sourceLeadId points at it.
    expect(db.lead.deleteMany.mock.calls[0][0].where.convertedClient).toBeNull();
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
