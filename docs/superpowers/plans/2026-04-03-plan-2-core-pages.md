# Phase 2: Core Pages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the homepage (10 sections), 4 service deep-dive pages, dedicated contact page, about page rebuild, and process page.

**Architecture:** Homepage composed of section components from `/components/sections/`. Service pages use a shared template component. All pages use PageLayout wrapper from Phase 1.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS v4, Framer Motion, TypeScript

**Depends on:** Phase 1 (Foundation) — must be complete before starting.

**Spec:** `docs/superpowers/specs/2026-04-03-enterprise-website-redesign-design.md` — Sections 3.1, 3.2, 3.5

---

## Tasks Overview

### Task 1: Create Homepage Section Components
Create 10 section components in `/components/sections/`:
- `HeroSection.tsx` — Rebuilt hero with trust badges, dual CTA (keep existing 3D visuals)
- `SocialProofBar.tsx` — Product logos as trust signals
- `ServicesGrid.tsx` — 4 service cards (Web, Android, iOS, Support)
- `AIAdvantage.tsx` — Side-by-side comparison (Traditional vs CraftsAI)
- `ProductsShowcase.tsx` — 2x2 product grid
- `FeaturedWork.tsx` — 3 case study cards (pulls from Velite content)
- `ProcessTimeline.tsx` — Simplified 5-step horizontal flow
- `Testimonials.tsx` — 3 testimonial cards
- `ResourcesPreview.tsx` — Latest 3 content items from resource hub
- `CTASection.tsx` — Final conversion CTA

### Task 2: Rebuild Homepage
Replace `HomePage.tsx` content with new 10-section composition using the section components.

### Task 3: Create Service Page Template
Create shared `ServicePageTemplate.tsx` with: Hero, What We Build, Tech Stack, AI Agent Showcase, Code Showcase, Related Case Studies, FAQ, CTA.

### Task 4: Create Service Deep-Dive Pages
- `/services/page.tsx` — Rebuild overview with 4 cards
- `/services/web-development/page.tsx` — Web dev deep-dive
- `/services/android-development/page.tsx` — Android deep-dive
- `/services/ios-development/page.tsx` — iOS deep-dive
- `/services/support/page.tsx` — Support page (different template variant)

### Task 5: Create Contact Page
- `/contact/page.tsx` — Form + info panel + Google Map embed + FAQ links
- Extract `ContactForm.tsx` to `/components/forms/`

### Task 6: Rebuild About Page
- Rebuild `/about/page.tsx` — Story, approach, stats, products showcase, CTA

### Task 7: Create Process Page
- `/process/page.tsx` — Detailed 5-phase timeline with AI integration details

### Task 8: Verify and Commit
Build, lint, smoke test all new pages.
