import { Metadata } from 'next';
import Link from 'next/link';
import PageLayout from '../components/layout/PageLayout';

export const metadata: Metadata = {
  title: 'Cookie Policy | CraftsAI',
  description:
    'CraftsAI cookie policy. Learn about the cookies we use and how to manage your preferences.',
  openGraph: {
    title: 'Cookie Policy | CraftsAI',
    description: 'How CraftsAI uses cookies and tracking technologies.',
    url: 'https://www.craftsai.org/cookies',
  },
  alternates: { canonical: 'https://www.craftsai.org/cookies' },
};

export default function CookiesPage() {
  return (
    <PageLayout>
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
            Cookie Policy
          </h1>
          <p className="mt-4 text-sm text-[var(--text-secondary)]">
            Last updated: April 1, 2026
          </p>

          <div className="mt-12 space-y-10 text-[var(--text-secondary)] leading-relaxed">
            <div>
              <h2 className="mb-3 text-xl font-semibold text-[var(--foreground)]">
                1. What Are Cookies
              </h2>
              <p>
                Cookies are small text files placed on your device when you
                visit a website. They are widely used to make websites work
                efficiently, provide a better user experience, and supply
                information to site owners. Cookies may be set by the website
                you are visiting (first-party cookies) or by third-party
                services embedded on the page.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-[var(--foreground)]">
                2. Types of Cookies We Use
              </h2>
              <p className="mb-4">
                We use the following categories of cookies on our website:
              </p>
              <div className="space-y-4">
                <div className="rounded-lg border border-[var(--border-default)] bg-[var(--surface)] p-4">
                  <h3 className="font-medium text-[var(--foreground)]">
                    Essential Cookies
                  </h3>
                  <p className="mt-1 text-sm">
                    Required for the website to function properly. These enable
                    basic features like page navigation, theme preferences, and
                    secure access. They cannot be disabled.
                  </p>
                </div>
                <div className="rounded-lg border border-[var(--border-default)] bg-[var(--surface)] p-4">
                  <h3 className="font-medium text-[var(--foreground)]">
                    Analytics Cookies
                  </h3>
                  <p className="mt-1 text-sm">
                    Help us understand how visitors interact with our website by
                    collecting anonymous usage data such as pages visited,
                    session duration, and referral sources. We use this
                    information to improve our content and performance.
                  </p>
                </div>
                <div className="rounded-lg border border-[var(--border-default)] bg-[var(--surface)] p-4">
                  <h3 className="font-medium text-[var(--foreground)]">
                    Functional Cookies
                  </h3>
                  <p className="mt-1 text-sm">
                    Remember your preferences and settings, such as language
                    selection and form data, to provide a more personalized
                    experience on return visits.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-[var(--foreground)]">
                3. Managing Cookies
              </h2>
              <p>
                Most web browsers allow you to control cookies through their
                settings. You can configure your browser to block or delete
                cookies, or to alert you when a cookie is being set. Please note
                that disabling essential cookies may affect the functionality of
                our website. Refer to your browser&apos;s help documentation for
                instructions on managing cookie preferences.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-[var(--foreground)]">
                4. Updates to This Policy
              </h2>
              <p>
                We may update this Cookie Policy from time to time to reflect
                changes in technology, legislation, or our business practices.
                The &quot;Last updated&quot; date at the top of this page
                indicates when the policy was most recently revised.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-[var(--foreground)]">
                5. Contact
              </h2>
              <p>
                If you have questions about our use of cookies, please contact
                us at{' '}
                <a
                  href="mailto:hello@craftsai.org"
                  className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300"
                >
                  hello@craftsai.org
                </a>{' '}
                or review our{' '}
                <Link
                  href="/privacy"
                  className="text-indigo-400 underline underline-offset-4 hover:text-indigo-300"
                >
                  Privacy Policy
                </Link>{' '}
                for more information about how we handle your data.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
