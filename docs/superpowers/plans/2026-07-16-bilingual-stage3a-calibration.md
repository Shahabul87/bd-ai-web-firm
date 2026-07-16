# Bilingual EN/BN — Stage 3a: Bengali Calibration Slice — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Translate the highest-visibility ~1,136-word slice of `messages/bn.json` — the chrome (Nav, Header, Footer, CTABand, PillarCards), the homepage (Home), and one service page (Services.web) — into natural Bengali, so the founder can correct the VOICE on a small sample before I draft the remaining ~7,600 words in the corrected voice.

**Architecture:** Edit `messages/bn.json` only — replace the English placeholder VALUES of the slice namespaces with Bengali. Keys, structure, interpolation placeholders, slugs, and every other namespace stay exactly as-is. No component, route, or config changes. `localeDetection` stays OFF (`/bn` is still partly English).

**Tech Stack:** next-intl 4.13.2, `messages/bn.json`, Anek Bangla (already wired Stage 1).

**Spec:** `docs/superpowers/specs/2026-07-14-bilingual-en-bn-design.md`
**Predecessor:** Stages 1 + 2 merged to main (PR #5, #8). Start from `main`.

## Global Constraints

- **This is a VALUE-only edit of `messages/bn.json`.** Do NOT change any KEY, any structure, any array length, or any other namespace. Do NOT touch en.json, any component, any route, `src/i18n/`, or config. The ONLY file that changes is `messages/bn.json`.
- **`localeDetection` and `alternateLinks` stay OFF.** `/bn` is still partly English (about, contact, services/ios, etc. are untranslated placeholders). Re-enabling geo-redirect now would send Bengali visitors to a half-English site. That is Stage 3b's job, once `/bn` is fully translated. Do NOT touch `src/i18n/routing.ts`.
- **Register: formal Bengali (আপনি / আপনার), never informal (তুমি).** This is a professional B2B engineering studio.
- **Keep these ENGLISH (do not translate):** technical terms and proper nouns — `AI agent`/`AI এজেন্ট` (transliterate as commonly written, keep "AI"), `API`, `web`, `iOS`, `Android`, `Next.js`, `React`, framework/tool names, `CraftsAI`, `Dhaka`/`Bangladesh` (or their standard Bengali `ঢাকা`/`বাংলাদেশ` — use the standard Bengali forms for place names, keep product/tech names Latin). When unsure whether a term is "technical", keep it English — the founder can Bengali-ise it if they prefer.
- **The `fig. 0N` mono drafting labels are NOT in the messages** (they are English literals in code). Nothing to do for them here.
- **Numeral convention (founder decision 2026-07-16):**
  - Section indices, dates, plain counts → **Bengali numerals** (০১২৩৪৫৬৭৮৯). E.g. `01`→`০১`, `2025`→`২০২৫`, `4 stats`→`৪`.
  - Keep **Latin** in mixed technical/marketing tokens: `10x`/`8x`, `$50K–200K`, `GMT+6`, version numbers, anything glued to a Latin unit or symbol. E.g. `10x faster` → `10x দ্রুত` (keep `10x`).
  - When a number is inside an ICU placeholder or a `{year}`-style interpolation, DO NOT hardcode a numeral — leave the placeholder; the runtime formats it.
- **Preserve EVERY interpolation and markup token EXACTLY:** `{year}`, `{name}`, ICU `{x, plural, …}`, and any `t.rich` tag markers (e.g. `<accent>…</accent>`). Translate the surrounding words, never the token. A broken/renamed token = MISSING_MESSAGE or a raw tag rendered to the user.
- TypeScript/JSON must stay valid. No trailing commas, correct escaping of `"` inside strings.
- NEVER use `git checkout --`, `git restore`, `git stash`, `git reset --hard`. Undo with the Edit tool.
- Use `npm run type-check`, NEVER `npx tsc --noEmit`. Do NOT run `prettier`.
- ⚠️ Gates: `npm test` (baseline **30 suites / 139 tests** — the PARITY test must stay green: same keys, no empties, no dup, no `fig.`), and COLD `npm run build` (`rm -rf .next`, exit 0, **110/110**, 85 SSG routes). A broken interpolation shows up as a build/render error — the build is the real gate.

## The slice (1,136 words, measured)

| Namespace | Words | Renders on |
|---|---|---|
| `Nav` | 15 | every page (header + footer nav) |
| `Header` | 21 | every page |
| `Footer` | 47 | every page |
| `CTABand` | 35 | most pages (incl. homepage + service pages) |
| `PillarCards` | 90 | homepage |
| `Home` | 493 | homepage |
| `Services.web` | 435 | /services/web-development |

---

## Task 1: Draft the Bengali for the entire slice

**One task, one drafter, so the VOICE is consistent** — the founder is calibrating a single voice, not stitching several. Do the whole slice in one pass.

**Files:**
- Modify: `messages/bn.json` (VALUES of the 7 slice namespaces only)

**Interfaces:**
- Consumes: `messages/en.json` (the English source — the exact strings to translate) and this plan's conventions.
- Produces: `messages/bn.json` with the slice namespaces in Bengali, everything else unchanged.

- [ ] **Step 1: Read the English source for the slice**

```bash
cd /Users/mdshahabulalam/myprojects/bdaiwebfirm/bd-ai-web-firm
python3 -c "
import json
en=json.load(open('messages/en.json'))
sub={k:en[k] for k in ['Nav','Header','Footer','CTABand','PillarCards','Home']}
sub['Services']={'web':en['Services']['web']}
print(json.dumps(sub, ensure_ascii=False, indent=2))
"
```

Read every string. Note which contain interpolation tokens — those tokens must survive verbatim.

**The EXACT tokens and judgment-call numbers in THIS slice (measured 2026-07-16 — do not miss one):**

Interpolation/markup tokens (translate around them, never alter the token):
- `Footer.copyright` = `"© {year} CraftsAI — All systems nominal"` — keep `{year}` verbatim.
- `Home.hero.titleLine2` = contains `<accent>…</accent>` — keep both tags; translate the words inside/around them. This renders via `t.rich`, so the tags MUST stay or the page throws.

Numbers — apply the convention deliberately (Bengali numerals for prose/index, Latin for technical tokens):
- **→ Bengali numerals:** `Home.process.steps[].index` `01`–`05` → `০১`–`০৫`; `Home.proof.facts[0]` "4 products shipped" → `৪`; `Home.build.terminal` "4 requirements", "12 tasks across 3 modules" → Bengali digits (these are prose).
- **→ keep Latin** (technical/unit-glued tokens): `Footer.timezone` `GMT+6`; `Home.advantage.rows` `3–6 months`/`2–6 weeks`/`$50K–200K`/`~80% less`; `Home.work.projects[2].outcome` `grade 9–12`; `Home.resources.items[].readTime` `5 min`/`8 min`/`12 min` (the digit is glued to a unit — but translate "min" → the Bengali word if natural, keep the digit's treatment consistent with your call and note it); `10×`/`10x`; `Home.build.terminal` `lint ✓ types ✓ tests 34/34 ✓` — this is a literal terminal/CLI line, keep it AS-IS in English (it mimics real tool output; translating it would be wrong). Same for any command/path line in `Home.build.terminal`.
- When in doubt on a number, keep Latin and note it — the founder decides on review.

- [ ] **Step 2: Translate, applying every convention**

Edit `messages/bn.json`. For each of the 7 slice namespaces, replace the English placeholder value with natural, formal Bengali, following the Global Constraints (register, kept-English terms, numeral convention, preserved tokens). Work namespace by namespace. Keep terminology consistent across the whole slice (e.g. translate "agent", "studio", "build", "ship" the same way everywhere — pick one Bengali rendering per key term and reuse it; a short glossary in your report helps the founder).

Do NOT touch any other namespace's values, any key, or en.json.

- [ ] **Step 3: JSON still valid, parity still green**

```bash
npx jest src/__tests__/messages-parity.test.ts
```

Expected: PASS. (Same keys, no empties, no dup, no `fig.` — you only changed values.) If it fails, you altered a key or structure — fix it.

- [ ] **Step 4: Prove the slice is ACTUALLY Bengali (not leftover English), and other namespaces are UNTOUCHED**

```bash
python3 -c "
import json, re
bn=json.load(open('messages/bn.json'))
BENG=re.compile(r'[ঀ-৿]')
def has_bengali(o):
    if isinstance(o,dict): return any(has_bengali(v) for v in o.values())
    if isinstance(o,list): return any(has_bengali(v) for v in o)
    return isinstance(o,str) and bool(BENG.search(o))
slice_ns=['Nav','Header','Footer','CTABand','PillarCards','Home']
for ns in slice_ns:
    print(f'  {ns}: {\"Bengali present\" if has_bengali(bn[ns]) else \"!! STILL ENGLISH\"}')
print(f'  Services.web: {\"Bengali present\" if has_bengali(bn[\"Services\"][\"web\"]) else \"!! STILL ENGLISH\"}')
# other Services subpages must still be English placeholder
print(f'  Services.ios (must stay English): {\"!! TRANSLATED (out of scope)\" if has_bengali(bn[\"Services\"][\"ios\"]) else \"English (correct)\"}')
print(f'  About (must stay English): {\"!! TRANSLATED\" if has_bengali(bn[\"About\"]) else \"English (correct)\"}')
"
```

Expected: all 7 slice namespaces "Bengali present"; Services.ios and About still English. If a slice namespace is still English, it wasn't translated. If an out-of-scope namespace has Bengali, you translated too much — revert it.

- [ ] **Step 5: Full gate**

```bash
npm run lint && npm run type-check && npm test
rm -rf .next && npm run build 2>&1 | tail -8
python3 -c "import json;print('SSG routes:',len(json.load(open('.next/prerender-manifest.json'))['routes']))"
```

Expected: green; build exit 0, 110/110, 85 SSG routes, only the 3 known warnings. A broken interpolation token will fail the build here — if it does, find the token you altered and restore it.

- [ ] **Step 6: Prove Bengali renders on the homepage HTML**

```bash
python3 -c "
import re
html=open('.next/server/app/bn.html', encoding='utf-8', errors='replace').read()
print('Bengali codepoints in /bn homepage HTML:', len(re.findall(r'[ঀ-৿]', html)))
print('English hero still present (should be GONE now):', 'draft agents' in html)
"
```

Expected: many Bengali codepoints; the English "draft agents" hero string should be GONE from `/bn` (replaced by Bengali). `/en.html` must still have it (untouched).

- [ ] **Step 7: Commit**

```bash
git add messages/bn.json
git commit -m "feat(i18n): Bengali translation — calibration slice (chrome + home + web service)

Translates the highest-visibility ~1,136-word slice into formal Bengali:
Nav, Header, Footer, CTABand, PillarCards, Home, and Services.web. Chrome
renders on every page; home + web service give a full-page sample.

Conventions: formal register (আপনি); technical/product names kept English
(AI, API, iOS, Android, CraftsAI, framework names); Bengali numerals for
prose/dates/indices but Latin for 10x/\$50K/versions; interpolation tokens
({year}, <accent>, ICU) preserved verbatim.

localeDetection stays OFF — /bn is still partly English until stage 3b
translates the rest. Reachable via the EN/BN toggle for review.

This is the calibration slice: the founder corrects the voice here, then
stage 3b drafts the remaining ~7,600 words in the corrected voice.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Verification guard + founder browser review prep

**Files:**
- Create: `src/__tests__/bn-slice-translated.test.ts`

**Interfaces:**
- Consumes: the translated `messages/bn.json`.
- Produces: a guard that fails if a slice namespace regresses to English (protects the calibration work through Stage 3b).

- [ ] **Step 1: Write a guard that the slice namespaces contain Bengali**

```ts
import bn from '../../messages/bn.json';

const BENGALI = /[ঀ-৿]/;

type Json = { [k: string]: unknown };
function hasBengali(v: unknown): boolean {
  if (typeof v === 'string') return BENGALI.test(v);
  if (Array.isArray(v)) return v.some(hasBengali);
  if (v && typeof v === 'object') return Object.values(v as Json).some(hasBengali);
  return false;
}

// The stage-3a calibration slice is translated. These must stay Bengali through
// stage 3b so the founder's corrected voice is not silently reverted to English.
const SLICE = ['Nav', 'Header', 'Footer', 'CTABand', 'PillarCards', 'Home'] as const;

describe('bn calibration slice stays translated', () => {
  it.each(SLICE)('%s contains Bengali', (ns) => {
    expect(hasBengali((bn as Json)[ns])).toBe(true);
  });
  it('Services.web contains Bengali', () => {
    expect(hasBengali((bn as { Services: { web: unknown } }).Services.web)).toBe(true);
  });
});
```

- [ ] **Step 2: Prove it is assertion-red**

Temporarily set `bn.json`'s `Header.getEstimate` back to English (`"Get estimate"`) — the test must still pass (other Header keys are Bengali), so instead temporarily blank ALL of `Header` to English to confirm the Header case fails. Simpler: confirm it passes now, then reason that it fails if a whole namespace reverts. Actually verify concretely: temporarily replace the whole `Header` object's values with English, run the test, watch `Header contains Bengali` fail, then restore. Report the evidence.

```bash
npx jest src/__tests__/bn-slice-translated.test.ts
```

Expected: PASS (7 cases) after restore.

- [ ] **Step 3: Full gate + commit**

```bash
npm run lint && npm run type-check && npm test
git add src/__tests__/bn-slice-translated.test.ts
git commit -m "test(i18n): guard the bn calibration slice stays Bengali

Fails if Nav/Header/Footer/CTABand/PillarCards/Home/Services.web regress to
English, so stage 3b cannot silently revert the founder's corrected voice.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Stage 3a Definition of Done

- [ ] `messages/bn.json` slice namespaces are natural formal Bengali; every other namespace unchanged English placeholder
- [ ] Parity test green; `npm test` 31+ suites green; COLD build 110/110, 85 SSG routes
- [ ] `/bn` homepage HTML renders Bengali; `/en` untouched
- [ ] Interpolation tokens (`{year}`, `<accent>`, ICU) all intact
- [ ] Numeral convention applied; technical terms kept English; formal register
- [ ] **Founder browser review** (visible Chromium, ask permission): founder reads the Bengali homepage + a service page via the EN/BN toggle and corrects the voice. Their corrections become the reference for Stage 3b.

## Handoff to Stage 3b (the rest + machinery)

After the founder corrects the slice voice:
- Draft the remaining ~7,600 words (About, Careers, Process, Products, Portfolio, Resources, Faq, Legal, Contact, Quote, ErrorPage, Chatbot, Meta, the other Services, NotFound) in the corrected voice.
- API error codes (contact/quote routes → codes, client maps to translated text) — spec §8.2.
- `content/faq/faq.json` → locale-keyed. `content/testimonials/testimonials.json` is unused → flag for deletion, do not translate.
- **Re-enable `localeDetection` + `alternateLinks` in `src/i18n/routing.ts`** (delete the two `false` lines) IN THE SAME COMMIT that completes the translation, and **re-invert the middleware guard tests** in `src/__tests__/middleware.test.ts` (the ones that currently assert a Bengali-preferring visitor is NOT redirected).
- Mark the mono drafting labels' companion decision if it recurs; keep `fig.` English.
