import { Metadata } from 'next';
import Link from 'next/link';
import PageLayout from '../components/layout/PageLayout';
import Accordion from '../components/ui/Accordion';
import faqData from '../../../content/faq/faq.json';

export const metadata: Metadata = {
  title: 'FAQ | CraftsAI',
  description:
    'Frequently asked questions about CraftsAI services, pricing, process, and support. Find answers to common questions about AI-powered development.',
  openGraph: {
    title: 'FAQ | CraftsAI',
    description:
      'Frequently asked questions about CraftsAI services, pricing, process, and support.',
    url: 'https://www.craftsai.org/faq',
  },
  alternates: { canonical: 'https://www.craftsai.org/faq' },
};

export default function FAQPage() {
  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg text-[var(--text-secondary)]">
            Everything you need to know about working with CraftsAI. Can&apos;t
            find what you&apos;re looking for?{' '}
            <Link
              href="/contact"
              className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300"
            >
              Reach out to us
            </Link>
            .
          </p>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="pb-20 sm:pb-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {faqData.map((category) => (
            <div key={category.category} className="mb-12">
              <h2 className="mb-4 text-2xl font-semibold text-[var(--foreground)]">
                {category.category}
              </h2>
              <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface)] p-4 sm:p-6">
                <Accordion items={category.questions} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--border-default)] py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
            Still have questions?
          </h2>
          <p className="mt-3 text-[var(--text-secondary)]">
            We&apos;re happy to help. Get in touch and we&apos;ll respond
            within 24 hours.
          </p>
          <div className="mt-8">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-500"
            >
              Contact Us
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
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
