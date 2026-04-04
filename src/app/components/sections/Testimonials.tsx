'use client';

import { motion } from 'framer-motion';
import Card, { CardBody } from '../ui/Card';

interface Testimonial {
  quote: string;
  author: string;
  company: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      'CraftsAI delivered our platform in half the time we expected. The AI-powered workflow meant faster iterations and fewer bugs.',
    author: 'Sarah M.',
    company: 'EdTech Startup',
  },
  {
    quote:
      'Working with CraftsAI felt like having a team twice the size. Their AI agents handled the repetitive work while engineers focused on architecture.',
    author: 'James K.',
    company: 'FinTech Company',
  },
  {
    quote:
      'The cost savings were real. We got an enterprise-grade application at a fraction of what traditional agencies quoted us.',
    author: 'Priya R.',
    company: 'Healthcare SaaS',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Testimonials() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
            What People Say
          </h2>
        </div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-3 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {testimonials.map((testimonial) => (
            <motion.div key={testimonial.author} variants={cardVariants}>
              <Card className="h-full">
                <CardBody className="flex flex-col h-full">
                  {/* Quote icon */}
                  <svg
                    className="h-8 w-8 text-indigo-500/30 mb-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609L9.978 5.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H0z" />
                  </svg>
                  <p className="text-sm italic text-[var(--text-secondary)] leading-relaxed flex-1 mb-6">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {testimonial.author}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {testimonial.company}
                    </p>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
