import { Link } from '@/i18n/navigation';
import MonoLabel from '../../design/ui/MonoLabel';
import { PRIMARY_LINKS, SERVICE_LINKS } from './nav';

const TICKER = '● ACCEPTING PROJECTS — DHAKA — WORLDWIDE — AI AGENTS — WEB — MOBILE — INTEGRATION — ';

const LEGAL_LINKS = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Cookies', href: '/cookies' },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ink-950">
      {/* Marquee status ticker (CSS loop; killed globally by prefers-reduced-motion) */}
      <div className="overflow-hidden border-b border-line py-3" aria-hidden>
        <div className="marquee-track">
          <span className="whitespace-nowrap font-mono text-xs uppercase tracking-[0.18em] text-steel">
            {TICKER.repeat(3)}
          </span>
          <span className="whitespace-nowrap font-mono text-xs uppercase tracking-[0.18em] text-steel">
            {TICKER.repeat(3)}
          </span>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="font-display text-lg font-medium text-bone">
            CRAFTS.AI<span aria-hidden className="cursor-blink">▮</span>
          </p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-steel">
            We build AI agents. Our agents build your software.
          </p>
        </div>

        <div>
          <MonoLabel>Services</MonoLabel>
          <ul className="mt-4 space-y-2.5">
            {SERVICE_LINKS.map((link) => (
              <li key={link.index}>
                <Link
                  href={link.href}
                  className="text-sm text-bone transition-colors duration-150 hover:text-signal"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <MonoLabel>Studio</MonoLabel>
          <ul className="mt-4 space-y-2.5">
            {PRIMARY_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-bone transition-colors duration-150 hover:text-signal"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/careers"
                className="text-sm text-bone transition-colors duration-150 hover:text-signal"
              >
                Careers
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <MonoLabel>Contact</MonoLabel>
          <ul className="mt-4 space-y-2.5">
            <li>
              <a
                href="mailto:hello@craftsai.org"
                className="text-sm text-bone transition-colors duration-150 hover:text-signal"
              >
                hello@craftsai.org
              </a>
            </li>
            <li>
              <Link
                href="/contact"
                className="text-sm text-bone transition-colors duration-150 hover:text-signal"
              >
                Contact form
              </Link>
            </li>
            <li>
              <Link
                href="/quote"
                className="text-sm text-bone transition-colors duration-150 hover:text-signal"
              >
                Get an estimate
              </Link>
            </li>
          </ul>
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-steel">
            Dhaka, Bangladesh
            <br />
            GMT+6 — worldwide
          </p>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-steel">
            © {new Date().getFullYear()} CraftsAI — All systems nominal
          </p>
          <div className="flex gap-6">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-mono text-xs uppercase tracking-[0.15em] text-steel transition-colors duration-150 hover:text-signal"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
