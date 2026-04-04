import { blogs, caseStudies, guides, products } from '#content';
import type { Blog, CaseStudy, Guide, Product } from '#content';

// ─── Blog Queries ─────────────────────────────────────────────────────────────

export function getAllBlogs(): Blog[] {
  return [...blogs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getFeaturedBlogs(): Blog[] {
  return blogs
    .filter((blog) => blog.featured)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBlogBySlug(slug: string): Blog | undefined {
  return blogs.find((blog) => blog.slug === slug);
}

export function getBlogsByTag(tag: string): Blog[] {
  return blogs
    .filter((blog) => blog.tags.includes(tag))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// ─── Case Study Queries ───────────────────────────────────────────────────────

export function getAllCaseStudies(): CaseStudy[] {
  return [...caseStudies].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getFeaturedCaseStudies(): CaseStudy[] {
  return caseStudies
    .filter((cs) => cs.featured)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((cs) => cs.slug === slug);
}

export function getCaseStudiesByService(
  service: 'web' | 'android' | 'ios'
): CaseStudy[] {
  return caseStudies
    .filter((cs) => cs.services.includes(service))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// ─── Guide Queries ────────────────────────────────────────────────────────────

export function getAllGuides(): Guide[] {
  return [...guides].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getGuideBySlug(slug: string): Guide | undefined {
  return guides.find((guide) => guide.slug === slug);
}

// ─── Product Queries ──────────────────────────────────────────────────────────

export function getAllProducts(): Product[] {
  return [...products];
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

// ─── Cross-Content Queries ────────────────────────────────────────────────────

type ContentType = 'blog' | 'case-study' | 'guide';

type BlogWithType = Blog & { type: 'blog' };
type CaseStudyWithType = CaseStudy & { type: 'case-study' };
type GuideWithType = Guide & { type: 'guide' };

export type LatestContentItem = BlogWithType | CaseStudyWithType | GuideWithType;

export function getLatestContent(limit: number = 6): LatestContentItem[] {
  const taggedBlogs: BlogWithType[] = blogs.map((blog) => ({
    ...blog,
    type: 'blog' as const,
  }));

  const taggedCaseStudies: CaseStudyWithType[] = caseStudies.map((cs) => ({
    ...cs,
    type: 'case-study' as const,
  }));

  const taggedGuides: GuideWithType[] = guides.map((guide) => ({
    ...guide,
    type: 'guide' as const,
  }));

  const all: LatestContentItem[] = [
    ...taggedBlogs,
    ...taggedCaseStudies,
    ...taggedGuides,
  ];

  return all
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function getAllTags(): string[] {
  const tagSet = new Set<string>();

  blogs.forEach((blog) => blog.tags.forEach((tag) => tagSet.add(tag)));
  caseStudies.forEach((cs) => cs.tags.forEach((tag) => tagSet.add(tag)));
  guides.forEach((guide) => guide.tags.forEach((tag) => tagSet.add(tag)));

  return Array.from(tagSet).sort();
}

export type { Blog, CaseStudy, Guide, Product, ContentType };
