import { Prisma } from '@prisma/client';
import { prisma } from './db';
import { sendAnnouncement, sendPush } from './notify';
import { SITE_URL, CONTACT_EMAIL } from './email';
import { writeAudit } from './audit';
import { reportError } from './report';
import { normalizeEmail } from './normalizeEmail';

export interface CreateLeadInput {
  source: 'CONTACT' | 'QUOTE' | 'DEMO';
  name: string;
  email: string;
  company?: string;
  message?: string;
  payload: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

// A transient DB error is worth retrying (e.g. the first request after a cold
// deploy, before the Prisma connection to the private Postgres is established).
function isTransientDbError(msg: string): boolean {
  return /can't reach|reach database|connect|ECONN|ETIMEDOUT|timeout|terminating|P10(01|17)|pool/i.test(
    msg,
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Fields rendered explicitly in the founder alert; everything else in the
 *  payload is appended generically so no collected field is ever invisible. */
const ALERT_CORE_FIELDS = new Set(['name', 'email', 'company', 'message']);

function payloadExtras(payload: Record<string, unknown>): string {
  const lines = Object.entries(payload)
    .filter(([k, v]) => !ALERT_CORE_FIELDS.has(k) && v !== '' && v != null)
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`);
  return lines.length ? `\n${lines.join('\n')}` : '';
}

/**
 * A repeat submission of the SAME content within this window is treated as a
 * double-click / retry rather than a new lead.
 */
const DUPLICATE_WINDOW_MS = 2 * 60_000;

/** Returns the existing lead if an identical one was just created. */
async function findRecentDuplicate(input: CreateLeadInput): Promise<{ id: string } | null> {
  try {
    return await prisma.lead.findFirst({
      where: {
        source: input.source,
        email: input.email,
        message: input.message ?? null,
        createdAt: { gt: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });
  } catch {
    // A dedupe-lookup failure must never block capturing a real lead.
    return null;
  }
}

/**
 * Persists a lead and fires the founder alert. Fail-open: returns `null`
 * (never throws) so public form routes still succeed for the visitor.
 * Retries a few times on transient connection errors so the first lead after
 * a cold deploy is not lost.
 */
export async function createLead(input: CreateLeadInput): Promise<{ id: string } | null> {
  // Idempotency for rapid repeats (double-clicked submit, client retry): an
  // identical submission inside the window returns the original lead instead of
  // creating a duplicate the founder would have to triage twice.
  const duplicate = await findRecentDuplicate(input);
  if (duplicate) return { id: duplicate.id };

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const lead = await prisma.lead.create({
        data: {
          source: input.source,
          name: input.name,
          email: input.email,
          company: input.company ?? null,
          message: input.message ?? null,
          // Sanitized, JSON-serializable form data → Prisma's Json input type.
          payload: input.payload as Prisma.InputJsonValue,
          ip: input.ip ?? null,
          userAgent: input.userAgent ?? null,
        },
        select: { id: true },
      });

      // Fire-and-forget founder alert; never let it affect the lead result.
      const subject = `New ${input.source} lead from ${input.name}`;
      const body =
        `${subject}\n\nName: ${input.name}\nEmail: ${input.email}` +
        (input.company ? `\nCompany: ${input.company}` : '') +
        (input.message ? `\nMessage: ${input.message}` : '') +
        // Everything else collected (contact: service; demo: product; quote:
        // services/budget/timeline/…) so the alert is never missing a field.
        payloadExtras(input.payload) +
        `\n\nView: ${SITE_URL}/admin/leads/${lead.id}`;
      void sendAnnouncement(CONTACT_EMAIL, subject, body);
      void sendPush('admin', `New ${input.source} lead`, `${input.name} — ${input.email}`);

      return { id: lead.id };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown';
      if (attempt < maxAttempts && isTransientDbError(msg)) {
        await sleep(300 * attempt);
        continue;
      }
      // Final failure after retries: surface it loudly. The route turns this
      // null into a 503 for the visitor; here we also page the founder so a lost
      // lead never fails silently. Alerting goes over notify-svc, a separate
      // service from Postgres, so it can still reach us when the DB is the fault.
      reportError('lead.persist', err, {
        meta: { source: input.source, email: input.email, attempts: maxAttempts },
      });
      void sendAnnouncement(
        CONTACT_EMAIL,
        `⚠️ Lead capture FAILED (${input.source})`,
        `A ${input.source} lead could not be saved after ${maxAttempts} attempts.\n\n` +
          `Name: ${input.name}\nEmail: ${input.email}` +
          (input.company ? `\nCompany: ${input.company}` : '') +
          (input.message ? `\nMessage: ${input.message}` : '') +
          `\n\nError: ${msg}\n\nFollow up with this visitor manually — the row was NOT persisted.`,
      );
      return null;
    }
  }
  return null;
}

// ── Read/triage layer (admin dashboard) ──

export type LeadStatusValue = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'WON' | 'LOST';
export type LeadSourceValue = 'CONTACT' | 'QUOTE' | 'DEMO';

export interface LeadListItem {
  id: string;
  source: LeadSourceValue;
  name: string;
  email: string;
  company: string | null;
  status: LeadStatusValue;
  createdAt: Date;
}

interface LeadFilter {
  status?: LeadStatusValue;
  source?: LeadSourceValue;
  q?: string;
  take?: number;
  skip?: number;
}

function whereFrom(f: LeadFilter = {}): Record<string, unknown> {
  const where: Record<string, unknown> = {};
  if (f.status) where.status = f.status;
  if (f.source) where.source = f.source;
  if (f.q && f.q.trim()) {
    const contains = { contains: f.q.trim(), mode: 'insensitive' as const };
    where.OR = [{ name: contains }, { email: contains }, { company: contains }];
  }
  return where;
}

export async function listLeads(f: LeadFilter = {}): Promise<LeadListItem[]> {
  return prisma.lead.findMany({
    where: whereFrom(f),
    orderBy: { createdAt: 'desc' },
    take: f.take ?? 200,
    skip: f.skip ?? 0,
    select: {
      id: true,
      source: true,
      name: true,
      email: true,
      company: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function countLeads(f: LeadFilter = {}): Promise<number> {
  return prisma.lead.count({ where: whereFrom(f) });
}

export async function getLead(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: { notes: { orderBy: { createdAt: 'desc' } } },
  });
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatusValue,
  actorEmail: string,
): Promise<void> {
  await prisma.lead.update({ where: { id }, data: { status } });
  await writeAudit('lead.status.change', { actorEmail, meta: { id, status } });
}

export async function addLeadNote(id: string, authorEmail: string, body: string): Promise<void> {
  await prisma.leadNote.create({ data: { leadId: id, authorEmail, body } });
  await writeAudit('lead.note.add', { actorEmail: authorEmail, meta: { id } });
}

function csvCell(v: unknown): string {
  let s = v == null ? '' : String(v);
  // Neutralize spreadsheet formula injection: Excel/Sheets execute a cell that
  // begins with = + - @, a tab, or a carriage return as a formula. Lead name,
  // company, and email are attacker-controlled (public forms), so prefix such a
  // cell with a single quote to force literal-text interpretation.
  if (/^[=+\-@\t\r]/.test(s)) {
    s = `'${s}`;
  }
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function leadsToCsv(rows: LeadListItem[]): string {
  const header = 'id,source,name,email,company,status,createdAt';
  const lines = rows.map((r) =>
    [r.id, r.source, r.name, r.email, r.company ?? '', r.status, r.createdAt.toISOString()]
      .map(csvCell)
      .join(','),
  );
  return [header, ...lines].join('\n') + '\n';
}

/**
 * If a lead has been converted, return its client id + first project id
 * (for the "already converted → view" link). Otherwise null.
 */
export async function getLeadConversion(
  leadId: string,
): Promise<{ clientId: string; projectId: string | null } | null> {
  const client = await prisma.client.findUnique({
    where: { sourceLeadId: leadId },
    select: { id: true, projects: { orderBy: { createdAt: 'asc' }, take: 1, select: { id: true } } },
  });
  if (!client) return null;
  return { clientId: client.id, projectId: client.projects[0]?.id ?? null };
}

/**
 * Convert a won lead into a Client + a first Project, atomically.
 * Refuses if the lead is missing or already converted (a Client with this
 * sourceLeadId exists — enforced unique). Returns ids or an { error }.
 */
export async function convertLeadToClient(
  leadId: string,
  actorEmail: string,
  projectTitle: string,
): Promise<{ clientId: string; projectId: string } | { error: string }> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { id: true, name: true, email: true, company: true },
  });
  if (!lead) return { error: 'Lead not found.' };

  const existing = await prisma.client.findUnique({
    where: { sourceLeadId: leadId },
    select: { id: true },
  });
  if (existing) return { error: 'Lead already converted.' };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const client = await tx.client.create({
        data: {
          name: lead.name,
          email: lead.email,
          // Identity key: portal login resolves on this, so a converted client
          // without it could never sign in.
          normalizedEmail: normalizeEmail(lead.email),
          company: lead.company ?? null,
          sourceLeadId: lead.id,
        },
        select: { id: true },
      });
      const project = await tx.project.create({
        data: { clientId: client.id, title: projectTitle || `${lead.name} — project` },
        select: { id: true },
      });
      return { clientId: client.id, projectId: project.id };
    });
    await writeAudit('lead.convert', { actorEmail, meta: { leadId, ...result } });
    return result;
  } catch (err) {
    console.error('convertLeadToClient failed:', err instanceof Error ? err.message : 'unknown');
    return { error: 'Could not convert lead. It may already be converted.' };
  }
}
