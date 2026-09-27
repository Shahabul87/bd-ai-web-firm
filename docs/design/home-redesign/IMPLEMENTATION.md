# Implement mock A ("Attention") in the Next.js site — plan (2026-09-27)

Branch: `feat/home-attention-redesign` (from `feat/production-readiness-remediation` @ 3f6da78).
Founder decisions: headline **"Stop demoing AI. Start profiting from it."**; scope = home page +
restyle of the shared header and footer. Source of truth for look/behaviour:
`docs/design/home-redesign/mock-a-attention.html`. Copy: `CONTENT.md` (+ new headline).

## Architecture
- Home sections are **server components** (`useTranslations` on the server); the interactive pieces
  are small client islands that receive typed props. `Home` leaves `CLIENT_NAMESPACES` (less payload).
- Hero data (tokens, candidate probabilities, think times, attention matrix) lives in
  `messages/{en,bn}.json` under `Home.hero` and is validated with Zod at render.
- The headline is fully rendered in SSR HTML (SEO, no-JS). The "generate" animation hides tokens only
  under `@media (scripting: enabled)`, with a CSS safety reveal if JS never takes control.
- Imperative animation lives in `home/attention/heroController.ts` (DOM + timers, cancellable);
  pure geometry/weights in `home/attention/geometry.ts` (unit-tested).
- Styles: `src/app/styles/home-attention.css`, scoped under `.attn` (no leakage into other pages);
  forest tokens added to `design/tokens.css`. Fonts: Instrument Serif + Schibsted Grotesk via next/font;
  `:lang(bn)` swaps both to Anek Bangla.

## Files (status = derive from disk)
| File | Purpose |
|---|---|
| src/app/components/home/attention/schema.ts | Zod schema + types for Home.hero data |
| src/app/components/home/attention/geometry.ts | line grouping, arc paths, symmetric weights |
| src/app/components/home/attention/heroController.ts | generation, caret, candidates, arcs, query |
| src/app/components/home/AttentionHero.tsx | client island for the hero |
| src/app/components/home/TokenBand.tsx | server, CSS marquee of tokens |
| src/app/components/home/ServicesIndex.tsx + ServiceDiagrams.tsx | server, six services + SVGs |
| src/app/components/home/InView.tsx | client: toggles `.vis` via IntersectionObserver |
| src/app/components/home/Principles.tsx + PrincipleVisuals.tsx | server + client micro-visuals |
| src/app/components/home/ProcessSteps.tsx | client: pinned scroll + arcs |
| src/app/components/home/ExampleTraces.tsx | server |
| src/app/components/home/GeneratedTitle.tsx + FinalCTA.tsx | client caret title + server CTA |
| src/app/components/HomePage.tsx | composition |
| src/app/components/layout/{Header,Footer,MobileMenu,LocaleToggle}.tsx | forest restyle |
| messages/en.json, messages/bn.json | new `Home`, updated Header/Footer copy |
| delete old home/* sections + homeRouting (after grep proves unused) | |
| tests: geometry, schema-vs-messages, Header, a11y | |

## Gates
`npm run check:fast` after each unit; `npm run ci:local` before claiming done; visible Playwright
browser check EN + BN at 1440 and 390 (asked/approved by founder flow).
