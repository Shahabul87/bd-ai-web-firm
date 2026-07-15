import { Metadata } from 'next';
import PageLayout from '@/app/components/layout/PageLayout';
import PageHero from '@/app/components/shared/PageHero';
import CTABand from '@/app/components/shared/CTABand';
import Button from '@/app/design/ui/Button';
import MonoLabel from '@/app/design/ui/MonoLabel';
import Accordion from '@/app/design/ui/Accordion';
import faqData from '../../../content/faq/faq.json';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Frequently asked questions about CraftsAI services, pricing, process, and support. Find answers to common questions about AI-powered development.',
  openGraph: {
    title: 'FAQ',
    description:
      'Frequently asked questions about CraftsAI services, pricing, process, and support.',
    url: 'https://www.craftsai.org/faq',
  },
  alternates: { canonical: 'https://www.craftsai.org/faq' },
};

export default function FAQPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="FAQ"
        title="Questions, answered."
        lede="Everything you need to know about working with CraftsAI."
      >
        <Button variant="amber" size="lg" href="/contact">
          Ask us directly
        </Button>
      </PageHero>

      <section className="mx-auto max-w-4xl px-6 py-20 sm:py-28">
        {faqData.map((category, categoryIndex) => (
          <div key={category.category} className="mb-16 last:mb-0">
            <MonoLabel>
              {String(categoryIndex + 1).padStart(2, '0')} / {category.category}
            </MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone sm:text-3xl">
              {category.category}
            </h2>
            <div className="mt-6">
              <Accordion
                items={category.questions.map((q, questionIndex) => ({
                  id: `${category.category}-${questionIndex}`,
                  question: q.question,
                  answer: q.answer,
                }))}
              />
            </div>
          </div>
        ))}
      </section>

      <CTABand
        title="Still have questions?"
        lede="We're happy to help. Get in touch and we'll respond within 24 hours."
        primaryLabel="Contact us"
        primaryHref="/contact"
        secondaryLabel="Get an estimate"
        secondaryHref="/quote"
      />
    </PageLayout>
  );
}
