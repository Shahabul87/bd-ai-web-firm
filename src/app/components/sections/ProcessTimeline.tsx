import Link from 'next/link';

interface Step {
  number: number;
  icon: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: 1,
    icon: '\uD83D\uDCAC',
    title: 'Discover',
    description: 'Free consultation',
  },
  {
    number: 2,
    icon: '\uD83D\uDCCB',
    title: 'Plan',
    description: 'Scope & proposal',
  },
  {
    number: 3,
    icon: '\uD83E\uDD16',
    title: 'Build',
    description: 'AI + human dev',
  },
  {
    number: 4,
    icon: '\u2705',
    title: 'Test',
    description: 'QA & review',
  },
  {
    number: 5,
    icon: '\uD83D\uDE80',
    title: 'Launch',
    description: 'Deploy & support',
  },
];

export default function ProcessTimeline() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
            How We Work
          </h2>
        </div>

        {/* Steps */}
        <div className="flex flex-wrap items-start justify-center gap-4 lg:gap-0">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              {/* Step card */}
              <div className="flex flex-col items-center text-center w-40">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-default)] mb-4">
                  <span className="text-2xl" role="img" aria-label={step.title}>
                    {step.icon}
                  </span>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500 mb-1">
                  Step {step.number}
                </span>
                <h3 className="text-base font-semibold text-[var(--foreground)] mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {step.description}
                </p>
              </div>

              {/* Arrow connector */}
              {index < steps.length - 1 && (
                <span className="hidden lg:block text-[var(--text-secondary)] mx-2 text-xl">
                  &rarr;
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Link */}
        <div className="mt-12 text-center">
          <Link
            href="/process"
            className="text-sm font-medium text-indigo-500 hover:text-indigo-400 transition-colors"
          >
            Learn more about our process &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
