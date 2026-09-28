import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import QuoteWizard from '../QuoteWizard';
import {
  EMPTY_ANSWERS,
  OPTION_GROUPS,
  SPEC_KEYS,
  STEPS,
  buildPayload,
  canVisit,
  excerpt,
  filledCount,
  firstBlockingStep,
  nodeState,
  toggleSlug,
  validateStep,
  type QuoteAnswers,
} from '../model';
// The real message files, so these tests cannot drift from the shipped copy.
import enMessages from '../../../../../../messages/en.json';
import bnMessages from '../../../../../../messages/bn.json';

const VALID: QuoteAnswers = {
  ...EMPTY_ANSWERS,
  services: ['agents'],
  description: 'Our support team answers the same questions all day.',
  data: ['helpdesk', 'crm'],
  runs: 'cloud',
  stage: 'idea',
  success: ['time'],
  timeline: 'months',
  budget: 'unsure',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  company: 'Analytical Engines',
  agreed: true,
};

beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('reduce'),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
});

afterEach(() => jest.restoreAllMocks());

const mockFetch = (status: number, body: unknown) => {
  const fn = jest.fn().mockResolvedValue({ ok: status >= 200 && status < 300, status, json: async () => body });
  (global as unknown as { fetch: typeof fn }).fetch = fn;
  return fn;
};

describe('quote model', () => {
  it('validates each step against what the API needs', () => {
    expect(validateStep(0, EMPTY_ANSWERS)).toEqual({ services: true, description: true });
    expect(validateStep(0, { ...EMPTY_ANSWERS, services: ['agents'], description: 'x'.repeat(19) })).toEqual({
      description: true,
    });
    expect(validateStep(1, EMPTY_ANSWERS)).toEqual({ data: true, runs: true });
    expect(validateStep(2, EMPTY_ANSWERS)).toEqual({ stage: true, timeline: true, budget: true });
    expect(validateStep(3, { ...VALID, email: 'nope' })).toEqual({ email: true });
    expect(validateStep(3, { ...VALID, company: ' ', agreed: false })).toEqual({ company: true, terms: true });
    STEPS.forEach((_, i) => expect(validateStep(i, VALID)).toEqual({}));
  });

  it('finds the first step blocking a jump forward', () => {
    expect(firstBlockingStep(3, EMPTY_ANSWERS)).toBe(0);
    expect(firstBlockingStep(3, { ...VALID, runs: '' })).toBe(1);
    expect(firstBlockingStep(4, VALID)).toBe(4);
  });

  it('derives node states and which nodes can be visited', () => {
    expect(nodeState(1, 1, 2, VALID)).toBe('current');
    expect(nodeState(0, 1, 2, VALID)).toBe('done');
    expect(nodeState(0, 1, 2, EMPTY_ANSWERS)).toBe('todo');
    expect(nodeState(3, 1, 2, VALID)).toBe('todo');
    expect(canVisit(0, 2, 2)).toBe(true);
    expect(canVisit(2, 2, 2)).toBe(false);
    expect(canVisit(3, 1, 2)).toBe(false);
  });

  it('toggles multi-select slugs in option order', () => {
    expect(toggleSlug(['crm'], 'documents', 'data')).toEqual(['documents', 'crm']);
    expect(toggleSlug(['documents', 'crm'], 'documents', 'data')).toEqual(['crm']);
  });

  it('builds the unchanged /api/quote contract from stable values', () => {
    const body = buildPayload({ ...VALID, website: '' });
    expect(body.projectDetails.services).toEqual(['AI agents & automation']);
    expect(body.projectDetails.projectType).toBe('AI agents & automation');
    expect(body.projectDetails.description.length).toBeGreaterThanOrEqual(20);
    expect(body.projectDetails.timeline).toBe('In the next few months');
    expect(body.projectDetails.budget).toBe('Not sure yet');
    expect(body.projectDetails.complexity).toBe('Exploring an idea');
    expect(body.projectDetails.requirements).toContain('Helpdesk & tickets, CRM');
    expect(body.companyInfo).toMatchObject({
      companyName: 'Analytical Engines',
      contactName: 'Ada Lovelace',
      email: 'ada@example.com',
      preferredContact: 'email',
    });
    expect(body).toHaveProperty('website', '');
  });

  it('counts filled spec lines and trims excerpts', () => {
    expect(filledCount(EMPTY_ANSWERS)).toBe(0);
    expect(filledCount(VALID)).toBe(SPEC_KEYS.length);
    expect(excerpt('  a   b  ', 10)).toBe('a b');
    expect(excerpt('abcdefghij', 5)).toBe('abcd…');
  });

  it('has a label for every option in both locales', () => {
    for (const messages of [enMessages, bnMessages]) {
      const options = (messages.Quote as { options: Record<string, Record<string, string>> }).options;
      for (const [group, list] of Object.entries(OPTION_GROUPS)) {
        for (const { slug } of list) expect(options[group][slug]).toBeTruthy();
      }
    }
  });
});

const renderWizard = (locale: 'en' | 'bn' = 'en') =>
  render(
    <NextIntlClientProvider locale={locale} messages={locale === 'en' ? enMessages : bnMessages}>
      <QuoteWizard />
    </NextIntlClientProvider>,
  );

const q = enMessages.Quote;

const fillToLastStep = () => {
  fireEvent.click(screen.getByRole('checkbox', { name: q.options.services.agents }));
  fireEvent.change(screen.getByLabelText(q.fields.description), {
    target: { value: 'Our support team answers the same questions all day.' },
  });
  fireEvent.click(screen.getByRole('button', { name: /Continue/ }));
  fireEvent.click(screen.getByRole('checkbox', { name: q.options.data.helpdesk }));
  fireEvent.click(screen.getByRole('radio', { name: q.options.runs.cloud }));
  fireEvent.click(screen.getByRole('button', { name: /Continue/ }));
  fireEvent.click(screen.getByRole('radio', { name: q.options.stage.idea }));
  fireEvent.click(screen.getByRole('radio', { name: q.options.timeline.months }));
  fireEvent.click(screen.getByRole('radio', { name: q.options.budget.unsure }));
  fireEvent.click(screen.getByRole('button', { name: /Continue/ }));
  fireEvent.change(screen.getByLabelText(q.fields.name, { exact: false }), { target: { value: 'Ada Lovelace' } });
  fireEvent.change(screen.getByLabelText(q.fields.email, { exact: false }), { target: { value: 'ada@example.com' } });
  fireEvent.change(screen.getByLabelText(q.fields.company, { exact: false }), { target: { value: 'Engines' } });
  fireEvent.click(screen.getByRole('checkbox'));
};

describe('QuoteWizard', () => {
  it('shows the pipeline with the first step current and blocks an empty continue', () => {
    renderWizard();
    const rail = screen.getByRole('navigation', { name: q.rail.label });
    const buttons = within(rail).getAllByRole('button');
    expect(buttons).toHaveLength(STEPS.length);
    expect(buttons[0]).toHaveAttribute('aria-current', 'step');
    expect(buttons[1]).toBeDisabled();
    expect(screen.getByRole('heading', { name: q.steps.problem.title })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Continue/ }));
    expect(screen.getByText(q.validation.services)).toBeInTheDocument();
    expect(screen.getByText(q.validation.description)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: q.steps.problem.title })).toBeInTheDocument();
  });

  it('types answers into the spec and lets you return to a completed step', () => {
    renderWizard();
    fireEvent.click(screen.getByRole('checkbox', { name: q.options.services.agents }));
    const spec = document.getElementById('qt-spec')!;
    expect(spec.textContent).toContain(`[${q.options.services.agents}]`);
    fireEvent.change(screen.getByLabelText(q.fields.description), {
      target: { value: 'Our support team answers the same questions all day.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }));
    expect(screen.getByRole('heading', { name: q.steps.data.title })).toBeInTheDocument();

    const first = within(screen.getByRole('navigation', { name: q.rail.label })).getAllByRole('button')[0];
    expect(first.textContent).toContain(q.rail.done);
    fireEvent.click(first);
    expect(screen.getByRole('heading', { name: q.steps.problem.title })).toBeInTheDocument();
  });

  it('posts the contract and streams the reply on success', async () => {
    const fetchMock = mockFetch(200, { success: true, code: 'quote_success' });
    renderWizard();
    fillToLastStep();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: q.wizard.submit }));
    });
    expect(fetchMock).toHaveBeenCalledWith('/api/quote', expect.objectContaining({ method: 'POST' }));
    const sentBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sentBody.projectDetails.services).toEqual(['AI agents & automation']);
    expect(sentBody.companyInfo.companyName).toBe('Engines');
    expect(await screen.findByRole('heading', { name: q.reply.label })).toBeInTheDocument();
    expect(document.getElementById('qt-spec')).toHaveAttribute('data-state', 'sent');
  });

  it('keeps the answers and shows a rose alert when the API fails (no DB → 503)', async () => {
    mockFetch(503, { success: false, code: 'quote_submit_failed' });
    renderWizard();
    fillToLastStep();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: q.wizard.submit }));
    });
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(q.error.title);
    expect(alert).toHaveTextContent(enMessages.FormErrors.quote_submit_failed);
    expect(screen.getByLabelText(q.fields.name, { exact: false })).toHaveValue('Ada Lovelace');
  });

  it('jumps back to the step of a server-side field error', async () => {
    mockFetch(400, { success: false, errors: { description: 'description_required' } });
    renderWizard();
    fillToLastStep();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: q.wizard.submit }));
    });
    expect(await screen.findByRole('heading', { name: q.steps.problem.title })).toBeInTheDocument();
    expect(screen.getByText(enMessages.FormErrors.description_required)).toBeInTheDocument();
  });

  it('renders in Bengali with Bengali digits', () => {
    renderWizard('bn');
    expect(screen.getByRole('heading', { name: bnMessages.Quote.steps.problem.title })).toBeInTheDocument();
    expect(document.body.textContent).toContain('ধাপ ১ / ৪');
  });
});
