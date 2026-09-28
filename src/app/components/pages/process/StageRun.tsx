'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import RunPlot, { Legend, MiniRun, Readout, type ChartCopy } from './RunPlot';
import StageArtifact, { type ArtifactCopy } from './StageArtifacts';
import { createRunDriver, type RunDriver } from './driver';
import { EDGES, type StageKey } from './run';

export interface StageCopy {
  key: StageKey;
  number: string;
  title: string;
  body: string;
  get: string;
  decide: string;
}

interface StageRunProps {
  title: string;
  note: string;
  listLabel: string;
  youGet: string;
  youDecide: string;
  chartLabel: string;
  chart: ChartCopy;
  example: string;
  stages: StageCopy[];
  artifacts: ArtifactCopy;
  bn: boolean;
}

/** Matches the CSS breakpoint where the chart goes sticky beside the stages. */
const wide = () => window.innerWidth >= 900;
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The main scene. Desktop: the chart is sticky beside the five stages; the
 * stage crossing the middle of the viewport is active, the curve draws up to
 * its checkpoint and the dock under the chart shows what it hands you.
 * Narrow screens: each stage carries its own strip of the curve and its
 * artifact inline, which play when scrolled into view. Reduced motion: the
 * whole curve stays drawn and nothing tweens. The server HTML is the finished
 * state; `data-live` (set after mount) is what arms the hidden-until-seen CSS.
 */
export default function StageRun(props: StageRunProps) {
  const { stages, artifacts, chart, bn } = props;
  const [active, setActive] = useState(0);
  const [seen, setSeen] = useState<boolean[]>(() => stages.map(() => false));
  const [live, setLive] = useState(false);
  const [entered, setEntered] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const stageRefs = useRef<(HTMLLIElement | null)[]>([]);
  const inlineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const driverRef = useRef<RunDriver | null>(null);
  const lockRef = useRef(false);
  const unlockRef = useRef<() => void>(() => {});
  const reducedRef = useRef(false);

  // The chart driver + its visibility (for the marker pulse and the entry draw).
  useEffect(() => {
    const root = chartRef.current;
    if (!root) return;
    reducedRef.current = reducedMotion();
    const driver = createRunDriver(root, stages.map((s) => s.title), bn);
    driverRef.current = driver;
    if (reducedRef.current) {
      driver.render(1, EDGES[1], 0);
      root.dataset.state = 'done';
    } else {
      driver.render(0, 0, 0);
      root.dataset.state = 'live';
    }
    setLive(true);

    let io: IntersectionObserver | undefined;
    if (typeof IntersectionObserver === 'undefined') {
      root.classList.add('is-vis');
      setEntered(true);
    } else {
      io = new IntersectionObserver(
        ([entry]) => {
          root.classList.toggle('is-vis', entry.isIntersecting);
          if (entry.intersectionRatio >= 0.3) setEntered(true);
        },
        { threshold: [0, 0.3] },
      );
      io.observe(root);
    }
    return () => {
      driver.stop();
      io?.disconnect();
      driverRef.current = null;
    };
  }, [stages, bn]);

  // Draw (or, with reduced motion, move the head) to the active stage's checkpoint.
  useEffect(() => {
    const driver = driverRef.current;
    if (!driver) return;
    const to = EDGES[active + 1];
    if (reducedRef.current) driver.render(1, to, active);
    else if (entered) {
      // The agreed bar draws in first, then the curve runs to the checkpoint.
      chartRef.current?.classList.add('bar-on');
      driver.tween(to, Math.min(2600, 700 + 1700 * Math.abs(to - driver.progress)));
    }
  }, [active, entered]);

  // Inline (narrow-screen) strips and artifacts play once each is scrolled into view.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setSeen(stages.map(() => true));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const i = inlineRefs.current.indexOf(entry.target as HTMLDivElement);
          if (i < 0) continue;
          io.unobserve(entry.target);
          setSeen((prev) => (prev[i] ? prev : prev.map((v, j) => v || j === i)));
        }
      },
      { threshold: 0.35 },
    );
    inlineRefs.current.forEach((node) => node && io.observe(node));
    return () => io.disconnect();
  }, [stages]);

  // The stage crossing the middle of the viewport is the active one.
  const update = useCallback(() => {
    const section = sectionRef.current;
    if (!section || lockRef.current) return;
    const r = section.getBoundingClientRect();
    const vh = window.innerHeight;
    // Off screen (or not laid out): leave the current stage alone.
    if (r.height === 0 || r.bottom < 0 || r.top > vh) return;
    let a = 0;
    stageRefs.current.forEach((li, i) => {
      if (li && li.getBoundingClientRect().top <= vh * 0.5) a = i;
    });
    setActive(a);
  }, []);

  useEffect(() => {
    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        update();
      });
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      unlockRef.current();
    };
  }, [update]);

  /** A stage title was pressed: make it current now and scroll it into place. */
  const select = (i: number) => {
    unlockRef.current();
    setActive(i);
    const li = stageRefs.current[i];
    if (!li) return;
    lockRef.current = true;
    let timer = 0;
    const unlock = () => {
      window.clearTimeout(timer);
      window.removeEventListener('scrollend', unlock);
      unlockRef.current = () => {};
      lockRef.current = false;
    };
    unlockRef.current = unlock;
    window.addEventListener('scrollend', unlock);
    timer = window.setTimeout(unlock, 1400);
    li.scrollIntoView({ block: wide() ? 'center' : 'start', behavior: reducedRef.current ? 'auto' : 'smooth' });
  };

  return (
    <section ref={sectionRef} id="pr-run" className="attn-sec pr-run" aria-labelledby="pr-run-h" data-live={live ? '' : undefined}>
      <div className="attn-wrap">
        <div className="pr-run-top">
          <h2 className="attn-sec-h" id="pr-run-h">
            {props.title}
          </h2>
          <p className="pr-run-note">{props.note}</p>
        </div>
        <div className="pr-run-grid">
          <ol className="pr-stages" aria-label={props.listLabel}>
            {stages.map((stage, i) => (
              <li
                key={stage.key}
                ref={(node) => {
                  stageRefs.current[i] = node;
                }}
                className={`pr-stage${i === active ? ' is-active' : ''}${i < active ? ' is-past' : ''}`}
              >
                <div className="pr-stage-in">
                  <span className="pr-stage-n">{stage.number}</span>
                  <h3 className="pr-stage-h">
                    <button
                      type="button"
                      className="pr-stage-btn"
                      aria-current={i === active ? 'step' : undefined}
                      onClick={() => select(i)}
                    >
                      {stage.title}
                    </button>
                  </h3>
                  <p className="pr-stage-body">{stage.body}</p>
                  <dl className="pr-stage-dl">
                    <div>
                      <dt>{props.youGet}</dt>
                      <dd>{stage.get}</dd>
                    </div>
                    <div className="pr-decide">
                      <dt>{props.youDecide}</dt>
                      <dd>{stage.decide}</dd>
                    </div>
                  </dl>
                  <div
                    ref={(node) => {
                      inlineRefs.current[i] = node;
                    }}
                    className={`pr-inline${seen[i] ? ' is-on' : ''}`}
                  >
                    <MiniRun k={i} />
                    <StageArtifact
                      stage={stage.key}
                      copy={artifacts}
                      example={props.example}
                      suffix="inline"
                      on={seen[i]}
                      bn={bn}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <div className="pr-stick">
            <div className="pr-card pg-panel">
              <div className="pr-card-head">
                <span className="pg-cap">{chart.example}</span>
                <Legend copy={chart} />
              </div>
              <div ref={chartRef} className="pr-chart pr-main-chart" role="img" aria-label={props.chartLabel}>
                <Readout copy={chart} stages={stages.map((s) => s.title)} bn={bn} />
                <div className="pr-chart-fit">
                  <RunPlot id="pr-main" stages={stages.map((s) => s.title)} barLabel={chart.bar} />
                </div>
              </div>
              <div className="pr-dock">
                {stages.map((stage, i) => (
                  <StageArtifact
                    key={stage.key}
                    stage={stage.key}
                    copy={artifacts}
                    example={`${stage.number} · ${stage.title}`}
                    suffix="dock"
                    on={i === active}
                    bn={bn}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
