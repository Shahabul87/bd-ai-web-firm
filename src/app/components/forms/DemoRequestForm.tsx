'use client';

import { useState, FormEvent } from 'react';

interface DemoRequestFormProps {
  productName: string;
}

interface FormData {
  name: string;
  email: string;
  company: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
}

export default function DemoRequestForm({ productName }: DemoRequestFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          product: productName,
          message: formData.message,
          website: '', // honeypot
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setSubmitError(data.message || 'Something went wrong. Please try again.');
        }
        return;
      }

      setIsSuccess(true);
      setFormData({ name: '', email: '', company: '', message: '' });
    } catch {
      setSubmitError('Something went wrong. Please try again or email us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div
        className="rounded-xl border p-8 text-center"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
        }}
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
          <svg
            className="h-6 w-6 text-emerald-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3
          className="text-lg font-semibold"
          style={{ color: 'var(--foreground)' }}
        >
          Demo Request Received!
        </h3>
        <p
          className="mt-2 text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          Thank you for your interest in {productName}. We&apos;ll be in touch within 24
          hours to schedule your personalized demo.
        </p>
        <button
          onClick={() => setIsSuccess(false)}
          className="mt-6 text-sm font-medium text-indigo-500 hover:text-indigo-400 transition-colors"
        >
          Submit another request
        </button>
      </div>
    );
  }

  const inputStyles =
    'w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Honeypot - hidden from humans */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          type="text"
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Hidden product field */}
      <input type="hidden" name="product" value={productName} />

      <div>
        <label
          htmlFor="demo-name"
          className="mb-1.5 block text-sm font-medium"
          style={{ color: 'var(--foreground)' }}
        >
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="demo-name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={handleChange}
          className={inputStyles}
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: errors.name ? '#ef4444' : 'var(--border-default)',
            color: 'var(--foreground)',
          }}
          placeholder="Your name"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="demo-email"
          className="mb-1.5 block text-sm font-medium"
          style={{ color: 'var(--foreground)' }}
        >
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="demo-email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          className={inputStyles}
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: errors.email ? '#ef4444' : 'var(--border-default)',
            color: 'var(--foreground)',
          }}
          placeholder="you@company.com"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="demo-company"
          className="mb-1.5 block text-sm font-medium"
          style={{ color: 'var(--foreground)' }}
        >
          Company{' '}
          <span className="font-normal" style={{ color: 'var(--text-secondary)' }}>
            (optional)
          </span>
        </label>
        <input
          id="demo-company"
          name="company"
          type="text"
          value={formData.company}
          onChange={handleChange}
          className={inputStyles}
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--border-default)',
            color: 'var(--foreground)',
          }}
          placeholder="Your company"
        />
      </div>

      <div>
        <label
          htmlFor="demo-message"
          className="mb-1.5 block text-sm font-medium"
          style={{ color: 'var(--foreground)' }}
        >
          Message{' '}
          <span className="font-normal" style={{ color: 'var(--text-secondary)' }}>
            (optional)
          </span>
        </label>
        <textarea
          id="demo-message"
          name="message"
          rows={4}
          value={formData.message}
          onChange={handleChange}
          className={inputStyles}
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--border-default)',
            color: 'var(--foreground)',
          }}
          placeholder="Tell us about your needs or any specific features you&apos;d like to see..."
        />
      </div>

      {submitError && (
        <p className="text-sm text-red-500">{submitError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: 'linear-gradient(135deg, #00E5FF, #8B5CF6)',
        }}
      >
        {isSubmitting ? 'Submitting...' : `Request ${productName} Demo`}
      </button>
    </form>
  );
}
