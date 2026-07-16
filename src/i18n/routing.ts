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

  // hreflang STAYS OFF here — but hreflang IS now emitted, via per-page
  // `metadata.alternates.languages` (<link rel="alternate" hreflang> tags in <head>),
  // added in Stage 4 alongside per-locale canonicals. So each /bn page now canonicals
  // to itself and its hreflang agrees with that canonical — coherent, and Google can
  // index the Bengali pages.
  //
  // This next-intl flag (which emits hreflang as HTTP Link HEADERS) is left off to
  // avoid DOUBLE-emitting the signal: the metadata <link> tags are the canonical
  // source of truth, and next-intl's header form does not know our exact per-locale
  // canonical rules. Metadata tags + Link headers saying the same thing is redundant
  // at best and divergent at worst — so we emit in exactly one place. Do NOT turn
  // this on; add hreflang via the seo.ts helper (localeAlternates) instead.
  alternateLinks: false,
});

export type Locale = (typeof routing.locales)[number];
