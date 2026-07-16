import { Metadata } from 'next';
import PageLayout from '@/app/components/layout/PageLayout';
import PageHero from '@/app/components/shared/PageHero';
import CTABand from '@/app/components/shared/CTABand';
import MonoLabel from '@/app/design/ui/MonoLabel';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'CraftsAI terms of service. Read the terms and conditions governing the use of our website and services.',
  openGraph: {
    title: 'Terms of Service',
    description: 'Terms and conditions for using CraftsAI services.',
    url: 'https://www.craftsai.org/terms',
  },
  alternates: { canonical: 'https://www.craftsai.org/terms' },
};

export default function TermsPage() {
  return (
    <PageLayout>
      <PageHero eyebrow="Legal" title="Terms of Service" lede="Last updated: April 1, 2026" />

      <section className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <div className="space-y-12">
          <div>
            <MonoLabel>01 / Service terms</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">Service Terms</h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              By engaging CraftsAI for software development services, you
              agree to these terms. Our services include web development,
              mobile application development, product customization, and
              ongoing support as outlined in individual project proposals. All
              project scopes, timelines, and deliverables are defined in a
              signed Statement of Work (SOW) prior to commencement.
            </p>
          </div>

          <div>
            <MonoLabel>02 / Intellectual property</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">
              Intellectual Property
            </h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              Upon full payment, all custom code, designs, and deliverables
              created specifically for your project are transferred to you.
              CraftsAI retains ownership of proprietary tools, frameworks, and
              reusable components developed independently of your project. We
              reserve the right to showcase completed work in our portfolio
              unless a non-disclosure agreement is in place.
            </p>
          </div>

          <div>
            <MonoLabel>03 / Payment terms</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">Payment Terms</h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              Payment schedules are defined in the project SOW. Standard terms
              require 30% upfront, 40% at the mid-project milestone, and 30%
              upon final delivery. Invoices are due within 14 days of issue
              unless otherwise agreed. Late payments may result in project
              suspension after a 7-day grace period and written notice.
            </p>
          </div>

          <div>
            <MonoLabel>04 / Limitation of liability</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">
              Limitation of Liability
            </h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              CraftsAI provides services on an &quot;as is&quot; basis to the
              extent permitted by law. Our total liability for any claim
              arising from our services shall not exceed the total fees paid
              for the specific project in question. We are not liable for
              indirect, incidental, or consequential damages including lost
              profits, data loss, or business interruption.
            </p>
          </div>

          <div>
            <MonoLabel>05 / Termination</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">Termination</h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              Either party may terminate a project with 14 days written
              notice. Upon termination, the client is responsible for payment
              of all work completed up to the termination date. CraftsAI will
              deliver all completed work and source code for paid milestones.
              Refunds for prepaid but undelivered work will be issued within
              30 days of termination.
            </p>
          </div>

          <div>
            <MonoLabel>06 / Governing law</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">Governing Law</h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              These terms are governed by the laws of Bangladesh. Any disputes
              arising from these terms or our services shall be resolved
              through good-faith negotiation first, followed by binding
              arbitration if necessary.
            </p>
          </div>

          <div>
            <MonoLabel>07 / Contact</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">Contact</h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              For questions about these terms, contact us at{' '}
              <a
                href="mailto:hello@craftsai.org"
                className="text-signal underline-offset-4 hover:underline"
              >
                hello@craftsai.org
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      <CTABand />
    </PageLayout>
  );
}
