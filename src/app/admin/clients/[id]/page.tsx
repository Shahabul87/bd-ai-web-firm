import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getAdmin } from '@/app/lib/adminSession';
import { getClient } from '@/app/lib/clients';
import type { ProjectStatusValue } from '@/app/lib/projects';
import AdminNav from '../../AdminNav';
import ProjectStatusBadge from '../../projects/ProjectStatusBadge';
import ClientControls from '../ClientControls';

export const metadata = { title: 'Client', robots: { index: false, follow: false } };

export default async function ClientDetail({ params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login');

  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  return (
    <>
      <AdminNav email={admin.email} />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link href="/admin/clients" className="font-mono text-xs uppercase tracking-[0.15em] text-steel hover:text-signal">
          ← All clients
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <h1 className="font-display text-3xl font-medium">{client.name}</h1>
          <span
            className={`inline-block border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${
              client.status === 'ACTIVE' ? 'border-signal/50 text-signal' : 'border-steel/50 text-steel'
            }`}
          >
            {client.status}
          </span>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
          {/* Projects */}
          <div className="space-y-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-steel">
              Projects ({client.projects.length})
            </p>
            {client.projects.length === 0 ? (
              <p className="text-sm text-steel">No projects yet — add one on the right.</p>
            ) : (
              <ul className="space-y-2">
                {client.projects.map((p) => (
                  <li key={p.id} className="border border-line p-4">
                    <div className="flex items-center justify-between gap-3">
                      <Link href={`/admin/projects/${p.id}`} className="text-bone hover:text-signal">
                        {p.title}
                      </Link>
                      <ProjectStatusBadge status={p.status as ProjectStatusValue} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Controls */}
          <aside className="border border-line p-5">
            <ClientControls
              id={client.id}
              defaults={{
                name: client.name,
                email: client.email,
                company: client.company ?? '',
                phone: client.phone ?? '',
                notes: client.notes ?? '',
              }}
              archived={client.status === 'ARCHIVED'}
              portalEnabled={client.portalEnabled}
            />
          </aside>
        </div>
      </main>
    </>
  );
}
