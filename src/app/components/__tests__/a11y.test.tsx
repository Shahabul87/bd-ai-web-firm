/**
 * Automated accessibility checks (Phase 7 Task 7.2).
 *
 * axe cannot prove a UI is accessible, but it reliably catches the mechanical
 * failures — missing labels, bad ARIA references, contrast on static markup,
 * roles without required attributes. This guards the components touched in this
 * phase so a regression (e.g. dropping aria-controls) fails CI.
 */
import { render, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { NextIntlClientProvider } from 'next-intl';
import messages from '../../../../messages/en.json';
import AIChatbot from '../AIChatbot';

expect.extend(toHaveNoViolations);

beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

function renderWithIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe('AIChatbot accessibility', () => {
  it('has no axe violations when closed (launcher only)', async () => {
    const { container } = renderWithIntl(<AIChatbot />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('exposes the launcher as a labelled disclosure with aria-controls', () => {
    const { getByRole } = renderWithIntl(<AIChatbot />);
    const launcher = getByRole('button', { name: messages.Chatbot.openLabel });
    expect(launcher).toHaveAttribute('aria-expanded', 'false');
    expect(launcher).toHaveAttribute('aria-controls', 'craftsai-chatbot');
  });

  it('marks the open window as a dialog with a live conversation log', () => {
    const { getByRole } = renderWithIntl(<AIChatbot />);
    fireEvent.click(getByRole('button', { name: messages.Chatbot.openLabel }));

    const dialog = getByRole('dialog');
    expect(dialog).toHaveAttribute('id', 'craftsai-chatbot');
    expect(dialog).toHaveAttribute('aria-label');

    const log = getByRole('log');
    expect(log).toHaveAttribute('aria-live', 'polite');
  });
});
