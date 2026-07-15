import type { Metadata } from 'next';
import PageLayout from '@/app/components/layout/PageLayout';
import PageHero from '@/app/components/shared/PageHero';
import PillarCards from '@/app/components/shared/PillarCards';
import CTABand from '@/app/components/shared/CTABand';
import Button from '@/app/design/ui/Button';
import SectionHeader from '@/app/design/ui/SectionHeader';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'What CraftsAI builds: custom AI agents, agent-built websites and mobile apps, and agent integration into your existing systems.',
};

export default function ServicesPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Services / overview"
        title="We build agents. The agents build your software."
        lede="Four services, one workflow. Custom agents do the heavy lifting; senior engineers own the architecture, the review, and what ships."
      >
        <Button variant="amber" size="lg" href="/contact">
          Start a project
        </Button>
        <Button variant="chalk" size="lg" href="/quote">
          Get an estimate
        </Button>
      </PageHero>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <SectionHeader
          index="fig. 01"
          eyebrow="What we build"
          title="Pick where an agent goes to work."
          description="Not sure which fits? Start a project and we'll map it with you."
        />
        <div className="mt-14">
          <PillarCards />
        </div>
      </section>

      <CTABand />
    </PageLayout>
  );
}
