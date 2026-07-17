#!/usr/bin/env node
/**
 * notify-svc test double (Phase 4 Task 4.2).
 *
 * Stands in for the real notify-svc during `npm run ci:local` and manual local
 * testing. It NEVER sends anything: every request is recorded in memory and
 * exposed for assertions, so a test can prove "the founder alert was queued with
 * this subject" without an email reaching a real inbox.
 *
 * Deliberately dependency-free (node:http only) so it can run in a bare
 * node:22-alpine container with no install step.
 *
 * Endpoints mirrored from src/app/lib/notify.ts:
 *   POST /v1/notify                 email + push
 *   POST /v1/devices                device registration
 *   POST /v1/auth/challenge         -> { challenge_id }   (code is CAPTURED, not emailed)
 *   POST /v1/auth/verify            accepts the captured code/token
 *   POST /v1/auth/totp/{enroll,confirm,verify}
 *   POST /v1/auth/recovery/{generate,verify}
 *   POST /v1/auth/trust, /v1/auth/trust/check, /v1/auth/trust/revoke
 *
 * Test-support endpoints (prefixed __ so they cannot collide with notify-svc):
 *   GET  /__health                  readiness
 *   GET  /__captured                everything recorded
 *   GET  /__captured/latest?to=x    newest challenge for a recipient (code/token)
 *   POST /__reset                   clear captured state between scenarios
 */
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';

const PORT = Number(process.env.PORT ?? 4010);

/** Everything the app asked us to send. */
const captured = { notifications: [], devices: [], challenges: [], totp: [], trust: [] };
/** challengeId -> { to, code, token, method } */
const challenges = new Map();
/** user_ref -> { enrolled, confirmed, recoveryCodes } */
const totpState = new Map();
/** token -> user_ref */
const trustTokens = new Map();

const DETERMINISTIC_CODE = '123456';

const json = (res, status, body) => {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) });
  res.end(payload);
};

const readBody = (req) =>
  new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 1_000_000) req.destroy(); // bound memory
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });

const routes = {
  'POST /v1/notify': (b) => {
    captured.notifications.push({ ...b, at: new Date().toISOString() });
    return [200, { ok: true, id: randomUUID() }];
  },

  'POST /v1/devices': (b) => {
    captured.devices.push({ ...b, at: new Date().toISOString() });
    return [200, { ok: true }];
  },

  'POST /v1/auth/challenge': (b) => {
    const challenge_id = randomUUID();
    // A deterministic code keeps authenticated E2E tests readable; the token is
    // random so magic-link tests exercise a realistic opaque value.
    const entry = { to: b.to, method: b.method, code: DETERMINISTIC_CODE, token: randomUUID(), redirect: b.redirect };
    challenges.set(challenge_id, entry);
    captured.challenges.push({ challenge_id, ...entry, at: new Date().toISOString() });
    return [200, { challenge_id }];
  },

  'POST /v1/auth/verify': (b) => {
    const entry = challenges.get(b.challenge_id);
    if (!entry) return [401, { ok: false }];
    const ok = (b.code && b.code === entry.code) || (b.token && b.token === entry.token);
    return ok ? [200, { ok: true }] : [401, { ok: false }];
  },

  'POST /v1/auth/totp/enroll': (b) => {
    totpState.set(b.user_ref, { enrolled: true, confirmed: false, recoveryCodes: [] });
    captured.totp.push({ action: 'enroll', user_ref: b.user_ref });
    return [200, { otpauth_uri: `otpauth://totp/CraftsAI:${b.account}?secret=CITESTSECRET234&issuer=CraftsAI` }];
  },

  'POST /v1/auth/totp/confirm': (b) => {
    const st = totpState.get(b.user_ref);
    if (!st || b.code !== DETERMINISTIC_CODE) return [401, { ok: false }];
    st.confirmed = true;
    captured.totp.push({ action: 'confirm', user_ref: b.user_ref });
    return [200, { ok: true }];
  },

  'POST /v1/auth/totp/verify': (b) => {
    const st = totpState.get(b.user_ref);
    if (!st?.confirmed || b.code !== DETERMINISTIC_CODE) return [401, { ok: false }];
    return [200, { ok: true }];
  },

  'POST /v1/auth/recovery/generate': (b) => {
    const codes = Array.from({ length: b.count ?? 10 }, (_, i) => `CI-RECOVERY-${String(i).padStart(2, '0')}`);
    const st = totpState.get(b.user_ref) ?? { enrolled: true, confirmed: true, recoveryCodes: [] };
    st.recoveryCodes = [...codes];
    totpState.set(b.user_ref, st);
    return [200, { codes }];
  },

  'POST /v1/auth/recovery/verify': (b) => {
    const st = totpState.get(b.user_ref);
    const i = st?.recoveryCodes?.indexOf(b.code) ?? -1;
    if (i < 0) return [401, { ok: false }];
    st.recoveryCodes.splice(i, 1); // one-time use
    return [200, { ok: true }];
  },

  'POST /v1/auth/trust': (b) => {
    const token = randomUUID();
    trustTokens.set(token, b.user_ref);
    captured.trust.push({ action: 'create', user_ref: b.user_ref });
    return [200, { token }];
  },

  'POST /v1/auth/trust/check': (b) => [200, { trusted: trustTokens.get(b.token) === b.user_ref }],

  'POST /v1/auth/trust/revoke': (b) => {
    trustTokens.delete(b.token);
    captured.trust.push({ action: 'revoke', user_ref: b.user_ref });
    return [200, { ok: true }];
  },
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const key = `${req.method} ${url.pathname}`;

  if (key === 'GET /__health') return json(res, 200, { ok: true, service: 'notify-double' });
  if (key === 'GET /__captured') return json(res, 200, captured);
  if (key === 'GET /__captured/latest') {
    const to = url.searchParams.get('to');
    const hit = [...captured.challenges].reverse().find((c) => !to || c.to === to);
    return hit ? json(res, 200, hit) : json(res, 404, { error: 'no challenge captured' });
  }
  if (key === 'POST /__reset') {
    for (const k of Object.keys(captured)) captured[k] = [];
    challenges.clear();
    totpState.clear();
    trustTokens.clear();
    return json(res, 200, { ok: true });
  }

  const handler = routes[key];
  if (!handler) return json(res, 404, { error: `no route for ${key}` });

  const body = await readBody(req);
  const [status, payload] = handler(body);
  return json(res, status, payload);
});

server.listen(PORT, () => {
  console.log(`notify-double listening on :${PORT} — nothing is ever really sent`);
});

for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => server.close(() => process.exit(0)));
