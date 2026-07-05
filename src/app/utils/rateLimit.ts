import { reportError } from '@/app/lib/report';

/**
 * Rate limiter with a distributed backend and an in-memory fallback.
 *
 * When `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` are set, limits are
 * enforced atomically in Redis (INCR + EXPIRE NX = a shared fixed window), so
 * they hold across serverless instances and cold starts. Without those env vars
 * — or if Redis is unreachable — it falls back to the best-effort in-memory
 * limiter below, which still blocks naive single-source floods within one
 * process. The honeypot + input validation in each route remain the primary
 * spam defenses.
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

/** In-memory fallback (single process). Synchronous, no external calls. */
function checkRateLimitMemory(
  identifier: string,
  options: RateLimitOptions,
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

const upstashUrl = () => process.env.UPSTASH_REDIS_REST_URL ?? '';
const upstashToken = () => process.env.UPSTASH_REDIS_REST_TOKEN ?? '';

/** True when a shared Redis backend is configured. */
export function isDistributedRateLimitEnabled(): boolean {
  return Boolean(upstashUrl() && upstashToken());
}

/**
 * Atomic fixed-window limit in Upstash Redis. Returns `null` (so the caller
 * falls back to the in-memory limiter) when unconfigured or on any Redis error —
 * we never fail a legitimate request just because the limiter store is down.
 */
async function checkRateLimitRedis(
  identifier: string,
  options: RateLimitOptions,
): Promise<RateLimitResult | null> {
  if (!isDistributedRateLimitEnabled()) return null;

  const windowSec = Math.max(1, Math.ceil(options.windowMs / 1000));
  const key = `rl:${identifier}`;

  try {
    // Pipeline: INCR (atomic counter), EXPIRE NX (set TTL only on the first hit
    // of the window → a true fixed window), PTTL (ms left for resetIn).
    const res = await fetch(`${upstashUrl()}/pipeline`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${upstashToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', key],
        ['EXPIRE', key, String(windowSec), 'NX'],
        ['PTTL', key],
      ]),
    });

    if (!res.ok) {
      reportError('ratelimit.redis', new Error(`upstash ${res.status}`), {
        severity: 'warn',
        meta: { status: res.status },
      });
      return null;
    }

    const data = (await res.json()) as Array<{ result?: number; error?: string }>;
    const count = Number(data[0]?.result ?? 0);
    let ttlMs = Number(data[2]?.result ?? options.windowMs);
    if (!Number.isFinite(ttlMs) || ttlMs < 0) ttlMs = options.windowMs;
    const resetIn = Math.max(1, Math.ceil(ttlMs / 1000));

    if (count > options.maxRequests) {
      return { success: false, remaining: 0, resetIn };
    }
    return { success: true, remaining: Math.max(0, options.maxRequests - count), resetIn };
  } catch (err) {
    reportError('ratelimit.redis', err, { severity: 'warn' });
    return null;
  }
}

/**
 * Check (and consume) one unit of the rate limit for `identifier`. Uses the
 * shared Redis backend when configured, otherwise the in-memory fallback.
 */
export async function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { maxRequests: 5, windowMs: 60 * 1000 },
): Promise<RateLimitResult> {
  const distributed = await checkRateLimitRedis(identifier, options);
  return distributed ?? checkRateLimitMemory(identifier, options);
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
