import { Prisma } from '@prisma/client';
import { prisma } from './db';
import { sendAnnouncement } from './notify';
import { SITE_URL, CONTACT_EMAIL } from './email';

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

/**
 * Persists a lead and fires the founder alert. Fail-open: returns `null`
 * (never throws) so public form routes still succeed for the visitor.
 */
export async function createLead(input: CreateLeadInput): Promise<{ id: string } | null> {
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
    console.error('createLead failed:', err instanceof Error ? err.message : 'unknown');
    return null;
  }
}
