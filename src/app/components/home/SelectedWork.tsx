'use client';

import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import SectionHeader from '../../design/ui/SectionHeader';
import Card from '../../design/ui/Card';
import { rise, riseStagger, viewportOnce } from '../../design/motion';

interface ProjectCopy {
  sector: string;
  platform: string;
  name: string;
  outcome: string;
}

interface Project extends ProjectCopy {
  href: string;
}

/* Routing data stays in code — hrefs must never vary by locale, so they are not
   exposed to translators. Zipped positionally with the copy; the messages
   parity test pins both arrays to the same length. */
const PROJECT_HREFS = ['/portfolio/taxomind', '/portfolio/fincoach-ai', '/portfolio/mathphysics'];

export default function SelectedWork() {
  const t = useTranslations('Home.work');
  const PROJECTS: Project[] = (t.raw('projects') as ProjectCopy[]).map((project, i) => ({
    ...project,
    href: PROJECT_HREFS[i],
  }));

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        {/* `index` is a drafting ornament: it stays English in both locales. */}
        <SectionHeader index="fig. 05" eyebrow={t('eyebrow')} title={t('title')} />
        <Link
          href="/portfolio"
          className="font-mono text-xs uppercase tracking-[0.15em] text-signal underline-offset-4 hover:underline"
        >
          {t('allWork')}
        </Link>
      </div>

      <motion.div
        className="mt-14 grid gap-6 md:grid-cols-3"
        variants={riseStagger}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        {PROJECTS.map((project) => (
          <motion.div key={project.name} variants={rise}>
            <Link href={project.href} className="block h-full focus-visible:outline-none">
              <Card interactive className="flex h-full flex-col">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-steel">
                  <span>{project.sector}</span>
                  <span className="text-signal">{project.platform}</span>
                </div>
                <h3 className="mt-6 font-display text-2xl font-medium text-bone">
                  {project.name}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
                  {project.outcome}
                </p>
                <span className="mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-bone transition-colors duration-150 group-hover:text-signal">
                  {t('readCaseStudy')}
                  <span aria-hidden>→</span>
                </span>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
