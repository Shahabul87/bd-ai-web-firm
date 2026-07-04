import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import authConfig from './auth.config';
import { prisma } from '@/app/lib/db';
import { redeemTicket } from '@/app/lib/authTicket';
import { isAdminEmail } from '@/app/lib/adminAuth';

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
        const email = await redeemTicket(ticket);
        if (!email || !isAdminEmail(email)) return null;
        const user = await prisma.user.upsert({
          where: { email },
          update: {},
          create: { email, role: 'ADMIN' },
          select: { id: true, email: true },
        });
        return { id: user.id, email: user.email };
      },
    }),
  ],
});
