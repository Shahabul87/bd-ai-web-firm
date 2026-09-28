import type { ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import InView from '@/app/components/home/InView';
import { toBengaliDigits } from '@/app/lib/numerals';
import PageCTA from '../PageCTA';
import { delay } from '../company/cssVars';
import LegalToc from './LegalToc';

export const LEGAL_DOCS = ['privacy', 'terms', 'cookies'] as const;
export type LegalDocKey = (typeof LEGAL_DOCS)[number];

export interface LegalSection {
  /** Anchor id (also the message key of the section). */
  id: string;
  title: string;
  body: ReactNode;
}

interface LegalDocProps {
  doc: LegalDocKey;
  sections: LegalSection[];
}

/** Anchor ids are the section keys in kebab case: "dataRetention" → "data-retention". */
export const anchorId = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/**
 * The shared reading template of the privacy, terms and cookie pages: title
 * and last-updated line, a table of contents that tracks the section being
 * read, numbered sections with serif headings and anchor links, a comfortable
 * measure, and links to the other two policies.
 */
export default function LegalDoc({ doc, sections }: LegalDocProps) {
  const t = useTranslations('Legal');
  const locale = useLocale();
  const n = (i: number) => {
    const s = String(i + 1).padStart(2, '0');
    return locale === 'bn' ? toBengaliDigits(s) : s;
  };
  const items = sections.map((s, i) => ({ id: s.id, n: n(i), title: s.title }));

  return (
    <div className="attn pg-legal">
      <section className="pg-hero lg-hero" aria-labelledby="lg-h1">
        <div className="attn-wrap">
          <p className="pg-kicker pg-enter">{t('kicker')}</p>
          <h1 className="pg-h1 lg-h1 pg-enter" id="lg-h1" style={delay(1)}>
            {t(`${doc}.title`)}
          </h1>
          <p className="pg-lede pg-enter" style={delay(2)}>
            {t(`${doc}.lede`)}
          </p>
          <p className="lg-updated pg-enter" style={delay(3)}>
            <span className="lg-updated-dot" aria-hidden="true" />
            {t('toc.updatedLabel')}: <time>{t(`${doc}.updated`)}</time>
          </p>
        </div>
      </section>

      <div className="attn-wrap lg-grid">
        <aside className="lg-side">
          <LegalToc items={items} label={t('toc.label')} />
          <div className="lg-related">
            <p className="pg-cap">{t('toc.related')}</p>
            <ul>
              {LEGAL_DOCS.filter((d) => d !== doc).map((d) => (
                <li key={d}>
                  <Link href={`/${d}`}>{t(`docs.${d}`)}</Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <article className="lg-article" aria-labelledby="lg-h1">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="lg-sec" aria-labelledby={`${s.id}-h`}>
              <InView once className="lg-sec-head">
                <span className="lg-sec-n" aria-hidden="true">
                  {items[i].n}
                </span>
                <span className="lg-sec-rule" aria-hidden="true" />
              </InView>
              <div className="lg-sec-title">
                <h2 id={`${s.id}-h`}>{s.title}</h2>
                <a className="lg-anchor" href={`#${s.id}`} aria-label={t('toc.anchor', { title: s.title })}>
                  #
                </a>
              </div>
              <div className="lg-body">{s.body}</div>
            </section>
          ))}
        </article>
      </div>

      <PageCTA
        id="lg-cta-h"
        title={t('cta.title')}
        lede={t('cta.lede')}
        primaryLabel={t('cta.primaryLabel')}
        secondaryLabel={t('cta.secondaryLabel')}
      />
    </div>
  );
}
