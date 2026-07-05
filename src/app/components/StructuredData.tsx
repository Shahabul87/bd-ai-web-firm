'use client';

import { usePathname } from 'next/navigation';
import faqData from '../../../content/faq/faq.json';

interface FaqQuestion {
  question: string;
  answer: string;
}

interface FaqCategory {
  category: string;
  questions: FaqQuestion[];
}

export default function StructuredData() {
  const pathname = usePathname();

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
    "description": "AI-powered software studio delivering web, Android, and iOS applications up to 10x faster with enterprise-grade quality.",
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
      "name": "Development Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Web Development",
            "description": "Full-stack web application development with React, Next.js, and Node.js"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Android Development",
            "description": "Native Android app development with Kotlin and Jetpack Compose"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "iOS Development",
            "description": "Native iOS app development with Swift and SwiftUI"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Support & Maintenance",
            "description": "Ongoing support, bug fixes, security patches, and feature updates"
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
    "description": "AI-powered software studio delivering web, Android, and iOS applications.",
    "publisher": {
      "@id": "https://www.craftsai.org/#organization"
    },
    "inLanguage": "en"
  };

  // FAQ Schema - dynamically generated from faq.json
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": (faqData as FaqCategory[]).flatMap((category) =>
      category.questions.map((q) => ({
        "@type": "Question",
        "name": q.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": q.answer
        }
      }))
    )
  };

  // Breadcrumb Schema Generator
  const getBreadcrumbSchema = () => {
    const pathSegments = pathname.split('/').filter(Boolean);

    if (pathSegments.length === 0) return null;

    const pageNames: Record<string, string> = {
      'about': 'About Us',
      'services': 'Services',
      'web-development': 'Web Development',
      'android-development': 'Android Development',
      'ios-development': 'iOS Development',
      'support': 'Support & Maintenance',
      'products': 'Products',
      'taxomind': 'TaxoMind',
      'taxomind-schools': 'TaxoMind Schools',
      'fincoach-ai': 'FinCoach AI',
      'mathphysics': 'MathPhysics',
      'portfolio': 'Portfolio',
      'resources': 'Resources',
      'blog': 'Blog',
      'case-studies': 'Case Studies',
      'guides': 'Guides',
      'quote': 'Get a Quote',
      'contact': 'Contact',
      'process': 'Our Process',
      'faq': 'FAQ',
      'careers': 'Careers',
      'privacy': 'Privacy Policy',
      'terms': 'Terms of Service',
      'cookies': 'Cookie Policy',
    };

    const breadcrumbList = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.craftsai.org"
        }
      ]
    };

    let currentPath = 'https://www.craftsai.org';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      breadcrumbList.itemListElement.push({
        "@type": "ListItem",
        "position": index + 2,
        "name": pageNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
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
          "name": "CraftsAI Development Services",
          "description": "AI-powered web, Android, iOS development and ongoing support services.",
          "url": "https://www.craftsai.org/services",
          "provider": { "@id": "https://www.craftsai.org/#organization" }
        };
      case '/services/web-development':
        return {
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Web Development",
          "description": "Full-stack web application development with React, Next.js, and Node.js.",
          "url": "https://www.craftsai.org/services/web-development",
          "provider": { "@id": "https://www.craftsai.org/#organization" },
          "serviceType": "Web Development"
        };
      case '/services/android-development':
        return {
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Android Development",
          "description": "Native Android app development with Kotlin and Jetpack Compose.",
          "url": "https://www.craftsai.org/services/android-development",
          "provider": { "@id": "https://www.craftsai.org/#organization" },
          "serviceType": "Android Development"
        };
      case '/services/ios-development':
        return {
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "iOS Development",
          "description": "Native iOS app development with Swift and SwiftUI.",
          "url": "https://www.craftsai.org/services/ios-development",
          "provider": { "@id": "https://www.craftsai.org/#organization" },
          "serviceType": "iOS Development"
        };
      case '/services/support':
        return {
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Support & Maintenance",
          "description": "Ongoing support, bug fixes, security patches, and feature updates.",
          "url": "https://www.craftsai.org/services/support",
          "provider": { "@id": "https://www.craftsai.org/#organization" },
          "serviceType": "Support & Maintenance"
        };
      case '/products':
        return {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "CraftsAI Products",
          "description": "Ready-made software products by CraftsAI.",
          "url": "https://www.craftsai.org/products"
        };
      case '/portfolio':
        return {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "CraftsAI Portfolio",
          "description": "Web, Android, and iOS projects built by CraftsAI.",
          "url": "https://www.craftsai.org/portfolio"
        };
      case '/resources':
        return {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "CraftsAI Resources",
          "description": "Blog posts, case studies, and development guides.",
          "url": "https://www.craftsai.org/resources"
        };
      case '/resources/blog':
        return {
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "CraftsAI Blog",
          "description": "Articles on web, Android, and iOS development.",
          "url": "https://www.craftsai.org/resources/blog",
          "publisher": { "@id": "https://www.craftsai.org/#organization" }
        };
      case '/contact':
        return {
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "Contact CraftsAI",
          "description": "Get in touch with CraftsAI for web, Android, or iOS development inquiries.",
          "url": "https://www.craftsai.org/contact"
        };
      case '/quote':
        return {
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "Get a Quote from CraftsAI",
          "description": "Request a free quote for your development project.",
          "url": "https://www.craftsai.org/quote"
        };
      case '/faq':
        // NOTE: the actual FAQPage schema (with mainEntity) is emitted above,
        // scoped to /faq. Keep this a plain WebPage so we don't render a second,
        // empty FAQPage (invalid structured data Google would flag).
        return {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "CraftsAI FAQ",
          "description": "Frequently asked questions about CraftsAI services, pricing, and process.",
          "url": "https://www.craftsai.org/faq"
        };
      case '/about':
        return {
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About CraftsAI",
          "description": "Learn about CraftsAI, our team, and our AI-powered development approach.",
          "url": "https://www.craftsai.org/about",
          "mainEntity": { "@id": "https://www.craftsai.org/#organization" }
        };
      case '/process':
        return {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Our Process",
          "description": "How CraftsAI delivers projects from consultation to launch.",
          "url": "https://www.craftsai.org/process"
        };
      case '/careers':
        return {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Careers at CraftsAI",
          "description": "Join the CraftsAI team and build the future of AI-powered development.",
          "url": "https://www.craftsai.org/careers"
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
