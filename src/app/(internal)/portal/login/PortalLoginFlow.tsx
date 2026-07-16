'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { signInPortal } from './actions';

type Step = 'email' | 'code' | 'magiclink_sent';

const inputCls =
  'w-full border border-line bg-ink-900 px-4 py-3 text-sm text-bone placeholder:text-steel/50 focus:border-signal focus:outline-none';
const primaryBtn =
  'w-full bg-signal px-5 py-3 font-mono text-xs uppercase tracking-[0.15em] text-ink-950 transition-colors hover:bg-signal-dim disabled:opacity-50';
const ghostBtn =
  'w-full border border-line px-5 py-3 font-mono text-xs uppercase tracking-[0.15em] text-bone transition-colors hover:border-signal hover:text-signal disabled:opacity-50';

async function postJson(path: string, body: unknown) {
  const r = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: r.status, json: (await r.json().catch(() => ({}))) as Record<string, unknown> };
}

export default function PortalLoginFlow({ initialToken }: { initialToken?: string }) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [remember, setRemember] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const ranInitial = useRef(false);

  const finish = useCallback(async (ticket: string) => {
    await signInPortal(ticket);
  }, []);

  // Magic-link callback: auto-verify the token on mount (same browser that started).
  useEffect(() => {
    if (!initialToken || ranInitial.current) return;
    ranInitial.current = true;
    (async () => {
      setBusy(true);
      const r = await postJson('/api/user/login/verify', { token: initialToken });
      setBusy(false);
      if (r.status === 200 && r.json.ok && r.json.ticket) await finish(String(r.json.ticket));
      else setError('This link is invalid or expired. Start again.');
    })();
  }, [initialToken, finish]);

  async function start(method: 'otp' | 'magic_link') {
    setError('');
    setBusy(true);
    const r = await postJson('/api/user/login/start', { email, method });
    setBusy(false);
    if (r.status !== 200) return setError('Too many attempts. Try again later.');
    // Trusted-device fast path may return a ticket directly.
    if (r.json.ticket) return finish(String(r.json.ticket));
    setStep(method === 'otp' ? 'code' : 'magiclink_sent');
  }

  async function verifyCode() {
    setError('');
    setBusy(true);
    const r = await postJson('/api/user/login/verify', { code, remember });
    setBusy(false);
    if (r.status === 200 && r.json.ok && r.json.ticket) {
      setCode('');
      await finish(String(r.json.ticket));
    } else {
      setError('Invalid or expired code.');
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.15em] text-signal">CraftsAI Client Portal</p>
      <h1 className="mt-4 font-display text-3xl font-medium">Sign in</h1>
      <p className="mt-3 text-sm text-steel">
        Enter the email address where you receive CraftsAI updates.
      </p>

      {error && (
        <div role="alert" className="mt-6 border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {step === 'email' && (
        <div className="mt-8 space-y-3">
          <label htmlFor="portal-email" className="block font-mono text-xs uppercase tracking-[0.15em] text-steel">
            Your email
          </label>
          <input
            id="portal-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className={inputCls}
          />
          <button disabled={busy || !email} onClick={() => start('magic_link')} className={primaryBtn}>
            {busy ? 'Sending…' : 'Email me a magic link'}
          </button>
          <button disabled={busy || !email} onClick={() => start('otp')} className={ghostBtn}>
            Email me a code instead
          </button>
        </div>
      )}

      {step === 'magiclink_sent' && (
        <div className="mt-8 space-y-4 text-sm text-steel">
          <p>If that email is registered, a login link is on its way — open it in this browser.</p>
          <button onClick={() => setStep('code')} className={ghostBtn}>
            Enter a code instead
          </button>
        </div>
      )}

      {step === 'code' && (
        <div className="mt-8 space-y-3">
          <label htmlFor="portal-code" className="block font-mono text-xs uppercase tracking-[0.15em] text-steel">
            Code from your email
          </label>
          <input
            id="portal-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
            placeholder="123456"
            className={inputCls}
          />
          <label className="flex items-center gap-2 text-sm text-steel">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Remember this device for 30 days
          </label>
          <button disabled={busy || code.length < 6} onClick={verifyCode} className={primaryBtn}>
            {busy ? 'Verifying…' : 'Continue'}
          </button>
        </div>
      )}
    </main>
  );
}
