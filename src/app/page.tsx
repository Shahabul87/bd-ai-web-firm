'use client';

import Header from './components/Header';
import ClientParticles from './components/ClientParticles';
import HeroSection from './components/HeroSection';
import { 
  MemoizedCodeShowcase as CodeShowcase,
  MemoizedServicesSection as ServicesSection,
  MemoizedProcessSection as ProcessSection,
  MemoizedTestimonialSection as TestimonialSection
} from './components/MemoizedComponents';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import { PageBackground } from './components/PageBackground';

export default function Home() {
  return (
    <PageBackground>
      <div className="min-h-screen text-slate-900 dark:text-white">
        <Header />
        <ClientParticles />
        
        <main className="pt-16 md:pt-20">
          <HeroSection />
          <CodeShowcase />
          <ServicesSection />
          <ProcessSection />
          <TestimonialSection />
          <ContactSection />
        </main>
        
        <Footer />
      </div>
    </PageBackground>
  );
}
