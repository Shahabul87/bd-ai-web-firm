import { z } from 'zod';

/**
 * The Careers page's structured message data, validated at render so a
 * translator's slip (a missing token list, an empty field) fails the build
 * instead of drawing a broken headline or card.
 */
const text = z.string().min(1);

export interface TitleWord {
  /** One or more (sub-word) tokens that make up the word. */
  t: string[];
  em?: boolean;
}

/**
 * The hero headline as one message string: spaces separate words, "|" marks a
 * token boundary inside a word, and a word in [brackets] is emphasised, e.g.
 * "Join the [maint|ainers.]". A string (not an array) so each language can
 * split its own sentence into as many words as it needs.
 */
export const titleWordsSchema = text.transform((source, ctx): TitleWord[] => {
  const words = source.trim().split(/\s+/).map((raw) => {
    const em = raw.startsWith('[') && raw.endsWith(']');
    const body = em ? raw.slice(1, -1) : raw;
    return { t: body.split('|').filter(Boolean), ...(em ? { em } : {}) };
  });
  if (words.some((w) => w.t.length === 0) || /[[\]]/.test(words.flatMap((w) => w.t).join(''))) {
    ctx.addIssue({ code: 'custom', message: `Malformed token title: ${source}` });
    return z.NEVER;
  }
  return words;
});

export const cardFieldsSchema = z.array(z.object({ label: text, value: text })).min(3).max(8);
export const titledItemsSchema = z.array(z.object({ title: text, body: text })).min(1);
export const stringListSchema = z.array(text).min(1);

export type CardField = z.infer<typeof cardFieldsSchema>[number];
export type TitledItem = z.infer<typeof titledItemsSchema>[number];

/** The headline as plain text (for screen readers and metadata). */
export const titleText = (words: TitleWord[]) => words.map((w) => w.t.join('')).join(' ');
