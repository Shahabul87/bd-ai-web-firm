'use server';

import { revalidatePath } from 'next/cache';
import { getPortalClient } from '@/app/lib/portalSession';
import { getClientProject } from '@/app/lib/portal';
import { addMessage } from '@/app/lib/messages';
import { sendAnnouncement } from '@/app/lib/notify';
import { CONTACT_EMAIL } from '@/app/lib/email';

/** Client posts a message on one of THEIR projects (ownership re-checked). */
export async function sendClientMessage(projectId: string, body: string): Promise<void> {
  const c = await getPortalClient();
  if (!c) throw new Error('unauthorized');
  if (!body.trim()) throw new Error('empty');
  const project = await getClientProject(c.clientId, projectId); // scoping: must be theirs
  if (!project) throw new Error('not found');
  await addMessage(projectId, 'CLIENT', c.email, body.trim());
  void sendAnnouncement(
    CONTACT_EMAIL,
    `New portal message — ${project.title}`,
    `${c.name} sent a message on "${project.title}". Sign in to the admin dashboard to reply.`,
  );
  revalidatePath(`/portal/projects/${projectId}`);
}
