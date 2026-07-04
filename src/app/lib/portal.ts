import { prisma } from './db';

/** The client's projects with milestone progress. Scoped to one clientId. */
export async function listClientProjects(clientId: string) {
  const rows = await prisma.project.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      status: true,
      _count: { select: { milestones: true } },
      milestones: { where: { status: 'DONE' }, select: { id: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    status: r.status,
    done: r.milestones.length,
    total: r._count.milestones,
  }));
}

/**
 * A single project for a client — SCOPED by clientId, so a client can never load
 * another client's project (returns null). Only CLIENT-visible updates are
 * included; INTERNAL updates are never queried here.
 */
export async function getClientProject(clientId: string, projectId: string) {
  return prisma.project.findFirst({
    where: { id: projectId, clientId },
    include: {
      milestones: { orderBy: { order: 'asc' } },
      updates: { where: { visibility: 'CLIENT' }, orderBy: { createdAt: 'desc' } },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });
}
