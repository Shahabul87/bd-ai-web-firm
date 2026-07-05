'use client';

import { useEffect, useState } from 'react';
import { isPushConfigured } from '@/app/lib/pushConfig';
import { requestPushToken } from '@/app/lib/firebaseClient';

type State = 'idle' | 'busy' | 'on' | 'denied' | 'error';

/**
 * "Enable notifications" control. Renders NOTHING when push is unconfigured or
 * the browser lacks Notification support (graceful degradation). Requests
 * permission, gets an FCM token, and registers it with the given audience route.
 */
export default function EnablePush({ registerPath }: { registerPath: string }) {
  const [state, setState] = useState<State>('idle');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isPushConfigured() || typeof window === 'undefined' || !('Notification' in window)) return;
    setVisible(true);
    if (Notification.permission === 'granted') setState('on');
    else if (Notification.permission === 'denied') setState('denied');
  }, []);

  async function enable() {
    setState('busy');
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      setState(perm === 'denied' ? 'denied' : 'idle');
      return;
    }
    const token = await requestPushToken();
    if (!token) {
      setState('error');
      return;
    }
    const res = await fetch(registerPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    setState(res.ok ? 'on' : 'error');
  }

  if (!visible) return null;

  if (state === 'on') {
    return (
      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-signal">🔔 Notifications on</span>
    );
  }

  return (
    <button
      type="button"
      onClick={enable}
      disabled={state === 'busy' || state === 'denied'}
      title={state === 'denied' ? 'Notifications are blocked in your browser settings' : undefined}
      className="border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-steel transition-colors hover:border-signal hover:text-signal disabled:opacity-50"
    >
      {state === 'busy'
        ? 'Enabling…'
        : state === 'denied'
          ? 'Notifications blocked'
          : state === 'error'
            ? 'Try again'
            : 'Enable notifications'}
    </button>
  );
}
