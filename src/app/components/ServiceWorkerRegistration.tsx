'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Only register in production
      if (process.env.NODE_ENV === 'production') {
        window.addEventListener('load', () => {
          navigator.serviceWorker
            .register('/sw.js')
            .then((registration) => {
              console.log('SW registered:', registration);
              
              // Check for updates periodically
              setInterval(() => {
                registration.update();
              }, 60000); // Check every minute
            })
            .catch((error) => {
              console.log('SW registration failed:', error);
            });
        });
      }
    }
  }, []);

  return null;
}