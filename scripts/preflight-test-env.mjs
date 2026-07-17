#!/usr/bin/env node
/**
 * CLI wrapper for the fail-closed test-environment guard (Phase 4 Task 4.3).
 *
 * Run by scripts/ci-local.sh before ANY step that can write. Exits non-zero and
 * prints only variable names + a derived status — never a value — so the output
 * is safe to paste into an issue.
 *
 *   node scripts/preflight-test-env.mjs
 */
import { inspectTestEnv, formatChecks } from './lib/test-env-guard.mjs';

const { ok, failures } = inspectTestEnv(process.env);

console.log('=== test environment preflight (values never printed) ===');
console.log(formatChecks(process.env));

if (!ok) {
  console.error('\nREFUSING TO RUN — the environment is not safe for test writes:');
  for (const f of failures) console.error(`  ✗ ${f}`);
  console.error('\nNo database connection was attempted.');
  process.exit(1);
}

console.log('\n✓ environment is an isolated test environment — safe to proceed');
