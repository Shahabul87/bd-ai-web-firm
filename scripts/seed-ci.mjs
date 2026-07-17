#!/usr/bin/env node
/**
 * Deterministic CI/test seed (Phase 4 Task 4.2).
 *
 * Creates the fixture set the plan's test matrix needs: TWO clients (so
 * cross-tenant negative tests have a real "Client B" to fail against), a project
 * each, a SENT and a DRAFT invoice (drafts must never reach the portal), an
 * enrolled admin and an unenrolled admin, disabled/archived clients, and an
 * expired auth ticket.
 *
 * Ids are FIXED (ci_*) so tests can reference a fixture by name instead of
 * querying for "the first client", and the whole script is idempotent (upsert),
 * so re-running it cannot drift.
 *
 * Refuses to run against anything but an approved test database — seeding is a
 * write, and this is the one script most likely to be pointed at the wrong URL.
 */
import { PrismaClient } from '@prisma/client';

const url = process.env.DATABASE_URL ?? '';
const dbName = url.split('/').pop()?.split('?')[0] ?? '';
if (!/^craftsai_(ci|test)/.test(dbName)) {
  console.error(
    `Refusing to seed: DATABASE_URL points at database "${dbName}", which is not an approved ` +
      `test database (expected craftsai_ci* or craftsai_test*). Seeding is a WRITE.`,
  );
  process.exit(1);
}

const prisma = new PrismaClient();
const norm = (e) => e.trim().toLowerCase();

/** Every fixture, addressable by name from tests. */
export const FIXTURES = {
  adminEnrolled: 'enrolled-admin@ci.test',
  adminUnenrolled: 'new-admin@ci.test',
  clientA: 'client-a@ci.test',
  clientB: 'client-b@ci.test',
  clientDisabled: 'portal-disabled@ci.test',
  clientArchived: 'archived@ci.test',
};

async function main() {
  // ── Admins ────────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: FIXTURES.adminEnrolled },
    update: { totpEnrolled: true, normalizedEmail: norm(FIXTURES.adminEnrolled) },
    create: {
      id: 'ci_user_admin_enrolled',
      email: FIXTURES.adminEnrolled,
      normalizedEmail: norm(FIXTURES.adminEnrolled),
      role: 'ADMIN',
      totpEnrolled: true,
    },
  });
  // Exercises the first-time enrollment path.
  await prisma.user.upsert({
    where: { email: FIXTURES.adminUnenrolled },
    update: { totpEnrolled: false, normalizedEmail: norm(FIXTURES.adminUnenrolled) },
    create: {
      id: 'ci_user_admin_new',
      email: FIXTURES.adminUnenrolled,
      normalizedEmail: norm(FIXTURES.adminUnenrolled),
      role: 'ADMIN',
      totpEnrolled: false,
    },
  });

  // ── Clients ───────────────────────────────────────────────────────────────
  const client = (id, email, name, over = {}) => ({
    where: { id },
    update: { normalizedEmail: norm(email), ...over },
    create: { id, name, email, normalizedEmail: norm(email), status: 'ACTIVE', portalEnabled: true, ...over },
  });

  await prisma.client.upsert(client('ci_client_a', FIXTURES.clientA, 'CI Client A'));
  await prisma.client.upsert(client('ci_client_b', FIXTURES.clientB, 'CI Client B'));
  // Negative fixtures: must NOT be able to sign in.
  await prisma.client.upsert(
    client('ci_client_disabled', FIXTURES.clientDisabled, 'CI Portal Disabled', { portalEnabled: false }),
  );
  await prisma.client.upsert(
    client('ci_client_archived', FIXTURES.clientArchived, 'CI Archived', { status: 'ARCHIVED' }),
  );

  // ── Projects (one per tenant, so A/B isolation is testable) ───────────────
  for (const [id, clientId, title] of [
    ['ci_project_a', 'ci_client_a', 'CI Project A'],
    ['ci_project_b', 'ci_client_b', 'CI Project B'],
  ]) {
    await prisma.project.upsert({
      where: { id },
      update: {},
      create: { id, clientId, title, status: 'BUILD' },
    });
  }

  // ── Invoices: one SENT (portal-visible) and one DRAFT (must stay hidden) ──
  await prisma.invoice.upsert({
    where: { id: 'ci_invoice_sent' },
    update: {},
    create: {
      id: 'ci_invoice_sent',
      number: 9001,
      clientId: 'ci_client_a',
      projectId: 'ci_project_a',
      currency: 'USD',
      status: 'SENT',
      issueDate: new Date('2026-07-01T00:00:00Z'),
      dueDate: new Date('2026-08-01T00:00:00Z'),
      subtotalMinor: 100000,
      taxMinor: 0,
      totalMinor: 100000,
      lines: { create: [{ description: 'CI work', quantity: 1, unitPriceMinor: 100000, order: 0 }] },
    },
  });
  await prisma.invoice.upsert({
    where: { id: 'ci_invoice_draft' },
    update: {},
    create: {
      id: 'ci_invoice_draft',
      number: 9002,
      clientId: 'ci_client_a',
      currency: 'USD',
      status: 'DRAFT',
      subtotalMinor: 50000,
      taxMinor: 0,
      totalMinor: 50000,
    },
  });

  // ── An already-expired auth ticket (must fail closed) ─────────────────────
  await prisma.authTicket.upsert({
    where: { id: 'ci_ticket_expired' },
    update: {},
    create: {
      id: 'ci_ticket_expired',
      tokenHash: 'ci-expired-token-hash',
      email: FIXTURES.adminEnrolled,
      scope: 'admin',
      expiresAt: new Date(Date.now() - 60_000),
    },
  });

  // ── A lead to triage ──────────────────────────────────────────────────────
  await prisma.lead.upsert({
    where: { id: 'ci_lead_1' },
    update: {},
    create: {
      id: 'ci_lead_1',
      source: 'CONTACT',
      name: 'CI Lead',
      email: 'lead@ci.test',
      company: 'CI Co',
      message: 'A seeded contact lead for admin triage tests.',
      payload: { name: 'CI Lead', email: 'lead@ci.test', message: 'A seeded contact lead for admin triage tests.' },
    },
  });

  const counts = {
    users: await prisma.user.count(),
    clients: await prisma.client.count(),
    projects: await prisma.project.count(),
    invoices: await prisma.invoice.count(),
    leads: await prisma.lead.count(),
  };
  console.log(`seeded ${dbName}:`, JSON.stringify(counts));
}

main()
  .catch((err) => {
    console.error('seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
