# Phase 5: Lead Capture & Remaining Pages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Google Sheets lead logging, create /api/demo endpoint, build FAQ/careers/legal pages, enhance SEO (OG images, structured data updates, sitemap), and enhance the quote form.

**Architecture:** Google Sheets integration via googleapis service account. Legal pages rendered from MDX. FAQ from JSON data. SEO auto-generated from content metadata.

**Tech Stack:** Next.js 15, React 19, googleapis, Velite, MDX, Tailwind CSS v4, TypeScript

**Depends on:** Phases 1-4 (all pages and content system must exist).

**Spec:** `docs/superpowers/specs/2026-04-03-enterprise-website-redesign-design.md` — Sections 3.5, 4.3, 4.5, 4.7, 6

---

## Tasks Overview

### Task 1: Google Sheets Integration
- Install `googleapis`
- Create `src/app/lib/sheets.ts` — Service account auth + appendRow helper
- Add env variables: GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY, GOOGLE_SHEETS_SPREADSHEET_ID
- Update `.env.example`

### Task 2: Enhance API Endpoints
- `/api/contact/route.ts` — Add Google Sheets logging after email
- `/api/quote/route.ts` — Add iOS service option, product inquiry option, Google Sheets logging
- `/api/demo/route.ts` — NEW: Product demo request endpoint (validate, email, Sheets log)

### Task 3: Create Demo Request Form
- `src/app/components/forms/DemoRequestForm.tsx` — Product demo request form (used on product pages)

### Task 4: Build FAQ Page
- Write FAQ content in `/content/faq/faq.json` (15-20 questions across 6 categories)
- `/faq/page.tsx` — Categorized accordion Q&A using Accordion UI component

### Task 5: Build Careers Page
- `/careers/page.tsx` — Hero, Why CraftsAI, Open Positions (or "send CV"), contact email

### Task 6: Build Legal Pages
- Write legal content in `/content/legal/`: privacy.mdx, terms.mdx, cookies.mdx
- `/privacy/page.tsx` — Privacy policy rendered from MDX
- `/terms/page.tsx` — Terms of service from MDX
- `/cookies/page.tsx` — Cookie policy from MDX
- Create shared `LegalPageTemplate.tsx` for consistent layout

### Task 7: Enhance Quote Form
- Update `/quote/page.tsx` — Add iOS checkbox to Step 1, add "Product Inquiry" option

### Task 8: SEO Enhancements
- Update `src/app/sitemap.ts` — Include all new pages + MDX content
- Create `/app/rss.xml/route.ts` (if not done in Phase 4)
- Update `src/app/components/StructuredData.tsx` — Add schemas per page type
- Add dynamic OG images using `next/og` for key page types
- Update metadata in layout.tsx

### Task 9: Write Testimonial Data
- Add 3 initial testimonials to `/content/testimonials/testimonials.json`
- Update Testimonials section component to read from JSON

### Task 10: Final Integration Test
- Full build (`npm run build`)
- Lint check (`npm run lint`)
- Manual smoke test all ~28 pages
- Verify all forms submit correctly (contact, quote, demo)
- Verify Google Sheets receives data
- Verify sitemap includes all pages
- Verify RSS feed is valid
- Lighthouse audit on homepage (target: 95+)
- Check mobile responsiveness across all pages
