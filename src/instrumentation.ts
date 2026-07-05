/**
 * Next.js instrumentation hook — runs once when the server process starts,
 * before it serves any request. We use it to fail fast if the production
 * environment is missing required auth/database/notify secrets, so a
 * misconfigured deploy never boots into a half-broken auth state.
 */
export async function register(): Promise<void> {
  // Only the Node.js runtime has full access to process.env and can validate
  // Node-only secrets; the edge runtime intentionally skips this.
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnv } = await import('@/app/lib/env');
    validateEnv();
  }
}
