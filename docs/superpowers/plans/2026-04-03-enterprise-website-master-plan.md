# CraftsAI Enterprise Website — Master Plan

> **For agentic workers:** Each phase has its own detailed plan file. Execute phases in order — Phase 1 must complete before Phases 2-4 (which can run in parallel). Phase 5 comes last.

**Goal:** Transform CraftsAI from a ~7-page marketing site into a ~28-page enterprise-grade software company website.

**Spec:** `docs/superpowers/specs/2026-04-03-enterprise-website-redesign-design.md`

---

## Phase Overview

```
Phase 1: Foundation (MUST DO FIRST)
    ↓
Phase 2: Core Pages ──┐
Phase 3: Products ─────┼── (can run in parallel)
Phase 4: Resource Hub ─┘
    ↓
Phase 5: Lead Capture & Remaining (LAST)
```

## Phase 1: Foundation
**Plan:** `2026-04-03-plan-1-foundation.md`
**Scope:** Velite content system, component reorganization, Header/Footer rebuild, UI primitives, shared layout
**Why first:** Everything else depends on the content system and new component structure.

## Phase 2: Core Pages
**Plan:** `2026-04-03-plan-2-core-pages.md`
**Scope:** Homepage rebuild (10 sections), 4 service deep-dive pages, contact page, about rebuild, process page
**Depends on:** Phase 1 (UI primitives, layout, content system)

## Phase 3: Products & Portfolio
**Plan:** `2026-04-03-plan-3-products-portfolio.md`
**Scope:** Products overview + 4 product pages, portfolio rebuild with filtering, case study detail pages
**Depends on:** Phase 1 (content system for MDX products/case studies)

## Phase 4: Resource Hub
**Plan:** `2026-04-03-plan-4-resource-hub.md`
**Scope:** Resource hub landing, blog migration to MDX, case studies listing, guides listing, RSS feed
**Depends on:** Phase 1 (Velite content system)

## Phase 5: Lead Capture & Remaining
**Plan:** `2026-04-03-plan-5-lead-capture-remaining.md`
**Scope:** Google Sheets integration, /api/demo endpoint, FAQ page, careers page, legal pages (privacy/terms/cookies), SEO enhancements (OG images, structured data), quote form enhancements
**Depends on:** Phases 1-4 (all pages exist before wiring up final integrations)
