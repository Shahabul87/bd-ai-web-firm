# /process Page Redesign — "The Conveyor" — Design Spec

**Date:** 2026-07-05
**Status:** Approved direction (Option A picked from 3 live animated mockups)
**Page:** `src/app/process/page.tsx` (https://www.craftsai.org/process)

## 1. Concept

The client's project is a glowing build artifact riding a foundry line through five
stations (Discovery → Planning → Development → Testing → Launch). The visitor watches
their build move: the cube travels the track, the arriving station lights up with a
ping, and that phase's detail card swaps in below. The metaphor matches the site-wide
"Agent Foundry" identity and makes the process feel observable — the page's whole
argument is "no black boxes."

Everything stays inside the existing design system: ink surfaces, `signal` chartreuse,
`steel`/`bone` text, `amber` accents, Space Grotesk display, JetBrains Mono labels,
and the shared Drafting Room `PageHero` band.

## 2. Page structure (top to bottom)

1. **PageHero** (existing shared component, new copy)
   - eyebrow: `Process`
   - title: `Your project rides the line.`
   - lede: `Five stations between idea and launch. Watch it move — no black boxes,
     no surprises, just a build you can follow with your own eyes.`
2. **Conveyor section** (new client component — the signature)
3. **Communication section** (kept as-is from current page: "Transparency is how we
   work." + 4-item grid)
4. **CTABand** (kept as-is: "Ready to get started?", Phase-1-free line)

SEO `metadata` block is kept unchanged (title, description, OG, canonical).

## 3. The Conveyor component

New file: `src/app/components/process/ConveyorProcess.tsx` (`'use client'`).
`page.tsx` stays a server component exporting `metadata` and rendering the client
component with the phase data as props (data lives in `page.tsx` so copy edits stay
in one file).

### Layout

- `SectionHeader` (existing UI): index `fig. 01 — the line`, title
  `How a project moves through CraftsAI.`
- **Readout row** (mono, uppercase): left `STATION 03/05 — DEVELOPMENT` (live,
  chartreuse station name); right `05 STATIONS · TYPICAL TOTAL 2–6 WEEKS` (static —
  no fake "elapsed" clock in production).
- **Track**: full-width horizontal rail.
  - Base line: dashed `line`-colored track.
  - Progress line: `signal-dim` fill up to the cube, subtle chartreuse glow.
  - 5 station nodes: 45°-rotated squares. States: *upcoming* (line border, ink fill),
    *done* (signal-dim fill), *active* (signal fill + glow + expanding ping ring).
  - Station labels: mono number above, mono name below. Stations are `<button>`s.
  - **Cube** ("YOUR BUILD" tag): chartreuse rotated square with glow + gentle
    scale "hum" loop, travels between stations with a 1s ease.
- **Phase card**: single card below the track (existing `Card` + `SpecTable` UI):
  station number, phase title, description, spec rows (Deliverables / Your role /
  Timeline). Content crossfades (fade+8px rise, ~300ms) on station change.
  Fixed `min-height` so the page never reflows during swaps.

### Motion & interaction model

- **Advance on scroll-into-view + auto-play**: when the section enters the viewport
  (IntersectionObserver), the line starts at station 01 and auto-advances every ~5s,
  looping. No scroll-jacking / no sticky pinning — the rest of the site scrolls
  normally and this stays robust on mobile.
- **Click/keyboard**: clicking a station jumps the cube there and resets the
  auto-advance timer. Stations are real buttons (focus ring, `aria-current="step"`,
  `aria-label="Station 02: Planning"`). Left/Right arrow keys move between stations
  when a station has focus.
- **Pause when unseen**: auto-advance stops when the section leaves the viewport or
  the tab is hidden (no wasted work, no surprise state jumps).
- **Reduced motion** (`prefers-reduced-motion`): no auto-advance, no cube transit
  animation, no ping — the five phases render as the track (all nodes visible,
  click still works) with instant card swaps. Content is never motion-gated.

### Responsive

- ≥ `sm`: full track with number + name labels at every station.
- < `sm`: track keeps all 5 nodes but hides per-station name labels (numbers only);
  the active station's name lives in the readout row. Card stacks full-width.
  Tap targets stay ≥ 44px via padded button hit areas.

### Implementation notes

- Plain React state + CSS transitions (matches mockup, which is already proven);
  `framer-motion` (already a dependency) may be used for the card crossfade but is
  not required. No new dependencies.
- All animation is CSS keyframes/transitions — no rAF loops, no `Math.random()`/
  `Date.now()` in render (SSR-safe; component renders station 01 deterministically
  on the server).
- Timer hygiene: intervals/timeouts cleared on unmount; visibility handled via
  IntersectionObserver + `document.visibilitychange`.
- New keyframes (`station-ping`, `cube-hum`) go in `src/app/design/tokens.css`
  alongside the existing motion primitives.
- Typed `Phase` interface stays as today (`number/title/what/deliverables/yourRole/
  timeline`). No `any`.

## 4. Out of scope

- No changes to other pages, nav, or the communication/CTA content.
- No backend, no forms, no analytics changes.

## 5. Verification

- `npm run lint`, `npm run type-check`, `npm test`, `npm run build` all pass.
- Visible-browser check (Playwright MCP, with permission): desktop 1440px and mobile
  390px — watch a full auto-advance loop, click stations, keyboard-nav, and confirm
  reduced-motion fallback via emulation. Screenshot-review each state.
