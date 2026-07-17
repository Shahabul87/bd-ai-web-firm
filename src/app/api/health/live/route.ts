import { NextResponse } from 'next/server';
import { versionInfo } from '@/app/lib/version';

export const runtime = 'nodejs';
// Health must reflect THIS instant, never a cached response — a cached 200
// would keep reporting healthy after the process started failing.
export const dynamic = 'force-dynamic';

/**
 * LIVENESS — "is this process alive and is its event loop responsive?"
 *
 * Deliberately touches NOTHING: no database, no notify-svc, no disk. That is
 * the whole point of separating it from readiness. If liveness consulted the
 * database, a brief database outage would look like a dead process and the
 * platform would restart a perfectly healthy container — turning a recoverable
 * dependency blip into an outage.
 *
 * Restart policy should watch this. Traffic gating should watch /ready.
 */
export async function GET() {
  return NextResponse.json(
    { status: 'ok', ...versionInfo() },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    },
  );
}
