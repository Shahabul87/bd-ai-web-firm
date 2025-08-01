# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15.3.1 marketing website for Inshyra, built with TypeScript and the App Router. The site showcases AI-powered web development services with a modern, animated design.

## Key Commands

### Development
```bash
npm run dev          # Start development server at http://localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint checks
```

### Common Development Tasks
```bash
# Install dependencies
npm install

# Create a new page
# Add folder in src/app/[page-name]/page.tsx

# Create a new component
# Add to src/app/components/ or src/app/components/[feature]/
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.3.1 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4 with CSS variables
- **Animations**: Framer Motion
- **Icons**: Heroicons

### Project Structure
```
src/app/
├── layout.tsx              # Root layout with metadata and theme provider
├── page.tsx                # Homepage composition
├── globals.css             # Global styles and Tailwind directives
├── [route]/page.tsx        # Route pages (about, services, etc.)
└── components/             # Shared UI components
    ├── Header.tsx          # Navigation with theme toggle
    ├── *Section.tsx        # Page section components
    └── services/           # Service-specific components
```

### Key Patterns

1. **Client Components**: Components requiring interactivity use `'use client'` directive
   - Header.tsx (theme toggle, mobile menu)
   - ParticleBackground.tsx (animations)
   - ClientParticles.tsx (wrapper for client-side particles)

2. **Theme System**: Dark/light mode with localStorage persistence
   - CSS variables defined in globals.css
   - Theme toggle in Header component
   - Colors use CSS variables (e.g., `bg-background`, `text-foreground`)

3. **Responsive Design**: Mobile-first with Tailwind breakpoints
   - Mobile menu for navigation
   - Responsive grid layouts
   - Conditional rendering based on screen size

4. **Component Conventions**:
   - Functional components with TypeScript
   - Props interfaces defined inline or above component
   - Framer Motion for scroll animations
   - Gradient-heavy design with glass-morphism effects

5. **SSR/Hydration Best Practices** ⚠️ **CRITICAL**:
   - **NEVER use Math.random() directly in component render**: Causes hydration mismatches
   - **NEVER use Date.now() in render**: Server/client timestamps differ
   - **Always use mounted state pattern for random data**:
     ```tsx
     const [mounted, setMounted] = useState(false);
     const [randomValue, setRandomValue] = useState(defaultValue);
     
     useEffect(() => {
       setMounted(true);
       setRandomValue(Math.random() * 100);
     }, []);
     
     return <div>{mounted ? randomValue : defaultValue}</div>
     ```
   - **Use deterministic fallbacks**: Provide consistent SSR values
   - **Client-only patterns**: Wrap dynamic content in mounted checks

### Important Configuration

**next.config.ts**: ESLint errors are ignored during builds (consider fixing for production)

**tsconfig.json**: 
- Path alias: `@/*` maps to `./src/*`
- Strict TypeScript enabled

### Styling Guidelines
- Use Tailwind CSS classes
- Dark mode classes with `dark:` prefix
- CSS variables for theme colors in globals.css
- Gradient patterns throughout the site
- Glass-morphism with `backdrop-blur` and semi-transparent backgrounds

### Common Hydration Issues and Solutions

**❌ Causes Hydration Errors:**
```tsx
// BAD: Direct Math.random() in render
<div>{Math.random() * 100}%</div>

// BAD: Date.now() in render  
<div>Generated at: {Date.now()}</div>

// BAD: Client-only APIs without guards
<div>{window.innerWidth}px</div>
```

**✅ Correct Patterns:**
```tsx
// GOOD: Mounted state pattern
const [mounted, setMounted] = useState(false);
const [value, setValue] = useState(85); // Default for SSR

useEffect(() => {
  setMounted(true);
  setValue(Math.random() * 100);
}, []);

return <div>{mounted ? value : 85}%</div>;

// GOOD: Deterministic alternatives
const widths = [180, 220, 160, 200]; // Fixed array
<rect width={widths[index]} />

// GOOD: Client-only rendering
{typeof window !== 'undefined' && <DynamicComponent />}
```

### Animation Performance Guidelines

- Use `transition-all duration-1000 ease-in-out` for smooth transitions
- Prefer `requestAnimationFrame` over `setInterval` for animations  
- Add `will-change: transform, opacity` for GPU acceleration
- Use slower timing for better UX: 8-10s cycles, 1000ms+ transitions
- Avoid `animate-pulse` classes, use custom opacity transitions

### Current Limitations
- No testing framework configured
- No environment variables setup
- No API routes or backend integration
- Forms are display-only (no submission handling)
- No SEO optimization beyond basic metadata