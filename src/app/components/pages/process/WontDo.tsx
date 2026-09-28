import type { CSSProperties } from 'react';
import InView from '@/app/components/home/InView';

export interface WontItem {
  line: string;
  instead: string;
}

/**
 * "What we won't do": three short lines, each struck through in rose as it
 * reveals, with what we do instead underneath. The strike is finished in the
 * server HTML; only scripting + motion hides it until InView adds `.vis`.
 */
export default function WontDo({ title, items }: { title: string; items: WontItem[] }) {
  return (
    <section className="attn-sec pr-wont" aria-labelledby="pr-wont-h">
      <div className="attn-wrap">
        <h2 className="attn-sec-h" id="pr-wont-h">
          {title}
        </h2>
        <InView once>
          <ul className="pr-wont-list">
            {items.map((item, i) => (
              <li key={item.line} className="pr-wont-item" style={{ '--d': i } as CSSProperties}>
                <p className="pr-wont-line">
                  <span className="pr-strike">{item.line}</span>
                </p>
                <p className="pr-wont-instead">{item.instead}</p>
              </li>
            ))}
          </ul>
        </InView>
      </div>
    </section>
  );
}
