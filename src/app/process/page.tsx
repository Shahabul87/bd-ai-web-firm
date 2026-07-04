import { Metadata } from 'next';
import PageLayout from '../components/layout/PageLayout';
import PageHero from '../components/shared/PageHero';
import CTABand from '../components/shared/CTABand';
import SectionHeader from '../design/ui/SectionHeader';
import Card from '../design/ui/Card';
import SpecTable from '../design/ui/SpecTable';

export const metadata: Metadata = {
  title: 'Our Development Process | CraftsAI',
  description:
    'From discovery to launch in 5 clear phases. Learn how CraftsAI delivers AI-powered web, Android, and iOS projects with weekly demos and transparent communication.',
  openGraph: {
    title: 'Our Development Process | CraftsAI',
    description: 'From discovery to launch in 5 clear phases.',
    url: 'https://www.craftsai.org/process',
  },
  alternates: { canonical: 'https://www.craftsai.org/process' },
};

interface Phase {
  number: string;
  title: string;
  what: string;
  deliverables: string;
  yourRole: string;
  timeline: string;
}

/* A real sequence — numbering encodes the order the reader follows. */
const PHASES: Phase[] = [
  {
    number: '01',
    title: 'Discovery',
    what: 'Free consultation to understand your needs. We discuss your goals, target audience, and success criteria to make sure we are aligned before any code is written.',
    deliverables: 'Requirements document, project scope',
    yourRole: 'Share your vision and goals',
    timeline: '1–2 days',
  },
  {
    number: '02',
    title: 'Planning',
    what: 'Architecture design, technology selection, and milestone planning. We map out the entire project so there are no surprises down the road.',
    deliverables: 'Technical spec, project timeline, cost estimate',
    yourRole: 'Review and approve plan',
    timeline: '2–3 days',
  },
  {
    number: '03',
    title: 'Development',
    what: 'AI agents generate code while engineers review and refine. You see working features early and often through regular demos.',
    deliverables: 'Working features, regular demos',
    yourRole: 'Weekly check-ins, feedback',
    timeline: '1–4 weeks',
  },
  {
    number: '04',
    title: 'Testing',
    what: 'Comprehensive QA, performance testing, and security audit. We catch issues before your users do.',
    deliverables: 'Test reports, bug-free application',
    yourRole: 'User acceptance testing',
    timeline: '3–5 days',
  },
  {
    number: '05',
    title: 'Launch & Support',
    what: 'Deployment, monitoring setup, and handoff. We make sure everything runs smoothly and your team is fully equipped to take over.',
    deliverables: 'Live application, documentation, training',
    yourRole: 'Final approval',
    timeline: '1–2 days',
  },
];

const COMMUNICATION_ITEMS = [
  {
    title: 'Weekly Progress Reports',
    description: 'Detailed updates on what was completed, what is next, and any blockers.',
  },
  {
    title: 'Direct Messaging',
    description: 'Reach us anytime via WhatsApp or email. No ticketing queues.',
  },
  {
    title: 'Live Demos at Milestones',
    description: 'See working software at every major milestone, not just at the end.',
  },
  {
    title: 'Dedicated Project Channel',
    description: 'A shared channel for your team and ours to keep everything in one place.',
  },
];

export default function ProcessPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Process"
        title="Five phases, start to ship."
        lede="No black boxes, no surprises — just transparent, predictable delivery from discovery to launch."
      />

      <section className="mx-auto max-w-4xl px-6 py-20 sm:py-28">
        <SectionHeader
          index="fig. 01"
          eyebrow="The pipeline"
          title="How a project moves through CraftsAI."
        />

        <ol className="mt-14 space-y-6 border-l border-line pl-8 sm:pl-10">
          {PHASES.map((phase) => (
            <li key={phase.number} className="relative">
              <span
                aria-hidden
                className="absolute -left-[calc(2rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full bg-signal sm:-left-[calc(2.5rem+5px)]"
              />
              <Card>
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-signal">
                  {phase.number}
                </span>
                <h3 className="mt-4 font-display text-2xl font-medium text-bone">
                  {phase.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-steel">{phase.what}</p>
                <div className="mt-6">
                  <SpecTable
                    rows={[
                      { label: 'Deliverables', value: phase.deliverables },
                      { label: 'Your role', value: phase.yourRole },
                      { label: 'Timeline', value: phase.timeline },
                    ]}
                  />
                </div>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-line bg-ink-900">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <SectionHeader
            index="fig. 02"
            eyebrow="How we communicate"
            title="Transparency is how we work."
            description="You will always know where your project stands."
          />
          <div className="mt-14 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {COMMUNICATION_ITEMS.map((item) => (
              <div key={item.title} className="bg-ink-950 p-6">
                <h3 className="font-display text-lg font-medium text-bone">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-steel">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABand
        title="Ready to get started?"
        lede="Phase 1 is free. Tell us about your project and we'll schedule a discovery call within 24 hours."
        primaryLabel="Start your project"
        primaryHref="/quote"
        secondaryLabel="See our services"
        secondaryHref="/services"
      />
    </PageLayout>
  );
}
