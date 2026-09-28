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
} from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { QuoteResponse } from '@/app/lib/formErrors';
import { toBengaliDigits } from '@/app/lib/numerals';
import ChoiceGroup from './Choices';
import PipelineRail, { type RailNode } from './PipelineRail';
import QuoteReply from './QuoteReply';
import SpecCard, { type SpecLine, type SpecState } from './SpecCard';
import {
  API_FIELD,
  COMPANY_MAX,
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  EMAIL_MAX,
  EMPTY_ANSWERS,
  FIELD_STEP,
  NAME_MAX,
  NAME_MIN,
  NOTES_MAX,
  OPTION_GROUPS,
  PHONE_MAX,
  SPEC_KEYS,
  STEPS,
  buildPayload,
  canVisit,
  entryFilled,
  firstBlockingStep,
  nodeState,
  specEntries,
  toggleSlug,
  validateStep,
  type FieldKey,
  type OptionGroup,
  type QuoteAnswers,
  type StepErrors,
} from './model';

type Status = 'idle' | 'loading' | 'success' | 'error';
type TextField = 'description' | 'notes' | 'name' | 'email' | 'company' | 'phone' | 'website';

const LAST = STEPS.length - 1;
/** Minimum time the spec spends "compiling", so the scan reads as a beat. */
const COMPILE_MS = 1100;

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * The quote wizard as a model run being configured: a pipeline of four steps
 * (problem → data → scope → you), a spec file that assembles as the visitor
 * answers, and on submit the spec "compiles" and a reply streams in.
 *
 * Contract with /api/quote is unchanged; see buildPayload in ./model.
 */
export default function QuoteWizard() {
  const t = useTranslations('Quote');
  const tError = useTranslations('FormErrors');
  const locale = useLocale();
  const num = useCallback((n: number | string) => (locale === 'bn' ? toBengaliDigits(n) : String(n)), [locale]);

  const [answers, setAnswers] = useState<QuoteAnswers>(EMPTY_ANSWERS);
  const [step, setStep] = useState(0);
  const [furthest, setFurthest] = useState(0);
  const [dir, setDir] = useState<'fwd' | 'back'>('fwd');
  const [attempted, setAttempted] = useState<Record<number, boolean>>({});
  const [serverErrors, setServerErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [sent, setSent] = useState<QuoteAnswers | null>(null);
  const [replyDone, setReplyDone] = useState(false);
  const [specOpen, setSpecOpen] = useState(false);
  const [live, setLive] = useState(false);
  /** True once the visitor has moved between steps (enables step announcements). */
  const [navigated, setNavigated] = useState(false);

  const headRef = useRef<HTMLHeadingElement>(null);
  const replyHeadRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const moved = useRef(false);
  const focusField = useRef<FieldKey | null>(null);

  useEffect(() => setLive(true), []);

  // ── Focus management ─────────────────────────────────────────────
  useEffect(() => {
    if (!moved.current) return;
    const target = focusField.current;
    focusField.current = null;
    if (target) {
      const el = formRef.current?.querySelector<HTMLElement>(
        `[data-field="${target}"] input, [data-field="${target}"] textarea`,
      );
      if (el) {
        el.focus();
        return;
      }
    }
    headRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (status === 'success') replyHeadRef.current?.focus();
  }, [status]);

  // ── Derived state ────────────────────────────────────────────────
  const shownAnswers = sent ?? answers;
  const busy = status === 'loading';
  const done = status === 'success';

  const clientErrors: StepErrors = attempted[step] ? validateStep(step, answers) : {};
  const errorFor = (field: FieldKey): string | undefined => {
    if (serverErrors[field]) return serverErrors[field];
    return clientErrors[field] ? t(`validation.${field}`) : undefined;
  };

  const optionsOf = useCallback(
    (group: OptionGroup) => OPTION_GROUPS[group].map(({ slug }) => ({ slug, label: t(`options.${group}.${slug}`) })),
    [t],
  );

  const specLines: SpecLine[] = useMemo(() => {
    const labelOf = (group: OptionGroup, slug: string) => t(`options.${group}.${slug}`);
    return specEntries(shownAnswers).map((entry) => {
      const label = t(`spec.keys.${entry.key}`);
      if (!entryFilled(entry)) return { key: entry.key, label, value: null };
      if (entry.kind === 'list') {
        return { key: entry.key, label, value: `[${entry.slugs.map((s) => labelOf(entry.group, s)).join(', ')}]` };
      }
      if (entry.kind === 'one') return { key: entry.key, label, value: labelOf(entry.group, entry.slug) };
      return { key: entry.key, label, value: entry.key === 'problem' ? `"${entry.text}"` : entry.text };
    });
  }, [shownAnswers, t]);
  const filled = specLines.filter((l) => l.value !== null).length;

  const specState: SpecState = done ? 'sent' : busy ? 'compiling' : 'draft';

  const nodes: RailNode[] = STEPS.map((key, i) => ({
    key,
    name: t(`steps.${key}.name`),
    n: num(i + 1),
    state: done ? 'done' : nodeState(i, step, furthest, answers),
    reachable: !done && !busy && canVisit(i, step, furthest),
  }));
  const progress = done ? 1 : step / LAST;

  // ── Handlers ─────────────────────────────────────────────────────
  const clearServer = (field: FieldKey) => {
    if (serverErrors[field]) setServerErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const pickMany = (group: 'services' | 'data' | 'success') => (slug: string) => {
    setAnswers((prev) => ({ ...prev, [group]: toggleSlug(prev[group], slug, group) }));
    if (group !== 'success') clearServer(group);
  };

  const pickOne = (group: 'runs' | 'stage' | 'timeline' | 'budget') => (slug: string) => {
    setAnswers((prev) => ({ ...prev, [group]: slug }));
    clearServer(group);
  };

  const onText = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const field = e.target.name as TextField;
    const value = e.target.value;
    setAnswers((prev) => ({ ...prev, [field]: value }));
    if (field in FIELD_STEP) clearServer(field as FieldKey);
  };

  const goTo = (target: number) => {
    if (target === step) return;
    moved.current = true;
    setNavigated(true);
    setDir(target > step ? 'fwd' : 'back');
    setStep(target);
    setFurthest((f) => Math.max(f, target));
    if (status === 'error') setStatus('idle');
  };

  /** Move forward only past valid steps; otherwise show the first problem. */
  const tryGo = (target: number) => {
    if (target <= step) {
      goTo(target);
      return;
    }
    const blocking = firstBlockingStep(target, answers);
    if (blocking < target) {
      setAttempted((prev) => ({ ...prev, [blocking]: true }));
      const errs = validateStep(blocking, answers);
      const first = (Object.keys(errs) as FieldKey[])[0];
      if (blocking === step) {
        if (first) {
          formRef.current
            ?.querySelector<HTMLElement>(`[data-field="${first}"] input, [data-field="${first}"] textarea`)
            ?.focus();
        }
      } else {
        focusField.current = first ?? null;
        goTo(blocking);
      }
      return;
    }
    goTo(target);
  };

  const submit = async () => {
    if (busy) return;
    const blocking = firstBlockingStep(STEPS.length, answers);
    if (blocking < STEPS.length) {
      tryGo(STEPS.length);
      return;
    }
    setStatus('loading');
    setErrorMessage('');
    setServerErrors({});
    const snapshot = answers;
    try {
      const [res] = await Promise.all([
        fetch('/api/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload(snapshot)),
        }),
        wait(prefersReduced() ? 0 : COMPILE_MS),
      ]);
      const data = (await res.json().catch(() => null)) as QuoteResponse | null;

      if (res.ok && data?.success) {
        setSent(snapshot);
        setReplyDone(false);
        setStatus('success');
        setAnswers(EMPTY_ANSWERS);
        setAttempted({});
        return;
      }

      if (data && !data.success && data.errors) {
        const mapped: Partial<Record<FieldKey, string>> = {};
        let target = LAST;
        for (const [apiField, code] of Object.entries(data.errors)) {
          const field = API_FIELD[apiField];
          if (!field || !code) continue;
          mapped[field] = tError(code);
          target = Math.min(target, FIELD_STEP[field]);
        }
        setServerErrors(mapped);
        setErrorMessage(t('error.fix'));
        setStatus('error');
        if (target !== step) goTo(target);
        return;
      }

      setErrorMessage(data && !data.success && data.code ? tError(data.code, { minutes: data.retryMinutes ?? 0 }) : '');
      setStatus('error');
    } catch {
      setErrorMessage(t('error.network'));
      setStatus('error');
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (step < LAST) tryGo(step + 1);
    else void submit();
  };

  const reset = () => {
    setSent(null);
    setReplyDone(false);
    setStatus('idle');
    setFurthest(0);
    setDir('back');
    moved.current = true;
    setStep(0);
  };

  const onReplyDone = useCallback(() => setReplyDone(true), []);

  // ── Render helpers ───────────────────────────────────────────────
  const stepKey = STEPS[step];
  const replyParagraphs = sent
    ? [t('reply.greeting', { name: sent.name.trim() }), t('reply.next'), t('reply.view')]
    : [];
  const liveText = busy
    ? t('wizard.submitting')
    : done
      ? replyParagraphs.join(' ')
      : navigated
        ? t('wizard.stepAnnounce', { n: num(step + 1), total: num(STEPS.length), name: t(`steps.${stepKey}.name`) })
        : '';

  const textField = (
    field: 'name' | 'email' | 'company' | 'phone',
    opts: { type: string; autoComplete: string; max: number; min?: number; required?: boolean; inputMode?: 'email' | 'tel' },
  ) => {
    const error = field === 'phone' ? undefined : errorFor(field);
    const errId = `qt-${field}-err`;
    return (
      <div className="qt-param" data-field={field}>
        <label htmlFor={`qt-${field}`}>
          {t(`fields.${field}`)}
          {opts.required ? null : <span className="qt-opt"> {t('wizard.optional')}</span>}
        </label>
        <input
          id={`qt-${field}`}
          name={field}
          type={opts.type}
          autoComplete={opts.autoComplete}
          inputMode={opts.inputMode}
          required={opts.required}
          minLength={opts.min}
          maxLength={opts.max}
          value={answers[field]}
          placeholder={t(`fields.${field}Placeholder`)}
          onChange={onText}
          readOnly={busy}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errId : undefined}
        />
        {error ? (
          <p id={errId} className="qt-ferr">
            {error}
          </p>
        ) : null}
      </div>
    );
  };

  const descError = errorFor('description');
  const descLen = answers.description.trim().length;

  const stepBody = () => {
    switch (stepKey) {
      case 'problem':
        return (
          <>
            <ChoiceGroup
              name="services"
              legend={t('fields.services')}
              hint={t('fields.servicesHint')}
              options={optionsOf('services')}
              multiple
              selected={answers.services}
              onPick={pickMany('services')}
              error={errorFor('services')}
              disabled={busy}
            />
            <div className="qt-field" data-field="description">
              <label htmlFor="qt-description" className="qt-cap">
                {t('fields.description')}
              </label>
              <textarea
                id="qt-description"
                name="description"
                className="qt-ta"
                rows={4}
                required
                minLength={DESCRIPTION_MIN}
                maxLength={DESCRIPTION_MAX}
                value={answers.description}
                placeholder={t('fields.descriptionPlaceholder')}
                onChange={onText}
                readOnly={busy}
                aria-invalid={descError ? true : undefined}
                aria-describedby={descError ? 'qt-description-count qt-description-err' : 'qt-description-count'}
              />
              <div className="qt-ta-foot">
                <p
                  id="qt-description-count"
                  className="qt-count pg-num"
                  data-ok={descLen >= DESCRIPTION_MIN ? '' : undefined}
                >
                  {t('fields.descriptionCount', { count: num(Math.min(descLen, DESCRIPTION_MIN)), min: num(DESCRIPTION_MIN) })}
                </p>
                {descError ? (
                  <p id="qt-description-err" className="qt-ferr">
                    {descError}
                  </p>
                ) : null}
              </div>
            </div>
          </>
        );
      case 'data':
        return (
          <>
            <ChoiceGroup
              name="data"
              legend={t('fields.data')}
              hint={t('fields.dataHint')}
              options={optionsOf('data')}
              multiple
              selected={answers.data}
              onPick={pickMany('data')}
              error={errorFor('data')}
              disabled={busy}
            />
            <ChoiceGroup
              name="runs"
              legend={t('fields.runs')}
              options={optionsOf('runs')}
              selected={answers.runs ? [answers.runs] : []}
              onPick={pickOne('runs')}
              error={errorFor('runs')}
              disabled={busy}
            />
          </>
        );
      case 'scope':
        return (
          <>
            <ChoiceGroup
              name="stage"
              legend={t('fields.stage')}
              options={optionsOf('stage')}
              selected={answers.stage ? [answers.stage] : []}
              onPick={pickOne('stage')}
              error={errorFor('stage')}
              disabled={busy}
            />
            <ChoiceGroup
              name="success"
              legend={t('fields.success')}
              hint={t('fields.successHint')}
              options={optionsOf('success')}
              multiple
              selected={answers.success}
              onPick={pickMany('success')}
              disabled={busy}
            />
            <ChoiceGroup
              name="timeline"
              legend={t('fields.timeline')}
              options={optionsOf('timeline')}
              selected={answers.timeline ? [answers.timeline] : []}
              onPick={pickOne('timeline')}
              error={errorFor('timeline')}
              disabled={busy}
            />
            <ChoiceGroup
              name="budget"
              legend={t('fields.budget')}
              hint={t('fields.budgetNote')}
              options={optionsOf('budget')}
              selected={answers.budget ? [answers.budget] : []}
              onPick={pickOne('budget')}
              error={errorFor('budget')}
              disabled={busy}
            />
            <div className="qt-field">
              <label htmlFor="qt-notes" className="qt-cap">
                {t('fields.notes')} <span className="qt-opt">{t('wizard.optional')}</span>
              </label>
              <textarea
                id="qt-notes"
                name="notes"
                className="qt-ta qt-ta-sm"
                rows={2}
                maxLength={NOTES_MAX}
                value={answers.notes}
                placeholder={t('fields.notesPlaceholder')}
                onChange={onText}
                readOnly={busy}
              />
            </div>
          </>
        );
      case 'you': {
        const termsError = errorFor('terms');
        return (
          <>
            <div className="qt-params">
              {textField('name', { type: 'text', autoComplete: 'name', max: NAME_MAX, min: NAME_MIN, required: true })}
              {textField('email', { type: 'email', autoComplete: 'email', max: EMAIL_MAX, required: true, inputMode: 'email' })}
              {textField('company', { type: 'text', autoComplete: 'organization', max: COMPANY_MAX, required: true })}
              {textField('phone', { type: 'tel', autoComplete: 'tel', max: PHONE_MAX, inputMode: 'tel' })}
            </div>
            <div className="qt-terms" data-field="terms" data-invalid={termsError ? '' : undefined}>
              <label className="qt-check">
                <input
                  type="checkbox"
                  name="agreed"
                  checked={answers.agreed}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setAnswers((prev) => ({ ...prev, agreed: checked }));
                  }}
                  disabled={busy}
                  aria-invalid={termsError ? true : undefined}
                  aria-describedby={termsError ? 'qt-terms-err' : undefined}
                />
                <span>
                  {t.rich('fields.terms', {
                    terms: (chunks) => <Link href="/terms">{chunks}</Link>,
                    privacy: (chunks) => <Link href="/privacy">{chunks}</Link>,
                  })}
                </span>
              </label>
              {termsError ? (
                <p id="qt-terms-err" className="qt-ferr">
                  {termsError}
                </p>
              ) : null}
            </div>
            {/* Honeypot: off screen, out of the tab order, hidden from AT. */}
            <div className="qt-hp" aria-hidden="true">
              <label htmlFor="qt-website">{t('wizard.honeypot')}</label>
              <input
                id="qt-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={answers.website}
                onChange={onText}
              />
            </div>
          </>
        );
      }
    }
  };

  const trust = t.raw('trust') as string[];

  return (
    <section className="qt-main" aria-labelledby="qt-form-h">
      <div className="attn-wrap">
        <h2 id="qt-form-h" className="qt-sr">
          {t('wizard.heading')}
        </h2>
        <div className="pg-enter" style={{ '--d': 3 } as CSSProperties}>
          <PipelineRail
            label={t('rail.label')}
            nodes={nodes}
            progress={progress}
            nameOf={(node) => t('rail.step', { n: node.n, name: node.name })}
            statusLabels={{ done: t('rail.done'), current: t('rail.current'), todo: t('rail.todo') }}
            onGo={tryGo}
          />
        </div>

        <div className="qt-grid">
          <div className="qt-col pg-enter" style={{ '--d': 4 } as CSSProperties}>
            <div className="qt-panel" data-status={status}>
              <div className="qt-bar">
                <span className="qt-bar-t">{done ? t('reply.bar') : t('wizard.bar')}</span>
                {!done ? (
                  <span className="qt-bar-n pg-num">
                    {t('wizard.stepOf', { n: num(step + 1), total: num(STEPS.length) })}
                  </span>
                ) : null}
              </div>

              <div className="qt-sr" role="status" aria-live="polite">
                {liveText}
              </div>

              {done && sent ? (
                <div className="qt-reply">
                  <h3 ref={replyHeadRef} tabIndex={-1} className="qt-reply-h">
                    {t('reply.label')}
                  </h3>
                  <QuoteReply paragraphs={replyParagraphs} onDone={onReplyDone} />
                  <div className="qt-again" data-on={replyDone ? '' : undefined}>
                    <button type="button" className="attn-btn attn-btn-secondary attn-btn-sm" onClick={reset}>
                      {t('reply.another')}
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  ref={formRef}
                  className="qt-form"
                  method="post"
                  noValidate
                  onSubmit={onSubmit}
                  aria-busy={busy || undefined}
                >
                  <div key={stepKey} className="qt-step" data-dir={dir}>
                    <div className="qt-step-head">
                      <h3 ref={headRef} tabIndex={-1} className="qt-step-h">
                        {t(`steps.${stepKey}.title`)}
                      </h3>
                      <p className="qt-step-lede">{t(`steps.${stepKey}.lede`)}</p>
                    </div>
                    <div className="qt-step-body">{stepBody()}</div>
                  </div>

                  {status === 'error' ? (
                    <div className="qt-error" role="alert">
                      <p className="qt-error-t">{t('error.title')}</p>
                      <p>{errorMessage || t('error.generic')}</p>
                    </div>
                  ) : null}

                  <p className="qt-nojs">{t('wizard.noScript')}</p>

                  <div className="qt-foot">
                    {step > 0 ? (
                      <button
                        type="button"
                        className="attn-btn attn-btn-secondary qt-back"
                        onClick={() => goTo(step - 1)}
                        disabled={busy}
                      >
                        <span aria-hidden="true">←</span> {t('wizard.back')}
                      </button>
                    ) : (
                      <p className="qt-note">{t('wizard.note')}</p>
                    )}
                    {/* aria-disabled, not disabled, while sending: focus stays on the
                        button instead of dropping to <body>; submit() ignores repeats. */}
                    <button type="submit" className="attn-btn attn-btn-primary qt-next" aria-disabled={busy || undefined}>
                      {step < LAST ? (
                        <>
                          {t('wizard.continue')} <span aria-hidden="true">→</span>
                        </>
                      ) : busy ? (
                        <>
                          {t('wizard.submitting')}
                          <span className="qt-dots" aria-hidden="true">
                            <i />
                            <i />
                            <i />
                          </span>
                        </>
                      ) : (
                        t('wizard.submit')
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
            <ul className="qt-trust">
              {trust.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <SpecCard
            heading={t('spec.heading')}
            file={t('spec.title')}
            state={specState}
            stateLabel={t(`spec.state.${specState}`)}
            lines={specLines}
            countLabel={t('spec.count', { done: num(filled), total: num(SPEC_KEYS.length) })}
            note={t('spec.note')}
            toggleLabel={specOpen ? t('spec.toggleHide') : t('spec.toggleShow')}
            open={specOpen}
            onToggle={() => setSpecOpen((o) => !o)}
            lineNo={(i) => num(String(i + 1).padStart(2, '0'))}
            live={live}
          />
        </div>
      </div>
    </section>
  );
}
