import { Link } from '@/i18n/navigation';
import GeneratedTitle from '../home/GeneratedTitle';
import { CONTACT_EMAIL } from '../home/FinalCTA';

interface PageCTAProps {
  /** Unique heading id on the page. */
  id: string;
  title: string;
  lede: string;
  primaryLabel: string;
  primaryHref?: string;
  /** Defaults to an email link to the studio inbox. */
  secondaryLabel?: string;
  secondaryHref?: string;
}

/**
 * The closing call to action of every inner page: the home page's typed-in
 * heading (GeneratedTitle) with page-specific copy, so each page ends on the
 * same beat the home page does.
 */
export default function PageCTA({
  id,
  title,
  lede,
  primaryLabel,
  primaryHref = '/contact',
  secondaryLabel,
  secondaryHref,
}: PageCTAProps) {
  const secondaryIsMail = !secondaryHref;
  return (
    <section className="attn-cta pg-cta" aria-labelledby={id}>
      <div className="attn-wrap">
        <GeneratedTitle id={id} text={title} />
        <p>{lede}</p>
        <div className="attn-actions">
          <Link className="attn-btn attn-btn-primary" href={primaryHref}>
            {primaryLabel}
          </Link>
          {secondaryLabel ? (
            secondaryIsMail ? (
              <a className="attn-btn attn-btn-secondary" href={`mailto:${CONTACT_EMAIL}`}>
                {secondaryLabel}
              </a>
            ) : (
              <Link className="attn-btn attn-btn-secondary" href={secondaryHref}>
                {secondaryLabel}
              </Link>
            )
          ) : null}
        </div>
      </div>
    </section>
  );
}
