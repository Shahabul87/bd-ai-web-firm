#!/usr/bin/env bash
#
# Fast pre-push gate (Phase 4 Task 4.4).
#
#   npm run check:fast
#
# Deliberately NOT a substitute for `npm run ci:local`: it starts no containers
# and no server, so it cannot catch a migration, browser, or integration
# failure. Its job is to catch the cheap mistakes in seconds, before a push —
# ci:local remains the authoritative release gate.
#
set -Eeuo pipefail
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

START=$(date +%s)
log() { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }

log "ESLint (zero warnings)"
npm run lint

log "TypeScript type-check"
npm run type-check

log "Unit tests"
# The suite is fully mocked, so it needs neither a database nor containers.
npx jest --ci --silent

printf '\n\033[1;32m✓ check:fast passed in %ss — run `npm run ci:local` before releasing\033[0m\n' "$(( $(date +%s) - START ))"
