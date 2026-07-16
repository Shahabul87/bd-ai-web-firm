import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'bn'],
  defaultLocale: 'en',
  // English stays unprefixed (/services); Bengali is prefixed (/bn/services).
  // This preserves every existing URL and its accumulated SEO.
  localePrefix: 'as-needed',

  // Accept-Language detection is OFF until Stage 3 ships real Bengali copy in
  // messages/bn.json. Today /bn renders English prose in Anek Bangla under
  // <html lang="bn">, so auto-redirecting a Bengali-preferring visitor there
  // serves them English in a Bengali font — and makes screen readers apply
  // Bengali phonetics to English text. That is strictly worse than serving them
  // English at /. The EN/BN toggle is unaffected: it sets the NEXT_LOCALE
  // cookie, which takes precedence over detection and is not gated by this flag.
  // TURN THIS BACK ON by deleting this line (true is next-intl's default) in the
  // same commit that lands the Bengali translations.
  localeDetection: false,

  // hreflang alternates are deliberately deferred to the SEO stage, which will
  // emit them per-page from generateMetadata() alongside per-locale canonicals.
  // next-intl's default (true) makes every marketing response ship a Link:
  // header advertising hreflang="bn" -> /bn/... to crawlers, while those same
  // /bn pages carry an English canonical and serve English copy. Advertising a
  // Bengali alternate whose page serves English under an English canonical is
  // incoherent signalling, so we emit nothing rather than emit a contradiction.
  alternateLinks: false,
});

export type Locale = (typeof routing.locales)[number];
