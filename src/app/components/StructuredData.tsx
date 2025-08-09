'use client';

import { usePathname } from 'next/navigation';

export default function StructuredData() {
  const pathname = usePathname();

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Cognivat",
    "alternateName": "Cognivat AI Studio",
    "url": "https://cognivat.com",
    "logo": "https://cognivat.com/logo.png",
    "description": "Leading AI-autonomous development studio specializing in machine learning model development, data preprocessing pipelines, web development, and business intelligence solutions.",
    "founder": {
      "@type": "Person",
      "name": "Cognivat Team"
    },
    "foundingDate": "2024",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-775-250-6651",
      "contactType": "Customer Service",
      "email": "info@cognivat.com",
      "availableLanguage": ["English"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Reno",
      "addressRegion": "Nevada",
      "addressCountry": "USA"
    },
    "sameAs": [
      "https://twitter.com/cognivat",
      "https://linkedin.com/company/cognivat",
      "https://github.com/cognivat"
    ],
    "serviceType": [
      "AI Model Development",
      "Machine Learning Training",
      "Data Pipeline Development", 
      "Web Development",
      "Business Intelligence",
      "MLOps Services"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Cognivat",
    "alternateName": "Cognivat AI Development Studio",
    "url": "https://cognivat.com",
    "description": "AI-autonomous development studio providing machine learning models, data pipelines, and web development services through autonomous coding.",
    "publisher": {
      "@type": "Organization",
      "name": "Cognivat"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://cognivat.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const professionalServiceSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "Cognivat AI Development Services",
    "description": "Professional AI model development, machine learning training, data pipeline creation, and autonomous web development services.",
    "url": "https://cognivat.com",
    "telephone": "+1-775-250-6651",
    "email": "info@cognivat.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Reno",
      "addressRegion": "Nevada",
      "addressCountry": "USA"
    },
    "serviceType": [
      "Artificial Intelligence Development",
      "Machine Learning Model Training",
      "Data Pipeline Development",
      "Web Application Development",
      "Business Intelligence Solutions",
      "MLOps Implementation"
    ],
    "provider": {
      "@type": "Organization",
      "name": "Cognivat"
    },
    "areaServed": "Worldwide",
    "availableLanguage": "English"
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
          "url": "https://cognivat.com/about",
          "mainEntity": {
            "@type": "Organization",
            "name": "Cognivat"
          }
        };
      case '/ai-solutions':
        return {
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "AI Solutions & Machine Learning Services",
          "description": "Comprehensive AI model development, training, validation, and deployment services with data preprocessing pipelines.",
          "url": "https://cognivat.com/ai-solutions",
          "provider": {
            "@type": "Organization",
            "name": "Cognivat"
          },
          "serviceType": "Artificial Intelligence Development",
          "category": "Technology Services"
        };
      case '/web-development':
        return {
          "@context": "https://schema.org",
          "@type": "Service", 
          "name": "Autonomous Web Development Services",
          "description": "Low-cost, high-quality web development services using AI-powered autonomous coding for modern businesses.",
          "url": "https://cognivat.com/web-development",
          "provider": {
            "@type": "Organization",
            "name": "Cognivat"
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
          "url": "https://cognivat.com/portfolio"
        };
      default:
        return null;
    }
  };

  const pageSchema = getPageSchema();

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(professionalServiceSchema),
        }}
      />
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