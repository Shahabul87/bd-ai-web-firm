'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import { PageBackground } from './components/PageBackground';

export default function NotFound() {
  return (
    <PageBackground>
      <div className="min-h-screen text-slate-900 dark:text-white flex flex-col">
        <Header />
        
        <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-9xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                404
              </h1>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8"
            >
              <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-cyan-400/25 transition-all duration-300"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Home
                </Link>
                
                <Link 
                  href="/contact"
                  className="inline-flex items-center px-6 py-3 border-2 border-slate-600 text-slate-300 font-semibold rounded-full hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300"
                >
                  Contact Support
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-16"
            >
              <p className="text-sm text-slate-500 dark:text-slate-600">
                Error Code: 404 | Page Not Found
              </p>
            </motion.div>
          </div>
        </main>
        
        <Footer />
      </div>
    </PageBackground>
  );
}