'use client';

import { motion } from 'framer-motion';

interface ComparisonItem {
  label: string;
  traditional: string;
  craftsai: string;
}

const comparisons: ComparisonItem[] = [
  { label: 'Timeline', traditional: '3-6 months', craftsai: '2-6 weeks' },
  { label: 'Cost', traditional: '$50K-200K', craftsai: '80% savings' },
  { label: 'Team', traditional: 'Large team', craftsai: 'AI + human' },
  {
    label: 'Code Review',
    traditional: 'Manual review',
    craftsai: 'AI + human review',
  },
  {
    label: 'Process',
    traditional: 'Rigid milestones',
    craftsai: 'Agile process',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function AIAdvantage() {
  return (
    <section className="py-20 sm:py-28 bg-[var(--surface-sunken)]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Why AI-Powered Development?
          </h2>
        </div>

        {/* Comparison */}
        <motion.div
          className="grid grid-cols-1 gap-8 md:grid-cols-2 max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Traditional Agency */}
          <motion.div
            className="rounded-xl border border-red-500/20 bg-red-500/5 p-8"
            variants={itemVariants}
          >
            <h3 className="text-xl font-semibold text-[var(--foreground)] mb-6 flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-red-500" />
              Traditional Agency
            </h3>
            <ul className="space-y-4">
              {comparisons.map((item) => (
                <li key={item.label} className="flex justify-between items-center">
                  <span className="text-sm text-[var(--text-secondary)]">
                    {item.label}
                  </span>
                  <span className="text-sm font-medium text-red-400">
                    {item.traditional}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* CraftsAI */}
          <motion.div
            className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-8"
            variants={itemVariants}
          >
            <h3 className="text-xl font-semibold text-[var(--foreground)] mb-6 flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />
              CraftsAI
            </h3>
            <ul className="space-y-4">
              {comparisons.map((item) => (
                <li key={item.label} className="flex justify-between items-center">
                  <span className="text-sm text-[var(--text-secondary)]">
                    {item.label}
                  </span>
                  <span className="text-sm font-medium text-emerald-400">
                    {item.craftsai}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
