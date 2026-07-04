import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import authConfig from '@/auth.config';

// Edge-safe auth instance (JWT verification only, no Prisma) for gating routes.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isAdminPage = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login');
  const isAdminApi =
    pathname.startsWith('/api/admin') &&
    !pathname.startsWith('/api/admin/auth') &&
    !pathname.startsWith('/api/admin/login');

  if (!isAdminPage && !isAdminApi) return NextResponse.next();
  if (req.auth?.user?.email) return NextResponse.next();

  if (isAdminApi) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = '/admin/login';
  return NextResponse.redirect(url);
});

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };
