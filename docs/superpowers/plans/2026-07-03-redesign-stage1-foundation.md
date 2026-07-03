# CraftsAI Redesign — Stage 1: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the "Agent Foundry" design system (tokens, fonts, motion, 10 UI primitives) and rebuild the site chrome (Header, MobileMenu, Footer) so every existing page renders dark inside the new shell.

**Architecture:** New `src/app/design/` directory holds tokens (CSS variables mapped into Tailwind v4 via `@theme inline`), a shared Framer Motion module, and presentational UI primitives. Site chrome files are rewritten in place (same paths) so all ~30 existing routes pick them up via `PageLayout` with zero route changes. The site stays shippable after every task.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, Tailwind CSS v4 (CSS-first config — there is no `tailwind.config.js`), Framer Motion 12, `next/font/google`.

**Spec:** `docs/superpowers/specs/2026-07-03-craftsai-redesign-design.md` (approved). This plan implements build-order stage 1 only.

## Global Constraints

- **Palette (exact values):** `ink-950 #0A0C10`, `ink-900 #11141A`, `ink-800 #1A1E26`, `signal #D8FF3E`, `signal-dim #9BBD2A`, `bone #EDEEE8`, `steel #8A919E`, `line #262B35`, `amber #FFB347`. Dark-only — no light theme, no theme toggle.
- **Fonts:** Space Grotesk (display), Instrument Sans (body), JetBrains Mono (mono) — all via `next/font/google` (self-hosted at build time). Never Inter/Roboto/Geist/system stacks.
- **Motion rules:** only `transform`/`opacity` animate (one spec-named exception: the Pipeline pulse is an SVG `stroke-dashoffset` CSS loop, per spec §6 motion catalog); infinite loops in CSS only (never JS); viewport triggers fire once; `prefers-reduced-motion` gets static final frames. No floats, bounces, glows, glass-morphism, or purple gradients.
- **TypeScript:** strict; no `any`/`unknown`. JSX string literals: escape apostrophes as `&apos;` (never `&amp;` in plain strings).
- **Verification per task:** `npm run lint` (no errors in files this plan touches — the repo builds with `ignoreDuringBuilds`, but new code must be clean), `npm run type-check` (must pass), and for tasks marked BUILD also `npm run build` (must succeed). No test framework exists; adding one is out of scope per spec.
- **Commits:** one per task, exact `git add` of touched files only (never `git add -A`).
- **Stage-1 nav caveat:** service-pillar routes `/services/ai-agents`, `/services/mobile-apps`, `/services/agent-integration` do not exist until stage 3. Nav links use the stage-1 fallback hrefs defined in `nav.ts` (marked with comments); stage 3 flips them.

---

### Task 1: Design tokens, fonts, dark-only base

**Files:**
- Create: `src/app/design/tokens.css`
- Modify: `src/app/globals.css:1-82` (imports, `:root`, `.dark`, `@theme inline`)
- Modify: `src/app/layout.tsx` (fonts, `<html>` class, anti-FOUC removal, critical CSS, themeColor)

**Interfaces:**
- Consumes: nothing (first task)
- Produces: Tailwind utilities every later task uses: `bg-ink-950/900/800`, `text-bone`, `text-steel`, `text-signal`, `bg-signal`, `bg-signal-dim`, `border-line`, `border-signal`, `text-amber`, `font-display`, `font-sans`, `font-mono`; CSS vars `--ink-950…--amber`; font CSS vars `--font-space-grotesk`, `--font-instrument-sans`, `--font-jetbrains-mono`.

- [ ] **Step 1: Baseline the current state**

Run: `npm run lint 2>&1 | tail -5 && npm run type-check && npm run build 2>&1 | tail -5`
Expected: note any PRE-EXISTING lint errors (they are not yours to fix); type-check and build should pass. If build fails before you change anything, STOP and report.

- [ ] **Step 2: Create `src/app/design/tokens.css`**

```css
/* ── CraftsAI "Agent Foundry" design tokens ─────────────────────────
   Dark-only. Spec: docs/superpowers/specs/2026-07-03-craftsai-redesign-design.md §2 */

:root {
  --ink-950: #0A0C10;
  --ink-900: #11141A;
  --ink-800: #1A1E26;
  --signal: #D8FF3E;
  --signal-dim: #9BBD2A;
  --bone: #EDEEE8;
  --steel: #8A919E;
  --line: #262B35;
  --amber: #FFB347;

  color-scheme: dark;
}

/* Display face for all headings (old pages inherit this during migration) */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-space-grotesk), sans-serif;
  letter-spacing: -0.02em;
}

/* ── Motion primitives (CSS loops only — never JS) ────────────────── */

/* Terminal block cursor */
@keyframes cursor-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
.cursor-blink {
  color: var(--signal);
  animation: cursor-blink 1.1s steps(1) infinite;
}

/* Pipeline dashed-connector flow */
@keyframes dash-flow {
  to { stroke-dashoffset: -24; }
}
.pipeline-dash {
  stroke-dasharray: 6 6;
  animation: dash-flow 1.2s linear infinite;
}

/* Footer marquee (content must be duplicated in markup; track is 2x wide) */
@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.marquee-track {
  display: flex;
  width: max-content;
  animation: marquee 40s linear infinite;
  will-change: transform;
}

/* Blueprint grid surface (static; cursor reveal comes in stage 2) */
.blueprint-grid {
  background-image:
    linear-gradient(var(--line) 1px, transparent 1px),
    linear-gradient(90deg, var(--line) 1px, transparent 1px);
  background-size: 48px 48px;
}
```

- [ ] **Step 3: Rewire `src/app/globals.css`**

Replace lines 1–2 (the two `@import` lines) with:

```css
@import "tailwindcss";
@import "./design/tokens.css";
@import "./styles/animations.css";

/* Tailwind v4 class-based dark variant — html always carries .dark (dark-only site),
   so legacy `dark:` utilities apply for every visitor regardless of OS preference. */
@custom-variant dark (&:where(.dark, .dark *));
```

Replace the entire `:root { … }` block (currently lines 20–51, the light theme + brand + neural colors) AND the entire `.dark { … }` block (currently lines 53–75) with this single block — legacy variables now permanently hold dark values so all old components render dark:

```css
:root {
  /* Legacy variables — pinned to dark "Agent Foundry" values during migration.
     Old components read these; new components use the ink/signal tokens. */
  --background: var(--ink-950);
  --foreground: var(--bone);
  --card-bg: rgba(17, 20, 26, 0.8);
  --card-border: rgba(38, 43, 53, 0.5);
  --shadow-color: rgba(216, 255, 62, 0.08);
  --nav-bg: rgba(10, 12, 16, 0.92);
  --nav-border: rgba(38, 43, 53, 0.6);
  --btn-hover: rgba(26, 30, 38, 0.6);
  --text-secondary: #8A919E;
  --surface-elevated: #11141A;
  --surface-sunken: #07090C;
  --border-default: #262B35;
  --slate-deep: #0A0C10;
  --slate-mid: #11141A;
  --slate-light: #1A1E26;

  /* Legacy brand/neural colors remapped into the new palette */
  --brand-primary: #D8FF3E;
  --brand-secondary: #9BBD2A;
  --brand-accent: #D8FF3E;
  --brand-success: #9BBD2A;
  --brand-warning: #FFB347;
  --neural-cyan: #D8FF3E;
  --neural-purple: #9BBD2A;
  --neural-orange: #FFB347;
  --neural-green: #D8FF3E;
  --neural-blue: #8A919E;
}
```

Replace the `@theme inline { … }` block (currently lines 77–82) with:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);

  /* Agent Foundry tokens → Tailwind utilities (bg-ink-950, text-signal, border-line …) */
  --color-ink-950: var(--ink-950);
  --color-ink-900: var(--ink-900);
  --color-ink-800: var(--ink-800);
  --color-signal: var(--signal);
  --color-signal-dim: var(--signal-dim);
  --color-bone: var(--bone);
  --color-steel: var(--steel);
  --color-line: var(--line);
  --color-amber: var(--amber);

  --font-display: var(--font-space-grotesk);
  --font-sans: var(--font-instrument-sans);
  --font-mono: var(--font-jetbrains-mono);
}
```

Do NOT touch anything after the `@theme inline` block except: the `.dark ::-webkit-scrollbar-thumb` rules near lines 723–728 stay as-is (html keeps the `dark` class, so they still apply).

- [ ] **Step 4: Update `src/app/layout.tsx`**

Replace the font imports and instantiation (lines 2, 14–28) with:

```tsx
import { Space_Grotesk, Instrument_Sans, JetBrains_Mono } from "next/font/google";
```

```tsx
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  fallback: ["Menlo", "Monaco", "monospace"],
});
```

Update the `<body>` className (line 147):

```tsx
className={`${spaceGrotesk.variable} ${instrumentSans.variable} ${jetbrainsMono.variable} antialiased bg-ink-950 text-bone`}
```

Change `<html lang="en" suppressHydrationWarning>` (line 109) to pin dark mode permanently:

```tsx
<html lang="en" className="dark" suppressHydrationWarning>
```

DELETE the anti-FOUC script block (lines 129–132, the `/* Anti-FOUC */` script) — theme is no longer dynamic.

Replace the critical-CSS `<style>` block body (lines 135–141) with:

```tsx
<style dangerouslySetInnerHTML={{ __html: `
  body { margin: 0; background: #0A0C10; color: #EDEEE8; }
  .min-h-screen { min-height: 100vh; }
` }} />
```

Change `viewport.themeColor` (line 100) from `'#0f172a'` to `'#0A0C10'`.

Remove the two `fonts.googleapis.com` `<link rel="preconnect">`/`dns-prefetch` lines (126–127) — `next/font` self-hosts, no external font requests remain.

Leave `ThemeProvider` in place for now — the old `Header.tsx` still consumes it until Task 8; it is deleted in Task 10.

- [ ] **Step 5: Verify (BUILD)**

Run: `npm run lint 2>&1 | tail -20 && npm run type-check && npm run build 2>&1 | tail -5`
Expected: no lint errors in `layout.tsx`/`globals.css`/`tokens.css`; type-check passes; build succeeds. Every page now renders dark with the new fonts.

- [ ] **Step 6: Commit**

```bash
git add src/app/design/tokens.css src/app/globals.css src/app/layout.tsx
git commit -m "feat(design): Agent Foundry tokens, fonts, dark-only base"
```

---

### Task 2: Motion system

**Files:**
- Create: `src/app/design/motion.ts`

**Interfaces:**
- Consumes: `framer-motion` (v12, already installed)
- Produces: `rise: Variants`, `riseStagger: Variants`, `viewportOnce: { once: true; margin: string }`, `EASE_OUT: readonly [number, number, number, number]` — every animated component in later tasks/stages imports from here.

- [ ] **Step 1: Create `src/app/design/motion.ts`**

```ts
import type { Variants } from 'framer-motion';

/**
 * The complete motion vocabulary (spec §6). Personality: mechanical precision —
 * snap, type, pulse. Never float, bounce, or bloom.
 *
 * Rules:
 * - Only transform/opacity animate.
 * - Infinite loops live in CSS (tokens.css), never here.
 * - Every viewport trigger uses `viewportOnce` — nothing re-triggers on scroll-up.
 * - Reduced motion: framer-motion's `useReducedMotion()` in client components;
 *   components with playback (Terminal, TypeOn) must render their final frame.
 */

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** Section/child entry: 12px rise + fade, 400ms. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
};

/** Parent orchestrator: staggers `rise` children by 60ms. */
export const riseStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

/** Shared viewport config — fire once, slightly before fully in view. */
export const viewportOnce = { once: true, margin: '-80px' } as const;
```

- [ ] **Step 2: Verify**

Run: `npm run lint 2>&1 | tail -5 && npm run type-check`
Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/app/design/motion.ts
git commit -m "feat(design): shared motion system (rise/stagger/viewport-once)"
```

---

### Task 3: Primitives — MonoLabel, SectionHeader, Button

**Files:**
- Create: `src/app/design/ui/MonoLabel.tsx`
- Create: `src/app/design/ui/SectionHeader.tsx`
- Create: `src/app/design/ui/Button.tsx`
- Create: `src/app/design/ui/index.ts`

**Interfaces:**
- Consumes: Tailwind utilities from Task 1.
- Produces:
  - `MonoLabel({ children: ReactNode; className?: string })`
  - `SectionHeader({ index: string; eyebrow: string; title: string; description?: string; align?: 'left' | 'center' })`
  - `Button({ variant?: 'signal' | 'ghost' | 'link'; size?: 'md' | 'lg'; href?: string; onClick?: () => void; type?: 'button' | 'submit'; className?: string; children: ReactNode })` — renders `next/link` when `href` given, else `<button>`.
  - Barrel: `export { MonoLabel, SectionHeader, Button } from './index'` style re-exports.

- [ ] **Step 1: Create `src/app/design/ui/MonoLabel.tsx`**

```tsx
import type { ReactNode } from 'react';

interface MonoLabelProps {
  children: ReactNode;
  className?: string;
}

/** Structural mono microcopy: section indices, status readouts, data callouts. */
export default function MonoLabel({ children, className = '' }: MonoLabelProps) {
  return (
    <span
      className={`font-mono text-xs uppercase tracking-[0.18em] text-steel ${className}`}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 2: Create `src/app/design/ui/SectionHeader.tsx`**

```tsx
import MonoLabel from './MonoLabel';

interface SectionHeaderProps {
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}

/** Standard section opener: `01 / AGENTS` eyebrow, display headline, optional lede. */
export default function SectionHeader({
  index,
  eyebrow,
  title,
  description,
  align = 'left',
}: SectionHeaderProps) {
  const alignCls = align === 'center' ? 'text-center' : 'text-left';
  const ledeCls = align === 'center' ? 'mx-auto' : '';
  return (
    <div className={alignCls}>
      <MonoLabel>
        {index} / {eyebrow}
      </MonoLabel>
      <h2 className="mt-4 font-display text-3xl font-medium text-bone sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className={`mt-4 max-w-2xl text-base leading-relaxed text-steel ${ledeCls}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 3: Create `src/app/design/ui/Button.tsx`**

```tsx
import Link from 'next/link';
import type { ReactNode } from 'react';

type ButtonVariant = 'signal' | 'ghost' | 'link';
type ButtonSize = 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
  children: ReactNode;
}

const BASE =
  'inline-flex items-center justify-center gap-2 font-mono uppercase tracking-[0.15em] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal';

const VARIANTS: Record<ButtonVariant, string> = {
  signal: 'bg-signal text-ink-950 hover:bg-signal-dim',
  ghost: 'border border-line text-bone hover:border-signal hover:text-signal',
  link: 'text-signal underline-offset-4 hover:underline',
};

const SIZES: Record<ButtonSize, string> = {
  md: 'px-5 py-2.5 text-xs',
  lg: 'px-7 py-3.5 text-sm',
};

/** Terminal-styled CTA. `href` renders a Link; otherwise a native button. */
export default function Button({
  variant = 'signal',
  size = 'md',
  href,
  onClick,
  type = 'button',
  className = '',
  children,
}: ButtonProps) {
  const cls = `${BASE} ${VARIANTS[variant]} ${variant === 'link' ? '' : SIZES[size]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}
```

- [ ] **Step 4: Create `src/app/design/ui/index.ts`**

```ts
export { default as MonoLabel } from './MonoLabel';
export { default as SectionHeader } from './SectionHeader';
export { default as Button } from './Button';
```

- [ ] **Step 5: Verify**

Run: `npm run lint 2>&1 | tail -5 && npm run type-check`
Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add src/app/design/ui/MonoLabel.tsx src/app/design/ui/SectionHeader.tsx src/app/design/ui/Button.tsx src/app/design/ui/index.ts
git commit -m "feat(design): MonoLabel, SectionHeader, Button primitives"
```

---

### Task 4: Primitives — Card, SpecTable, Accordion

**Files:**
- Create: `src/app/design/ui/Card.tsx`
- Create: `src/app/design/ui/SpecTable.tsx`
- Create: `src/app/design/ui/Accordion.tsx`
- Modify: `src/app/design/ui/index.ts`

**Interfaces:**
- Consumes: Tailwind utilities (Task 1).
- Produces:
  - `Card({ children: ReactNode; className?: string; interactive?: boolean })` — corner-tick brackets; `interactive` flares ticks signal on hover.
  - `SpecTable({ rows: SpecRow[]; className?: string })` with `interface SpecRow { label: string; value: ReactNode }` (exported).
  - `Accordion({ items: AccordionItem[]; className?: string })` with `interface AccordionItem { id: string; question: string; answer: ReactNode }` (exported). Client component, one panel open at a time.

- [ ] **Step 1: Create `src/app/design/ui/Card.tsx`**

```tsx
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}

/**
 * Blueprint card: ink surface, hairline border, corner-tick brackets.
 * No rounded-glass, no glow (spec §2 motif 5).
 */
export default function Card({ children, className = '', interactive = false }: CardProps) {
  const tick =
    'pointer-events-none absolute h-3 w-3 border-line transition-colors duration-150' +
    (interactive ? ' group-hover:border-signal' : '');
  return (
    <div
      className={`group relative border border-line/60 bg-ink-900 p-6 ${
        interactive ? 'transition-colors duration-150 hover:bg-ink-800' : ''
      } ${className}`}
    >
      <span aria-hidden className={`${tick} left-0 top-0 border-l border-t`} />
      <span aria-hidden className={`${tick} right-0 top-0 border-r border-t`} />
      <span aria-hidden className={`${tick} bottom-0 left-0 border-b border-l`} />
      <span aria-hidden className={`${tick} bottom-0 right-0 border-b border-r`} />
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create `src/app/design/ui/SpecTable.tsx`**

```tsx
import type { ReactNode } from 'react';

export interface SpecRow {
  label: string;
  value: ReactNode;
}

interface SpecTableProps {
  rows: SpecRow[];
  className?: string;
}

/** Spec-sheet table: mono steel labels, bone values, hairline dividers. */
export default function SpecTable({ rows, className = '' }: SpecTableProps) {
  return (
    <dl className={`divide-y divide-line border-y border-line ${className}`}>
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-[minmax(120px,1fr)_2fr] gap-4 py-3">
          <dt className="font-mono text-xs uppercase tracking-[0.18em] text-steel">
            {row.label}
          </dt>
          <dd className="text-sm leading-relaxed text-bone">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
```

- [ ] **Step 3: Create `src/app/design/ui/Accordion.tsx`**

```tsx
'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

export interface AccordionItem {
  id: string;
  question: string;
  answer: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

/** FAQ accordion: one panel open at a time, mono +/− indicator. */
export default function Accordion({ items, className = '' }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className={`divide-y divide-line border-y border-line ${className}`}>
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={`accordion-panel-${item.id}`}
              onClick={() => setOpenId(open ? null : item.id)}
              className="flex w-full items-center justify-between gap-4 py-4 text-left transition-colors duration-150 hover:text-signal"
            >
              <span className="text-sm font-medium text-bone">{item.question}</span>
              <span aria-hidden className="font-mono text-signal">
                {open ? '−' : '+'}
              </span>
            </button>
            {open ? (
              <div
                id={`accordion-panel-${item.id}`}
                className="pb-5 text-sm leading-relaxed text-steel"
              >
                {item.answer}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Update `src/app/design/ui/index.ts`** — replace full contents:

```ts
export { default as MonoLabel } from './MonoLabel';
export { default as SectionHeader } from './SectionHeader';
export { default as Button } from './Button';
export { default as Card } from './Card';
export { default as SpecTable } from './SpecTable';
export type { SpecRow } from './SpecTable';
export { default as Accordion } from './Accordion';
export type { AccordionItem } from './Accordion';
```

- [ ] **Step 5: Verify**

Run: `npm run lint 2>&1 | tail -5 && npm run type-check`
Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add src/app/design/ui/Card.tsx src/app/design/ui/SpecTable.tsx src/app/design/ui/Accordion.tsx src/app/design/ui/index.ts
git commit -m "feat(design): Card, SpecTable, Accordion primitives"
```

---

### Task 5: Primitives — TypeOn, Stepper

**Files:**
- Create: `src/app/design/ui/TypeOn.tsx`
- Create: `src/app/design/ui/Stepper.tsx`
- Modify: `src/app/design/ui/index.ts`

**Interfaces:**
- Consumes: `framer-motion` (`useInView`, `useReducedMotion`).
- Produces:
  - `TypeOn({ text: string; className?: string; speed?: number; startDelay?: number; cursor?: boolean })` — client; types `text` character-by-character when scrolled into view; reduced motion renders full text immediately; chartreuse block cursor blinks at rest.
  - `Stepper({ steps: string[]; current: number; className?: string })` — mono `STEP n/total` counter + step names, active in signal. `current` is 0-indexed.

- [ ] **Step 1: Create `src/app/design/ui/TypeOn.tsx`**

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

interface TypeOnProps {
  text: string;
  className?: string;
  /** ms per character */
  speed?: number;
  /** ms before typing starts once in view */
  startDelay?: number;
  cursor?: boolean;
}

/** Types text character-by-character once in view; block cursor blinks at rest. */
export default function TypeOn({
  text,
  className = '',
  speed = 40,
  startDelay = 0,
  cursor = true,
}: TypeOnProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const reduced = useReducedMotion();
  const [count, setCount] = useState(0);

  const done = reduced ? true : count >= text.length;
  const shown = reduced ? text : text.slice(0, count);

  useEffect(() => {
    if (!inView || reduced || count >= text.length) return;
    const delay = count === 0 ? startDelay + speed : speed;
    const t = setTimeout(() => setCount((c) => c + 1), delay);
    return () => clearTimeout(t);
  }, [inView, reduced, count, text.length, speed, startDelay]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      <span aria-hidden>{shown}</span>
      {cursor ? (
        <span aria-hidden className={done ? 'cursor-blink' : 'text-signal'}>
          ▮
        </span>
      ) : null}
    </span>
  );
}
```

- [ ] **Step 2: Create `src/app/design/ui/Stepper.tsx`**

```tsx
interface StepperProps {
  steps: string[];
  /** 0-indexed active step */
  current: number;
  className?: string;
}

/** Mono progress stepper for multi-step flows (quote estimator). */
export default function Stepper({ steps, current, className = '' }: StepperProps) {
  return (
    <div className={className}>
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-steel">
        Step {Math.min(current + 1, steps.length)}/{steps.length}
      </p>
      <ol className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
        {steps.map((step, i) => {
          const state = i < current ? 'done' : i === current ? 'active' : 'todo';
          return (
            <li
              key={step}
              aria-current={state === 'active' ? 'step' : undefined}
              className={`font-mono text-xs uppercase tracking-[0.15em] ${
                state === 'active'
                  ? 'text-signal'
                  : state === 'done'
                    ? 'text-bone'
                    : 'text-steel'
              }`}
            >
              {state === 'done' ? '✓ ' : `${String(i + 1).padStart(2, '0')} `}
              {step}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
```

- [ ] **Step 3: Append to `src/app/design/ui/index.ts`**

```ts
export { default as TypeOn } from './TypeOn';
export { default as Stepper } from './Stepper';
```

- [ ] **Step 4: Verify**

Run: `npm run lint 2>&1 | tail -5 && npm run type-check`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/design/ui/TypeOn.tsx src/app/design/ui/Stepper.tsx src/app/design/ui/index.ts
git commit -m "feat(design): TypeOn and Stepper primitives"
```

---

### Task 6: Primitives — Pipeline (SVG), Terminal

**Files:**
- Create: `src/app/design/ui/Pipeline.tsx`
- Create: `src/app/design/ui/Terminal.tsx`
- Modify: `src/app/design/ui/index.ts`

**Interfaces:**
- Consumes: `.pipeline-dash` CSS loop (Task 1), `framer-motion` (`useInView`, `useReducedMotion`).
- Produces:
  - `Pipeline({ stages: string[]; className?: string; animated?: boolean })` — SVG node/connector diagram; the site-wide visual language for services.
  - `Terminal({ lines: TerminalLine[]; title?: string; className?: string })` with `interface TerminalLine { text: string; tone?: 'cmd' | 'out' | 'ok' | 'warn' }` (exported) — scripted playback, plays once when in view; reduced motion shows all lines (final frame).

- [ ] **Step 1: Create `src/app/design/ui/Pipeline.tsx`**

```tsx
'use client';

import { useReducedMotion } from 'framer-motion';

interface PipelineProps {
  stages: string[];
  className?: string;
  animated?: boolean;
}

const STEP_W = 160;
const NODE_Y = 28;
const NODE_R = 5;

/**
 * Agent pipeline diagram: nodes joined by dashed connectors with a flowing
 * pulse (CSS stroke-dashoffset loop). The visual language for all 4 services.
 */
export default function Pipeline({ stages, className = '', animated = true }: PipelineProps) {
  const reduced = useReducedMotion();
  const animate = animated && !reduced;
  const width = stages.length * STEP_W;

  return (
    <svg
      viewBox={`0 0 ${width} 72`}
      className={`w-full ${className}`}
      role="img"
      aria-label={`Pipeline: ${stages.join(' to ')}`}
    >
      {stages.map((stage, i) => {
        const cx = STEP_W / 2 + i * STEP_W;
        return (
          <g key={stage}>
            {i < stages.length - 1 ? (
              <line
                x1={cx + NODE_R + 8}
                y1={NODE_Y}
                x2={cx + STEP_W - NODE_R - 8}
                y2={NODE_Y}
                stroke="var(--signal-dim)"
                strokeWidth="1.5"
                opacity="0.7"
                className={animate ? 'pipeline-dash' : undefined}
                strokeDasharray={animate ? undefined : '6 6'}
              />
            ) : null}
            <circle
              cx={cx}
              cy={NODE_Y}
              r={NODE_R}
              fill="var(--ink-950)"
              stroke="var(--signal)"
              strokeWidth="1.5"
            />
            <text
              x={cx}
              y={NODE_Y + 28}
              textAnchor="middle"
              fill="var(--steel)"
              fontSize="11"
              letterSpacing="0.14em"
              style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
            >
              {stage.toUpperCase()}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
```

- [ ] **Step 2: Create `src/app/design/ui/Terminal.tsx`**

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

export interface TerminalLine {
  text: string;
  tone?: 'cmd' | 'out' | 'ok' | 'warn';
}

interface TerminalProps {
  lines: TerminalLine[];
  title?: string;
  className?: string;
}

const TONE_CLS: Record<NonNullable<TerminalLine['tone']>, string> = {
  cmd: 'text-bone',
  out: 'text-steel',
  ok: 'text-signal',
  warn: 'text-amber',
};

const LINE_INTERVAL_MS = 350;

/** Scripted terminal playback: reveals lines once in view; plays once per visit. */
export default function Terminal({ lines, title = 'crafts.ai — agent', className = '' }: TerminalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(0);

  const visibleCount = reduced ? lines.length : shown;

  useEffect(() => {
    if (!inView || reduced || shown >= lines.length) return;
    const t = setTimeout(() => setShown((s) => s + 1), LINE_INTERVAL_MS);
    return () => clearTimeout(t);
  }, [inView, reduced, shown, lines.length]);

  return (
    <div ref={ref} className={`border border-line bg-ink-900 ${className}`}>
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <span aria-hidden className="h-2 w-2 rounded-full bg-signal" />
        <span className="font-mono text-xs uppercase tracking-[0.15em] text-steel">
          {title}
        </span>
      </div>
      <div className="min-h-32 p-4 font-mono text-xs leading-6 sm:text-sm">
        {lines.slice(0, visibleCount).map((line, i) => (
          <div key={i} className={TONE_CLS[line.tone ?? 'out']}>
            {line.tone === 'cmd' ? <span className="text-signal">&gt; </span> : null}
            {line.text}
          </div>
        ))}
        {visibleCount < lines.length ? (
          <span aria-hidden className="cursor-blink">▮</span>
        ) : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Append to `src/app/design/ui/index.ts`**

```ts
export { default as Pipeline } from './Pipeline';
export { default as Terminal } from './Terminal';
export type { TerminalLine } from './Terminal';
```

- [ ] **Step 4: Verify**

Run: `npm run lint 2>&1 | tail -5 && npm run type-check`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/design/ui/Pipeline.tsx src/app/design/ui/Terminal.tsx src/app/design/ui/index.ts
git commit -m "feat(design): Pipeline and Terminal primitives"
```

---

### Task 7: `/design` styleguide preview page

**Files:**
- Create: `src/app/design-system/page.tsx`

Note the route is `/design-system` (a `page.tsx` inside `src/app/design/` would collide with the design-system source directory — `design/` stays a non-route directory because it has no `page.tsx`; we deliberately put the preview elsewhere).

**Interfaces:**
- Consumes: everything exported from `src/app/design/ui` (Tasks 3–6), `PageLayout`.
- Produces: internal preview route `/design-system`, `robots: noindex`. NOT added to `sitemap.ts`. Used for the visual verification pass; removed in the stage-6 sweep.

- [ ] **Step 1: Create `src/app/design-system/page.tsx`**

```tsx
import type { Metadata } from 'next';
import PageLayout from '../components/layout/PageLayout';
import {
  Accordion,
  Button,
  Card,
  MonoLabel,
  Pipeline,
  SectionHeader,
  SpecTable,
  Stepper,
  Terminal,
  TypeOn,
} from '../design/ui';

export const metadata: Metadata = {
  title: 'Design System (internal)',
  robots: { index: false, follow: false },
};

export default function DesignSystemPage() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl space-y-16 px-6 py-16">
        <SectionHeader
          index="00"
          eyebrow="Internal"
          title="Agent Foundry design system"
          description="Internal preview of every primitive. Not linked, not indexed. Removed in the stage-6 sweep."
        />

        <section className="space-y-4">
          <MonoLabel>Buttons</MonoLabel>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="signal">Start a project</Button>
            <Button variant="ghost">Get estimate</Button>
            <Button variant="link" href="/design-system">Read more</Button>
            <Button variant="signal" size="lg">Start a project</Button>
            <Button variant="ghost" size="lg">Get estimate</Button>
          </div>
        </section>

        <section className="space-y-4">
          <MonoLabel>Type-on headline</MonoLabel>
          <h3 className="font-display text-4xl text-bone">
            <TypeOn text="Our agents build your software." />
          </h3>
        </section>

        <section className="space-y-4">
          <MonoLabel>Pipeline</MonoLabel>
          <Pipeline stages={['Spec', 'Agent', 'Code', 'Review', 'Ship']} />
        </section>

        <section className="space-y-4">
          <MonoLabel>Terminal</MonoLabel>
          <Terminal
            lines={[
              { text: 'agent run --brief ./client-brief.md', tone: 'cmd' },
              { text: 'Parsing brief… 4 requirements found', tone: 'out' },
              { text: 'Planning build: 12 tasks across 3 modules', tone: 'out' },
              { text: 'Writing code… src/checkout/payment.ts', tone: 'out' },
              { text: 'Running checks… lint ✓ types ✓ build ✓', tone: 'ok' },
              { text: 'Human review requested for payment flow', tone: 'warn' },
              { text: 'Shipped to staging.', tone: 'ok' },
            ]}
          />
        </section>

        <section className="grid gap-6 sm:grid-cols-2">
          <Card>
            <MonoLabel>01 AI Agents</MonoLabel>
            <p className="mt-3 text-sm text-bone">Static card with corner ticks.</p>
          </Card>
          <Card interactive>
            <MonoLabel>02 Web</MonoLabel>
            <p className="mt-3 text-sm text-bone">Interactive card — hover flares the ticks.</p>
          </Card>
        </section>

        <section className="space-y-4">
          <MonoLabel>Spec table</MonoLabel>
          <SpecTable
            rows={[
              { label: 'Scope', value: 'Custom AI agent, deployed' },
              { label: 'Stack', value: 'TypeScript, Claude API, Postgres' },
              { label: 'Timeline', value: '3–6 weeks' },
            ]}
          />
        </section>

        <section className="space-y-4">
          <MonoLabel>Stepper</MonoLabel>
          <Stepper steps={['Services', 'Scope', 'Contact']} current={1} />
        </section>

        <section className="space-y-4">
          <MonoLabel>Accordion</MonoLabel>
          <Accordion
            items={[
              { id: 'a', question: 'How fast can you start?', answer: 'Kickoff within one week of a signed scope.' },
              { id: 'b', question: "Who reviews the agent's code?", answer: 'A senior engineer reviews every shipped change.' },
            ]}
          />
        </section>

        <section className="space-y-4">
          <MonoLabel>Blueprint grid surface</MonoLabel>
          <div className="blueprint-grid flex h-40 items-center justify-center border border-line">
            <MonoLabel>● SYSTEMS NOMINAL</MonoLabel>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
```

Note: apostrophes inside plain JS string props (like `question` above) are written directly; the `&apos;` escaping rule applies only to JSX text between tags.

- [ ] **Step 2: Verify (BUILD)**

Run: `npm run lint 2>&1 | tail -5 && npm run type-check && npm run build 2>&1 | tail -5`
Expected: pass; `/design-system` appears in the build route list.

- [ ] **Step 3: Commit**

```bash
git add src/app/design-system/page.tsx
git commit -m "feat(design): internal /design-system styleguide preview"
```

---

### Task 8: Rebuild Header + MobileMenu

**Files:**
- Create: `src/app/components/layout/nav.ts`
- Modify (full rewrite): `src/app/components/layout/Header.tsx`
- Modify (full rewrite): `src/app/components/layout/MobileMenu.tsx`

**Interfaces:**
- Consumes: `Button` from `../../design/ui`; nav data from `./nav`.
- Produces:
  - `nav.ts`: `interface NavLink { index?: string; label: string; href: string }`, `SERVICE_LINKS: NavLink[]`, `PRIMARY_LINKS: NavLink[]` — Footer (Task 9) and stage-3 work reuse these.
  - `Header` (default export, no props) — fixed `h-16` bar (existing pages assume `pt-16`).
  - `MobileMenu({ open: boolean; onClose: () => void })` — full-screen blueprint overlay.
- The old Header consumed `useThemeContext`/`ThemeToggle` — the rewrite must NOT import either (unblocks Task 10 deletion).

- [ ] **Step 1: Create `src/app/components/layout/nav.ts`**

```ts
export interface NavLink {
  index?: string;
  label: string;
  href: string;
}

/**
 * STAGE-1 FALLBACK HREFS: pillar routes /services/ai-agents, /services/mobile-apps,
 * /services/agent-integration ship in stage 3. Until then, point at the closest
 * existing page so no nav link 404s. Stage 3 flips these to the real routes.
 */
export const SERVICE_LINKS: NavLink[] = [
  { index: '01', label: 'AI Agents', href: '/services' },
  { index: '02', label: 'Web Development', href: '/services/web-development' },
  { index: '03', label: 'Mobile Apps', href: '/services/ios-development' },
  { index: '04', label: 'Agent Integration', href: '/services' },
];

export const PRIMARY_LINKS: NavLink[] = [
  { label: 'Work', href: '/portfolio' },
  { label: 'Process', href: '/process' },
  { label: 'Resources', href: '/resources' },
  { label: 'About', href: '/about' },
];
```

- [ ] **Step 2: Rewrite `src/app/components/layout/Header.tsx`** (replace entire file)

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Button from '../../design/ui/Button';
import MobileMenu from './MobileMenu';
import { PRIMARY_LINKS, SERVICE_LINKS } from './nav';

export default function Header() {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const servicesRef = useRef<HTMLDivElement>(null);

  // Close overlays on route change
  useEffect(() => {
    setServicesOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  // Close services dropdown on outside click / Escape
  useEffect(() => {
    if (!servicesOpen) return;
    const onClick = (e: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setServicesOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [servicesOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-ink-950/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="font-display text-lg font-medium tracking-tight text-bone">
          CRAFTS.AI<span aria-hidden className="cursor-blink">▮</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          <div ref={servicesRef} className="relative">
            <button
              type="button"
              aria-expanded={servicesOpen}
              aria-haspopup="menu"
              onClick={() => setServicesOpen((o) => !o)}
              className={`font-mono text-xs uppercase tracking-[0.15em] transition-colors duration-150 hover:text-signal ${
                pathname.startsWith('/services') ? 'text-signal' : 'text-bone'
              }`}
            >
              Services {servicesOpen ? '−' : '+'}
            </button>
            {servicesOpen ? (
              <div
                role="menu"
                className="absolute left-0 top-full mt-4 w-72 border border-line bg-ink-900 p-2"
              >
                {SERVICE_LINKS.map((link) => (
                  <Link
                    key={link.index}
                    role="menuitem"
                    href={link.href}
                    className="flex items-baseline gap-3 px-3 py-2.5 transition-colors duration-150 hover:bg-ink-800"
                  >
                    <span className="font-mono text-xs text-signal">{link.index}</span>
                    <span className="text-sm text-bone">{link.label}</span>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          {PRIMARY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-mono text-xs uppercase tracking-[0.15em] transition-colors duration-150 hover:text-signal ${
                pathname.startsWith(link.href) ? 'text-signal' : 'text-bone'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button variant="ghost" href="/quote">Get estimate</Button>
          <Button variant="signal" href="/contact">Start a project</Button>
        </div>

        <button
          type="button"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((o) => !o)}
          className="font-mono text-xs uppercase tracking-[0.15em] text-bone transition-colors duration-150 hover:text-signal lg:hidden"
        >
          {menuOpen ? 'Close ×' : 'Menu ≡'}
        </button>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
```

- [ ] **Step 3: Rewrite `src/app/components/layout/MobileMenu.tsx`** (replace entire file)

```tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Button from '../../design/ui/Button';
import MonoLabel from '../../design/ui/MonoLabel';
import { PRIMARY_LINKS, SERVICE_LINKS } from './nav';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

/** Full-screen blueprint overlay menu (below lg breakpoint). */
export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="blueprint-grid fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-ink-950 lg:hidden">
      <nav aria-label="Mobile" className="flex min-h-full flex-col gap-10 px-6 py-10">
        <div>
          <MonoLabel>Services</MonoLabel>
          <ul className="mt-4 space-y-4">
            {SERVICE_LINKS.map((link) => (
              <li key={link.index}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="flex items-baseline gap-4"
                >
                  <span className="font-mono text-sm text-signal">{link.index}</span>
                  <span className="font-display text-2xl text-bone">{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <MonoLabel>Studio</MonoLabel>
          <ul className="mt-4 space-y-4">
            {PRIMARY_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="font-display text-2xl text-bone"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto flex flex-col gap-3 border-t border-line pt-8">
          <Button variant="signal" size="lg" href="/contact" className="w-full">
            Start a project
          </Button>
          <Button variant="ghost" size="lg" href="/quote" className="w-full">
            Get estimate
          </Button>
          <MonoLabel className="mt-4">● CRAFTS.AI — DHAKA / WORLDWIDE</MonoLabel>
        </div>
      </nav>
    </div>
  );
}
```

- [ ] **Step 4: Confirm no remaining Header dependency on theme system**

Run: `grep -rn "useThemeContext\|ThemeToggle" src/app/components/layout/`
Expected: no output.

- [ ] **Step 5: Verify (BUILD)**

Run: `npm run lint 2>&1 | tail -5 && npm run type-check && npm run build 2>&1 | tail -5`
Expected: pass. Every page now shows the new header chrome.

- [ ] **Step 6: Commit**

```bash
git add src/app/components/layout/nav.ts src/app/components/layout/Header.tsx src/app/components/layout/MobileMenu.tsx
git commit -m "feat(chrome): rebuild Header and MobileMenu on Agent Foundry system"
```

---

### Task 9: Rebuild Footer

**Files:**
- Modify (full rewrite): `src/app/components/layout/Footer.tsx`

**Interfaces:**
- Consumes: `MonoLabel` from `../../design/ui`; `SERVICE_LINKS`, `PRIMARY_LINKS` from `./nav`; `.marquee-track` CSS (Task 1).
- Produces: `Footer` (default export, no props) — marquee status ticker, sitemap columns, contact channels, legal row.

- [ ] **Step 1: Rewrite `src/app/components/layout/Footer.tsx`** (replace entire file)

```tsx
import Link from 'next/link';
import MonoLabel from '../../design/ui/MonoLabel';
import { PRIMARY_LINKS, SERVICE_LINKS } from './nav';

const TICKER = '● ACCEPTING PROJECTS — DHAKA — WORLDWIDE — AI AGENTS — WEB — MOBILE — INTEGRATION — ';

const LEGAL_LINKS = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Cookies', href: '/cookies' },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ink-950">
      {/* Marquee status ticker (CSS loop; killed globally by prefers-reduced-motion) */}
      <div className="overflow-hidden border-b border-line py-3" aria-hidden>
        <div className="marquee-track">
          <span className="whitespace-nowrap font-mono text-xs uppercase tracking-[0.18em] text-steel">
            {TICKER}
          </span>
          <span className="whitespace-nowrap font-mono text-xs uppercase tracking-[0.18em] text-steel">
            {TICKER}
          </span>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="font-display text-lg font-medium text-bone">
            CRAFTS.AI<span aria-hidden className="cursor-blink">▮</span>
          </p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-steel">
            We build AI agents. Our agents build your software.
          </p>
        </div>

        <div>
          <MonoLabel>Services</MonoLabel>
          <ul className="mt-4 space-y-2.5">
            {SERVICE_LINKS.map((link) => (
              <li key={link.index}>
                <Link
                  href={link.href}
                  className="text-sm text-bone transition-colors duration-150 hover:text-signal"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <MonoLabel>Studio</MonoLabel>
          <ul className="mt-4 space-y-2.5">
            {PRIMARY_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-bone transition-colors duration-150 hover:text-signal"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/careers"
                className="text-sm text-bone transition-colors duration-150 hover:text-signal"
              >
                Careers
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <MonoLabel>Contact</MonoLabel>
          <ul className="mt-4 space-y-2.5">
            <li>
              <a
                href="mailto:hello@craftsai.org"
                className="text-sm text-bone transition-colors duration-150 hover:text-signal"
              >
                hello@craftsai.org
              </a>
            </li>
            <li>
              <Link
                href="/contact"
                className="text-sm text-bone transition-colors duration-150 hover:text-signal"
              >
                Contact form
              </Link>
            </li>
            <li>
              <Link
                href="/quote"
                className="text-sm text-bone transition-colors duration-150 hover:text-signal"
              >
                Get an estimate
              </Link>
            </li>
          </ul>
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-steel">
            Dhaka, Bangladesh
            <br />
            GMT+6 — worldwide
          </p>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-steel">
            © {new Date().getFullYear()} CraftsAI — All systems nominal
          </p>
          <div className="flex gap-6">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-mono text-xs uppercase tracking-[0.15em] text-steel transition-colors duration-150 hover:text-signal"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
```

Note: `new Date().getFullYear()` in a server component is fine here — the year only changes annually and mismatches self-heal on next build; this matches existing usage patterns. If the existing Footer used a different email address than `hello@craftsai.org`, check the OLD `Footer.tsx` before overwriting (`git show HEAD:src/app/components/layout/Footer.tsx | grep -i "mailto\|@"`) and keep the real address.

- [ ] **Step 2: Verify (BUILD)**

Run: `npm run lint 2>&1 | tail -5 && npm run type-check && npm run build 2>&1 | tail -5`
Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/app/components/layout/Footer.tsx
git commit -m "feat(chrome): rebuild Footer with marquee ticker and sitemap"
```

---

### Task 10: Remove theme system, refresh metadata, final verification

**Files:**
- Modify: `src/app/layout.tsx` (drop ThemeProvider, reposition metadata)
- Delete: `src/app/components/ThemeToggle.tsx`
- Delete: `src/app/context/ThemeContext.tsx`

**Interfaces:**
- Consumes: Task 8 must be complete (rewritten Header no longer imports the theme system).
- Produces: theme system fully removed; site metadata repositioned to the four pillars.

- [ ] **Step 1: Confirm nothing still imports the theme system**

Run: `grep -rn "ThemeContext\|ThemeProvider\|ThemeToggle\|useThemeContext" src/ --include="*.tsx" --include="*.ts" | grep -v "src/app/context/ThemeContext.tsx" | grep -v "src/app/components/ThemeToggle.tsx"`
Expected: exactly one hit — the `ThemeProvider` import/usage in `src/app/layout.tsx`. If ANY other file matches, STOP: rewrite that consumer first (do not delete files that are still imported).

- [ ] **Step 2: Update `src/app/layout.tsx`**

Remove the import: `import { ThemeProvider } from "./context/ThemeContext";`

Unwrap the provider in the body — replace:

```tsx
<ThemeProvider>
  <ErrorBoundary>
    …
  </ErrorBoundary>
</ThemeProvider>
```

with the `<ErrorBoundary>…</ErrorBoundary>` subtree directly (children unchanged).

Replace the `metadata` fields `title`, `description`, `keywords`, `openGraph.title`, `openGraph.description`, `twitter.title`, `twitter.description` with the four-pillar positioning (everything else in `metadata` stays):

```tsx
title: {
  default: "CraftsAI | AI Agent Development Studio",
  template: "%s | CraftsAI"
},
description: "CraftsAI is an AI agent development studio in Dhaka serving clients worldwide. We build custom AI agents, ship websites and mobile apps built by AI agents, and integrate agents into your existing systems.",
keywords: [
  "AI agent development",
  "custom AI agents",
  "AI agent integration",
  "AI web development",
  "mobile app development",
  "AI automation",
  "autonomous coding",
  "AI software studio",
  "Bangladesh software company",
  "AI development agency"
],
```

```tsx
openGraph: {
  // …existing type/locale/url/siteName/images stay…
  title: "CraftsAI | AI Agent Development Studio",
  description: "We build AI agents. Our agents build your software — websites, mobile apps, and integrations, shipped fast with human review.",
},
twitter: {
  // …existing card/creator/images stay…
  title: "CraftsAI | AI Agent Development Studio",
  description: "We build AI agents. Our agents build your software — websites, mobile apps, and integrations.",
},
```

- [ ] **Step 3: Delete the theme files**

```bash
git rm src/app/components/ThemeToggle.tsx src/app/context/ThemeContext.tsx
```

- [ ] **Step 4: Verify (BUILD)**

Run: `npm run lint 2>&1 | tail -5 && npm run type-check && npm run build 2>&1 | tail -10`
Expected: all pass; no module-not-found errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(chrome): remove theme toggle system, reposition metadata to four pillars"
```

- [ ] **Step 6: Stage-1 acceptance check (visual — REQUIRES USER PERMISSION)**

Ask the user for permission to run a visible Playwright-MCP browser session. With permission: start the dev server on port 3000 (free the port first if occupied, per local-dev autonomy rules), then visit `/`, `/services`, `/about`, `/contact`, `/design-system` at 1440px and 390px widths. Screenshot each and review against the spec: dark ink canvas everywhere, new fonts rendering (Space Grotesk headings, mono labels), header dropdown works, mobile menu opens/locks scroll, footer ticker scrolls, `/design-system` shows all 10 primitives correctly. Fix any UI issue found before declaring stage 1 complete. Stop the dev server afterwards. If the user declines, report stage 1 as complete-but-not-visually-verified.

---

## Out of scope for this plan (later stages)

Stage 2 homepage (8 sections, legacy hero/demo deletion, Three.js dependency removal), stage 3 services (+ nav.ts href flip, redirects), stage 4 portfolio/content, stage 5 conversion pages, stage 6 sweep (delete `/design-system`, legacy hooks, unused components, dep prune), stage 7 full-site verification. Each gets its own plan informed by the rendered result of the previous stage.
