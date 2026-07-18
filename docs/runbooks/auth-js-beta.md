# Runbook — Auth.js (next-auth) v5 beta risk (Phase 1 Task 1.6)

## Status

The app depends on `next-auth@5.0.0-beta.31` (Auth.js v5), a **pre-release**.
Beta releases can introduce breaking changes in a patch bump, so the version is
**pinned exactly** in `package.json` (no `^`), and `package-lock.json` is the
source of truth for the installed tree.

## Why pinned

Two separate NextAuth instances are configured — admin (`src/auth.ts`) and
portal (`src/authPortal.ts`) — each with a Credentials provider that trusts only
a freshly-redeemed single-use ticket, JWT sessions, and distinct signing secrets.
A silent beta bump could change session-cookie, JWT, or callback semantics and
break login or, worse, weaken a security boundary without a visible error.

## Upgrade / regression procedure

Do NOT bump next-auth casually. To move to a new beta or the eventual stable:

1. Read the Auth.js changelog/migration notes for every version in between.
2. Bump the pinned version in `package.json` on a branch; run `npm install`.
3. Run the full gate: `npm run lint`, `npm run type-check`, `npm test`.
4. Run the auth suites specifically (login start/verify/verify-totp/enroll,
   logout revocation, ticket redemption, middleware gate).
5. Manually exercise, in a visible browser: admin OTP + magic-link login, TOTP
   enrollment + confirmation + recovery-code login, trusted-device + logout,
   and the same for the portal — confirming the admin and portal sessions stay
   fully separate (no shared cookie/secret).
6. Only then merge. Record the version and evidence in the release manifest.

## Rollback

Revert the `package.json` pin and `package-lock.json` to the previous commit and
`npm ci`; the pinned lockfile restores the exact prior tree.
