import type { Metadata } from 'next';
import { SITE_URL } from './siteUrl';

// One canonical origin. This was hardcoded to the production URL, so canonical
// tags, hreflang alternates, and og:url on EVERY page pointed at production even
// on staging (or a local production build).
const BASE = SITE_URL;

/**
 * Per-locale canonical + hreflang alternates for a page at the given UNPREFIXED
 * path (e.g. '/about', or '/' / '' for the home page). English is served
 * unprefixed (`/about`); Bengali is served under `/bn` (`/bn/about`).
 *
 * Each page canonicals to ITSELF — the English page to the English URL, the
 * Bengali page to the Bengali URL — so Google indexes both versions. The
 * `languages` map (emitted as `<link rel="alternate" hreflang="…">`) is the
 * same regardless of which locale is rendering, with `x-default` pointing at
 * the English URL.
 */
export function localeAlternates(
  path: string,
  locale: string,
): NonNullable<Metadata['alternates']> {
  const clean = path === '/' ? '' : path;
  const en = `${BASE}${clean}`;
  const bn = `${BASE}/bn${clean}`;
  return {
    canonical: locale === 'bn' ? bn : en,
    languages: { en, bn, 'x-default': en },
  };
}

/**
 * Per-locale OpenGraph `locale` + `url` for a page at the given UNPREFIXED path.
 * Merge these into a page's existing `openGraph` object so `og:locale` and
 * `og:url` reflect the rendering locale (English → en_US / unprefixed URL,
 * Bengali → bn_BD / `/bn` URL).
 */
export function localeOpenGraph(
  path: string,
  locale: string,
): { locale: string; url: string } {
  const clean = path === '/' ? '' : path;
  return {
    locale: locale === 'bn' ? 'bn_BD' : 'en_US',
    url: locale === 'bn' ? `${BASE}/bn${clean}` : `${BASE}${clean}`,
  };
}
