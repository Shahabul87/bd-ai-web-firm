import 'server-only';
import { Prisma } from '@prisma/client';
import { prisma } from './db';
import { redactMeta } from './redact';

/**
 * Self-hosted observability / incident reporting — runs entirely on our own
 * infrastructure, no third-party error-tracking service.
 *
 * The app keeps several helpers fail-open (audit, notify, lead persistence) so a
 * background failure never breaks the user-facing action. That is correct, but
 * failures MUST be visible. This module is the single funnel; for every incident
 * it:
 *   1. emits a structured error log,
 *   2. records the incident to our OWN Postgres (`Incident` table), surfaced at
 *      /admin/incidents, and
 *   3. optionally POSTs it to `OBSERVABILITY_WEBHOOK_URL` — which points at an
 *      endpoint WE own (e.g. a notify-svc hook), not a rented SaaS.
 * It never throws, and DB/webhook failures here never recurse into reporting.
 */

const WEBHOOK = () => process.env.OBSERVABILITY_WEBHOOK_URL ?? '';

/** A hung collector must never stall the caller. */
const WEBHOOK_TIMEOUT_MS = 5000;

export type Severity = 'error' | 'warn';

export interface ReportContext {
  severity?: Severity;
  meta?: Record<string, unknown>;
  /**
   * Correlation id tying this incident to the request, its logs, and any outbox
   * event it produced, so an operator can follow one failure across all three.
   */
  requestId?: string;
}

/**
 * Report an operational error/incident. Always logs; persists to our Postgres;
 * forwards to a self-owned webhook when configured. Never throws. The DB write
 * is fire-and-forget (we run as a long-lived server, so it completes).
 */
export function reportError(scope: string, error: unknown, ctx: ReportContext = {}): void {
  const severity = ctx.severity ?? 'error';
  const message = error instanceof Error ? error.message : String(error);
  // Redact centrally at the sink: callers must not be trusted to remember, and a
  // single `meta: { token }` would otherwise persist auth material in plaintext.
  const meta = redactMeta(
    ctx.requestId ? { ...(ctx.meta ?? {}), requestId: ctx.requestId } : ctx.meta,
  );
  const event = {
    ts: new Date().toISOString(),
    level: severity,
    scope,
    message,
    ...(meta ? { meta } : {}),
  };

  // 1. Structured single-line log — never include secret values in meta.
  (severity === 'warn' ? console.warn : console.error)(`[incident] ${JSON.stringify(event)}`);

  // 2. Persist to our own Postgres. Best-effort: if THIS write fails (e.g. the
  //    DB is the very thing that's down), swallow — do NOT re-report (would loop).
  //    Wrapped in try/catch so reportError never throws, even on a synchronous
  //    failure (client not ready / rejected promise).
  try {
    void prisma.incident
      .create({
        data: {
          scope,
          severity: severity === 'warn' ? 'WARN' : 'ERROR',
          message,
          meta: meta ? (meta as Prisma.InputJsonValue) : Prisma.JsonNull,
        },
      })
      .catch((e) => {
        console.error('reportError: incident persist failed:', e instanceof Error ? e.message : 'unknown');
      });
  } catch {
    /* never let incident persistence break the caller */
  }

  // 3. Forward to a self-owned collector/webhook. This is the INDEPENDENT alert
  //    path: a plain HTTP POST that touches neither Postgres nor the admin UI,
  //    so it still reaches the operator when the database is the thing that is
  //    down (exactly when step 2 above cannot work).
  const url = WEBHOOK();
  if (!url) return;
  void fetch(url, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
    signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
  }).catch(() => {
    /* swallow — reporting the reporter would loop */
  });
}

export interface IncidentRow {
  id: string;
  scope: string;
  severity: 'WARN' | 'ERROR';
  message: string;
  meta: unknown;
  createdAt: Date;
}

/** Read recent incidents for the admin dashboard. */
export async function listIncidents(opts: { take?: number; scope?: string } = {}): Promise<IncidentRow[]> {
  const rows = await prisma.incident.findMany({
    where: opts.scope ? { scope: opts.scope } : undefined,
    orderBy: { createdAt: 'desc' },
    take: opts.take ?? 200,
  });
  return rows as IncidentRow[];
}

/**
 * Count incidents for the dashboard header, WITHIN A WINDOW.
 *
 * This used to count every incident ever recorded, so the number only grew and
 * an operator could not tell "3 problems right now" from "3 problems last
 * quarter". Defaults to the last 24 hours; pass `sinceHours: 0` for all time.
 */
export async function countIncidents(
  opts: { severity?: 'WARN' | 'ERROR'; sinceHours?: number } = {},
): Promise<number> {
  const sinceHours = opts.sinceHours ?? 24;
  return prisma.incident.count({
    where: {
      ...(opts.severity ? { severity: opts.severity } : {}),
      ...(sinceHours > 0 ? { createdAt: { gte: new Date(Date.now() - sinceHours * 3_600_000) } } : {}),
    },
  });
}
