import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import GeneratedTitle from './GeneratedTitle';

/** The studio's public inbox; the same address the footer lists. */
export const CONTACT_EMAIL = 'hello@craftsai.org';

export default function FinalCTA() {
  const t = useTranslations('Home.finalCta');
  return (
    <section className="attn-cta" id="contact" aria-labelledby="attn-cta-h">
      <div className="attn-wrap">
        <GeneratedTitle id="attn-cta-h" text={t('title')} />
        <p>{t('lede')}</p>
        <div className="attn-actions">
          <Link className="attn-btn attn-btn-primary" href="/contact">
            {t('primary')}
          </Link>
          <a className="attn-btn attn-btn-secondary" href={`mailto:${CONTACT_EMAIL}`}>
            {t('secondary')}
          </a>
        </div>
        <span className="attn-mail">
          {t('mailPrefix')} <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </span>
      </div>
    </section>
  );
}
