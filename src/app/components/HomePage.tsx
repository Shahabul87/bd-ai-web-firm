import { useLocale, useTranslations } from 'next-intl';
import AttentionHero from './home/AttentionHero';
import TokenBand from './home/TokenBand';
import ServicesIndex, { SERVICE_KEYS } from './home/ServicesIndex';
import Principles from './home/Principles';
import ProcessSteps from './home/ProcessSteps';
import { STEP_KEYS } from './home/ProcessArtifacts';
import ExampleTraces from './home/ExampleTraces';
import FinalCTA from './home/FinalCTA';
import { artifactCopySchema, heroDataSchema } from './home/attention/schema';
import { toBengaliDigits } from '@/app/lib/numerals';

/**
 * The "Attention" home page (docs/design/home-redesign/mock-a-attention.html).
 * A server component: every section renders its copy on the server; only the
 * hero, the principle visuals, the process track and the CTA title hydrate.
 */
export default function HomePage() {
  const t = useTranslations('Home');
  const locale = useLocale();

  // Throws at render (so in the build) if the message data is malformed.
  const hero = heroDataSchema.parse(t.raw('hero'));

  const steps = STEP_KEYS.map((key, i) => ({
    key,
    number: locale === 'bn' ? toBengaliDigits(i + 1) : String(i + 1),
    title: t(`process.${key}.title`),
    body: t(`process.${key}.body`),
  }));
  const artifacts = artifactCopySchema.parse(
    Object.fromEntries(STEP_KEYS.map((key) => [key, t.raw(`process.${key}.artifact`)])),
  );

  return (
    <div className="attn">
      <AttentionHero
        data={hero}
        hint={t('hero.hint')}
        lede={t('hero.lede')}
        ctaPrimary={t('hero.ctaPrimary')}
        ctaSecondary={t('hero.ctaSecondary')}
      />
      <TokenBand phrases={SERVICE_KEYS.map((key) => t(`services.${key}.title`))} />
      <ServicesIndex />
      <Principles />
      <ProcessSteps
        title={t('process.title')}
        note={t('process.note')}
        exampleLabel={t('process.exampleLabel')}
        steps={steps}
        artifacts={artifacts}
      />
      <ExampleTraces />
      <FinalCTA />
    </div>
  );
}
