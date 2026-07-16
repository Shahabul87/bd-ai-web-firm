import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'bn'],
  defaultLocale: 'en',
  // English stays unprefixed (/services); Bengali is prefixed (/bn/services).
  // This preserves every existing URL and its accumulated SEO.
  localePrefix: 'as-needed',

  // Accept-Language detection is ON (next-intl's default). Re-enabled in Stage 3b
  // once /bn shipped real Bengali across every namespace (PR: full translation).
  // A Bengali-preferring visitor with no NEXT_LOCALE cookie is now redirected from
  // the bare `/` to `/bn`, and a returning NEXT_LOCALE=bn holder is forwarded to
  // /bn — both were suppressed in Stages 1-3a while /bn was still partly English.
  // (In next-intl's resolveLocale the cookie and the Accept-Language header sit
  // behind the same `localeDetection` guard, so restoring it restores both.)
  // The middleware guard tests in src/__tests__/middleware.test.ts assert this.
  localeDetection: true,

  // hreflang alternates STAY OFF — deferred to the SEO stage (Stage 4), NOT because
  // /bn is untranslated (it now is), but because the /bn pages still emit an ENGLISH
  // canonical (`<link rel="canonical" href=".../about">` on /bn/about — verified in
  // the built HTML). next-intl's default would ship a Link header advertising
  // hreflang="bn" -> /bn/... while that same page's canonical points at the English
  // URL: Google reads the canonical as "the real version is the English one" and
  // drops the Bengali page. Enabling hreflang is only coherent once Stage 4 makes
  // canonicals per-locale (each /bn page canonical to itself). Turn this on THEN,
  // in the same change that fixes the canonicals.
  alternateLinks: false,
});

export type Locale = (typeof routing.locales)[number];
