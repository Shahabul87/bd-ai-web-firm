# Bilingual EN/BN — Stage 1: Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put the complete bilingual machinery in place — locale routing, two root layouts, Bengali font, EN/BN toggle — while the site remains 100% English.

**Architecture:** Split `src/app` into two route groups with two root layouts: `(site)/[locale]/` for public marketing (`<html lang={locale}>`) and `(internal)/` for admin/portal (`<html lang="en">`). `next-intl` with `localePrefix: 'as-needed'` keeps English unprefixed so no existing URL changes. The existing NextAuth middleware and the i18n middleware compose as a dispatcher — they match disjoint paths.

**Tech Stack:** Next.js 15.4 App Router, React 19, TypeScript strict, next-intl 4.13.2, Anek Bangla via `next/font/google`, Tailwind v4, Jest + Playwright.

**Spec:** `docs/superpowers/specs/2026-07-14-bilingual-en-bn-design.md`
**Branch:** `feat/bilingual-en-bn` (already exists, spec committed at `0bea6c8`)

## Global Constraints

- **Stage 1 changes ZERO user-visible copy.** Every string stays English. `/bn/*` renders English. If a diff changes copy, it belongs in Stage 2 or 3.
- **No existing URL may change.** `/services`, `/admin`, `/portal`, `/sitemap.xml`, `/rss.xml` must resolve exactly as they do today.
- **TypeScript strict. No `any`, no `unknown`** without explicit approval (repo standard). If NextAuth typing forces a cast, stop and report rather than casting silently.
- **Never use `git checkout --`, `git restore`, `git stash`, `git reset --hard`.** Undo with the Edit tool.
- **Use `git mv`** for all file moves so history is preserved.
- Locales: `['en', 'bn']`. Default `en`. Cookie: `NEXT_LOCALE`.
- Verification gate per task: `npm run lint` && `npm run type-check` && `npm test` all green.
- Browser verification requires **explicit user permission** and a **visible** Chromium via Playwright MCP. Never headless, never curl.

## File Structure

| Path | Responsibility |
|---|---|
| `src/i18n/routing.ts` | Locale list, default, prefix strategy. Single source of truth. |
| `src/i18n/request.ts` | Per-request message loading for server components. |
| `src/i18n/navigation.ts` | Locale-aware `Link`, `redirect`, `usePathname`, `useRouter`. |
| `messages/en.json`, `messages/bn.json` | Dictionaries. Stage 1 ships them near-empty (toggle keys only). |
| `src/app/components/AppShell.tsx` | Shared `<html>`/`<head>`/`<body>` shell + fonts + analytics. Used by BOTH root layouts. |
| `src/app/(site)/[locale]/layout.tsx` | Root layout #1. Marketing. `<html lang={locale}>`, `NextIntlClientProvider`, marketing chrome. |
| `src/app/(internal)/layout.tsx` | Root layout #2. Admin/portal. `<html lang="en">`. No chrome, no i18n. |
| `src/app/components/layout/LocaleToggle.tsx` | EN/BN segmented control. Client component. |
| `src/middleware.ts` | Dispatcher: admin→auth, portal/api→passthrough, else→i18n. |
| `src/app/sitemap.ts`, `src/app/rss.xml/`, `src/app/global-error.tsx` | **Stay at root.** Do not move. |

---

## Task 1: Convert relative imports to `@/` alias

**Why first:** 160 relative-import lines across 36 files (`../components/...`) break the moment files move two levels deeper into `(site)/[locale]/`. Aliases are location-independent, so converting *before* the move makes the move a pure rename. The `@/` alias already exists (`tsconfig.json` maps `@/*` → `./src/*`) and is already used (`@/app/lib/content`), so this follows an established pattern.

**Files:**
- Modify: all 36 marketing `.tsx`/`.ts` files under `src/app/` excluding `admin/`, `portal/`, `api/`, `components/`, `lib/`, `utils/`, `design/`, `styles/`

**Interfaces:**
- Consumes: nothing
- Produces: every moved file imports via `@/app/...`, so Task 4's `git mv` requires no import edits

- [ ] **Step 1: List the exact files in scope**

```bash
cd /Users/mdshahabulalam/myprojects/bdaiwebfirm/bd-ai-web-firm
find src/app \( -name "*.tsx" -o -name "*.ts" \) \
  | grep -vE "src/app/(admin|portal|api|components|lib|utils|design|styles)/" \
  | grep -vE "src/app/(layout|sitemap|global-error|analytics|firebase)" \
  | sort > /tmp/i18n-alias-files.txt
wc -l < /tmp/i18n-alias-files.txt
```

Expected: `36`

⚠️ **This is the ALIAS list, not the MOVE list — they are different sets.** It includes
`src/app/rss.xml/route.ts`, which gets its imports aliased here but must **stay at the root**
in Task 4 (it has to serve `/rss.xml`). Task 4 names its directories explicitly for exactly
this reason. Do not feed this file into `git mv`.

- [ ] **Step 2: Record the pre-change baseline**

```bash
npm run lint && npm run type-check && npm test 2>&1 | tail -5
```

Expected: all green. **If anything is red before you start, STOP and report** — do not build on a broken baseline.

- [ ] **Step 3: Rewrite relative imports to aliases**

For each file, rewrite every `from '../...'` / `from './...'` that escapes the page's own directory into an `@/app/...` alias. Resolve each path against the file's real location.

Mapping examples (verified present in the codebase):

| Before (in `src/app/about/page.tsx`) | After |
|---|---|
| `from '../components/layout/PageLayout'` | `from '@/app/components/layout/PageLayout'` |
| `from '../components/shared/PageHero'` | `from '@/app/components/shared/PageHero'` |
| `from '../components/shared/CTABand'` | `from '@/app/components/shared/CTABand'` |
| `from '../design/ui/SectionHeader'` | `from '@/app/design/ui/SectionHeader'` |
| `from '../design/ui/Card'` | `from '@/app/design/ui/Card'` |

| Before (in `src/app/services/web-development/page.tsx`) | After |
|---|---|
| `from '../../components/layout/PageLayout'` | `from '@/app/components/layout/PageLayout'` |
| `from '../../design/ui/SpecTable'` | `from '@/app/design/ui/SpecTable'` |
| `from '../../design/ui/Accordion'` | `from '@/app/design/ui/Accordion'` |

**Do NOT rewrite same-directory sibling imports** (e.g. `./ConveyorProcess` inside a folder that moves together with its sibling) — those stay relative and survive the move intact.

Leave `src/app/components/**` internals alone; they are not moving.

- [ ] **Step 4: Verify no escaping relative imports remain in scope**

```bash
xargs grep -nE "from '\.\./" < /tmp/i18n-alias-files.txt || echo "CLEAN: no escaping relative imports"
```

Expected: `CLEAN: no escaping relative imports`

- [ ] **Step 5: Verify the gate is still green**

```bash
npm run lint && npm run type-check && npm test 2>&1 | tail -5
```

Expected: all green, identical to the Step 2 baseline. This is a pure refactor — behaviour must not change.

- [ ] **Step 6: Commit**

```bash
git add src/app
git commit -m "refactor(imports): use @/ alias in marketing pages

Relative imports break when pages move into (site)/[locale]/ in stage 1
of the bilingual work. Aliases are location-independent, so converting
first makes the route-group move a pure rename. No behaviour change.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Install next-intl and create the i18n config

**Files:**
- Modify: `package.json`, `next.config.ts`
- Create: `src/i18n/routing.ts`, `src/i18n/request.ts`, `src/i18n/navigation.ts`, `messages/en.json`, `messages/bn.json`
- Test: `src/i18n/__tests__/routing.test.ts`

**Interfaces:**
- Produces:
  - `routing` — `{ locales: readonly ['en','bn'], defaultLocale: 'en', localePrefix: 'as-needed' }` from `@/i18n/routing`
  - `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname` from `@/i18n/navigation`
  - `type Locale = 'en' | 'bn'` from `@/i18n/routing`

- [ ] **Step 1: Install next-intl**

```bash
npm install next-intl@4.13.2
```

Verified: peer-supports `next: ^15.0.0` and `react: ^19.0.0`.

- [ ] **Step 2: Write the failing test**

Create `src/i18n/__tests__/routing.test.ts`:

```ts
import { routing } from '@/i18n/routing';

describe('routing config', () => {
  it('declares exactly en and bn', () => {
    expect(routing.locales).toEqual(['en', 'bn']);
  });

  it('defaults to English', () => {
    expect(routing.defaultLocale).toBe('en');
  });

  it('omits the prefix for the default locale so existing URLs never change', () => {
    expect(routing.localePrefix).toBe('as-needed');
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

```bash
npx jest src/i18n/__tests__/routing.test.ts
```

Expected: FAIL — `Cannot find module '@/i18n/routing'`

- [ ] **Step 4: Create `src/i18n/routing.ts`**

```ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'bn'],
  defaultLocale: 'en',
  // English stays unprefixed (/services); Bengali is prefixed (/bn/services).
  // This preserves every existing URL and its accumulated SEO.
  localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];
```

- [ ] **Step 5: Run it to verify it passes**

```bash
npx jest src/i18n/__tests__/routing.test.ts
```

Expected: PASS — 3 tests.

- [ ] **Step 6: Create `src/i18n/request.ts`**

```ts
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 7: Create `src/i18n/navigation.ts`**

```ts
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Locale-aware replacements for next/link and next/navigation.
// Using these instead of the next/* originals is what keeps the toggle on
// the current page instead of dumping the user on the homepage.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

- [ ] **Step 8: Create the message stubs**

`messages/en.json`:

```json
{
  "LocaleToggle": {
    "label": "Language",
    "switchToEnglish": "Switch to English",
    "switchToBengali": "Switch to Bengali"
  }
}
```

`messages/bn.json` — Stage 1 ships **only** the toggle's own strings in Bengali, because the toggle must read correctly in the language it targets. Everything else stays English until Stage 3.

```json
{
  "LocaleToggle": {
    "label": "ভাষা",
    "switchToEnglish": "ইংরেজিতে দেখুন",
    "switchToBengali": "বাংলায় দেখুন"
  }
}
```

- [ ] **Step 9: Wire the next-intl plugin into `next.config.ts`**

The file currently ends with `export default nextConfig;`. It must be wrapped. Add the import at the top:

```ts
import createNextIntlPlugin from 'next-intl/plugin';
```

Add before the final export:

```ts
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
```

Change the final export from `export default nextConfig;` to:

```ts
export default withNextIntl(nextConfig);
```

**Do not disturb** the existing `VeliteWebpackPlugin`, `redirects()`, `headers()`, or CSP config — they must survive verbatim.

- [ ] **Step 10: Verify the gate**

```bash
npm run lint && npm run type-check && npm test 2>&1 | tail -5
```

Expected: all green. The app still builds and behaves exactly as before — nothing consumes the i18n config yet.

- [ ] **Step 11: Commit**

```bash
git add package.json package-lock.json next.config.ts src/i18n messages
git commit -m "feat(i18n): add next-intl config, routing, and message stubs

Locales en/bn with localePrefix as-needed so English URLs stay unprefixed.
Nothing consumes this yet; the app is unchanged.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Extract `AppShell` from the root layout

**Why:** Both root layouts need the identical `<html>`/`<head>`/`<body>` shell, fonts, error boundary, and GA scripts. Extracting first means Task 4 is a move, not a rewrite-and-duplicate.

**Files:**
- Create: `src/app/components/AppShell.tsx`
- Modify: `src/app/layout.tsx` (still the only root layout at this point)

**Interfaces:**
- Produces: `AppShell` — `({ lang: string; bodyClassName?: string; children: React.ReactNode }) => JSX.Element`. Renders `<html>` and `<body>`. Callers render only what goes *inside* `<body>`.

- [ ] **Step 1: Create `src/app/components/AppShell.tsx`**

Move — verbatim, do not retype from memory — the font declarations, `<head>` contents, `<body>` classes, `ErrorBoundary`, `CrossPlatformWrapper`, `Analytics`, and the GA `<Script>` block out of `src/app/layout.tsx`.

```tsx
import { Space_Grotesk, Instrument_Sans, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import CrossPlatformWrapper from './CrossPlatformWrapper';
import BrowserCompatibilityFallback from './BrowserCompatibilityFallback';
import ErrorBoundary from './ErrorBoundary';
import Analytics from '../analytics';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
});

const instrumentSans = Instrument_Sans({
  variable: '--font-instrument-sans',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  fallback: ['Menlo', 'Monaco', 'monospace'],
});

interface AppShellProps {
  /** BCP-47 tag for <html lang>. 'en' for internal, locale for marketing. */
  lang: string;
  /** Extra font variable classes appended to <body> (e.g. Bengali font). */
  bodyClassName?: string;
  children: React.ReactNode;
}

export default function AppShell({ lang, bodyClassName = '', children }: AppShellProps) {
  return (
    <html lang={lang} className="dark" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CraftsAI" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* NOTE: the root <link rel="canonical" href="https://www.craftsai.org" /> that
            lived here is deliberately NOT carried over — see Step 2. */}
        {/* Favicon (icon.svg), apple-touch-icon (apple-icon.png) auto-injected by Next.js
            metadata file conventions; favicon.ico served from /public for legacy crawlers. */}
        <link rel="manifest" href="/manifest.json" />

        {/* Critical CSS for above-the-fold content */}
        <style dangerouslySetInnerHTML={{ __html: `
          body { margin: 0; background: #0A0C10; color: #EDEEE8; }
          .min-h-screen { min-height: 100vh; }
        ` }} />
        {/* Google Search Console is verified via /googlef1eae627fd291eda.html (public/). */}
      </head>
      <body
        className={`${spaceGrotesk.variable} ${instrumentSans.variable} ${jetbrainsMono.variable} ${bodyClassName} antialiased bg-ink-950 text-bone`}
        suppressHydrationWarning
      >
        <ErrorBoundary>
          <CrossPlatformWrapper fallback={<BrowserCompatibilityFallback />}>
            <Analytics />
            {children}
          </CrossPlatformWrapper>
        </ErrorBoundary>

        {/* Google Analytics with Consent Mode v2 (default DENIED until the user
            opts in via the CookieConsent banner). Loaded only when configured.
            Move this block VERBATIM from src/app/layout.tsx — it is ~30 lines of
            inline gtag consent bootstrap. Recover the exact text with:
              git show HEAD:src/app/layout.tsx
            Do not retype it from memory: the consent defaults are compliance-
            relevant and a typo silently re-enables tracking. */}
      </body>
    </html>
  );
}
```

The three Latin font configs above are copied exactly from the current `src/app/layout.tsx` — note `jetbrainsMono` uses `preload: false` while the other two use `preload: true`. Preserve that difference; it is deliberate (mono is below the fold).

- [ ] **Step 2: Drop the hardcoded root canonical**

`src/app/layout.tsx` currently hardcodes in `<head>`:

```tsx
<link rel="canonical" href="https://www.craftsai.org" />
```

This is **wrong on every page except the homepage** today (it tells Google that `/services` is a duplicate of `/`), and it becomes actively harmful with two locales. Do **not** carry it into `AppShell`. Per-page canonicals already exist via each page's `metadata.alternates.canonical`; the locale-aware helper lands in Stage 4.

Note this deletion in the commit message — it is the one intentional behaviour change in Stage 1, and it is a bug fix.

- [ ] **Step 3: Reduce `src/app/layout.tsx` to use AppShell**

```tsx
import type { Metadata } from 'next';
import './globals.css';
import AppShell from './components/AppShell';
import StructuredData from './components/StructuredData';
import CookieConsent from './components/CookieConsent';
import MarketingChrome from './components/MarketingChrome';
import AIChatbot from './components/AIChatbot';
import WhatsAppButton from './components/WhatsAppButton';

export const metadata: Metadata = {
  /* unchanged — copy verbatim from the current file */
};

export const viewport = {
  /* unchanged — copy verbatim from the current file */
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AppShell lang="en">
      <StructuredData />
      {children}
      <MarketingChrome>
        <WhatsAppButton />
        <AIChatbot />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && <CookieConsent />}
      </MarketingChrome>
    </AppShell>
  );
}
```

- [ ] **Step 4: Verify the gate**

```bash
npm run lint && npm run type-check && npm test 2>&1 | tail -5
```

Expected: all green.

- [ ] **Step 5: Verify the app actually boots**

```bash
lsof -ti:3000 | xargs kill -9 2>/dev/null
npm run dev > /tmp/i18n-dev.log 2>&1 &
sleep 12
grep -iE "error|failed" /tmp/i18n-dev.log | head -5 || echo "clean boot"
lsof -ti:3000 | xargs kill -9 2>/dev/null
```

Expected: `clean boot`. A refactor of the root layout that compiles but does not boot is the exact failure this step catches.

- [ ] **Step 6: Commit**

```bash
git add src/app/components/AppShell.tsx src/app/layout.tsx
git commit -m "refactor(layout): extract AppShell from root layout

Both root layouts in the bilingual split need the same html/head/body
shell, fonts, error boundary, and GA scripts. Extracting first keeps the
route-group split a move rather than a duplication.

Also drops the hardcoded <link rel=canonical href=craftsai.org> from
<head>: it claimed every page was a duplicate of the homepage. Per-page
canonicals already come from each page's metadata export.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: The route-group split

**This is the highest-risk task in the plan.** It is atomic by necessity: the moment `src/app/layout.tsx` is deleted, every route needs a root layout in its group, so the deletion, both new root layouts, and all file moves must land together. There is no green intermediate state.

**Files:**
- Delete: `src/app/layout.tsx`, `src/app/components/MarketingChrome.tsx`
- Create: `src/app/(site)/[locale]/layout.tsx`, `src/app/(internal)/layout.tsx`
- Move (`git mv`): 36 marketing files → `src/app/(site)/[locale]/`; `admin/`, `portal/` → `src/app/(internal)/`
- Unmoved (verify): `src/app/sitemap.ts`, `src/app/rss.xml/`, `src/app/global-error.tsx`, `src/app/api/`, `src/app/components/`, `src/app/lib/`, `src/app/utils/`, `src/app/design/`, `src/app/globals.css`

**Interfaces:**
- Consumes: `AppShell` (Task 3), `routing` (Task 2)
- Produces: `/bn/*` routes resolving; `params: Promise<{locale: string}>` available to every marketing page

- [ ] **Step 1: Create the `(internal)` root layout**

`src/app/(internal)/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import '../globals.css';
import AppShell from '../components/AppShell';

export const metadata: Metadata = {
  title: 'CraftsAI',
  robots: { index: false, follow: false },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A0C10',
};

/** Root layout for /admin and /portal. Never localized, never indexed,
 *  no marketing chrome (no chatbot, WhatsApp button, or cookie banner). */
export default function InternalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AppShell lang="en">{children}</AppShell>;
}
```

- [ ] **Step 2: Move admin and portal into `(internal)`**

```bash
mkdir -p "src/app/(internal)"
git mv src/app/admin "src/app/(internal)/admin"
git mv src/app/portal "src/app/(internal)/portal"
```

- [ ] **Step 3: Create the `(site)` root layout**

`src/app/(site)/[locale]/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Anek_Bangla } from 'next/font/google';
import '../../globals.css';
import AppShell from '@/app/components/AppShell';
import StructuredData from '@/app/components/StructuredData';
import CookieConsent from '@/app/components/CookieConsent';
import AIChatbot from '@/app/components/AIChatbot';
import WhatsAppButton from '@/app/components/WhatsAppButton';
import { routing } from '@/i18n/routing';

// Verified against next/font metadata: Anek Bangla ships subsets
// [bengali, latin, latin-ext] with axes wdth 75-125 and wght 100-800.
// It has NO italic (styles: ['normal']) — Bengali emphasis must not use <em> italics.
// preload:false because this layout serves both locales; preloading would
// download the Bengali face for English visitors who never render a Bengali glyph.
const anekBangla = Anek_Bangla({
  variable: '--font-anek-bangla',
  subsets: ['bengali', 'latin'],
  axes: ['wdth'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif'],
});

// Recover the exact block — do NOT retype from memory, a transcription slip
// here silently changes what Google indexes:
//     git show HEAD:src/app/layout.tsx
// Copy the `metadata` export across UNCHANGED — including openGraph.locale,
// which stays hardcoded "en_US" for now. Verify all of these survive:
// metadataBase, title (default + template), description, keywords (10
// entries), authors, creator, publisher, robots (incl. googleBot), openGraph,
// twitter, alternates, category.
//
// Why static and not generateMetadata(): making openGraph.locale reflect the
// real locale requires generateMetadata(), because `export const metadata`
// cannot read runtime params. That belongs in Stage 4 alongside hreflang,
// per-locale canonicals, and the sitemap — all of which need the same helper.
// Stage 1 does not touch SEO output.
export const metadata: Metadata = {
  /* ...verbatim from git show HEAD:src/app/layout.tsx... */
};

// Verbatim from git show HEAD:src/app/layout.tsx.
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0A0C10',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function SiteLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Opts these routes into static rendering instead of forcing dynamic.
  setRequestLocale(locale);

  return (
    <AppShell lang={locale} bodyClassName={anekBangla.variable}>
      <NextIntlClientProvider>
        <StructuredData />
        {children}
        <WhatsAppButton />
        <AIChatbot />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && <CookieConsent />}
      </NextIntlClientProvider>
    </AppShell>
  );
}
```

Note the marketing chrome is now unconditional here — the route group makes it structural. That is why `MarketingChrome` dies in Step 5.

- [ ] **Step 4: Move the 36 marketing files into `(site)/[locale]/`**

```bash
mkdir -p "src/app/(site)/[locale]"
cd /Users/mdshahabulalam/myprojects/bdaiwebfirm/bd-ai-web-firm

for d in about careers contact cookies faq portfolio privacy process products quote resources services terms; do
  git mv "src/app/$d" "src/app/(site)/[locale]/$d"
done

for f in page.tsx error.tsx loading.tsx not-found.tsx opengraph-image.tsx; do
  git mv "src/app/$f" "src/app/(site)/[locale]/$f"
done
```

**Do NOT move** `sitemap.ts` (must serve `/sitemap.xml`), `rss.xml/` (must serve `/rss.xml`), `global-error.tsx` (renders its own `<html>`), `analytics.tsx` (an ordinary component), `firebase-messaging-sw.js`, `globals.css`, or the `components/ lib/ utils/ design/ styles/ api/` directories.

- [ ] **Step 5: Delete the old root layout and MarketingChrome**

```bash
git rm src/app/layout.tsx
git rm src/app/components/MarketingChrome.tsx
```

`MarketingChrome` existed only to hide chrome on `/admin` and `/portal` via a client-side `usePathname` check. The route-group split makes that structural, so the component and its client-side branch are dead. Verify nothing still imports it:

```bash
grep -rn "MarketingChrome" src/ || echo "CLEAN: no references"
```

Expected: `CLEAN: no references`

- [ ] **Step 6: Fix the two `globals.css` import paths**

Only `(internal)/layout.tsx` (`../globals.css`) and `(site)/[locale]/layout.tsx` (`../../globals.css`) import it. Confirm exactly one import of `globals.css` per root layout and no others:

```bash
grep -rn "globals.css" src/app --include="*.tsx"
```

Expected: exactly 2 hits, one per root layout.

- [ ] **Step 7: Verify the gate**

```bash
npm run lint && npm run type-check && npm test 2>&1 | tail -5
```

Expected: all green.

- [ ] **Step 8: Verify every route still resolves**

```bash
npm run build 2>&1 | tail -40
```

Expected: build succeeds. In the route table, confirm:
- `/` and `/bn` both listed
- `/services` and `/bn/services` both listed
- `/admin`, `/portal` listed **without** a locale prefix
- `/sitemap.xml` and `/rss.xml` listed at the **root**, NOT under `/en/` or `/[locale]/`

**If `/sitemap.xml` appears as `/en/sitemap.xml`, STOP** — the sitemap moved by mistake and search engines would lose it.

- [ ] **Step 9: Commit**

```bash
git add -A src/app
git commit -m "refactor(i18n): split app into (site)/[locale] and (internal) route groups

Next.js requires the root layout to render html/body. Bengali pages need
<html lang=bn> plus the Bengali font while /admin and /portal must stay
lang=en and never be locale-negotiated — one root layout cannot do both.

- (site)/[locale]/  → marketing, <html lang={locale}>, Anek Bangla, next-intl
- (internal)/       → admin + portal, <html lang=en>, no chrome, noindex
- sitemap.ts, rss.xml/, global-error.tsx stay at root by design

Deletes MarketingChrome: hiding chrome on /admin was a client-side
usePathname branch; the route group now does it structurally.

No copy changes. No URL changes. /bn/* renders English until stage 3.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Compose the middleware

**Files:**
- Modify: `src/middleware.ts`
- Test: `src/__tests__/middleware.test.ts`

**Interfaces:**
- Consumes: `routing` (Task 2), existing `authConfig` from `@/auth.config`
- Produces: locale negotiation on marketing routes; admin auth gate preserved byte-for-byte in behaviour

**Critical:** the current middleware gates the admin dashboard. A regression here locks the founder out. The existing behaviour — unauthenticated `/admin/*` → redirect `/admin/login`; unauthenticated `/api/admin/*` → JSON 401 — must survive exactly.

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/middleware.test.ts`. Note the docblock: `NextRequest` needs the node environment, but this repo's Jest default is `jsdom`.

```ts
/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import middleware from '@/middleware';

function request(path: string, opts: { acceptLanguage?: string; cookie?: string } = {}) {
  const headers = new Headers();
  if (opts.acceptLanguage) headers.set('accept-language', opts.acceptLanguage);
  if (opts.cookie) headers.set('cookie', `NEXT_LOCALE=${opts.cookie}`);
  return new NextRequest(new URL(`https://www.craftsai.org${path}`), { headers });
}

describe('locale negotiation', () => {
  it('sends a Bengali-preferring visitor to /bn', async () => {
    const res = await middleware(request('/', { acceptLanguage: 'bn-BD,bn;q=0.9,en;q=0.8' }));
    expect(res.headers.get('location')).toContain('/bn');
  });

  it('leaves an English-preferring visitor unprefixed', async () => {
    const res = await middleware(request('/', { acceptLanguage: 'en-US,en;q=0.9' }));
    expect(res.headers.get('location')).toBeNull();
  });

  it('lets the cookie beat the Accept-Language header', async () => {
    const res = await middleware(
      request('/', { acceptLanguage: 'bn-BD,bn;q=0.9', cookie: 'en' })
    );
    expect(res.headers.get('location')).toBeNull();
  });
});

describe('routes that must never be localized', () => {
  it.each(['/api/contact', '/api/quote'])('passes %s through untouched', async (path) => {
    const res = await middleware(request(path, { acceptLanguage: 'bn-BD,bn;q=0.9' }));
    expect(res.headers.get('location')).toBeNull();
    expect(res.headers.get('x-middleware-rewrite')).toBeNull();
  });

  it('never sends a Bengali-preferring visitor to /bn/portal', async () => {
    const res = await middleware(request('/portal', { acceptLanguage: 'bn-BD,bn;q=0.9' }));
    expect(res.headers.get('location') ?? '').not.toContain('/bn');
  });
});

describe('admin auth gate (must not regress)', () => {
  it('redirects an unauthenticated admin page to /admin/login', async () => {
    const res = await middleware(request('/admin'));
    expect(res.headers.get('location')).toContain('/admin/login');
  });

  it('does not redirect /admin/login itself', async () => {
    const res = await middleware(request('/admin/login'));
    expect(res.headers.get('location')).toBeNull();
  });

  it('returns JSON 401 for an unauthenticated admin API', async () => {
    const res = await middleware(request('/api/admin/leads'));
    expect(res.status).toBe(401);
  });

  it('never locale-prefixes an admin route', async () => {
    const res = await middleware(request('/admin', { acceptLanguage: 'bn-BD,bn;q=0.9' }));
    expect(res.headers.get('location') ?? '').not.toContain('/bn');
  });
});
```

- [ ] **Step 2: Run to verify they fail**

```bash
npx jest src/__tests__/middleware.test.ts
```

Expected: FAIL — locale tests fail because the current middleware has no i18n.

- [ ] **Step 3: Rewrite `src/middleware.ts`**

```ts
import NextAuth from 'next-auth';
import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import authConfig from '@/auth.config';
import { routing } from '@/i18n/routing';

// Edge-safe auth instance (JWT verification only, no Prisma) for gating routes.
const { auth } = NextAuth(authConfig);
const handleI18nRouting = createMiddleware(routing);

/** Admin gate — behaviour preserved verbatim from the pre-i18n middleware. */
const handleAdminAuth = auth((req) => {
  const { pathname } = req.nextUrl;

  const isAdminPage = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login');
  const isAdminApi =
    pathname.startsWith('/api/admin') &&
    !pathname.startsWith('/api/admin/auth') &&
    !pathname.startsWith('/api/admin/login');

  if (!isAdminPage && !isAdminApi) return NextResponse.next();
  if (req.auth?.user?.email) return NextResponse.next();

  if (isAdminApi) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = '/admin/login';
  return NextResponse.redirect(url);
});

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Admin: auth gate only. Never locale-negotiated.
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    return handleAdminAuth(req, undefined as never);
  }

  // 2. Portal and all other APIs: neither gated here nor localized.
  if (pathname.startsWith('/portal') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // 3. Everything else is marketing → locale routing.
  return handleI18nRouting(req);
}

export const config = {
  // Skip Next internals and any path with a file extension (static assets).
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
```

**Typing warning — do not paper over this.** `handleAdminAuth(req, undefined as never)` is a workaround for NextAuth v5's `auth()` returning a handler typed for `(req: NextAuthRequest, ctx: AppRouteHandlerFnContext)`. The repo standard forbids `any`/`unknown` casts. Before accepting this line, try calling `handleAdminAuth(req)` directly and see whether `type-check` passes. **If a cast is genuinely unavoidable, STOP and report it for approval** rather than committing it quietly.

- [ ] **Step 4: Run to verify they pass**

```bash
npx jest src/__tests__/middleware.test.ts
```

Expected: PASS — all 10 tests.

- [ ] **Step 5: Verify the full gate**

```bash
npm run lint && npm run type-check && npm test 2>&1 | tail -5
```

Expected: all green, including the pre-existing admin/portal suites.

- [ ] **Step 6: Commit**

```bash
git add src/middleware.ts src/__tests__/middleware.test.ts
git commit -m "feat(i18n): compose locale routing with the existing auth middleware

Dispatcher, not a merge — the two match disjoint paths:
  /admin, /api/admin  -> existing NextAuth gate, never localized
  /portal, /api/*     -> passthrough
  everything else     -> next-intl locale routing

Precedence on marketing routes: NEXT_LOCALE cookie > Accept-Language > en.
Tests cover the admin gate explicitly so this refactor cannot silently
regress dashboard access.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Bengali typography

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `--font-anek-bangla` (declared in `(site)/[locale]/layout.tsx`, Task 4)
- Produces: `:lang(bn)` font swap + optical corrections

**Context:** `globals.css:73-75` currently declares `--font-display: var(--font-space-grotesk)`, `--font-sans: var(--font-instrument-sans)`, `--font-mono: var(--font-jetbrains-mono)`. Note the variable is `--font-sans`, **not** `--font-body`.

- [ ] **Step 1: Add the `:lang(bn)` block to `globals.css`**

Add after the existing font-variable declarations:

```css
/* ---- Bengali (bn) ----------------------------------------------------
 * Space Grotesk / Instrument Sans have zero Bengali glyphs; without this
 * swap the browser silently substitutes a system font (Vrinda on Windows,
 * Bangla MN on macOS) and the type system falls apart on exactly the pages
 * meant for Bangladeshi readers.
 *
 * Anek Bangla is variable with a wdth axis (75-125), which is what lets the
 * hero keep its Archivo-Expanded gesture. Mono stays Latin: the drafting
 * labels ("fig. 01 — sheet 1 of 4") are brand ornament, not prose.
 * -------------------------------------------------------------------- */
:lang(bn) {
  --font-display: var(--font-anek-bangla);
  --font-sans: var(--font-anek-bangla);
}

/* Bengali renders optically smaller and taller than Latin at identical
 * font-size — measured against the real hero copy in a live browser, not
 * assumed. Body copy needs a nudge up and looser leading for the matra. */
:lang(bn) body {
  font-size: 1.0625em;
  line-height: 1.75;
}

/* Bengali has no letter case, so text-transform: uppercase is a silent
 * no-op on Bengali text. Do NOT neutralise `.uppercase` globally under
 * :lang(bn) — the mono drafting labels ("FIG. 01 — SHEET 1 OF 4") stay
 * English on Bengali pages by design, and a blanket rule would strip
 * their uppercase too. :lang() matches by inherited language, so those
 * labels must instead be marked lang="en" at their source (stage 2/3,
 * when they get extracted); the selector below then skips them.
 *
 * Letter-spacing IS worth relaxing: tracking tuned for Latin caps crowds
 * Bengali conjuncts. Scope it to elements actually carrying Bengali. */
:lang(bn) :not([lang="en"]).tracking-\[0\.15em\],
:lang(bn) :not([lang="en"]).tracking-\[0\.2em\] {
  letter-spacing: 0.04em;
}
```

**Implementer note:** Stage 1 renders no Bengali copy, so this rule is currently
inert — it exists so Stage 3 does not have to retrofit it. Do **not** add a
blanket `:lang(bn) .uppercase { text-transform: none }`; it is wrong for the
reason above. If Tailwind v4's escaping of arbitrary-value class selectors
makes the selectors above fail, report it rather than falling back to a
blanket rule.

- [ ] **Step 2: Verify the gate**

```bash
npm run lint && npm run type-check && npm test 2>&1 | tail -5
```

Expected: all green.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(i18n): Bengali font swap and optical corrections

:lang(bn) swaps display/sans to Anek Bangla. Mono stays Latin — the
drafting labels are ornament, not prose. Bengali renders optically
smaller and taller than Latin at the same size, so body copy gets a size
nudge and looser leading, and uppercase is neutralised because Bengali
has no letter case.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: The EN/BN toggle

**Files:**
- Create: `src/app/components/layout/LocaleToggle.tsx`
- Modify: `src/app/components/layout/Header.tsx`, `src/app/components/layout/MobileMenu.tsx`
- Test: `src/app/components/layout/__tests__/LocaleToggle.test.tsx`

**Interfaces:**
- Consumes: `Link`, `usePathname` from `@/i18n/navigation`; `useLocale` from `next-intl`
- Produces: `LocaleToggle` — `({ className?: string }) => JSX.Element`

**Design:** two-segment control matching the existing header idiom — `font-mono text-xs uppercase tracking-[0.15em]`, amber (`text-signal`) active state — the same visual family as the existing Services dropdown at `Header.tsx:67-76`. Not a `<select>`; two locales don't warrant a dropdown.

- [ ] **Step 1: Write the failing test**

Create `src/app/components/layout/__tests__/LocaleToggle.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import LocaleToggle from '../LocaleToggle';

jest.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, locale, ...rest }: React.PropsWithChildren<{ href: string; locale?: string }>) => (
    <a href={locale === 'bn' ? `/bn${href}` : href} {...rest}>{children}</a>
  ),
  usePathname: () => '/services',
}));

const messages = {
  LocaleToggle: {
    label: 'Language',
    switchToEnglish: 'Switch to English',
    switchToBengali: 'Switch to Bengali',
  },
};

function renderAt(locale: string) {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LocaleToggle />
    </NextIntlClientProvider>
  );
}

describe('LocaleToggle', () => {
  it('offers Bengali when the visitor is on English', () => {
    renderAt('en');
    expect(screen.getByRole('link', { name: /Switch to Bengali/i })).toBeInTheDocument();
  });

  it('keeps the visitor on the same page when switching', () => {
    renderAt('en');
    expect(screen.getByRole('link', { name: /Switch to Bengali/i })).toHaveAttribute(
      'href',
      '/bn/services'
    );
  });

  it('marks the active locale for assistive tech', () => {
    renderAt('en');
    expect(screen.getByText('EN')).toHaveAttribute('aria-current', 'true');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npx jest src/app/components/layout/__tests__/LocaleToggle.test.tsx
```

Expected: FAIL — `Cannot find module '../LocaleToggle'`

- [ ] **Step 3: Create `LocaleToggle.tsx`**

```tsx
'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

const LOCALES = [
  { code: 'en', short: 'EN' },
  { code: 'bn', short: 'BN' },
] as const;

interface LocaleToggleProps {
  className?: string;
}

/**
 * EN/BN segmented control. Renders real anchors (not a router-push button)
 * so the switch works without JS and is crawlable. `usePathname` from
 * @/i18n/navigation returns the locale-stripped path, so switching from
 * /bn/services lands on /services rather than the homepage.
 */
export default function LocaleToggle({ className = '' }: LocaleToggleProps) {
  const active = useLocale();
  const pathname = usePathname();
  const t = useTranslations('LocaleToggle');

  return (
    <div
      className={`flex items-center border border-line ${className}`}
      role="group"
      aria-label={t('label')}
    >
      {LOCALES.map(({ code, short }) => {
        const isActive = code === active;

        if (isActive) {
          return (
            <span
              key={code}
              aria-current="true"
              className="bg-signal px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-950"
            >
              {short}
            </span>
          );
        }

        return (
          <Link
            key={code}
            href={pathname}
            locale={code}
            hrefLang={code}
            aria-label={code === 'bn' ? t('switchToBengali') : t('switchToEnglish')}
            className="px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-bone transition-colors duration-150 hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
          >
            {short}
          </Link>
        );
      })}
    </div>
  );
}
```

next-intl's `Link` sets the `NEXT_LOCALE` cookie on navigation, which is what makes the choice outlive the session and stop `Accept-Language` detection from firing again.

- [ ] **Step 4: Run to verify it passes**

```bash
npx jest src/app/components/layout/__tests__/LocaleToggle.test.tsx
```

Expected: PASS — 3 tests.

- [ ] **Step 5: Mount it in the desktop header**

In `src/app/components/layout/Header.tsx`, add the import:

```tsx
import LocaleToggle from './LocaleToggle';
```

Then in the CTA cluster at `Header.tsx:106-109`, put the toggle **before** the buttons so it reads left-to-right as `[EN|BN] [Get estimate] [Start a project]`:

```tsx
<div className="hidden items-center gap-3 lg:flex">
  <LocaleToggle />
  <Button variant="ghost" href="/quote">Get estimate</Button>
  <Button variant="signal" href="/contact">Start a project</Button>
</div>
```

- [ ] **Step 6: Mount it in the mobile menu**

The desktop cluster is `hidden lg:flex`, so mobile visitors would have no toggle at all. Read `src/app/components/layout/MobileMenu.tsx` and place `<LocaleToggle />` alongside its primary nav links, following that file's existing spacing idiom.

- [ ] **Step 7: Verify the gate**

```bash
npm run lint && npm run type-check && npm test 2>&1 | tail -5
```

Expected: all green.

- [ ] **Step 8: Commit**

```bash
git add src/app/components/layout
git commit -m "feat(i18n): EN/BN toggle in header and mobile menu

Segmented control matching the existing mono/uppercase header idiom.
Renders real anchors so it works without JS and is crawlable, and uses
next-intl's locale-aware pathname so switching from /bn/services lands on
/services rather than the homepage. next-intl's Link sets NEXT_LOCALE, so
the choice outlives the session and stops geo-detection re-firing.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Verify the 404 path

**Why this is its own task:** `app/not-found.tsx` is a known friction point with multiple root layouts. Next.js renders it for unmatched global URLs, but with no `app/layout.tsx` there may be no root layout to supply `<html>`/`<body>`. The spec flags this as an unknown that must be **exercised, not assumed**.

**Files:**
- Verify: `src/app/(site)/[locale]/not-found.tsx`
- Possibly create: `src/app/not-found.tsx`

- [ ] **Step 1: Build and probe an unmatched URL**

```bash
lsof -ti:3000 | xargs kill -9 2>/dev/null
npm run build && npm run start > /tmp/i18n-404.log 2>&1 &
sleep 10
```

- [ ] **Step 2: Check the server log for a render failure**

**Do not use `curl`, `wget`, or any HTTP-client one-liner here.** The repo standard
forbids them for verifying pages, and asks the user first if you think you need one.
The 404's actual status and appearance get judged in a real browser at Step 4.

What this step catches is the crash case, which shows up in the server log:

```bash
grep -iE "error|Cannot read|is not a function|ENOENT" /tmp/i18n-404.log | head -10 \
  || echo "clean boot - no render errors"
```

Expected: `clean boot - no render errors`.

If the log shows an error mentioning a missing root layout, `<html>`, or `<body>` while
rendering `not-found`, that is the known multi-root-layout friction — go to Step 3.
Otherwise go straight to Step 4 and judge the 404 in the browser.

- [ ] **Step 3: If it returns 500, add a self-contained root not-found**

Create `src/app/not-found.tsx` rendering its own shell, exactly as `global-error.tsx` already does:

```tsx
import Link from 'next/link';

/** Global 404 for URLs matching no route group. Renders its own html/body
 *  because with multiple root layouts there is no root layout to inherit. */
export default function GlobalNotFound() {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-ink-950 text-bone">
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">404</p>
          <h1 className="font-display text-3xl">This page does not exist.</h1>
          <Link href="/" className="font-mono text-xs uppercase tracking-[0.15em] text-bone underline hover:text-signal">
            Back to home
          </Link>
        </main>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Verify in a visible browser**

**Ask the user for permission first.** Then, via Playwright MCP in a visible Chromium window, visit `http://localhost:3000/definitely-not-a-real-page` and `http://localhost:3000/bn/definitely-not-a-real-page`. Screenshot both. Confirm a styled 404 renders — not an unstyled white page and not a stack trace.

Per repo policy, **analyze each screenshot for UI problems and fix them before proceeding.** State the verdict explicitly.

- [ ] **Step 5: Stop the server**

```bash
lsof -ti:3000 | xargs kill -9 2>/dev/null
```

- [ ] **Step 6: Commit (only if Step 3 was needed)**

```bash
git add src/app/not-found.tsx
git commit -m "fix(i18n): self-contained global 404 for the multi-root-layout split

With two root layouts and no app/layout.tsx there is no root layout for
app/not-found.tsx to inherit, so it renders its own html/body shell the
same way global-error.tsx already does.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: End-to-end verification

**Files:**
- Create: `e2e/i18n-routing.spec.ts`

**Context:** `playwright.config.ts` has `testDir: './e2e'` and starts `npm run dev` automatically unless `E2E_BASE_URL` is set. Existing specs: `authenticated-flows.spec.ts`, `process-page.spec.ts`, `public-forms.spec.ts`.

- [ ] **Step 1: Write the E2E spec**

Create `e2e/i18n-routing.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.describe('locale routing', () => {
  test('English is served unprefixed', async ({ page }) => {
    await page.goto('/services');
    expect(page.url()).not.toContain('/bn');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('Bengali is served under /bn with lang=bn', async ({ page }) => {
    await page.goto('/bn/services');
    await expect(page.locator('html')).toHaveAttribute('lang', 'bn');
  });

  test('the toggle keeps the visitor on the same page', async ({ page }) => {
    await page.goto('/services');
    await page.getByRole('link', { name: /Switch to Bengali/i }).click();
    await expect(page).toHaveURL(/\/bn\/services$/);
  });

  test('the chosen locale survives a reload', async ({ page }) => {
    await page.goto('/services');
    await page.getByRole('link', { name: /Switch to Bengali/i }).click();
    await expect(page).toHaveURL(/\/bn\/services$/);
    await page.goto('/');
    await expect(page).toHaveURL(/\/bn$/);
  });

  test('admin is never locale-prefixed', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/login/);
    expect(page.url()).not.toContain('/bn');
  });
});

test.describe('Accept-Language detection', () => {
  test.use({ locale: 'bn-BD' });

  test('a Bengali-preferring first-time visitor lands on /bn', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/');
    await expect(page).toHaveURL(/\/bn$/);
  });
});
```

- [ ] **Step 2: Run the E2E suite**

```bash
npx playwright test e2e/i18n-routing.spec.ts
```

Expected: 6 passed.

- [ ] **Step 3: Verify existing E2E specs did not regress**

```bash
npx playwright test
```

Expected: all green, including `authenticated-flows.spec.ts` — which exercises the admin auth the middleware refactor touched.

- [ ] **Step 4: Visible browser verification**

**Ask the user for permission first**, then drive a visible Chromium via Playwright MCP:

1. Load `/` — confirm the English site is visually **unchanged** from today.
2. Click BN — confirm the URL becomes `/bn`, the page stays on the same route, and copy is still English (correct for Stage 1).
3. On `/bn`, confirm `<html lang="bn">` and that **Anek Bangla is loaded** — the toggle's own `aria-label` is the only Bengali string on the page:
   ```js
   document.fonts.check('800 40px "Anek Bangla"')
   ```
4. Resize to 390px wide and confirm the toggle is reachable in the mobile menu.
5. Screenshot each state.

**Analyze every screenshot for UI problems and fix them before claiming done.** The specific risk to look for: the toggle is a new element in a fixed-height 64px header — check it does not crowd the CTAs or wrap at tablet widths.

- [ ] **Step 5: Commit**

```bash
git add e2e/i18n-routing.spec.ts
git commit -m "test(i18n): e2e coverage for locale routing and the toggle

Covers: English unprefixed, Bengali under /bn with lang=bn, toggle keeps
the current route, cookie persists across navigation, admin never
locale-prefixed, and Accept-Language detection for a first-time visitor.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Stage 1 Definition of Done

- [ ] `npm run lint`, `npm run type-check`, `npm test`, `npx playwright test` all green
- [ ] `npm run build` succeeds; route table shows `/sitemap.xml` and `/rss.xml` at the **root**
- [ ] `/services`, `/admin`, `/portal` resolve exactly as before — no URL changed
- [ ] `/bn/services` resolves, renders `<html lang="bn">`, English copy (correct for Stage 1)
- [ ] Anek Bangla loads on `/bn`, confirmed via `document.fonts.check` in a real browser
- [ ] Admin auth gate verified unbroken in a visible browser, not just by tests
- [ ] Toggle present and usable at desktop **and** mobile widths
- [ ] A hard 404 renders styled, at both `/nonsense` and `/bn/nonsense`
- [ ] Zero user-facing copy changed anywhere in the stage's diff

## Handoff to Stage 2

Stage 2 (extract ~8,750 words into `messages/en.json`) gets its own plan, written once this structure exists — its task boundaries depend on the final file layout.

Carry forward these open items from the spec:
- **§8.5 AIChatbot** — founder decision still open: locale-aware keyword matcher, or scope the chatbot out of Bengali. Blocks Stage 3, not Stage 2.
- **§8.1 legal pages** — decide canonical source (orphaned `content/legal/*.mdx` vs inline JSX) before translating, or the copy gets translated twice.
- **§8.2 API error codes** — `/api/contact` and `/api/quote` return English prose; must return codes before Bengali forms work.
