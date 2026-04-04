# Production Readiness Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all remaining issues blocking production launch — missing metadata, hardcoded testimonials, outdated structured data, Google Sheets lead logging, demo API endpoint, OG image placeholder, and environment variable config.

**Architecture:** Targeted fixes to existing files. Google Sheets integration via googleapis service account. Structured data rewritten to cover all current routes. Testimonials component reads from JSON. Missing metadata added to 4 pages.

**Tech Stack:** Next.js 15, React 19, googleapis, TypeScript

---

## File Map

### Create
- `src/app/lib/sheets.ts` — Google Sheets API helper (appendRow function)
- `src/app/api/demo/route.ts` — Product demo request API endpoint
- `src/app/opengraph-image.tsx` — Default OG image generated with next/og
- `src/app/components/forms/DemoRequestForm.tsx` — Demo request form component

### Modify
- `package.json` — Add googleapis dependency
- `.env.example` — Add Google Sheets + Analytics env vars
- `src/app/components/sections/Testimonials.tsx` — Read from JSON instead of hardcoded
- `src/app/components/StructuredData.tsx` — Rewrite for all current routes
- `src/app/contact/page.tsx` — Add metadata export
- `src/app/portfolio/page.tsx` — Add metadata export
- `src/app/quote/page.tsx` — Add metadata export
- `src/app/services/page.tsx` — Add metadata export
- `src/app/api/contact/route.ts` — Add Google Sheets logging
- `src/app/api/quote/route.ts` — Add Google Sheets logging
- `src/app/layout.tsx` — Fix GA placeholder to use env variable

---

## Task 1: Add Missing Metadata to 4 Pages

**Files:**
- Modify: `src/app/contact/page.tsx`
- Modify: `src/app/portfolio/page.tsx`
- Modify: `src/app/quote/page.tsx`
- Modify: `src/app/services/page.tsx`

- [ ] **Step 1: Add metadata to contact page**

Read `src/app/contact/page.tsx`. It's a `'use client'` component, so metadata must go in a separate layout file OR the page needs to be split. Check if `src/app/contact/layout.tsx` exists — if so, add metadata there. If not, create it.

Add to `src/app/contact/layout.tsx` (create if needed):

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with CraftsAI. Contact us for web development, Android, iOS, or support inquiries.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

- [ ] **Step 2: Add metadata to portfolio page**

`src/app/portfolio/page.tsx` is `'use client'`. Check for existing layout.tsx in the portfolio directory. If `src/app/portfolio/layout.tsx` exists, add metadata there. If not, create it:

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Explore CraftsAI projects — web apps, Android apps, and iOS apps built with AI-powered development.',
};

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

- [ ] **Step 3: Add metadata to quote page**

Same pattern. Check for `src/app/quote/layout.tsx`. Add metadata:

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get a Quote',
  description: 'Request a free quote for your web, Android, or iOS development project from CraftsAI.',
};

export default function QuoteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

- [ ] **Step 4: Add metadata to services page**

Check for `src/app/services/layout.tsx`. Add metadata:

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Services',
  description: 'CraftsAI offers AI-powered web development, Android development, iOS development, and ongoing support services.',
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add src/app/contact/ src/app/portfolio/ src/app/quote/ src/app/services/
git commit -m "feat: add SEO metadata to contact, portfolio, quote, and services pages"
```

---

## Task 2: Fix Testimonials to Read from JSON

**Files:**
- Modify: `src/app/components/sections/Testimonials.tsx`

- [ ] **Step 1: Read current Testimonials.tsx and testimonials.json**

Read both files to understand current structure.

- [ ] **Step 2: Update Testimonials.tsx to import from JSON**

Replace the hardcoded `testimonials` array with an import from the JSON file. The JSON structure is:

```json
[
  { "name": "Sarah Chen", "role": "CTO", "company": "EduTech Startup", "quote": "...", "avatar": null }
]
```

The component currently uses `{ quote, author, company }` interface. Update the interface and mapping:

```tsx
import testimonialData from '../../../content/testimonials/testimonials.json';

interface Testimonial {
  name: string;
  role: string;
  company: string;
  quote: string;
  avatar: string | null;
}

const testimonials: Testimonial[] = testimonialData;
```

Update the JSX to use `testimonial.name` instead of `testimonial.author`, and show `testimonial.role` below the name.

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/app/components/sections/Testimonials.tsx
git commit -m "feat: load testimonials from JSON content file instead of hardcoded data"
```

---

## Task 3: Rewrite Structured Data for Current Routes

**Files:**
- Modify: `src/app/components/StructuredData.tsx`

- [ ] **Step 1: Read current StructuredData.tsx**

The current version has outdated routes (`/ai-solutions`, `/web-development`) and stale business info (Reno, NV address, US phone number). It needs to be updated for:
- Bangladesh location
- Current route structure
- All new page types

- [ ] **Step 2: Rewrite StructuredData.tsx**

Keep the same component pattern (client component using usePathname), but update:

**Organization schema:**
- Address: Bangladesh (not Reno, NV)
- Email: hello@craftsai.org
- Remove fake phone numbers and aggregate ratings
- Update service catalog: Web Development, Android Development, iOS Development, Support & Maintenance

**Remove LocalBusiness schema** — CraftsAI is a digital agency, not a local business with foot traffic.

**Update breadcrumb page names** to include all current routes:
```typescript
const pageNames: Record<string, string> = {
  'about': 'About Us',
  'services': 'Services',
  'web-development': 'Web Development',
  'android-development': 'Android Development',
  'ios-development': 'iOS Development',
  'support': 'Support & Maintenance',
  'products': 'Products',
  'taxomind': 'TaxoMind',
  'taxomind-schools': 'TaxoMind Schools',
  'fincoach-ai': 'FinCoach AI',
  'mathphysics': 'MathPhysics',
  'portfolio': 'Portfolio',
  'resources': 'Resources',
  'blog': 'Blog',
  'case-studies': 'Case Studies',
  'guides': 'Guides',
  'quote': 'Get a Quote',
  'contact': 'Contact',
  'process': 'Our Process',
  'faq': 'FAQ',
  'careers': 'Careers',
  'privacy': 'Privacy Policy',
  'terms': 'Terms of Service',
  'cookies': 'Cookie Policy',
};
```

**Update page-specific schemas** to cover current routes:
- `/services` → Service schema
- `/services/*` → Individual Service schema
- `/products` → CollectionPage
- `/portfolio` → CollectionPage
- `/resources` → CollectionPage
- `/resources/blog` → Blog schema
- `/contact` → ContactPage
- `/quote` → ContactPage
- `/faq` → FAQPage (keep but update questions from actual FAQ content)
- `/about` → AboutPage
- `/process` → WebPage
- `/careers` → WebPage

**Update FAQ schema** to pull real questions from the FAQ data (import from content/faq/faq.json).

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/app/components/StructuredData.tsx
git commit -m "feat: rewrite structured data with current routes and Bangladesh location"
```

---

## Task 4: Install googleapis and Create Sheets Helper

**Files:**
- Modify: `package.json`
- Create: `src/app/lib/sheets.ts`
- Modify: `.env.example`

- [ ] **Step 1: Install googleapis**

```bash
npm install googleapis
```

- [ ] **Step 2: Update .env.example**

Append to `.env.example`:

```
# Google Sheets API (for lead logging)
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

- [ ] **Step 3: Create sheets.ts helper**

Create `src/app/lib/sheets.ts`:

```typescript
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

function getAuth() {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    return null;
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: SCOPES,
  });
}

export async function appendToSheet(
  sheetName: string,
  values: string[]
): Promise<boolean> {
  const auth = getAuth();
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!auth || !spreadsheetId) {
    console.log('[Sheets] Skipping — Google Sheets not configured');
    return false;
  }

  try {
    const sheets = google.sheets({ version: 'v4', auth });
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [values],
      },
    });
    return true;
  } catch (error) {
    console.error('[Sheets] Failed to append row:', error);
    return false;
  }
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/app/lib/sheets.ts .env.example
git commit -m "feat: add Google Sheets API integration for lead logging"
```

---

## Task 5: Add Sheets Logging to Contact and Quote APIs

**Files:**
- Modify: `src/app/api/contact/route.ts`
- Modify: `src/app/api/quote/route.ts`

- [ ] **Step 1: Read both API route files**

Read `src/app/api/contact/route.ts` and `src/app/api/quote/route.ts` to understand the current flow.

- [ ] **Step 2: Add Sheets logging to contact route**

At the top of `src/app/api/contact/route.ts`, add:
```typescript
import { appendToSheet } from '@/app/lib/sheets';
```

After the successful email send block (after the try/catch for sendEmail), add:

```typescript
// Log to Google Sheets (non-blocking — don't fail the request if this errors)
appendToSheet('Contacts', [
  new Date().toISOString(),
  sanitizedName,
  sanitizedEmail,
  sanitizedMessage,
  clientIP,
  userAgent,
]).catch(() => {});
```

- [ ] **Step 3: Add Sheets logging to quote route**

At the top of `src/app/api/quote/route.ts`, add the same import. After successful email send, add:

```typescript
appendToSheet('Quotes', [
  new Date().toISOString(),
  companyInfo.contact,
  companyInfo.email,
  projectDetails.services.join(', '),
  projectDetails.type,
  projectDetails.complexity,
  projectDetails.timeline,
  projectDetails.budget,
  companyInfo.name,
  companyInfo.industry,
]).catch(() => {});
```

Read the actual variable names from the route files — they may differ. Use the correct variable names.

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/contact/route.ts src/app/api/quote/route.ts
git commit -m "feat: add Google Sheets logging to contact and quote form submissions"
```

---

## Task 6: Create /api/demo Endpoint and Demo Request Form

**Files:**
- Create: `src/app/api/demo/route.ts`
- Create: `src/app/components/forms/DemoRequestForm.tsx`

- [ ] **Step 1: Create demo API route**

Create `src/app/api/demo/route.ts`. Model it after the contact route but simpler:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import validator from 'validator';
import { checkRateLimit, getClientIP } from '@/app/utils/rateLimit';
import { appendToSheet } from '@/app/lib/sheets';
```

POST handler:
- Rate limit: 3 requests per 5 minutes per IP
- Required fields: name, email, product (string — which product they want a demo of)
- Optional: company, message
- Honeypot field: website
- Validate email, sanitize all inputs
- Send email notification to admin (use same nodemailer pattern as contact route)
- Send auto-reply to requester
- Log to Google Sheets (sheet: "DemoRequests")
- Return success JSON

Also export OPTIONS handler for CORS (same as contact route).

- [ ] **Step 2: Create DemoRequestForm component**

Create `src/app/components/forms/DemoRequestForm.tsx` (`'use client'`):

Props: `productName: string` (pre-fills the product field)

Fields: Name, Email, Company (optional), Message (optional)
Hidden field: product (from prop)

Submit to `/api/demo`. Show success/error states. Include honeypot field.

Follow the same validation pattern as the contact form in `/contact/page.tsx`.

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/demo/ src/app/components/forms/
git commit -m "feat: add /api/demo endpoint and DemoRequestForm component"
```

---

## Task 7: Fix Google Analytics and Create Default OG Image

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/opengraph-image.tsx`

- [ ] **Step 1: Read layout.tsx to find the GA script**

Read `src/app/layout.tsx`. Find the inline Google Analytics script with `G-XXXXXXXXXX` placeholder.

- [ ] **Step 2: Fix GA to use environment variable**

Replace the hardcoded `G-XXXXXXXXXX` with `process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID`. If the env var is not set, don't render the script tags at all.

The analytics.tsx component already uses the env var correctly — make the inline script in layout.tsx consistent with it. If the inline script is redundant with analytics.tsx, remove the inline script entirely and let analytics.tsx handle it.

- [ ] **Step 3: Create default OG image**

Create `src/app/opengraph-image.tsx` using Next.js `next/og` ImageResponse:

```tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'CraftsAI - AI-Powered Development Studio';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            background: 'linear-gradient(90deg, #818cf8, #a78bfa)',
            backgroundClip: 'text',
            color: 'transparent',
            marginBottom: '20px',
          }}
        >
          CraftsAI
        </div>
        <div
          style={{
            fontSize: 32,
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '800px',
          }}
        >
          AI-Powered Development Studio
        </div>
        <div
          style={{
            fontSize: 22,
            color: '#64748b',
            marginTop: '20px',
          }}
        >
          Web &bull; Android &bull; iOS &bull; 10x Faster
        </div>
      </div>
    ),
    { ...size }
  );
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx src/app/opengraph-image.tsx
git commit -m "feat: add dynamic OG image and fix Google Analytics env variable"
```

---

## Task 8: Final Verification

- [ ] **Step 1: Clean build**

```bash
rm -rf .next && npm run build
```

Expected: All pages build with zero errors.

- [ ] **Step 2: Lint check**

```bash
npm run lint
```

Expected: No new errors from our changes.

- [ ] **Step 3: Verify checklist**

Check off each item:
- [ ] All pages have metadata (check layout files for client component pages)
- [ ] Testimonials load from JSON
- [ ] StructuredData covers current routes with Bangladesh location
- [ ] googleapis installed, sheets.ts created
- [ ] Contact API logs to Sheets
- [ ] Quote API logs to Sheets
- [ ] /api/demo endpoint exists
- [ ] DemoRequestForm component exists
- [ ] OG image generates at build time
- [ ] GA uses env variable, not hardcoded placeholder
- [ ] .env.example has all new variables

- [ ] **Step 4: Commit any remaining fixes**

```bash
git add -A && git commit -m "fix: final production readiness adjustments"
```

- [ ] **Step 5: Push to GitHub**

```bash
git push origin main
```

---

## Summary

After completing all 8 tasks:

1. **Metadata** — All pages have proper SEO metadata
2. **Testimonials** — Read from JSON content file
3. **Structured Data** — Covers all 28+ routes, Bangladesh location, real service catalog
4. **Google Sheets** — Lead logging for contact, quote, and demo forms
5. **Demo API** — /api/demo endpoint + DemoRequestForm component
6. **OG Image** — Dynamic default OG image via next/og
7. **Google Analytics** — Uses env variable instead of placeholder
8. **Environment** — .env.example updated with all required variables

## Items Requiring User Input (Not in This Plan)

- **Product screenshots/images** — User must provide real images for /public/static/products/
- **Google Analytics ID** — User must set NEXT_PUBLIC_GA_MEASUREMENT_ID in .env.local
- **Google Sheets credentials** — User must create service account and set env vars
- **Real testimonials** — User should update content/testimonials/testimonials.json with actual quotes
