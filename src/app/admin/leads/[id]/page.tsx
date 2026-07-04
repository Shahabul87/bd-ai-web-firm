import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getAdmin } from '@/app/lib/adminSession';
import { getLead, getLeadConversion, type LeadStatusValue } from '@/app/lib/leads';
import AdminNav from '../../AdminNav';
import StatusBadge from '../../StatusBadge';
import LeadControls from './LeadControls';
import LeadConvert from './LeadConvert';

export const metadata = { title: 'Lead', robots: { index: false, follow: false } };

function fmt(d: Date): string {
  return new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-steel">{label}</p>
      <p className="mt-1 break-words text-sm text-bone">{value || '—'}</p>
    </div>
  );
}

export default async function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login');

  const { id } = await params;
  const lead = await getLead(id);
  if (!lead) notFound();

  const conversion = await getLeadConversion(id);

  const payload = (lead.payload ?? {}) as Record<string, unknown>;
  const payloadEntries = Object.entries(payload).filter(
    ([k]) => !['name', 'email', 'message'].includes(k),
  );

  return (
    <>
      <AdminNav email={admin.email} />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link href="/admin" className="font-mono text-xs uppercase tracking-[0.15em] text-steel hover:text-signal">
          ← All leads
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <h1 className="font-display text-3xl font-medium">{lead.name || 'Lead'}</h1>
          <StatusBadge status={lead.status as LeadStatusValue} />
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-steel">{lead.source}</span>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
          {/* Submission */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6 border border-line p-5">
              <Field label="Email" value={<a href={`mailto:${lead.email}`} className="text-signal hover:underline">{lead.email}</a>} />
              <Field label="Company" value={lead.company} />
              <Field label="Received" value={fmt(lead.createdAt)} />
              <Field label="IP" value={lead.ip} />
            </div>

            {lead.message && (
              <div className="border border-line p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-steel">Message</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-bone">{lead.message}</p>
              </div>
            )}

            {payloadEntries.length > 0 && (
              <div className="border border-line p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-steel">Full submission</p>
                <dl className="mt-3 space-y-2">
                  {payloadEntries.map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[140px_1fr] gap-3 text-sm">
                      <dt className="font-mono text-[11px] uppercase tracking-[0.1em] text-steel">{k}</dt>
                      <dd className="break-words text-bone">
                        {Array.isArray(v) ? v.join(', ') : String(v ?? '—')}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Notes */}
            <div className="border border-line p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-steel">
                Notes ({lead.notes.length})
              </p>
              {lead.notes.length === 0 ? (
                <p className="mt-2 text-sm text-steel">No notes yet.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {lead.notes.map((n) => (
                    <li key={n.id} className="border-l-2 border-line pl-3">
                      <p className="whitespace-pre-wrap text-sm text-bone">{n.body}</p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-steel">
                        {n.authorEmail} · {fmt(n.createdAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Triage */}
          <aside className="border border-line p-5">
            <LeadControls id={lead.id} status={lead.status as LeadStatusValue} />
            {conversion ? (
              <div className="mt-5 border-t border-line pt-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-signal">Converted</p>
                <div className="mt-2 flex flex-col gap-2 text-sm">
                  <Link href={`/admin/clients/${conversion.clientId}`} className="text-signal hover:underline">
                    View client →
                  </Link>
                  {conversion.projectId && (
                    <Link href={`/admin/projects/${conversion.projectId}`} className="text-signal hover:underline">
                      View project →
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <LeadConvert leadId={lead.id} defaultTitle={`${lead.name || 'Client'} — project`} />
            )}
          </aside>
        </div>
      </main>
    </>
  );
}
