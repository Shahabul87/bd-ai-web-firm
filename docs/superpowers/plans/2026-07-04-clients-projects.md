# Clients & Projects (Phase 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert a won lead into a Client and manage Projects (status lifecycle, milestones, update timeline) from the admin dashboard.

**Architecture:** Same pattern as Phase 1 — Prisma models → gated data-layer modules (`lib/clients.ts`, `lib/projects.ts`) → server actions (`getAdmin`-gated) → RSC admin pages, reusing `AdminNav`/`StatusBadge`.

**Tech Stack:** Next 15 App Router (RSC + server actions), Prisma 6 + Postgres, TypeScript strict, Zod, Jest.

## Global Constraints

- TS strict, **no `any`**. Zod-validate every server-action input. Every admin page/action re-checks `getAdmin()`.
- Additive Prisma migrations only (new tables + one optional column). No destructive ops.
- Mutations write `AuditLog` (`client.*`, `project.*`, `lead.convert`). No secrets logged.
- Design tokens: ink/bone/signal/line/steel/amber. Status colors reuse `StatusBadge` pattern.
- Convert-lead must be atomic (`prisma.$transaction`); `Client.sourceLeadId` is `@unique` (double-convert backstop).
- Prisma client must be generated before `next build` (already handled by `postinstall`/`build` scripts).
- Work on branch `feat/clients-projects`; dev DB is docker (`docker compose -f docker-compose.dev.yml up -d`, port 5438).

## File Structure

```
prisma/schema.prisma                          # + Client/Project/Milestone/ProjectUpdate + enums + Lead relation
src/app/lib/clients.ts                         # client data layer
src/app/lib/projects.ts                        # project data layer
src/app/lib/leads.ts                           # + convertLeadToClient()
src/app/lib/__tests__/{clients,projects,convert}.test.ts
src/app/admin/actions.ts                       # + client/project/convert server actions
src/app/admin/AdminNav.tsx                     # + Clients link
src/app/admin/clients/page.tsx                 # clients list
src/app/admin/clients/[id]/page.tsx            # client detail
src/app/admin/clients/ClientControls.tsx       # edit/archive/new-project (client component)
src/app/admin/projects/[id]/page.tsx           # project detail
src/app/admin/projects/ProjectControls.tsx     # status/milestone/update (client component)
src/app/admin/leads/[id]/page.tsx              # + convert control
src/app/admin/leads/[id]/LeadConvert.tsx       # convert form (client component)
```

---

### Task 1: Schema + migration

**Files:** Modify `prisma/schema.prisma`; run migration.

**Interfaces produced:** models `Client`, `Project`, `Milestone`, `ProjectUpdate`; enums `ClientStatus`, `ProjectStatus`, `MilestoneStatus`, `UpdateVisibility`; `Lead.convertedClient` back-relation.

- [ ] **Step 1: Add enums + models to `prisma/schema.prisma`** (append after existing models):
```prisma
enum ClientStatus { ACTIVE ARCHIVED }
enum ProjectStatus { DISCOVERY BUILD REVIEW LAUNCHED MAINTENANCE ON_HOLD }
enum MilestoneStatus { PENDING DONE }
enum UpdateVisibility { INTERNAL CLIENT }

model Client {
  id           String       @id @default(cuid())
  name         String
  email        String
  company      String?
  phone        String?
  notes        String?      @db.Text
  status       ClientStatus @default(ACTIVE)
  sourceLeadId String?      @unique
  sourceLead   Lead?        @relation("LeadClient", fields: [sourceLeadId], references: [id])
  projects     Project[]
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  @@index([status])
  @@index([createdAt])
}

model Project {
  id          String          @id @default(cuid())
  clientId    String
  client      Client          @relation(fields: [clientId], references: [id], onDelete: Cascade)
  title       String
  description String?         @db.Text
  status      ProjectStatus   @default(DISCOVERY)
  startedAt   DateTime?
  targetDate  DateTime?
  milestones  Milestone[]
  updates     ProjectUpdate[]
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  @@index([clientId])
  @@index([status])
}

model Milestone {
  id        String          @id @default(cuid())
  projectId String
  project   Project         @relation(fields: [projectId], references: [id], onDelete: Cascade)
  title     String
  dueDate   DateTime?
  status    MilestoneStatus @default(PENDING)
  order     Int             @default(0)
  createdAt DateTime        @default(now())
  @@index([projectId])
}

model ProjectUpdate {
  id          String           @id @default(cuid())
  projectId   String
  project     Project          @relation(fields: [projectId], references: [id], onDelete: Cascade)
  authorEmail String
  body        String           @db.Text
  visibility  UpdateVisibility @default(INTERNAL)
  createdAt   DateTime         @default(now())
  @@index([projectId])
}
```
Then add to the existing `Lead` model a back-relation line:
```prisma
  convertedClient Client? @relation("LeadClient")
```

- [ ] **Step 2: Ensure dev DB up + migrate**

Run: `docker compose -f docker-compose.dev.yml up -d && npm run db:migrate -- --name clients_projects`
Expected: migration created + applied; "in sync".

- [ ] **Step 3: Generate + typecheck**

Run: `npm run db:generate && npm run type-check`
Expected: exit 0.

- [ ] **Step 4: Commit**
```bash
git add prisma package-lock.json
git commit -m "feat(db): Client/Project/Milestone/ProjectUpdate schema"
```

---

### Task 2: Client data layer (`lib/clients.ts`)

**Files:** Create `src/app/lib/clients.ts`; Test `src/app/lib/__tests__/clients.test.ts`

**Interfaces produced:**
- `type ClientStatusValue = 'ACTIVE'|'ARCHIVED'`
- `interface ClientListItem { id; name; email; company: string|null; status: ClientStatusValue; projectCount: number; createdAt: Date }`
- `listClients(f?: { status?: ClientStatusValue; q?: string }): Promise<ClientListItem[]>`
- `getClient(id: string): Promise<(Client & { projects: Project[] }) | null>`
- `createClient(input: { name; email; company?; phone?; notes?; sourceLeadId? }): Promise<{ id: string }>`
- `updateClient(id: string, patch: { name?; email?; company?; phone?; notes? }, actorEmail: string): Promise<void>`
- `archiveClient(id: string, actorEmail: string): Promise<void>`

- [ ] **Step 1: Write failing test** (`clients.test.ts`, mock `../db` + `../audit`) — assert `listClients` builds `where` from `status` + `q` (OR name/email/company contains), orders `createdAt desc`, maps `_count.projects`→`projectCount`; `archiveClient` sets status ARCHIVED + audits.
```ts
jest.mock('../db', () => ({ prisma: { client: { findMany: jest.fn(), update: jest.fn(), create: jest.fn() } } }));
jest.mock('../audit', () => ({ writeAudit: jest.fn() }));
import { prisma } from '../db';
import { listClients, archiveClient } from '../clients';
import { writeAudit } from '../audit';
const c = prisma.client as unknown as { findMany: jest.Mock; update: jest.Mock };
describe('clients', () => {
  beforeEach(() => jest.clearAllMocks());
  it('filters + searches + maps projectCount', async () => {
    c.findMany.mockResolvedValue([{ id: '1', name: 'A', email: 'a@b.com', company: null, status: 'ACTIVE', createdAt: new Date(), _count: { projects: 3 } }]);
    const r = await listClients({ status: 'ACTIVE', q: 'ada' });
    const arg = c.findMany.mock.calls[0][0];
    expect(arg.where.status).toBe('ACTIVE');
    expect(arg.where.OR).toEqual(expect.arrayContaining([{ name: { contains: 'ada', mode: 'insensitive' } }]));
    expect(r[0].projectCount).toBe(3);
  });
  it('archives + audits', async () => {
    (prisma.client as unknown as { update: jest.Mock }).update.mockResolvedValue({});
    await archiveClient('1', 'admin@x.com');
    expect(prisma.client.update).toHaveBeenCalledWith({ where: { id: '1' }, data: { status: 'ARCHIVED' } });
    expect(writeAudit).toHaveBeenCalledWith('client.archive', expect.objectContaining({ actorEmail: 'admin@x.com' }));
  });
});
```
- [ ] **Step 2: Run → FAIL** (`npm test -- clients.test`).
- [ ] **Step 3: Implement `clients.ts`**
```ts
import { prisma } from './db';
import { writeAudit } from './audit';

export type ClientStatusValue = 'ACTIVE' | 'ARCHIVED';

export interface ClientListItem {
  id: string; name: string; email: string; company: string | null;
  status: ClientStatusValue; projectCount: number; createdAt: Date;
}

export async function listClients(f: { status?: ClientStatusValue; q?: string } = {}): Promise<ClientListItem[]> {
  const where: Record<string, unknown> = {};
  if (f.status) where.status = f.status;
  if (f.q && f.q.trim()) {
    const contains = { contains: f.q.trim(), mode: 'insensitive' as const };
    where.OR = [{ name: contains }, { email: contains }, { company: contains }];
  }
  const rows = await prisma.client.findMany({
    where, orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, company: true, status: true, createdAt: true, _count: { select: { projects: true } } },
  });
  return rows.map((r) => ({ id: r.id, name: r.name, email: r.email, company: r.company, status: r.status, createdAt: r.createdAt, projectCount: r._count.projects }));
}

export async function getClient(id: string) {
  return prisma.client.findUnique({ where: { id }, include: { projects: { orderBy: { createdAt: 'desc' } } } });
}

export async function createClient(input: {
  name: string; email: string; company?: string; phone?: string; notes?: string; sourceLeadId?: string;
}): Promise<{ id: string }> {
  const c = await prisma.client.create({
    data: { name: input.name, email: input.email, company: input.company ?? null, phone: input.phone ?? null, notes: input.notes ?? null, sourceLeadId: input.sourceLeadId ?? null },
    select: { id: true },
  });
  return c;
}

export async function updateClient(id: string, patch: { name?: string; email?: string; company?: string; phone?: string; notes?: string }, actorEmail: string): Promise<void> {
  await prisma.client.update({ where: { id }, data: patch });
  await writeAudit('client.update', { actorEmail, meta: { id } });
}

export async function archiveClient(id: string, actorEmail: string): Promise<void> {
  await prisma.client.update({ where: { id }, data: { status: 'ARCHIVED' } });
  await writeAudit('client.archive', { actorEmail, meta: { id } });
}
```
- [ ] **Step 4: Run → PASS. Commit** `git commit -m "feat(clients): client data layer"`

---

### Task 3: Project data layer (`lib/projects.ts`)

**Files:** Create `src/app/lib/projects.ts`; Test `src/app/lib/__tests__/projects.test.ts`

**Interfaces produced:**
- `type ProjectStatusValue = 'DISCOVERY'|'BUILD'|'REVIEW'|'LAUNCHED'|'MAINTENANCE'|'ON_HOLD'`
- `getProject(id): Promise<(Project & { client: Client; milestones: Milestone[]; updates: ProjectUpdate[] }) | null>`
- `createProject(input: { clientId; title; description? }): Promise<{ id: string }>`
- `setProjectStatus(id, status: ProjectStatusValue, actorEmail): Promise<void>`
- `addMilestone(projectId, title, dueDate?: Date | null): Promise<void>`
- `toggleMilestone(id, actorEmail): Promise<void>`
- `addProjectUpdate(projectId, authorEmail, body, visibility: 'INTERNAL'|'CLIENT'): Promise<void>`

- [ ] **Step 1: failing test** — mock `../db`(+`../audit`); assert `setProjectStatus` updates + audits; `toggleMilestone` reads then flips PENDING↔DONE; `getProject` includes client+milestones(order asc)+updates(desc).
```ts
jest.mock('../db', () => ({ prisma: { project: { update: jest.fn(), findUnique: jest.fn(), create: jest.fn() }, milestone: { findUnique: jest.fn(), update: jest.fn(), create: jest.fn() }, projectUpdate: { create: jest.fn() } } }));
jest.mock('../audit', () => ({ writeAudit: jest.fn() }));
import { prisma } from '../db';
import { setProjectStatus, toggleMilestone } from '../projects';
describe('projects', () => {
  beforeEach(() => jest.clearAllMocks());
  it('sets status + audits', async () => {
    (prisma.project.update as jest.Mock).mockResolvedValue({});
    await setProjectStatus('p1', 'BUILD', 'admin@x.com');
    expect(prisma.project.update).toHaveBeenCalledWith({ where: { id: 'p1' }, data: { status: 'BUILD' } });
  });
  it('toggles milestone PENDING->DONE', async () => {
    (prisma.milestone.findUnique as jest.Mock).mockResolvedValue({ id: 'm1', status: 'PENDING' });
    (prisma.milestone.update as jest.Mock).mockResolvedValue({});
    await toggleMilestone('m1', 'admin@x.com');
    expect(prisma.milestone.update).toHaveBeenCalledWith({ where: { id: 'm1' }, data: { status: 'DONE' } });
  });
});
```
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement `projects.ts`**
```ts
import { prisma } from './db';
import { writeAudit } from './audit';

export type ProjectStatusValue = 'DISCOVERY' | 'BUILD' | 'REVIEW' | 'LAUNCHED' | 'MAINTENANCE' | 'ON_HOLD';

export async function getProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: { client: true, milestones: { orderBy: { order: 'asc' } }, updates: { orderBy: { createdAt: 'desc' } } },
  });
}

export async function createProject(input: { clientId: string; title: string; description?: string }): Promise<{ id: string }> {
  return prisma.project.create({
    data: { clientId: input.clientId, title: input.title, description: input.description ?? null },
    select: { id: true },
  });
}

export async function setProjectStatus(id: string, status: ProjectStatusValue, actorEmail: string): Promise<void> {
  await prisma.project.update({ where: { id }, data: { status } });
  await writeAudit('project.status.change', { actorEmail, meta: { id, status } });
}

export async function addMilestone(projectId: string, title: string, dueDate: Date | null = null): Promise<void> {
  const count = await prisma.milestone.count({ where: { projectId } });
  await prisma.milestone.create({ data: { projectId, title, dueDate, order: count } });
}

export async function toggleMilestone(id: string, actorEmail: string): Promise<void> {
  const m = await prisma.milestone.findUnique({ where: { id }, select: { status: true } });
  if (!m) return;
  const next = m.status === 'DONE' ? 'PENDING' : 'DONE';
  await prisma.milestone.update({ where: { id }, data: { status: next } });
  await writeAudit('project.milestone.toggle', { actorEmail, meta: { id, status: next } });
}

export async function addProjectUpdate(projectId: string, authorEmail: string, body: string, visibility: 'INTERNAL' | 'CLIENT'): Promise<void> {
  await prisma.projectUpdate.create({ data: { projectId, authorEmail, body, visibility } });
  await writeAudit('project.update.add', { actorEmail: authorEmail, meta: { projectId, visibility } });
}
```
> `addMilestone` uses `prisma.milestone.count` — add it to the test's db mock (`milestone: { ..., count: jest.fn() }`) if you assert on `addMilestone`.
- [ ] **Step 4: Run → PASS. Commit** `git commit -m "feat(projects): project data layer"`

---

### Task 4: Convert lead → client + project

**Files:** Modify `src/app/lib/leads.ts`; Test `src/app/lib/__tests__/convert.test.ts`

**Interfaces produced:**
- `convertLeadToClient(leadId: string, actorEmail: string, projectTitle: string): Promise<{ clientId: string; projectId: string } | { error: string }>`

- [ ] **Step 1: failing test** — mock `../db` with `$transaction`, `lead.findUnique`, `client.findUnique`, `client.create`, `project.create`; assert: refuses when a client with `sourceLeadId` exists (returns `{error}`); else creates client (from lead) + project and returns ids.
```ts
jest.mock('../db', () => {
  const tx = { client: { create: jest.fn() }, project: { create: jest.fn() } };
  return { prisma: { lead: { findUnique: jest.fn() }, client: { findUnique: jest.fn() }, $transaction: jest.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)), __tx: tx } };
});
jest.mock('../audit', () => ({ writeAudit: jest.fn() }));
jest.mock('../notify', () => ({ sendAnnouncement: jest.fn() }));
jest.mock('../email', () => ({ SITE_URL: 'https://www.craftsai.org', CONTACT_EMAIL: 'o@c.org' }));
import { prisma } from '../db';
import { convertLeadToClient } from '../leads';
const db = prisma as unknown as { lead: { findUnique: jest.Mock }; client: { findUnique: jest.Mock }; __tx: { client: { create: jest.Mock }; project: { create: jest.Mock } } };
describe('convertLeadToClient', () => {
  beforeEach(() => jest.clearAllMocks());
  it('refuses an already-converted lead', async () => {
    db.lead.findUnique.mockResolvedValue({ id: 'l1', name: 'A', email: 'a@b.com', company: null });
    db.client.findUnique.mockResolvedValue({ id: 'existing' });
    const r = await convertLeadToClient('l1', 'admin@x.com', 'Web build');
    expect(r).toEqual({ error: 'Lead already converted.' });
  });
  it('creates client + project', async () => {
    db.lead.findUnique.mockResolvedValue({ id: 'l1', name: 'Ada', email: 'ada@x.com', company: 'Acme' });
    db.client.findUnique.mockResolvedValue(null);
    db.__tx.client.create.mockResolvedValue({ id: 'c1' });
    db.__tx.project.create.mockResolvedValue({ id: 'p1' });
    const r = await convertLeadToClient('l1', 'admin@x.com', 'Web build');
    expect(r).toEqual({ clientId: 'c1', projectId: 'p1' });
    expect(db.__tx.client.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ name: 'Ada', email: 'ada@x.com', company: 'Acme', sourceLeadId: 'l1' }) }));
  });
});
```
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement `convertLeadToClient` in `leads.ts`** (append):
```ts
export async function convertLeadToClient(
  leadId: string, actorEmail: string, projectTitle: string,
): Promise<{ clientId: string; projectId: string } | { error: string }> {
  const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { id: true, name: true, email: true, company: true } });
  if (!lead) return { error: 'Lead not found.' };
  const existing = await prisma.client.findUnique({ where: { sourceLeadId: leadId }, select: { id: true } });
  if (existing) return { error: 'Lead already converted.' };
  try {
    const result = await prisma.$transaction(async (tx) => {
      const client = await tx.client.create({
        data: { name: lead.name, email: lead.email, company: lead.company ?? null, sourceLeadId: lead.id },
        select: { id: true },
      });
      const project = await tx.project.create({
        data: { clientId: client.id, title: projectTitle || `${lead.name} — project` },
        select: { id: true },
      });
      return { clientId: client.id, projectId: project.id };
    });
    await writeAudit('lead.convert', { actorEmail, meta: { leadId, ...result } });
    return result;
  } catch (err) {
    console.error('convertLeadToClient failed:', err instanceof Error ? err.message : 'unknown');
    return { error: 'Could not convert lead. It may already be converted.' };
  }
}
```
- [ ] **Step 4: Run → PASS. Run full suite `npm test`. Commit** `git commit -m "feat(leads): convert lead to client + first project"`

---

### Task 5: Server actions

**Files:** Modify `src/app/admin/actions.ts`

Add `getAdmin`-gated, Zod-validated actions that call the data layer + `revalidatePath`. Full code:
```ts
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createClient, updateClient, archiveClient } from '@/app/lib/clients';
import { createProject, setProjectStatus, addMilestone, toggleMilestone, addProjectUpdate, type ProjectStatusValue } from '@/app/lib/projects';
import { convertLeadToClient } from '@/app/lib/leads';

const PROJECT_STATUSES: ProjectStatusValue[] = ['DISCOVERY', 'BUILD', 'REVIEW', 'LAUNCHED', 'MAINTENANCE', 'ON_HOLD'];

export async function createClientAction(form: { name: string; email: string; company?: string; phone?: string; notes?: string }) {
  const admin = await getAdmin(); if (!admin) throw new Error('unauthorized');
  const p = z.object({ name: z.string().min(1), email: z.email(), company: z.string().optional(), phone: z.string().optional(), notes: z.string().optional() }).parse(form);
  const { id } = await createClient(p);
  revalidatePath('/admin/clients'); redirect(`/admin/clients/${id}`);
}
export async function updateClientAction(id: string, patch: { name?: string; email?: string; company?: string; phone?: string; notes?: string }) {
  const admin = await getAdmin(); if (!admin) throw new Error('unauthorized');
  await updateClient(id, patch, admin.email); revalidatePath(`/admin/clients/${id}`);
}
export async function archiveClientAction(id: string) {
  const admin = await getAdmin(); if (!admin) throw new Error('unauthorized');
  await archiveClient(id, admin.email); revalidatePath(`/admin/clients/${id}`); revalidatePath('/admin/clients');
}
export async function createProjectAction(clientId: string, title: string, description?: string) {
  const admin = await getAdmin(); if (!admin) throw new Error('unauthorized');
  if (!title.trim()) throw new Error('title required');
  const { id } = await createProject({ clientId, title: title.trim(), description });
  revalidatePath(`/admin/clients/${clientId}`); redirect(`/admin/projects/${id}`);
}
export async function setProjectStatusAction(id: string, status: string) {
  const admin = await getAdmin(); if (!admin) throw new Error('unauthorized');
  if (!PROJECT_STATUSES.includes(status as ProjectStatusValue)) throw new Error('bad status');
  await setProjectStatus(id, status as ProjectStatusValue, admin.email); revalidatePath(`/admin/projects/${id}`);
}
export async function addMilestoneAction(projectId: string, title: string, dueDate?: string) {
  const admin = await getAdmin(); if (!admin) throw new Error('unauthorized');
  if (!title.trim()) throw new Error('title required');
  await addMilestone(projectId, title.trim(), dueDate ? new Date(dueDate) : null); revalidatePath(`/admin/projects/${projectId}`);
}
export async function toggleMilestoneAction(id: string, projectId: string) {
  const admin = await getAdmin(); if (!admin) throw new Error('unauthorized');
  await toggleMilestone(id, admin.email); revalidatePath(`/admin/projects/${projectId}`);
}
export async function addProjectUpdateAction(projectId: string, body: string, visibility: string) {
  const admin = await getAdmin(); if (!admin) throw new Error('unauthorized');
  if (!body.trim()) throw new Error('empty'); const vis = visibility === 'CLIENT' ? 'CLIENT' : 'INTERNAL';
  await addProjectUpdate(projectId, admin.email, body.trim(), vis); revalidatePath(`/admin/projects/${projectId}`);
}
export async function convertLeadAction(leadId: string, projectTitle: string) {
  const admin = await getAdmin(); if (!admin) throw new Error('unauthorized');
  const r = await convertLeadToClient(leadId, admin.email, projectTitle);
  if ('error' in r) throw new Error(r.error);
  revalidatePath('/admin/clients'); redirect(`/admin/projects/${r.projectId}`);
}
```
> The existing `actions.ts` already imports `getAdmin`, `revalidatePath`. Keep the Phase-1 `setLeadStatus`/`addNote` actions.
- [ ] type-check; commit `git commit -m "feat(admin): clients/projects/convert server actions"`

---

### Task 6: Clients list + detail pages + nav

**Files:** Create `src/app/admin/clients/page.tsx`, `src/app/admin/clients/[id]/page.tsx`, `src/app/admin/clients/ClientControls.tsx`; Modify `src/app/admin/AdminNav.tsx`.

- [ ] **Step 1: AdminNav** — add a `Clients` link (`/admin/clients`) next to `Leads`.
- [ ] **Step 2: `clients/page.tsx`** (server, gated) — `getAdmin` (redirect if null), read `searchParams` (status, q), `listClients(filter)`, render `<AdminNav>` + a `LeadFilters`-style bar (reuse the pattern) + table (name→link, company, email, #projects, `<StatusBadge>`-style client badge) + count. Empty state.
- [ ] **Step 3: `clients/[id]/page.tsx`** (server, gated) — `getClient(id)` (notFound if null); show details, `<ClientControls>` (edit form + archive), a projects list (title→`/admin/projects/[id]`, status badge, "New project" form calling `createProjectAction`).
- [ ] **Step 4: `ClientControls.tsx`** (client) — edit fields calling `updateClientAction` (useTransition), archive button calling `archiveClientAction`, new-project title input calling `createProjectAction`. Inline pending/error.
- [ ] build + type-check + lint; commit `git commit -m "feat(admin): clients list + detail pages"`

*(Full JSX authored during execution, following Phase-1 `admin/page.tsx` + `leads/[id]/page.tsx` patterns and design tokens. A client "status badge" can extend `StatusBadge` or a small inline pill: ACTIVE=signal, ARCHIVED=steel.)*

---

### Task 7: Project detail + controls

**Files:** Create `src/app/admin/projects/[id]/page.tsx`, `src/app/admin/projects/ProjectControls.tsx`.

- [ ] **Step 1: `projects/[id]/page.tsx`** (server, gated) — `getProject(id)` (notFound if null); header (client link, title, project `StatusBadge`), `<ProjectControls>` (status select + milestone add + update post), milestones list (checkbox toggling via `toggleMilestoneAction`, due dates), update timeline (reverse-chron, showing INTERNAL/CLIENT tag + author + date).
- [ ] **Step 2: `ProjectControls.tsx`** (client) — status `<select>`→`setProjectStatusAction`; milestone title+date form→`addMilestoneAction`; update `<textarea>` + INTERNAL/CLIENT toggle→`addProjectUpdateAction`. `useTransition`, inline errors. Milestone checkboxes call `toggleMilestoneAction(id, projectId)`.
- [ ] **Step 3: A project `StatusBadge`** — extend the existing `StatusBadge` to accept `ProjectStatusValue` (add color map: DISCOVERY=steel, BUILD=signal, REVIEW=amber, LAUNCHED=signal, MAINTENANCE=steel, ON_HOLD=amber, plus LOST/red not used) OR add a sibling `ProjectStatusBadge`. Prefer a small dedicated `ProjectStatusBadge.tsx` to keep `StatusBadge` (leads) untouched.
- [ ] build + type-check + lint; commit `git commit -m "feat(admin): project detail with status, milestones, updates"`

---

### Task 8: Convert control on lead detail

**Files:** Modify `src/app/admin/leads/[id]/page.tsx`; Create `src/app/admin/leads/[id]/LeadConvert.tsx`.

- [ ] **Step 1: `LeadConvert.tsx`** (client) — a project-title input + "Convert to client" button calling `convertLeadAction(leadId, title)` via `useTransition`; on success it redirects (server action). Show inline error (e.g. "already converted").
- [ ] **Step 2: lead detail page** — fetch whether the lead is already converted (`getLead` include or a `client` lookup by `sourceLeadId`); if converted, show a "Converted → view client/project" link instead of the convert form; else render `<LeadConvert leadId={lead.id} defaultTitle={\`${lead.name} — project\`} />` in the triage sidebar.
- [ ] build; commit `git commit -m "feat(admin): convert lead to client from lead detail"`

---

### Task 9: Verification

- [ ] `npm test` (all green) + `npm run build && npm run lint && npm run type-check` (clean).
- [ ] **Visible browser test (founder watching, ask first):** log in → open a lead → **Convert to client** (title it) → lands on the new project → change status DISCOVERY→BUILD → add a milestone + check it off → post an INTERNAL update → open `/admin/clients` (client listed, 1 project) → open the client (details + project) → confirm `AuditLog` has `lead.convert`, `project.status.change`, `project.milestone.toggle`, `project.update.add`. Delete the test client/project + reset the lead's conversion after (or keep if real).
- [ ] Deploy: migrate prod (`prisma migrate deploy` via public proxy, as in Phase 1) → merge `feat/clients-projects` → main → confirm deploy SUCCESS → quick prod check. No new env vars.

## Self-Review

**Spec coverage:** §4 schema→T1; §5 data-layer (clients/projects)→T2/T3; convert→T4; §6 actions→T5; §7 UI (clients/project/nav/convert)→T6/T7/T8; §8 security (getAdmin every action)→T5–T8; §9 testing→T2–T4,T9; §10 rollout→T1,T9. ✅
**Placeholders:** Tasks 6–8 defer full JSX to execution with interfaces + patterns pinned (consistent with Phase-1 Plan 3); all data/logic/actions code is complete. Tighten JSX during execution — no vague error handling. ⚠️
**Type consistency:** `ClientStatusValue`/`ProjectStatusValue`, `listClients/getClient/createClient/updateClient/archiveClient`, `getProject/createProject/setProjectStatus/addMilestone/toggleMilestone/addProjectUpdate`, `convertLeadToClient→{clientId,projectId}|{error}`, action names — consistent across tasks and matched to the spec. ✅
