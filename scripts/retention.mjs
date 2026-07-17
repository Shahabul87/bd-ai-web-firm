#!/usr/bin/env node
/**
 * Retention sweep (Phase 3 Task 3.5).
 *
 * DRY RUN BY DEFAULT — prints what WOULD be removed and exits without deleting.
 * Pass --apply to actually delete.
 *
 *   npm run retention           # dry run: show the blast radius
 *   npm run retention -- --apply
 *
 * Only operational tables are swept (incidents, audit log, expired
 * tickets/sessions/tokens, rate-limit buckets, settled outbox events). Business
 * records — leads, clients, projects, invoices, messages — are never touched:
 * invoices are subject to accounting retention and must only be removed through
 * an explicit operator workflow.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const apply = process.argv.includes('--apply');
const daysAgo = (n) => new Date(Date.now() - n * 86_400_000);
const now = new Date();
const grace = daysAgo(1);

const POLICY = { incidentDays: 90, auditLogDays: 365, outboxDeliveredDays: 30, outboxDeadDays: 90 };

const targets = [
  ['Incident', prisma.incident, { createdAt: { lt: daysAgo(POLICY.incidentDays) } }],
  ['AuditLog', prisma.auditLog, { createdAt: { lt: daysAgo(POLICY.auditLogDays) } }],
  ['AuthTicket', prisma.authTicket, { OR: [{ expiresAt: { lt: grace } }, { usedAt: { not: null, lt: grace } }] }],
  ['Session', prisma.session, { expires: { lt: grace } }],
  ['VerificationToken', prisma.verificationToken, { expires: { lt: grace } }],
  ['RateLimit', prisma.rateLimit, { expiresAt: { lt: now } }],
  [
    'OutboxEvent',
    prisma.outboxEvent,
    {
      OR: [
        { status: 'DELIVERED', deliveredAt: { lt: daysAgo(POLICY.outboxDeliveredDays) } },
        { status: 'DEAD', updatedAt: { lt: daysAgo(POLICY.outboxDeadDays) } },
      ],
    },
  ],
];

console.log(apply ? '=== RETENTION SWEEP (APPLYING) ===' : '=== RETENTION SWEEP (dry run — nothing will be deleted) ===');

let total = 0;
for (const [name, model, where] of targets) {
  try {
    const n = apply ? (await model.deleteMany({ where })).count : await model.count({ where });
    total += n;
    console.log(`  ${name.padEnd(18)} ${apply ? 'deleted' : 'would delete'}: ${n}`);
  } catch (err) {
    console.error(`  ${name.padEnd(18)} FAILED: ${err.message}`);
  }
}

console.log(`\n${apply ? 'Deleted' : 'Would delete'} ${total} row(s).`);
if (!apply) console.log('Re-run with --apply to perform the deletion.');

await prisma.$disconnect();
