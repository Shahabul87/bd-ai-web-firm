'use client';

import React from 'react';

export default function CTASection() {
  return (
    <section className="relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-10 sm:p-16">
          {/* Background decoration */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full filter blur-3xl opacity-10"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full filter blur-3xl opacity-10"></div>
          
          <div className="relative text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Transform Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400">Digital Presence</span>?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Our AI-powered services are designed to help you achieve your business goals faster and more efficiently than traditional methods.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/20 transition-all hover:-translate-y-0.5">
                Schedule a Free Consultation
              </button>
              <button className="px-8 py-4 rounded-full border border-gray-700 hover:border-purple-500/50 text-white font-medium hover:bg-white/5 transition-colors">
                View Portfolio
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 