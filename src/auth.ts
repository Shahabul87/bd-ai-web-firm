import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/app/lib/db';
import { redeemTicket } from '@/app/lib/authTicket';
import { isAdminEmail } from '@/app/lib/adminAuth';

/**
 * Admin auth. Namespaced under /api/admin/auth, completely separate from any
 * future client auth. The Credentials provider trusts ONLY a freshly-redeemed
 * single-use AuthTicket (minted after all login factors passed). Auth.js v5
 * requires JWT sessions with Credentials; we carry the email in the token and
 * re-check the allowlist server-side on every request (see getAdmin()).
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  basePath: '/api/admin/auth',
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  trustHost: true,
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
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) token.email = user.email;
      return token;
    },
    async session({ session, token }) {
      if (token.email && session.user) session.user.email = String(token.email);
      return session;
    },
  },
  pages: { signIn: '/admin/login' },
});
