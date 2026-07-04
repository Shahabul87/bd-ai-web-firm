# Admin Phase 1 — Part 1: Data Foundation & Lead Capture — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist every contact/quote/demo submission into Postgres via Prisma and send the founder an email alert per lead, replacing the Google Sheets logging.

**Architecture:** Add Prisma + a Postgres schema to the existing Next.js 15 App Router app. A `server-only` notify-svc client sends the alert (graceful no-op when unconfigured). The three form API routes call a shared `createLead()` and then fire the alert; the Google Sheets path and `googleapis` dependency are removed. A DB failure never blocks the visitor's success response.

**Tech Stack:** Next.js 15.5, TypeScript (strict), Prisma 6 + `@prisma/client`, PostgreSQL, Jest (already configured), notify-svc HTTP API.

## Global Constraints

- Node/Next: Next.js `^15.4.2`, React 19 — do not change major versions.
- TypeScript strict; **no `any`/`unknown` without an explicit typed reason**. Zod-validate external input.
- **Never log secret values.** `NOTIFY_API_KEY`, `DATABASE_URL` are server-only; `lib/notify.ts` starts with `import "server-only"`.
- Prisma migrations are **additive only** (new tables/optional columns). No `DROP`/`--accept-data-loss`/`migrate reset` without explicit user permission.
- Public form submission must **fail-open**: if the DB or notify call throws, the visitor still gets `{ success: true }`; the error is logged (message only, no PII dump).
- Canonical site URL: `https://www.craftsai.org`. Admin lead link base: `${SITE_URL}/admin/leads/${id}` (route ships in Part 3; the URL is still correct to embed now).
- Match existing code style: named exports, 2-space indent, existing `src/app/lib/*` conventions.

---

### Task 0: Install the Jest test toolchain + `server-only` test shim

The repo has `jest.config.js` + `jest.setup.js` but the runner and its transformers are **not installed**, and `lib/notify.ts` imports `server-only` (throws under the jsdom test env). Fix both so every later TDD step can run.

**Files:**
- Modify: `package.json` (devDeps)
- Modify: `jest.config.js` (map `server-only` to an empty shim)
- Create: `__mocks__/server-only.js`

- [ ] **Step 1: Install the runner + transformers**

Run:
```bash
npm install -D jest babel-jest jest-environment-jsdom @types/jest
```
Expected: `node_modules/.bin/jest` now exists.

- [ ] **Step 2: Add the `server-only` shim**

Create `__mocks__/server-only.js`:
```js
// server-only throws when loaded outside a server bundle; in Jest it's a no-op.
module.exports = {};
```

In `jest.config.js`, add to `moduleNameMapper` (alongside the `^@/(.*)$` entry):
```js
    '^server-only$': '<rootDir>/__mocks__/server-only.js',
```

- [ ] **Step 3: Smoke-test the runner**

Create `__tests__/smoke.test.ts` at repo root:
```ts
test('jest runs', () => { expect(1 + 1).toBe(2); });
```
Run: `npm test -- smoke`
Expected: 1 test PASS. Then delete the smoke file: `rm __tests__/smoke.test.ts`.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json jest.config.js __mocks__/server-only.js
git commit -m "chore(test): install jest toolchain + server-only shim"
```

---

### Task 1: Add Prisma, schema, and local dev database

**Files:**
- Modify: `package.json` (deps + scripts)
- Create: `prisma/schema.prisma`
- Create: `.env` (gitignored — local dev DB URL) and update `.env.example`
- Create: `docker-compose.dev.yml` (local Postgres for dev/test)
- Modify: `.gitignore` (ensure `.env` ignored — already is; verify)

**Interfaces:**
- Produces: Prisma models `Lead`, `LeadNote`, `AuditLog`, `AuthTicket`, `User`, `Account`, `Session`, `VerificationToken`; enums `Role`, `LeadSource`, `LeadStatus`. `npx prisma generate` produces `@prisma/client` types consumed by later tasks.

- [ ] **Step 1: Install dependencies**

Run:
```bash
npm install @prisma/client server-only
npm install -D prisma
```
Expected: added to `package.json`, no errors.

- [ ] **Step 2: Add npm scripts**

Add to `package.json` `"scripts"`:
```json
"db:generate": "prisma generate",
"db:migrate": "prisma migrate dev",
"db:deploy": "prisma migrate deploy",
"db:studio": "prisma studio"
```

- [ ] **Step 3: Create local dev Postgres**

Create `docker-compose.dev.yml`:
```yaml
services:
  db:
    image: postgres:16
    container_name: craftsai-dev-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: craftsai_dev
    ports:
      - "5438:5432"
    volumes:
      - craftsai_dev_db:/var/lib/postgresql/data
volumes:
  craftsai_dev_db:
```

Create `.env` (local only, gitignored):
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5438/craftsai_dev?schema=public"
```

Append to `.env.example`:
```
# Database (Prisma / Postgres)
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"
```

Run: `docker compose -f docker-compose.dev.yml up -d`
Expected: `craftsai-dev-db` container running; `docker ps` shows it on `0.0.0.0:5438->5432`.

- [ ] **Step 4: Write `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role { ADMIN SUPERADMIN }
enum LeadSource { CONTACT QUOTE DEMO }
enum LeadStatus { NEW CONTACTED QUALIFIED PROPOSAL WON LOST }

model User {
  id           String    @id @default(cuid())
  email        String    @unique
  role         Role      @default(ADMIN)
  totpEnrolled Boolean   @default(false)
  createdAt    DateTime  @default(now())
  accounts     Account[]
  sessions     Session[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}

model AuthTicket {
  id        String    @id @default(cuid())
  email     String
  usedAt    DateTime?
  expiresAt DateTime
  createdAt DateTime  @default(now())
  @@index([expiresAt])
}

model Lead {
  id        String     @id @default(cuid())
  source    LeadSource
  name      String
  email     String
  company   String?
  message   String?    @db.Text
  payload   Json
  status    LeadStatus @default(NEW)
  ip        String?
  userAgent String?    @db.Text
  notes     LeadNote[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  @@index([status])
  @@index([source])
  @@index([createdAt])
}

model LeadNote {
  id          String   @id @default(cuid())
  leadId      String
  lead        Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)
  authorEmail String
  body        String   @db.Text
  createdAt   DateTime @default(now())
}

model AuditLog {
  id         String   @id @default(cuid())
  actorEmail String?
  action     String
  ip         String?
  meta       Json?
  createdAt  DateTime @default(now())
  @@index([createdAt])
}
```

- [ ] **Step 5: Create the initial migration**

Run: `npm run db:migrate -- --name init_admin_leads`
Expected: `prisma/migrations/<ts>_init_admin_leads/migration.sql` created; tables applied to `craftsai_dev`; "Your database is now in sync".

- [ ] **Step 6: Verify client generates + build stays green**

Run: `npm run db:generate && npm run type-check && npm run lint`
Expected: all exit 0.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json prisma docker-compose.dev.yml .env.example
git commit -m "feat(db): add Prisma schema + local Postgres for admin/leads"
```

---

### Task 2: PrismaClient singleton (`lib/db.ts`)

**Files:**
- Create: `src/app/lib/db.ts`
- Test: `src/app/lib/__tests__/db.test.ts`

**Interfaces:**
- Produces: `export const prisma: PrismaClient` — a hot-reload-safe singleton consumed by `leads.ts`, auth (Part 2), and admin APIs (Part 3).

- [ ] **Step 1: Write the failing test**

`src/app/lib/__tests__/db.test.ts`:
```ts
import { prisma } from '../db';

describe('prisma singleton', () => {
  it('exports a PrismaClient with a lead delegate', () => {
    expect(prisma).toBeDefined();
    expect(typeof prisma.lead.create).toBe('function');
  });
  it('returns the same instance across imports', async () => {
    const again = (await import('../db')).prisma;
    expect(again).toBe(prisma);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- db.test`
Expected: FAIL — cannot find module `../db`.

- [ ] **Step 3: Write minimal implementation**

`src/app/lib/db.ts`:
```ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- db.test`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/app/lib/db.ts src/app/lib/__tests__/db.test.ts
git commit -m "feat(db): add PrismaClient singleton"
```

---

### Task 3: notify-svc client (`lib/notify.ts`)

**Files:**
- Create: `src/app/lib/notify.ts`
- Test: `src/app/lib/__tests__/notify.test.ts`

**Interfaces:**
- Consumes: env `NOTIFY_URL`, `NOTIFY_API_KEY`.
- Produces:
  - `export const isNotifyConfigured: boolean`
  - `export async function sendAnnouncement(to: string, subject: string, body: string): Promise<{ ok: boolean }>` — POSTs `/v1/notify` with the seeded `announcement` template; returns `{ ok:false }` (never throws) on failure or when unconfigured (dev logs to console).
  - Auth helpers used in Part 2 are added later; this task ships only the notification path.

- [ ] **Step 1: Write the failing test**

`src/app/lib/__tests__/notify.test.ts`:
```ts
describe('sendAnnouncement', () => {
  const OLD = process.env;
  afterEach(() => { process.env = OLD; jest.restoreAllMocks(); });

  it('no-ops (ok:false) when unconfigured, does not fetch', async () => {
    process.env = { ...OLD, NOTIFY_URL: '', NOTIFY_API_KEY: '' };
    const fetchSpy = jest.spyOn(global, 'fetch');
    const { sendAnnouncement } = await import('../notify');
    const r = await sendAnnouncement('a@b.com', 'S', 'B');
    expect(r.ok).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('POSTs the announcement template with the API key header when configured', async () => {
    process.env = { ...OLD, NOTIFY_URL: 'https://n.test', NOTIFY_API_KEY: 'k_1' };
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message_id: 'm1', status: 'queued' }), { status: 202 }),
    );
    const { sendAnnouncement } = await import('../notify');
    const r = await sendAnnouncement('a@b.com', 'New lead', 'Body');
    expect(r.ok).toBe(true);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://n.test/v1/notify');
    expect((init as RequestInit).headers).toMatchObject({ 'X-API-Key': 'k_1' });
    const sent = JSON.parse((init as RequestInit).body as string);
    expect(sent).toMatchObject({ channel: 'email', to: 'a@b.com', template: 'announcement' });
    expect(sent.data).toMatchObject({ subject: 'New lead', title: 'New lead', body: 'Body' });
  });

  it('returns ok:false (no throw) on non-2xx', async () => {
    process.env = { ...OLD, NOTIFY_URL: 'https://n.test', NOTIFY_API_KEY: 'k_1' };
    jest.spyOn(global, 'fetch').mockResolvedValue(new Response('nope', { status: 500 }));
    const { sendAnnouncement } = await import('../notify');
    const r = await sendAnnouncement('a@b.com', 'S', 'B');
    expect(r.ok).toBe(false);
  });
});
```
> Note: reset the module registry so the env-dependent module re-evaluates. Add `jest.resetModules()` in an `afterEach` if `isNotifyConfigured` is memoized at module scope; in this implementation config is read inside the function, so it is not required.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- notify.test`
Expected: FAIL — cannot find module `../notify`.

- [ ] **Step 3: Write minimal implementation**

`src/app/lib/notify.ts`:
```ts
import 'server-only';

const NOTIFY_URL = () => process.env.NOTIFY_URL ?? '';
const NOTIFY_API_KEY = () => process.env.NOTIFY_API_KEY ?? '';

export const isNotifyConfigured = () => Boolean(NOTIFY_URL() && NOTIFY_API_KEY());

async function post(path: string, body: unknown): Promise<Response | null> {
  try {
    return await fetch(`${NOTIFY_URL()}${path}`, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': NOTIFY_API_KEY() },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error('notify request failed:', err instanceof Error ? err.message : 'unknown');
    return null;
  }
}

/** Sends the seeded `announcement` email template. Never throws. */
export async function sendAnnouncement(
  to: string,
  subject: string,
  body: string,
): Promise<{ ok: boolean }> {
  if (!isNotifyConfigured()) {
    console.warn(`notify not configured — would email "${subject}" to ${to}`);
    return { ok: false };
  }
  const res = await post('/v1/notify', {
    channel: 'email',
    to,
    template: 'announcement',
    data: { subject, title: subject, body },
  });
  return { ok: Boolean(res && res.status >= 200 && res.status < 300) };
}
```
> `isNotifyConfigured` is exported as a function; if the spec/tests reference it as a boolean, call it (`isNotifyConfigured()`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- notify.test`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/app/lib/notify.ts src/app/lib/__tests__/notify.test.ts
git commit -m "feat(notify): server-only notify-svc client with graceful fallback"
```

---

### Task 4: Lead service (`lib/leads.ts`)

**Files:**
- Create: `src/app/lib/leads.ts`
- Test: `src/app/lib/__tests__/leads.test.ts`

**Interfaces:**
- Consumes: `prisma` from `./db`, `sendAnnouncement` from `./notify`, `SITE_URL` from `./email`.
- Produces:
  - `export interface CreateLeadInput { source: 'CONTACT'|'QUOTE'|'DEMO'; name: string; email: string; company?: string; message?: string; payload: Record<string, unknown>; ip?: string; userAgent?: string }`
  - `export async function createLead(input: CreateLeadInput): Promise<{ id: string } | null>` — persists the lead and fires the founder alert; returns `null` (never throws) on failure so callers can fail-open.

- [ ] **Step 1: Write the failing test** (mock prisma + notify)

`src/app/lib/__tests__/leads.test.ts`:
```ts
jest.mock('../db', () => ({ prisma: { lead: { create: jest.fn() } } }));
jest.mock('../notify', () => ({ sendAnnouncement: jest.fn().mockResolvedValue({ ok: true }) }));

import { prisma } from '../db';
import { sendAnnouncement } from '../notify';
import { createLead } from '../leads';

const createMock = prisma.lead.create as jest.Mock;

describe('createLead', () => {
  beforeEach(() => { jest.clearAllMocks(); process.env.CONTACT_EMAIL = 'owner@craftsai.org'; });

  it('persists a lead and alerts the founder', async () => {
    createMock.mockResolvedValue({ id: 'lead_1' });
    const r = await createLead({
      source: 'CONTACT', name: 'Ada', email: 'ada@x.com',
      payload: { message: 'hi' }, ip: '1.2.3.4',
    });
    expect(r).toEqual({ id: 'lead_1' });
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ source: 'CONTACT', name: 'Ada', email: 'ada@x.com' }) }),
    );
    expect(sendAnnouncement).toHaveBeenCalledWith(
      'owner@craftsai.org',
      expect.stringContaining('New CONTACT lead'),
      expect.stringContaining('Ada'),
    );
  });

  it('returns null and does not throw if the DB write fails', async () => {
    createMock.mockRejectedValue(new Error('db down'));
    const r = await createLead({ source: 'DEMO', name: 'B', email: 'b@x.com', payload: {} });
    expect(r).toBeNull();
    expect(sendAnnouncement).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- leads.test`
Expected: FAIL — cannot find module `../leads`.

- [ ] **Step 3: Write minimal implementation**

`src/app/lib/leads.ts`:
```ts
import { prisma } from './db';
import { sendAnnouncement } from './notify';
import { SITE_URL, CONTACT_EMAIL } from './email';

export interface CreateLeadInput {
  source: 'CONTACT' | 'QUOTE' | 'DEMO';
  name: string;
  email: string;
  company?: string;
  message?: string;
  payload: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

export async function createLead(input: CreateLeadInput): Promise<{ id: string } | null> {
  try {
    const lead = await prisma.lead.create({
      data: {
        source: input.source,
        name: input.name,
        email: input.email,
        company: input.company ?? null,
        message: input.message ?? null,
        payload: input.payload,
        ip: input.ip ?? null,
        userAgent: input.userAgent ?? null,
      },
      select: { id: true },
    });

    // Fire-and-forget founder alert; never let it affect the lead result.
    const subject = `New ${input.source} lead from ${input.name}`;
    const body =
      `${subject}\n\nName: ${input.name}\nEmail: ${input.email}` +
      (input.company ? `\nCompany: ${input.company}` : '') +
      (input.message ? `\nMessage: ${input.message}` : '') +
      `\n\nView: ${SITE_URL}/admin/leads/${lead.id}`;
    void sendAnnouncement(CONTACT_EMAIL, subject, body);

    return { id: lead.id };
  } catch (err) {
    console.error('createLead failed:', err instanceof Error ? err.message : 'unknown');
    return null;
  }
}
```
> `CONTACT_EMAIL` and `SITE_URL` already exist as exports in `src/app/lib/email.ts` (added in the earlier prod-readiness refactor). Confirm they are exported; if `CONTACT_EMAIL` is not exported there, export it.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- leads.test`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/app/lib/leads.ts src/app/lib/__tests__/leads.test.ts
git commit -m "feat(leads): createLead persists to Postgres + founder alert"
```

---

### Task 5: Wire lead capture into the three form routes; remove Google Sheets

**Files:**
- Modify: `src/app/api/contact/route.ts`
- Modify: `src/app/api/demo/route.ts`
- Modify: `src/app/api/quote/route.ts`
- Delete: `src/app/lib/sheets.ts`
- Modify: `package.json` (remove `googleapis`)

**Interfaces:**
- Consumes: `createLead` from `@/app/lib/leads`.

- [ ] **Step 1: contact route — replace the Sheets append with createLead**

In `src/app/api/contact/route.ts`, remove `import { appendToSheet } from '@/app/lib/sheets';` and add `import { createLead } from '@/app/lib/leads';`. Replace the `appendToSheet('Contacts', [...]).catch(() => {});` block with:
```ts
    await createLead({
      source: 'CONTACT',
      name,
      email,
      message,
      payload: { name, email, message },
      ip: clientIP,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });
```
(Place it where `appendToSheet` was — after emails are sent, before the success response. `createLead` never throws, so no try/catch is needed here.)

- [ ] **Step 2: demo route — same swap**

In `src/app/api/demo/route.ts`, remove the sheets import, add the leads import, and replace `appendToSheet('DemoRequests', [...]).catch(() => {});` with:
```ts
    await createLead({
      source: 'DEMO',
      name,
      email,
      company: company || undefined,
      message: message || undefined,
      payload: { name, email, product, company, message },
      ip: clientIP,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });
```

- [ ] **Step 3: quote route — same swap**

In `src/app/api/quote/route.ts`, remove the sheets import, add the leads import, and replace `appendToSheet('Quotes', [...]).catch(() => {});` with:
```ts
    await createLead({
      source: 'QUOTE',
      name: contactName,
      email,
      company: companyName || undefined,
      message: description || undefined,
      payload: {
        contactName, email, companyName, industry, companySize, phone, preferredContact,
        services: serviceNames, projectType, complexity, timeline, budget, description,
        requirements, specialRequirements,
      },
      ip: clientIP,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });
```

- [ ] **Step 4: Delete the sheets module and dependency**

Run:
```bash
git rm src/app/lib/sheets.ts
npm uninstall googleapis
```
Expected: `sheets.ts` gone; `googleapis` removed from `package.json`.

- [ ] **Step 5: Verify no dangling references**

Run:
```bash
grep -rn "appendToSheet\|googleapis\|GOOGLE_SHEETS" src/ && echo "FOUND — fix" || echo "clean"
```
Expected: `clean`.

- [ ] **Step 6: Type-check, lint, build**

Run: `npm run type-check && npm run lint && npm run build`
Expected: all exit 0.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(leads): forms persist to Postgres + alert; drop Google Sheets"
```

---

### Task 6: End-to-end local verification

**Files:** none (verification only)

- [ ] **Step 1: Ensure dev DB is up + migrated**

Run: `docker compose -f docker-compose.dev.yml up -d && npm run db:deploy`
Expected: migration applied.

- [ ] **Step 2: Run the dev server and submit a real contact form**

Free port 3000 if needed, then `npm run dev`. In a browser (visible, with the user watching — ask first per project rules), submit the `/contact` form with test data.

- [ ] **Step 3: Confirm the row landed**

Run: `npm run db:studio` (or `docker exec craftsai-dev-db psql -U postgres -d craftsai_dev -c 'SELECT id, source, name, email, status FROM "Lead" ORDER BY "createdAt" DESC LIMIT 3;'`)
Expected: the submitted lead present with `status = NEW`. The server log shows `notify not configured — would email "New CONTACT lead …"` (expected until Part 2 sets `NOTIFY_*`).

- [ ] **Step 4: Run the full unit suite**

Run: `npm test`
Expected: db/notify/leads suites green.

- [ ] **Step 5: Stop the dev server; commit any notes**

Stop `npm run dev`. No code change expected; if `.env.example` or docs were tweaked, commit them.

---

## Self-Review

**Spec coverage (§ of the design spec):**
- §4 data model → Task 1 (all models incl. `AuthTicket`, auth tables ready for Part 2). ✅
- §6 lead capture (DB + alert, remove Sheets, fail-open, client auto-reply untouched) → Tasks 4–5. ✅
- §8 notify alert (`announcement` template) → Task 3 + `createLead`. ✅
- §9 env (`DATABASE_URL`, `.env.example`) → Task 1. `NOTIFY_*` documented, wired in Part 2. ✅
- §10 security (server-only notify, no secret logs, no `any`, fail-open) → Tasks 3–5 + constraints. ✅
- §11 testing (unit + visible browser) → Task 6. ✅
- Auth (§5) and dashboard (§7) are **Parts 2 & 3** — intentionally out of this plan.

**Placeholder scan:** No "TBD/handle edge cases/add validation" — every code step is concrete. ✅

**Type consistency:** `createLead(CreateLeadInput) → {id}|null`, `sendAnnouncement(to,subject,body) → {ok}`, `prisma` singleton — names/signatures match across Tasks 2–5. `LeadSource` string union in `CreateLeadInput` matches the Prisma enum values (`CONTACT|QUOTE|DEMO`). ✅

**Dependency note:** Task 4 imports `CONTACT_EMAIL`/`SITE_URL` from `lib/email.ts`; Step 3 instructs verifying/adding the `CONTACT_EMAIL` export there.
