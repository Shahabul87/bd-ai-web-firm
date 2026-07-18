# Runbook — Rollback and restore

Two different things, with very different blast radii. Reach for the first one.

| | Application rollback | Database restore |
|---|---|---|
| Undoes | Code | Data |
| Cost | Seconds, reversible | Loses everything since the backup |
| Use when | The new build is broken | Data is corrupted or destroyed |
| Confirmation | Normal release judgement | **Explicit, deliberate, last resort** |

## 1. Application rollback (the usual answer)

`release:prod` records the rollback target *before* it changes anything —
`rollback_target` in `.artifacts/releases/<sha>/manifest.txt`.

```bash
railway rollback                      # previous deployment
# or redeploy a specific commit:
git checkout <rollback_target_sha> && railway up --detach
```

Confirm it took effect — this is the step people skip:

```bash
curl -s https://www.craftsai.org/api/health/live   # "commit" must be the OLD sha
npm run smoke:prod
```

> If the commit does **not** change, the rollback did not take. The platform may
> be refusing the deploy (health check failing, or a failed migration blocking
> it). Do not assume; look.

## 2. Prefer a forward fix for data

A restore throws away every lead, message and invoice created since the backup —
real customer work. Almost always the better move is a small, targeted fix:
correct the rows, deploy the fix, keep everything else.

Restore only for genuine corruption or destruction.

## 3. Database restore (last resort)

**Never** restore straight over production. Restore into an isolated database
first, confirm it holds what you expect, then decide.

```bash
BACKUP_PASSPHRASE=… npm run restore:drill -- ~/craftsai-backups/<file>.sql.gz.enc
```

That prints row counts and migration state from the restored copy. If the numbers
are wrong, the backup is not what you think it is — **find that out here, not
halfway through an incident.**

Only then, with explicit intent:

1. Announce/accept the data-loss window (everything after the backup timestamp).
2. Take a **fresh backup of the damaged database first** — it is evidence, and
   you may need to reconcile from it later.
3. Restore into a **new** database, point the app at it, verify, then cut over.
   Overwriting in place destroys your only evidence.

## 4. Restore drills — the only proof that matters

> "The provider says backups are enabled" is not evidence. A backup is a
> hypothesis until it has been restored.

Run one **monthly**, and after any change to the schema or backup tooling.

| Date | Archive | Duration | Rows restored | Result | By |
|---|---|---|---|---|---|
| _(none yet — see below)_ | | | | | |

> **OPERATOR ACTION — OUTSTANDING.** No restore drill has ever been run for this
> project. Until one has, the recovery plan is untested. Run `npm run backup`
> then `npm run restore:drill`, and record the row here.

## 5. Objectives (starting points — revise against real business impact)

- **RPO (data you can afford to lose): 24h** → so backups run at least daily.
- **RTO (time to be back): 2h** → so the drill must complete well inside that.

A drill that takes longer than the RTO means the RTO is fiction.

## 6. If backup credentials leak

1. Rotate the database credentials (Railway → Postgres → regenerate).
2. Rotate `BACKUP_PASSPHRASE`; old archives stay readable with the old
   passphrase — treat them as compromised and destroy them.
3. Take a fresh backup with the new passphrase and drill it.
4. Record the incident (`incident-response.md`).
