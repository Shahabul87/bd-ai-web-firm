import { Metadata } from 'next';
import Link from 'next/link';
import PageLayout from '../components/layout/PageLayout';
import PageHero from '../components/shared/PageHero';
import CTABand from '../components/shared/CTABand';
import MonoLabel from '../design/ui/MonoLabel';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'CraftsAI privacy policy. Learn how we collect, use, and protect your personal information.',
  openGraph: {
    title: 'Privacy Policy',
    description: 'How CraftsAI collects, uses, and protects your data.',
    url: 'https://www.craftsai.org/privacy',
  },
  alternates: { canonical: 'https://www.craftsai.org/privacy' },
};

export default function PrivacyPage() {
  return (
    <PageLayout>
      <PageHero eyebrow="Legal" title="Privacy Policy" lede="Last updated: July 5, 2026" />

      {/*
        FOUNDER TODO before public launch — finalize the bracketed [placeholders]
        below with your real details and have this reviewed by a lawyer:
          • Named sub-processors (hosting/database provider, email provider).
          • Concrete data-retention periods per data category.
          • Your registered legal/business entity name & jurisdiction.
        The data categories and processor *types* described here are accurate to
        what the application actually collects and transmits as of this date.
      */}
      <section className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <div className="space-y-12">
          <div>
            <MonoLabel>01 / Information we collect</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">
              Information We Collect
            </h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              We collect information in the following ways:
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-6 text-base leading-relaxed text-steel">
              <li>
                <strong className="text-bone">Enquiry &amp; lead forms.</strong> When you use our
                contact, quote, or demo forms we collect the details you provide — such as your
                name, email address, company, phone number, project requirements, and message —
                together with technical metadata (your IP address and browser user-agent) used for
                spam prevention and security.
              </li>
              <li>
                <strong className="text-bone">Client portal.</strong> If you are an active client,
                we process your account email, your projects, invoices we issue to you, and any
                messages you exchange with us through the portal.
              </li>
              <li>
                <strong className="text-bone">Authentication.</strong> We use passwordless login. To
                sign you in we process your email address and one-time login codes / magic links,
                and — if you choose &ldquo;remember this device&rdquo; — a trusted-device token.
              </li>
              <li>
                <strong className="text-bone">Push notifications (optional).</strong> If you opt in
                to browser notifications, we store a device push token so we can deliver them.
              </li>
              <li>
                <strong className="text-bone">Analytics (optional).</strong> Where enabled and where
                you consent, we collect usage analytics such as pages visited and device type.
              </li>
            </ul>
          </div>

          <div>
            <MonoLabel>02 / How we use your information</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">
              How We Use Your Information
            </h2>
            <p className="mt-4 text-base leading-relaxed text-steel">We use the information we collect to:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-6 text-base leading-relaxed text-steel">
              <li>Respond to your inquiries and provide requested services</li>
              <li>Process and manage project quotes, contracts, and invoices</li>
              <li>Authenticate you and secure your account and our systems</li>
              <li>Send project updates, transactional emails, and (if opted in) push notifications</li>
              <li>Improve our website, services, and user experience</li>
              <li>Comply with legal obligations and protect our rights</li>
            </ul>
          </div>

          <div>
            <MonoLabel>03 / Service providers &amp; data sharing</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">
              Service Providers &amp; Data Sharing
            </h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              We do not sell, rent, or trade your personal information. We share data only with the
              service providers needed to run our business, each of which processes it on our behalf:
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-6 text-base leading-relaxed text-steel">
              <li>
                <strong className="text-bone">Cloud hosting &amp; database</strong> —
                [hosting/database provider] hosts our application and stores lead, client, project,
                and invoice records.
              </li>
              <li>
                <strong className="text-bone">Notifications &amp; login</strong> — our notification
                service delivers transactional email and login codes via [email delivery provider],
                and delivers browser push via Google Firebase Cloud Messaging.
              </li>
              <li>
                <strong className="text-bone">Analytics</strong> — where enabled, Google Analytics
                helps us understand site usage.
              </li>
            </ul>
            <p className="mt-4 text-base leading-relaxed text-steel">
              We may also disclose information when required by law or to protect our rights, safety,
              or property.
            </p>
          </div>

          <div>
            <MonoLabel>04 / Cookies &amp; analytics</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">Cookies &amp; Analytics</h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              We use strictly-necessary cookies for authentication and security, and — only with
              your consent — analytics cookies to understand site usage. You can control cookie
              preferences through the consent banner and your browser settings. For more details,
              please review our{' '}
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
            <MonoLabel>05 / Data retention</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">Data Retention</h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              We keep personal data only as long as necessary for the purposes above or as required
              by law. Indicatively: lead enquiries are retained for [retention period]; client
              project, invoice, and message records for [retention period, e.g. as required for
              tax/accounting]; and optional push tokens until you disable notifications. You can
              request earlier deletion as described below.
            </p>
          </div>

          <div>
            <MonoLabel>06 / Your rights</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">Your Rights</h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              Depending on your location, you may have the right to access, correct, delete, or
              export your personal data, and to restrict or object to certain processing. To
              exercise any of these rights — including deleting your lead record or client-portal
              data — email us at{' '}
              <a
                href="mailto:hello@craftsai.org"
                className="text-signal underline-offset-4 hover:underline"
              >
                hello@craftsai.org
              </a>{' '}
              from the address associated with your data. We will verify your identity and respond
              within 30 days.
            </p>
          </div>

          <div>
            <MonoLabel>07 / Data security</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">Data Security</h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              We implement industry-standard security measures to protect your personal information,
              including encryption in transit (TLS), passwordless authentication, access controls,
              and separation between our public site, admin, and client-portal systems. However, no
              method of transmission over the Internet is 100% secure, and we cannot guarantee
              absolute security.
            </p>
          </div>

          <div>
            <MonoLabel>08 / Contact us</MonoLabel>
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
