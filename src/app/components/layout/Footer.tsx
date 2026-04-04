import Link from 'next/link';

interface FooterSectionProps {
  title: string;
  links: { label: string; href: string }[];
}

function FooterSection({ title, links }: FooterSectionProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const servicesLinks = [
  { label: 'Web Development', href: '/services/web-development' },
  { label: 'Android Development', href: '/services/android-development' },
  { label: 'iOS Development', href: '/services/ios-development' },
  { label: 'Support & Maintenance', href: '/services/support' },
];

const productsLinks = [
  { label: 'TaxoMind', href: '/products/taxomind' },
  { label: 'TaxoMind Schools', href: '/products/taxomind-schools' },
  { label: 'FinCoach AI', href: '/products/fincoach-ai' },
  { label: 'MathPhysics', href: '/products/mathphysics' },
];

const companyLinks = [
  { label: 'About', href: '/about' },
  { label: 'Process', href: '/process' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact', href: '/contact' },
];

const resourcesLinks = [
  { label: 'Blog', href: '/resources/blog' },
  { label: 'Case Studies', href: '/resources/case-studies' },
  { label: 'Guides', href: '/resources/guides' },
  { label: 'FAQ', href: '/faq' },
];

const legalLinks = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Cookies', href: '/cookies' },
  { label: 'Sitemap', href: '/sitemap.xml' },
];

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-default)] bg-[var(--surface-sunken)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* 5-column grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          {/* Column 1: Brand — spans full width on mobile, 2/3 on md, 1/5 on lg */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
                CraftsAI
              </span>
            </Link>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
              AI-powered development studio building web &amp; mobile apps 10x faster.
            </p>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li>
                <a
                  href="mailto:hello@craftsai.org"
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  hello@craftsai.org
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/880XXXXXXXXXX"
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  WhatsApp: +880 XXXX XXXXXX
                </a>
              </li>
              <li>Bangladesh</li>
            </ul>
          </div>

          {/* Column 2: Services */}
          <FooterSection title="Services" links={servicesLinks} />

          {/* Column 3: Products */}
          <FooterSection title="Products" links={productsLinks} />

          {/* Column 4: Company */}
          <FooterSection title="Company" links={companyLinks} />

          {/* Column 5: Resources */}
          <FooterSection title="Resources" links={resourcesLinks} />
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[var(--border-default)] mt-12 pt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Copyright */}
          <p className="text-sm text-[var(--text-secondary)]">
            &copy; {new Date().getFullYear()} CraftsAI. All rights reserved.
          </p>

          {/* Legal links */}
          <nav className="flex flex-wrap gap-4">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Social icons */}
          <div className="flex items-center gap-4">
            {/* Facebook */}
            <a
              href="https://facebook.com/craftsai"
              aria-label="Facebook"
              className="text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.883v2.271h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
              </svg>
            </a>

            {/* Twitter / X */}
            <a
              href="https://twitter.com/craftsai"
              aria-label="Twitter"
              className="text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://linkedin.com/company/craftsai"
              aria-label="LinkedIn"
              className="text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com/craftsai"
              aria-label="Instagram"
              className="text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
