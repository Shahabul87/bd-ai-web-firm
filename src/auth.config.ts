import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-safe Auth.js config shared by the middleware and the full server auth.
 * Contains NOTHING that imports Prisma or other Node-only modules, so it can
 * run in the Edge middleware to verify the JWT session. The real (Prisma-backed)
 * Credentials provider is added in `auth.ts`.
 */
export default {
  basePath: '/api/admin/auth',
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  trustHost: true,
  providers: [],
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
} satisfies NextAuthConfig;
