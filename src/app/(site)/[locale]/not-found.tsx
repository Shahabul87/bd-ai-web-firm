import { getTranslations } from 'next-intl/server';
import PageLayout from '@/app/components/layout/PageLayout';
import Button from '@/app/design/ui/Button';
import MonoLabel from '@/app/design/ui/MonoLabel';

export default async function NotFound() {
  const t = await getTranslations('NotFound');
  return (
    <PageLayout>
      <section className="flex min-h-[70vh] items-center justify-center bg-ink-950 px-6 py-24">
        <div className="text-center">
          <MonoLabel className="text-signal">{t('eyebrow')}</MonoLabel>
          <h1 className="mt-6 font-display text-5xl font-medium text-bone sm:text-6xl">
            {t('title')}
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-steel">
            {t('lede')}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
            <Button variant="signal" size="lg" href="/">
              {t('primaryLabel')}
            </Button>
            <Button variant="ghost" size="lg" href="/contact">
              {t('secondaryLabel')}
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
