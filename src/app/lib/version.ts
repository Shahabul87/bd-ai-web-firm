/**
 * The running build's identity (Phase 5 Task 5.2).
 *
 * Every health response carries this so an operator can answer "is the thing
 * I just deployed actually the thing that is serving?" without guessing — and
 * so the release script can verify the deployed SHA matches the manifest it
 * just tagged.
 *
 * A commit SHA is NOT a secret; it must never be confused with one. Nothing
 * here reads a credential.
 */

/**
 * Resolved at build time where possible. Railway exposes the SHA it built from;
 * `scripts/release-local.sh` also injects APP_COMMIT_SHA so a local/production
 * build is identifiable even off-platform.
 */
export const COMMIT_SHA =
  process.env.APP_COMMIT_SHA ??
  process.env.RAILWAY_GIT_COMMIT_SHA ??
  process.env.NEXT_PUBLIC_COMMIT_SHA ??
  'unknown';

/** Short form for logs and health payloads. */
export const COMMIT_SHA_SHORT = COMMIT_SHA === 'unknown' ? 'unknown' : COMMIT_SHA.slice(0, 7);

/** When this process started — lets an operator spot a crash-loop. */
const STARTED_AT = Date.now();

export function uptimeSeconds(): number {
  return Math.floor((Date.now() - STARTED_AT) / 1000);
}

export interface VersionInfo {
  commit: string;
  startedAt: string;
  uptimeSeconds: number;
}

export function versionInfo(): VersionInfo {
  return {
    commit: COMMIT_SHA_SHORT,
    startedAt: new Date(STARTED_AT).toISOString(),
    uptimeSeconds: uptimeSeconds(),
  };
}
