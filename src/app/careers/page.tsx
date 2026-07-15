import { Metadata } from 'next';
import PageLayout from '@/app/components/layout/PageLayout';
import PageHero from '@/app/components/shared/PageHero';
import CTABand from '@/app/components/shared/CTABand';
import SectionHeader from '@/app/design/ui/SectionHeader';
import Card from '@/app/design/ui/Card';

export const metadata: Metadata = {
  title: 'Careers',
  description:
    'Join the CraftsAI team. We are building the future of AI-powered software development. Explore our culture and open positions.',
  openGraph: {
    title: 'Careers',
    description: 'Join the CraftsAI team and build the future of AI-powered software development.',
    url: 'https://www.craftsai.org/careers',
  },
  alternates: { canonical: 'https://www.craftsai.org/careers' },
};

const CULTURE_CARDS = [
  {
    title: 'AI-First Culture',
    description:
      'We embrace AI as a core tool in every workflow. You will work alongside cutting-edge coding agents and shape how humans and AI collaborate.',
  },
  {
    title: 'Remote Friendly',
    description:
      'Work from anywhere in the world. We communicate asynchronously and value output over hours. Flexible schedules that fit your life.',
  },
  {
    title: 'Cutting-Edge Tech',
    description:
      'Next.js, Kotlin, Swift, LLM integrations, cloud-native architectures. You will always be working with the latest technologies and frameworks.',
  },
  {
    title: 'Impact-Driven Work',
    description:
      'Every product we build solves real problems for real users. From education platforms to finance apps, your work will make a tangible difference.',
  },
];

export default function CareersPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Careers"
        title="Build the future with us."
        lede="We're a small, AI-first studio where engineers work alongside intelligent agents to ship products faster than anyone thought possible. If you thrive at the intersection of craftsmanship and automation, you'll fit right in."
      />

      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <SectionHeader index="fig. 01" eyebrow="Why CraftsAI" title="What it's like to work here." />
        <div className="mt-14 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
          {CULTURE_CARDS.map((card) => (
            <div key={card.title} className="bg-ink-950 p-8">
              <h3 className="font-display text-xl font-medium text-bone">{card.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-steel">{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-ink-900">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-28">
          <SectionHeader
            index="fig. 02"
            eyebrow="Open positions"
            title="Nothing open right now."
            align="center"
          />
          <div className="mt-10">
            <Card>
              <p className="text-base leading-relaxed text-steel">
                We are always looking for talented people. There are no open positions right now,
                but we would love to hear from you — send your CV and a note to{' '}
                <a
                  href="mailto:careers@craftsai.org"
                  className="text-signal underline-offset-4 hover:underline"
                >
                  careers@craftsai.org
                </a>
                .
              </p>
            </Card>
          </div>
        </div>
      </section>

      <CTABand
        title="Interested in joining?"
        lede="Send your CV and a brief introduction. Tell us what excites you about AI-powered development."
        primaryLabel="Email careers@craftsai.org"
        primaryHref="mailto:careers@craftsai.org"
        secondaryLabel="See our work"
        secondaryHref="/portfolio"
      />
    </PageLayout>
  );
}
