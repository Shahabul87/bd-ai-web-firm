import { act, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import AIChatbot from '../AIChatbot';
// The REAL shipped message file — never an inline fixture — so this test cannot
// drift from what visitors actually get, and it fails the moment the keywords or
// responses stop being read from messages/en.json.
import messages from '../../../../messages/en.json';

function renderChatbot() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <AIChatbot />
    </NextIntlClientProvider>
  );
}

const chatbot = messages.Chatbot;

describe('AIChatbot canned-response matcher (real messages/en.json)', () => {
  // jsdom does not implement scrollIntoView, which the widget calls on every
  // message render. Stub it so the component can mount under test.
  beforeAll(() => {
    Element.prototype.scrollIntoView = jest.fn();
  });
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('resolves a known English input to its expected canned response', () => {
    const pricing = chatbot.qa.find((entry) => entry.id === 'pricing');
    expect(pricing).toBeDefined();
    const expected = pricing!.response;

    renderChatbot();

    // Open the widget.
    fireEvent.click(screen.getByRole('button', { name: chatbot.openLabel }));

    // Type an English question containing a pricing keyword ("cost") and send it.
    // The matcher (lowerInput.includes(keyword)) must match this against the
    // pricing keyword list that lives in messages/en.json.
    const input = screen.getByRole('textbox', { name: chatbot.inputAriaLabel });
    fireEvent.change(input, { target: { value: 'How much does a project cost?' } });
    fireEvent.click(screen.getByRole('button', { name: chatbot.sendLabel }));

    // Advance the component's fixed 2s "thinking" delay so the bot reply renders.
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // The reply is the pricing response read from messages — and NOT the fallback.
    // If the keywords stop being read from the messages (reverted to literals that
    // no longer match, emptied, or the matcher breaks) this input falls through to
    // the fallback and both assertions go red.
    expect(
      screen.getByText((_, node) => node?.textContent === expected)
    ).toBeInTheDocument();
    expect(
      screen.queryByText((_, node) => node?.textContent === chatbot.fallback)
    ).toBeNull();
  });
});
