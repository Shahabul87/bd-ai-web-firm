import { firebaseWebConfig } from '@/app/lib/pushConfig';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Serves the FCM service worker at /firebase-messaging-sw.js with the Firebase
 * web config injected from env (values are public). Returns 503 when push is
 * unconfigured, so registration fails gracefully.
 */
export async function GET(): Promise<Response> {
  const cfg = firebaseWebConfig();
  if (!cfg) return new Response('', { status: 503 });

  const js = `importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
firebase.initializeApp(${JSON.stringify(cfg)});
const messaging = firebase.messaging();
messaging.onBackgroundMessage(function (payload) {
  const d = payload.data || {};
  const n = payload.notification || {};
  self.registration.showNotification(n.title || d.title || d.subject || 'CraftsAI', {
    body: n.body || d.body || '',
    icon: '/favicon.ico',
  });
});
`;

  return new Response(js, {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Service-Worker-Allowed': '/',
      'Cache-Control': 'no-store',
    },
  });
}
