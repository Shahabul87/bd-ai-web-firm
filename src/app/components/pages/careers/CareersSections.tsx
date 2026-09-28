import { useLocale, useTranslations } from 'next-intl';
import InView from '@/app/components/home/InView';
import { toBengaliDigits } from '@/app/lib/numerals';
import { delay } from '../company/cssVars';
import { CAREERS_MAIL } from './CareersHero';
import { stringListSchema, titledItemsSchema } from './schema';

/** "§ 1  How we work ·····" — the Company page's card-field label, continued here. */
function Label({ n, text, id, heading = false }: { n: number; text: string; id?: string; heading?: boolean }) {
  const locale = useLocale();
  const Tag = heading ? 'h2' : 'p';
  return (
    <Tag className="ca-label pg-rise" id={id}>
      <span className="ca-label-n">§ {locale === 'bn' ? toBengaliDigits(n) : n}</span>
      <span className="ca-label-k">{text}</span>
      <span className="ca-label-rule" aria-hidden="true" />
    </Tag>
  );
}

/** § 1 How we work: four entries on a rail that draws itself as it comes into view. */
export function HowWeWork() {
  const t = useTranslations('Careers.work');
  const items = titledItemsSchema.parse(t.raw('items'));
  return (
    <section className="attn-sec ca-work" id="ca-work" aria-labelledby="ca-work-h">
      <div className="attn-wrap">
        <InView once className="ca-sec-head">
          <Label n={1} text={t('label')} />
          <h2 className="attn-sec-h pg-rise" id="ca-work-h" style={delay(1)}>
            {t('title')}
          </h2>
          <p className="ca-note pg-rise" style={delay(2)}>
            {t('note')}
          </p>
        </InView>
        <InView once>
          <ol className="ca-log">
            {items.map((item, i) => (
              <li key={item.title} className="ca-log-item pg-rise" style={delay(i + 1)}>
                <span className="ca-log-node" aria-hidden="true" />
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </li>
            ))}
          </ol>
        </InView>
      </div>
    </section>
  );
}

/** § 2 What we look for: a short rubric whose checks draw in, mint for "pass". */
export function LookFor() {
  const t = useTranslations('Careers.look');
  const items = titledItemsSchema.parse(t.raw('items'));
  return (
    <section className="attn-sec ca-look" aria-labelledby="ca-look-h">
      <div className="attn-wrap">
        <InView once className="ca-look-grid">
          <div>
            <Label n={2} text={t('label')} />
            <h2 className="attn-sec-h pg-rise" id="ca-look-h" style={delay(1)}>
              {t('title')}
            </h2>
          </div>
          <div className="ca-rubric pg-panel pg-rise" style={delay(2)}>
            <p className="pg-cap ca-rubric-cap">{t('rubric')}</p>
            <ul>
              {items.map((item, i) => (
                <li key={item.title} style={delay(i + 3)}>
                  <svg className="ca-check" viewBox="0 0 20 20" aria-hidden="true">
                    <rect x="1" y="1" width="18" height="18" rx="5" />
                    <path d="M5.5 10.5l3 3 6-7" pathLength={1} />
                  </svg>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </InView>
      </div>
    </section>
  );
}

/** § 3 Open roles: the honest empty result, and how to write to us anyway. */
export function OpenRoles() {
  const t = useTranslations('Careers.roles');
  const include = stringListSchema.parse(t.raw('include'));
  return (
    <section className="attn-sec ca-roles" id="ca-roles" aria-labelledby="ca-roles-h">
      <div className="attn-wrap">
        <InView once>
          <Label n={3} text={t('title')} id="ca-roles-h" heading />
          <div className="ca-query pg-panel pg-rise" style={delay(1)}>
            <div className="ca-query-bar">
              <span className="ca-query-prompt" aria-hidden="true">
                ›
              </span>
              <code>{t('query')}</code>
              <span className="ca-query-scan" aria-hidden="true" />
            </div>
            <div className="ca-query-result">
              <div className="ca-query-main">
                <p className="ca-query-empty">{t('empty')}</p>
                <p className="ca-query-body">{t('body')}</p>
                <a className="attn-btn attn-btn-primary" href={CAREERS_MAIL}>
                  {t('mail')}
                </a>
              </div>
              <div className="ca-query-side">
                <h3 className="pg-cap">{t('includeTitle')}</h3>
                <ul>
                  {include.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </InView>
      </div>
    </section>
  );
}
