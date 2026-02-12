'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePerformanceOptimizedAnimation } from '../hooks/useMobileDetection';

export default function Footer() {
  const { shouldAnimate } = usePerformanceOptimizedAnimation();
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);

  useEffect(() => {
    setMounted(true);
    // Generate deterministic particle positions
    const particleArray = Array.from({length: 8}, (_, i) => ({
      id: i,
      x: (i * 12.5) % 100, // Distribute evenly across width
      y: (i * 15) % 80,    // Distribute across height
      delay: i * 0.5       // Staggered animation delays
    }));
    setParticles(particleArray);
  }, []);

  return (
    <footer className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--surface-sunken), var(--surface-elevated), var(--surface-sunken))' }}>
      {/* Animated Background - reduce on mobile */}
      {shouldAnimate() && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/5 to-cyan-600/10 animate-gradient" />
          
          {/* Neural Network Particles */}
          {mounted && particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-pulse"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: '3s'
              }}
            />
          ))}
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>
      )}
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-14 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center space-x-2 sm:space-x-3 group mb-4 sm:mb-6">
              <div className="relative overflow-hidden rounded-lg sm:rounded-xl h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center bg-[var(--surface-elevated)]/80 transition-all duration-300 transform group-hover:scale-105 group-hover:rotate-3 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-purple-500 to-orange-500 opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-500 text-lg sm:text-xl animate-neural-pulse">
                  I
                </span>
                <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-gradient-to-tr from-cyan-400 to-purple-500 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition-opacity animate-quantum-spark"></div>
              </div>
              
              <div>
                <h2 className="text-xl sm:text-2xl font-bold flex items-center">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400">
                    CraftsAI
                  </span>
                </h2>
                <p className="text-xs sm:text-sm -mt-0.5 sm:-mt-1 text-[var(--text-secondary)]">Agentic AI Coding Studio</p>
              </div>
            </Link>
            <p className="text-[var(--text-secondary)] text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8">
              AI agents that write code. We build web apps and Android apps 10x faster using autonomous AI coding technology.
            </p>
            
            {/* Enhanced Social Icons */}
            <div className="flex space-x-3">
              <SocialIcon href="#" icon="facebook" label="Facebook" />
              <SocialIcon href="#" icon="twitter" label="Twitter" />
              <SocialIcon href="#" icon="linkedin" label="LinkedIn" />
              <SocialIcon href="#" icon="instagram" label="Instagram" />
            </div>
          </div>
          
          {/* Services */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-[var(--foreground)] relative">
              <span className="relative z-10">Services</span>
              <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-500" />
            </h4>
            <ul className="space-y-4">
              <FooterLink href="/services/web-development" icon="🌐">Web Development</FooterLink>
              <FooterLink href="/services/android-development" icon="📱">Android Development</FooterLink>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-[var(--foreground)] relative">
              <span className="relative z-10">Company</span>
              <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-purple-400 to-pink-500" />
            </h4>
            <ul className="space-y-4">
              <FooterLink href="/about" icon="ℹ️">About</FooterLink>
              <FooterLink href="/portfolio" icon="📁">Projects</FooterLink>
              <FooterLink href="/pricing" icon="💎">Pricing</FooterLink>
              <FooterLink href="/contact" icon="📞">Contact</FooterLink>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-[var(--foreground)] relative">
              <span className="relative z-10">Contact Us</span>
              <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-green-400 to-cyan-500" />
            </h4>
            <ul className="space-y-4">
              <ContactItem 
                icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                text="Reno, Nevada, USA"
                gradient="from-purple-400 to-pink-500"
              />
              <ContactItem 
                icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                text="info@craftsai.com"
                gradient="from-blue-400 to-cyan-500"
                href="mailto:info@craftsai.com"
              />
              <ContactItem 
                icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                text="+1 (775) 250-6651"
                gradient="from-green-400 to-emerald-500"
                href="tel:+17752506651"
              />
            </ul>
          </div>
        </div>
        
        {/* Newsletter Signup */}
        <div className="mt-10 sm:mt-12 md:mt-16 mb-8 sm:mb-10 md:mb-12">
          <div className="bg-[var(--card-bg)] backdrop-blur-sm border border-[var(--card-border)] rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-3 sm:mb-4">Stay Updated</h3>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] mb-4 sm:mb-5 md:mb-6">Get the latest insights on AI development and industry trends</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-lg text-sm sm:text-base text-[var(--foreground)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
              />
              <button className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-sm sm:text-base rounded-lg hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transform hover:scale-105 transition-all duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-[var(--border-default)] pt-8 flex flex-col lg:flex-row justify-between items-center">
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <p className="text-sm text-[var(--text-secondary)]">© {new Date().getFullYear()} CraftsAI. All rights reserved.</p>
            <div className="flex items-center space-x-2 text-xs text-[var(--text-secondary)]">
              <span>🔒</span>
              <span>Secured by AI</span>
              <span className="w-1 h-1 bg-[var(--text-secondary)] rounded-full" />
              <span>🚀</span>
              <span>Powered by Innovation</span>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center lg:justify-end gap-6 mt-4 lg:mt-0">
            <FooterBottomLink href="/privacy">Privacy Policy</FooterBottomLink>
            <FooterBottomLink href="/terms">Terms of Service</FooterBottomLink>
            <FooterBottomLink href="/cookies">Cookie Policy</FooterBottomLink>
            <FooterBottomLink href="/sitemap">Sitemap</FooterBottomLink>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children, icon }: { href: string; children: React.ReactNode; icon?: string }) {
  return (
    <li>
      <Link 
        href={href} 
        className="group flex items-center space-x-2 text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-all duration-500 ease-out hover:translate-x-0.5"
      >
        {icon && <span className="text-sm group-hover:scale-105 transition-transform duration-500 ease-out">{icon}</span>}
        <span className="relative">
          {children}
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-500 ease-out" />
        </span>
      </Link>
    </li>
  );
}

function SocialIcon({ href, icon, label }: { href: string; icon: string; label: string }) {
  let iconPath;
  let gradient;
  
  switch (icon) {
    case 'facebook':
      iconPath = "M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z";
      gradient = "from-blue-600 to-blue-700";
      break;
    case 'twitter':
      iconPath = "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z";
      gradient = "from-sky-400 to-blue-500";
      break;
    case 'linkedin':
      iconPath = "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z";
      gradient = "from-blue-700 to-blue-800";
      break;
    case 'instagram':
      iconPath = "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913a5.885 5.885 0 001.384 2.126A5.868 5.868 0 004.14 23.37c.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558a5.898 5.898 0 002.126-1.384 5.86 5.86 0 001.384-2.126c.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913a5.89 5.89 0 00-1.384-2.126A5.847 5.847 0 0019.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227a3.81 3.81 0 01-.899 1.382 3.744 3.744 0 01-1.38.896c-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421a3.716 3.716 0 01-1.379-.899 3.644 3.644 0 01-.9-1.38c-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 01-2.88 0 1.44 1.44 0 012.88 0z";
      gradient = "from-pink-500 via-red-500 to-yellow-500";
      break;
    default:
      iconPath = "";
      gradient = "from-gray-600 to-gray-700";
  }
  
  return (
    <a 
      href={href} 
      className={`group relative w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center hover:shadow-lg hover:shadow-current/25 transform hover:scale-105 transition-all duration-500 ease-out overflow-hidden`}
      aria-label={label}
    >
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" />
      
      <svg className="relative z-10 w-5 h-5 text-white group-hover:scale-105 transition-transform duration-500 ease-out" viewBox="0 0 24 24" fill="currentColor">
        <path d={iconPath} />
      </svg>
      
      {/* Ripple effect */}
    </a>
  );
}

function ContactItem({ icon, text, gradient, href }: { icon: string; text: string; gradient: string; href?: string }) {
  const content = (
    <div className="group flex items-start space-x-3 text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-all duration-500 ease-out">
      <div className={`mt-0.5 p-2 rounded-lg bg-gradient-to-br ${gradient} opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ease-out`}>
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
        </svg>
      </div>
      <span className="flex-1 group-hover:translate-x-0.5 transition-transform duration-500 ease-out">{text}</span>
    </div>
  );

  if (href) {
    return (
      <li>
        <a href={href} className="block">
          {content}
        </a>
      </li>
    );
  }

  return <li>{content}</li>;
}

function FooterBottomLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="text-sm text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors duration-500 ease-out relative group"
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-500 ease-out" />
    </Link>
  );
}