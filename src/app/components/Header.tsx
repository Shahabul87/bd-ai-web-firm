'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useThrottle } from '../utils/throttle';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // Create throttled scroll handler
  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 10);
  }, []);
  
  // Throttle the scroll handler to run at most once every 100ms
  const throttledHandleScroll = useThrottle(handleScroll, 100);
  
  useEffect(() => {
    // Check initial scroll position
    handleScroll();
    
    // Add throttled event listener
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [throttledHandleScroll, handleScroll]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };


  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-slate-900/90 backdrop-blur-md shadow-lg shadow-cyan-400/10 border-b border-slate-700/50'
          : 'bg-transparent'
      } text-slate-100`} 
      suppressHydrationWarning={true}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center ${scrolled ? 'py-2 sm:py-3' : 'py-3 sm:py-4 md:py-5'}`}>
          <Link href="/" className="flex items-center space-x-1.5 sm:space-x-2 group">
            <div className="relative overflow-hidden rounded-lg sm:rounded-xl h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center bg-slate-800/80 transition-all duration-300 transform group-hover:scale-105 group-hover:rotate-3 backdrop-blur-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-purple-500 to-orange-500 opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
              <span className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-500 text-base sm:text-lg animate-neural-pulse`}>
                I
              </span>
              <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-gradient-to-tr from-cyan-400 to-purple-500 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition-opacity animate-quantum-spark"></div>
            </div>
            
            <div>
              <h1 className="text-lg sm:text-xl font-bold flex items-center">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400">
                  CraftsAI
                </span>
              </h1>
              <p className="text-[10px] sm:text-xs -mt-0.5 sm:-mt-1 text-slate-400 hidden sm:block">Agentic AI Coding</p>
            </div>
          </Link>
          
          <nav className="hidden md:flex">
            <div className="flex space-x-1 rounded-full py-1 px-1.5 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50">
              {["Home", "Services", "Portfolio", "About"].map((item) => {
                const getHref = (itemName: string) => {
                  switch(itemName) {
                    case "Home": return "/";
                    case "Services": return "/services";
                    case "Portfolio": return "/portfolio";
                    case "About": return "/about";
                    default: return `/${itemName.toLowerCase()}`;
                  }
                };

                const href = getHref(item);
                const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

                return (
                <Link
                  key={item}
                  href={href}
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:text-emerald-400 ${
                    isActive
                      ? 'text-slate-100 bg-slate-700/50 shadow-inner'
                      : 'text-slate-300 hover:bg-slate-700/30'
                  }`}>
                  {item}
                </Link>
                );
              })}
            </div>
          </nav>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link 
              href="/quote"
              className="hidden sm:flex items-center space-x-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-medium text-xs sm:text-sm hover:shadow-lg hover:shadow-cyan-400/30 transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-105 neural-glow"
            >
              <span>Get a Quote</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            
            <button 
              onClick={toggleMobileMenu}
              className="md:hidden relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors"
              aria-label="Toggle mobile menu"
            >
              <div 
                className={`w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${
                  mobileMenuOpen ? 'opacity-0' : 'opacity-100'
                } before:content-[''] before:absolute before:w-5 before:h-0.5 before:rounded-full before:bg-white before:transition-all before:duration-300 ${
                  mobileMenuOpen ? 'before:rotate-45 before:translate-y-0' : 'before:-translate-y-1.5'
                } after:content-[''] after:absolute after:w-5 after:h-0.5 after:rounded-full after:bg-white after:transition-all after:duration-300 ${
                  mobileMenuOpen ? 'after:-rotate-45 after:translate-y-0' : 'after:translate-y-1.5'
                }`}
                suppressHydrationWarning={true}
              ></div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden absolute top-full left-0 w-full bg-slate-900/95 border-b border-slate-700/50 backdrop-blur-md transition-all duration-300 overflow-hidden ${
          mobileMenuOpen ? 'max-h-[400px] shadow-xl shadow-cyan-400/10' : 'max-h-0'
        }`}
        suppressHydrationWarning={true}
      >
        <nav className="flex flex-col py-5 px-4 sm:px-6 space-y-1">
          {["Home", "Services", "Portfolio", "About"].map((item) => {
            const getHref = (itemName: string) => {
              switch(itemName) {
                case "Home": return "/";
                case "Services": return "/services";
                case "Portfolio": return "/portfolio";
                case "About": return "/about";
                default: return `/${itemName.toLowerCase()}`;
              }
            };

            const href = getHref(item);
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

            return (
            <Link
              key={item}
              href={href}
              className={`py-3 px-4 rounded-lg transition-colors font-medium ${
                isActive
                  ? 'text-emerald-400 bg-slate-700/50 shadow-inner'
                  : 'text-slate-100 hover:bg-slate-800/50'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item}
            </Link>
            );
          })}
          <div className="pt-3 mt-3 border-t border-slate-700/50">
            <Link 
              href="/quote"
              className="w-full px-5 py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 neural-glow"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Get a Quote</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
} 