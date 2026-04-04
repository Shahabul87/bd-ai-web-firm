import { Metadata } from 'next';
import Link from 'next/link';
import PageLayout from '../components/layout/PageLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy | CraftsAI',
  description:
    'CraftsAI privacy policy. Learn how we collect, use, and protect your personal information.',
  openGraph: {
    title: 'Privacy Policy | CraftsAI',
    description: 'How CraftsAI collects, uses, and protects your data.',
    url: 'https://www.craftsai.org/privacy',
  },
  alternates: { canonical: 'https://www.craftsai.org/privacy' },
};

export default function PrivacyPage() {
  return (
    <PageLayout>
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-[var(--text-secondary)]">
            Last updated: April 1, 2026
          </p>

          <div className="mt-12 space-y-10 text-[var(--text-secondary)] leading-relaxed">
            <div>
              <h2 className="mb-3 text-xl font-semibold text-[var(--foreground)]">
                1. Information We Collect
              </h2>
              <p>
                We collect information you provide directly, such as your name,
                email address, phone number, and company details when you fill
                out a contact form, request a quote, or communicate with us. We
                also collect technical data automatically, including your IP
                address, browser type, device information, and pages visited
                through cookies and similar technologies.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-[var(--foreground)]">
                2. How We Use Your Information
              </h2>
              <p>We use the information we collect to:</p>
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>Respond to your inquiries and provide requested services</li>
                <li>Process and manage project quotes and contracts</li>
                <li>Send project updates and relevant communications</li>
                <li>Improve our website, services, and user experience</li>
                <li>Comply with legal obligations and protect our rights</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-[var(--foreground)]">
                3. Data Sharing
              </h2>
              <p>
                We do not sell, rent, or trade your personal information. We may
                share data with trusted third-party service providers who assist
                us in operating our website, conducting business, or servicing
                you, provided they agree to keep your information confidential.
                We may also disclose information when required by law or to
                protect our rights, safety, or property.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-[var(--foreground)]">
                4. Cookies
              </h2>
              <p>
                Our website uses cookies and similar tracking technologies to
                enhance your browsing experience, analyze site traffic, and
                understand user behavior. You can control cookie preferences
                through your browser settings. For more details, please review
                our{' '}
                <Link
                  href="/cookies"
                  className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300"
                >
                  Cookie Policy
                </Link>
                .
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-[var(--foreground)]">
                5. Your Rights
              </h2>
              <p>
                Depending on your location, you may have the right to access,
                correct, delete, or export your personal data. You may also have
                the right to restrict or object to certain processing activities.
                To exercise any of these rights, please contact us using the
                details below. We will respond to your request within 30 days.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-[var(--foreground)]">
                6. Data Security
              </h2>
              <p>
                We implement industry-standard security measures to protect your
                personal information, including encryption in transit (TLS),
                secure server infrastructure, and access controls. However, no
                method of transmission over the Internet is 100% secure, and we
                cannot guarantee absolute security.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-[var(--foreground)]">
                7. Contact Us
              </h2>
              <p>
                If you have any questions about this Privacy Policy or our data
                practices, please contact us at{' '}
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
