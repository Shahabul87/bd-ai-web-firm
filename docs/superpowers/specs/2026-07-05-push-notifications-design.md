# Design Spec — Phase 5: Push Notifications

- **Date:** 2026-07-05
- **Status:** Approved (design), pending spec review
- **Builds on:** Phases 1–4 (leads, clients/projects, portal + `getPortalClient`, messaging, invoicing, notify-svc).
- **Part of:** the Phase 2+ roadmap (`2026-07-04-phase2plus-roadmap.md`) — final phase.

## 1. Context & Goal

Add **web push** so the founder gets an instant notification on new leads/messages, and clients get one on project updates / messages / invoices — each push **alongside the email we already send**. Push is delivered through notify-svc (FCM). The app is built to **gracefully degrade**: with no Firebase env configured, the enable button is hidden and every push call is a no-op, so it ships safely before FCM is wired.

## 2. Confirmed Decisions

| Decision | Choice |
|---|---|
| Audience | **Both** admin + clients |
| Events | New lead → admin; portal message → other party; project update → client; invoice sent → client (all 5) |
| Sequencing | **Build app side now, gracefully degrading; wire FCM after** |
| Transport | notify-svc `POST /v1/notify` `channel:"push"`, `announcement` template |
| Device store | notify-svc (`POST /v1/devices`) — **no app DB table** |
| Refs | admin devices → `admin`; client devices → `client:<clientId>` |
| Out of scope | native mobile push, per-event mute, notification history |

## 3. Architecture

Graceful degradation is the backbone. `pushConfig.ts` exposes `isPushConfigured()` = all `NEXT_PUBLIC_FIREBASE_*` present. When false: `EnablePush` renders nothing; `notify.sendPush`/`registerDevice` short-circuit (like `devMode()`). No migration.

```
firebase (npm dependency)                        # client SDK (app/), pinned
src/app/lib/pushConfig.ts                         # firebaseWebConfig(), vapidKey(), isPushConfigured()
src/app/lib/firebaseClient.ts                     # 'use client' lazy init + requestPushToken()
src/app/components/EnablePush.tsx                 # 'use client' enable button
src/app/firebase-messaging-sw.js/route.ts         # GET → service worker JS w/ config from env
src/app/api/admin/push/register/route.ts          # getAdmin → notify.registerDevice(token,'admin')
src/app/api/user/push/register/route.ts            # getPortalClient → registerDevice(token,'client:'+clientId)
src/app/lib/notify.ts                             # + registerDevice(), sendPush()
# triggers added ALONGSIDE existing sendAnnouncement in:
#   lib/leads.ts (createLead), admin/actions.ts (sendAdminMessage), portal/actions.ts (sendClientMessage),
#   lib/projects.ts (addProjectUpdate, CLIENT only), lib/invoices.ts (sendInvoice)
src/app/admin/AdminNav.tsx  +  src/app/portal/PortalHeader.tsx   # render <EnablePush …>
```

## 4. notify.ts additions

```ts
export async function registerDevice(token: string, userRef: string): Promise<void>
  // POST /v1/devices { token, user_ref: userRef, platform: 'web' }; no-op if !isNotifyConfigured()
export async function sendPush(userRef: string, subject: string, body: string): Promise<void>
  // POST /v1/notify { channel:'push', to:'user:'+userRef, template:'announcement', data:{subject,body,title:subject} }
  // no-op if !isNotifyConfigured(); never throws (fire-and-forget wrappers at call sites use void)
```
Both mirror the existing `post()` helper + `devMode` guard already in `notify.ts`.

## 5. Registration flow

`EnablePush` (rendered only when `isPushConfigured()`):
1. Button "Enable notifications" (hidden if `Notification.permission==='granted'` already and registered this session).
2. Click → `Notification.requestPermission()`. If not `granted`, show a hint and stop.
3. Register the SW: `navigator.serviceWorker.register('/firebase-messaging-sw.js')`.
4. `requestPushToken()` → `getToken(messaging, { vapidKey, serviceWorkerRegistration })`.
5. `POST { token }` to the audience's register route.
6. Route validates (Zod), gates the session, calls `notify.registerDevice(token, ref)`.

- **Admin:** `AdminNav` renders `<EnablePush registerPath="/api/admin/push/register" />`; route is `getAdmin`-gated → ref `admin`.
- **Client:** `PortalHeader` renders `<EnablePush registerPath="/api/user/push/register" />`; route is `getPortalClient`-gated → ref `client:${clientId}`.

Foreground messages: `onMessage` shows a lightweight in-page notification (browser `Notification` if permitted). Background messages handled by the SW (`onBackgroundMessage` → `showNotification`).

## 6. Service worker (`/firebase-messaging-sw.js` route)

A GET route returns JavaScript (`Content-Type: application/javascript`, `Service-Worker-Allowed: /`) that:
- `importScripts` the Firebase **compat** app + messaging builds from `gstatic.com` (standard FCM web pattern).
- `firebase.initializeApp(<config from NEXT_PUBLIC_FIREBASE_* env>)`.
- `getMessaging()` + `onBackgroundMessage` → `self.registration.showNotification(title, { body, icon })`.

Config is injected server-side from env at request time (values are public). Returns `503` (empty) if unconfigured so registration fails gracefully.

## 7. Event → push mapping

Each is a `void sendPush(ref, subject, body)` added next to the existing `void sendAnnouncement(...)`:

| Trigger (file) | ref | subject / body |
|---|---|---|
| `createLead` (leads.ts) | `admin` | "New {SOURCE} lead" / name + email |
| `sendClientMessage` (portal/actions.ts) | `admin` | "New portal message — {project}" |
| `sendAdminMessage` (admin/actions.ts) | `client:${clientId}` | "Reply from CraftsAI — {project}" |
| `addProjectUpdate` **CLIENT only** (projects.ts) | `client:${clientId}` | "Project update — {project}" |
| `sendInvoice` (invoices.ts) | `client:${clientId}` | "Invoice {INV} — {amount}" |

`addProjectUpdate` and `createLead`/`sendInvoice` need the clientId: `addProjectUpdate` looks up the project's `clientId` (only pushes when `visibility==='CLIENT'`); `sendInvoice` already has `inv.clientId`; message actions already have the project/client.

## 8. FCM setup guide (the one-time external steps — included verbatim in the plan)

**A. notify-svc (Windows/maintainer box) — enable sending:**
1. In the Firebase console, pick the ONE project notify-svc will send from (or create `craftsai-notify`). Project → Settings → **Service accounts → Generate new private key** → download JSON.
2. Add it to notify-svc's Railway env (per notify-svc's FCM env convention, e.g. `FCM_SERVICE_ACCOUNT_JSON` / `GOOGLE_APPLICATION_CREDENTIALS`), redeploy notify-svc. This is the **secret** sender key — stays in notify-svc only.

**B. Firebase console — get the app (receiver) config:**
3. Same project → **Add app → Web** (`</>`), name "CraftsAI" → copy the config object: `apiKey, authDomain, projectId, messagingSenderId, appId`.
4. Project Settings → **Cloud Messaging → Web configuration → Web Push certificates → Generate key pair** → copy the **VAPID public key**.

**C. Hand to me → I set app env (public, no code change):**
```
NEXT_PUBLIC_FIREBASE_API_KEY=…
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=…            # <project>.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=…
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=…
NEXT_PUBLIC_FIREBASE_APP_ID=…
NEXT_PUBLIC_FIREBASE_VAPID_KEY=…             # the Web Push certificate public key
```
> **Critical:** the app (receiver) and notify-svc (sender) must use the **same Firebase project** — the token issuer and the sender must match, or delivery silently fails.

## 9. Security & Testing

- Firebase web config is **public** (`NEXT_PUBLIC_`, appears in client anyway) — safe. The FCM **service account is secret** and lives ONLY in notify-svc.
- Register routes: Zod-validate the token, gate by the correct session (admin vs portal), so a client token can't register as `admin`. Fire-and-forget push never blocks or breaks a request (all `void`, no-throw).
- **Unit tests (mock fetch):** `registerDevice` → `POST /v1/devices` payload; `sendPush` → `POST /v1/notify` `channel:'push'`, `to:'user:'+ref`; both no-op when `!isNotifyConfigured()`; `isPushConfigured()` true only with all vars.
- **Verifiable now (no FCM):** app builds; `EnablePush` renders nothing when unconfigured; SW route returns 503 when unconfigured / valid JS when configured; register routes 401 unauthenticated. Optionally, set fake `NEXT_PUBLIC_FIREBASE_*` locally to confirm the button appears + the SW route serves JS.
- **Verifiable after FCM (your setup):** grant permission in a real browser → token registered → submit a test lead → a push arrives. **Honest note:** end-to-end delivery cannot be verified until the FCM steps in §8 are done.

## 10. Rollout

Branch `feat/push`. Order: `firebase` dep → `pushConfig` + notify additions (+tests) → SW route → `firebaseClient` + `EnablePush` → register routes → wire `EnablePush` into AdminNav + PortalHeader → add 5 push triggers → build/lint/type-check → local verify (graceful degradation) → merge. **New env (set later, after FCM):** the six `NEXT_PUBLIC_FIREBASE_*` vars. **No DB migration.**

## 11. Risks

- **Won't deliver until FCM is set up** — expected; the whole design degrades gracefully so shipping is safe and low-risk.
- Same-Firebase-project requirement (sender = receiver) — called out explicitly in §8.
- Service worker served via route (needs correct `Content-Type` + `Service-Worker-Allowed`) — pinned in the plan.
- Browser permission is per-device and revocable — `EnablePush` re-checks `Notification.permission` and re-registers idempotently.
