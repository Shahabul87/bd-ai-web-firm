'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Google Analytics 4 - Replace 'GA_MEASUREMENT_ID' with your actual ID
    const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    
    if (GA_MEASUREMENT_ID && typeof window !== 'undefined') {
      // Track page views
      window.gtag?.('config', GA_MEASUREMENT_ID, {
        page_path: pathname + (searchParams ? `?${searchParams.toString()}` : ''),
      });
    }
  }, [pathname, searchParams]);

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