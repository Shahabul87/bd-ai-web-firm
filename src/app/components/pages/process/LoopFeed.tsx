import type { CSSProperties } from 'react';
import InView from '@/app/components/home/InView';

export interface LoopItem {
  title: string;
  body: string;
  status: string;
}

interface LoopFeedProps {
  title: string;
  note: string;
  channel: string;
  from: string;
  example: string;
  legendDecide: string;
  legendDone: string;
  items: LoopItem[];
}

/** Which entries need the client's call (gold); the rest are done (mint). */
const NEEDS_DECISION = [false, false, true, false];

/**
 * "How you stay in the loop": an example week in the project channel. The
 * entries arrive one by one when the feed scrolls into view (CSS, keyed off
 * InView's `.vis`); without scripting or with reduced motion they are all there.
 */
export default function LoopFeed({ title, note, channel, from, example, legendDecide, legendDone, items }: LoopFeedProps) {
  return (
    <section className="attn-sec pr-loop" aria-labelledby="pr-loop-h">
      <div className="attn-wrap pr-loop-grid">
        <div className="pr-loop-intro">
          <h2 className="attn-sec-h" id="pr-loop-h">
            {title}
          </h2>
          <p className="pr-loop-note">{note}</p>
          <ul className="pr-loop-key">
            <li>
              <i className="pr-dot is-decide" aria-hidden="true" />
              {legendDecide}
            </li>
            <li>
              <i className="pr-dot" aria-hidden="true" />
              {legendDone}
            </li>
          </ul>
        </div>
        <InView once className="pr-feed pg-panel">
          <p className="pr-feed-head">
            <span className="pr-feed-name">{channel}</span>
            <span className="pg-cap">{example}</span>
          </p>
          <ol className="pr-feed-list">
            {items.map((item, i) => {
              const decide = NEEDS_DECISION[i] ?? false;
              return (
                <li
                  key={item.title}
                  className={`pr-entry${decide ? ' is-decide' : ''}`}
                  style={{ '--d': i } as CSSProperties}
                >
                  <span className="pr-avatar" aria-hidden="true">
                    {from.charAt(0)}
                  </span>
                  <div className="pr-entry-main">
                    <p className="pr-entry-top">
                      <b>{from}</b>
                      <span>{item.title}</span>
                    </p>
                    <p className="pr-entry-body">{item.body}</p>
                  </div>
                  <span className="pr-entry-status">
                    <i className={`pr-dot${decide ? ' is-decide' : ''}`} aria-hidden="true" />
                    {item.status}
                  </span>
                </li>
              );
            })}
          </ol>
        </InView>
      </div>
    </section>
  );
}
