import { Metadata } from 'next';
import PageLayout from '../components/layout/PageLayout';
import Button from '../components/ui/Button';

export const metadata: Metadata = {
  title: 'Our Development Process | CraftsAI',
  description:
    'From discovery to launch in 5 clear phases. Learn how CraftsAI delivers AI-powered web, Android, and iOS projects with weekly demos and transparent communication.',
  openGraph: {
    title: 'Our Development Process | CraftsAI',
    description:
      'From discovery to launch in 5 clear phases.',
    url: 'https://www.craftsai.org/process',
  },
  alternates: { canonical: 'https://www.craftsai.org/process' },
};

const phases = [
  {
    icon: '\uD83D\uDCAC',
    number: 1,
    title: 'Discovery',
    what: 'Free consultation to understand your needs. We discuss your goals, target audience, and success criteria to make sure we are aligned before any code is written.',
    deliverables: 'Requirements document, project scope',
    yourRole: 'Share your vision and goals',
    timeline: '1\u20132 days',
  },
  {
    icon: '\uD83D\uDCCB',
    number: 2,
    title: 'Planning',
    what: 'Architecture design, technology selection, and milestone planning. We map out the entire project so there are no surprises down the road.',
    deliverables: 'Technical spec, project timeline, cost estimate',
    yourRole: 'Review and approve plan',
    timeline: '2\u20133 days',
  },
  {
    icon: '\uD83E\uDD16',
    number: 3,
    title: 'Development',
    what: 'AI agents generate code while engineers review and refine. You see working features early and often through regular demos.',
    deliverables: 'Working features, regular demos',
    yourRole: 'Weekly check-ins, feedback',
    timeline: '1\u20134 weeks',
  },
  {
    icon: '\u2705',
    number: 4,
    title: 'Testing',
    what: 'Comprehensive QA, performance testing, and security audit. We catch issues before your users do.',
    deliverables: 'Test reports, bug-free application',
    yourRole: 'User acceptance testing',
    timeline: '3\u20135 days',
  },
  {
    icon: '\uD83D\uDE80',
    number: 5,
    title: 'Launch & Support',
    what: 'Deployment, monitoring setup, and handoff. We make sure everything runs smoothly and your team is fully equipped to take over.',
    deliverables: 'Live application, documentation, training',
    yourRole: 'Final approval',
    timeline: '1\u20132 days',
  },
];

const communicationItems = [
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
      {/* Hero */}
      <section
        className="py-20 md:py-28"
        style={{
          background:
            'linear-gradient(180deg, var(--background) 0%, var(--surface-sunken) 100%)',
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--foreground)]">
            Our Development Process
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-[var(--text-secondary)]">
            Five clear phases from discovery to launch. No black boxes, no
            surprises &mdash; just transparent, predictable delivery.
          </p>
        </div>
      </section>

      {/* Phases */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {phases.map((phase) => (
              <div
                key={phase.number}
                className="relative rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 md:p-8"
              >
                {/* Phase header */}
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white text-lg font-bold">
                    {phase.number}
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)]">
                      <span className="mr-2">{phase.icon}</span>
                      {phase.title}
                    </h2>
                  </div>
                </div>

                {/* What */}
                <p className="mt-4 text-[var(--text-secondary)] leading-relaxed">
                  {phase.what}
                </p>

                {/* Details grid */}
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
                      Deliverables
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      {phase.deliverables}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
                      Your Role
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      {phase.yourRole}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
                      Timeline
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      {phase.timeline}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Communicate */}
      <section
        className="py-16 md:py-24"
        style={{ background: 'var(--surface-sunken)' }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
            How We Communicate
          </h2>
          <p className="mt-3 max-w-2xl text-[var(--text-secondary)]">
            Transparency is not a feature &mdash; it is how we work. You will
            always know where your project stands.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {communicationItems.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6"
              >
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
            Ready to get started?
          </h2>
          <p className="mt-3 text-[var(--text-secondary)]">
            Phase 1 is free. Tell us about your project and we will schedule a
            discovery call within 24 hours.
          </p>
          <div className="mt-8">
            <Button href="/quote" size="lg">
              Start Your Project
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
