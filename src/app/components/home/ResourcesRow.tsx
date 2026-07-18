'use client';

import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import SectionHeader from '../../design/ui/SectionHeader';
import { rise, riseStagger, viewportOnce } from '../../design/motion';
import { resourceHref } from './homeRouting';

interface ResourceCopy {
  slug: string;
  type: string;
  title: string;
  readTime: string;
}

interface Resource extends ResourceCopy {
  href: string;
}

export default function ResourcesRow() {
  const t = useTranslations('Home.resources');
  const RESOURCES: Resource[] = (t.raw('items') as ResourceCopy[]).map((resource) => ({
    ...resource,
    href: resourceHref(resource.slug),
  }));

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        {/* `index` is a drafting ornament: it stays English in both locales. */}
        <SectionHeader index="fig. 07" eyebrow={t('eyebrow')} title={t('title')} />
        <Link
          href="/resources"
          className="font-mono text-xs uppercase tracking-[0.15em] text-signal underline-offset-4 hover:underline"
        >
          {t('allResources')}
        </Link>
      </div>

      <motion.div
        className="mt-14 divide-y divide-line border-y border-line"
        variants={riseStagger}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        {RESOURCES.map((resource) => (
          <motion.div key={resource.href} variants={rise}>
            <Link
              href={resource.href}
              className="group grid gap-2 py-6 transition-colors duration-150 hover:bg-ink-900 sm:grid-cols-[140px_1fr_auto] sm:items-center sm:gap-6 sm:px-2"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-signal">
                {resource.type}
              </span>
              <span className="text-base text-bone transition-colors duration-150 group-hover:text-signal">
                {resource.title}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel">
                {resource.readTime}
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
