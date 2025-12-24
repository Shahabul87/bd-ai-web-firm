'use client';

import { usePathname } from 'next/navigation';

export default function StructuredData() {
  const pathname = usePathname();

  // Organization Schema - Enhanced
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://www.cognivat.com/#organization",
    "name": "Cognivat",
    "alternateName": ["Cognivat AI Studio", "Cognivat AI Development"],
    "url": "https://www.cognivat.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.cognivat.com/logo.png",
      "width": 512,
      "height": 512
    },
    "image": "https://www.cognivat.com/og-image.jpg",
    "description": "Leading AI-autonomous development studio specializing in machine learning model development, data preprocessing pipelines, web development, and business intelligence solutions.",
    "slogan": "Build 10x Faster with AI",
    "foundingDate": "2024",
    "founder": {
      "@type": "Person",
      "name": "Cognivat Team"
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+1-775-250-6651",
        "contactType": "sales",
        "email": "info@cognivat.com",
        "availableLanguage": ["English"],
        "areaServed": "Worldwide"
      },
      {
        "@type": "ContactPoint",
        "telephone": "+1-775-250-6651",
        "contactType": "customer support",
        "email": "support@cognivat.com",
        "availableLanguage": ["English"]
      }
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Reno",
      "addressLocality": "Reno",
      "addressRegion": "NV",
      "postalCode": "89501",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "39.5296",
      "longitude": "-119.8138"
    },
    "sameAs": [
      "https://twitter.com/cognivat",
      "https://linkedin.com/company/cognivat",
      "https://github.com/cognivat",
      "https://facebook.com/cognivat"
    ],
    "knowsAbout": [
      "Artificial Intelligence",
      "Machine Learning",
      "Deep Learning",
      "Natural Language Processing",
      "Computer Vision",
      "Data Science",
      "Web Development",
      "MLOps"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "AI Development Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "AI Model Development",
            "description": "Custom machine learning model development and training"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Data Pipeline Development",
            "description": "End-to-end data preprocessing and pipeline solutions"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Web Development",
            "description": "AI-powered autonomous web development"
          }
        }
      ]
    }
  };

  // LocalBusiness Schema
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://www.cognivat.com/#localbusiness",
    "name": "Cognivat AI Development Studio",
    "image": "https://www.cognivat.com/og-image.jpg",
    "url": "https://www.cognivat.com",
    "telephone": "+1-775-250-6651",
    "email": "info@cognivat.com",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Reno",
      "addressRegion": "Nevada",
      "addressCountry": "USA"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "47",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  // Website Schema with SearchAction
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://www.cognivat.com/#website",
    "name": "Cognivat",
    "alternateName": "Cognivat AI Development Studio",
    "url": "https://www.cognivat.com",
    "description": "AI-autonomous development studio providing machine learning models, data pipelines, and web development services.",
    "publisher": {
      "@id": "https://www.cognivat.com/#organization"
    },
    "inLanguage": "en-US",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.cognivat.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  // FAQ Schema - Appears in Google Search Results
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What AI development services does Cognivat offer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Cognivat offers comprehensive AI development services including custom machine learning model development, data preprocessing pipelines, natural language processing (NLP), computer vision solutions, predictive analytics, and AI-powered web development. We specialize in autonomous coding that delivers high-quality solutions 10x faster than traditional development."
        }
      },
      {
        "@type": "Question",
        "name": "How much does AI development cost at Cognivat?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Cognivat offers flexible pricing starting from $2,500 for basic AI projects. Our autonomous coding approach allows us to deliver enterprise-quality solutions at startup-friendly prices. We offer free consultations to provide accurate quotes based on your specific requirements."
        }
      },
      {
        "@type": "Question",
        "name": "How long does it take to develop an AI model?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Development timelines vary based on project complexity. Simple models can be delivered in 2-4 weeks, while complex enterprise solutions may take 2-3 months. Our AI-powered development process accelerates delivery by up to 10x compared to traditional methods."
        }
      },
      {
        "@type": "Question",
        "name": "Does Cognivat provide ongoing support and maintenance?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Cognivat provides 24/7 expert support and ongoing maintenance for all projects. We offer MLOps services to ensure your AI models remain accurate and performant over time, including model retraining, monitoring, and optimization."
        }
      },
      {
        "@type": "Question",
        "name": "What industries does Cognivat serve?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Cognivat serves diverse industries including FinTech (fraud detection, algorithmic trading), Healthcare (diagnostic AI, patient analytics), Retail (recommendation systems, inventory optimization), Manufacturing, and more. Our solutions are customized for each industry's specific needs."
        }
      }
    ]
  };

  // Service Schema
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://www.cognivat.com/#service",
    "name": "AI Development Services",
    "serviceType": "AI and Machine Learning Development",
    "provider": {
      "@id": "https://www.cognivat.com/#organization"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Worldwide"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "AI Services Catalog",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": "AI Model Development",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Machine Learning Model Training"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Deep Learning Solutions"
              }
            }
          ]
        },
        {
          "@type": "OfferCatalog",
          "name": "Data Services",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Data Pipeline Development"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Data Analytics"
              }
            }
          ]
        }
      ]
    }
  };

  // Breadcrumb Schema Generator
  const getBreadcrumbSchema = () => {
    const pathSegments = pathname.split('/').filter(Boolean);

    if (pathSegments.length === 0) return null;

    const breadcrumbList = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.cognivat.com"
        }
      ]
    };

    const pageNames: Record<string, string> = {
      'about': 'About Us',
      'ai-solutions': 'AI Solutions',
      'web-development': 'Web Development',
      'portfolio': 'Portfolio',
      'blog': 'Blog',
      'quote': 'Get a Quote',
      'services': 'Services',
      'industries': 'Industries',
      'finance': 'Finance',
      'healthcare': 'Healthcare',
      'retail': 'Retail',
    };

    let currentPath = 'https://www.cognivat.com';
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
      case '/about':
        return {
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About Cognivat - AI Development Experts",
          "description": "Meet Cognivat's expert team specializing in AI model development, machine learning training, and autonomous coding solutions.",
          "url": "https://www.cognivat.com/about",
          "mainEntity": {
            "@id": "https://www.cognivat.com/#organization"
          }
        };
      case '/ai-solutions':
        return {
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "AI Solutions & Machine Learning Services",
          "description": "Comprehensive AI model development, training, validation, and deployment services with data preprocessing pipelines.",
          "url": "https://www.cognivat.com/ai-solutions",
          "provider": {
            "@id": "https://www.cognivat.com/#organization"
          },
          "serviceType": "Artificial Intelligence Development",
          "category": "Technology Services",
          "offers": {
            "@type": "Offer",
            "price": "2500",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          }
        };
      case '/web-development':
        return {
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Autonomous Web Development Services",
          "description": "Low-cost, high-quality web development services using AI-powered autonomous coding for modern businesses.",
          "url": "https://www.cognivat.com/web-development",
          "provider": {
            "@id": "https://www.cognivat.com/#organization"
          },
          "serviceType": "Web Development",
          "category": "Technology Services"
        };
      case '/portfolio':
        return {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Cognivat Portfolio - AI & Web Development Projects",
          "description": "Showcase of successful AI model development, machine learning projects, and web development solutions delivered by Cognivat.",
          "url": "https://www.cognivat.com/portfolio"
        };
      case '/quote':
        return {
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "Get a Quote - Cognivat AI Development",
          "description": "Request a free quote for AI development, machine learning, or web development services from Cognivat.",
          "url": "https://www.cognivat.com/quote"
        };
      case '/blog':
        return {
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "Cognivat Blog - AI & Machine Learning Insights",
          "description": "Latest articles and insights on AI development, machine learning, autonomous coding, and technology trends.",
          "url": "https://www.cognivat.com/blog",
          "publisher": {
            "@id": "https://www.cognivat.com/#organization"
          }
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
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema),
        }}
      />
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
