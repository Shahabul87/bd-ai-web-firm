"use client";

interface PageBackgroundProps {
  children: React.ReactNode;
}

export function PageBackground({ children }: PageBackgroundProps) {
  return (
    <div className="relative w-full overflow-x-hidden min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="relative w-full">
        {children}
      </div>
    </div>
  );
}
