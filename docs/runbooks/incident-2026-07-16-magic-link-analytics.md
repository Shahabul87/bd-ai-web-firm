# Incident / Containment Note — Magic-link token disclosure to Google Analytics

**Date:** 2026-07-16
**Severity:** High (authentication material disclosed to a third-party processor)
**Author:** Engineering (remediation of Phase 1 Task 1.1)
**Status:** Code remediation complete; operator follow-up (historic-data review) OPEN.

## What happened

Internal admin/portal layouts rendered Google Analytics through the shared
`AppShell`, and the analytics page-view client sent `pathname + "?" + searchParams`
as the GA `page_path`. Magic-link authentication callbacks
(`/admin/login/callback`, `/portal/auth/callback`) receive the login token in the
query string (`?token=…`). As a result, whenever a magic link was opened, the raw
token could be transmitted to Google Analytics as the page path, and remained in
browser history and any outbound `Referer` header.

## What was changed (this commit)

1. `src/app/analytics.tsx` — page-view payload now sends **only the pathname**;
   `useSearchParams` was removed so the component cannot read the query string at all.
2. `src/app/components/AppShell.tsx` — added an `analytics` prop (default `true`);
   both the `<Analytics/>` component and the GA loader scripts render only when it is true.
3. `src/app/(internal)/layout.tsx` — passes `analytics={false}` so **no marketing
   tracker loads on `/admin`, `/portal`, or their auth-callback pages**.
4. `LoginFlow.tsx` / `PortalLoginFlow.tsx` — scrub the token from the address bar
   (`history.replaceState`) on mount, before verification, so it does not persist
   in history or leak via Referer.
5. `next.config.ts` — callback routes now send `Cache-Control: no-store` and
   `Referrer-Policy: no-referrer`.

Regression tests: `src/app/__tests__/analytics.test.tsx` (payload is pathname-only,
no query string, no `token`) and `src/app/components/__tests__/AppShell.test.tsx`
(internal routes render no analytics component and no GA loader).

This satisfies the Phase 0 containment requirement ("remove all analytics from
internal routes"), so magic-link login did not need to be disabled.

## Operator follow-up — STILL OPEN (cannot be done from code)

- [ ] **Review historic Google Analytics data** for `page_path` values containing
      `token=` on `/admin/login/callback` and `/portal/auth/callback`. Do NOT copy
      any token into a ticket or document. If any real, unexpired token is found in
      GA, treat those login challenges as potentially exposed.
- [ ] **Expire outstanding authentication challenges / tickets** and decide whether
      existing admin/portal sessions should be revoked, based on the review outcome.
- [ ] Confirm the GA data-retention window and whether historic path data can be
      deleted via the GA admin console.
- [ ] Record who approved closing this note.

## Verification still required (operator, visible browser)

Per the mandatory manual browser test plan (§11.6): open a magic login with dev
tools + Preserve Log; confirm the token appears in **no** network request, HTML
source, console message, analytics request, or server log after redemption.
