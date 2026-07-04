import 'server-only';

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
