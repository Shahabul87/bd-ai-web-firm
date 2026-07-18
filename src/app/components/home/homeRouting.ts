/**
 * Single source of truth for homepage card hrefs, keyed by the stable message
 * `slug`. Both SelectedWork and ResourcesRow import from here, and
 * homeRouting.test.tsx validates every href against the REAL Velite content
 * manifest — so a slug that points at non-existent content fails at test time
 * instead of shipping a 404 to visitors.
 *
 * Hrefs never vary by locale, so they are kept out of the translator-editable
 * message files and paired by stable slug (never by array position).
 */
export const PROJECT_HREFS: Record<string, string> = {
  taxomind: '/portfolio/building-taxomind-ai-powered-learning-platform',
  'fincoach-ai': '/portfolio/fincoach-ai-personal-finance-made-simple',
  mathphysics: '/portfolio/mathphysics-interactive-stem-learning',
};

export const RESOURCE_HREFS: Record<string, string> = {
  'ai-agents-software-development': '/resources/blog/why-ai-powered-development-is-the-future',
  taxomind: '/resources/case-studies/building-taxomind-ai-powered-learning-platform',
  'ai-powered-development': '/resources/guides/complete-guide-web-app-development',
};

/* An unknown slug is a bug, not a fallback case. Throwing surfaces it at render;
   a placeholder href would ship a wrong link to users instead. */
export function projectHref(slug: string): string {
  const href = PROJECT_HREFS[slug];
  if (!href) {
    throw new Error(
      `SelectedWork: no route for project slug "${slug}". Routes are defined in ` +
        'PROJECT_HREFS; messages must not add or rename slugs.',
    );
  }
  return href;
}

export function resourceHref(slug: string): string {
  const href = RESOURCE_HREFS[slug];
  if (!href) {
    throw new Error(
      `ResourcesRow: no route for resource slug "${slug}". Routes are defined in ` +
        'RESOURCE_HREFS; messages must not add or rename slugs.',
    );
  }
  return href;
}
