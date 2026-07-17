import type { AbstractIntlMessages } from 'next-intl';

/**
 * The ONLY top-level message namespaces that reach Client Components.
 *
 * next-intl v4's `NextIntlClientProvider` inherits `messages` from
 * `i18n/request.ts` by default, which serializes the COMPLETE catalog into
 * every page's RSC/HTML payload — including large server-only namespaces
 * (Services, Legal, Process, About, Resources, …) that no client component
 * ever reads. That inflated a near-static page like /bn/about to ~222 kB of
 * HTML. Server Components resolve their own translations at render time and do
 * NOT need the provider, so only namespaces used inside `'use client'`
 * components belong here.
 *
 * This is a single, uniform allowlist rather than per-route nested providers on
 * purpose: next-intl treats a nested provider's `messages` as ATOMIC (it does
 * not merge with the parent), so per-route scoping would force every subtree to
 * re-declare the shared "chrome" namespaces it renders and would break at
 * runtime (MISSING_MESSAGE) the moment a shared client component is added to a
 * page whose provider forgot its namespace. One allowlist covers every subtree
 * safely; the trade-off is that a couple of page-specific namespaces (Home,
 * Quote) ride along on routes that do not render them.
 *
 * INVARIANT: every namespace read via `useTranslations`/`useFormatter` in a
 * `'use client'` component under the marketing layout MUST be listed here.
 * `src/app/components/__tests__/clientMessages.test.ts` enforces this by
 * scanning the client components and diffing against this list.
 */
export const CLIENT_NAMESPACES = [
  // Global chrome — present on every marketing page
  'Header',
  'Nav',
  'Footer',
  'LocaleToggle',
  'Chrome', // WhatsAppButton (Chrome.whatsapp) + CookieConsent (Chrome.cookies)
  'Chatbot', // AIChatbot
  'StructuredData', // client JSON-LD (SSR'd into HTML; per-path via usePathname)
  // Shared client sections used across multiple routes
  'CTABand',
  'PillarCards',
  // Page-specific client components
  'Home', // homepage sections (home/*)
  'Contact', // contact form
  'Quote', // quote wizard
  'FormErrors', // contact + quote client-side validation
  'ErrorPage', // error.tsx boundary
] as const;

/**
 * Select only the client-visible namespaces from the full catalog. Kept
 * dependency-free (no lodash) — the shape is a flat record keyed by namespace.
 */
export function pickClientMessages(
  messages: AbstractIntlMessages,
): AbstractIntlMessages {
  const picked: Record<string, AbstractIntlMessages[string]> = {};
  for (const ns of CLIENT_NAMESPACES) {
    if (ns in messages) picked[ns] = messages[ns];
  }
  return picked;
}
