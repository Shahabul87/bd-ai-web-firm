'use client';

import { useState, FormEvent } from 'react';
import PageLayout from '../components/layout/PageLayout';
import Button from '../components/ui/Button';
import Link from 'next/link';

const serviceOptions = [
  'Web Development',
  'Android Development',
  'iOS Development',
  'Support &amp; Maintenance',
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
    value: 'Sun\u2013Thu, 9 AM\u20136 PM BST',
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

  const inputStyles =
    'w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-elevated)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--text-secondary)]/60 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors';

  return (
    <PageLayout>
      {/* Hero */}
      <section
        className="py-20 md:py-28"
        style={{
          background:
            'linear-gradient(180deg, var(--background) 0%, var(--surface-sunken) 100%)',
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--foreground)]">
            Get in Touch
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-[var(--text-secondary)]">
            Have a project in mind? Send us a message and we&apos;ll get back to
            you within 24 hours.
          </p>
        </div>
      </section>

      {/* Form + Info */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-5">
            {/* Contact Form */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-sm font-medium text-[var(--foreground)]"
                  >
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
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-[var(--foreground)]"
                  >
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
                  <label
                    htmlFor="company"
                    className="mb-1.5 block text-sm font-medium text-[var(--foreground)]"
                  >
                    Company{' '}
                    <span className="text-[var(--text-secondary)] font-normal">
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
                  <label
                    htmlFor="service"
                    className="mb-1.5 block text-sm font-medium text-[var(--foreground)]"
                  >
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
                  <label
                    htmlFor="message"
                    className="mb-1.5 block text-sm font-medium text-[var(--foreground)]"
                  >
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
                  size="lg"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? 'Sending...' : 'Send Message'}
                </Button>

                {status === 'success' && (
                  <p className="text-sm text-emerald-500">
                    Message sent! We&apos;ll be in touch soon.
                  </p>
                )}
                {status === 'error' && (
                  <p className="text-sm text-red-500">
                    Something went wrong. Please try again or email us directly.
                  </p>
                )}
              </form>
            </div>

            {/* Contact Info Panel */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 md:p-8">
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  Contact Information
                </h2>
                <div className="mt-6 space-y-6">
                  {contactInfo.map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <span className="mt-0.5 text-indigo-500">{item.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">
                          {item.label}
                        </p>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="text-sm text-[var(--text-secondary)] hover:text-indigo-500 transition-colors"
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
                          <p className="text-sm text-[var(--text-secondary)]">
                            {item.value}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <hr className="my-6 border-[var(--border-default)]" />

                <Link
                  href="/faq"
                  className="text-sm font-medium text-indigo-500 hover:text-indigo-400 transition-colors"
                >
                  Frequently Asked Questions &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
