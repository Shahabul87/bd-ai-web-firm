import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { delay } from '../company/cssVars';
import TokenTitle from './TokenTitle';
import { cardFieldsSchema, titleWordsSchema } from './schema';

export const CAREERS_MAIL = 'mailto:hello@craftsai.org?subject=Careers';

/**
 * Careers hero: the tokenized headline and lede on the left; on the right the
 * "maintainers" entry of the model card the Company page ends on, with its
 * last field ("Next") still being written.
 */
export default function CareersHero() {
  const t = useTranslations('Careers.hero');
  const locale = useLocale();
  const words = titleWordsSchema.parse(t.raw('title'));
  const fields = cardFieldsSchema.parse(t.raw('card.fields'));
  const last = fields.length - 1;

  return (
    <section className="pg-hero ca-hero" aria-labelledby="ca-h1">
      <div className="attn-wrap ca-hero-grid">
        <div className="ca-hero-copy">
          <p className="pg-kicker pg-enter">{t('kicker')}</p>
          <TokenTitle
            id="ca-h1"
            words={words}
            toggleLabel={t('tokens.show')}
            caption={t('tokens.caption')}
            bengaliDigits={locale === 'bn'}
          />
          <p className="pg-lede pg-enter" style={delay(3)}>
            {t('lede')}
          </p>
          <div className="pg-actions pg-enter" style={delay(4)}>
            <a className="attn-btn attn-btn-primary" href={CAREERS_MAIL}>
              {t('primary')}
            </a>
            <a className="attn-btn attn-btn-secondary" href="#ca-roles">
              {t('secondary')}
            </a>
          </div>
        </div>

        <aside className="ca-card pg-panel pg-enter" style={delay(3)} aria-label={t('card.ariaLabel')}>
          <p className="ca-card-label">{t('card.label')}</p>
          <p className="ca-card-name">{t('card.name')}</p>
          <dl className="ca-dl">
            {fields.map((f, i) => (
              <div key={f.label} className={`ca-row${i === last ? ' ca-row-next' : ''}`} style={delay(i)}>
                <dt>{f.label}</dt>
                <dd>
                  {f.value}
                  {i === last ? <span className="ca-caret" aria-hidden="true" /> : null}
                </dd>
              </div>
            ))}
          </dl>
          <p className="ca-card-foot">
            <span>{t('card.footer')}</span>
            <Link href="/about">{t('card.link')}</Link>
          </p>
        </aside>
      </div>
    </section>
  );
}
