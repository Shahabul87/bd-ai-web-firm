import { useTranslations } from 'next-intl';
import InView from '@/app/components/home/InView';
import SectionLabel from './SectionLabel';
import { titledItemsSchema } from './schema';
import { delay } from './cssVars';

/**
 * § 2 Out of scope: what CraftsAI won't do. Each line arrives like a candidate
 * token, then is rejected: a rose strike draws through it and it falls back,
 * leaving the reason beside it. Without JS or with reduced motion the lines are
 * simply shown struck, with their reasons.
 */
export default function OutOfScope() {
  const t = useTranslations('About.outOfScope');
  const items = titledItemsSchema.parse(t.raw('items'));

  return (
    <section className="attn-sec co-sec co-sec-oos" aria-labelledby="co-oos-h">
      <div className="attn-wrap">
        <InView once className="co-sec-head">
          <SectionLabel n={2} text={t('label')} className="pg-rise" />
          <h2 className="attn-sec-h pg-rise" id="co-oos-h" style={delay(1)}>
            {t('title')}
          </h2>
          <p className="co-note pg-rise" style={delay(2)}>
            {t('note')}
          </p>
        </InView>
        <InView once>
          <ul className="co-oos">
            {items.map((item, i) => (
              <li key={item.title} className="co-oos-row" style={delay(i)}>
                <h3 className="co-oos-t">
                  <span className="co-strike">{item.title}</span>
                </h3>
                <div className="co-oos-why">
                  <span className="co-oos-tag">{t('tag')}</span>
                  <p>{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </InView>
      </div>
    </section>
  );
}
