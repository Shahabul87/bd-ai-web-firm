/**
 * Regression: internal routes (/admin, /portal, auth callbacks) must NOT load
 * any marketing analytics. AppShell renders analytics only when analytics!==false;
 * the internal layout passes analytics={false}. See Phase 1 Task 1.1.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import AppShell from '../AppShell';

// Identifiable markers so we can assert presence/absence in the static markup.
jest.mock('../../analytics', () => ({
  __esModule: true,
  default: () => <span data-marker="analytics-component" />,
}));
// Render Script as a non-<script> marker element (a real <script> would trip
// the @next/next/no-sync-scripts lint rule); the src is preserved as an
// attribute so the assertions can still detect the GA loader.
jest.mock('next/script', () => ({
  __esModule: true,
  default: (props: { src?: string; children?: React.ReactNode }) => (
    <span data-marker="ga-script" data-src={props.src}>
      {props.children}
    </span>
  ),
}));

describe('AppShell analytics gating', () => {
  const OLD_ENV = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  beforeEach(() => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123';
  });
  afterEach(() => {
    if (OLD_ENV === undefined) delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    else process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = OLD_ENV;
  });

  it('excludes the analytics component and GA loader on internal routes', () => {
    const html = renderToStaticMarkup(
      <AppShell lang="en" analytics={false}>
        <div>internal</div>
      </AppShell>,
    );
    expect(html).not.toContain('analytics-component');
    expect(html).not.toContain('googletagmanager');
    expect(html).toContain('internal');
  });

  it('includes analytics on marketing routes when configured', () => {
    const html = renderToStaticMarkup(
      <AppShell lang="en">
        <div>marketing</div>
      </AppShell>,
    );
    expect(html).toContain('analytics-component');
    expect(html).toContain('googletagmanager');
  });
});
