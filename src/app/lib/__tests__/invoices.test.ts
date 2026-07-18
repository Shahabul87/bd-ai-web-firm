jest.mock('../db', () => {
  // The transaction client must expose everything the write paths use, since
  // the status check, the tenant check and the writes now all run inside ONE
  // transaction.
  const tx = {
    invoice: {
      aggregate: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      // sendInvoice flips status and enqueues its notifications in ONE tx.
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    invoiceLine: { deleteMany: jest.fn() },
    project: { findFirst: jest.fn() },
  };
  return {
    prisma: {
      invoice: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        // Status transitions are now atomic conditional updates.
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      invoiceLine: { deleteMany: jest.fn() },
      $transaction: jest.fn(async (arg: unknown) =>
        typeof arg === 'function' ? (arg as (t: typeof tx) => unknown)(tx) : arg,
      ),
      __tx: tx,
    },
  };
});
jest.mock('../audit', () => ({ writeAudit: jest.fn() }));
jest.mock('../notify', () => ({ sendAnnouncement: jest.fn(), sendPush: jest.fn() }));
jest.mock('../email', () => ({ SITE_URL: 'https://www.craftsai.org', CONTACT_EMAIL: 'o@c.org' }));
jest.mock('../outbox', () => ({
  enqueueOutbox: jest.fn().mockResolvedValue(undefined),
  dispatchOutbox: jest.fn().mockResolvedValue({ claimed: 0, delivered: 0, failed: 0, dead: 0 }),
}));

import { prisma } from '../db';
import { sendAnnouncement } from '../notify';
import { enqueueOutbox } from '../outbox';
import {
  createInvoice,
  updateInvoiceDraft,
  sendInvoice,
  markInvoicePaid,
  voidInvoice,
  isOverdue,
  getClientInvoice,
  canTransition,
} from '../invoices';

const db = prisma as unknown as {
  invoice: { findUnique: jest.Mock; findFirst: jest.Mock; update: jest.Mock; updateMany: jest.Mock };
  __tx: {
    invoice: {
      aggregate: jest.Mock;
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
    invoiceLine: { deleteMany: jest.Mock };
    project: { findFirst: jest.Mock };
  };
};

describe('invoices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: any project passed in DOES belong to the client. Tests that
    // exercise the cross-tenant path override this with null.
    db.__tx.project.findFirst.mockResolvedValue({ id: 'p1' });
    // Default: the conditional status update wins its race.
    db.invoice.updateMany.mockResolvedValue({ count: 1 });
  });

  it('createInvoice assigns next number + stores computed totals', async () => {
    db.__tx.invoice.aggregate.mockResolvedValue({ _max: { number: 4 } });
    db.__tx.invoice.create.mockResolvedValue({ id: 'inv1' });
    const r = await createInvoice(
      { clientId: 'c1', currency: 'USD', taxRateBps: 1500, lines: [{ description: 'Build', quantity: 2, unitPriceMinor: 50000 }] },
      'admin@x.com',
    );
    expect(r).toEqual({ id: 'inv1' });
    const data = db.__tx.invoice.create.mock.calls[0][0].data;
    expect(data.number).toBe(5);
    expect(data.subtotalMinor).toBe(100000);
    expect(data.taxMinor).toBe(15000);
    expect(data.totalMinor).toBe(115000);
  });

  it('createInvoice starts numbering at 1 when none exist', async () => {
    db.__tx.invoice.aggregate.mockResolvedValue({ _max: { number: null } });
    db.__tx.invoice.create.mockResolvedValue({ id: 'inv1' });
    await createInvoice({ clientId: 'c1', currency: 'USD', taxRateBps: 0, lines: [{ description: 'x', quantity: 1, unitPriceMinor: 100 }] }, 'a@x.com');
    expect(db.__tx.invoice.create.mock.calls[0][0].data.number).toBe(1);
  });

  it('updateInvoiceDraft throws for a non-DRAFT invoice', async () => {
    // The status is now read INSIDE the transaction (it used to be read before
    // it, so an invoice could be sent between the check and the update).
    db.__tx.invoice.findUnique.mockResolvedValue({ id: 'inv1', status: 'SENT' });
    await expect(
      updateInvoiceDraft('inv1', { clientId: 'c1', currency: 'USD', taxRateBps: 0, lines: [] }, 'a@x.com'),
    ).rejects.toThrow();
    expect(db.__tx.invoice.update).not.toHaveBeenCalled();
  });

  it('sendInvoice moves DRAFT -> SENT with a status-conditional update', async () => {
    db.invoice.findUnique.mockResolvedValue({ id: 'inv1', status: 'DRAFT', number: 5, currency: 'USD', totalMinor: 115000, client: { email: 'c@x.com', name: 'C' } });
    db.__tx.invoice.updateMany.mockResolvedValue({ count: 1 });
    await sendInvoice('inv1', 'admin@x.com');
    // The update must be conditional on status: an unconditional update by id
    // lets two concurrent sends both dispatch an email.
    expect(db.__tx.invoice.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'inv1', status: 'DRAFT' },
        data: expect.objectContaining({ status: 'SENT' }),
      }),
    );
  });

  it('sendInvoice enqueues its notifications in the SAME transaction as the status flip', async () => {
    db.invoice.findUnique.mockResolvedValue({ id: 'inv1', status: 'DRAFT', number: 5, currency: 'USD', totalMinor: 115000, clientId: 'c1', client: { email: 'c@x.com', name: 'C' } });
    db.__tx.invoice.updateMany.mockResolvedValue({ count: 1 });
    await sendInvoice('inv1', 'admin@x.com');

    // Both the email and the push must be durably queued — and enqueued with the
    // TRANSACTION client, so a rollback takes the notifications with it.
    expect(enqueueOutbox).toHaveBeenCalledTimes(2);
    for (const call of (enqueueOutbox as jest.Mock).mock.calls) {
      expect(call[0]).toBe(db.__tx); // the tx client, not the global one
    }
    const keys = (enqueueOutbox as jest.Mock).mock.calls.map((c) => c[1].idempotencyKey);
    // Stable keys derived from the business fact, so a retry cannot double-send.
    expect(keys).toEqual(['invoice.sent:email:inv1', 'invoice.sent:push:inv1']);
  });

  it('sendInvoice refuses a non-DRAFT invoice', async () => {
    db.invoice.findUnique.mockResolvedValue({ id: 'inv1', status: 'PAID', client: { email: 'c@x.com', name: 'C' } });
    await expect(sendInvoice('inv1', 'a@x.com')).rejects.toThrow();
  });

  it('isOverdue only for SENT past due', () => {
    expect(isOverdue({ status: 'SENT', dueDate: new Date(Date.now() - 86400000) })).toBe(true);
    expect(isOverdue({ status: 'SENT', dueDate: new Date(Date.now() + 86400000) })).toBe(false);
    expect(isOverdue({ status: 'PAID', dueDate: new Date(Date.now() - 86400000) })).toBe(false);
    expect(isOverdue({ status: 'SENT', dueDate: null })).toBe(false);
  });

  it('getClientInvoice scopes by clientId + excludes drafts', async () => {
    db.invoice.findFirst.mockResolvedValue(null);
    const r = await getClientInvoice('c1', 'invX');
    expect(r).toBeNull();
    expect(db.invoice.findFirst.mock.calls[0][0].where).toEqual(
      expect.objectContaining({ id: 'invX', clientId: 'c1', status: { not: 'DRAFT' } }),
    );
  });
});

/**
 * Phase 3 Task 3.3 — invoice state machine. PAID/VOID are terminal; voidInvoice
 * previously had NO status guard and would void a settled invoice.
 */
describe('invoice state machine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    db.invoice.updateMany.mockResolvedValue({ count: 1 });
  });

  it('permits only the legal transitions', () => {
    expect(canTransition('DRAFT', 'SENT')).toBe(true);
    expect(canTransition('DRAFT', 'VOID')).toBe(true);
    expect(canTransition('SENT', 'PAID')).toBe(true);
    expect(canTransition('SENT', 'VOID')).toBe(true);
    // Illegal
    expect(canTransition('DRAFT', 'PAID')).toBe(false); // must be sent first
    expect(canTransition('PAID', 'VOID')).toBe(false); // settled: credit-note instead
    expect(canTransition('PAID', 'SENT')).toBe(false);
    expect(canTransition('VOID', 'SENT')).toBe(false); // terminal
    expect(canTransition('SENT', 'SENT')).toBe(false); // no self-transition
  });

  it('refuses to void a PAID invoice (regression: had no guard at all)', async () => {
    db.invoice.findUnique.mockResolvedValue({ status: 'PAID' });
    await expect(voidInvoice('inv1', 'a@x.com')).rejects.toThrow(/Invalid invoice transition/i);
    expect(db.invoice.updateMany).not.toHaveBeenCalled();
  });

  it('refuses to void an already-VOID invoice', async () => {
    db.invoice.findUnique.mockResolvedValue({ status: 'VOID' });
    await expect(voidInvoice('inv1', 'a@x.com')).rejects.toThrow(/Invalid invoice transition/i);
  });

  it('voids a DRAFT invoice conditionally on its current status', async () => {
    db.invoice.findUnique.mockResolvedValue({ status: 'DRAFT' });
    await voidInvoice('inv1', 'a@x.com');
    expect(db.invoice.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'inv1', status: 'DRAFT' }, data: { status: 'VOID' } }),
    );
  });

  it('refuses to mark a DRAFT invoice paid without sending it', async () => {
    db.invoice.findUnique.mockResolvedValue({ id: 'inv1', status: 'DRAFT', client: { email: 'c@x.com', name: 'C' } });
    await expect(markInvoicePaid('inv1', 'ref', 'a@x.com')).rejects.toThrow(/Invalid invoice transition/i);
    expect(db.invoice.updateMany).not.toHaveBeenCalled();
  });
});

/**
 * Duplicate-send protection: the loser of a concurrent transition must not
 * dispatch a second email/push to the client.
 */
describe('concurrent transitions', () => {
  beforeEach(() => jest.clearAllMocks());

  it('a duplicate send loses the race and queues NO second notification', async () => {
    db.invoice.findUnique.mockResolvedValue({ id: 'inv1', status: 'DRAFT', number: 5, currency: 'USD', totalMinor: 1, client: { email: 'c@x.com', name: 'C' } });
    // Someone else already flipped DRAFT -> SENT, so the conditional update
    // affects zero rows.
    db.__tx.invoice.updateMany.mockResolvedValue({ count: 0 });
    await expect(sendInvoice('inv1', 'a@x.com')).rejects.toThrow(/Only draft invoices can be sent/i);
    expect(enqueueOutbox).not.toHaveBeenCalled();
    expect(sendAnnouncement).not.toHaveBeenCalled();
  });

  it('a duplicate mark-paid loses the race and throws', async () => {
    db.invoice.findUnique.mockResolvedValue({ id: 'inv1', status: 'SENT', number: 5, currency: 'USD', totalMinor: 1, client: { email: 'c@x.com', name: 'C' } });
    db.invoice.updateMany.mockResolvedValue({ count: 0 });
    await expect(markInvoicePaid('inv1', 'ref', 'a@x.com')).rejects.toThrow(/Only sent invoices/i);
    expect(sendAnnouncement).not.toHaveBeenCalled();
  });
});

/**
 * Phase 3 Task 3.2 — "An admin cannot create an invoice combining Client A with
 * Client B's project."
 *
 * The invoice builder only filters the project dropdown in the browser, and the
 * server actions are plain POST endpoints, so the relationship must be proven
 * server-side. This matters because sendInvoice() emails and pushes the invoice
 * to the client — a mis-assignment is actively DELIVERED to the wrong tenant.
 */
describe('cross-tenant invoice mixing is rejected', () => {
  beforeEach(() => jest.clearAllMocks());

  it('createInvoice refuses a project that belongs to another client', async () => {
    db.__tx.project.findFirst.mockResolvedValue(null); // no such project FOR THIS CLIENT
    db.__tx.invoice.aggregate.mockResolvedValue({ _max: { number: 4 } });

    await expect(
      createInvoice(
        { clientId: 'clientA', projectId: 'projectOfClientB', currency: 'USD', taxRateBps: 0, lines: [] },
        'admin@x.com',
      ),
    ).rejects.toThrow(/does not belong/i);

    expect(db.__tx.invoice.create).not.toHaveBeenCalled();
  });

  it('proves the relationship inside the same transaction as the write', async () => {
    db.__tx.project.findFirst.mockResolvedValue({ id: 'p1' });
    db.__tx.invoice.aggregate.mockResolvedValue({ _max: { number: 0 } });
    db.__tx.invoice.create.mockResolvedValue({ id: 'inv1' });

    await createInvoice(
      { clientId: 'clientA', projectId: 'p1', currency: 'USD', taxRateBps: 0, lines: [] },
      'admin@x.com',
    );

    // The check must be scoped to BOTH ids — an id-only lookup would pass for
    // any project in the system.
    expect(db.__tx.project.findFirst.mock.calls[0][0].where).toEqual(
      expect.objectContaining({ id: 'p1', clientId: 'clientA' }),
    );
  });

  it('updateInvoiceDraft refuses re-assigning a draft to a foreign project', async () => {
    db.__tx.invoice.findUnique.mockResolvedValue({ id: 'inv1', status: 'DRAFT' });
    db.__tx.project.findFirst.mockResolvedValue(null);

    await expect(
      updateInvoiceDraft(
        'inv1',
        { clientId: 'clientA', projectId: 'projectOfClientB', currency: 'USD', taxRateBps: 0, lines: [] },
        'admin@x.com',
      ),
    ).rejects.toThrow(/does not belong/i);

    expect(db.__tx.invoice.update).not.toHaveBeenCalled();
  });

  it('allows an invoice with no project at all', async () => {
    db.__tx.invoice.aggregate.mockResolvedValue({ _max: { number: 0 } });
    db.__tx.invoice.create.mockResolvedValue({ id: 'inv1' });

    await expect(
      createInvoice({ clientId: 'clientA', currency: 'USD', taxRateBps: 0, lines: [] }, 'admin@x.com'),
    ).resolves.toEqual({ id: 'inv1' });

    // Nothing to prove when no project is paired.
    expect(db.__tx.project.findFirst).not.toHaveBeenCalled();
  });
});
