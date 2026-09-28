import { getTranslations } from 'next-intl/server';
import type { CaseStudy } from '#content';
import { getAllCaseStudies, getProductBySlug } from '@/app/lib/content';
import { decodeEntities } from '@/app/components/pages/work/text';

/**
 * Case studies are written up about our own products. Where a case study has
 * a live product page under /products, the report links to it. Keyed by the
 * case study slug; a product that no longer exists is simply not linked.
 */
const PRODUCT_FOR_CASE: Record<string, string> = {
  'building-taxomind-ai-powered-learning-platform': 'taxomind',
  'fincoach-ai-personal-finance-made-simple': 'fincoach-ai',
  'mathphysics-interactive-stem-learning': 'mathphysics',
};

export interface ReportFact {
  label: string;
  value: string;
}

/** Everything a list row, the summary sidebar and the results block need. */
export interface Report {
  slug: string;
  title: string;
  excerpt: string;
  industry: string;
  /** Localised platform names. */
  platforms: string[];
  /** Localised one-liners; null when no summary is written for this slug. */
  stages: { problem: string; approach: string; outcome: string } | null;
  facts: ReportFact[];
  ownProduct: boolean;
  product: { slug: string; title: string; stack: string[] } | null;
  tags: string[];
}

function toReport(
  cs: CaseStudy,
  t: Awaited<ReturnType<typeof getTranslations>>,
): Report {
  const platformLabels = t.raw('platforms') as Record<string, string>;
  const key = `items.${cs.slug}`;
  // Summaries live in messages (EN + BN); the MDX body is English only.
  const has = t.has(`${key}.problem`);
  const productSlug = PRODUCT_FOR_CASE[cs.slug];
  const product = productSlug ? getProductBySlug(productSlug) : undefined;

  return {
    slug: cs.slug,
    title: decodeEntities(cs.title),
    excerpt: decodeEntities(cs.excerpt),
    industry: cs.industry,
    platforms: cs.services.map((s) => platformLabels[s] ?? s),
    stages: has
      ? {
          problem: t(`${key}.problem`),
          approach: t(`${key}.approach`),
          outcome: t(`${key}.outcome`),
        }
      : null,
    facts: has
      ? (t.raw(`${key}.facts`) as ReportFact[])
      : cs.results.map((r) => ({ label: r.metric, value: decodeEntities(r.value) })),
    ownProduct: cs.client === 'Internal Product',
    product: product
      ? { slug: product.slug, title: product.title, stack: product.techStack }
      : null,
    tags: cs.tags,
  };
}

/** All case studies as reports, newest first, with copy for `locale`. */
export async function getReports(locale: string): Promise<Report[]> {
  const t = await getTranslations({ locale, namespace: 'Resources.caseStudies' });
  return getAllCaseStudies().map((cs) => toReport(cs, t));
}

/** Copy the list rows and eval cards share, resolved on the server. */
export interface EvalCopy {
  problem: string;
  approach: string;
  outcome: string;
  readMore: string;
  ownProduct: string;
  /** "{title}" is replaced. */
  cardLabel: string;
}

export async function getEvalCopy(locale: string): Promise<EvalCopy> {
  const t = await getTranslations({ locale, namespace: 'Resources.caseStudies' });
  return {
    problem: t('stages.problem'),
    approach: t('stages.approach'),
    outcome: t('stages.outcome'),
    readMore: t('readMore'),
    ownProduct: t('ownProduct'),
    cardLabel: t.raw('list.cardLabel') as string,
  };
}
