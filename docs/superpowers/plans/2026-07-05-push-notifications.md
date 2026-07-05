# Push Notifications (Phase 5) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Web push (via FCM through notify-svc) to the admin (new lead / message) and clients (message / project update / invoice), each alongside the existing email — gracefully degrading to a no-op until Firebase env is set.

**Architecture:** `pushConfig` gates everything on `NEXT_PUBLIC_FIREBASE_*`; `notify.ts` gains `registerDevice`/`sendPush`; a route serves the FCM service worker; `EnablePush` requests permission + registers a token via audience-gated routes; 5 event sites add a `void sendPush(...)` next to their existing `void sendAnnouncement(...)`.

**Tech Stack:** Next 15 App Router, TypeScript strict, `firebase` web SDK, notify-svc, Jest.

## Global Constraints

- **Graceful degradation:** with any `NEXT_PUBLIC_FIREBASE_*` missing, `isPushConfigured()===false` → `EnablePush` renders nothing, SW route returns 503, and registration never runs. `sendPush`/`registerDevice` no-op when `!isNotifyConfigured()`. Nothing throws — all call sites use `void`.
- Firebase web config is PUBLIC (`NEXT_PUBLIC_`); the FCM **service account is secret and lives only in notify-svc** — never in this app.
- Refs: admin devices → `admin`; client devices → `client:${clientId}`. Register routes gated by the correct session (admin vs portal).
- No DB migration. No new server secrets in the app.
- Branch `feat/push` (created). Dev DB docker on 5438 (only needed for the app to boot in verify).

## File Structure

```
package.json                                     # + firebase
src/app/lib/pushConfig.ts + __tests__/pushConfig.test.ts
src/app/lib/notify.ts + __tests__/notify-push.test.ts   # + registerDevice, sendPush
src/app/firebase-messaging-sw.js/route.ts        # service worker (config from env)
src/app/lib/firebaseClient.ts                    # 'use client' requestPushToken()
src/app/components/EnablePush.tsx                 # 'use client' enable button
src/app/api/admin/push/register/route.ts
src/app/api/user/push/register/route.ts
src/app/admin/AdminNav.tsx                        # render <EnablePush> (admin)
src/app/portal/PortalHeader.tsx                   # render <EnablePush> (client)
src/app/lib/leads.ts, admin/actions.ts, portal/actions.ts, lib/projects.ts, lib/invoices.ts  # +sendPush triggers
.env.example                                      # document the NEXT_PUBLIC_FIREBASE_* vars
```

---

### Task 1: Firebase dependency + push config

**Files:** `package.json`; Create `src/app/lib/pushConfig.ts`, `src/app/lib/__tests__/pushConfig.test.ts`

**Interfaces produced:**
- `firebaseWebConfig(): { apiKey; authDomain; projectId; messagingSenderId; appId } | null`
- `vapidKey(): string | undefined`
- `isPushConfigured(): boolean`

- [ ] **Step 1: Install firebase.** Run: `npm install firebase@^11` → adds to dependencies.
- [ ] **Step 2: Failing test** `pushConfig.test.ts`:
```ts
describe('pushConfig', () => {
  const OLD = process.env;
  afterEach(() => { process.env = OLD; });
  function withEnv(env: Record<string, string | undefined>) {
    process.env = { ...OLD, ...env };
    return require('../pushConfig');
  }
  it('isPushConfigured false when vars missing', () => {
    jest.resetModules();
    const m = withEnv({ NEXT_PUBLIC_FIREBASE_API_KEY: undefined });
    expect(m.isPushConfigured()).toBe(false);
    expect(m.firebaseWebConfig()).toBeNull();
  });
  it('isPushConfigured true when all present', () => {
    jest.resetModules();
    const m = withEnv({
      NEXT_PUBLIC_FIREBASE_API_KEY: 'k', NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'd',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'p', NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: 's',
      NEXT_PUBLIC_FIREBASE_APP_ID: 'a', NEXT_PUBLIC_FIREBASE_VAPID_KEY: 'v',
    });
    expect(m.isPushConfigured()).toBe(true);
    expect(m.firebaseWebConfig()).toEqual({ apiKey: 'k', authDomain: 'd', projectId: 'p', messagingSenderId: 's', appId: 'a' });
    expect(m.vapidKey()).toBe('v');
  });
});
```
- [ ] **Step 3: Run → FAIL** (`npm test -- pushConfig.test`).
- [ ] **Step 4: Implement `pushConfig.ts`:**
```ts
export function firebaseWebConfig() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  if (!apiKey || !authDomain || !projectId || !messagingSenderId || !appId) return null;
  return { apiKey, authDomain, projectId, messagingSenderId, appId };
}
export function vapidKey(): string | undefined {
  return process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || undefined;
}
export function isPushConfigured(): boolean {
  return firebaseWebConfig() !== null && Boolean(vapidKey());
}
```
- [ ] **Step 5: Run → PASS. Commit** `git add package.json package-lock.json src/app/lib/pushConfig.ts src/app/lib/__tests__/pushConfig.test.ts && git commit -m "feat(push): firebase dep + push config gate"`

---

### Task 2: notify.ts push + device functions

**Files:** Modify `src/app/lib/notify.ts`; Create `src/app/lib/__tests__/notify-push.test.ts`

**Interfaces produced:**
- `registerDevice(token: string, userRef: string): Promise<void>`
- `sendPush(userRef: string, subject: string, body: string): Promise<void>`

- [ ] **Step 1: Failing test** `notify-push.test.ts` — node env, mock fetch (mirror the existing notify test approach). Assert `sendPush` posts channel push to `user:<ref>`; `registerDevice` posts to `/v1/devices`; both no-op when unconfigured.
```ts
/** @jest-environment node */
const fetchMock = jest.fn();
beforeEach(() => {
  jest.resetModules();
  process.env.NOTIFY_URL = 'https://notify.example';
  process.env.NOTIFY_API_KEY = 'k';
  (global as unknown as { fetch: jest.Mock }).fetch = fetchMock;
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({ ok: true, status: 202, json: async () => ({}), text: async () => '' });
});

it('sendPush posts channel push to user ref', async () => {
  const { sendPush } = require('../notify');
  await sendPush('admin', 'New lead', 'Ada / ada@x.com');
  const [url, opts] = fetchMock.mock.calls[0];
  expect(String(url)).toContain('/v1/notify');
  const body = JSON.parse(opts.body);
  expect(body.channel).toBe('push');
  expect(body.to).toBe('user:admin');
  expect(body.template).toBe('announcement');
  expect(body.data).toEqual(expect.objectContaining({ subject: 'New lead', body: 'Ada / ada@x.com' }));
});

it('registerDevice posts token to /v1/devices', async () => {
  const { registerDevice } = require('../notify');
  await registerDevice('tok123', 'client:c1');
  const [url, opts] = fetchMock.mock.calls[0];
  expect(String(url)).toContain('/v1/devices');
  expect(JSON.parse(opts.body)).toEqual(expect.objectContaining({ token: 'tok123', user_ref: 'client:c1', platform: 'web' }));
});

it('no-op when notify unconfigured', async () => {
  process.env.NOTIFY_URL = '';
  process.env.NOTIFY_API_KEY = '';
  jest.resetModules();
  const { sendPush, registerDevice } = require('../notify');
  await sendPush('admin', 's', 'b');
  await registerDevice('t', 'admin');
  expect(fetchMock).not.toHaveBeenCalled();
});
```
- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Append to `notify.ts`** (uses the existing `post()` helper + `isNotifyConfigured()`; check the file for the exact `post` signature and reuse it):
```ts
export async function registerDevice(token: string, userRef: string): Promise<void> {
  if (!isNotifyConfigured()) return;
  await post('/v1/devices', { token, user_ref: userRef, platform: 'web' });
}

export async function sendPush(userRef: string, subject: string, body: string): Promise<void> {
  if (!isNotifyConfigured()) return;
  await post('/v1/notify', {
    channel: 'push',
    to: `user:${userRef}`,
    template: 'announcement',
    data: { subject, title: subject, body },
  });
}
```
> Read `notify.ts` first: reuse its `post(path, body)` helper. If `post` throws on non-2xx, wrap these two bodies in `try/catch` that logs and swallows (push is fire-and-forget; a notify outage must never break a request). Match how `sendAnnouncement` handles errors.
- [ ] **Step 4: Run → PASS. Commit** `git commit -m "feat(notify): registerDevice + sendPush (push channel)"`

---

### Task 3: Service worker route

**Files:** Create `src/app/firebase-messaging-sw.js/route.ts`

**Interfaces produced:** `GET /firebase-messaging-sw.js` → JS service worker (or 503 when unconfigured).

- [ ] **Step 1: Implement the route:**
```ts
import { firebaseWebConfig } from '@/app/lib/pushConfig';

export const runtime = 'nodejs';

export async function GET(): Promise<Response> {
  const cfg = firebaseWebConfig();
  if (!cfg) return new Response('', { status: 503 });
  const js = `
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
firebase.initializeApp(${JSON.stringify(cfg)});
const messaging = firebase.messaging();
messaging.onBackgroundMessage(function (payload) {
  const d = payload.data || {};
  const n = payload.notification || {};
  self.registration.showNotification(n.title || d.title || d.subject || 'CraftsAI', {
    body: n.body || d.body || '',
    icon: '/favicon.ico',
  });
});
`;
  return new Response(js, {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Service-Worker-Allowed': '/',
      'Cache-Control': 'no-store',
    },
  });
}
```
- [ ] **Step 2: Verify build routes it.** Run: `npm run build 2>&1 | grep firebase-messaging-sw` → expect the route listed. (Next serves the folder `firebase-messaging-sw.js` at `/firebase-messaging-sw.js`.)
- [ ] **Step 3: Commit** `git commit -m "feat(push): dynamic FCM service worker route"`

---

### Task 4: Client SDK + EnablePush button

**Files:** Create `src/app/lib/firebaseClient.ts`, `src/app/components/EnablePush.tsx`

**Interfaces produced:**
- `requestPushToken(): Promise<string | null>` (client-only; returns FCM token or null)
- `<EnablePush registerPath="/api/admin/push/register" | "/api/user/push/register" />`

- [ ] **Step 1: `firebaseClient.ts`:**
```ts
'use client';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { firebaseWebConfig, vapidKey } from './pushConfig';

/** Requests an FCM token for this browser, registering the SW. Returns null if
 *  unsupported/unconfigured/denied. Never throws. */
export async function requestPushToken(): Promise<string | null> {
  try {
    const cfg = firebaseWebConfig();
    const vapid = vapidKey();
    if (!cfg || !vapid) return null;
    if (!(await isSupported())) return null;
    const app = getApps().length ? getApp() : initializeApp(cfg);
    const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    const messaging = getMessaging(app);
    const token = await getToken(messaging, { vapidKey: vapid, serviceWorkerRegistration: swReg });
    return token || null;
  } catch {
    return null;
  }
}
```
- [ ] **Step 2: `EnablePush.tsx`:**
```tsx
'use client';
import { useEffect, useState } from 'react';
import { isPushConfigured } from '@/app/lib/pushConfig';
import { requestPushToken } from '@/app/lib/firebaseClient';

export default function EnablePush({ registerPath }: { registerPath: string }) {
  const [state, setState] = useState<'idle' | 'busy' | 'on' | 'denied' | 'error'>('idle');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isPushConfigured() || typeof window === 'undefined' || !('Notification' in window)) return;
    setVisible(true);
    if (Notification.permission === 'granted') setState('on');
    if (Notification.permission === 'denied') setState('denied');
  }, []);

  async function enable() {
    setState('busy');
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return setState(perm === 'denied' ? 'denied' : 'idle');
    const token = await requestPushToken();
    if (!token) return setState('error');
    const res = await fetch(registerPath, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }),
    });
    setState(res.ok ? 'on' : 'error');
  }

  if (!visible) return null;
  if (state === 'on') {
    return <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-signal">🔔 Notifications on</span>;
  }
  return (
    <button
      onClick={enable}
      disabled={state === 'busy' || state === 'denied'}
      title={state === 'denied' ? 'Blocked in browser settings' : undefined}
      className="border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-steel transition-colors hover:border-signal hover:text-signal disabled:opacity-50"
    >
      {state === 'busy' ? 'Enabling…' : state === 'denied' ? 'Notifications blocked' : state === 'error' ? 'Try again' : 'Enable notifications'}
    </button>
  );
}
```
- [ ] **Step 3: type-check + lint. Commit** `git commit -m "feat(push): client SDK + EnablePush button"`

---

### Task 5: Register routes (gated per audience)

**Files:** Create `src/app/api/admin/push/register/route.ts`, `src/app/api/user/push/register/route.ts`

- [ ] **Step 1: Admin route:**
```ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdmin } from '@/app/lib/adminSession';
import { registerDevice } from '@/app/lib/notify';

export const runtime = 'nodejs';
const Body = z.object({ token: z.string().min(10) });

export async function POST(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 401 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  await registerDevice(parsed.data.token, 'admin');
  return NextResponse.json({ ok: true });
}
```
- [ ] **Step 2: Portal route:**
```ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPortalClient } from '@/app/lib/portalSession';
import { registerDevice } from '@/app/lib/notify';

export const runtime = 'nodejs';
const Body = z.object({ token: z.string().min(10) });

export async function POST(req: NextRequest) {
  const client = await getPortalClient();
  if (!client) return NextResponse.json({ ok: false }, { status: 401 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  await registerDevice(parsed.data.token, `client:${client.clientId}`);
  return NextResponse.json({ ok: true });
}
```
- [ ] **Step 3: type-check. Commit** `git commit -m "feat(push): audience-gated device register routes"`

---

### Task 6: Wire EnablePush into nav + header

**Files:** Modify `src/app/admin/AdminNav.tsx`, `src/app/portal/PortalHeader.tsx`

- [ ] **Step 1: AdminNav** — import `EnablePush`; render `<EnablePush registerPath="/api/admin/push/register" />` in the right-hand cluster (near the email / sign-out).
- [ ] **Step 2: PortalHeader** — import `EnablePush`; render `<EnablePush registerPath="/api/user/push/register" />` next to the client name / sign-out.
- [ ] **Step 3: build + type-check + lint. Commit** `git commit -m "feat(push): surface Enable notifications in admin + portal"`

---

### Task 7: Event triggers (push alongside email)

**Files:** Modify `src/app/lib/leads.ts`, `src/app/admin/actions.ts`, `src/app/portal/actions.ts`, `src/app/lib/projects.ts`, `src/app/lib/invoices.ts`

Add `import { sendPush } from './notify'` (or `@/app/lib/notify`) where missing, then a `void sendPush(...)` next to each existing `void sendAnnouncement(...)`:

- [ ] **Step 1: `leads.ts` `createLead`** — after the founder alert email:
```ts
void sendPush('admin', `New ${input.source} lead`, `${input.name} — ${input.email}`);
```
- [ ] **Step 2: `portal/actions.ts` `sendClientMessage`** — after the founder email:
```ts
void sendPush('admin', `New portal message — ${project.title}`, `${c.name} sent a message.`);
```
- [ ] **Step 3: `admin/actions.ts` `sendAdminMessage`** — need the clientId; extend the existing `project` lookup select to include `client: { select: { id: true, email: true } }`, then after the client email:
```ts
void sendPush(`client:${project.client.id}`, `Reply from CraftsAI — ${project.title}`, 'You have a new message in your portal.');
```
- [ ] **Step 4: `projects.ts` `addProjectUpdate`** — only for CLIENT visibility; look up the project's clientId:
```ts
if (visibility === 'CLIENT') {
  const p = await prisma.project.findUnique({ where: { id: projectId }, select: { clientId: true, title: true } });
  if (p) void sendPush(`client:${p.clientId}`, `Project update — ${p.title}`, 'There is a new update on your project.');
}
```
Add `import { sendPush } from './notify';` to projects.ts.
- [ ] **Step 5: `invoices.ts` `sendInvoice`** — after the client email (it already has `inv` with `clientId`, `number`, `currency`, `totalMinor`; `formatMoney` already imported):
```ts
void sendPush(`client:${inv.clientId}`, `Invoice ${invNo(inv.number)}`, `${formatMoney(inv.totalMinor, inv.currency)} — view it in your portal.`);
```
- [ ] **Step 6: full `npm test` + build + type-check + lint. Commit** `git commit -m "feat(push): send push alongside email on the 5 events"`

---

### Task 8: Env docs + verification

**Files:** Modify `.env.example`

- [ ] **Step 1: `.env.example`** — append (documented as optional / set after FCM):
```
# Push (Firebase Cloud Messaging) — optional; set after FCM setup (see spec §8). PUBLIC values.
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=
```
- [ ] **Step 2:** `npm test` (all green) + `npm run build && npm run lint && npm run type-check`.
- [ ] **Step 3: Local verify — graceful degradation (no FCM env):**
  - Start dev; log in as admin → confirm **no** "Enable notifications" button appears (push unconfigured) and the app is unaffected.
  - `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/firebase-messaging-sw.js` → **503** (unconfigured). *(status-code smoke of a machine endpoint, not a page/UI check.)*
  - Submit a contact form → confirm the lead still saves and the request succeeds (push no-op didn't break anything).
- [ ] **Step 4: Optional local verify — button appears when configured:** set fake `NEXT_PUBLIC_FIREBASE_*` (any non-empty values) in `.env`, restart dev, confirm the **Enable notifications** button now renders in AdminNav and `/firebase-messaging-sw.js` returns 200 JS. Remove the fakes after. *(Real permission/token needs a real Firebase project.)*
- [ ] **Step 5:** Deploy: merge `feat/push` → main, deploy SUCCESS, prod smoke (`/firebase-messaging-sw.js` → 503 until FCM env set; app unaffected). **No DB migration. Env vars set later, after your FCM setup.**
- [ ] **Step 6: Hand the user the FCM setup guide** (spec §8): once they complete it and paste the 6 values, set `NEXT_PUBLIC_FIREBASE_*` on Railway → redeploy → do the real end-to-end browser test (permission grant → test lead → push arrives).

## Self-Review

**Spec coverage:** §3 architecture/graceful-degradation → T1 (gate) + everywhere; §4 notify additions → T2; §5 registration flow → T4/T5; §6 SW → T3; §7 event mapping → T7 (all 5); §8 FCM guide → T8 step 6 (+ spec); §9 security/testing → T2/T4/T5 + T8 verify; §10 rollout → T1/T8. ✅
**Placeholder scan:** T4 (client SDK/EnablePush) has full code; the only deferred detail is reusing `notify.ts`'s existing `post()` (T2 note says read it first — the helper exists in-repo). No vague error handling — push wrappers explicitly swallow. ✅
**Type consistency:** `firebaseWebConfig/vapidKey/isPushConfigured`; `registerDevice(token,userRef)`/`sendPush(userRef,subject,body)`; `requestPushToken()`; `<EnablePush registerPath>`; refs `admin` / `client:${clientId}` consistent across T2/T5/T7. ✅
