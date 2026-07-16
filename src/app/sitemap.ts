import { MetadataRoute } from 'next';
import { blogs, caseStudies, guides, products } from '#content';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.craftsai.org';
  const currentDate = new Date().toISOString();

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
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: alt(''),
    },
    {
      url: `${baseUrl}/services`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: alt('/services'),
    },
    {
      url: `${baseUrl}/quote`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
      alternates: alt('/quote'),
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
      alternates: alt('/contact'),
    },
    {
      url: `${baseUrl}/process`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: alt('/process'),
    },
  ];

  // Company pages
  const companyPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: alt('/about'),
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: alt('/portfolio'),
    },
    {
      url: `${baseUrl}/careers`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: alt('/careers'),
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: alt('/faq'),
    },
  ];

  // Service pages
  const servicePages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/services/web-development`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: alt('/services/web-development'),
    },
    {
      url: `${baseUrl}/services/android-development`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: alt('/services/android-development'),
    },
    {
      url: `${baseUrl}/services/ios-development`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: alt('/services/ios-development'),
    },
    {
      url: `${baseUrl}/services/support`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: alt('/services/support'),
    },
  ];

  // Product pages (static index + dynamic from Velite)
  const productPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/products`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: alt('/products'),
    },
    ...products.map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: alt(`/products/${product.slug}`),
    })),
  ];

  // Resource pages (static indexes + dynamic from Velite)
  const resourcePages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/resources`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: alt('/resources'),
    },
    {
      url: `${baseUrl}/resources/blog`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: alt('/resources/blog'),
    },
    {
      url: `${baseUrl}/resources/case-studies`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: alt('/resources/case-studies'),
    },
    {
      url: `${baseUrl}/resources/guides`,
      lastModified: currentDate,
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
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
      alternates: alt('/privacy'),
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
      alternates: alt('/terms'),
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: currentDate,
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
