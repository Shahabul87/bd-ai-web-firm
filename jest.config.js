const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you soon)
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@content/(.*)$': '<rootDir>/content/$1',
    // Velite's generated content manifest. Tests that validate internal links
    // against real content import it via this alias; it must be generated
    // (`npx velite`) before the suite runs — the local-CI script does this.
    '^#content$': '<rootDir>/.velite',
    // server-only throws outside a server bundle; no-op it under Jest.
    '^server-only$': '<rootDir>/__mocks__/server-only.js',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
  /**
   * Coverage is a RATCHET on the paths that can lose money or leak a tenant —
   * not a global percentage to chase. Per the plan: "focused first on
   * authentication, authorization, lead routes, invoices, outbox, environment
   * validation, and tenant boundaries… do not chase global percentage with
   * low-value tests."
   *
   * Each number sits a few points UNDER the level actually achieved, so it
   * catches a real regression without failing on noise. Raise a line when its
   * path gets better — never lower one to make a build pass.
   */
  coverageThreshold: {
    // A floor, deliberately low. NOTE: Jest removes every explicitly-thresholded
    // path below from this pool, so "global" here means "everything EXCEPT the
    // critical paths" — i.e. mostly presentational UI, measured at ~18% lines.
    // (Overall repo coverage is ~27%.) Padding this with shallow render tests
    // would buy nothing; the numbers that matter are the per-path ones.
    global: { lines: 17, statements: 17, branches: 17, functions: 12 },

    // ── Identity & authentication ──
    './src/app/lib/normalizeEmail.ts': { lines: 100, branches: 100 },
    './src/app/lib/adminIdentity.ts': { lines: 100, branches: 85 },
    './src/app/lib/portalIdentity.ts': { lines: 100, branches: 100 },
    './src/app/lib/authTicket.ts': { lines: 100, branches: 80 },
    './src/app/lib/adminAuth.ts': { lines: 100, branches: 50 },
    './src/app/lib/portalLogin.ts': { lines: 100, branches: 70 },

    // ── Tenant boundaries & authorization ──
    './src/app/lib/tenantAuthz.ts': { lines: 85, branches: 100 },
    './src/app/lib/portal.ts': { lines: 100, branches: 100 },

    // ── Money ──
    './src/app/lib/invoices.ts': { lines: 72, branches: 55 },

    // ── Lead capture (revenue) ──
    './src/app/lib/leads.ts': { lines: 78, branches: 74 },
    './src/app/lib/formSchemas.ts': { lines: 100, branches: 65 },
    './src/app/lib/sanitize.ts': { lines: 88, branches: 100 },

    // ── Durable delivery, config, privacy ──
    './src/app/lib/outbox.ts': { lines: 88, branches: 85 },
    './src/app/lib/env.ts': { lines: 65, branches: 38 },
    './src/app/lib/redact.ts': { lines: 95, branches: 90 },
    './src/app/lib/retention.ts': { lines: 100, branches: 100 },
    './src/app/utils/rateLimit.ts': { lines: 85, branches: 74 },
  },
  // Playwright specs live in e2e/ and use @playwright/test, not Jest — keep Jest out.
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/', '<rootDir>/e2e/'],
  transform: {
    // Use babel-jest to transpile tests with the next/babel preset
    // https://jestjs.io/docs/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  // NOTE: transformIgnorePatterns is deliberately NOT set here — next/jest only
  // ever APPENDS a custom list to its own (jest.js:200-208), and Jest ORs those
  // patterns, so appending can only ever ignore MORE, never rescue a package.
  // See the override below instead.
}

/**
 * Packages that ship ESM-only ("type": "module", no CJS export condition), so
 * Jest's CJS require() throws "Cannot use import statement outside a module".
 *
 * next/jest derives its node_modules transform allowance from next.config.ts's
 * `transpilePackages` (jest.js:144). Routing these through that field would work,
 * but it would also drag them — including the `jose` and `oauth4webapi` crypto
 * libraries — through SWC into the *production* bundle purely for a test-only
 * benefit. Overwriting the resolved config below keeps the production build
 * untouched while still letting the middleware test exercise the REAL next-auth
 * gate rather than a mock (a mocked gate cannot catch a founder-lockout regression).
 *
 * `geist` mirrors next/jest's own DEFAULT_TRANSPILED_PACKAGES so this override
 * cannot silently diverge from the default it replaces.
 */
const ESM_ONLY_PACKAGES = [
  'next-intl', //          marketing i18n
  'use-intl', //           via next-intl (its React hooks live here)
  'next-auth', //          admin auth gate
  '@auth/core', //         via next-auth
  'jose', //               via @auth/core
  'oauth4webapi', //       via @auth/core
  '@formatjs', //          via next-intl/middleware locale negotiation
  'intl-messageformat', // via use-intl message compilation
  'geist', //              next/jest DEFAULT_TRANSPILED_PACKAGES
]

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = async () => {
  const config = await createJestConfig(customJestConfig)()
  const transpiled = ESM_ONLY_PACKAGES.join('|')
  // Mirrors next/jest's own construction, including its '/' -> '\+' escaping
  // for the pnpm store layout (jest.js:200).
  config.transformIgnorePatterns = [
    `/node_modules/(?!.pnpm)(?!(${transpiled})/)`,
    `/node_modules/.pnpm/(?!(${transpiled.replace(/\//g, '\\+')})@)`,
    '^.+\\.module\\.(css|sass|scss)$',
  ]
  return config
}