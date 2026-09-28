import { z } from 'zod';

/** The studio inbox the legal pages point to. */
export const MAIL = 'hello@craftsai.org';

/**
 * The legal pages' structured message data, validated at render so a missing
 * list item fails the build instead of silently dropping legal text.
 */
const text = z.string().min(1);

export const termDetailSchema = z.array(z.object({ term: text, detail: text })).min(1);
export const stringListSchema = z.array(text).min(1);
export const cookieTypesSchema = z.array(z.object({ title: text, description: text })).min(1);
