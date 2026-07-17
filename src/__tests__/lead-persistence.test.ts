/**
 * @jest-environment node
 *
 * Phase 2 Task 2.2 — the public forms must persist everything they collect.
 * The contact form has always sent `company` and `service`, but the route read
 * only name/email/message and stored `payload: { name, email, message }`, so
 * both were silently dropped. These tests pin the EXACT createLead payload.
 */
jest.mock('@/app/utils/rateLimit', () => ({
  checkRateLimit: jest.fn().mockResolvedValue({ success: true, resetIn: 0, remaining: 5 }),
  getClientIP: jest.fn().mockReturnValue('1.2.3.4'),
}));
jest.mock('@/app/lib/leads', () => ({
  createLead: jest.fn().mockResolvedValue({ id: 'lead_1' }),
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
import { POST as contactPOST } from '@/app/api/contact/route';
import { POST as demoPOST } from '@/app/api/demo/route';

const createLeadMock = createLead as jest.Mock;

function postJson(url: string, body: unknown): NextRequest {
  return new NextRequest(new URL(url), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  createLeadMock.mockResolvedValue({ id: 'lead_1' });
});

describe('contact route persists every collected field', () => {
  it('stores company and service interest (previously discarded)', async () => {
    const res = await contactPOST(
      postJson('https://www.craftsai.org/api/contact', {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        company: 'Analytical Engines Ltd',
        service: 'web-development',
        message: 'I would like to discuss a long enough project message.',
      }),
    );

    expect(res.status).toBe(200);
    expect(createLeadMock).toHaveBeenCalledTimes(1);
    const arg = createLeadMock.mock.calls[0][0];
    expect(arg).toEqual(
      expect.objectContaining({
        source: 'CONTACT',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        company: 'Analytical Engines Ltd',
        message: 'I would like to discuss a long enough project message.',
      }),
    );
    // The full payload keeps service interest for the founder/admin detail view.
    expect(arg.payload).toEqual({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      message: 'I would like to discuss a long enough project message.',
      company: 'Analytical Engines Ltd',
      service: 'web-development',
    });
  });

  it('accepts a submission without the optional company (UI labels it optional)', async () => {
    const res = await contactPOST(
      postJson('https://www.craftsai.org/api/contact', {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        message: 'I would like to discuss a long enough project message.',
      }),
    );
    expect(res.status).toBe(200);
    const arg = createLeadMock.mock.calls[0][0];
    expect(arg.company).toBeUndefined();
    expect(arg.payload.company).toBe('');
  });

  it('stores punctuation verbatim rather than HTML entities', async () => {
    await contactPOST(
      postJson('https://www.craftsai.org/api/contact', {
        name: "R&D's team",
        email: 'ada@example.com',
        company: 'Ada & Co',
        message: 'We need "AI" work — details follow, at length.',
      }),
    );
    const arg = createLeadMock.mock.calls[0][0];
    expect(arg.name).toBe("R&D's team");
    expect(arg.company).toBe('Ada & Co');
    expect(arg.message).toBe('We need "AI" work — details follow, at length.');
  });

  it('returns 503 (not success) when the lead cannot be persisted', async () => {
    createLeadMock.mockResolvedValue(null);
    const res = await contactPOST(
      postJson('https://www.craftsai.org/api/contact', {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        message: 'I would like to discuss a long enough project message.',
      }),
    );
    expect(res.status).toBe(503);
    expect((await res.json()).success).toBe(false);
  });
});

describe('demo route persists every collected field', () => {
  it('stores product, company and message', async () => {
    const res = await demoPOST(
      postJson('https://www.craftsai.org/api/demo', {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        product: 'taxomind',
        company: 'Analytical Engines Ltd',
        message: 'Keen to see a walkthrough.',
      }),
    );
    expect(res.status).toBe(200);
    const arg = createLeadMock.mock.calls[0][0];
    expect(arg).toEqual(
      expect.objectContaining({
        source: 'DEMO',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        company: 'Analytical Engines Ltd',
      }),
    );
    expect(arg.payload).toEqual({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      product: 'taxomind',
      company: 'Analytical Engines Ltd',
      message: 'Keen to see a walkthrough.',
    });
  });

  it('rejects a demo request with no product', async () => {
    const res = await demoPOST(
      postJson('https://www.craftsai.org/api/demo', {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
      }),
    );
    expect(res.status).toBe(400);
  });
});
