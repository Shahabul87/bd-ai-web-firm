import { getAllBlogs, getAllCaseStudies, getAllGuides } from '@/app/lib/content';
import type { Blog, CaseStudy, Guide } from '@/app/lib/content';
import { toBengaliDigits } from '@/app/lib/numerals';
import type { LibraryItem } from './retrieval';

export function blogItem(b: Blog): LibraryItem {
  return {
    key: `blog:${b.slug}`,
    type: 'blog',
    slug: b.slug,
    href: `/resources/blog/${b.slug}`,
    title: b.title,
    excerpt: b.excerpt,
    tags: b.tags,
    date: b.date,
    readTime: b.readTime,
    author: b.author,
  };
}

export function guideItem(g: Guide): LibraryItem {
  return {
    key: `guide:${g.slug}`,
    type: 'guide',
    slug: g.slug,
    href: `/resources/guides/${g.slug}`,
    title: g.title,
    excerpt: g.excerpt,
    tags: g.tags,
    date: g.date,
    readTime: g.readTime,
  };
}

export function caseStudyItem(c: CaseStudy): LibraryItem {
  return {
    key: `case-study:${c.slug}`,
    type: 'case-study',
    slug: c.slug,
    href: `/resources/case-studies/${c.slug}`,
    title: c.title,
    excerpt: c.excerpt,
    tags: c.tags,
    date: c.date,
  };
}

/** Everything in the library, newest first within each type: posts, guides, case studies. */
export function getLibrary(): LibraryItem[] {
  return [
    ...getAllBlogs().map(blogItem),
    ...getAllGuides().map(guideItem),
    ...getAllCaseStudies().map(caseStudyItem),
  ];
}

/** Locale-aware formatting for dates and plain numbers, resolved on the server. */
export function formatters(locale: string) {
  const bn = locale === 'bn';
  const dateFmt = new Intl.DateTimeFormat(bn ? 'bn-BD' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const shortFmt = new Intl.DateTimeFormat(bn ? 'bn-BD' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return {
    bn,
    date: (iso: string) => dateFmt.format(new Date(iso)),
    shortDate: (iso: string) => shortFmt.format(new Date(iso)),
    num: (n: number | string) => (bn ? toBengaliDigits(n) : String(n)),
    ordinal: (i: number) => {
      const s = String(i + 1).padStart(2, '0');
      return bn ? toBengaliDigits(s) : s;
    },
  };
}

/** A tag's display label from `Resources.tags`, or the raw tag when none is set. */
export function tagLabeler(labels: Record<string, string>) {
  return (tag: string) => labels[tag] ?? tag.replace(/-/g, ' ');
}
