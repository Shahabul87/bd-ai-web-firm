import type { CSSProperties } from 'react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import PageLayout from '@/app/components/layout/PageLayout';
import OodAddress from '@/app/components/pages/system/OodAddress';

const d = (n: number) => ({ '--d': n }) as CSSProperties;
const SUGGESTIONS = [
  { key: 'home', href: '/' },
  { key: 'services', href: '/services' },
  { key: 'work', href: '/products' },
  { key: 'contact', href: '/contact' },
] as const;

/**
 * 404 — "Out of distribution". The requested address is read token by token
 * and rejected (OodAddress); the closest pages we do have follow as mint
 * candidates. Bars are illustrative, not real probabilities.
 */
export default async function NotFound() {
  const t = await getTranslations('NotFound');
  return (
    <PageLayout>
      <div className="attn pg-system">
        <section className="sy-main" aria-labelledby="sy-404-h">
          <div className="attn-wrap sy-grid">
            <div className="sy-copy">
              <p className="pg-kicker sy-kicker pg-enter">{t('kicker')}</p>
              <h1 id="sy-404-h" className="pg-h1 sy-h1 pg-enter" style={d(1)}>
                {t('title')}
              </h1>
              <p className="pg-lede pg-enter" style={d(2)}>
                {t('lede')}
              </p>
            </div>
            <div className="sy-fig pg-enter" style={d(2)}>
              <OodAddress
                labels={{
                  label: t('visual.label'),
                  placeholder: t('visual.placeholder'),
                  rejected: t('visual.rejected'),
                  candidates: t('visual.candidates'),
                  note: t('visual.note'),
                }}
              />
              <nav className="sy-suggest" aria-labelledby="sy-suggest-h">
                <p id="sy-suggest-h" className="sy-suggest-h pg-cap">
                  {t('suggest.label')}
                </p>
                <ul>
                  {SUGGESTIONS.map((s, i) => (
                    <li key={s.key} style={d(i + 3)} className="pg-enter">
                      <Link href={s.href} className="sy-sug">
                        <span className="sy-sug-t">{t(`suggest.${s.key}`)}</span>
                        <span className="sy-sug-n">{t(`suggest.${s.key}Note`)}</span>
                        <span className="sy-sug-bar" aria-hidden="true">
                          <i style={{ '--p': 0.9 - i * 0.1 } as CSSProperties} />
                        </span>
                        <span className="sy-sug-arr" aria-hidden="true">
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
