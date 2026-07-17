import { MetadataRoute } from 'next';
import { blogs, caseStudies, guides, products } from '#content';
import { SITE_URL } from '@/app/lib/siteUrl';

export default function sitemap(): MetadataRoute.Sitemap {
  // One canonical origin: a staging sitemap must not advertise production URLs.
  const baseUrl = SITE_URL;

  // NOTE: static marketing pages deliberately carry NO lastModified. It used to
  // be `new Date()` at build time, so every page claimed to change on every
  // deploy — a signal crawlers learn to distrust. Only pages with a REAL source
  // date (Velite content, below) advertise one. Absent lastModified is valid and
  // lets the crawler judge freshness itself.

  // Build the en/bn hreflang alternates for a given path (e.g. '' for home, '/about' for /about)
  const alt = (path: string): { languages: Record<string, string> } => ({
    languages: {
      en: `${baseUrl}${path}`,
      bn: `${baseUrl}/bn${path}`,
    },
  });

  // Core pages with high priority
  const corePages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: alt(''),
    },
    {
      url: `${baseUrl}/services`,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: alt('/services'),
    },
    {
      url: `${baseUrl}/quote`,
      changeFrequency: 'monthly',
      priority: 0.9,
      alternates: alt('/quote'),
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: 'monthly',
      priority: 0.9,
      alternates: alt('/contact'),
    },
    {
      url: `${baseUrl}/process`,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: alt('/process'),
    },
  ];

  // Company pages
  const companyPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/about`,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: alt('/about'),
    },
    {
      url: `${baseUrl}/portfolio`,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: alt('/portfolio'),
    },
    {
      url: `${baseUrl}/careers`,
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: alt('/careers'),
    },
    {
      url: `${baseUrl}/faq`,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: alt('/faq'),
    },
  ];

  // Service pages
  const servicePages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/services/web-development`,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: alt('/services/web-development'),
    },
    {
      url: `${baseUrl}/services/android-development`,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: alt('/services/android-development'),
    },
    {
      url: `${baseUrl}/services/ios-development`,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: alt('/services/ios-development'),
    },
    {
      url: `${baseUrl}/services/support`,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: alt('/services/support'),
    },
  ];

  // Product pages (static index + dynamic from Velite)
  const productPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/products`,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: alt('/products'),
    },
    ...products.map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: alt(`/products/${product.slug}`),
    })),
  ];

  // Resource pages (static indexes + dynamic from Velite)
  const resourcePages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/resources`,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: alt('/resources'),
    },
    {
      url: `${baseUrl}/resources/blog`,
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: alt('/resources/blog'),
    },
    {
      url: `${baseUrl}/resources/case-studies`,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: alt('/resources/case-studies'),
    },
    {
      url: `${baseUrl}/resources/guides`,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: alt('/resources/guides'),
    },
  ];

  // Dynamic blog pages from Velite
  const blogPages: MetadataRoute.Sitemap = blogs.map((blog) => ({
    url: `${baseUrl}/resources/blog/${blog.slug}`,
    lastModified: blog.date,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
    alternates: alt(`/resources/blog/${blog.slug}`),
  }));

  // Dynamic case study pages from Velite
  const caseStudyPages: MetadataRoute.Sitemap = caseStudies.map((cs) => ({
    url: `${baseUrl}/resources/case-studies/${cs.slug}`,
    lastModified: cs.date,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
    alternates: alt(`/resources/case-studies/${cs.slug}`),
  }));

  // Dynamic guide pages from Velite
  const guidePages: MetadataRoute.Sitemap = guides.map((guide) => ({
    url: `${baseUrl}/resources/guides/${guide.slug}`,
    lastModified: guide.date,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
    alternates: alt(`/resources/guides/${guide.slug}`),
  }));

  // Legal pages
  const legalPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/privacy`,
      changeFrequency: 'yearly',
      priority: 0.3,
      alternates: alt('/privacy'),
    },
    {
      url: `${baseUrl}/terms`,
      changeFrequency: 'yearly',
      priority: 0.3,
      alternates: alt('/terms'),
    },
    {
      url: `${baseUrl}/cookies`,
      changeFrequency: 'yearly',
      priority: 0.3,
      alternates: alt('/cookies'),
    },
  ];

  return [
    ...corePages,
    ...companyPages,
    ...servicePages,
    ...productPages,
    ...resourcePages,
    ...blogPages,
    ...caseStudyPages,
    ...guidePages,
    ...legalPages,
  ];
}
