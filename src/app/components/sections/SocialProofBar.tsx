const logos = [
  { name: 'TaxoMind', label: 'AI Learning Platform' },
  { name: 'TaxoMind Schools', label: 'Institutional LMS' },
  { name: 'FinCoach AI', label: 'Financial Coaching' },
  { name: 'MathPhysics', label: 'STEM Education' },
];

export default function SocialProofBar() {
  return (
    <section className="bg-[var(--surface-sunken)] py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-[var(--text-secondary)] mb-8">
          Trusted by businesses across industries
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {logos.map((logo) => (
            <span
              key={logo.name}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--card-bg)] px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)]"
              title={logo.label}
            >
              {logo.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
