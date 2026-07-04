import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getAdmin } from '@/app/lib/adminSession';
import { getProject, type ProjectStatusValue } from '@/app/lib/projects';
import AdminNav from '../../AdminNav';
import ProjectStatusBadge from '../ProjectStatusBadge';
import ProjectControls from '../ProjectControls';
import MilestoneToggle from '../MilestoneToggle';
import AdminThread from '../AdminThread';

export const metadata = { title: 'Project', robots: { index: false, follow: false } };

function fmtDate(d: Date | null): string {
  return d ? new Date(d).toISOString().slice(0, 10) : '';
}

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login');

  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <>
      <AdminNav email={admin.email} />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link
          href={`/admin/clients/${project.clientId}`}
          className="font-mono text-xs uppercase tracking-[0.15em] text-steel hover:text-signal"
        >
          ← {project.client.name}
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <h1 className="font-display text-3xl font-medium">{project.title}</h1>
          <ProjectStatusBadge status={project.status as ProjectStatusValue} />
        </div>
        {project.description && <p className="mt-2 max-w-2xl text-sm text-steel">{project.description}</p>}

        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
          <div className="space-y-8">
            {/* Milestones */}
            <section>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-steel">
                Milestones ({project.milestones.filter((m) => m.status === 'DONE').length}/{project.milestones.length})
              </p>
              {project.milestones.length === 0 ? (
                <p className="mt-3 text-sm text-steel">No milestones yet — add one on the right.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {project.milestones.map((m) => (
                    <li key={m.id} className="flex items-center gap-3 border border-line px-4 py-3">
                      <MilestoneToggle id={m.id} projectId={project.id} done={m.status === 'DONE'} />
                      <span className={`flex-1 text-sm ${m.status === 'DONE' ? 'text-steel line-through' : 'text-bone'}`}>
                        {m.title}
                      </span>
                      {m.dueDate && (
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-steel">
                          {fmtDate(m.dueDate)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Timeline */}
            <section>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-steel">
                Update timeline ({project.updates.length})
              </p>
              {project.updates.length === 0 ? (
                <p className="mt-3 text-sm text-steel">No updates yet.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {project.updates.map((u) => (
                    <li key={u.id} className="border-l-2 border-line pl-4">
                      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em]">
                        <span className={u.visibility === 'CLIENT' ? 'text-signal' : 'text-steel'}>
                          {u.visibility === 'CLIENT' ? 'Client-visible' : 'Internal'}
                        </span>
                        <span className="text-steel/60">
                          {new Date(u.createdAt).toISOString().slice(0, 16).replace('T', ' ')} · {u.authorEmail}
                        </span>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-bone">{u.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Client message thread */}
            <section className="border-t border-line pt-8">
              <AdminThread
                projectId={project.id}
                messages={project.messages.map((m) => ({
                  id: m.id,
                  senderType: m.senderType as 'ADMIN' | 'CLIENT',
                  body: m.body,
                  createdAt: m.createdAt.toISOString(),
                }))}
              />
            </section>
          </div>

          <aside className="border border-line p-5">
            <ProjectControls projectId={project.id} status={project.status as ProjectStatusValue} />
          </aside>
        </div>
      </main>
    </>
  );
}
