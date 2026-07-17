#!/usr/bin/env bash
#
# Restore drill (Phase 5 Task 5.4).
#
#   BACKUP_PASSPHRASE=… npm run restore:drill -- ~/craftsai-backups/<file>.sql.gz.enc
#
# "The provider says backups are enabled" is not evidence. A backup is only real
# once it has been RESTORED and counted. This proves it.
#
# SAFETY: restores ONLY into a brand-new, local, throwaway database whose name it
# generates itself. It cannot be pointed at an existing database, and it never
# reads DATABASE_URL — so it cannot overwrite dev or production even by mistake.
#
set -Eeuo pipefail
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

ARCHIVE="${1:-}"
KEY="${BACKUP_PASSPHRASE:-}"
# A dedicated throwaway container — never the dev DB (5438) or the CI DB (5439).
DRILL_CONTAINER="craftsai-restore-drill"
DRILL_PORT="${DRILL_PORT:-5440}"
DRILL_DB="craftsai_restore_drill_$(date -u +%Y%m%d%H%M%S)"

[[ -n "$ARCHIVE" ]] || { echo "usage: npm run restore:drill -- <encrypted-backup-file>" >&2; exit 1; }
[[ -f "$ARCHIVE" ]] || { echo "no such backup: $ARCHIVE" >&2; exit 1; }
[[ -n "$KEY" ]] || { echo "BACKUP_PASSPHRASE is not set" >&2; exit 1; }
command -v docker >/dev/null || { echo "docker is required" >&2; exit 1; }

START=$(date +%s)
cleanup() {
  local rc=$?
  echo
  echo "=== cleanup ==="
  docker rm -f "$DRILL_CONTAINER" >/dev/null 2>&1 || true
  echo "  drill database destroyed (it only ever existed for this run)"
  exit $rc
}
trap cleanup EXIT INT TERM

echo "=== restore drill ==="
echo "  archive : $ARCHIVE"
echo "  target  : throwaway $DRILL_DB on localhost:$DRILL_PORT (isolated)"

echo
echo "--- starting a clean, empty Postgres ---"
docker rm -f "$DRILL_CONTAINER" >/dev/null 2>&1 || true
docker run -d --name "$DRILL_CONTAINER" \
  -e POSTGRES_USER=drill -e POSTGRES_PASSWORD=drill -e POSTGRES_DB="$DRILL_DB" \
  -p "$DRILL_PORT:5432" --tmpfs /var/lib/postgresql/data postgres:16 >/dev/null
for i in $(seq 1 60); do
  docker exec "$DRILL_CONTAINER" pg_isready -U drill -d "$DRILL_DB" >/dev/null 2>&1 && break
  [[ $i -eq 60 ]] && { echo "drill database never became ready" >&2; exit 1; }
  sleep 1
done
echo "  ready"

echo
echo "--- decrypting + restoring ---"
DRILL_URL="postgresql://drill:drill@localhost:$DRILL_PORT/$DRILL_DB"
if ! openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -pass env:BACKUP_PASSPHRASE -in "$ARCHIVE" \
     | gzip -dc \
     | docker exec -i "$DRILL_CONTAINER" psql -q -U drill -d "$DRILL_DB" -v ON_ERROR_STOP=1 >/tmp/restore-drill.log 2>&1; then
  echo "  RESTORE FAILED — see /tmp/restore-drill.log" >&2
  tail -20 /tmp/restore-drill.log >&2
  exit 1
fi
echo "  restored"

echo
echo "--- integrity: row counts in the RESTORED database ---"
# A restore that produces an empty schema is a failed restore that looks fine.
TOTAL=0
for t in User Client Project Invoice Lead AuditLog; do
  n=$(docker exec "$DRILL_CONTAINER" psql -U drill -d "$DRILL_DB" -tAc \
      "SELECT count(*) FROM \"$t\"" 2>/dev/null || echo "ERR")
  printf '  %-10s %s\n' "$t" "$n"
  [[ "$n" =~ ^[0-9]+$ ]] && TOTAL=$((TOTAL + n))
done

echo
echo "--- migration state in the restored database ---"
docker exec "$DRILL_CONTAINER" psql -U drill -d "$DRILL_DB" -tAc \
  "SELECT count(*) FROM \"_prisma_migrations\" WHERE finished_at IS NULL AND rolled_back_at IS NULL" \
  2>/dev/null | sed 's/^/  unfinished migrations: /' || echo "  _prisma_migrations: MISSING"

DUR=$(( $(date +%s) - START ))
echo
if [[ "$TOTAL" -eq 0 ]]; then
  echo "✗ DRILL FAILED: the restore produced no rows — this backup would not save you." >&2
  exit 1
fi
echo "✓ DRILL PASSED in ${DUR}s — $TOTAL rows restored."
echo
echo "Record in docs/runbooks/rollback.md:"
echo "  date=$(date -u +%FT%TZ) archive=$(basename "$ARCHIVE") duration=${DUR}s rows=$TOTAL"
