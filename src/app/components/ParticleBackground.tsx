'use client';

import { useEffect, useRef, useState } from 'react';

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
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // Detect mobile devices - more aggressive detection
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024 || // Tablets and below
                    'ontouchstart' in window ||
                    navigator.maxTouchPoints > 0;
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    // Completely skip on mobile or SSR
    if (!mounted || isMobile) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = 400;
      initParticles();
    };

    // Create particles - reduced for performance
    const initParticles = () => {
      const particleCount = 2; // Only 2 particles for minimal impact
      particlesRef.current = [];
      
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: 0.4,
          speedX: (Math.random() - 0.5) * 0.05, // Even slower movement
          speedY: (Math.random() - 0.5) * 0.05,
          color: '#8e2de2'
        });
      }
    };

    let frameCount = 0;
    const animate = () => {
      frameCount++;
      
      // Skip frames for better performance (only update every 5th frame)
      if (frameCount % 5 !== 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      
      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw and update particles
      ctx.globalAlpha = 0.2;
      particlesRef.current.forEach(particle => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Draw particle
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Initialize
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      particlesRef.current = [];
    };
  }, [mounted, isMobile]);

  // Don't render on mobile or during SSR
  if (!mounted || isMobile) {
    return null;
  }

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-[400px] -z-10 pointer-events-none opacity-20"
      aria-hidden="true"
    />
  );
}