import 'server-only';
import { Prisma } from '@prisma/client';
import { prisma } from './db';

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

export type Severity = 'error' | 'warn';

export interface ReportContext {
  severity?: Severity;
  meta?: Record<string, unknown>;
}

/**
 * Report an operational error/incident. Always logs; persists to our Postgres;
 * forwards to a self-owned webhook when configured. Never throws. The DB write
 * is fire-and-forget (we run as a long-lived server, so it completes).
 */
export function reportError(scope: string, error: unknown, ctx: ReportContext = {}): void {
  const severity = ctx.severity ?? 'error';
  const message = error instanceof Error ? error.message : String(error);
  const event = {
    ts: new Date().toISOString(),
    level: severity,
    scope,
    message,
    ...(ctx.meta ? { meta: ctx.meta } : {}),
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
          meta: ctx.meta ? (ctx.meta as Prisma.InputJsonValue) : Prisma.JsonNull,
        },
      })
      .catch((e) => {
        console.error('reportError: incident persist failed:', e instanceof Error ? e.message : 'unknown');
      });
  } catch {
    /* never let incident persistence break the caller */
  }

  // 3. Optional forward to a self-owned collector/webhook.
  const url = WEBHOOK();
  if (!url) return;
  void fetch(url, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
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

/** Count recent incidents (optionally by severity) for the dashboard header. */
export async function countIncidents(opts: { severity?: 'WARN' | 'ERROR' } = {}): Promise<number> {
  return prisma.incident.count({ where: opts.severity ? { severity: opts.severity } : undefined });
}
