import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getPortalClient } from '@/app/lib/portalSession';
import { listClientProjects } from '@/app/lib/portal';
import type { ProjectStatusValue } from '@/app/lib/projects';
import PortalHeader from './PortalHeader';
import ProjectStatusBadge from '../admin/projects/ProjectStatusBadge';

export const metadata = { title: 'Your projects | CraftsAI', robots: { index: false, follow: false } };

export default async function PortalDashboard() {
  const client = await getPortalClient();
  if (!client) redirect('/portal/login');

  const projects = await listClientProjects(client.clientId);

  return (
    <>
      <PortalHeader clientName={client.name} />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-signal">Your projects</p>
        <h1 className="mt-2 font-display text-3xl font-medium">Welcome, {client.name.split(' ')[0]}</h1>

        {projects.length === 0 ? (
          <p className="mt-8 text-sm text-steel">No projects yet — we&apos;ll add yours here soon.</p>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {projects.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/portal/projects/${p.id}`}
                  className="block border border-line p-5 transition-colors hover:border-signal"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-display text-lg text-bone">{p.title}</span>
                    <ProjectStatusBadge status={p.status as ProjectStatusValue} />
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-steel">
                      <span>Milestones</span>
                      <span>{p.done}/{p.total}</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full bg-line">
                      <div
                        className="h-full bg-signal"
                        style={{ width: p.total ? `${(p.done / p.total) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
