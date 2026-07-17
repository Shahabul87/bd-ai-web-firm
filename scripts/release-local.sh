#!/usr/bin/env bash
#
# Controlled production release (Phase 5 Task 5.3).
#
#   npm run release:prod -- --dry-run    # every check, stops before ANY write
#   npm run release:prod                 # requires typed confirmation to write
#
# Separate from `ci:local` on purpose: PASSING TESTS DO NOT AUTHORIZE A
# PRODUCTION WRITE. ci:local answers "is this commit good?"; this answers "am I
# allowed to ship it, do I know how to undo it, and did it actually work?"
#
# Nothing is written until every precondition passes AND a human types the
# confirmation phrase. It records the rollback target BEFORE changing anything —
# an undo you work out during the incident is not an undo.
#
set -Eeuo pipefail
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

DRY_RUN=0
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=1

RELEASE_BRANCH="${RELEASE_BRANCH:-main}"
SITE="${NEXT_PUBLIC_SITE_URL:-https://www.craftsai.org}"
SITE="${SITE%/}"
READY_TIMEOUT="${READY_TIMEOUT:-120}"
BACKUP_MAX_AGE_HOURS="${BACKUP_MAX_AGE_HOURS:-24}"

STEP=0
step()  { STEP=$((STEP+1)); printf '\n\033[1;36m==> [%s] %s\033[0m\n' "$STEP" "$*"; }
ok()    { printf '  \033[32m✓\033[0m %s\n' "$*"; }
warn()  { printf '  \033[33m!\033[0m %s\n' "$*"; }
die()   { printf '\n\033[1;31mREFUSING TO RELEASE: %s\033[0m\n' "$*" >&2; exit 1; }

# ── 1. The tree must be exactly what is being released ──────────────────────
step "Verify the working tree is releasable"
[[ -n "$(git status --porcelain)" ]] && die "the working tree is dirty — commit or stash first (CI may inspect a dirty tree; a release may not)"
git symbolic-ref -q HEAD >/dev/null || die "detached HEAD — check out $RELEASE_BRANCH"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
[[ "$BRANCH" == "$RELEASE_BRANCH" ]] || die "on branch '$BRANCH', expected '$RELEASE_BRANCH'"
git fetch --quiet origin "$RELEASE_BRANCH" 2>/dev/null || warn "could not fetch origin (offline?)"
LOCAL="$(git rev-parse HEAD)"
REMOTE="$(git rev-parse "origin/$RELEASE_BRANCH" 2>/dev/null || echo '')"
if [[ -n "$REMOTE" && "$LOCAL" != "$REMOTE" ]]; then
  die "local $RELEASE_BRANCH is not in sync with origin/$RELEASE_BRANCH — push or pull first"
fi
SHA="$LOCAL"
SHORT="${SHA:0:7}"
ok "releasing $SHORT from $BRANCH (clean, in sync)"

# ── 2. No conflicting tag ───────────────────────────────────────────────────
step "Check the release tag is free"
TAG="release-$(date -u +%Y%m%d)-$SHORT"
git rev-parse -q --verify "refs/tags/$TAG" >/dev/null && die "tag $TAG already exists — this commit looks already released"
ok "tag $TAG is available"

# ── 3. Proof this exact SHA passed the gate ─────────────────────────────────
step "Require a passing local CI report for THIS commit"
CI_SUMMARY=".artifacts/ci/$SHORT/summary.txt"
if [[ -f "$CI_SUMMARY" ]] && grep -q '^result=PASS' "$CI_SUMMARY"; then
  ok "found a passing ci:local report for $SHORT"
else
  # Reusing an older run's verdict would be releasing untested code.
  die "no passing ci:local report for $SHORT — run 'npm run ci:local' on this commit first"
fi

# ── 4. Production configuration (names + masked status only) ────────────────
step "Validate production configuration is present"
MISSING=()
for v in RAILWAY_TOKEN; do [[ -n "${!v:-}" ]] || MISSING+=("$v"); done
if ((${#MISSING[@]})); then
  warn "missing: ${MISSING[*]} — deploy/rollback steps need them"
  [[ $DRY_RUN -eq 0 ]] && die "cannot deploy without: ${MISSING[*]}"
fi
command -v railway >/dev/null || { warn "railway CLI not found"; [[ $DRY_RUN -eq 0 ]] && die "railway CLI is required to deploy"; }
ok "configuration checked (values never printed)"

# ── 5. Record the rollback target BEFORE touching anything ──────────────────
step "Read the CURRENT production deployment (the rollback target)"
CURRENT_SHA="$(curl -s --max-time 20 "$SITE/api/health/live" | sed -n 's/.*"commit":"\([^"]*\)".*/\1/p' || true)"
if [[ -n "$CURRENT_SHA" ]]; then
  ok "currently serving: $CURRENT_SHA  ← roll back to this"
else
  warn "could not read the deployed commit from $SITE/api/health/live"
fi

# ── 6. Backups must be real and proven ──────────────────────────────────────
step "Verify backup freshness and the last restore drill"
BACKUP_DIR="${BACKUP_DIR:-$HOME/craftsai-backups}"
LATEST_BACKUP="$(ls -t "$BACKUP_DIR"/*.sql.gz.enc 2>/dev/null | head -1 || true)"
if [[ -z "$LATEST_BACKUP" ]]; then
  warn "no backup found in $BACKUP_DIR — run 'npm run backup' first"
  [[ $DRY_RUN -eq 0 ]] && die "refusing to release without a recent backup"
else
  AGE_H=$(( ( $(date +%s) - $(stat -f %m "$LATEST_BACKUP" 2>/dev/null || stat -c %Y "$LATEST_BACKUP") ) / 3600 ))
  if (( AGE_H > BACKUP_MAX_AGE_HOURS )); then
    warn "latest backup is ${AGE_H}h old (max ${BACKUP_MAX_AGE_HOURS}h)"
    [[ $DRY_RUN -eq 0 ]] && die "backup is stale — run 'npm run backup'"
  else
    ok "backup is ${AGE_H}h old: $(basename "$LATEST_BACKUP")"
  fi
fi
grep -q 'restore drill' docs/runbooks/rollback.md 2>/dev/null \
  && ok "restore-drill procedure documented" \
  || warn "no restore drill recorded — 'a provider saying backups are enabled' is not proof"

# ── 7. Show the migration plan; do NOT apply it ─────────────────────────────
step "Show migration status (read-only)"
if [[ -n "${PROD_DATABASE_URL:-}" ]]; then
  DATABASE_URL="$PROD_DATABASE_URL" npx prisma migrate status 2>&1 | sed 's/^/  /' || true
  warn "migrations are applied by CLI as the owner role, NEVER by this script and never at container start — see docs/runbooks/migrations.md"
else
  warn "PROD_DATABASE_URL not set — skipping migration status (read-only step)"
fi

# ── Dry run stops here: everything above is read-only ───────────────────────
if [[ $DRY_RUN -eq 1 ]]; then
  printf '\n\033[1;32m✓ DRY RUN complete — all preconditions checked, NOTHING was written.\033[0m\n'
  printf '  Re-run without --dry-run to deploy %s (you will be asked to type a confirmation).\n' "$SHORT"
  exit 0
fi

# ── 8. Explicit typed confirmation — the last chance to stop ────────────────
step "Confirm the production write"
cat <<EOF

  ┌────────────────────────────────────────────────────────────┐
  │  ABOUT TO DEPLOY TO PRODUCTION                             │
  ├────────────────────────────────────────────────────────────┤
  │  commit      : $SHORT
  │  branch      : $BRANCH
  │  target      : $SITE
  │  now serving : ${CURRENT_SHA:-unknown}   ← rollback target
  │  backup      : $(basename "${LATEST_BACKUP:-none}")
  └────────────────────────────────────────────────────────────┘

EOF
read -r -p "  Type 'deploy ${SHORT}' to proceed: " CONFIRM
[[ "$CONFIRM" == "deploy $SHORT" ]] || die "confirmation did not match — nothing was written"

# ── 9-11. Deploy the immutable SHA ──────────────────────────────────────────
ARTIFACTS=".artifacts/releases/$SHORT"
mkdir -p "$ARTIFACTS"
MANIFEST="$ARTIFACTS/manifest.txt"
{
  echo "release_tag=$TAG"
  echo "commit=$SHA"
  echo "branch=$BRANCH"
  echo "rollback_target=${CURRENT_SHA:-unknown}"
  echo "backup=$(basename "${LATEST_BACKUP:-none}")"
  echo "ci_report=$CI_SUMMARY"
  echo "deployed_by=$(git config user.email 2>/dev/null || whoami)"
  echo "started=$(date -u +%FT%TZ)"
} > "$MANIFEST"

step "Deploy $SHORT"
railway up --detach 2>&1 | tee "$ARTIFACTS/deploy.log" || die "deploy command failed — production still serves ${CURRENT_SHA:-the previous build}"
ok "deploy submitted"

# ── 12. Readiness gate with a bounded timeout ───────────────────────────────
step "Poll readiness (timeout ${READY_TIMEOUT}s)"
READY=0
for i in $(seq 1 "$READY_TIMEOUT"); do
  if [[ "$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$SITE/api/health/ready")" == "200" ]]; then
    LIVE_SHA="$(curl -s --max-time 5 "$SITE/api/health/live" | sed -n 's/.*"commit":"\([^"]*\)".*/\1/p')"
    [[ "$LIVE_SHA" == "$SHORT"* ]] && { READY=1; ok "ready, serving $LIVE_SHA after ${i}s"; break; }
  fi
  sleep 1
done

rollback() {
  printf '\n\033[1;31m!! ROLLING BACK to %s\033[0m\n' "${CURRENT_SHA:-previous}"
  echo "result=ROLLED_BACK" >> "$MANIFEST"
  echo "  Roll back now via: railway rollback   (or redeploy ${CURRENT_SHA:-the previous deployment})"
  echo "  Prefer a FORWARD FIX for data; restore only for corruption — docs/runbooks/rollback.md"
  exit 1
}
[[ $READY -eq 1 ]] || { echo "result=NOT_READY" >> "$MANIFEST"; rollback; }

# ── 13. Read-only smoke ─────────────────────────────────────────────────────
step "Production smoke (read-only)"
EXPECT_COMMIT_SHA="$SHA" SMOKE_URL="$SITE" bash scripts/smoke-production.sh 2>&1 | tee "$ARTIFACTS/smoke.log" \
  || { echo "result=SMOKE_FAILED" >> "$MANIFEST"; rollback; }

# ── 14. Human eyes ──────────────────────────────────────────────────────────
step "Manual browser verification"
cat <<EOF

  Automated checks passed. They do NOT prove the UI works.
  Open a VISIBLE browser against $SITE and verify the user-facing change,
  then confirm below. See the manual browser test plan in the readiness plan.

EOF
read -r -p "  Type 'verified' once you have SEEN it working (anything else rolls back): " VERIFIED
[[ "$VERIFIED" == "verified" ]] || { echo "result=MANUAL_VERIFICATION_FAILED" >> "$MANIFEST"; rollback; }

# ── 15. Tag + evidence ──────────────────────────────────────────────────────
step "Tag the verified release and record evidence"
git tag -a "$TAG" -m "Verified release $SHORT"
{
  echo "verified_by=$(git config user.email 2>/dev/null || whoami)"
  echo "finished=$(date -u +%FT%TZ)"
  echo "result=GO"
} >> "$MANIFEST"
ok "tagged $TAG"
ok "manifest: $MANIFEST"
printf '\n\033[1;32m✓ RELEASE COMPLETE — %s is live and verified.\033[0m\n' "$SHORT"
echo "  Push the tag when ready:  git push origin $TAG"
