import 'server-only';

/**
 * Central observability / incident-reporting hook.
 *
 * The app deliberately keeps several helpers fail-open (audit, notify, lead
 * persistence) so a background failure never breaks the user-facing action.
 * That is correct, but it means failures MUST be surfaced somewhere. This module
 * is the single funnel: it always emits a structured error log, and — when a
 * sink is configured via `OBSERVABILITY_WEBHOOK_URL` — best-effort forwards the
 * event to an external collector (Logtail / Axiom / Datadog / Slack webhook /
 * Sentry ingest, etc.). It is complete and production-ready; it simply stays a
 * pure structured log until that env var is set. It never throws.
 */

const WEBHOOK = () => process.env.OBSERVABILITY_WEBHOOK_URL ?? '';

export type Severity = 'error' | 'warn';

export interface ReportContext {
  severity?: Severity;
  meta?: Record<string, unknown>;
}

/**
 * Report an operational error/incident. Always logs a single structured line;
 * forwards to the configured webhook when present. Never throws.
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

  // Structured single-line log — never include secret values in meta.
  (severity === 'warn' ? console.warn : console.error)(`[incident] ${JSON.stringify(event)}`);

  const url = WEBHOOK();
  if (!url) return;
  // Fire-and-forget; a monitoring outage must not affect the request.
  void fetch(url, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  }).catch(() => {
    /* swallow — reporting the reporter would loop */
  });
}
