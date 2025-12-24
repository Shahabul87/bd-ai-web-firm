'use client';

import { lazy, Suspense, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Lazy load Framer Motion only when needed
const MotionDiv = lazy(() => 
  import('framer-motion').then(mod => ({ 
    default: mod.motion.div 
  }))
);

const AnimatePresence = lazy(() => 
  import('framer-motion').then(mod => ({ 
    default: mod.AnimatePresence 
  }))
);

interface AnimationWrapperProps {
  children: ReactNode;
  type?: 'css' | 'framer' | 'auto';
  animation?: string;
  className?: string;
  delay?: number;
  duration?: number;
  initial?: any;
  animate?: any;
  exit?: any;
  whileHover?: any;
  whileTap?: any;
}

export function AnimationWrapper({
  children,
  type = 'auto',
  animation = 'fadeIn',
  className = '',
  delay = 0,
  duration = 800,
  initial,
  animate,
  exit,
  whileHover,
  whileTap
}: AnimationWrapperProps) {
  const [shouldUseFramer, setShouldUseFramer] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Auto-detect when to use Framer
    if (type === 'auto') {
      // Use Framer for complex animations
      const needsFramer = whileHover || whileTap || exit || 
                         (animate && typeof animate === 'object' && 
                          Object.keys(animate).some(key => 
                            ['spring', 'stagger', 'delay'].includes(key)
                          ));
      setShouldUseFramer(needsFramer);
    } else {
      setShouldUseFramer(type === 'framer');
    }
  }, [type, whileHover, whileTap, exit, animate]);

  // Server-side and CSS animations
  if (!isClient || !shouldUseFramer) {
    const cssClass = `${className} animate-${animation} ${delay ? `delay-${delay}` : ''}`;
    return <div className={cssClass}>{children}</div>;
  }

  // Framer Motion for complex animations
  return (
    <Suspense fallback={<div className={className}>{children}</div>}>
      <MotionDiv
        className={className}
        initial={initial || { opacity: 0 }}
        animate={animate || { opacity: 1 }}
        exit={exit}
        whileHover={whileHover}
        whileTap={whileTap}
        transition={{ duration: duration / 1000, delay: delay / 1000 }}
      >
        {children}
      </MotionDiv>
    </Suspense>
  );
}

// Optimized stagger children wrapper
export function StaggerChildren({
  children,
  className = '',
  staggerDelay = 100,
  useFramer = false
}: {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
  useFramer?: boolean;
}) {
  if (!useFramer) {
    // CSS stagger animation
    return (
      <div className={className}>
        {children.map((child, index) => (
          <div
            key={index}
            className={`animate-fadeInUp`}
            style={{ animationDelay: `${index * staggerDelay}ms` }}
          >
            {child}
          </div>
        ))}
      </div>
    );
  }

  // Framer Motion stagger (only loads if needed)
  return (
    <Suspense fallback={<div className={className}>{children}</div>}>
      <AnimatePresence>
        {children.map((child, index) => (
          <MotionDiv
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * (staggerDelay / 1000) }}
          >
            {child}
          </MotionDiv>
        ))}
      </AnimatePresence>
    </Suspense>
  );
}