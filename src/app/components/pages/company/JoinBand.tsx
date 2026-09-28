import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import InView from '@/app/components/home/InView';
import SectionLabel from './SectionLabel';
import { delay } from './cssVars';

/** § 5 Maintainers: a short band pointing to /careers, written as one more card field. */
export default function JoinBand() {
  const t = useTranslations('About.join');
  return (
    <section className="co-join" aria-labelledby="co-join-h">
      <div className="attn-wrap">
        <InView once className="co-join-in">
          <div>
            <SectionLabel n={5} text={t('label')} className="pg-rise" />
            <h2 className="co-join-h pg-rise" id="co-join-h" style={delay(1)}>
              {t('title')}
            </h2>
            <p className="co-note pg-rise" style={delay(2)}>
              {t('body')}
            </p>
          </div>
          <div className="co-join-card pg-panel pg-rise" style={delay(2)}>
            <dl className="co-dl">
              <div className="co-row">
                <dt>{t('field')}</dt>
                <dd>
                  {t('value')}
                  <span className="co-join-caret" aria-hidden="true" />
                </dd>
              </div>
            </dl>
            <Link className="attn-btn attn-btn-primary" href="/careers">
              {t('cta')}
            </Link>
          </div>
        </InView>
      </div>
    </section>
  );
}
