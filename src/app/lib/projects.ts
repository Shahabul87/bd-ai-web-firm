import { prisma } from './db';
import { writeAudit } from './audit';

export type ProjectStatusValue =
  | 'DISCOVERY'
  | 'BUILD'
  | 'REVIEW'
  | 'LAUNCHED'
  | 'MAINTENANCE'
  | 'ON_HOLD';

export async function getProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      client: true,
      milestones: { orderBy: { order: 'asc' } },
      updates: { orderBy: { createdAt: 'desc' } },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });
}

export async function createProject(input: {
  clientId: string;
  title: string;
  description?: string;
}): Promise<{ id: string }> {
  return prisma.project.create({
    data: { clientId: input.clientId, title: input.title, description: input.description ?? null },
    select: { id: true },
  });
}

export async function setProjectStatus(
  id: string,
  status: ProjectStatusValue,
  actorEmail: string,
): Promise<void> {
  await prisma.project.update({ where: { id }, data: { status } });
  await writeAudit('project.status.change', { actorEmail, meta: { id, status } });
}

export async function addMilestone(
  projectId: string,
  title: string,
  dueDate: Date | null = null,
): Promise<void> {
  const order = await prisma.milestone.count({ where: { projectId } });
  await prisma.milestone.create({ data: { projectId, title, dueDate, order } });
}

export async function toggleMilestone(id: string, actorEmail: string): Promise<void> {
  const m = await prisma.milestone.findUnique({ where: { id }, select: { status: true } });
  if (!m) return;
  const next = m.status === 'DONE' ? 'PENDING' : 'DONE';
  await prisma.milestone.update({ where: { id }, data: { status: next } });
  await writeAudit('project.milestone.toggle', { actorEmail, meta: { id, status: next } });
}

export async function addProjectUpdate(
  projectId: string,
  authorEmail: string,
  body: string,
  visibility: 'INTERNAL' | 'CLIENT',
): Promise<void> {
  await prisma.projectUpdate.create({ data: { projectId, authorEmail, body, visibility } });
  await writeAudit('project.update.add', { actorEmail: authorEmail, meta: { projectId, visibility } });
}
