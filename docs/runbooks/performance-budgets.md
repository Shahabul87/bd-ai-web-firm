# Performance budgets

Phase 7 Task 7.3. Budgets live in [`perf-budgets.json`](../../perf-budgets.json);
the enforced tier is checked by [`scripts/check-budgets.mjs`](../../scripts/check-budgets.mjs).

## Two tiers

| Tier | Budget | Enforced by | When |
|------|--------|-------------|------|
| **Enforced** | first-load JS/route, HTML raw+gzip/page, image weight/file | `npm run check:budgets` (deterministic, from the production build) | Every `npm run ci:local`, right after the build |
| **Runtime** | LCP, CLS, INP, Lighthouse a11y | Lighthouse (mobile + desktop) + manual browser test plan | Before a release; see below |

Mechanical accessibility (0 axe violations) is already enforced in the jest suite
(`src/app/components/__tests__/a11y.test.tsx`); the runtime `lighthouseAccessibility`
target is the broader audit.

## Running the enforced gate

```bash
npm run build
npm run check:budgets   # exits 1 on any breach
```

It reads `.next/app-build-manifest.json` (gzipped first-load JS per route,
matching Next's reported "First Load JS" within ~3 kB), scans
`.next/server/app/**/*.html` (raw + gzip), and scans `public/**` raster assets.

## Baselines (measured 2026-07-17, commit after client-message scoping)

- **First-load JS**: worst route `/quote` at 203 kB gzip (the react-hook-form
  wizard); most routes 157–166 kB. Budget: **230 kB/route**.
- **HTML weight**: worst page `bn/products/banglu` at 143 kB raw / 27 kB gzip
  (legitimate Bengali page copy). Budget: **170 kB raw / 40 kB gzip**.
- **Images**: largest `public/icon-512.png` at 24 kB. Budget: **300 kB/file**.

### The regression this guards

Before commit `3db5f9d`, next-intl v4's `NextIntlClientProvider` serialized the
**complete** message catalog into every page's HTML — a near-static `/bn/about`
shipped **222 kB** of HTML. Scoping the provider to a client-only namespace
allowlist ([`src/i18n/clientMessages.ts`](../../src/i18n/clientMessages.ts))
cut per-page HTML 30–54% (bn/quote 186→85 kB, bn/about 222→121 kB). The
`clientMessages.test.ts` guard keeps the allowlist honest; the HTML budget keeps
the payload from creeping back.

## Runtime targets (Lighthouse)

Core Web Vitals cannot be measured from a static build. Validate against the
local **production** build (`next start`), not `next dev`:

```bash
npm run build && npx next start -p 3000 &
# Mobile profile (throttled) — the primary target, most visitors are on mobile:
npx lighthouse http://localhost:3000/en --preset=desktop --only-categories=performance,accessibility --view
npx lighthouse http://localhost:3000/en --form-factor=mobile --throttling-method=simulate --only-categories=performance,accessibility --view
```

Targets (Google "good" thresholds): **LCP ≤ 2.5 s · CLS ≤ 0.1 · INP ≤ 200 ms ·
Lighthouse accessibility ≥ 95**. Test at least `/en` (home), `/en/quote` (heaviest
JS), and one Bengali route. Record the run in the release evidence.

> INP is an interaction metric — Lighthouse lab runs approximate it; confirm with
> field data (CrUX / web-vitals) after release.
