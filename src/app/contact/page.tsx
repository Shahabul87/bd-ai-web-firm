'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import PageLayout from '../components/layout/PageLayout';
import PageHero from '../components/shared/PageHero';
import Button from '../design/ui/Button';
import MonoLabel from '../design/ui/MonoLabel';
import Card from '../design/ui/Card';

const serviceOptions = [
  'Web Development',
  'Android Development',
  'iOS Development',
  'Support & Maintenance',
  'Product Inquiry',
  'Other',
];

const contactInfo = [
  {
    label: 'Email',
    value: 'hello@craftsai.org',
    href: 'mailto:hello@craftsai.org',
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
        />
      </svg>
    ),
  },
  {
    label: 'WhatsApp',
    value: '+880 XXXX XXXXXX',
    href: 'https://wa.me/880XXXXXXXXXX',
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
        />
      </svg>
    ),
  },
  {
    label: 'Location',
    value: 'Bangladesh',
    href: undefined,
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
        />
      </svg>
    ),
  },
  {
    label: 'Business Hours',
    value: 'Sun–Thu, 9 AM–6 PM (Dhaka, GMT+6)',
    href: undefined,
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
];

interface FormData {
  name: string;
  email: string;
  company: string;
  service: string;
  message: string;
}

export default function ContactPage() {
  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    service: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Failed to send message');
      setStatus('success');
      setForm({ name: '', email: '', company: '', service: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  const labelStyles = 'mb-2 block font-mono text-xs uppercase tracking-[0.15em] text-steel';
  const inputStyles =
    'w-full border border-line bg-ink-900 px-4 py-2.5 text-sm text-bone placeholder:text-steel/50 transition-colors focus:border-signal focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal';

  return (
    <PageLayout>
      <PageHero
        eyebrow="Contact"
        title="Get in touch."
        lede="Have a project in mind? Send a message and we&apos;ll get back to you within 24 hours."
      />

      <section className="bg-ink-950">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
            {/* Direct channels */}
            <div className="lg:col-span-2">
              <MonoLabel>Direct channels</MonoLabel>
              <h2 className="mt-4 font-display text-2xl font-medium text-bone sm:text-3xl">
                Reach us directly.
              </h2>

              <Card className="mt-8">
                <div className="space-y-6">
                  {contactInfo.map((item) => (
                    <div key={item.label} className="flex items-start gap-4">
                      <span className="mt-0.5 text-signal">{item.icon}</span>
                      <div>
                        <p className="font-mono text-xs uppercase tracking-[0.15em] text-steel">
                          {item.label}
                        </p>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="mt-1 block text-sm text-bone transition-colors hover:text-signal"
                            target={
                              item.href.startsWith('http')
                                ? '_blank'
                                : undefined
                            }
                            rel={
                              item.href.startsWith('http')
                                ? 'noopener noreferrer'
                                : undefined
                            }
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="mt-1 text-sm text-bone">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <hr className="my-6 border-line" />

                <Link
                  href="/faq"
                  className="font-mono text-xs uppercase tracking-[0.15em] text-signal hover:underline"
                >
                  Frequently asked questions &rarr;
                </Link>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className={labelStyles}>
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className={inputStyles}
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className={labelStyles}>
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className={inputStyles}
                    placeholder="you@company.com"
                  />
                </div>

                <div>
                  <label htmlFor="company" className={labelStyles}>
                    Company{' '}
                    <span className="normal-case tracking-normal text-steel/70">
                      (optional)
                    </span>
                  </label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    value={form.company}
                    onChange={handleChange}
                    className={inputStyles}
                    placeholder="Your company"
                  />
                </div>

                <div>
                  <label htmlFor="service" className={labelStyles}>
                    Service Interest
                  </label>
                  <select
                    id="service"
                    name="service"
                    required
                    value={form.service}
                    onChange={handleChange}
                    className={inputStyles}
                  >
                    <option value="">Select a service</option>
                    {serviceOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className={labelStyles}>
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    className={inputStyles}
                    placeholder="Tell us about your project..."
                  />
                </div>

                <Button
                  type="submit"
                  variant="signal"
                  size="lg"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? 'Sending...' : 'Send Message'}
                </Button>

                {status === 'success' && (
                  <p className="font-mono text-xs uppercase tracking-[0.15em] text-signal">
                    Message sent! We&apos;ll be in touch soon.
                  </p>
                )}
                {status === 'error' && (
                  <p className="font-mono text-xs uppercase tracking-[0.15em] text-amber">
                    Something went wrong. Please try again or email us directly.
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
