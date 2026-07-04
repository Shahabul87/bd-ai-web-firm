import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import authPortalConfig from './authPortal.config';
import { prisma } from '@/app/lib/db';
import { redeemTicket } from '@/app/lib/authTicket';

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
        const email = await redeemTicket(ticket, 'portal');
        if (!email) return null;
        const client = await prisma.client.findFirst({
          where: { email, status: 'ACTIVE', portalEnabled: true },
          orderBy: { createdAt: 'asc' },
          select: { id: true, email: true },
        });
        if (!client) return null;
        return { id: client.id, email: client.email };
      },
    }),
  ],
});
