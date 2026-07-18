# Runbook — Secret rotation

Rotate on a schedule (yearly is a reasonable floor) and **immediately** on any
suspected exposure — a secret pasted into a chat, a log, a screenshot, or a
commit. When in doubt, rotate; it is cheap, and assuming a leak was harmless is
how incidents happen.

> **Never print a secret value** — not in a terminal you are sharing, not in a
> ticket, not in a commit. The env validator and every script here handle values
> by name and masked status only. Treat any leaked value as already compromised.

## The secrets

| Secret | Used for | Effect of rotating |
|---|---|---|
| `AUTH_SECRET` | Admin session/cookie signing | **Invalidates all admin sessions** (admins re-login). |
| `PORTAL_AUTH_SECRET` | Portal session/cookie signing | **Invalidates all client sessions**. MUST differ from `AUTH_SECRET` — env validation rejects equal values. |
| `NOTIFY_API_KEY` | Auth to notify-svc | Email/push/login codes stop until notify-svc has the new key too — rotate **both sides together**. |
| `HEALTH_DETAIL_TOKEN` | Reading `/api/health/ready` diagnostics | Low impact; old token stops revealing details. |
| `BACKUP_PASSPHRASE` | Encrypting logical backups | Old archives stay readable with the OLD passphrase — see below. |
| Database credentials | Postgres access | Managed in Railway; rotating cuts off anything using the old creds. |

## Generating a new value

```bash
openssl rand -base64 48        # for AUTH_SECRET / PORTAL_AUTH_SECRET (≥32 chars required)
```

Set it in **Railway → service → Variables** (never in the repo). The app
re-validates on boot and **refuses to start** if a secret is missing, too weak,
a known placeholder, or if the two auth secrets match.

## Routine rotation (`AUTH_SECRET` / `PORTAL_AUTH_SECRET`)

1. Generate a new value; confirm it differs from the other auth secret.
2. Update it in Railway.
3. Redeploy (`docs/runbooks/release.md`). Sessions signed with the old secret
   are now invalid — that is expected; users simply log in again.
4. Verify `/api/health/ready` is 200 and the app booted (a bad secret makes it
   refuse to start — you would see it fail its health check).

## `NOTIFY_API_KEY` — rotate both sides together

1. Issue a new key in notify-svc (keep the old one valid for the cutover).
2. Set the new key in Railway; redeploy.
3. Verify a login OTP arrives (or check the notify-svc dashboard).
4. Revoke the old key in notify-svc.

If you swap the app side first and revoke the old key before the new one is live,
**logins and all transactional email stop.** Order matters.

## `BACKUP_PASSPHRASE` — the subtlety

Rotating it does **not** re-encrypt existing archives. They remain decryptable
with the **old** passphrase, so:

1. If the passphrase leaked, treat every archive encrypted with it as
   compromised and **destroy them**.
2. Set the new passphrase, then take a fresh backup (`npm run backup`) and prove
   it (`npm run restore:drill`).
3. Keep the old passphrase only as long as you still need an old archive — then
   discard it.

## After any rotation prompted by a leak

1. Rotate the affected secret(s) — and anything they could have unlocked.
2. Review `AuditLog` and `/admin/incidents` for the exposure window.
3. If a session secret was exposed, all sessions are already invalidated by the
   rotation — confirm no unexpected admin actions occurred first.
4. Record it (`docs/runbooks/incident-response.md`), including how it leaked, so
   the same path is closed.

## Related

- `env.ts` enforces: min length, no placeholders, `AUTH_SECRET != PORTAL_AUTH_SECRET`,
  https URLs, postgres DATABASE_URL.
- A magic-link token reaching Google Analytics was a past incident — see
  `incident-2026-07-16-magic-link-analytics.md`. If reviewing that, the tokens
  are login challenges, not these secrets, but the "rotate on exposure" reflex is
  the same.
