jest.mock('../db', () => {
  const tx = { invoice: { aggregate: jest.fn(), create: jest.fn() } };
  return {
    prisma: {
      invoice: { findMany: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
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

import { prisma } from '../db';
import { createInvoice, updateInvoiceDraft, sendInvoice, isOverdue, getClientInvoice } from '../invoices';

const db = prisma as unknown as {
  invoice: { findUnique: jest.Mock; findFirst: jest.Mock; update: jest.Mock };
  __tx: { invoice: { aggregate: jest.Mock; create: jest.Mock } };
};

describe('invoices', () => {
  beforeEach(() => jest.clearAllMocks());

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
    db.invoice.findUnique.mockResolvedValue({ id: 'inv1', status: 'SENT' });
    await expect(
      updateInvoiceDraft('inv1', { clientId: 'c1', currency: 'USD', taxRateBps: 0, lines: [] }, 'a@x.com'),
    ).rejects.toThrow();
  });

  it('sendInvoice moves DRAFT -> SENT', async () => {
    db.invoice.findUnique.mockResolvedValue({ id: 'inv1', status: 'DRAFT', number: 5, currency: 'USD', totalMinor: 115000, client: { email: 'c@x.com', name: 'C' } });
    db.invoice.update.mockResolvedValue({});
    await sendInvoice('inv1', 'admin@x.com');
    expect(db.invoice.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'inv1' }, data: expect.objectContaining({ status: 'SENT' }) }),
    );
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
