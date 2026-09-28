import { z } from 'zod';

/**
 * The Company page's structured (non-string) message data, validated at render
 * so a translator's slip (a missing field, a wrong row kind) fails in the
 * build instead of drawing a broken model card.
 */
const text = z.string().min(1);

export const cardFieldsSchema = z.array(z.object({ label: text, value: text })).min(4).max(10);
export const titledItemsSchema = z.array(z.object({ title: text, body: text })).min(1);
export const stringListSchema = z.array(text).min(1);

export const LAYER_KINDS = ['tokens', 'tool', 'retrieval', 'eval', 'handoff', 'log'] as const;
export type LayerKind = (typeof LAYER_KINDS)[number];

export const layerRowsSchema = z
  .array(z.object({ human: text, kind: z.enum(LAYER_KINDS), machine: text, meta: text }))
  .min(2)
  .max(8);

export type CardField = z.infer<typeof cardFieldsSchema>[number];
export type TitledItem = z.infer<typeof titledItemsSchema>[number];
export type LayerRow = z.infer<typeof layerRowsSchema>[number];
