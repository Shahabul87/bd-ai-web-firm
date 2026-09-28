import { act, fireEvent, render, screen, within } from '@testing-library/react';
import HeroRun from '../HeroRun';
import StageRun, { type StageCopy } from '../StageRun';
import type { ChartCopy } from '../RunPlot';
import type { ArtifactCopy } from '../StageArtifacts';
import { BAR, EDGES, EVAL_FAILS, EVAL_SCORE, SAMPLES, STAGE_KEYS, caseFails, formatDelta, stageAt, valueAt } from '../run';
// The real message files, so these tests cannot drift from the shipped copy.
import enMessages from '../../../../../../messages/en.json';
import bnMessages from '../../../../../../messages/bn.json';

type ProcessMessages = typeof enMessages.Process;

function propsFor(m: ProcessMessages) {
  const chart: ChartCopy = m.chart;
  const stages: StageCopy[] = STAGE_KEYS.map((key, i) => ({
    key,
    number: String(i + 1).padStart(2, '0'),
    title: m.stages[key].title,
    body: m.stages[key].body,
    get: m.stages[key].get,
    decide: m.stages[key].decide,
  }));
  const artifacts: ArtifactCopy = {
    discover: m.stages.discover.artifact,
    prototype: m.stages.prototype.artifact,
    evaluate: m.stages.evaluate.artifact,
    build: m.stages.build.artifact,
    run: m.stages.run.artifact,
  };
  return { chart, stages, artifacts };
}

let reduced = false;
beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('reduce') ? reduced : false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
  Element.prototype.scrollIntoView = jest.fn();
});

afterEach(() => {
  reduced = false;
});

describe('the example run', () => {
  it('starts below the bar, crosses it once, during Evaluate, and ends above it', () => {
    const crossings = SAMPLES.filter((s, i) => i > 0 && (SAMPLES[i - 1].q < BAR) !== (s.q < BAR));
    expect(crossings).toHaveLength(1);
    expect(stageAt(crossings[0].x)).toBe(STAGE_KEYS.indexOf('evaluate'));
    expect(valueAt(0).q).toBeLessThan(BAR);
    for (const x of EDGES.slice(3)) expect(valueAt(x).q).toBeGreaterThan(BAR);
  });

  it('is deterministic and the eval grid matches the score', () => {
    expect(SAMPLES.map((s) => s.q)).toEqual(SAMPLES.map((_, i) => SAMPLES[i].q));
    const fails = Array.from({ length: 40 }, (_, i) => caseFails(i)).filter(Boolean).length;
    expect(fails).toBe(EVAL_FAILS);
    expect(EVAL_SCORE).toBeGreaterThan(BAR);
  });

  it('formats deltas with a real minus sign and Bengali digits on /bn', () => {
    expect(formatDelta(-0.123, false)).toBe('−0.12');
    expect(formatDelta(0.004, false)).toBe('+0.00');
    expect(formatDelta(0.18, true)).toBe('+০.১৮');
  });
});

describe('StageRun', () => {
  const m = enMessages.Process;
  const renderRun = () => {
    const { chart, stages, artifacts } = propsFor(m);
    return render(
      <StageRun
        title={m.run.title}
        note={m.run.note}
        listLabel={m.run.listLabel}
        youGet={m.run.youGet}
        youDecide={m.run.youDecide}
        chartLabel={m.run.chartLabel}
        chart={chart}
        example={m.run.example}
        stages={stages}
        artifacts={artifacts}
        bn={false}
      />,
    );
  };

  it('renders five stage buttons in order with the first current', () => {
    renderRun();
    const list = screen.getByRole('list', { name: m.run.listLabel });
    const buttons = within(list).getAllByRole('button');
    expect(buttons.map((b) => b.textContent)).toEqual(STAGE_KEYS.map((k) => m.stages[k].title));
    expect(buttons[0]).toHaveAttribute('aria-current', 'step');
    expect(buttons.filter((b) => b.hasAttribute('aria-current'))).toHaveLength(1);
  });

  it('pressing a stage makes it current and puts its artifact in the dock', () => {
    const { container } = renderRun();
    fireEvent.click(screen.getByRole('button', { name: m.stages.evaluate.title }));
    expect(screen.getByRole('button', { name: m.stages.evaluate.title })).toHaveAttribute('aria-current', 'step');
    expect(screen.getByRole('button', { name: m.stages.discover.title })).not.toHaveAttribute('aria-current');
    const on = container.querySelectorAll('.pr-dock > .pr-art.is-on');
    expect(on).toHaveLength(1);
    expect(on[0]).toHaveTextContent(m.stages.evaluate.artifact.title);
  });

  it('with reduced motion keeps the whole curve drawn and moves the head to the checkpoint', () => {
    reduced = true;
    const { container } = renderRun();
    const plot = container.querySelector('.pr-main-chart .pr-plot');
    expect(plot).toHaveAttribute('data-progress', '1');
    fireEvent.click(screen.getByRole('button', { name: m.stages.build.title }));
    expect(plot).toHaveAttribute('data-progress', '1');
    expect(container.querySelector('.pr-main-chart [data-r="stage"]')).toHaveTextContent(m.stages.build.title);
    expect(container.querySelector('.pr-main-chart .pr-band.is-focus')).toBe(container.querySelectorAll('.pr-main-chart .pr-band')[3]);
  });
});

describe('HeroRun', () => {
  it('server markup is the finished run; reduced motion leaves it finished', () => {
    reduced = true;
    const m = enMessages.Process;
    const { chart, stages } = propsFor(m);
    render(<HeroRun copy={chart} stages={stages.map((s) => s.title)} label={m.hero.chartLabel} replay={m.hero.replay} bn={false} />);
    const img = screen.getByRole('img', { name: m.hero.chartLabel });
    expect(img).toHaveAttribute('data-state', 'done');
    expect(img.querySelector('.pr-plot')).toHaveAttribute('data-progress', '1');
  });

  it('with motion arms the draw from zero', () => {
    jest.useFakeTimers();
    const m = enMessages.Process;
    const { chart, stages } = propsFor(m);
    render(<HeroRun copy={chart} stages={stages.map((s) => s.title)} label={m.hero.chartLabel} replay={m.hero.replay} bn={false} />);
    const img = screen.getByRole('img', { name: m.hero.chartLabel });
    expect(img).toHaveAttribute('data-state', 'live');
    expect(img.querySelector('.pr-plot')).toHaveAttribute('data-progress', '0');
    act(() => {
      jest.advanceTimersByTime(600);
    });
    expect(img).toHaveClass('bar-on');
    jest.useRealTimers();
  });
});

describe('Process messages', () => {
  it('have the same structure in both locales, with five stages and four loop entries', () => {
    const shape = (o: unknown): unknown =>
      Array.isArray(o) ? o.length : o && typeof o === 'object' ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, shape(v)])) : typeof o;
    expect(shape(bnMessages.Process)).toEqual(shape(enMessages.Process));
    expect(Object.keys(enMessages.Process.stages)).toEqual([...STAGE_KEYS]);
    expect(enMessages.Process.loop.items).toHaveLength(4);
  });
});
