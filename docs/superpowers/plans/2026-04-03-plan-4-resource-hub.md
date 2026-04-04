# Phase 4: Resource Hub — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the resource hub (landing page, blog migration from hardcoded to MDX, case studies listing, guides listing, individual content pages) and RSS feed.

**Architecture:** All content types (blog, case studies, guides) share the same MDX pipeline via Velite. Content rendering uses shared components (ContentCard, ContentGrid, MDXContent). The hub landing shows a mixed feed across all types.

**Tech Stack:** Next.js 15, React 19, Velite, MDX, Tailwind CSS v4, TypeScript

**Depends on:** Phase 1 (Foundation) — Velite and UI primitives must exist.

**Spec:** `docs/superpowers/specs/2026-04-03-enterprise-website-redesign-design.md` — Section 3.4

---

## Tasks Overview

### Task 1: Create Content Rendering Components
Create in `/components/content/`:
- `MDXContent.tsx` — MDX renderer with custom component overrides (code blocks, headings, images)
- `ContentCard.tsx` — Card for blog/case study/guide (thumbnail, type badge, title, excerpt, read time, tags)
- `ContentGrid.tsx` — Grid layout with filtering, search, and pagination

### Task 2: Write Initial Blog Content
Migrate existing hardcoded blog posts to MDX files in `/content/blog/`. Write 2-3 additional posts.

### Task 3: Write Guide Content
Create 1-2 guide MDX files in `/content/guides/`.

### Task 4: Build Resource Hub Landing
- `/resources/page.tsx` — 3 category cards (Blog, Case Studies, Guides) + mixed content feed with FilterBar

### Task 5: Build Blog Pages
- `/resources/blog/page.tsx` — Blog listing with tag filtering and pagination
- `/resources/blog/[slug]/page.tsx` — Individual blog post with MDX rendering, TOC, related content, CTA

### Task 6: Build Case Studies Pages
- `/resources/case-studies/page.tsx` — Case studies listing with service/industry filters
- `/resources/case-studies/[slug]/page.tsx` — Individual case study (shares content with /portfolio/[slug])

### Task 7: Build Guides Pages
- `/resources/guides/page.tsx` — Guides listing
- `/resources/guides/[slug]/page.tsx` — Individual guide with MDX rendering

### Task 8: Create RSS Feed
- `/app/rss.xml/route.ts` — Auto-generated RSS from blog + case studies via Velite content

### Task 9: Remove Old Blog Route
- Delete `/blog/` route (redirected to `/resources/blog/`)
- Add redirect in `next.config.ts`: `/blog` → `/resources/blog`, `/blog/[slug]` → `/resources/blog/[slug]`

### Task 10: Verify and Commit
Build, lint, verify all resource pages render with MDX content, RSS feed is valid XML.
