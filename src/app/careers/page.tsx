import { Metadata } from 'next';
import Link from 'next/link';
import PageLayout from '../components/layout/PageLayout';

export const metadata: Metadata = {
  title: 'Careers | CraftsAI',
  description:
    'Join the CraftsAI team. We are building the future of AI-powered software development. Explore our culture and open positions.',
  openGraph: {
    title: 'Careers | CraftsAI',
    description:
      'Join the CraftsAI team and build the future of AI-powered software development.',
    url: 'https://www.craftsai.org/careers',
  },
  alternates: { canonical: 'https://www.craftsai.org/careers' },
};

const cultureCards = [
  {
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
        />
      </svg>
    ),
    title: 'AI-First Culture',
    description:
      'We embrace AI as a core tool in every workflow. You will work alongside cutting-edge coding agents and shape how humans and AI collaborate.',
  },
  {
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
        />
      </svg>
    ),
    title: 'Remote Friendly',
    description:
      'Work from anywhere in the world. We communicate asynchronously and value output over hours. Flexible schedules that fit your life.',
  },
  {
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
        />
      </svg>
    ),
    title: 'Cutting-Edge Tech',
    description:
      'Next.js, Kotlin, Swift, LLM integrations, cloud-native architectures. You will always be working with the latest technologies and frameworks.',
  },
  {
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
        />
      </svg>
    ),
    title: 'Impact-Driven Work',
    description:
      'Every product we build solves real problems for real users. From education platforms to finance apps, your work will make a tangible difference.',
  },
];

export default function CareersPage() {
  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
            Build the Future with Us
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-[var(--text-secondary)] sm:text-xl">
            We&apos;re a small, AI-first studio where engineers work alongside
            intelligent agents to ship products faster than anyone thought
            possible. If you thrive at the intersection of craftsmanship and
            automation, you&apos;ll fit right in.
          </p>
        </div>
      </section>

      {/* Why CraftsAI */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-[var(--foreground)] sm:text-4xl">
            Why CraftsAI
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:gap-8">
            {cultureCards.map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-[var(--border-default)] bg-[var(--surface)] p-6 transition-colors hover:border-indigo-500/40 sm:p-8"
              >
                <div className="mb-4 text-indigo-400">{card.icon}</div>
                <h3 className="mb-2 text-xl font-semibold text-[var(--foreground)]">
                  {card.title}
                </h3>
                <p className="leading-relaxed text-[var(--text-secondary)]">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="border-t border-[var(--border-default)] py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-[var(--foreground)] sm:text-4xl">
            Open Positions
          </h2>
          <div className="mt-8 rounded-xl border border-[var(--border-default)] bg-[var(--surface)] p-8 sm:p-12">
            <div className="mb-4 text-4xl">
              <svg
                className="mx-auto h-12 w-12 text-[var(--text-secondary)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <p className="text-lg text-[var(--text-secondary)]">
              We are always looking for talented people. There are no open
              positions right now, but we would love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Application CTA */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
            Interested in Joining?
          </h2>
          <p className="mt-3 text-[var(--text-secondary)]">
            Send your CV and a brief introduction. Tell us what excites you
            about AI-powered development.
          </p>
          <div className="mt-8">
            <a
              href="mailto:careers@craftsai.org"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-500"
            >
              Send Your CV to careers@craftsai.org
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </a>
          </div>
          <p className="mt-6 text-sm text-[var(--text-secondary)]">
            You can also explore our work on{' '}
            <Link
              href="/portfolio"
              className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300"
            >
              our portfolio
            </Link>{' '}
            to see the kind of products we build.
          </p>
        </div>
      </section>
    </PageLayout>
  );
}
