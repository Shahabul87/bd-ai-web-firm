'use server';

import { signIn, signOut } from '@/authPortal';

/** Mint the portal session from a redeemed 'portal'-scoped ticket, land on /portal. */
export async function signInPortal(ticket: string): Promise<void> {
  await signIn('ticket', { ticket, redirectTo: '/portal' });
}

export async function signOutPortal(): Promise<void> {
  await signOut({ redirectTo: '/portal/login' });
}
