import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdmin } from '@/app/lib/adminSession';
import {
  listLeads,
  countLeads,
  type LeadStatusValue,
  type LeadSourceValue,
} from '@/app/lib/leads';
import AdminNav from './AdminNav';
import LeadFilters from './LeadFilters';
import StatusBadge from './StatusBadge';

export const metadata = { title: 'Leads', robots: { index: false, follow: false } };

function fmt(d: Date): string {
  return new Date(d).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function AdminLeads({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; source?: string; q?: string }>;
}) {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login');

  const sp = await searchParams;
  const filter = {
    status: (sp.status as LeadStatusValue) || undefined,
    source: (sp.source as LeadSourceValue) || undefined,
    q: sp.q || undefined,
  };
  const [leads, total] = await Promise.all([listLeads(filter), countLeads(filter)]);

  const exportQs = new URLSearchParams(
    Object.entries(sp).filter(([, v]) => v) as [string, string][],
  ).toString();

  return (
    <>
      <AdminNav email={admin.email} />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-signal">Leads</p>
            <h1 className="mt-2 font-display text-3xl font-medium">
              {total} {total === 1 ? 'lead' : 'leads'}
            </h1>
          </div>
          <a
            href={`/api/admin/leads/export${exportQs ? `?${exportQs}` : ''}`}
            className="border border-line px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-bone transition-colors hover:border-signal hover:text-signal"
          >
            Download CSV
          </a>
        </div>

        <div className="mt-8">
          <LeadFilters />
        </div>

        <div className="mt-6 overflow-x-auto border border-line">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line bg-ink-900 font-mono text-[10px] uppercase tracking-[0.15em] text-steel">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-steel">
                    No leads match these filters yet.
                  </td>
                </tr>
              )}
              {leads.map((l) => (
                <tr key={l.id} className="border-b border-line/60 transition-colors hover:bg-ink-900">
                  <td className="whitespace-nowrap px-4 py-3 text-steel">{fmt(l.createdAt)}</td>
                  <td className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em] text-steel">
                    {l.source}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/leads/${l.id}`} className="text-bone hover:text-signal">
                      {l.name || '—'}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-steel">{l.email}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={l.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
