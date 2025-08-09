'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { PageBackground } from '../components/PageBackground';

export default function TestAboutPage() {
  return (
    <PageBackground>
      <div className="min-h-screen text-white">
        <Header />
        <main className="pt-16 md:pt-20">
          <section className="py-20 flex flex-col md:flex-row items-center justify-between">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8">
                  <span className="block text-white">About</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                    Cognivat
                  </span>
                </h1>
                <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-12">
                  We are a team of AI specialists and web developers creating intelligent solutions for the future.
                </p>
                
                {/* Simple cube without complex animations */}
                <div className="w-48 h-48 mx-auto bg-gradient-to-br from-purple-600 to-indigo-700 rounded-lg flex items-center justify-center font-bold text-2xl shadow-lg">
                  Innovation
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </PageBackground>
  );
}