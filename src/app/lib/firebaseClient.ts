'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { firebaseWebConfig, vapidKey } from './pushConfig';

/**
 * Requests an FCM registration token for THIS browser, registering the service
 * worker. Returns null when unsupported, unconfigured, or permission not granted.
 * Never throws.
 */
export async function requestPushToken(): Promise<string | null> {
  try {
    const cfg = firebaseWebConfig();
    const vapid = vapidKey();
    if (!cfg || !vapid) return null;
    if (!(await isSupported())) return null;
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null;

    const app = getApps().length ? getApp() : initializeApp(cfg);
    const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    const messaging = getMessaging(app);
    const token = await getToken(messaging, { vapidKey: vapid, serviceWorkerRegistration: swReg });
    return token || null;
  } catch {
    return null;
  }
}
