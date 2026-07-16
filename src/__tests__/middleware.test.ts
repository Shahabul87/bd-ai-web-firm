/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import middleware, { config } from '@/middleware';

function request(path: string, opts: { acceptLanguage?: string; cookie?: string } = {}) {
  const headers = new Headers();
  if (opts.acceptLanguage) headers.set('accept-language', opts.acceptLanguage);
  if (opts.cookie) headers.set('cookie', `NEXT_LOCALE=${opts.cookie}`);
  return new NextRequest(new URL(`https://www.craftsai.org${path}`), { headers });
}

describe('locale negotiation', () => {
  /**
   * Re-inverted in Stage 3b: /bn now ships real Bengali across every namespace,
   * so `localeDetection` is TRUE in src/i18n/routing.ts and a Bengali-preferring
   * visitor with no cookie IS auto-redirected from the bare `/` to `/bn`. (Stages
   * 1-3a suppressed this while /bn was partly English.) This assertion is now the
   * guard that fails if someone turns detection back OFF.
   */
  it('auto-redirects a Bengali-preferring visitor to /bn', async () => {
    const res = await middleware(request('/', { acceptLanguage: 'bn-BD,bn;q=0.9,en;q=0.8' }));

    // 307 redirect to the /bn-prefixed URL (next-intl detection + as-needed prefix).
    expect(new URL(res.headers.get('location') as string).pathname).toBe('/bn');
  });

  it('leaves an English-preferring visitor unprefixed', async () => {
    const res = await middleware(request('/', { acceptLanguage: 'en-US,en;q=0.9' }));
    expect(res.headers.get('location')).toBeNull();
  });

  /**
   * Re-inverted in Stage 3b: with `localeDetection` true, next-intl's resolveLocale
   * restores cookie precedence (cookie is Prio 2, header Prio 3, both behind the
   * `localeDetection` guard). So a returning visitor holding NEXT_LOCALE=bn who
   * types the bare `/` is now forwarded to /bn. (Stages 1-3a suppressed this as an
   * accepted cost while /bn was English.)
   */
  it('forwards a NEXT_LOCALE=bn cookie holder from / to /bn', async () => {
    const res = await middleware(request('/', { cookie: 'bn' }));
    expect(new URL(res.headers.get('location') as string).pathname).toBe('/bn');
  });

  /**
   * The toggle itself must not regress. LocaleToggle renders a real
   * <Link href={pathname} locale="bn">, i.e. a direct navigation to the
   * /bn-prefixed URL. That resolves via Prio 1 (route prefix), which is NOT
   * gated by localeDetection — so the BN button still works, and next-intl still
   * persists the choice (syncCookie.js gates on `localeCookie`, not
   * `localeDetection`). This asserts both halves of that contract.
   */
  it('serves bn AND persists NEXT_LOCALE=bn when the toggle lands on /bn/services', async () => {
    const res = await middleware(request('/bn/services', { acceptLanguage: 'en-US,en;q=0.9' }));
    expect(res.headers.get('x-middleware-request-x-next-intl-locale')).toBe('bn');
    // Asserted via the raw Set-Cookie header: our middleware is typed as
    // returning the standard `Response`, which has no NextResponse `.cookies`.
    expect(res.headers.get('set-cookie')).toContain('NEXT_LOCALE=bn');
  });
});

/**
 * `alternateLinks` is false in src/i18n/routing.ts, so next-intl must not ship a
 * Link: header advertising hreflang="bn" -> /bn/... while /bn still serves
 * English copy under an English canonical. Re-enable alongside per-locale
 * canonicals in the SEO stage, not before.
 */
describe('hreflang is not advertised to crawlers in Stage 1', () => {
  it.each(['/', '/services', '/about'])('sends no Link: hreflang header for %s', async (path) => {
    const res = await middleware(request(path, { acceptLanguage: 'en-US,en;q=0.9' }));
    expect(res.headers.get('link')).toBeNull();
  });
});

/**
 * The load-bearing assertion of this task. With localePrefix 'as-needed' the
 * unprefixed English URL only exists because middleware rewrites it onto the
 * [locale] segment internally. If this fails, the English site is 404ing.
 */
describe('English site is served at the unprefixed URL (the 404 regression guard)', () => {
  it.each(['/', '/services', '/about', '/contact', '/portfolio'])(
    'rewrites %s to the /en tree without redirecting',
    async (path) => {
      const res = await middleware(request(path, { acceptLanguage: 'en-US,en;q=0.9' }));

      // No redirect: the browser URL must stay unprefixed.
      expect(res.headers.get('location')).toBeNull();

      // Internally rewritten onto the [locale] segment.
      const rewrite = res.headers.get('x-middleware-rewrite');
      expect(rewrite).not.toBeNull();
      expect(new URL(rewrite as string).pathname).toBe(path === '/' ? '/en' : `/en${path}`);

      // ...and served as English.
      expect(res.headers.get('x-middleware-request-x-next-intl-locale')).toBe('en');
    }
  );

  // /bn/services needs no rewrite: the browser URL already matches the
  // filesystem route, so next-intl passes it straight through (x-middleware-next)
  // and reports the negotiated locale on the request headers instead.
  it('serves the Bengali tree at the /bn-prefixed URL without redirecting', async () => {
    const res = await middleware(request('/bn/services', { acceptLanguage: 'bn-BD,bn;q=0.9' }));
    expect(res.headers.get('location')).toBeNull();
    expect(res.headers.get('x-middleware-request-x-next-intl-locale')).toBe('bn');
  });
});

describe('routes that must never be localized', () => {
  it.each(['/api/contact', '/api/quote'])('passes %s through untouched', async (path) => {
    const res = await middleware(request(path, { acceptLanguage: 'bn-BD,bn;q=0.9' }));
    expect(res.headers.get('location')).toBeNull();
    expect(res.headers.get('x-middleware-rewrite')).toBeNull();
  });

  it('never sends a Bengali-preferring visitor to /bn/portal', async () => {
    const res = await middleware(request('/portal', { acceptLanguage: 'bn-BD,bn;q=0.9' }));
    expect(res.headers.get('location') ?? '').not.toContain('/bn');
    expect(res.headers.get('x-middleware-rewrite')).toBeNull();
  });
});

describe('admin auth gate (must not regress)', () => {
  it('redirects an unauthenticated admin page to /admin/login', async () => {
    const res = await middleware(request('/admin'));
    expect(res.headers.get('location')).toContain('/admin/login');
  });

  it('does not redirect /admin/login itself', async () => {
    const res = await middleware(request('/admin/login'));
    expect(res.headers.get('location')).toBeNull();
  });

  it('returns JSON 401 for an unauthenticated admin API', async () => {
    const res = await middleware(request('/api/admin/leads'));
    expect(res.status).toBe(401);
  });

  it('lets the admin auth endpoints through so login can work', async () => {
    const res = await middleware(request('/api/admin/auth/session'));
    expect(res.status).not.toBe(401);
    expect(res.headers.get('location')).toBeNull();
  });

  it('never locale-prefixes an admin route', async () => {
    const res = await middleware(request('/admin', { acceptLanguage: 'bn-BD,bn;q=0.9' }));
    expect(res.headers.get('location') ?? '').not.toContain('/bn');
  });
});

/**
 * Dotted admin paths are real: admin/leads/[id], clients/[id], invoices/[id] and
 * projects/[id] all take ids that may contain a dot. The i18n matcher excludes
 * anything matching `.*\..*` (so /sitemap.xml stays root-served), which would
 * drop the admin gate for those ids — hence the extra admin matcher entries.
 *
 * These cases assert the DISPATCHER gates dotted paths correctly. They cannot,
 * on their own, prove middleware is *invoked* for them: calling middleware()
 * directly bypasses the matcher entirely. The matcher itself is guarded by the
 * describe block below, and proven end-to-end against the compiled regex in
 * .next/server/middleware-manifest.json (see task-5-report.md).
 */
describe('admin gate survives dotted path segments (defense in depth)', () => {
  it.each(['/admin/leads/abc.def', '/admin/clients/some.id', '/admin/invoices/v1.2'])(
    'redirects unauthenticated %s to /admin/login',
    async (path) => {
      const res = await middleware(request(path));
      expect(res.headers.get('location')).toContain('/admin/login');
    }
  );

  it.each(['/api/admin/leads/v1.2', '/api/admin/clients/a.b'])(
    'returns JSON 401 for unauthenticated %s',
    async (path) => {
      const res = await middleware(request(path));
      expect(res.status).toBe(401);
    }
  );

  it('does not locale-prefix a dotted admin path', async () => {
    const res = await middleware(
      request('/admin/leads/abc.def', { acceptLanguage: 'bn-BD,bn;q=0.9' })
    );
    expect(res.headers.get('location') ?? '').not.toContain('/bn');
  });
});

/**
 * The i18n matcher alone cannot carry the admin gate, because its `.*\..*`
 * exclusion (which correctly keeps /sitemap.xml and /rss.xml root-served) also
 * swallows dotted admin paths. The original pre-i18n matcher was
 * ['/admin/:path*', '/api/admin/:path*']; both must survive verbatim.
 */
describe('middleware matcher config', () => {
  it('keeps the original admin matcher entries alongside the i18n one', () => {
    expect(config.matcher).toEqual(
      expect.arrayContaining(['/admin/:path*', '/api/admin/:path*'])
    );
  });

  it('still matches every marketing route via the i18n entry', () => {
    expect(config.matcher).toContain('/((?!_next|_vercel|.*\\..*).*)');
  });
});
