/**
 * @jest-environment node
 *
 * Phase 3 Task 3.2 — the portal's ONLY write path had no negative-authz test.
 * Client A must not be able to post a message onto Client B's project by
 * passing B's projectId to the server action (server actions are plain POST
 * endpoints — the UI never offering the id is not a control).
 */
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
jest.mock('@/app/lib/portalSession', () => ({ getPortalClient: jest.fn() }));
jest.mock('@/app/lib/portal', () => ({ getClientProject: jest.fn() }));
jest.mock('@/app/lib/messages', () => ({ addMessage: jest.fn().mockResolvedValue(undefined) }));
jest.mock('@/app/lib/notify', () => ({
  sendAnnouncement: jest.fn().mockResolvedValue({ ok: true }),
  sendPush: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/app/lib/email', () => ({ CONTACT_EMAIL: 'owner@craftsai.org' }));

import { getPortalClient } from '@/app/lib/portalSession';
import { getClientProject } from '@/app/lib/portal';
import { addMessage } from '@/app/lib/messages';
import { sendClientMessage } from '../actions';

const session = getPortalClient as jest.Mock;
const scopedProject = getClientProject as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  session.mockResolvedValue({ clientId: 'clientA', email: 'a@x.com', name: 'Client A' });
});

describe('sendClientMessage', () => {
  it('rejects an unauthenticated caller', async () => {
    session.mockResolvedValue(null);
    await expect(sendClientMessage('p1', 'hello there')).rejects.toThrow(/unauthorized/i);
    expect(addMessage).not.toHaveBeenCalled();
  });

  it("refuses to post onto ANOTHER client's project", async () => {
    // getClientProject is scoped to the caller, so a foreign id resolves to null.
    scopedProject.mockResolvedValue(null);
    await expect(sendClientMessage('projectOfClientB', 'hello there')).rejects.toThrow(/not found/i);
    expect(addMessage).not.toHaveBeenCalled();
  });

  it('scopes the ownership check to the CALLER, not just the project id', async () => {
    scopedProject.mockResolvedValue(null);
    await expect(sendClientMessage('p1', 'hello there')).rejects.toThrow();
    expect(scopedProject).toHaveBeenCalledWith('clientA', 'p1');
  });

  it('posts on the caller-owned project', async () => {
    scopedProject.mockResolvedValue({ id: 'p1', title: 'Site build' });
    await sendClientMessage('p1', '  hello there  ');
    expect(addMessage).toHaveBeenCalledWith('p1', 'CLIENT', 'a@x.com', 'hello there');
  });

  it('rejects an empty body before touching the database', async () => {
    await expect(sendClientMessage('p1', '   ')).rejects.toThrow(/empty/i);
    expect(addMessage).not.toHaveBeenCalled();
  });
});
