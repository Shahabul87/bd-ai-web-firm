'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { signInWithTicket } from './actions';

type Step = 'email' | 'code' | 'magiclink_sent' | 'enroll' | 'totp';

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

export default function LoginFlow({ initialToken }: { initialToken?: string }) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [remember, setRemember] = useState(false);
  const [otpauthUri, setOtpauthUri] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const ranInitial = useRef(false);

  const finish = useCallback(async (ticket: string) => {
    await signInWithTicket(ticket);
  }, []);

  const afterEmailFactor = useCallback(
    async (json: Record<string, unknown>) => {
      if (json.ticket) return finish(String(json.ticket));
      if (json.needEnroll) {
        const e = await postJson('/api/admin/login/enroll-totp', {});
        if (e.status === 200 && e.json.ok) {
          setOtpauthUri(String(e.json.otpauthUri ?? ''));
          setRecoveryCodes((e.json.recoveryCodes as string[]) ?? []);
          setStep('enroll');
        } else {
          setError('Could not start authenticator setup.');
        }
        return;
      }
      setStep('totp');
    },
    [finish],
  );

  // Magic-link callback: auto-verify the token on mount.
  useEffect(() => {
    if (!initialToken || ranInitial.current) return;
    ranInitial.current = true;
    (async () => {
      setBusy(true);
      const r = await postJson('/api/admin/login/verify', { token: initialToken });
      setBusy(false);
      if (r.status === 200 && r.json.ok) await afterEmailFactor(r.json);
      else setError('This link is invalid or expired. Start again.');
    })();
  }, [initialToken, afterEmailFactor]);

  async function start(method: 'otp' | 'magic_link') {
    setError('');
    setBusy(true);
    const r = await postJson('/api/admin/login/start', { email, method });
    setBusy(false);
    if (r.status !== 200) return setError('Too many attempts. Try again later.');
    setStep(method === 'otp' ? 'code' : 'magiclink_sent');
  }

  async function verifyCode() {
    setError('');
    setBusy(true);
    const r = await postJson('/api/admin/login/verify', { code });
    setBusy(false);
    if (r.status === 200 && r.json.ok) {
      setCode('');
      await afterEmailFactor(r.json);
    } else {
      setError('Invalid or expired code.');
    }
  }

  async function verifyTotp() {
    setError('');
    setBusy(true);
    const r = await postJson('/api/admin/login/verify-totp', { code, remember });
    setBusy(false);
    if (r.status === 200 && r.json.ok) await finish(String(r.json.ticket));
    else setError('Invalid authenticator code.');
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.15em] text-signal">CraftsAI Admin</p>
      <h1 className="mt-4 font-display text-3xl font-medium">Sign in</h1>

      {error && (
        <div role="alert" className="mt-6 border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {step === 'email' && (
        <div className="mt-8 space-y-3">
          <label htmlFor="adm-email" className="block font-mono text-xs uppercase tracking-[0.15em] text-steel">
            Admin email
          </label>
          <input
            id="adm-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
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
          <p>Check your inbox for a login link and open it in this browser.</p>
          <button onClick={() => setStep('code')} className={ghostBtn}>
            Enter a code instead
          </button>
        </div>
      )}

      {(step === 'code' || step === 'totp') && (
        <div className="mt-8 space-y-3">
          <label htmlFor="adm-code" className="block font-mono text-xs uppercase tracking-[0.15em] text-steel">
            {step === 'code' ? 'Code from your email' : 'Authenticator code'}
          </label>
          <input
            id="adm-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
            placeholder="123456"
            className={inputCls}
          />
          {step === 'totp' && (
            <label className="flex items-center gap-2 text-sm text-steel">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Trust this device for 30 days
            </label>
          )}
          <button
            disabled={busy || code.length < 6}
            onClick={step === 'code' ? verifyCode : verifyTotp}
            className={primaryBtn}
          >
            {busy ? 'Verifying…' : 'Continue'}
          </button>
        </div>
      )}

      {step === 'enroll' && (
        <div className="mt-8 space-y-4 text-sm">
          <p className="text-steel">
            Add CraftsAI Admin to your authenticator app (Google Authenticator, Authy…), then enter a code.
          </p>
          <a href={otpauthUri} className="block break-all border border-line bg-ink-900 px-4 py-3 font-mono text-xs text-signal">
            {otpauthUri || 'otpauth://…'}
          </a>
          {recoveryCodes.length > 0 && (
            <div className="border border-line bg-ink-900 p-4">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-steel">Recovery codes — save these</p>
              <div className="mt-2 grid grid-cols-2 gap-1 font-mono text-xs text-bone">
                {recoveryCodes.map((c) => (
                  <span key={c}>{c}</span>
                ))}
              </div>
            </div>
          )}
          <button onClick={() => setStep('totp')} className={primaryBtn}>
            I&apos;ve added it — continue
          </button>
        </div>
      )}
    </main>
  );
}
