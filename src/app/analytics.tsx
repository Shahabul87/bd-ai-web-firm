'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

    if (GA_MEASUREMENT_ID && typeof window !== 'undefined') {
      // page_path is the pathname ONLY. Query strings, URL fragments, and any
      // user-controlled identifiers (auth tokens, emails, IDs) must never be
      // sent to analytics — magic-link callbacks carry the token in the query
      // string, so including it would disclose the token to Google.
      window.gtag?.('config', GA_MEASUREMENT_ID, {
        page_path: pathname,
      });
    }
  }, [pathname]);

  return null;
}

// Custom event tracking functions
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

export const trackContactFormSubmission = (formType: string) => {
  trackEvent('form_submit', 'engagement', `contact_form_${formType}`);
};

export const trackServiceInquiry = (serviceType: string) => {
  trackEvent('service_inquiry', 'lead_generation', serviceType);
};

export const trackDownload = (fileName: string) => {
  trackEvent('file_download', 'engagement', fileName);
};

// Type declarations for window.gtag
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}