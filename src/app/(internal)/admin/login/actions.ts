'use server';

import { cookies } from 'next/headers';
import { signIn, signOut, auth } from '@/auth';
import { trustRevoke } from '@/app/lib/notify';
import { writeAudit } from '@/app/lib/audit';

/** Mint the admin session from a redeemed single-use ticket, then land on /admin. */
export async function signInWithTicket(ticket: string): Promise<void> {
  await signIn('ticket', { ticket, redirectTo: '/admin' });
}

/**
 * Full admin logout. Auth.js signOut() only clears the JWT session cookie, so
 * on its own it leaves the trusted-device cookie valid for its full 30-day TTL
 * (a logged-out device could then skip MFA). This action also revokes the
 * trusted-device token server-side (best effort) and clears the custom trust +
 * challenge cookies so the next login requires the full factor sequence.
 */
export async function signOutAction(): Promise<void> {
  const jar = await cookies();
  const trust = jar.get('adm_trust')?.value;
  const session = await auth();
  const actorEmail = session?.user?.email ?? undefined;

  if (trust && actorEmail) {
    await trustRevoke(actorEmail, trust);
    await writeAudit('admin.logout.trust_revoked', { actorEmail });
  }

  jar.delete('adm_trust');
  jar.delete('adm_chal');
  await writeAudit('admin.logout', { actorEmail });

  await signOut({ redirectTo: '/admin/login' });
}
