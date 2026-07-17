/**
 * @jest-environment node
 *
 * Phase 5 Task 5.1 — liveness/readiness. Production currently returns 404 for
 * /api/health, so there is nothing for a platform health check or an uptime
 * monitor to watch.
 */
jest.mock('@/app/lib/db', () => ({ prisma: { $queryRaw: jest.fn() } }));

import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/db';
import { GET as liveGET } from '../live/route';
import { GET as readyGET } from '../ready/route';

const queryRaw = prisma.$queryRaw as unknown as jest.Mock;

const req = (headers: Record<string, string> = {}) =>
  new NextRequest(new URL('https://x/api/health/ready'), { headers });

/** ready calls SELECT 1 then the migration count, in that order. */
function mockHealthy() {
  queryRaw.mockReset();
  queryRaw.mockResolvedValueOnce([{ '?column?': 1 }]).mockResolvedValueOnce([{ n: BigInt(0) }]);
}

describe('liveness', () => {
  it('is ok and touches NO dependency', async () => {
    queryRaw.mockReset();
    const res = await liveGET();
    expect(res.status).toBe(200);
    expect((await res.json()).status).toBe('ok');
    // The whole point: a database blip must not be reported as a dead process,
    // or the platform restarts a healthy container.
    expect(queryRaw).not.toHaveBeenCalled();
  });

  it('is never cached', async () => {
    const res = await liveGET();
    expect(res.headers.get('cache-control')).toMatch(/no-store/);
  });

  it('reports the running commit so a deploy can be confirmed', async () => {
    const body = await (await liveGET()).json();
    expect(body).toHaveProperty('commit');
    expect(body).toHaveProperty('uptimeSeconds');
  });
});

describe('readiness', () => {
  it('is 200 with every check ok', async () => {
    mockHealthy();
    const res = await readyGET(req());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ready');
    expect(body.checks).toEqual({ database: 'ok', migrations: 'ok' });
  });

  it('is 503 when the database is unreachable', async () => {
    queryRaw.mockReset();
    queryRaw.mockRejectedValue(new Error("Can't reach database server at prod-host:5432"));
    const res = await readyGET(req());
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.status).toBe('not_ready');
    expect(body.checks.database).toBe('fail');
  });

  it('is 503 when a migration is unfinished/failed (the P3009 trap)', async () => {
    queryRaw.mockReset();
    queryRaw
      .mockResolvedValueOnce([{ '?column?': 1 }]) // database is fine…
      .mockResolvedValueOnce([{ n: BigInt(1) }]); // …but a migration never finished
    const res = await readyGET(req());
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.checks.database).toBe('ok');
    expect(body.checks.migrations).toBe('fail');
  });

  it('is 503 when _prisma_migrations does not exist at all', async () => {
    queryRaw.mockReset();
    queryRaw
      .mockResolvedValueOnce([{ '?column?': 1 }])
      .mockRejectedValueOnce(new Error('relation "_prisma_migrations" does not exist'));
    expect((await readyGET(req())).status).toBe(503);
  });

  it('is never cached', async () => {
    mockHealthy();
    const res = await readyGET(req());
    expect(res.headers.get('cache-control')).toMatch(/no-store/);
  });
});

describe('readiness does not leak diagnostics', () => {
  const OLD = process.env.HEALTH_DETAIL_TOKEN;
  afterEach(() => {
    if (OLD === undefined) delete process.env.HEALTH_DETAIL_TOKEN;
    else process.env.HEALTH_DETAIL_TOKEN = OLD;
  });

  it('hides the error text from an anonymous caller', async () => {
    process.env.HEALTH_DETAIL_TOKEN = 'secret-token';
    queryRaw.mockReset();
    queryRaw.mockRejectedValue(new Error("Can't reach database server at prod-db.internal:5432"));

    const body = await (await readyGET(req())).json();
    // Component status is safe to publish; the host behind the failure is not.
    expect(body.checks.database).toBe('fail');
    expect(body.details).toBeUndefined();
    expect(JSON.stringify(body)).not.toContain('prod-db.internal');
  });

  it('shows details to an internal caller holding the token', async () => {
    process.env.HEALTH_DETAIL_TOKEN = 'secret-token';
    queryRaw.mockReset();
    queryRaw.mockRejectedValue(new Error("Can't reach database server at prod-db.internal:5432"));

    const body = await (await readyGET(req({ 'x-health-detail-token': 'secret-token' }))).json();
    expect(body.details.database).toContain('prod-db.internal');
  });

  it('never shows details when no token is configured, even if one is sent', async () => {
    delete process.env.HEALTH_DETAIL_TOKEN;
    queryRaw.mockReset();
    queryRaw.mockRejectedValue(new Error('boom at prod-db.internal'));
    const body = await (await readyGET(req({ 'x-health-detail-token': '' }))).json();
    expect(body.details).toBeUndefined();
  });
});
