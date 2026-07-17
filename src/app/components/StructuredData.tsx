'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import faqData from '../../../content/faq/faq.json';

interface LocalizedString {
  en: string;
  bn: string;
}

interface FaqQuestion {
  question: LocalizedString;
  answer: LocalizedString;
}

interface FaqCategory {
  category: LocalizedString;
  questions: FaqQuestion[];
}

function pickLocale(value: LocalizedString, locale: string): string {
  return locale === 'bn' ? value.bn : value.en;
}

export default function StructuredData() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('StructuredData');

  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://www.craftsai.org/#organization",
    "name": "CraftsAI",
    "url": "https://www.craftsai.org",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.craftsai.org/icon-512.png",
      "width": 512,
      "height": 512
    },
    "image": "https://www.craftsai.org/opengraph-image",
    "description": t('org.description'),
    "inLanguage": locale,
    "foundingDate": "2025",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "BD"
    },
    "email": "hello@craftsai.org",
    "sameAs": [
      "https://twitter.com/craftsai",
      "https://linkedin.com/company/craftsai",
      "https://github.com/craftsai"
    ],
    "knowsAbout": [
      "Web Development",
      "Android Development",
      "iOS Development",
      "Software Maintenance",
      "AI-Powered Development"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": t('org.offerCatalogName'),
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": t('org.service.web.name'),
            "description": t('org.service.web.description')
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": t('org.service.android.name'),
            "description": t('org.service.android.description')
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": t('org.service.ios.name'),
            "description": t('org.service.ios.description')
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": t('org.service.support.name'),
            "description": t('org.service.support.description')
          }
        }
      ]
    }
  };

  // WebSite Schema (no SearchAction)
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://www.craftsai.org/#website",
    "name": "CraftsAI",
    "url": "https://www.craftsai.org",
    "description": t('website.description'),
    "publisher": {
      "@id": "https://www.craftsai.org/#organization"
    },
    "inLanguage": locale
  };

  // FAQ Schema - dynamically generated from faq.json
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "inLanguage": locale,
    "mainEntity": (faqData as FaqCategory[]).flatMap((category) =>
      category.questions.map((q) => ({
        "@type": "Question",
        "name": pickLocale(q.question, locale),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": pickLocale(q.answer, locale)
        }
      }))
    )
  };

  // Breadcrumb Schema Generator
  const getBreadcrumbSchema = () => {
    const pathSegments = pathname.split('/').filter(Boolean);

    if (pathSegments.length === 0) return null;

    const breadcrumbList = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "inLanguage": locale,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": t('breadcrumb.home'),
          "item": "https://www.craftsai.org"
        }
      ]
    };

    let currentPath = 'https://www.craftsai.org';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const breadcrumbKey = `breadcrumb.${segment}`;
      const name = t.has(breadcrumbKey)
        ? t(breadcrumbKey)
        : segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      breadcrumbList.itemListElement.push({
        "@type": "ListItem",
        "position": index + 2,
        "name": name,
        "item": currentPath
      });
    });

    return breadcrumbList;
  };

  // Page-specific schemas
  const getPageSchema = () => {
    switch (pathname) {
      case '/services':
        return {
          "@context": "https://schema.org",
          "@type": "Service",
          "name": t('page.services.name'),
          "description": t('page.services.description'),
          "url": "https://www.craftsai.org/services",
          "provider": { "@id": "https://www.craftsai.org/#organization" },
          "inLanguage": locale
        };
      case '/services/web-development':
        return {
          "@context": "https://schema.org",
          "@type": "Service",
          "name": t('page.webDevelopment.name'),
          "description": t('page.webDevelopment.description'),
          "url": "https://www.craftsai.org/services/web-development",
          "provider": { "@id": "https://www.craftsai.org/#organization" },
          "serviceType": "Web Development",
          "inLanguage": locale
        };
      case '/services/android-development':
        return {
          "@context": "https://schema.org",
          "@type": "Service",
          "name": t('page.androidDevelopment.name'),
          "description": t('page.androidDevelopment.description'),
          "url": "https://www.craftsai.org/services/android-development",
          "provider": { "@id": "https://www.craftsai.org/#organization" },
          "serviceType": "Android Development",
          "inLanguage": locale
        };
      case '/services/ios-development':
        return {
          "@context": "https://schema.org",
          "@type": "Service",
          "name": t('page.iosDevelopment.name'),
          "description": t('page.iosDevelopment.description'),
          "url": "https://www.craftsai.org/services/ios-development",
          "provider": { "@id": "https://www.craftsai.org/#organization" },
          "serviceType": "iOS Development",
          "inLanguage": locale
        };
      case '/services/support':
        return {
          "@context": "https://schema.org",
          "@type": "Service",
          "name": t('page.support.name'),
          "description": t('page.support.description'),
          "url": "https://www.craftsai.org/services/support",
          "provider": { "@id": "https://www.craftsai.org/#organization" },
          "serviceType": "Support & Maintenance",
          "inLanguage": locale
        };
      case '/products':
        return {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": t('page.products.name'),
          "description": t('page.products.description'),
          "url": "https://www.craftsai.org/products",
          "inLanguage": locale
        };
      case '/portfolio':
        return {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": t('page.portfolio.name'),
          "description": t('page.portfolio.description'),
          "url": "https://www.craftsai.org/portfolio",
          "inLanguage": locale
        };
      case '/resources':
        return {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": t('page.resources.name'),
          "description": t('page.resources.description'),
          "url": "https://www.craftsai.org/resources",
          "inLanguage": locale
        };
      case '/resources/blog':
        return {
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": t('page.blog.name'),
          "description": t('page.blog.description'),
          "url": "https://www.craftsai.org/resources/blog",
          "publisher": { "@id": "https://www.craftsai.org/#organization" },
          "inLanguage": locale
        };
      case '/contact':
        return {
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": t('page.contact.name'),
          "description": t('page.contact.description'),
          "url": "https://www.craftsai.org/contact",
          "inLanguage": locale
        };
      case '/quote':
        return {
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": t('page.quote.name'),
          "description": t('page.quote.description'),
          "url": "https://www.craftsai.org/quote",
          "inLanguage": locale
        };
      case '/faq':
        // NOTE: the actual FAQPage schema (with mainEntity) is emitted above,
        // scoped to /faq. Keep this a plain WebPage so we don't render a second,
        // empty FAQPage (invalid structured data Google would flag).
        return {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": t('page.faq.name'),
          "description": t('page.faq.description'),
          "url": "https://www.craftsai.org/faq",
          "inLanguage": locale
        };
      case '/about':
        return {
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": t('page.about.name'),
          "description": t('page.about.description'),
          "url": "https://www.craftsai.org/about",
          "mainEntity": { "@id": "https://www.craftsai.org/#organization" },
          "inLanguage": locale
        };
      case '/process':
        return {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": t('page.process.name'),
          "description": t('page.process.description'),
          "url": "https://www.craftsai.org/process",
          "inLanguage": locale
        };
      case '/careers':
        return {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": t('page.careers.name'),
          "description": t('page.careers.description'),
          "url": "https://www.craftsai.org/careers",
          "inLanguage": locale
        };
      default:
        return null;
    }
  };

  const pageSchema = getPageSchema();
  const breadcrumbSchema = getBreadcrumbSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      {/* FAQPage schema is emitted ONLY on /faq, the one page that visibly
          renders this exact faq.json content. Injecting it site-wide is a
          structured-data mismatch (Google flags FAQ markup with no matching
          on-page content). */}
      {pathname === '/faq' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema),
          }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema),
          }}
        />
      )}
      {pageSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(pageSchema),
          }}
        />
      )}
    </>
  );
}
