# Design Spec — Phase 2: Clients & Projects (admin)

- **Date:** 2026-07-04
- **Status:** Approved (design), pending spec review
- **Builds on:** Phase 1 (shipped) — Prisma/Postgres, Auth.js 5 admin auth (`getAdmin`), admin dashboard, notify-svc, audit log.
- **Part of:** the Phase 2+ roadmap (`2026-07-04-phase2plus-roadmap.md`).

## 1. Context & Goal

Phase 1 captures leads and lets the admin triage them. Phase 2 turns a **won lead into a Client** and lets the admin **manage Projects** for that client — status lifecycle, milestones, and an update timeline — all inside the existing `/admin` dashboard. Admin-only; nothing client-facing (that is Phase 3).

## 2. Confirmed Decisions

| Decision | Choice |
|---|---|
| Project tracking | **Status + milestones + update timeline** (full structure) |
| Lead conversion | **Convert lead → Client + first Project** (carry lead name/email/company; the new Client stores `sourceLeadId`, which marks the lead converted) |
| Project stages | **DISCOVERY → BUILD → REVIEW → LAUNCHED → MAINTENANCE**, plus **ON_HOLD** |
| Client contacts | **One contact per client** for v1 (name/email/company/phone/notes) |
| Update visibility | `INTERNAL`/`CLIENT` field ships now (default INTERNAL); surfaced in Phase 3 portal |
| Scope | Admin-only; reuse Phase-1 patterns (data layer + server actions + RSC pages) |

## 3. Architecture

Extends the existing app — no new service.
```
prisma/schema.prisma            # + Client, Project, Milestone, ProjectUpdate; Lead.convertedClientId
src/app/lib/clients.ts          # data layer: create/get/list/update/archive (getAdmin-gated callers)
src/app/lib/projects.ts         # data layer: create/get/list, status, milestones, updates
src/app/admin/actions.ts        # (extend) server actions for clients/projects (getAdmin-gated)
src/app/admin/clients/page.tsx          # clients list
src/app/admin/clients/[id]/page.tsx     # client detail + projects + edit + new-project
src/app/admin/projects/[id]/page.tsx    # project detail: status, milestones, timeline
src/app/admin/clients/ClientControls.tsx    # client (edit/archive) form (client component)
src/app/admin/projects/ProjectControls.tsx  # status select + milestone + update forms
src/app/admin/AdminNav.tsx      # (modify) add "Clients" link
src/app/admin/leads/[id]/LeadConvert.tsx    # "Convert to client" control on lead detail
```
Boundaries: `clients.ts` and `projects.ts` are pure data/business logic over Prisma (no HTTP/UI); pages read through them; mutations go through gated server actions; UI reads/writes only via actions. Each file has one responsibility.

## 4. Data Model (Prisma additions)

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
  sourceLeadId String?      @unique          // the lead this client came from (if any); FK lives here only
  sourceLead   Lead?        @relation("LeadClient", fields: [sourceLeadId], references: [id])
  projects     Project[]
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  @@index([status]) @@index([createdAt])
}

model Project {
  id          String        @id @default(cuid())
  clientId    String
  client      Client        @relation(fields: [clientId], references: [id], onDelete: Cascade)
  title       String
  description String?       @db.Text
  status      ProjectStatus @default(DISCOVERY)
  startedAt   DateTime?
  targetDate  DateTime?
  milestones  Milestone[]
  updates     ProjectUpdate[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  @@index([clientId]) @@index([status])
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

// Lead gains ONLY a back-relation (no scalar FK):
//   convertedClient Client? @relation("LeadClient")
// "Converted" == a Client exists with sourceLeadId = lead.id (enforced unique).
```
All additive/optional → safe migration (per project DB-safety rules). Dates as native types; no floats involved this phase. The lead↔client link is a single 1:1 relation with the FK on `Client` only (no circular FK).

## 5. Data-layer interfaces

`lib/clients.ts`:
- `listClients(f?: { status?: ClientStatus; q?: string }): Promise<ClientListItem[]>`
- `getClient(id): Promise<(Client & { projects: Project[] }) | null>`
- `createClient(input): Promise<{ id: string }>`
- `updateClient(id, patch, actorEmail): Promise<void>` (audited)
- `archiveClient(id, actorEmail): Promise<void>` (audited; sets ARCHIVED)

`lib/projects.ts`:
- `getProject(id): Promise<(Project & { client: Client; milestones: Milestone[]; updates: ProjectUpdate[] }) | null>`
- `createProject(input): Promise<{ id: string }>`
- `setProjectStatus(id, status, actorEmail): Promise<void>` (audited)
- `addMilestone(projectId, title, dueDate?): Promise<void>`
- `toggleMilestone(id, actorEmail): Promise<void>` (PENDING↔DONE)
- `addProjectUpdate(projectId, authorEmail, body, visibility): Promise<void>` (audited)

`lib/leads.ts` (extend):
- `convertLeadToClient(leadId, actorEmail, projectTitle): Promise<{ clientId: string; projectId: string } | { error: string }>` — `prisma.$transaction`: refuse if a Client with `sourceLeadId=leadId` already exists (already converted); else create Client (name/email/company from the lead, `sourceLeadId=leadId`) + a first Project (`projectTitle`); audit `lead.convert`. The unique `Client.sourceLeadId` is the double-convert backstop.

## 6. Server actions (gated)

In `src/app/admin/actions.ts` (all `getAdmin()`-gated, Zod-validated, `revalidatePath`, audited):
`createClientAction`, `updateClientAction`, `archiveClientAction`, `createProjectAction`, `setProjectStatusAction`, `addMilestoneAction`, `toggleMilestoneAction`, `addProjectUpdateAction`, `convertLeadAction`.

## 7. Admin UI

- **`/admin/clients`** — table (name, company, email, #projects, status), search + status filter + count + Download CSV; row → client.
- **`/admin/clients/[id]`** — client details + inline edit + archive; list of their projects with status badges; "New project" form.
- **`/admin/projects/[id]`** — header with `<StatusBadge>` + status `<select>`; **Milestones** panel (add row, check off, shows due dates); **Update timeline** (post box with INTERNAL/CLIENT toggle, reverse-chron list). Back-links to client.
- **`AdminNav`** → `Leads · Clients · (sign out)`. Lead detail gains a **Convert to client** control (title input → creates client+project → redirects to the new project).
- Matches Drafting-Room tokens; `MarketingChrome` already hides FABs on `/admin`.

## 8. Security

Every page/action/route re-checks `getAdmin()` (defense in depth over middleware). Non-admin → redirect (pages) / throw (actions). Zod validation on all inputs; no `any`. Mutations audited (`client.*`, `project.*`, `lead.convert`). No secrets logged. Admin-only — no client auth touched.

## 9. Testing & Verification

- Unit (mocked Prisma): `listClients` filter/search; `convertLeadToClient` creates client+project, sets convertedClientId, refuses double-convert; `toggleMilestone` flips status; status/update audited.
- Real-DB integration: create client → project → milestone → update round-trip.
- **Visible prod verification (founder watching):** convert a real (test) lead → client + project appears → change status DISCOVERY→BUILD → add + check a milestone → post an INTERNAL update → confirm `AuditLog` rows. Clean up test data after.

## 10. Rollout

Feature branch `feat/clients-projects` → schema + migration → data layer + tests → server actions → pages → AdminNav + convert control → build/lint/type-check → local + visible prod verify → set no new env (none needed) → migrate prod → merge → prod verify.

## 11. Risks

- Low. Additive schema + admin UI on proven patterns.
- Convert-lead transaction must be atomic (client+project+lead flag) — use `prisma.$transaction`.
- Guard against converting a lead twice (`convertedClientId` unique + pre-check).
