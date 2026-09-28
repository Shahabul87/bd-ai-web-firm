import { useTranslations } from 'next-intl';
import InView from '@/app/components/home/InView';
import SectionLabel from './SectionLabel';
import { titledItemsSchema } from './schema';
import { delay } from './cssVars';

/** § 1 Intended use: who CraftsAI is for. Mint checks draw in as each fit rises. */
export default function IntendedUse() {
  const t = useTranslations('About.intended');
  const items = titledItemsSchema.parse(t.raw('items'));

  return (
    <section className="attn-sec co-sec" aria-labelledby="co-intended-h">
      <div className="attn-wrap">
        <InView once className="co-sec-head">
          <SectionLabel n={1} text={t('label')} className="pg-rise" />
          <h2 className="attn-sec-h pg-rise" id="co-intended-h" style={delay(1)}>
            {t('title')}
          </h2>
          <p className="co-note pg-rise" style={delay(2)}>
            {t('note')}
          </p>
        </InView>
        <InView once>
          <ul className="co-fits">
            {items.map((item, i) => (
              <li key={item.title} className="co-fit pg-rise" style={delay(i)}>
                <svg className="co-tick" viewBox="0 0 32 32" aria-hidden="true">
                  <circle cx="16" cy="16" r="14.5" />
                  <path d="M9.5 16.5 L14 21 L22.5 11.5" pathLength="1" />
                </svg>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </li>
            ))}
          </ul>
        </InView>
      </div>
    </section>
  );
}
