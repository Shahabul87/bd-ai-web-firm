'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-black/90 backdrop-blur-md py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/logo.svg" 
              alt="CodeGenius Logo" 
              width={120} 
              height={40}
              className="h-10 w-auto"
            />
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-white hover:text-cyan-400 transition-colors">
              Home
            </Link>
            <Link href="/services" className="text-white hover:text-cyan-400 transition-colors">
              Services
            </Link>
            <Link href="/portfolio" className="text-white hover:text-cyan-400 transition-colors">
              Portfolio
            </Link>
            <Link href="/about" className="text-white hover:text-cyan-400 transition-colors">
              About
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <button className="hidden sm:block px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium text-sm hover:opacity-90 transition-opacity">
              Get a Quote
            </button>
            
            <button 
              onClick={toggleMobileMenu}
              className="md:hidden relative w-10 h-10 flex items-center justify-center"
              aria-label="Toggle mobile menu"
            >
              <div className={`w-6 h-0.5 bg-white transition-all duration-300 ${
                mobileMenuOpen ? 'opacity-0' : 'opacity-100'
              } before:content-[''] before:absolute before:w-6 before:h-0.5 before:bg-white before:transition-all before:duration-300 ${
                mobileMenuOpen ? 'before:rotate-45 before:translate-y-0' : 'before:-translate-y-2'
              } after:content-[''] after:absolute after:w-6 after:h-0.5 after:bg-white after:transition-all after:duration-300 ${
                mobileMenuOpen ? 'after:-rotate-45 after:translate-y-0' : 'after:translate-y-2'
              }`}></div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-md transition-all duration-300 overflow-hidden ${
        mobileMenuOpen ? 'max-h-96 border-b border-gray-800' : 'max-h-0'
      }`}>
        <nav className="flex flex-col py-5 px-4 sm:px-6 space-y-4">
          <Link 
            href="/" 
            className="text-white hover:text-cyan-400 transition-colors py-2 px-4"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            href="/services" 
            className="text-white hover:text-cyan-400 transition-colors py-2 px-4"
            onClick={() => setMobileMenuOpen(false)}
          >
            Services
          </Link>
          <Link 
            href="/portfolio" 
            className="text-white hover:text-cyan-400 transition-colors py-2 px-4"
            onClick={() => setMobileMenuOpen(false)}
          >
            Portfolio
          </Link>
          <Link 
            href="/about" 
            className="text-white hover:text-cyan-400 transition-colors py-2 px-4"
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </Link>
          <button className="mt-2 w-full px-5 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium text-sm hover:opacity-90 transition-opacity">
            Get a Quote
          </button>
        </nav>
      </div>
    </header>
  );
} 