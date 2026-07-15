# Bilingual English / Bengali — Design

**Date:** 2026-07-14
**Status:** Approved for planning
**Scope:** Public marketing pages only. `/admin` and `/portal` stay English-only.

---

## 1. Goal

Serve the CraftsAI marketing site in English (default) and Bengali. A visitor whose
browser prefers Bengali lands on the Bengali site automatically on first visit; anyone
can switch with an EN/BN toggle in the header, and that choice is remembered permanently.

Both language versions are independently indexable so Bengali pages can rank for
Bengali-language searches.

---

## 2. Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Scope | Marketing pages only | `/admin` is single-user (the founder); `/portal` is not yet BD-client-heavy. Revisit portal later. |
| URL scheme | `/bn` prefix, English unprefixed | Both versions indexable + shareable. English URLs unchanged, so existing SEO and backlinks survive. |
| Library | `next-intl` v4.13.2 | Verified peer-compatible with Next `^15.0.0` and React 19. Handles the server→client dictionary handoff that 6 client components need. |
| First-visit default | `Accept-Language` header | Reflects what the visitor *reads*, not where they sit. Works on any host — no geo-IP service, no Vercel/Cloudflare dependency. |
| MDX content | English fallback, `.bn.mdx` opt-in | Publishing is never blocked on translation. |
| Bengali font | Anek Bangla (variable) | Verified: `subsets: [bengali, latin]`, axes `wdth 75–125` + `wght 100–800`. Only candidate reproducing the Archivo-Expanded hero gesture. |
| Layout | Two root layouts via route groups | Keeps `/admin` and `/portal` URLs entirely outside locale logic. |
| Translation authorship | Claude drafts, founder corrects | ~8,750 words. Founder retains final say on voice. |

### Non-goals

- Translating `/admin` or `/portal`.
- Right-to-left support (Bengali is LTR).
- A third locale. The design must not *prevent* one, but no speculative abstraction.
- Machine-translation pipeline at runtime.

---

## 3. Measured surface

Counts observed 2026-07-14 by direct inspection, not estimated:

| Area | Volume |
|---|---|
| UI/page copy in `.tsx` | ~8,750 words / ~1,370 strings across ~84 files |
| MDX content collections | ~5,670 words (7 products, 3 blogs, 3 case studies, 2 guides) |
| JSON content | ~800 words (`faq.json` 15 Q&A; `testimonials.json` unused) |
| **Total translatable** | **~15,200 words** |
| Marketing pages | ~25 of 44 total |
| Client components in scope | 6 (`AIChatbot`, `Header`, `MobileMenu`, `CookieConsent`, `contact`, `quote`) |
| Static `metadata` exports | 22 (marketing) + 5 dynamic `generateMetadata` |

Copy lives predominantly in exported `const` arrays rather than inline JSX, which is what
makes key extraction tractable. The exceptions are called out in §8.

---

## 4. Architecture

### 4.1 Route groups and the two root layouts

Next.js requires the root layout to render `<html>`/`<body>`. Bengali pages need
`<html lang="bn">` plus the Bengali font; `/admin` and `/portal` must stay `lang="en"` and
must never be locale-negotiated. One root layout cannot satisfy both, so the app splits:

```
src/app/
├── (site)/                       ← public marketing
│   └── [locale]/
│       ├── layout.tsx            ← ROOT LAYOUT #1 · <html lang={locale}>
│       ├── page.tsx              ← was src/app/page.tsx
│       ├── error.tsx  loading.tsx  not-found.tsx   ← moved from root
│       ├── opengraph-image.tsx                     ← moved from root
│       ├── about/ careers/ contact/ cookies/ faq/ portfolio/
│       ├── privacy/ process/ products/ quote/ resources/
│       └── services/ terms/
├── (internal)/                   ← never translated
│   ├── layout.tsx                ← ROOT LAYOUT #2 · <html lang="en">
│   ├── admin/
│   └── portal/
├── api/                          ← unchanged (no layout)
├── sitemap.ts                    ← STAYS AT ROOT · must serve /sitemap.xml
├── rss.xml/route.ts              ← STAYS AT ROOT · must serve /rss.xml
├── global-error.tsx              ← STAYS AT ROOT · renders its own <html>
├── components/  lib/  utils/     ← unchanged
└── globals.css
```

**Root-level special files — placement is not uniform, and getting it wrong is silent breakage:**

| File | Placement | Why |
|---|---|---|
| `sitemap.ts` | **stays at root** | Must serve at `/sitemap.xml`. Under `[locale]` it would serve at `/en/sitemap.xml` and search engines would never find it. It is a metadata route, not a page — it needs no layout. Emits both locales internally (§7). |
| `rss.xml/route.ts` | **stays at root** | Same: must serve at `/rss.xml`. Route handlers need no layout. |
| `global-error.tsx` | **stays at root** | Already renders its own `<html lang="en">`, so it is self-contained and layout-independent. |
| `error.tsx`, `loading.tsx` | → `(site)/[locale]/` | Route-scoped UI; belongs with the pages it wraps. |
| `opengraph-image.tsx` | → `(site)/[locale]/` | Bound to the `/` route, which now lives in the group. |
| `not-found.tsx` | → `(site)/[locale]/` **and see below** | |
| `analytics.tsx` | stays | Not a special file — an ordinary imported component. |

**`not-found.tsx` is a known friction point with multiple root layouts.** Next.js renders
`app/not-found.tsx` for unmatched global URLs, but with no `app/layout.tsx` there is no root
layout to provide `<html>`/`<body>` for it. Stage 1 must verify a hard 404 (e.g. `/nonsense-url`)
actually renders rather than erroring. If the root `not-found` cannot render, the fallback is a
root `not-found.tsx` that renders its own `<html>`/`<body>` shell, exactly as `global-error.tsx`
already does. **This must be exercised in a browser, not assumed.**

**Consequence of multiple root layouts:** navigating between the two groups (e.g. `/services` →
`/admin`) triggers a **full page reload** rather than a client-side transition. This is expected
and acceptable — they are effectively separate applications — but it is a real behaviour change
from today and should be confirmed as tolerable, not discovered later.

`src/app/layout.tsx` is **deleted**; its contents split between the two root layouts, with
everything shared extracted into `src/app/components/AppShell.tsx` (fonts, `ErrorBoundary`,
`CrossPlatformWrapper`, `Analytics`, GA consent scripts, `<head>` meta). Each root layout
renders `<AppShell lang={...}>` and adds only what differs:

- `(site)` adds `StructuredData`, `WhatsAppButton`, `AIChatbot`, `CookieConsent`, `NextIntlClientProvider`.
- `(internal)` adds none of those.

**This deletes `MarketingChrome.tsx`.** It currently hides chrome on `/admin`/`/portal` via a
client-side `usePathname` check; the route-group split makes that structural, so the
component and its client-side branch disappear. Net simplification.

### 4.2 Locale resolution

`localePrefix: 'as-needed'` — the default locale carries no prefix:

```
/services      → rewritten internally to /en/services   (browser URL stays /services)
/bn/services   → /bn/services
```

Precedence on a request with no locale prefix:

1. `NEXT_LOCALE` cookie, if present → wins unconditionally.
2. `Accept-Language` header → `bn*` yields Bengali.
3. Default → English.

Once the visitor clicks EN or BN the cookie is set and detection never fires again.
Googlebot sends no Bengali preference, so it always crawls English at `/`, and reaches
`/bn/*` via the sitemap and hreflang tags.

### 4.3 Middleware composition

The existing `src/middleware.ts` is NextAuth-based and matches `/admin/:path*` and
`/api/admin/:path*`. The i18n middleware matches marketing routes. **They do not overlap**,
so this is a dispatcher, not a merge:

```ts
// src/middleware.ts (shape, not final code)
const handleI18n = createMiddleware(routing);
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // 1. Internal areas: existing auth gate, no locale logic.
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    return existingAuthGate(req);   // logic preserved verbatim
  }
  // 2. Portal + all other APIs: neither auth-gated here nor localized.
  if (pathname.startsWith('/portal') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  // 3. Everything else: marketing → locale routing.
  return handleI18n(req);
});

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
```

The existing admin auth behaviour must be preserved exactly: unauthenticated `/admin/*`
redirects to `/admin/login`; unauthenticated `/api/admin/*` returns JSON 401.

**Verification requirement:** the admin auth gate has its own tests/behaviour and must be
re-exercised after this change. A regression here locks the founder out of the dashboard.

### 4.4 next-intl wiring

```
src/i18n/
├── routing.ts    → defineRouting({ locales: ['en','bn'], defaultLocale: 'en',
│                                   localePrefix: 'as-needed' })
├── request.ts    → getRequestConfig: loads messages/${locale}.json
└── navigation.ts → createNavigation(routing) — locale-aware Link/redirect/usePathname
```

```
messages/
├── en.json
└── bn.json
```

Namespaced per page/section, mirroring the component tree (`home.hero.title`,
`services.web.useCases.0.title`, `nav.services`, …). Both files must have identical key
sets; a CI check enforces this (§9).

Server components call `getTranslations()`. The 6 client components receive messages via
`NextIntlClientProvider` in the `(site)` root layout. Only the active locale's messages are
sent to the client — never both.

---

## 5. Typography

```ts
// (site)/[locale]/layout.tsx
const anekBangla = Anek_Bangla({
  variable: '--font-anek-bangla',
  subsets: ['bengali', 'latin'],
  axes: ['wdth'],          // wght is implicit for variable fonts
  display: 'swap',
});
```

Loaded **only in the `(site)` tree**, and the font CSS is emitted for both locales but the
Bengali glyphs are only *used* under `:lang(bn)`. Anek Bangla has no italic (`styles: ['normal']`);
any `<em>` in Bengali must use a non-italic emphasis treatment.

Applied via `globals.css`:

```css
:lang(bn) {
  --font-display: var(--font-anek-bangla);
  --font-body: var(--font-anek-bangla);
}
```

### Optical corrections (observed in the live mockup, not assumed)

Bengali renders optically smaller and taller than Latin at identical `font-size`. Two
corrections are required, both confirmed visually against the real hero copy:

1. **Size:** Bengali needs roughly +1 step. Small UI text (13px buttons, mono labels) is
   where the deficit is most visible.
2. **Line-height:** Bengali ascenders/descenders and the matra (headline stroke) need
   looser leading than the Latin `leading-[1.04]` hero.

The hero's signature `uppercase` + `wdth 125` becomes **`wdth 125` only** under `:lang(bn)` —
Bengali has no letter case, so `text-transform: uppercase` is a silent no-op.

The mono "drafting" labels (`fig. 01 — agent schematic · sheet 1 of 4 …`) stay **English/Latin
in both locales**. They are brand ornament, not prose.

---

## 6. The EN / BN toggle

A client component in `Header.tsx` and `MobileMenu.tsx`. Styled as a two-segment control
matching the mono/uppercase idiom of the existing nav (`JetBrains Mono`, 10px, tracking
`0.15em`, amber active state) — the same visual family as the existing Services dropdown.

Behaviour:

- Renders the *other* locale as the actionable target; current locale reads as active.
- On click: `router.replace(pathname, {locale})` via next-intl navigation, preserving the
  current path and query. `/bn/services` ↔ `/services`, never dumping the user on the homepage.
- Sets the `NEXT_LOCALE` cookie so the choice outlives the session.
- Real `<a href>` under the hood so it works without JS and is crawlable.
- `aria-label` in the target language; `hreflang` on the link.

Not a `<select>`. Two locales don't warrant a dropdown.

---

## 7. SEO

Every page emits both alternates, via a shared helper rather than 22 hand-written blocks:

```tsx
alternates: {
  canonical: locale === 'en' ? `${BASE}${path}` : `${BASE}/bn${path}`,
  languages: {
    en: `${BASE}${path}`,
    bn: `${BASE}/bn${path}`,
    'x-default': `${BASE}${path}`,
  },
}
```

- The 22 hardcoded absolute canonicals are replaced by this helper. Currently every page
  hardcodes `https://www.craftsai.org/...`; `metadataBase` already exists so paths suffice.
- `openGraph.locale`: `en_US` / `bn_BD`.
- `sitemap.ts` emits both locales per route, with `alternates.languages` per entry.
- `rss.xml` stays English-only (feed readers don't negotiate locale).
- **hreflang is only emitted for MDX routes where a `.bn.mdx` actually exists** — advertising a
  Bengali alternate that serves English content is a correctness bug that Search Console flags.
- The root `<link rel="canonical" href="https://www.craftsai.org" />` currently hardcoded in
  `layout.tsx`'s `<head>` is wrong on every non-home page today and must not survive the split.

---

## 8. Known-awkward areas

These are the parts that are *not* mechanical key extraction.

### 8.1 Legal pages — resolve the duplication first

`content/legal/{privacy,terms,cookies}.mdx` (~575 words) exists, is **not registered in
velite.config.ts**, and is **imported by nothing**. Meanwhile `src/app/{privacy,terms,cookies}/page.tsx`
render the same copy as inline JSX prose (~533 words).

Verified 2026-07-14: the `legal` grep hits in `privacy/page.tsx` are the English *word*
"legal" in body prose, not imports. The MDX is genuinely dead.

**Decide canonical source before translating, or the copy gets translated twice.**
Recommendation: delete the orphaned MDX, keep the pages as the source, extract to `en.json`
like everything else. Legal copy is not blog content and does not benefit from MDX.

### 8.2 API routes return English prose

`/api/contact` and `/api/quote` return rendered English strings (`'Name must be at least 2
characters'`, `"Your message has been sent successfully! We'll get back to you within 24
hours."`). A Bengali visitor with a translated UI would receive English errors.

Both routes must return **stable error codes**; the client maps codes → translated messages.
Validation messages are currently duplicated between client and server
(`quote/page.tsx:134-169` mirrors `api/quote/route.ts:37-58`) — the code refactor should
collapse that duplication rather than translate it twice.

Note: neither public form uses Zod today (Zod is only in admin/portal auth). Introducing Zod
here is *in scope* for the error-code refactor per the repo's validation standard, but must
not expand into reworking the form UX.

### 8.3 Date and number formatting

`toLocaleDateString('en-US')` is hardcoded in 5 files: `resources/page.tsx:70`,
`resources/blog/page.tsx:27`, `resources/blog/[slug]/page.tsx:45`, `resources/guides/page.tsx:27`,
`resources/guides/[slug]/page.tsx:43`. All must become locale-aware via next-intl's formatter.

**Numerals:** dates in Bengali use Bengali numerals (০১২৩) via `Intl` with locale `bn`. This is
correct and expected. But `src/app/lib/money.ts:24` (`toLocaleString('en-US')`) drives
**invoice/currency rendering in the portal**, which is out of scope and must not be touched —
changing it would alter financial documents. Leave `money.ts` alone.

### 8.4 MDX localization

Velite schemas gain an optional locale discriminator via filename convention:

```
content/blogs/foo.mdx      → English, always
content/blogs/foo.bn.mdx   → Bengali, optional
```

Resolution for `/bn/resources/blog/foo`: serve `foo.bn.mdx` if present; else serve `foo.mdx`
with a dismissible "This article is in English" notice, and **no** `hreflang=bn` for that URL.

`content/faq/faq.json` (15 Q&A) moves to locale-keyed structure.
`content/testimonials/testimonials.json` has **zero consumers** — do not translate it; flag for
deletion separately.

### 8.5 AIChatbot

~590 words of canned English Q&A responses — the single largest component copy block. Its
responses are keyword-matched against English input. A Bengali user typing Bengali will match
nothing and fall through to the default response.

**Translating the strings is not sufficient for this component to work in Bengali.** Either the
keyword matcher becomes locale-aware, or the chatbot is explicitly scoped out of Bengali for
now (rendered English-only, or hidden under `/bn`). Decide during Stage 3; do not silently
ship a Bengali chatbot that never matches.

---

## 9. Testing and verification

Existing gates (`npm run lint`, `npm test`, `npm run type-check`) must stay green at every stage.

Added:

- **Message parity test** (Jest): `en.json` and `bn.json` have identical key sets, recursively.
  Prevents a missing Bengali key silently rendering a raw key string in production.
- **Middleware tests**: cookie beats `Accept-Language`; `bn-BD` → `/bn`; `en-US` → `/`;
  `/admin` and `/api/*` are never locale-rewritten.
- **Admin auth regression**: unauthenticated `/admin/*` → `/admin/login`; unauthenticated
  `/api/admin/*` → JSON 401. Must pass unchanged after the middleware refactor.
- **E2E (Playwright)**: toggle from `/services` lands on `/bn/services`, not `/bn`; cookie
  persists across reload.
- **Visible browser verification** per repo standard at each stage — headed Chromium, observed,
  screenshots reviewed for layout breakage under Bengali text (which runs longer than English
  and will stress fixed-width buttons and nav).

**Explicit risk:** Bengali strings are typically longer than their English equivalents. Every
fixed-width or `whitespace-nowrap` element is a potential overflow. This must be checked
visually, not assumed from passing tests.

---

## 10. Staging

Four reviewable stages. Each ends green and shippable.

| Stage | Deliverable | Copy changes? |
|---|---|---|
| **1 — Foundation** | Route groups, two root layouts, `AppShell` extraction, `MarketingChrome` deletion, middleware composition, next-intl wiring, Anek Bangla, EN/BN toggle. Site remains 100% English; `/bn` renders English. | None |
| **2 — Extraction** | All English copy → `messages/en.json`. Pure refactor, zero behaviour change. | None |
| **3 — Bengali** | `bn.json` drafts, legal-page resolution, API error codes, AIChatbot decision. | Yes |
| **4 — Polish** | hreflang helper, sitemap, MDX fallback, date formatting. | No |

Stage 1 is the risky one: it touches the root layout, on which every page depends, and the
auth middleware, which gates the dashboard. It carries no copy changes precisely so that a
failure there is unambiguous.

---

## 11. Rollback

Each stage is a separate commit on a feature branch. Stage 1 is the only one that is
structurally hard to revert (file moves); Stages 2–4 are additive.

Per repo standard, `main` may carry uncommitted WIP — **audit the dirty tree before starting**
and prefer the worktree + PR flow over a local merge, since Stage 1 moves ~25 page files and
would conflict violently with any WIP on those paths.

---

## 12. Open question for the founder

**AIChatbot in Bengali** (§8.5) — translate the strings and make the matcher locale-aware, or
scope the chatbot out of the Bengali site for now? Deferred to Stage 3; not a blocker for
Stages 1–2.
