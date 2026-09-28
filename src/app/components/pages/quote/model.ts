/**
 * Pure data + rules for the /quote wizard ("The estimate, computed"). No React
 * here, so the step rules, the spec the side card assembles and the payload
 * posted to /api/quote are easy to read and to test.
 *
 * Contract with /api/quote is unchanged (src/app/api/quote/route.ts):
 *   { projectDetails: { services[], projectType, complexity, description,
 *                       requirements, timeline, budget },
 *     companyInfo:    { companyName, industry, companySize, contactName,
 *                       email, phone, preferredContact },
 *     specialRequirements, agreedToTerms, website (honeypot) }
 * The route requires services (non-empty), projectType, description (≥ 20),
 * companyName, contactName and a valid email.
 *
 * Every `value` below is what gets posted: a stable English string that lives
 * in code, keyed by a slug. Only the visible label comes from the messages
 * (Quote.options.<group>.<slug>).
 */
import validator from 'validator';

export const STEPS = ['problem', 'data', 'scope', 'you'] as const;
export type StepKey = (typeof STEPS)[number];

export const SERVICE_OPTIONS = [
  { slug: 'agents', value: 'AI agents & automation' },
  { slug: 'assistants', value: 'Assistants on your data' },
  { slug: 'models', value: 'Custom models & fine-tuning' },
  { slug: 'product', value: 'AI inside your product' },
  { slug: 'evals', value: 'Data & evaluation pipelines' },
  { slug: 'sprint', value: 'AI strategy sprint' },
  { slug: 'unsure', value: 'Not sure yet' },
] as const;

export const DATA_OPTIONS = [
  { slug: 'documents', value: 'Documents & PDFs' },
  { slug: 'helpdesk', value: 'Helpdesk & tickets' },
  { slug: 'crm', value: 'CRM' },
  { slug: 'databases', value: 'Databases' },
  { slug: 'spreadsheets', value: 'Spreadsheets' },
  { slug: 'email', value: 'Email & chat' },
  { slug: 'wikis', value: 'Wikis & intranet' },
  { slug: 'none', value: 'No data yet' },
] as const;

export const RUN_OPTIONS = [
  { slug: 'hosted', value: 'Hosted and run by CraftsAI' },
  { slug: 'cloud', value: 'In our own cloud' },
  { slug: 'private', value: 'On-premises or private network' },
  { slug: 'product', value: 'Inside our product' },
  { slug: 'unsure', value: 'Not sure yet' },
] as const;

/** Posted as `complexity`: where the work starts from. */
export const STAGE_OPTIONS = [
  { slug: 'idea', value: 'Exploring an idea' },
  { slug: 'prototype', value: 'Have a prototype' },
  { slug: 'live', value: 'Improving a live system' },
] as const;

export const SUCCESS_OPTIONS = [
  { slug: 'accuracy', value: 'Accuracy and quality' },
  { slug: 'time', value: 'Time saved' },
  { slug: 'cost', value: 'Cost per task' },
  { slug: 'errors', value: 'Fewer mistakes' },
  { slug: 'experience', value: 'Customer experience' },
  { slug: 'unsure', value: 'Help us define it' },
] as const;

/** Visitor intent only; no durations are promised. */
export const TIMELINE_OPTIONS = [
  { slug: 'soon', value: 'As soon as possible' },
  { slug: 'months', value: 'In the next few months' },
  { slug: 'open', value: 'No fixed date' },
] as const;

/** The visitor's own budget band, not a price list. */
export const BUDGET_OPTIONS = [
  { slug: 'under10', value: 'Under $10k' },
  { slug: 'to50', value: '$10k to $50k' },
  { slug: 'to150', value: '$50k to $150k' },
  { slug: 'over150', value: 'Over $150k' },
  { slug: 'unsure', value: 'Not sure yet' },
] as const;

export const OPTION_GROUPS = {
  services: SERVICE_OPTIONS,
  data: DATA_OPTIONS,
  runs: RUN_OPTIONS,
  stage: STAGE_OPTIONS,
  success: SUCCESS_OPTIONS,
  timeline: TIMELINE_OPTIONS,
  budget: BUDGET_OPTIONS,
} as const;
export type OptionGroup = keyof typeof OPTION_GROUPS;

/** Same limits the API enforces or truncates to. */
export const DESCRIPTION_MIN = 20;
export const DESCRIPTION_MAX = 5000;
export const NOTES_MAX = 2000;
export const NAME_MIN = 2;
export const NAME_MAX = 100;
export const COMPANY_MAX = 200;
export const EMAIL_MAX = 100;
export const PHONE_MAX = 50;

export interface QuoteAnswers {
  services: string[];
  description: string;
  data: string[];
  runs: string;
  stage: string;
  success: string[];
  timeline: string;
  budget: string;
  notes: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  agreed: boolean;
  /** Honeypot. Real visitors never see or fill it. */
  website: string;
}

export const EMPTY_ANSWERS: QuoteAnswers = {
  services: [],
  description: '',
  data: [],
  runs: '',
  stage: '',
  success: [],
  timeline: '',
  budget: '',
  notes: '',
  name: '',
  email: '',
  company: '',
  phone: '',
  agreed: false,
  website: '',
};

/** The fields a step can flag; each maps to Quote.validation.<field>. */
export type FieldKey =
  | 'services'
  | 'description'
  | 'data'
  | 'runs'
  | 'stage'
  | 'timeline'
  | 'budget'
  | 'name'
  | 'email'
  | 'company'
  | 'terms';

export type StepErrors = Partial<Record<FieldKey, true>>;

/** Which step each field lives on (for jumping back to a server-side error). */
export const FIELD_STEP: Record<FieldKey, number> = {
  services: 0,
  description: 0,
  data: 1,
  runs: 1,
  stage: 2,
  timeline: 2,
  budget: 2,
  name: 3,
  email: 3,
  company: 3,
  terms: 3,
};

/** What the step needs before the visitor may continue past it. */
export function validateStep(step: number, a: QuoteAnswers): StepErrors {
  const e: StepErrors = {};
  switch (STEPS[step]) {
    case 'problem':
      if (a.services.length === 0) e.services = true;
      if (a.description.trim().length < DESCRIPTION_MIN) e.description = true;
      break;
    case 'data':
      if (a.data.length === 0) e.data = true;
      if (!a.runs) e.runs = true;
      break;
    case 'scope':
      if (!a.stage) e.stage = true;
      if (!a.timeline) e.timeline = true;
      if (!a.budget) e.budget = true;
      break;
    case 'you':
      if (a.name.trim().length < NAME_MIN) e.name = true;
      if (!validator.isEmail(a.email.trim())) e.email = true;
      if (!a.company.trim()) e.company = true;
      if (!a.agreed) e.terms = true;
      break;
  }
  return e;
}

export const stepValid = (step: number, a: QuoteAnswers) => Object.keys(validateStep(step, a)).length === 0;

/**
 * The first step (from 0 up to, not including, `target`) that still has an
 * error, or `target` itself when everything before it is valid.
 */
export function firstBlockingStep(target: number, a: QuoteAnswers): number {
  for (let i = 0; i < target; i += 1) {
    if (!stepValid(i, a)) return i;
  }
  return target;
}

export type NodeState = 'done' | 'current' | 'todo';

/** A pipeline node is done once it has been passed and still validates. */
export function nodeState(i: number, current: number, furthest: number, a: QuoteAnswers): NodeState {
  if (i === current) return 'current';
  if (i <= furthest && stepValid(i, a)) return 'done';
  return 'todo';
}

/** Visitors may jump back to any passed step, or forward to one already reached. */
export const canVisit = (target: number, current: number, furthest: number) =>
  target !== current && target >= 0 && target <= furthest;

/** Toggle a slug in a multi-select list, keeping the options' order. */
export function toggleSlug(list: readonly string[], slug: string, group: OptionGroup): string[] {
  const next = list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug];
  const order = OPTION_GROUPS[group].map((o) => o.slug as string);
  return next.sort((x, y) => order.indexOf(x) - order.indexOf(y));
}

const valueOf = (group: OptionGroup, slug: string): string =>
  (OPTION_GROUPS[group] as ReadonlyArray<{ slug: string; value: string }>).find((o) => o.slug === slug)?.value ?? '';

const valuesOf = (group: OptionGroup, slugs: readonly string[]) =>
  slugs.map((s) => valueOf(group, s)).filter(Boolean);

/** The request body for /api/quote. */
export function buildPayload(a: QuoteAnswers) {
  const services = valuesOf('services', a.services);
  const requirements = [
    `Data: ${valuesOf('data', a.data).join(', ')}`,
    `Runs: ${valueOf('runs', a.runs)}`,
    `Success measured by: ${valuesOf('success', a.success).join(', ') || 'not specified'}`,
  ].join('\n');
  return {
    projectDetails: {
      services,
      projectType: services.join(', '),
      complexity: valueOf('stage', a.stage),
      description: a.description.trim(),
      requirements,
      timeline: valueOf('timeline', a.timeline),
      budget: valueOf('budget', a.budget),
    },
    companyInfo: {
      companyName: a.company.trim(),
      industry: '',
      companySize: '',
      contactName: a.name.trim(),
      email: a.email.trim(),
      phone: a.phone.trim(),
      preferredContact: 'email',
    },
    specialRequirements: a.notes.trim(),
    agreedToTerms: a.agreed,
    website: a.website,
  };
}

/** API field names (QuoteField) → the wizard field that shows the error. */
export const API_FIELD: Record<string, FieldKey> = {
  services: 'services',
  projectType: 'services',
  description: 'description',
  companyName: 'company',
  contactName: 'name',
  email: 'email',
};

/** The keys of the spec card, in order (Quote.spec.keys.<key>). */
export const SPEC_KEYS = [
  'service',
  'problem',
  'data',
  'runs',
  'stage',
  'success',
  'timeline',
  'budget',
  'contact',
] as const;
export type SpecKey = (typeof SPEC_KEYS)[number];

export type SpecEntry =
  | { key: SpecKey; kind: 'list'; group: OptionGroup; slugs: string[] }
  | { key: SpecKey; kind: 'one'; group: OptionGroup; slug: string }
  | { key: SpecKey; kind: 'text'; text: string };

/** One line per spec key, in order; empty values render as `~`. */
export function specEntries(a: QuoteAnswers): SpecEntry[] {
  const contact = [a.name.trim(), a.company.trim()].filter(Boolean).join(', ');
  return [
    { key: 'service', kind: 'list', group: 'services', slugs: a.services },
    { key: 'problem', kind: 'text', text: excerpt(a.description, 64) },
    { key: 'data', kind: 'list', group: 'data', slugs: a.data },
    { key: 'runs', kind: 'one', group: 'runs', slug: a.runs },
    { key: 'stage', kind: 'one', group: 'stage', slug: a.stage },
    { key: 'success', kind: 'list', group: 'success', slugs: a.success },
    { key: 'timeline', kind: 'one', group: 'timeline', slug: a.timeline },
    { key: 'budget', kind: 'one', group: 'budget', slug: a.budget },
    { key: 'contact', kind: 'text', text: contact },
  ];
}

export const entryFilled = (e: SpecEntry) =>
  e.kind === 'list' ? e.slugs.length > 0 : e.kind === 'one' ? e.slug !== '' : e.text !== '';

export const filledCount = (a: QuoteAnswers) => specEntries(a).filter(entryFilled).length;

/** Collapse whitespace and cut to `max` characters with an ellipsis. */
export function excerpt(text: string, max: number): string {
  const clean = text.trim().replace(/\s+/g, ' ');
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}
