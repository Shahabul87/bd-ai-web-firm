import DraftingRoomHero from './home/DraftingRoomHero';
import {
  SocialProofBar,
  ServicesGrid,
  AIAdvantage,
  ProductsShowcase,
  FeaturedWork,
  ProcessTimeline,
  Testimonials,
  ResourcesPreview,
  CTASection,
} from './sections';

export default function HomePage() {
  return (
    <>
      <DraftingRoomHero />
      <SocialProofBar />
      <ServicesGrid />
      <AIAdvantage />
      <ProductsShowcase />
      <FeaturedWork />
      <ProcessTimeline />
      <Testimonials />
      <ResourcesPreview />
      <CTASection />
    </>
  );
}
