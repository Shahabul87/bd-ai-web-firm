import { prisma } from '@/app/lib/db';
import { reportError } from '@/app/lib/report';

/**
 * Rate limiter backed by our OWN Postgres (no third-party service).
 *
 * A single atomic upsert (`INSERT ... ON CONFLICT`) maintains one fixed-window
 * counter per key in the `RateLimit` table, so limits are shared across every
 * app instance and cold start — which the per-instance in-memory Map below
 * cannot do. If Postgres is unreachable, or the table does not exist yet (e.g.
 * before the migration is applied), we fall back to the in-memory limiter rather
 * than failing a legitimate request. The honeypot + input validation in each
 * route remain the primary spam defenses.
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

// Opportunistic prune of expired Postgres rows — no cron needed. Fire-and-forget
// roughly every N calls so the table cannot grow unbounded.
let callsSincePrune = 0;
const PRUNE_EVERY = 500;

function maybePruneExpired(): void {
  callsSincePrune += 1;
  if (callsSincePrune < PRUNE_EVERY) return;
  callsSincePrune = 0;
  void prisma.rateLimit
    .deleteMany({ where: { expiresAt: { lt: new Date() } } })
    .catch(() => {
      /* best-effort cleanup — never affects the request */
    });
}

/**
 * Atomic fixed-window limit in our Postgres. Returns `null` (so the caller falls
 * back to the in-memory limiter) on any DB error — including the table not
 * existing yet — so a limiter-store problem never blocks a real request.
 */
async function checkRateLimitDb(
  identifier: string,
  options: RateLimitOptions,
): Promise<RateLimitResult | null> {
  try {
    // One atomic statement: start a new window (count=1) if none exists or the
    // current one has expired, else increment. RETURNING gives us the post-op
    // count and the window end for `resetIn`.
    const rows = await prisma.$queryRaw<Array<{ count: number; expiresAt: Date }>>`
      INSERT INTO "RateLimit" ("key", "count", "expiresAt")
      VALUES (${identifier}, 1, now() + (${options.windowMs} * interval '1 millisecond'))
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN "RateLimit"."expiresAt" < now() THEN 1
          ELSE "RateLimit"."count" + 1
        END,
        "expiresAt" = CASE
          WHEN "RateLimit"."expiresAt" < now() THEN now() + (${options.windowMs} * interval '1 millisecond')
          ELSE "RateLimit"."expiresAt"
        END
      RETURNING "count", "expiresAt";
    `;

    const row = rows[0];
    if (!row) return null;

    const count = Number(row.count);
    const resetIn = Math.max(
      1,
      Math.ceil((new Date(row.expiresAt).getTime() - Date.now()) / 1000),
    );

    maybePruneExpired();

    if (count > options.maxRequests) {
      return { success: false, remaining: 0, resetIn };
    }
    return { success: true, remaining: Math.max(0, options.maxRequests - count), resetIn };
  } catch (err) {
    // Includes "relation RateLimit does not exist" before the migration runs.
    reportError('ratelimit.db', err, { severity: 'warn', meta: { identifier } });
    return null;
  }
}

/**
 * Check (and consume) one unit of the rate limit for `identifier`. Uses the
 * shared Postgres backend, falling back to the in-memory limiter on any error.
 */
export async function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { maxRequests: 5, windowMs: 60 * 1000 },
): Promise<RateLimitResult> {
  const shared = await checkRateLimitDb(identifier, options);
  return shared ?? checkRateLimitMemory(identifier, options);
}

/** Reject spoofed/garbage values before they are used as a rate-limit bucket. */
function isValidIp(ip: string): boolean {
  const v4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ip);
  if (v4) return v4.slice(1).every((o) => Number(o) <= 255);
  // Loose IPv6 sanity check (hex groups + at least one colon); rejects header
  // injection and arbitrary strings without a full RFC parser.
  return /^[0-9a-fA-F:]+:[0-9a-fA-F:]*$/.test(ip);
}

/**
 * Best-trusted client IP behind Cloudflare → Railway.
 *
 * `CF-Connecting-IP` is set by Cloudflare to the real client IP and OVERWRITES
 * any client-supplied value, so it is trustworthy at the edge. `x-real-ip` is
 * set by Railway's proxy. `x-forwarded-for` is client-appendable, so its
 * left-most value is used only as a last resort. The chosen value is validated;
 * an invalid/absent IP falls back to the shared 'unknown' bucket (fail-closed
 * for spam) rather than trusting a spoofable string.
 */
export function getClientIP(request: Request): string {
  const candidates = [
    request.headers.get('cf-connecting-ip'),
    request.headers.get('x-real-ip'),
    request.headers.get('x-forwarded-for')?.split(',')[0],
  ];
  for (const c of candidates) {
    const ip = c?.trim();
    if (ip && isValidIp(ip)) return ip;
  }
  return 'unknown';
}
