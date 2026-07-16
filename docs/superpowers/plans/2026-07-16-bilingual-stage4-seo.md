# Bilingual EN/BN — Stage 4: SEO (per-locale canonicals, hreflang, OG, sitemap, JSON-LD)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps `- [ ]`.

**Goal:** Make the bilingual site's SEO signals coherent and per-locale so Google indexes and ranks BOTH the English and Bengali versions: per-locale canonicals, hreflang alternates, locale-aware OpenGraph, a bilingual sitemap, and locale-aware JSON-LD.

**Architecture:** A single shared helper builds per-locale `alternates` (canonical + `languages` hreflang map) + `openGraph` locale/url from a page's unprefixed path + locale. Every page's `generateMetadata` calls it instead of hardcoding an English canonical. hreflang is emitted via `metadata.alternates.languages` (standard `<link rel="alternate" hreflang>` tags) — next-intl's `alternateLinks` STAYS OFF so we don't double-emit. Sitemap gains both locales with per-entry hreflang. StructuredData becomes locale-aware.

**Spec:** `docs/superpowers/specs/2026-07-14-bilingual-en-bn-design.md` (§7 SEO)
**Predecessor:** Stages 1/2/3a/3b merged (PR #5/#8/#9/#10). `/bn` is fully Bengali; `localeDetection` ON; `alternateLinks` OFF (this stage is exactly why it was left off). Start from `main`.

## Why this stage is coupled (do it as one unit)

Stage 3b left `alternateLinks` OFF because `/bn` pages emit an ENGLISH canonical — advertising `hreflang=bn` while the canonical points at the English URL tells Google "the real page is the English one" and it drops the Bengali page. So hreflang can ONLY go on once canonicals are per-locale. That is Task 1. Everything else (OG, sitemap, JSON-LD) is the same "make the per-locale signal coherent" work.

## Current state (measured 2026-07-16)

- **16 pages** hardcode `alternates: { canonical: 'https://www.craftsai.org/<path>' }` (English) in `generateMetadata`.
- Root `layout.tsx` sets static `openGraph.locale: 'en_US'` for all pages.
- `sitemap.ts`: 25 English-only URL entries, no `alternates.languages`.
- `StructuredData.tsx` ('use client'): uses `next/navigation` `usePathname` (locale-blind — sees `/bn/...`), hardcoded English descriptions, no `inLanguage`.
- `alternateLinks: false`, `localeDetection: true` in `src/i18n/routing.ts`.
- `BASE = https://www.craftsai.org`. English is unprefixed; Bengali is `/bn`-prefixed (`localePrefix: 'as-needed'`).

## Global Constraints

- **ZERO user-visible copy change.** This is metadata/`<head>`/sitemap/JSON-LD only. No rendered body text changes.
- **`/en` canonical must stay `${BASE}/<path>`** (unchanged); only `/bn` canonical changes from the English URL to `${BASE}/bn/<path>`.
- TypeScript strict, no `any`/`unknown`. NEVER git checkout--/restore/stash/reset --hard — undo with Edit. `npm run type-check` not npx tsc. No prettier.
- Do NOT touch `(internal)/`, `analytics.tsx`, `messages/` VALUES (you may ADD a `Meta`/JSON-LD key if StructuredData needs localized copy), or other apps.
- Gates each task: `npm test` (baseline **31 suites / 146 tests**), COLD `npm run build` (`rm -rf .next`, exit 0, **110/110**, **85 SSG routes** — SEO metadata must NOT flip a route dynamic).
- The **5 dynamic `[slug]` pages** (`products/[slug]`, `resources/{blog,case-studies,guides}/[slug]`, `portfolio/[slug]`) also need the per-locale canonical/hreflang — they have their own `generateMetadata`; apply the helper there too.

---

## Task 1: The alternates helper + per-locale canonical & hreflang on every page

**THE load-bearing SEO fix.** Build a helper and apply it to every marketing page's `generateMetadata`.

**Files:**
- Create: `src/app/lib/seo.ts` (or `src/i18n/seo.ts` — near the i18n config)
- Modify: all ~16 static-metadata pages + the 5 dynamic `[slug]` pages under `(site)/[locale]/`
- Test: `src/app/lib/__tests__/seo.test.ts`

**The helper:**

```ts
import { routing } from '@/i18n/routing';

const BASE = 'https://www.craftsai.org';

/** Per-locale canonical + hreflang alternates for a page at the given UNPREFIXED
 *  path (e.g. '/about', or '' for home). English is unprefixed; Bengali is /bn.
 *  Emitted as metadata.alternates -> <link rel="canonical"> + <link rel="alternate" hreflang>. */
export function localeAlternates(path: string, locale: string) {
  const clean = path === '/' ? '' : path;                     // home is ''
  const en = `${BASE}${clean}`;
  const bn = `${BASE}/bn${clean}`;
  return {
    canonical: locale === 'bn' ? bn : en,                     // each page canonical to ITSELF
    languages: { en, bn, 'x-default': en },                   // x-default -> English
  };
}

/** OpenGraph locale + url for a page. */
export function localeOpenGraph(path: string, locale: string) {
  const clean = path === '/' ? '' : path;
  return {
    locale: locale === 'bn' ? 'bn_BD' : 'en_US',
    url: locale === 'bn' ? `${BASE}/bn${clean}` : `${BASE}${clean}`,
  };
}
```

- [ ] **Step 1: TDD the helper.** Test: `localeAlternates('/about','en').canonical === BASE+'/about'`; `localeAlternates('/about','bn').canonical === BASE+'/bn/about'`; `.languages` has en/bn/x-default correct; home path `'/'` produces `BASE` (not `BASE/`). Write failing, implement, pass.
- [ ] **Step 2: Apply to each static-metadata page.** In each `generateMetadata`, replace the hardcoded `alternates: { canonical: '...' }` with `alternates: localeAlternates('/about', locale)`, and set `openGraph: { ...existingOG, ...localeOpenGraph('/about', locale) }` (merge — keep title/description/siteName). Use the page's real unprefixed path. Do ONE page, verify the built HTML, then repeat.
- [ ] **Step 3: Apply to the 5 dynamic `[slug]` pages.** Their path includes the slug: `localeAlternates('/products/'+slug, locale)`.
- [ ] **Step 4: Verify the built HTML per-locale.** After a cold build:
  - `/en/about.html`: `<link rel="canonical" href=".../about">`, `hreflang="en" .../about`, `hreflang="bn" .../bn/about`, `hreflang="x-default" .../about`, `og:locale en_US`.
  - `/bn/about.html`: `<link rel="canonical" href=".../bn/about">` (NOT .../about), same three hreflang, `og:locale bn_BD`.
  Grep and paste the evidence. This is the whole point — the `/bn` canonical must now point at itself.
- [ ] **Step 5: Full gate + commit** (`feat(i18n): per-locale canonicals + hreflang alternates on every page`).

## Task 2: Bilingual sitemap

**Files:** Modify `src/app/sitemap.ts`.

Emit BOTH locales. Either two entries per page (en URL + bn URL) OR one entry per page with `alternates: { languages: { en, bn } }` (Next's `MetadataRoute.Sitemap` supports per-entry `alternates.languages`). Prefer the `alternates.languages` form — it's the hreflang-sitemap standard and Google reads it. Keep the dynamic content URLs (blogs/caseStudies/guides/products) — add their `/bn` alternates too. Verify `/sitemap.xml` still serves at the root (not `/en/sitemap.xml`) and contains both locales. Gate + commit (`feat(i18n): bilingual sitemap with hreflang alternates`).

## Task 3: Locale-aware StructuredData (JSON-LD)

**Files:** Modify `src/app/components/StructuredData.tsx`.

It is `'use client'`. Swap `usePathname` from `next/navigation` → `@/i18n/navigation` (locale-stripped, so its path-switching logic works per Stage 1's pattern) and add `useLocale` from next-intl. Add `inLanguage` to the JSON-LD (`en`/`bn`), and localize the human-readable `description`/`name` fields — pull them from a `messages` namespace (add `StructuredData` to en.json + bn.json with the English + Bengali org/service descriptions) rather than hardcoding. Keep `@type`, URLs, and structural fields as-is. Verify the JSON-LD renders in the built HTML with the right `inLanguage` per locale (recall: the site now server-renders, so JSON-LD IS in the HTML — grep for `application/ld+json` and check `inLanguage`). Gate + commit (`feat(i18n): locale-aware JSON-LD structured data`).

## Task 4 (FINAL): confirm hreflang coherence; decide on alternateLinks

**Files:** possibly `src/i18n/routing.ts` (only if switching mechanism).

We now emit hreflang via `metadata.alternates.languages` (Task 1) — `<link>` tags in `<head>`. next-intl's `alternateLinks` (Link HTTP headers) STAYS OFF: enabling it would DOUBLE the hreflang signal (headers + tags) and next-intl's header form doesn't know our exact canonical rules. So this task is mostly verification:
- Confirm `alternateLinks: false` remains, and update its comment in `routing.ts` (it currently says hreflang waits for per-locale canonicals — now note hreflang IS emitted, via per-page metadata, and alternateLinks stays off to avoid double-emit).
- Verify in the built HTML: each `/bn` page has exactly ONE canonical (pointing at itself) and exactly one hreflang triplet, no duplicates, no Link header hreflang.
- Run a final coherence check: for a sample page, canonical URL == the `hreflang` entry for that page's own locale.
Gate + commit (`docs(i18n): confirm hreflang via metadata; alternateLinks stays off to avoid double-emit`).

---

## Stage 4 Definition of Done

- [ ] Every marketing page (static + `[slug]`) emits a per-locale canonical (each canonical to itself) + hreflang en/bn/x-default + per-locale `og:locale`
- [ ] `/bn/about` canonical is `.../bn/about`, NOT `.../about` (the Stage-3b blocker, fixed)
- [ ] Sitemap emits both locales with hreflang; still served at `/sitemap.xml`
- [ ] JSON-LD is locale-aware (`inLanguage`, localized description)
- [ ] No double hreflang (metadata only; `alternateLinks` off)
- [ ] `npm test` green; COLD build 110/110, 85 SSG routes; `/en` head unchanged except added hreflang
- [ ] Final whole-branch review, then PR

## Handoff

After Stage 4, the bilingual migration is fully complete (foundation, extraction, translation, geo-detection, SEO). Any remaining items are the non-SEO follow-ups from Stage 3b (faq.json content, API error codes, WhatsApp default message, Footer numeral) — independent and optional.
