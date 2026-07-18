/**
 * @jest-environment node
 *
 * Phase 2 Task 2.1 — the quote funnel contract.
 *
 * Before: the API required `projectType` (no wizard control collects it) and
 * `companyName` (the UI labels it optional), so EVERY wizard submission was
 * rejected 400 — and neither error had a render site, so the visitor saw only a
 * generic banner on step 1. Meanwhile `budget` and `agreedToTerms` were enforced
 * only client-side, so a direct API call could skip both.
 */
jest.mock('@/app/utils/rateLimit', () => ({
  checkRateLimit: jest.fn().mockResolvedValue({ success: true, resetIn: 0, remaining: 5 }),
  getClientIP: jest.fn().mockReturnValue('1.2.3.4'),
}));
jest.mock('@/app/lib/leads', () => ({
  createLead: jest.fn().mockResolvedValue({ id: 'lead_q1' }),
}));
jest.mock('@/app/lib/notify', () => ({
  sendAnnouncement: jest.fn().mockResolvedValue({ ok: true }),
  sendPush: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/app/lib/email', () => ({
  SITE_URL: 'https://www.craftsai.org',
  CONTACT_EMAIL: 'owner@craftsai.org',
}));

import { NextRequest } from 'next/server';
import { createLead } from '@/app/lib/leads';
import { POST as quotePOST } from '@/app/api/quote/route';
import { QUOTE_FIELD_CODES, QUOTE_FIELD_STEP } from '@/app/lib/formErrors';

const createLeadMock = createLead as jest.Mock;

/** Exactly what the 5-step wizard collects — nothing more. */
function wizardSubmission(over: Record<string, unknown> = {}) {
  return {
    projectDetails: {
      services: ['web-development'],
      complexity: 'standard',
      description: 'We need a marketing site with a client portal and invoicing.',
      requirements: '',
      timeline: 'standard',
      budget: 'seed',
    },
    companyInfo: {
      companyName: '',
      industry: '',
      companySize: '',
      contactName: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: '',
      preferredContact: 'email',
    },
    specialRequirements: '',
    agreedToTerms: true,
    ...over,
  };
}

function postJson(body: unknown): NextRequest {
  return new NextRequest(new URL('https://www.craftsai.org/api/quote'), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  createLeadMock.mockResolvedValue({ id: 'lead_q1' });
});

describe('a realistic wizard submission succeeds', () => {
  it('accepts what the wizard actually collects (no projectType, no company)', async () => {
    const res = await quotePOST(postJson(wizardSubmission()));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.submissionId).toBe('lead_q1');
    expect(createLeadMock).toHaveBeenCalledTimes(1);
  });

  it('persists the complete payload for the founder', async () => {
    await quotePOST(postJson(wizardSubmission()));
    const arg = createLeadMock.mock.calls[0][0];
    expect(arg).toEqual(
      expect.objectContaining({
        source: 'QUOTE',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
      }),
    );
    expect(arg.payload).toEqual(
      expect.objectContaining({
        services: ['Web Development'], // id mapped to display name
        budget: 'seed',
        complexity: 'standard',
        timeline: 'standard',
        description: 'We need a marketing site with a client portal and invoicing.',
      }),
    );
  });

  it('still accepts a company name when the visitor provides one', async () => {
    await quotePOST(
      postJson(wizardSubmission({ companyInfo: { ...wizardSubmission().companyInfo, companyName: 'Analytical Engines' } })),
    );
    expect(createLeadMock.mock.calls[0][0].company).toBe('Analytical Engines');
  });
});

describe('validation matches the wizard, field-by-field', () => {
  it('rejects an empty service selection with the services code', async () => {
    const res = await quotePOST(
      postJson(wizardSubmission({ projectDetails: { ...wizardSubmission().projectDetails, services: [] } })),
    );
    expect(res.status).toBe(400);
    expect((await res.json()).errors.services).toBe(QUOTE_FIELD_CODES.services);
  });

  it('rejects a too-short description', async () => {
    const res = await quotePOST(
      postJson(wizardSubmission({ projectDetails: { ...wizardSubmission().projectDetails, description: 'too short' } })),
    );
    expect(res.status).toBe(400);
    expect((await res.json()).errors.description).toBe(QUOTE_FIELD_CODES.description);
  });

  it('rejects a missing budget (previously accepted by the API)', async () => {
    const res = await quotePOST(
      postJson(wizardSubmission({ projectDetails: { ...wizardSubmission().projectDetails, budget: '' } })),
    );
    expect(res.status).toBe(400);
    expect((await res.json()).errors.budget).toBe(QUOTE_FIELD_CODES.budget);
  });

  it('rejects a submission that did not agree to terms (previously accepted)', async () => {
    const res = await quotePOST(postJson(wizardSubmission({ agreedToTerms: false })));
    expect(res.status).toBe(400);
    expect((await res.json()).errors.terms).toBe(QUOTE_FIELD_CODES.terms);
    expect(createLeadMock).not.toHaveBeenCalled();
  });

  it('rejects an invalid email', async () => {
    const res = await quotePOST(
      postJson(wizardSubmission({ companyInfo: { ...wizardSubmission().companyInfo, email: 'not-an-email' } })),
    );
    expect(res.status).toBe(400);
    expect((await res.json()).errors.email).toBe(QUOTE_FIELD_CODES.email);
  });

  it('never reports an error for a field the wizard cannot fix', async () => {
    // Every returned error code must belong to a field the wizard owns a step
    // for — otherwise the visitor is stuck with an unfixable rejection.
    const res = await quotePOST(postJson({ projectDetails: {}, companyInfo: {}, agreedToTerms: false }));
    expect(res.status).toBe(400);
    const { errors } = await res.json();
    for (const field of Object.keys(errors)) {
      expect(QUOTE_FIELD_STEP).toHaveProperty(field);
    }
  });
});

describe('boundary and hostile input', () => {
  it('accepts a description at exactly the 20-char minimum', async () => {
    const res = await quotePOST(
      postJson(wizardSubmission({ projectDetails: { ...wizardSubmission().projectDetails, description: 'x'.repeat(20) } })),
    );
    expect(res.status).toBe(200);
  });

  it('stores Unicode/Bengali and punctuation verbatim', async () => {
    await quotePOST(
      postJson(
        wizardSubmission({
          companyInfo: { ...wizardSubmission().companyInfo, contactName: "R&D's দল" },
          projectDetails: { ...wizardSubmission().projectDetails, description: 'আমাদের একটি "AI" প্রকল্প দরকার — বিস্তারিত।' },
        }),
      ),
    );
    const arg = createLeadMock.mock.calls[0][0];
    expect(arg.name).toBe("R&D's দল");
    expect(arg.message).toBe('আমাদের একটি "AI" প্রকল্প দরকার — বিস্তারিত।');
  });

  it('returns 503 rather than claiming success when the lead is not persisted', async () => {
    createLeadMock.mockResolvedValue(null);
    const res = await quotePOST(postJson(wizardSubmission()));
    expect(res.status).toBe(503);
    expect((await res.json()).success).toBe(false);
  });
});

describe('every quote field code maps to a wizard step', () => {
  it('has a step for each field code', () => {
    for (const field of Object.keys(QUOTE_FIELD_CODES)) {
      expect(QUOTE_FIELD_STEP[field as keyof typeof QUOTE_FIELD_CODES]).toBeGreaterThanOrEqual(1);
    }
  });
});
