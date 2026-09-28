import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CONTACT_EMAIL } from '../../home/FinalCTA';

const WHATSAPP_DISPLAY = '+1 775 338 2146';
const WHATSAPP_HREF = 'https://wa.me/17753382146';

/** Email, WhatsApp and the FAQ, under the trace in the side column. */
export default function DirectChannels() {
  const t = useTranslations('Contact.channels');
  return (
    <div className="ct-channels">
      <h3 className="ct-ch-h">{t('title')}</h3>
      <ul>
        <li>
          <span className="ct-ch-k">{t('email')}</span>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </li>
        <li>
          <span className="ct-ch-k">{t('whatsapp')}</span>
          <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer">
            {WHATSAPP_DISPLAY}
            <span className="ct-sr"> {t('newTab')}</span>
          </a>
        </li>
        <li>
          <span className="ct-ch-k">{t('faq')}</span>
          <Link href="/faq">{t('faqValue')}</Link>
        </li>
      </ul>
    </div>
  );
}
