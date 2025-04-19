'use client';

import React, { useEffect } from 'react';
import Header from '../components/Header';
import HeroSection from '../components/services/HeroSection';
import ServiceCategories from '../components/services/ServiceCategories';
import FeaturedServices from '../components/services/FeaturedServices';
import AITools from '../components/services/AITools';
import CTA from '../components/services/CTA';
import Footer from '../components/Footer';

export default function ServicesPage() {
  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-950 text-white">
        <HeroSection />
        <ServiceCategories />
        <FeaturedServices />
        <AITools />
        <CTA />
      </main>
      <Footer />
    </>
  );
} 