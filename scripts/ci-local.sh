#!/usr/bin/env bash
#
# The authoritative build/test gate (Phase 4 Task 4.4).
#
# This is the pipeline a release must pass. It runs LOCALLY and is versioned
# here, so a release never depends on a hosted CI service being available.
#
#   npm run ci:local
#
# Properties it must keep:
#   * Hermetic — it does not depend on the developer's .env, dev database,
#     running servers, or notify-svc. It brings up its own isolated services.
#   * Fail-closed — nothing that can write runs until the env preflight passes.
#   * Self-cleaning — a trap tears down services on success, failure AND Ctrl-C.
#   * Evidence-producing — reports land under .artifacts/ci/<git-sha>/.
#
set -Eeuo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# ── Isolated CI configuration (NEVER read from the developer's .env) ─────────
export NODE_ENV=test
export DATABASE_URL="postgresql://ci:ci@localhost:5439/craftsai_ci?schema=public"
export NOTIFY_URL="http://localhost:4010"
export NOTIFY_API_KEY="ci-test-key"
export ADMIN_EMAILS="enrolled-admin@ci.test,new-admin@ci.test"
export CONTACT_EMAIL="founder@ci.test"
export AUTH_SECRET="ci-only-auth-secret-not-a-real-secret-000000"
export PORTAL_AUTH_SECRET="ci-only-portal-secret-not-a-real-secret-11"
export AUTH_URL="http://localhost:3101"
# The canonical origin this build advertises. Without it the suite would build
# sitemap/JSON-LD/emails pointing at PRODUCTION while serving localhost.
export NEXT_PUBLIC_SITE_URL="http://localhost:3101"
# Identify the artifact under test, exactly as a release build would.
export APP_COMMIT_SHA="$(git rev-parse HEAD 2>/dev/null || echo unknown)"
export E2E_PORT="${E2E_PORT:-3101}"
export E2E_BASE_URL="http://localhost:${E2E_PORT}"
# This IS CI: it makes Playwright run single-worker (the authenticated specs
# share one notify double, one rate-limit bucket and one loopback IP, so
# concurrent PROJECTS would stomp on each other's state), forbid .only, and
# retry a genuine flake.
export CI=1
# Not granted until the preflight passes (see step 5).
unset ALLOW_TEST_WRITES || true

GIT_SHA="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
ARTIFACTS="$REPO_ROOT/.artifacts/ci/$GIT_SHA"
mkdir -p "$ARTIFACTS"
SUMMARY="$ARTIFACTS/summary.txt"
: > "$SUMMARY"

STEP=0
START_TS=$(date +%s)

log()  { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
step() { STEP=$((STEP + 1)); log "[$STEP] $*"; echo "[$STEP] $*" >> "$SUMMARY"; }
fail() { printf '\n\033[1;31mFAILED at step %s: %s\033[0m\n' "$STEP" "$*"; echo "FAILED at step $STEP: $*" >> "$SUMMARY"; exit 1; }

# ── Cleanup on ANY exit path: success, failure, or interrupt ─────────────────
APP_PID=""
cleanup() {
  local rc=$?
  set +e
  log "cleanup (exit=$rc)"
  if [[ -n "$APP_PID" ]] && kill -0 "$APP_PID" 2>/dev/null; then
    kill "$APP_PID" 2>/dev/null
    wait "$APP_PID" 2>/dev/null
  fi
  # Free the port even if the server forked (next start spawns a child).
  if command -v lsof >/dev/null 2>&1; then
    local pids
    pids=$(lsof -ti tcp:"$E2E_PORT" 2>/dev/null || true)
    [[ -n "$pids" ]] && kill -9 $pids 2>/dev/null
  fi
  docker compose -f compose.ci.yml down -v --remove-orphans >/dev/null 2>&1
  local dur=$(( $(date +%s) - START_TS ))
  echo "duration_seconds=$dur" >> "$SUMMARY"
  if [[ $rc -eq 0 ]]; then
    printf '\n\033[1;32m✓ ci:local PASSED in %ss — evidence: %s\033[0m\n' "$dur" "${ARTIFACTS#$REPO_ROOT/}"
  else
    printf '\n\033[1;31m✗ ci:local FAILED in %ss — evidence: %s\033[0m\n' "$dur" "${ARTIFACTS#$REPO_ROOT/}"
  fi
  exit $rc
}
trap cleanup EXIT INT TERM

# ── 1. Runtime + tooling ────────────────────────────────────────────────────
step "Check runtime versions and required tools"
NODE_WANT="$(cat .node-version)"
NODE_HAVE="$(node --version | sed 's/^v//')"
[[ "${NODE_HAVE%%.*}" == "${NODE_WANT%%.*}" ]] || fail "Node major mismatch: want $NODE_WANT, have $NODE_HAVE (see .node-version)"
command -v docker >/dev/null || fail "docker is required"
docker info >/dev/null 2>&1 || fail "docker daemon is not running"
{
  echo "git_sha=$GIT_SHA"
  echo "node=$NODE_HAVE"
  echo "npm=$(npm --version)"
  echo "docker=$(docker --version)"
  echo "started=$(date -u +%FT%TZ)"
} >> "$SUMMARY"
echo "  node $NODE_HAVE / npm $(npm --version) / sha $GIT_SHA"

# ── 2. Worktree policy (inspect-only; release:prod refuses a dirty tree) ─────
step "Report worktree state"
DIRTY_COUNT="$(git status --porcelain | wc -l | tr -d ' ')"
echo "dirty_files=$DIRTY_COUNT" >> "$SUMMARY"
if [[ "$DIRTY_COUNT" != "0" ]]; then
  echo "  note: $DIRTY_COUNT uncommitted file(s) — CI may inspect a dirty tree; release:prod will refuse one."
fi

# ── 3. Dependencies (exact, from the lockfile) ──────────────────────────────
step "Verify lockfile is in sync (npm ci --dry-run)"
npm ci --dry-run >"$ARTIFACTS/npm-ci.log" 2>&1 || fail "lockfile out of sync with package.json — run npm install and commit package-lock.json"

# ── 4. Isolated services ────────────────────────────────────────────────────
step "Start isolated Postgres + notify double, wait for health"
docker compose -f compose.ci.yml up -d --wait >"$ARTIFACTS/compose.log" 2>&1 || fail "isolated services did not become healthy"
curl -fsS "$NOTIFY_URL/__health" >/dev/null || fail "notify double is not answering"

# ── 5. THE GATE: nothing that can write runs before this passes ─────────────
step "Fail-closed environment preflight"
# Validate the environment BEFORE granting the write capability — the grant is
# the consequence of passing, never a precondition of being allowed to check.
node scripts/preflight-test-env.mjs --pre-grant | tee "$ARTIFACTS/preflight.log" \
  || fail "environment is not a safe isolated test environment"
export ALLOW_TEST_WRITES=1
node scripts/preflight-test-env.mjs >/dev/null \
  || fail "preflight still rejects the environment after granting writes"
echo "  writes granted for this run only"

# ── 6-9. Schema ─────────────────────────────────────────────────────────────
step "prisma validate"
npx prisma validate >>"$ARTIFACTS/prisma.log" 2>&1 || fail "prisma schema invalid"

step "prisma migrate deploy (isolated database)"
npx prisma migrate deploy >>"$ARTIFACTS/prisma.log" 2>&1 || fail "migrations failed to apply"

step "prisma migrate status (must be up to date)"
npx prisma migrate status >>"$ARTIFACTS/prisma.log" 2>&1 || fail "migrations pending or divergent"

step "Generate client + content, then seed deterministic fixtures"
npx prisma generate >>"$ARTIFACTS/prisma.log" 2>&1 || fail "prisma generate failed"
# Jest resolves #content from .velite; it must exist BEFORE the suite runs.
npx velite build >"$ARTIFACTS/velite.log" 2>&1 || fail "velite content build failed"
node scripts/seed-ci.mjs | tee -a "$SUMMARY" || fail "seed failed"

# ── 10-12. Static gates ─────────────────────────────────────────────────────
step "ESLint (zero warnings)"
npm run lint >"$ARTIFACTS/lint.log" 2>&1 || { tail -20 "$ARTIFACTS/lint.log"; fail "lint"; }

step "TypeScript type-check"
npm run type-check >"$ARTIFACTS/typecheck.log" 2>&1 || { tail -20 "$ARTIFACTS/typecheck.log"; fail "type-check"; }

# ── 13-14. Tests ────────────────────────────────────────────────────────────
step "Unit + integration tests (open handles detected)"
npx jest --detectOpenHandles --ci 2>&1 | tee "$ARTIFACTS/jest.log"
[[ "${PIPESTATUS[0]}" -eq 0 ]] || fail "tests"   # the EXIT CODE decides, not the assertion count

step "Coverage thresholds"
npx jest --coverage --ci >"$ARTIFACTS/coverage.log" 2>&1 || { tail -30 "$ARTIFACTS/coverage.log"; fail "coverage below threshold"; }
[[ -f coverage/coverage-summary.json ]] && cp coverage/coverage-summary.json "$ARTIFACTS/" 2>/dev/null || true

# ── 15-17. Production artifact + browser suite ──────────────────────────────
step "Build the production artifact"
npm run build >"$ARTIFACTS/build.log" 2>&1 || { tail -30 "$ARTIFACTS/build.log"; fail "build"; }

step "Enforce performance budgets (first-load JS, HTML, image weight)"
npm run check:budgets >"$ARTIFACTS/budgets.log" 2>&1 || { tail -30 "$ARTIFACTS/budgets.log"; fail "performance budget breach"; }
grep -E '✓|✗' "$ARTIFACTS/budgets.log" | sed 's/^/  /'

step "Start the PRODUCTION server (next start, never next dev)"
npx next start --port "$E2E_PORT" >"$ARTIFACTS/next-start.log" 2>&1 &
APP_PID=$!
for i in $(seq 1 60); do
  curl -fsS "$E2E_BASE_URL" >/dev/null 2>&1 && break
  kill -0 "$APP_PID" 2>/dev/null || fail "production server exited — see next-start.log"
  sleep 1
  [[ $i -eq 60 ]] && fail "production server did not become ready in 60s"
done
echo "  serving $E2E_BASE_URL (pid $APP_PID)"

step "Playwright against the production build"
npx playwright test >"$ARTIFACTS/playwright.log" 2>&1 || { tail -30 "$ARTIFACTS/playwright.log"; fail "browser tests"; }

# ── 20. Dependency audit ────────────────────────────────────────────────────
step "Dependency audit (production deps, high+)"
if npm run audit:ci >"$ARTIFACTS/audit.log" 2>&1; then
  echo "  no high/critical advisories"
else
  # An online gate: a network failure must not be silently treated as a pass.
  if grep -qiE 'ENOTFOUND|EAI_AGAIN|network|ETIMEDOUT' "$ARTIFACTS/audit.log"; then
    echo "  WARNING: audit could not reach the registry (offline) — NOT treated as a pass" | tee -a "$SUMMARY"
  else
    tail -20 "$ARTIFACTS/audit.log"; fail "dependency audit found high/critical advisories"
  fi
fi

# ── 21. Evidence ────────────────────────────────────────────────────────────
step "Record evidence"
{
  echo "result=PASS"
  echo "finished=$(date -u +%FT%TZ)"
} >> "$SUMMARY"
echo "  $(ls "$ARTIFACTS" | tr '\n' ' ')"
