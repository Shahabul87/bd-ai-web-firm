# Runbook — Admin MFA recovery (Phase 1 Task 1.3)

Email access alone can no longer reset an enrolled admin's second factor
(`enroll-totp` rejects already-enrolled accounts with 409). The supported ways
back in, in order of preference:

1. **Recovery code** — at the authenticator prompt, choose "Use a recovery code"
   and enter one of the one-time codes issued at enrollment. Each works once.

2. **Administrator recovery (out-of-band, audited)** — only when the admin has
   lost BOTH the authenticator and all recovery codes. This is a deliberate
   manual step:
   - Confirm the requester's identity out-of-band (not via the email being reset).
   - In notify-svc, delete/rotate that user_ref's TOTP secret and recovery codes.
   - In the app database, clear the flag so the next login re-enrolls:
     ```sql
     UPDATE "User" SET "totpEnrolled" = false WHERE lower(btrim(email)) = lower(btrim('<email>'));
     ```
   - Record who performed the reset and why. The next successful login will
     create a fresh pending secret, confirm it, and issue new recovery codes;
     the `mfa.enroll.start` / `mfa.enroll.confirm` audit events will show it.

> All production DB writes require explicit operator confirmation. Never auto-run
> the reset from application code — it must be a human, audited action.

## Audit events emitted by this flow

- `mfa.enroll.start` — a not-enrolled account began enrollment.
- `mfa.enroll.confirm` — enrollment confirmed with a valid TOTP (recovery codes issued).
- `mfa.enroll.confirm.fail` — bad confirmation code.
- `mfa.enroll.blocked` — an already-enrolled account tried to re-enroll (blocked).
- `mfa.success` / `mfa.recovery.success` / `mfa.fail` — normal MFA outcomes.

No secrets, TOTP codes, or recovery codes are ever written to the audit log.
