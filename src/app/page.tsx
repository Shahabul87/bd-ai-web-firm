import Header from './components/Header';
import ClientParticles from './components/ClientParticles';
import HeroSection from './components/HeroSection';
import ServicesSection from './components/ServicesSection';
import ProcessSection from './components/ProcessSection';
import TestimonialSection from './components/TestimonialSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <ClientParticles />
      
      <main className="pt-24 md:pt-32">
        <HeroSection />
        <ServicesSection />
        <ProcessSection />
        <TestimonialSection />
        <ContactSection />
      </main>
      
      <Footer />
    </div>
  );
}
