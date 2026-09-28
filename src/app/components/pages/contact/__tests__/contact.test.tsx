import { act, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import ContactComposer from '../ContactComposer';
import { SERVICE_OPTIONS, estimateTokens, hintFor, litSteps, EMPTY_FIELDS } from '../model';
// The real message files, so these tests cannot drift from the shipped copy.
import enMessages from '../../../../../../messages/en.json';
import bnMessages from '../../../../../../messages/bn.json';

let reducedMotion = true;

beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('reduce') ? reducedMotion : false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
  // jsdom lacks requestSubmit in older versions; the shortcut uses it.
  if (!HTMLFormElement.prototype.requestSubmit) {
    HTMLFormElement.prototype.requestSubmit = function requestSubmit(this: HTMLFormElement) {
      this.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    };
  }
});

afterEach(() => {
  reducedMotion = true;
  jest.restoreAllMocks();
});

const renderComposer = (locale: 'en' | 'bn' = 'en') =>
  render(
    <NextIntlClientProvider locale={locale} messages={locale === 'en' ? enMessages : bnMessages}>
      <ContactComposer />
    </NextIntlClientProvider>,
  );

const fillValid = () => {
  fireEvent.change(screen.getByLabelText('Message'), {
    target: { value: 'Our support team answers the same questions all day.' },
  });
  fireEvent.click(screen.getByRole('radio', { name: 'AI agents & automation' }));
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada Lovelace' } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ada@example.com' } });
  fireEvent.change(document.getElementById('company')!, { target: { value: 'Engines' } });
};

// jsdom has no fetch; install a mock per test.
const mockFetch = (status: number, body: unknown) => {
  const fn = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
  (global as unknown as { fetch: typeof fn }).fetch = fn;
  return fn;
};

describe('contact model', () => {
  it('estimates tokens at about four characters each', () => {
    expect(estimateTokens('')).toBe(0);
    expect(estimateTokens('abcde')).toBe(2);
  });

  it('nudges by message length', () => {
    expect(hintFor('')).toBe('empty');
    expect(hintFor('short')).toBe('short');
    expect(hintFor('a'.repeat(60))).toBe('tools');
    expect(hintFor('a'.repeat(200))).toBe('good');
    expect(hintFor('a'.repeat(400))).toBe('plenty');
  });

  it('lights one trace step per requirement met', () => {
    expect(litSteps(EMPTY_FIELDS)).toBe(0);
    expect(litSteps({ ...EMPTY_FIELDS, email: 'a@b.co' })).toBe(1);
    expect(
      litSteps({ ...EMPTY_FIELDS, email: 'a@b.co', name: 'Ada', message: '0123456789', service: 'x' }),
    ).toBe(4);
  });

  it('has a translated chip label for every service slug in both locales', () => {
    for (const { slug } of SERVICE_OPTIONS) {
      expect(enMessages.Contact.composer.services[slug]).toBeTruthy();
      expect(bnMessages.Contact.composer.services[slug]).toBeTruthy();
    }
  });
});

describe('ContactComposer', () => {
  it('renders labelled fields, a required service group and the honeypot', () => {
    renderComposer();
    expect(screen.getByLabelText('Message')).toHaveAttribute('id', 'message');
    expect(screen.getByLabelText('Name')).toHaveAttribute('id', 'name');
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
    expect(document.getElementById('company')).not.toBeRequired();
    expect(screen.getAllByRole('radio')).toHaveLength(SERVICE_OPTIONS.length);
    expect(screen.getByRole('radio', { name: 'Not sure yet' })).toBeRequired();
    const honeypot = document.querySelector<HTMLInputElement>('input[name="website"]')!;
    expect(honeypot.tabIndex).toBe(-1);
    expect(honeypot.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Send message' })).toBeInTheDocument();
  });

  it('meters the message and lights the trace as it fills', () => {
    const { container } = renderComposer();
    expect(container.querySelector('.ct-meter-n')).toHaveTextContent('≈ 0 tokens');
    expect(screen.getByText('0 of 4 ready')).toBeInTheDocument();
    fillValid();
    expect(container.querySelector('.ct-meter-n')).toHaveTextContent('≈ 13 tokens');
    expect(screen.getByText('4 of 4 ready')).toBeInTheDocument();
    expect(container.querySelectorAll('.ct-step[data-s="lit"]')).toHaveLength(4);
  });

  it('types example requests into the empty box only when motion is allowed', () => {
    reducedMotion = false;
    const { container, unmount } = renderComposer();
    const area = container.querySelector('.ct-msg')!;
    expect(area).toHaveAttribute('data-typer', 'run');
    // The native placeholder carries the current example for assistive tech.
    expect(screen.getByLabelText('Message')).toHaveAttribute(
      'placeholder',
      enMessages.Contact.composer.examples[0],
    );
    fireEvent.focus(screen.getByLabelText('Message'));
    expect(area).not.toHaveAttribute('data-typer');
    unmount();
  });

  it('uses Bengali digits on /bn', () => {
    const { container } = renderComposer('bn');
    expect(container.querySelector('.ct-meter-n')).toHaveTextContent('≈ ০ টোকেন');
    expect(screen.getByText('৪টির মধ্যে ০টি প্রস্তুত')).toBeInTheDocument();
  });

  it('posts the API contract and shows the resolved error, keeping the values', async () => {
    const fetchSpy = mockFetch(503, { success: false, code: 'contact_submit_failed' });
    renderComposer();
    fillValid();
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: 'Send message' }).closest('form')!);
    });
    const [url, init] = fetchSpy.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/contact');
    expect(JSON.parse(init.body as string)).toEqual({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      company: 'Engines',
      service: 'AI agents & automation',
      message: 'Our support team answers the same questions all day.',
      website: '',
    });
    expect(screen.getByRole('alert')).toHaveTextContent(enMessages.FormErrors.contact_submit_failed);
    expect(screen.getByLabelText('Name')).toHaveValue('Ada Lovelace');
  });

  it('maps field errors from a 400 onto the fields', async () => {
    mockFetch(400, { success: false, errors: { name: 'name_too_short' } });
    renderComposer();
    fillValid();
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: 'Send message' }).closest('form')!);
    });
    expect(screen.getByRole('alert')).toHaveTextContent(enMessages.FormErrors.name_too_short);
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true');
  });

  it('generates the reply, announces it in full, and resets', async () => {
    mockFetch(200, { success: true, code: 'contact_success' });
    renderComposer();
    fillValid();
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: 'Send message' }).closest('form')!);
    });
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Thanks, Ada Lovelace. Your request is with a person now.');
    expect(screen.getByText('Sent. Step one has started.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Send message' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Send another' }));
    expect(screen.getByLabelText('Message')).toHaveValue('');
    expect(screen.getByLabelText('Message')).toHaveFocus();
  });
});
