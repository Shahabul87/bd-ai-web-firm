#!/usr/bin/env node
/**
 * READ-ONLY duplicate-email report (Phase 1 Task 1.2).
 *
 * Groups User and Client rows by their NORMALIZED email (lower(btrim(email)))
 * and prints any group with more than one row. This is the audit that MUST run
 * before a unique constraint on the normalized email can be added — auto-merging
 * production identities is forbidden, so a human reviews these and merges
 * manually first.
 *
 * Usage:
 *   DATABASE_URL=... node scripts/report-duplicate-emails.mjs
 *   npm run report:dup-emails
 *
 * Exits 0 with "no duplicates" (safe to add uniqueness) or 1 if any exist.
 * Prints only ids, created-at, and the normalized email — no secrets.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function groupDuplicates(table) {
  // Parameterless, read-only aggregate. Table name is a trusted literal.
  const rows = await prisma.$queryRawUnsafe(
    `SELECT lower(btrim(email)) AS norm, count(*)::int AS n,
            array_agg(id ORDER BY "createdAt") AS ids
     FROM "${table}"
     GROUP BY 1
     HAVING count(*) > 1
     ORDER BY n DESC, norm ASC`,
  );
  return rows;
}

async function main() {
  let total = 0;
  for (const table of ['User', 'Client']) {
    let rows;
    try {
      rows = await groupDuplicates(table);
    } catch (err) {
      console.error(`Skipping ${table}: ${err.message}`);
      continue;
    }
    console.log(`\n=== ${table} — normalized-email duplicates: ${rows.length} group(s) ===`);
    for (const r of rows) {
      total += 1;
      console.log(`  ${r.norm}  (${r.n} rows)  ids: ${r.ids.join(', ')}`);
    }
    if (rows.length === 0) console.log('  none');
  }

  if (total > 0) {
    console.log(
      `\n${total} duplicate group(s) found. Merge these manually BEFORE adding a ` +
        `unique constraint on the normalized email. Do NOT delete or auto-merge.`,
    );
    process.exitCode = 1;
  } else {
    console.log('\nNo duplicates. Safe to proceed with the normalizedEmail uniqueness migration.');
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
