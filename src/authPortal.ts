import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import authPortalConfig from './authPortal.config';
import { redeemTicket } from '@/app/lib/authTicket';
import { resolvePortalClient } from '@/app/lib/portalIdentity';

/**
 * Client-portal auth (Node runtime), separate from admin. Trusts ONLY a freshly
 * redeemed 'portal'-scoped ticket; the identity is an ACTIVE, portalEnabled
 * Client resolved by email. Session is JWT in the `portal.session-token` cookie.
 */
export const { handlers, signIn, signOut, auth: authPortal } = NextAuth({
  ...authPortalConfig,
  providers: [
    Credentials({
      id: 'ticket',
      name: 'ticket',
      credentials: { ticket: {} },
      async authorize(creds) {
        const ticket = typeof creds?.ticket === 'string' ? creds.ticket : '';
        if (!ticket) return null;
        const redeemed = await redeemTicket(ticket, 'portal');
        if (!redeemed) return null;
        // Fails closed if the email does not resolve to exactly ONE active,
        // portal-enabled client — never guesses a tenant.
        const client = await resolvePortalClient(redeemed);
        if (!client) return null;
        return { id: client.id, email: client.email };
      },
    }),
  ],
});
