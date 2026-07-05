import 'server-only';
import { devChallenge, devVerify } from './devAuth';

const NOTIFY_URL = () => process.env.NOTIFY_URL ?? '';
const NOTIFY_API_KEY = () => process.env.NOTIFY_API_KEY ?? '';

/** True only when both notify-svc URL and API key are configured. */
export const isNotifyConfigured = (): boolean => Boolean(NOTIFY_URL() && NOTIFY_API_KEY());

async function post(path: string, body: unknown): Promise<Response | null> {
  try {
    return await fetch(`${NOTIFY_URL()}${path}`, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': NOTIFY_API_KEY() },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error('notify request failed:', err instanceof Error ? err.message : 'unknown');
    return null;
  }
}

/**
 * Sends the seeded `announcement` email template via notify-svc. Never throws.
 * Returns { ok: false } when notify-svc is not configured (dev logs to console).
 */
export async function sendAnnouncement(
  to: string,
  subject: string,
  body: string,
): Promise<{ ok: boolean }> {
  if (!isNotifyConfigured()) {
    console.warn(`notify not configured — would email "${subject}" to ${to}`);
    return { ok: false };
  }
  const res = await post('/v1/notify', {
    channel: 'email',
    to,
    template: 'announcement',
    data: { subject, title: subject, body },
  });
  return { ok: Boolean(res && res.status >= 200 && res.status < 300) };
}

/**
 * Registers a browser's FCM token with notify-svc so it can receive push.
 * No-op (and never throws) when notify-svc is unconfigured. Idempotent server-side.
 */
export async function registerDevice(token: string, userRef: string): Promise<void> {
  if (!isNotifyConfigured()) return;
  // notify-svc's /v1/devices requires the field name `fcm_token`.
  await post('/v1/devices', { fcm_token: token, user_ref: userRef, platform: 'web' });
}

/**
 * Sends a push notification to a user_ref's devices via notify-svc (announcement
 * template). Fire-and-forget: no-op when unconfigured, never throws. If notify-svc
 * lacks FCM creds it no-ops server-side.
 */
export async function sendPush(userRef: string, subject: string, body: string): Promise<void> {
  if (!isNotifyConfigured()) return;
  await post('/v1/notify', {
    channel: 'push',
    to: `user:${userRef}`,
    template: 'announcement',
    data: { subject, title: subject, body },
  });
}

// ── Auth (per-tenant via X-API-Key). Dev fallback when notify unconfigured. ──

const devMode = (): boolean => !isNotifyConfigured() && process.env.NODE_ENV !== 'production';

async function jsonOk<T>(
  res: Response | null,
  pick: (j: Record<string, unknown>) => T,
): Promise<T | null> {
  if (!res || res.status < 200 || res.status >= 300) return null;
  try {
    return pick((await res.json()) as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function authChallenge(input: {
  method: 'otp' | 'magic_link';
  to: string;
  appName?: string;
  name?: string;
  redirect?: string;
}): Promise<{ challengeId: string } | null> {
  if (devMode()) return devChallenge(input.to);
  const res = await post('/v1/auth/challenge', {
    method: input.method,
    to: input.to,
    app_name: input.appName ?? 'CraftsAI Admin',
    name: input.name,
    redirect: input.redirect,
  });
  return jsonOk(res, (j) => ({ challengeId: String(j.challenge_id) }));
}

export async function authVerify(input: {
  challengeId: string;
  code?: string;
  token?: string;
}): Promise<{ ok: boolean }> {
  if (devMode()) return devVerify(input.challengeId, input.code ?? '');
  const res = await post('/v1/auth/verify', {
    challenge_id: input.challengeId,
    code: input.code,
    token: input.token,
  });
  return { ok: Boolean(res && res.status >= 200 && res.status < 300) };
}

export async function totpEnroll(
  userRef: string,
  account: string,
): Promise<{ otpauthUri: string } | null> {
  if (devMode()) {
    return {
      otpauthUri: `otpauth://totp/CraftsAI:${account}?secret=DEVSECRET234567&issuer=CraftsAI`,
    };
  }
  const res = await post('/v1/auth/totp/enroll', { user_ref: userRef, account });
  return jsonOk(res, (j) => ({ otpauthUri: String(j.otpauth_uri) }));
}

export async function totpConfirm(userRef: string, code: string): Promise<{ ok: boolean }> {
  if (devMode()) return { ok: code.length === 6 };
  const res = await post('/v1/auth/totp/confirm', { user_ref: userRef, code });
  return { ok: Boolean(res && res.status >= 200 && res.status < 300) };
}

export async function totpVerify(userRef: string, code: string): Promise<{ ok: boolean }> {
  if (devMode()) return { ok: code.length === 6 };
  const res = await post('/v1/auth/totp/verify', { user_ref: userRef, code });
  return { ok: Boolean(res && res.status >= 200 && res.status < 300) };
}

export async function recoveryGenerate(
  userRef: string,
  count = 10,
): Promise<{ codes: string[] } | null> {
  if (devMode()) {
    return { codes: Array.from({ length: count }, (_, i) => `DEV-${String(i).padStart(2, '0')}-RECOVERY`) };
  }
  const res = await post('/v1/auth/recovery/generate', { user_ref: userRef, count });
  return jsonOk(res, (j) => ({ codes: (j.codes as string[]) ?? [] }));
}

export async function recoveryVerify(userRef: string, code: string): Promise<{ ok: boolean }> {
  if (devMode()) return { ok: /^DEV-\d\d-RECOVERY$/.test(code) };
  const res = await post('/v1/auth/recovery/verify', { user_ref: userRef, code });
  return { ok: Boolean(res && res.status >= 200 && res.status < 300) };
}

export async function trustCreate(
  userRef: string,
  label: string,
  ttlDays: number,
): Promise<{ token: string } | null> {
  if (devMode()) return { token: `dev-trust-${userRef}` };
  const res = await post('/v1/auth/trust', { user_ref: userRef, label, ttl_days: ttlDays });
  return jsonOk(res, (j) => ({ token: String(j.token) }));
}

export async function trustCheck(
  userRef: string,
  token: string,
): Promise<{ trusted: boolean }> {
  if (devMode()) return { trusted: token === `dev-trust-${userRef}` };
  const res = await post('/v1/auth/trust/check', { user_ref: userRef, token });
  return (await jsonOk(res, (j) => ({ trusted: Boolean(j.trusted) }))) ?? { trusted: false };
}
