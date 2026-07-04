import { Metadata } from 'next';
import Link from 'next/link';
import PageLayout from '../components/layout/PageLayout';
import PageHero from '../components/shared/PageHero';
import CTABand from '../components/shared/CTABand';
import MonoLabel from '../design/ui/MonoLabel';

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
      <PageHero eyebrow="Legal" title="Privacy Policy" lede="Last updated: April 1, 2026" />

      <section className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <div className="space-y-12">
          <div>
            <MonoLabel>01 / Information we collect</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">
              Information We Collect
            </h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              We collect information you provide directly, such as your name,
              email address, phone number, and company details when you fill
              out a contact form, request a quote, or communicate with us. We
              also collect technical data automatically, including your IP
              address, browser type, device information, and pages visited
              through cookies and similar technologies.
            </p>
          </div>

          <div>
            <MonoLabel>02 / How we use your information</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">
              How We Use Your Information
            </h2>
            <p className="mt-4 text-base leading-relaxed text-steel">We use the information we collect to:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-6 text-base leading-relaxed text-steel">
              <li>Respond to your inquiries and provide requested services</li>
              <li>Process and manage project quotes and contracts</li>
              <li>Send project updates and relevant communications</li>
              <li>Improve our website, services, and user experience</li>
              <li>Comply with legal obligations and protect our rights</li>
            </ul>
          </div>

          <div>
            <MonoLabel>03 / Data sharing</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">Data Sharing</h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              We do not sell, rent, or trade your personal information. We may
              share data with trusted third-party service providers who assist
              us in operating our website, conducting business, or servicing
              you, provided they agree to keep your information confidential.
              We may also disclose information when required by law or to
              protect our rights, safety, or property.
            </p>
          </div>

          <div>
            <MonoLabel>04 / Cookies</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">Cookies</h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              Our website uses cookies and similar tracking technologies to
              enhance your browsing experience, analyze site traffic, and
              understand user behavior. You can control cookie preferences
              through your browser settings. For more details, please review
              our{' '}
              <Link
                href="/cookies"
                className="text-signal underline-offset-4 hover:underline"
              >
                Cookie Policy
              </Link>
              .
            </p>
          </div>

          <div>
            <MonoLabel>05 / Your rights</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">Your Rights</h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              Depending on your location, you may have the right to access,
              correct, delete, or export your personal data. You may also have
              the right to restrict or object to certain processing activities.
              To exercise any of these rights, please contact us using the
              details below. We will respond to your request within 30 days.
            </p>
          </div>

          <div>
            <MonoLabel>06 / Data security</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">Data Security</h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              We implement industry-standard security measures to protect your
              personal information, including encryption in transit (TLS),
              secure server infrastructure, and access controls. However, no
              method of transmission over the Internet is 100% secure, and we
              cannot guarantee absolute security.
            </p>
          </div>

          <div>
            <MonoLabel>07 / Contact us</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">Contact Us</h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              If you have any questions about this Privacy Policy or our data
              practices, please contact us at{' '}
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
