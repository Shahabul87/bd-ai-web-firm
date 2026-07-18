'use server';

import { cookies } from 'next/headers';
import { signIn, signOut, authPortal } from '@/authPortal';
import { trustRevoke } from '@/app/lib/notify';
import { writeAudit } from '@/app/lib/audit';

/** Mint the portal session from a redeemed 'portal'-scoped ticket, land on /portal. */
export async function signInPortal(ticket: string): Promise<void> {
  await signIn('ticket', { ticket, redirectTo: '/portal' });
}

/**
 * Full portal logout. As with admin, Auth.js signOut() clears only the portal
 * JWT cookie, leaving the 30-day trusted-device cookie able to fast-path the
 * next login past the OTP. This action also revokes the trust token server-side
 * (best effort) and clears the custom trust + challenge cookies, so after logout
 * the known portal email must request a fresh OTP.
 */
export async function signOutPortal(): Promise<void> {
  const jar = await cookies();
  const trust = jar.get('portal_trust')?.value;
  const session = await authPortal();
  const actorEmail = session?.user?.email ?? undefined;

  if (trust && actorEmail) {
    await trustRevoke(actorEmail, trust);
    await writeAudit('portal.logout.trust_revoked', { actorEmail });
  }

  jar.delete('portal_trust');
  jar.delete('portal_chal');
  await writeAudit('portal.logout', { actorEmail });

  await signOut({ redirectTo: '/portal/login' });
}
