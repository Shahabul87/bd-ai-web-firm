'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  useEffect(() => {
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    const checkDarkMode = () => {
      // Check if user has a preference stored
      const savedMode = localStorage.getItem('darkMode');
      if (savedMode) {
        setIsDarkMode(savedMode === 'true');
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(prefersDark);
      }
    };
    
    checkDarkMode();
    window.addEventListener('scroll', handleScroll);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    
    // Save preference
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };


  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-500 ${
        scrolled 
          ? isDarkMode
            ? 'bg-slate-900/90 backdrop-blur-md shadow-lg shadow-cyan-400/10 border-b border-slate-700/50'
            : 'bg-slate-50/90 backdrop-blur-md shadow-lg shadow-slate-200/50 border-b border-slate-200/50'
          : 'bg-transparent'
      } ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`} 
      suppressHydrationWarning={true}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center ${scrolled ? 'py-3' : 'py-5'}`}>
          <Link href="/" className="flex items-center space-x-2 group">
            <div className={`relative overflow-hidden rounded-xl h-10 w-10 flex items-center justify-center 
              ${isDarkMode ? 'bg-slate-800/80' : 'bg-slate-200/80'} 
              transition-all duration-300 transform group-hover:scale-105 group-hover:rotate-3 backdrop-blur-sm`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-purple-500 to-orange-500 opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
              <span className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-500 text-lg animate-neural-pulse`}>
                I
              </span>
              <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-gradient-to-tr from-cyan-400 to-purple-500 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition-opacity animate-quantum-spark"></div>
            </div>
            
            <div>
              <h1 className="text-xl font-bold flex items-center">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-500">
                  Inshyra
                </span>
              </h1>
              <p className={`text-xs -mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>AI Intelligence Studio</p>
            </div>
          </Link>
          
          <nav className="hidden md:flex">
            <div className={`flex space-x-1 rounded-full py-1 px-1.5 ${
              isDarkMode ? 'bg-slate-800/60 backdrop-blur-sm border border-slate-700/50' : 'bg-slate-100/80 backdrop-blur-sm border border-slate-200/50'
            }`}>
              {["Home", "AI Solutions", "Data Viz", "About"].map((item) => {
                const getHref = (itemName: string) => {
                  switch(itemName) {
                    case "Home": return "/";
                    case "AI Solutions": return "/ai-solutions";
                    case "Data Viz": return "/data-viz";
                    case "About": return "/about";
                    default: return `/${itemName.toLowerCase()}`;
                  }
                };
                
                return (
                <Link 
                  key={item}
                  href={getHref(item)} 
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:text-cyan-400 ${
                    item === "Home" 
                      ? `${isDarkMode ? 'text-slate-100 bg-slate-700/50' : 'text-slate-800 bg-slate-200/70'} shadow-inner`
                      : `${isDarkMode ? 'text-slate-300 hover:bg-slate-700/30' : 'text-slate-600 hover:bg-slate-200/50'}`
                  }`}>
                  {item}
                </Link>
                );
              })}
            </div>
          </nav>
          
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isDarkMode 
                  ? 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50' 
                  : 'bg-slate-200/80 hover:bg-slate-300/80 border border-slate-300/50'
              } transition-colors backdrop-blur-sm`}
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            <button className="hidden sm:flex items-center space-x-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-medium text-sm hover:shadow-lg hover:shadow-cyan-400/30 transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-105 neural-glow">
              <span>Get a Quote</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            
            <button 
              onClick={toggleMobileMenu}
              className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Toggle mobile menu"
            >
              <div 
                className={`w-5 h-0.5 ${isDarkMode ? 'bg-white' : 'bg-gray-800'} rounded-full transition-all duration-300 ${
                  mobileMenuOpen ? 'opacity-0' : 'opacity-100'
                } before:content-[''] before:absolute before:w-5 before:h-0.5 before:rounded-full ${isDarkMode ? 'before:bg-white' : 'before:bg-gray-800'} before:transition-all before:duration-300 ${
                  mobileMenuOpen ? 'before:rotate-45 before:translate-y-0' : 'before:-translate-y-1.5'
                } after:content-[''] after:absolute after:w-5 after:h-0.5 after:rounded-full ${isDarkMode ? 'after:bg-white' : 'after:bg-gray-800'} after:transition-all after:duration-300 ${
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
        className={`md:hidden absolute top-full left-0 w-full ${
          isDarkMode 
            ? 'bg-slate-900/95 border-b border-slate-700/50' 
            : 'bg-slate-50/95 border-b border-slate-200/50'
        } backdrop-blur-md transition-all duration-300 overflow-hidden ${
          mobileMenuOpen ? 'max-h-[400px] shadow-xl shadow-cyan-400/10' : 'max-h-0'
        }`}
        suppressHydrationWarning={true}
      >
        <nav className="flex flex-col py-5 px-4 sm:px-6 space-y-1">
          {["Home", "AI Solutions", "Data Viz", "About"].map((item) => {
            const getHref = (itemName: string) => {
              switch(itemName) {
                case "Home": return "/";
                case "AI Solutions": return "/ai-solutions";
                case "Data Viz": return "/data-viz";
                case "About": return "/about";
                default: return `/${itemName.toLowerCase()}`;
              }
            };
            
            return (
            <Link 
              key={item}
              href={getHref(item)}
              className={`py-3 px-4 rounded-lg ${
                isDarkMode 
                  ? 'text-slate-100 hover:bg-slate-800/50' 
                  : 'text-slate-800 hover:bg-slate-200/50'
              } transition-colors font-medium`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item}
            </Link>
            );
          })}
          <div className={`pt-3 mt-3 border-t ${isDarkMode ? 'border-slate-700/50' : 'border-slate-300/50'}`}>
            <button className="w-full px-5 py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 neural-glow">
              <span>Get a Quote</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
} 