#!/usr/bin/env bash
#
# READ-ONLY production smoke test (Phase 5 Task 5.3).
#
#   npm run smoke:prod                      # against NEXT_PUBLIC_SITE_URL
#   SMOKE_URL=https://staging.example.com npm run smoke:prod
#
# Every request here is a GET. It never submits a form, never writes, and never
# logs in. A production WRITE is a separate, explicitly-confirmed decision (see
# docs/runbooks/release.md), because a smoke test that quietly creates a lead is
# a smoke test nobody trusts to run.
#
# Exits non-zero on the first failed expectation so `release:prod` can gate on it.
#
set -Eeuo pipefail
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

BASE="${SMOKE_URL:-${NEXT_PUBLIC_SITE_URL:-https://www.craftsai.org}}"
BASE="${BASE%/}"
EXPECT_SHA="${EXPECT_COMMIT_SHA:-}"

PASS=0
FAIL=0
ok()   { printf '  \033[32m✓\033[0m %s\n' "$*"; PASS=$((PASS+1)); }
bad()  { printf '  \033[31m✗\033[0m %s\n' "$*"; FAIL=$((FAIL+1)); }

status() { curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$1"; }
body()   { curl -s --max-time 20 "$1"; }

echo "=== production smoke (read-only) — $BASE ==="

# ── Health ──────────────────────────────────────────────────────────────────
c=$(status "$BASE/api/health/live")
[[ "$c" == "200" ]] && ok "liveness 200" || bad "liveness returned $c"

c=$(status "$BASE/api/health/ready")
[[ "$c" == "200" ]] && ok "readiness 200 (database + migrations healthy)" || bad "readiness returned $c — NOT serving safely"

# ── The deployed build is the one we think it is ────────────────────────────
LIVE_BODY="$(body "$BASE/api/health/live")"
LIVE_SHA="$(printf '%s' "$LIVE_BODY" | sed -n 's/.*"commit":"\([^"]*\)".*/\1/p')"
if [[ -n "$EXPECT_SHA" ]]; then
  if [[ "$LIVE_SHA" == "${EXPECT_SHA:0:7}"* ]]; then
    ok "deployed commit $LIVE_SHA matches the release manifest"
  else
    # The classic failure: the deploy failed and the OLD container still serves,
    # so everything looks fine while the new code is nowhere.
    bad "deployed commit is $LIVE_SHA but the manifest says ${EXPECT_SHA:0:7} — the deploy did NOT take effect"
  fi
else
  ok "deployed commit: ${LIVE_SHA:-unknown} (no expected SHA supplied)"
fi

# ── Public pages ────────────────────────────────────────────────────────────
for path in "/" "/contact" "/quote" "/bn" "/admin/login" "/portal/login" "/sitemap.xml" "/robots.txt"; do
  c=$(status "$BASE$path")
  [[ "$c" == "200" ]] && ok "GET $path 200" || bad "GET $path returned $c"
done

# ── Unknown content must be a real 404, not a soft 200 ──────────────────────
c=$(status "$BASE/resources/blog/definitely-not-a-real-post-xyz")
[[ "$c" == "404" ]] && ok "unknown content returns a real 404" || bad "unknown content returned $c (soft 404?)"

# ── Security headers ────────────────────────────────────────────────────────
H="$(curl -sI --max-time 20 "$BASE/")"
grep -qi 'strict-transport-security' <<<"$H" && ok "HSTS present" || bad "HSTS missing"
grep -qi 'x-content-type-options: *nosniff' <<<"$H" && ok "nosniff present" || bad "nosniff missing"
grep -qi 'content-security-policy' <<<"$H" && ok "CSP present" || bad "CSP missing"

# ── Health must never be cached ─────────────────────────────────────────────
grep -qi 'no-store' <<<"$(curl -sI --max-time 20 "$BASE/api/health/ready")" \
  && ok "readiness is not cacheable" || bad "readiness is missing no-store"

# ── Internal routes must not load marketing analytics (Phase 1 Task 1.1) ────
if grep -qi 'googletagmanager' <<<"$(body "$BASE/admin/login")"; then
  bad "admin login loads Google Analytics — magic-link tokens could leak again"
else
  ok "admin login loads no marketing analytics"
fi
if grep -qi 'googletagmanager' <<<"$(body "$BASE/portal/login")"; then
  bad "portal login loads Google Analytics"
else
  ok "portal login loads no marketing analytics"
fi

# ── Readiness must not leak diagnostics to the public ───────────────────────
if grep -q '"details"' <<<"$(body "$BASE/api/health/ready")"; then
  bad "readiness exposes internal details publicly"
else
  ok "readiness exposes component status only"
fi

echo
if [[ $FAIL -gt 0 ]]; then
  printf '\033[31m✗ smoke FAILED — %s passed, %s failed\033[0m\n' "$PASS" "$FAIL"
  exit 1
fi
printf '\033[32m✓ smoke passed — %s checks against %s\033[0m\n' "$PASS" "$BASE"
