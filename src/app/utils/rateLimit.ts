/**
 * Best-effort in-memory rate limiter, keyed by IP address.
 *
 * ⚠️ SERVERLESS LIMITATION: this Map lives in a single process. On serverless
 * platforms (Vercel/Netlify) each instance and each cold start has its own Map,
 * so limits are NOT shared across instances and reset on scale-down. It still
 * blocks naive single-source floods, but it is NOT a robust abuse control.
 *
 * For production-grade limiting shared across instances, back this with a
 * central store (Upstash Redis / Vercel KV) using TTL keys — swap the body of
 * checkRateLimit() to INCR + EXPIRE against that store. The honeypot + input
 * validation in each route remain the primary spam defenses.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Opportunistic cleanup: prune expired entries when the map grows, so a
// long-lived process (e.g. `next start`) does not leak memory. No timers —
// setInterval never fires reliably in a frozen serverless runtime.
const MAX_ENTRIES_BEFORE_SWEEP = 10_000;

function sweepExpired(now: number): void {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

interface RateLimitOptions {
  maxRequests: number;  // Maximum requests allowed
  windowMs: number;     // Time window in milliseconds
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number;      // Seconds until reset
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { maxRequests: 5, windowMs: 60 * 1000 }
): RateLimitResult {
  const now = Date.now();

  if (rateLimitStore.size > MAX_ENTRIES_BEFORE_SWEEP) {
    sweepExpired(now);
  }

  const entry = rateLimitStore.get(identifier);

  // If no entry or window expired, create new entry
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + options.windowMs,
    });
    return {
      success: true,
      remaining: options.maxRequests - 1,
      resetIn: Math.ceil(options.windowMs / 1000),
    };
  }

  // Increment count
  entry.count++;

  // Check if over limit
  if (entry.count > options.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetIn: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  return {
    success: true,
    remaining: options.maxRequests - entry.count,
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
  };
}

/**
 * Get client IP from request headers.
 * Note: trusts x-forwarded-for / x-real-ip — only reliable behind a trusted
 * proxy (Vercel sets these). Returns 'unknown' if absent, so all
 * header-less callers share one bucket (fail-closed-ish for spam).
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  return 'unknown';
}
