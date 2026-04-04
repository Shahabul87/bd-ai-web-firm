# Phase 1: Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up the MDX content system (Velite), reorganize components into clean architecture, rebuild Header with dropdowns and Footer with 5-column layout, and create shared UI primitives — all without breaking existing pages.

**Architecture:** Install Velite for type-safe MDX processing with Zod schemas. Reorganize components into /layout, /ui, /sections, /content, /forms, /hero, /effects directories. Rebuild Header and Footer as new components in /layout, then swap imports across all pages.

**Tech Stack:** Velite, MDX, Zod, Next.js 15, React 19, Tailwind CSS v4, Framer Motion, TypeScript

**Spec:** `docs/superpowers/specs/2026-04-03-enterprise-website-redesign-design.md`

---

## File Map

### Create
- `velite.config.ts` — Velite configuration with content schemas
- `content/blog/.gitkeep` — Blog content directory placeholder
- `content/case-studies/.gitkeep` — Case studies directory placeholder
- `content/guides/.gitkeep` — Guides directory placeholder
- `content/products/.gitkeep` — Products directory placeholder
- `content/legal/.gitkeep` — Legal content directory placeholder
- `content/faq/faq.json` — FAQ data file (empty array)
- `content/testimonials/testimonials.json` — Testimonials data (empty array)
- `content/blog/sample-post.mdx` — Sample blog post for testing Velite
- `content/case-studies/sample-case-study.mdx` — Sample case study for testing
- `src/app/lib/content.ts` — Content query helpers (getBlogs, getCaseStudies, etc.)
- `src/app/components/layout/Header.tsx` — Rebuilt header with dropdown menus
- `src/app/components/layout/Footer.tsx` — Rebuilt footer with 5-column layout
- `src/app/components/layout/MobileMenu.tsx` — Extracted mobile menu component
- `src/app/components/layout/PageLayout.tsx` — Shared page layout wrapper (Header + Footer + children)
- `src/app/components/ui/Button.tsx` — Reusable button component
- `src/app/components/ui/Card.tsx` — Reusable card component
- `src/app/components/ui/Accordion.tsx` — Accordion/collapsible component
- `src/app/components/ui/Tag.tsx` — Tag/badge component
- `src/app/components/ui/Dropdown.tsx` — Dropdown menu component
- `src/app/components/ui/FilterBar.tsx` — Filter bar with tag selection
- `src/app/components/ui/index.ts` — Barrel export for UI components

### Modify
- `package.json` — Add velite, rehype-pretty-code, rehype-slug, rehype-autolink-headings; remove marked
- `next.config.ts` — Add Velite webpack integration
- `tsconfig.json` — Add content path alias
- `.gitignore` — Add .velite/ build output directory
- `src/app/page.tsx` — Update to use new PageLayout
- `src/app/components/HomePage.tsx` — Remove Header/Footer (handled by PageLayout)
- `src/app/blog/page.tsx` — Swap Header/Footer to PageLayout
- `src/app/services/page.tsx` — Swap Header/Footer to PageLayout
- `src/app/portfolio/page.tsx` — Swap Header/Footer to PageLayout
- `src/app/about/page.tsx` — Swap Header/Footer to PageLayout
- `src/app/quote/page.tsx` — Swap Header/Footer to PageLayout

### Keep (do not modify yet)
- `src/app/components/Header.tsx` — Keep old Header until all pages migrated (then delete in cleanup)
- `src/app/components/Footer.tsx` — Keep old Footer until all pages migrated (then delete in cleanup)
- All `/hero/` components — untouched
- All `/context/` and `/hooks/` — untouched
- All `/api/` routes — untouched
- `src/app/globals.css` — untouched

---

## Task 1: Install Dependencies and Configure Velite

**Files:**
- Modify: `package.json`
- Create: `velite.config.ts`
- Modify: `next.config.ts`
- Modify: `tsconfig.json`
- Modify: `.gitignore`

- [ ] **Step 1: Install Velite and MDX dependencies**

```bash
cd /Users/mdshahabulalam/myprojects/bdaiwebfirm/bd-ai-web-firm
npm install velite rehype-pretty-code rehype-slug rehype-autolink-headings
npm uninstall marked
```

- [ ] **Step 2: Create Velite config with content schemas**

Create `velite.config.ts` at project root:

```typescript
import { defineConfig, defineCollection, s } from 'velite';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

const blogs = defineCollection({
  name: 'Blog',
  pattern: 'blog/**/*.mdx',
  schema: s.object({
    title: s.string(),
    slug: s.slug('blog'),
    date: s.isodate(),
    author: s.string().default('CraftsAI'),
    tags: s.array(s.string()),
    excerpt: s.string(),
    readTime: s.number(),
    featured: s.boolean().default(false),
    thumbnail: s.string().optional(),
    content: s.mdx(),
  }),
});

const caseStudies = defineCollection({
  name: 'CaseStudy',
  pattern: 'case-studies/**/*.mdx',
  schema: s.object({
    title: s.string(),
    slug: s.slug('case-studies'),
    date: s.isodate(),
    client: s.string(),
    industry: s.string(),
    services: s.array(s.enum(['web', 'android', 'ios'])),
    results: s.array(
      s.object({
        metric: s.string(),
        value: s.string(),
      })
    ),
    thumbnail: s.string(),
    featured: s.boolean().default(false),
    tags: s.array(s.string()),
    excerpt: s.string(),
    content: s.mdx(),
  }),
});

const guides = defineCollection({
  name: 'Guide',
  pattern: 'guides/**/*.mdx',
  schema: s.object({
    title: s.string(),
    slug: s.slug('guides'),
    date: s.isodate(),
    tags: s.array(s.string()),
    excerpt: s.string(),
    readTime: s.number(),
    downloadable: s.boolean().default(false),
    thumbnail: s.string().optional(),
    content: s.mdx(),
  }),
});

const products = defineCollection({
  name: 'Product',
  pattern: 'products/**/*.mdx',
  schema: s.object({
    title: s.string(),
    slug: s.slug('products'),
    tagline: s.string(),
    platforms: s.array(s.enum(['web', 'android', 'ios'])),
    features: s.array(
      s.object({
        icon: s.string(),
        title: s.string(),
        description: s.string(),
      })
    ),
    screenshots: s.array(s.string()),
    techStack: s.array(s.string()),
    useCases: s.array(
      s.object({
        title: s.string(),
        description: s.string(),
      })
    ),
    demoUrl: s.string().optional(),
    storeUrl: s.string().optional(),
    content: s.mdx(),
  }),
});

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: { blogs, caseStudies, guides, products },
  mdx: {
    rehypePlugins: [
      rehypeSlug,
      [rehypePrettyCode, { theme: 'github-dark-dimmed' }],
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
    ],
  },
});
```

- [ ] **Step 3: Integrate Velite with Next.js build**

Read current `next.config.ts`, then modify it. Add the Velite webpack plugin. The key change is wrapping the existing config with Velite's build hook:

Add at the top of `next.config.ts`:

```typescript
import { build } from 'velite';
```

Add to the `nextConfig` object, after the existing `headers` config:

```typescript
webpack: (config) => {
  config.plugins.push(new VeliteWebpackPlugin());
  return config;
},
```

Add this class definition before the `nextConfig` object:

```typescript
class VeliteWebpackPlugin {
  static started = false;
  apply(compiler: { hooks: { beforeCompile: { tapPromise: (name: string, fn: () => Promise<void>) => void } } }) {
    compiler.hooks.beforeCompile.tapPromise('VeliteWebpackPlugin', async () => {
      if (VeliteWebpackPlugin.started) return;
      VeliteWebpackPlugin.started = true;
      const dev = compiler.constructor.name === 'Compiler';
      await build({ watch: dev, clean: !dev });
    });
  }
}
```

- [ ] **Step 4: Add path alias for content output**

In `tsconfig.json`, add to `compilerOptions.paths`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "#content": ["./.velite"]
    }
  }
}
```

- [ ] **Step 5: Add .velite to .gitignore**

Append to `.gitignore`:

```
# Velite build output
.velite/
```

- [ ] **Step 6: Verify installation**

```bash
npm run build
```

Expected: Build succeeds (Velite will run but find no content files yet — that's fine, it outputs empty arrays).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json velite.config.ts next.config.ts tsconfig.json .gitignore
git commit -m "feat: install Velite and configure MDX content system"
```

---

## Task 2: Create Content Directory Structure with Seed Files

**Files:**
- Create: `content/blog/sample-post.mdx`
- Create: `content/case-studies/sample-case-study.mdx`
- Create: `content/guides/.gitkeep`
- Create: `content/products/.gitkeep`
- Create: `content/legal/.gitkeep`
- Create: `content/faq/faq.json`
- Create: `content/testimonials/testimonials.json`

- [ ] **Step 1: Create content directories and placeholders**

```bash
cd /Users/mdshahabulalam/myprojects/bdaiwebfirm/bd-ai-web-firm
mkdir -p content/blog content/case-studies content/guides content/products content/legal content/faq content/testimonials
touch content/guides/.gitkeep content/products/.gitkeep content/legal/.gitkeep
```

- [ ] **Step 2: Create sample blog post**

Create `content/blog/sample-post.mdx`:

```mdx
---
title: "Why AI-Powered Development Is the Future"
date: "2026-04-01"
author: "CraftsAI"
tags: ["ai", "development", "automation"]
excerpt: "Discover how AI agents are transforming software development — delivering enterprise-grade applications 10x faster at 80% lower cost."
readTime: 5
featured: true
---

## The Problem with Traditional Development

Building software the traditional way is slow and expensive. A typical web application takes 3-6 months and costs $50K-200K. Most of that time is spent on repetitive coding tasks that follow well-known patterns.

## Enter AI-Powered Development

At CraftsAI, our AI agents handle the repetitive work while our engineers focus on architecture, quality, and the unique aspects of your project. The result: the same quality at a fraction of the time and cost.

## How It Works

1. **Discovery** — We understand your requirements through consultation
2. **AI Generation** — Our agents generate production-grade code
3. **Human Review** — Engineers review, refine, and ensure quality
4. **Delivery** — You get tested, deployed software in weeks, not months
```

- [ ] **Step 3: Create sample case study**

Create `content/case-studies/sample-case-study.mdx`:

```mdx
---
title: "Building TaxoMind: AI-Powered Learning Platform"
date: "2026-03-15"
client: "Internal Product"
industry: "EdTech"
services: ["web"]
results:
  - metric: "Development Speed"
    value: "3x faster than traditional"
  - metric: "Active Users"
    value: "500+"
  - metric: "Cognitive Levels"
    value: "6 Bloom's Taxonomy stages"
thumbnail: "/static/case-studies/taxomind-thumb.jpg"
featured: true
tags: ["edtech", "ai", "web-platform"]
excerpt: "How we built an AI-powered learning platform that tracks cognitive growth across all 6 stages of Bloom's Taxonomy."
---

## The Challenge

Self-learners need a structured way to progress through cognitive levels — from basic recall to creative synthesis. Existing platforms track completion, not comprehension depth.

## Our Solution

TaxoMind uses AI-powered evaluation to assess which cognitive level a learner has reached and personalizes their path forward.

## Results

The platform launched with 500+ active users and covers all 6 Bloom's Taxonomy stages with real-time progress tracking.
```

- [ ] **Step 4: Create FAQ and testimonials data files**

Create `content/faq/faq.json`:

```json
[]
```

Create `content/testimonials/testimonials.json`:

```json
[]
```

- [ ] **Step 5: Verify Velite processes the seed content**

```bash
npm run build
```

Expected: Build succeeds. Velite processes the 2 MDX files and generates `.velite/` output with typed data.

- [ ] **Step 6: Commit**

```bash
git add content/
git commit -m "feat: add content directory structure with seed MDX files"
```

---

## Task 3: Create Content Query Library

**Files:**
- Create: `src/app/lib/content.ts`

- [ ] **Step 1: Create the content utility library**

Create `src/app/lib/content.ts`:

```typescript
import { blogs, caseStudies, guides, products } from '#content';

// ============================================================
// Blog queries
// ============================================================

export function getAllBlogs() {
  return blogs.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getFeaturedBlogs() {
  return getAllBlogs().filter((post) => post.featured);
}

export function getBlogBySlug(slug: string) {
  return blogs.find((post) => post.slug === slug);
}

export function getBlogsByTag(tag: string) {
  return getAllBlogs().filter((post) => post.tags.includes(tag));
}

// ============================================================
// Case Study queries
// ============================================================

export function getAllCaseStudies() {
  return caseStudies.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getFeaturedCaseStudies() {
  return getAllCaseStudies().filter((study) => study.featured);
}

export function getCaseStudyBySlug(slug: string) {
  return caseStudies.find((study) => study.slug === slug);
}

export function getCaseStudiesByService(service: 'web' | 'android' | 'ios') {
  return getAllCaseStudies().filter((study) =>
    study.services.includes(service)
  );
}

// ============================================================
// Guide queries
// ============================================================

export function getAllGuides() {
  return guides.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getGuideBySlug(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}

// ============================================================
// Product queries
// ============================================================

export function getAllProducts() {
  return products;
}

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

// ============================================================
// Cross-content queries
// ============================================================

export function getLatestContent(limit: number = 6) {
  const allContent = [
    ...blogs.map((b) => ({ ...b, type: 'blog' as const })),
    ...caseStudies.map((c) => ({ ...c, type: 'case-study' as const })),
    ...guides.map((g) => ({ ...g, type: 'guide' as const })),
  ];

  return allContent
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  blogs.forEach((b) => b.tags.forEach((t) => tagSet.add(t)));
  caseStudies.forEach((c) => c.tags.forEach((t) => tagSet.add(t)));
  guides.forEach((g) => g.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}
```

- [ ] **Step 2: Verify build with content library**

```bash
npm run build
```

Expected: Build succeeds. The `#content` import resolves to `.velite/` output.

- [ ] **Step 3: Commit**

```bash
git add src/app/lib/content.ts
git commit -m "feat: add content query library for Velite collections"
```

---

## Task 4: Create UI Primitive Components

**Files:**
- Create: `src/app/components/ui/Button.tsx`
- Create: `src/app/components/ui/Card.tsx`
- Create: `src/app/components/ui/Accordion.tsx`
- Create: `src/app/components/ui/Tag.tsx`
- Create: `src/app/components/ui/Dropdown.tsx`
- Create: `src/app/components/ui/FilterBar.tsx`
- Create: `src/app/components/ui/index.ts`

- [ ] **Step 1: Create the UI components directory**

```bash
mkdir -p /Users/mdshahabulalam/myprojects/bdaiwebfirm/bd-ai-web-firm/src/app/components/ui
```

- [ ] **Step 2: Create Button component**

Create `src/app/components/ui/Button.tsx`:

```tsx
'use client';

import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

export default function Button({
  children,
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  type = 'button',
  disabled = false,
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500';

  const variants = {
    primary:
      'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/25',
    secondary:
      'border border-[var(--border-default)] text-[var(--foreground)] hover:bg-[var(--btn-hover)]',
    ghost:
      'text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--btn-hover)]',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
  };

  const styles = `${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`;

  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={styles}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 3: Create Card component**

Create `src/app/components/ui/Card.tsx`:

```tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  className = '',
  hover = false,
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm ${
        hover
          ? 'transition-all duration-200 hover:shadow-md hover:border-indigo-500/30 cursor-pointer'
          : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardImage({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-t-xl ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}
```

- [ ] **Step 4: Create Accordion component**

Create `src/app/components/ui/Accordion.tsx`:

```tsx
'use client';

import { useState } from 'react';

interface AccordionItem {
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

export default function Accordion({ items, className = '' }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={`divide-y divide-[var(--border-default)] ${className}`}>
      {items.map((item, index) => (
        <div key={index}>
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="flex w-full items-center justify-between py-4 text-left text-[var(--foreground)] hover:text-indigo-500 transition-colors"
          >
            <span className="font-medium pr-4">{item.question}</span>
            <svg
              className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
                openIndex === index ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <div
            className={`overflow-hidden transition-all duration-200 ${
              openIndex === index ? 'max-h-96 pb-4' : 'max-h-0'
            }`}
          >
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {item.answer}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Create Tag component**

Create `src/app/components/ui/Tag.tsx`:

```tsx
interface TagProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning';
  size?: 'sm' | 'md';
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

export default function Tag({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
  onClick,
  active = false,
}: TagProps) {
  const variants = {
    default: active
      ? 'bg-indigo-600 text-white border-indigo-600'
      : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] border-[var(--border-default)]',
    primary: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center rounded-full border font-medium transition-colors ${
        variants[variant]
      } ${sizes[size]} ${onClick ? 'cursor-pointer hover:opacity-80' : ''} ${className}`}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 6: Create Dropdown component**

Create `src/app/components/ui/Dropdown.tsx`:

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface DropdownItem {
  label: string;
  href: string;
  icon?: string;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  footerLink?: { label: string; href: string };
}

export default function Dropdown({
  trigger,
  items,
  footerLink,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
      >
        {trigger}
        <svg
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] backdrop-blur-xl shadow-lg py-2 z-50">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--btn-hover)] transition-colors"
            >
              {item.icon && <span>{item.icon}</span>}
              {item.label}
            </Link>
          ))}
          {footerLink && (
            <>
              <div className="border-t border-[var(--border-default)] my-1" />
              <Link
                href={footerLink.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-2.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {footerLink.label} &rarr;
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Create FilterBar component**

Create `src/app/components/ui/FilterBar.tsx`:

```tsx
'use client';

import Tag from './Tag';

interface FilterBarProps {
  tags: string[];
  activeTag: string | null;
  onTagSelect: (tag: string | null) => void;
  className?: string;
}

export default function FilterBar({
  tags,
  activeTag,
  onTagSelect,
  className = '',
}: FilterBarProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <Tag
        active={activeTag === null}
        onClick={() => onTagSelect(null)}
        size="md"
      >
        All
      </Tag>
      {tags.map((tag) => (
        <Tag
          key={tag}
          active={activeTag === tag}
          onClick={() => onTagSelect(activeTag === tag ? null : tag)}
          size="md"
        >
          {tag}
        </Tag>
      ))}
    </div>
  );
}
```

- [ ] **Step 8: Create barrel export**

Create `src/app/components/ui/index.ts`:

```typescript
export { default as Button } from './Button';
export { default as Card, CardImage, CardBody } from './Card';
export { default as Accordion } from './Accordion';
export { default as Tag } from './Tag';
export { default as Dropdown } from './Dropdown';
export { default as FilterBar } from './FilterBar';
```

- [ ] **Step 9: Verify build**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 10: Commit**

```bash
git add src/app/components/ui/
git commit -m "feat: add reusable UI primitive components (Button, Card, Accordion, Tag, Dropdown, FilterBar)"
```

---

## Task 5: Rebuild Header with Dropdown Navigation

**Files:**
- Create: `src/app/components/layout/Header.tsx`
- Create: `src/app/components/layout/MobileMenu.tsx`

- [ ] **Step 1: Create layout directory**

```bash
mkdir -p /Users/mdshahabulalam/myprojects/bdaiwebfirm/bd-ai-web-firm/src/app/components/layout
```

- [ ] **Step 2: Create new Header with dropdown menus**

Create `src/app/components/layout/Header.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '../ThemeToggle';
import Dropdown from '../ui/Dropdown';
import MobileMenu from './MobileMenu';

const NAV_SERVICES = [
  { label: 'Web Development', href: '/services/web-development', icon: '🌐' },
  {
    label: 'Android Development',
    href: '/services/android-development',
    icon: '🤖',
  },
  { label: 'iOS Development', href: '/services/ios-development', icon: '🍎' },
  {
    label: 'Support & Maintenance',
    href: '/services/support',
    icon: '🛡️',
  },
];

const NAV_PRODUCTS = [
  { label: 'TaxoMind', href: '/products/taxomind', icon: '📚' },
  {
    label: 'TaxoMind Schools',
    href: '/products/taxomind-schools',
    icon: '🏫',
  },
  { label: 'FinCoach AI', href: '/products/fincoach-ai', icon: '💰' },
  { label: 'MathPhysics', href: '/products/mathphysics', icon: '🧮' },
];

const NAV_RESOURCES = [
  { label: 'Blog', href: '/resources/blog', icon: '📝' },
  { label: 'Case Studies', href: '/resources/case-studies', icon: '📊' },
  {
    label: 'Guides & Whitepapers',
    href: '/resources/guides',
    icon: '📚',
  },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const linkClass = (href: string) =>
    `text-sm font-medium transition-colors ${
      isActive(href)
        ? 'text-indigo-500'
        : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
    }`;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[var(--nav-bg)] backdrop-blur-xl border-b border-[var(--nav-border)] shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              CraftsAI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/" className={linkClass('/')}>
              Home
            </Link>

            <Dropdown
              trigger={
                <span
                  className={`text-sm font-medium ${isActive('/services') ? 'text-indigo-500' : ''}`}
                >
                  Services
                </span>
              }
              items={NAV_SERVICES}
              footerLink={{
                label: 'View All Services',
                href: '/services',
              }}
            />

            <Dropdown
              trigger={
                <span
                  className={`text-sm font-medium ${isActive('/products') ? 'text-indigo-500' : ''}`}
                >
                  Products
                </span>
              }
              items={NAV_PRODUCTS}
              footerLink={{
                label: 'View All Products',
                href: '/products',
              }}
            />

            <Link href="/portfolio" className={linkClass('/portfolio')}>
              Portfolio
            </Link>

            <Dropdown
              trigger={
                <span
                  className={`text-sm font-medium ${isActive('/resources') ? 'text-indigo-500' : ''}`}
                >
                  Resources
                </span>
              }
              items={NAV_RESOURCES}
              footerLink={{
                label: 'View All Resources',
                href: '/resources',
              }}
            />

            <Link href="/about" className={linkClass('/about')}>
              About
            </Link>
          </div>

          {/* Right side: Theme toggle + CTA */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/quote"
              className="hidden sm:inline-flex items-center px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/25"
            >
              Get a Quote
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--foreground)]"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        services={NAV_SERVICES}
        products={NAV_PRODUCTS}
        resources={NAV_RESOURCES}
        pathname={pathname}
      />
    </header>
  );
}
```

- [ ] **Step 3: Create MobileMenu component**

Create `src/app/components/layout/MobileMenu.tsx`:

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  services: NavItem[];
  products: NavItem[];
  resources: NavItem[];
  pathname: string;
}

function MobileDropdown({
  label,
  items,
  allLink,
  pathname,
  onClose,
}: {
  label: string;
  items: NavItem[];
  allLink: string;
  pathname: string;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);
  const isActive = pathname.startsWith(allLink);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`flex w-full items-center justify-between py-3 text-base font-medium ${
          isActive ? 'text-indigo-500' : 'text-[var(--foreground)]'
        }`}
      >
        {label}
        <svg
          className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <div className="pl-4 pb-2 space-y-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-2 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--foreground)]"
            >
              {item.icon && <span>{item.icon}</span>}
              {item.label}
            </Link>
          ))}
          <Link
            href={allLink}
            onClick={onClose}
            className="block py-2 text-sm text-indigo-400"
          >
            View All &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}

export default function MobileMenu({
  isOpen,
  onClose,
  services,
  products,
  resources,
  pathname,
}: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="lg:hidden border-t border-[var(--nav-border)] bg-[var(--nav-bg)] backdrop-blur-xl">
      <div className="px-4 py-4 space-y-1">
        <Link
          href="/"
          onClick={onClose}
          className={`block py-3 text-base font-medium ${
            pathname === '/' ? 'text-indigo-500' : 'text-[var(--foreground)]'
          }`}
        >
          Home
        </Link>

        <MobileDropdown
          label="Services"
          items={services}
          allLink="/services"
          pathname={pathname}
          onClose={onClose}
        />

        <MobileDropdown
          label="Products"
          items={products}
          allLink="/products"
          pathname={pathname}
          onClose={onClose}
        />

        <Link
          href="/portfolio"
          onClick={onClose}
          className={`block py-3 text-base font-medium ${
            pathname.startsWith('/portfolio')
              ? 'text-indigo-500'
              : 'text-[var(--foreground)]'
          }`}
        >
          Portfolio
        </Link>

        <MobileDropdown
          label="Resources"
          items={resources}
          allLink="/resources"
          pathname={pathname}
          onClose={onClose}
        />

        <Link
          href="/about"
          onClick={onClose}
          className={`block py-3 text-base font-medium ${
            pathname.startsWith('/about')
              ? 'text-indigo-500'
              : 'text-[var(--foreground)]'
          }`}
        >
          About
        </Link>

        <div className="pt-4">
          <Link
            href="/quote"
            onClick={onClose}
            className="block w-full text-center px-5 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Get a Quote
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: Build succeeds. The new Header is created but not yet used by any page.

- [ ] **Step 5: Commit**

```bash
git add src/app/components/layout/Header.tsx src/app/components/layout/MobileMenu.tsx
git commit -m "feat: rebuild Header with dropdown navigation menus and mobile menu"
```

---

## Task 6: Rebuild Footer with 5-Column Layout

**Files:**
- Create: `src/app/components/layout/Footer.tsx`

- [ ] **Step 1: Create new Footer**

Create `src/app/components/layout/Footer.tsx`:

```tsx
import Link from 'next/link';

const SERVICES = [
  { label: 'Web Development', href: '/services/web-development' },
  { label: 'Android Development', href: '/services/android-development' },
  { label: 'iOS Development', href: '/services/ios-development' },
  { label: 'Support & Maintenance', href: '/services/support' },
];

const PRODUCTS = [
  { label: 'TaxoMind', href: '/products/taxomind' },
  { label: 'TaxoMind Schools', href: '/products/taxomind-schools' },
  { label: 'FinCoach AI', href: '/products/fincoach-ai' },
  { label: 'MathPhysics', href: '/products/mathphysics' },
];

const COMPANY = [
  { label: 'About', href: '/about' },
  { label: 'Process', href: '/process' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact', href: '/contact' },
];

const RESOURCES = [
  { label: 'Blog', href: '/resources/blog' },
  { label: 'Case Studies', href: '/resources/case-studies' },
  { label: 'Guides', href: '/resources/guides' },
  { label: 'FAQ', href: '/faq' },
];

const LEGAL = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Cookies', href: '/cookies' },
  { label: 'Sitemap', href: '/sitemap.xml' },
];

const SOCIAL = [
  {
    label: 'Facebook',
    href: 'https://facebook.com/craftsai',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: 'Twitter',
    href: 'https://twitter.com/craftsai',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/company/craftsai',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/craftsai',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
];

function FooterSection({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-default)] bg-[var(--surface-sunken)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 py-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                CraftsAI
              </span>
            </Link>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
              AI-powered development studio building web &amp; mobile apps 10x
              faster.
            </p>
            <div className="space-y-2 text-sm text-[var(--text-secondary)]">
              <div>hello@craftsai.org</div>
              <div>WhatsApp: +880 XXXX XXXXXX</div>
              <div>Bangladesh</div>
            </div>
          </div>

          <FooterSection title="Services" links={SERVICES} />
          <FooterSection title="Products" links={PRODUCTS} />
          <FooterSection title="Company" links={COMPANY} />
          <FooterSection title="Resources" links={RESOURCES} />
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[var(--border-default)] py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-secondary)]">
            &copy; {new Date().getFullYear()} CraftsAI. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            {LEGAL.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {SOCIAL.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/components/layout/Footer.tsx
git commit -m "feat: rebuild Footer with 5-column layout (services, products, company, resources)"
```

---

## Task 7: Create PageLayout Wrapper and Migrate All Pages

**Files:**
- Create: `src/app/components/layout/PageLayout.tsx`
- Modify: `src/app/components/HomePage.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/blog/page.tsx`
- Modify: `src/app/services/page.tsx`
- Modify: `src/app/portfolio/page.tsx`
- Modify: `src/app/about/page.tsx`
- Modify: `src/app/quote/page.tsx`

- [ ] **Step 1: Create PageLayout wrapper**

Create `src/app/components/layout/PageLayout.tsx`:

```tsx
import Header from './Header';
import Footer from './Footer';

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-16">{children}</main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Update HomePage.tsx — remove old Header/Footer**

In `src/app/components/HomePage.tsx`, make these changes:

Remove imports for old Header and Footer:
```tsx
// REMOVE these imports:
// import Header from './Header';
// import Footer from './Footer';
```

Remove `<Header />` and `<Footer />` from the JSX return. The component should only return the page sections (hero, services, process, contact, etc.) without the layout wrapper. The layout is now handled by PageLayout.

- [ ] **Step 3: Update page.tsx to use PageLayout**

Replace `src/app/page.tsx` with:

```tsx
import HomePage from './components/HomePage';
import PageLayout from './components/layout/PageLayout';

export default function Home() {
  return (
    <PageLayout>
      <HomePage />
    </PageLayout>
  );
}
```

- [ ] **Step 4: Update blog/page.tsx — swap to PageLayout**

In `src/app/blog/page.tsx`:

Replace the old Header/Footer imports:
```tsx
// REMOVE:
// import Header from '../components/Header';
// import Footer from '../components/Footer';

// ADD:
import PageLayout from '../components/layout/PageLayout';
```

Replace the JSX structure. Change:
```tsx
<>
  <Header />
  {/* ... page content ... */}
  <Footer />
</>
```
To:
```tsx
<PageLayout>
  {/* ... page content (everything between old Header and Footer) ... */}
</PageLayout>
```

- [ ] **Step 5: Update services/page.tsx — swap to PageLayout**

Same pattern as blog: replace Header/Footer imports with PageLayout, wrap content in `<PageLayout>`.

In `src/app/services/page.tsx`:
```tsx
// REMOVE old imports:
// import Header from '../components/Header';
// import Footer from '../components/Footer';

// ADD:
import PageLayout from '../components/layout/PageLayout';
```

Wrap page content with `<PageLayout>` instead of `<Header />` / `<Footer />`.

- [ ] **Step 6: Update portfolio/page.tsx — swap to PageLayout**

Same pattern. In `src/app/portfolio/page.tsx`:
```tsx
// REMOVE:
// import Header from '../components/Header';
// import Footer from '../components/Footer';

// ADD:
import PageLayout from '../components/layout/PageLayout';
```

Wrap page content with `<PageLayout>`.

- [ ] **Step 7: Update about/page.tsx — swap to PageLayout**

Same pattern. In `src/app/about/page.tsx`:
```tsx
// REMOVE:
// import Header from '../components/Header';
// import Footer from '../components/Footer';

// ADD:
import PageLayout from '../components/layout/PageLayout';
```

Wrap page content with `<PageLayout>`.

- [ ] **Step 8: Update quote/page.tsx — swap to PageLayout**

Same pattern. In `src/app/quote/page.tsx`:
```tsx
// REMOVE:
// import Header from '../components/Header';
// import Footer from '../components/Footer';

// ADD:
import PageLayout from '../components/layout/PageLayout';
```

Wrap page content with `<PageLayout>`.

- [ ] **Step 9: Verify build and all pages render**

```bash
npm run build
```

Expected: Build succeeds with no errors. All existing pages now use the new Header (with dropdowns) and Footer (5-column layout).

- [ ] **Step 10: Run dev server and manually verify**

```bash
npm run dev
```

Check these URLs in browser:
- http://localhost:3000 — Homepage
- http://localhost:3000/services — Services
- http://localhost:3000/portfolio — Portfolio
- http://localhost:3000/blog — Blog
- http://localhost:3000/about — About
- http://localhost:3000/quote — Quote

Verify:
- New header shows with dropdown menus (Services, Products, Resources)
- New footer shows with 5 columns
- Theme toggle works
- Mobile menu works (resize browser to mobile width)
- All existing content still displays correctly

- [ ] **Step 11: Commit**

```bash
git add src/app/components/layout/PageLayout.tsx src/app/components/HomePage.tsx src/app/page.tsx src/app/blog/page.tsx src/app/services/page.tsx src/app/portfolio/page.tsx src/app/about/page.tsx src/app/quote/page.tsx
git commit -m "feat: add PageLayout wrapper and migrate all pages to new Header/Footer"
```

---

## Task 8: Clean Up Old Components

**Files:**
- Delete: `src/app/components/Header.tsx` (replaced by layout/Header.tsx)
- Delete: `src/app/components/Footer.tsx` (replaced by layout/Footer.tsx)

- [ ] **Step 1: Verify no imports reference old Header/Footer**

```bash
grep -r "from.*['\"].*components/Header['\"]" src/ --include="*.tsx" --include="*.ts"
grep -r "from.*['\"].*components/Footer['\"]" src/ --include="*.tsx" --include="*.ts"
```

Expected: No results (all pages migrated to layout/Header and layout/Footer). If any results appear, migrate those files first.

Note: The new `layout/Header.tsx` imports `../ThemeToggle` — this references `src/app/components/ThemeToggle.tsx` which still exists and should NOT be deleted.

- [ ] **Step 2: Delete old Header and Footer**

```bash
rm src/app/components/Header.tsx src/app/components/Footer.tsx
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: Build succeeds. No broken imports.

- [ ] **Step 4: Commit**

```bash
git add -u src/app/components/Header.tsx src/app/components/Footer.tsx
git commit -m "chore: remove old Header and Footer (replaced by layout/ components)"
```

---

## Task 9: Final Verification

- [ ] **Step 1: Full build check**

```bash
npm run build
```

Expected: Build succeeds with no errors or warnings.

- [ ] **Step 2: Lint check**

```bash
npm run lint
```

Expected: No errors. Fix any that appear.

- [ ] **Step 3: Dev server smoke test**

```bash
npm run dev
```

Open http://localhost:3000 and verify:
- Homepage loads with new header (dropdown menus) and footer (5 columns)
- All navigation links work
- Theme toggle works (light/dark)
- Mobile menu works
- All existing pages (/services, /portfolio, /blog, /about, /quote) render correctly
- No console errors

- [ ] **Step 4: Kill dev server and commit any remaining fixes**

If any fixes were needed:
```bash
git add -A
git commit -m "fix: resolve lint and build issues from foundation phase"
```

---

## Summary

After completing all 9 tasks, you will have:

1. **Velite content system** — Configured with Zod schemas for blogs, case studies, guides, and products
2. **Content directory** — `/content/` at project root with seed MDX files
3. **Content query library** — `src/app/lib/content.ts` with typed helper functions
4. **UI primitives** — Button, Card, Accordion, Tag, Dropdown, FilterBar in `/components/ui/`
5. **New Header** — With dropdown navigation (Services, Products, Resources menus)
6. **New Footer** — 5-column layout (Brand, Services, Products, Company, Resources)
7. **PageLayout** — Shared wrapper used by all pages
8. **All pages migrated** — Every existing page uses new Header/Footer via PageLayout
9. **Old components cleaned up** — Old Header.tsx and Footer.tsx removed

The codebase is now ready for Phase 2 (Core Pages), Phase 3 (Products & Portfolio), and Phase 4 (Resource Hub) to build on this foundation.
