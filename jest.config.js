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
    // server-only throws outside a server bundle; no-op it under Jest.
    '^server-only$': '<rootDir>/__mocks__/server-only.js',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
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
  'next-auth', //          admin auth gate
  '@auth/core', //         via next-auth
  'jose', //               via @auth/core
  'oauth4webapi', //       via @auth/core
  '@formatjs', //          via next-intl/middleware locale negotiation
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