/**
 * Push (Firebase Cloud Messaging) configuration gate. All values are PUBLIC
 * (NEXT_PUBLIC_*) — safe to expose. When any are missing, push gracefully
 * degrades to nothing: the enable button hides, the SW route 503s, and no
 * registration runs. The secret FCM service account lives only in notify-svc.
 */

export function firebaseWebConfig(): {
  apiKey: string;
  authDomain: string;
  projectId: string;
  messagingSenderId: string;
  appId: string;
} | null {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  if (!apiKey || !authDomain || !projectId || !messagingSenderId || !appId) return null;
  return { apiKey, authDomain, projectId, messagingSenderId, appId };
}

export function vapidKey(): string | undefined {
  return process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || undefined;
}

export function isPushConfigured(): boolean {
  return firebaseWebConfig() !== null && Boolean(vapidKey());
}
