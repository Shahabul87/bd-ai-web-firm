import { prisma } from './db';
import { writeAudit } from './audit';

export type ClientStatusValue = 'ACTIVE' | 'ARCHIVED';

export interface ClientListItem {
  id: string;
  name: string;
  email: string;
  company: string | null;
  status: ClientStatusValue;
  projectCount: number;
  createdAt: Date;
}

export async function listClients(
  f: { status?: ClientStatusValue; q?: string } = {},
): Promise<ClientListItem[]> {
  const where: Record<string, unknown> = {};
  if (f.status) where.status = f.status;
  if (f.q && f.q.trim()) {
    const contains = { contains: f.q.trim(), mode: 'insensitive' as const };
    where.OR = [{ name: contains }, { email: contains }, { company: contains }];
  }
  const rows = await prisma.client.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      company: true,
      status: true,
      createdAt: true,
      _count: { select: { projects: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    company: r.company,
    status: r.status,
    createdAt: r.createdAt,
    projectCount: r._count.projects,
  }));
}

export async function getClient(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: { projects: { orderBy: { createdAt: 'desc' } } },
  });
}

export async function createClient(input: {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  notes?: string;
  sourceLeadId?: string;
}): Promise<{ id: string }> {
  return prisma.client.create({
    data: {
      name: input.name,
      email: input.email,
      company: input.company ?? null,
      phone: input.phone ?? null,
      notes: input.notes ?? null,
      sourceLeadId: input.sourceLeadId ?? null,
    },
    select: { id: true },
  });
}

export async function updateClient(
  id: string,
  patch: { name?: string; email?: string; company?: string; phone?: string; notes?: string },
  actorEmail: string,
): Promise<void> {
  await prisma.client.update({ where: { id }, data: patch });
  await writeAudit('client.update', { actorEmail, meta: { id } });
}

export async function archiveClient(id: string, actorEmail: string): Promise<void> {
  await prisma.client.update({ where: { id }, data: { status: 'ARCHIVED' } });
  await writeAudit('client.archive', { actorEmail, meta: { id } });
}
