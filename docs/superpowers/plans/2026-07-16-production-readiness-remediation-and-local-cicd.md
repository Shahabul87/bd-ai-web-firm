# Production Readiness Remediation and Local CI/CD Plan

> **Status:** Proposed implementation plan. No item is complete until its acceptance evidence is recorded.
>
> **Supersedes:** The readiness conclusion in `docs/production-readiness-report-2026-07-05.md`. That report is useful historical context, but its test counts, route counts, and production-ready conclusion no longer describe the current application.
>
> **Execution rule:** Work in dependency order. Use parallel agents only for independent read-only investigation or review; keep mutation single-writer. Reproduce bugs before changing code, add regression tests with each fix, and run the complete gate before claiming a phase complete.

**Plan date:** 2026-07-16  
**Application:** CraftsAI website, admin application, client portal, lead funnels, invoicing, authentication, and notify-svc integration  
**Deployment observed:** Cloudflare in front of Railway  
**Primary operator:** Solo developer  
**CI/CD requirement:** The authoritative build, test, and release pipeline must run locally and be versioned in this repository. Hosted CI is optional and must not be required for a release.

---

## 1. Goal and production definition

The goal is not merely to make the project compile. The goal is to establish a repeatable, secure release process in which:

- Revenue forms work end-to-end and do not silently lose data.
- Admin and client authentication resist token leakage, MFA bypass, replay, and stale trusted-device access.
- Every client-facing read and write is tenant-scoped and validated.
- Important emails, pushes, invitations, and invoices are durably queued and observable.
- Tests are hermetic and physically unable to mutate production.
- A clean local command can create a release candidate from a known commit.
- A separate local command can deploy that exact candidate only after explicit operator confirmation.
- Health, monitoring, backups, restore drills, and rollback are proven rather than assumed.
- Legal, privacy, accessibility, SEO, localization, and performance requirements have explicit gates.

### Production-ready means all of the following

- [ ] Every P0 and P1 item in this plan is complete.
- [ ] `npm run ci:local` passes from a clean install on the pinned runtime.
- [ ] All mandatory browser scenarios pass against `next start` with an isolated database and notify test double.
- [ ] A release candidate is deployed to a production-like environment and passes the release smoke suite.
- [ ] Production configuration validation passes without exposing secret values.
- [ ] A current production backup exists and a restore has succeeded in an isolated database.
- [ ] The previous application release can be restored using a documented command.
- [ ] Liveness, readiness, uptime monitoring, and an independent alert path are active.
- [ ] The privacy policy contains no placeholders and has received appropriate legal review.
- [ ] Production is manually verified through a visible browser after deployment.

### Claims that are not allowed

- A passing build does not mean the feature works.
- Passing assertions do not mean tests pass if the command exits nonzero.
- Local tests do not prove production state.
- A homepage HTTP 200 does not prove database, authentication, or notify readiness.
- A provider saying backups are enabled does not prove that the backup is restorable.

---

## 2. Current baseline and release blockers

Record this as the starting baseline so later work can demonstrate improvement.

### Passed during the audit

- [x] `npm run lint` exited successfully, with a deprecation warning for `next lint`.
- [x] `npm run type-check` exited successfully under strict TypeScript.
- [x] `npx prisma validate` exited successfully.
- [x] `npm run build` exited successfully and generated 110 static pages.
- [x] Production and development dependency audits reported zero known vulnerabilities at audit time.
- [x] The production homepage, admin login, portal login, sitemap, and robots file returned HTTP 200 during read-only checks.

### Failed or incomplete during the audit

- [ ] `npm test -- --runInBand` exited 1 even though 33 suites and 158 assertions completed.
- [ ] Coverage was only 16.39% of lines and no coverage threshold was enforced.
- [ ] Playwright produced 11 passed, 5 skipped, and 1 failed.
- [ ] Authenticated admin, portal, invoice, and tenant-boundary browser tests are `test.fixme`.
- [ ] Playwright runs the development server rather than the production build.
- [ ] Local Prisma migration status could not reach PostgreSQL on port 5438.
- [ ] Production `/api/health` returned 404.
- [ ] No backup restore, rollback, authenticated production flow, production write, or notify delivery was verified.
- [ ] A visible manual browser and assistive-technology review was not completed.

### Immediate production containment

Complete these before normal feature work or another deployment:

- [ ] Temporarily disable magic-link login for admin and portal, or remove all analytics from internal routes first.
- [ ] Freeze non-emergency production deployments until the local release gate exists and the P0 security/funnel defects are resolved.
- [ ] Confirm that no production secret is present in source control, test output, build artifacts, or committed documentation. Report names and masked status only.
- [ ] Review Google Analytics data collection for historical callback URLs. Do not copy tokens into tickets or documents.
- [ ] Expire outstanding authentication challenges and review whether existing sessions need revocation after the analytics investigation.
- [ ] Confirm provider backups are enabled before any schema migration. This is only temporary protection; a restore drill is still mandatory.

**Containment deliverable:** A short dated operator note identifying what was disabled, what was reviewed, whether sessions/challenges were revoked, and who approved re-enablement.

---

## 3. Delivery sequence and gates

| Phase | Priority | Outcome | Release gate |
|---|---:|---|---|
| 0 | P0 | Contain active auth exposure and freeze unsafe releases | No magic-link token can reach analytics |
| 1 | P0 | Repair authentication and security boundaries | Security regression suite passes |
| 2 | P0 | Repair lead and revenue funnels | Contact, quote, and demo succeed end-to-end |
| 3 | P0/P1 | Enforce tenant/data integrity and durable delivery | Integration suite proves isolation and retries |
| 4 | P0/P1 | Build hermetic local CI | `npm run ci:local` passes from clean state |
| 5 | P1 | Build controlled local CD and operations | Release, health, backup, restore, rollback proven |
| 6 | P1 | Finish privacy, legal, retention, and documentation | Legal/operator sign-off recorded |
| 7 | P1/P2 | Correct SEO, localization, accessibility, and performance | Manual/browser quality matrix passes |
| 8 | Final | Production candidate and live verification | Deployment evidence and release tag recorded |

Do not begin production deployment work merely because an individual phase compiles. Each phase ends with its listed automated and manual acceptance tests.

---

## 4. Phase 1 — Authentication and security remediation

### Task 1.1 — Eliminate magic-link token disclosure

**Root cause:** Internal layouts render Google Analytics, and the analytics client sends `pathname + searchParams` as `page_path`. Authentication callbacks receive the magic token in the query string.

**Implementation:**

- [ ] Exclude Analytics and all marketing trackers from `/admin`, `/portal`, their API routes, and authentication callbacks.
- [ ] Change analytics page-view code so it never sends query strings, URL fragments, email addresses, IDs, or other user-controlled identifiers.
- [ ] Prefer server-side callback token redemption. After redemption, return a 303 redirect to a clean URL before rendering a client component.
- [ ] Add `Cache-Control: no-store` and a strict referrer policy to callback responses.
- [ ] Ensure error monitoring also redacts URL queries and authentication material.
- [ ] Add a route-level test proving Analytics is absent from internal layouts.
- [ ] Add a unit test proving page-view payloads contain only an approved pathname.

**Deliverables:**

- Internal-route analytics exclusion.
- Clean server-side callback flow.
- Token-redaction regression tests.
- Incident review note covering historic Analytics collection.

**Acceptance:** No browser network request, HTML source, console message, log entry, or analytics event contains a magic token.

### Task 1.2 — Canonicalize admin identity and close the MFA case-variant path

**Root cause:** The allowlist lowercases email for comparison, but authentication challenges, tickets, Prisma queries, and `User.email` retain the caller's original casing. PostgreSQL treats the current unique string as case-sensitive.

**Implementation:**

- [ ] Introduce one `normalizeEmail()` helper and use it before allowlist checks, challenge creation, cookie creation, ticket issuance, audit writes, trust-service calls, Prisma reads, and Prisma writes.
- [ ] Decide on the database invariant: a dedicated `normalizedEmail` unique column is preferred because it is explicit and portable. A case-insensitive PostgreSQL column is acceptable if migration and Prisma behavior are proven.
- [ ] Before adding uniqueness, write a read-only duplicate report grouped by normalized email.
- [ ] Define an explicit manual merge procedure for duplicates. Never delete or merge production identities automatically.
- [ ] Add the new field as optional, backfill safely, validate duplicates, add uniqueness, then make it required in a later migration.
- [ ] Key notify-svc MFA and trusted-device identities to a stable application user ID where supported.
- [ ] Normalize `ADMIN_EMAILS` during environment validation and reject duplicate/invalid entries.

**Tests:**

- [ ] Unit tests for leading/trailing whitespace and local/domain case variants.
- [ ] Integration test proving all case variants resolve to one user record.
- [ ] Browser test proving an already-enrolled account cannot reopen enrollment using different casing.
- [ ] Migration test against representative duplicate data.

### Task 1.3 — Make TOTP enrollment and reset stateful and authorized

**Root cause:** The enrollment endpoint checks only that the email factor passed. It does not prove that the account is unenrolled, does not require existing MFA for reset, and does not complete an explicit enrollment-confirmation transition.

**Implementation:**

- [ ] Model explicit states: `NOT_ENROLLED`, `ENROLLMENT_PENDING`, and `ENROLLED`, or equivalent fields with expiry.
- [ ] Permit first-time enrollment only when the canonical user is not enrolled.
- [ ] Store pending enrollment server-side and do not mark it active until a valid TOTP is confirmed.
- [ ] Do not generate final recovery codes until confirmation succeeds, or make pending codes unusable until confirmation.
- [ ] Require existing TOTP, a recovery code, or a separately audited administrator recovery process to reset MFA.
- [ ] Rate-limit enrollment, confirmation, reset, and recovery attempts by both IP and normalized account identity.
- [ ] Audit every enrollment start, confirmation, reset, recovery use, and failure without recording secrets or codes.
- [ ] Verify notify-svc enrollment, confirmation, replacement, and recovery semantics before implementation.

**Acceptance:** Possession of email access alone cannot replace or reset an enrolled second factor.

### Task 1.4 — Revoke trusted devices and custom cookies on logout

**Root cause:** Auth.js sign-out does not clear or revoke the custom admin/portal trust cookies.

**Implementation:**

- [ ] Create explicit admin and portal logout actions/routes that revoke trusted-device tokens server-side.
- [ ] Clear Auth.js session cookies, challenge cookies, trust cookies, and any temporary ticket cookies.
- [ ] Decide whether normal logout revokes only the current trusted device or all devices; expose “forget this device” and “sign out everywhere” separately if both are needed.
- [ ] Unregister or detach the browser push token when the user disables notifications or signs out, according to the product decision.
- [ ] Add audit events for logout, trust revocation, and all-session revocation.

**Tests:**

- [ ] After logout, entering the known portal email must require a new OTP.
- [ ] After admin logout, trusted-device state must not skip the intended MFA step.
- [ ] Expired/revoked trust tokens must fail closed.

### Task 1.5 — Make AuthTicket redemption atomic

**Root cause:** Redemption reads an unused ticket and updates `usedAt` in separate statements, so concurrent requests may both pass the initial check.

**Implementation:**

- [ ] Redeem using one atomic database operation constrained by ticket ID/hash, scope, `usedAt IS NULL`, and `expiresAt > now`.
- [ ] Require exactly one affected row before returning the identity.
- [ ] Store only a cryptographic hash of bearer tickets if plaintext is currently persisted.
- [ ] Bind tickets to their intended authentication scope.
- [ ] Add scheduled cleanup for expired tickets.

**Tests:**

- [ ] Launch concurrent redemption requests and prove exactly one succeeds.
- [ ] Verify expired, wrong-scope, malformed, and already-used tickets fail identically.

### Task 1.6 — Harden request validation, rate limits, exports, and environment security

- [ ] Rate-limit login by normalized account and IP without creating account-enumeration differences.
- [ ] Use the authoritative Cloudflare/Railway client-IP header only after verifying the actual trusted proxy chain. Validate the address before use.
- [ ] Alert when shared database rate limiting falls back to in-memory behavior.
- [ ] Neutralize CSV cells beginning with `=`, `+`, `-`, `@`, tab, or carriage return before spreadsheet export.
- [ ] Add Zod validation and sensible length limits to all server actions, message bodies, project updates, invoice fields, notes, references, and identifiers.
- [ ] Reject public placeholder secrets in production.
- [ ] Require admin and portal signing secrets to differ.
- [ ] Validate PostgreSQL URLs, HTTPS public URLs, notify URLs, and parsed admin email lists.
- [ ] Replace hardcoded production URLs with one validated canonical application URL.
- [ ] Move from `unsafe-inline` CSP toward nonces/hashes after auditing required scripts and styles.
- [ ] Add bounded timeouts to all outbound network calls.
- [ ] Document Auth.js beta risk, pin the exact version, and create an upgrade/regression procedure.

**Phase 1 exit criteria:**

- [ ] Security regression suite is green.
- [ ] Manual admin and portal authentication matrix is green.
- [ ] No internal route loads marketing analytics.
- [ ] No case variant creates or authenticates as a separate identity.
- [ ] MFA reset requires an authorized second-factor/recovery process.
- [ ] Logout revokes custom trust state.
- [ ] Ticket concurrency test proves single redemption.

---

## 5. Phase 2 — Revenue funnels and customer-facing correctness

### Task 2.1 — Repair the quote funnel with one shared contract

**Root cause:** Client state, visual fields, and API requirements evolved independently. `projectType` is required by the API but has no client control, and company is described as optional but rejected by the API.

**Implementation:**

- [ ] Create one shared quote Zod schema and inferred TypeScript type used by both client and API.
- [ ] Decide whether `projectType` is a real product field. Add an accessible control if it is; remove it everywhere if it is not.
- [ ] Decide whether company is optional and apply the decision consistently to labels, schema, persistence, and notifications.
- [ ] Associate every error with its field and wizard step.
- [ ] On server validation failure, navigate to and focus the first invalid field rather than always returning to step 1.
- [ ] Replace click-only selection `<div>` elements with native checkbox/radio controls or semantic buttons with keyboard behavior.
- [ ] Persist the complete quote payload and include the relevant fields in founder notification content.
- [ ] Add duplicate-submission protection or an idempotency key.

**Tests:**

- [ ] Shared schema contract tests.
- [ ] API tests for valid, invalid, boundary-length, malicious, and duplicate payloads.
- [ ] Browser success test that completes every step, confirms the database record, and confirms captured notification content.
- [ ] Keyboard-only wizard test.
- [ ] Mobile viewport wizard test.

### Task 2.2 — Preserve contact and demo information end-to-end

- [ ] Move contact and demo request validation into shared schemas.
- [ ] Persist company and service interest instead of silently discarding them.
- [ ] Assert the exact `createLead` payload in route tests.
- [ ] Include those fields in admin detail pages and founder notifications.
- [ ] Return 503 when durable persistence/enqueue fails; never claim success for a lost lead.
- [ ] Use a stable submission/request ID in the response and logs.
- [ ] Add idempotency or duplicate detection for rapid repeat submissions.

### Task 2.3 — Remove broken links and soft 404 behavior

- [ ] Derive homepage portfolio and resource cards from typed Velite content collections instead of duplicating slugs.
- [ ] Add a build-time test that validates every internal href against the actual route/content manifest.
- [ ] Ensure unknown content slugs return a genuine HTTP 404 with the intended localized not-found UI.
- [ ] Test English and Bengali links independently.
- [ ] Verify sitemap entries and structured-data URLs also resolve.

### Task 2.4 — Correct chatbot and text storage behavior

- [ ] Change `sendMessage` to accept the selected quick-question text explicitly rather than relying on asynchronous state.
- [ ] Test every quick-question path.
- [ ] Stop HTML-escaping normal text before storage.
- [ ] Normalize and validate input, store the original safe text, and escape only at the final HTML sink.
- [ ] Review previously stored entity-escaped data and plan a reversible data correction if production records are affected.
- [ ] Verify React text, plain-text notifications, CSV, and any HTML email template use the correct output encoding for their sink.

**Phase 2 deliverables:**

- Shared schemas for quote, contact, and demo.
- Successful deterministic browser tests for all three funnels.
- Typed content-derived homepage routing.
- True localized 404 behavior.
- Correct chatbot quick actions.
- Input/output encoding policy and regression tests.

**Phase 2 exit criteria:** A fresh visitor can submit every lead funnel once, receive an accurate result, and the operator can trace the same request through database persistence and captured notification delivery.

---

## 6. Phase 3 — Data integrity, authorization, and durable delivery

### Task 3.1 — Define client identity and portal account invariants

- [ ] Decide whether one normalized email can own exactly one client account. If not, introduce an explicit portal identity/account relation rather than selecting the first client by email.
- [ ] Add normalized identity fields through backward-compatible migrations.
- [ ] Audit duplicates before adding constraints.
- [ ] Require portal authentication to resolve one unambiguous active, portal-enabled identity.
- [ ] Test inactive, archived, duplicate, disabled, and case-variant identities.

### Task 3.2 — Enforce tenant relationships on every read and write

- [ ] Centralize authorization helpers for client, project, invoice, message, and file relationships.
- [ ] When accepting both `clientId` and `projectId`, prove in the same database operation/transaction that the project belongs to the client.
- [ ] Validate IDs and all mutable fields before calling business-layer functions.
- [ ] Audit every admin and portal server action, API route, direct object URL, export, and download.
- [ ] Ensure draft invoices are never visible to the portal.
- [ ] Use generic not-found responses where appropriate to avoid cross-tenant enumeration.

**Required negative tests:**

- [ ] Client A cannot read Client B's project, invoice, messages, or attachments by changing a URL/ID.
- [ ] Client A cannot mutate Client B's records through direct server-action/API calls.
- [ ] An admin cannot create an invoice combining Client A with Client B's project.
- [ ] Archived/disabled clients lose portal access immediately.

### Task 3.3 — Make invoice numbering and state transitions atomic

- [ ] Replace `MAX + 1` invoice numbering with a database sequence/counter or a unique-conflict retry strategy proven under concurrency.
- [ ] Define an invoice state machine and reject invalid transitions.
- [ ] Record delivery state separately from business status; do not mark an invoice delivered merely because notification dispatch started.
- [ ] Place invoice mutation, audit event, and outbox enqueue in one transaction.
- [ ] Test concurrent invoice creation and duplicate send requests.

### Task 3.4 — Implement a transactional outbox

**Events requiring durability:** founder lead alert, contact acknowledgement, quote/demo acknowledgement, portal invitation, invoice email/push, project/message notification, and critical incident escalation.

**Implementation:**

- [ ] Add an `OutboxEvent` model with event ID, type, aggregate ID, payload version, status, attempt count, next attempt, last error summary, timestamps, and idempotency key.
- [ ] Enqueue the event inside the same transaction as the business mutation.
- [ ] Add a worker/dispatcher with bounded timeouts, exponential backoff with jitter, maximum attempts, and dead-letter state.
- [ ] Make notify operations idempotent by stable event ID.
- [ ] Expose pending/failed delivery state in the admin UI with safe retry controls.
- [ ] Never store bearer tokens, authentication codes, or unnecessary personal data in outbox payloads.
- [ ] Add retention cleanup for delivered and dead-letter events.

**Tests:**

- [ ] Business transaction rollback leaves no outbox event.
- [ ] Successful business transaction always leaves a durable event even if notify-svc is down.
- [ ] Worker retry does not create duplicate email/push delivery.
- [ ] Dead-letter events are visible and retryable by an authorized admin.
- [ ] Restarting the process does not lose queued delivery.

### Task 3.5 — Decouple operational alerting from the primary failure domain

- [ ] Make incident/reporting lifecycle explicit and await durable enqueue where required.
- [ ] Add request/correlation IDs to routes, logs, incident records, and outbox events.
- [ ] Send critical alerts to an independent external channel that does not depend on the application database or admin UI.
- [ ] Add severity, acknowledgment, resolution state, and time-bounded dashboard counts.
- [ ] Redact personal data and secrets from logs and incident metadata.
- [ ] Define retention cleanup for Incident, AuditLog, AuthTicket, Session, VerificationToken, rate-limit, and outbox records.

**Phase 3 exit criteria:** Tenant-negative tests, concurrency tests, outbox restart/retry tests, and retention tests all pass against a real isolated PostgreSQL database.

---

## 7. Phase 4 — Hermetic local CI

The local pipeline is the authoritative merge/release gate. It must be safe to run repeatedly and must not rely on the developer's current `.env`, database contents, `node_modules`, or running servers.

### Required repository deliverables

- [ ] Pin Node 22 using `.node-version`, `.nvmrc`, or `.tool-versions`.
- [ ] Pin npm with `packageManager` and define compatible `engines` in `package.json`.
- [ ] Replace deprecated `next lint` with the supported ESLint CLI.
- [ ] Add `compose.ci.yml` with isolated PostgreSQL, a health check, and a project-specific volume/network name.
- [ ] Add a deterministic database seed for test identities and tenant fixtures.
- [ ] Add a local notify test double or capture service.
- [ ] Add `scripts/ci-local.sh` and expose it as `npm run ci:local`.
- [ ] Add a fast `npm run check:fast` for the versioned pre-push hook.
- [ ] Add `scripts/cleanup-local-ci.sh` only if trap-based cleanup cannot cover every exit path.
- [ ] Store machine-readable and human-readable reports under an ignored `.artifacts/ci/<git-sha>/` directory.
- [ ] Add `docs/runbooks/local-ci.md` describing prerequisites, normal use, failure diagnosis, and cleanup.

### Fail-closed environment preflight

Before any test that can write:

- [ ] Require `NODE_ENV=test` or a dedicated explicit test mode.
- [ ] Require database name/host to match an approved local test pattern.
- [ ] Reject known production/staging database hosts and public application domains.
- [ ] Require a unique test database per run or clean isolated schema.
- [ ] Require notify URL to point to the local test double.
- [ ] Reject real founder/client recipient domains unless explicitly allowlisted for a manual test.
- [ ] Require `ALLOW_TEST_WRITES=1` only inside the guarded CI script after all safety checks pass.
- [ ] Print variable names and masked/derived validation status only; never print values.

### `npm run ci:local` required order

1. [ ] Check runtime versions and required local tools.
2. [ ] Verify the worktree policy. CI may inspect a dirty tree, but `release:prod` must refuse it.
3. [ ] Create an isolated temporary working/dependency environment and run `npm ci`.
4. [ ] Validate the lockfile and reject extraneous dependencies.
5. [ ] Start isolated PostgreSQL and notify capture services; wait on health checks.
6. [ ] Run `prisma validate`.
7. [ ] Run `prisma migrate deploy` against the isolated database.
8. [ ] Run `prisma migrate status` and fail if anything is pending or divergent.
9. [ ] Seed deterministic fixtures.
10. [ ] Run environment validation tests.
11. [ ] Run ESLint with zero warnings.
12. [ ] Run TypeScript type-check.
13. [ ] Run unit and database integration tests with open-handle detection during stabilization.
14. [ ] Run coverage and enforce agreed thresholds.
15. [ ] Build a production Next.js artifact with the intended runtime configuration.
16. [ ] Start that artifact with `next start` on an isolated port.
17. [ ] Run Playwright against the production server, never `next dev`.
18. [ ] Run internal-link, 404, sitemap, robots, metadata, and structured-data checks.
19. [ ] Run accessibility automation and performance budgets.
20. [ ] Run `npm audit` as an explicit online gate; fail according to documented severity policy.
21. [ ] Record versions, commit SHA, checksums, durations, and redacted results.
22. [ ] Stop servers and containers and remove temporary artifacts through a trap on success, failure, or interruption.

### Test architecture changes

- [ ] Inject or mock the incident sink in unit tests so `reportError` cannot touch Prisma unexpectedly.
- [ ] Make all async side effects owned and awaitable; no unresolved promises after Jest teardown.
- [ ] Divide unit, integration, and browser tests into explicit projects.
- [ ] Replace E2E assertions that accept either success or 503 with deterministic expected outcomes.
- [ ] Implement every authenticated `test.fixme` scenario.
- [ ] Add Chromium, Firefox, WebKit, and mobile Playwright projects.
- [ ] Set incremental coverage thresholds focused first on authentication, authorization, lead routes, invoices, outbox, environment validation, and tenant boundaries.
- [ ] Raise thresholds as uncovered critical paths are filled; do not chase global percentage with low-value tests.

### Local CI acceptance

- [ ] Two consecutive clean runs pass without manual cleanup.
- [ ] A deliberately unsafe production-like database URL is rejected before any connection/write.
- [ ] A failing test returns nonzero and still cleans containers/processes.
- [ ] A DB-down test fails readiness and produces a useful diagnostic without a log storm.
- [ ] A notify-down test preserves outbox events and passes the intended retry assertions.
- [ ] No test sends a real email, push, or production database write.
- [ ] The result is reproducible on a second clean machine or clean local user environment.

---

## 8. Phase 5 — Local CD, health, backup, restore, and rollback

Local CD must be a separate command from local CI. Passing tests does not authorize a production write.

### Task 5.1 — Define the Railway deployment contract as code

- [ ] Add explicit Railway/Nixpacks configuration or a production Dockerfile. Pin the runtime and start command.
- [ ] Inject a non-secret Git commit SHA/version into the build.
- [ ] Build an immutable artifact or deployment tied to that SHA.
- [ ] Document Cloudflare and Railway responsibilities, domains, proxy headers, TLS, environment ownership, and rollback behavior.
- [ ] Ensure staging links use the configured canonical URL rather than hardcoded production URLs.

### Task 5.2 — Add liveness, readiness, and version endpoints

- [ ] Add a no-dependency liveness endpoint that proves the process/event loop responds.
- [ ] Add a no-cache readiness endpoint with short timeouts that verifies database connectivity, required migration/schema state, and any dependency required to safely serve core traffic.
- [ ] Return only safe component status; expose detailed diagnostics only to authenticated/internal callers.
- [ ] Include the non-secret commit SHA/version.
- [ ] Configure Railway to use readiness for deployment health and restart behavior.
- [ ] Add an independent uptime monitor. Monitoring cannot run only on the developer laptop.

### Task 5.3 — Add `npm run release:prod`

**Required repository deliverables:**

- [ ] `scripts/release-local.sh`
- [ ] `scripts/smoke-production.sh`
- [ ] `docs/runbooks/release.md`
- [ ] `docs/runbooks/rollback.md`
- [ ] `docs/runbooks/migrations.md`
- [ ] A release manifest under `.artifacts/releases/<git-sha>/`

**Release script order:**

1. [ ] Refuse a dirty tree, detached HEAD, non-main branch, or local branch not synchronized with its approved remote state.
2. [ ] Confirm the exact commit SHA and ensure no release tag already conflicts.
3. [ ] Require a successful local CI report for the same SHA, then rerun the full gate unless an explicitly documented immutable-artifact workflow makes reuse trustworthy.
4. [ ] Validate production environment names and masked status.
5. [ ] Read current production deployment/version and record the rollback target.
6. [ ] Verify backup freshness and last restore-drill status.
7. [ ] Show migration status/plan without applying it.
8. [ ] Require explicit typed confirmation before backup, migration, or deployment writes.
9. [ ] Create an encrypted off-provider logical backup where authorized.
10. [ ] Apply only backward-compatible expand migrations.
11. [ ] Deploy the immutable SHA/artifact.
12. [ ] Poll readiness with a bounded timeout.
13. [ ] Run read-only production smoke tests.
14. [ ] Pause for visible manual browser verification for user-facing changes.
15. [ ] Tag the verified release and record evidence.
16. [ ] If readiness/smoke fails, roll the application back to the recorded deployment. Prefer database forward-fix; restore only for corruption/data loss with explicit confirmation.

### Task 5.4 — Backup and restore program

- [ ] Confirm provider-managed backup schedule, retention, encryption, and access controls.
- [ ] Add encrypted off-provider logical backups with access restricted to the operator.
- [ ] Choose initial objectives, for example a 24-hour recovery point and 2-hour recovery time, then adjust based on business impact.
- [ ] Add `scripts/backup.sh` that validates target/environment and never prints credentials.
- [ ] Add `scripts/restore-drill.sh` that can restore only into a newly created isolated database by default.
- [ ] Perform and document the first complete restore drill.
- [ ] Schedule a monthly restore drill and record duration, row-count/integrity checks, and cleanup.
- [ ] Document key rotation and what to do if backup credentials leak.

### Task 5.5 — Solo-operator incident readiness

- [ ] Create `docs/runbooks/incident-response.md` with severity levels, provider access, rollback, restore, notification, evidence preservation, and post-incident steps.
- [ ] Create an independent alert channel for readiness failures, dead-letter events, authentication abuse, and elevated 5xx rates.
- [ ] Add a deploy annotation or release SHA to monitoring.
- [ ] Define who/what is contacted if the operator is unavailable.
- [ ] Run one tabletop exercise: database outage, notify outage, bad migration, and compromised auth secret.

**Phase 5 exit criteria:** A release candidate can be deployed by SHA, health-gated, smoke-tested, and rolled back; a recent backup has been restored successfully; alerts reach the operator independently of the application.

---

## 9. Phase 6 — Privacy, legal, retention, and documentation

### Privacy and legal deliverables

- [ ] Replace every placeholder in English and Bengali privacy content.
- [ ] Name the legal entity, jurisdiction, contact method, hosting/database provider, notify/email/push providers, analytics provider, and other subprocessors.
- [ ] Define purposes, lawful basis where applicable, collected fields, IP/user-agent handling, cookies, analytics consent, retention periods, deletion rules, data-subject request process, cross-border processing, and breach contact.
- [ ] Confirm that the application behavior matches the policy, including push-token unregister/disable behavior.
- [ ] Review Analytics consent requirements for target regions.
- [ ] Obtain qualified legal review; engineering completion is not legal approval.
- [ ] Verify email-domain SPF, DKIM, and DMARC with the actual sender provider.

### Retention and deletion implementation

- [ ] Define retention periods for leads, clients, invoices, messages, push tokens, audit logs, incidents, rate-limit records, sessions, auth tickets, and outbox events.
- [ ] Implement scheduled cleanup with dry-run/reporting mode.
- [ ] Preserve records subject to legitimate accounting/legal holds.
- [ ] Add an authorized export/deletion workflow where required.
- [ ] Test that deletion cannot cross tenant boundaries and does not destroy legally required records.

### Documentation cleanup

- [ ] Rewrite stale `CLAUDE.md` statements about routes, tests, backend behavior, versions, and linting.
- [ ] Remove or clearly archive obsolete SMTP setup instructions.
- [ ] Correct E2E ports and old client field names.
- [ ] Mark the 2026-07-05 readiness report as historical and link to this plan/current release evidence.
- [ ] Maintain one authoritative README plus local CI, release, migration, backup/restore, rollback, incident, and secret-rotation runbooks.

---

## 10. Phase 7 — SEO, localization, accessibility, compatibility, and performance

### Task 7.1 — Localization and SEO correctness

- [ ] Decide whether Bengali editorial/product bodies will be fully translated now.
- [ ] Until translated, do not claim Bengali identity for English bodies. Use a deliberate canonical/noindex strategy documented with SEO review.
- [ ] Make Article JSON-LD, page schema, breadcrumb URLs, names, images, and `inLanguage` locale-aware.
- [ ] Correct robots rules so required Next.js chunks/assets are crawlable while private routes remain excluded.
- [ ] Add `/portal/` to crawler exclusions in addition to page-level noindex.
- [ ] Use real source modification dates in the sitemap instead of changing every `lastModified` at build time.
- [ ] Parse date-only content without timezone drift and format using the active locale.
- [ ] Ensure unknown slugs return real 404 status.
- [ ] Validate canonical, hreflang, Open Graph, Twitter, sitemap, and JSON-LD for representative English and Bengali pages.

### Task 7.2 — Accessibility

- [ ] Replace non-semantic clickable selectors with native controls.
- [ ] Add visible focus styles that do not depend only on a border-color change.
- [ ] Associate errors using `aria-invalid`, `aria-describedby`, and a summary/focus strategy.
- [ ] Give chatbot/mobile overlays correct dialog semantics, focus entry, focus containment where appropriate, Escape handling, and focus restoration.
- [ ] Add `aria-expanded`/`aria-controls` to disclosure buttons.
- [ ] Use live regions carefully for submission status and chatbot responses.
- [ ] Preserve reduced-motion behavior.
- [ ] Run automated axe checks and a keyboard/screen-reader manual pass.

### Task 7.3 — Performance and bundle budgets

- [ ] Establish measured baselines for home, contact, quote, article, admin dashboard, and portal dashboard.
- [ ] Stop serializing the complete message catalog to every localized page; pass only required namespaces.
- [ ] Render structured data on the server.
- [ ] Lazy-load chatbot and WhatsApp UI after intent or safe idle time.
- [ ] Review global client wrappers and move static behavior to server components.
- [ ] Set budgets for first-load JavaScript, HTML size, image weight, LCP, CLS, INP, and accessibility score.
- [ ] Test on a throttled mobile profile as well as desktop.

### Task 7.4 — Browser compatibility

- [ ] Add Playwright projects for current Chromium, Firefox, WebKit, and a representative mobile viewport.
- [ ] Prefer progressive enhancement over user-agent classification.
- [ ] Remove or test duplicate/dead compatibility utilities.
- [ ] Verify forms, menus, dialogs, locale switching, and authentication across the browser matrix.

---

## 11. Mandatory manual browser test plan

Automated tests are necessary but do not replace visible browser testing. Run this section against the local production build first, then run the safe production subset after deployment. Record browser/version, viewport, commit SHA, result, screenshot/video reference where useful, and any database/notify evidence.

### 11.1 Test setup and safety

- [ ] Run the visible browser against the `next start` URL produced by local CI.
- [ ] Confirm the URL is localhost and the database is the isolated test database.
- [ ] Confirm notify/email/push uses a local capture service.
- [ ] Open browser developer tools with Preserve Log enabled for auth callback and form tests.
- [ ] Use at least: desktop Chromium, desktop Firefox, desktop WebKit/Safari, and a mobile viewport.
- [ ] Prepare two clients, two projects, sent/draft invoices, an enrolled admin, an unenrolled admin fixture, expired/revoked tokens, and captured notifications.
- [ ] Never use real production users or recipients during local CI/manual testing.

### 11.2 Public navigation and content

- [ ] Open the English homepage and activate every header, footer, selected-work, resource, product, service, and primary CTA link.
- [ ] Repeat the link check on the Bengali homepage.
- [ ] Confirm there are no generic soft-404 pages and unknown slugs show the localized 404 UI with HTTP 404.
- [ ] Use browser back/forward navigation and confirm focus/scroll behavior remains reasonable.
- [ ] Open sitemap and robots routes and sample every content route type from the sitemap.
- [ ] Inspect the page source/head for one English and one Bengali page: canonical, hreflang, language, Open Graph, and JSON-LD must agree.
- [ ] Verify displayed content dates match source dates in both locales.

### 11.3 Contact form

- [ ] Submit a fully valid contact request including company and service interest.
- [ ] Confirm one lead row with the exact values and one captured founder/visitor notification flow.
- [ ] Verify the success UI contains no false promise and repeated refresh does not duplicate the lead unexpectedly.
- [ ] Test each required field empty, invalid email, maximum lengths, Unicode/Bengali text, punctuation such as `R&D's`, multiline text, and leading/trailing whitespace.
- [ ] Test keyboard-only completion and focus on the first error.
- [ ] Simulate database failure: the visitor must receive a clear retryable failure, not success.
- [ ] Simulate notify failure after persistence: the lead must remain stored and the outbox/admin UI must show pending/failed delivery.

### 11.4 Quote wizard

- [ ] Complete every step with mouse and then keyboard only.
- [ ] Verify selection semantics, visible focus, selected state, Back/Next behavior, and preserved values.
- [ ] Test the final agreed behavior of project type and optional/required company.
- [ ] Submit a valid quote and verify one complete database payload and captured notification.
- [ ] Trigger an error on every step and confirm the UI returns to and focuses the owning field.
- [ ] Test mobile portrait, mobile landscape, narrow desktop, and 200% zoom.
- [ ] Reload midway and verify the documented persistence/reset behavior.
- [ ] Double-click submit and verify idempotency.

### 11.5 Demo request and chatbot

- [ ] Submit a valid demo request and verify persistence plus captured notifications.
- [ ] Test validation, database outage, notify outage, and duplicate submission behavior.
- [ ] Open the chatbot, activate every quick question, and confirm the selected question is actually sent.
- [ ] Navigate the chatbot with keyboard, close with Escape, and confirm focus returns to the launcher.
- [ ] Verify new responses are announced appropriately by a screen reader without excessive repetition.

### 11.6 Admin authentication

- [ ] Verify OTP login for an allowlisted normalized email.
- [ ] Verify magic-link login only after the analytics/token fix.
- [ ] During magic login, inspect page source, address bar transitions, network requests, analytics requests, console, and server logs: the token must not appear after redemption or in any third-party request.
- [ ] Try whitespace and email case variants; all must map to the same user and MFA state.
- [ ] Verify a non-allowlisted email receives an enumeration-safe response and no challenge.
- [ ] Test wrong, expired, reused, and rate-limited OTP/magic credentials.
- [ ] Verify first-time TOTP enrollment, valid confirmation, recovery-code generation, and one-time recovery-code use.
- [ ] Attempt to enroll/reset an already-enrolled account after only the email factor; it must be rejected.
- [ ] Test trusted-device opt-in, normal login, logout, and login again. Logout must prevent trust-based bypass.
- [ ] Test “forget this device” and “sign out everywhere” if implemented.
- [ ] Open two tabs and redeem the same auth ticket concurrently; exactly one must succeed.
- [ ] Confirm all significant events appear in the audit trail without codes, tokens, or secret values.

### 11.7 Portal authentication and tenant isolation

- [ ] Verify OTP and magic-link behavior for a portal-enabled active client.
- [ ] Verify disabled, archived, unknown, duplicate, and case-variant client identities fail according to policy without enumeration leakage.
- [ ] Verify trusted-device behavior and logout revocation.
- [ ] Login as Client A and open each project, invoice, message, and allowed download.
- [ ] Change IDs/URLs to Client B's known fixtures; every request must fail without revealing B's content or existence.
- [ ] Repeat mutation attempts using the browser network inspector or a test client for server actions/API calls.
- [ ] Confirm draft invoices are invisible and sent invoices render only the correct client's project information.
- [ ] Confirm disabling portal access terminates or invalidates existing access as designed.

### 11.8 Admin clients, projects, leads, invoices, and incidents

- [ ] Create and update a client using valid and boundary-value input.
- [ ] Attempt duplicate/case-variant client email creation and confirm the chosen identity invariant.
- [ ] Create a project for the client and verify relationship constraints.
- [ ] Attempt to create an invoice using another client's project; the UI and server must reject it.
- [ ] Create invoices concurrently and confirm unique, correctly formatted invoice numbers.
- [ ] Exercise allowed and rejected invoice state transitions.
- [ ] Send an invoice with notify working, then with notify unavailable. Verify business and delivery statuses are accurate.
- [ ] Convert a lead, search/filter leads, and export CSV.
- [ ] Include lead fields beginning with spreadsheet formula characters and confirm the downloaded CSV opens as literal text, not executable formulas.
- [ ] Inspect incidents/outbox failures, retry an authorized event, and verify the audit trail.
- [ ] Verify long text, Bengali text, punctuation, and HTML-like input display correctly without entity corruption or unsafe HTML execution.

### 11.9 Responsive layout, accessibility, and motion

- [ ] Test public, admin, and portal pages at 320, 375, 768, 1024, and large desktop widths.
- [ ] Zoom to 200% and verify no critical content or controls are lost.
- [ ] Complete all primary workflows using only Tab, Shift+Tab, Enter, Space, arrow keys, and Escape.
- [ ] Confirm focus is always visible and modal/menu focus is contained/restored appropriately.
- [ ] Use VoiceOver on macOS/iOS or an equivalent screen reader for navigation landmarks, headings, forms, errors, dialogs, and live updates.
- [ ] Enable reduced motion and confirm conveyor, menus, chatbot, and transitions respect it.
- [ ] Test high contrast/color differentiation and ensure errors/selections are not communicated by color alone.

### 11.10 Resilience and operational behavior

- [ ] Stop PostgreSQL locally: liveness remains appropriate, readiness fails, forms fail honestly, and no recursive incident/log storm occurs.
- [ ] Stop notify capture: authentication fails within a bounded timeout; durable business events remain queued.
- [ ] Restart the application with queued events and confirm dispatch resumes without duplication.
- [ ] Apply all migrations to an empty database and to a representative previous-version snapshot.
- [ ] Verify health endpoints are not cached and expose no sensitive configuration.
- [ ] Confirm the UI displays the current commit/version where intended for operator diagnosis.

### 11.11 Safe post-deployment production smoke

Run only after the release command succeeds and explicit production-write approval is given.

- [ ] Confirm the deployed commit SHA matches the release manifest.
- [ ] Check liveness and readiness from outside Railway/Cloudflare.
- [ ] Open homepage, contact, admin login, portal login, one English content page, and one Bengali content page in a visible browser.
- [ ] Verify security headers and confirm internal routes do not load analytics.
- [ ] Confirm unknown content returns HTTP 404.
- [ ] Verify one authorized admin login and one portal login using designated production smoke accounts.
- [ ] If production writes are approved, submit one clearly labeled smoke lead and verify persistence plus notification, then archive it through the normal product workflow rather than deleting it directly.
- [ ] Confirm monitoring received the deployment annotation and no elevated errors appeared.
- [ ] Do not mark the deployment verified until browser, database, notify, and monitoring evidence are recorded.

### Manual test evidence template

For each manual run, record:

```text
Commit SHA:
Environment and URL:
Browser/version and viewport:
Scenario IDs completed:
Result: PASS / FAIL / BLOCKED
Database evidence (non-secret IDs/counts only):
Notify capture evidence:
Console/network errors:
Accessibility observations:
Screenshots/video paths:
Tester and timestamp:
Follow-up issue links:
```

---

## 12. Automated verification matrix

| Concern | Required automated evidence |
|---|---|
| Email identity | Normalization, duplicate migration, case-variant integration tests |
| MFA | First enrollment, confirmation, reset rejection, recovery one-time use, rate limiting |
| Magic links | Token redaction, clean redirect, single use, expiry, no analytics |
| Trusted devices | Creation, expiry, logout revocation, all-device revocation |
| Auth tickets | Concurrent single redemption and scope/expiry rejection |
| Authorization | Client A versus Client B read/write negative matrix |
| Forms | Valid success, complete persistence, invalid boundaries, outage, idempotency |
| Invoices | Relationship validation, concurrency, state machine, delivery status |
| Outbox | Transaction atomicity, retry, restart, idempotency, dead-letter |
| CSV | Formula-prefix neutralization and correct Unicode/quoting |
| Environment | Placeholder/shared-secret rejection and production-host test guard |
| Health | Liveness, readiness, timeout, schema mismatch, no-cache |
| Localization/SEO | Route existence, 404 status, canonical/hreflang/JSON-LD/date correctness |
| Accessibility | axe scans plus keyboard-focused component tests |
| Performance | Page budgets and production-build measurements |
| Release | Clean-state guard, SHA match, backup check, readiness timeout, rollback path |

---

## 13. Final deliverables checklist

### Code and schema

- [ ] Token-safe authentication callbacks and internal analytics exclusion.
- [ ] Canonical email identity and safe database migration.
- [ ] Authorized MFA state machine and reset flow.
- [ ] Trusted-device revocation and atomic AuthTicket redemption.
- [ ] Shared validated public-form contracts.
- [ ] Fixed quote, contact, demo, routing, 404, chatbot, and input encoding behavior.
- [ ] Tenant relationship enforcement and atomic invoice numbering/state transitions.
- [ ] Transactional outbox and independent incident alerting.
- [ ] Liveness, readiness, and version endpoints.
- [ ] Retention/cleanup jobs and privacy-supporting workflows.
- [ ] SEO/i18n/accessibility/performance corrections.

### Tests

- [ ] Green unit/integration suite with zero teardown/open-handle errors.
- [ ] Critical-path coverage thresholds.
- [ ] Complete authenticated E2E suite with no `test.fixme` release blockers.
- [ ] Production-build browser suite across required engines/viewports.
- [ ] Tenant-negative, concurrency, outage, retry, accessibility, SEO, and performance gates.

### Local CI/CD and operations

- [ ] Pinned runtime and clean-install pipeline.
- [ ] Isolated PostgreSQL and notify test services.
- [ ] `npm run check:fast` and versioned pre-push hook.
- [ ] `npm run ci:local` with fail-closed production guards.
- [ ] `npm run release:prod` with explicit confirmation and immutable SHA.
- [ ] Health-gated Railway configuration.
- [ ] Backup, isolated restore drill, rollback, migration, incident, and secret-rotation runbooks.
- [ ] Independent uptime/error alerting.
- [ ] CI and release evidence artifacts keyed by commit SHA.

### Product and compliance

- [ ] Final English and Bengali privacy/cookie content.
- [ ] Processor, retention, deletion, analytics, and push-token behavior documented and implemented.
- [ ] Legal review recorded.
- [ ] Email-domain authentication verified.
- [ ] Manual browser matrix and production smoke evidence completed.

---

## 14. Final release decision record

Do not replace this with a vague “looks good.” Complete it for the first production-ready release and retain it with the release artifacts.

```text
Release commit SHA:
Release tag:
Local CI artifact:
Local CI result and timestamp:
Dependency audit result and timestamp:
Migration plan reviewed by:
Backup ID/timestamp (masked):
Last successful restore drill:
Previous deployment rollback target:
Readiness result:
Automated production smoke result:
Manual browser result:
Monitoring/alert confirmation:
Known accepted risks and owner:
Production-write confirmation by:
Final decision: GO / NO-GO
Decision timestamp:
```

The release is **NO-GO by default** if any P0/P1 item, required test, restore proof, rollback target, readiness check, or manual browser gate is incomplete.
