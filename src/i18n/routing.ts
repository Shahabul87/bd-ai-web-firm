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
  // English at /.
  //
  // The EN/BN toggle still works: it links directly to the /bn URL, and a locale
  // read from the route prefix is resolved before this flag is consulted. The
  // NEXT_LOCALE cookie is still written on switch (syncCookie gates on
  // localeCookie, not on this flag).
  //
  // KNOWN COST, accepted for Stage 1: in next-intl's resolveLocale the cookie and
  // the Accept-Language header sit behind the SAME `localeDetection` guard, so
  // this also stops a returning NEXT_LOCALE=bn holder from being forwarded off a
  // bare `/` to `/bn`. That costs nothing today — both paths render English — and
  // there is no config that disables only the header.
  //
  // TURN THIS BACK ON by deleting this line (true is next-intl's default) in the
  // same commit that lands the Bengali translations. Doing so restores both the
  // Accept-Language redirect and cookie forwarding, and requires re-inverting
  // the guard tests in src/__tests__/middleware.test.ts.
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
