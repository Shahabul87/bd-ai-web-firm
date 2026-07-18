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
  // NOTE: ESM-only packages (next-intl, next-auth and its crypto deps) do NOT
  // belong here. They only ever needed transpiling so Jest's CJS require() could
  // parse them; listing them here would drag them through SWC into the production
  // bundle for a test-only benefit. That allowance now lives in jest.config.js,
  // which overrides transformIgnorePatterns directly. Next bundles them fine.
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
      },
      {
        // Auth callback routes carry a magic-link token in the query string.
        // Never cache them, and never emit the token as a Referer to any
        // subresource. (History/URL scrubbing happens client-side on mount.)
        source: '/:path(admin/login/callback|portal/auth/callback)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
        ],
      },
    ];
  },
  webpack(config) {
    config.plugins.push(new VeliteWebpackPlugin());
    return config;
  },
};

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl(nextConfig);
