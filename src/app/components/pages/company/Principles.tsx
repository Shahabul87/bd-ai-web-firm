import { useLocale, useTranslations } from 'next-intl';
import InView from '@/app/components/home/InView';
import SectionLabel from './SectionLabel';
import { EvalRig, GateRig, RingRig, SocketRig } from './PrincipleRigs';
import { stringListSchema } from './schema';
import { delay } from './cssVars';

/** § 3 Evaluation & principles: the four principles, each with its own live rig. */
export default function Principles() {
  const t = useTranslations('About.principles');
  const locale = useLocale();
  const criteria = stringListSchema.parse(t.raw('measured.criteria'));
  const models = stringListSchema.parse(t.raw('agnostic.models'));

  const items = [
    {
      key: 'measured',
      rig: (
        <EvalRig
          example={t('measured.example')}
          tally={t.raw('measured.tally') as string}
          bar={t('measured.bar')}
          criteria={criteria}
          bengali={locale === 'bn'}
        />
      ),
    },
    { key: 'private', rig: <RingRig inside={t('private.inside')} outside={t('private.outside')} /> },
    {
      key: 'agnostic',
      rig: (
        <InView className="co-socket-wrap">
          <SocketRig system={t('agnostic.system')} models={models} />
        </InView>
      ),
    },
    { key: 'loop', rig: <GateRig person={t('loop.person')} approve={t('loop.approve')} /> },
  ] as const;

  return (
    <section className="attn-sec co-sec" aria-labelledby="co-pr-h">
      <div className="attn-wrap">
        <InView once className="co-sec-head">
          <SectionLabel n={3} text={t('label')} className="pg-rise" />
          <h2 className="attn-sec-h pg-rise" id="co-pr-h" style={delay(1)}>
            {t('title')}
          </h2>
          <p className="co-note pg-rise" style={delay(2)}>
            {t('note')}
          </p>
        </InView>
        <InView once>
          <ul className="co-pr-grid">
            {items.map(({ key, rig }, i) => (
              <li key={key} className="co-pr pg-panel pg-rise" style={delay(i)}>
                <div className="co-pr-vis">{rig}</div>
                <h3>{t(`${key}.title`)}</h3>
                <p>{t(`${key}.body`)}</p>
              </li>
            ))}
          </ul>
        </InView>
      </div>
    </section>
  );
}
