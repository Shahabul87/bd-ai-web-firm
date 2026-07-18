import 'server-only';
import { prisma } from './db';
import { reportError } from './report';

/**
 * Retention cleanup.
 *
 * Operational tables grow without bound: every incident, audit entry, expired
 * auth ticket, rate-limit bucket and delivered outbox event is kept forever.
 * That is a cost problem, a performance problem, and — for anything holding an
 * IP or an email — a privacy problem, since "we keep it only as long as we need
 * it" has to be true in the code, not just in the policy.
 *
 * Client, Project, Invoice and Message are deliberately NOT touched: they carry
 * a 7-year accounting retention and must never be swept automatically. Removing
 * those is an explicit, operator-driven workflow.
 *
 * UNCONVERTED leads ARE swept, because the privacy policy makes a public
 * 24-month commitment about them — a promise the code has to keep. A lead that
 * became a client is held indefinitely by that same accounting rule.
 */

export interface RetentionPolicy {
  /** Resolved incidents/audit noise older than this is removed. */
  incidentDays: number;
  auditLogDays: number;
  /** Delivered outbox events; dead ones are kept longer for diagnosis. */
  outboxDeliveredDays: number;
  outboxDeadDays: number;
  /** Sessions/tokens/tickets are removed once expired (plus a small grace). */
  expiredGraceDays: number;
  /**
   * Unconverted lead enquiries. The published privacy policy commits to 24
   * months, so this is a PROMISE, not a preference — keep them in step.
   */
  leadDays: number;
}

export const DEFAULT_RETENTION: RetentionPolicy = {
  incidentDays: 90,
  auditLogDays: 365, // audit trail is a security record — kept a full year
  outboxDeliveredDays: 30,
  outboxDeadDays: 90,
  expiredGraceDays: 1,
  leadDays: 730, // 24 months — matches Legal.privacy.sections.dataRetention
};

export interface RetentionReport {
  dryRun: boolean;
  counts: Record<string, number>;
  total: number;
}

const daysAgo = (n: number): Date => new Date(Date.now() - n * 86_400_000);

/**
 * Sweep expired/aged operational records.
 *
 * `dryRun` (the default) COUNTS what would be deleted without touching
 * anything, so an operator can see the blast radius before running it for real.
 */
export async function runRetention(
  opts: { dryRun?: boolean; policy?: Partial<RetentionPolicy> } = {},
): Promise<RetentionReport> {
  const dryRun = opts.dryRun ?? true;
  const p: RetentionPolicy = { ...DEFAULT_RETENTION, ...opts.policy };
  const now = new Date();
  const grace = daysAgo(p.expiredGraceDays);

  const targets: Array<{ name: string; where: Record<string, unknown>; run: (w: never) => Promise<{ count: number }>; count: (w: never) => Promise<number> }> = [
    {
      name: 'Incident',
      where: { createdAt: { lt: daysAgo(p.incidentDays) } },
      run: (w) => prisma.incident.deleteMany({ where: w }),
      count: (w) => prisma.incident.count({ where: w }),
    },
    {
      name: 'AuditLog',
      where: { createdAt: { lt: daysAgo(p.auditLogDays) } },
      run: (w) => prisma.auditLog.deleteMany({ where: w }),
      count: (w) => prisma.auditLog.count({ where: w }),
    },
    {
      name: 'AuthTicket',
      // Tickets live 2 minutes; anything expired or already burnt is dead weight.
      where: { OR: [{ expiresAt: { lt: grace } }, { usedAt: { not: null, lt: grace } }] },
      run: (w) => prisma.authTicket.deleteMany({ where: w }),
      count: (w) => prisma.authTicket.count({ where: w }),
    },
    {
      name: 'Session',
      where: { expires: { lt: grace } },
      run: (w) => prisma.session.deleteMany({ where: w }),
      count: (w) => prisma.session.count({ where: w }),
    },
    {
      name: 'VerificationToken',
      where: { expires: { lt: grace } },
      run: (w) => prisma.verificationToken.deleteMany({ where: w }),
      count: (w) => prisma.verificationToken.count({ where: w }),
    },
    {
      name: 'RateLimit',
      where: { expiresAt: { lt: now } },
      run: (w) => prisma.rateLimit.deleteMany({ where: w }),
      count: (w) => prisma.rateLimit.count({ where: w }),
    },
    {
      name: 'OutboxEvent',
      where: {
        OR: [
          { status: 'DELIVERED', deliveredAt: { lt: daysAgo(p.outboxDeliveredDays) } },
          { status: 'DEAD', updatedAt: { lt: daysAgo(p.outboxDeadDays) } },
        ],
      },
      run: (w) => prisma.outboxEvent.deleteMany({ where: w }),
      count: (w) => prisma.outboxEvent.count({ where: w }),
    },
    {
      // The ONE business record swept here, because the privacy policy makes a
      // public 24-month promise about it.
      //
      // LEGAL HOLD: a lead that became a client is no longer just an enquiry —
      // it is the origin record of an engagement whose invoices carry a 7-year
      // accounting retention. `convertedClient: null` enforces that; deleting a
      // converted lead would also break Client.sourceLeadId.
      name: 'Lead',
      where: {
        createdAt: { lt: daysAgo(p.leadDays) },
        convertedClient: null,
      },
      run: (w) => prisma.lead.deleteMany({ where: w }),
      count: (w) => prisma.lead.count({ where: w }),
    },
  ];

  const counts: Record<string, number> = {};
  for (const t of targets) {
    try {
      const n = dryRun
        ? await t.count(t.where as never)
        : (await t.run(t.where as never)).count;
      counts[t.name] = n;
    } catch (err) {
      // One unsweepable table must not abort the rest of the sweep.
      counts[t.name] = -1;
      reportError('retention.sweep', err, { severity: 'warn', meta: { table: t.name } });
    }
  }

  return { dryRun, counts, total: Object.values(counts).reduce((a, b) => a + Math.max(0, b), 0) };
}
