import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { toBengaliDigits } from '@/app/lib/numerals';
import ModelCard from './ModelCard';
import { cardFieldsSchema } from './schema';
import { delay } from './cssVars';

/** The card's revision: the year this card was last rewritten (a constant, not the clock). */
const REVISION_YEAR = 2026;

/**
 * Company hero: the headline and lede on the left, and the signature piece,
 * CraftsAI's own model card compiling itself over a weights matrix, on the right.
 */
export default function CompanyHero() {
  const t = useTranslations('About.hero');
  const locale = useLocale();
  const fields = cardFieldsSchema.parse(t.raw('card.fields'));
  const year = locale === 'bn' ? toBengaliDigits(REVISION_YEAR) : String(REVISION_YEAR);

  return (
    <section className="pg-hero co-hero" aria-labelledby="co-h1">
      <div className="attn-wrap co-hero-grid">
        <div className="co-hero-copy">
          <p className="pg-kicker pg-enter">{t('kicker')}</p>
          <h1 id="co-h1" className="pg-h1 pg-enter" style={delay(1)}>
            {t.rich('title', { em: (chunks) => <em>{chunks}</em> })}
          </h1>
          <p className="pg-lede pg-enter" style={delay(2)}>
            {t('lede')}
          </p>
          <div className="pg-actions pg-enter" style={delay(3)}>
            <Link className="attn-btn attn-btn-primary" href="/contact">
              {t('primary')}
            </Link>
            <Link className="attn-btn attn-btn-secondary" href="/process">
              {t('secondary')}
            </Link>
          </div>
        </div>
        <ModelCard
          ariaLabel={t('card.ariaLabel')}
          label={t('card.label')}
          name={t('card.name')}
          revision={t('card.revision', { year })}
          footer={t('card.footer')}
          fields={fields}
        />
      </div>
    </section>
  );
}
