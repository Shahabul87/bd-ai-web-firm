# Phase 3: Products & Portfolio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the products showcase (overview + 4 individual product pages) and rebuild the portfolio page with filtering and case study detail pages.

**Architecture:** Product pages are MDX-driven via Velite. Portfolio pulls from the same case study MDX content as the resource hub (single source of truth). Both use dynamic `[slug]` routes.

**Tech Stack:** Next.js 15, React 19, Velite, MDX, Tailwind CSS v4, Framer Motion, TypeScript

**Depends on:** Phase 1 (Foundation) — Velite content system and UI primitives must exist.

**Spec:** `docs/superpowers/specs/2026-04-03-enterprise-website-redesign-design.md` — Sections 3.3, 3.5 (Portfolio)

---

## Tasks Overview

### Task 1: Write Product MDX Content
Create 4 product MDX files in `/content/products/`:
- `taxomind.mdx` — AI learning platform (Bloom's Taxonomy)
- `taxomind-schools.mdx` — Institutional version
- `fincoach-ai.mdx` — Financial coaching Android app
- `mathphysics.mdx` — Math & Physics learning app (grades 9-12)

### Task 2: Create Product Page Template
Create `ProductPageTemplate.tsx` with: Hero, Features, Screenshots, Use Cases, Tech Highlights, CTA.

### Task 3: Create Product Pages
- `/products/page.tsx` — Overview grid of all 4 products
- `/products/[slug]/page.tsx` — Dynamic product page using MDX content + template

### Task 4: Write Case Study MDX Content
Create 3-4 case study MDX files in `/content/case-studies/`:
- `taxomind-platform.mdx` (expand from seed)
- `fincoach-ai.mdx`
- `mathphysics-app.mdx`

### Task 5: Rebuild Portfolio Page
- `/portfolio/page.tsx` — Rebuild with FilterBar (All/Web/Android/iOS), card grid pulling from Velite case studies

### Task 6: Create Portfolio Detail Page
- `/portfolio/[slug]/page.tsx` — Dynamic case study page rendering MDX content with results metrics

### Task 7: Verify and Commit
Build, lint, verify all product and portfolio pages render with real MDX content.
