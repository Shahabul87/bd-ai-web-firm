# CraftsAI Full UI Redesign — Design Spec

**Date:** 2026-07-03
**Status:** Approved by founder (sections 1–6 approved in brainstorming session)
**Approach:** Rebuild on a new design system inside the existing Next.js app; keep all working infrastructure (API routes, Sheets logging, Velite content, SEO plumbing).

## 1. Context & Goals

CraftsAI is an AI software firm in Dhaka, Bangladesh serving international SMBs/startups, Bangladesh local businesses, and enterprises. The business has four pillars:

1. **AI agent building** (flagship)
2. **Website building using AI agents**
3. **Mobile app building**
4. **AI agent integration** into existing systems

The current site is a ~30-route Next.js 15 marketing site positioned around generic AI/ML services (ML training, NLP, computer-vision demos) with a generic indigo/purple/cyan look, three duplicate hero implementations, a Three.js scene, and duplicated route trees. The redesign repositions everything around the four pillars with a unique visual identity.

**Scope:** Marketing site + lead operations only. No auth, no database, no client portal (possible future phases, out of scope here). Brand name **CraftsAI stays**; visual identity is fully replaced.

**Proof content:** Real client projects exist; founder will supply details (names/anonymity, outcomes, metrics, permission) during the portfolio stage. Nothing fabricated goes live — no fake testimonials, logos, or stats.

## 2. Brand & Visual Language — "The Agent Foundry"

CraftsAI presents as an engineering studio where AI agents are designed, built, and shipped. The site should feel like a precision instrument. Motifs: blueprint grids, terminal output, pipeline diagrams, status readouts.

### Color system (dark-only; light theme and ThemeToggle removed)

| Token | Value | Role |
|---|---|---|
| `ink-950` | `#0A0C10` | Page background |
| `ink-900` | `#11141A` | Raised surfaces, cards |
| `ink-800` | `#1A1E26` | Borders-as-fills, hover surfaces |
| `signal` | `#D8FF3E` | THE accent — CTAs, cursor, active states; one per viewport |
| `signal-dim` | `#9BBD2A` | Hover/secondary signal |
| `bone` | `#EDEEE8` | Primary text (warm off-white) |
| `steel` | `#8A919E` | Secondary text |
| `line` | `#262B35` | Hairline borders, blueprint grid lines |
| `amber` | `#FFB347` | Warnings/highlights in demos only |

### Typography (all self-hosted via `next/font`)

- **Display/headings:** Space Grotesk (variable) — 64–120px hero scale
- **Body:** Instrument Sans
- **Mono:** JetBrains Mono — used structurally: section indices (`01 / AGENTS`), data callouts, status lines, nav meta

### Signature motifs (used consistently site-wide)

1. **Blueprint grid** — faint 1px `line` grid on section backgrounds, revealed near cursor
2. **Terminal cursor** — chartreuse block cursor `▮` blinks after headlines; brand mark `crafts.ai_▮`
3. **Pipeline diagram language** — agents as nodes with animated dashed connectors; the visual system for explaining all 4 services
4. **Status readouts** — mono microcopy (`● SYSTEMS NOMINAL`, `> deploying agent…`) as decorative-but-honest garnish
5. **Corner ticks** — blueprint-style corner brackets on cards; no rounded-glass cards, no glass-morphism, no glow blobs

**Logo:** wordmark `CRAFTS.AI` in Space Grotesk with terminal cursor. No mascot.

## 3. Sitemap & Information Architecture

```
/                          Homepage — the Agent Foundry
/services                  Overview: 4 pillars as an interactive pipeline
├─ /services/ai-agents         Pillar 1 — Custom AI agent building (flagship)
├─ /services/web-development   Pillar 2 — Websites built by AI agents (slug kept for SEO)
├─ /services/mobile-apps       Pillar 3 — iOS + Android consolidated
└─ /services/agent-integration Pillar 4 — Integrating agents into existing systems
/portfolio (+ [slug])      Real client case studies (Velite MDX)
/process                   Discovery → build → deploy → support (absorbs old /services/support)
/about                     Founder story, team, why Dhaka + global
/resources                 Hub: blog, guides, case studies (Velite pipeline kept)
├─ /resources/blog, /resources/guides, /resources/case-studies (+ slugs)
/contact                   Channels + form
/quote                     3-step estimator → /api/quote
/careers                   Simple listing
/privacy /terms /cookies   Legal, restyled
```

**Cuts with 301 redirects in `next.config.ts`:**

- `/blog/*` → `/resources/blog/*`
- `/services/ios-development`, `/services/android-development` → `/services/mobile-apps`
- `/services/support` → `/process`
- `/products/*` → `/portfolio` (no standalone products among the four pillars)
- `/faq` → folded into `/quote` and `/contact` as inline accordions

**Navigation:** Services (dropdown, 4 pillars), Work, Process, Resources, About + persistent `Start a project` (signal) and `Get estimate` CTAs. Mobile: full-screen blueprint-style overlay. Footer: full sitemap, contact channels (email, WhatsApp), legal.

**Demo requests:** existing `/api/demo` + `DemoRequestForm` become a "Book a walkthrough" modal on service pages (no separate route).

## 4. Homepage — 8 sections

Narrative: *"We build AI agents. The agents build your software."*

1. **Hero — "The Foundry Floor":** full-viewport ink, cursor-revealed blueprint grid. Headline `We build AI agents.` / `Our agents build your software.` — second line types on with block cursor. Two CTAs (`Start a project` signal, `See how it works ↓` ghost). Live SVG agent-pipeline diagram (`SPEC → AGENT → CODE → REVIEW → SHIP`) with chartreuse pulse. Bottom mono status line: `● CRAFTS.AI — DHAKA / WORLDWIDE — ACCEPTING PROJECTS`. Replaces all three legacy heroes and the Three.js scene.
2. **Four pillars grid:** corner-tick cards numbered `01 AI AGENTS` … `04 INTEGRATION`; hover animates each card's mini-pipeline; links to service pages.
3. **"How agents build" showcase:** stylized terminal/editor plays a scripted honest build sequence (brief → plan → code typing → checks → ship). Scroll-triggered, plays once; reduced-motion gets static final frame. Caption states what's automated vs human-reviewed.
4. **Selected work:** three real case studies as blueprint spec sheets — client/sector in mono, outcome in display type, key metric oversized in chartreuse. Links to `/portfolio`.
5. **Process strip:** horizontal 4-phase timeline with mono durations, links to `/process`.
6. **Proof bar:** real numbers only (projects shipped, platforms, response time), count-up on scroll. No fake logos.
7. **Resources preview:** two latest posts, single quiet row.
8. **Final CTA — "Brief an agent":** full-width ink panel, `Have something to build?`, signal CTA + WhatsApp/email/quote alternatives.

**Kept:** AIChatbot widget, WhatsAppButton (both restyled), StructuredData/SEO, analytics.

## 5. Service Pages, Portfolio, Quote & Supporting Pages

**Service page template** — one `ServicePageTemplate` component + four content configs:

1. Header: mono breadcrumb (`SERVICES / 01`), display headline, one-paragraph promise, CTA
2. Pipeline hero: pillar-specific animated pipeline, stages labeled per service
3. What you get: spec-sheet table (scope, stack, timeline range, automated vs human-reviewed)
4. Use cases: 3–4 scenarios; plain-language headline + technical detail beneath (serves SMB and enterprise readers)
5. Engagement & pricing signal: honest USD ranges / "from" pricing, note for local BDT engagements, link to `/quote`
6. FAQ accordion (folded-in per-service FAQ content)
7. Cross-links to other pillars + final CTA

Per-pillar flavor: **ai-agents** = flagship, longest, includes terminal build-showcase; **web-development** = before/after of agent-built sections; **mobile-apps** = platform-toggle spec sheet; **agent-integration** = systems diagram (client stack ⟶ agent layer ⟶ CRM/ERP/WhatsApp etc.).

**Portfolio:** index filterable by pillar; spec-sheet cards. Detail skeleton: context → what was built → how agents were used → measurable outcome → stack. Authored as Velite MDX; adding cases requires no code changes. If founder content isn't ready at build time, ship the layout with a minimal honest "selected work" state — nothing fake.

**Quote:** 3-step terminal-styled estimator (pillar(s) → scope: budget band, timeline, existing systems → contact), mono stepper `STEP 2/3`, submits to existing `/api/quote`. Inline FAQ accordion below. Rebuilds `ServiceConfigurator`.

**Contact:** split layout — left: email, WhatsApp deep link, location/timezone with live Dhaka clock (mono); right: short form → `/api/contact`.

**Process:** vertical scroll-driven timeline; each phase pins briefly with artifacts (kickoff doc, staging links, support SLA — absorbs old support page).

**About:** founder story; why an AI-agent studio in Dhaka serving global clients is an advantage (cost + capability); team; principles. No stock-photo grid.

**Careers/legal:** restyled on tokens, content-light.

## 6. Motion & Animation System

One shared module (`design/motion.ts` + CSS keyframes); personality: **mechanical precision** — snap, type, pulse; never float, bounce, or bloom. Complete catalog (nothing outside it):

| Animation | Where | How |
|---|---|---|
| Type-on + cursor | Hero headline, section CTAs | Character reveal, chartreuse block cursor blinks at rest |
| Pipeline pulse | Hero, service pages, pillar cards | SVG dashed connectors, signal dot travels (`stroke-dashoffset` CSS loop) |
| Grid reveal | Section backgrounds | Radial-gradient mask following pointer, throttled; disabled on touch |
| Corner-tick flare | Cards, buttons | Brackets extend + tint signal, 150ms ease-out |
| Scroll reveal | Every section entry | 12px rise + fade, 400ms, 60ms child stagger; `once: true` |
| Terminal playback | Homepage showcase, ai-agents page | Scripted line-by-line, scroll-triggered, plays once |
| Count-up | Proof bar, metrics | Mono digits roll up on first view |
| Marquee status line | Footer top edge | Slow mono ticker (CSS loop) |
| Page transition | Route changes | 200ms fade-through-ink; instant back-nav |
| Stepper advance | Quote estimator | 16px horizontal slide, counter increments |

**Rules:**
- Framer Motion for orchestration (viewport triggers, stagger, variants); plain CSS for infinite loops (cursor, pulse, marquee) — loops never run in JS
- Only `transform`/`opacity` animate; `will-change` only on the two long-running loops
- Three.js / `@react-three/fiber` / `@react-three/drei` removed entirely (~600KB); SVG pipeline replaces the 3D scene
- All viewport triggers fire once; nothing re-triggers on scroll-up
- `prefers-reduced-motion`: global CSS kill-switch stays + shared `useReducedMotion` gate renders static final frames for terminal/pipeline
- Legacy hooks (`useScrollAnimation`, `useVisibilityPause`, `useSimplifiedAnimation`, `animationOptimizer`) replaced by this system and deleted after migration

## 7. Technical Execution

### New structure

```
src/app/
├─ design/
│  ├─ tokens.css                colors, type scale, spacing (imported by globals.css)
│  ├─ motion.ts                 shared Framer variants + reduced-motion gate
│  └─ ui/                       ~10 primitives: Button, Card (corner-ticks), SpecTable,
│                               Accordion, Stepper, SectionHeader, MonoLabel, TypeOn,
│                               Pipeline (SVG), Terminal
├─ components/
│  ├─ layout/                   Header, MobileMenu, Footer — rebuilt
│  ├─ home/                     8 homepage sections
│  ├─ services/                 ServicePageTemplate + 4 configs
│  └─ shared/                   CTAPanel, ProofBar, CaseCard, ContactChannels
└─ (routes per §3, redirects in next.config.ts)
```

### Kept as-is
`/api/*` routes, `lib/sheets.ts`, Velite content pipeline, `sitemap.ts`, `rss.xml`, `opengraph-image.tsx` (re-skinned), StructuredData, analytics, rate-limit/CSRF utils, ErrorBoundary.

### Deleted after migration
All three legacy heroes + `components/hero/` (Three.js scene, NeuralParticles, RoboticFaces, AIBrainMesh); `three`, `@react-three/fiber`, `@react-three/drei` deps; ML demo components (`components/demos/`, `components/services/*Demo`); `CodeShowcase*`; duplicate `*Optimized` variants; `ThemeToggle` + light theme + `ThemeContext`; `about/test-page.tsx`; legacy animation hooks; `/blog` route tree; ios/android/support/products/faq pages (301s in place).

### Build order (each stage leaves the site shippable)

1. **Foundation** — tokens, self-hosted fonts, `motion.ts`, UI primitives, new Header/Footer (old pages render inside new chrome)
2. **Homepage** — all 8 sections; delete legacy heroes/demos
3. **Services** — template + 4 pillar pages; redirects live
4. **Portfolio + content** — case-study skeleton in Velite; **founder supplies real project details here**
5. **Conversion pages** — quote estimator, contact, process, about
6. **Sweep** — careers/legal restyle, products/faq removal, OG image re-skin, dead-code deletion, dependency prune
7. **Verification** — `npm run lint`, `npm run type-check`, `npm run build`; then, with founder permission, a visible Playwright-MCP browser pass over every route at mobile + desktop widths, screenshot-reviewing each against the design system

### Risks & mitigations
- **SEO:** every removed URL 301s; `sitemap.ts` regenerates from the new tree
- **Performance:** removing Three.js improves LCP; terminal/pipeline are code-split client components, below the fold where possible
- **Content bottleneck:** portfolio ships with honest minimal state if case-study content isn't ready; nothing fabricated goes live

### Testing
No test framework is currently configured. Verification for this project = lint + type-check + production build + the visible browser pass (stage 7). Adding a test framework is out of scope.
