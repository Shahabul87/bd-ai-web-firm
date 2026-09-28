import { z } from 'zod';
import faqData from '@content/faq/faq.json';
import type { FaqItem } from './search';
import type { FaqCategoryInfo } from './FaqExplorer';

/**
 * content/faq/faq.json, validated. The shape (category/questions with en+bn
 * strings) is also read by StructuredData for the FAQPage JSON-LD, so only
 * optional fields (`id`) are added on top of it.
 */
const localized = z.object({ en: z.string().min(1), bn: z.string().min(1) });
const slug = z.string().regex(/^[a-z0-9-]+$/);

export const faqSchema = z
  .array(
    z.object({
      id: slug,
      category: localized,
      questions: z.array(z.object({ id: slug, question: localized, answer: localized })).min(1),
    }),
  )
  .min(1);

export function loadFaq(locale: string): { categories: FaqCategoryInfo[]; items: FaqItem[] } {
  const data = faqSchema.parse(faqData);
  const pick = (v: { en: string; bn: string }) => (locale === 'bn' ? v.bn : v.en);
  return {
    categories: data.map((c) => ({ id: c.id, label: pick(c.category) })),
    items: data.flatMap((c) =>
      c.questions.map((q) => ({
        id: q.id,
        categoryId: c.id,
        category: pick(c.category),
        question: pick(q.question),
        answer: pick(q.answer),
      })),
    ),
  };
}
