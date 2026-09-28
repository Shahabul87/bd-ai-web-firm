import { useTranslations } from 'next-intl';
import InView from '@/app/components/home/InView';
import SectionLabel from './SectionLabel';
import LayerLens from './LayerLens';
import { LAYER_KINDS, layerRowsSchema, type LayerKind } from './schema';
import { delay } from './cssVars';

/** § 4 Two layers: the X-ray panel. The island gets fully resolved copy. */
export default function TwoLayers() {
  const t = useTranslations('About.layers');
  const rows = layerRowsSchema.parse(t.raw('rows'));
  const kinds = Object.fromEntries(LAYER_KINDS.map((k) => [k, t(`kinds.${k}`)])) as Record<LayerKind, string>;

  return (
    <section className="attn-sec co-sec" aria-labelledby="co-xr-h">
      <div className="attn-wrap">
        <InView once className="co-sec-head">
          <SectionLabel n={4} text={t('label')} className="pg-rise" />
          <h2 className="attn-sec-h pg-rise" id="co-xr-h" style={delay(1)}>
            {t('title')}
          </h2>
          <p className="co-note pg-rise" style={delay(2)}>
            {t('note')}
          </p>
        </InView>
        <InView once>
          <div className="pg-rise">
            <LayerLens
              example={t('example')}
              humanLabel={t('human')}
              machineLabel={t('machine')}
              toggleLabel={t('toggle')}
              kinds={kinds}
              rows={rows}
            />
          </div>
          <p className="co-xr-cap pg-rise" style={delay(1)}>
            {t('caption')}
          </p>
        </InView>
      </div>
    </section>
  );
}
