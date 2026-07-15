'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAdmin } from '@/app/lib/adminSession';
import {
  updateLeadStatus,
  addLeadNote,
  convertLeadToClient,
  type LeadStatusValue,
} from '@/app/lib/leads';
import { createClient, updateClient, archiveClient, inviteClientToPortal } from '@/app/lib/clients';
import {
  createProject,
  setProjectStatus,
  addMilestone,
  toggleMilestone,
  addProjectUpdate,
  type ProjectStatusValue,
} from '@/app/lib/projects';
import { prisma } from '@/app/lib/db';
import { addMessage } from '@/app/lib/messages';
import { sendAnnouncement, sendPush } from '@/app/lib/notify';
import {
  createInvoice,
  updateInvoiceDraft,
  sendInvoice,
  markInvoicePaid,
  voidInvoice,
  type InvoiceInput,
} from '@/app/lib/invoices';

const STATUSES: LeadStatusValue[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'];
const PROJECT_STATUSES: ProjectStatusValue[] = [
  'DISCOVERY',
  'BUILD',
  'REVIEW',
  'LAUNCHED',
  'MAINTENANCE',
  'ON_HOLD',
];

export async function setLeadStatus(id: string, status: string): Promise<void> {
  const admin = await getAdmin();
  if (!admin) throw new Error('unauthorized');
  if (!STATUSES.includes(status as LeadStatusValue)) throw new Error('bad status');
  await updateLeadStatus(id, status as LeadStatusValue, admin.email);
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath('/admin');
}

export async function addNote(id: string, body: string): Promise<void> {
  const admin = await getAdmin();
  if (!admin) throw new Error('unauthorized');
  const trimmed = body.trim();
  if (trimmed.length === 0 || trimmed.length > 5000) throw new Error('bad note');
  await addLeadNote(id, admin.email, trimmed);
  revalidatePath(`/admin/leads/${id}`);
}

// ── Clients & Projects (Phase 2) ──

const ClientSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  company: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export async function createClientAction(form: {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  notes?: string;
}): Promise<void> {
  const admin = await getAdmin();
  if (!admin) throw new Error('unauthorized');
  const p = ClientSchema.parse(form);
  const { id } = await createClient(p);
  revalidatePath('/admin/clients');
  redirect(`/admin/clients/${id}`);
}

export async function updateClientAction(
  id: string,
  patch: { name?: string; email?: string; company?: string; phone?: string; notes?: string },
): Promise<void> {
  const admin = await getAdmin();
  if (!admin) throw new Error('unauthorized');
  await updateClient(id, patch, admin.email);
  revalidatePath(`/admin/clients/${id}`);
}

export async function archiveClientAction(id: string): Promise<void> {
  const admin = await getAdmin();
  if (!admin) throw new Error('unauthorized');
  await archiveClient(id, admin.email);
  revalidatePath(`/admin/clients/${id}`);
  revalidatePath('/admin/clients');
}

export async function inviteToPortalAction(clientId: string): Promise<void> {
  const admin = await getAdmin();
  if (!admin) throw new Error('unauthorized');
  const r = await inviteClientToPortal(clientId, admin.email);
  if ('error' in r) throw new Error(r.error);
  revalidatePath(`/admin/clients/${clientId}`);
}

export async function createProjectAction(
  clientId: string,
  title: string,
  description?: string,
): Promise<void> {
  const admin = await getAdmin();
  if (!admin) throw new Error('unauthorized');
  if (!title.trim()) throw new Error('title required');
  const { id } = await createProject({ clientId, title: title.trim(), description });
  revalidatePath(`/admin/clients/${clientId}`);
  redirect(`/admin/projects/${id}`);
}

export async function setProjectStatusAction(id: string, status: string): Promise<void> {
  const admin = await getAdmin();
  if (!admin) throw new Error('unauthorized');
  if (!PROJECT_STATUSES.includes(status as ProjectStatusValue)) throw new Error('bad status');
  await setProjectStatus(id, status as ProjectStatusValue, admin.email);
  revalidatePath(`/admin/projects/${id}`);
}

export async function addMilestoneAction(
  projectId: string,
  title: string,
  dueDate?: string,
): Promise<void> {
  const admin = await getAdmin();
  if (!admin) throw new Error('unauthorized');
  if (!title.trim()) throw new Error('title required');
  await addMilestone(projectId, title.trim(), dueDate ? new Date(dueDate) : null);
  revalidatePath(`/admin/projects/${projectId}`);
}

export async function toggleMilestoneAction(id: string, projectId: string): Promise<void> {
  const admin = await getAdmin();
  if (!admin) throw new Error('unauthorized');
  await toggleMilestone(id, admin.email);
  revalidatePath(`/admin/projects/${projectId}`);
}

export async function addProjectUpdateAction(
  projectId: string,
  body: string,
  visibility: string,
): Promise<void> {
  const admin = await getAdmin();
  if (!admin) throw new Error('unauthorized');
  if (!body.trim()) throw new Error('empty');
  const vis = visibility === 'CLIENT' ? 'CLIENT' : 'INTERNAL';
  await addProjectUpdate(projectId, admin.email, body.trim(), vis);
  revalidatePath(`/admin/projects/${projectId}`);
}

export async function convertLeadAction(leadId: string, projectTitle: string): Promise<void> {
  const admin = await getAdmin();
  if (!admin) throw new Error('unauthorized');
  const r = await convertLeadToClient(leadId, admin.email, projectTitle);
  if ('error' in r) throw new Error(r.error);
  revalidatePath('/admin/clients');
  revalidatePath(`/admin/leads/${leadId}`);
  redirect(`/admin/projects/${r.projectId}`);
}

export async function sendAdminMessage(projectId: string, body: string): Promise<void> {
  const admin = await getAdmin();
  if (!admin) throw new Error('unauthorized');
  if (!body.trim()) throw new Error('empty');
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { title: true, clientId: true, client: { select: { email: true } } },
  });
  if (!project) throw new Error('not found');
  await addMessage(projectId, 'ADMIN', admin.email, body.trim());
  void sendAnnouncement(
    project.client.email,
    `Reply from CraftsAI — ${project.title}`,
    `You have a new message on "${project.title}". Sign in to your portal to view and reply.`,
  );
  void sendPush(`client:${project.clientId}`, `Reply from CraftsAI — ${project.title}`, 'You have a new message in your portal.');
  revalidatePath(`/admin/projects/${projectId}`);
}

// ── Invoices (Phase 4) ──

const LineSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPriceMinor: z.number().int().nonnegative(),
});
const InvoiceSchema = z.object({
  clientId: z.string().min(1),
  projectId: z.string().optional(),
  currency: z.string().min(1),
  taxLabel: z.string().optional(),
  taxRateBps: z.number().int().min(0).max(100000),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  lines: z.array(LineSchema).min(1),
});

function toInvoiceInput(form: z.infer<typeof InvoiceSchema>): InvoiceInput {
  return {
    clientId: form.clientId,
    projectId: form.projectId,
    currency: form.currency,
    taxLabel: form.taxLabel,
    taxRateBps: form.taxRateBps,
    notes: form.notes,
    dueDate: form.dueDate ? new Date(form.dueDate) : null,
    lines: form.lines,
  };
}

export async function createInvoiceAction(form: unknown): Promise<void> {
  const admin = await getAdmin();
  if (!admin) throw new Error('unauthorized');
  const { id } = await createInvoice(toInvoiceInput(InvoiceSchema.parse(form)), admin.email);
  revalidatePath('/admin/invoices');
  redirect(`/admin/invoices/${id}`);
}

export async function updateInvoiceDraftAction(id: string, form: unknown): Promise<void> {
  const admin = await getAdmin();
  if (!admin) throw new Error('unauthorized');
  await updateInvoiceDraft(id, toInvoiceInput(InvoiceSchema.parse(form)), admin.email);
  revalidatePath(`/admin/invoices/${id}`);
}

export async function sendInvoiceAction(id: string): Promise<void> {
  const admin = await getAdmin();
  if (!admin) throw new Error('unauthorized');
  await sendInvoice(id, admin.email);
  revalidatePath(`/admin/invoices/${id}`);
  revalidatePath('/admin/invoices');
}

export async function markInvoicePaidAction(id: string, paymentRef: string): Promise<void> {
  const admin = await getAdmin();
  if (!admin) throw new Error('unauthorized');
  await markInvoicePaid(id, paymentRef, admin.email);
  revalidatePath(`/admin/invoices/${id}`);
  revalidatePath('/admin/invoices');
}

export async function voidInvoiceAction(id: string): Promise<void> {
  const admin = await getAdmin();
  if (!admin) throw new Error('unauthorized');
  await voidInvoice(id, admin.email);
  revalidatePath(`/admin/invoices/${id}`);
  revalidatePath('/admin/invoices');
}
