import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getPortalClient } from '@/app/lib/portalSession';
import { getClientProject } from '@/app/lib/portal';
import type { ProjectStatusValue } from '@/app/lib/projects';
import PortalHeader from '../../PortalHeader';
import ProjectStatusBadge from '../../../admin/projects/ProjectStatusBadge';
import MessageComposer from './MessageComposer';

export const metadata = { title: 'Project | CraftsAI', robots: { index: false, follow: false } };

function fmt(d: Date): string {
  return new Date(d).toISOString().slice(0, 16).replace('T', ' ');
}

export default async function PortalProject({ params }: { params: Promise<{ id: string }> }) {
  const client = await getPortalClient();
  if (!client) redirect('/portal/login');

  const { id } = await params;
  const project = await getClientProject(client.clientId, id);
  if (!project) notFound();

  const doneCount = project.milestones.filter((m) => m.status === 'DONE').length;

  return (
    <>
      <PortalHeader clientName={client.name} />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/portal" className="font-mono text-xs uppercase tracking-[0.15em] text-steel hover:text-signal">
          ← Your projects
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <h1 className="font-display text-3xl font-medium">{project.title}</h1>
          <ProjectStatusBadge status={project.status as ProjectStatusValue} />
        </div>
        {project.description && <p className="mt-2 text-sm text-steel">{project.description}</p>}

        {/* Milestones */}
        <section className="mt-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-steel">
            Milestones ({doneCount}/{project.milestones.length})
          </p>
          {project.milestones.length === 0 ? (
            <p className="mt-3 text-sm text-steel">No milestones yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {project.milestones.map((m) => (
                <li key={m.id} className="flex items-center gap-3 border border-line px-4 py-3">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center border text-[11px] ${
                      m.status === 'DONE' ? 'border-signal bg-signal text-ink-950' : 'border-line text-transparent'
                    }`}
                  >
                    ✓
                  </span>
                  <span className={`flex-1 text-sm ${m.status === 'DONE' ? 'text-steel line-through' : 'text-bone'}`}>
                    {m.title}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Updates (client-visible only) */}
        <section className="mt-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-steel">Updates</p>
          {project.updates.length === 0 ? (
            <p className="mt-3 text-sm text-steel">No updates yet.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {project.updates.map((u) => (
                <li key={u.id} className="border-l-2 border-line pl-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-steel/70">{fmt(u.createdAt)}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-bone">{u.body}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Message thread */}
        <section className="mt-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-steel">Messages</p>
          <ul className="mt-3 space-y-3">
            {project.messages.length === 0 ? (
              <li className="text-sm text-steel">No messages yet — start the conversation below.</li>
            ) : (
              project.messages.map((msg) => (
                <li
                  key={msg.id}
                  className={`max-w-[85%] border p-3 text-sm ${
                    msg.senderType === 'CLIENT'
                      ? 'ml-auto border-signal/40 bg-signal/5'
                      : 'mr-auto border-line bg-ink-900'
                  }`}
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-steel/70">
                    {msg.senderType === 'CLIENT' ? 'You' : 'CraftsAI'} · {fmt(msg.createdAt)}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-bone">{msg.body}</p>
                </li>
              ))
            )}
          </ul>
          <div className="mt-4">
            <MessageComposer projectId={project.id} />
          </div>
        </section>
      </main>
    </>
  );
}
