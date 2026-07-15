import { Metadata } from 'next';
import PageLayout from '@/app/components/layout/PageLayout';
import PageHero from '@/app/components/shared/PageHero';
import CTABand from '@/app/components/shared/CTABand';
import SectionHeader from '@/app/design/ui/SectionHeader';
import ConveyorProcess, { ConveyorPhase } from '@/app/components/process/ConveyorProcess';

export const metadata: Metadata = {
  title: 'Our Development Process',
  description:
    'From discovery to launch in 5 clear phases. Learn how CraftsAI delivers AI-powered web, Android, and iOS projects with weekly demos and transparent communication.',
  openGraph: {
    title: 'Our Development Process',
    description: 'From discovery to launch in 5 clear phases.',
    url: 'https://www.craftsai.org/process',
  },
  alternates: { canonical: 'https://www.craftsai.org/process' },
};

/* A real sequence — station numbers encode the order the work happens in. */
const PHASES: ConveyorPhase[] = [
  {
    number: '01',
    title: 'Discovery',
    label: 'DISCOVERY',
    what: 'Free consultation to understand your needs. We discuss your goals, target audience, and success criteria to make sure we are aligned before any code is written.',
    deliverables: 'Requirements document, project scope',
    yourRole: 'Share your vision and goals',
    timeline: '1–2 days',
  },
  {
    number: '02',
    title: 'Planning',
    label: 'PLANNING',
    what: 'Architecture design, technology selection, and milestone planning. We map out the entire project so there are no surprises down the road.',
    deliverables: 'Technical spec, project timeline, cost estimate',
    yourRole: 'Review and approve plan',
    timeline: '2–3 days',
  },
  {
    number: '03',
    title: 'Development',
    label: 'DEVELOPMENT',
    what: 'AI agents generate code while engineers review and refine. You see working features early and often through regular demos.',
    deliverables: 'Working features, regular demos',
    yourRole: 'Weekly check-ins, feedback',
    timeline: '1–4 weeks',
  },
  {
    number: '04',
    title: 'Testing',
    label: 'TESTING',
    what: 'Comprehensive QA, performance testing, and security audit. We catch issues before your users do.',
    deliverables: 'Test reports, bug-free application',
    yourRole: 'User acceptance testing',
    timeline: '3–5 days',
  },
  {
    number: '05',
    title: 'Launch & Support',
    label: 'LAUNCH',
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
        title="Your project rides the line."
        lede="Five stations between idea and launch. Watch it move — no black boxes, no surprises, just a build you can follow with your own eyes."
      />

      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <SectionHeader
          index="fig. 01"
          eyebrow="The line"
          title="How a project moves through CraftsAI."
        />
        <ConveyorProcess phases={PHASES} totalNote="05 stations · typical total 2–6 weeks" />
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
