import { Prisma } from '@prisma/client';
import { prisma } from './db';
import { sendAnnouncement } from './notify';
import { SITE_URL, CONTACT_EMAIL } from './email';
import { writeAudit } from './audit';

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

/**
 * Persists a lead and fires the founder alert. Fail-open: returns `null`
 * (never throws) so public form routes still succeed for the visitor.
 * Retries a few times on transient connection errors so the first lead after
 * a cold deploy is not lost.
 */
export async function createLead(input: CreateLeadInput): Promise<{ id: string } | null> {
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
        `\n\nView: ${SITE_URL}/admin/leads/${lead.id}`;
      void sendAnnouncement(CONTACT_EMAIL, subject, body);

      return { id: lead.id };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown';
      if (attempt < maxAttempts && isTransientDbError(msg)) {
        await sleep(300 * attempt);
        continue;
      }
      console.error(`createLead failed (attempt ${attempt}/${maxAttempts}):`, msg);
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
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
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
        data: { name: lead.name, email: lead.email, company: lead.company ?? null, sourceLeadId: lead.id },
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
