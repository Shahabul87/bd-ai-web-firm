import { useLocale, useTranslations } from 'next-intl';
import { toBengaliDigits } from '@/app/lib/numerals';
import InView from './InView';
import {
  AgentsDiagram,
  AssistantsDiagram,
  EvalsDiagram,
  ModelsDiagram,
  ProductDiagram,
  SprintDiagram,
} from './ServiceDiagrams';

/** Order is editorial, not alphabetical: the flagship leads. */
export const SERVICE_KEYS = ['agents', 'assistants', 'models', 'product', 'evals', 'sprint'] as const;
export type ServiceKey = (typeof SERVICE_KEYS)[number];

export default function ServicesIndex() {
  const t = useTranslations('Home.services');
  const locale = useLocale();
  const ordinal = (i: number) => {
    const n = String(i + 1).padStart(2, '0');
    return locale === 'bn' ? toBengaliDigits(n) : n;
  };
  const label = (key: ServiceKey, name: string) => t(`${key}.labels.${name}`);

  const diagrams: Record<ServiceKey, React.ReactNode> = {
    agents: (
      <AgentsDiagram
        labels={{
          agent: label('agents', 'agent'),
          tickets: label('agents', 'tickets'),
          crm: label('agents', 'crm'),
          replies: label('agents', 'replies'),
          person: label('agents', 'person'),
          handoff: label('agents', 'handoff'),
        }}
      />
    ),
    assistants: (
      <AssistantsDiagram
        labels={{
          question: label('assistants', 'question'),
          sourceA: label('assistants', 'sourceA'),
          sourceB: label('assistants', 'sourceB'),
          sourceC: label('assistants', 'sourceC'),
        }}
      />
    ),
    models: (
      <ModelsDiagram
        labels={{
          loss: label('models', 'loss'),
          steps: label('models', 'steps'),
          baseline: label('models', 'baseline'),
          tuned: label('models', 'tuned'),
        }}
      />
    ),
    product: (
      <ProductDiagram
        labels={{ ai: label('product', 'ai'), web: label('product', 'web'), mobile: label('product', 'mobile') }}
      />
    ),
    evals: (
      <EvalsDiagram
        labels={{ pass: label('evals', 'pass'), fail: label('evals', 'fail'), suite: label('evals', 'suite') }}
      />
    ),
    sprint: (
      <SprintDiagram
        labels={{
          weekOne: label('sprint', 'weekOne'),
          weekTwo: label('sprint', 'weekTwo'),
          prototype: label('sprint', 'prototype'),
        }}
      />
    ),
  };

  return (
    <section className="attn-sec" id="services" aria-labelledby="attn-services-h">
      <div className="attn-wrap">
        <h2 className="attn-sec-h" id="attn-services-h">
          {t('title')}
        </h2>
        <div className="attn-svc-list">
          {SERVICE_KEYS.map((key, i) => (
            <InView key={key} className={i === 0 ? 'attn-svc attn-svc-flag' : 'attn-svc'}>
              <span className="attn-svc-n">{ordinal(i)}</span>
              <div>
                <h3>{t(`${key}.title`)}</h3>
                <p>{t(`${key}.body`)}</p>
              </div>
              <div className="attn-svc-v">{diagrams[key]}</div>
            </InView>
          ))}
        </div>
      </div>
    </section>
  );
}
