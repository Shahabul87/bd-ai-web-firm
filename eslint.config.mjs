import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    // `next lint` supplied these implicitly; the ESLint CLI that replaces it
    // (next lint is removed in Next 16) needs them stated. Without this the CLI
    // would try to lint build output and generated content.
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "coverage/**",
      ".artifacts/**", // local CI/release evidence
      ".velite/**", // generated content manifest
      // Playwright output: traces, screenshots and error-context dumps. These
      // are generated artifacts, not source — linting them reported thousands
      // of problems from minified bundles captured in traces.
      "test-results/**",
      "playwright-report/**",
      "blob-report/**",
      "playwright/.cache/**",
      "next-env.d.ts",
      "public/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Test files legitimately use require() for module-isolation with
    // jest.resetModules() + per-test env; the rule doesn't apply there.
    files: ["**/__tests__/**/*.ts", "**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    // CommonJS tooling configs at the repo root. `next lint` never looked at
    // these; the ESLint CLI does, and require() is correct in a .js CJS config.
    files: ["*.config.js", "jest.setup.js", "__mocks__/**/*.js"],
    languageOptions: { sourceType: "commonjs" },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-var-requires": "off",
    },
  },
];

export default eslintConfig;
