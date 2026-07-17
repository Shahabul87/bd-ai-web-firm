import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { versionInfo } from '@/app/lib/version';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** A hung dependency must not hang the health check itself. */
const CHECK_TIMEOUT_MS = 2000;

type CheckStatus = 'ok' | 'fail';

async function withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** Can we actually reach the database, right now? */
async function checkDatabase(): Promise<{ status: CheckStatus; detail?: string }> {
  try {
    await withTimeout(prisma.$queryRaw`SELECT 1`, CHECK_TIMEOUT_MS);
    return { status: 'ok' };
  } catch (err) {
    return { status: 'fail', detail: err instanceof Error ? err.message : 'unknown' };
  }
}

/**
 * Is the schema actually the one this build expects?
 *
 * A row in _prisma_migrations with finished_at NULL and rolled_back_at NULL is a
 * FAILED migration. Prisma then refuses every later migration (P3009), the
 * deploy fails, and the platform keeps serving the previous container — so the
 * app looks fine while every subsequent push silently does not ship. This has
 * bitten this project repeatedly, so readiness surfaces it instead of leaving it
 * to be discovered days later.
 */
async function checkMigrations(): Promise<{ status: CheckStatus; detail?: string }> {
  try {
    const rows = await withTimeout(
      prisma.$queryRaw<Array<{ n: bigint }>>`
        SELECT count(*) AS n FROM "_prisma_migrations"
        WHERE finished_at IS NULL AND rolled_back_at IS NULL
      `,
      CHECK_TIMEOUT_MS,
    );
    const unfinished = Number(rows[0]?.n ?? 0);
    return unfinished === 0
      ? { status: 'ok' }
      : { status: 'fail', detail: `${unfinished} unfinished/failed migration(s)` };
  } catch (err) {
    // A missing _prisma_migrations table means migrations never ran here.
    return { status: 'fail', detail: err instanceof Error ? err.message : 'unknown' };
  }
}

/**
 * READINESS — "can this instance safely serve core traffic?"
 *
 * Unlike liveness this DOES consult dependencies, with bounded timeouts. Gate
 * traffic on this; gate restarts on /live (see that route for why).
 *
 * The public body carries component STATUS only. Error text can name a host or
 * echo a connection string, so it is returned solely to a caller holding
 * HEALTH_DETAIL_TOKEN — an uptime monitor gets ok/fail, an operator gets the why.
 */
export async function GET(req: NextRequest) {
  const [database, migrations] = await Promise.all([checkDatabase(), checkMigrations()]);
  const ok = database.status === 'ok' && migrations.status === 'ok';

  const detailToken = process.env.HEALTH_DETAIL_TOKEN;
  const isInternal =
    Boolean(detailToken) && req.headers.get('x-health-detail-token') === detailToken;

  const body: Record<string, unknown> = {
    status: ok ? 'ready' : 'not_ready',
    ...versionInfo(),
    checks: { database: database.status, migrations: migrations.status },
  };
  if (isInternal) {
    body.details = {
      database: database.detail ?? 'ok',
      migrations: migrations.detail ?? 'ok',
    };
  }

  return NextResponse.json(body, {
    // 503 so a platform health check and an uptime monitor both treat this
    // instance as out of rotation rather than serving broken traffic.
    status: ok ? 200 : 503,
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
  });
}
