"use client";

interface PageBackgroundProps {
  children: React.ReactNode;
}

export function PageBackground({ children }: PageBackgroundProps) {
  return (
    <div className="relative w-full overflow-x-hidden min-h-screen bg-gradient-to-bl from-slate-900 via-slate-800 to-slate-900">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      
      {/* Neural Glowing orbs - Updated with Inshyra colors */}
      <div className="absolute -top-40 -right-20 w-80 h-80 bg-cyan-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-15 animate-pulse"></div>
      <div className="absolute top-[30%] -left-20 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-15 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-20 right-1/4 w-60 h-60 bg-orange-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      {/* Floating neural particles */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-60"></div>
      <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-ping opacity-40" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping opacity-50" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute top-1/2 left-1/6 w-1 h-1 bg-green-400 rounded-full animate-ping opacity-30" style={{ animationDelay: '2.5s' }}></div>
      
      <div className="relative w-full">
        {children}
      </div>
    </div>
  );
}