import { SITE_URL } from '@/app/lib/siteUrl';

interface ArticleJsonLdProps {
  headline: string;
  description: string;
  /** Absolute path, e.g. /resources/blog/my-post */
  urlPath: string;
  datePublished?: string;
  author?: string;
  type?: 'BlogPosting' | 'Article';
}

/**
 * Server-rendered Article/BlogPosting JSON-LD for editorial [slug] pages.
 * Emitted in the initial HTML (not a client component) so crawlers reliably
 * pick it up for article rich results.
 */
export default function ArticleJsonLd({
  headline,
  description,
  urlPath,
  datePublished,
  author = 'CraftsAI',
  type = 'Article',
}: ArticleJsonLdProps) {
  const url = `${SITE_URL}${urlPath}`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': type,
    headline,
    description,
    image: `${SITE_URL}/opengraph-image`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    ...(datePublished ? { datePublished } : {}),
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
