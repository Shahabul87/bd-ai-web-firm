'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Non-critical floating widgets. `ssr: false` keeps them out of the initial
// HTML (they are not content and never need to be crawled), and the idle/intent
// gate below defers their JS + message evaluation until after hydration so they
// never compete with LCP. Chatbot is the heavier of the two.
const AIChatbot = dynamic(() => import('./AIChatbot'), { ssr: false });
const WhatsAppButton = dynamic(() => import('./WhatsAppButton'), { ssr: false });

/**
 * Mounts the chatbot and WhatsApp UI after the first of: browser idle, a safe
 * timeout, or any real user intent (pointer / key / scroll). Progressive
 * enhancement — a visitor who never interacts on a fast connection still gets
 * them shortly after load; one who scrolls or taps gets them immediately.
 */
export default function DeferredWidgets() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let idleId: number | undefined;
    let timerId: ReturnType<typeof setTimeout> | undefined;
    const trigger = () => setShow(true);

    // `requestIdleCallback` is unavailable on Safari/WebKit before v16, so
    // feature-detect at runtime rather than assume the lib.dom type is present.
    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(trigger, { timeout: 3000 });
    } else {
      timerId = setTimeout(trigger, 2000);
    }

    const intents: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'scroll'];
    intents.forEach((type) =>
      window.addEventListener(type, trigger, { once: true, passive: true }),
    );

    return () => {
      if (idleId !== undefined && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
      if (timerId) clearTimeout(timerId);
      intents.forEach((type) => window.removeEventListener(type, trigger));
    };
  }, []);

  if (!show) return null;

  return (
    <>
      <WhatsAppButton />
      <AIChatbot />
    </>
  );
}
