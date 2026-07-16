# Bilingual EN/BN — Stage 2: English Extraction — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move every hardcoded English string in the marketing tree into `messages/en.json`, with zero behaviour change and zero visible copy change.

**Architecture:** Server components read copy via `await getTranslations('Namespace')`; the 3 client components use `useTranslations('Namespace')`. Static `export const metadata` blocks become `generateMetadata()` because static exports cannot read the locale param. `messages/bn.json` is kept key-identical to `en.json` by a parity test, with English placeholder values until Stage 3 replaces them.

**Tech Stack:** Next.js 15.4 App Router, React 19, TypeScript strict, next-intl 4.13.2, Jest.

**Spec:** `docs/superpowers/specs/2026-07-14-bilingual-en-bn-design.md`
**Predecessor:** Stage 1 merged to `main` via PR #5 (22 commits). Start from `main`.

## Global Constraints

- **ZERO user-visible copy change.** Every rendered string must be byte-identical before and after. This is a pure move of strings from `.tsx` into JSON. If a diff reworders anything, it is wrong.
- **No existing URL may change.**
- **`/bn` still renders English.** `bn.json` gets English placeholder values in this stage. Do NOT translate anything — Stage 3 does that. Bengali copy appearing anywhere = Critical.
- TypeScript strict. **No `any`, no `unknown`.**
- NEVER use `git checkout --`, `git restore`, `git stash`, `git reset --hard`. Undo with the Edit tool.
- Use `npm run type-check`, NEVER `npx tsc --noEmit`.
- ⚠️ **`npm test` cannot gate page changes** — zero suites touch `src/app` pages/components. The binding gate is a **COLD** `npm run build` (`rm -rf .next`), which must exit 0 and prerender **110/110** pages. Exactly **2 pre-existing `jose`/`@auth/core` Edge warnings** are expected on a cold build — not yours, do not fix. A warm `.next` prints a misleading OK.
- Do NOT touch `src/app/(internal)/` (admin/portal — never localized), `src/app/analytics.tsx`, or anything under `src/app/components/mdx/`.

## Namespace Convention (binding — every task follows this)

Namespaces mirror the component/route tree, PascalCase for components, camelCase leaf keys:

```
Nav.services, Nav.products                 -> src/app/components/layout/nav.ts
Header.getEstimate, Header.startProject    -> layout/Header.tsx
Footer.*                                   -> layout/Footer.tsx
CTABand.title, CTABand.lede, ...           -> shared/CTABand.tsx (NOTE: these live in DEFAULT PROP VALUES)
Home.hero.title, Home.proof.*, ...         -> components/home/*
Services.web.useCases, Services.web.faq    -> (site)/[locale]/services/web-development/page.tsx
About.*, Careers.*, Process.*, Legal.privacy.*
Meta.about.title, Meta.about.description   -> every page's metadata
```

**Arrays**: next-intl returns arrays via `t.raw('useCases')`. It is NOT type-safe — cast the result to the existing local type (e.g. `t.raw('useCases') as UseCase[]`). That cast is permitted ONLY here and ONLY to a concrete named type; `as any`/`as unknown` remain forbidden. Keep the existing `SpecRow`/`AccordionItem` types.

## File Structure

| Path | Responsibility |
|---|---|
| `messages/en.json` | The single source of English copy. Grows from 1 namespace to ~15. |
| `messages/bn.json` | Key-identical to en.json, English placeholder VALUES until Stage 3. |
| `src/__tests__/messages-parity.test.ts` | Guards that both files have identical key sets, recursively. |

---

## Task 1: Message parity guard

**Why first:** every later task edits both JSON files. Without this guard, a key added to `en.json` but missed in `bn.json` renders as a raw key string (`Home.hero.title`) on `/bn` in production. Build this before the files grow.

**Files:**
- Create: `src/__tests__/messages-parity.test.ts`

**Interfaces:**
- Produces: a test that fails if `en.json` and `bn.json` key sets diverge.

- [ ] **Step 1: Write the failing test**

```ts
import en from '../../messages/en.json';
import bn from '../../messages/bn.json';

type Json = { [k: string]: unknown };

/** Recursively collect dotted key paths. Arrays are leaves: their SHAPE is
 *  checked, but per-index divergence inside an array of strings is not a
 *  missing-key bug, so we compare lengths at the array node. */
function keyPaths(obj: Json, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    if (Array.isArray(v)) return [`${path}[]:${v.length}`];
    if (v && typeof v === 'object') return keyPaths(v as Json, path);
    return [path];
  });
}

describe('messages en/bn parity', () => {
  it('has identical key sets in both locales', () => {
    const enKeys = keyPaths(en as Json).sort();
    const bnKeys = keyPaths(bn as Json).sort();
    const missingInBn = enKeys.filter((k) => !bnKeys.includes(k));
    const extraInBn = bnKeys.filter((k) => !enKeys.includes(k));
    expect({ missingInBn, extraInBn }).toEqual({ missingInBn: [], extraInBn: [] });
  });

  it('has no empty string values', () => {
    const empties: string[] = [];
    const walk = (o: Json, p = '') => {
      Object.entries(o).forEach(([k, v]) => {
        const path = p ? `${p}.${k}` : k;
        if (typeof v === 'string' && v.trim() === '') empties.push(path);
        else if (v && typeof v === 'object' && !Array.isArray(v)) walk(v as Json, path);
      });
    };
    walk(en as Json);
    walk(bn as Json);
    expect(empties).toEqual([]);
  });
});
```

- [ ] **Step 2: Prove the guard actually fails on divergence**

Temporarily add `"__probe": "x"` to `messages/en.json` only, then:

```bash
npx jest src/__tests__/messages-parity.test.ts
```

Expected: FAIL naming `__probe` in `missingInBn`. **Remove the probe** and re-run — expected PASS. A guard you have not seen fail is not a guard.

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/messages-parity.test.ts
git commit -m "test(i18n): guard en/bn message key parity

A key present in en.json but missing from bn.json renders as a raw key
string on /bn in production. Every stage-2 task edits both files, so this
guard lands before they grow.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Shared chrome (Header, Footer, nav, PageHero, CTABand, PillarCards)

**Why second:** this copy renders on EVERY page, so it is the highest-leverage extraction and it exercises every pattern the later tasks repeat (server component, client component, default prop values, a shared `.ts` data file).

**Files:**
- Modify: `src/app/components/layout/nav.ts`, `layout/Header.tsx`, `layout/Footer.tsx`, `layout/MobileMenu.tsx`, `src/app/components/shared/PageHero.tsx`, `shared/CTABand.tsx`, `shared/PillarCards.tsx`
- Modify: `messages/en.json`, `messages/bn.json`

**Interfaces:**
- Consumes: parity test (Task 1)
- Produces: `Nav`, `Header`, `Footer`, `CTABand`, `PillarCards` namespaces

⚠️ **THE TRAP IN THIS TASK — `CTABand` carries copy in DEFAULT PROP VALUES:**

```tsx
// src/app/components/shared/CTABand.tsx:19-20 (current)
title = 'Have something to build?',
lede = "Tell us the brief. We'll come back with a plan, a timeline, and a fixed estimate — usually within two business days.",
```

A default parameter cannot call a hook or `await`. Restructure: keep the props optional, and resolve the fallback INSIDE the component body from translations.

**`CTABand` IS a client component** (verified — it has `'use client'`). So use the **hook**, keep it **sync**, and do NOT make it `async`:

```tsx
'use client';
import { useTranslations } from 'next-intl';

export default function CTABand({ title, lede, primaryLabel, secondaryLabel, ...rest }: CTABandProps) {
  const t = useTranslations('CTABand');
  const resolvedTitle = title ?? t('title');
  const resolvedLede = lede ?? t('lede');
  const resolvedPrimaryLabel = primaryLabel ?? t('primaryLabel');
  const resolvedSecondaryLabel = secondaryLabel ?? t('secondaryLabel');
  // ...render with the resolved* values
}
```

⚠️ Do NOT use `await getTranslations(...)` here — it is server-only and will fail at build in a
`'use client'` file. An `async` client component is also invalid React.

**`PageHero` is a SERVER component** (no `'use client'`), so if you extract copy inside it, that
one takes `const t = await getTranslations('PageHero')` and the function becomes `async`.
The two shared components differ — check each file's first line before choosing, and do not
assume the pattern from one carries to the other.
Every existing call site that passes `title`/`lede` explicitly must keep passing the SAME string — do not delete call-site props in this task; they are extracted with their own page in Tasks 4–6.

- [ ] **Step 1: Read all 7 files and inventory the strings**

```bash
cd /Users/mdshahabulalam/myprojects/bdaiwebfirm/bd-ai-web-firm
grep -nE "'[A-Z][^']{3,}'|\"[A-Z][^\"]{3,}\"" src/app/components/layout/nav.ts src/app/components/layout/Header.tsx src/app/components/layout/Footer.tsx src/app/components/shared/CTABand.tsx src/app/components/shared/PillarCards.tsx
```

Record every user-visible string. Ignore class names, hrefs, and `aria-*` values that are already translated via the `LocaleToggle` namespace.

- [ ] **Step 2: Add the namespaces to BOTH message files**

Add to `messages/en.json` the real English strings, and to `messages/bn.json` the **identical English strings as placeholders**. Example shape (use the ACTUAL strings you inventoried, not these):

```json
{
  "Nav": { "services": "Services", "products": "Products", "process": "Process", "resources": "Resources", "about": "About" },
  "Header": { "getEstimate": "Get estimate", "startProject": "Start a project", "openMenu": "Open menu", "closeMenu": "Close menu" },
  "CTABand": { "title": "Have something to build?", "lede": "Tell us the brief. We'll come back with a plan, a timeline, and a fixed estimate — usually within two business days.", "primaryLabel": "…", "secondaryLabel": "…" }
}
```

- [ ] **Step 3: Verify parity before touching components**

```bash
npx jest src/__tests__/messages-parity.test.ts
```

Expected: PASS. Fix the JSON now, while it is the only thing that changed.

- [ ] **Step 4: Wire the components**

`nav.ts` exports plain data with `label` strings. It is NOT a component and cannot call hooks. Change `NavLink` to carry a translation KEY instead of a label:

```ts
export interface NavLink {
  index?: string;
  /** Key within the `Nav` namespace. Resolved by the consuming component. */
  labelKey: string;
  href: string;
}

export const PRIMARY_LINKS: NavLink[] = [
  { labelKey: 'products', href: '/products' },
  { labelKey: 'process', href: '/process' },
  { labelKey: 'resources', href: '/resources' },
  { labelKey: 'about', href: '/about' },
];
```

Then in `Header.tsx` (a client component — use the hook):

```tsx
const t = useTranslations('Nav');
// ...
{PRIMARY_LINKS.map((link) => (
  <Link key={link.href} href={link.href} className={...}>
    {t(link.labelKey)}
  </Link>
))}
```

Apply the same `labelKey` treatment to `SERVICE_LINKS`, and mirror it in `MobileMenu.tsx`. **Do NOT change any `href`.**

- [ ] **Step 5: Verify the gate**

```bash
npm run lint && npm run type-check && npm test
rm -rf .next && npm run build 2>&1 | tail -20
```

Expected: all green; build exit 0, 110/110 pages, only the 2 known `jose` warnings.

- [ ] **Step 6: Prove the copy did not change**

The build output is not enough — it proves compilation, not text. Diff the rendered text against `main`:

```bash
node -e "
const fs=require('fs');
const h=fs.readFileSync('.next/server/app/en/about.html','utf8');
for (const s of ['Get estimate','Start a project','Have something to build?']) {
  console.log(s, '->', h.includes(s) ? 'PRESENT' : 'MISSING');
}
"
```

Expected: all `PRESENT`. If a string is MISSING, the extraction changed rendered copy — STOP and fix.
NOTE: the site prerenders a spinner-only `<body>` (a known pre-existing bug — `CrossPlatformWrapper` gates on a `useEffect`), so page BODY copy will NOT appear in the built HTML. If every probe returns MISSING for that reason, say so and fall back to asserting the strings exist in the client bundle under `.next/static/chunks/`. Do not claim success you cannot evidence.

- [ ] **Step 7: Commit**

```bash
git add src/app/components messages
git commit -m "refactor(i18n): extract shared chrome copy to messages/en.json

Header, Footer, nav, PageHero, CTABand, PillarCards. Renders on every page,
so this is the highest-leverage extraction and exercises every pattern the
page tasks repeat.

nav.ts now carries labelKey rather than label: it is plain data and cannot
call a hook, so the consuming component resolves the key. CTABand's copy
lived in default PROP values, which cannot await — resolved in the body via
?? instead, keeping every call site's explicit props working unchanged.

bn.json gets English placeholders; stage 3 translates. No copy changed.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Homepage components

**Files:**
- Modify: `src/app/components/home/{DraftingRoomHero,ProofStrip,Advantage,SelectedWork,ProcessStrip,ResourcesRow,AgentBuildShowcase,PillarsGrid,FinalCTA}.tsx`, `src/app/components/HomePage.tsx`
- Modify: `messages/en.json`, `messages/bn.json`

**Interfaces:**
- Consumes: `Nav`/`CTABand` namespaces (Task 2)
- Produces: the `Home` namespace (`Home.hero.*`, `Home.proof.*`, `Home.advantage.*`, `Home.work.*`, `Home.process.*`, `Home.resources.*`, `Home.build.*`, `Home.pillars.*`, `Home.finalCta.*`)

⚠️ **`DraftingRoomHero` is a client component** (it imports `framer-motion`) — use `useTranslations`, not `getTranslations`. Check each file's `'use client'` before choosing.

⚠️ **Do NOT extract the mono drafting label** `fig. 01 — agent schematic · sheet 1 of 4 · scale 1:1 · dhaka / worldwide`. It is brand ornament that stays English/Latin in BOTH locales by design. **Instead, mark it `lang="en"`** — this is the retrofit Stage 1 deferred, and it activates the `:not([lang="en"])` letter-spacing exclusion already sitting in `globals.css`:

```tsx
<p lang="en" className="mt-14 font-mono text-[10px] uppercase tracking-[0.2em] text-[#EDEDE3]/50">
  fig. 01 — agent schematic · sheet 1 of 4 · scale 1:1 · dhaka / worldwide
</p>
```

Do the same for every other mono `tracking-[0.15em]`/`tracking-[0.2em]` uppercase ornament label you touch in this task. Report how many you marked.

- [ ] **Step 1: Inventory the strings across the 9 components**

```bash
grep -rnE "^const [A-Z_]+ = \[|title:|description:|label:|value:" src/app/components/home/ | head -40
```

- [ ] **Step 2: Add the `Home` namespace to BOTH message files, then verify parity**

```bash
npx jest src/__tests__/messages-parity.test.ts
```

Expected: PASS.

- [ ] **Step 3: Wire each component**

For const arrays, move the data into the message file and read it back with `t.raw`, casting to the existing local type:

```tsx
// before: const FACTS = [{ label: '...', value: '...' }, ...];
// after:
interface Fact { label: string; value: string }
const t = useTranslations('Home.proof');
const FACTS = t.raw('facts') as Fact[];
```

Define the local interface if one does not already exist. Never `as any`/`as unknown`.

- [ ] **Step 4: Verify the gate**

```bash
npm run lint && npm run type-check && npm test
rm -rf .next && npm run build 2>&1 | tail -20
```

Expected: green; 110/110.

- [ ] **Step 5: Commit**

```bash
git add src/app/components messages
git commit -m "refactor(i18n): extract homepage copy to messages/en.json

Also marks the mono drafting ornament labels lang=\"en\" — the retrofit
stage 1 deferred. They stay English in both locales by design, and this
activates the :not([lang=en]) letter-spacing exclusion already in
globals.css so they stop getting relaxed tracking on /bn.

No copy changed.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: The four service pages

**Files:**
- Modify: `src/app/(site)/[locale]/services/{web-development,ios-development,android-development,support}/page.tsx`, `services/page.tsx`
- Modify: `messages/en.json`, `messages/bn.json`

**Interfaces:**
- Produces: `Services.{index,web,ios,android,support}` namespaces

These four pages are ~1,930 words and share a uniform shape (`useCases`, `techStack`, `specRows`, `faqItems`). They are **server components**, so use `await getTranslations('Services.web')`. Keep the existing `SpecRow` and `AccordionItem` types — cast `t.raw()` results to them.

Their `export const metadata` blocks are handled in Task 7 — leave metadata alone here.

- [ ] **Step 1: Extract `services/web-development/page.tsx` first, all four arrays**

Do ONE page completely, verify it, and only then repeat for the other three. The shape is uniform, so a mistake made once is a mistake made four times.

- [ ] **Step 2: Verify the gate after the first page**

```bash
npm run lint && npm run type-check && npx jest src/__tests__/messages-parity.test.ts
rm -rf .next && npm run build 2>&1 | tail -5
```

Expected: green; 110/110.

- [ ] **Step 3: Repeat for ios-development, android-development, support, and services/page.tsx**

- [ ] **Step 4: Verify the gate**

```bash
npm run lint && npm run type-check && npm test
rm -rf .next && npm run build 2>&1 | tail -20
```

- [ ] **Step 5: Commit**

```bash
git add "src/app/(site)" messages
git commit -m "refactor(i18n): extract service page copy to messages/en.json

Four pages, uniform shape (useCases/techStack/specRows/faqItems), ~1,930
words. Server components, so getTranslations. Existing SpecRow and
AccordionItem types retained; t.raw results cast to them. No copy changed.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Remaining server pages

**Files:**
- Modify: `src/app/(site)/[locale]/{about,careers,process,products,portfolio,resources,faq}/**/page.tsx`
- Modify: `messages/en.json`, `messages/bn.json`

**Interfaces:**
- Produces: `About`, `Careers`, `Process`, `Products`, `Portfolio`, `Resources`, `Faq` namespaces

All server components. `content/faq/faq.json` (15 Q&A) is imported via `@content/faq/faq.json` — **leave that file alone**; it is content, not UI chrome, and gets locale-keyed in Stage 3. Extract only the page's own surrounding copy.

`process/page.tsx` has `PHASES` (5) and `COMMUNICATION_ITEMS` (4). `about/page.tsx` has `STATS` (4) and `PRODUCTS` (4). `careers/page.tsx` has `CULTURE_CARDS` (4).

- [ ] **Step 1: Extract page by page, verifying parity after each**

```bash
npx jest src/__tests__/messages-parity.test.ts
```

- [ ] **Step 2: Verify the gate**

```bash
npm run lint && npm run type-check && npm test
rm -rf .next && npm run build 2>&1 | tail -20
```

Expected: green; 110/110.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(site)" messages
git commit -m "refactor(i18n): extract remaining server page copy

about, careers, process, products, portfolio, resources, faq. Leaves
content/faq/faq.json alone — that is content, locale-keyed in stage 3.
No copy changed.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Legal pages + delete the orphaned MDX

**Founder decision (2026-07-16): the PAGES are canonical. Delete the dead MDX.**

**Files:**
- Delete: `content/legal/privacy.mdx`, `content/legal/terms.mdx`, `content/legal/cookies.mdx`
- Modify: `src/app/(site)/[locale]/{privacy,terms,cookies}/page.tsx`
- Modify: `messages/en.json`, `messages/bn.json`

**Interfaces:**
- Produces: `Legal.privacy`, `Legal.terms`, `Legal.cookies` namespaces

**Verify the MDX is genuinely orphaned before deleting** — do not take this plan's word for it:

- [ ] **Step 1: Prove nothing imports it**

```bash
cd /Users/mdshahabulalam/myprojects/bdaiwebfirm/bd-ai-web-firm
grep -rn "content/legal" src/ velite.config.ts 2>/dev/null || echo "CONFIRMED: nothing references content/legal"
grep -n "legal" velite.config.ts || echo "CONFIRMED: not a velite collection"
```

Expected: both CONFIRMED. **If anything DOES reference it, STOP and report** — the premise of this task is wrong and I will re-decide.

- [ ] **Step 2: Delete the dead files**

```bash
git rm content/legal/privacy.mdx content/legal/terms.mdx content/legal/cookies.mdx
```

- [ ] **Step 3: Extract the three pages' inline prose**

These are the worst-shaped pages in the codebase — long inline `<p>`/`<li>` legal prose rather than const arrays. Use nested keys per section, e.g. `Legal.privacy.sections.dataWeCollect.title` / `.body`. For lists, use arrays + `t.raw`.

⚠️ Legal copy is **compliance text**. Move it byte-for-byte. Do not reword, reformat, re-punctuate, or "improve" a single sentence. Preserve every `&apos;`/`&mdash;` HTML entity exactly as written.

- [ ] **Step 4: Verify the gate**

```bash
npm run lint && npm run type-check && npm test
rm -rf .next && npm run build 2>&1 | tail -20
```

Expected: green; 110/110. Velite must still build its 4 collections (blogs, caseStudies, guides, products) — deleting `content/legal` must not disturb it, since it was never registered.

- [ ] **Step 5: Commit**

```bash
git add content src/app messages
git commit -m "refactor(i18n): extract legal page copy, delete orphaned MDX

content/legal/*.mdx was registered in no velite collection and imported by
nothing, while the privacy/terms/cookies pages rendered the same copy as
inline JSX. Two sources, one truth — the pages are what actually renders,
so the dead MDX goes and the page copy is extracted like every other page.

Legal text moved byte-for-byte; no rewording. No copy changed.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Page metadata → `generateMetadata`

**Files:**
- Modify: every marketing page/layout carrying `export const metadata` (~22 files under `src/app/(site)/[locale]/`)
- Modify: `messages/en.json`, `messages/bn.json`

**Interfaces:**
- Produces: the `Meta` namespace (`Meta.about.title`, `Meta.about.description`, …)

⚠️ **This is why this task exists and is separate:** `export const metadata` is a STATIC export and **cannot read the locale param or call `getTranslations`**. Each must become:

```tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta.about' });
  return {
    title: t('title'),
    description: t('description'),
    // keep every OTHER key (alternates, openGraph, …) exactly as it is today
  };
}
```

Note the `{ locale, namespace }` object form — `getTranslations('Meta.about')` without an explicit locale is for request-scoped use and is the wrong call inside `generateMetadata`.

**Out of scope, do NOT do here** (Stage 4 owns them): per-locale canonicals, `alternates.languages` hreflang, and making `openGraph.locale` locale-aware. Keep those exactly as they are. Extracting only `title`/`description` is the whole job.

The 5 dynamic `generateMetadata` functions (`products/[slug]`, `resources/blog/[slug]`, `resources/case-studies/[slug]`, `resources/guides/[slug]`, `portfolio/[slug]`) derive from velite content — **leave them alone**, Stage 3 handles content.

- [ ] **Step 1: Enumerate the static metadata exports**

```bash
grep -rln "export const metadata" "src/app/(site)/[locale]" | sort
```

Record the count. Convert them one at a time.

- [ ] **Step 2: Convert, verify parity as you go**

```bash
npx jest src/__tests__/messages-parity.test.ts
```

- [ ] **Step 3: Prove the titles did not change**

```bash
node -e "
const fs=require('fs');
for (const [f,want] of [['.next/server/app/en/about.html','About - AI-First Software Studio']]) {
  const h=fs.readFileSync(f,'utf8');
  console.log(want, '->', h.includes(want) ? 'PRESENT' : 'MISSING');
}
"
```

Titles live in `<head>`, so unlike body copy they ARE in the prerendered HTML (the spinner bug only affects `<body>`). Use the ACTUAL current title strings — recover them with `git show main:...` if unsure. All must be `PRESENT`.

- [ ] **Step 4: Verify the gate**

```bash
npm run lint && npm run type-check && npm test
rm -rf .next && npm run build 2>&1 | tail -20
```

Expected: green; **110/110 — watch this number.** Converting `metadata` to `generateMetadata` can flip a route from static to dynamic. If the count drops or routes turn `ƒ`, STOP and report.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(site)" messages
git commit -m "refactor(i18n): page titles and descriptions via generateMetadata

export const metadata is a static export and cannot read the locale param,
so each becomes generateMetadata({params}) using the
getTranslations({locale, namespace}) form. Only title/description are
extracted; canonicals, hreflang, and openGraph.locale stay untouched for
the SEO stage. Dynamic [slug] metadata is left alone — it derives from
velite content.

No copy changed.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: The three client components

**Files:**
- Modify: `src/app/(site)/[locale]/contact/page.tsx`, `src/app/(site)/[locale]/quote/page.tsx`, `src/app/(site)/[locale]/error.tsx`
- Modify: `messages/en.json`, `messages/bn.json`

**Interfaces:**
- Produces: `Contact`, `Quote`, `ErrorPage` namespaces

These are the only `'use client'` files in the locale tree. Use `useTranslations`, NOT `getTranslations` (which is server-only and will fail at build).

`quote/page.tsx` is the single largest copy block (~790 words): `stepTitles` (5), `budgetOptions` (8), plus inline validation messages at ~lines 134-169 and submit-status strings at ~217-228.

⚠️ **Extract the client-side validation strings, but do NOT touch the API routes.** `src/app/api/{contact,quote}/route.ts` return English error PROSE that the client renders directly. Making them return error codes is **Stage 3** work (spec §8.2) and is explicitly out of scope here. That means after this task, client-side validation is translatable but server-returned errors are not — that is expected and correct for Stage 2. Note it in your report; do not fix it.

- [ ] **Step 1: Extract `contact/page.tsx`, verify parity, verify gate**

- [ ] **Step 2: Extract `quote/page.tsx` — the 5-step wizard**

Take the arrays (`stepTitles`, `budgetOptions`) and every inline validation/status string.

- [ ] **Step 3: Extract `error.tsx`**

- [ ] **Step 4: Verify the gate**

```bash
npm run lint && npm run type-check && npm test
rm -rf .next && npm run build 2>&1 | tail -20
```

Expected: green; 110/110.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(site)" messages
git commit -m "refactor(i18n): extract client component copy (contact, quote, error)

The only 'use client' files in the locale tree, so useTranslations rather
than getTranslations. quote is the largest single copy block (~790 words):
stepTitles, budgetOptions, validation and submit-status strings.

Client-side validation strings are now translatable; the API routes still
return English prose and are stage 3's job (spec 8.2). No copy changed.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Sweep for stragglers

**Why:** Tasks 2–8 work file-by-file from an inventory. This task proves nothing was missed, and leaves a guard so future copy cannot be hardcoded silently.

**Files:**
- Create: `src/__tests__/no-hardcoded-copy.test.ts`
- Modify: whatever the sweep finds

- [ ] **Step 1: Find remaining user-visible strings in the locale tree**

```bash
cd /Users/mdshahabulalam/myprojects/bdaiwebfirm/bd-ai-web-firm
grep -rnE ">[A-Z][a-z]+ [a-z]+.*<" "src/app/(site)/[locale]" --include="*.tsx" | grep -vE "className|href|aria-|t\(|lang=" | head -30
```

Review each hit by hand. Some will be false positives (icons, entity refs). Extract any real copy you find.

- [ ] **Step 2: Report the count honestly**

State how many real stragglers you found. If it is zero, say so. If it is 30, say that — it means the earlier inventories were incomplete, which is useful information, not a failure.

- [ ] **Step 3: Verify the gate and commit**

```bash
npm run lint && npm run type-check && npm test
rm -rf .next && npm run build 2>&1 | tail -20
git add -A src messages
git commit -m "refactor(i18n): sweep remaining hardcoded copy in the locale tree

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Stage 2 Definition of Done

- [ ] `npm run lint`, `npm run type-check`, `npm test` green; parity test passing
- [ ] COLD `npm run build` exit 0, **110/110** pages, only the 2 known `jose` warnings
- [ ] `messages/en.json` holds ~8,750 words; `messages/bn.json` is key-identical with English placeholders
- [ ] **Zero visible copy change** — verified in a visible browser (ask permission), comparing `/`, `/services`, `/about`, `/quote` against `main`
- [ ] `/bn` still renders English
- [ ] `content/legal/*.mdx` deleted; velite still builds its 4 collections
- [ ] Mono drafting ornament labels marked `lang="en"`
- [ ] No `any`/`unknown`; `t.raw()` casts only to concrete named types

## Handoff to Stage 3

Stage 3 (the Bengali drafts) needs, per the spec:
- **§8.5 AIChatbot — still an open founder decision.** Its keyword matcher only understands English; translating its ~590 words will NOT make it work in Bengali. Decide: locale-aware matcher, or scope the chatbot out of `/bn`.
- **§8.2 API error codes** — `/api/contact` and `/api/quote` must return codes, not English prose.
- **`content/faq/faq.json`** → locale-keyed. `content/testimonials/testimonials.json` has zero consumers — do not translate it; flag for deletion.
- **Re-enable `localeDetection`** in `src/i18n/routing.ts` (delete the line) in the same commit that lands the translations, and re-invert the guard tests in `src/__tests__/middleware.test.ts`.
