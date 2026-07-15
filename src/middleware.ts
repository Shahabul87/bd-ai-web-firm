import NextAuth from 'next-auth';
import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import authConfig from '@/auth.config';
import { routing } from '@/i18n/routing';

// Edge-safe auth instance (JWT verification only, no Prisma) for gating routes.
const { auth } = NextAuth(authConfig);
const handleI18nRouting = createMiddleware(routing);

/** Admin gate — behaviour preserved verbatim from the pre-i18n middleware. */
const handleAdminAuth = auth((req) => {
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

/**
 * `auth()` resolves to NextAuth's route-handler overload, so its returned
 * handler wants a second context argument. next-auth forwards that argument
 * verbatim to the wrapped gate (lib/index.js: `userMiddlewareOrRoute(req, args[1])`)
 * and never reads it itself, and the gate above ignores it — so an empty,
 * correctly-typed context is inert rather than a cast.
 */
const inertRouteContext = { params: Promise.resolve({}) };

export default async function middleware(req: NextRequest): Promise<Response> {
  const { pathname } = req.nextUrl;

  // 1. Admin: auth gate only. Never locale-negotiated.
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    // next-auth types the result as `void | Response`, but handleAuth always
    // builds a Response; mirror its own `?? NextResponse.next()` fallback.
    return (await handleAdminAuth(req, inertRouteContext)) ?? NextResponse.next();
  }

  // 2. Portal and all other APIs: neither gated here nor localized.
  if (pathname.startsWith('/portal') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // 3. Everything else is marketing → locale routing.
  return handleI18nRouting(req);
}

export const config = {
  matcher: [
    // Marketing/i18n: skip Next internals and any path with a file extension
    // (static assets, and /sitemap.xml + /rss.xml, which stay root-served).
    // Deliberately broad: locale negotiation must see every marketing route.
    '/((?!_next|_vercel|.*\\..*).*)',
    // The `.*\..*` exclusion above also swallows admin paths whose dynamic id
    // contains a dot (admin/leads/[id], clients/[id], invoices/[id],
    // projects/[id]), which would silently drop the auth gate for them. These
    // two entries are the original pre-i18n matcher, kept verbatim so the gate
    // covers exactly what it covered before.
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
