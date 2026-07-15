/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import middleware from '@/middleware';

function request(path: string, opts: { acceptLanguage?: string; cookie?: string } = {}) {
  const headers = new Headers();
  if (opts.acceptLanguage) headers.set('accept-language', opts.acceptLanguage);
  if (opts.cookie) headers.set('cookie', `NEXT_LOCALE=${opts.cookie}`);
  return new NextRequest(new URL(`https://www.craftsai.org${path}`), { headers });
}

describe('locale negotiation', () => {
  it('sends a Bengali-preferring visitor to /bn', async () => {
    const res = await middleware(request('/', { acceptLanguage: 'bn-BD,bn;q=0.9,en;q=0.8' }));
    expect(res.headers.get('location')).toContain('/bn');
  });

  it('leaves an English-preferring visitor unprefixed', async () => {
    const res = await middleware(request('/', { acceptLanguage: 'en-US,en;q=0.9' }));
    expect(res.headers.get('location')).toBeNull();
  });

  it('lets the cookie beat the Accept-Language header', async () => {
    const res = await middleware(request('/', { acceptLanguage: 'bn-BD,bn;q=0.9', cookie: 'en' }));
    expect(res.headers.get('location')).toBeNull();
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
