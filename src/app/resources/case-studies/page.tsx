import { Metadata } from 'next';
import Link from 'next/link';
import PageLayout from '../../components/layout/PageLayout';
import PageHero from '../../components/shared/PageHero';
import CTABand from '../../components/shared/CTABand';
import Card from '../../design/ui/Card';
import { getAllCaseStudies } from '@/app/lib/content';

export const metadata: Metadata = {
  title: 'Case Studies - Real AI Development Results',
  description:
    'See how our AI-powered development delivers real results. Browse case studies across EdTech, FinTech, and more.',
  openGraph: {
    title: 'Case Studies | CraftsAI',
    description:
      'Real results from our AI-powered development projects.',
    url: 'https://www.craftsai.org/resources/case-studies',
    siteName: 'CraftsAI',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.craftsai.org/resources/case-studies',
  },
};

export default function CaseStudiesListingPage() {
  const caseStudies = getAllCaseStudies();

  return (
    <PageLayout>
      <PageHero
        eyebrow="Resources / Case studies"
        title="Real projects, real results."
        lede="See how AI-powered development delivers measurable outcomes for businesses across industries."
      />

      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        {caseStudies.length === 0 ? (
          <p className="text-base text-steel">No case studies yet — check back soon.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {caseStudies.map((cs) => (
              <Link
                key={cs.slug}
                href={`/resources/case-studies/${cs.slug}`}
                className="group block h-full focus-visible:outline-none"
              >
                <Card interactive className="flex h-full flex-col">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-steel">
                    <span className="text-signal">{cs.industry}</span>
                    <span>{cs.client}</span>
                  </div>
                  <h2 className="mt-6 font-display text-xl font-medium text-bone">{cs.title}</h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">{cs.excerpt}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {cs.services.map((service) => (
                      <span
                        key={service}
                        className="border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-steel"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                  <span className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-bone transition-colors duration-150 group-hover:text-signal">
                    Read case study
                    <span aria-hidden className="transition-transform duration-150 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <CTABand />
    </PageLayout>
  );
}
