import {
  HeroSection,
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
      <HeroSection />
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
