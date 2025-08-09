# Cognivat - AI-Powered Web Development Solutions

A modern Next.js 15 marketing website showcasing AI-powered web development services with stunning animations and interactive demos.

## Features

- **AI-Powered Demos**: Interactive machine learning, NLP, and computer vision demonstrations
- **Modern Design**: Glass-morphism effects, gradient animations, and smooth transitions
- **Dark/Light Mode**: Theme switching with localStorage persistence
- **Responsive**: Mobile-first design with tailored experiences for all devices
- **Performance Optimized**: Lazy loading, code splitting, and optimized images
- **Type-Safe**: Full TypeScript support with strict mode enabled
- **Accessible**: ARIA labels, semantic HTML, and keyboard navigation
- **SEO Ready**: Meta tags, Open Graph, and structured data support

## Tech Stack

- **Framework**: Next.js 15.4.2 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Testing**: Jest + React Testing Library
- **Code Quality**: ESLint, TypeScript strict mode

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/cognivat-website.git

# Navigate to project directory
cd cognivat-website

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run type-check   # Run TypeScript compiler checks
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate test coverage report
npm run analyze      # Analyze bundle size
```

## Project Structure

```
src/app/
├── layout.tsx              # Root layout with metadata
├── page.tsx                # Homepage
├── globals.css             # Global styles
├── [route]/page.tsx        # Route pages
└── components/             # Reusable components
    ├── demos/              # AI demo components
    ├── services/           # Service-specific components
    └── *.tsx               # Shared UI components
```

## Key Components

- **ErrorBoundary**: Catches React errors gracefully
- **CrossPlatformWrapper**: Browser compatibility layer
- **AIChatbot**: Interactive AI assistant
- **ParticleBackground**: Animated particle effects
- **ProcessSection**: Interactive process visualization

## Performance Considerations

- Components use proper hydration patterns to prevent mismatches
- Heavy animations are GPU-accelerated with `will-change`
- Images are optimized with Next.js Image component
- Code splitting ensures optimal bundle sizes

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.

## Contact

For inquiries about Cognivat's services, visit [cognivat.com](https://cognivat.com)