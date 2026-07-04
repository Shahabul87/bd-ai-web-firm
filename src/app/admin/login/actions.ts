'use server';

import { signIn, signOut } from '@/auth';

/** Mint the admin session from a redeemed single-use ticket, then land on /admin. */
export async function signInWithTicket(ticket: string): Promise<void> {
  await signIn('ticket', { ticket, redirectTo: '/admin' });
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: '/admin/login' });
}
