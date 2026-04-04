import { Metadata } from 'next';
import PageLayout from '../components/layout/PageLayout';

export const metadata: Metadata = {
  title: 'Terms of Service | CraftsAI',
  description:
    'CraftsAI terms of service. Read the terms and conditions governing the use of our website and services.',
  openGraph: {
    title: 'Terms of Service | CraftsAI',
    description: 'Terms and conditions for using CraftsAI services.',
    url: 'https://www.craftsai.org/terms',
  },
  alternates: { canonical: 'https://www.craftsai.org/terms' },
};

export default function TermsPage() {
  return (
    <PageLayout>
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-sm text-[var(--text-secondary)]">
            Last updated: April 1, 2026
          </p>

          <div className="mt-12 space-y-10 text-[var(--text-secondary)] leading-relaxed">
            <div>
              <h2 className="mb-3 text-xl font-semibold text-[var(--foreground)]">
                1. Service Terms
              </h2>
              <p>
                By engaging CraftsAI for software development services, you
                agree to these terms. Our services include web development,
                mobile application development, product customization, and
                ongoing support as outlined in individual project proposals. All
                project scopes, timelines, and deliverables are defined in a
                signed Statement of Work (SOW) prior to commencement.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-[var(--foreground)]">
                2. Intellectual Property
              </h2>
              <p>
                Upon full payment, all custom code, designs, and deliverables
                created specifically for your project are transferred to you.
                CraftsAI retains ownership of proprietary tools, frameworks, and
                reusable components developed independently of your project. We
                reserve the right to showcase completed work in our portfolio
                unless a non-disclosure agreement is in place.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-[var(--foreground)]">
                3. Payment Terms
              </h2>
              <p>
                Payment schedules are defined in the project SOW. Standard terms
                require 30% upfront, 40% at the mid-project milestone, and 30%
                upon final delivery. Invoices are due within 14 days of issue
                unless otherwise agreed. Late payments may result in project
                suspension after a 7-day grace period and written notice.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-[var(--foreground)]">
                4. Limitation of Liability
              </h2>
              <p>
                CraftsAI provides services on an &quot;as is&quot; basis to the
                extent permitted by law. Our total liability for any claim
                arising from our services shall not exceed the total fees paid
                for the specific project in question. We are not liable for
                indirect, incidental, or consequential damages including lost
                profits, data loss, or business interruption.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-[var(--foreground)]">
                5. Termination
              </h2>
              <p>
                Either party may terminate a project with 14 days written
                notice. Upon termination, the client is responsible for payment
                of all work completed up to the termination date. CraftsAI will
                deliver all completed work and source code for paid milestones.
                Refunds for prepaid but undelivered work will be issued within
                30 days of termination.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-[var(--foreground)]">
                6. Governing Law
              </h2>
              <p>
                These terms are governed by the laws of Bangladesh. Any disputes
                arising from these terms or our services shall be resolved
                through good-faith negotiation first, followed by binding
                arbitration if necessary.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-[var(--foreground)]">
                7. Contact
              </h2>
              <p>
                For questions about these terms, contact us at{' '}
                <a
                  href="mailto:hello@craftsai.org"
                  className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300"
                >
                  hello@craftsai.org
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
