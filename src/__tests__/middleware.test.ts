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
   * Stage 1 ships zero Bengali copy: /bn renders English prose in Anek Bangla
   * under lang="bn". So `localeDetection` is false in src/i18n/routing.ts and
   * Accept-Language alone must NOT move anyone. Only the explicit cookie (which
   * the EN/BN toggle sets) may.
   *
   * RE-INVERT THIS TEST in the Stage 3 commit that lands messages/bn.json: once
   * real Bengali copy exists, detection is turned back on and a
   * Bengali-preferring visitor SHOULD be redirected to /bn. Until then this
   * assertion is the guard that fails if someone re-enables detection early.
   */
  it('does NOT auto-redirect a Bengali-preferring visitor while /bn still serves English', async () => {
    const res = await middleware(request('/', { acceptLanguage: 'bn-BD,bn;q=0.9,en;q=0.8' }));

    // No redirect at all: the visitor stays on the unprefixed English URL.
    expect(res.headers.get('location')).toBeNull();

    // ...and is actually served English, not just left un-redirected.
    expect(res.headers.get('x-middleware-request-x-next-intl-locale')).toBe('en');
    const rewrite = res.headers.get('x-middleware-rewrite');
    expect(new URL(rewrite as string).pathname).toBe('/en');
  });

  it('leaves an English-preferring visitor unprefixed', async () => {
    const res = await middleware(request('/', { acceptLanguage: 'en-US,en;q=0.9' }));
    expect(res.headers.get('location')).toBeNull();
  });

  /**
   * KNOWN, ACCEPTED CONSEQUENCE of localeDetection:false — pinned so it is a
   * decision on the record, not a surprise.
   *
   * next-intl's localeDetection flag gates the NEXT_LOCALE cookie and the
   * accept-language header TOGETHER (node_modules/next-intl/dist/esm/development/
   * middleware/resolveLocale.js:51 and :56 — cookie is Prio 2, header is Prio 3,
   * both behind `if (!locale && routing.localeDetection)`). There is no config
   * that disables only the header. So turning off the auto-redirect also means a
   * returning visitor holding NEXT_LOCALE=bn who types the bare `/` is served
   * English at `/` instead of being forwarded to /bn.
   *
   * Why that is acceptable for Stage 1 specifically: /bn renders the SAME
   * English copy, so this costs zero words of user-visible content — it differs
   * only in font and lang attribute. It is not acceptable once Bengali copy
   * exists, which is exactly when the flag comes back.
   *
   * RE-INVERT IN STAGE 3: deleting `localeDetection: false` restores cookie
   * precedence, and this assertion must flip back to expecting /bn.
   */
  it('does not forward a NEXT_LOCALE=bn cookie holder from / while /bn is still English', async () => {
    const res = await middleware(request('/', { cookie: 'bn' }));
    expect(res.headers.get('location')).toBeNull();
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
