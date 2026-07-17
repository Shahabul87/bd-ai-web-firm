/**
 * Phase 7 Task 7.1 — Article JSON-LD must be locale-aware. A Bengali page's
 * structured data pointing at the English URL (or omitting inLanguage) tells
 * Google the /bn page IS the English page.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import ArticleJsonLd from '../ArticleJsonLd';

jest.mock('@/app/lib/siteUrl', () => ({ SITE_URL: 'https://example.test' }));

function parse(el: React.ReactElement): Record<string, unknown> {
  const html = renderToStaticMarkup(el);
  const json = html.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');
  return JSON.parse(json);
}

const base = {
  headline: 'A post',
  description: 'about things',
  urlPath: '/resources/blog/a-post',
  datePublished: '2026-03-01',
};

describe('ArticleJsonLd', () => {
  it('uses the ENGLISH url + inLanguage on the en page', () => {
    const s = parse(<ArticleJsonLd {...base} locale="en" />);
    expect(s.url).toBe('https://example.test/resources/blog/a-post');
    expect(s.inLanguage).toBe('en-US');
    expect((s.mainEntityOfPage as { '@id': string })['@id']).toBe(
      'https://example.test/resources/blog/a-post',
    );
  });

  it('uses the /bn url + bn-BD inLanguage on the bn page', () => {
    const s = parse(<ArticleJsonLd {...base} locale="bn" />);
    expect(s.url).toBe('https://example.test/bn/resources/blog/a-post');
    expect(s.inLanguage).toBe('bn-BD');
  });

  it('always includes dateModified, defaulting to datePublished', () => {
    const s = parse(<ArticleJsonLd {...base} locale="en" />);
    expect(s.datePublished).toBe('2026-03-01');
    expect(s.dateModified).toBe('2026-03-01');
  });

  it('is emitted as a server-rendered ld+json script (not a client component)', () => {
    const html = renderToStaticMarkup(<ArticleJsonLd {...base} locale="en" />);
    expect(html).toMatch(/^<script type="application\/ld\+json">/);
  });
});
