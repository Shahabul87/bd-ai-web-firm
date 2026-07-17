/**
 * @jest-environment node
 *
 * Phase 7 Task 7.1 — sitemap + robots correctness.
 */
jest.mock('@/app/lib/siteUrl', () => ({ SITE_URL: 'https://example.test' }));
jest.mock('#content', () => ({
  blogs: [{ slug: 'b1', date: '2026-03-01' }],
  caseStudies: [{ slug: 'c1', date: '2026-02-01' }],
  guides: [{ slug: 'g1', date: '2026-01-01' }],
  products: [{ slug: 'p1' }],
}));

import sitemap from '../sitemap';
import robots from '../robots';

describe('sitemap lastModified', () => {
  const entries = sitemap();

  it('never stamps a build-time date on static pages', () => {
    // The bug: every entry used new Date() at build, so every page claimed to
    // change on every deploy. Static pages must carry NO lastModified.
    const home = entries.find((e) => e.url === 'https://example.test');
    expect(home).toBeDefined();
    expect(home!.lastModified).toBeUndefined();

    const services = entries.find((e) => e.url === 'https://example.test/services');
    expect(services!.lastModified).toBeUndefined();
  });

  it('advertises the REAL source date only for content pages', () => {
    const blog = entries.find((e) => e.url.endsWith('/resources/blog/b1'));
    expect(blog!.lastModified).toBe('2026-03-01');
    const cs = entries.find((e) => e.url.endsWith('/resources/case-studies/c1'));
    expect(cs!.lastModified).toBe('2026-02-01');
  });

  it('only content pages have a lastModified at all', () => {
    const withDate = entries.filter((e) => e.lastModified !== undefined);
    // exactly the 3 mocked content items (1 blog + 1 case study + 1 guide)
    expect(withDate).toHaveLength(3);
  });

  it('derives every URL from the canonical origin', () => {
    for (const e of entries) expect(e.url.startsWith('https://example.test')).toBe(true);
  });

  it('carries en/bn hreflang alternates', () => {
    const home = entries.find((e) => e.url === 'https://example.test');
    expect(home!.alternates?.languages).toEqual({
      en: 'https://example.test',
      bn: 'https://example.test/bn',
    });
  });
});

describe('robots', () => {
  const r = robots();
  const rules = Array.isArray(r.rules) ? r.rules[0] : r.rules!;
  const disallow = ([] as string[]).concat(rules.disallow ?? []);

  it('excludes the private surfaces including /portal/', () => {
    expect(disallow).toEqual(expect.arrayContaining(['/api/', '/admin/', '/portal/', '/private/']));
  });

  it('does NOT block Next.js assets (Google needs them to render)', () => {
    expect(disallow.some((d) => d.includes('_next'))).toBe(false);
  });

  it('points sitemap + host at the canonical origin', () => {
    expect(r.sitemap).toBe('https://example.test/sitemap.xml');
    expect(r.host).toBe('https://example.test');
  });
});
