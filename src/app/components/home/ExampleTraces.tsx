import type { CSSProperties } from 'react';
import { useTranslations } from 'next-intl';
import InView from './InView';
import { fieldsSchema, salesStepsSchema, stringListSchema, traceRowsSchema } from './attention/schema';

const delay = (d: number) => ({ '--d': d }) as CSSProperties;

export default function ExampleTraces() {
  const t = useTranslations('Home.work');
  const trace = traceRowsSchema.parse(t.raw('support.trace'));
  const fields = fieldsSchema.parse(t.raw('documents.fields'));
  const salesSteps = salesStepsSchema.parse(t.raw('sales.steps'));
  const sources = stringListSchema.parse(t.raw('knowledge.sources'));

  const text = (key: string) => (
    <div className="attn-wk-t">
      <span className="attn-tag">{t('tag')}</span>
      <h3>{t(`${key}.title`)}</h3>
      <p>{t(`${key}.body`)}</p>
    </div>
  );

  return (
    <section className="attn-sec" id="work" aria-labelledby="attn-work-h">
      <div className="attn-wrap">
        <h2 className="attn-sec-h" id="attn-work-h">
          {t('title')}
        </h2>
        <p className="attn-sec-note">{t('note')}</p>
        <div className="attn-work-list">
          <InView className="attn-wk" once>
            {text('support')}
            <div className="attn-wk-v">
              <ol className="attn-trace rv">
                {trace.map((row, i) => (
                  <li key={`${row.text}-${i}`} style={delay(i)}>
                    <span className={`dot${row.kind === 'head' ? ' a' : row.kind === 'escalate' ? ' r' : ''}`} />
                    <span className={row.kind === 'head' ? 'head' : 'sub'}>{row.text}</span>
                    <span className={`st${row.kind === 'step' ? '' : ' a'}`}>{row.status}</span>
                  </li>
                ))}
              </ol>
            </div>
          </InView>

          <InView className="attn-wk" once>
            {text('documents')}
            <div className="attn-wk-v">
              <div className="attn-pipe">
                <span className="attn-chip">{t('documents.file')}</span>
                <span className="wire" />
                <span className="attn-chip m">{t('documents.extracted')}</span>
              </div>
              <div className="attn-fields">
                {fields.map((field) => (
                  <span key={field.label} className={field.flag ? 'flag' : undefined}>
                    {field.label} <b>{field.value}</b>
                  </span>
                ))}
              </div>
              <span className="attn-chip r">{t('documents.flagged')}</span>
            </div>
          </InView>

          <InView className="attn-wk" once>
            {text('sales')}
            <div className="attn-wk-v">
              <ol className="attn-steps3 rv">
                {salesSteps.map((step, i) => (
                  <li key={step.title} style={delay(i)}>
                    {step.title}
                    <span>{step.detail}</span>
                  </li>
                ))}
              </ol>
            </div>
          </InView>

          <InView className="attn-wk" once>
            {text('knowledge')}
            <div className="attn-wk-v">
              <div className="attn-qa">
                <div className="q">{t('knowledge.question')}</div>
                <div className="a">
                  {t('knowledge.answer')}
                  <div className="attn-srcs">
                    {sources.map((source, i) => (
                      <span key={source} className={`attn-chip${i < 2 ? ' m' : ''}`}>
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </InView>
        </div>
      </div>
    </section>
  );
}
