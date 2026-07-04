import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-safe config for the CLIENT PORTAL auth instance. Fully isolated from the
 * admin instance by construction: distinct basePath, distinct cookie name, and a
 * distinct signing secret (PORTAL_AUTH_SECRET). Contains nothing Node-only.
 * The Prisma-backed Credentials provider is added in `authPortal.ts`.
 */
export default {
  basePath: '/api/user/auth',
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.PORTAL_AUTH_SECRET,
  trustHost: true,
  providers: [],
  cookies: { sessionToken: { name: 'portal.session-token' } },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.clientId = user.id;
        token.email = user.email ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.clientId) session.clientId = String(token.clientId);
      if (token.email && session.user) session.user.email = String(token.email);
      return session;
    },
  },
  pages: { signIn: '/portal/login' },
} satisfies NextAuthConfig;
