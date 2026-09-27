import { z } from 'zod';

/**
 * The hero headline is data, not markup: each token carries the alternatives
 * the "model" weighs before committing it, and an attention matrix links the
 * tokens. It lives in the message files because both the words and how they
 * relate are language-specific. It is validated at render so a translator's
 * slip (a row that no longer sums to 1, a missing candidate) fails loudly in
 * the build instead of drawing a nonsense animation.
 */
const probability = z.number().min(0).max(1);

export const heroTokenSchema = z.object({
  text: z.string().min(1),
  /** How long the candidates flicker before the token commits, in ms. */
  think: z.number().int().min(100).max(4000),
  candidates: z
    .array(z.object({ word: z.string().min(1), p: probability }))
    .min(2)
    .max(5),
});

export const heroDataSchema = z
  .object({
    tokens: z.array(heroTokenSchema).min(2).max(16),
    weights: z.array(z.array(probability)),
  })
  .superRefine((data, ctx) => {
    const n = data.tokens.length;
    if (data.weights.length !== n) {
      ctx.addIssue({ code: 'custom', message: `weights must have ${n} rows, got ${data.weights.length}` });
      return;
    }
    data.weights.forEach((row, i) => {
      if (row.length !== n) {
        ctx.addIssue({ code: 'custom', path: ['weights', i], message: `row ${i} must have ${n} columns` });
        return;
      }
      if (row[i] !== 0) {
        ctx.addIssue({ code: 'custom', path: ['weights', i, i], message: 'a token must not attend to itself' });
      }
      const sum = row.reduce((a, b) => a + b, 0);
      if (Math.abs(sum - 1) > 0.005) {
        ctx.addIssue({ code: 'custom', path: ['weights', i], message: `row ${i} sums to ${sum.toFixed(3)}, not 1` });
      }
    });
    data.tokens.forEach((token, i) => {
      if (token.candidates[0].word !== token.text) {
        ctx.addIssue({
          code: 'custom',
          path: ['tokens', i, 'candidates', 0],
          message: `the first candidate must be the committed token "${token.text}"`,
        });
      }
    });
  });

export type HeroToken = z.infer<typeof heroTokenSchema>;
export type HeroData = z.infer<typeof heroDataSchema>;

/* ── The rest of the home page's structured (non-string) message data ── */
const text = z.string().min(1);

export const artifactCopySchema = z.object({
  research: z.object({ heading: text, notes: z.array(text).min(1), finding: text }),
  plan: z.object({ heading: text, columns: z.array(text).length(3), tasks: z.array(text).length(5) }),
  design: z.object({ heading: text, queue: text, draft: text, approve: text, escalate: text }),
  build: z.object({ heading: text, lines: z.array(text).min(1) }),
  test: z.object({ heading: text, cases: text, bar: text, passed: text }),
});

export const traceRowsSchema = z.array(
  z.object({ text, status: text, kind: z.enum(['head', 'step', 'escalate']) }),
);
export const fieldsSchema = z.array(z.object({ label: text, value: text, flag: z.boolean() }));
export const salesStepsSchema = z.array(z.object({ title: text, detail: text }));
export const stringListSchema = z.array(text).min(1);

export type ArtifactCopyData = z.infer<typeof artifactCopySchema>;
