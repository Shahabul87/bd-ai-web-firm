import 'server-only';

/**
 * DEV-ONLY local challenge store, used ONLY when notify-svc is not configured
 * and NODE_ENV !== 'production'. It generates and logs a code so the admin
 * login flow can be exercised locally without the notify-svc tenant. It throws
 * if ever invoked in production.
 */
type Chal = { code: string; expires: number };

// globalThis-backed so the store is shared across separately-bundled route
// handlers in dev (same reason db.ts pins its PrismaClient to globalThis).
const g = globalThis as unknown as { __devAuthStore?: Map<string, Chal> };
const store = (g.__devAuthStore ??= new Map<string, Chal>());

function assertDev(): void {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('devAuth must never run in production');
  }
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

export function devChallenge(seed: string): { challengeId: string } {
  assertDev();
  const challengeId = `dev_${hash(seed) & 0xffff}_${Math.floor(Math.random() * 1e9)}`;
  const code = String(100000 + (Math.abs(hash(challengeId)) % 900000));
  store.set(challengeId, { code, expires: Date.now() + 5 * 60_000 });
  console.warn(`[devAuth] challenge ${challengeId} -> code ${code} (dev only)`);
  return { challengeId };
}

export function devVerify(challengeId: string, code: string): { ok: boolean } {
  assertDev();
  const c = store.get(challengeId);
  if (!c || Date.now() > c.expires) return { ok: false };
  const ok = c.code === code;
  if (ok) store.delete(challengeId);
  return { ok };
}
