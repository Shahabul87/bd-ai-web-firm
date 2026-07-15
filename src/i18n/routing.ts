import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'bn'],
  defaultLocale: 'en',
  // English stays unprefixed (/services); Bengali is prefixed (/bn/services).
  // This preserves every existing URL and its accumulated SEO.
  localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];
