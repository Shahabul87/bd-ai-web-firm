'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { graphemes } from './text';
import { useLoop } from './useLoop';

export interface PhoneCopy {
  label: string;
  example: string;
  summary: string;
  time: string;
  appTitle: string;
  user: string;
  assistant: string;
  badge: string;
  thinking: string;
  reply: string;
  chip: string;
  chipDone: string;
  pause: string;
  play: string;
}

interface PhoneAssistProps {
  platform: 'android' | 'ios';
  copy: PhoneCopy;
}

type Phase = 'idle' | 'user' | 'think' | 'reply' | 'chip' | 'tap' | 'done' | 'out';

const T_USER = 500;
const THINK_MS = 1300;
const CHAR_MS = 24;
const CHIP_DELAY = 420;
const TAP_DELAY = 1150;
const TAP_MS = 420;
const HOLD_MS = 3800;
const OUT_MS = 520;

interface Frame {
  phase: Phase;
  /** Reply graphemes shown. */
  r: number;
}

/** Deterministic widths for the placeholder rows behind the conversation. */
const ROWS = [
  [72, 46],
  [58, 64],
];

/**
 * AI inside your Android / iOS app — a phone drawn in CSS with the platform's
 * own chrome (Material-ish: punch-hole camera, top app bar, outlined chip
 * with a ripple, gesture handle; iOS-ish: Dynamic Island, large title, tab bar, home indicator).
 * The user asks, the on-device assistant card thinks, types its reply, and
 * offers a suggestion chip that gets tapped. Loops while on screen. The
 * server HTML is the finished exchange (no-JS, reduced motion).
 */
export default function PhoneAssist({ platform, copy }: PhoneAssistProps) {
  const rootRef = useRef<HTMLElement>(null);
  const chars = useMemo(() => graphemes(copy.reply), [copy.reply]);
  const [frame, setFrame] = useState<Frame>({ phase: 'done', r: chars.length });

  const timeline = useMemo(() => {
    const think = T_USER + 500;
    const reply = think + THINK_MS;
    const chip = reply + chars.length * CHAR_MS + CHIP_DELAY;
    const tap = chip + TAP_DELAY;
    const done = tap + TAP_MS;
    const out = done + HOLD_MS;
    return { think, reply, chip, tap, done, out, end: out + OUT_MS };
  }, [chars.length]);

  const tick = useCallback(
    (elapsed: number) => {
      const t = elapsed % timeline.end;
      let next: Frame;
      if (t < T_USER) next = { phase: 'idle', r: 0 };
      else if (t < timeline.think) next = { phase: 'user', r: 0 };
      else if (t < timeline.reply) next = { phase: 'think', r: 0 };
      else if (t < timeline.chip) next = { phase: 'reply', r: Math.min(chars.length, Math.floor((t - timeline.reply) / CHAR_MS) + 1) };
      else if (t < timeline.tap) next = { phase: 'chip', r: chars.length };
      else if (t < timeline.done) next = { phase: 'tap', r: chars.length };
      else if (t < timeline.out) next = { phase: 'done', r: chars.length };
      else next = { phase: 'out', r: chars.length };
      setFrame((prev) => (prev.phase === next.phase && prev.r === next.r ? prev : next));
    },
    [chars.length, timeline],
  );

  const { mode, playing, toggle } = useLoop(rootRef, tick);
  const { phase, r } = frame;
  const shown = chars.slice(0, r).join('');
  const rest = chars.slice(r).join('');
  const chipOn = phase === 'chip' || phase === 'tap' || phase === 'done' || phase === 'out';
  const chipDone = phase === 'done' || phase === 'out';

  return (
    <figure
      ref={rootRef}
      className={`sd-fig sd-phonefig sd-os-${platform}`}
      data-phase={phase}
      data-live={mode === 'pending' ? undefined : mode}
    >
      <figcaption className="sd-fig-head">
        <span className="sd-fig-title">
          <b>{copy.label}</b>
          <span className="pg-cap">{copy.example}</span>
        </span>
        {mode === 'live' ? (
          <button type="button" className="sd-toggle" onClick={toggle}>
            <span aria-hidden="true" className={playing ? 'sd-ico-pause' : 'sd-ico-play'} />
            {playing ? copy.pause : copy.play}
          </button>
        ) : null}
      </figcaption>
      <p className="sr-only">{copy.summary}</p>

      <div className="sd-phone" aria-hidden="true">
        <div className="sd-ph-screen">
          <div className="sd-ph-status">
            <span className="sd-ph-time pg-num">{copy.time}</span>
            <i className="sd-ph-cam" />
            <span className="sd-ph-icons">
              <i className="sd-ph-sig" />
              <i className="sd-ph-wifi" />
              <i className="sd-ph-batt" />
            </span>
          </div>

          {platform === 'android' ? (
            <div className="sd-ph-appbar">
              <i className="sd-ph-menu" />
              <b>{copy.appTitle}</b>
              <i className="sd-ph-avatar" />
            </div>
          ) : (
            <div className="sd-ph-nav">
              <i className="sd-ph-back" />
              <b>{copy.appTitle}</b>
            </div>
          )}

          <div className="sd-ph-body">
            {ROWS.map(([a, b], i) => (
              <div key={i} className="sd-ph-row">
                <i className="sd-ph-thumb" />
                <span>
                  <i style={{ width: `${a}%` }} />
                  <i style={{ width: `${b}%` }} />
                </span>
              </div>
            ))}

            <div className={`sd-ph-user${phase === 'idle' ? '' : ' on'}`}>{copy.user}</div>

            <div className={`sd-ph-card${phase === 'idle' || phase === 'user' ? '' : ' on'}`}>
              <div className="sd-ph-card-head">
                <i className="sd-ph-spark" />
                <b>{copy.assistant}</b>
                <span className="sd-ph-badge">{copy.badge}</span>
              </div>
              <div className="sd-ph-reply">
                {phase === 'think' ? (
                  <span className="sd-ph-think">
                    {copy.thinking}
                    <i />
                    <i />
                    <i />
                  </span>
                ) : null}
                <p className={phase === 'think' ? 'is-wait' : undefined}>
                  <span>{shown}</span>
                  {phase === 'reply' ? <span className="sd-caret" /> : null}
                  <span className="sd-ghost">{rest}</span>
                </p>
              </div>
              <span className={`sd-ph-chip${chipOn ? ' on' : ''}${phase === 'tap' ? ' tap' : ''}${chipDone ? ' done' : ''}`}>
                <i className="sd-ph-chip-ico" />
                <span className="sd-ph-chip-a">{copy.chip}</span>
                <span className="sd-ph-chip-b">{copy.chipDone}</span>
                <i className="sd-ph-ripple" />
              </span>
            </div>
          </div>

          {platform === 'android' ? (
            <i className="sd-ph-gesture" />
          ) : (
            <>
              <div className="sd-ph-tabs">
                <i />
                <i className="on" />
                <i />
              </div>
              <i className="sd-ph-home" />
            </>
          )}
        </div>
      </div>
    </figure>
  );
}
