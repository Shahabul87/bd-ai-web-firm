import { notFound, permanentRedirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { caseStudies } from '#content';
import { getCaseStudyBySlug } from '@/app/lib/content';
import { getPathname } from '@/i18n/navigation';

interface PortfolioCaseProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return caseStudies.map((cs) => ({ slug: cs.slug }));
}

/**
 * /portfolio/<slug> used to render a second copy of each case study. The
 * canonical page (and the one in the sitemap) is /resources/case-studies/<slug>,
 * so old links redirect there permanently; unknown slugs are a 404.
 */
export default async function PortfolioCaseRedirect({ params }: PortfolioCaseProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  if (!getCaseStudyBySlug(slug)) notFound();
  permanentRedirect(getPathname({ href: `/resources/case-studies/${slug}`, locale }));
}
