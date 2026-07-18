// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

/**
 * Fail-closed DATABASE_URL neutralization (Phase 4 Task 4.3).
 *
 * next/jest loads .env into the test process, so every `npm test` run inherits
 * the DEVELOPER'S DATABASE_URL (craftsai_dev — verified). Today the suite is
 * safe only because every test remembers to mock `../db`; a single forgotten
 * mock would silently read and write real dev data, and the same mechanism
 * would point at production on a machine whose .env holds production creds.
 *
 * Tests must be PHYSICALLY unable to reach a non-test database, not merely
 * trusted to. Unless DATABASE_URL already points at an approved test database
 * (the integration project sets this, guarded by scripts/preflight-test-env.mjs),
 * it is replaced with an unroutable sentinel. Mocked unit tests never notice;
 * an unmocked one fails loudly with an obvious host instead of quietly mutating
 * the dev database.
 */
const APPROVED_TEST_DB = /^craftsai_(ci|test)[a-z0-9_]*$/i

function databaseName(url) {
  try {
    return new URL(url).pathname.replace(/^\//, '')
  } catch {
    return ''
  }
}

const url = process.env.DATABASE_URL
if (url && !APPROVED_TEST_DB.test(databaseName(url))) {
  process.env.DATABASE_URL =
    'postgresql://blocked:blocked@jest-refused-non-test-database.invalid:1/blocked'
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}
