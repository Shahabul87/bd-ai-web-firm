"use client";

interface PageBackgroundProps {
  children: React.ReactNode;
}

export function PageBackground({ children }: PageBackgroundProps) {
  return (
    <div className="relative w-full overflow-x-hidden min-h-screen bg-gradient-to-bl from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-40 dark:opacity-100"></div>
      
      {/* Neural Glowing orbs - Static with subtle glow */}
      <div className="absolute -top-40 -right-20 w-80 h-80 bg-cyan-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 dark:opacity-15 pointer-events-none"></div>
      <div className="absolute top-[30%] -left-20 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 dark:opacity-15 pointer-events-none"></div>
      <div className="absolute bottom-20 right-1/4 w-60 h-60 bg-orange-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-8 dark:opacity-10 pointer-events-none"></div>
      
      <div className="relative w-full">
        {children}
      </div>
    </div>
  );
}