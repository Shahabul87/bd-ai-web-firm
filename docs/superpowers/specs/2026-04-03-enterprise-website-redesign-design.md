# CraftsAI Enterprise Website Redesign — Design Specification

**Date:** 2026-04-03
**Status:** Approved
**Approach:** Option B — MDX Content System + External Tools for Operations

---

## 1. Overview

Transform the existing CraftsAI marketing website from a ~7-page showcase into a fully enterprise-grade software company website with ~28 pages/routes, an MDX-powered resource hub, product showcase, and professional lead capture system.

### Business Context

- **Company:** CraftsAI — AI-powered web, Android, and iOS development studio based in Bangladesh
- **Target customers:** SMBs/Startups + Mid-market companies (50-500 employees)
- **Core differentiator:** Real AI agents (WebForge, DroidMaster) + human oversight — AI-assisted, human-led development
- **Services:** Custom web development, Android development, iOS development, ongoing support/maintenance
- **Products:** 4 ready-made solutions (TaxoMind, TaxoMind Schools, FinCoach AI, MathPhysics)
- **Pricing model:** No public pricing — all through consultation/email negotiation
- **Team presentation:** Focus on capabilities and results, not headcount
- **Language:** English only (Bengali i18n deferred to Phase 2)
- **Launch strategy:** Full site launch as one cohesive release

### What Exists Today

| Area | Status |
|------|--------|
| Pages | 7 (Home, Services, Portfolio, Blog, Blog/[slug], About, Quote) |
| API endpoints | 2 (contact, quote) with validation, rate limiting, email |
| Theme | Full light/dark with CSS variables |
| Animations | Extensive (Framer Motion, Three.js, custom CSS) |
| SEO | Basic metadata, sitemap, structured data |
| Content | All hardcoded in components |
| i18n | Not implemented |
| Auth | Not implemented |
| Database | Not implemented |

### What Changes

- **Keep:** 7 existing pages (rebuilt/enhanced to match new standards)
- **Add:** 14 new pages (products, service deep-dives, contact, process, careers, FAQ, legal, resources)
- **Add:** MDX content system for blog, case studies, guides, products, legal, FAQ
- **Add:** Google Sheets lead logging alongside existing email notifications
- **Add:** New API endpoint for product demo requests
- **Rebuild:** Component architecture (organized into layout/ui/sections/content/forms/hero/effects)
- **Rebuild:** Navigation with dropdown menus
- **Rebuild:** Footer with 5-column layout
- **Remove:** CodeShowcase from homepage (moved to service deep-dive pages)
- **Remove:** Inline contact form from homepage (dedicated /contact page instead)
- **Replace:** `marked` library with Velite/MDX pipeline

---

## 2. Site Architecture

### 2.1 Complete Page Map

#### Core Sales Funnel (10 routes)

| Route | Status | Purpose |
|-------|--------|---------|
| `/` | Rebuild | Homepage — hero, social proof, services, AI advantage, products, case studies, process, testimonials, resources, CTA |
| `/services` | Rebuild | Services overview — 4 service cards linking to deep-dives |
| `/services/web-development` | New | Web development deep-dive |
| `/services/android-development` | New | Android development deep-dive |
| `/services/ios-development` | New | iOS development deep-dive |
| `/services/support` | New | Support & maintenance deep-dive |
| `/portfolio` | Rebuild | Project showcase with filtering, pulls from MDX case studies |
| `/portfolio/[slug]` | New | Individual case study page (shared content with resources) |
| `/quote` | Enhance | Multi-step quote form — add iOS option, product inquiry, Google Sheets logging |
| `/contact` | New | Dedicated contact page — form, info, map, FAQ links |

#### Products (5 routes)

| Route | Status | Purpose |
|-------|--------|---------|
| `/products` | New | Products overview grid |
| `/products/taxomind` | New | TaxoMind learning platform |
| `/products/taxomind-schools` | New | TaxoMind for institutions |
| `/products/fincoach-ai` | New | FinCoach AI app |
| `/products/mathphysics` | New | MathPhysics learning app |

#### Resource Hub (6 dynamic routes)

| Route | Status | Purpose |
|-------|--------|---------|
| `/resources` | New | Hub landing — categories + mixed content feed with filtering |
| `/resources/blog` | Rebuild (from /blog) | Blog listing with tags and search |
| `/resources/blog/[slug]` | Rebuild (from /blog/[slug]) | Individual blog post |
| `/resources/case-studies` | New | Case studies listing |
| `/resources/case-studies/[slug]` | New | Individual case study (same content as /portfolio/[slug]) |
| `/resources/guides` | New | Guides and whitepapers listing |
| `/resources/guides/[slug]` | New | Individual guide |

#### Trust & Company (4 routes)

| Route | Status | Purpose |
|-------|--------|---------|
| `/about` | Rebuild | Company story, approach, stats — no team bios |
| `/process` | New | Detailed 5-phase methodology with AI integration |
| `/careers` | New | Culture + open positions (or "send CV") |
| `/faq` | New | Categorized accordion Q&A |

#### Legal (3 routes)

| Route | Status | Purpose |
|-------|--------|---------|
| `/privacy` | New | Privacy policy |
| `/terms` | New | Terms of service |
| `/cookies` | New | Cookie policy |

#### Utility

| Route | Status | Purpose |
|-------|--------|---------|
| `/404` | Keep | Custom not-found page |
| `/sitemap.xml` | Enhance | Auto-generated from all pages + MDX content |
| `/robots.txt` | Keep | Crawler instructions |
| `/rss.xml` | New | RSS feed for blog + case studies |

### 2.2 Navigation Structure

**Header (desktop):**
- Logo (links to /)
- Home
- Services (dropdown: Web Development, Android Development, iOS Development, Support & Maintenance, "View All Services")
- Products (dropdown: TaxoMind, TaxoMind Schools, FinCoach AI, MathPhysics, "View All Products")
- Portfolio
- Resources (dropdown: Blog, Case Studies, Guides & Whitepapers, "View All Resources")
- About
- Theme toggle (light/dark)
- "Get a Quote" CTA button

**Header (mobile):** Collapsible menu with same structure, nested dropdowns for sub-items.

**Footer (5 columns):**
1. Brand — Logo, tagline, contact info (email, WhatsApp, location)
2. Services — Web Dev, Android, iOS, Support
3. Products — TaxoMind, TaxoMind Schools, FinCoach AI, MathPhysics
4. Company — About, Process, Careers, Contact
5. Resources — Blog, Case Studies, Guides, FAQ

Bottom bar: Copyright, legal links (Privacy, Terms, Cookies, Sitemap), social icons (Facebook, Twitter, LinkedIn, Instagram)

---

## 3. Page Designs

### 3.1 Homepage (10 sections)

1. **Hero** — Tagline badge, headline ("We Build Web & Mobile Apps 10x Faster with AI Agents"), subtext, dual CTA (Get a Free Quote + See Our Work), trust badges (10x Faster, 80% Savings, Ongoing Support). Keep existing 3D visuals (RoboticFaces, NeuralParticles).

2. **Social Proof Bar** — "Trusted by businesses across industries" + product logos (TaxoMind, FinCoach AI, etc.). Use own products as proof until external client logos are available.

3. **Services Overview** — "What We Build" heading. 4 cards (Web Apps, Android Apps, iOS Apps, Support) with icons, tech tags, and "Learn more" links to deep-dive pages.

4. **AI Advantage** — "Why AI-Powered Development?" heading. Side-by-side comparison: Traditional Agency (3-6 months, $50K-200K, large team) vs CraftsAI (2-6 weeks, 80% savings, AI + human).

5. **Our Products** — "Products We've Built & Sell" heading. 2x2 grid of product cards with logo, name, description, and links to product pages.

6. **Featured Work** — "Featured Projects" heading. 3 project cards with thumbnails, tags, and "Read case study" links. Pulls from MDX case studies marked as `featured: true`.

7. **Process** — "How We Work" heading. Simplified 5-step horizontal flow: Discover → Plan → Build → Test → Launch. Links to /process for details.

8. **Testimonials** — "What People Say" heading. 3 testimonial cards. Start with product user testimonials, replace with client testimonials as available.

9. **Latest Resources** — "Insights & Resources" heading. 3 content cards (1 blog, 1 case study, 1 guide) pulled from latest MDX content.

10. **Final CTA** — "Ready to Build Something Great?" heading. Dual CTA: Get a Free Quote (links to /quote) + Contact Us (links to /contact).

### 3.2 Service Deep-Dive Pages (shared template)

All 4 service pages (`/services/web-development`, `/services/android-development`, `/services/ios-development`, `/services/support`) follow the same template:

1. **Hero Banner** — Service name, tagline, key stats (speed, cost savings), "Get a Quote" CTA
2. **What We Build** — Project type cards (SaaS, E-commerce, MVPs, Enterprise, etc.)
3. **Tech Stack** — Languages, frameworks, databases, cloud providers with logos/icons
4. **AI Agent Showcase** — How the specific AI agent (WebForge/DroidMaster/iOSForge) works for this service
5. **Code Showcase** — Live code example showing AI-generated code quality (moved from homepage)
6. **Related Case Studies** — 2-3 projects built with this service, auto-pulled from MDX
7. **Service-Specific FAQ** — Common questions, accordion style
8. **CTA** — "Ready to build your [web/android/iOS] app?" + Get a Quote button

**Support page differs:** Instead of "What We Build" and "Code Showcase", shows:
- Support tiers (response times, included hours, SLA levels)
- What's included (bug fixes, security patches, performance monitoring, feature updates)
- Monitoring & reporting capabilities
- Onboarding process for existing apps

### 3.3 Product Pages (shared template)

Product overview (`/products`) shows a grid of all 4 products.

Each product page (`/products/[slug]`) is MDX-driven with:

1. **Product Hero** — Name, tagline, key value prop, screenshot/mockup, "Request Demo" + "Contact Sales" CTAs
2. **Key Features** — 6-8 feature cards with icons and descriptions
3. **Screenshots / Demo** — Image carousel or embedded demo link
4. **Use Cases / Who It's For** — Target audience cards
5. **Tech Highlights** — Built-with stack, shows technical credibility
6. **CTA** — "Interested in this product?" → Request Demo / Contact Sales

### 3.4 Resource Hub

**Hub landing (`/resources`):**
- 3 category cards (Blog, Case Studies, Guides) at top
- Below: mixed feed of all content types, with tag filtering and search
- Pagination

**Content listings (`/resources/blog`, `/resources/case-studies`, `/resources/guides`):**
- Filter bar (tags, categories)
- Card grid (thumbnail, type badge, title, excerpt, read time, date)
- Pagination

**Individual content pages (`/resources/[type]/[slug]`):**
- Full MDX content rendering
- Author, date, read time, tags
- Table of contents (auto-generated from headings)
- Related content sidebar/footer
- Social share buttons
- CTA at bottom

### 3.5 Remaining Pages

**Contact (`/contact`):**
- Contact form (Name, Email, Company, Service Interest dropdown, Message)
- Contact info panel (Email, Phone, WhatsApp, Location, Business Hours)
- Embedded Google Map showing Bangladesh location (adds local credibility)
- FAQ quick links

**About (`/about`):**
- Company story (keep existing origin narrative)
- Our Approach (AI + Human philosophy)
- By The Numbers (stats: projects, products, technologies)
- Our Products brief showcase
- CTA → /quote

**Process (`/process`):**
- Detailed 5-phase timeline: Discovery → Planning → Development → Testing → Launch & Support
- Each phase: what happens, deliverables, client involvement, timeline
- AI integration explanation per phase
- Communication methods (weekly reports, messaging, demos)
- CTA → /quote

**FAQ (`/faq`):**
- Categories: General, Services, Products, Process, Pricing, Support
- Accordion Q&A grouped by category
- FAQ data stored in /content/faq/faq.json
- CTA → /contact

**Careers (`/careers`):**
- Hero: "Build the Future with Us"
- Why CraftsAI: perks, AI-first culture, remote-friendly
- Open Positions (list, or "No openings — send your CV")
- Application: email careers@craftsai.org

**Quote (`/quote`):**
- Keep existing 5-step form structure
- Add iOS to Step 1 service options
- Add "Product Inquiry" option
- Add Google Sheets auto-logging on submission

**Legal (`/privacy`, `/terms`, `/cookies`):**
- MDX content with standard legal layout
- Last-updated date
- Table of contents

---

## 4. Technical Architecture

### 4.1 Content System

**Library:** Velite (type-safe MDX content with Zod schemas)

**Content directory structure:**
```
/content/                          (project root)
├── /blog/*.mdx                    Blog posts
├── /case-studies/*.mdx            Case studies (shared by /portfolio and /resources)
├── /guides/*.mdx                  Technical guides and whitepapers
├── /products/*.mdx                Product page data
├── /legal/*.mdx                   Privacy, terms, cookies
├── /faq/faq.json                  Structured FAQ data
└── /testimonials/testimonials.json Testimonial entries (name, role, company, quote, avatar)
```

**MDX frontmatter schemas (Zod-validated):**

Blog post:
```yaml
title: string (required)
type: "blog"
date: date (required)
author: string (default: "CraftsAI")
tags: string[] (required)
excerpt: string (required)
readTime: number (required)
featured: boolean (default: false)
thumbnail: string (optional)
```

Case study:
```yaml
title: string (required)
type: "case-study"
date: date (required)
client: string (required)
industry: string (required)
services: ("web" | "android" | "ios")[] (required)
results:                              # Key metrics object
  - metric: string (required)         # e.g., "Delivery Speed"
    value: string (required)          # e.g., "3x faster"
  - metric: string
    value: string
thumbnail: string (required)
featured: boolean (default: false)
tags: string[] (required)
excerpt: string (required)
```

Guide:
```yaml
title: string (required)
type: "guide"
date: date (required)
tags: string[] (required)
excerpt: string (required)
readTime: number (required)
downloadable: boolean (default: false)
thumbnail: string (optional)
```

Product:
```yaml
title: string (required)
tagline: string (required)
platforms: ("web" | "android" | "ios")[] (required)  # Array — products can be multi-platform
features:                             # Feature list
  - icon: string (required)           # Emoji or icon name
    title: string (required)          # e.g., "AI-Powered Evaluation"
    description: string (required)    # Short description
screenshots: string[] (required)      # Image paths
techStack: string[] (required)        # e.g., ["Next.js", "TypeScript", "PostgreSQL"]
useCases:                             # Target audience segments
  - title: string (required)          # e.g., "For Self-Learners"
    description: string (required)
demoUrl: string (optional)            # Live demo or website URL
storeUrl: string (optional)           # Play Store / App Store URL
```

### 4.2 Component Architecture

```
src/app/components/
├── /layout/                    Layout components
│   ├── Header.tsx              Rebuilt with dropdown menus
│   ├── Footer.tsx              Rebuilt with 5-column layout
│   └── MobileMenu.tsx          Extracted mobile menu component
├── /ui/                        Reusable UI primitives
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Accordion.tsx
│   ├── FilterBar.tsx
│   ├── Tag.tsx
│   ├── Dropdown.tsx
│   └── ...
├── /sections/                  Page section components
│   ├── HeroSection.tsx         Rebuilt homepage hero
│   ├── SocialProofBar.tsx      NEW
│   ├── ServicesGrid.tsx        NEW (replaces old ServicesSection)
│   ├── AIAdvantage.tsx         NEW
│   ├── ProductsShowcase.tsx    NEW
│   ├── FeaturedWork.tsx        NEW
│   ├── ProcessTimeline.tsx     Rebuilt
│   ├── Testimonials.tsx        Rebuilt
│   ├── ResourcesPreview.tsx    NEW
│   └── CTASection.tsx          NEW
├── /content/                   Content rendering components
│   ├── MDXContent.tsx          MDX renderer with custom components
│   ├── ContentCard.tsx         Blog/case study/guide card
│   └── ContentGrid.tsx         Grid with filtering and pagination
├── /forms/                     Form components
│   ├── ContactForm.tsx         Extracted from ContactSection
│   ├── QuoteForm.tsx           Enhanced from quote page
│   └── DemoRequestForm.tsx     NEW
├── /hero/                      Keep existing 3D components
│   ├── Hero3DScene.tsx
│   ├── AIBrainMesh.tsx
│   ├── FloatingCodeBlocks.tsx
│   ├── NeuralParticles.tsx
│   ├── RoboticFaces.tsx
│   ├── HeroContent.tsx
│   ├── HeroMobileFallback.tsx
│   └── index.ts
└── /effects/                   Visual effects (renamed from scattered locations)
    ├── ParticleBackground.tsx
    ├── PageBackground.tsx
    ├── ClientParticles.tsx
    └── AnimationWrapper.tsx
```

### 4.3 API Endpoints

| Endpoint | Method | Status | Purpose |
|----------|--------|--------|---------|
| `/api/contact` | POST | Enhance | Contact form — add Google Sheets logging |
| `/api/quote` | POST | Enhance | Quote form — add iOS option, product inquiry, Google Sheets |
| `/api/demo` | POST | New | Product demo request — email + Google Sheets |

All endpoints keep existing: validation, rate limiting, sanitization, honeypot fields, HTML email templates.

**New: Google Sheets integration**
- Use `googleapis` package with service account credentials
- Auto-append form submissions as rows to a shared Google Sheet
- Separate sheets/tabs per form type (Contacts, Quotes, Demo Requests)
- Columns match form fields + timestamp + source page

### 4.4 Utility Library

```
src/app/lib/
├── content.ts              Velite content query helpers (getBlogs, getCaseStudies, etc.)
├── sheets.ts               Google Sheets API helper (appendRow)
└── email.ts                Email template helpers (extracted from API routes)
```

### 4.5 SEO Strategy

**Auto-generated from content:**
- **Sitemap** — Dynamic sitemap from all pages + all MDX content, updates every build
- **RSS feed** — `/rss.xml` from blog + case studies
- **OG images** — Dynamic social preview images per page using `next/og`
- **Structured Data** — Schema.org JSON-LD per page type:
  - Homepage: Organization + WebSite
  - Services: Service
  - Products: Product
  - Blog: Article
  - FAQ: FAQPage
  - Case Studies: Article + Review
- **Meta tags** — Auto-generated from MDX frontmatter (title, description, keywords)
- **Canonical URLs** — Per page
- **Breadcrumbs** — Structured data + visual breadcrumbs on inner pages

### 4.6 Performance Targets

| Metric | Target |
|--------|--------|
| Lighthouse Performance | 95+ |
| Lighthouse Accessibility | 95+ |
| Lighthouse Best Practices | 95+ |
| Lighthouse SEO | 100 |
| LCP (Largest Contentful Paint) | < 2.5s |
| FID (First Input Delay) | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| Initial JS bundle | < 100KB |

**Strategy:**
- All pages statically generated at build time (SSG)
- Code-split per route with dynamic imports
- Next.js Image component with WebP/AVIF, lazy loading, blur placeholders
- Keep existing GPU acceleration and motion preference handling
- Monitor with next-bundle-analyzer

### 4.7 Lead Capture Flow

```
Visitor fills form (Contact / Quote / Demo Request)
    ↓
API Route validates, sanitizes, rate-limits
    ↓
├── Email notification to admin (existing)
├── Auto-reply email to client (existing)
├── Google Sheets auto-log (NEW)
└── WhatsApp Business API alert (optional, future)
```

### 4.8 Client & Project Management (External Tools)

| Need | Tool | Cost |
|------|------|------|
| Lead logging | Google Sheets (auto-logged from forms) | Free |
| CRM / client tracking | HubSpot Free or Notion | Free |
| Project management | Notion / Linear / Trello | Free tier |
| Analytics | Google Analytics + Search Console | Free |
| Email | Gmail + existing SMTP setup | Free |
| Quick client comms | WhatsApp (existing on site) | Free |

Upgrade to paid tools when reaching 20+ active clients.

---

## 5. Dependencies

### Add

| Package | Purpose |
|---------|---------|
| `velite` | Type-safe MDX content processing with Zod schemas |
| `googleapis` | Google Sheets API for lead logging |
| `rehype-pretty-code` | Syntax highlighting in MDX content |
| `rehype-slug` | Add IDs to headings for anchor links |
| `rehype-autolink-headings` | Auto-link headings in MDX content |

### Remove

| Package | Reason |
|---------|--------|
| `marked` | Replaced by Velite/MDX pipeline |

### Keep (no changes)

All other existing dependencies remain: next, react, react-dom, framer-motion, three, @react-three/fiber, @react-three/drei, nodemailer, validator, isomorphic-dompurify, tailwindcss.

---

## 6. Environment Variables

### Existing (keep)

```
CONTACT_EMAIL=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
```

### New

```
GOOGLE_SHEETS_CLIENT_EMAIL=       # Google service account email
GOOGLE_SHEETS_PRIVATE_KEY=        # Google service account private key
GOOGLE_SHEETS_SPREADSHEET_ID=     # Target spreadsheet ID
NEXT_PUBLIC_GA_ID=                # Google Analytics measurement ID
```

---

## 7. Out of Scope (Phase 2+)

The following are explicitly excluded from this design:

- Bengali language (i18n) — build infrastructure later
- User authentication / accounts
- Database (PostgreSQL/Prisma) — not needed for marketing site
- Admin panel / CMS dashboard — use external tools
- Payment processing
- AI chatbot with real conversation logic (keep existing placeholder)
- WhatsApp Business API integration (keep existing simple button)
- Industry-specific landing pages (finance, healthcare, retail)
- A/B testing infrastructure
- Email marketing / newsletter backend (keep existing form, wire up later)

---

## 8. Content to Write

The following content needs to be written for launch:

### Must-have (launch blockers)

- Homepage section copy (headline, subtext, CTAs for all 10 sections)
- 4 service page content (web, android, iOS, support)
- 4 product page content (TaxoMind, TaxoMind Schools, FinCoach AI, MathPhysics)
- About page content (rebuild from existing)
- Process page content
- FAQ content (15-20 questions across 6 categories)
- Contact page content
- Privacy policy
- Terms of service
- Cookie policy
- 3-4 case studies for own products (TaxoMind, FinCoach AI, MathPhysics, TaxoMind Schools)
- 3 testimonials (from product users initially)

### Nice-to-have (can launch without)

- Blog posts (3-5 initial posts)
- Guides (1-2 initial guides)
- Careers page content
- Additional case studies
