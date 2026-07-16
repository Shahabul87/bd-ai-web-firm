import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import PageLayout from '@/app/components/layout/PageLayout';
import PageHero from '@/app/components/shared/PageHero';
import CTABand from '@/app/components/shared/CTABand';
import MonoLabel from '@/app/design/ui/MonoLabel';
import Card from '@/app/design/ui/Card';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'CraftsAI cookie policy. Learn about the cookies we use and how to manage your preferences.',
  openGraph: {
    title: 'Cookie Policy',
    description: 'How CraftsAI uses cookies and tracking technologies.',
    url: 'https://www.craftsai.org/cookies',
  },
  alternates: { canonical: 'https://www.craftsai.org/cookies' },
};

const COOKIE_TYPES = [
  {
    title: 'Essential Cookies',
    description:
      'Required for the site to function and stay secure. These carry your authenticated admin or client-portal session, short-lived login challenge state, an optional "remember this device" token, and your cookie-consent choice. They cannot be disabled.',
  },
  {
    title: 'Analytics Cookies (optional)',
    description:
      'If — and only if — you accept analytics in our consent banner, we use Google Analytics to understand how visitors interact with the site (pages visited, session duration, referral sources). You can decline these, and no analytics cookies are set until you consent.',
  },
];

export default async function CookiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PageLayout>
      <PageHero eyebrow="Legal" title="Cookie Policy" lede="Last updated: July 5, 2026" />

      <section className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <div className="space-y-12">
          <div>
            <MonoLabel>01 / What are cookies</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">What Are Cookies</h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              Cookies are small text files placed on your device when you
              visit a website. They are widely used to make websites work
              efficiently, provide a better user experience, and supply
              information to site owners. Cookies may be set by the website
              you are visiting (first-party cookies) or by third-party
              services embedded on the page.
            </p>
          </div>

          <div>
            <MonoLabel>02 / Types of cookies we use</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">
              Types of Cookies We Use
            </h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              We use the following categories of cookies on our website:
            </p>
            <div className="mt-6 space-y-4">
              {COOKIE_TYPES.map((cookieType) => (
                <Card key={cookieType.title}>
                  <h3 className="font-display text-base font-medium text-bone">
                    {cookieType.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-steel">
                    {cookieType.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <MonoLabel>03 / Managing cookies</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">Managing Cookies</h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              Most web browsers allow you to control cookies through their
              settings. You can configure your browser to block or delete
              cookies, or to alert you when a cookie is being set. Please note
              that disabling essential cookies may affect the functionality of
              our website. Refer to your browser&apos;s help documentation for
              instructions on managing cookie preferences.
            </p>
          </div>

          <div>
            <MonoLabel>04 / Updates to this policy</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">
              Updates to This Policy
            </h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              We may update this Cookie Policy from time to time to reflect
              changes in technology, legislation, or our business practices.
              The &quot;Last updated&quot; date at the top of this page
              indicates when the policy was most recently revised.
            </p>
          </div>

          <div>
            <MonoLabel>05 / Contact</MonoLabel>
            <h2 className="mt-3 font-display text-2xl font-medium text-bone">Contact</h2>
            <p className="mt-4 text-base leading-relaxed text-steel">
              If you have questions about our use of cookies, please contact
              us at{' '}
              <a
                href="mailto:hello@craftsai.org"
                className="text-signal underline-offset-4 hover:underline"
              >
                hello@craftsai.org
              </a>{' '}
              or review our{' '}
              <Link
                href="/privacy"
                className="text-signal underline-offset-4 hover:underline"
              >
                Privacy Policy
              </Link>{' '}
              for more information about how we handle your data.
            </p>
          </div>
        </div>
      </section>

      <CTABand />
    </PageLayout>
  );
}
