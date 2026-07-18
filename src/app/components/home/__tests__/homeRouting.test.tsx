import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import SelectedWork from '../SelectedWork';
import ResourcesRow from '../ResourcesRow';
// The REAL href maps that ship, so a divergence between what the components use
// and what these tests assert is impossible.
import { PROJECT_HREFS, RESOURCE_HREFS } from '../homeRouting';
import { getBlogBySlug, getCaseStudyBySlug, getGuideBySlug } from '@/app/lib/content';
// The real message files, so these fixtures cannot drift from the shipped copy.
import enMessages from '../../../../../messages/en.json';
import bnMessages from '../../../../../messages/bn.json';

/* Homepage cards get their copy from translator-editable message arrays but their
 * hrefs from code. These tests pin HOW the two are paired: by stable `slug`, never
 * by array position.
 *
 * Why this matters: messages-parity.test.ts checks array LENGTH only
 * (`path[]:${length}`), so a Stage 3 translator reordering `Home.work.projects`
 * while translating — a completely natural thing to do — is length-preserving.
 * Under positional pairing every card would silently get the wrong URL while
 * parity, TypeScript and the build all stayed green. The reorder cases below are
 * the guard: they FAIL if anyone reverts to `HREFS[i]`. */

jest.mock('@/i18n/navigation', () => ({
  Link: ({ children, href }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href}>{children}</a>
  ),
}));

type Messages = typeof enMessages;
const clone = (m: Messages): Messages => JSON.parse(JSON.stringify(m)) as Messages;

const wrap = (messages: Messages, ui: React.ReactElement) =>
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );

// The shipped maps ARE the source of truth (imported above); the reorder/throw
// tests below guard HOW copy is paired to them, and the content-manifest suite
// at the bottom guards that every href actually resolves.
const PROJECT_ROUTES = PROJECT_HREFS;
const RESOURCE_ROUTES = RESOURCE_HREFS;

describe('homepage card routing is keyed by slug, not array position', () => {
  describe('SelectedWork', () => {
    it('links every project to the href its slug maps to', () => {
      const m = clone(enMessages);
      wrap(m, <SelectedWork />);
      for (const project of m.Home.work.projects) {
        expect(screen.getByText(project.name).closest('a')).toHaveAttribute(
          'href',
          PROJECT_ROUTES[project.slug]
        );
      }
    });

    // Assertion-red: fails if pairing reverts to PROJECT_HREFS[i].
    it('keeps each project on its own href when the message array is REORDERED', () => {
      const m = clone(enMessages);
      m.Home.work.projects.reverse();
      wrap(m, <SelectedWork />);
      for (const project of m.Home.work.projects) {
        expect(screen.getByText(project.name).closest('a')).toHaveAttribute(
          'href',
          PROJECT_ROUTES[project.slug]
        );
      }
    });

    it('throws naming the offending slug rather than rendering a wrong link', () => {
      const m = clone(enMessages);
      m.Home.work.projects[0].slug = 'renamed-by-translator';
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => wrap(m, <SelectedWork />)).toThrow(/renamed-by-translator/);
      spy.mockRestore();
    });
  });

  describe('ResourcesRow', () => {
    it('links every resource to the href its slug maps to', () => {
      const m = clone(enMessages);
      wrap(m, <ResourcesRow />);
      for (const item of m.Home.resources.items) {
        expect(screen.getByText(item.title).closest('a')).toHaveAttribute(
          'href',
          RESOURCE_ROUTES[item.slug]
        );
      }
    });

    // Assertion-red: fails if pairing reverts to RESOURCE_HREFS[i].
    it('keeps each resource on its own href when the message array is REORDERED', () => {
      const m = clone(enMessages);
      m.Home.resources.items.reverse();
      wrap(m, <ResourcesRow />);
      for (const item of m.Home.resources.items) {
        expect(screen.getByText(item.title).closest('a')).toHaveAttribute(
          'href',
          RESOURCE_ROUTES[item.slug]
        );
      }
    });

    it('throws naming the offending slug rather than rendering a wrong link', () => {
      const m = clone(enMessages);
      m.Home.resources.items[0].slug = 'renamed-by-translator';
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => wrap(m, <ResourcesRow />)).toThrow(/renamed-by-translator/);
      spy.mockRestore();
    });
  });

  /* Slugs are structural, not copy: Stage 3 translates values around them, so
   * they must stay identical across locales and keep matching a real route. */
  describe.each([
    ['en', enMessages],
    ['bn', bnMessages],
  ])('%s messages', (_locale, messages) => {
    it('every project slug resolves to a known route', () => {
      for (const project of messages.Home.work.projects) {
        expect(PROJECT_ROUTES[project.slug]).toBeDefined();
      }
    });

    it('every resource slug resolves to a known route', () => {
      for (const item of messages.Home.resources.items) {
        expect(RESOURCE_ROUTES[item.slug]).toBeDefined();
      }
    });
  });

  it('slugs are identical across locales and never translated', () => {
    expect(bnMessages.Home.work.projects.map((p) => p.slug)).toEqual(
      enMessages.Home.work.projects.map((p) => p.slug)
    );
    expect(bnMessages.Home.resources.items.map((r) => r.slug)).toEqual(
      enMessages.Home.resources.items.map((r) => r.slug)
    );
  });
});

/* The guard that was missing: every homepage href must resolve to real Velite
 * content. Previously all six cards 404'd because the hardcoded slugs had
 * drifted from the content manifest and no test checked the destination. */
function contentExistsFor(href: string): boolean {
  let m;
  if ((m = href.match(/^\/portfolio\/(.+)$/))) return Boolean(getCaseStudyBySlug(m[1]));
  if ((m = href.match(/^\/resources\/blog\/(.+)$/))) return Boolean(getBlogBySlug(m[1]));
  if ((m = href.match(/^\/resources\/case-studies\/(.+)$/))) return Boolean(getCaseStudyBySlug(m[1]));
  if ((m = href.match(/^\/resources\/guides\/(.+)$/))) return Boolean(getGuideBySlug(m[1]));
  return false;
}

describe('homepage hrefs resolve to real Velite content (no soft 404s)', () => {
  it.each(Object.entries(PROJECT_HREFS))('project card "%s" -> %s exists', (_slug, href) => {
    expect(contentExistsFor(href)).toBe(true);
  });
  it.each(Object.entries(RESOURCE_HREFS))('resource card "%s" -> %s exists', (_slug, href) => {
    expect(contentExistsFor(href)).toBe(true);
  });
});
