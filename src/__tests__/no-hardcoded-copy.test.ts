import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Guard against a page silently hard-coding user-visible copy in the locale
 * tree instead of routing it through next-intl. This is the exact regression
 * Stage 2 hit: Task 5 gave the resources sub-pages `setRequestLocale` but left
 * their `<PageHero>` / `<CTABand>` copy as string literals, and nothing failed
 * — no type broke, no render broke, the copy just wasn't translatable. Task 9's
 * sweep extracted them; this test stops them (or a new page) coming back.
 *
 * Scope, honestly: it flags the DESIGN-SYSTEM COPY PROPS — the props on
 * PageHero / CTABand / SectionHeader that are always prose — when they are
 * assigned a capitalised double-quoted string LITERAL. That is the observed
 * failure mode and it is essentially false-positive-free, because these props
 * never legitimately hold a hard-coded string (routes use *Href, the drafting
 * ornament uses `index=`, variants use `variant`/`size`/`align`). It does NOT
 * try to catch every hard-coded JSX text node — a general text-node scan is
 * too noisy (glyphs, `fig.` labels, brand marks, {data} interpolations) to be
 * worth the false positives, per the task brief. `t.raw`, `t(...)`, and
 * `{expression}` values are `={...}`, not `="..."`, so they never match.
 */

const LOCALE_TREE = join(process.cwd(), 'src', 'app', '(site)', '[locale]');

/** Props that, in this design system, only ever carry translatable prose. */
const COPY_PROPS = [
  'eyebrow',
  'lede',
  'title',
  'primaryLabel',
  'secondaryLabel',
  'primaryCta',
  'secondaryCta',
] as const;

// e.g.  title="Field notes from the build."   ->  offender
//       title={t('hero.title')}                ->  ignored (={...}, not ="...")
//       primaryHref="/quote"                   ->  ignored (not a copy prop)
const OFFENDER = new RegExp(
  `(?:^|\\s)(?:${COPY_PROPS.join('|')})="[A-Z][^"]*"`,
);

function tsxFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return tsxFiles(full);
    return entry.isFile() && full.endsWith('.tsx') ? [full] : [];
  });
}

describe('no hard-coded copy in the locale tree', () => {
  it('routes all design-system copy props through next-intl (no string literals)', () => {
    const offenders: string[] = [];

    for (const file of tsxFiles(LOCALE_TREE)) {
      const lines = readFileSync(file, 'utf8').split('\n');
      const rel = file.slice(process.cwd().length + 1);
      lines.forEach((line, i) => {
        const trimmed = line.trimStart();
        if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
        if (OFFENDER.test(line)) offenders.push(`${rel}:${i + 1}  ${trimmed}`);
      });
    }

    expect(offenders).toEqual([]);
  });
});
