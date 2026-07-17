import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import authConfig from './auth.config';
import { redeemTicket } from '@/app/lib/authTicket';
import { isAdminEmail } from '@/app/lib/adminAuth';
import { normalizeEmail } from '@/app/lib/normalizeEmail';
import { findOrCreateAdminUser } from '@/app/lib/adminIdentity';

/**
 * Full server-side admin auth (Node runtime). The Credentials provider trusts
 * ONLY a freshly-redeemed single-use AuthTicket minted after all login factors
 * passed. Session is JWT (Auth.js Credentials cannot use DB sessions); the
 * allowlist is re-checked server-side on every request via getAdmin().
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      id: 'ticket',
      name: 'ticket',
      credentials: { ticket: {} },
      async authorize(creds) {
        const ticket = typeof creds?.ticket === 'string' ? creds.ticket : '';
        if (!ticket) return null;
        const redeemed = await redeemTicket(ticket);
        if (!redeemed) return null;
        const email = normalizeEmail(redeemed);
        if (!isAdminEmail(email)) return null;
        // Resolves on normalizedEmail, so a pre-existing mixed-case row is
        // found rather than duplicated with a fresh MFA state.
        const user = await findOrCreateAdminUser(email);
        if (!user) return null;
        return { id: user.id, email: user.email };
      },
    }),
  ],
});
