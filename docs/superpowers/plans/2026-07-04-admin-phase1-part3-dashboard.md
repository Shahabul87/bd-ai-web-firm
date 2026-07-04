# Admin Phase 1 — Part 3: Leads Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use `- [ ]`.

**Goal:** A gated `/admin` dashboard to view, filter, search, triage (status + notes) leads, and export CSV — using server components + server actions, all behind `getAdmin()`.

**Architecture:** Server components read via a `leads.ts` data layer (Prisma) gated by `getAdmin()`; mutations are server actions (also gated); CSV via one route handler. A client `MarketingChrome` hides the marketing FABs on `/admin`.

**Tech Stack:** Next 15 App Router (RSC + server actions), Prisma 6, TypeScript strict, Jest.

## Global Constraints

- Every admin page/action/route re-checks `getAdmin()` (defense in depth over middleware). Non-admin → redirect (pages) / 401 (routes).
- TS strict, no `any`. Escape nothing twice — lead fields were sanitized on ingest; render as text (React escapes).
- Match Drafting-Room design tokens (ink/bone/signal/line/steel/amber). Status colors: NEW=signal, CONTACTED=amber, QUALIFIED=steel, PROPOSAL=amber, WON=signal, LOST=red.
- Mutations write an `AuditLog` entry (`lead.status.change`, `lead.note.add`).
- No secret logging.

## File Structure

```
src/app/lib/leads.ts                       # (extend) listLeads, getLead, updateLeadStatus, addLeadNote, leadsToCsv
src/app/admin/actions.ts                   # server actions: setLeadStatus, addLeadNote (getAdmin-gated)
src/app/admin/AdminNav.tsx                 # top bar (brand + sign out)
src/app/admin/page.tsx                     # (replace) leads list (filters/search/table)
src/app/admin/LeadFilters.tsx              # client filter/search bar (updates searchParams)
src/app/admin/StatusBadge.tsx              # status pill
src/app/admin/leads/[id]/page.tsx          # lead detail + status control + notes
src/app/admin/leads/[id]/LeadControls.tsx  # client: status <select> + note form (call server actions)
src/app/api/admin/leads/export/route.ts    # CSV download (getAdmin-gated)
src/app/components/MarketingChrome.tsx     # client: render FABs only when NOT on /admin
src/app/layout.tsx                         # (modify) use MarketingChrome to wrap WhatsApp/AIChatbot/CookieConsent
```

---

### Task 1: Leads data layer

**Files:** Modify `src/app/lib/leads.ts`; Test `src/app/lib/__tests__/leads-query.test.ts`

**Interfaces produced:**
- `type LeadStatusValue = 'NEW'|'CONTACTED'|'QUALIFIED'|'PROPOSAL'|'WON'|'LOST'`
- `type LeadSourceValue = 'CONTACT'|'QUOTE'|'DEMO'`
- `interface LeadListItem { id; source; name; email; company: string|null; status; createdAt: Date }`
- `listLeads(f?: { status?: LeadStatusValue; source?: LeadSourceValue; q?: string; take?: number; skip?: number }): Promise<LeadListItem[]>`
- `countLeads(f?): Promise<number>`
- `getLead(id: string): Promise<(Lead & { notes: LeadNote[] }) | null>`
- `updateLeadStatus(id, status, actorEmail): Promise<void>` (writes audit)
- `addLeadNote(id, authorEmail, body): Promise<void>` (writes audit)
- `leadsToCsv(rows: LeadListItem[]): string`

- [ ] **Step 1: `leads-query.test.ts` (failing)** — mock `../db` (+ `../audit`), assert `listLeads` builds a `where` from filters (status/source/`q` OR name/email/company contains), orders `createdAt desc`; `leadsToCsv` emits a header + one row per lead with CSV-escaped fields.
```ts
jest.mock('../db', () => ({ prisma: { lead: { findMany: jest.fn(), count: jest.fn() }, leadNote: { create: jest.fn() } } }));
jest.mock('../audit', () => ({ writeAudit: jest.fn() }));
jest.mock('../notify', () => ({ sendAnnouncement: jest.fn() }));
jest.mock('../email', () => ({ SITE_URL: 'https://www.craftsai.org', CONTACT_EMAIL: 'o@c.org' }));
import { prisma } from '../db';
import { listLeads, leadsToCsv } from '../leads';
const lead = prisma.lead as unknown as { findMany: jest.Mock; count: jest.Mock };
describe('listLeads', () => {
  beforeEach(() => jest.clearAllMocks());
  it('filters by status/source and searches q', async () => {
    lead.findMany.mockResolvedValue([]);
    await listLeads({ status: 'NEW', source: 'QUOTE', q: 'ada' });
    const arg = lead.findMany.mock.calls[0][0];
    expect(arg.where.status).toBe('NEW');
    expect(arg.where.source).toBe('QUOTE');
    expect(arg.where.OR).toEqual(expect.arrayContaining([
      { name: { contains: 'ada', mode: 'insensitive' } },
    ]));
    expect(arg.orderBy).toEqual({ createdAt: 'desc' });
  });
});
describe('leadsToCsv', () => {
  it('emits header + escaped rows', () => {
    const csv = leadsToCsv([{ id: '1', source: 'CONTACT', name: 'A, B', email: 'a@b.com', company: null, status: 'NEW', createdAt: new Date('2026-01-01T00:00:00Z') }]);
    const lines = csv.trim().split('\n');
    expect(lines[0]).toBe('id,source,name,email,company,status,createdAt');
    expect(lines[1]).toContain('"A, B"');
  });
});
```
- [ ] **Step 2: run → FAIL.**
- [ ] **Step 3: extend `leads.ts`** (append; keep existing `createLead`):
```ts
import { writeAudit } from './audit';

export type LeadStatusValue = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'WON' | 'LOST';
export type LeadSourceValue = 'CONTACT' | 'QUOTE' | 'DEMO';

export interface LeadListItem {
  id: string; source: LeadSourceValue; name: string; email: string;
  company: string | null; status: LeadStatusValue; createdAt: Date;
}

interface LeadFilter { status?: LeadStatusValue; source?: LeadSourceValue; q?: string; take?: number; skip?: number }

function whereFrom(f: LeadFilter = {}) {
  const where: Record<string, unknown> = {};
  if (f.status) where.status = f.status;
  if (f.source) where.source = f.source;
  if (f.q && f.q.trim()) {
    const contains = { contains: f.q.trim(), mode: 'insensitive' as const };
    where.OR = [{ name: contains }, { email: contains }, { company: contains }];
  }
  return where;
}

export async function listLeads(f: LeadFilter = {}): Promise<LeadListItem[]> {
  return prisma.lead.findMany({
    where: whereFrom(f),
    orderBy: { createdAt: 'desc' },
    take: f.take ?? 200,
    skip: f.skip ?? 0,
    select: { id: true, source: true, name: true, email: true, company: true, status: true, createdAt: true },
  });
}

export async function countLeads(f: LeadFilter = {}): Promise<number> {
  return prisma.lead.count({ where: whereFrom(f) });
}

export async function getLead(id: string) {
  return prisma.lead.findUnique({ where: { id }, include: { notes: { orderBy: { createdAt: 'desc' } } } });
}

export async function updateLeadStatus(id: string, status: LeadStatusValue, actorEmail: string): Promise<void> {
  await prisma.lead.update({ where: { id }, data: { status } });
  await writeAudit('lead.status.change', { actorEmail, meta: { id, status } });
}

export async function addLeadNote(id: string, authorEmail: string, body: string): Promise<void> {
  await prisma.leadNote.create({ data: { leadId: id, authorEmail, body } });
  await writeAudit('lead.note.add', { actorEmail: authorEmail, meta: { id } });
}

function csvCell(v: unknown): string {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function leadsToCsv(rows: LeadListItem[]): string {
  const header = 'id,source,name,email,company,status,createdAt';
  const lines = rows.map((r) =>
    [r.id, r.source, r.name, r.email, r.company ?? '', r.status, r.createdAt.toISOString()]
      .map(csvCell).join(','),
  );
  return [header, ...lines].join('\n') + '\n';
}
```
- [ ] **Step 4: run → PASS. Commit** `git commit -m "feat(admin): leads data layer (list/get/status/notes/csv)"`

---

### Task 2: Server actions (gated mutations)

**Files:** Create `src/app/admin/actions.ts`

```ts
'use server';
import { revalidatePath } from 'next/cache';
import { getAdmin } from '@/app/lib/adminSession';
import { updateLeadStatus, addLeadNote, type LeadStatusValue } from '@/app/lib/leads';

const STATUSES: LeadStatusValue[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'];

export async function setLeadStatus(id: string, status: string): Promise<void> {
  const admin = await getAdmin();
  if (!admin) throw new Error('unauthorized');
  if (!STATUSES.includes(status as LeadStatusValue)) throw new Error('bad status');
  await updateLeadStatus(id, status as LeadStatusValue, admin.email);
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath('/admin');
}

export async function addNote(id: string, body: string): Promise<void> {
  const admin = await getAdmin();
  if (!admin) throw new Error('unauthorized');
  const trimmed = body.trim();
  if (trimmed.length === 0 || trimmed.length > 5000) throw new Error('bad note');
  await addLeadNote(id, admin.email, trimmed);
  revalidatePath(`/admin/leads/${id}`);
}
```
- [ ] type-check; commit `git commit -m "feat(admin): gated server actions for status + notes"`

---

### Task 3: Marketing-chrome suppression + admin nav

**Files:** Create `src/app/components/MarketingChrome.tsx`, `src/app/admin/AdminNav.tsx`; Modify `src/app/layout.tsx`

- [ ] **Step 1: `MarketingChrome.tsx`** (client) — render children only when pathname is not under `/admin`.
```tsx
'use client';
import { usePathname } from 'next/navigation';
export default function MarketingChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  return <>{children}</>;
}
```
- [ ] **Step 2: layout.tsx** — wrap the three FABs:
```tsx
<MarketingChrome>
  <WhatsAppButton />
  <AIChatbot />
  {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && <CookieConsent />}
</MarketingChrome>
```
(import MarketingChrome; keep `{children}` outside it.)
- [ ] **Step 3: `AdminNav.tsx`** (server) — brand + links (Leads) + sign-out form (reuse `signOutAction`).
- [ ] type-check + build; commit `git commit -m "feat(admin): suppress marketing FABs on /admin + admin nav"`

---

### Task 4: Leads list page + filters

**Files:** Create `src/app/admin/LeadFilters.tsx`, `src/app/admin/StatusBadge.tsx`; Replace `src/app/admin/page.tsx`

- [ ] **Step 1: `StatusBadge.tsx`** — map status → token classes; render a pill.
- [ ] **Step 2: `LeadFilters.tsx`** (client) — status `<select>`, source `<select>`, search `<input>`; on change push `/admin?status=&source=&q=` via `useRouter`.
- [ ] **Step 3: `page.tsx`** (server, gated): read `searchParams`, `getAdmin()` (redirect if null), `listLeads(filters)` + `countLeads`, render `<AdminNav/>`, `<LeadFilters/>`, a table (date, source, name, email, `<StatusBadge/>`, row → `/admin/leads/[id]`), a "Download CSV" link to `/api/admin/leads/export?<same params>`, and an empty state. Full code in execution.
- [ ] build; commit `git commit -m "feat(admin): leads list with filters, search, CSV link"`

---

### Task 5: Lead detail + triage

**Files:** Create `src/app/admin/leads/[id]/page.tsx`, `src/app/admin/leads/[id]/LeadControls.tsx`

- [ ] **Step 1: `page.tsx`** (server, gated): `getLead(id)` (notFound if null); render full submission (name/email/company/message + `payload` pretty-printed), meta (source, createdAt, ip), `<LeadControls/>`, notes timeline.
- [ ] **Step 2: `LeadControls.tsx`** (client): status `<select>` calling `setLeadStatus(id, v)` (server action, `useTransition`); note `<textarea>` + submit calling `addNote(id, body)`. Inline pending/error state.
- [ ] build; commit `git commit -m "feat(admin): lead detail with status control + notes"`

---

### Task 6: CSV export route

**Files:** Create `src/app/api/admin/leads/export/route.ts`
```ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdmin } from '@/app/lib/adminSession';
import { listLeads, leadsToCsv, type LeadStatusValue, type LeadSourceValue } from '@/app/lib/leads';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  const rows = await listLeads({
    status: (sp.get('status') as LeadStatusValue) || undefined,
    source: (sp.get('source') as LeadSourceValue) || undefined,
    q: sp.get('q') || undefined,
    take: 5000,
  });
  return new NextResponse(leadsToCsv(rows), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="craftsai-leads.csv"',
    },
  });
}
```
- [ ] build; commit `git commit -m "feat(admin): CSV export route"`

---

### Task 7: Verification

- [ ] `npm test` (all green) + `npm run build && npm run lint && npm run type-check` (clean).
- [ ] **Visible browser test (founder watching, ask first):** log in (dev fallback) → `/admin` shows the lead(s) captured earlier → filter by source=CONTACT + search → open a lead → change status NEW→CONTACTED (persists) → add a note (appears) → Download CSV (file downloads) → confirm no marketing FABs on /admin. Check `AuditLog` has `lead.status.change` + `lead.note.add`.
- [ ] Note go-live prereqs unchanged (Railway env + notify tenant + Brevo + merge).

## Self-Review
- Coverage: list/filter/search (T1,T4), detail (T5), status+notes (T1,T2,T5), CSV (T1,T6), gating (all), FAB suppression (T3), audit (T1). ✅
- Placeholders: T4/T5 defer full page JSX to execution with interfaces pinned — tighten during execution. Data layer + actions + export + chrome are complete. ⚠️
- Type consistency: `LeadListItem`, `LeadStatusValue`, `listLeads/getLead/updateLeadStatus/addLeadNote/leadsToCsv`, `setLeadStatus/addNote` consistent across tasks. ✅
