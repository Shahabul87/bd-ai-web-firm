import { prisma } from './db';

export async function listMessages(projectId: string) {
  return prisma.message.findMany({ where: { projectId }, orderBy: { createdAt: 'asc' } });
}

export async function addMessage(
  projectId: string,
  senderType: 'ADMIN' | 'CLIENT',
  senderEmail: string,
  body: string,
): Promise<void> {
  await prisma.message.create({ data: { projectId, senderType, senderEmail, body } });
}
