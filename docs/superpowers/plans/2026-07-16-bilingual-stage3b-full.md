# Bilingual EN/BN — Stage 3b: Full Bengali + Enable Geo-Detection — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use `- [ ]`.

**Goal:** Translate the remaining ~7,100 words of `messages/bn.json` into Bengali (in the Stage-3a calibration voice), locale-key `faq.json`, return API error codes so form errors are translatable, and — in the FINAL commit, once `/bn` is fully Bengali — re-enable geo-detection so Bengali-preferring visitors auto-land on `/bn`.

**Architecture:** Sequential translation batches, each editing ONLY `messages/bn.json` values (never keys/structure). Then the machinery: `faq.json` gets `{en, bn}` shape; contact/quote API routes return error CODES the client maps to translated strings; and `src/i18n/routing.ts` drops `localeDetection:false` + `alternateLinks:false` while `src/__tests__/middleware.test.ts` guard tests are re-inverted — all in one final commit.

**Spec:** `docs/superpowers/specs/2026-07-14-bilingual-en-bn-design.md`
**Predecessor:** Stages 1, 2, 3a merged (PR #5, #8, #9). Start from `main`.

## The locked voice (from Stage 3a — every translation task uses this)

- **Formal register** (আপনি/আপনার), professional B2B.
- **Glossary (reuse exactly):** agent→এজেন্ট, studio→স্টুডিও, build(noun)→নির্মাণ, ship→ডেলিভার, project→প্রজেক্ট, estimate→এস্টিমেট, brief→ব্রিফ, review→পর্যালোচনা, engineer→ইঞ্জিনিয়ার, plan→পরিকল্পনা, timeline→টাইমলাইন. web→ওয়েব, mobile→মোবাইল.
- **Keep English:** AI, API, iOS, Android, CraftsAI, framework/tool names; place names standard Bengali (ঢাকা, বাংলাদেশ).
- **Numerals:** Bengali digits (০১২৩৪৫৬৭৮৯) for prose/dates/section-indices; keep LATIN for technical tokens (`10x`, `$50K–200K`, `GMT+6`, versions, unit-glued read-times). Terminal/CLI lines stay English.
- **Preserve interpolation/markup tokens verbatim** (`{year}`, `{name}`, ICU `{x, plural…}`, `<accent>…</accent>` and any t.rich tags). Translate around them, never alter them.
- `Services.web` (already Bengali) is the reference for the other three service pages' shape.

## Global Constraints

- Translation tasks edit **VALUES only in `messages/bn.json`** — never a key, structure, array length/order, or any English (en.json). Machinery tasks are separate and named.
- **`localeDetection` + `alternateLinks` STAY OFF until Task 7**, the final commit. Turning them on while any page is still English would auto-redirect Bengali visitors to a half-English site.
- TypeScript strict, no `any`/`unknown`. Valid JSON (escape `"`, no trailing commas, UTF-8).
- NEVER `git checkout --`/`restore`/`stash`/`reset --hard`. Undo with the Edit tool. `npm run type-check`, not `npx tsc`. Do NOT run `prettier`.
- Do NOT touch `(internal)/`, `analytics.tsx`, `LocaleToggle.tsx`, the layout, or other apps.
- Gates each task: parity test green (`src/__tests__/messages-parity.test.ts`), `npm test` (baseline **31 suites / 146 tests**), COLD `npm run build` (`rm -rf .next`, exit 0, **110/110**, **85 SSG routes**). A broken interpolation fails the build.
- After each translation task, prove the batch's namespaces are Bengali and out-of-scope ones are untouched (the `hasBengali` check pattern from Stage 3a).

## Remaining namespaces (measured 2026-07-16): ~7,100 words

Content: About 291, Careers 199, Process 316, Products 133, Portfolio 87, Resources 260, Faq 36, ErrorPage 35, NotFound 26. Services: ios 445, android 440, support 439, index 60. Legal 1279. Chatbot 605, Quote 516, Contact 94, Meta 441.

---

## Task 1: Translate the content pages

**Namespaces:** About, Careers, Process, Products, Portfolio, Resources, Faq, ErrorPage, NotFound (~1,373 words).

- [ ] **Step 1** — Read the English source for these namespaces (`python3 -c "import json;print(json.dumps({k:json.load(open('messages/en.json'))[k] for k in ['About','Careers','Process','Products','Portfolio','Resources','Faq','ErrorPage','NotFound']},ensure_ascii=False,indent=2))"`). Note any tokens/numbers.
- [ ] **Step 2** — Translate the VALUES in `messages/bn.json` for exactly these namespaces, applying the locked voice. Section indices (`01`/`02`) → Bengali numerals. Keep interpolation tokens verbatim.
- [ ] **Step 3** — Parity green; the 9 namespaces show Bengali, other untranslated namespaces (Legal, Chatbot, Quote, Meta, Services.ios) still English.
- [ ] **Step 4** — Full gate (lint, type-check, `npm test`, COLD build 110/110, 85 SSG).
- [ ] **Step 5** — Commit `messages/bn.json`: `feat(i18n): Bengali — content pages (about, careers, process, products, portfolio, resources, faq, errors)`.

## Task 2: Translate the three remaining service pages

**Namespaces:** Services.ios, Services.android, Services.support, Services.index (~1,384 words).

`Services.web` is ALREADY Bengali — use it as the shape/terminology reference so the four service pages read consistently (same rendering of useCases/techStack/specRows/faqItems headings). techStack/framework names stay English. Same gates + commit pattern (`feat(i18n): Bengali — ios/android/support service pages`).

## Task 3: Translate the legal pages

**Namespaces:** Legal.privacy, Legal.terms, Legal.cookies (~1,279 words — the largest block).

Compliance/legal prose. Translate to clear formal Bengali; keep it faithful to meaning (do not add or drop obligations). Keep `CraftsAI`, `hello@craftsai.org`, dates per the numeral rule. Same gates + commit (`feat(i18n): Bengali — legal pages (privacy, terms, cookies)`).

## Task 4: Translate the chatbot, forms, and metadata

**Namespaces:** Chatbot, Quote, Contact, Meta (~1,656 words).

⚠️ **Chatbot `keywords` arrays MUST be translated to Bengali**, not just the responses. The matcher does `lowerInput.includes(keyword)`, so a Bengali visitor only matches if the keyword list contains Bengali terms they'd actually type (e.g. `pricing` → include `দাম`, `মূল্য`, `খরচ`). Keep each qa entry's `id` unchanged (code-owned). Translate `keywords` + `response`.
**Meta** = SEO `<title>`/`<description>` per page — translate to natural Bengali (Bengali search), keep brand/product names. **Quote/Contact** = form labels, validation, submit-status strings; do NOT touch any form value/id (those are code-owned, not in messages). Same gates + commit (`feat(i18n): Bengali — chatbot, forms, and page metadata`).

**After Task 4, `bn.json` should have ZERO English-placeholder namespaces** — verify: every namespace contains Bengali. Report any that don't.

## Task 5: Locale-key `content/faq/faq.json`

`content/faq/faq.json` is a 6-item list of Q&A CONTENT imported by the faq page (separate from the `Faq` UI namespace). Restructure each item so its translatable text carries `{ en, bn }` (or add a parallel `faq.bn.json` — follow whatever the faq page's import can consume with least churn; read the page first). Translate the Bengali. The faq page resolves by locale. Keep the category/id keys stable. `content/testimonials/testimonials.json` is UNUSED — do NOT translate; note it for deletion. Gates + commit (`feat(i18n): locale-key faq.json content`).

## Task 6: API error codes for contact/quote

`src/app/api/contact/route.ts` and `api/quote/route.ts` return English error PROSE that the client renders. Change them to return stable error CODES; map codes → translated strings on the client via `useTranslations` (add a `FormErrors` namespace to en.json + bn.json). This makes server-returned form errors localizable. Do NOT change validation logic or status codes — only the error payload shape (prose → code) and the client's rendering of it. Add a test that a known validation failure returns the expected code. Gates + commit (`feat(i18n): API routes return error codes, client localizes them`).

## Task 7 (FINAL): Enable geo-detection

**Only after Tasks 1-4 make `/bn` fully Bengali.** In `src/i18n/routing.ts`, DELETE the `localeDetection: false` and `alternateLinks: false` lines (both default to `true`), and update the surrounding comment (they were off "until Stage 3 ships Bengali copy" — that is now). Then re-invert the middleware guard tests in `src/__tests__/middleware.test.ts` — the tests that currently assert a Bengali-preferring visitor is NOT redirected must now assert they ARE redirected to `/bn` (and the cookie-precedence tests stay). Prove it: a `bn-BD` Accept-Language with no cookie → 307 to `/bn`; an explicit `NEXT_LOCALE=en` cookie still stays on `/`. Gates + commit (`feat(i18n): enable Accept-Language geo-detection now that /bn is fully Bengali`).

---

## Stage 3b Definition of Done

- [ ] Every `bn.json` namespace is Bengali (zero English placeholders); en.json untouched
- [ ] Parity green; `npm test` green; COLD build 110/110, 85 SSG routes
- [ ] `faq.json` locale-keyed; chatbot matches Bengali input; form errors localizable
- [ ] `localeDetection`/`alternateLinks` ON; middleware tests re-inverted and green
- [ ] Browser (ask permission): a fresh `bn-BD` visitor auto-lands on `/bn`; `/bn/*` pages render Bengali; `/en` unchanged; toggle + cookie persistence still work
- [ ] Final whole-branch review, then PR
