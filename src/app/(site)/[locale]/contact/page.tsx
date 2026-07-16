'use client';

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import PageLayout from '@/app/components/layout/PageLayout';
import PageHero from '@/app/components/shared/PageHero';
import Button from '@/app/design/ui/Button';
import MonoLabel from '@/app/design/ui/MonoLabel';
import Card from '@/app/design/ui/Card';

// The `value` submitted to /api/contact must stay stable and translator-proof,
// so the option values live in code keyed by a stable slug; only the visible
// label is read from the message files (Contact.form.serviceOptions.<slug>).
const serviceOptions: ReadonlyArray<{ slug: string; value: string }> = [
  { slug: 'web', value: 'Web Development' },
  { slug: 'android', value: 'Android Development' },
  { slug: 'ios', value: 'iOS Development' },
  { slug: 'support', value: 'Support & Maintenance' },
  { slug: 'productInquiry', value: 'Product Inquiry' },
  { slug: 'other', value: 'Other' },
];

// Presentation-only channel icons; label + prose values come from messages.
const channelIcons = {
  email: (
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
  whatsapp: (
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
  location: (
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
  hours: (
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
} as const;

interface FormData {
  name: string;
  email: string;
  company: string;
  service: string;
  message: string;
}

export default function ContactPage() {
  const t = useTranslations('Contact');
  const serviceLabels = t.raw('form.serviceOptions') as Record<string, string>;

  const contactInfo: ReadonlyArray<{
    label: string;
    value: string;
    href: string | undefined;
    icon: React.ReactNode;
  }> = [
    { label: t('info.email'), value: 'hello@craftsai.org', href: 'mailto:hello@craftsai.org', icon: channelIcons.email },
    { label: t('info.whatsapp'), value: '+1 775 338 2146', href: 'https://wa.me/17753382146', icon: channelIcons.whatsapp },
    { label: t('info.location'), value: t('info.locationValue'), href: undefined, icon: channelIcons.location },
    { label: t('info.hours'), value: t('info.hoursValue'), href: undefined, icon: channelIcons.hours },
  ];

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
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lede={t('hero.lede')}
      />

      <section className="bg-ink-950">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
            {/* Direct channels */}
            <div className="lg:col-span-2">
              <MonoLabel>{t('directChannels.label')}</MonoLabel>
              <h2 className="mt-4 font-display text-2xl font-medium text-bone sm:text-3xl">
                {t('directChannels.title')}
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
                  {t('directChannels.faqLink')}
                </Link>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className={labelStyles}>
                    {t('form.name')}
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className={inputStyles}
                    placeholder={t('form.namePlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="email" className={labelStyles}>
                    {t('form.email')}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className={inputStyles}
                    placeholder={t('form.emailPlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="company" className={labelStyles}>
                    {t('form.company')}{' '}
                    <span className="normal-case tracking-normal text-steel/70">
                      {t('form.optional')}
                    </span>
                  </label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    value={form.company}
                    onChange={handleChange}
                    className={inputStyles}
                    placeholder={t('form.companyPlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="service" className={labelStyles}>
                    {t('form.service')}
                  </label>
                  <select
                    id="service"
                    name="service"
                    required
                    value={form.service}
                    onChange={handleChange}
                    className={inputStyles}
                  >
                    <option value="">{t('form.servicePlaceholder')}</option>
                    {serviceOptions.map(({ slug, value }) => {
                      const label = serviceLabels[slug];
                      if (label === undefined) {
                        throw new Error(`Missing contact service label for slug: ${slug}`);
                      }
                      return (
                        <option key={slug} value={value}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className={labelStyles}>
                    {t('form.message')}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    className={inputStyles}
                    placeholder={t('form.messagePlaceholder')}
                  />
                </div>

                <Button
                  type="submit"
                  variant="signal"
                  size="lg"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? t('form.sending') : t('form.send')}
                </Button>

                {status === 'success' && (
                  <p className="font-mono text-xs uppercase tracking-[0.15em] text-signal">
                    {t('form.success')}
                  </p>
                )}
                {status === 'error' && (
                  <p className="font-mono text-xs uppercase tracking-[0.15em] text-amber">
                    {t('form.error')}
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
