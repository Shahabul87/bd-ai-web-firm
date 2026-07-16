'use client';

import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import SectionHeader from '../../design/ui/SectionHeader';
import Card from '../../design/ui/Card';
import { rise, riseStagger, viewportOnce } from '../../design/motion';

interface ProjectCopy {
  slug: string;
  sector: string;
  platform: string;
  name: string;
  outcome: string;
}

interface Project extends ProjectCopy {
  href: string;
}

/* Routing data stays in code — hrefs must never vary by locale, so they are not
   exposed to translators. Paired by stable `slug`, never by array position: a
   translator reordering the message array is natural and length-preserving, so
   positional pairing would silently repoint every card at the wrong URL. */
const PROJECT_HREFS: Record<string, string> = {
  taxomind: '/portfolio/taxomind',
  'fincoach-ai': '/portfolio/fincoach-ai',
  mathphysics: '/portfolio/mathphysics',
};

/* An unknown slug is a bug, not a fallback case. Throwing surfaces it at
   render; a placeholder href would ship a wrong link to users instead. */
function projectHref(slug: string): string {
  const href = PROJECT_HREFS[slug];
  if (!href) {
    throw new Error(
      `SelectedWork: no route for project slug "${slug}". Routes are defined in ` +
        'PROJECT_HREFS; messages must not add or rename slugs.'
    );
  }
  return href;
}

export default function SelectedWork() {
  const t = useTranslations('Home.work');
  const PROJECTS: Project[] = (t.raw('projects') as ProjectCopy[]).map((project) => ({
    ...project,
    href: projectHref(project.slug),
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
          <motion.div key={project.slug} variants={rise}>
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
