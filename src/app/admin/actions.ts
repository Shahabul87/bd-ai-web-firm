'use server';

import { revalidatePath } from 'next/cache';
import { getAdmin } from '@/app/lib/adminSession';
import { updateLeadStatus, addLeadNote, type LeadStatusValue } from '@/app/lib/leads';

const STATUSES: LeadStatusValue[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'];

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
