import { SITE_URL } from '@/app/lib/siteUrl';

interface ArticleJsonLdProps {
  headline: string;
  description: string;
  /** UNPREFIXED path, e.g. /resources/blog/my-post (the /bn prefix is added here). */
  urlPath: string;
  /** Rendering locale — makes the URL and inLanguage locale-correct. */
  locale: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
  type?: 'BlogPosting' | 'Article';
}

/** schema.org inLanguage BCP-47 tag for a rendered locale. */
function inLanguage(locale: string): string {
  return locale === 'bn' ? 'bn-BD' : 'en-US';
}

/**
 * Server-rendered Article/BlogPosting JSON-LD for editorial [slug] pages.
 * Emitted in the initial HTML (not a client component) so crawlers reliably
 * pick it up for article rich results.
 *
 * Locale-aware: a Bengali page's structured data must point at the /bn URL and
 * declare inLanguage=bn-BD, or it claims to be the English page.
 */
export default function ArticleJsonLd({
  headline,
  description,
  urlPath,
  locale,
  datePublished,
  dateModified,
  author = 'CraftsAI',
  type = 'Article',
}: ArticleJsonLdProps) {
  const localePrefix = locale === 'bn' ? '/bn' : '';
  const url = `${SITE_URL}${localePrefix}${urlPath}`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': type,
    headline,
    description,
    inLanguage: inLanguage(locale),
    image: `${SITE_URL}/opengraph-image`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    ...(datePublished ? { datePublished } : {}),
    // Fall back to datePublished so the field is always present and consistent.
    ...(dateModified || datePublished ? { dateModified: dateModified ?? datePublished } : {}),
    author: { '@type': 'Organization', name: author, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'CraftsAI',
      '@id': `${SITE_URL}/#organization`,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icon-512.png`,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
