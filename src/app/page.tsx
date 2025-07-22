import Header from './components/Header';
import ClientParticles from './components/ClientParticles';
import HeroSection from './components/HeroSection';
import CodeShowcase from './components/CodeShowcase';
import ServicesSection from './components/ServicesSection';
import ProcessSection from './components/ProcessSection';
import TestimonialSection from './components/TestimonialSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import { PageBackground } from './components/PageBackground';

export default function Home() {
  return (
    <PageBackground>
      <div className="min-h-screen text-white">
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
