import { useTranslations } from 'next-intl';
import { stringListSchema } from './attention/schema';
import { BoundaryVisual, LoopVisual, ModelsVisual, ScoreVisual } from './PrincipleVisual';

export default function Principles() {
  const t = useTranslations('Home.principles');
  const models = stringListSchema.parse(t.raw('agnostic.models'));

  const items = [
    { key: 'measured', visual: <ScoreVisual label={t('measured.label')} /> },
    { key: 'private', visual: <BoundaryVisual label={t('private.label')} /> },
    { key: 'agnostic', visual: <ModelsVisual system={t('agnostic.system')} models={models} /> },
    { key: 'loop', visual: <LoopVisual label={t('loop.label')} /> },
  ] as const;

  return (
    <section className="attn-sec" id="company" aria-labelledby="attn-principles-h" style={{ paddingTop: 0 }}>
      <div className="attn-wrap">
        <h2 className="attn-sec-h" id="attn-principles-h">
          {t('title')}
        </h2>
        <ul className="attn-pr-list">
          {items.map(({ key, visual }) => (
            <li key={key} className="attn-pr">
              <div>
                <h3>{t(`${key}.title`)}</h3>
                <p>{t(`${key}.body`)}</p>
              </div>
              {visual}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
