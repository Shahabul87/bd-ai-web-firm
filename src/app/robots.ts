import { MetadataRoute } from 'next';
import { SITE_URL } from '@/app/lib/siteUrl';

/**
 * Dynamic robots (Phase 7 Task 7.1), replacing the static public/robots.txt.
 *
 * Two fixes over the old static file:
 *
 * 1. Canonical origin. The static file hardcoded https://www.craftsai.org in its
 *    Sitemap and Host lines, so a staging deploy pointed crawlers at production.
 *    Both now derive from SITE_URL (lib/siteUrl.ts).
 *
 * 2. Do NOT block /_next/. The old file disallowed /_next/static/ and then tried
 *    to re-allow only css/js/media — but Next's JS chunks live under
 *    /_next/static/chunks/, which was NOT re-allowed. Google renders a page to
 *    index it and needs that JS/CSS; blocking it degrades indexing. Only genuinely
 *    private paths are disallowed now.
 *
 * /portal/ is added to the disallow list (the plan calls for it explicitly, in
 * addition to the page-level noindex the portal layout already sets).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/', // no crawlable API surface
        '/admin/', // internal
        '/admin', // and the bare route
        '/portal/', // client portal — private, per-tenant
        '/portal',
        '/private/',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
