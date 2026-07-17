/**
 * The ONE canonical application URL (Phase 5 Task 5.2).
 *
 * `https://www.craftsai.org` was hardcoded in email.ts, sitemap.ts, rss.xml,
 * ArticleJsonLd and StructuredData. Every one of those is environment-dependent:
 * a staging deploy emailed production links, canonical/JSON-LD URLs claimed the
 * production origin, and a local production run put craftsai.org links into
 * captured test mail. Resolving it in one place makes the deployed environment
 * describe itself honestly.
 *
 * NEXT_PUBLIC_ so the same value is available to client components (JSON-LD)
 * and is inlined at build time — sitemap/RSS/structured data are generated then.
 * The trailing slash is stripped so callers can safely template `${SITE_URL}/x`.
 */
const FALLBACK = 'https://www.craftsai.org';

function resolve(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return FALLBACK;
  try {
    // Reject a malformed value rather than emitting broken links everywhere.
    const u = new URL(raw);
    return u.origin;
  } catch {
    return FALLBACK;
  }
}

export const SITE_URL = resolve();
