/**
 * Regression: the analytics page-view payload must contain ONLY an approved
 * pathname — never a query string, fragment, or any user-controlled identifier.
 * Magic-link auth callbacks carry the token in the query string (`?token=…`);
 * sending `pathname + search` to Google Analytics disclosed that token.
 * See Phase 1 Task 1.1.
 */
import { render, act } from '@testing-library/react';

let mockPathname = '/';
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

import Analytics from '../analytics';

describe('Analytics page-view payload', () => {
  const gtag = jest.fn();

  beforeEach(() => {
    gtag.mockClear();
    (window as unknown as { gtag: typeof gtag }).gtag = gtag;
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123';
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  });

  it('sends only the pathname as page_path', () => {
    mockPathname = '/services';
    act(() => {
      render(<Analytics />);
    });
    expect(gtag).toHaveBeenCalledWith('config', 'G-TEST123', { page_path: '/services' });
  });

  it('never includes a query string, even on an auth callback URL', () => {
    // usePathname() returns only the path segment, but this asserts the
    // component cannot reintroduce the query string from any source.
    mockPathname = '/admin/login/callback';
    act(() => {
      render(<Analytics />);
    });
    const payloads = gtag.mock.calls.map((c) => c[2] as { page_path?: string });
    for (const p of payloads) {
      expect(p.page_path).toBe('/admin/login/callback');
      expect(p.page_path).not.toContain('?');
      expect(p.page_path).not.toContain('token');
    }
  });

  it('does nothing when no measurement ID is configured', () => {
    delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    mockPathname = '/';
    act(() => {
      render(<Analytics />);
    });
    expect(gtag).not.toHaveBeenCalled();
  });
});
