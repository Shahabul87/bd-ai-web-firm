#!/usr/bin/env bash
#
# Encrypted logical backup (Phase 5 Task 5.4).
#
#   BACKUP_DATABASE_URL='postgresql://…' npm run backup
#
# Off-provider by design: a provider-managed snapshot is worthless if the
# provider account itself is the thing you have lost. This writes an encrypted
# dump you hold.
#
# NEVER prints a credential. The URL is passed to pg_dump via the environment,
# never on the command line, where it would be visible in `ps`.
#
set -Eeuo pipefail
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

URL="${BACKUP_DATABASE_URL:-}"
OUT_DIR="${BACKUP_DIR:-$HOME/craftsai-backups}"
KEY="${BACKUP_PASSPHRASE:-}"

if [[ -z "$URL" ]]; then
  echo "BACKUP_DATABASE_URL is not set." >&2
  echo "Get it WITHOUT printing it, e.g.:" >&2
  echo "  export BACKUP_DATABASE_URL=\$(railway run --service Postgres -- printenv DATABASE_PUBLIC_URL | tail -1)" >&2
  exit 1
fi
if [[ -z "$KEY" ]]; then
  # An unencrypted dump of client and invoice data must not sit on a laptop.
  echo "BACKUP_PASSPHRASE is not set — refusing to write an UNENCRYPTED backup." >&2
  exit 1
fi
command -v pg_dump >/dev/null || { echo "pg_dump not found (brew install libpq)"; exit 1; }
command -v openssl >/dev/null || { echo "openssl not found"; exit 1; }

DB_NAME="$(printf '%s' "$URL" | sed -E 's|.*/([^/?]+)(\?.*)?$|\1|')"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$OUT_DIR"
chmod 700 "$OUT_DIR"
FILE="$OUT_DIR/craftsai-${DB_NAME}-${STAMP}.sql.gz.enc"

echo "=== backup ==="
echo "  database : $DB_NAME (host masked)"
echo "  target   : $FILE"

# --no-owner/--no-acl so the dump can restore into a fresh drill database owned
# by a different role.
PGPASSWORD_SET=1 \
  pg_dump --dbname="$URL" --no-owner --no-acl --format=plain \
  | gzip -9 \
  | openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -salt -pass env:BACKUP_PASSPHRASE \
  > "$FILE"

chmod 600 "$FILE"
SIZE="$(du -h "$FILE" | cut -f1)"
echo "  size     : $SIZE"

# A dump that cannot be decrypted is not a backup. Prove it round-trips NOW,
# not during an incident.
if openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -pass env:BACKUP_PASSPHRASE -in "$FILE" \
   | gzip -dc | head -c 200 | grep -q 'PostgreSQL database dump'; then
  echo "  verify   : decrypts and looks like a pg_dump ✓"
else
  echo "  verify   : FAILED — the artifact does not decrypt to a dump" >&2
  exit 1
fi

echo
echo "✓ backup written. Record the ID/timestamp (masked) in the release manifest."
echo "  A backup is NOT proven until scripts/restore-drill.sh has restored it."
