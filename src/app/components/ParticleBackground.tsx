'use client';

import { useEffect, useRef } from 'react';
import { useSmartTimeout } from '../utils/animationOptimizer';
import { useSmartAnimation } from '../hooks/usePerformanceMonitor';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);
  const { requestAnimationFrame, cancelAnimationFrame } = useSmartTimeout();
  const { shouldSkipAnimation } = useSmartAnimation();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Debounced resize to prevent excessive re-initialization
    let resizeTimeout: NodeJS.Timeout;
    const resizeCanvas = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const newWidth = window.innerWidth;
        const newHeight = 400;
        
        if (canvas.width !== newWidth || canvas.height !== newHeight) {
          canvas.width = newWidth;
          canvas.height = newHeight;
          // Only reinitialize if size actually changed
          if (particlesRef.current.length === 0 || 
              Math.abs(particlesRef.current.length - Math.floor(newWidth / 120)) > 2) {
            initParticles();
          }
        }
      }, 250); // Debounce resize events
    };

    // Object pool for particles to prevent garbage collection
    const createParticle = (x: number, y: number): Particle => ({
      x,
      y,
      size: Math.random() * 0.8 + 0.4,
      speedX: (Math.random() - 0.5) * 0.15, // Even slower for better performance
      speedY: (Math.random() - 0.5) * 0.15,
      color: ['#8e2de2', '#4a00e0', '#3f5efb'][Math.floor(Math.random() * 3)]
    });

    const initParticles = () => {
      // Reuse existing particles array if possible
      const particleCount = Math.min(Math.floor(window.innerWidth / 150), 5); // Even fewer particles
      
      if (particlesRef.current.length > particleCount) {
        // Remove excess particles
        particlesRef.current.length = particleCount;
      } else {
        // Add new particles only if needed
        while (particlesRef.current.length < particleCount) {
          particlesRef.current.push(createParticle(
            Math.random() * canvas.width,
            Math.random() * canvas.height
          ));
        }
      }
    };

    // const frameCount = 0; // Not needed after optimization
    let isActive = true;
    let lastFrameTime = 0;
    const targetFPS = 30; // Target 30 FPS for smoother performance
    const frameInterval = 1000 / targetFPS;
    
    const animate = (currentTime: number) => {
      if (!isActive) return;
      
      // Skip animation entirely if performance is poor
      if (shouldSkipAnimation()) {
        // Schedule next check after a delay
        animationFrameRef.current = requestAnimationFrame(() => {
          setTimeout(() => animate(performance.now()), 1000);
        });
        return;
      }
      
      // Limit frame rate for consistent performance
      const deltaTime = currentTime - lastFrameTime;
      
      if (deltaTime > frameInterval) {
        lastFrameTime = currentTime - (deltaTime % frameInterval);
        
        // Clear canvas with optimized method
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.1)'; // Slight trail effect
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Batch particle rendering
        ctx.globalAlpha = 0.25; // Lower opacity for better performance
        
        particlesRef.current.forEach(particle => {
          // Update position
          particle.x += particle.speedX;
          particle.y += particle.speedY;
          
          // Wrap around edges (optimized with modulo)
          particle.x = (particle.x + canvas.width) % canvas.width;
          particle.y = (particle.y + canvas.height) % canvas.height;
          
          // Optimized drawing - reuse path
          ctx.fillStyle = particle.color;
          ctx.fillRect(particle.x - particle.size, particle.y - particle.size, 
                       particle.size * 2, particle.size * 2);
        });
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const cleanup = () => {
      isActive = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    // Initial setup
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Start animation only if performance allows
    if (!shouldSkipAnimation()) {
      animate(performance.now());
    }

    // Enhanced cleanup with proper resource management
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cleanup();
      particlesRef.current = []; // Clear particles array
    };
  }, [requestAnimationFrame, cancelAnimationFrame, shouldSkipAnimation]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-[400px] -z-10 pointer-events-none opacity-20"
      suppressHydrationWarning={true}
    />
  );
} 