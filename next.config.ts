import type { NextConfig } from "next";
import { dirname } from "path";
import { fileURLToPath } from "url";
import createNextIntlPlugin from 'next-intl/plugin';

class VeliteWebpackPlugin {
  static started = false;
  apply(compiler: { hooks: { beforeCompile: { tapPromise: (name: string, fn: () => Promise<void>) => void } } }) {
    compiler.hooks.beforeCompile.tapPromise("VeliteWebpackPlugin", async () => {
      if (VeliteWebpackPlugin.started) return;
      VeliteWebpackPlugin.started = true;
      const dev = process.env.NODE_ENV === "development";
      const { build } = await import("velite");
      await build({ watch: dev, clean: !dev });
    });
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig: NextConfig = {
  /* config options here */
  // Fix for "multiple lockfiles" warning - explicitly set workspace root
  outputFileTracingRoot: __dirname,
  // These ship ESM-only (package.json "type": "module", no CJS export
  // condition). next/jest only transpiles node_modules packages listed here
  // (see next/dist/build/jest/jest.js) — without this, Jest's CJS require()
  // fails on their `export`/`import` syntax with "Unexpected token 'export'".
  // next-auth (plus its ESM-only deps @auth/core, jose and oauth4webapi) are
  // listed so the middleware test can exercise the real admin auth gate rather
  // than a mock of it — a mocked gate could not catch a lockout regression.
  // (@formatjs/* arrive via next-intl/middleware's locale negotiation.)
  transpilePackages: [
    'next-intl',
    'next-auth',
    '@auth/core',
    'jose',
    'oauth4webapi',
    '@formatjs/intl-localematcher',
    '@formatjs/fast-memoize',
  ],
  // ESLint is enforced during builds — the codebase is lint-clean, so a new
  // error should fail the build rather than ship silently.
  async redirects() {
    return [
      {
        source: '/blog',
        destination: '/resources/blog',
        permanent: true,
      },
      {
        source: '/blog/:slug',
        destination: '/resources/blog/:slug',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Content Security Policy - Tightened for better security.
          // TODO(csp-hardening): 'unsafe-inline' for scripts/styles remains for
          // initial compatibility (Next.js inline bootstrap + Tailwind). Plan to
          // migrate to per-request nonces/hashes before broad public launch.
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // gstatic = Firebase messaging SW; googletagmanager = GA.
              `script-src 'self' 'unsafe-inline' https://www.gstatic.com https://www.googletagmanager.com${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ""}`,
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data: fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              // FCM token/registration/messaging + GA collect endpoints.
              "connect-src 'self' https://fcmregistrations.googleapis.com https://fcm.googleapis.com https://firebaseinstallations.googleapis.com https://www.googleapis.com https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com",
              "worker-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; ')
          },
          // Add HTTPS enforcement
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // (X-XSS-Protection intentionally removed: the legacy header is
          // obsolete in modern browsers and superseded by the CSP above.)
          // Referrer policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Permissions policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          }
        ]
      }
    ];
  },
  webpack(config) {
    config.plugins.push(new VeliteWebpackPlugin());
    return config;
  },
};

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl(nextConfig);
