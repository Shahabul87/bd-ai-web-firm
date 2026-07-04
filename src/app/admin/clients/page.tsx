import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdmin } from '@/app/lib/adminSession';
import { listClients, type ClientStatusValue } from '@/app/lib/clients';
import AdminNav from '../AdminNav';
import ClientFilters from './ClientFilters';

export const metadata = { title: 'Clients', robots: { index: false, follow: false } };

export default async function AdminClients({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login');

  const sp = await searchParams;
  const clients = await listClients({
    status: (sp.status as ClientStatusValue) || undefined,
    q: sp.q || undefined,
  });

  return (
    <>
      <AdminNav email={admin.email} />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-signal">Clients</p>
            <h1 className="mt-2 font-display text-3xl font-medium">
              {clients.length} {clients.length === 1 ? 'client' : 'clients'}
            </h1>
          </div>
          <Link
            href="/admin/clients/new"
            className="bg-signal px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-ink-950 transition-colors hover:bg-signal-dim"
          >
            New client
          </Link>
        </div>

        <div className="mt-8">
          <ClientFilters />
        </div>

        <div className="mt-6 overflow-x-auto border border-line">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line bg-ink-900 font-mono text-[10px] uppercase tracking-[0.15em] text-steel">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Projects</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-steel">
                    No clients yet — convert a lead or add one.
                  </td>
                </tr>
              )}
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-line/60 transition-colors hover:bg-ink-900">
                  <td className="px-4 py-3">
                    <Link href={`/admin/clients/${c.id}`} className="text-bone hover:text-signal">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-steel">{c.company || '—'}</td>
                  <td className="px-4 py-3 text-steel">{c.email}</td>
                  <td className="px-4 py-3 text-steel">{c.projectCount}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${
                        c.status === 'ACTIVE' ? 'border-signal/50 text-signal' : 'border-steel/50 text-steel'
                      }`}
                    >
                      {c.status}
                    </span>
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
