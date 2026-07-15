import PageLayout from '@/app/components/layout/PageLayout';
import PageHero from '@/app/components/shared/PageHero';
import CTABand from '@/app/components/shared/CTABand';
import PortfolioGrid from '@/app/components/portfolio/PortfolioGrid';
import { caseStudies } from '#content';

export default function Portfolio() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Portfolio"
        title="Software our agents have shipped."
        lede="Real projects built by our team. From web apps to Android — see what's possible when agents do the coding."
      />

      <PortfolioGrid caseStudies={caseStudies} />

      <CTABand
        title="Your project could be next."
        lede="Tell us the brief and we'll come back with a plan, a timeline, and a fixed estimate."
      />
    </PageLayout>
  );
}
