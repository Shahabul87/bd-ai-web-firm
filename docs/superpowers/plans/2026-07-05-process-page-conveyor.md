# /process "Conveyor" Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/process` as the approved "Conveyor" design — a glowing build artifact travels a 5-station foundry line (auto-advance + click-to-jump), with the phase card swapping below.

**Architecture:** `page.tsx` stays a server component (unchanged SEO metadata, phase data, communication + CTA sections) and renders a new `'use client'` `ConveyorProcess` component that owns all interactivity (timers, IntersectionObserver, keyboard). All motion is CSS keyframes/transitions defined in `design/tokens.css`; no rAF loops, no new dependencies.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, Tailwind v4 (Agent Foundry tokens), Playwright e2e (repo's existing `e2e/` suite; there is no @testing-library/react, so behavior is verified at the e2e level per repo convention).

## Global Constraints

- No new npm dependencies.
- No `any`/`unknown`; typed props and interfaces throughout.
- SSR-safe: no `Math.random()`/`Date.now()` in render; server render is deterministic (station 01 active).
- Respect `prefers-reduced-motion`: no auto-advance, no transit/ping/hum animation (globals.css already zeroes CSS animations; the component must also skip its JS interval).
- Keep the existing `metadata` export in `src/app/process/page.tsx` byte-identical.
- Design tokens only: `ink-950/900/800`, `signal`, `signal-dim`, `bone`, `steel`, `line`, `amber` — no new colors.
- Spec: `docs/superpowers/specs/2026-07-05-process-page-conveyor-design.md`. Work on branch `feat/process-conveyor`.

---

### Task 1: Failing e2e spec for the conveyor

**Files:**
- Create: `e2e/process-page.spec.ts`

**Interfaces:**
- Consumes: nothing (tests the rendered page).
- Produces: the acceptance contract Task 2 must satisfy — station buttons named `Station NN: Title` with `aria-current="step"` on the active one, a phase card whose `<h3>` heading matches the active phase title, auto-advance within ~5s, no auto-advance under reduced motion.

- [ ] **Step 1: Write the failing e2e spec**

```ts
import { test, expect } from '@playwright/test';

/**
 * /process "Conveyor" — e2e acceptance for the redesigned page.
 * Spec: docs/superpowers/specs/2026-07-05-process-page-conveyor-design.md
 */
test.describe('process page — conveyor', () => {
  test('renders five stations with station 01 active', async ({ page }) => {
    await page.goto('/process');
    const stations = page.getByRole('button', { name: /^Station \d{2}:/ });
    await expect(stations).toHaveCount(5);
    await expect(
      page.getByRole('button', { name: 'Station 01: Discovery' }),
    ).toHaveAttribute('aria-current', 'step');
    await expect(page.getByRole('heading', { name: 'Discovery', level: 3 })).toBeVisible();
  });

  test('clicking a station swaps the phase card', async ({ page }) => {
    await page.goto('/process');
    await page.getByRole('button', { name: 'Station 04: Testing' }).click();
    await expect(page.getByRole('heading', { name: 'Testing', level: 3 })).toBeVisible();
    await expect(page.getByText('User acceptance testing')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Station 04: Testing' }),
    ).toHaveAttribute('aria-current', 'step');
    await expect(
      page.getByRole('button', { name: 'Station 01: Discovery' }),
    ).not.toHaveAttribute('aria-current', 'step');
  });

  test('auto-advances to the next station while on screen', async ({ page }) => {
    await page.goto('/process');
    const track = page.getByRole('group', { name: 'Project phases' });
    await track.scrollIntoViewIfNeeded();
    // ADVANCE_MS is 5s; allow one full cycle plus slack.
    await expect(
      page.getByRole('button', { name: 'Station 02: Planning' }),
    ).toHaveAttribute('aria-current', 'step', { timeout: 8_000 });
  });

  test('does not auto-advance under prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/process');
    const track = page.getByRole('group', { name: 'Project phases' });
    await track.scrollIntoViewIfNeeded();
    await page.waitForTimeout(6_500);
    await expect(
      page.getByRole('button', { name: 'Station 01: Discovery' }),
    ).toHaveAttribute('aria-current', 'step');
    // Clicking still works — content is never motion-gated.
    await page.getByRole('button', { name: 'Station 03: Development' }).click();
    await expect(page.getByRole('heading', { name: 'Development', level: 3 })).toBeVisible();
  });
});
```

- [ ] **Step 2: Run the spec to verify it fails against the current page**

Run: `npx playwright test e2e/process-page.spec.ts`
Expected: all 4 tests FAIL (the current page has no station buttons — `getByRole('button', …)` finds nothing). The dev server auto-starts on port 3101 per `playwright.config.ts`.

- [ ] **Step 3: Commit the failing spec**

```bash
git add e2e/process-page.spec.ts
git commit -m "test(e2e): acceptance spec for /process conveyor redesign

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Conveyor keyframes, component, and page wiring

**Files:**
- Modify: `src/app/design/tokens.css` (append keyframes at end of file)
- Create: `src/app/components/process/ConveyorProcess.tsx`
- Modify: `src/app/process/page.tsx` (keep `metadata` byte-identical; keep communication + CTA sections)

**Interfaces:**
- Consumes: `Card` (`src/app/design/ui/Card.tsx`, props `{ children, className? }`), `SpecTable` (`src/app/design/ui/SpecTable.tsx`, props `{ rows: { label: string; value: ReactNode }[] }`), `SectionHeader`, `PageLayout`, `PageHero`, `CTABand` — all existing.
- Produces: `ConveyorProcess` default export with props `{ phases: ConveyorPhase[]; totalNote: string }`; exported interface `ConveyorPhase { number; title; label; what; deliverables; yourRole; timeline: string }`. Satisfies every locator in Task 1's spec (`aria-label="Station NN: Title"`, `aria-current="step"`, `role="group"` named `Project phases`, `<h3>` phase headings).

- [ ] **Step 1: Append the conveyor motion primitives to `src/app/design/tokens.css`**

```css
/* ── Conveyor (process page) ──────────────────────────────────── */

/* Expanding ring on the active station node (child of the rotated node) */
@keyframes station-ping {
  from { transform: scale(1); opacity: 0.7; }
  to { transform: scale(2.6); opacity: 0; }
}

/* Gentle "hum" of the traveling build artifact */
@keyframes cube-hum {
  0%, 100% { transform: rotate(45deg) scale(1); }
  50% { transform: rotate(45deg) scale(0.88); }
}

/* Phase card entrance on station change */
@keyframes phase-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 2: Create `src/app/components/process/ConveyorProcess.tsx`**

```tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import Card from '../../design/ui/Card';
import SpecTable from '../../design/ui/SpecTable';

export interface ConveyorPhase {
  /** Two-digit station index, e.g. "01" — the real order work happens in. */
  number: string;
  title: string;
  /** Short uppercase track label, e.g. "DISCOVERY". */
  label: string;
  what: string;
  deliverables: string;
  yourRole: string;
  timeline: string;
}

interface ConveyorProcessProps {
  phases: ConveyorPhase[];
  /** Static right-hand readout, e.g. "05 stations · typical total 2–6 weeks". */
  totalNote: string;
}

/** ms between automatic station advances while the track is on screen. */
const ADVANCE_MS = 5000;

/** Track position (% from the left) for station `i` of `n`. */
function stationPos(i: number, n: number): number {
  if (n <= 1) return 50;
  return 4 + (92 * i) / (n - 1);
}

/**
 * The Conveyor: a build artifact travels a horizontal foundry line through
 * the five stations; the arriving station lights up and its phase card swaps
 * in below. Auto-advances while visible; stations are clickable/keyboardable.
 * Spec: docs/superpowers/specs/2026-07-05-process-page-conveyor-design.md
 */
export default function ConveyorProcess({ phases, totalNote }: ConveyorProcessProps) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inViewRef = useRef(false);

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    if (!inViewRef.current || document.hidden) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    timerRef.current = setInterval(() => {
      setActive((a) => (a + 1) % phases.length);
    }, ADVANCE_MS);
  }, [phases.length, stopTimer]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const io = new IntersectionObserver(
      (entries) => {
        inViewRef.current = entries[0]?.isIntersecting ?? false;
        if (inViewRef.current) startTimer();
        else stopTimer();
      },
      { threshold: 0.25 },
    );
    io.observe(track);
    const onVisibility = () => {
      if (document.hidden) stopTimer();
      else startTimer();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      stopTimer();
    };
  }, [startTimer, stopTimer]);

  const go = useCallback(
    (i: number) => {
      const n = phases.length;
      setActive(((i % n) + n) % n);
      startTimer(); // a manual jump restarts the cadence from that station
    },
    [phases.length, startTimer],
  );

  const onTrackKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(active + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(active - 1);
    }
  };

  const phase = phases[active];
  const pos = stationPos(active, phases.length);
  // Both written out literally so Tailwind's static extractor generates them.
  const transitLeft = 'transition-[left] duration-1000 ease-[cubic-bezier(0.65,0,0.35,1)]';
  const transitWidth = 'transition-[width] duration-1000 ease-[cubic-bezier(0.65,0,0.35,1)]';

  return (
    <div>
      {/* Readout row */}
      <div className="mt-14 flex flex-wrap items-baseline justify-between gap-2 font-mono text-xs uppercase tracking-[0.16em]">
        <p className="text-steel">
          Station{' '}
          <span className="text-signal">
            {phase.number}/{String(phases.length).padStart(2, '0')} — {phase.label}
          </span>
        </p>
        <p className="text-steel">{totalNote}</p>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        role="group"
        aria-label="Project phases"
        onKeyDown={onTrackKeyDown}
        className="relative mt-7 h-36"
      >
        <div
          aria-hidden
          className="absolute inset-x-0 top-[74px] h-0.5"
          style={{
            background: 'repeating-linear-gradient(90deg, var(--line) 0 10px, transparent 10px 20px)',
          }}
        />
        <div
          aria-hidden
          className={`absolute left-0 top-[74px] h-0.5 bg-signal-dim shadow-[0_0_12px_rgba(216,255,62,0.35)] ${transitWidth}`}
          style={{ width: `${pos}%` }}
        />

        {phases.map((p, i) => {
          const state = i === active ? 'active' : i < active ? 'done' : 'todo';
          return (
            <button
              key={p.number}
              type="button"
              aria-label={`Station ${p.number}: ${p.title}`}
              aria-current={i === active ? 'step' : undefined}
              onClick={() => go(i)}
              className="group absolute top-0 flex w-28 -translate-x-1/2 cursor-pointer flex-col items-center outline-none"
              style={{ left: `${stationPos(i, phases.length)}%` }}
            >
              <span
                className={`font-mono text-[10px] tracking-[0.2em] transition-colors duration-300 ${
                  state === 'active' ? 'text-signal' : 'text-steel'
                }`}
              >
                {p.number}
              </span>
              <span
                aria-hidden
                className={`relative mt-10 block h-4 w-4 rotate-45 border-2 transition-all duration-500 group-focus-visible:ring-2 group-focus-visible:ring-signal group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-ink-950 ${
                  state === 'active'
                    ? 'scale-125 border-signal bg-signal shadow-[0_0_22px_rgba(216,255,62,0.55)]'
                    : state === 'done'
                      ? 'border-signal-dim bg-signal-dim'
                      : 'border-line bg-ink-900'
                }`}
              >
                {state === 'active' ? (
                  <span className="absolute -inset-0.5 border-2 border-signal motion-safe:animate-[station-ping_1.6s_cubic-bezier(0,0,0.2,1)_infinite]" />
                ) : null}
              </span>
              <span
                className={`mt-3 hidden font-mono text-[11px] uppercase tracking-[0.14em] transition-colors duration-300 sm:block ${
                  state === 'active' ? 'text-bone' : 'text-steel'
                }`}
              >
                {p.label}
              </span>
            </button>
          );
        })}

        {/* The build artifact */}
        <div
          aria-hidden
          className={`pointer-events-none absolute top-[60px] z-10 -ml-[15px] h-[30px] w-[30px] ${transitLeft}`}
          style={{ left: `${pos}%` }}
        >
          <span className="absolute -top-[26px] left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] tracking-[0.18em] text-signal">
            YOUR BUILD
          </span>
          <span className="block h-full w-full rotate-45 bg-signal shadow-[0_0_30px_rgba(216,255,62,0.65),0_0_70px_rgba(216,255,62,0.25)] motion-safe:animate-[cube-hum_2.2s_ease-in-out_infinite]" />
        </div>
      </div>

      {/* Phase card — keyed so each station change replays the entrance */}
      <div className="mt-10 min-h-[340px]">
        <div key={phase.number} className="motion-safe:animate-[phase-in_0.3s_ease]">
          <Card className="sm:p-10">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-signal">
              Station {phase.number}
            </span>
            <h3 className="mt-4 font-display text-2xl font-medium text-bone">{phase.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-steel">{phase.what}</p>
            <div className="mt-6">
              <SpecTable
                rows={[
                  { label: 'Deliverables', value: phase.deliverables },
                  { label: 'Your role', value: phase.yourRole },
                  { label: 'Timeline', value: phase.timeline },
                ]}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Rewrite `src/app/process/page.tsx`**

Keep the `metadata` export exactly as it is today. Replace the rest with:

```tsx
import { Metadata } from 'next';
import PageLayout from '../components/layout/PageLayout';
import PageHero from '../components/shared/PageHero';
import CTABand from '../components/shared/CTABand';
import SectionHeader from '../design/ui/SectionHeader';
import ConveyorProcess, { ConveyorPhase } from '../components/process/ConveyorProcess';

export const metadata: Metadata = {
  title: 'Our Development Process',
  description:
    'From discovery to launch in 5 clear phases. Learn how CraftsAI delivers AI-powered web, Android, and iOS projects with weekly demos and transparent communication.',
  openGraph: {
    title: 'Our Development Process',
    description: 'From discovery to launch in 5 clear phases.',
    url: 'https://www.craftsai.org/process',
  },
  alternates: { canonical: 'https://www.craftsai.org/process' },
};

/* A real sequence — station numbers encode the order the work happens in. */
const PHASES: ConveyorPhase[] = [
  {
    number: '01',
    title: 'Discovery',
    label: 'DISCOVERY',
    what: 'Free consultation to understand your needs. We discuss your goals, target audience, and success criteria to make sure we are aligned before any code is written.',
    deliverables: 'Requirements document, project scope',
    yourRole: 'Share your vision and goals',
    timeline: '1–2 days',
  },
  {
    number: '02',
    title: 'Planning',
    label: 'PLANNING',
    what: 'Architecture design, technology selection, and milestone planning. We map out the entire project so there are no surprises down the road.',
    deliverables: 'Technical spec, project timeline, cost estimate',
    yourRole: 'Review and approve plan',
    timeline: '2–3 days',
  },
  {
    number: '03',
    title: 'Development',
    label: 'DEVELOPMENT',
    what: 'AI agents generate code while engineers review and refine. You see working features early and often through regular demos.',
    deliverables: 'Working features, regular demos',
    yourRole: 'Weekly check-ins, feedback',
    timeline: '1–4 weeks',
  },
  {
    number: '04',
    title: 'Testing',
    label: 'TESTING',
    what: 'Comprehensive QA, performance testing, and security audit. We catch issues before your users do.',
    deliverables: 'Test reports, bug-free application',
    yourRole: 'User acceptance testing',
    timeline: '3–5 days',
  },
  {
    number: '05',
    title: 'Launch & Support',
    label: 'LAUNCH',
    what: 'Deployment, monitoring setup, and handoff. We make sure everything runs smoothly and your team is fully equipped to take over.',
    deliverables: 'Live application, documentation, training',
    yourRole: 'Final approval',
    timeline: '1–2 days',
  },
];

const COMMUNICATION_ITEMS = [
  {
    title: 'Weekly Progress Reports',
    description: 'Detailed updates on what was completed, what is next, and any blockers.',
  },
  {
    title: 'Direct Messaging',
    description: 'Reach us anytime via WhatsApp or email. No ticketing queues.',
  },
  {
    title: 'Live Demos at Milestones',
    description: 'See working software at every major milestone, not just at the end.',
  },
  {
    title: 'Dedicated Project Channel',
    description: 'A shared channel for your team and ours to keep everything in one place.',
  },
];

export default function ProcessPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Process"
        title="Your project rides the line."
        lede="Five stations between idea and launch. Watch it move — no black boxes, no surprises, just a build you can follow with your own eyes."
      />

      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <SectionHeader
          index="fig. 01"
          eyebrow="The line"
          title="How a project moves through CraftsAI."
        />
        <ConveyorProcess phases={PHASES} totalNote="05 stations · typical total 2–6 weeks" />
      </section>

      <section className="border-t border-line bg-ink-900">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <SectionHeader
            index="fig. 02"
            eyebrow="How we communicate"
            title="Transparency is how we work."
            description="You will always know where your project stands."
          />
          <div className="mt-14 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {COMMUNICATION_ITEMS.map((item) => (
              <div key={item.title} className="bg-ink-950 p-6">
                <h3 className="font-display text-lg font-medium text-bone">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-steel">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABand
        title="Ready to get started?"
        lede="Phase 1 is free. Tell us about your project and we'll schedule a discovery call within 24 hours."
        primaryLabel="Start your project"
        primaryHref="/quote"
        secondaryLabel="See our services"
        secondaryHref="/services"
      />
    </PageLayout>
  );
}
```

- [ ] **Step 4: Run the e2e spec to verify it passes**

Run: `npx playwright test e2e/process-page.spec.ts`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add src/app/design/tokens.css src/app/components/process/ConveyorProcess.tsx src/app/process/page.tsx
git commit -m "feat(process): conveyor redesign — build artifact rides the 5-station line

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Quality gates and full-suite verification

**Files:**
- Modify: only whatever the gates flag (expected: none).

**Interfaces:**
- Consumes: Tasks 1–2 output.
- Produces: a branch that passes every repo gate.

- [ ] **Step 1: Run lint**

Run: `npm run lint`
Expected: no errors or warnings for the touched files.

- [ ] **Step 2: Run the type checker**

Run: `npm run type-check`
Expected: exit 0.

- [ ] **Step 3: Run the unit suite**

Run: `npm test`
Expected: all existing suites pass (this change adds no Jest-visible code paths, so the suite must stay green).

- [ ] **Step 4: Run the full e2e suite**

Run: `npx playwright test`
Expected: existing `public-forms` specs + the 4 new process specs pass (authenticated-flow stubs skip per `e2e/README.md`).

- [ ] **Step 5: Production build**

Run: `npm run build`
Expected: compiles clean; `/process` present in the route summary.

- [ ] **Step 6: Commit any gate fixes (skip if clean)**

```bash
git add -u
git commit -m "fix(process): address lint/type findings from quality gates

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Post-plan verification (not a task — session-level)

Per the spec §5: after the gates pass, ask the founder for permission to open the **visible** Playwright-MCP browser against the dev server and review the real page at 1440px and 390px (full auto-advance loop, click-to-jump, keyboard, reduced-motion emulation), screenshot-reviewing each state before presenting.
