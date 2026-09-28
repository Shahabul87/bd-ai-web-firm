'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { ContactField, ContactResponse } from '@/app/lib/formErrors';
import { CONTACT_FIELD_CODES } from '@/app/lib/formErrors';
import { toBengaliDigits } from '@/app/lib/numerals';
import ReplyStream from './ReplyStream';
import { useExampleTyper } from './useExampleTyper';
import {
  CONTEXT_TARGET,
  EMAIL_MAX,
  EMPTY_FIELDS,
  MESSAGE_MAX,
  MESSAGE_MIN,
  NAME_MAX,
  NAME_MIN,
  SERVICE_OPTIONS,
  TRACE_STEPS,
  emailOk,
  estimateTokens,
  hintFor,
  litSteps,
  messageOk,
  nameOk,
  type ContactFields,
} from './model';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface ContactComposerProps {
  /** Server-rendered content for the side column, under the trace. */
  aside?: ReactNode;
}

/** The first ~180 characters of the sent request, echoed above the reply. */
const excerpt = (text: string) => {
  const clean = text.trim().replace(/\s+/g, ' ');
  return clean.length > 180 ? `${clean.slice(0, 177).trimEnd()}…` : clean;
};

/**
 * The contact form as a prompt composer: the message is the prompt, the
 * service chips and the name/email/company "parameters" shape it, a context
 * meter estimates its size, and the reply is generated in place. The side
 * trace "compiles" as the request gets what it needs.
 *
 * Contract with /api/contact is unchanged: POST JSON
 * {name, email, company, service, message} (+ the `website` honeypot, which the
 * route silently accepts), and coded errors resolve through `FormErrors`.
 */
export default function ContactComposer({ aside }: ContactComposerProps) {
  const t = useTranslations('Contact.composer');
  const tTrace = useTranslations('Contact.trace');
  const tError = useTranslations('FormErrors');
  const locale = useLocale();
  const num = useCallback((n: number) => (locale === 'bn' ? toBengaliDigits(n) : String(n)), [locale]);

  const examples = useMemo(() => t.raw('examples') as string[], [t]);

  const [fields, setFields] = useState<ContactFields>(EMPTY_FIELDS);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [touched, setTouched] = useState<Partial<Record<ContactField, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<Partial<Record<ContactField, string>>>({});
  const [focused, setFocused] = useState(false);
  const [sent, setSent] = useState<{ name: string; message: string } | null>(null);
  const [replyDone, setReplyDone] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLSpanElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const replyHeadRef = useRef<HTMLHeadingElement>(null);
  const focusAfterReset = useRef(false);

  const { running: typing, index: exampleIndex } = useExampleTyper(
    examples,
    ghostRef,
    areaRef,
    focused || fields.message !== '',
    status !== 'success',
  );

  // ── Derived state ────────────────────────────────────────────────
  const tokens = estimateTokens(fields.message.trim());
  const fill = Math.min(1, tokens / CONTEXT_TARGET);
  const hintKey = hintFor(fields.message);
  const lit = status === 'success' ? TRACE_STEPS.length : litSteps(fields);

  const clientChecks: Record<ContactField, boolean> = {
    name: nameOk(fields.name),
    email: emailOk(fields.email),
    message: messageOk(fields.message),
  };
  const fieldError = (field: ContactField): string => {
    if (serverErrors[field]) return serverErrors[field] ?? '';
    if (touched[field] && fields[field] !== '' && !clientChecks[field]) return tError(CONTACT_FIELD_CODES[field]);
    return '';
  };
  const errors = { name: fieldError('name'), email: fieldError('email'), message: fieldError('message') };

  const replyParagraphs = useMemo(
    () => (sent ? [t('reply.greeting', { name: sent.name }), t('reply.next'), t('reply.view')] : []),
    [sent, t],
  );

  // ── Focus management ─────────────────────────────────────────────
  useEffect(() => {
    if (status === 'success') replyHeadRef.current?.focus();
    if (status === 'idle' && focusAfterReset.current) {
      focusAfterReset.current = false;
      messageRef.current?.focus();
    }
  }, [status]);

  // ── Handlers ─────────────────────────────────────────────────────
  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (name in serverErrors) {
      setServerErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };
  const onBlur = (field: ContactField) => () => setTouched((prev) => ({ ...prev, [field]: true }));

  // Turns a coded API failure into a translated string; '' means "use the
  // generic message".
  const resolveError = (data: ContactResponse | null): string => {
    if (!data || data.success) return '';
    if (data.errors) {
      const firstCode = Object.values(data.errors).find(Boolean);
      return firstCode ? tError(firstCode) : '';
    }
    if (data.code) {
      return tError(data.code, { seconds: data.retrySeconds ?? 0 });
    }
    return '';
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'loading') return;
    setStatus('loading');
    setErrorMessage('');
    setServerErrors({});
    setTouched({ name: true, email: true, message: true });

    const { name, email, company, service, message, website } = fields;
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company, service, message, website }),
      });
      const data = (await res.json().catch(() => null)) as ContactResponse | null;

      if (res.ok && data?.success) {
        setSent({ name: name.trim(), message });
        setReplyDone(false);
        setStatus('success');
        setFields(EMPTY_FIELDS);
        setTouched({});
        return;
      }

      if (data && !data.success && data.errors) {
        const mapped: Partial<Record<ContactField, string>> = {};
        for (const [field, code] of Object.entries(data.errors) as [ContactField, string][]) {
          if (code) mapped[field] = tError(code);
        }
        setServerErrors(mapped);
      }
      setStatus('error');
      setErrorMessage(resolveError(data));
    } catch {
      setStatus('error');
      setErrorMessage('');
    }
  };

  const onMessageKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  const reset = () => {
    focusAfterReset.current = true;
    setSent(null);
    setReplyDone(false);
    setStatus('idle');
  };

  const onReplyDone = useCallback(() => setReplyDone(true), []);

  // ── Render ───────────────────────────────────────────────────────
  const describedBy = (...ids: (string | false)[]) => ids.filter(Boolean).join(' ') || undefined;
  const liveText =
    status === 'loading' ? t('sending') : status === 'success' ? replyParagraphs.join(' ') : '';
  const busy = status === 'loading';

  return (
    <section className="ct-main" aria-labelledby="ct-compose-h">
      <div className="attn-wrap ct-grid">
        <div className="ct-col pg-enter" style={{ '--d': 3 } as CSSProperties}>
          <h2 id="ct-compose-h" className="ct-sr">
            {t('heading')}
          </h2>
          <div className="ct-panel" data-status={status}>
            <div className="ct-bar">
              <span className="ct-bar-t">{status === 'success' ? t('reply.bar') : t('bar')}</span>
              {status !== 'success' ? (
                <div className="ct-meter" data-full={fill >= 1 ? '' : undefined} aria-hidden="true">
                  <span className="ct-meter-l">{t('context')}</span>
                  <span className="ct-meter-track">
                    <i style={{ transform: `scaleX(${fill})` }} />
                  </span>
                  <span className="ct-meter-n">{t('tokens', { n: tokens, count: num(tokens) })}</span>
                </div>
              ) : null}
            </div>

            <div className="ct-sr" role="status" aria-live="polite">
              {liveText}
            </div>

            {status === 'success' && sent ? (
              <div className="ct-reply">
                <div className="ct-sent">
                  <span className="ct-cap">{t('reply.sentLabel')}</span>
                  <p>{excerpt(sent.message)}</p>
                </div>
                <div className="ct-resp">
                  <h3 ref={replyHeadRef} tabIndex={-1} className="ct-resp-h">
                    {t('reply.label')}
                  </h3>
                  <ReplyStream paragraphs={replyParagraphs} onDone={onReplyDone} />
                  <div className="ct-again" data-on={replyDone ? '' : undefined}>
                    <button type="button" className="attn-btn attn-btn-secondary attn-btn-sm" onClick={reset}>
                      {t('reply.another')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <form
                ref={formRef}
                className="ct-form"
                method="post"
                onSubmit={onSubmit}
                aria-busy={busy || undefined}
              >
                {/* The prompt */}
                <div ref={areaRef} className="ct-msg" data-typer={typing && !focused && fields.message === '' ? 'run' : undefined}>
                  <label htmlFor="message" className="ct-cap">
                    {t('message')}
                  </label>
                  <div className="ct-msg-field">
                    <textarea
                      ref={messageRef}
                      id="message"
                      name="message"
                      className="ct-ta"
                      required
                      minLength={MESSAGE_MIN}
                      maxLength={MESSAGE_MAX}
                      rows={5}
                      value={fields.message}
                      placeholder={examples[exampleIndex] ?? examples[0]}
                      onChange={onChange}
                      onFocus={() => setFocused(true)}
                      onBlur={() => {
                        setFocused(false);
                        onBlur('message')();
                      }}
                      onKeyDown={onMessageKey}
                      readOnly={busy}
                      aria-invalid={errors.message ? true : undefined}
                      aria-describedby={describedBy('ct-msg-hint', !!errors.message && 'ct-msg-err')}
                    />
                    <div className="ct-ghost" aria-hidden="true">
                      <span ref={ghostRef} />
                    </div>
                  </div>
                  <div className="ct-msg-foot">
                    <p id="ct-msg-hint" className="ct-hint" key={hintKey}>
                      {t(`hints.${hintKey}`)}
                    </p>
                    {errors.message ? (
                      <p id="ct-msg-err" className="ct-ferr">
                        {errors.message}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Service interest */}
                <fieldset className="ct-svc">
                  <legend className="ct-cap">{t('service')}</legend>
                  <div className="ct-chips">
                    {SERVICE_OPTIONS.map(({ slug, value }) => {
                      const checked = fields.service === value;
                      return (
                        <label key={slug} className="ct-chip" data-on={checked ? '' : undefined}>
                          <input
                            type="radio"
                            name="service"
                            value={value}
                            checked={checked}
                            onChange={onChange}
                            required
                          />
                          <span className="ct-chip-dot" aria-hidden="true" />
                          <span>{t(`services.${slug}`)}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                {/* Parameters */}
                <fieldset className="ct-params">
                  <legend className="ct-cap">{t('parameters')}</legend>
                  <div className="ct-param-grid">
                    <div className="ct-param">
                      <label htmlFor="name">{t('name')}</label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        minLength={NAME_MIN}
                        maxLength={NAME_MAX}
                        value={fields.name}
                        placeholder={t('namePlaceholder')}
                        onChange={onChange}
                        onBlur={onBlur('name')}
                        readOnly={busy}
                        aria-invalid={errors.name ? true : undefined}
                        aria-describedby={describedBy(!!errors.name && 'ct-name-err')}
                      />
                      {errors.name ? (
                        <p id="ct-name-err" className="ct-ferr">
                          {errors.name}
                        </p>
                      ) : null}
                    </div>
                    <div className="ct-param">
                      <label htmlFor="email">{t('email')}</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        required
                        maxLength={EMAIL_MAX}
                        value={fields.email}
                        placeholder={t('emailPlaceholder')}
                        onChange={onChange}
                        onBlur={onBlur('email')}
                        readOnly={busy}
                        aria-invalid={errors.email ? true : undefined}
                        aria-describedby={describedBy(!!errors.email && 'ct-email-err')}
                      />
                      {errors.email ? (
                        <p id="ct-email-err" className="ct-ferr">
                          {errors.email}
                        </p>
                      ) : null}
                    </div>
                    <div className="ct-param">
                      <label htmlFor="company">
                        {t('company')} <span className="ct-opt">{t('optional')}</span>
                      </label>
                      <input
                        id="company"
                        name="company"
                        type="text"
                        autoComplete="organization"
                        maxLength={NAME_MAX}
                        value={fields.company}
                        placeholder={t('companyPlaceholder')}
                        onChange={onChange}
                        readOnly={busy}
                      />
                    </div>
                  </div>
                </fieldset>

                {/* Honeypot: off screen, out of the tab order, hidden from AT. */}
                <div className="ct-hp" aria-hidden="true">
                  <label htmlFor="ct-website">{t('honeypot')}</label>
                  <input
                    id="ct-website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={fields.website}
                    onChange={onChange}
                  />
                </div>

                {status === 'error' ? (
                  <div className="ct-error" role="alert">
                    <p className="ct-error-t">{t('error.title')}</p>
                    <p>{errorMessage || t('error.generic')}</p>
                  </div>
                ) : null}

                <p className="ct-nojs">{t('noScript')}</p>

                <div className="ct-foot">
                  <p className="ct-note">
                    {t('note')} <span className="ct-kbd">{t('shortcut')}</span>
                  </p>
                  {/* aria-disabled, not disabled: the button keeps focus while sending,
                      so focus is not dropped to <body>; onSubmit ignores repeats. */}
                  <button type="submit" className="attn-btn attn-btn-primary ct-send" aria-disabled={busy || undefined}>
                    {busy ? (
                      <>
                        {t('sending')}
                        <span className="ct-dots" aria-hidden="true">
                          <i />
                          <i />
                          <i />
                        </span>
                      </>
                    ) : (
                      t('send')
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <aside className="ct-side" aria-labelledby="ct-trace-h">
          <div className="ct-trace" data-state={status === 'success' ? 'sent' : lit === TRACE_STEPS.length ? 'ready' : 'compiling'}>
            <div className="ct-trace-top">
              <h2 id="ct-trace-h" className="ct-trace-h">
                {tTrace('title')}
              </h2>
              <p className="ct-trace-state">
                {status === 'success'
                  ? tTrace('sent')
                  : tTrace('progress', { done: num(lit), total: num(TRACE_STEPS.length) })}
              </p>
            </div>
            <ol className="ct-steps">
              {TRACE_STEPS.map((key, i) => {
                const state =
                  status === 'success' && i === 0 ? 'now' : i < lit ? 'lit' : i === lit ? 'next' : 'off';
                return (
                  <li
                    key={key}
                    className="ct-step"
                    data-s={state}
                    data-link={i < TRACE_STEPS.length - 1 && i + 1 < lit ? '' : undefined}
                  >
                    <span className="ct-dot" aria-hidden="true" />
                    <div className="ct-step-t">
                      <h3>{tTrace(`steps.${key}.title`)}</h3>
                      <p>{tTrace(`steps.${key}.body`)}</p>
                    </div>
                    <span className="ct-num" aria-hidden="true">
                      {num(i + 1)}
                    </span>
                  </li>
                );
              })}
            </ol>
            <p className="ct-trace-note">{tTrace('note')}</p>
          </div>
          {aside}
        </aside>
      </div>
    </section>
  );
}
