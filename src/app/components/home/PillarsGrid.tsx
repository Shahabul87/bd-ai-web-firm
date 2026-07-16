import { getTranslations } from 'next-intl/server';
import SectionHeader from '../../design/ui/SectionHeader';
import PillarCards from '../shared/PillarCards';

export default async function PillarsGrid() {
  const t = await getTranslations('Home.pillars');

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
      {/* `index` is a drafting ornament: it stays English in both locales. */}
      <SectionHeader
        index="fig. 02"
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />
      <div className="mt-14">
        <PillarCards />
      </div>
    </section>
  );
}
